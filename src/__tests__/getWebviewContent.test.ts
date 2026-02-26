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
  it("Chart.js の URI が含まれる", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    expect(html).toContain("chart.umd.js");
  });

  it("nonce が設定されている", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    // nonce should appear in CSP header, style tag, and script tags
    const nonceMatches = html.match(/nonce-[0-9a-f]{32}/g);
    expect(nonceMatches).not.toBeNull();
    // All nonces should be the same value
    const unique = new Set(nonceMatches);
    expect(unique.size).toBe(1);
  });

  it("CSP ヘッダが正しい", () => {
    const html = getWebviewContent(
      createMockWebview(),
      extensionUri,
      [[1, 2]],
      "2D"
    );
    expect(html).toContain("default-src 'none'");
    expect(html).toMatch(/script-src 'nonce-[0-9a-f]{32}'/);
    expect(html).toMatch(/style-src 'nonce-[0-9a-f]{32}'/);
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
});
