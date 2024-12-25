import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';

type CellType =
  | 'empty'
  | 'city-hall'
  | 'residential'
  | 'industrial'
  | 'commercial'
  | 'arterial'
  | 'parking';

type MapCell = {
  type: CellType;
  row: number;
  column: number;
};

type State = {
  map: MapCell[];
  tiles: Map<CellType, number>;
  paintTile?: CellType;
  log: string[];
};

type Range2 = {
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

function getInitialState(): State { 
  const map: MapCell[] = [
    { type: 'city-hall', row: -1, column: 0 },
    { type: 'city-hall', row: -1, column: 1 },
    { type: 'parking', row: 0, column: 0 },
    { type: 'city-hall', row: 0, column: 1 },
  ];
  for (let row = -100; row <= 100; row++) {
    map.push({ type: 'arterial', row, column: -1 });
  }
  return {
    map,
    tiles: new Map([
      ['residential', 4],
      ['commercial', 4],
      ['industrial', 4],
    ]),
    log: ['Welcome!'],
  };
}

function getGrid(
  state: State,
  { rowStart, rowEnd, colStart, colEnd }: Range2
): MapCell[][] {
  const result: MapCell[][] = [];
  for (let row = rowStart; row <= rowEnd; row++) {
    const rowCells: MapCell[] = [];
    for (let column = colStart; column <= colEnd; column++) {
      rowCells.push(getCell(row, column, state));
    }
    result.push(rowCells);
  }
   
  return result;
}

function getCell(row: number, column: number, { map }: State): MapCell {
  const match = map.find(
    (cell) => cell.row === row && cell.column === column
  );
  return match ?? { type: 'empty', row, column };
}

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
        const cell = getCell(row, column, state);

        if (cell.type !== 'empty') {
          setState({ 
            ...state,
            log: ['Cell is occupied', ...state.log],
          });
          return;
        }

        const tileCount = state.tiles.get(state.paintTile) ?? 0;
        const newTiles = new Map([...state.tiles]);
        const newMap = [...state.map];
        let paintTile: CellType | undefined = state.paintTile;
        const newLog = [...state.log];

        if (tileCount <= 0) {
          newTiles.delete(paintTile);
        } else {
          const newTileCount = tileCount - 1;
          if (newTileCount <= 0) {
            newTiles.delete(paintTile);
            paintTile = undefined;
          } else {
            newTiles.set(paintTile, newTileCount);
          }
          newMap.push({ type: state.paintTile, row, column });
        }
        setState({
          ...state,
          map: newMap,
          tiles: newTiles,
          paintTile,
          log: newLog,
        });
      }}
    >
      {rows.map((cells) => (
        <tr>
          {cells.map((cell) => (
            <td
              className={`cell cell-${cell.type}`}
              data-row={cell.row}
              data-column={cell.column}
            >
              {cell.type}
            </td>
          ))}
        </tr>
      ))}
    </table>
    <ul
      className="tile-bank"
      onClick={(e) => {
        const target = e.target as HTMLTableCellElement;
        if (!target.classList.contains('tile-bank-entry')) {
          return;
        }
        const type = target.dataset.type as CellType;
        console.log({type})
        setState({ ...state, paintTile: type });
      }}
    >
      {[...state.tiles.entries()].map(([type, count]) => {
        const selected = state.paintTile === type;
        return <li
          className="tile-bank-entry"
          data-type={type}
        >
          {selected ? '* ' : ''}{type}: {count}
        </li>
      })}
    </ul>
    <ul className="log">
      {state.log.map((entry) => <li>{entry}</li>)}
    </ul>
  </div>;
}

const root = createRoot(document.getElementById('container')!);
root.render(<Game/>);