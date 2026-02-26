/**
 * テキストから座標情報を正規表現で抽出する。
 * 「数値,数値」または「数値,数値,数値」のパターンを座標として認識。
 */
export function extractCoordinates(text: string): number[][] {
  // 数値: 符号付き整数・小数
  // パターン: 数値,数値 または 数値,数値,数値
  const coordPattern = /-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?(?:,-?\d+(?:\.\d+)?)?/g;

  const matches = text.match(coordPattern);
  if (!matches) {
    return [];
  }

  return matches.map((m) => m.split(",").map(Number));
}
