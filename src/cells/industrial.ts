import { State } from "../game";
import { modifyStat } from "../stats";
import { Color, drawBuilding, MapCell, PaintArgs } from "./base";

export class IndustrialCell extends MapCell {
  monthlyMaintenance = 1_000;
  addResidentialApplicationProbability = 0.2;

  constructor(row: number, column: number, level: number = 1) {
    super('industrial', row, column);
  }
  
  paint(args: PaintArgs) {
    const { context, x, y, w, h, pass } = args;
    if (pass !== 0) {
      return;
    }
    context.fillStyle = Color.developed;
    context.fillRect(x, y, w, h);

    drawBuilding(args, { rx: 0.1, ry: 0.1, rw: 0.8, rh: 0.8 });
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