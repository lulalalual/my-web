'use strict';

const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const json = value => esc(JSON.stringify(value, null, 2));
const number = (value, digits = 4) => Number(value).toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
const metrics = [
  ['task_completion', '任务完成', 0.32],
  ['tool_correctness', '工具选择', 0.25],
  ['argument_correctness', '参数匹配', 0.20],
  ['step_efficiency', '步骤效率', 0.13],
  ['plan_adherence', '计划执行', 0.10],
];
const names = {traj_good: '按计划完成', traj_bad: '回避所需工具', traj_gaming: '重复调用工具'};
const descriptions = {
  traj_good: '查询规则后计算金额，使用两步完成预设任务。',
  traj_bad: '只请求补充信息，没有使用任务要求的工具。',
  traj_gaming: '回答命中关键词，但重复查询、额外澄清并超出预算。',
};
const findingNames = {
  redundant_tool_calls: '重复等价工具调用',
  clarification_abuse: '任务已给定工具，仍发起额外澄清',
  step_budget_overrun: '调用步骤超出预算',
  tool_avoidance: '完全避开任务要求的工具',
};
const severityNames = {high: '高优先级', medium: '中优先级', low: '低优先级'};
const failureNames = {task_completion_error: '任务完成错误', tool_selection_error: '工具选择错误', argument_error: '参数错误', step_efficiency_error: '步骤效率错误', plan_execution_drift: '计划执行偏移', ungrounded_final_answer: '缺少工具依据的回答'};
const root = document.documentElement;
const themeButton = $('theme-toggle');
let parentObserver;

function setTheme(theme) {
  root.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  themeButton.querySelector('span').textContent = root.dataset.theme === 'dark' ? '浅色' : '深色';
  themeButton.setAttribute('aria-label', `切换为${root.dataset.theme === 'dark' ? '浅色' : '深色'}报告`);
}

function syncParentTheme() {
  try {
    if (window.parent === window) return false;
    const host = parent.document.documentElement;
    setTheme(host.dataset.theme || (host.classList.contains('dark') ? 'dark' : 'light'));
    const portfolio = parent.document.getElementById('portfolio-root');
    if (portfolio) {
      const styles = parent.getComputedStyle(portfolio);
      for (const token of ['bg', 'surface', 'ink', 'muted', 'accent', 'line', 'soft']) {
        const value = styles.getPropertyValue(`--${token}`).trim();
        if (value) root.style.setProperty(`--${token}`, value);
      }
    }
    return true;
  } catch { return false; }
}

setTheme(new URLSearchParams(location.search).get('theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
if (syncParentTheme()) {
  themeButton.hidden = true;
  parentObserver = new MutationObserver(syncParentTheme);
  parentObserver.observe(parent.document.documentElement, {attributes: true, attributeFilter: ['data-theme', 'class']});
}
themeButton.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
window.addEventListener('message', event => {
  if (event.source !== window.parent || event.origin !== location.origin) return;
  if (event.data?.type === 'portfolio:theme') syncParentTheme();
});
window.addEventListener('pagehide', () => parentObserver?.disconnect());
window.addEventListener('pageshow', event => {
  if (event.persisted && parentObserver) {
    syncParentTheme();
    parentObserver.observe(parent.document.documentElement, {attributes: true, attributeFilter: ['data-theme', 'class']});
  }
});

function traceMarkup(trajectory) {
  const steps = trajectory.tool_calls.map(call => `<li class="trace-step"><h4>${esc(call.name)}</h4><pre>${json(call.arguments)}</pre><p>${call.output ? esc(call.output) : '原轨迹未记录工具输出'}</p></li>`).join('');
  return `<div class="trace-label">原计划 · plan</div><p class="trace-text">${esc(trajectory.plan)}</p><div class="trace-label">预设工具记录 · ${trajectory.tool_calls.length} 步</div><ol class="trace-steps">${steps}</ol><div class="trace-label">原最终回答 · final_answer</div><p class="answer">${esc(trajectory.final_answer)}</p><div class="trace-label">手工策略特征 · policy_features</div><pre class="json-block">${json(trajectory.policy_features)}</pre>`;
}

function trajectoryMarkup(score, rows, report) {
  const trajectory = rows.trajectories.find(item => item.id === score.trajectory_id);
  if (!trajectory) throw new Error('Missing original trajectory');
  const findings = report.policy_gaming[trajectory.id] || [];
  const tone = findings.length ? 'warning' : 'positive';
  const metricRows = metrics.map(([key, label]) => `<div class="metric"><div class="metric-caption"><span>${label}</span><strong>${number(score.metrics[key])}</strong></div><div class="metric-track" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${score.metrics[key]}"><div class="metric-fill" style="width:${Math.max(0, Math.min(100, score.metrics[key] * 100))}%"></div></div></div>`).join('');
  const flags = findings.length ? `<ul>${findings.map(finding => `<li><code>${esc(finding.kind)} · ${esc(severityNames[finding.severity] || finding.severity)}</code><span>${esc(findingNames[finding.kind] || finding.explanation)}</span></li>`).join('')}</ul>` : '<p class="empty-findings">本示例未触发启发式投机规则。</p>';
  const failures = report.failure_modes[trajectory.id] || [];
  return `<article class="trajectory ${tone}" aria-labelledby="title-${esc(trajectory.id)}"><div class="trajectory-top"><div class="trajectory-name"><div><h3 id="title-${esc(trajectory.id)}">${esc(names[trajectory.id] || trajectory.id)}</h3><span class="trajectory-id">${esc(trajectory.id)}</span></div><span class="status-tag">${findings.length ? `${findings.length} 项投机提示` : '未触发提示'}</span></div><div class="score"><strong>${number(score.reward)}</strong><span>/ 1 · 规则奖励</span></div><p class="trajectory-description">${esc(descriptions[trajectory.id] || '')}</p></div><div class="metrics">${metricRows}</div><div class="findings"><div class="findings-heading"><span class="finding-dot" aria-hidden="true"></span>策略投机检查</div>${flags}</div><details class="plain-details"><summary>展开原轨迹 · ${trajectory.tool_calls.length} 步</summary><div class="details-body">${traceMarkup(trajectory)}</div></details><details class="plain-details"><summary>失败归因与原评分字段</summary><div class="details-body"><p class="trace-text">${failures.length ? failures.map(mode => esc(failureNames[mode] || mode)).join(' / ') : '本示例未生成失败归因。'}</p><div class="trace-label">原 score 记录</div><pre class="json-block">${json(score)}</pre>${findings.length ? `<div class="trace-label">原投机提示（含英文说明）</div><pre class="json-block">${json(findings)}</pre>` : ''}</div></details></article>`;
}

function preferencesMarkup(pairs) {
  return pairs.map(pair => `<article class="preference-pair"><div class="pair-person pair-chosen"><span>Chosen</span><strong>${esc(names[pair.chosen_trajectory_id] || pair.chosen_trajectory_id)}</strong><code>${esc(pair.chosen_trajectory_id)}</code></div><span class="pair-arrow" aria-label="优于"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m8 5 7 7-7 7"/></svg></span><div class="pair-person"><span>Rejected</span><strong>${esc(names[pair.rejected_trajectory_id] || pair.rejected_trajectory_id)}</strong><code>${esc(pair.rejected_trajectory_id)}</code></div><div class="pair-margin">原奖励分差<strong>${number(pair.margin)}</strong></div></article>`).join('');
}

function exportMarkup(type, records, file) {
  const labels = {
    sft: ['SFT', '2 条高分轨迹，包括已被标记的重复调用轨迹。'],
    dpo: ['DPO', '同题 chosen / rejected 偏好记录，保留奖励分差。'],
    grpo: ['GRPO', '同题三条候选组成一组，保留各自工具记录、奖励和五项指标。'],
  };
  const [title, description] = labels[type];
  const fields = [...new Set(records.flatMap(record => Object.keys(record)))];
  return `<article class="export-item"><div class="export-head"><div class="export-name"><strong>${title}</strong><span>${records.length} ${type === 'grpo' ? '组' : '条'}原记录</span></div><div class="export-description"><p>${description}</p><div class="field-list" aria-label="实际顶层字段">${fields.map(field => `<code>${esc(field)}</code>`).join('')}</div></div><a class="download-button" href="${file}" download="${file.split('/').pop()}">下载 JSONL <span aria-hidden="true">↘</span></a></div><details class="plain-details"><summary>展开全部 ${records.length} ${type === 'grpo' ? '组' : '条'}原记录与嵌套字段</summary><div class="details-body">${records.map((record, index) => `<div class="json-record"><h4>原记录 ${index + 1}${record.trajectory_id ? ` · ${esc(record.trajectory_id)}` : ''}</h4><pre class="json-block">${json(record)}</pre></div>`).join('')}</div></details></article>`;
}

function renderTraining(training) {
  const labels = {ask_clarify: '请求澄清', use_calculator: '使用计算器', use_search: '检索规则'};
  $('weights-list').innerHTML = Object.entries(training.final_weights).map(([feature, value]) => `<div class="weight-row"><div><strong>${esc(labels[feature] || feature)}</strong><code>${esc(feature)}</code></div><div class="weight-value"><span class="initial">${number(training.initial_weights[feature], 6)} → </span><span class="final ${value < 0 ? 'negative' : ''}">${value > 0 ? '+' : ''}${number(value, 6)}</span></div></div>`).join('');
  const values = training.loss_history;
  const min = Math.floor(Math.min(...values) * 100) / 100;
  const max = Math.ceil(Math.max(...values) * 100) / 100;
  const x = index => 36 + index * (340 / Math.max(1, values.length - 1));
  const y = value => 124 - (value - min) / (max - min || 1) * 96;
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  $('loss-range').textContent = `${number(values[0], 6)} → ${number(values.at(-1), 6)}`;
  $('loss-chart').innerHTML = `<svg viewBox="0 0 400 158" role="img" aria-label="原报告八轮损失值从 ${values[0]} 降至 ${values.at(-1)}，仅为手工特征实验"><line class="grid-line" x1="36" y1="28" x2="376" y2="28"/><line class="grid-line" x1="36" y1="76" x2="376" y2="76"/><line class="grid-line" x1="36" y1="124" x2="376" y2="124"/><text x="0" y="32">${number(max, 2)}</text><text x="0" y="80">${number((min + max) / 2, 2)}</text><text x="0" y="128">${number(min, 2)}</text><polyline class="loss-line" points="${points}"/>${values.map((value, index) => `<circle cx="${x(index)}" cy="${y(value)}" r="3"><title>第 ${index + 1} 轮：${value}</title></circle><text x="${x(index)}" y="148" text-anchor="middle">${index + 1}</text>`).join('')}</svg>`;
  $('loss-values').innerHTML = values.map(value => `<li>${number(value, 6)}</li>`).join('');
}

async function readLocal(path, parse = 'json') {
  const response = await fetch(path, {credentials: 'same-origin'});
  if (!response.ok) throw new Error(`Local data unavailable (${response.status})`);
  return parse === 'json' ? response.json() : response.text();
}

async function start() {
  try {
    const base = './data/original/';
    const files = ['sft_trajectories.jsonl', 'dpo_pairs.jsonl', 'grpo_groups.jsonl'];
    const [report, rows, ...texts] = await Promise.all([readLocal(`${base}optimizer_report.json`), readLocal('./data/training_rows.json'), ...files.map(file => readLocal(`${base}training_data/${file}`, 'text'))]);
    if (report.scores.length !== 3 || rows.trajectories.length !== 3 || report.preference_pairs.length !== 2) throw new Error('Unexpected source data shape');
    const task = rows.tasks[0];
    const overview = report.alignment_report.overview;
    const findings = report.alignment_report.quality_gates.policy_gaming_findings;
    const stats = [[overview.tasks, '个手工示例任务'], [overview.trajectories, '条预设工具轨迹'], [overview.preference_pairs, '对奖励偏好数据'], [findings, '项启发式投机提示']];
    $('summary').innerHTML = stats.map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
    $('task-instruction').textContent = task.instruction;
    $('task-id').textContent = task.id;
    $('task-budget').textContent = `${task.max_steps} 步`;
    $('raw-task').textContent = JSON.stringify(task, null, 2);
    $('trajectory-grid').innerHTML = report.scores.map(score => trajectoryMarkup(score, rows, report)).join('');
    $('reward-rules').innerHTML = metrics.map(([key, label, weight]) => `<div><strong>${label}</strong><span>${Math.round(weight * 100)}%</span><code>${key}</code></div>`).join('');
    $('preference-list').innerHTML = preferencesMarkup(report.preference_pairs);
    $('export-list').innerHTML = ['sft', 'dpo', 'grpo'].map((type, index) => exportMarkup(type, texts[index].trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)), `${base}training_data/${files[index]}`)).join('');
    renderTraining(report.lightweight_training);
    $('updated-policy').textContent = JSON.stringify(report.updated_policy, null, 2);
    $('raw-report').textContent = JSON.stringify(report, null, 2);
    $('report-content').hidden = false;
    $('load-status').hidden = true;
    if (window.parent !== window) window.parent.postMessage({type: 'portfolio:ready'}, location.origin);
  } catch {
    $('load-status').innerHTML = '暂时未能读取报告数据。可刷新页面，或直接<a href="./data/original/optimizer_report.json">查看原始 JSON</a>。';
  }
}

start();
