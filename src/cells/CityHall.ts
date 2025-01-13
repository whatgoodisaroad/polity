import { State } from "../game";
import { modifyStat } from "../stats";
import { Color, drawBuilding, MapCell, PaintArgs } from "./base";
import { JobProvider } from "./JobProvider";

export class CityHallCell extends MapCell implements JobProvider {
  level: number;

  constructor(row: number, column: number, level: number = 1) {
    super('city-hall', row, column, 4);
    this.level = level;
  }
  
  paint(args: PaintArgs) {
    const { context, x, y, w, h, pass } = args;
    if (pass !== 0) {
      return;
    }
    context.fillStyle = Color.developed;
    context.fillRect(x, y, w, h);

    // Lawn:
    context.fillStyle = Color.park;
    context.fillRect(x + 0.45 * w, y + 0.05 * h, 0.5 * w, 0.9 * h);

    // Paths:
    context.beginPath();
    context.strokeStyle = Color.road;
    context.lineWidth = 0.02 * w;

    context.moveTo(x + 0.45 * w, y + 0.5 * h);
    context.lineTo(x + 0.95 * w, y + 0.05 * h);
    context.stroke();

    context.moveTo(x + 0.45 * w, y + 0.5 * h);
    context.lineTo(x + 0.95 * w, y + 0.5 * h);
    context.stroke();

    context.moveTo(x + 0.45 * w, y + 0.5 * h);
    context.lineTo(x + 0.95 * w, y + 0.9 * h);
    context.stroke();

    if (this.level > 5) {
      drawBuilding(args, { rx: 0.05, ry: 0.05, rw: 0.7, rh: 0.2 });
      drawBuilding(args, { rx: 0.05, ry: 0.75, rw: 0.7, rh: 0.2 });  
    }
    if (this.level > 3) {
      drawBuilding(args, { rx: 0.05, ry: 0.05, rw: 0.3, rh: 0.9 });  
    }
    drawBuilding(args, { rx: 0.1, ry: 0.4, rw: 0.3, rh: 0.2 });
  }

  getDescription(): Map<string, string> {
    return new Map([
      ...super.getDescription().entries(),
      ['Effect', `+${this.level} AP`],
      ['Level', `${this.level}`],
      ['Jobs', `${this.getJobCount()}`]
    ]);
  }

  applyStartOfRoundEffects(state: State): State {
    return modifyStat(state, 'ap', (value) => value + this.level);
  }

  upgrade(): CityHallCell {
    return new CityHallCell(this.row, this.column, this.level + 1);
  }

  getJobCount(): number {
    return 10;
  }
}