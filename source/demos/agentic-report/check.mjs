import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(root, '../..');
const read = file => fs.readFile(path.join(root, file), 'utf8');
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {innerHTML: '', textContent: '', hidden: true, attrs: {}, events: {}, setAttribute(key, value) {this.attrs[key] = value;}, querySelector() {return this.child ||= {textContent: ''};}, addEventListener(type, callback) {this.events[type] = callback;}});
  return elements.get(id);
}
const document = {documentElement: {dataset: {}, style: {setProperty() {}}}, getElementById: element};
const window = {addEventListener() {}};
window.parent = window;
const pending = [];
const context = {document, window, location: new URL('http://localhost/demos/agentic-report/'), URLSearchParams, matchMedia: () => ({matches: false}), MutationObserver: class {observe() {} disconnect() {}}, console, fetch: file => {const work = read(file).then(text => ({ok: true, json: async () => JSON.parse(text), text: async () => text})); pending.push(work); return work;}};
vm.createContext(context);
vm.runInContext(await read('app.js'), context);
await Promise.all(pending);
await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(element('report-content').hidden, false, 'Report should render from actual files');
assert.equal(element('load-status').hidden, true);
assert.equal(element('task-id').textContent, 'travel_refund');
assert.equal(element('task-budget').textContent, '3 步');
const rendered = [...elements.values()].map(el => el.innerHTML).join('\n');
assert.equal((element('trajectory-grid').innerHTML.match(/class="trajectory /g) || []).length, 3);
assert.equal((element('trajectory-grid').innerHTML.match(/role="meter"/g) || []).length, 15);
assert.equal((element('preference-list').innerHTML.match(/class="preference-pair"/g) || []).length, 2);
for (const value of ['1', '0.33', '0.8133']) assert.ok(element('trajectory-grid').innerHTML.includes(`<strong>${value}</strong>`));
for (const value of ['0.1867', '0.67']) assert.ok(element('preference-list').innerHTML.includes(`<strong>${value}</strong>`));
for (const kind of ['redundant_tool_calls', 'clarification_abuse', 'step_budget_overrun', 'tool_avoidance']) assert.ok(element('trajectory-grid').innerHTML.includes(kind));
assert.equal((element('export-list').innerHTML.match(/class="json-record"/g) || []).length, 5);
for (const field of ['messages', 'tool_calls', 'chosen', 'rejected', 'candidates', 'metrics', 'margin']) assert.ok(element('export-list').innerHTML.includes(field));
const sourceReport = JSON.parse(await read('data/original/optimizer_report.json'));
assert.deepEqual(JSON.parse(element('raw-report').textContent), sourceReport);
assert.deepEqual(JSON.parse(element('updated-policy').textContent), sourceReport.updated_policy);
assert.ok(element('loss-range').textContent.includes('0.999693'));
assert.ok(element('loss-range').textContent.includes('0.955936'));
element('theme-toggle').events.click();
assert.equal(document.documentElement.dataset.theme, 'dark');
element('theme-toggle').events.click();
assert.equal(document.documentElement.dataset.theme, 'light');
const manifest = JSON.parse(await read('data/source-manifest.json'));
for (const item of manifest.original_files) {
  const hash = crypto.createHash('sha256').update(await fs.readFile(path.join(root, item.public_relative_path))).digest('hex');
  assert.equal(hash, item.sha256);
  assert.equal(item.byte_identical, true);
}
const html = await read('index.html');
const links = [...html.matchAll(/(?:href|src)="([^"]+)"/g), ...rendered.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1]);
const localLinks = [...new Set(links.filter(link => !link.startsWith('#')))];
for (const link of localLinks) {
  assert.ok(!/^https?:|^\/\//.test(link), 'No external resource dependency');
  await fs.access(link.startsWith('/') ? path.join(site, link.slice(1)) : path.join(root, link));
}
const publicFiles = ['index.html', 'app.js', 'style.css', 'data/source-manifest.json', 'data/training_rows.json', ...manifest.original_files.map(item => item.public_relative_path)];
for (const file of publicFiles) assert.ok(!/\b[A-Za-z]:[\\/]|file:\/\/|Users[\\/]hp/.test(await read(file)), `No local absolute paths in ${file}`);
const css = await read('style.css');
assert.ok(css.includes('@media(max-width:420px)'));
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
assert.ok(!/setInterval|requestAnimationFrame/.test(await read('app.js')));
const result = {method: 'Node VM with local-file fetch; data/link/hash checks, not browser layout QA', original_files: manifest.original_files.length, exact_original_bytes: manifest.original_files.reduce((sum, item) => sum + item.bytes, 0), rendered_trajectories: 3, reward_meters: 15, preference_pairs: 2, export_records: {sft: 2, dpo: 2, grpo: 1}, local_links_checked: localLinks.length, raw_report_matches: true, theme_toggle_checked: true, private_absolute_paths_found: 0, continuous_animation_loops: 0, browser_layout_qa: 'Parent integration QA pending; 320px/light/dark/iframe checks required'};
await fs.writeFile(path.join(root, 'verification.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
