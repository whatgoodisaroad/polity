import { Color, drawBuilding, MapCell, neighborToCoords, PaintArgs } from "./base";
import { Neighbors } from "../game";

export class CommercialCorridorCell extends MapCell {
  constructor(row: number, column: number) {
    super('commercial-corridor', row, column);
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
        drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
      }

      const connections = Object.entries(neighbors)
        .filter(([key, cell]) => cell.type === 'commercial-corridor')
        .map(([key]) => key) as (keyof Neighbors)[];

      if (connections.includes('s')) {
        for (const [rx, ry, rw, rh] of cluster) {
          console.log(connections, [rx, ry, rw, rh]);
          drawBuilding(args, { rx, ry: ry + 0.5, rw, rh }, 'commercial');
        }
      } else {
        for (const cs of rightRows) {
          const [rx, ry, rw, rh] = rot90(cs);
          drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
        }
      }
      
      if (connections.includes('e')) {
        for (const [rx, ry, rw, rh] of cluster) {
          console.log(connections, [rx, ry, rw, rh]);
          drawBuilding(args, { rx: rx + 0.5, ry, rw, rh }, 'commercial');
        }
      } else {
        for (const [rx, ry, rw, rh] of rightRows) {
          drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
        }
      }

      if (
        connections.includes('s') &&
        connections.includes('e') &&
        connections.includes('se')
      ) {
        for (const [rx, ry, rw, rh] of cluster) {
          console.log(connections, [rx, ry, rw, rh]);
          drawBuilding(args, { rx: rx + 0.5, ry: ry + 0.5, rw, rh }, 'commercial');
        }
      } else {
        for (const cs of topRightRows) {
          const [rx, ry, rw, rh] = rot90(cs);
          drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
        }
      }

      if (!connections.includes('n') || !connections.includes('e')) {
        for (const [rx, ry, rw, rh] of topRightRows) {
          drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
        }
      }

      if (!connections.includes('w') || !connections.includes('s')) {
        for (const cs of topRightRows) {
          const [rx, ry, rw, rh] = rot90(rot90(cs));
          drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
        }
      }

      if (!connections.includes('w')) {
        for (const cs of rightRows) {
          const [rx, ry, rw, rh] = rot90(rot90(cs));
          drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
        }
      }

      if (
        !connections.includes('nw') ||
        !connections.includes('w') ||
        !connections.includes('n')
      ) {
        for (const cs of topRightRows) {
          const [rx, ry, rw, rh] = rot90(rot90(rot90(cs)))
          drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
        }
      }

      if (!connections.includes('n')) {
        for (const cs of rightRows) {
          const [rx, ry, rw, rh] = rot90(rot90(rot90(cs)));
          drawBuilding(args, { rx, ry, rw, rh }, 'commercial');
        }
      }
    }
  }
}

type Coords = [number, number, number, number];

function rot90([rx, ry, rw, rh]: Coords): Coords {
  return [
    1 - ry - rh,
    rx,
    rh,
    rw,
  ];
}