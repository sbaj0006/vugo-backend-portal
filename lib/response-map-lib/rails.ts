import { Rail } from './../../db/entities/Rail';
import { IRail } from './../../interfaces/rails';
import { RailType } from '../../enums/RailType';

export const mapRailResponse = (rail: Rail): IRail => ({
  id: rail.id,
  name: rail.name,
  type: RailType[rail.type],
  displayOrder: rail.displayOrder,
  description: rail.description,
});
