import { CityHallCell } from "./cells";
import { discardHandCardById, findCellByType, replaceCell, State } from "./game";
import { v4 as uuid } from 'uuid';
import { getStatValue, modifyStat, StatKey } from "./stats";

export abstract class BaseCard {
  id: string;
  name: string;
  imageUrl?: string;
  cost: Map<StatKey, number> = new Map();

  constructor(name: string) {
    this.id = uuid();
    this.name = name;
  }

  canPlay(state: State): boolean {
    for (const [key, cost] of this.cost.entries()) {
      if (getStatValue(state, key) < cost) {
        return false;
      }
    }
    return true;
  }

  effect(state: State): State {
    for (const [key, cost] of this.cost.entries()) {
      state = modifyStat(state, key, (value) => value - cost);
    }
    return discardHandCardById(state, this.id);
  }

  abstract getDescription(): string;

}

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

export class ExpandMunicipalCharter extends BaseCard {
  constructor() {
    super('Expand Municipal Charter');
    this.imageUrl = 'img/MunicipalBondIssuance.jpeg';
    this.cost = new Map([['ap', 5]]);
  }

  effect(state: State): State {
    state = super.effect(state);
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
    this.cost = new Map([['ap', 3]]);
  }

  effect(state: State): State {
    return super.effect({ ...state, paintTile: 'park' });
  }

  getDescription(): string {
    return 'Place a park cell';
  }
}

export class ResidentialTaxAdjustmentCard extends BaseCard {
  constructor() {
    super('Residential Tax Adjustnment');
    this.imageUrl = 'img/ResidentialTaxAdjustment.jpeg';
    this.cost = new Map([['ap', 3]]);
  }

  effect(state: State): State {
    return super.effect(
      modifyStat(
        state,
        'residentialTaxRate',
        (value) => value * 1.05
      )
    );
  }

  getDescription(): string {
    return 'Increase residential taxes +5%';
  }
}

export class ParadeCard extends BaseCard {
  constructor() {
    super('Parade');
    this.imageUrl = 'img/Parade.jpeg';
    this.cost = new Map([['ap', 5]]);
  }

  effect(state: State): State {
    return modifyStat(
      super.effect(state),
      'ap',
      (value) => value + 10
    );
  }

  getDescription(): string {
    return 'Throw a parade for the town. +10 AP';
  }
}

export class ApproveCommercialCorridorCard extends BaseCard {
  constructor() {
    super('Approve Commercial Application');
    this.imageUrl = 'img/MarketDistrict.jpeg';
    this.cost = new Map([
      ['ap', 3],
      ['commercialApplications', 5],
    ]);
  }

  effect(state: State): State {
    return super.effect({ ...state, paintTile: 'commercial-corridor' });
  }

  getDescription(): string {
    return 'Approve applications to develop a commercial corrdior';
  }
}