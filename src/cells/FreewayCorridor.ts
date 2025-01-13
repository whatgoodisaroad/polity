import { Color, MapCell, neighborToCoords, PaintArgs } from "./base";
import { Neighbors } from "../game";

export class FreewayCorridorCell extends MapCell {
  constructor(row: number, column: number) {
    super('freeway-corridoor', row, column, 1);
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
