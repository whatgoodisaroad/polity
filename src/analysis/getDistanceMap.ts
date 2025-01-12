import { getCell, State } from "../game";
import { orderBy } from 'lodash';

export function getDistanceMap(
  originRow: number,
  originColumn: number,
  state: State
): Map<number, Map<number, number>> {
  const result = new Map<number, Map<number, number>>([[originRow, new Map([[originColumn, 0]])]]);
  let frontier: { row: number; column: number; cost: number }[] = [{ row: originRow, column: originColumn, cost: 0 }];
  while (frontier.length > 0) {
    const { row, column, cost } = frontier.shift()!;

    // For each neighbor:
    const neighborCoords = [
      [row - 1, column], // N
      [row, column + 1], // E
      [row + 1, column], // S
      [row, column - 1], // W
    ];
    for (const [row2, column2] of neighborCoords) {
      // Skip non-traversable cells:
      const cell = getCell(row2, column2, state);
      if (cell.movementCost === 'infinite') {
        continue;
      }

      const newCost = cost + cell.movementCost;
      // Skip if we already have a shorter path to this cell:
      const visitedCost = result.get(row2)?.get(column2);
      if (typeof visitedCost !== 'undefined' && visitedCost < newCost) {
        continue;
      }

      // Add this new cost to the result and frontier:
      if (!result.has(row2)) {
        result.set(row2, new Map<number, number>());
      }
      result.get(row2)?.set(column2, newCost);
      frontier.push({ row: row2, column: column2, cost: newCost });

      // Sort the frontier so the shortest distance is first:
      frontier = orderBy(frontier, ({ cost }) => cost);
    }
  }
  return result;
}
