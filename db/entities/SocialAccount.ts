import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, ManyToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class SocialAccount {

    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @OneToOne(()=>User)
    @JoinColumn()
    public user:User

    @Column()
    public socialType: string;

    @Column()
    public socialId:string;

    @Column()
    public details:string;
  
}