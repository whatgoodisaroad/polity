import { Neighbors } from "./game";

const Color = {
  buildingFill: '#d1d1d1',
  buildingBorder: '#929494',
  commercialBuildingFill: '#ede5b9',
  debris: '#888',
  developed: '#e6e6e6',
  road: '#fff',
  soil: '#e8be99',
};

export type CellType =
  | 'empty'
  | 'city-hall'
  | 'residential'
  | 'industrial'
  | 'commercial'
  | 'freeway-corridoor'
  | 'commercial-corridor'
  | 'service-road'
  | 'void';

export type PaintPass = 0 | 1;

type PaintArgs = {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  h: number;
  pass: PaintPass;
  neighbors: Neighbors;
};

export interface MapCell {
  type: CellType;
  row: number;
  column: number;
  paint(args: PaintArgs): void;
}

export class EmptyCell implements MapCell {
  type: CellType = 'empty';
  row: number;
  column: number;
  debris: { dh: number; dv: number }[] = [];
  
  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
    const debrisCount = Math.floor(Math.random() * 10) + 3;
    for (let i = 0; i < debrisCount; i++) {
      this.debris.push({ dh: Math.random(), dv: Math.random() });
    }
  }
  
  paint({ context, x, y, w, h, pass }: PaintArgs) {
    if (pass === 0) {
      context.fillStyle = Color.soil;
      context.fillRect(x, y, w, h);
    } else {
      context.fillStyle = Color.debris;
      for (const { dh, dv } of this.debris) {
        context.beginPath();
        context.arc(
          x + dh * w,
          y + dv * h,
          Math.min(Math.max(0.02 * h), 1),
          0,
          2 * Math.PI
        );
        context.fill();
      }
    }
  }
}

export class VoidCell implements MapCell {
  type: CellType = 'void';
  row: number;
  column: number;
  
  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }
  
  paint({ context, x, y, w, h, pass }: PaintArgs) {
    if (pass !== 0) {
      return;
    }
    context.fillStyle = '#000';
    context.fillRect(x, y, w, h);
  }
}

export class CityHallCell implements MapCell {
  type: CellType = 'city-hall';
  row: number;
  column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
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
}

export class FreewayCorridorCell implements MapCell {
  type: CellType = 'freeway-corridoor';
  row: number;
  column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }
  
  paint({ context, x, y, w, h, pass, neighbors}: PaintArgs) {
    if (pass === 0) {
      context.fillStyle = Color.soil;
      context.fillRect(x, y, w, h);
    } else {
      const connections = Object.entries(neighbors)
        .filter(([, cell]) => cell.type === 'freeway-corridoor')
        .map(([key]) => key) as (keyof Neighbors)[];
      
      context.beginPath();
      context.strokeStyle = Color.road;
      context.lineWidth = w * 0.02;

      if (connections.length === 0) {
        context.arc(
          x + w * 0.5,
          y + h + 0.5,
          h * 0.4,
          0,
          2 * Math.PI
        );
      } else if (connections.length === 1) {
        const p = neighborToCoords(x, y, w, h, connections[0]);
        context.moveTo(x + w * 0.5, y + h * 0.5);
        context.lineTo(p.x, p.y);
      } else {
        for (let i1 = 0; i1 < connections.length - 1; i1++) {
          for (let i2 = i1 + 1; i2 < connections.length; i2++) {
            const p0 = neighborToCoords(x, y, w, h, connections[i1]);
            const p1 = neighborToCoords(x, y, w, h, connections[i2]);
            context.moveTo(p0.x, p0.y);
            context.quadraticCurveTo(x + 0.5 * w, y + 0.5 * h, p1.x, p1.y);
          }
        }
      }
      context.stroke();
    }
  }
}

function neighborToCoords(
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