import { discardHandCardById, State } from "./game";
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

  abstract getDescription(): string;
}

export class HousingDevelopmentInitiativeCard extends BaseCard {
  constructor() {
    super('Housing Development Initiative');
    this.imageUrl = '/img/HousingDevelopmentInitiative.png';
  }

  effect(state: State): State {
    return discardHandCardById(
      { ...state, paintTile: 'residential' },
      this.id
    );
  }

  getDescription(): string {
    return 'Place a residential tile. Maintenance $1,000/month';
  }
}

export class ExpandMunicipalCharter extends BaseCard {
  constructor() {
    super('Expand Municipal Charter');
    this.imageUrl = '/img/MunicipalBondIssuance.jpeg';
  }

  effect(state: State): State {
    return discardHandCardById(
      state,
      this.id
    );
  }

  getDescription(): string {
    return 'Expand the bureaucratic capacity of city hall. +1 to generated AP.';
  }
}
