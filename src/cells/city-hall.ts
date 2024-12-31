import { State } from "../game";
import { modifyStat } from "../stats";
import { Color, drawBuilding, MapCell, PaintArgs } from "./base";

export class CityHallCell extends MapCell {
  level: number;

  constructor(row: number, column: number, level: number = 1) {
    super('city-hall', row, column);
    this.level = level;
  }
  
  paint(args: PaintArgs) {
    const { context, x, y, w, h, pass } = args;
    if (pass !== 0) {
      return;
    }
    context.fillStyle = Color.developed;
    context.fillRect(x, y, w, h);

    drawBuilding(args, { rx: 0.4, ry: 0.1, rw: 0.5, rh: 0.7 });
    drawBuilding(args, { rx: 0.1, ry: 0.1, rw: 0.3, rh: 0.8 }, 'commercial');
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