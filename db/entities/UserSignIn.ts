import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {User} from "./User";

@Entity()
export class UserSignIn {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  // @Column()
  @ManyToOne(() => User, user => user.userSignIn)
  public user: User;

  @CreateDateColumn()
  public signInDateTime: Date;

  @CreateDateColumn()
  public signOutDateTime: Date;

  @Column()
  public deviceId: string;

  @Column({nullable:true})
  public ipAddress: string;

}
