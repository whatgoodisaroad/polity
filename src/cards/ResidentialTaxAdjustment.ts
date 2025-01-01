import { State } from "../game";
import { modifyStat } from "../stats";
import { BaseCard } from "./base";

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