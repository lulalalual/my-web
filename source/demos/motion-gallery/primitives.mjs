/** Original, dependency-free SVG knowledge visuals. Frame is the sole animation clock. */
export function renderAsset(id, frame, durationFrames, parameters = {}, theme = 'warm-editorial', width = 1920, height = 1080) {
  const ids = ['split-emphasis','word-ladder','assertion-contrast','scale-bars','asymmetry-balance','ratio-blocks','probability-fan','payoff-curve','threshold-crossing','causal-chain','feedback-loop','bottleneck-flow','decision-tree','network-spread','hub-spoke','event-timeline','staged-process','structure-transform'];
  if (!ids.includes(id)) throw new RangeError(`Unknown asset: ${id}`);
  const finite = (v, fallback, lo, hi) => typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
  const W = finite(width, 1920, 320, 7680), H = finite(height, 1080, 240, 4320);
  const n = Math.max(1, Math.floor(finite(durationFrames, 90, 1, 100000)));
  const f = Math.max(0, Math.min(n - 1, finite(frame, 0, 0, n - 1)));
  const t = n === 1 ? 1 : f / (n - 1);
  const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const reveal = (start = 0, span = .5) => ease((t - start) / span);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = (v, fallback = '', max = 50) => { const s=typeof v === 'string' || typeof v === 'number' ? String(v) : fallback;if(Array.from(s).length>max)throw new RangeError(`Text exceeds ${max} characters`);return esc(s); };
  const fitSize = (s, size, box, minimum=22) => { const units=Array.from(String(s)).reduce((n,c)=>n+(/[\x00-\x7f]/.test(c)?.55:1),0);const fitted=Math.min(size,Math.floor(box/Math.max(1,units)));if(fitted<minimum)throw new RangeError(`Text too wide for ${box}px box: ${s}`);return fitted; };
  const list = (v, fallback, max = 6) => { const supplied=Array.isArray(v)?v:[];const count=Math.min(max,Math.max(supplied.length,fallback.length));return Array.from({length:count},(_,i)=>clean(supplied[i],fallback[i]??`项 ${i+1}`,25)); };
  const num = (v, d = 0, lo = -1e6, hi = 1e6) => finite(v, d, lo, hi);
  const values = Array.isArray(parameters.values) && parameters.values.length ? parameters.values.slice(0,6).map((x,i) => num(x, [30,65,95][i] ?? 50)) : [30,65,95];
  const title = clean(parameters.title, '把复杂概念看清楚', 38), subtitle = clean(parameters.subtitle, '', 72);
  const labels = list(parameters.labels, ['起点','变化','结果']);
  const dark = theme === 'dark-technical';
  const C = dark ? {bg:'#101012',fg:'#F5F2ED',muted:'#B5ADA6',accent:'#FF6A42',soft:'#2A2421',line:'#65534B',secondary:'#FFC0A6'} : {bg:'#F4EFE5',fg:'#211C18',muted:'#665B50',accent:'#B38035',soft:'#E9DDC8',line:'#B6A99A',secondary:'#D3A35A'};
  const A = C.accent, F = C.fg, M = C.muted, L = C.line, S = C.soft;
  const line = (x1,y1,x2,y2,color=L,sw=3,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" ${extra}/>`;
  const rect = (x,y,w,h,fill=S,rx=12,extra='') => `<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" rx="${rx}" fill="${fill}" ${extra}/>`;
  const circle = (x,y,r,fill=A,extra='') => `<circle cx="${x}" cy="${y}" r="${Math.max(0,r)}" fill="${fill}" ${extra}/>`;
  const txt = (x,y,s,size=40,color=F,anchor='start',weight=600,extra='') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" dominant-baseline="middle" ${extra}>${s}</text>`;
  const path = (d,color=A,sw=5,fill='none',extra='') => `<path d="${d}" stroke="${color}" stroke-width="${sw}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const arrow = (x1,y1,x2,y2,color=A,sw=5) => { const a=Math.atan2(y2-y1,x2-x1), h=18; return line(x1,y1,x2,y2,color,sw)+path(`M${x2-h*Math.cos(a-.5)} ${y2-h*Math.sin(a-.5)} L${x2} ${y2} L${x2-h*Math.cos(a+.5)} ${y2-h*Math.sin(a+.5)}`,color,sw); };
  const amount = v => Number.isFinite(v) ? String(Math.round(v*10)/10) : '0';
  let g = '';
  switch(id) {
    case 'split-emphasis': {
      const words=list(parameters.labels,['风险','不对称','选择'],4); const xs=[260,680,1120,1500];
      g += line(260,515,1660,515,L,2);
      words.forEach((w,i)=>{const q=reveal(i*.16,.38),y=550-(i%2?120:0)*q,box=i===3?275:Math.min(400,xs[i+1]-xs[i]-35);g+=txt(xs[i],y,w,fitSize(w,112,box,28),i===1?A:F,'start',750,`opacity="${q}"`)+line(xs[i],600,xs[i]+Math.min(300,w.length*75,1775-xs[i]),600,i===1?A:L,7,`opacity="${q}"`);});
      break;
    }
    case 'word-ladder': {
      const words=list(parameters.labels,['观察','理解','行动','复盘'],4);
      words.forEach((w,i)=>{let q=reveal(i*.15,.35),x=320+i*330,y=685-i*125;g+=rect(x,y,285,85,i===words.length-1?A:S,8,`opacity="${q}"`);if(q>.5)g+=txt(x+142,y+45,w,fitSize(w,45,250),i===words.length-1?(dark?C.bg:F):F,'middle',700);if(i)g+=arrow(x-45,y+42,x-10,y+42,L,3);});
      break;
    }
    case 'assertion-contrast': {
      const a=labels[0]??'表面判断',b=labels[1]??'关键判断',q=reveal(.35,.4);
      g+=rect(190,300,650,370,S,24)+rect(1080,300,650,370,dark?'#32241E':'#E8D7B7',24);
      g+=txt(515,425,a,72,M,'middle',600)+txt(515,555,'? ',100,M,'middle',400);
      g+=line(910,490,1020,490,A,6)+circle(1020,490,9,A);
      if(q>.5)g+=txt(1405,475,b,76,F,'middle',750);g+=line(1180,560,1630,560,A,8,`opacity="${q}"`);
      break;
    }
    case 'scale-bars': {
      const vs=values.slice(0,5),mx=Math.max(1,...vs.map(v=>Math.abs(v))),q=reveal(.08,.6);
      g+=txt(470,255,`共同量程 0 — ${amount(mx)}`,30,M);
      vs.forEach((v,i)=>{let y=325+i*112,w=1080*Math.abs(v)/mx*q,label=labels[i]??`项${i+1}`;g+=txt(180,y+34,label,fitSize(label,35,260),M)+line(470,y+33,1550,y+33,L,2)+rect(470,y+11,w,44,i===vs.length-1?A:C.secondary,5)+txt(1590,y+34,amount(v),41,F);});
      break;
    }
    case 'asymmetry-balance': {
      const left=Math.abs(values[0]??25),right=Math.abs(values[1]??75),ratio=(right-left)/Math.max(1,left+right),tilt=ratio*90*reveal(.1,.6);
      g+=path(`M960 410 L${660} ${410-tilt} M960 410 L${1260} ${410+tilt}`,F,9)+path('M960 415 L870 765 L1050 765 Z',L,3,S);
      g+=line(660,410-tilt,660,620-tilt,L,3)+line(1260,410+tilt,1260,620+tilt,L,3);
      g+=path(`M500 ${620-tilt} Q660 ${730-tilt} 820 ${620-tilt} Z`,A,4,S)+path(`M1100 ${620+tilt} Q1260 ${730+tilt} 1420 ${620+tilt} Z`,A,4,dark?'#3B2922':'#E2BF88');
      g+=txt(660,550-tilt,amount(left),58,F,'middle')+txt(1260,550+tilt,amount(right),58,A,'middle')+txt(660,785-tilt,labels[0],34,M,'middle')+txt(1260,785+tilt,labels[1],34,M,'middle');
      break;
    }
    case 'ratio-blocks': {
      const a=Math.max(0,Math.abs(values[0]??30)),b=Math.max(0,Math.abs(values[1]??70)),total=Math.max(1,a+b),wa=1200*a/total,q=reveal(.05,.7);
      g+=txt(360,315,labels[0],42,M)+txt(1450,315,labels[1],42,M,'end');
      g+=rect(360,390,1200,280,'none',18,`stroke="${L}" stroke-width="2"`)+rect(360,390,wa*q,280,A,18)+rect(360+wa*q,390,(1200-wa)*q,280,dark?'#6E4335':'#D7B37A',18);
      if(q>.5)g+=txt(360+wa*q/2,530,`${amount(a/total*100)}%`,67,dark?C.bg:F,'middle',750)+txt(360+wa*q+(1200-wa)*q/2,530,`${amount(b/total*100)}%`,67,F,'middle',750);
      break;
    }
    case 'probability-fan': {
      const cx=340,cy=690, fan=list(parameters.labels,['低','中','高'],3), angles=[-.85,-.48,-.15];
      g+=circle(cx,cy,20,A);
      fan.forEach((s,i)=>{let q=reveal(i*.13,.5),x=cx+600*Math.cos(angles[i]),y=cy+600*Math.sin(angles[i]);g+=arrow(cx+25,cy-10,cx+(x-cx)*q,cy+(y-cy)*q,i===2?A:L,4);if(q>.5)g+=circle(x,y,22,i===2?A:C.secondary)+txt(x+35,y-18,s,40,F)+txt(x+35,y+35,`${amount(Math.max(0,values[i]??0))}%`,35,M);});
      break;
    }
    case 'payoff-curve': {
      g+=line(280,750,1650,750,F,4)+line(280,750,280,270,F,4)+txt(1600,795,labels[0]??'投入',32,M)+txt(240,260,labels[1]??'收益',32,M);
      const count=42, max=Math.floor(count*reveal(.05,.8)); let d=''; const steep=num(parameters.steepness,1.5,.3,4);
      for(let i=0;i<=max;i++){let x=300+i*31,y=720-405*Math.pow(i/count,steep);d+=`${i?'L':'M'}${x} ${y} `;}
      g+=path(d,A,8)+circle(300+max*31,720-405*Math.pow(max/count,steep),12,A);
      g+=line(980,750,980,430,L,2,'stroke-dasharray="10 12"')+txt(985,405,labels[2]??'拐点',36,A);
      break;
    }
    case 'threshold-crossing': {
      const threshold=num(parameters.threshold,60,0,100),v=num(parameters.value,values[0]??75,0,100),x=350+1200*threshold/100,mark=350+1200*v/100*reveal(.05,.8);
      g+=line(350,590,1550,590,L,12)+line(350,590,mark,590,A,12)+line(x,405,x,685,F,4,'stroke-dasharray="12 12"')+circle(mark,590,21,A);
      g+=txt(x,360,`${amount(threshold)} ${labels[1]??'阈值'}`,41,F,'middle')+txt(mark,730,`${amount(v*reveal(.05,.8))} ${labels[0]??'当前'}`,44,A,'middle');
      break;
    }
    case 'causal-chain': {
      const ls=list(parameters.labels,['原因','机制','结果','影响'],4);
      ls.forEach((s,i)=>{let x=145+i*430,q=reveal(i*.13,.38);g+=rect(x,400,345,190,i===ls.length-1?A:S,22,`opacity="${q}"`);if(q>.5)g+=txt(x+172,495,s,fitSize(s,49,310),i===ls.length-1?(dark?C.bg:F):F,'middle',700);if(i<ls.length-1)g+=arrow(x+355,495,x+415,495,A,5);});
      break;
    }
    case 'feedback-loop': {
      const ls=list(parameters.labels,['输入','反馈','修正','再行动'],4), pos=[[960,300],[1430,520],[960,735],[490,520]];
      for(let i=0;i<4;i++){const [x,y]=pos[i],[xx,yy]=pos[(i+1)%4],q=reveal(i*.12,.45);g+=arrow(x+(xx-x)*.26,y+(yy-y)*.26,x+(xx-x)*.74*q,y+(yy-y)*.74*q,L,4);g+=circle(x,y,79,i===1?A:S)+txt(x,y,ls[i],37,i===1?C.bg:F,'middle',700);}
      g+=txt(960,520,'↻',115,A,'middle',500);
      break;
    }
    case 'bottleneck-flow': {
      const flow=reveal(.05,.75), neck=num(parameters.value,25,5,100),small=neck*3;
      for(let i=0;i<5;i++){let y=350+i*90;g+=line(240,y,720,y,L,6)+circle(245+480*flow,y,10,A);}
      g+=path(`M720 350 L940 ${520-small/2} L1120 ${520-small/2} L1340 350 M720 710 L940 ${520+small/2} L1120 ${520+small/2} L1340 710`,A,6);
      g+=rect(955,520-small/2,150,small,dark?'#493027':'#E1C18F',5)+txt(1025,520,`${amount(neck)}%`,44,F,'middle')+txt(1030,760,labels[0]??'瓶颈容量',37,M,'middle');
      for(let i=0;i<2;i++)g+=arrow(1350,440+i*160,1610,440+i*160,L,4);
      break;
    }
    case 'decision-tree': {
      const ls=list(parameters.labels,['选择','方案A','方案B','收益','风险'],5), points=[[280,520],[760,350],[760,690],[1390,300],[1390,760]];
      [[0,1],[0,2],[1,3],[2,4]].forEach(([a,b],i)=>{const [x,y]=points[a],[xx,yy]=points[b],q=reveal(i*.12,.6);g+=arrow(x+70,y,xx-90*q,yy,L,4);});
      points.forEach(([x,y],i)=>{let q=reveal(i*.09,.4);g+=rect(x-100,y-56,200,112,i===0?A:S,16,`opacity="${q}"`);if(q>.5)g+=txt(x,y,ls[i],fitSize(ls[i],38,174),i===0?(dark?C.bg:F):F,'middle',650);});
      break;
    }
    case 'network-spread': {
      const pts=[[960,520],[560,330],[1350,300],[520,660],[1370,670],[950,260],[960,775]];
      pts.slice(1).forEach(([x,y],i)=>{let q=reveal(i*.1,.42);g+=line(960,520,960+(x-960)*q,520+(y-520)*q,i%2?A:L,4)+circle(x,y,37*q,i%2?A:C.secondary)+txt(x,y+70,labels[i%labels.length],27,M,'middle',500,`opacity="${q}"`);});
      g+=circle(960,520,68,A)+txt(960,520,labels[0],39,C.bg,'middle');
      break;
    }
    case 'hub-spoke': {
      const ls=list(parameters.labels,['核心','证据','场景','限制','行动'],5), pts=[[960,505],[460,350],[1460,350],[460,690],[1460,690]];
      pts.slice(1).forEach(([x,y],i)=>{let q=reveal(.08+i*.1,.4);g+=path(`M960 505 Q960 ${y} ${960+(x-960)*q} ${505+(y-505)*q}`,L,4)+rect(x-125,y-62,250,124,S,15,`opacity="${q}"`)+txt(x,y,ls[i+1],40,F,'middle',650,`opacity="${q}"`);});
      g+=circle(960,505,100,A)+txt(960,505,ls[0],51,C.bg,'middle');
      break;
    }
    case 'event-timeline': {
      const ls=list(parameters.labels,['起点','转折','证据','结论'],4), q=reveal(.05,.75);g+=line(280,540,280+1360*q,540,A,6);
      ls.forEach((s,i)=>{let x=300+i*430,a=reveal(i*.18,.3);g+=circle(x,540,17,a?A:S)+line(x,540,x,i%2?380:690,L,3,`opacity="${a}"`)+txt(x,i%2?340:725,s,42,F,'middle',650,`opacity="${a}"`);});
      break;
    }
    case 'staged-process': {
      const ls=list(parameters.labels,['观察','建模','验证','迭代'],4);
      const pts=[[350,365],[785,635],[1220,365],[1620,635]];
      g+=path('M350 365 L785 635 L1220 365 L1620 635',L,10);
      const progress=reveal(.05,.83)*3;
      for(let i=0;i<3;i++){const [x,y]=pts[i],[xx,yy]=pts[i+1],q=Math.max(0,Math.min(1,progress-i));g+=line(x,y,x+(xx-x)*q,y+(yy-y)*q,A,13);}
      ls.forEach((s,i)=>{const [x,y]=pts[i],q=reveal(i*.2,.3);g+=circle(x,y,49,q?A:S)+txt(x,y,`0${i+1}`,34,q?C.bg:M,'middle',750)+txt(x,y+(i%2?-110:115),s,48,F,'middle',700,`opacity="${q}"`);});
      break;
    }
    case 'structure-transform': {
      const q=reveal(.08,.75),ls=list(parameters.labels,['分散','归类','结构'],3);
      for(let i=0;i<6;i++){const x=340+(i%3)*160,y=375+Math.floor(i/3)*190,targetX=1130+(i%2)*210,targetY=310+Math.floor(i/2)*150;g+=rect(x+(targetX-x)*q,y+(targetY-y)*q,105,74,i%2?A:S,8);}
      g+=txt(520,790,ls[0],39,M,'middle')+arrow(790,545,1040,545,A,5)+txt(1350,790,ls[2],39,F,'middle')+rect(1090,270,500,540,'none',18,`stroke="${A}" stroke-width="3" opacity="${q}"`);
      break;
    }
  }
  const scaleX=W/1920,scaleY=H/1080;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 1920 1080" role="img" aria-label="${title}" style="font-family:Arial,'Microsoft YaHei','Noto Sans CJK SC',sans-serif"><rect width="1920" height="1080" fill="${C.bg}"/><g><rect x="104" y="78" width="8" height="85" fill="${A}"/>${txt(145,120,title,fitSize(title,70,1630),F,'start',750)}${line(145,195,1775,195,L,2)}${g}${subtitle?txt(145,815,subtitle,fitSize(subtitle,37,1630),M,'start',450):''}</g></svg>`;
}
