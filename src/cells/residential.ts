import { replaceCell, State } from "../game";
import { getStatValue, modifyStat } from "../stats";
import { Color, drawBuilding, MapCell, PaintArgs } from "./base";

type Dwelling = {
  propertyValue: number;
  coordinateIndex: number;
};

export class ResidentialCell extends MapCell {
  dwellings: Dwelling[];
  addDwellingProbability = 0.2;
  addCommercialApplicationProbability = 0.2;
  
  constructor(
    row: number,
    column: number,
    dwellings: Dwelling[] = [],
  ) {
    super('residential', row, column);
    this.dwellings = dwellings;
  }

  addDwelling(): ResidentialCell {
    if (this.dwellings.length === HOUSE_COORDINATES.length) {
      throw 'Cell is full';
    }
    const existingIndexes = new Set(
      this.dwellings.map(({ coordinateIndex }) => coordinateIndex)
    );
    const availableIndices = (new Array(HOUSE_COORDINATES.length))
      .fill(1)  
      .map((_, i) => i)
      .filter((i) => !existingIndexes.has(i));
    const indexIndex = Math.floor(Math.random() * availableIndices.length);
    const coordinateIndex = availableIndices[indexIndex];
    const propertyValue = 250_000 + Math.floor(Math.random() * 50_000);

    return new ResidentialCell(
      this.row,
      this.column,
      [
        ...this.dwellings,
        {
          propertyValue,
          coordinateIndex,
        },
      ]
    );
  }

  getMaintenanceCost(): number {
    return 1_000 + 500 * this.dwellings.length;
  }
  
  paint(args: PaintArgs): void {
    const { x, y, w, h, pass, context } = args;
    if (pass !== 0) {
      return;
    }
    context.fillStyle = Color.developed;
    context.fillRect(x, y, w, h);

    context.beginPath();
    context.strokeStyle = Color.road;
    context.lineWidth = w * 0.005;
    
    // Streets
    context.moveTo(x, y + 0.25 * h);
    context.lineTo(x + w, y + 0.25 * h);
    context.stroke();

    context.moveTo(x, y + 0.75 * h);
    context.lineTo(x + w, y + 0.75 * h);
    context.stroke();

    context.moveTo(x + 0.25 * w, y);
    context.lineTo(x + 0.25 * w, y + h);
    context.stroke();

    context.moveTo(x + 0.75 * w, y);
    context.lineTo(x + 0.75 * w, y + h);
    context.stroke();

    // Roads
    context.moveTo(x + 0.5 * w, y + 0.15 * h);
    context.lineTo(x + 0.5 * w, y + 0.35 * h);
    context.stroke();
    
    context.moveTo(x + 0.5 * w, y + 0.65 * h);
    context.lineTo(x + 0.5 * w, y + 0.85 * h);
    context.stroke();

    context.moveTo(x + 0.15 * w, y + 0.5 * h);
    context.lineTo(x + 0.35 * w, y + 0.5 * h);
    context.stroke();
    
    context.moveTo(x + 0.65 * w, y + 0.5 * h);
    context.lineTo(x + 0.85 * w, y + 0.5 * h);
    context.stroke();

    context.closePath();

    // Dwellings
    for (const { coordinateIndex } of this.dwellings) {
      const [rx, ry, rw, rh] = HOUSE_COORDINATES[coordinateIndex];
      drawBuilding(args, { rx, ry, rw, rh });
    }
  }

  getLotCount(): number {
    return HOUSE_COORDINATES.length;
  }

  getTotalPropertyValue(): number {
    return this.dwellings
      .map(({ propertyValue }) => propertyValue)
      .reduce((v, acc) => v + acc, 0);
  }

  getDescription(): Map<string, string> {
    return new Map([
      ['Type', this.type],
      ['Lots', `${this.getLotCount()}`],
      ['Dwellings', `${this.dwellings.length}`],
      ['Total Property Value', `\$${this.getTotalPropertyValue()}`],
      ['Monthly maintenance', `\$${this.getMaintenanceCost()}`],
    ]);
  }

  applyStartOfRoundEffects(state: State): State {
    // Colllect taxes
    const residentialTaxRate = getStatValue(state, 'residentialTaxRate');
    state = modifyStat(state, 'money', (value) => {
      const taxRevinue = Math.floor(
        this.getTotalPropertyValue() * residentialTaxRate / 12
      );  
      return value + taxRevinue - this.getMaintenanceCost();
    });
    
    const residentialApplications = getStatValue(state, 'residentialApplications');

    // Maybe add an occupied dwelling
    if (residentialApplications > 0 && Math.random() >= this.addDwellingProbability) {
      state = replaceCell(state, this.row, this.column, this.addDwelling());
    }

    if (Math.random() >= (1 - this.addCommercialApplicationProbability)) {
      state = modifyStat(state, 'commercialApplications', (value) => value + 1);
    }

    return state;
  }
}

const HOUSE_COORDINATES = [
  [0.2, 0.04, 0.05, 0.05],
  [0.2, 0.12, 0.05, 0.05],
  [0.2, 0.2, 0.05, 0.05],
  //
  [0.2, 0.3, 0.05, 0.05],
  [0.2, 0.37, 0.05, 0.05],
  [0.2, 0.44, 0.05, 0.05],
  //
  [0.2, 0.55, 0.05, 0.05],
  [0.2, 0.62, 0.05, 0.05],
  [0.2, 0.69, 0.05, 0.05],
  //
  [0.2, 0.8, 0.05, 0.05],
  [0.2, 0.87, 0.05, 0.05],
  [0.2, 0.94, 0.05, 0.05],
  //
  [0.3, 0.04, 0.05, 0.05],
  [0.3, 0.12, 0.05, 0.05],
  [0.3, 0.2, 0.05, 0.05],
  //
  [0.3, 0.3, 0.05, 0.05],
  [0.3, 0.37, 0.05, 0.05],
  [0.3, 0.44, 0.05, 0.05],
  //
  [0.3, 0.55, 0.05, 0.05],
  [0.3, 0.62, 0.05, 0.05],
  [0.3, 0.69, 0.05, 0.05],
  //
  [0.3, 0.8, 0.05, 0.05],
  [0.3, 0.87, 0.05, 0.05],
  [0.3, 0.94, 0.05, 0.05],
  //
  [0.7, 0.04, 0.05, 0.05],
  [0.7, 0.12, 0.05, 0.05],
  [0.7, 0.2, 0.05, 0.05],
  //
  [0.7, 0.3, 0.05, 0.05],
  [0.7, 0.37, 0.05, 0.05],
  [0.7, 0.44, 0.05, 0.05],
  //
  [0.7, 0.55, 0.05, 0.05],
  [0.7, 0.62, 0.05, 0.05],
  [0.7, 0.69, 0.05, 0.05],
  //
  [0.7, 0.8, 0.05, 0.05],
  [0.7, 0.87, 0.05, 0.05],
  [0.7, 0.94, 0.05, 0.05],
  //
  [0.8, 0.04, 0.05, 0.05],
  [0.8, 0.12, 0.05, 0.05],
  [0.8, 0.2, 0.05, 0.05],
  //
  [0.8, 0.3, 0.05, 0.05],
  [0.8, 0.37, 0.05, 0.05],
  [0.8, 0.44, 0.05, 0.05],
  //
  [0.8, 0.55, 0.05, 0.05],
  [0.8, 0.62, 0.05, 0.05],
  [0.8, 0.69, 0.05, 0.05],
  //
  [0.8, 0.8, 0.05, 0.05],
  [0.8, 0.87, 0.05, 0.05],
  [0.8, 0.94, 0.05, 0.05],
  //
  [0.04, 0.2, 0.05, 0.05],
  [0.11, 0.2, 0.05, 0.05],
  //
  [0.37, 0.2, 0.05, 0.05],
  [0.44, 0.2, 0.05, 0.05],
  //
  [0.56, 0.2, 0.05, 0.05],
  [0.63, 0.2, 0.05, 0.05],
  //
  [0.88, 0.2, 0.05, 0.05],
  [0.95, 0.2, 0.05, 0.05],
  //
  [0.04, 0.3, 0.05, 0.05],
  [0.11, 0.3, 0.05, 0.05],
  //
  [0.37, 0.3, 0.05, 0.05],
  [0.44, 0.3, 0.05, 0.05],
  //
  [0.56, 0.3, 0.05, 0.05],
  [0.63, 0.3, 0.05, 0.05],
  //
  [0.88, 0.3, 0.05, 0.05],
  [0.95, 0.3, 0.05, 0.05],
  //
  [0.04, 0.7, 0.05, 0.05],
  [0.11, 0.7, 0.05, 0.05],
  //
  [0.37, 0.7, 0.05, 0.05],
  [0.44, 0.7, 0.05, 0.05],
  //
  [0.56, 0.7, 0.05, 0.05],
  [0.63, 0.7, 0.05, 0.05],
  //
  [0.88, 0.7, 0.05, 0.05],
  [0.95, 0.7, 0.05, 0.05],
  //
  [0.04, 0.8, 0.05, 0.05],
  [0.11, 0.8, 0.05, 0.05],
  //
  [0.37, 0.8, 0.05, 0.05],
  [0.44, 0.8, 0.05, 0.05],
  //
  [0.56, 0.8, 0.05, 0.05],
  [0.63, 0.8, 0.05, 0.05],
  //
  [0.88, 0.8, 0.05, 0.05],
  [0.95, 0.8, 0.05, 0.05],
  //
  [0.43, 0.12, 0.05, 0.05],
  [0.5, 0.1, 0.05, 0.05],
  [0.57, 0.12, 0.05, 0.05],
  //
  [0.43, 0.38, 0.05, 0.05],
  [0.5, 0.39, 0.05, 0.05],
  [0.57, 0.38, 0.05, 0.05],
  //
  [0.43, 0.62, 0.05, 0.05],
  [0.5, 0.6, 0.05, 0.05],
  [0.57, 0.62, 0.05, 0.05],
  //
  [0.43, 0.88, 0.05, 0.05],
  [0.5, 0.89, 0.05, 0.05],
  [0.57, 0.88, 0.05, 0.05],

  //
  [0.12, 0.43, 0.05, 0.05],
  [0.1, 0.5, 0.05, 0.05],
  [0.12, 0.57, 0.05, 0.05],
  //
  [0.38, 0.43, 0.05, 0.05],
  [0.39, 0.5, 0.05, 0.05],
  [0.38, 0.57, 0.05, 0.05],
  //
  [0.62, 0.43, 0.05, 0.05],
  [0.6, 0.5, 0.05, 0.05],
  [0.62, 0.57, 0.05, 0.05],
  //
  [0.88, 0.43, 0.05, 0.05],
  [0.89, 0.5, 0.05, 0.05],
  [0.88, 0.57, 0.05, 0.05],
];