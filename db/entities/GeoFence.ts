import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { GeoPoint } from './GeoPoint';
@Entity()
export class GeoFence {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column()
  public description: string;

  @Column('boolean', { default: false })
  public active: boolean;

  @OneToMany((type) => GeoPoint, (points) => points.geoFence, { eager: true })
  public points: GeoPoint[];
}
