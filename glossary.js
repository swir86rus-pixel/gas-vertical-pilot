/* Глоссарий: расшифровка аббревиатур при наведении (на телефоне — по нажатию).
   Подключается на любой странице игры: <script src="glossary.js"></script> */
(function(){
const GL={
 'УКПГ':'Установка комплексной подготовки газа: очищает и осушает газ перед подачей в трубу',
 'ДКС':'Дожимная компрессорная станция: «поджимает» газ, когда падает пластовое давление',
 'КС':'Компрессорная станция: заново сжимает газ в магистральном газопроводе каждые 100–150 км',
 'ГПА':'Газоперекачивающий агрегат: газовая турбина + нагнетатель, сердце компрессорной станции',
 'ГТУ':'Газотурбинная установка: двигатель, который крутит нагнетатель ГПА',
 'САУ':'Система автоматического управления агрегатом',
 'МГ':'Магистральный газопровод: труба большого диаметра для транспорта газа на тысячи км',
 'ГРС':'Газораспределительная станция: снижает давление и одорирует газ перед подачей в город',
 'ГРО':'Газораспределительная организация: доставляет газ по сетям до потребителей',
 'ПХГ':'Подземное хранилище газа: летом газ закачивают, зимой отбирают',
 'СИЗ':'Средства индивидуальной защиты: каска, спецодежда, перчатки, газоанализатор и т. п.',
 'КИПиА':'Контрольно-измерительные приборы и автоматика',
 'КИП':'Контрольно-измерительные приборы; на трассе — контрольно-измерительный пункт электрохимзащиты',
 'ЭХЗ':'Электрохимическая защита трубы от коррозии',
 'ЛЭС':'Линейно-эксплуатационная служба: обслуживает трассу газопровода',
 'ЛПУ':'Линейное производственное управление магистральных газопроводов',
 'ЛК':'Линейный кран: отсекает участок газопровода',
 'НК':'Неразрушающий контроль: проверка швов рентгеном, ультразвуком и т. п.',
 'САГ':'Сварочный агрегат (передвижной генератор для сварки)',
 'ГПЗ':'Газоперерабатывающий завод',
 'ЗСК':'Завод стабилизации конденсата',
 'СПГ':'Сжиженный природный газ (охлаждён до −162 °C)',
 'СУГ':'Сжиженные углеводородные газы (пропан, бутан)',
 'СПБТ':'Смесь пропана и бутана технических',
 'НДПИ':'Налог на добычу полезных ископаемых',
 'НГКМ':'Нефтегазоконденсатное месторождение',
 'ГКМ':'Газоконденсатное месторождение',
 'КРС':'Капитальный ремонт скважин',
 'ТО':'Техническое обслуживание',
 'ОТ':'Охрана труда',
 'РД':'Регулятор давления',
 'МПа':'Мегапаскаль, единица давления. 1 МПа ≈ 10 атмосфер',
 'НКПР':'Нижний концентрационный предел распространения пламени',
 'ЕСГ':'Единая система газоснабжения России',
 'ТЭЦ':'Теплоэлектроцентраль',
 'ЯНАО':'Ямало-Ненецкий автономный округ',
 'ХМАО':'Ханты-Мансийский автономный округ — Югра',
 'Ду':'Диаметр условный (номинальный) трубы, мм',
 'АДС':'Аварийно-диспетчерская служба газового хозяйства: телефон 04 (с мобильного — 104 или 112)',
 'ГРП':'Газорегуляторный пункт: снижает давление газа в городской сети до нужного потребителям',
 'ШРП':'Шкафной регуляторный пункт: небольшой ГРП в металлическом шкафу',
 'ВДГО':'Внутридомовое газовое оборудование: трубы и краны в подъездах и подвалах',
 'ВКГО':'Внутриквартирное газовое оборудование: плита, котёл, колонка и краны в квартире',
 'УК':'Управляющая компания жилого дома',
 'ЛПУМГ':'Линейное производственное управление магистральных газопроводов',
 'ВТД':'Внутритрубная диагностика: снаряд-дефектоскоп проходит по трубе и ищет дефекты',
 'ПЭ':'Полиэтиленовые трубы: не ржавеют, служат 50+ лет',
 'ПДК':'Предельно допустимая концентрация вредного вещества в воздухе рабочей зоны',
 'СИЗОД':'Средства индивидуальной защиты органов дыхания: противогаз, респиратор, дыхательный аппарат',
 'ШФЛУ':'Широкая фракция лёгких углеводородов: смесь этана, пропана, бутанов и более тяжёлых компонентов — сырьё для нефтехимии',
 'ЭПБ':'Этан-пропан-бутановая смесь',
 'KPI':'Ключевые показатели эффективности',
 'P&L':'Отчёт о прибылях и убытках',
 'PT-201':'Датчик давления (Pressure Transmitter) № 201',
};
const keys=Object.keys(GL).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[&-]/g,'\\$&'));
const RE=new RegExp(`(?<![А-Яа-яЁёA-Za-z0-9])(${keys.join('|')})(?![А-Яа-яЁёA-Za-z0-9])`,'g');

document.head.insertAdjacentHTML('beforeend',`<style>
.gl{text-decoration:underline dotted;text-underline-offset:3px;cursor:help}
#gltip{position:fixed;z-index:1000;max-width:280px;background:#2a211b;color:#f3e6cc;border:2px solid #f3e6cc;border-radius:6px;padding:6px 10px;font:14px/1.35 Georgia,serif;box-shadow:3px 3px 0 #0006;pointer-events:none;display:none}
#gltip b{color:#ffcf7a}
svg text.glsvg{cursor:help}
</style>`);
const tip=document.createElement('div');tip.id='gltip';document.body.appendChild(tip);
function showTip(list,x,y){tip.innerHTML=list.map(k=>`<b>${k}</b> — ${GL[k]}`).join('<br>');tip.style.display='block';
 const w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.max(6,Math.min(innerWidth-w-6,x-w/2))+'px';tip.style.top=(y-h-14<6?y+18:y-h-14)+'px'}
function hideTip(){tip.style.display='none'}
const SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT']);
function glossify(root){
 if(!root||root.nodeType!==1&&root.nodeType!==3)return;
 const walker=document.createTreeWalker(root.nodeType===3?root.parentNode:root,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentNode;if(!p||SKIP.has(p.nodeName)||p.closest('.gl,#gltip,.bubble,#temp,svg'))return NodeFilter.FILTER_REJECT;
  RE.lastIndex=0;return RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{const frag=document.createDocumentFragment();let last=0,t=n.nodeValue;RE.lastIndex=0;let m;
  while((m=RE.exec(t))){frag.append(t.slice(last,m.index));const s=document.createElement('span');s.className='gl';s.dataset.k=m[1];s.textContent=m[1];frag.append(s);last=m.index+m[1].length}
  frag.append(t.slice(last));n.replaceWith(frag)})}
function svgMatches(el){RE.lastIndex=0;const f=[...new Set((el.textContent.match(RE)||[]))];return f}
// наведение мышью
document.addEventListener('pointerover',e=>{const g=e.target.closest&&e.target.closest('.gl');
 if(g){const r=g.getBoundingClientRect();showTip([g.dataset.k],r.left+r.width/2,r.top);return}
 if(e.target instanceof SVGTextElement){const l=svgMatches(e.target);if(l.length){e.target.classList.add('glsvg');showTip(l,e.clientX,e.clientY);return}}
 hideTip()});
// касание на телефоне: показать подсказку и не «проглотить» клик по кнопке выбора
document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('.gl');
 if(g){const r=g.getBoundingClientRect();showTip([g.dataset.k],r.left+r.width/2,r.top);if(!g.closest('button,a'))e.stopPropagation();setTimeout(hideTip,3500);return}
 if(e.target instanceof SVGTextElement){const l=svgMatches(e.target);if(l.length){showTip(l,e.clientX,e.clientY);setTimeout(hideTip,3500)}}},true);
// следим за новыми текстами (диалоги, журнал, карточки)
let queued=new Set(),pending=false;
new MutationObserver(ms=>{ms.forEach(m=>m.addedNodes.forEach(n=>queued.add(n)));
 if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;const q=[...queued];queued.clear();q.forEach(n=>n.isConnected&&glossify(n))})}})
 .observe(document.body,{childList:true,subtree:true,characterData:false});
glossify(document.body);
window.GLOSSARY=GL;
})();
