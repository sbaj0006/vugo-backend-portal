import { db } from '@/db/db';
import { GroupedTitle } from '@/db/entities/GroupedTitle';
import { TitleGroup } from '@/db/entities/TitleGroup';
import { Connection, DeleteResult, Repository } from 'typeorm';

class TitleGroupServiceClass {
  private conn: Connection;
  private titleGroupRepo: Repository<TitleGroup>;
  private groupedTitleRepo: Repository<GroupedTitle>;

  public insert = async (insertData: Partial<TitleGroup>): Promise<TitleGroup> => {
    await this.connect();
    const insertResult = await this.titleGroupRepo.insert(insertData);
    return insertResult.identifiers[0].id;
  };

  public update = async (groupId: number, updateData: Partial<TitleGroup>): Promise<TitleGroup> => {
    await this.connect();
    const updateResult = await this.titleGroupRepo.update(groupId, updateData);
    return this.titleGroupRepo.findOne(groupId);
  };

  public getTitleGroups = async (): Promise<TitleGroup[]> => {
    await this.connect();
    const titleGroups = await this.titleGroupRepo
      .createQueryBuilder('titleGroup')
      .select([
        'titleGroup.id',
        'titleGroup.name',
        'titleGroup.description',
        'titleGroup.groupImage',
        'groupedTitles.id',
        'groupedTitles.titleGroupId',
        'groupedTitles.titleId',
      ])
      .leftJoin('titleGroup.groupedTitles', 'groupedTitles')
      .getMany();
    return titleGroups;
  };
  public getTitleGroupById = async (id: number): Promise<TitleGroup> => {
    await this.connect();
    const titleGroup = await this.titleGroupRepo.findOne(id);
    return titleGroup;
  };
  public updateGroupTitles = async (groupId: number, titleIds: number[]): Promise<TitleGroup> => {
    await this.connect();
    const existingTitles = (
      await this.groupedTitleRepo.findAndCount({
        where: { titleGroupId: groupId },
      })
    )[0];
    titleIds.forEach(async (id) => {
      if (!existingTitles.find((et) => et.titleId === id)) {
        const groupedTitle = {
          titleGroupId: groupId,
          titleId: id,
        };
        await this.groupedTitleRepo.insert(groupedTitle);
      }
    });

    return await this.getTitleGroupById(groupId);
  };

  public deleteGroupedTitle = async (groupId: number, titleId: number): Promise<DeleteResult> => {
    await this.connect();
    const deleteResult = await this.groupedTitleRepo
      .createQueryBuilder()
      .delete()
      .where('title_group_id = :titleGroupId AND title_id = :titleId', {
        titleGroupId: groupId,
        titleId: titleId,
      })
      .execute();

    return deleteResult;
  };

  public deleteTitleGroup = async (groupId: number): Promise<DeleteResult> => {
    await this.connect();
    const deleteResult = await this.groupedTitleRepo
      .createQueryBuilder()
      .delete()
      .where('title_group_id = :titleGroupId', {
        titleGroupId: groupId,
      })
      .execute();

    await this.titleGroupRepo.delete(groupId);

    return deleteResult;
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.titleGroupRepo) {
      this.titleGroupRepo = this.conn.getRepository(TitleGroup);
    }
    if (!this.groupedTitleRepo) {
      this.groupedTitleRepo = this.conn.getRepository(GroupedTitle);
    }
  };
}

export const TitleGroupService = new TitleGroupServiceClass();
