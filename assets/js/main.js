const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const root=document.documentElement;

/* THEME — foncé par défaut, persisté */
(function initTheme(){
  const stored=localStorage.getItem('theme');
  root.setAttribute('data-theme', stored || 'dark');
  $('#themeToggle')?.addEventListener('click',()=>{
    const now=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',now); localStorage.setItem('theme',now);
  });
})();

/* MOBILE NAV (burger strawberry) + lock scroll */
const navToggle=$('.nav-toggle');
navToggle?.addEventListener('click',()=>{
  const open=document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

/* YEAR */
$('#year') && ($('#year').textContent=new Date().getFullYear());

/* LANG */
const DEFAULT_LANG='fr';
let currentLang=localStorage.getItem('lang')||DEFAULT_LANG;
const langSelect=$('#langSelect');
langSelect && (langSelect.value=currentLang);
langSelect?.addEventListener('change',()=>{ currentLang=langSelect.value; localStorage.setItem('lang',currentLang); loadI18n(currentLang); });

async function loadI18n(lang){
  try{
    const res=await fetch(`/assets/i18n/${lang}.json`,{cache:'no-store'});
    const dict=await res.json();
    document.title=dict.meta.title;
    const metaDesc=document.querySelector('meta[name="description"]'); metaDesc?.setAttribute('content',dict.meta.description);
    $$('[data-i18n]').forEach(el=>{
      const key=el.getAttribute('data-i18n');
      const value=key.split('.').reduce((a,k)=>a?.[k],dict);
      if(typeof value==='string') el.textContent=value;
    });
    document.documentElement.lang=lang;
  }catch(e){ if(lang!==DEFAULT_LANG) loadI18n(DEFAULT_LANG); }
}
loadI18n(currentLang);

/* HERO → rendre 90% des cartes visibles au premier écran */
function adjustHeroGap(){
  const hero=$('.hero'); const highlights=$('#highlights');
  if(!hero || !highlights) return;
  const headerH=$('.site-header')?.offsetHeight||0;
  const firstCard=$('#highlights .card'); if(!firstCard) return;
  const cardH=firstCard.offsetHeight;
  const vh=window.innerHeight;
  /* On veut que le haut de #highlights soit à vh - 90%*cardH */
  const desiredTop = Math.max(0, vh - 0.9*cardH - headerH);
  hero.style.setProperty('--hero-pad-bottom', `${Math.round(desiredTop)}px`);
}
window.addEventListener('load', adjustHeroGap);
window.addEventListener('resize', adjustHeroGap);

/* CANVAS PARTICLES (pause si reduce motion) */
const prefersReduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas=$('#bg-canvas');
if(canvas && !prefersReduce){
  const ctx=canvas.getContext('2d'); let w,h,particles=[],mouse={x:0,y:0,active:false};
  const DPR=Math.min(window.devicePixelRatio||1,2);
  function resize(){ w=canvas.clientWidth; h=canvas.clientHeight; canvas.width=w*DPR; canvas.height=h*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
  function rand(a,b){return Math.random()*(b-a)+a}
  function init(){ particles=Array.from({length:64},()=>({x:rand(0,w),y:rand(0,h),vx:rand(-.3,.3),vy:rand(-.3,.3),r:rand(1.2,2.4)})); }
  function step(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      if(mouse.active){ const dx=mouse.x-p.x, dy=mouse.y-p.y, d=Math.hypot(dx,dy)||1; const force=Math.min(80/d,1.2); p.vx+=(dx/d)*force*0.02; p.vy+=(dy/d)*force*0.02; }
      p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(189,205,207,.85)'; ctx.fill();
    } requestAnimationFrame(step);
  }
  resize(); init(); step();
  window.addEventListener('resize',()=>{resize(); init();});
  canvas.addEventListener('pointermove',e=>{ mouse.x=e.offsetX; mouse.y=e.offsetY; mouse.active=true; });
  canvas.addEventListener('pointerleave',()=>{ mouse.active=false; });
}

/* MAGNET */
$$('.magnet').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect(); const dx=(e.clientX-(r.left+r.width/2))/(r.width/2); const dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
    el.style.transform=`translate(${dx*6}px, ${dy*6}px)`;});
  el.addEventListener('mouseleave',()=> el.style.transform='translate(0,0)');
});

/* PROJETS — filtres fluides (fade/scale + collapse) */
const grid=$('#projectsGrid'); const chips=$$('.chip');
chips.forEach(btn=>btn.addEventListener('click',()=>{
  chips.forEach(c=>{ c.classList.remove('is-active'); c.setAttribute('aria-pressed','false'); });
  btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
  const f=btn.dataset.filter; const cards=$$('.project-card',grid);
  cards.forEach(card=>{
    const tags=card.dataset.tags.split(',');
    const show=(f==='all')||tags.includes(f);
    if(show){
      card.classList.remove('is-hidden'); card.style.opacity='1'; card.style.transform='scale(1)';
    }else{
      card.style.opacity='0'; card.style.transform='scale(.98)';
      setTimeout(()=> card.classList.add('is-hidden'), 180);
    }
  });
}));

/* CONTACT — Formspree + hCaptcha (optionnels) */
const FORMSPREE=window.FORMSPREE_ENDPOINT||"";
const form=$('#contactForm'); const statusEl=$('.form-msg');
form?.addEventListener('submit',async e=>{
  e.preventDefault(); statusEl.textContent='';
  if(form.company?.value) return; // honeypot
  const data=new FormData(form);

  if(FORMSPREE){
    try{
      // hCaptcha si présent
      if(window.hcaptcha){
        const token=hcaptcha.getResponse();
        if(!token){ statusEl.textContent='Veuillez compléter le Captcha.'; return; }
        data.append('h-captcha-response', token);
      }
      const res=await fetch(FORMSPREE,{method:'POST',body:data,headers:{'Accept':'application/json'}});
      if(res.ok){ statusEl.textContent='Merci ! Votre message a bien été envoyé.'; form.reset(); if(window.hcaptcha) hcaptcha.reset(); }
      else{ statusEl.textContent='Oups, une erreur est survenue. Réessayez.'; }
    }catch(_){ statusEl.textContent='Oups, une erreur est survenue. Réessayez.'; }
  }else{
    const subject=encodeURIComponent('Contact site benjamin-reuland.be');
    const body=encodeURIComponent(`Nom: ${form.name.value}\nEmail: ${form.email.value}\n\n${form.message.value}`);
    window.location.href=`mailto:contact@benjamin-reuland.be?subject=${subject}&body=${body}`;
  }
});

/* CURSOR custom */
const cursor=$('#cursor'); const coarse=window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(cursor && !coarse && !reduce){
  window.addEventListener('pointermove',e=>{ cursor.style.opacity='1'; cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px'; });
  window.addEventListener('pointerdown',()=> cursor.style.transform='translate(-50%,-50%) scale(.9)');
  window.addEventListener('pointerup',()=> cursor.style.transform='translate(-50%,-50%) scale(1)');
  document.addEventListener('mouseleave',()=> cursor.style.opacity='0');
}
