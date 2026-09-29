/* Единое сохранение прогресса «Газовой вертикали».
   Всё хранится в браузере игрока (localStorage) под ключом gv_save.
   Подключается на каждой странице игры: <script src="progress.js"></script> */
(function(){
const KEY='gv_save';
const BRANCHES=['prod','trans','proc','store','dist'];
// какие эпизоды открывают первый уровень какой ветки (сварщик и КИПовец — сквозные)
const EP_BRANCH={ep1:['prod'],ep2:['trans'],ep3:['trans'],ep4:BRANCHES,ep5:BRANCHES,ep6:['dist'],ep7:['dist'],ep8:['proc'],ep9:['store']};
function empty(){return {v:1,eps:{},levels:{},branch:null,final:null,last:null,started:Date.now()}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.v)return d}catch(e){}return migrate()}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
// перенос прогресса из старых ключей (до появления единого сохранения)
function migrate(){const d=empty();try{
 for(let i=1;i<=9;i++){const v=+localStorage.getItem('gv_ep_ep'+i);if(v)d.eps['ep'+i]=v}
 const b=localStorage.getItem('gv_branch');if(b)d.branch=b;
 const f=localStorage.getItem('gv_final');if(f)d.final=+f;
 const lv=+localStorage.getItem('gv_level');if(lv)for(let n=2;n<lv;n++)mark(d,'prod',n);
 BRANCHES.forEach(br=>{const v=+localStorage.getItem('gv_level_'+br);if(v)for(let n=2;n<v;n++)mark(d,br,n)});
}catch(e){}save(d);return d}
function mark(d,br,n){(d.levels[br]=d.levels[br]||{})[n]=Math.max(1,(d.levels[br]||{})[n]||1)}
const GV={
 BRANCHES,EP_BRANCH,load,save,
 ep(id,stars){const d=load();d.eps[id]=Math.max(d.eps[id]||0,stars);save(d)},
 win(br,level){const d=load();if(br){mark(d,br,level);d.branch=br}save(d)},
 setBranch(br){const d=load();d.branch=br;save(d)},
 final(score){const d=load();d.final=Math.max(d.final||0,score);save(d)},
 levelDone(d,br,n){if(n===1)return Object.keys(d.eps).some(e=>(EP_BRANCH[e]||[]).includes(br));return !!(d.levels[br]&&d.levels[br][n])},
 reset(){try{localStorage.removeItem(KEY);Object.keys(localStorage).filter(k=>k.startsWith('gv_')).forEach(k=>localStorage.removeItem(k))}catch(e){}},
 exportCode(){return btoa(unescape(encodeURIComponent(JSON.stringify(load()))))},
 importCode(c){const d=JSON.parse(decodeURIComponent(escape(atob(c.trim()))));if(!d||!d.v)throw new Error('bad');save(d);return d},
};
window.GV=GV;
// запоминаем последнюю открытую страницу игры — для кнопки «Продолжить»
const page=location.pathname.split('/').pop()||'index.html';
if(!['index.html','episodes.html',''].includes(page)&&!/-v\d\.html$/.test(page)){
 const d=load();d.last={url:page+location.search,title:document.title,time:Date.now()};save(d)}
})();
