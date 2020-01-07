
export interface Point {
    x: number;
    y: number;
}
export interface TileSize {
    rowSpan: number;
    colSpan: number;
}
export interface Tile extends Point, TileSize {
}
export interface Tiles {
    [id: string]: Tile
}

interface Diff {
    x: number;
    y: number;
}
export interface Differences {
    [id: string]: Diff
}
function addDiff(tile: Tile, diff: Diff): Tile {
    return {
        ...tile,
        x: tile.x + diff.x,
        y: tile.y + diff.y
    }
}

type Strategy = (s: Tile) => (t: Tile) => Diff;
enum StrategyOrder {
    First = 0,
    Sencod = 1,
    Last = 2
}
function* takeStrategy(dir: StrategyOrder): Generator<Strategy> {
    /*eslint no-fallthrough: ["error", { "commentPattern": "fallthrough" }]*/
    switch (dir) {
        case StrategyOrder.First:
            yield s => t => ({ x: 0, y: s.y - t.rowSpan - t.y }); // 1. 上
            // fallthrough
        case StrategyOrder.Sencod:
            yield s => t => ({ y: 0, x: s.x - t.colSpan - t.x }); // 2. 左
            // fallthrough 
        case StrategyOrder.Last:
            yield s => t => ({ x: 0, y: s.y + s.rowSpan - t.y });  // 3. 下
            // fallthrough
    }
}

export function adjust(
    fixed: Tiles,
    [currentId, current]: [string, Tile],
    others: Tiles,
    strategy: StrategyOrder = StrategyOrder.First 
): [boolean, Differences, Tiles] {
    const {
        overwrapped,
        rest
    } = overwrap([currentId, current], others);

    const fixed_ = { ...fixed, [currentId]: current };
    if (Object.keys(overwrapped).length === 0) return [true, {}, fixed_];

    return Object.keys(overwrapped).reduce<[boolean, Differences, Tiles]>(
        (acm, k) => {
            const [applicable, diffs, fixed] = acm;
            if (!applicable) return acm;

            const o = overwrapped[k];
            return Array.from(takeStrategy(strategy)).reduce<[boolean, Differences, Tiles]>(
                (acm, action, strategy) => {
                    const [resolved, diffs, fixed] = acm;
                    if (resolved) return acm;
                    let diff = action(current)(o);
                    let moved = addDiff(o, diff);
                    if (moved.x < 0 || moved.y < 0) return acm;

                    let fixedOverwaps = Object.keys(fixed).filter(k => isOverwrap(fixed[k], moved));
                    if (fixedOverwaps.length > 0) {
                        if (strategy === StrategyOrder.Last) {
                            do {
                                const fo = fixedOverwaps[0];
                                diff = action(fixed[fo])(o);
                                moved = addDiff(moved, diff);
                                fixedOverwaps = Object.keys(fixed).filter(k => isOverwrap(fixed[k], moved));
                            } while (fixedOverwaps.length > 0)
                        } else return acm;
                    }

                    const adjusted = adjust(
                        fixed,
                        [k, moved],
                        rest,
                        strategy
                    );

                    if (!adjusted[0]) return acm;
                    return [
                        true,
                        {
                            ...diffs,
                            ...adjusted[1],
                            [k]: diff,
                        },
                        adjusted[2],
                    ]
                },
                [false, diffs, fixed]
            );
        },
        [true, {}, fixed_]
    )
}

interface OverwrapResult {
    overwrapped: Tiles;
    rest: Tiles;
}

export function overwrap(source: [string, Tile], others: Tiles): OverwrapResult {
    return Object.keys(others).reduce<OverwrapResult>(
        (acm, k) => {
            const {
                overwrapped, 
                rest
            } = acm
            if(source[0] === k) return acm;
            const o = others[k];
            const r = isOverwrap(source[1], o);
            return {
                overwrapped: r? {
                    ...overwrapped,
                    [k]: o
                }: overwrapped,
                rest: r? rest: {
                    ...rest,
                    [k]: o
                }
            }
        },
        { overwrapped: {}, rest: {} }
    )
}
export function isOverwrap(s: Tile, t: Tile): boolean {
   return (
       s.x < t.x + t.colSpan 
       && t.x < s.x + s.colSpan
       && s.y < t.y + t.rowSpan
       && t.y < s.y + s.rowSpan
   );
}


