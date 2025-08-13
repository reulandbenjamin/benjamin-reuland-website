const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const root=document.documentElement;

/* Theme (conservé) */
(function(){
  const stored=localStorage.getItem('theme');
  root.setAttribute('data-theme', stored || 'dark');
  $('#themeToggle')?.addEventListener('click',()=>{
    const now=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',now); localStorage.setItem('theme',now);
  });
})();

/* Burger + lock scroll (inchangé) */
const navToggle=$('.nav-toggle');
navToggle?.addEventListener('click',()=>{
  const open=document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

/* YEAR */
const y=$('#year'); if(y){ y.textContent=new Date().getFullYear(); }

/* LANG (inchangé) */
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
    $$('[data-i18n]').forEach(el=>{ const key=el.getAttribute('data-i18n'); const value=key.split('.').reduce((a,k)=>a?.[k],dict); if(typeof value==='string') el.textContent=value; });
    document.documentElement.lang=lang;
  }catch(e){ if(lang!==DEFAULT_LANG) loadI18n(DEFAULT_LANG); }
}
loadI18n(currentLang);

/* HERO — Desktop: remonte ~20px ; Mobile: rien (hauteur CSS fixe) */
function adjustHeroHeight(){
  const desktop=window.matchMedia('(min-width: 900px)').matches;
  const hero=$('.hero'); const firstCard=$('#highlights .card'); const header=$('.site-header');
  if(!hero || !firstCard || !header) return;
  if(!desktop){ root.style.removeProperty('--hero-min'); return; }
  const vh=window.innerHeight, cardH=firstCard.offsetHeight, headerH=header.offsetHeight;
  const ratio=0.80;
  const min=320;
  let h=Math.max(min, Math.round(vh - ratio*cardH - headerH - 12) - 20); // -20px demandé
  root.style.setProperty('--hero-min', `${h}px`);
}
window.addEventListener('load', adjustHeroHeight);
window.addEventListener('resize', adjustHeroHeight);

/* Particules (inchangé: desktop animé, mobile image statique) */
const canvas=$('#bg-canvas');
if(canvas){
  const desktop=window.matchMedia('(min-width: 900px)').matches;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx=canvas.getContext('2d'); let w,h,particles=[];
  function resize(){ w=canvas.clientWidth; h=canvas.clientHeight; canvas.width=w; canvas.height=h; }
  function rand(a,b){return Math.random()*(b-a)+a}
  function drawFrame(){ ctx.clearRect(0,0,w,h); for(const p of particles){ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(189,205,207,.85)'; ctx.fill(); } }
  function init(n){ particles=Array.from({length:n},()=>({x:rand(0,w),y:rand(0,h),vx:rand(-.25,.25),vy:rand(-.25,.25),r:rand(1.2,2.2)})); }
  resize(); init(desktop?64:28); drawFrame();
  if(desktop && !reduce){ (function loop(){ drawFrame(); requestAnimationFrame(loop); })(); }
  window.addEventListener('resize',()=>{ resize(); init(desktop?64:28); drawFrame(); });
}

/* Projets / modal / filtres (inchangé) */

/* CONTACT — Formspree + reCAPTCHA v3 (inchangé) */
const FORMSPREE=window.FORMSPREE_ENDPOINT||"";
const RECAPTCHA_SITEKEY=window.RECAPTCHA_SITEKEY||"";
const form=$('#contactForm'); const statusEl=$('.form-msg');
form?.addEventListener('submit',async e=>{
  e.preventDefault(); statusEl.textContent='';
  if(form.querySelector('.hp')?.value) return; // honeypot
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
      grecaptcha.ready(async ()=>{ const token=await grecaptcha.execute(RECAPTCHA_SITEKEY,{action:'submit'}); data.append('g-recaptcha-response', token); await send(); });
    }catch(_){ await send(); }
  }else{ await send(); }
});
