import { Color, MapCell, PaintArgs } from "./base";

export class EmptyCell extends MapCell {
  debris: { dh: number; dv: number }[] = [];
  
  constructor(row: number, column: number) {
    super('empty', row, column, 'infinite');
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
