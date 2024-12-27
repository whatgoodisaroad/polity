import { modifyStat, State } from "../game";
import { Color, MapCell, PaintArgs } from "./base";

export class CityHallCell extends MapCell {
  constructor(row: number, column: number) {
    super('city-hall', row, column);
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
      ['Effect', '+1 AP'],
    ]);
  }

  applyStartOfRoundEffects(state: State): State {
    return modifyStat(state, 'ap', (value) => value + 1);
  }
}