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

function initializeUi(
  container: HTMLElement,
  onMapTileClick: (row: number, column: number) => void,
  onTileBankClick: (type: CellType) => void,
): {
  grid: HTMLTableElement;
  tiles: HTMLUListElement;
  log: HTMLUListElement;
} {
  const grid = document.createElement('table');
  grid.setAttribute('cellpadding', '0');
  grid.classList.add('map');
  container.appendChild(grid);
  grid.addEventListener('click', (e) => {
    const target = e.target as HTMLTableCellElement;
    if (!target.classList.contains('cell')) {
      return;
    }
    onMapTileClick(
      parseInt(target.dataset.row ?? '', 10),
      parseInt(target.dataset.column ?? '', 10)
    );
  });
  
  const tiles = document.createElement('ul');
  tiles.classList.add('tile-bank');
  tiles.addEventListener('click', (e) => {
    const target = e.target as HTMLTableCellElement;
    if (!target.classList.contains('tile-bank-entry')) {
      return;
    }
    onTileBankClick(target.dataset.type as CellType);
  });
  container.appendChild(tiles);

  const log = document.createElement('ul');
  container.appendChild(log);

  return { grid, tiles, log };
}

function render(
  state: State,
  grid: HTMLTableElement,
  tiles: HTMLUListElement,
  log: HTMLUListElement,
) {
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  const rows = getGrid(state, { rowStart: -8, rowEnd: 8, colStart: -15, colEnd: 15 });
  for (const row of rows) {
    const tr = document.createElement('tr');
    for (const cell of row) {
      const td = document.createElement('td');
      td.classList.add(`cell`);
      td.classList.add(`cell-${cell.type}`);
      td.dataset.row = `${cell.row}`;
      td.dataset.column = `${cell.column}`;
      td.innerText = cell.type;
      tr.appendChild(td);
    }
    grid.appendChild(tr);
  }

  while (tiles.firstChild) {
    tiles.removeChild(tiles.firstChild);
  }
  for (const [type, count] of state.tiles.entries()) {
    const selected = state.paintTile === type;
    const li = document.createElement('li');
    li.classList.add('tile-bank-entry');
    li.innerText = `${selected ? '* ' : ''}${type}: ${count}`;
    li.dataset.type = type;
    tiles.appendChild(li);
  }

  while (log.firstChild) {
    log.removeChild(log.firstChild);
  }
  for (const entry of state.log) {
    const li = document.createElement('li');
    li.innerText = entry;
    log.appendChild(li);
  }
}

let currentState = getInitialState();

const { grid, tiles, log } = initializeUi(
  document.getElementById('container')!,
  (row, column) => {
    const cell = getCell(row, column, currentState);

    if (!currentState.paintTile) {
      return;
    }

    if (cell.type !== 'empty') {
      currentState = { 
        ...currentState,
        log: ['Cell is occupied', ...currentState.log],
      };
      render(currentState, grid, tiles, log);
      return;
    }

    const tileCount = currentState.tiles.get(currentState.paintTile) ?? 0;
    const newTiles = new Map([...currentState.tiles]);
    const newMap = [...currentState.map];
    let paintTile: CellType | undefined = currentState.paintTile;
    const newLog = [...currentState.log];

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
      newMap.push({ type: currentState.paintTile, row, column });
      newLog.splice(0, 0, `Placed a ${currentState.paintTile} tile`);
    }
    currentState = {
      ...currentState,
      map: newMap,
      tiles: newTiles,
      paintTile,
      log: newLog,
    };
    render(currentState, grid, tiles, log);
  },
  (type) => {
    currentState = { ...currentState, paintTile: type };
    render(currentState, grid, tiles, log);
  },
);
render(currentState, grid, tiles, log);
