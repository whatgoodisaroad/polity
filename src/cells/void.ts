import { MapCell, PaintArgs } from "./base";

export class VoidCell extends MapCell {  
  constructor(row: number, column: number) {
    super('void', row, column);
  }
  
  paint({ context, x, y, w, h, pass }: PaintArgs) {
    if (pass !== 0) {
      return;
    }
    context.fillStyle = '#000';
    context.fillRect(x, y, w, h);
  }
}
