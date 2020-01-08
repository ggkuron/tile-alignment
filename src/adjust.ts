
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
function* takeStrategy(dir: StrategyOrder, rootCall: boolean): Generator<[StrategyOrder, Strategy]> {
    /*eslint no-fallthrough: ["error", { "commentPattern": "fallthrough" }]*/
    switch (dir) {
        case StrategyOrder.First:
            yield [StrategyOrder.First, s => t => ({ x: 0, y: s.y - t.rowSpan - t.y })]; // 1. 上
            // fallthrough
        case StrategyOrder.Sencod:
            yield [StrategyOrder.Sencod, s => t => ({ y: 0, x: s.x - t.colSpan - t.x })]; // 2. 左
            if(!rootCall) break;
            // fallthrough 
        case StrategyOrder.Last:
             yield [StrategyOrder.Last, s => t => ({ x: 0, y: s.y + s.rowSpan - t.y })];  // 3. 下
            // fallthrough
    }
}

export function adjust(
    fixed: Tiles,
    [currentId, current]: [string, Tile],
    others: Tiles,
    strategy: StrategyOrder = StrategyOrder.First,
    rootCall: boolean = true,
): [boolean, Differences, Tiles] {
    const {
        overwrapped,
        rest
    } = overwrap([currentId, current], others);

    const fixed_ = { ...fixed, [currentId]: current };
    if (Object.keys(overwrapped).length === 0) return [true, {}, fixed_ ];

    return overwrapped.reduce<[boolean, Differences, Tiles]>(
        (acm, [k, o]) => {
            const [applicable, diffs, fixed] = acm;
            if (!applicable) return acm;

            return Array.from(takeStrategy(strategy, rootCall)).reduce<[boolean, Differences, Tiles]>(
                (acm, [strategy, action]) => {
                    const [resolved, diffs, fixed] = acm;
                    if (resolved) return acm;

                    const movedResult = (
                        function getMovedPoint(t: Tile, diff: Diff): [Tile, Diff] | null {
                            const moved = addDiff(o, diff);
                            if (moved.x < 0 || moved.y < 0) return null;
                            const { overwrapped: fixedOverwaps } = overwrap([k, moved], fixed);
                            if (fixedOverwaps.length > 0) {
                                if (strategy === StrategyOrder.Last) {
                                    const fo = fixedOverwaps[0][1];
                                    const diff_ = action(fo)(o);
                                    return getMovedPoint(addDiff(moved, diff_), diff_)
                                } else return null;
                            } else return [moved, diff]
                        }
                    )(current, action(current)(o))

                    if(!movedResult) return acm;
                    const [moved, diff] = movedResult;

                    const adjusted = adjust(
                        fixed,
                        [k, moved],
                        rest,
                        strategy,
                        false
                    );

                    if (!adjusted[0]) return acm;

                    return [
                        true,
                        { /// 重複していた場合後ろの解決方法が最終的な結果
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
    overwrapped: [string, Tile][];
    rest: Tiles;
}
interface OverwrapIntermediate {
    overwrapped: Tiles;
    rest: Tiles;
}

export function overwrap(source: [string, Tile], others: Tiles): OverwrapResult {
    const r = Object.keys(others).reduce<OverwrapIntermediate>(
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
    return {
        overwrapped: Object.keys(r.overwrapped)
            .map<[string, Tile]>(k => [k, r.overwrapped[k]])
            .sort((a, b) => (
                a[1].y === b[1].y ?
                    a[1].x - b[1].x :
                    a[1].y - b[1].y
            )),
        rest: r.rest
    };
}
export function isOverwrap(s: Tile, t: Tile): boolean {
   return (
       s.x < t.x + t.colSpan 
       && t.x < s.x + s.colSpan
       && s.y < t.y + t.rowSpan
       && t.y < s.y + s.rowSpan
   );
}


