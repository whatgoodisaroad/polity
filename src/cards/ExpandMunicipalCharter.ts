import { CityHallCell } from "../cells";
import { findCellByType, replaceCell, State } from "../game";
import { BaseCard } from "./base";

export class ExpandMunicipalCharter extends BaseCard {
  constructor() {
    super('Expand Municipal Charter');
    this.imageUrl = 'img/MunicipalBondIssuance.jpeg';
    this.cost = new Map([['ap', 3]]);
  }

  effect(state: State): State {
    state = super.effect(state);
    const cityHall = findCellByType(state, 'city-hall') as CityHallCell;
    if (cityHall) {
      state = replaceCell(state, cityHall.row, cityHall.column, cityHall.upgrade());
    } 
    return state;
  }

  getDescription(): string {
    return 'Expand the bureaucratic capacity of city hall. +1 to generated AP.';
  }
}