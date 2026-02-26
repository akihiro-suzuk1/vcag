import { describe, it, expect } from "vitest";
import { extractCoordinates } from "../extractCoordinates";

describe("extractCoordinates", () => {
  it("空文字列から空配列を返す", () => {
    expect(extractCoordinates("")).toEqual([]);
  });

  it("座標が含まれないテキストから空配列を返す", () => {
    expect(extractCoordinates("hello world")).toEqual([]);
  });

  it("2D座標をスペース区切りで抽出する", () => {
    expect(extractCoordinates("1,2 3,4 5,6")).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it("2D座標を改行区切りで抽出する", () => {
    expect(extractCoordinates("1,2\n3,4\n5,6")).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it("3D座標を抽出する", () => {
    expect(extractCoordinates("1,2,3 4,5,6")).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it("小数点を含む座標を抽出する", () => {
    expect(extractCoordinates("1.5,2.3 3.14,4.0")).toEqual([
      [1.5, 2.3],
      [3.14, 4.0],
    ]);
  });

  it("負の値を含む座標を抽出する", () => {
    expect(extractCoordinates("-1,2 3,-4.5")).toEqual([
      [-1, 2],
      [3, -4.5],
    ]);
  });

  it("ノイズ混じりのテキストから座標を抽出する", () => {
    expect(extractCoordinates("point A: 1,2 point B: 3,4")).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("カンマ区切り（座標間）でも抽出する", () => {
    // "1,2, 3,4" のようにカンマ+スペースで区切られたケース
    expect(extractCoordinates("1,2, 3,4")).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("タブ区切りで抽出する", () => {
    expect(extractCoordinates("1,2\t3,4")).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});
