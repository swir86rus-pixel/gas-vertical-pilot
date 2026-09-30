/* Адаптер площадок «Газовой вертикали»: MAX, Telegram или обычный браузер.
   Подключается в <head> каждой страницы пилота ПОСЛЕ SDK мессенджеров:
   <script src="vendor/max-web-app.js"></script>  (копия MAX Bridge в обёртке)
   <script src="https://telegram.org/js/telegram-web-app.js"></script>
   <script src="platform.js"></script>
   Сохранения: игра по-прежнему пишет в localStorage (ключи gv_*), а адаптер
   копирует их в облачное хранилище мессенджера и забирает при запуске. */
(function(){
const tg=window.Telegram&&Telegram.WebApp,mx=window.WebApp;
const kind=tg&&tg.initData?'telegram':mx&&mx.initData?'max':'web';
const app=kind==='telegram'?tg:kind==='max'?mx:null;
const CLOUD='gv_sync',page=location.pathname.split('/').pop()||'index.html';
const call=(f,...a)=>{try{return app&&typeof app[f]==='function'?app[f](...a):undefined}catch(e){}};

/* снимок всех ключей gv_* (музыка, прогресс, эпизоды) */
function snapshot(){const o={};try{for(const k of Object.keys(localStorage))if(k.startsWith('gv_'))o[k]=localStorage.getItem(k)}catch(e){}return o}
function apply(o){try{for(const k in o)localStorage.setItem(k,o[k])}catch(e){}}
const stamp=()=>{try{return +localStorage.getItem('gv__t')||0}catch(e){return 0}};

/* облачное хранилище есть только у Telegram (CloudStorage, до 4096 символов на ключ).
   У MAX лишь DeviceStorage на этом же устройстве — там хватает localStorage */
const cs=app&&app.CloudStorage;
function cloudGet(){return new Promise(r=>{if(!cs)return r(null);
 try{const p=cs.getItem(CLOUD,(e,v)=>r(e?null:v));if(p&&p.then)p.then(r,()=>r(null))}catch(e){r(null)}})}
function cloudSet(v){if(!cs)return;try{const p=cs.setItem(CLOUD,v,()=>{});p&&p.catch&&p.catch(()=>{})}catch(e){}}

let last=JSON.stringify(snapshot());
function push(){const s=snapshot();delete s.gv__t;const j=JSON.stringify(s);if(j===last)return;last=j;
 const t=Date.now();try{localStorage.setItem('gv__t',t)}catch(e){}
 const blob=JSON.stringify({t,d:s});if(blob.length<4000)cloudSet(blob)}
function pull(){return cloudGet().then(v=>{let c;try{c=JSON.parse(v)}catch(e){}
 if(!c||!c.d||c.t<=stamp())return false;
 apply(c.d);try{localStorage.setItem('gv__t',c.t)}catch(e){}last=JSON.stringify(snapshot());return true})}

const P={kind,inApp:!!app,
 user(){const u=app&&app.initDataUnsafe&&app.initDataUnsafe.user;return u?{id:u.id,name:[u.first_name,u.last_name].filter(Boolean).join(' ')}:null},
 haptic(type='light'){const h=app&&app.HapticFeedback;try{h&&(h.impactOccurred?h.impactOccurred(type):null)}catch(e){}},
 share(text,url){if(app&&kind==='telegram'&&url)return call('openTelegramLink','https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(text));
  if(navigator.share)return navigator.share({text,url}).catch(()=>{})},
 sync:push,pull};
window.Platform=P;
document.documentElement.classList.add('pf-'+kind);
if(!app)return;

/* настройка окна мини-приложения */
call('ready');call('expand');
call('disableVerticalSwipes');           /* свайп вниз не закрывает игру во время ходьбы */
call('enableClosingConfirmation');
try{app.setHeaderColor&&app.setHeaderColor('#1c1714');app.setBackgroundColor&&app.setBackgroundColor('#1c1714')}catch(e){}

/* системная кнопка «Назад»: из эпизода — на главную */
const bb=app.BackButton;
if(bb&&page!=='index.html'){try{bb.show();(bb.onClick||bb.onclick).call(bb,()=>{push();location.href='index.html'})}catch(e){}}
else if(bb)try{bb.hide()}catch(e){}

/* синхронизация прогресса */
pull().then(ch=>{if(ch&&page==='index.html'){try{if(!sessionStorage.getItem('gv_pulled')){sessionStorage.setItem('gv_pulled',1);location.reload()}}catch(e){}}});
setInterval(push,5000);
addEventListener('pagehide',push);
document.addEventListener('visibilitychange',()=>document.hidden&&push());
})();

/* ── Статистика: Яндекс Метрика + игровые события ─────────────────────────
   Впишите номер счётчика в METRIKA_ID. Пока там 0 — ничего не загружается и не отправляется.
   События собираются сами, без правок в эпизодах: адаптер раз в секунду смотрит на состояние
   движка (Engine.st) и отправляет цель, когда игрок прошёл очередной шаг, ошибся или дошёл до финала.
   Цели (создать в Метрике как «JavaScript-событие»):
   game_open, ep1_start, ep1_site, ep1_finish, mistake и шаги вида razdevalka_dressed, ploshadka_valves. */
(function(){
const METRIKA_ID=113217473;
const P=window.Platform||(window.Platform={kind:'web'});
const page=location.pathname.split('/').pop()||'index.html';
const SCENE={'episode1.html':'razdevalka','episode1-2.html':'ploshadka'}[page];
const sent=new Set();
P.track=function(name,params){if(!METRIKA_ID||!window.ym)return;try{ym(METRIKA_ID,'reachGoal',name,params||{})}catch(e){}};
const once=(name,params)=>{if(sent.has(name))return;sent.add(name);P.track(name,params)};
if(!METRIKA_ID)return;
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();
 k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
ym(METRIKA_ID,'init',{accurateTrackBounce:true,clickmap:false,trackLinks:false,params:{platform:P.kind}});
if(page==='index.html')once('game_open',{platform:P.kind});
if(!SCENE)return;
once(SCENE==='razdevalka'?'ep1_start':'ep1_site',{platform:P.kind});
let mist=null;
setInterval(()=>{const st=window.Engine&&Engine.st;if(!st)return;
 for(const k in st.f)if(st.f[k]===1||st.f[k]===true)once(SCENE+'_'+k);          /* пройденные шаги */
 if(mist===null)mist=st.mistakes||0;
 if(st.mistakes>mist){mist=st.mistakes;const g=document.getElementById('goal');
  P.track('mistake',{scene:SCENE,goal:g?g.textContent.replace(/^\W*Задача:\s*/,''):''})}
 if(st.done)once('ep1_finish',{mistakes:st.mistakes||0,platform:P.kind});
},1000);
})();
