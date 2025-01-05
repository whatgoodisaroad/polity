import { State } from "../game";
import { modifyStat } from "../stats";
import { Color, MapCell, PaintArgs } from "./base";

export class ParkCell extends MapCell {
  monthlyMaintenance = 1_000;
  addResidentialApplicationProbability = 0.05;

  constructor(row: number, column: number, level: number = 1) {
    super('park', row, column);
  }
  
  paint({ context, x, y, w, h, pass }: PaintArgs) {
    if (pass !== 0) {
      return;
    }
    context.fillStyle = Color.developed;
    context.fillRect(x, y, w, h);

    context.fillStyle = Color.park;
    context.fillRect(x + 0.15 * w, y + 0.05 * h, 0.8 * w, 0.9 * h);
    context.fillRect(x + 0.05 * w, y + 0.05 * h, 0.1 * w, 0.5 * h);

    // Paths:
    context.beginPath();
    context.strokeStyle = Color.road;
    context.lineWidth = 0.02 * w;

    context.moveTo(x + 0.15 * w, y + 0.9 * h);
    context.lineTo(x + 0.8 * w, y + 0.1 * h);
    context.stroke();

    context.moveTo(x + 0.5 * w, y + 0.5 * h);
    context.lineTo(x + 0.6 * w, y + 0.9 * h);
    context.stroke();

    context.moveTo(x + 0.05 * w, y + 0.05 * h);
    context.lineTo(x + 0.4 * w, y + 0.6 * h);
    context.stroke();

    context.closePath();
  }

  applyStartOfRoundEffects(state: State): State {
    if (Math.random() <= this.addResidentialApplicationProbability) {
      state = modifyStat(state, 'residentialApplications', (value) => value + 1);
    }
    return modifyStat(state, 'money', (value) => value - this.monthlyMaintenance);
  }

  getDescription(): Map<string, string> {
    return new Map([
      ['Type', this.type],
      ['Monthly maintenance', `${this.monthlyMaintenance}`],
    ]);
  }
}