import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";
import { extractCoordinates } from "../extractCoordinates";

function readFixture(name: string): string {
  return readFileSync(join(__dirname, "fixtures", name), "utf-8");
}

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
    expect(extractCoordinates(readFixture("labeled-2d.txt"))).toEqual([
      [0.0, 10000.0],
      [8348.643998, 10000.0],
      [8348.643998, 25000.0],
    ]);
  });

  it("ラベル付き3D座標 (x:, y:, z:) を抽出する", () => {
    expect(extractCoordinates(readFixture("labeled-3d.txt"))).toEqual([
      [1.0, 2.0, 3.0],
    ]);
  });

  it("ラベル付きとカンマ直結が混在するテキスト", () => {
    expect(extractCoordinates(readFixture("labeled-and-tight.txt"))).toEqual([
      [1.0, 2.0],
      [3, 4],
    ]);
  });

  it("任意のアルファベットラベル (lat, longitude, count 等) の座標を抽出する", () => {
    expect(extractCoordinates(readFixture("labeled-arbitrary.txt"))).toEqual([
      [35.68, 139.76],
      [42, 100.5],
      [1.0, 2.0, 3.0],
    ]);
  });

  it("JSON 配列形式の3D座標を抽出する", () => {
    expect(extractCoordinates(readFixture("json-array-3d.txt"))).toEqual([
      [-12521.9684942491, -12521.968494585002, 0],
      [12521.9684942491, -12521.968494585002, 0],
      [-9279.29023849407, 12521.968494585002, 0],
    ]);
  });

  it("Point3::new() 形式の座標を抽出する", () => {
    expect(extractCoordinates(readFixture("point3-new.txt"))).toEqual([
      [8.0, 8.0, 0.0],
      [12.0, 8.0, 0.0],
      [12.0, 12.0, 0.0],
      [8.0, 12.0, 0.0],
    ]);
  });

  it("括弧内の2D座標を抽出する", () => {
    expect(extractCoordinates("(1.5, 2.3) (3.0, 4.0)")).toEqual([
      [1.5, 2.3],
      [3.0, 4.0],
    ]);
  });

  it("括弧内にスペースが複数あっても抽出する", () => {
    expect(extractCoordinates("(  8.0 ,  8.0 ,  0.0  )")).toEqual([
      [8.0, 8.0, 0.0],
    ]);
  });

  it("波括弧内の座標を抽出する (C/C++ 初期化リスト)", () => {
    expect(extractCoordinates(readFixture("braces.txt"))).toEqual([
      [1.0, 2.0, 3.0],
      [4.0, 5.0, 6.0],
    ]);
  });

  it("セミコロン区切りの座標を抽出する", () => {
    expect(extractCoordinates(readFixture("semicolon.txt"))).toEqual([
      [1.0, 2.0, 3.0],
    ]);
  });

  it("スペース区切りの3D座標を抽出する (点群/OBJ形式)", () => {
    expect(extractCoordinates(readFixture("obj-format.txt"))).toEqual([
      [1.0, 2.0, 3.0],
      [4.0, 5.0, 6.0],
      [7.0, 8.0, 9.0],
    ]);
  });

  it("タブ区切りの2D座標を抽出する (TSV形式)", () => {
    expect(extractCoordinates(readFixture("tsv-2d.txt"))).toEqual([
      [1.0, 2.0],
      [3.0, 4.0],
    ]);
  });

  it("JSON 配列形式の2D座標を抽出する", () => {
    expect(extractCoordinates(readFixture("json-array-2d.txt"))).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("Revit プロパティ形式 (X = val, Y = val, Z = val) を抽出する", () => {
    expect(extractCoordinates(readFixture("revit-properties.txt"))).toEqual([
      [12500.0, 8300.0, 3000.0],
      [0.0, 0.0, 0.0],
      [25000.0, 15000.0, 3000.0],
    ]);
  });

  it("AutoCAD LIST 形式 (X= val Y= val Z= val) を抽出する", () => {
    expect(extractCoordinates(readFixture("autocad-list.txt"))).toEqual([
      [12500.0, 8300.0, 0.0],
    ]);
  });

  it("Dynamo Watch 形式 (Point(X = val, Y = val, Z = val)) を抽出する", () => {
    expect(extractCoordinates(readFixture("dynamo-watch.txt"))).toEqual([
      [0.0, 0.0, 0.0],
      [25000.0, 0.0, 0.0],
      [25000.0, 15000.0, 0.0],
    ]);
  });

  it("大文字ラベル+コロン (X: val Y: val) を抽出する", () => {
    expect(extractCoordinates(readFixture("archicad-tracker.txt"))).toEqual([
      [12500.0, 8300.0],
    ]);
  });

  it("カンマ+スペース区切り (ArchiCAD GDL 等) を抽出する", () => {
    expect(extractCoordinates(readFixture("archicad-gdl.txt"))).toEqual([
      [12500, 8300, 0],
      [13000, 8500, 0],
    ]);
  });

  it("カンマ+スペース区切り 2D を抽出する", () => {
    expect(extractCoordinates("100, 200")).toEqual([[100, 200]]);
  });

  it("SketchUp mm 単位付き座標を抽出する", () => {
    expect(extractCoordinates(readFixture("sketchup-mm.txt"))).toEqual([
      [12500.0, 8300.0, 0.0],
      [0.0, 0.0, 3000.0],
    ]);
  });

  it("単位付き座標 (cm, m, in, ft) を抽出する", () => {
    expect(extractCoordinates("(100.0cm, 200.0cm)")).toEqual([[100.0, 200.0]]);
    expect(extractCoordinates("(1.0m, 2.0m, 3.0m)")).toEqual([[1.0, 2.0, 3.0]]);
    expect(extractCoordinates("(12.0in, 24.0in)")).toEqual([[12.0, 24.0]]);
    expect(extractCoordinates("(3.0ft, 6.0ft)")).toEqual([[3.0, 6.0]]);
  });

  it("WKT POINT 形式の2D座標を抽出する", () => {
    expect(extractCoordinates(readFixture("wkt-point.txt"))).toEqual([
      [139.6917, 35.6895],
      [139.7454, 35.7295],
    ]);
  });

  it("WKT POINT Z 形式の3D座標を抽出する", () => {
    expect(extractCoordinates(readFixture("wkt-point-z.txt"))).toEqual([
      [139.6917, 35.6895, 45.0],
      [139.7454, 35.7295, 30.0],
    ]);
  });

  it("WKT LINESTRING 形式の座標を抽出する", () => {
    expect(extractCoordinates(readFixture("wkt-linestring.txt"))).toEqual([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ]);
  });

  it("WKT POLYGON 形式の座標を抽出する", () => {
    expect(extractCoordinates(readFixture("wkt-polygon.txt"))).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 50],
      [0, 0],
    ]);
  });

  it("WKT MULTIPOINT 形式の座標を抽出する", () => {
    expect(extractCoordinates(readFixture("wkt-multipoint.txt"))).toEqual([
      [0, 0],
      [10, 20],
      [30, 40],
    ]);
  });
});
