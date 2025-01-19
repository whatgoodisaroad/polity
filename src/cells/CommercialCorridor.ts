import { Color, drawBuilding, MapCell, neighborToCoords, PaintArgs } from "./Base";
import { Neighbors, replaceCell, State } from "../game";
import { modifyStat } from "../stats";
import { JobProvider } from "./JobProvider";

type Coords = [number, number, number, number];

export class CommercialCorridorCell extends MapCell implements JobProvider {
  addIndustrialApplicationProbability = 0.2;
  buildUpProbability = 0.3;
  builtBuildingIndices: Set<number>
  
  constructor(row: number, column: number, builtBuildingIndices: Set<number>) {
    super('commercial-corridor', row, column, 3);
    this.builtBuildingIndices = builtBuildingIndices;
  }

  static create(row: number, column: number): CommercialCorridorCell {
    return new CommercialCorridorCell(row, column, new Set()).maybeAddBuilding();
  }
  
  paint(args: PaintArgs) {
    const { context, x, y, w, h, pass, neighbors} = args;
    
    if (pass === 0) {
      context.fillStyle = Color.developed;
      context.fillRect(x, y, w, h);
     
      context.beginPath();
      context.strokeStyle = Color.road;
      context.lineWidth = w * 0.015;

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
    } else {
      const connections = new Set(
        Object.entries(neighbors)
          .filter(([, cell]) => cell.type === 'commercial-corridor')
          .map(([key]) => key) as (keyof Neighbors)[]
      );
      const allPossibleBuildings = generateBuildingCoordinates(connections);
      const validIndices = new Set([...this.builtBuildingIndices].map((i) => i % allPossibleBuildings.length));
      const buildings: Coords[] = [...validIndices].map(i => allPossibleBuildings[i]);

      for (const [rx, ry, rw, rh] of buildings) {
        drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
      }
    }
  }

  maybeAddBuilding(): CommercialCorridorCell {
    return new CommercialCorridorCell(
      this.row,
      this.column,
      new Set([
        ...this.builtBuildingIndices,
        Math.floor(Math.random() * 33),
      ])
    );
  }

  applyStartOfRoundEffects(state: State): State {
    if (Math.random() <= this.buildUpProbability) { 
      state = replaceCell(state, this.row, this.column, this.maybeAddBuilding());
    }

    if (Math.random() <= this.addIndustrialApplicationProbability) {
      state = modifyStat(state, 'industrialApplications', (value) => value + 1);
    }

    return state;
  }

  getJobCount(): number {
    return Math.floor(40 * this.builtBuildingIndices.size / 32);
  }

  getDescription(): Map<string, string> {
    return new Map([
      ...super.getDescription().entries(),
      ['Jobs', `${this.getJobCount()}`]
    ]);
  }
}


function rot90([rx, ry, rw, rh]: Coords): Coords {
  return [
    1 - ry - rh,
    rx,
    rh,
    rw,
  ];
}

function generateBuildingCoordinates(
  connections: Set<keyof Neighbors>
): Coords[] {
  const buildings: Coords[] = [];
  
  const cluster = [
    [0.27, 0.27, 0.3, 0.25],
    [0.27, 0.52, 0.2, 0.2],
    [0.48, 0.55, 0.25, 0.18],
    [0.58, 0.28, 0.15, 0.25],
  ];  
  const topRightRows: Coords[] = [
    [0.76, 0, 0.15, 0.05],
    [0.76, 0.06, 0.12, 0.05],
    [0.76, 0.11, 0.18, 0.11],
  ];
  const rightRows: Coords[] = [
    [0.76, 0.28, 0.12, 0.09],
    [0.76, 0.38, 0.18, 0.06],
    [0.76, 0.45, 0.2, 0.18],
    [0.76, 0.64, 0.22, 0.08],
  ];

  for (const [rx, ry, rw, rh] of cluster) {
    buildings.push([rx, ry, rw, rh]);
  }

  if (connections.has('s')) {
    for (const [rx, ry, rw, rh] of cluster) {
      buildings.push([rx, ry + 0.5, rw, rh]);
    }
  } else {
    for (const cs of rightRows) {
      buildings.push(rot90(cs));
    }
  }
  
  if (connections.has('e')) {
    for (const [rx, ry, rw, rh] of cluster) {
      buildings.push([rx + 0.5, ry, rw, rh]);
    }
  } else {
    for (const [rx, ry, rw, rh] of rightRows) {
      buildings.push([rx, ry, rw, rh]);
    }
  }

  if (
    connections.has('s') &&
    connections.has('e') &&
    connections.has('se')
  ) {
    for (const [rx, ry, rw, rh] of cluster) {
      buildings.push([rx + 0.5, ry + 0.5, rw, rh]);
    }
  } else {
    for (const cs of topRightRows) {
      buildings.push(rot90(cs));
    }
  }

  if (!connections.has('n') || !connections.has('e')) {
    for (const [rx, ry, rw, rh] of topRightRows) {
      buildings.push([rx, ry, rw, rh]);
    }
  }

  if (!connections.has('w') || !connections.has('s')) {
    for (const cs of topRightRows) {
      buildings.push(rot90(rot90(cs)));
    }
  }

  if (!connections.has('w')) {
    for (const cs of rightRows) {
      buildings.push(rot90(rot90(cs)));
    }
  }

  if (
    !connections.has('nw') ||
    !connections.has('w') ||
    !connections.has('n')
  ) {
    for (const cs of topRightRows) {
      buildings.push(rot90(rot90(rot90(cs))));
    }
  }

  if (!connections.has('n')) {
    for (const cs of rightRows) {
      buildings.push(rot90(rot90(rot90(cs))));
    }
  }

  return buildings;
}
