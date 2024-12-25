export type CellType =
  | 'empty'
  | 'city-hall'
  | 'residential'
  | 'industrial'
  | 'commercial'
  | 'freeway-corridoor'
  | 'commercial-corridor'
  | 'service-road';

type PaintArgs = {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  h: number;
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

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }
  
  paint({ context, x, y, w, h }: PaintArgs) {
    context.fillStyle = '#e8be99';
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
  
  paint({ context, x, y, w, h }: PaintArgs) {
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
  
  paint({ context, x, y, w, h }: PaintArgs) {
    context.fillStyle = '#444444';
    context.fillRect(x, y, w, h);
  }
}

