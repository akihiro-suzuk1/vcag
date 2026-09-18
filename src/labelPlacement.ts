export type LabelPlacement = {
  textposition: string;
  mapDirection: string;
  mapOffset: [number, number];
};

const TEXT_POSITIONS = [
  "top center",
  "bottom center",
  "middle right",
  "middle left",
  "top right",
  "top left",
  "bottom right",
  "bottom left",
];

function mapOffsetForGroup(indexInGroup: number, count: number): {
  mapDirection: string;
  mapOffset: [number, number];
} {
  if (count === 1) {
    return { mapDirection: "top", mapOffset: [0, -28] };
  }
  const radius = Math.max(40, Math.ceil(count * 7));
  const angle = (2 * Math.PI * indexInGroup) / count - Math.PI / 2;
  return {
    mapDirection: "center",
    mapOffset: [
      Math.round(Math.cos(angle) * radius),
      Math.round(Math.sin(angle) * radius) - 20,
    ],
  };
}

// Webview は HTML 文字列のため、同等の関数を getWebviewContent.ts 側にも持つ。
export function computeLabelPlacements(
  coords: number[][],
  dims: 2 | 3
): LabelPlacement[] {
  const keys = coords.map((p) => p.slice(0, dims).join(","));
  const counts = new Map<string, number>();
  for (const key of keys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  return keys.map((key) => {
    const indexInGroup = seen.get(key) ?? 0;
    seen.set(key, indexInGroup + 1);
    return {
      textposition: TEXT_POSITIONS[indexInGroup % TEXT_POSITIONS.length],
      ...mapOffsetForGroup(indexInGroup, counts.get(key) ?? 1),
    };
  });
}

export type PixelPoint = { x: number; y: number };

export function computePixelLabelPlacements(
  points: PixelPoint[],
  threshold = 56
): Array<{ mapDirection: string; mapOffset: [number, number] }> {
  const n = points.length;
  const parent = points.map((_, i) => i);
  const find = (i: number): number => {
    if (parent[i] !== i) {
      parent[i] = find(parent[i]);
    }
    return parent[i];
  };
  const union = (a: number, b: number) => {
    const pa = find(a);
    const pb = find(b);
    if (pa !== pb) {
      parent[pa] = pb;
    }
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (
        Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y) <
        threshold
      ) {
        union(i, j);
      }
    }
  }

  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const members = groups.get(root) ?? [];
    members.push(i);
    groups.set(root, members);
  }

  const result = points.map(() => ({
    mapDirection: "top",
    mapOffset: [0, -28] as [number, number],
  }));

  for (const members of groups.values()) {
    if (members.length === 1) {
      continue;
    }
    const cx = members.reduce((sum, i) => sum + points[i].x, 0) / members.length;
    const cy = members.reduce((sum, i) => sum + points[i].y, 0) / members.length;
    const clusterSpread = Math.max(
      ...members.map((i) => Math.hypot(points[i].x - cx, points[i].y - cy))
    );
    const radius = Math.max(48, clusterSpread + 36, members.length * 10);
    members.forEach((i, k) => {
      const angle = (2 * Math.PI * k) / members.length - Math.PI / 2;
      const lx = cx + Math.cos(angle) * radius;
      const ly = cy + Math.sin(angle) * radius - 20;
      result[i] = {
        mapDirection: "center",
        mapOffset: [
          Math.round(lx - points[i].x),
          Math.round(ly - points[i].y),
        ],
      };
    });
  }

  return result;
}
