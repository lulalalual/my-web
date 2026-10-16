// Rules and scoring adapted from Pixel Motion Factory motion-library/search.ts.
// Empty requests preserve registry order, matching the original Gallery API.
const rules=[
  {test:/风险|损失|收益|回报|代价|不对称|risk|loss|gain|payoff|trade.?off/i,ids:['asymmetry-balance','payoff-curve','probability-fan','scale-bars'],reason:'风险与损益需要尺度或曲线'},
  {test:/概率|可能性|不确定|probability|uncertain|chance/i,ids:['probability-fan','decision-tree','threshold-crossing'],reason:'概率需要分支图形'},
  {test:/比较|差距|大小|规模|倍数|对比|compare|scale|magnitude/i,ids:['scale-bars','asymmetry-balance','ratio-blocks'],reason:'尺度比较适合定量图形'},
  {test:/比例|占比|份额|分配|ratio|share|proportion/i,ids:['ratio-blocks','scale-bars'],reason:'比例适合面积编码'},
  {test:/阈值|临界|触发|拐点|threshold|critical|trigger/i,ids:['threshold-crossing','payoff-curve'],reason:'临界变化适合阈值线'},
  {test:/因果|原因|机制|导致|结果|cause|effect|mechanism/i,ids:['causal-chain','feedback-loop'],reason:'因果需要有向连接'},
  {test:/反馈|循环|迭代|闭环|feedback|loop|iterate/i,ids:['feedback-loop','causal-chain'],reason:'反馈需要循环路径'},
  {test:/瓶颈|吞吐|约束|容量|bottleneck|capacity|constraint/i,ids:['bottleneck-flow','threshold-crossing'],reason:'容量限制需要收束流'},
  {test:/决策|选择|方案|分支|decision|choice|option/i,ids:['decision-tree','probability-fan'],reason:'选择适合决策分叉'},
  {test:/网络|扩散|传播|连接|network|spread|diffusion/i,ids:['network-spread','hub-spoke'],reason:'关系适合节点连接'},
  {test:/时间|历程|先后|事件|timeline|history|event/i,ids:['event-timeline','staged-process'],reason:'时间需要位置编码'},
  {test:/流程|步骤|阶段|过程|process|step|stage|workflow/i,ids:['staged-process','word-ladder'],reason:'阶段需要顺序编码'},
  {test:/结构|重组|归类|转化|transform|structure|group/i,ids:['structure-transform','hub-spoke'],reason:'重组适合空间迁移'},
  {test:/关键词|强调|观点|文字|标题|keyword|emphasis|headline/i,ids:['split-emphasis','assertion-contrast','word-ladder'],reason:'语义主要靠文字强调'}
];

export function searchItems(items, query = '') {
  const raw = String(query ?? '').slice(0, 240);
  if (!raw) return items.map(item => ({ ...item, score: 0, reasons: [] }));
  const q = raw.trim().toLowerCase();
  const matched = rules.filter(rule => rule.test.test(q));
  return items.map(item => {
    const asset = item.asset;
    let score = 0;
    const reasons = [];
    for (const rule of matched) {
      const rank = rule.ids.indexOf(asset.id);
      if (rank >= 0) { score += 100 - rank * 18; reasons.push(rule.reason); }
    }
    for (const tag of asset.semantic_tags) {
      if (q && q.includes(tag.toLowerCase())) { score += 14; reasons.push(`标签：${tag}`); }
    }
    if (q && (asset.title.toLowerCase().includes(q) || q.includes(asset.title.toLowerCase()))) {
      score += 20;
      reasons.push('名称匹配');
    }
    if (matched.length && asset.visual_category === '动态文字' && !matched.some(rule => rule.ids.includes(asset.id))) score -= 15;
    return { ...item, score, reasons: [...new Set(reasons)] };
  }).filter(item => !q || item.score > 0).sort((a, b) => b.score - a.score || a.asset.id.localeCompare(b.asset.id));
}
