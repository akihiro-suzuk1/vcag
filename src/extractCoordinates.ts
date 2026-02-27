/**
 * テキストから座標情報を正規表現で抽出する。
 * 「数値,数値」「数値,数値,数値」のほか、
 * 「x:数値, y:数値」「X = 数値, Y = 数値, Z = 数値」等のラベル付き形式、
 * JSON 配列 [数値, 数値] / [数値, 数値, 数値] 形式にも対応。
 */
export function extractCoordinates(text: string): number[][] {
  // 数値: 符号付き整数・小数・指数表記
  const num = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.source;
  // オプショナルな単位接尾辞 (mm, cm, m, in, ft)
  const unit = /(?:mm|cm|in|ft|m)?/.source;

  const matches: { index: number; coords: number[] }[] = [];

  // パターン1: ラベル付き座標 (x:1.0, y:2.0 / X = 1.0, Y = 2.0 等)
  const label = /[xyzXYZ]\s*[:=]\s*/.source;
  const labeledPattern = new RegExp(
    `${label}(${num})[\\s,]+${label}(${num})(?:[\\s,]+${label}(${num}))?`,
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

  // パターン2: JSON 配列 ([1, 2] / [1, 2, 3])
  const bracketPattern = new RegExp(
    `\\[\\s*(${num})\\s*,\\s*(${num})(?:\\s*,\\s*(${num}))?\\s*\\]`,
    "g"
  );
  while ((m = bracketPattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const overlaps = consumedRanges.some(([s, e]) => start < e && end > s);
    if (overlaps) {
      continue;
    }
    const coord = [Number(m[1]), Number(m[2])];
    if (m[3] !== undefined) {
      coord.push(Number(m[3]));
    }
    matches.push({ index: start, coords: coord });
    consumedRanges.push([start, end]);
  }

  // パターン3: 括弧内カンマ区切り (Point3::new(1.0, 2.0, 3.0) / (1,2) / (100.0mm, 200.0mm) など)
  const parenPattern = new RegExp(
    `\\(\\s*(${num})${unit}\\s*,\\s*(${num})${unit}(?:\\s*,\\s*(${num})${unit})?\\s*\\)`,
    "g"
  );
  while ((m = parenPattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const overlaps = consumedRanges.some(([s, e]) => start < e && end > s);
    if (overlaps) {
      continue;
    }
    const coord = [Number(m[1]), Number(m[2])];
    if (m[3] !== undefined) {
      coord.push(Number(m[3]));
    }
    matches.push({ index: start, coords: coord });
    consumedRanges.push([start, end]);
  }

  // パターン4: 波括弧内カンマ区切り ({1.0, 2.0, 3.0} C/C++ 初期化リストなど)
  const bracePattern = new RegExp(
    `\\{\\s*(${num})\\s*,\\s*(${num})(?:\\s*,\\s*(${num}))?\\s*\\}`,
    "g"
  );
  while ((m = bracePattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const overlaps = consumedRanges.some(([s, e]) => start < e && end > s);
    if (overlaps) {
      continue;
    }
    const coord = [Number(m[1]), Number(m[2])];
    if (m[3] !== undefined) {
      coord.push(Number(m[3]));
    }
    matches.push({ index: start, coords: coord });
    consumedRanges.push([start, end]);
  }

  // パターン5: セミコロン区切り (1.0; 2.0; 3.0 MATLAB 等)
  const semiPattern = new RegExp(
    `(${num})\\s*;\\s*(${num})(?:\\s*;\\s*(${num}))?`,
    "g"
  );
  while ((m = semiPattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const overlaps = consumedRanges.some(([s, e]) => start < e && end > s);
    if (overlaps) {
      continue;
    }
    const coord = [Number(m[1]), Number(m[2])];
    if (m[3] !== undefined) {
      coord.push(Number(m[3]));
    }
    matches.push({ index: start, coords: coord });
    consumedRanges.push([start, end]);
  }

  // パターン6: カンマ直結 (1,2 / 1,2,3 — スペースなし)
  const tightPattern = new RegExp(
    `(${num}),(${num})(?:,(${num}))?`,
    "g"
  );
  while ((m = tightPattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const overlaps = consumedRanges.some(([s, e]) => start < e && end > s);
    if (overlaps) {
      continue;
    }
    const coord = [Number(m[1]), Number(m[2])];
    if (m[3] !== undefined) {
      coord.push(Number(m[3]));
    }
    matches.push({ index: start, coords: coord });
    consumedRanges.push([start, end]);
  }

  // パターン6b: カンマ+スペース区切り (100, 200 / 100, 200, 300 — ArchiCAD GDL 等)
  const spacedCommaPattern = new RegExp(
    `(${num}),\\s+(${num})(?:,\\s+(${num}))?`,
    "g"
  );
  while ((m = spacedCommaPattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const overlaps = consumedRanges.some(([s, e]) => start < e && end > s);
    if (overlaps) {
      continue;
    }
    const coord = [Number(m[1]), Number(m[2])];
    if (m[3] !== undefined) {
      coord.push(Number(m[3]));
    }
    matches.push({ index: start, coords: coord });
    consumedRanges.push([start, end]);
  }

  // パターン7: スペース/タブ区切り (1.0 2.0 3.0 点群・OBJ・PLY 等)
  const spacePattern = new RegExp(
    `(${num})[ \\t]+(${num})(?:[ \\t]+(${num}))?`,
    "g"
  );
  while ((m = spacePattern.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const overlaps = consumedRanges.some(([s, e]) => start < e && end > s);
    if (overlaps) {
      continue;
    }
    const coord = [Number(m[1]), Number(m[2])];
    if (m[3] !== undefined) {
      coord.push(Number(m[3]));
    }
    matches.push({ index: start, coords: coord });
    consumedRanges.push([start, end]);
  }

  // テキスト中の出現順にソート
  matches.sort((a, b) => a.index - b.index);
  return matches.map((entry) => entry.coords);
}
