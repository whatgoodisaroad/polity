import { State } from "../game";
import { BaseCard } from "./base";

export class ApproveCommercialCorridorCard extends BaseCard {
  constructor() {
    super('Approve Commercial Application');
    this.imageUrl = 'img/MarketDistrict.jpeg';
    this.cost = new Map([
      ['ap', 2],
      ['commercialApplications', 1],
    ]);
  }

  effect(state: State): State {
    return super.effect({ ...state, paintTile: 'commercial-corridor' });
  }

  getDescription(): string {
    return 'Approve applications to develop a commercial corrdior';
  }
}
