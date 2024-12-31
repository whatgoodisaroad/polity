import { Neighbors, State } from "../game";

export const Color = {
  buildingFill: '#d1d1d1',
  buildingBorder: '#929494',
  commercialBuildingFill: '#ede5b9',
  debris: '#888',
  developed: '#e6e6e6',
  road: '#fff',
  soil: '#e8be99',
  park: '#d2e3a6',
  parkPath: '#80db4b',
};

export type CellType =
  | 'empty'
  | 'city-hall'
  | 'residential'
  | 'freeway-corridoor'
  | 'park'
  | 'void'
  | 'commercial-corridor';

export type PaintPass = 0 | 1;

export type PaintArgs = {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  h: number;
  pass: PaintPass;
  neighbors: Neighbors;
};

export abstract class MapCell {
  type: CellType;
  row: number;
  column: number;

  constructor(type: CellType, row: number, column: number) {
    this.type = type
    this.row = row;
    this.column = column; 
  }

  abstract paint(args: PaintArgs): void;

  getDescription(): Map<string, string> {
    return new Map([['Type', this.type]]);
  }

  applyStartOfRoundEffects(state: State): State {
    return state;
  }
}

export function neighborToCoords(
  x: number,
  y: number,
  w: number,
  h: number,
  dir: keyof Neighbors,
): {
  x: number;
  y: number;
} {
  if (dir === 'n') {
    return { x: x + w * 0.5, y };
  } else if (dir === 'ne') {
    return { x: x + w, y };
  } else if (dir === 'e') {
    return { x: x + w, y: y + h * 0.5 };
  } else if (dir === 'se') {
    return { x: x + w, y: y + h };
  } else if (dir === 's') {
    return { x: x + w * 0.5, y: y + h };
  } else if (dir === 'sw') {
    return { x, y: y + h };
  } else if (dir === 'w') {
    return { x, y: y + h * 0.5 };
  } else {
    return { x, y };
  }
}

export function drawBuilding(
  { context, x, y, w, h, pass }: PaintArgs,
  { rx, ry, rw, rh }: { rx: number, ry: number, rw: number, rh: number },
  zone: 'commercial' | 'other' = 'other',
) {
  context.strokeStyle = Color.buildingBorder;
  context.lineWidth = w * 0.005;

  context.fillStyle = zone === 'commercial'
    ? Color.commercialBuildingFill
    : Color.buildingFill;
  context.fillRect(x + rx * w, y + ry * h, w * rw, h * rh);
  context.strokeRect(x + rx * w, y + ry * h, w * rw, h * rh);
}