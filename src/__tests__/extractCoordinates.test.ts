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

  it("指数表記を含む座標を抽出する", () => {
    expect(extractCoordinates("1.5e2,3.0E-1 -2e+3,4.2e10")).toEqual([
      [1.5e2, 3.0e-1],
      [-2e+3, 4.2e10],
    ]);
  });

  it("指数表記の3D座標を抽出する", () => {
    expect(extractCoordinates("1e2,2e3,3e4")).toEqual([
      [1e2, 2e3, 3e4],
    ]);
  });

  it("ラベル付き座標 (x:, y:) を抽出する", () => {
    const text = `
let sp1 = coord! {x:0.0, y:10000.0}.to_point3(0.0);
let sp2 = coord! {x:8348.643998, y:10000.0}.to_point3(0.0);
let sp3 = coord! {x:8348.643998, y:25000.0}.to_point3(0.0);
    `;
    expect(extractCoordinates(text)).toEqual([
      [0.0, 10000.0],
      [8348.643998, 10000.0],
      [8348.643998, 25000.0],
    ]);
  });

  it("ラベル付き3D座標 (x:, y:, z:) を抽出する", () => {
    expect(extractCoordinates("x: 1.0, y: 2.0, z: 3.0")).toEqual([
      [1.0, 2.0, 3.0],
    ]);
  });

  it("ラベル付きとカンマ直結が混在するテキスト", () => {
    const text = "x:1.0, y:2.0 and 3,4";
    expect(extractCoordinates(text)).toEqual([
      [1.0, 2.0],
      [3, 4],
    ]);
  });
});
