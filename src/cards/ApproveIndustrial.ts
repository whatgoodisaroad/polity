import { State } from "../game";
import { BaseCard } from "./base";

export class ApproveIndustrialCard extends BaseCard {
  constructor() {
    super('Approve Industrial');
    this.imageUrl = 'img/Industrial.jpeg';
    this.cost = new Map([
      ['ap', 2],
      ['industrialApplications', 1],
    ]);
  }

  effect(state: State): State {
    return super.effect({ ...state, paintTile: 'industrial' });
  }

  getDescription(): string {
    return 'Place an industrial tile.';
  }
}
