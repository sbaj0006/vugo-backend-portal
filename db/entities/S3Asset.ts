import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { S3AssetType } from '../../enums/S3AssetType';

@Entity()
export class S3Asset {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public parentDirectoryId: string;

  @CreateDateColumn({ type: 'timestamp' })
  public creationDateTime: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public lastModificationDateTime: Date;

  @Column({
    type: 'enum',
    enum: S3AssetType,
    nullable: true,
  })
  public assetType: S3AssetType;
}
