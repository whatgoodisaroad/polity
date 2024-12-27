export abstract class BaseCard {
  name: string;
  imageUrl?: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class HousingDevelopmentInitiativeCard extends BaseCard {
  constructor() {
    super('Housing Development Initiative');
    this.imageUrl = '/img/HousingDevelopmentInitiative.png';
  }
}

export class ExpandMunicipalCharter extends BaseCard {
  constructor() {
    super('Expand Municipal Charter');
    this.imageUrl = '/img/MunicipalBondIssuance.jpeg';
  }
}
