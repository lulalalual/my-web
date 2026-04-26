import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "source", "img", "covers", "notes");
fs.mkdirSync(outDir, { recursive: true });

const palettes = {
  cream: {
    bg: "#f2eadf",
    accent: "#8cb4ec",
    accentSoft: "#d7e8ff",
    accentHot: "#5b95e6",
    ink: "#6fa5ea",
    sub: "#5f6f85",
    line: "#d9cfc0",
    glow: "#f8f4ea"
  },
  ribbon: {
    bg: "#d86c2f",
    accent: "#f7f2e8",
    accentSoft: "#f09a49",
    accentHot: "#d84d1e",
    ink: "#fff7ef",
    sub: "#fff0e1",
    line: "#f5d9c2",
    glow: "#ec8c41"
  },
  midnight: {
    bg: "#10131f",
    accent: "#4f79ff",
    accentSoft: "#1e2640",
    accentHot: "#f2bf5d",
    ink: "#eef4ff",
    sub: "#b2bdd5",
    line: "#27365f",
    glow: "#1b2236"
  },
  mint: {
    bg: "#0f1b21",
    accent: "#2fd0a3",
    accentSoft: "#183039",
    accentHot: "#8ae9cf",
    ink: "#f3fffb",
    sub: "#bbd8d0",
    line: "#285364",
    glow: "#15282f"
  }
};

const covers = [
  { file: "interview-index.svg", palette: "cream", mode: "scallop", label: "INTERVIEW", title: ["八股", "索引"], sub: "COMPUTER FUNDAMENTALS" },
  { file: "algo-index.svg", palette: "ribbon", mode: "ribbon", label: "ALGORITHM", title: ["算法", "笔记"], sub: "FRAMEWORK / STATE / BORDER" },
  { file: "ai-index.svg", palette: "midnight", mode: "panel", label: "AI DEV", title: ["AI开发", "笔记"], sub: "PROMPT / STREAM / TOOL" },
  { file: "site-portal.svg", palette: "mint", mode: "panel", label: "WEB NOTE", title: ["博客", "门户"], sub: "HEXO / MOTION / DESIGN" },
  { file: "cpp-index.svg", palette: "midnight", mode: "panel", label: "C++", title: ["C++语法", "笔记"], sub: "LANGUAGE / OBJECT / TEMPLATE" },
  { file: "cpp-maintain.svg", palette: "cream", mode: "scallop", label: "C++ NOTE", title: ["长期", "维护"], sub: "NOTE SYSTEM / REVIEW" },
  { file: "cpp-forwarding.svg", palette: "ribbon", mode: "ribbon", label: "VALUE CATEGORY", title: ["完美", "转发"], sub: "FORWARD / REF / VALUE" },
  { file: "cpp-lifetime.svg", palette: "midnight", mode: "panel", label: "LIFETIME", title: ["对象", "生命周期"], sub: "CTOR / DTOR / ORDER" },
  { file: "cpp-template.svg", palette: "cream", mode: "scallop", label: "TEMPLATE", title: ["模板", "推导"], sub: "AUTO / DECLTYPE / DEDUCE" },
  { file: "cpp-raii.svg", palette: "ribbon", mode: "ribbon", label: "RAII", title: ["智能", "指针"], sub: "OWNERSHIP / RESOURCE" },
  { file: "algo-binary.svg", palette: "cream", mode: "scallop", label: "BINARY SEARCH", title: ["二分", "搜索"], sub: "MONOTONIC / CHECK" },
  { file: "algo-dp-note.svg", palette: "midnight", mode: "panel", label: "DYNAMIC PROGRAMMING", title: ["动态", "规划"], sub: "STATE / TRANSITION" },
  { file: "algo-mono.svg", palette: "ribbon", mode: "ribbon", label: "MONOTONIC", title: ["单调", "结构"], sub: "STACK / QUEUE / PREFIX" },
  { file: "algo-window.svg", palette: "cream", mode: "scallop", label: "SLIDING WINDOW", title: ["滑动", "窗口"], sub: "TWO POINTERS / RANGE" },
  { file: "algo-dfs-note.svg", palette: "midnight", mode: "panel", label: "BACKTRACK", title: ["回溯", "DFS"], sub: "PATH / CHOICE / PRUNE" },
  { file: "algo-graph-note.svg", palette: "ribbon", mode: "ribbon", label: "GRAPH", title: ["图与", "拓扑"], sub: "BFS / DFS / TOPO" },
  { file: "project-interview.svg", palette: "midnight", mode: "panel", label: "PROJECT", title: ["面试", "大师"], sub: "AI / WEB / SYSTEM DESIGN" },
  { file: "project-game.svg", palette: "ribbon", mode: "ribbon", label: "GAME DEV", title: ["塔防", "双人"], sub: "SDL2 / LOOP / COMBAT" },
  { file: "project-distributed.svg", palette: "cream", mode: "scallop", label: "DISTRIBUTED", title: ["通信", "平台"], sub: "RPC / ZK / REDIS / IM" },
  { file: "project-raft.svg", palette: "mint", mode: "panel", label: "RAFT KV", title: ["分布式", "KV"], sub: "CONSENSUS / LOG / APPLY" }
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stars(seed, fill, opacity) {
  const dots = [];
  for (let i = 0; i < 12; i += 1) {
    const x = 90 + ((seed * 53 + i * 137) % 760);
    const y = 72 + ((seed * 41 + i * 97) % 384);
    const r = i % 3 === 0 ? 2.8 : 1.8;
    dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${opacity}"/>`);
  }
  return dots.join("");
}

function renderScallop({ label, title, sub }, palette, index) {
  const [top, bottom] = title;
  const scallops = Array.from({ length: 10 }, (_, i) => {
    const cx = 60 + i * 96;
    return `<circle cx="${cx}" cy="4" r="48" fill="${palette.accent}" opacity=".62"/><circle cx="${cx}" cy="536" r="48" fill="${palette.accent}" opacity=".62"/>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">
  <rect width="960" height="540" rx="42" fill="${palette.bg}"/>
  ${scallops}
  <circle cx="832" cy="124" r="132" fill="${palette.accentSoft}" opacity=".82"/>
  <circle cx="740" cy="418" r="162" fill="${palette.glow}" opacity=".74"/>
  <path d="M122 118h298" stroke="${palette.line}" stroke-width="10" stroke-linecap="round"/>
  <path d="M118 426h220" stroke="${palette.line}" stroke-width="10" stroke-linecap="round"/>
  ${stars(index + 3, palette.accentHot, ".26")}
  <text x="96" y="120" fill="${palette.accentHot}" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="30" font-weight="800" letter-spacing="6">${esc(label)}</text>
  <text x="106" y="258" fill="${palette.ink}" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="126" font-weight="900">${esc(top)}</text>
  <text x="106" y="386" fill="${palette.ink}" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="126" font-weight="900">${esc(bottom)}</text>
  <text x="102" y="474" fill="${palette.sub}" font-family="'JetBrains Mono','Consolas',monospace" font-size="26" font-weight="700">${esc(sub)}</text>
</svg>`;
}

function renderRibbon({ label, title, sub }, palette, index) {
  const [top, bottom] = title;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">
  <rect width="960" height="540" rx="42" fill="${palette.bg}"/>
  <circle cx="764" cy="124" r="126" fill="${palette.accentSoft}" opacity=".62"/>
  <circle cx="860" cy="404" r="138" fill="${palette.accentHot}" opacity=".3"/>
  ${stars(index + 7, palette.sub, ".26")}
  <path d="M138 310c84-104 248-136 396-66 62 30 104 40 164 36" fill="none" stroke="${palette.line}" stroke-width="14" stroke-linecap="round"/>
  <path d="M268 172c84-54 206-56 288 6" fill="none" stroke="${palette.line}" stroke-width="10" stroke-linecap="round"/>
  <path d="M234 362h486l-54 84H288z" fill="#d86a05" opacity=".96" stroke="${palette.line}" stroke-width="10" stroke-linejoin="round"/>
  <path d="M234 362l-92 62 62-86z" fill="#d86a05" opacity=".96" stroke="${palette.line}" stroke-width="10" stroke-linejoin="round"/>
  <path d="M720 362l96 54-80-78z" fill="#d86a05" opacity=".96" stroke="${palette.line}" stroke-width="10" stroke-linejoin="round"/>
  <text x="94" y="112" fill="${palette.sub}" font-family="'JetBrains Mono','Consolas',monospace" font-size="28" font-weight="800" letter-spacing="4">${esc(label)}</text>
  <text x="232" y="252" fill="${palette.ink}" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="116" font-weight="900">${esc(top)}</text>
  <text x="290" y="362" fill="${palette.ink}" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="116" font-weight="900">${esc(bottom)}</text>
  <text x="350" y="418" fill="${palette.sub}" font-family="'JetBrains Mono','Consolas',monospace" font-size="34" font-weight="800">${esc(sub)}</text>
</svg>`;
}

function renderPanel({ label, title, sub }, palette, index) {
  const [top, bottom] = title;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">
  <rect width="960" height="540" rx="42" fill="${palette.bg}"/>
  <circle cx="170" cy="112" r="140" fill="${palette.accent}" opacity=".16"/>
  <circle cx="778" cy="408" r="170" fill="${palette.accentHot}" opacity=".14"/>
  <rect x="178" y="162" width="604" height="220" rx="34" fill="${palette.accentSoft}" stroke="${palette.line}" stroke-width="6"/>
  <rect x="222" y="208" width="214" height="16" rx="8" fill="${palette.sub}" opacity=".96"/>
  <rect x="222" y="246" width="284" height="14" rx="7" fill="${palette.sub}" opacity=".72"/>
  <rect x="222" y="284" width="176" height="14" rx="7" fill="${palette.accentHot}" opacity=".92"/>
  <circle cx="664" cy="238" r="42" fill="${palette.line}" opacity=".92"/>
  <path d="M602 346c0-34 28-62 62-62s62 28 62 62" fill="${palette.line}" opacity=".92"/>
  ${stars(index + 11, palette.sub, ".22")}
  <text x="100" y="110" fill="${palette.accentHot}" font-family="'JetBrains Mono','Consolas',monospace" font-size="28" font-weight="800" letter-spacing="4">${esc(label)}</text>
  <text x="112" y="454" fill="${palette.ink}" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="118" font-weight="900">${esc(top)}</text>
  <text x="112" y="534" fill="${palette.ink}" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="118" font-weight="900">${esc(bottom)}</text>
  <text x="520" y="482" fill="${palette.sub}" font-family="'JetBrains Mono','Consolas',monospace" font-size="28" font-weight="700">${esc(sub)}</text>
</svg>`;
}

function renderCover(config, index) {
  const palette = palettes[config.palette];
  if (config.mode === "scallop") return renderScallop(config, palette, index);
  if (config.mode === "ribbon") return renderRibbon(config, palette, index);
  return renderPanel(config, palette, index);
}

covers.forEach((config, index) => {
  const svg = renderCover(config, index);
  fs.writeFileSync(path.join(outDir, config.file), svg, "utf8");
});

console.log(`Generated ${covers.length} note covers in ${outDir}`);
