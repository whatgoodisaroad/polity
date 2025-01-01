import { State } from "../game";
import { BaseCard } from "./base";

export class ParksAndRecreationCard extends BaseCard {
  constructor() {
    super('Parks & Rec Project');
    this.imageUrl = 'img/Park.jpeg';
    this.cost = new Map([['ap', 3]]);
  }

  effect(state: State): State {
    return super.effect({ ...state, paintTile: 'park' });
  }

  getDescription(): string {
    return 'Place a park cell';
  }
}