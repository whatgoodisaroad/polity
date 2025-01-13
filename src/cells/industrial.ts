import { getCell, replaceCell, State } from "../game";
import { modifyStat } from "../stats";
import { Color, drawBuilding, MapCell, PaintArgs } from "./base";
import { JobProvider } from "./JobProvider";
import { ResidentialCell } from "./Residential";

export class IndustrialCell extends MapCell implements JobProvider {
  monthlyMaintenance = 1_000;
  addResidentialApplicationProbability = 0.2;

  constructor(row: number, column: number, level: number = 1) {
    super('industrial', row, column, 4);
    this.areaOfEffect = [
      { dr: -1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
    ];
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
    for (const { dr, dc } of this.areaOfEffect ?? []) {
      const row = this.row + dr;
      const column = this.column + dc;
      const cell = getCell(row, column, state);
      if (cell.type !== 'residential') {
        continue;
      }
      const residentialCell = cell as ResidentialCell;
      if (Math.random() <= 0.1) {
        state = replaceCell(state, row, column, residentialCell.removeDwelling());
      }
    }

    if (Math.random() <= this.addResidentialApplicationProbability) {
      state = modifyStat(state, 'residentialApplications', (value) => value + 1);
    }
    return modifyStat(state, 'money', (value) => value - this.monthlyMaintenance);
  }

  getDescription(): Map<string, string> {
    return new Map([
      ...super.getDescription().entries(),
      ['Monthly maintenance', `${this.monthlyMaintenance}`],
      ['Jobs', `${this.getJobCount()}`],
      ['Effect', 'Pollution: orthogonally adjacent residential cells have a 10% chance to lose a dwelling.']
    ]);
  }

  getJobCount(): number {
    return 50;
  }
}