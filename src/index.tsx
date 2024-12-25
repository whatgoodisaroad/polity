import { createRoot } from 'react-dom/client';
import React, { useEffect, useRef, useState } from 'react';
import { getGrid, getInitialState, placeTile } from './game';
import { CellType, PaintPass } from './cell';

function Game(): React.ReactNode {
  const [state, setState] = useState(getInitialState());
  const [zoom, setZoom] = useState(16);
  const [centerRow, setCenterRow] = useState(0);
  const [centerColumn, setCenterColumn] = useState(0);
  const aspect = 1.8;
  const rowStart = centerRow - zoom * 0.5;
  const rowEnd = centerRow + zoom * 0.5;
  const colStart = centerColumn - Math.floor(aspect * zoom * 0.5);
  const colEnd = centerColumn + Math.floor(aspect * zoom * 0.5);

  const zoomIn = () => setZoom(Math.max(zoom * 0.5, 4));
  const zoomOut = () => setZoom(Math.min(zoom * 2, 64));
  const moveUp = () => setCenterRow(centerRow - zoom * 0.25);
  const moveDown = () => setCenterRow(centerRow + zoom * 0.25);
  const moveLeft = () => setCenterColumn(centerColumn - Math.max(2, Math.floor(aspect * zoom * 0.25)));
  const moveRight = () => setCenterColumn(centerColumn + Math.max(2, Math.floor(aspect * zoom * 0.25)));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasHeight = 600;
  const canvasWidth = Math.floor(aspect * canvasHeight)

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) {
      return;
    }
    const cellHeight = Math.floor(canvasHeight / zoom);
    const cellWidth = Math.floor(canvasWidth / Math.floor(aspect * zoom));
    const visible = getGrid(state, { rowStart, rowEnd, colStart, colEnd }).flat();
    for (const pass of [0, 1] as PaintPass[]) {
      for (const cell of visible) {
        const { row, column } = cell;
        const y = (row - rowStart) * cellHeight;
        const x = (column - colStart) * cellWidth;
        cell.paint({
          context,
          x,
          y,
          h: cellHeight,
          w: cellWidth,
          pass,
        });
      }
    }
  }, [state.map, zoom, centerRow, centerColumn]);

  
  return <div>
    <canvas ref={canvasRef} height={canvasHeight} width={canvasWidth} />
    <ul
      className="tile-bank"
      onClick={(e) => {
        const target = e.target as HTMLTableCellElement;
        if (!target.classList.contains('tile-bank-entry')) {
          return;
        }
        const type = target.dataset.type as CellType;
        setState({ ...state, paintTile: type });
      }}
    >
      {[...state.tiles.entries()].map(([type, count]) => {
        const selected = state.paintTile === type;
        return <li
          className="tile-bank-entry"
          data-type={type}
          key={`tile-bank-entry-${type}`}
        >
          {selected ? '* ' : ''}{type}: {count}
        </li>
      })}
    </ul>
    <ul className="log">
      {state.log.map((entry) => <li key={entry}>{entry}</li>)}
    </ul>
    <div>
      <button onClick={zoomOut}>-</button>
      <button onClick={zoomIn}>+</button>
      <button onClick={moveUp}>⬆</button>
      <button onClick={moveDown}>⬇</button>
      <button onClick={moveLeft}>⬅</button>
      <button onClick={moveRight}>⮕</button>
    </div>
  </div>;
}

const root = createRoot(document.getElementById('container')!);
root.render(<Game/>);