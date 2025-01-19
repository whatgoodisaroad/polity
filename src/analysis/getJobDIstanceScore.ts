import { orderBy } from "lodash";
import { JobProvider } from "../cells/JobProvider";
import { getCell, State } from "../game";
import { getDistanceMap } from "./getDistanceMap";

/**
 * The job-distance-score measures a cell's proximity to jobs.
 * 
 * - Find the travel distance between the origin and every job-generating cell.
 * - Produce a list of each such cell where the nunber of jobs is divided by the
 *   travel distance. This is the cell-pair-job-score.
 * - The final job-distance-score is the mean cell-pair-job-score.
*/
export function getJobDistanceScore(
  row: number,
  column: number,
  state: State
): number {
  const distances = getDistanceMap(row, column, state);
  let jobScores: number[] = [];
  for (const [row2, cols] of distances.entries()) {
    for (const [column2, distance] of cols.entries()) {
      const cell = getCell(row2, column2, state);
      
      // Skip cells that don't generate jobs:
      if (!('getJobCount' in cell)) {
        continue;
      }

      const jobsCell = cell as JobProvider;
      jobScores.push(jobsCell.getJobCount() / distance);
    }
  }
  return jobScores.reduce((acc, score) => acc + score, 0) / jobScores.length;
}