import svgpath from "svgpath";

/** ベジェ曲線の補間分割数 */
const CURVE_SEGMENTS = 8;

/**
 * 3次ベジェ曲線上の点を返す。
 * B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
 */
function cubicBezier(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number]
): [number, number] {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;
  return [
    uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
    uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1],
  ];
}

/**
 * 2次ベジェ曲線上の点を返す。
 * B(t) = (1-t)^2*P0 + 2(1-t)*t*P1 + t^2*P2
 */
function quadBezier(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number]
): [number, number] {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return [
    uu * p0[0] + 2 * u * t * p1[0] + tt * p2[0],
    uu * p0[1] + 2 * u * t * p1[1] + tt * p2[1],
  ];
}

/**
 * ベジェ補間点を生成する（t=0 は含めず t=1/N 〜 t=1 の N 点）。
 */
function interpolateCubic(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number]
): number[][] {
  const points: number[][] = [];
  for (let i = 1; i <= CURVE_SEGMENTS; i++) {
    const t = i / CURVE_SEGMENTS;
    points.push(cubicBezier(t, p0, p1, p2, p3));
  }
  return points;
}

function interpolateQuad(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number]
): number[][] {
  const points: number[][] = [];
  for (let i = 1; i <= CURVE_SEGMENTS; i++) {
    const t = i / CURVE_SEGMENTS;
    points.push(quadBezier(t, p0, p1, p2));
  }
  return points;
}

/**
 * SVG path の d 属性文字列をパースし、座標の配列を返す。
 * 直線コマンド (M/L/H/V) は端点のみ、曲線コマンド (C/Q/A) は
 * CURVE_SEGMENTS 分割の補間点を生成する。
 * 不正入力時は空配列を返す（例外を投げない）。
 */
export function parseSvgPath(d: string): number[][] {
  if (!d.trim()) {
    return [];
  }

  try {
    const points: number[][] = [];

    svgpath(d)
      .abs()
      .unshort()
      .unarc()
      .iterate((segment, _index, x, y) => {
        const cmd = segment[0];
        switch (cmd) {
          case "M":
          case "L":
            points.push([segment[1], segment[2]]);
            break;
          case "H":
            points.push([segment[1], y]);
            break;
          case "V":
            points.push([x, segment[1]]);
            break;
          case "C":
            points.push(
              ...interpolateCubic(
                [x, y],
                [segment[1], segment[2]],
                [segment[3], segment[4]],
                [segment[5], segment[6]]
              )
            );
            break;
          case "Q":
            points.push(
              ...interpolateQuad(
                [x, y],
                [segment[1], segment[2]],
                [segment[3], segment[4]]
              )
            );
            break;
          case "Z":
            break;
        }
      });

    return points;
  } catch {
    return [];
  }
}
