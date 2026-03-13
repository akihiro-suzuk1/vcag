import { describe, it, expect } from "vitest";
import { parseSvgPath } from "../parseSvgPath";

describe("parseSvgPath", () => {
  it("M/L の基本パスから端点を抽出する（補間なし）", () => {
    expect(parseSvgPath("M 10 80 L 100 200")).toEqual([
      [10, 80],
      [100, 200],
    ]);
  });

  it("C（3次ベジェ）を8分割で補間する", () => {
    // P0=(10,80), P1=(40,10), P2=(65,10), P3=(95,80)
    const result = parseSvgPath("M 10 80 C 40 10 65 10 95 80");
    // M の1点 + C の補間8点 = 9点
    expect(result).toHaveLength(9);
    expect(result[0]).toEqual([10, 80]);
    expect(result[8]).toEqual([95, 80]);
    // 中間点は端点と異なる（曲線になっている）
    expect(result[4][1]).not.toBeCloseTo(80, 0);
  });

  it("Q（2次ベジェ）を8分割で補間する", () => {
    // P0=(10,80), P1=(52.5,10), P2=(95,80)
    const result = parseSvgPath("M 10 80 Q 52.5 10 95 80");
    expect(result).toHaveLength(9);
    expect(result[0]).toEqual([10, 80]);
    expect(result[8]).toEqual([95, 80]);
    // t=0.5 での y は (1-0.5)^2*80 + 2*(1-0.5)*0.5*10 + 0.5^2*80 = 20+10+20 = 45
    expect(result[4][1]).toBeCloseTo(45, 5);
  });

  it("H/V コマンドから座標を計算する（補間なし）", () => {
    expect(parseSvgPath("M 0 0 H 100 V 50")).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
    ]);
  });

  it("相対コマンドを絶対座標に変換する", () => {
    expect(parseSvgPath("m 10 80 l 90 120")).toEqual([
      [10, 80],
      [100, 200],
    ]);
  });

  it("Z コマンドは座標として含めない", () => {
    expect(parseSvgPath("M 0 0 L 100 0 L 100 100 Z")).toEqual([
      [0, 0],
      [100, 0],
      [100, 100],
    ]);
  });

  it("A（円弧）を補間する", () => {
    const result = parseSvgPath("M 10 80 A 45 45 0 0 0 125 125");
    // M の1点 + 円弧の補間点
    expect(result.length).toBeGreaterThan(2);
    expect(result[0]).toEqual([10, 80]);
    // 最終点は端点に近い
    const last = result[result.length - 1];
    expect(last[0]).toBeCloseTo(125, 0);
    expect(last[1]).toBeCloseTo(125, 0);
  });

  it("複数曲線セグメントを連続で補間する", () => {
    // Q + T（unshort で Q に変換される）
    const result = parseSvgPath("M 50 100 Q 100 20 150 100 T 250 100");
    // M(1点) + Q1(8点) + Q2(8点) = 17点
    expect(result).toHaveLength(17);
    expect(result[0]).toEqual([50, 100]);
    expect(result[8]).toEqual([150, 100]);
    expect(result[16]).toEqual([250, 100]);
  });

  it("空文字列から空配列を返す", () => {
    expect(parseSvgPath("")).toEqual([]);
  });

  it("不正入力でも例外を投げず空配列を返す", () => {
    expect(parseSvgPath("not a path")).toEqual([]);
    expect(parseSvgPath("XYZ 123")).toEqual([]);
  });
});
