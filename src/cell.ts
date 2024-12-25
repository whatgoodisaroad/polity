export type CellType =
  | 'empty'
  | 'city-hall'
  | 'residential'
  | 'industrial'
  | 'commercial'
  | 'freeway-corridoor'
  | 'commercial-corridor'
  | 'service-road';

export type PaintPass = 0 | 1;

type PaintArgs = {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  h: number;
  pass: PaintPass;
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
      context.fillStyle = '#e8be99';
      context.fillRect(x, y, w, h);
    } else {
      context.fillStyle = '#555';
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
    context.fillStyle = '#ff0000';
    context.fillRect(x, y, w, h);
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
  
  paint({ context, x, y, w, h, pass}: PaintArgs) {
    if (pass !== 0) {
      return;
    }
    context.fillStyle = '#444444';
    context.fillRect(x, y, w, h);
  }
}

