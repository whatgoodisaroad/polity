import { getJobDistanceScore } from "./analysis/getJobDIstanceScore";
import { 
  ApproveHousingCard,
  ExpandMunicipalCharter,
  ParadeCard,
  ParksAndRecreationCard,
  ResidentialTaxAdjustmentCard,
  ApproveCommercialCorridorCard,
  ApproveIndustrialCard,
} from "./cards";
import { BaseCard } from "./cards/base";
import {
  CityHallCell,
  CommercialCorridorCell,
  EmptyCell,
  FreewayCorridorCell,
  ResidentialCell,
  VoidCell,
  IndustrialCell,
  ParkCell,
} from "./cells";
import type { CellType, MapCell } from "./cells/Base";
import { initStat, modifyStat, Stat, StatKey } from "./stats";

export type State = {
  scene: 'splash' | 'gameplay';
  map: MapCell[];
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

export function getInitialState(): State { 
  const map: MapCell[] = [];
  for (let row = -10; row <= 10; row++) {
    for (let column = -10; column <= 10; column++) {
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
    scene: 'splash',
    map,
    log: [],
    stats: new Map([
      ['ap', initStat('ap')],
      ['money', initStat('money')],
      ['residentialApplications', initStat('residentialApplications')],
    ]),
    hand: [],
    deck: shuffle([
      new ApproveHousingCard(),
      new ApproveHousingCard(),
      new ApproveIndustrialCard(),
      new ParksAndRecreationCard(),
      new ExpandMunicipalCharter(),
      new ResidentialTaxAdjustmentCard(),
      new ApproveCommercialCorridorCard(),
      new ParadeCard(),
    ]),
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

export function findCellByType(state: State, cellType: CellType): MapCell | undefined {
  return state.map.find(({ type }) => type === cellType);
}

export function replaceCell(
  state: State,
  row: number,
  column: number,
  cell: MapCell,
): State {
  return {
    ...state,
    map: [
      ...state.map.filter(
        (cell) => cell.row !== row || cell.column !== column
      ),
      cell
    ],
  }
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

  const newLog = [...state.log];

  let newCell: MapCell | undefined;
  if (type === 'freeway-corridoor') {
    newCell = new FreewayCorridorCell(row, column);
  } else if (type === 'commercial-corridor') {
    newCell = CommercialCorridorCell.create(row, column);
  } else if (type === 'residential') {
    newCell = ResidentialCell.create(row, column, state);
  } else if (type === 'industrial') {
    newCell = new IndustrialCell(row, column);
  } else if (type === 'park') {
    newCell = new ParkCell(row, column);
  }
  if (!newCell) {
    throw 'Could not place';
  }

  return {
    ...replaceCell(
      state,
      row,
      column,
      newCell,
    ),
    paintTile: undefined,
    log: newLog,
  };
}

const HAND_SIZE = 5;

export function draw(state: State): State {
  let hand = [];
  let deck = [ ...state.deck ];
  let discard = [ ...state.discard ];

  if (state.hand.length > 0) {
    discard.push(...state.hand);
  }

  while (hand.length < HAND_SIZE) {
    if (deck.length === 0) {
      deck = shuffle(discard);
      discard = [];
    }
    hand.push(deck[0]);
    deck = deck.slice(1);
  }
  return {
    ...state,
    hand,
    deck,
    discard,
  };
}

function shuffle<T>(a: T[]): T[] {
  return a
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export function applyStartOfRoundEffects(state: State): State {
  let newState = { ...state, };
  let population = 0;
  for (const cell of state.map) {
    newState = cell.applyStartOfRoundEffects(newState);
    if (cell instanceof ResidentialCell) {
      population += cell.dwellings.length * 3.5;
    }
  }

  return modifyStat(draw({ ...newState }), 'population', () => Math.floor(population));
}

export function analyze(state: State): State {
  let newState = state;
  for (const cell of state.map) {
    newState = cell.analyze(newState);
  }
  return newState;
}

export function discardHandCardById(state: State, cardId: string): State {
  const index = state.hand.findIndex(({ id }) => id === cardId);
  if (index === -1) {
    return state;
  }
  
  return {
    ...state,
    hand: state.hand.filter(({ id }) => id !== cardId),
    discard: [...state.discard, state.hand[index] ],
  };
}
