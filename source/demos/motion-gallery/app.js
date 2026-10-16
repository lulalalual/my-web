import {renderAsset} from './primitives.mjs';
import {searchItems} from './search.mjs';

const $=id=>document.getElementById(id);
const state={items:[],all:[],query:'',category:'全部',favoritesOnly:false,selected:null,theme:'warm-editorial',compare:[],params:{},frame:0,playing:true,previewMode:'auto',preferences:{favorites:[],ratings:{},notes:{}},request:0};
const storageKey='portfolio-pmf-motion-gallery-v1';
let parentVisible=window.parent===window;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const previewVisibility=new WeakMap();
const previewObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const entry of entries)previewVisibility.set(entry.target,entry.isIntersecting);syncPlayback();}):null;
const pageActive=()=>parentVisible&&!document.hidden&&!reducedMotion.matches;
function inViewport(element){const b=element.getBoundingClientRect();return b.width>0&&b.height>0&&b.bottom>0&&b.top<innerHeight&&b.right>0&&b.left<innerWidth;}
function syncPlayback(){
  const dialogOpen=$('preview-dialog').open;
  for(const video of document.querySelectorAll('video')){
    const stage=video.closest('.stage,.compare-stage,.theater-stage');
    const active=pageActive()&&state.playing&&stage&&(previewVisibility.get(stage)??inViewport(stage))&&(!dialogOpen||stage.closest('#preview-dialog'));
    if(active){if(video.preload==='none')video.preload='metadata';if(video.paused)video.play().catch(()=>{});}else video.pause();
  }
}
function bindMedia(){previewObserver?.disconnect();for(const stage of document.querySelectorAll('.stage,.compare-stage,.theater-stage'))previewObserver?.observe(stage);syncPlayback();}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=id=>state.all.find(x=>x.asset.id===id)?.asset;
const itemById=id=>state.all.find(x=>x.asset.id===id);
const duration=a=>Math.round(((a.recommended_duration[0]+a.recommended_duration[1])/2)*30);
const previewParams=a=>state.params[a.id]??{};
const preferVideo=item=>item.video&&(state.previewMode==='video'||state.theme==='warm-editorial'&&state.previewMode==='auto'&&Object.keys(previewParams(item.asset)).length===0);
const statusText={PRODUCTION_READY:'生产可用',NEEDS_ADAPTATION:'需适配',REFERENCE_ONLY:'仅供参考',UNVERIFIED:'待验证'};
const noUse=a=>{
  const limits={'动态文字':'不适合代替数据证据或证明因果。','尺度与比例':'未统一单位、基准和分母时不要用于定量比较。','曲线与阈值':'没有可信数据或模型时不要把示意曲线当作实测趋势。','因果与反馈':'证据只支持相关关系时不要画成已证实的因果链。','网络与决策':'节点和权重未核实时不要暗示精确关系或决策概率。','时间与流程':'时间顺序未核实时不要标示为真实历程。'};
  return `${limits[a.visual_category]??'按具体镜头核对表达含义。'}${a.validation_status==='PRODUCTION_READY'?'仍须核对具体镜头与字幕安全区。':'当前状态不可作为已质检或已获用户审美批准的正式镜头。'}`;
};
function save(){try{localStorage.setItem(storageKey,JSON.stringify({favorites:state.preferences.favorites,ratings:state.preferences.ratings,notes:state.preferences.notes,theme:state.theme}));}catch{toast('浏览器未能保存偏好，本次操作仍可继续使用');}}
function load(){try{const x=JSON.parse(localStorage.getItem(storageKey)||'{}');state.preferences={favorites:Array.isArray(x.favorites)?x.favorites:[],ratings:x.ratings&&typeof x.ratings==='object'?x.ratings:{},notes:x.notes&&typeof x.notes==='object'?x.notes:{}};if(['warm-editorial','dark-technical'].includes(x.theme))state.theme=x.theme;}catch{}}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600);}
function media(item,kind='card'){
  const a=item.asset,id=esc(a.id),video=preferVideo(item);
  const control=kind==='stage'?'<div class="stage-tools"><button type="button" data-action="zoom" aria-label="放大预览">↗ 放大</button><button type="button" data-action="play" aria-label="播放或暂停">'+(state.playing?'❚❚':'▶')+'</button>'+(item.video?'<button type="button" data-action="toggle-preview">'+(video?'逐帧':'原版 MP4')+'</button>':'')+'</div>':'';
  return `<div class="${kind==='stage'?'stage':kind==='compare'?'compare-stage':kind==='theater'?'theater-stage':'card-preview'}" data-preview-id="${id}">${video?`<video muted loop playsinline preload="none" poster="${item.thumbnail?`./media/${id}.png`:''}" src="./media/${id}.mp4"></video>`:`<div class="svg-frame" data-svg-id="${id}"></div>`}${kind==='card'?`<span class="preview-tag">${video?'实际 MP4':'逐帧预览'}</span>`:''}${control}</div>`;
}
function drawLive(){
  if(!pageActive())return;
  const selected=byId(state.selected), selectedFrames=selected?duration(selected):150;
  if(state.playing)state.frame=(state.frame+2)%selectedFrames;
  for(const el of document.querySelectorAll('[data-svg-id]')){
    if(!inViewport(el)||$('preview-dialog').open&&!el.closest('#preview-dialog'))continue;
    const a=byId(el.dataset.svgId);if(!a)continue;
    const n=duration(a),frame=Math.min(n-1,state.frame%n);
    try{el.innerHTML=renderAsset(a.id,frame,n,previewParams(a),state.theme,1920,1080);}catch{if(!el.dataset.renderError){el.dataset.renderError='true';toast('参数超出预览范围，请缩短文字或调整数值');}}
  }
  const seek=$('seek');if(seek&&document.activeElement!==seek){seek.value=String(state.frame%selectedFrames);$('frame-label').textContent=`${Math.round((state.frame%selectedFrames)/30*10)/10}s`;}
}
function renderFilters(){const cats=['全部',...new Set(state.all.map(x=>x.asset.visual_category))];$('filters').innerHTML=cats.map(c=>`<button class="filter-chip ${state.category===c?'active':''}" data-category="${esc(c)}" aria-pressed="${state.category===c}">${esc(c)}</button>`).join('');}
function filtered(){return state.items.filter(x=>(state.category==='全部'||x.asset.visual_category===state.category)&&(!state.favoritesOnly||state.preferences.favorites.includes(x.asset.id)));}
function renderCards(){
  const data=filtered();$('result-count').textContent=String(data.length).padStart(2,'0');$('empty').hidden=data.length!==0;$('list-caption').textContent=state.category==='全部'?'全部动效':state.category;
  $('favorites-only').classList.toggle('active',state.favoritesOnly);$('favorites-only').setAttribute('aria-pressed',String(state.favoritesOnly));
  $('cards').innerHTML=data.map((item,i)=>{const a=item.asset,fav=state.preferences.favorites.includes(a.id);return `<article class="card ${state.selected===a.id?'selected':''}" data-select="${esc(a.id)}" tabindex="0" aria-label="查看 ${esc(a.title)} 动效详情">${media(item)}<div class="card-body"><div class="card-heading"><span class="card-number">${String(i+1).padStart(2,'0')} / ${esc(a.visual_category)}</span><button type="button" class="favorite-button ${fav?'active':''}" data-favorite="${esc(a.id)}" aria-label="${fav?'取消收藏':'收藏'} ${esc(a.title)}">${fav?'★':'☆'}</button></div><h3>${esc(a.title)}</h3><p class="card-desc">${esc(a.description)}</p><div class="card-footer"><span><i class="mini-status ${a.validation_status==='PRODUCTION_READY'?'ready':''}"></i>${esc(statusText[a.validation_status])}</span><span>${esc(a.engine.split(' / ')[0])}</span></div></div></article>`;}).join('');
  drawLive();bindMedia();
}
function parameterFields(a){
  const p=previewParams(a),schema=a.parameters_schema;
  return ['title','subtitle','labels','values','value','threshold'].filter(k=>schema[k]).map(k=>{
    const rule=schema[k],labels={title:'标题',subtitle:'副标题',labels:'标签 · 逗号分隔',values:'数值 · 逗号分隔',value:'当前值',threshold:'阈值'};
    const value=p[k]??'';const display=Array.isArray(value)?value.join(', '):value;
    const isNumber=k==='value'||k==='threshold';
    return `<label class="field"><span class="field-label"><span>${labels[k]}</span><span>${k}</span></span><input data-param="${k}" type="${isNumber?'number':'text'}" ${isNumber?`min="${rule.minimum??0}" max="${rule.maximum??100}" step="1"`:''} maxlength="${rule.maxLength??160}" value="${esc(display)}" placeholder="${k==='labels'?'原因, 过程, 结果':k==='values'?'25, 75, 100':'使用组件默认内容'}"></label>`;
  }).join('');
}
function renderInspector(){
  const item=itemById(state.selected);if(!item){$('inspector-content').innerHTML='<div class="inspector-body">选择一个动效查看详情。</div>';bindMedia();return;}
  const a=item.asset,id=esc(a.id),fav=state.preferences.favorites.includes(a.id),inCompare=state.compare.includes(a.id),index=state.all.findIndex(x=>x.asset.id===a.id)+1;
  $('selected-index').textContent=`${String(index).padStart(2,'0')} / ${state.all.length}`;
  const score=a.quality_score===null?'未评分':`${a.quality_score}/100`;
  const mode=preferVideo(item)?`实际 MP4 预览${state.theme==='dark-technical'?'（原版暖色）':''}${Object.keys(previewParams(a)).length?'（不含当前参数）':''}`:'同源 SVG 逐帧预览';
  const qa=item.qa;
  $('inspector-content').innerHTML=`${media(item,'stage')}<div class="inspector-body"><span class="detail-index">ASSET ${String(index).padStart(2,'0')} / ${id}</span><div class="detail-head"><div><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p></div><div class="detail-actions"><button class="icon-button ${fav?'active':''}" data-favorite="${id}" title="收藏" aria-label="收藏">${fav?'★':'☆'}</button><button class="icon-button ${inCompare?'active':''}" data-action="compare" title="加入对比" aria-label="加入对比">⊞</button></div></div><div class="status-line"><b>${esc(statusText[a.validation_status])}</b><span>${esc(mode)} · 质量分 ${score}${item.video?' · 文件已存在':''}</span></div><div class="detail-meta"><div><span class="meta-label">CATEGORY</span><span class="meta-value">${esc(a.visual_category)}</span></div><div><span class="meta-label">ENGINE</span><span class="meta-value">${esc(a.engine)}</span></div><div><span class="meta-label">DURATION</span><span class="meta-value">${a.recommended_duration[0]}–${a.recommended_duration[1]} 秒建议</span></div><div><span class="meta-label">RATIO</span><span class="meta-value">${a.supported_aspect_ratios.map(esc).join(' / ')}</span></div></div><div class="details-section"><span class="section-title">01 / SEMANTIC FIT</span><div class="tag-row">${a.semantic_tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>${item.reasons?.length?`<p class="detail-footnote">搜索命中：${item.reasons.map(esc).join('、')}</p>`:''}</div><div class="details-section"><span class="section-title">02 / LIVE PARAMETERS</span>${parameterFields(a)}<p class="param-guide">修改参数后自动切换为同源 SVG 逐帧预览。示意内容不代表正式镜头审片通过。</p><div class="timeline-row"><button class="outline-button" data-action="play" aria-label="播放或暂停">${state.playing?'暂停':'播放'}</button><input id="seek" aria-label="预览时间" type="range" min="0" max="149" value="${state.frame%150}"><span id="frame-label">0.0s</span></div><div class="action-row"><button class="primary-button" data-action="copy-scene">复制 SceneSpec 插入代码</button><button class="outline-button" data-action="copy-id">复制 ID</button></div></div><div class="details-section"><span class="section-title">03 / TECHNICAL EVIDENCE</span><div class="qa-box">${qa?`<b>${qa.technicalPassed?'自动技术检查通过':'自动技术检查未通过或不完整'}</b><span>${qa.media?`${qa.media.width}×${qa.media.height} · ${qa.media.fps} fps · ${qa.media.duration}s · `:''}对比度警告 ${qa.contrastWarnings} 项</span><small>审美状态：${qa.reviewStatus==='technical_only; visual review pending'?'待人工视觉审片':esc(qa.reviewStatus)}</small>`:'<b>暂无技术质检报告</b><small>浏览器逐帧预览不能代替实际渲染 QA。</small>'}</div></div><div class="details-section"><span class="section-title">04 / PROVENANCE &amp; USE</span><div class="detail-meta"><div><span class="meta-label">SOURCE</span><span class="meta-value">${esc(a.source_url)}</span></div><div><span class="meta-label">AUTHOR</span><span class="meta-value">${esc(a.author)}</span></div><div><span class="meta-label">LICENSE</span><span class="meta-value">${esc(a.license)}</span></div><div><span class="meta-label">VERSION</span><span class="meta-value">${esc(a.version)}</span></div></div><p class="detail-footnote">源码：${esc(a.code_path)}<br>预览：${esc(a.preview_path)}${item.video?'（存在）':'（尚无文件）'}<br>使用限制（Gallery 提示）：${esc(noUse(a))}</p></div><div class="details-section"><span class="section-title">05 / YOUR REVIEW</span><div class="rating" aria-label="为资产评分">${[1,2,3,4,5].map(n=>`<button type="button" class="${(state.preferences.ratings[a.id]??0)>=n?'on':''}" data-rating="${n}" aria-label="评 ${n} 星">★</button>`).join('')}</div><label class="field"><span class="field-label"><span>私人备注 · 仅保存在此浏览器</span></span><textarea id="note" maxlength="1000" placeholder="记录适合的选题、需要修改的地方…">${esc(state.preferences.notes[a.id]??'')}</textarea></label></div></div>`;
  const seek=$('seek');if(seek)seek.max=String(duration(a)-1);
  drawLive();bindMedia();
}
function renderCompare(){const section=$('compare-section');section.hidden=state.compare.length===0;if(section.hidden){$('compare-grid').innerHTML='';bindMedia();return;}$('compare-grid').innerHTML=state.compare.map(id=>{const item=itemById(id);if(!item)return '';const a=item.asset;return `<article class="compare-item">${media(item,'compare')}<h3>${esc(a.title)}</h3><p>${esc(a.visual_category)} · ${esc(statusText[a.validation_status])} · ${preferVideo(item)?'实际 MP4':'逐帧预览'}</p><button data-remove-compare="${esc(id)}">移出对比</button></article>`;}).join('');drawLive();bindMedia();}
function renderAll(){renderFilters();renderCards();renderInspector();renderCompare();}
async function refresh(){const items=searchItems(state.all,state.query);state.items=items;for(const x of items)state.all[state.all.findIndex(y=>y.asset.id===x.asset.id)]=x;if(!items.length)state.selected=null;else if(!items.some(x=>x.asset.id===state.selected)){state.selected=items[0].asset.id;state.previewMode='auto';state.frame=0;}renderAll();}
async function copy(text,done){
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);toast(done);return;}}catch{}
  const field=document.createElement('textarea');field.value=text;field.className='clipboard-fallback';field.setAttribute('readonly','');document.body.append(field);field.select();
  let copied=false;try{copied=document.execCommand('copy');}catch{}field.remove();toast(copied?done:'复制失败，请检查浏览器剪贴板权限');
}
function sceneCode(a){const scene={id:`scene-${a.id}`,chapter_id:'chapter-1',start_frame:0,duration_frames:duration(a),narration:'',visual_intent:`使用「${a.title}」表达知识关系`,semantic_purpose:a.semantic_tags.slice(0,3).join('、'),asset_ids:[a.id],parameters:previewParams(a),theme:state.theme,renderer:'hyperframes',transition_contract:{type:'cut',input_state:{},output_state:{},duration_frames:0,reason:'语义边界'},QA_criteria:['文字可读','运动含义准确','字幕安全区无冲突'],allow_static:false,allow_black:false,allow_silence:false};return `// SceneSpec：请调整时间线、口播与语义目的后插入项目\nconst sceneSpec = ${JSON.stringify(scene,null,2)};`;}
function setSelected(id){if(!itemById(id))return;state.selected=id;state.frame=0;state.previewMode='auto';renderCards();renderInspector();}
function openTheater(){const item=itemById(state.selected);if(!item)return;const a=item.asset,dialog=$('preview-dialog');dialog.innerHTML=`<div class="theater-head"><div><span>FULL FRAME / ${esc(a.id)}</span><h2>${esc(a.title)}</h2></div><button type="button" id="close-theater" aria-label="关闭大画幅预览">✕</button></div>${media(item,'theater')}<div class="theater-foot"><span>${preferVideo(item)?'实际 MP4':'同源 SVG 逐帧预览'} · ${esc(state.theme)} · ${esc(statusText[a.validation_status])}</span><span>Esc 关闭</span></div>`;dialog.showModal();drawLive();bindMedia();}
function toggleFavorite(id){const f=state.preferences.favorites;state.preferences.favorites=f.includes(id)?f.filter(x=>x!==id):[...f,id];save();renderCards();renderInspector();toast(state.preferences.favorites.includes(id)?'已收藏':'已取消收藏');}
function changeParam(key,value){const id=state.selected,a=byId(id);if(!a)return;const param={...previewParams(a)};if(value.trim()==='')delete param[key];else if(key==='labels')param[key]=value.split(/[,，]/).map(x=>x.trim()).filter(Boolean).slice(0,6);else if(key==='values')param[key]=value.split(/[,，]/).map(x=>Number(x.trim())).filter(Number.isFinite).slice(0,6);else if(key==='value'||key==='threshold')param[key]=Number(value);else param[key]=value;try{renderAsset(id,0,duration(a),param,state.theme);}catch{toast('参数超出预览范围，请缩短文字或调整数值');return;}state.params[id]=param;state.previewMode='live';renderCards();renderCompare();const stage=document.querySelector('.stage');if(stage){stage.outerHTML=media(itemById(id),'stage');const line=document.querySelector('.status-line span');if(line)line.textContent=`同源 SVG 逐帧预览 · 质量分 ${a.quality_score===null?'未评分':`${a.quality_score}/100`}${itemById(id).video?' · MP4 原始预览可切换':''}`;drawLive();bindMedia();}}
function applyTheme(){document.body.dataset.theme=state.theme;$('theme-name').textContent=state.theme==='warm-editorial'?'Warm Editorial':'Dark Technical';save();renderAll();}

load();document.body.dataset.theme=state.theme;$('theme-name').textContent=state.theme==='warm-editorial'?'Warm Editorial':'Dark Technical';
fetch('./assets.json').then(r=>{if(!r.ok)throw new Error('asset index unavailable');return r.json();}).then(items=>{state.all=items;state.items=items;state.selected=items[0]?.asset.id??null;$('hero-count').textContent=items.length;renderAll();}).catch(()=>toast('资产库加载失败，请刷新页面'));
setInterval(drawLive,65);
let searchTimer;$('search').addEventListener('input',event=>{clearTimeout(searchTimer);state.query=event.target.value.trim();searchTimer=setTimeout(()=>refresh().catch(()=>toast('搜索失败')),180);});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();$('search').focus();}});
$('theme-toggle').addEventListener('click',()=>{state.theme=state.theme==='warm-editorial'?'dark-technical':'warm-editorial';state.previewMode='auto';applyTheme();});
$('filters').addEventListener('click',event=>{const b=event.target.closest('[data-category]');if(!b)return;state.category=b.dataset.category;const list=filtered();if(!list.length)state.selected=null;else if(!list.some(x=>x.asset.id===state.selected)){state.selected=list[0].asset.id;state.previewMode='auto';}renderFilters();renderCards();renderInspector();});
$('favorites-only').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;renderCards();});
$('cards').addEventListener('click',event=>{const fav=event.target.closest('[data-favorite]');if(fav){toggleFavorite(fav.dataset.favorite);return;}const card=event.target.closest('[data-select]');if(card)setSelected(card.dataset.select);});
$('cards').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-select]')){event.preventDefault();setSelected(event.target.dataset.select);}});
$('inspector').addEventListener('click',event=>{const fav=event.target.closest('[data-favorite]');if(fav){toggleFavorite(fav.dataset.favorite);return;}const rating=event.target.closest('[data-rating]');if(rating){state.preferences.ratings[state.selected]=Number(rating.dataset.rating);save();renderInspector();return;}const action=event.target.closest('[data-action]')?.dataset.action;if(!action)return;const a=byId(state.selected);if(action==='compare'){state.compare=state.compare.includes(a.id)?state.compare.filter(id=>id!==a.id):[...state.compare.slice(-1),a.id];renderInspector();renderCompare();toast(state.compare.length===2?'已打开双资产对比':'已加入对比，继续选择第二个资产');}if(action==='copy-id')copy(a.id,'已复制 Asset ID');if(action==='copy-scene')copy(sceneCode(a),'已复制 SceneSpec 插入代码');if(action==='zoom')openTheater();if(action==='play'){state.playing=!state.playing;syncPlayback();renderInspector();}if(action==='toggle-preview'){state.previewMode=preferVideo(itemById(a.id))?'live':'video';renderCards();renderInspector();renderCompare();}});
$('preview-dialog').addEventListener('click',event=>{if(event.target.id==='close-theater'||event.target===$('preview-dialog'))$('preview-dialog').close();});
$('preview-dialog').addEventListener('close',()=>{$('preview-dialog').innerHTML='';bindMedia();});
$('inspector').addEventListener('input',event=>{if(event.target.matches('[data-param]'))changeParam(event.target.dataset.param,event.target.value);if(event.target.id==='note'){state.preferences.notes[state.selected]=event.target.value;save();}if(event.target.id==='seek'){state.frame=Number(event.target.value);state.playing=false;state.previewMode='live';renderCards();renderCompare();const item=itemById(state.selected),stage=document.querySelector('.stage');if(item&&stage){stage.outerHTML=media(item,'stage');const line=document.querySelector('.status-line span');if(line)line.textContent=`同源 SVG 逐帧预览 · 质量分 ${item.asset.quality_score===null?'未评分':`${item.asset.quality_score}/100`}`;}const playButton=document.querySelector('.timeline-row [data-action=play]');if(playButton)playButton.textContent='播放';drawLive();bindMedia();}});
$('compare-grid').addEventListener('click',event=>{const button=event.target.closest('[data-remove-compare]');if(!button)return;state.compare=state.compare.filter(id=>id!==button.dataset.removeCompare);renderCompare();renderInspector();});
$('clear-compare').addEventListener('click',()=>{state.compare=[];renderCompare();renderInspector();});

// The same-origin portfolio parent pauses this iframe when it leaves view.
window.addEventListener('message',event=>{
  if(event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='portfolio:viewport'||typeof event.data.visible!=='boolean')return;
  parentVisible=event.data.visible;
  syncPlayback();
  if(pageActive())drawLive();
});
document.addEventListener('visibilitychange',()=>{syncPlayback();if(pageActive())drawLive();});
reducedMotion.addEventListener('change',()=>{syncPlayback();if(pageActive())drawLive();});
window.addEventListener('pagehide',()=>{for(const video of document.querySelectorAll('video'))video.pause();});
window.addEventListener('pageshow',()=>{bindMedia();if(pageActive())drawLive();});
window.addEventListener('scroll',syncPlayback,{passive:true,capture:true});
window.addEventListener('resize',syncPlayback,{passive:true});
if(window.parent!==window)window.parent.postMessage({type:'portfolio:ready'},location.origin);
