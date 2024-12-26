import { CellType, CityHallCell, EmptyCell, FreewayCorridorCell, MapCell } from "./cell";


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
    new CityHallCell(0, 3),
  ];
  for (let row = -100; row <= 100; row++) {
    map.push(new FreewayCorridorCell(row, 0));
  }
  return {
    map,
    tiles: new Map([
      ['residential', 4],
      ['commercial', 4],
      ['industrial', 4],
      ['freeway-corridoor', 100],
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
  return match ?? new EmptyCell(row, column);
}

export type Neighbors = {
  n: MapCell;
  ne: MapCell;
  e: MapCell;
  se: MapCell;
  s: MapCell;
  sw: MapCell;
  w: MapCell;
  nw: MapCell;
};

export function getNeighbors(row: number, column: number, state: State): Neighbors {
  return {
    n: getCell(row - 1, column, state),
    ne: getCell(row - 1, column + 1, state),
    e: getCell(row, column + 1, state),
    se: getCell(row + 1, column + 1, state),
    s: getCell(row + 1, column, state),
    sw: getCell(row + 1, column - 1, state),
    w: getCell(row, column - 1, state),
    nw: getCell(row - 1, column - 1, state),
  };
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
    if (type === 'freeway-corridoor') {
      newMap.push(new FreewayCorridorCell(row, column));
    }
  }
  return {
    ...state,
    map: newMap,
    tiles: newTiles,
    paintTile,
    log: newLog,
  };
}
