const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const theme = path.join(root, 'node_modules', 'hexo-theme-anzhiyu');
const version = JSON.parse(fs.readFileSync(path.join(theme, 'package.json'), 'utf8')).version;
if (version !== '1.6.0') throw new Error('Theme overrides require the pinned AnZhiYu 1.6.0.');
const helperPath = path.join(theme, 'scripts', 'helpers', 'random.js');
const original = fs.readFileSync(helperPath, 'utf8').replace(/\r\n/g, '\n');
const randomPost = "function toRandomPost(){if(!Array.isArray(posts)||!posts.length){window.location.href='/archives/';return;}var target=String(posts[Math.floor(Math.random()*posts.length)]);if(target.charAt(0)!=='/'){target='/'+target;}if(window.pjax&&typeof window.pjax.loadUrl==='function'){window.pjax.loadUrl(target);}else{window.location.href=target;}};";
const updated = original.replace(/function toRandomPost\(\)\{.*?\};/, randomPost);
if (!updated.includes(randomPost)) throw new Error('Random-post helper shape changed; refusing a partial override.');
fs.writeFileSync(helperPath, updated, 'utf8');
fs.copyFileSync(path.join(root, 'layout', 'portfolio.pug'), path.join(theme, 'layout', 'portfolio.pug'));
const scriptsPath = path.join(theme, 'layout', 'includes', 'additional-js.pug');
const scripts = fs.readFileSync(scriptsPath, 'utf8');
fs.writeFileSync(scriptsPath, scripts.replace('https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/qrcodejs/1.0.0/qrcode.min.js', '/vendor/theme/qrcode.min.js'), 'utf8');
const headPath = path.join(theme, 'layout', 'includes', 'head.pug');
const head = fs.readFileSync(headPath, 'utf8');
fs.writeFileSync(headPath, head.replace('initial-scale=1.0, user-scalable=no', 'initial-scale=1.0'), 'utf8');
const topPath = path.join(theme, 'layout', 'includes', 'top', 'top.pug');
let top = fs.readFileSync(topPath, 'utf8').replace(/\r\n/g, '\n');
for (const [line, guard] of [
  ['        link(rel="stylesheet", href=theme.home_top.banner.top_group_banner_css)', 'theme.home_top.banner.top_group_banner_css'],
  ['  link(rel="stylesheet" href=url_for(theme.home_top.swiper.categorygroup_css))', 'theme.home_top.swiper.categorygroup_css']
]) {
  const indent=line.match(/^ */)[0];
  const guarded=indent+'if '+guard+'\n  '+line;
  if(!top.includes(guarded))top=top.replace(line,guarded);
}
fs.writeFileSync(topPath,top,'utf8');
const layoutPath = path.join(theme, 'layout', 'includes', 'layout.pug');
const layout = fs.readFileSync(layoutPath, 'utf8');
fs.writeFileSync(layoutPath, layout
  .replace(/if is_current\("\/"\)(?! && page\.type !== "portfolio")/, 'if is_current("/") && page.type !== "portfolio"')
  .replace('class=htmlClassHideAside)', 'class=(htmlClassHideAside + (page.type === "portfolio" ? " portfolio-view" : "")))'), 'utf8');
const mainPath = path.join(theme, 'source', 'js', 'main.js');
const main = fs.readFileSync(mainPath, 'utf8').replace(/\r\n/g, '\n');
const nonPostColor = /if \(!path\) \{[\s\S]*?\n      return;\n    \}/;
if (!nonPostColor.test(main)) throw new Error('Theme cover-color helper shape changed.');
fs.writeFileSync(mainPath, main.replace(nonPostColor, `if (!path) {
      // Read once before changing root variables to avoid repeated style flushes.
      const themeColor = getComputedStyle(root).getPropertyValue('--anzhiyu-theme').trim();
      root.style.setProperty('--anzhiyu-bar-background', 'var(--anzhiyu-meta-theme-color)');
      root.style.setProperty('--anzhiyu-main', themeColor);
      root.style.setProperty('--anzhiyu-theme-op', themeColor + '23');
      root.style.setProperty('--anzhiyu-theme-op-deep', themeColor + 'dd');
      anzhiyu.initThemeColor();
      return;
    }`), 'utf8');
const utilsPath=path.join(theme,'source','js','utils.js');
const utils=fs.readFileSync(utilsPath,'utf8').replace(/\r\n/g,'\n');
const pageNavigator=`toPage: function () {
    var input=document.getElementById('toPageText');
    var button=document.getElementById('toPageButton');
    if(!input||!button)return;
    var number=Number(input.value);
    var pages=Array.from(document.querySelectorAll('.page-number')).map(function(item){return Number(item.textContent);}).filter(function(value){return Number.isInteger(value)&&value>0;});
    if(!Number.isInteger(number)||number<1){button.href='javascript:void(0);';return;}
    var page=Math.min(number,Math.max.apply(null,[1].concat(pages)));
    var base=location.pathname.replace(/page\\/\\d+\\/?$/,'');
    if(!base.endsWith('/'))base+='/';
    button.href=base+(page===1?'':'page/'+page+'/')+'#content-inner';
  },`;
if(!/toPage: function \(\) \{[\s\S]*?\n  \},/.test(utils))throw new Error('Theme pagination helper shape changed.');
fs.writeFileSync(utilsPath,utils.replace(/toPage: function \(\) \{[\s\S]*?\n  \},/,pageNavigator),'utf8');
const consolePath = path.join(theme, 'layout', 'includes', 'anzhiyu', 'console.pug');
const consoleTemplate = fs.readFileSync(consolePath, 'utf8').replace(/\r\n/g, '\n');
if (!consoleTemplate.includes('if theme.reward.enable')) {
  const block = /  \.console-card-group-reward[\s\S]*?(?=\n  \.console-card-group\n)/;
  if (!block.test(consoleTemplate)) throw new Error('Theme console shape changed.');
  fs.writeFileSync(consolePath, consoleTemplate.replace(block, value => '  if theme.reward.enable\n' + value.split('\n').map(line => '  ' + line).join('\n')), 'utf8');
}
console.log('Theme fixes applied: native navigation fallback and safe empty-post handling.');
