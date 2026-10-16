const canvas=document.getElementById('canvas'),status=document.getElementById('status');
document.documentElement.classList.toggle('embedded',parent!==window&&frameElement?.id==='project-demo');
let started=false,held=new Map(),inViewport=true,suspended=false,refreshTimer;
window.Module={canvas,noInitialRun:true,print:console.log,printErr:console.error,
  setStatus(text){status.textContent=text||'资源已加载';},
  onRuntimeInitialized(){document.getElementById('start').disabled=false;document.getElementById('start').textContent='开始游戏';},
  onAbort(reason){document.getElementById('error').hidden=false;document.getElementById('error').textContent='游戏启动失败：'+reason;}
};
function refresh(){
  if(!started)return;
  const state=Module._td_state(),paused=Module._td_paused();
  status.textContent=state===1?'四波已守住 · 胜利！':state===2?'村庄失守 · 可以重新挑战':paused?'已暂停，点击继续返回游戏':`第 ${Math.min(4,Module._td_wave()+1)} 波 · 村庄 ${Module._td_hp()} / 10 · 共享金币 ${Module._td_coins()}`;
  document.getElementById('pause').textContent=paused?'继续':'暂停';document.getElementById('pause').disabled=Boolean(state);
  document.getElementById('p1-mp').textContent=Math.floor(Module._td_mp(0));document.getElementById('p2-mp').textContent=Math.floor(Module._td_mp(1));
}
window.addEventListener('td-ready',()=>{started=true;document.getElementById('pause').disabled=false;canvas.focus({preventScroll:true});refresh();syncViewport();});
document.getElementById('start').onclick=function(){this.disabled=true;status.textContent='正在启动游戏…';try{Module.callMain([]);}catch(error){document.getElementById('error').hidden=false;document.getElementById('error').textContent='启动失败：'+error;}};
document.getElementById('restart').onclick=()=>location.reload();
document.getElementById('pause').onclick=()=>{if(started){release();Module._td_pause(Module._td_paused()?0:1);if(!Module._td_paused())Module.SDL2?.audioContext?.resume().catch(()=>{});canvas.focus({preventScroll:true});refresh();}};
const keycodes={KeyW:87,KeyA:65,KeyS:83,KeyD:68,KeyJ:74,KeyK:75,ArrowUp:38,ArrowDown:40,ArrowLeft:37,ArrowRight:39,KeyO:79,KeyP:80};
const physicalKeys=new Set();
function emit(code,type){const key=code.startsWith('Key')?code.slice(3).toLowerCase():code;document.dispatchEvent(new KeyboardEvent(type,{key,code,keyCode:keycodes[code],which:keycodes[code],bubbles:true,cancelable:true}));}
function release(){for(const {code,timer,button} of held.values()){clearInterval(timer);emit(code,'keyup');button.classList.remove('held');}held.clear();for(const code of physicalKeys)emit(code,'keyup');physicalKeys.clear();}
function pause(){release();if(started&&!Module._td_state()){Module._td_pause(1);refresh();}}
window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.addEventListener('keydown',e=>{if(started&&(e.code in keycodes)){e.preventDefault();if(e.isTrusted)physicalKeys.add(e.code);}if(started&&e.code==='Space'){e.preventDefault();if(!e.repeat)document.getElementById('pause').click();}},{capture:true});
document.addEventListener('keyup',e=>physicalKeys.delete(e.code),{capture:true});
document.querySelectorAll('[data-key]').forEach(button=>{
  button.onpointerdown=e=>{e.preventDefault();if(!started||Module._td_paused()||Module._td_state())return;button.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});const code=button.dataset.key;emit(code,'keydown');button.classList.add('held');const timer=['KeyJ','KeyK','KeyO','KeyP'].includes(code)?setInterval(()=>emit(code,'keydown'),150):null;held.set(e.pointerId,{code,timer,button});};
  function up(e){const value=held.get(e.pointerId);if(!value)return;clearInterval(value.timer);emit(value.code,'keyup');held.delete(e.pointerId);button.classList.remove('held');}
  button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('lostpointercapture',up);
});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function syncViewport(){
  const visible=inViewport&&!document.hidden;
  clearInterval(refreshTimer);
  if(visible){
    if(started&&suspended){Module.resumeMainLoop();suspended=false;}
    if(started)refreshTimer=setInterval(refresh,200);
  }else if(started){
    pause();
    if(!suspended){Module.pauseMainLoop();suspended=true;}
    Module.SDL2?.audioContext?.suspend().catch(()=>{});
  }
}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='portfolio:viewport')return;
  inViewport=event.data.visible===true;syncViewport();
});
document.addEventListener('visibilitychange',syncViewport);
window.addEventListener('pagehide',()=>{clearInterval(refreshTimer);release();});
window.defenseDiagnostics=()=>started?{state:Module._td_state(),paused:Module._td_paused(),wave:Module._td_wave()+1,hp:Module._td_hp(),coins:Module._td_coins(),enemies:Module._td_enemies(),towers:Module._td_towers(),towerTypes:[0,1,2].map(i=>Module._td_tower_type_count(i)),levels:[0,1,2].map(i=>Module._td_level(i)),players:[0,1].map(i=>({x:Module._td_player_x(i),y:Module._td_player_y(i),mp:Module._td_mp(i)}))}:{started:false};

document.getElementById('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('main').requestFullscreen();}catch{status.textContent='当前浏览器未允许全屏，可横屏查看完整地图';}};
document.addEventListener('fullscreenchange',()=>{document.getElementById('fullscreen').textContent=document.fullscreenElement?'退出全屏':'全屏体验';});
