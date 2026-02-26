/**
 * テキストから座標情報を正規表現で抽出する。
 * 「数値,数値」「数値,数値,数値」のほか、
 * 「x:数値, y:数値」「x:数値, y:数値, z:数値」形式にも対応。
 */
export function extractCoordinates(text: string): number[][] {
  // 数値: 符号付き整数・小数・指数表記
  const num = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.source;

  const matches: { index: number; coords: number[] }[] = [];

  // パターン1: ラベル付き座標 (x:1.0, y:2.0 / x:1.0, y:2.0, z:3.0)
  const label = /[xyz]\s*:\s*/.source;
  const labeledPattern = new RegExp(
    `${label}(${num})\\s*,\\s*${label}(${num})(?:\\s*,\\s*${label}(${num}))?`,
    "g"
  );

  const consumedRanges: [number, number][] = [];

  let m;
  while ((m = labeledPattern.exec(text)) !== null) {
    const coord = [Number(m[1]), Number(m[2])];
    if (m[3] !== undefined) {
      coord.push(Number(m[3]));
    }
    matches.push({ index: m.index, coords: coord });
    consumedRanges.push([m.index, m.index + m[0].length]);
  }

  // パターン2: カンマ直結 (1,2 / 1,2,3)
  const tightPattern = new RegExp(`${num},${num}(?:,${num})?`, "g");
  while ((m = tightPattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const overlaps = consumedRanges.some(([s, e]) => start < e && end > s);
    if (overlaps) {
      continue;
    }
    matches.push({ index: start, coords: m[0].split(",").map(Number) });
  }

  // テキスト中の出現順にソート
  matches.sort((a, b) => a.index - b.index);
  return matches.map((entry) => entry.coords);
}
