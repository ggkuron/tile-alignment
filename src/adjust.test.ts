import * as jest from "jest"
import {
    adjust,
    isOverwrap,
    overwrap,
} from './adjust'

describe('overwrap', () => {
    test('isOverwrap', () => {
        expect(isOverwrap(
            { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
            { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
        )).toBe(true);
        expect(isOverwrap(
            { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
            { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
        )).toBe(false);
        expect(isOverwrap(
            { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
            { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
        )).toBe(false);
        expect(isOverwrap(
            { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
            { x: 1, y: 1, rowSpan: 2, colSpan: 2 },
        )).toBe(true);
        expect(isOverwrap(
            { x: 1, y: 1, rowSpan: 2, colSpan: 2 },
            { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
        )).toBe(true);
        expect(isOverwrap(
            { x: 1, y: 1, rowSpan: 1, colSpan: 1 },
            { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
        )).toBe(false);
        expect(isOverwrap(
            { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
            { x: 1, y: 1, rowSpan: 1, colSpan: 1 },
        )).toBe(false);
    });
    test('overwrap', () => {
        expect(
            overwrap(
                ["1", { x: 0, y: 0, rowSpan: 2, colSpan: 2 }],
                {
                    0: { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
                }
            )
        ).toEqual({
            overwrapped: {
                0: { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
            },
            rest: {
            }
        })

        expect(
            overwrap(
                ["1", { x: 0, y: 0, rowSpan: 2, colSpan: 2 }],
                {
                    0: { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
                }
            )
        ).toEqual({
            overwrapped: {
            },
            rest: {
                0: { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
            }
        })

        expect(
            overwrap(
                ["1", { x: 2, y: 2, rowSpan: 2, colSpan: 2 }],
                {
                    0: { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
                }
            )
        ).toEqual({
            overwrapped: {
            },
            rest: {
                0: { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
            }
        })

    })

})

describe('adjust', () => {
    test('move', () => {
        expect(adjust(
            {},
            ["1", { x: 0, y: 0, rowSpan: 2, colSpan: 2 }],
            {}
        )).toEqual([
            true,
            {},
            {
                1: { x: 0, y: 0, rowSpan: 2, colSpan: 2 }
            }
        ]);

        expect(adjust(
            {},
            [ "1", { x: 0, y: 0, rowSpan: 2, colSpan: 2 }],
            {
                0: { x: 0, y: 0, rowSpan: 2, colSpan: 2 }
            }
        )).toEqual([
            true,
            {
                0: { x: 0, y: 2 }
            },
            {
                1: { x: 0, y: 0, rowSpan: 2, colSpan: 2 },
                0: {
                    x: 0, y: 2,
                    colSpan: 2,
                    rowSpan: 2,
                }
            }
        ]);
        expect(adjust(
            {},
            ["1", { x: 1, y: 1, rowSpan: 2, colSpan: 2 }],
            {
                0: { x: 2, y: 2, rowSpan: 2, colSpan: 2 }
            }
        )).toEqual([
            true,
            {
                0: { x: 0, y: 1 }
            },
            {
                1: { x: 1, y: 1, rowSpan: 2, colSpan: 2 },
                0: {
                    x: 2, y: 3,
                    colSpan: 2,
                    rowSpan: 2,
                }
            }
        ]);
        expect(adjust(
            {},
            ["1", { x: 2, y: 2, rowSpan: 2, colSpan: 2 }],
            {
                0: { x: 2, y: 2, rowSpan: 2, colSpan: 2 }
            }
        )).toEqual([
            true,
            {
                0: { x: 0, y: -2 }
            },
            {
                1: { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
                0: {
                    x: 2, y: 0,
                    colSpan: 2,
                    rowSpan: 2,
                }
            }
        ]);
        expect(adjust(
            {},
            ["2", { x: 2, y: 2, rowSpan: 2, colSpan: 2 }],
            {
                0: { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
                1: { x: 2, y: 0, rowSpan: 2, colSpan: 2 },
            }
        )).toEqual([
            true,
            {
                0: { x: 0, y: -2 },
                1: { x: -2, y: 0 }
            },
            {
                0: {
                    x: 2, y: 0,
                    colSpan: 2,
                    rowSpan: 2,
                },
                1: {
                    x: 0, y: 0,
                    colSpan: 2,
                    rowSpan: 2,
                },
                2: { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
            }
        ]);
    });
    test('split', () => {
        expect(adjust(
            {},
            ["2", { x: 3, y: 3, rowSpan: 2, colSpan: 2 }],
            {
                0: { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
                1: { x: 2, y: 3, rowSpan: 2, colSpan: 2 },
            }
        )).toEqual([true,
            {
                0: { x: 0, y: -1 },
                1: { x: -1, y: 0 }
            },
            {
                2: { x: 3, y: 3, rowSpan: 2, colSpan: 2 },
                0: { x: 2, y: 1, rowSpan: 2, colSpan: 2 },
                1: { x: 1, y: 3, rowSpan: 2, colSpan: 2 },
            }
        ]);
        expect(adjust(
            {},
            ["2", { x: 1, y: 3, rowSpan: 2, colSpan: 2 }],
            {
                0: { x: 0, y: 2, rowSpan: 2, colSpan: 2 },
                1: { x: 0, y: 3, rowSpan: 2, colSpan: 2 },
            }
        )).toEqual([true,
            {
                0: { x: 0, y: -1 },
                1: { x: 0, y: 2 }
            },
            {
                2: { x: 1, y: 3, rowSpan: 2, colSpan: 2 },
                0: { x: 0, y: 1, rowSpan: 2, colSpan: 2 },
                1: { x: 0, y: 5, rowSpan: 2, colSpan: 2 },
            }
        ]);
        expect(adjust(
            {},
            ["tile-2", { rowSpan: 3, colSpan: 2, x: 2, y: 2 }], 
            {
                "tile-0": {
                    rowSpan: 3,
                    colSpan: 3,
                    x: 0,
                    y: 4
                },
                "tile-1": {
                    rowSpan: 4,
                    colSpan: 3,
                    x: 0,
                    y: 0
                },
                "tile-2": {
                    rowSpan: 3,
                    colSpan: 2,
                    x: 3,
                    y: 2
                }
            }
        )).toEqual([
            true,
            {},
            {}
        ])

    })



    // test('100tiles', () => {
    //     expect(adjust(
    //         {},
    //         ["origin", { x: 3, y: 100, rowSpan: 2, colSpan: 2 }],
    //         {
    //             0: { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
    //             1: { x: 2, y: 3, rowSpan: 2, colSpan: 2 },
    //             2: { x: 2, y: 4, rowSpan: 2, colSpan: 2 },
    //             3: { x: 2, y: 5, rowSpan: 2, colSpan: 2 },
    //             4: { x: 2, y: 6, rowSpan: 2, colSpan: 2 },
    //             5: { x: 2, y: 7, rowSpan: 2, colSpan: 2 },
    //             6: { x: 2, y: 8, rowSpan: 2, colSpan: 2 },
    //             7: { x: 2, y: 9, rowSpan: 2, colSpan: 2 },
    //             8: { x: 2, y: 10, rowSpan: 2, colSpan: 2 },"{
 
    //             9: { x: 2, y: 11, rowSpan: 2, colSpan: 2 },
    //             10: { x: 2, y: 12, rowSpan: 2, colSpan: 2 },
    //             11: { x: 2, y: 13, rowSpan: 2, colSpan: 2 },
    //             12: { x: 2, y: 14, rowSpan: 2, colSpan: 2 },
    //             13: { x: 2, y: 15, rowSpan: 2, colSpan: 2 },
    //             14: { x: 2, y: 16, rowSpan: 2, colSpan: 2 },
    //             15: { x: 2, y: 17, rowSpan: 2, colSpan: 2 },
    //             16: { x: 2, y: 18, rowSpan: 2, colSpan: 2 },
    //             17: { x: 2, y: 19, rowSpan: 2, colSpan: 2 },
    //             18: { x: 2, y: 20, rowSpan: 2, colSpan: 2 },
    //             19: { x: 2, y: 21, rowSpan: 2, colSpan: 2 },
    //             20: { x: 2, y: 22, rowSpan: 2, colSpan: 2 },
    //             21: { x: 2, y: 23, rowSpan: 2, colSpan: 2 },
    //             22: { x: 2, y: 24, rowSpan: 2, colSpan: 2 },
    //             23: { x: 2, y: 25, rowSpan: 2, colSpan: 2 },
    //             24: { x: 2, y: 26, rowSpan: 2, colSpan: 2 },
    //             25: { x: 2, y: 27, rowSpan: 2, colSpan: 2 },
    //             26: { x: 2, y: 28, rowSpan: 2, colSpan: 2 },
    //             27: { x: 2, y: 29, rowSpan: 2, colSpan: 2 },
    //             28: { x: 2, y: 30, rowSpan: 2, colSpan: 2 },
    //             29: { x: 2, y: 31, rowSpan: 2, colSpan: 2 },
    //             30: { x: 2, y: 32, rowSpan: 2, colSpan: 2 },
    //             31: { x: 2, y: 33, rowSpan: 2, colSpan: 2 },
    //             32: { x: 2, y: 34, rowSpan: 2, colSpan: 2 },
    //             33: { x: 2, y: 35, rowSpan: 2, colSpan: 2 },
    //             34: { x: 2, y: 36, rowSpan: 2, colSpan: 2 },
    //             35: { x: 2, y: 37, rowSpan: 2, colSpan: 2 },
    //             36: { x: 2, y: 38, rowSpan: 2, colSpan: 2 },
    //             37: { x: 2, y: 39, rowSpan: 2, colSpan: 2 },
    //             38: { x: 2, y: 40, rowSpan: 2, colSpan: 2 },
    //             39: { x: 2, y: 41, rowSpan: 2, colSpan: 2 },
    //             40: { x: 2, y: 42, rowSpan: 2, colSpan: 2 },
    //             41: { x: 2, y: 43, rowSpan: 2, colSpan: 2 },
    //             42: { x: 2, y: 44, rowSpan: 2, colSpan: 2 },
    //             43: { x: 2, y: 45, rowSpan: 2, colSpan: 2 },
    //             44: { x: 2, y: 46, rowSpan: 2, colSpan: 2 },
    //             45: { x: 2, y: 47, rowSpan: 2, colSpan: 2 },
    //             46: { x: 2, y: 48, rowSpan: 2, colSpan: 2 },
    //             47: { x: 2, y: 49, rowSpan: 2, colSpan: 2 },
    //             48: { x: 2, y: 50, rowSpan: 2, colSpan: 2 },
    //             49: { x: 2, y: 51, rowSpan: 2, colSpan: 2 },
    //             50: { x: 2, y: 52, rowSpan: 2, colSpan: 2 },
    //             51: { x: 2, y: 53, rowSpan: 2, colSpan: 2 },
    //             52: { x: 2, y: 54, rowSpan: 2, colSpan: 2 },
    //             53: { x: 2, y: 55, rowSpan: 2, colSpan: 2 },
    //             54: { x: 2, y: 56, rowSpan: 2, colSpan: 2 },
    //             55: { x: 2, y: 57, rowSpan: 2, colSpan: 2 },
    //             56: { x: 2, y: 58, rowSpan: 2, colSpan: 2 },
    //             57: { x: 2, y: 59, rowSpan: 2, colSpan: 2 },
    //             58: { x: 2, y: 60, rowSpan: 2, colSpan: 2 },
    //             59: { x: 2, y: 61, rowSpan: 2, colSpan: 2 },
    //             60: { x: 2, y: 62, rowSpan: 2, colSpan: 2 },
    //             61: { x: 2, y: 63, rowSpan: 2, colSpan: 2 },
    //             62: { x: 2, y: 64, rowSpan: 2, colSpan: 2 },
    //             63: { x: 2, y: 65, rowSpan: 2, colSpan: 2 },
    //             64: { x: 2, y: 66, rowSpan: 2, colSpan: 2 },
    //             65: { x: 2, y: 67, rowSpan: 2, colSpan: 2 },
    //             66: { x: 2, y: 68, rowSpan: 2, colSpan: 2 },
    //             67: { x: 2, y: 69, rowSpan: 2, colSpan: 2 },
    //             68: { x: 2, y: 70, rowSpan: 2, colSpan: 2 },
    //             69: { x: 2, y: 71, rowSpan: 2, colSpan: 2 },
    //             70: { x: 2, y: 72, rowSpan: 2, colSpan: 2 },
    //             71: { x: 2, y: 73, rowSpan: 2, colSpan: 2 },
    //             72: { x: 2, y: 74, rowSpan: 2, colSpan: 2 },
    //             73: { x: 2, y: 75, rowSpan: 2, colSpan: 2 },
    //             74: { x: 2, y: 76, rowSpan: 2, colSpan: 2 },
    //             75: { x: 2, y: 77, rowSpan: 2, colSpan: 2 },
    //             76: { x: 2, y: 78, rowSpan: 2, colSpan: 2 },
    //             77: { x: 2, y: 79, rowSpan: 2, colSpan: 2 },
    //             78: { x: 2, y: 80, rowSpan: 2, colSpan: 2 },
    //             79: { x: 2, y: 81, rowSpan: 2, colSpan: 2 },
    //             80: { x: 2, y: 82, rowSpan: 2, colSpan: 2 },
    //             81: { x: 2, y: 83, rowSpan: 2, colSpan: 2 },
    //             82: { x: 2, y: 84, rowSpan: 2, colSpan: 2 },
    //             83: { x: 2, y: 85, rowSpan: 2, colSpan: 2 },
    //             84: { x: 2, y: 86, rowSpan: 2, colSpan: 2 },
    //             85: { x: 2, y: 87, rowSpan: 2, colSpan: 2 },
    //             86: { x: 2, y: 88, rowSpan: 2, colSpan: 2 },
    //             87: { x: 2, y: 89, rowSpan: 2, colSpan: 2 },
    //             88: { x: 2, y: 90, rowSpan: 2, colSpan: 2 },
    //             89: { x: 2, y: 91, rowSpan: 2, colSpan: 2 },
    //             90: { x: 2, y: 92, rowSpan: 2, colSpan: 2 },
    //             91: { x: 2, y: 93, rowSpan: 2, colSpan: 2 },
    //             92: { x: 2, y: 94, rowSpan: 2, colSpan: 2 },
    //             93: { x: 2, y: 95, rowSpan: 2, colSpan: 2 },
    //             94: { x: 2, y: 96, rowSpan: 2, colSpan: 2 },
    //             95: { x: 2, y: 97, rowSpan: 2, colSpan: 2 },
    //             96: { x: 2, y: 98, rowSpan: 2, colSpan: 2 },
    //             97: { x: 2, y: 99, rowSpan: 2, colSpan: 2 },
    //             98: { x: 2, y: 100, rowSpan: 2, colSpan: 2 },
    //             99: { x: 2, y: 101, rowSpan: 2, colSpan: 2 },
    //         }
    //     )).toEqual([
    //         true,
    //         {
    //             0: { x: 2, y: -1 },
    //             1: { x: 2, y: -1 },
    //             2: { x: 2, y: -1 },
    //             3: { x: 2, y: -1 },
    //             4: { x: 2, y: -1 },
    //             5: { x: 2, y: -1 },
    //             6: { x: 2, y: -1 },
    //             7: { x: 2, y: -1 },
    //             8: { x: 2, y: -1 },
    //             9: { x: 2, y: -1 },
    //             10: { x: 2, y: -1 },
    //             11: { x: 2, y: -1 },
    //             12: { x: 2, y: -1 },
    //             13: { x: 2, y: -1 },
    //             14: { x: 2, y: -1 },
    //             15: { x: 2, y: -1 },
    //             16: { x: 2, y: -1 },
    //             17: { x: 2, y: -1 },
    //             18: { x: 2, y: -1 },
    //             19: { x: 2, y: -1 },
    //             20: { x: 2, y: -1 },
    //             21: { x: 2, y: -1 },
    //             22: { x: 2, y: -1 },
    //             23: { x: 2, y: -1 },
    //             24: { x: 2, y: -1 },
    //             25: { x: 2, y: -1 },
    //             26: { x: 2, y: -1 },
    //             27: { x: 2, y: -1 },
    //             28: { x: 2, y: -1 },
    //             29: { x: 2, y: -1 },
    //             30: { x: 2, y: -1 },
    //             31: { x: 2, y: -1 },
    //             32: { x: 2, y: -1 },
    //             33: { x: 2, y: -1 },
    //             34: { x: 2, y: -1 },
    //             35: { x: 2, y: -1 },
    //             36: { x: 2, y: -1 },
    //             37: { x: 2, y: -1 },
    //             38: { x: 2, y: -1 },
    //             39: { x: 2, y: -1 },
    //             40: { x: 2, y: -1 },
    //             41: { x: 2, y: -1 },
    //             42: { x: 2, y: -1 },
    //             43: { x: 2, y: -1 },
    //             44: { x: 2, y: -1 },
    //             45: { x: 2, y: -1 },
    //             46: { x: 2, y: -1 },
    //             47: { x: 2, y: -1 },
    //             48: { x: 2, y: -1 },
    //             49: { x: 2, y: -1 },
    //             50: { x: 2, y: -1 },
    //             51: { x: 2, y: -1 },
    //             52: { x: 2, y: -1 },
    //             53: { x: 2, y: -1 },
    //             54: { x: 2, y: -1 },
    //             55: { x: 2, y: -1 },
    //             56: { x: 2, y: -1 },
    //             57: { x: 2, y: -1 },
    //             58: { x: 2, y: -1 },
    //             59: { x: 2, y: -1 },
    //             60: { x: 2, y: -1 },
    //             61: { x: 2, y: -1 },
    //             62: { x: 2, y: -1 },
    //             63: { x: 2, y: -1 },
    //             64: { x: 2, y: -1 },
    //             65: { x: 2, y: -1 },
    //             66: { x: 2, y: -1 },
    //             67: { x: 2, y: -1 },
    //             68: { x: 2, y: -1 },
    //             69: { x: 2, y: -1 },
    //             70: { x: 2, y: -1 },
    //             71: { x: 2, y: -1 },
    //             72: { x: 2, y: -1 },
    //             73: { x: 2, y: -1 },
    //             74: { x: 2, y: -1 },
    //             75: { x: 2, y: -1 },
    //             76: { x: 2, y: -1 },
    //             77: { x: 2, y: -1 },
    //             78: { x: 2, y: -1 },
    //             79: { x: 2, y: -1 },
    //             80: { x: 2, y: -1 },
    //             81: { x: 2, y: -1 },
    //             82: { x: 2, y: -1 },
    //             83: { x: 2, y: -1 },
    //             84: { x: 2, y: -1 },
    //             85: { x: 2, y: -1 },
    //             86: { x: 2, y: -1 },
    //             87: { x: 2, y: -1 },
    //             88: { x: 2, y: -1 },
    //             89: { x: 2, y: -1 },
    //             90: { x: 2, y: -1 },
    //             91: { x: 2, y: -1 },
    //             92: { x: 2, y: -1 },
    //             93: { x: 2, y: -1 },
    //             94: { x: 2, y: -1 },
    //             95: { x: 2, y: -1 },
    //             96: { x: 2, y: -1 },
    //             97: { x: 2, y: -1 },
    //             98: { x: 2, y: -1 },
    //             99: { x: 2, y: -1 },
    //         },
    //         {
    //             0: { x: 2, y: 1, rowSpan: 2, colSpan: 2 },
    //             1: { x: 2, y: 2, rowSpan: 2, colSpan: 2 },
    //             2: { x: 2, y: 3, rowSpan: 2, colSpan: 2 },
    //             3: { x: 2, y: 4, rowSpan: 2, colSpan: 2 },
    //             4: { x: 2, y: 5, rowSpan: 2, colSpan: 2 },
    //             5: { x: 2, y: 6, rowSpan: 2, colSpan: 2 },
    //             6: { x: 2, y: 7, rowSpan: 2, colSpan: 2 },
    //             7: { x: 2, y: 8, rowSpan: 2, colSpan: 2 },
    //             8: { x: 2, y: 9, rowSpan: 2, colSpan: 2 },
    //             9: { x: 2, y: 10, rowSpan: 2, colSpan: 2 },
    //             10: { x: 2, y: 11, rowSpan: 2, colSpan: 2 },
    //             11: { x: 2, y: 12, rowSpan: 2, colSpan: 2 },
    //             12: { x: 2, y: 13, rowSpan: 2, colSpan: 2 },
    //             13: { x: 2, y: 14, rowSpan: 2, colSpan: 2 },
    //             14: { x: 2, y: 15, rowSpan: 2, colSpan: 2 },
    //             15: { x: 2, y: 16, rowSpan: 2, colSpan: 2 },
    //             16: { x: 2, y: 17, rowSpan: 2, colSpan: 2 },
    //             17: { x: 2, y: 18, rowSpan: 2, colSpan: 2 },
    //             18: { x: 2, y: 19, rowSpan: 2, colSpan: 2 },
    //             19: { x: 2, y: 20, rowSpan: 2, colSpan: 2 },
    //             20: { x: 2, y: 21, rowSpan: 2, colSpan: 2 },
    //             21: { x: 2, y: 22, rowSpan: 2, colSpan: 2 },
    //             22: { x: 2, y: 23, rowSpan: 2, colSpan: 2 },
    //             23: { x: 2, y: 24, rowSpan: 2, colSpan: 2 },
    //             24: { x: 2, y: 25, rowSpan: 2, colSpan: 2 },
    //             25: { x: 2, y: 26, rowSpan: 2, colSpan: 2 },
    //             26: { x: 2, y: 27, rowSpan: 2, colSpan: 2 },
    //             27: { x: 2, y: 28, rowSpan: 2, colSpan: 2 },
    //             28: { x: 2, y: 29, rowSpan: 2, colSpan: 2 },
    //             29: { x: 2, y: 30, rowSpan: 2, colSpan: 2 },
    //             30: { x: 2, y: 31, rowSpan: 2, colSpan: 2 },
    //             31: { x: 2, y: 32, rowSpan: 2, colSpan: 2 },
    //             32: { x: 2, y: 33, rowSpan: 2, colSpan: 2 },
    //             33: { x: 2, y: 34, rowSpan: 2, colSpan: 2 },
    //             34: { x: 2, y: 35, rowSpan: 2, colSpan: 2 },
    //             35: { x: 2, y: 36, rowSpan: 2, colSpan: 2 },
    //             36: { x: 2, y: 37, rowSpan: 2, colSpan: 2 },
    //             37: { x: 2, y: 38, rowSpan: 2, colSpan: 2 },
    //             38: { x: 2, y: 39, rowSpan: 2, colSpan: 2 },
    //             39: { x: 2, y: 40, rowSpan: 2, colSpan: 2 },
    //             40: { x: 2, y: 41, rowSpan: 2, colSpan: 2 },
    //             41: { x: 2, y: 42, rowSpan: 2, colSpan: 2 },
    //             42: { x: 2, y: 43, rowSpan: 2, colSpan: 2 },
    //             43: { x: 2, y: 44, rowSpan: 2, colSpan: 2 },
    //             44: { x: 2, y: 45, rowSpan: 2, colSpan: 2 },
    //             45: { x: 2, y: 46, rowSpan: 2, colSpan: 2 },
    //             46: { x: 2, y: 47, rowSpan: 2, colSpan: 2 },
    //             47: { x: 2, y: 48, rowSpan: 2, colSpan: 2 },
    //             48: { x: 2, y: 49, rowSpan: 2, colSpan: 2 },
    //             49: { x: 2, y: 50, rowSpan: 2, colSpan: 2 },
    //             50: { x: 2, y: 51, rowSpan: 2, colSpan: 2 },
    //             51: { x: 2, y: 52, rowSpan: 2, colSpan: 2 },
    //             52: { x: 2, y: 53, rowSpan: 2, colSpan: 2 },
    //             53: { x: 2, y: 54, rowSpan: 2, colSpan: 2 },
    //             54: { x: 2, y: 55, rowSpan: 2, colSpan: 2 },
    //             55: { x: 2, y: 56, rowSpan: 2, colSpan: 2 },
    //             56: { x: 2, y: 57, rowSpan: 2, colSpan: 2 },
    //             57: { x: 2, y: 58, rowSpan: 2, colSpan: 2 },
    //             58: { x: 2, y: 59, rowSpan: 2, colSpan: 2 },
    //             59: { x: 2, y: 60, rowSpan: 2, colSpan: 2 },
    //             60: { x: 2, y: 61, rowSpan: 2, colSpan: 2 },
    //             61: { x: 2, y: 62, rowSpan: 2, colSpan: 2 },
    //             62: { x: 2, y: 63, rowSpan: 2, colSpan: 2 },
    //             63: { x: 2, y: 64, rowSpan: 2, colSpan: 2 },
    //             64: { x: 2, y: 65, rowSpan: 2, colSpan: 2 },
    //             65: { x: 2, y: 66, rowSpan: 2, colSpan: 2 },
    //             66: { x: 2, y: 67, rowSpan: 2, colSpan: 2 },
    //             67: { x: 2, y: 68, rowSpan: 2, colSpan: 2 },
    //             68: { x: 2, y: 69, rowSpan: 2, colSpan: 2 },
    //             69: { x: 2, y: 70, rowSpan: 2, colSpan: 2 },
    //             70: { x: 2, y: 71, rowSpan: 2, colSpan: 2 },
    //             71: { x: 2, y: 72, rowSpan: 2, colSpan: 2 },
    //             72: { x: 2, y: 73, rowSpan: 2, colSpan: 2 },
    //             73: { x: 2, y: 74, rowSpan: 2, colSpan: 2 },
    //             74: { x: 2, y: 75, rowSpan: 2, colSpan: 2 },
    //             75: { x: 2, y: 76, rowSpan: 2, colSpan: 2 },
    //             76: { x: 2, y: 77, rowSpan: 2, colSpan: 2 },
    //             77: { x: 2, y: 78, rowSpan: 2, colSpan: 2 },
    //             78: { x: 2, y: 79, rowSpan: 2, colSpan: 2 },
    //             79: { x: 2, y: 80, rowSpan: 2, colSpan: 2 },
    //             80: { x: 2, y: 81, rowSpan: 2, colSpan: 2 },
    //             81: { x: 2, y: 82, rowSpan: 2, colSpan: 2 },
    //             82: { x: 2, y: 83, rowSpan: 2, colSpan: 2 },
    //             83: { x: 2, y: 84, rowSpan: 2, colSpan: 2 },
    //             84: { x: 2, y: 85, rowSpan: 2, colSpan: 2 },
    //             85: { x: 2, y: 86, rowSpan: 2, colSpan: 2 },
    //             86: { x: 2, y: 87, rowSpan: 2, colSpan: 2 },
    //             87: { x: 2, y: 88, rowSpan: 2, colSpan: 2 },
    //             88: { x: 2, y: 89, rowSpan: 2, colSpan: 2 },
    //             89: { x: 2, y: 90, rowSpan: 2, colSpan: 2 },
    //             90: { x: 2, y: 91, rowSpan: 2, colSpan: 2 },
    //             91: { x: 2, y: 92, rowSpan: 2, colSpan: 2 },
    //             92: { x: 2, y: 93, rowSpan: 2, colSpan: 2 },
    //             93: { x: 2, y: 94, rowSpan: 2, colSpan: 2 },
    //             94: { x: 2, y: 95, rowSpan: 2, colSpan: 2 },
    //             95: { x: 2, y: 96, rowSpan: 2, colSpan: 2 },
    //             96: { x: 2, y: 97, rowSpan: 2, colSpan: 2 },
    //             97: { x: 2, y: 98, rowSpan: 2, colSpan: 2 },
    //             98: { x: 2, y: 99, rowSpan: 2, colSpan: 2 },
    //             99: { x: 2, y: 100, rowSpan: 2, colSpan: 2 },
    //         }
    //     ]);
    // })
})

