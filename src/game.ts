import { BaseCard, ExpandMunicipalCharter, HousingDevelopmentInitiativeCard } from "./card";
import { CityHallCell, EmptyCell, FreewayCorridorCell, ResidentialCell, VoidCell } from "./cells";
import type { CellType, MapCell } from "./cells/base";

export interface Stat {
  value: number;
  lifecycle: 'game' | 'turn';
  displayName?: string;
  display?: boolean;
  max?: number;
}

export type StatKey = 'money' | 'ap' | 'residentialTaxRate';

export type State = {
  map: MapCell[];
  tiles: Map<CellType, number>;
  paintTile?: CellType;
  log: string[];
  stats: Map<StatKey, Stat>;
  hand: BaseCard[];
  deck: BaseCard[];
  discard: BaseCard[];
};

export type Range2 = {
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

export function modifyStat(
  state: State,
  key: StatKey,
  fn: (value: number) => number
): State {
  const stats = new Map(state.stats);
  let stat = stats.get(key);
  if (!stat) {
    stat = initStat(key);
  } 
  if (!stat) {
    throw `Failed to get stat ${key}`;
  }

  stat.value = fn(stat.value);
  if (stat.max && stat.value > stat.max) {
    stat.value = stat.max;
  }
  stats.set(key, stat);
  
  return {
    ...state,
    stats,
  }
}

export function getStatValue(state: State, key: StatKey): number {
  let stat = state.stats.get(key);
  if (!stat) {
    stat = initStat(key);
  }
  if (!stat) {
    throw 'Failed to initialize stat';
  }
  return stat.value;
}

function initStat(key: StatKey): Stat {
  if (key === 'money') {
    return { value: 0, lifecycle: 'game', display: true };
  } else if (key === 'ap') {
    return { value: 0, max: 10, lifecycle: 'game', display: true };
  } else if (key === 'residentialTaxRate') {
    return { value: 0.05, max: 0.5, lifecycle: 'game' };
  }
  throw `Unrecognized stat ${key}`;
}

export function getInitialState(): State { 
  const map: MapCell[] = [];
  for (let row = -5; row <= 5; row++) {
    for (let column = -5; column <= 5; column++) {
      if (row === 0 && column === 3) {
        map.push( new CityHallCell(row, column));
      } else if (column === 0) {
        map.push(new FreewayCorridorCell(row, column));
      } else {
        map.push(new EmptyCell(row, column));
      }
    }
  }  
  return {
    map,
    tiles: new Map([
      ['residential', 100],
    ]),
    log: ['Welcome!'],
    stats: new Map(),
    hand: [],
    deck: [
      new ExpandMunicipalCharter(),
      new HousingDevelopmentInitiativeCard(),
      new HousingDevelopmentInitiativeCard(),
      new HousingDevelopmentInitiativeCard(),
      new HousingDevelopmentInitiativeCard(),
      new HousingDevelopmentInitiativeCard(),
      new HousingDevelopmentInitiativeCard(),
      new HousingDevelopmentInitiativeCard(),
      new HousingDevelopmentInitiativeCard(),
    ],
    discard: [],
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
  return match ?? new VoidCell(row, column);
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
  const newMap = [
    ...state.map.filter((cell) => cell.row !== row || cell.column !== column),
  ];
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
    } else if (type === 'residential') {
      newMap.push(new ResidentialCell(row, column));
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

const HAND_SIZE = 5;

export function applyStartOfRoundEffects(state: State): State {
  let newState = { ...state, };
  for (const cell of state.map) {
    newState = cell.applyStartOfRoundEffects(newState);
  }

  let hand = [ ...state.hand ];
  let deck = [ ...state.deck ];
  let discard = [ ...state.discard ];

  discard.push(...hand);
  while (hand.length < HAND_SIZE) {
    if (deck.length === 0) {
      deck = discard;
      discard = [];
    }
    hand.push(deck[0]);
    deck = deck.slice(1);
  }

  return {
    ...newState,
    hand,
    deck,
    discard,
  };
}
