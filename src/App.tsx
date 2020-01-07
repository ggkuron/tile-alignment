import React from 'react';
import {
  useDrag,
  useDrop,
  DndProvider,
  DragObjectWithType,
} from 'react-dnd';
import Backend from 'react-dnd-html5-backend'
import {
  Tile,
  TileSize,
  Tiles, 
  Point,
  Differences,
  adjust,
} from './adjust';
import './App.css';

interface DragCommand {
  type: "drag";
  id: string;
  tile: Tile;
}
interface MoveCommand {
  type: "move";
  differences: Differences;
} 
interface ResizeCommand {
  type: "resize";
  id: string;
  size: TileSize
}
type Command =
  | DragCommand
  | MoveCommand
  | ResizeCommand
  ;


function applyCommands(tiles: Tiles, cmds: Command[]): Tiles {
  return cmds.reduce<Tiles>(
    (tiles, c) => {
      switch (c.type) {
        case "drag": {
          return {
            ...tiles,
            [c.id]: c.tile
          }
        }
        case "move": {
          return Object.keys(c.differences).reduce<Tiles>(
            (tiles, k) => {
              const target = tiles[k];
              if (target) {
                return {
                  ...tiles,
                  [k]: {
                    ...target,
                    x: target.x + c.differences[k].x,
                    y: target.y + c.differences[k].y
                  }
                }
              } else return tiles;
            },
            tiles
          );
        }
        case "resize": {
          return {
            ...tiles,
            [c.id]: {
              ...tiles[c.id],
              ...c.size
            }
          }
        }
        default: {
          const exhausiveCheck: never = c;
          return exhausiveCheck;
        }
      }
    },
    tiles
  )
}

const App: React.FC = () => {
  const [{tiles, cmds}, updater] = React.useState<{ tiles: Tiles, cmds:  Command[]}>({tiles: {}, cmds: []});

  const commit = React.useCallback(() => {
    updater(
      ({ tiles, cmds }) => ({
        tiles: applyCommands(tiles, cmds),
        cmds: []
      })
    );
 }, []);
  const updateDragging = React.useCallback((id: string, position: Tile) => {
    updater(
      ({tiles}) => ({
        tiles,
        cmds: [
          {
            type: "drag",
            id,
            tile: position
          },
          {
            type: "move",
            differences: adjust({}, [id, position], tiles)[1]
          },
        ]
      })
    )
  }, [])
  const resizeTile = React.useCallback((id: string, size: TileSize) => {
    updater(
      ({tiles}) => ({
        tiles,
        cmds: [
          {
            type: "resize",
            id,
            size
          },
          {
            type: "move",
            differences: adjust({}, [id, { ...tiles[id], ...size }], tiles)[1]
          }
        ]
      })
    )
  }, [])
  const rollback = React.useCallback(()=> {
    updater(({tiles}) => ({tiles, cmds: []}));
  }, [])

  return (
    <DndProvider
      backend={Backend}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        <DropArea
          tiles={applyCommands(tiles, cmds)}
          updateDrag={updateDragging}
          commit={commit}
          rollback={rollback}
          resizeTile={resizeTile}
          style={{
            overflow: "auto",
          }}
        />
        <aside
          style={{
            flexBasis: 240,
            flexShrink: 0,
            flexGrow: 0,
            padding: 16,
            overflow: "auto",
          }}
        >
          <Item
            id={`tile-${Object.keys(tiles).length}`}
            updateDrag={updateDragging}
            commit={commit}
            rollback={rollback}
            size={{ rowSpan: 1, colSpan: 1 }}
            style={{
              marginBottom: 16,
            }}
          />
          <Item
            id={`tile-${Object.keys(tiles).length}`}
            updateDrag={updateDragging}
            commit={commit}
            rollback={rollback}
            size={{ rowSpan: 2, colSpan: 2 }}
          />
        </aside>
      </div>
    </DndProvider>
  );
}

interface DropAreaProps extends Omit<DragTileOptions, "size" | "id"> {
  tiles: Tiles;
  style?: React.CSSProperties;
  resizeTile: (id: string, size: TileSize) => void;
}
interface DragTileOptions {
  id: string;
  updateDrag: (id: string, t: Tile) => void;
  commit: () => void;
  rollback: () => void;
  size: TileSize;
}
interface DragObject extends DragObjectWithType {
  size: TileSize;
  id: string;
}
const useDragTile = <E extends HTMLElement>({
  id,
  commit,
  rollback,
  size
}: DragTileOptions) => {
  const ref = React.useRef<HTMLElement>();
  const [, drag] = useDrag<DragObject, {}, {}>({
    item: { type: "tile", id, size },
    end: (result, monitor) => {
      if (monitor.didDrop()) {
        commit();
      } else {
        rollback();
      }
    }
  })
  return React.useCallback((elm: E) => {
    ref.current = elm;
    drag(elm);
  }, [drag])
}

const TILE_SIZE = 80;
const TILE_GAP = 16;
const CANVAS_SIZE = 16;

const DropArea: React.FC<DropAreaProps> = ({
  tiles,
  updateDrag,
  commit,
  resizeTile,
  rollback,
  style,
}) => {
  const containerRef = React.useRef<HTMLElement>()
  const [, drop] = useDrop<DragObject, {}, {}>({
    accept: "tile",
    hover: (item, monitor) => {
      const sourceOffset = monitor.getSourceClientOffset()
      if (sourceOffset && containerRef.current) {
        const tile = pointTile(
          {
            x: sourceOffset.x + containerRef.current.scrollLeft,
            y: sourceOffset.y + containerRef.current.scrollTop,
          },
          item.size
        );
        updateDrag(item.id, tile)
      }
    }
  })
  const bindContainerRef = React.useCallback((elm: HTMLDivElement) => {
    containerRef.current = elm;
    drop(elm)
  }, [drop])

  return (
    <div
      style={{
        position: "relative",
        flexBasis: "100%",
        flexShrink: 1,
       ...style
      }}
      className="DropArea"
      ref={bindContainerRef}
    >
      <div
        style={{
          position: "absolute",
          width: (TILE_SIZE + TILE_GAP) * CANVAS_SIZE,
          height: (TILE_SIZE + TILE_GAP) * CANVAS_SIZE,
          backgroundImage: `linear-gradient(to bottom, transparent ${(1 - TILE_GAP / TILE_SIZE) * 100}%, white ${(1 - TILE_GAP / TILE_SIZE) * 100}%), linear-gradient(to right, #cecece ${(1 - TILE_GAP / TILE_SIZE) * 100}%, white ${(1 - TILE_GAP / TILE_SIZE) * 100}%)`,
          backgroundSize: `${TILE_SIZE + TILE_GAP}px ${TILE_SIZE + TILE_GAP}px`,
          backgroundPosition: `top ${TILE_GAP}px left ${TILE_GAP}px`,
        }}
      />
      {
        Object.keys(tiles).map(
          t => (
            <TileComp
              position={tiles[t]}
              id={t}
              key={`tile-${t}`}
              updateDrag={updateDrag}
              commit={commit}
              rollback={rollback}
              resizeTile={resizeTile}
            />
          )
        )
      }
   </div>
  )
}

function tilePosition(t: Tile): Point {
  return {
    x: t.x * (TILE_SIZE + TILE_GAP) + TILE_GAP,
    y: t.y * (TILE_SIZE + TILE_GAP) + TILE_GAP,
 }
}
function pointTile(p: Point, size: TileSize): Tile {
  return {
    ...size,
    x: Math.max(0, Math.floor((p.x - TILE_GAP) / (TILE_SIZE + TILE_GAP))),
    y: Math.max(0, Math.floor((p.y - TILE_GAP) / (TILE_SIZE + TILE_GAP))),
  }
}

interface HandleResizeParam<E> {
  id: string;
  initialSize: Size;
  updateSize: React.Dispatch<React.SetStateAction<Size | undefined>>;
  resizeTile: (id: string, size: TileSize) => void;
  getOffset: (ev: E) => { clientX: number; clientY: number } | false;
  origin: { x: number, y: number };
  preAction: (e: E) => void;
} 

function handleResizing<E>({
  id,
  initialSize,
  updateSize,
  resizeTile,
  getOffset,
  origin,
  preAction,
}: HandleResizeParam<E>) {
  return (ev: E) => {
    preAction(ev);
    updateSize(
      size => {
        const offset = getOffset(ev);
        const nextSize = origin && offset ?
          {
            width: Math.max(TILE_SIZE, initialSize.width + offset.clientX - origin.x),
            height: Math.max(TILE_SIZE, initialSize.height + offset.clientY - origin.y)
          } :
          size;
        if (nextSize) {
          resizeTile(
            id,
            {
              colSpan: Math.max(1, Math.ceil((nextSize.width + TILE_GAP) / (TILE_SIZE + TILE_GAP))),
              rowSpan: Math.max(1, Math.ceil((nextSize.height + TILE_GAP) / (TILE_SIZE + TILE_GAP))),
            }
          )
        }
        return nextSize;
      }
    )
  }
}


interface Size {
  width: number;
  height: number;
}



interface TileProps extends Omit<DragTileOptions, "size"> {
  position: Tile;
  style?: React.CSSProperties;
  resizeTile: (id: string, size: TileSize) => void;
}
const TileComp: React.FC<TileProps> = ({
  id,
  position,
  updateDrag,
  commit,
  rollback,
  style,
  resizeTile,
}) => {
  const {
    x, y,
  } = tilePosition(position)
  const drag = useDragTile<HTMLDivElement>({ id, updateDrag, commit, rollback, size: position });
  const [size, updateSize] = React.useState<{ width: number; height: number }>();
  const initialSize = React.useMemo(() => ({
    width: position.colSpan * (TILE_SIZE + TILE_GAP) - TILE_GAP,
    height: position.rowSpan * (TILE_SIZE + TILE_GAP) - TILE_GAP
  }), [position.colSpan, position.rowSpan])
  const handleMouseDown = React.useCallback((ev: React.MouseEvent<{}>) => {
    ev.preventDefault();
    updateSize(initialSize);
    const handleMouseMove = handleResizing<MouseEvent>({
      id,
      getOffset: ev => ev,
      origin: { x: ev.clientX, y: ev.clientY },
      updateSize,
      resizeTile,
      initialSize,
      preAction: () => {},
    });
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", function handleMouseup(ev) {
      commit();
      window.removeEventListener("mouseup", handleMouseup)
      window.removeEventListener("mousemove", handleMouseMove)
      updateSize(undefined);
    })
  }, [id, initialSize, updateSize, commit, resizeTile])
  const handleTouchStart = React.useCallback((ev: React.TouchEvent<{}>) => {
    if (ev.touches.length === 1) {
      ev.preventDefault();
      ev.stopPropagation();
      const t = ev.touches[0];
      updateSize(initialSize);
      const handleTouchMove = handleResizing<TouchEvent>({
        preAction: ev => ev.preventDefault(),
        id,
        getOffset: ev => ev.touches.length === 1 && ev.touches[0],
        origin: { x: t.clientX, y: t.clientY },
        updateSize,
        resizeTile,
        initialSize
      })
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", function handleTouchend(ev) {
        commit();
        window.removeEventListener("touchend", handleTouchend)
        window.removeEventListener("touchmove", handleTouchMove)
        updateSize(undefined);
      })
    }
  }, [id, initialSize, updateSize, commit, resizeTile])
 
  return (
    <>
      {
        size && 
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: position.colSpan * (TILE_SIZE + TILE_GAP) - TILE_GAP,
            height: position.rowSpan * (TILE_SIZE + TILE_GAP) - TILE_GAP,
            willChange: "width, height, left, top",
            backgroundColor: "rgba(108,108,108,.75)",
          }}
        />
      }
      <div
        style={{
          willChange: "width, height, left, top",
          left: x,
          top: y,
          width: size ? size.width : position.colSpan * (TILE_SIZE + TILE_GAP) - TILE_GAP,
          height: size ? size.height : position.rowSpan * (TILE_SIZE + TILE_GAP) - TILE_GAP,
         ...style
        }}
        className="TilePaper"
        ref={drag}
      >
        { id }
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="TileResizeHandle"
        />
      </div>
    </>
  )
}

interface ItemProps extends DragTileOptions {
  style?: React.CSSProperties;
}

const Item: React.FC<ItemProps> = ({
  id,
  updateDrag,
  commit,
  rollback,
  size,
  style
}) => {
  const drag = useDragTile<HTMLDivElement>({ id, updateDrag, commit, rollback, size });
  return (
    <div
      className="Item"
      style={{
        boxSizing: "border-box",
        borderWidth: 1,
        borderColor: "#cecece",
        borderStyle: "solid",
        padding: 16,
        cursor: "grab",
        ...style
      }}
      ref={drag}
    >
      ItemSource 
      row: {size.rowSpan}
      col: {size.colSpan}
    </div>
  )
}

export default App;
