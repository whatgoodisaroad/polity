import { State } from "../game";
import { modifyStat } from "../stats";
import { Color, MapCell, PaintArgs } from "./base";

export class CityHallCell extends MapCell {
  level: number;

  constructor(row: number, column: number, level: number = 1) {
    super('city-hall', row, column);
    this.level = level;
  }
  
  paint({ context, x, y, w, h, pass }: PaintArgs) {
    if (pass !== 0) {
      return;
    }
    context.fillStyle = Color.developed;
    context.fillRect(x, y, w, h);

    context.strokeStyle = Color.buildingBorder;
    context.lineWidth = w * 0.005;

    context.fillStyle = Color.buildingFill;
    context.fillRect(x + 0.4 * w, y + 0.1 * h, w * 0.5, h * 0.7);
    context.strokeRect(x + 0.4 * w, y + 0.1 * h, w * 0.5, h * 0.7);

    context.fillStyle = Color.commercialBuildingFill;
    context.fillRect(x + 0.1 * w, y + 0.1 * h, w * 0.3, h * 0.8);
    context.strokeRect(x + 0.1 * w, y + 0.1 * h, w * 0.3, h * 0.8);
  }

  getDescription(): Map<string, string> {
    return new Map([
      ...super.getDescription().entries(),
      ['Effect', `+${this.level} AP`],
      ['Level', `${this.level}`],
    ]);
  }

  applyStartOfRoundEffects(state: State): State {
    return modifyStat(state, 'ap', (value) => value + this.level);
  }

  upgrade(): CityHallCell {
    return new CityHallCell(this.row, this.column, this.level + 1);
  }
}