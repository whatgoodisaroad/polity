import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';
import { CellType, getGrid, getInitialState, placeTile } from './game';

function Game(): React.ReactNode {
  const [state, setState] = useState(getInitialState());
  const rows = getGrid(state, { rowStart: -8, rowEnd: 8, colStart: -15, colEnd: 15 });

  return <div>
    <table
      cellPadding={0}
      className="map"
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
              >
                {cell.type}
              </td>
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
  </div>;
}

const root = createRoot(document.getElementById('container')!);
root.render(<Game/>);