import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, ManyToMany } from 'typeorm';

@Entity()
export class SecurityCheckTypes {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true })
  public checkName: string;

  @Column({ nullable: true })
  public key: string;

  @Column({ nullable: true })
  public active: boolean;

}
