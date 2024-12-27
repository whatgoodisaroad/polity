import { createRoot } from 'react-dom/client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { applyStartOfRoundEffects, getCell, getGrid, getInitialState, getNeighbors, placeTile } from './game';
import { CellType, PaintPass } from './cells/base';
import { BaseCard } from './card';

function Game(): React.ReactNode {
  const [state, setState] = useState(applyStartOfRoundEffects(getInitialState()));
  const [zoom, setZoom] = useState(8);
  const [centerRow, setCenterRow] = useState(0);
  const [centerColumn, setCenterColumn] = useState(0);
  const [hover, setHover] = useState<{ row: number; column: number } | null>(null);
  
  const hoverCell = useMemo(
    () => hover ? getCell(hover?.row, hover?.column, state) : null,
    [state.map, hover?.row, hover?.column]
  );

  const aspect = 1.8;
  const rowStart = centerRow - zoom * 0.5;
  const rowEnd = centerRow + zoom * 0.5;
  const colStart = centerColumn - Math.floor(aspect * zoom * 0.5);
  const colEnd = centerColumn + Math.floor(aspect * zoom * 0.5);

  const zoomIn = () => setZoom(Math.max(zoom * 0.5, 4));
  const zoomOut = () => setZoom(Math.min(zoom * 2, 64));
  const moveUp = () => setCenterRow(centerRow - zoom * 0.5);
  const moveDown = () => setCenterRow(centerRow + zoom * 0.5);
  const moveLeft = () => setCenterColumn(centerColumn - Math.max(2, Math.floor(aspect * zoom * 0.25)));
  const moveRight = () => setCenterColumn(centerColumn + Math.max(2, Math.floor(aspect * zoom * 0.25)));
  const endTurn = () => setState(applyStartOfRoundEffects(state));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasHeight = 600;
  const canvasWidth = Math.floor(aspect * canvasHeight);

  const offsetToCoord = (
    offsetX: number,
    offsetY: number
  ): {
    row: number;
    column: number;
  } => {
    const rowInFrame = Math.floor(zoom * offsetY / canvasHeight);
    const columnInFrame = Math.floor(zoom * aspect * offsetX / canvasWidth);
    const row = rowStart + rowInFrame;
    const column = colStart + columnInFrame;
    return { row, column };
  };

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) {
      return;
    }
    const cellHeight = Math.floor(canvasHeight / zoom);
    const cellWidth = Math.floor(canvasWidth / Math.floor(aspect * zoom));
    const visible = getGrid(state, { rowStart, rowEnd, colStart, colEnd }).flat();
    for (const pass of [0, 1] as PaintPass[]) {
      for (const cell of visible) {
        const { row, column } = cell;
        const y = (row - rowStart) * cellHeight;
        const x = (column - colStart) * cellWidth;
        cell.paint({
          context,
          x,
          y,
          h: cellHeight,
          w: cellWidth,
          pass,
          neighbors: getNeighbors(row, column, state),
        });
      }
    }

    if (hover) {
      const { row, column } = hover;
      const y = (row - rowStart) * cellHeight;
      const x = (column - colStart) * cellWidth;
      context.strokeStyle = '#000';
      context.lineWidth = 1;
      context.strokeRect(x, y, cellWidth, cellHeight);
    }

  }, [state.map, zoom, centerRow, centerColumn, hover?.row, hover?.column]);

  return <div>
    <canvas
      ref={canvasRef}
      height={canvasHeight}
      width={canvasWidth}
      onClick={(e) => {
        if (!state.paintTile) {
          return;
        }
        const { offsetX, offsetY } = e.nativeEvent;
        const { row, column } = offsetToCoord(offsetX, offsetY);
        setState(placeTile(state, state.paintTile, row, column));
      }}
      onMouseMove={(e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const { row, column } = offsetToCoord(offsetX, offsetY);
        setHover({ row, column });
      }}
    />
    <Row>
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
        {[...state.tiles.entries()].map(([type, count], i) => {
          const selected = state.paintTile === type;
          return <li
            className="tile-bank-entry"
            data-type={type}
            key={`tile-bank-entry-${type}-${i}`}
          >
            {selected ? '* ' : ''}{type}: {count}
          </li>
        })}
      </ul>
      <div>
        <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button>
        <button onClick={moveUp}>⬆</button>
        <button onClick={moveDown}>⬇</button>
        <button onClick={moveLeft}>⬅</button>
        <button onClick={moveRight}>⮕</button>
        <button onClick={endTurn}>End Turn</button>
      </div>
      <div>
        {hoverCell && <>
          <table>
            <tbody>
              {[...hoverCell.getDescription().entries()].map(([key, value]) => (
                <tr>
                  <td>{key}:</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>}
      </div>
      <div>
        <table>
          <tbody>
            {[...state.stats.entries()].map(([key, value]) => (
              <tr key={key}>
                <td>{value.displayName ?? key}:</td>
                <td>
                  {value.value} {value.max ? ` / ${value.max}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Row>
    <div>
      <Hand hand={state.hand} />
    </div>
  </div>;
}

function Row({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <div className="row">
      {children}
    </div>
  );
}

function Hand({ hand }: { hand: BaseCard[] }): React.ReactNode {
  const handRef = useRef<HTMLDivElement>(null);
  const maxAngle = 10;
  const maxOffset = 30;

  useEffect(() => {
    if (!handRef.current) {
      return;
    }
    const cardElems = [...handRef.current.querySelectorAll('.card')];
    cardElems.forEach((cardElem, index) => {
      const centered = index + 0.5 - (cardElems.length / 2);
      const angle = maxAngle * centered;
      const offset = maxOffset * Math.abs(centered);
      cardElem.setAttribute(
        'style',
        `transform: rotate(${-angle}deg) translateY(${offset}px);`
      );
    });
  }, hand);


  return (
    <div className="hand" ref={handRef}>
      {hand.map((card) => <Card card={card} />)}
    </div>
  );
}

function Card({ card }: { card: BaseCard }): React.ReactNode {
  return <div className="card">
    <div className="card-title">{card.name}</div>
    {card.imageUrl && (
      <div
        className="card-image"
        style={{backgroundImage: `url(${card.imageUrl})` }}
      />
    )}
  </div>;
}

const root = createRoot(document.getElementById('container')!);
root.render(<Game/>);