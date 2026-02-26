import { describe, it, expect, vi } from "vitest";
import { getWebviewContent } from "../webview/getWebviewContent";

// Mock vscode module
vi.mock("vscode", () => ({
  Uri: {
    joinPath: (...args: unknown[]) => ({
      toString: () => (args as { path?: string }[]).map((a) => a.path ?? a).join("/"),
    }),
  },
}));

function createMockWebview() {
  return {
    asWebviewUri: (uri: { toString: () => string }) => ({
      toString: () => `https://file+.vscode-resource.vscode-cdn.net/${uri.toString()}`,
    }),
  } as unknown as import("vscode").Webview;
}

const extensionUri = { path: "/ext" } as unknown as import("vscode").Uri;

describe("getWebviewContent", () => {
  it("Plotly.js の URI が含まれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    expect(html).toContain("plotly.min.js");
  });

  it("nonce が設定されている", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    // nonce should appear in CSP header and script tags
    const nonceMatches = html.match(/nonce-[0-9a-f]{32}/g);
    expect(nonceMatches).not.toBeNull();
    // All nonces should be the same value
    const unique = new Set(nonceMatches);
    expect(unique.size).toBe(1);
  });

  it("CSP ヘッダが正しい（style-src 'unsafe-inline'）", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    expect(html).toContain("default-src 'none'");
    expect(html).toMatch(/script-src 'nonce-[0-9a-f]{32}'/);
    expect(html).toContain("style-src 'unsafe-inline'");
  });

  it("座標データが埋め込まれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [
        [1, 2],
        [3, 4],
      ],
      "2D"
    );
    expect(html).toContain("[[1,2],[3,4]]");
  });

  it("dim が埋め込まれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2, 3]],
      "3D"
    );
    expect(html).toContain('"3D"');
  });

  it("render メッセージリスナーが含まれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    expect(html).toContain("addEventListener('message'");
    expect(html).toContain("msg.type === 'render'");
  });

  it("2D では初期描画が 2D で呼ばれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    // Initial render call uses currentViewAs variable
    expect(html).toMatch(/render\(\[\[1,2\]\],\s*currentViewAs\)/);
  });

  it("3D では scatter3d タイプが使用される", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2, 3]],
      "3D"
    );
    // render function contains scatter3d logic
    expect(html).toContain("scatter3d");
    // Initial render call uses "3D"
    expect(html).toMatch(/render\(\[\[1,2,3\]\],\s*currentViewAs\)/);
  });

  it("3D 時にトグルボタンが含まれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2, 3]],
      "3D"
    );
    expect(html).toContain('id="toggle-dim"');
    expect(html).toContain("Show as XY 2D");
    // dataDim === '3D' なのでボタンが表示される
    expect(html).toContain("dataDim === '3D'");
  });

  it("2D 時にトグルボタンが非表示", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    // ボタン要素自体は存在するが dataDim が '2D' なので display: none のまま
    expect(html).toContain('id="toggle-dim"');
    expect(html).toContain('let currentViewAs = "2D"');
    expect(html).toContain('const dataDim = "2D"');
  });

  it("「線でつなぐ」チェックボックスが含まれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    expect(html).toContain('id="connect-lines"');
  });

  it("「始点と終点を結ぶ」チェックボックスが含まれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    expect(html).toContain('id="close-loop"');
  });

  it("「始点と終点を結ぶ」が初期状態で disabled", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    expect(html).toMatch(/id="close-loop"\s+disabled/);
  });
});
