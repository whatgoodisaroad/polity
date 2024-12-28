import { removeCardIdFromHand, State } from "./game";
import { v4 as uuid } from 'uuid';

export abstract class BaseCard {
  id: string;
  name: string;
  imageUrl?: string;

  constructor(name: string) {
    this.id = uuid();
    this.name = name;
  }

  abstract effect(state: State): State;
}

export class HousingDevelopmentInitiativeCard extends BaseCard {
  constructor() {
    super('Housing Development Initiative');
    this.imageUrl = '/img/HousingDevelopmentInitiative.png';
  }

  effect(state: State): State {
    return removeCardIdFromHand(
      { ...state, paintTile: 'residential' },
      this.id
    );
  }
}

export class ExpandMunicipalCharter extends BaseCard {
  constructor() {
    super('Expand Municipal Charter');
    this.imageUrl = '/img/MunicipalBondIssuance.jpeg';
  }

  effect(state: State): State {
    return removeCardIdFromHand(
      state,
      this.id
    );
  }
}
