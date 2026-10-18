const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error("Usage: node tools/verify-deployment.mjs <base-url>");
  process.exit(1);
}

const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

const routes = [
  "/",
  "/blog/",
  "/experience/",
  "/practice/",
  "/opensource/",
  "/work/interview/",
  "/work/defense/",
  "/work/crawler/",
  "/work/motion-factory/",
  "/work/desktop-workbench/",
  "/work/evalops/",
  "/work/agentic-rl/",
  "/work/cs-learning/",
  "/work/chemistry/",
  "/work/english-learning/",
  "/demos/agentic-report/",
  "/demos/motion-gallery/",
  "/demos/evalops/",
  "/demos/interview/?mode=demo",
  "/demos/defense-original/",
  "/portfolio-assets/diagrams/",
  "/portfolio-assets/knowledge/",
  "/posts/cpp-stl/",
  "/archives/",
  "/categories/",
  "/tags/",
  "/projects/",
  "/about/",
  "/comments/",
];

const failures = [];

for (const route of routes) {
  const url = `${normalizedBaseUrl}${route}`;
  const response = await fetch(url, {
    redirect: "manual",
  });

  const acceptable = response.status >= 200 && response.status < 400;
  await response.arrayBuffer();

  console.log(`${response.status} ${route}`);

  if (!acceptable) {
    failures.push({ route, status: response.status });
  }
}

for (const [path, mime] of [
  ['/portfolio-assets/motion.css', 'text/css'],
  ['/portfolio-assets/projects.css', 'text/css'],
  ['/js/article-toc.js', 'javascript'],
  ['/portfolio-assets/site.js', 'javascript'],
  ['/portfolio-assets/projects.json', 'application/json'],
  ['/demos/defense-original/game.wasm', 'application/wasm'],
  ['/demos/interview/pyodide/pyodide.asm.wasm', 'application/wasm'],
]) {
  const response = await fetch(normalizedBaseUrl + path, {method:'HEAD'});
  const type = response.headers.get('content-type') || '';
  console.log(`${response.status} ${path} ${type}`);
  if (!response.ok || !type.includes(mime)) failures.push({route:path, status:response.status});
}

const homepage = await fetch(normalizedBaseUrl + '/').then(response => response.text());
if (!homepage.includes('青阳寻雪') || !homepage.includes('/portfolio-assets/motion.css') || homepage.includes('motion-toggle') || homepage.includes('/portfolio-assets/resume.pdf')) {
  failures.push({route:'homepage identity / motion / privacy', status:'content mismatch'});
}

if (failures.length > 0) {
  console.error("Deployment verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure.route}: ${failure.status}`);
  }
  process.exit(1);
}

console.log("Deployment verification passed.");
