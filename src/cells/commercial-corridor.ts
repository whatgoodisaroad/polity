import { Color, drawBuilding, MapCell, neighborToCoords, PaintArgs } from "./base";
import { Neighbors } from "../game";

export class CommetcialCorridorCell extends MapCell {
  constructor(row: number, column: number) {
    super('commercial-corridor', row, column);
  }
  
  paint(args: PaintArgs) {
    const { context, x, y, w, h, pass, neighbors} = args;
    const cluster = [
      [0.27, 0.27, 0.3, 0.25],
      [0.27, 0.52, 0.2, 0.2],
      [0.48, 0.55, 0.25, 0.18],
      [0.58, 0.28, 0.15, 0.25],
    ];

    if (pass === 0) {
      context.fillStyle = Color.developed;
      context.fillRect(x, y, w, h);
     
      context.beginPath();
      context.strokeStyle = Color.road;
      context.lineWidth = w * 0.008;

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

      for (const [rx, ry, rw, rh] of cluster) {
        drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
      }
    } else {
      const connections = Object.entries(neighbors)
        .filter(([key, cell]) => 
          ['n', 'e', 's', 'w'].includes(key) &&
          cell.type === 'commercial-corridor'
        )
        .map(([key]) => key) as (keyof Neighbors)[];

      if (connections.includes('s')) {
        for (const [rx, ry, rw, rh] of cluster) {
          console.log(connections, [rx, ry, rw, rh]);
          drawBuilding(args, { rx, ry: ry + 0.5, rw, rh }, 'commercial');
        }  
      }
      
      if (connections.includes('e')) {
        for (const [rx, ry, rw, rh] of cluster) {
          console.log(connections, [rx, ry, rw, rh]);
          drawBuilding(args, { rx: rx + 0.5, ry, rw, rh }, 'commercial');
        }  
      }

      if (connections.includes('s') && connections.includes('e')) {
        for (const [rx, ry, rw, rh] of cluster) {
          console.log(connections, [rx, ry, rw, rh]);
          drawBuilding(args, { rx: rx + 0.5, ry: ry + 0.5, rw, rh }, 'commercial');
        }  
      }
    }

    // if (connections.length === 0) {
      
    // }
    // context.beginPath();
    // context.strokeStyle = Color.road;
    // context.lineWidth = w * 0.02;

    // context.stroke();

  }
}
