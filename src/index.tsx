import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';
import { CellType, getGrid, getInitialState, placeTile } from './game';

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
  const rows = getGrid(state, { rowStart, rowEnd, colStart, colEnd });

  const zoomIn = () => setZoom(Math.max(zoom * 0.5, 4));
  const zoomOut = () => setZoom(Math.min(zoom * 2, 64));
  const moveUp = () => setCenterRow(centerRow - zoom * 0.25);
  const moveDown = () => setCenterRow(centerRow + zoom * 0.25);
  const moveLeft = () => setCenterColumn(centerColumn - Math.max(2, Math.floor(aspect * zoom * 0.25)));
  const moveRight = () => setCenterColumn(centerColumn + Math.max(2, Math.floor(aspect * zoom * 0.25)));

  return <div>
    <table
      cellPadding={0}
      className={`map zoom-level-${zoom}`}
      onClick={(e) => {
        const target = e.target as HTMLTableCellElement;
        if (!target.classList.contains('cell') || !state.paintTile) {
          return;
        }
        const row = parseInt(target.dataset.row ?? '', 10);
        const column = parseInt(target.dataset.column ?? '', 10);
        setState(placeTile(state, state.paintTile, row, column));
      }}
    >
      <tbody>
        {rows.map((cells) => (
          <tr key={`row-${cells[0].row}`} >
            {cells.map((cell) => (
              <td
                className={`cell cell-${cell.type}`}
                data-row={cell.row}
                data-column={cell.column}
                key={`cell-${cell.row}-${cell.column}`}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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