const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error("Usage: node scripts/verify-deployment.mjs <base-url>");
  process.exit(1);
}

const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

const routes = [
  "/api/health",
  "/",
  "/projects",
  "/projects/interview-master",
  "/projects/tower-defense-duo",
  "/notes",
  "/login",
];

const failures = [];

for (const route of routes) {
  const url = `${normalizedBaseUrl}${route}`;
  const response = await fetch(url, {
    redirect: "manual",
  });

  const acceptable =
    response.status >= 200 && response.status < 400;

  console.log(`${response.status} ${route}`);

  if (!acceptable) {
    failures.push({ route, status: response.status });
  }
}

if (failures.length > 0) {
  console.error("Deployment verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure.route}: ${failure.status}`);
  }
  process.exit(1);
}

console.log("Deployment verification passed.");
