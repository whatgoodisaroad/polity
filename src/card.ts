import { CityHallCell } from "./cells";
import { discardHandCardById, findCellByType, getStatValue, modifyStat, replaceCell, State } from "./game";
import { v4 as uuid } from 'uuid';

export abstract class BaseCard {
  id: string;
  name: string;
  imageUrl?: string;
  apCost: number = 0;

  constructor(name: string) {
    this.id = uuid();
    this.name = name;
  }

  effect(state: State): State {
    return modifyStat(state, 'ap', (ap) => ap - this.apCost);
  }

  abstract getDescription(): string;

  canPlay(state: State): boolean {
    return getStatValue(state, 'ap') >= this.apCost;
  }
}

export class HousingDevelopmentInitiativeCard extends BaseCard {
  constructor() {
    super('Housing Development Initiative');
    this.imageUrl = 'img/HousingDevelopmentInitiative.png';
    this.apCost = 2;
  }

  effect(state: State): State {
    return discardHandCardById(
      super.effect(
        { ...state, paintTile: 'residential' }
      ),
      this.id
    );
  }

  getDescription(): string {
    return 'Place a residential tile.';
  }
}

export class ExpandMunicipalCharter extends BaseCard {
  constructor() {
    super('Expand Municipal Charter');
    this.imageUrl = 'img/MunicipalBondIssuance.jpeg';
    this.apCost = 5;
  }

  effect(state: State): State {
    state = discardHandCardById(super.effect(state), this.id)
    const cityHall = findCellByType(state, 'city-hall') as CityHallCell;;
    if (cityHall) {
      state = replaceCell(state, cityHall.row, cityHall.column, cityHall.upgrade());
    } 
    return state;
  }

  getDescription(): string {
    return 'Expand the bureaucratic capacity of city hall. +1 to generated AP.';
  }
}

export class ParksAndRecreationCard extends BaseCard {
  constructor() {
    super('Parks & Rec Project');
    this.imageUrl = 'img/Park.jpeg';
    this.apCost = 3;
  }

  effect(state: State): State {
    return discardHandCardById(
      super.effect(
        { ...state, paintTile: 'park' }
      ),
      this.id
    );
  }

  getDescription(): string {
    return 'Place a park cell';
  }
}