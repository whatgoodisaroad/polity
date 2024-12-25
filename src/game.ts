export type CellType =
  | 'empty'
  | 'city-hall'
  | 'residential'
  | 'industrial'
  | 'commercial'
  | 'freeway-cooridor'
  | 'commercial-corridor'
  | 'service-road';

export type MapCell = {
  type: CellType;
  row: number;
  column: number;
};

export type State = {
  map: MapCell[];
  tiles: Map<CellType, number>;
  paintTile?: CellType;
  log: string[];
};

export type Range2 = {
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

export function getInitialState(): State { 
  const map: MapCell[] = [
    { type: 'city-hall', row: 0, column: 3 },
    { type: 'service-road', row: 0, column: 1 },
    { type: 'service-road', row: 0, column: 2 },
  ];
  for (let row = -100; row <= 100; row++) {
    map.push({ type: 'freeway-cooridor', row, column: 0 });
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

export function getGrid(
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

export function getCell(row: number, column: number, { map }: State): MapCell {
  const match = map.find(
    (cell) => cell.row === row && cell.column === column
  );
  return match ?? { type: 'empty', row, column };
}

export function placeTile(
  state: State,
  type: CellType,
  row: number,
  column: number
): State {
  const cell = getCell(row, column, state);
  
  if (cell.type !== 'empty') {
    return { 
      ...state,
      log: ['Cell is occupied', ...state.log],
    };
  }

  const tileCount = state.tiles.get(type) ?? 0;
  const newTiles = new Map([...state.tiles]);
  const newMap = [...state.map];
  let paintTile: CellType | undefined = state.paintTile;
  const newLog = [...state.log];

  if (tileCount <= 0) {
    newTiles.delete(type);
  } else {
    const newTileCount = tileCount - 1;
    if (newTileCount <= 0) {
      newTiles.delete(type);
      paintTile = undefined;
    } else {
      newTiles.set(type, newTileCount);
    }
    newMap.push({ type, row, column });
  }
  return {
    ...state,
    map: newMap,
    tiles: newTiles,
    paintTile,
    log: newLog,
  };
}
