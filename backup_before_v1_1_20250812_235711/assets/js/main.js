const DEFAULT_LANG='fr';
const I18N_PATH='/assets/i18n/';
const FORMSPREE_ENDPOINT='';
const CONTACT_EMAIL='contact@benjamin-reuland.be';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

/* Theme */
const themeBtn=$('#themeToggle');
const root=document.documentElement;
const storedTheme=localStorage.getItem('theme');
if(storedTheme) root.setAttribute('data-theme', storedTheme);
else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches){ root.setAttribute('data-theme','light'); }
themeBtn?.addEventListener('click',()=>{ const now=root.getAttribute('data-theme')==='light'?'dark':'light'; root.setAttribute('data-theme',now); localStorage.setItem('theme',now); });

/* Mobile nav */
const navToggle=$('.nav-toggle');
navToggle?.addEventListener('click',()=>{
  const expanded=navToggle.getAttribute('aria-expanded')==='true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  document.body.classList.toggle('nav-open', !expanded);
});

/* Year */
$('#year').textContent=new Date().getFullYear();

/* I18N */
let currentLang=localStorage.getItem('lang')||DEFAULT_LANG;
const langBtns=$$('.lang-btn');
function setLangActive(lang){ langBtns.forEach(b=>b.setAttribute('aria-current', b.dataset.lang===lang?'true':'false')); document.documentElement.lang=lang; }
async function loadI18n(lang){
  try{
    const res=await fetch(`${I18N_PATH}${lang}.json`,{cache:'no-store'});
    const dict=await res.json();
    document.title=dict.meta.title;
    document.querySelector('meta[name="description"]').setAttribute('content',dict.meta.description);
    $$('[data-i18n]').forEach(el=>{
      const key=el.getAttribute('data-i18n');
      const value=key.split('.').reduce((a,k)=>a?.[k],dict);
      if(typeof value==='string') el.textContent=value;
    });
    setLangActive(lang);
  }catch(e){ console.warn('i18n load failed, fallback to FR',e); if(lang!==DEFAULT_LANG) loadI18n(DEFAULT_LANG); }
}
langBtns.forEach(btn=>btn.addEventListener('click',()=>{ const lang=btn.dataset.lang; currentLang=lang; localStorage.setItem('lang',lang); loadI18n(lang); }));
loadI18n(currentLang);

/* Projects filter */
const grid=$('#projectsGrid');
const chips=$$('.chip');
chips.forEach(btn=>btn.addEventListener('click',()=>{
  chips.forEach(c=>{ c.classList.remove('is-active'); c.setAttribute('aria-pressed','false'); });
  btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
  const f=btn.dataset.filter;
  $$('.project-card',grid).forEach(card=>{
    const tags=card.dataset.tags.split(',');
    const show=(f==='all')||tags.includes(f);
    card.style.opacity=show?'1':'0';
    card.style.transform=show?'scale(1)':'scale(.98)';
    card.style.pointerEvents=show?'auto':'none';
  });
}));

/* Timeline observer */
const tlItems=$$('.tl-item');
if('IntersectionObserver' in window){
  const obs=new IntersectionObserver(entries=>{ entries.forEach(e=> e.target.style.opacity=e.isIntersecting?'1':'.6'); },{threshold:.6});
  tlItems.forEach(i=>{ i.style.transition='opacity 300ms'; obs.observe(i); });
}

/* Canvas particles */
const prefersReduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas=$('#bg-canvas');
if(canvas && !prefersReduce){
  const ctx=canvas.getContext('2d');
  let w,h,particles=[],mouse={x:0,y:0,active:false};
  const DPR=Math.min(window.devicePixelRatio||1,2);
  function resize(){ w=canvas.clientWidth; h=canvas.clientHeight; canvas.width=w*DPR; canvas.height=h*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
  function rand(a,b){return Math.random()*(b-a)+a}
  function init(){ particles=Array.from({length:64},()=>({x:rand(0,w),y:rand(0,h),vx:rand(-.3,.3),vy:rand(-.3,.3),r:rand(1.2,2.4)})); }
  function step(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      if(mouse.active){ const dx=mouse.x-p.x, dy=mouse.y-p.y, d=Math.hypot(dx,dy)||1; const force=Math.min(80/d,1.2); p.vx+=(dx/d)*force*0.02; p.vy+=(dy/d)*force*0.02; }
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(189,205,207,.8)'; ctx.fill();
    }
    requestAnimationFrame(step);
  }
  resize(); init(); step();
  window.addEventListener('resize',()=>{resize(); init();});
  canvas.addEventListener('pointermove',e=>{ mouse.x=e.offsetX; mouse.y=e.offsetY; mouse.active=true; });
  canvas.addEventListener('pointerleave',()=>{ mouse.active=false; });
}

/* Custom cursor */
const cursor=$('#cursor');
const hasCoarse=window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
if(cursor && !hasCoarse && !prefersReduce){
  window.addEventListener('pointermove',e=>{ cursor.style.opacity='1'; cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px'; });
  window.addEventListener('pointerdown',()=> cursor.style.transform='translate(-50%,-50%) scale(.9)');
  window.addEventListener('pointerup',()=> cursor.style.transform='translate(-50%,-50%) scale(1)');
  document.addEventListener('mouseleave',()=> cursor.style.opacity='0');
}

/* Hover magnet */
$$('.magnet').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect();
    const dx=(e.clientX-(r.left+r.width/2))/(r.width/2);
    const dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
    el.style.transform=`translate(${dx*6}px, ${dy*6}px)`;
  });
  el.addEventListener('mouseleave',()=> el.style.transform='translate(0,0)');
});

/* Contact form */
const form=$('#contactForm');
const statusEl=$('.form-msg');
form?.addEventListener('submit',async e=>{
  e.preventDefault(); statusEl.textContent='';
  if(form.company?.value) return;
  const data=new FormData(form);
  if(FORMSPREE_ENDPOINT){
    try{
      const res=await fetch(FORMSPREE_ENDPOINT,{method:'POST',body:data,headers:{'Accept':'application/json'}});
      statusEl.textContent= res.ok ? i18n('contact.success') : i18n('contact.error');
      if(res.ok) form.reset();
    }catch(_){ statusEl.textContent=i18n('contact.error'); }
  }else{
    const subject=encodeURIComponent('Contact site benjamin-reuland.be');
    const body=encodeURIComponent(`Nom: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
    window.location.href=`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }
});
function i18n(path){
  const lang=document.documentElement.lang||DEFAULT_LANG;
  const probe=document.querySelector(`[data-i18n="${path}"]`);
  return probe?.textContent||'';
}
$('#primary-nav')?.addEventListener('click',e=>{
  if(e.target.tagName==='A' && document.body.classList.contains('nav-open')){
    document.body.classList.remove('nav-open'); navToggle.setAttribute('aria-expanded','false');
  }
});
