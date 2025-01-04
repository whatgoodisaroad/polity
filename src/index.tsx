import { createRoot } from 'react-dom/client';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { applyStartOfRoundEffects, draw, getCell, getGrid, getInitialState, getNeighbors, placeTile, State } from './game';
import { MapCell, PaintPass } from './cells/base';
import { BaseCard } from './cards/base';
import { StatKey } from './stats';

function Game(): React.ReactNode {
  const [state, setState] = useState(() => draw(getInitialState()));
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
  const endTurn = () => {
    if (state.paintTile) {
      return;
    }
    setState(applyStartOfRoundEffects(state));
  };
  const playCard = (card: BaseCard) => {
    if (!card.canPlay(state)) {
      alert('Can\'t afford');
      return;
    }
    setState(card.effect(state));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { height: canvasHeight, width: canvasWidth } = useCanvasSize(canvasRef);

  const offsetToCoord = (
    offsetX: number,
    offsetY: number,
    canvasWidth: number,
    canvasHeight: number,
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

  useEffect(
    () => {
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

    },
    [
      state.map,
      zoom,
      centerRow,
      centerColumn,
      hover?.row,
      hover?.column,
      canvasWidth,
      canvasHeight,
    ]
  );

  return <div>
    <Row>
      <canvas
        className="canvas"
        ref={canvasRef}
        height={canvasHeight}
        width={canvasWidth}
        onClick={(e) => {
          if (!state.paintTile) {
            return;
          }
          const { offsetX, offsetY } = e.nativeEvent;
          const { row, column } = offsetToCoord(
            offsetX,
            offsetY,
            canvasWidth,
            canvasHeight,
          );
          setState(placeTile(state, state.paintTile, row, column));
        }}
        onMouseMove={(e) => {
          const { offsetX, offsetY } = e.nativeEvent;
          const { row, column } = offsetToCoord(
            offsetX,
            offsetY,
            canvasWidth,
            canvasHeight,
          );
          setHover({ row, column });
        }}
      />
    </Row>
    <Row className="tray">
      <Stats state={state} hoverCell={hoverCell} />
      <div>
        <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button>
        <button onClick={moveUp}>⬆</button>
        <button onClick={moveDown}>⬇</button>
        <button onClick={moveLeft}>⬅</button>
        <button onClick={moveRight}>⮕</button>
        <button onClick={endTurn} disabled={!!state.paintTile}>End Turn</button>
      </div>
      {!state.paintTile && (
        <Hand
          hand={state.hand}
          onCardClick={playCard}
        />
      )}
      {state.paintTile && <h1>Place a {state.paintTile}</h1>}
    </Row>
  </div>;
}

function Row({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactNode {
  return (
    <div className={`row ${className}`}>
      {children}
    </div>
  );
}

function Hand({
  hand,
  onCardClick
}: {
  hand: BaseCard[];
  onCardClick: (card: BaseCard) => void;
}): React.ReactNode {
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
  }, [hand.map(({ id }) => id).join('-')]);

  return (
    <div className="hand" ref={handRef}>
      {hand.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}

function Card({
  card,
  onClick,
}: {
  card: BaseCard;
  onClick: (card: BaseCard) => void;
}): React.ReactNode {
  return <div
    className="card"
    onClick={() => onClick(card)}
  >
    <div className="card-title">
      {card.name}{' '}
    </div>
    <div>
      {[...card.cost.entries()].map(([key, cost]) => <Badge value={cost} type={key} />)}
    </div>
    {card.imageUrl && (
      <div
        className="card-image"
        style={{backgroundImage: `url(${card.imageUrl})` }}
      />
    )}
    <div>{card.getDescription()}</div>
  </div>;
}

function Badge({ value, type }: { value?: number; type: StatKey }): React.ReactNode {
  return <span className={`badge ${type}`}>{value}</span>;
}

function Stats({
  state,
  hoverCell,
}: {
  state: State;
  hoverCell: MapCell | null;
}): React.ReactNode {
  const badgedStats: StatKey[] = [
    'ap',
    'money',
    'residentialApplications',
    'commercialApplications',
    'industrialApplications',
  ];
  return (
    <div>
      <table>
        <tbody>
          {[...state.stats.entries()].filter(([, { display }]) => display).map(([key, value]) => (
            <tr key={key}>
              <td>
                {badgedStats.includes(key)
                  ? <Badge type={key} />
                  : value.displayName ?? key
                }:</td>
              <td>
                {value.value} {value.max ? ` / ${value.max}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hoverCell && <>
        <table>
          <tbody>
            {[...hoverCell.getDescription().entries()].map(([key, value]) => (
              <tr key={key}>
                <td>{key}:</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>}
    </div>
  );
}

type Size = {
  width: number;
  height: number;
};

function useCanvasSize(ref: React.RefObject<HTMLCanvasElement | null>): Size {
  const [size, setSize] = useState<Size>({ height: 1, width: 1 });
  const updateSize = () => {
    if (!ref.current) {
      return;
    }
    const { height, width } = ref.current.getBoundingClientRect();
    setSize({ height, width });
  }
  useLayoutEffect(
    () => {
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    },
    []
  );
  return size;
}


const root = createRoot(document.getElementById('container')!);
root.render(<Game/>);