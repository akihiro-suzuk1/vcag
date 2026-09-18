import { describe, it, expect } from "vitest";
import {
  computeLabelPlacements,
  computePixelLabelPlacements,
} from "../labelPlacement";

describe("computeLabelPlacements", () => {
  it("点がすべて異なれば上側の既定位置になる", () => {
    const result = computeLabelPlacements(
      [
        [1, 2],
        [3, 4],
      ],
      2
    );

    expect(result).toEqual([
      { textposition: "top center", mapDirection: "top", mapOffset: [0, -28] },
      { textposition: "top center", mapDirection: "top", mapOffset: [0, -28] },
    ]);
  });

  it("同じ座標の2点は上と下に分かれる", () => {
    const result = computeLabelPlacements(
      [
        [1, 2],
        [1, 2],
      ],
      2
    );

    expect(result.map((p) => p.textposition)).toEqual([
      "top center",
      "bottom center",
    ]);
    expect(result[0].mapDirection).toBe("center");
    expect(result[1].mapDirection).toBe("center");
    const [x0, y0] = result[0].mapOffset;
    const [x1, y1] = result[1].mapOffset;
    expect(Math.hypot(x0 - x1, y0 - y1)).toBeGreaterThan(60);
  });

  it("同じ座標の3点は上・下・右に分かれる", () => {
    const result = computeLabelPlacements(
      [
        [5, 5],
        [5, 5],
        [5, 5],
      ],
      2
    );

    expect(result.map((p) => p.textposition)).toEqual([
      "top center",
      "bottom center",
      "middle right",
    ]);
    const offsets = result.map((p) => p.mapOffset);
    expect(Math.hypot(offsets[0][0] - offsets[1][0], offsets[0][1] - offsets[1][1])).toBeGreaterThan(50);
    expect(Math.hypot(offsets[1][0] - offsets[2][0], offsets[1][1] - offsets[2][1])).toBeGreaterThan(50);
    expect(Math.hypot(offsets[2][0] - offsets[0][0], offsets[2][1] - offsets[0][1])).toBeGreaterThan(50);
  });

  it("間に別の点があっても同じ座標は同じグループとしてずらす", () => {
    const result = computeLabelPlacements(
      [
        [1, 1],
        [9, 9],
        [1, 1],
      ],
      2
    );

    expect(result[0].textposition).toBe("top center");
    expect(result[1].textposition).toBe("top center");
    expect(result[2].textposition).toBe("bottom center");
  });

  it("2D では z が違っても x,y が同じなら重ねてずらす", () => {
    const result = computeLabelPlacements(
      [
        [1, 2, 3],
        [1, 2, 9],
      ],
      2
    );

    expect(result.map((p) => p.textposition)).toEqual([
      "top center",
      "bottom center",
    ]);
  });

  it("同じ座標の4点のマップラベルは互いに十分離れる", () => {
    const result = computeLabelPlacements(
      [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      2
    );

    for (let i = 0; i < result.length; i++) {
      expect(result[i].mapDirection).toBe("center");
      for (let j = i + 1; j < result.length; j++) {
        const [x0, y0] = result[i].mapOffset;
        const [x1, y1] = result[j].mapOffset;
        expect(Math.hypot(x0 - x1, y0 - y1)).toBeGreaterThan(50);
      }
    }
  });

  it("3D では z が違う点は別の点としてずらさない", () => {
    const result = computeLabelPlacements(
      [
        [1, 2, 3],
        [1, 2, 9],
      ],
      3
    );

    expect(result.map((p) => p.textposition)).toEqual([
      "top center",
      "top center",
    ]);
  });
});

describe("computePixelLabelPlacements", () => {
  it("離れた点はどちらも真上の既定位置になる", () => {
    const result = computePixelLabelPlacements([
      { x: 0, y: 0 },
      { x: 200, y: 0 },
    ]);

    expect(result).toEqual([
      { mapDirection: "top", mapOffset: [0, -28] },
      { mapDirection: "top", mapOffset: [0, -28] },
    ]);
  });

  it("近くの2点のラベル座標は十分離れる", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
    ];
    const result = computePixelLabelPlacements(points);
    const l0 = {
      x: points[0].x + result[0].mapOffset[0],
      y: points[0].y + result[0].mapOffset[1],
    };
    const l1 = {
      x: points[1].x + result[1].mapOffset[0],
      y: points[1].y + result[1].mapOffset[1],
    };

    expect(result[0].mapDirection).toBe("center");
    expect(result[1].mapDirection).toBe("center");
    expect(Math.hypot(l0.x - l1.x, l0.y - l1.y)).toBeGreaterThan(50);
  });
});
