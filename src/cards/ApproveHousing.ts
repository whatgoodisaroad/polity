import { State } from "../game";
import { BaseCard } from "./base";

export class ApproveHousingCard extends BaseCard {
  constructor() {
    super('Approve Housing');
    this.imageUrl = 'img/HousingDevelopmentInitiative.png';
    this.cost = new Map([
      ['ap', 2],
      ['residentialApplications', 1],
    ]);
  }

  effect(state: State): State {
    return super.effect({ ...state, paintTile: 'residential' });
  }

  getDescription(): string {
    return 'Place a residential tile.';
  }
}
