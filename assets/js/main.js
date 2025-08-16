const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const root=document.documentElement;

/* THEME — foncé par défaut, persisté, light disponible */
(function initTheme(){
  const stored=localStorage.getItem('theme');
  root.setAttribute('data-theme', stored || 'dark');
  $('#themeToggle')?.addEventListener('click',()=>{
    const now=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',now);
    localStorage.setItem('theme',now);
  });
})();

/* MOBILE NAV */
const menuToggle=$('#menuToggle');
const mobileNav=$('#mobileNav');
menuToggle?.addEventListener('click',()=>{
  const open=document.body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileNav?.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>{
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded','false');
  mobileNav?.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}));

/* YEAR */
const y=$('#year'); if(y){ y.textContent=new Date().getFullYear(); }

/* LANG */
const I18N_PATH='/assets/i18n';
const DEFAULT_LANG='fr';
const SUPPORTED=['fr','en','de','nl','se'];
const langSelect=$('#langSelect');
async function setLang(lang){
  if(!SUPPORTED.includes(lang)) lang=DEFAULT_LANG;
  try{
    const dict=await fetch(`${I18N_PATH}/${lang}.json`).then(r=>r.json());
    $$('[data-i18n]').forEach(el=>{
      const key=el.dataset.i18n;
      const val=key.split('.').reduce((a,k)=>a&&a[k],dict);
      if(typeof val==='string') el.textContent=val;
    });
    document.title=dict.meta?.title || document.title;
    const metaDesc=document.querySelector('meta[name="description"]');
    if(dict.meta?.description) metaDesc?.setAttribute('content',dict.meta.description);
    document.documentElement.lang=lang;
    localStorage.setItem('lang',lang);
    if(langSelect) langSelect.value=lang;
  }catch(_){ if(lang!==DEFAULT_LANG) setLang(DEFAULT_LANG); }
}
langSelect?.addEventListener('change',()=>setLang(langSelect.value));
setLang(localStorage.getItem('lang')||DEFAULT_LANG);

/* HERO — Desktop seulement (évite les sauts sur mobile) */
function adjustHeroHeight(){
  const desktop=window.matchMedia('(min-width: 900px)').matches;
  const hero=$('.hero'); const firstCard=$('#highlights .card');
  if(!hero || !firstCard) return;
  if(!desktop){ root.style.removeProperty('--hero-min'); return; }
  const vh=window.innerHeight, cardH=firstCard.offsetHeight;
  const ratio=0.80; const min=320;
  const h=Math.max(min, Math.round(vh - ratio*cardH - 12) - 20);
  root.style.setProperty('--hero-min', `${h}px`);
}
window.addEventListener('load', adjustHeroHeight);
window.addEventListener('resize', adjustHeroHeight);

/* CANVAS PARTICLES — animés partout, interactions desktop */
const canvas=$('#bg-canvas');
if(canvas){
  let desktop=window.matchMedia('(min-width: 900px)').matches;
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx=canvas.getContext('2d'); let w,h,particles=[]; const pointer={x:0,y:0,active:false};
  function rand(a,b){return Math.random()*(b-a)+a}
  function init(n){ particles=Array.from({length:n},()=>({x:rand(0,w),y:rand(0,h),vx:rand(-.25,.25),vy:rand(-.25,.25),r:rand(1.2,2.2)})); }
  function resize(){
    desktop=window.matchMedia('(min-width: 900px)').matches;
    w=canvas.clientWidth; h=canvas.clientHeight; canvas.width=w; canvas.height=h;
  }
  function drawFrame(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      if(pointer.active){
        const dx=p.x-pointer.x, dy=p.y-pointer.y; const dist=Math.hypot(dx,dy);
        if(dist<80){ const f=(80-dist)/80; p.vx+=(dx/dist)*f*.5; p.vy+=(dy/dist)*f*.5; }
      }
      p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(189,205,207,.85)'; ctx.fill();
    }
  }
  resize();
  init(desktop?64:28);
  drawFrame();
  function loop(){ drawFrame(); requestAnimationFrame(loop); }
  if(!reduce) requestAnimationFrame(loop);

  window.addEventListener('pointermove',e=>{
    if(!desktop || reduce) return;
    pointer.x=e.clientX; pointer.y=e.clientY; pointer.active=true;
  });
  window.addEventListener('pointerout',e=>{ if(!e.relatedTarget){ pointer.active=false; }});

  let lastWidth=window.innerWidth;
  window.addEventListener('resize',()=>{
    const wNew=window.innerWidth;
    resize();
    if(wNew!==lastWidth){
      lastWidth=wNew;
      init(desktop?64:28);
    }
  });
}



/* SKILLS — animate meters on first view */
const skillsSection=$('#competences');
if(skillsSection){
  const meters=$$('#competences meter');
  meters.forEach(m=>{ m.dataset.target=m.value; m.value=0; const label=m.closest('li').querySelector('span')?.textContent||''; m.setAttribute('aria-label', `${label}, 0%`); });
  const io=new IntersectionObserver((entries,obs)=>{
    if(entries.some(e=>e.isIntersecting)){
      meters.forEach(m=>{
        const target=+m.dataset.target; let current=0;
        function step(){ current+=target/40; if(current>=target) current=target; m.value=current; const label=m.closest('li').querySelector('span')?.textContent||''; m.setAttribute('aria-label', `${label}, ${Math.round(current)}%`); if(current<target) requestAnimationFrame(step); }
        requestAnimationFrame(step);
      });
      obs.disconnect();
    }
  },{threshold:.4});
  io.observe(skillsSection);
}

/* PROJETS — filtres fluides + badges + modal */
const grid=$('#projectsGrid'); const chips=$$('.chip');
chips.forEach(btn=>btn.addEventListener('click',()=>{
  chips.forEach(c=>{ c.classList.remove('is-active'); c.setAttribute('aria-pressed','false'); });
  btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
  const f=btn.dataset.filter; const cards=$$('.project-card',grid);
  cards.forEach(card=>{
    const tags=card.dataset.tags.split(',');
    const show=(f==='all')||tags.includes(f);
    card.classList.toggle('is-hidden', !show);
  });
}));

$$('.project-card').forEach(card=>{
  const media=$('.project-media',card); const title=$('h3',card)?.textContent||'';
  const id=card.dataset.id||'';
  const badge= id.toUpperCase() || title.split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase();
  media?.setAttribute('data-badge', badge);
});

const modal=$('#modal'); const modalTitle=$('#modalTitle'); const modalBody=$('.modal-body');
const DETAILS={
  mmc:`Plateforme légère pour regrouper des créateurs belges : catalogue filtrable, fiches produits claires, mise à jour simple. Performance, SEO et panier “lite” avec exports CSV.`,
  sw:`Refonte complète : identité visuelle, webdesign et site statique ultra-rapide. Contenus métiers (ébénisterie), galerie responsive et contact piloté par Formspree + reCAPTCHA v3.`,
  rca:`Lancement d’un Repair Café à l’école : orga, com et suivi. Page d’inscription, planning et stats des réparations (vision “impact réel”).`,
  lab:`Erasmus+ : mise en place d’un labo d’électricité. Choix matériel, sécurité, bancs d’essai, docs et mini démos connectées (IoT pédagogique).`,
  ce:`Outils pour la représentation étudiante : enquêtes, suivi, site d’infos clair et accessible. Ateliers méthodo et maintenance des services.`,
  org:`Participation active à des organisations étudiantes : événements, débats, entraide. Petites apps internes (inscriptions, votes, mini-CRM).`
};
function openModal(title,id){
  modalTitle.textContent=title;
  modalBody.textContent=DETAILS[id]||'Description à venir.';
  modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeModal(){ modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }