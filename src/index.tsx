import { createRoot } from 'react-dom/client';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { analyze, applyStartOfRoundEffects, draw, getCell, getGrid, getInitialState, getNeighbors, placeTile, State } from './game';
import { MapCell, PaintPass } from './cells/Base';
import { BaseCard } from './cards/base';
import { StatKey } from './stats';
import { isMobile } from 'react-device-detect';

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

  const aspect = isMobile ? 0.8 : 1.8;
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
    setState(analyze(applyStartOfRoundEffects(state)));
  };
  const playCard = (card: BaseCard) => {
    if (!card.canPlay(state)) {
      alert('Can\'t afford');
      return;
    }
    setState(card.effect(state));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { size: { height: canvasHeight, width: canvasWidth }, forceUpdate } = useCanvasSize(canvasRef);

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

  const paint = () => {
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

    if (hoverCell?.areaOfEffect) {
      for (const { dr, dc } of hoverCell.areaOfEffect) {
        const row = hoverCell.row + dr;
        const column = hoverCell.column + dc;
        const y = (row - rowStart) * cellHeight;
        const x = (column - colStart) * cellWidth;
        context.strokeStyle = '#00f'
        context.globalAlpha = 0.2;
        context.fillRect(x, y, cellWidth, cellHeight);
        context.globalAlpha = 1;
      }
    }
  };

  useEffect(
    paint,
    [
      canvasRef.current,
      state.map,
      zoom,
      centerRow,
      centerColumn,
      hover?.row,
      hover?.column,
      hoverCell,
      canvasWidth,
      canvasHeight,
      state.scene,
    ]
  );

  useEffect(
    () => {
      if (state.scene !== 'gameplay') {
        return;
      }
      forceUpdate();
    },
    [state.scene]
  )

  if (state.scene === 'splash') {
    return <SplashScreen 
      onBegin={() => {
        setState({ ...state, scene: 'gameplay' });
      }}
    />;
  }

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
          setState(analyze(placeTile(state, state.paintTile, row, column)));
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
      <div className={`controls ${isMobile ? 'mobile' : ''}`}>
        <button className="button zoomOutButton" onClick={zoomOut}>-</button>
        <button className="button zoomInButton" onClick={zoomIn}>+</button>
        <button className="button moveUpButton" onClick={moveUp}>⬆</button>
        <button className="button moveDownButton" onClick={moveDown}>⬇</button>
        <button className="button moveLeftButton" onClick={moveLeft}>⬅</button>
        <button className="button moveRightButton" onClick={moveRight}>⮕</button>
        <button
          className="endTurnButton"
          onClick={endTurn}
          disabled={!!state.paintTile}
        >
          End Turn
        </button>
      </div>
      {!state.paintTile && (
        <Hand
          state={state}
          onCardClick={playCard}
        />
      )}
      {state.paintTile && <h1>Place a {state.paintTile}</h1>}
      <Stats state={state} hoverCell={hoverCell} />
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
  state,
  onCardClick
}: {
  state: State;
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
  }, [state.hand.map(({ id }) => id).join('-')]);

  return (
    <div className="hand" ref={handRef}>
      {state.hand.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={onCardClick}
          canPlay={card.canPlay(state)}
        />
      ))}
    </div>
  );
}

function Card({
  card,
  onClick,
  canPlay,
}: {
  card: BaseCard;
  onClick: (card: BaseCard) => void;
  canPlay: boolean
}): React.ReactNode {
  return <div className="card-container">
    {!canPlay && <div className="card-tip">Can't afford</div>}
    <div
      className={`card description-size-${card.descriptionSize}`}
      onClick={() => onClick(card)}
    >
      <div className="card-title" title={card.name}>
        {card.name}{' '}
      </div>
      <div className="card-cost">
        {[...card.cost.entries()].map(([key, cost]) => <Badge value={cost} type={key} />)}
      </div>
      {card.imageUrl && (
        <div
          className="card-image"
          style={{backgroundImage: `url(${card.imageUrl})` }}
        />
      )}
      <div className="card-description">{card.getDescription()}</div>
    </div>
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
    <div className="stats">
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

function SplashScreen({ onBegin }: { onBegin: () => void }): React.ReactElement {
  return <div className='splash'>
    <h1>Polity: Deckbuilding City Planning</h1>
    <p>
      Polity is a city planning game where the actions you can take are
      determined by the hand you draw. Play cards to place tiles that score
      points.
    </p>
    <p>
      Your goal is to gain population without going broke.
    </p>
    <p>
      As the city planner, you'll receive housing development applications. If
      you have the <b>Approve Housing</b> card in your hand can pay the{' '}
      <Badge type='residentialApplications' /> hosing application and{' '}
      <Badge type='ap' /> action points cost, then you can place a residential
      cell on the map.
    </p>
    <p>
      People will move to residential cells if there are jobs, and some cells
      generate jobs. Each residential cell is scored based on its proximity to
      jobs, and better socres mean more people will move in.
    </p>
    <p>
      You start with <b>City Hall</b>, which generates a few jobs, but you'll
      need more, especially by approving <b>Commercial</b> and{' '}
      <b>Industrial</b>{' '} developments.
    </p>
    <p>
      Thankfully your citizens are entrepeneureal: <b>Residential</b> cells will
      generate <Badge type="commercialApplications" /> <b>Commercial</b>{' '}
      development applications. These add a few jobs, but <b>Commercial</b>{' '}
      cells generate <Badge type="industrialApplications" />{' '}
      <b>Industrial</b> applications, which add many jobs and, in turn, generate
      more <Badge type="residentialApplications" /> <b>Residential</b>{' '}
      applications. It's a virtuous cycle!
    </p>
    <button onClick={onBegin}>Begin</button>
  </div>;
}

type Size = {
  width: number;
  height: number;
};

function useCanvasSize(
  ref: React.RefObject<HTMLCanvasElement | null>
): {
  size: Size;
  forceUpdate: () => void;
} {
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
  return { size, forceUpdate: updateSize };
}


const root = createRoot(document.getElementById('container')!);
root.render(<Game/>);