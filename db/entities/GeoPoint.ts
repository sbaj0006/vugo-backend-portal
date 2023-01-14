import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GeoFence } from './GeoFence';

@Entity()
export class GeoPoint {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public lat: string;

  @Column()
  public lng: string;

  @Column()
  public order: number;

  @ManyToOne((type) => GeoFence, (geoFence) => geoFence.points, { onDelete: 'CASCADE' })
  public geoFence: GeoFence;
}
