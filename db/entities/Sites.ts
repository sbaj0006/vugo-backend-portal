import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, ManyToMany } from 'typeorm';

@Entity()
export class Sites {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true })
  public siteName: string;

  @Column({ default: true })
  public active: boolean;

}