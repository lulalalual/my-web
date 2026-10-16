(function () {
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (x,y,s,cls='small') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${escape(s)}</text>`;
  const line = d => `<path class="guide" d="${d}"/>`;
  const circle = (x,y,r,cls='guide') => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
  const rect = (x,y,w,h,cls='paper',r=12) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
  const sheet = (x,y,label) => rect(x,y,210,232)+text(x+105,y+40,label,'node-title')+[0,1,2,3].map(i=>line(`M${x+30} ${y+78+i*32} h${i===3?92:150}`)).join('');
  const specs = {
    requirements:{name:'八维题库 · 雷达索引',nodes:[[815,255,'pill'],[1030,350,'pill'],[815,445,'pill'],[1030,540,'pill']],route:'M815 255 Q1080 260 1030 350 Q1000 435 815 445 Q790 535 1030 540',art(){
      let s=[55,100,145].map(r=>circle(300,390,r)).join('');
      for(let i=0;i<8;i++){const a=i*Math.PI/4,x=300+145*Math.cos(a),y=390+145*Math.sin(a);s+=line(`M300 390 L${x} ${y}`)+`<circle data-dimension="${i}" class="accent-dot" cx="${x}" cy="${y}" r="7"/>`;}
      return s+'<path id="scene-detail" class="accent-line" d="M300 390 L445 390"/>'+circle(300,390,66,'paper')+text(300,385,'176','large')+text(300,420,'八维题库')+text(300,580,'以能力维度组织训练');}},
    knowledge:{name:'知识正文 · 检索与证据',nodes:[[165,365,'paper'],[475,270,'diamond'],[755,470,'pill'],[1060,320,'seal']],route:'M165 365 C290 365 300 270 475 270 S630 470 755 470 S915 320 1060 320',art(){return '<g id="scene-detail">'+rect(64,270,175,190,'paper')+rect(84,250,175,190,'paper')+'</g>'+line('M100 290 h105 M100 318 h85 M100 346 h100')+'<path class="tint" d="M580 270 H820 L735 365 V405 H675 V365 Z"/>'+text(700,315,'检索')+circle(1005,464,42)+line('M1034 493 l30 30')+text(1040,565,'定位来源，保留证据');}},
    data:{name:'数据接入 · 字段映射',nodes:[[205,245,'pill'],[490,245,'pill'],[775,245,'pill'],[1060,245,'pill']],route:'M205 245 H1060',art(){let s=rect(80,310,1120,240,'paper',4);for(let row=0;row<3;row++){s+=text(145,355+row*76,['CRM','API','采集'][row]);for(let col=0;col<3;col++)s+=line(`M${350+col*285} ${344+row*76} h130`)+circle(330+col*285,344+row*76,4,'accent-dot');}for(let x of [290,575,860])s+=line(`M${x} 310 V550`);return s+'<rect id="scene-detail" class="mapping-cursor" x="80" y="310" width="210" height="240" rx="4"/>'; }},
    training:{name:'AI 分享 · 方法手册',nodes:[[330,300,'note'],[330,495,'note'],[950,300,'note'],[950,495,'note']],route:'M330 300 V495 C510 590 770 210 950 300 V495',art(){return rect(105,220,520,370,'paper')+rect(655,220,520,370,'paper')+line('M640 245 V565')+text(365,565,'任务 · 上下文')+text(905,565,'协作 · 检查')+'<path id="scene-detail" class="accent-line" d="M180 400 C300 370 420 430 550 400 M730 400 C850 370 970 430 1100 400"/>'; }},
    recruit:{name:'岗位与经历 · 双向对照',nodes:[[215,245,'pill'],[640,350,'seal'],[640,535,'pill'],[1060,535,'pill']],route:'M215 245 C400 245 430 350 640 350 V535 H1060',art(){return sheet(90,300,'职位要求')+sheet(980,250,'经历证据')+line('M305 365 C465 365 440 350 568 350 M712 350 C820 350 820 365 980 365')+circle(640,350,108)+text(640,475,'职责 / 技能 / 经历')+'<path id="scene-detail" class="accent-line" d="M412 310 Q640 190 868 310"/>'; }},
    pixel:{name:'内容生产 · 依赖图谱',nodes:[[180,390,'paper'],[465,270,'pill'],[765,475,'pill'],[1070,365,'diamond']],route:'M180 390 C300 390 300 270 465 270 C620 270 610 475 765 475 C900 475 920 365 1070 365',art(){return line('M180 390 L460 505 L765 475 M465 270 L765 270 L1070 365')+rect(385,465,150,74)+text(460,510,'素材准备')+rect(690,230,150,74)+text(765,275,'合成渲染')+text(640,580,'依赖可见 · 变更传递 · 人工质量门');}},
    evalops:{name:'检索实验 · 评估飞轮',nodes:[[380,275,'pill'],[900,275,'pill'],[900,505,'pill'],[380,505,'pill']],route:'M380 275 C510 190 770 190 900 275 C1080 340 1080 440 900 505 C770 590 510 590 380 505 C210 440 210 340 380 275',art(){return circle(640,390,115)+circle(640,390,78)+text(640,380,'同一问题','node-title')+text(640,418,'对照不同配置')+'<path id="scene-detail" class="accent-line" d="M640 275 A115 115 0 1 1 639.99 275"/>'; }},
    agentic:{name:'工具轨迹 · 偏好样本',nodes:[[190,350,'paper'],[500,350,'diamond'],[820,280,'pill'],[1075,550,'pill']],route:'M190 350 H500 C650 350 650 280 820 280 Q1190 280 1075 550',art(){return line('M92 260 V505')+[0,1,2,3].map(i=>circle(92,275+i*65,6,'accent-dot')).join('')+rect(680,365,170,130)+rect(870,365,170,130)+text(765,405,'轨迹 A')+text(955,405,'轨迹 B')+line('M715 440 h100 M715 467 h75 M905 440 h100 M905 467 h70')+'<path id="scene-detail" class="accent-line" d="M735 447 l18 18 l35 -42"/>'; }},
    raft:{name:'一致性 · 节点协作',nodes:[[200,235,'pill'],[490,235,'pill'],[780,235,'pill'],[1070,235,'pill']],route:'M200 235 H1070',art(){const peers=[[640,370,'Leader'],[310,430,'F1'],[440,540,'F2'],[840,540,'F3'],[970,430,'F4']];return peers.slice(1).map(([x,y])=>line(`M640 370 L${x} ${y}`)).join('')+peers.map(([x,y,label],i)=>`<g data-peer="${i}">${circle(x,y,i?43:58,'paper')+text(x,y+8,label,i?'small':'node-title')}</g>`).join('')+'<rect id="scene-detail" class="log-packet" x="-8" y="-6" width="16" height="12" rx="3"/>'; }},
    employment:{name:'就业核查 · 双维分流',nodes:[[640,240,'pill'],[300,370,'diamond'],[980,370,'diamond'],[640,550,'pill']],route:'M640 240 Q300 240 300 370 Q300 550 640 550 Q980 550 980 370',art(){return line('M640 240 Q980 240 980 370 M300 370 H980')+text(300,455,'企业风险')+text(980,455,'就业真实性')+rect(470,340,340,100,'paper')+text(640,382,'电话 · 短信 H5')+text(640,418,'学生与企业独立回访')+'<path id="scene-detail" class="accent-line" d="M560 550 l45 30 l105 -78"/>'; }}
  };
  function node(step,i,position) {
    const [x,y,type]=position;
    let shape=type==='diamond'?'<path class="node-shape" d="M0 -62 L110 0 L0 62 L-110 0 Z"/>':type==='seal'?'<circle class="node-shape" r="78"/>':`<rect class="node-shape" x="-108" y="-48" width="216" height="96" rx="${type==='pill'?42:type==='note'?3:12}"/>`;
    return `<g id="n${i}" class="phase phase-${type}" data-phase="${i}" transform="translate(${x} ${y})">${shape}<text class="node-title" text-anchor="middle" y="-5">${escape(step[0])}</text><text class="node-caption" text-anchor="middle" y="27">${escape(step[1])}</text></g>`;
  }
  window.PortfolioScenes={
    render(topic) {
      const spec=specs[topic.id];if(!spec)throw new Error('Unknown diagram '+topic.id);
      return `<svg viewBox="0 0 1280 720" role="img" aria-label="${escape(spec.name)}" data-layout-ignore data-scene="${topic.id}"><path class="guide" d="${spec.route}"/><path id="flow-path" class="accent-line" d="${spec.route}"/>${spec.art()}${spec.nodes.map((position,i)=>node(topic.steps[i],i,position)).join('')}</svg>`.replace(/id="([^"]+)"/g, (_,id) => `id="${topic.id}-${id}"`);
    },
    paint(id,p,stage) {
      const detail=stage.querySelector(`[id="${id}-scene-detail"]`);if(!detail)return;
      if(id==='requirements') {detail.setAttribute('transform',`rotate(${p*360} 300 390)`);stage.querySelectorAll('[data-dimension]').forEach((e,i)=>e.style.opacity=p*8>=i?'1':'.3');}
      else if(id==='data')detail.setAttribute('transform',`translate(${Math.min(3,Math.floor(p*4))*285} 0)`);
      else if(id==='raft'){
        const peers=[[-330,60],[-200,170],[200,170],[330,60]],index=Math.min(3,Math.floor(p*4)),[dx,dy]=peers[index],distance=Math.hypot(dx,dy),t=(p*4)%1,eased=t*t*(3-2*t),ratio=(64+(distance-113)*eased)/distance;
        detail.setAttribute('transform',`translate(${640+dx*ratio} ${370+dy*ratio})`);
        stage.querySelectorAll('[data-peer]').forEach((peer,i)=>{const shape=peer.querySelector('circle');shape.style.stroke=i===0||i<=index?'var(--accent)':'var(--line)';shape.style.strokeWidth=i===0?'3':'2';});
      }
      else if(id==='knowledge')detail.setAttribute('transform',`translate(${12*p} ${-8*p})`);
      else {const length=Number(detail.dataset.pathLength);detail.style.strokeDasharray=String(length);detail.style.strokeDashoffset=String(length*(1-p));}
    }
  };
})();
