import { State } from "../game";
import { modifyStat } from "../stats";
import { BaseCard } from "./base";

export class ParadeCard extends BaseCard {
  constructor() {
    super('Parade');
    this.imageUrl = 'img/Parade.jpeg';
    this.cost = new Map([
      ['ap', 5],
      ['money', 50_000],
    ]);
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