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

/* MOBILE NAV (burger strawberry) + lock scroll */
const navToggle=$('.nav-toggle');
navToggle?.addEventListener('click',()=>{
  const open=document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

/* YEAR */
const y=$('#year'); if(y){ y.textContent=new Date().getFullYear(); }

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
    document.title=dict.meta?.title || document.title;
    const metaDesc=document.querySelector('meta[name="description"]'); if(dict.meta?.description) metaDesc?.setAttribute('content',dict.meta.description);
    $$('[data-i18n]').forEach(el=>{
      const key=el.getAttribute('data-i18n');
      const value=key.split('.').reduce((a,k)=>a?.[k],dict);
      if(typeof value==='string') el.textContent=value;
    });
    document.documentElement.lang=lang;
  }catch(e){ if(lang!==DEFAULT_LANG) loadI18n(DEFAULT_LANG); }
}
loadI18n(currentLang);

/* HERO — Desktop seulement (évite les sauts sur mobile) */
function adjustHeroHeight(){
  const desktop=window.matchMedia('(min-width: 900px)').matches;
  const hero=$('.hero'); const firstCard=$('#highlights .card'); const header=$('.site-header');
  if(!hero || !firstCard || !header) return;
  if(!desktop){ root.style.removeProperty('--hero-min'); return; }
  const vh=window.innerHeight, cardH=firstCard.offsetHeight, headerH=header.offsetHeight;
  const ratio=0.80; // ~80% visible
  const min=320;
  const h=Math.max(min, Math.round(vh - ratio*cardH - headerH - 12) - 20);
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
    init(desktop?64:28);
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

  function init(n){ particles=Array.from({length:n},()=>({x:rand(0,w),y:rand(0,h),vx:rand(-.25,.25),vy:rand(-.25,.25),r:rand(1.2,2.2)})); }
  resize(); init(desktop?64:28); drawFrame();
  if(desktop && !reduce){
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect(); pointer.x=e.clientX-r.left; pointer.y=e.clientY-r.top; pointer.active=true;});
    canvas.addEventListener('pointerleave',()=>{pointer.active=false;});
    (function loop(){ drawFrame(); requestAnimationFrame(loop); })();
    window.addEventListener('resize',()=>{ resize(); init(64); });
  }else{
    window.addEventListener('resize',()=>{ resize(); drawFrame(); });
  }

}

/* MAGNET */
$$('.magnet').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect(); const dx=(e.clientX-(r.left+r.width/2))/(r.width/2); const dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
    el.style.transform=`translate(${dx*6}px, ${dy*6}px)`;});
  el.addEventListener('mouseleave',()=> el.style.transform='translate(0,0)');
});

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
    if(show){
      card.classList.remove('is-hidden');
      card.style.opacity='0';
      card.style.transform='scale(.96)';
      requestAnimationFrame(()=>{ card.style.opacity='1'; card.style.transform='scale(1)'; });
    }else{
      card.style.opacity='0';
      card.style.transform='scale(.96)';
      setTimeout(()=> card.classList.add('is-hidden'), 320);
    }
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
modal?.addEventListener('click',e=>{ if(e.target.hasAttribute('data-close')) closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
$$('.project-card .overlay').forEach(link=>{
  link.addEventListener('click',(e)=>{
    e.preventDefault();
    const card=e.currentTarget.closest('.project-card');
    const id=card.dataset.id; const title=$('h3',card)?.textContent||'Projet';
    openModal(title,id);
  });
});

/* CONTACT — Formspree + reCAPTCHA v3 */
const FORMSPREE=window.FORMSPREE_ENDPOINT||"";
const RECAPTCHA_SITEKEY=window.RECAPTCHA_SITEKEY||"";
const form=$('#contactForm'); const statusEl=$('.form-msg');
form?.addEventListener('focusin',()=>document.body.classList.add('show-recaptcha'),{once:true});
form?.addEventListener('submit',async e=>{
  e.preventDefault(); statusEl.textContent='';
  if(form.company?.value) return; // honeypot
  const data=new FormData(form);

  async function send(){
    try{
      const res=await fetch(FORMSPREE,{method:'POST',body:data,headers:{'Accept':'application/json'}});
      if(res.ok){ statusEl.textContent='Merci ! Votre message a bien été envoyé.'; form.reset(); }
      else{ statusEl.textContent='Oups, une erreur est survenue. Réessayez.'; }
    }catch(_){ statusEl.textContent='Oups, une erreur est survenue. Réessayez.'; }
  }

  if(FORMSPREE && RECAPTCHA_SITEKEY && window.grecaptcha){
    try{
      grecaptcha.ready(async ()=>{
        const token=await grecaptcha.execute(RECAPTCHA_SITEKEY,{action:'submit'});
        data.append('g-recaptcha-response', token);
        await send();
      });
    }catch(_){ await send(); }
  }else{
    if(!FORMSPREE){
      const subject=encodeURIComponent('Contact site benjamin-reuland.be');
      const body=encodeURIComponent(`Nom: ${form.name.value}\nEmail: ${form.email.value}\n\n${form.message.value}`);
      window.location.href=`mailto:contact@benjamin-reuland.be?subject=${subject}&body=${body}`;
    }else{
      await send();
    }
  }
});

/* CURSOR (desktop only) */
const cursor=$('#cursor'); const coarse=window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(cursor && !coarse && !reduce){
  window.addEventListener('pointermove',e=>{ cursor.style.opacity='1'; cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px'; });
  window.addEventListener('pointerdown',()=> cursor.style.transform='translate(-50%,-50%) scale(.9)');
  window.addEventListener('pointerup',()=> cursor.style.transform='translate(-50%,-50%) scale(1)');
  document.addEventListener('mouseleave',()=> cursor.style.opacity='0');
}
