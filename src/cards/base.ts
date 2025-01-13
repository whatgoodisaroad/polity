import { discardHandCardById, State } from "../game";
import { v4 as uuid } from 'uuid';
import { getStatValue, modifyStat, StatKey } from "../stats";

export abstract class BaseCard {
  id: string;
  name: string;
  imageUrl?: string;
  cost: Map<StatKey, number> = new Map();
  descriptionSize: 'normal' | 'small' = 'normal';

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