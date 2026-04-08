/* ============================================================
   PL90.COM — SCRIPT.JS v4
   Canvas particle network · counters · terminal · security
   ============================================================ */
'use strict';

/* ── REVEAL ── */
(function(){
  const els=document.querySelectorAll('.reveal,.reveal-delay');
  if(!els.length)return;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});
  },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  els.forEach(el=>io.observe(el));
})();

/* ── HEADER ── */
(function(){
  const h=document.getElementById('header');
  if(!h)return;
  const fn=()=>h.classList.toggle('scrolled',window.scrollY>30);
  window.addEventListener('scroll',fn,{passive:true});fn();
})();

/* ── BURGER ── */
(function(){
  const burger=document.getElementById('burger');
  const menu=document.getElementById('mobileMenu');
  if(!burger||!menu)return;
  burger.addEventListener('click',()=>{
    const open=menu.classList.toggle('open');
    burger.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-hidden',String(!open));
  });
  menu.querySelectorAll('.ml').forEach(l=>l.addEventListener('click',()=>{
    menu.classList.remove('open');burger.classList.remove('open');
    burger.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true');
  }));
  document.addEventListener('click',e=>{
    if(!burger.contains(e.target)&&!menu.contains(e.target)&&menu.classList.contains('open')){
      menu.classList.remove('open');burger.classList.remove('open');
      burger.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true');
    }
  });
})();

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');if(id==='#')return;
    const t=document.querySelector(id);
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

/* ── FOOTER YEAR ── */
(function(){
  const el=document.getElementById('footerYear');
  if(el)el.textContent='© '+new Date().getFullYear();
})();

/* ══════════════════════════════════════════════
   PARTICLE NETWORK CANVAS
   Floating nodes with connecting lines — mouse interactive
══════════════════════════════════════════════ */
(function(){
  const canvas=document.getElementById('heroCanvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let particles=[],mouse={x:-1000,y:-1000},raf,W,H;

  function resize(){
    W=canvas.width=canvas.offsetWidth;
    H=canvas.height=canvas.offsetHeight;
    initParticles();
  }

  function initParticles(){
    particles=[];
    const count=Math.min(Math.floor((W*H)/12000),80);
    for(let i=0;i<count;i++){
      particles.push({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35,
        size:Math.random()*1.5+.5,
        opacity:Math.random()*.5+.2
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    const MAX=130;
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      for(let j=i+1;j<particles.length;j++){
        const q=particles[j];
        const dx=p.x-q.x, dy=p.y-q.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<MAX){
          const alpha=(1-dist/MAX)*0.25;
          ctx.beginPath();
          ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
          ctx.strokeStyle=`rgba(0,229,160,${alpha})`;
          ctx.lineWidth=1;ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,229,160,${p.opacity})`;
      ctx.fill();
    }
  }

  function update(){
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;
      if(p.y<0||p.y>H)p.vy*=-1;
      const dx=mouse.x-p.x, dy=mouse.y-p.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<160){p.vx+=dx*.00015;p.vy+=dy*.00015;}
      const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      if(spd>1){p.vx=(p.vx/spd);p.vy=(p.vy/spd);}
    });
  }

  function loop(){draw();update();raf=requestAnimationFrame(loop);}

  canvas.closest('section')?.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
  });
  canvas.closest('section')?.addEventListener('mouseleave',()=>{mouse.x=-1000;mouse.y=-1000;});

  window.addEventListener('resize',()=>{cancelAnimationFrame(raf);resize();loop();},{passive:true});
  resize();loop();
})();

/* ══════════════════════════════════════════════
   COUNTER ANIMATION — count up when in view
══════════════════════════════════════════════ */
(function(){
  const counters=document.querySelectorAll('.counter');
  if(!counters.length)return;

  function easeOut(t){return 1-Math.pow(1-t,3);}

  function animateCounter(el){
    const mode=el.dataset.mode;
    const suffix=el.dataset.suffix||'';
    const duration=1800;
    const start=performance.now();

    // Dynamic targets — never hardcode time-based numbers
    let target;
    if(mode==='since'){
      target=new Date().getFullYear()-1997;
      el.dataset.target=target; // update for display
    } else {
      target=parseInt(el.dataset.target,10);
    }
    const startVal=mode==='year'?1980:0;

    function step(now){
      const elapsed=now-start;
      const progress=Math.min(elapsed/duration,1);
      const eased=easeOut(progress);
      const current=Math.round(startVal+(target-startVal)*eased);
      el.textContent=current+suffix;
      if(progress<1)requestAnimationFrame(step);
      else el.textContent=target+suffix;
    }
    requestAnimationFrame(step);
  }

  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  },{threshold:.5});

  counters.forEach(el=>io.observe(el));
})();

/* ══════════════════════════════════════════════
   TERMINAL TYPEWRITER
══════════════════════════════════════════════ */
(function(){
  const cmdEl=document.getElementById('typedCmd');
  const cursor=document.getElementById('termCursor');
  const outEl=document.getElementById('termOutput');
  if(!cmdEl)return;

  const yrs=new Date().getFullYear()-1997;

  const SEQ=[
    {cmd:'whoami',lines:[
      {t:'lazer (pl90)',c:'ta'},{t:'// '+yrs+' years shipping software',c:'td'},
      {t:'// coding since 1997',c:'td'}
    ]},
    {cmd:'cat capabilities.txt',lines:[
      {t:'web        → full-stack, end-to-end',c:'tw'},
      {t:'hipaa      → compliant + secure endpoints',c:'ta'},
      {t:'wordpress  → sites, plugins, workflows',c:'tw'},
      {t:'trading    → stock market systems',c:'ta'},
      {t:'mobile     → iOS & Android',c:'tw'},
      {t:'dialers    → VoIP, auto-dialer, IVR',c:'ta'},
      {t:'hardware   → custom + programmed',c:'tw'},
      {t:'integrations → own it, no subscriptions',c:'ta'},
    ]},
    {cmd:'cat status.txt',lines:[
      {t:'● status    : writing code',c:'ta'},
      {t:'  since     : 1997',c:'td'},
      {t:'  meetings  : 0  (intentional)',c:'td'},
      {t:'  fuel      : coffee + curiosity',c:'td'},
    ]},
    {cmd:'ls ./roles',lines:[
      {t:'developer/  cto/  technical-director/',c:'tw'},
      {t:'architect/  builder/ advisor/',c:'ta'},
    ]},
  ];

  let idx=0;
  function typeCmd(cmd,cb){
    let i=0;cmdEl.textContent='';cursor.style.visibility='visible';
    const t=setInterval(()=>{
      cmdEl.textContent+=cmd[i++];
      if(i>=cmd.length){clearInterval(t);setTimeout(cb,360);}
    },55+Math.random()*35);
  }
  function showLines(lines,cb){
    outEl.innerHTML='';
    lines.forEach((l,i)=>setTimeout(()=>{
      const s=document.createElement('span');
      s.className='tl '+(l.c||'');s.textContent=l.t;outEl.appendChild(s);
    },i*115));
    setTimeout(cb,lines.length*115+1500);
  }
  function clearAll(cb){
    cmdEl.textContent='';outEl.innerHTML='';cursor.style.visibility='hidden';setTimeout(cb,260);
  }
  function run(){
    const s=SEQ[idx++%SEQ.length];
    typeCmd(s.cmd,()=>showLines(s.lines,()=>
      setTimeout(()=>clearAll(()=>setTimeout(run,160)),1400)));
  }
  setTimeout(run,900);
})();

/* ══════════════════════════════════════════════
   METADATA COLLECTION
══════════════════════════════════════════════ */
const PAGE_LOAD_MS=Date.now();

function sf(id,val){
  const el=document.getElementById(id);
  if(el)el.value=(val!==undefined&&val!==null)?String(val):'';
}

sf('meta_loaded_at',new Date(PAGE_LOAD_MS).toISOString());
sf('meta_session_id',Math.random().toString(36).slice(2,12)+Date.now().toString(36));

(function(){
  const nav=navigator,conn=nav.connection||nav.mozConnection||nav.webkitConnection;
  sf('meta_ua',nav.userAgent||'');
  sf('meta_lang',nav.language||'');
  sf('meta_langs',(nav.languages||[]).join(', '));
  sf('meta_platform',nav.platform||'');
  sf('meta_vendor',nav.vendor||'');
  sf('meta_cookies',nav.cookieEnabled?'yes':'no');
  sf('meta_dnt',nav.doNotTrack||'unset');
  sf('meta_cores',nav.hardwareConcurrency||'unknown');
  sf('meta_memory',nav.deviceMemory?nav.deviceMemory+' GB':'unknown');
  sf('meta_touchpts',nav.maxTouchPoints||0);
  sf('meta_touch',(nav.maxTouchPoints||0)>0?'yes':'no');
  sf('meta_screen',screen.width+'x'+screen.height);
  sf('meta_depth',screen.colorDepth+'-bit');
  sf('meta_viewport',window.innerWidth+'x'+window.innerHeight);
  sf('meta_dpr',(window.devicePixelRatio||1)+'x');
  sf('meta_colorscheme',window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  sf('meta_conn',conn?(conn.effectiveType||conn.type||'unknown'):'unknown');
  sf('meta_speed',conn&&conn.downlink!==undefined?conn.downlink+' Mbps':'unknown');
  sf('meta_url',window.location.href);
  sf('meta_referrer',document.referrer||'direct');
  sf('meta_title',document.title);
})();

fetch('https://ipapi.co/json/',{method:'GET',headers:{'Accept':'application/json'},signal:AbortSignal.timeout(8000)})
  .then(r=>r.ok?r.json():Promise.reject())
  .then(d=>{
    const s=v=>(v!==undefined&&v!==null&&v!==false)?String(v):'';
    sf('meta_ip',s(d.ip));sf('meta_city',s(d.city));sf('meta_region',s(d.region));
    sf('meta_country',[s(d.country_name),s(d.country_code)].filter(Boolean).join(' / '));
    sf('meta_postal',s(d.postal));sf('meta_lat',s(d.latitude));sf('meta_lon',s(d.longitude));
    sf('meta_isp',s(d.org));sf('meta_org',s(d.org));sf('meta_asn',s(d.asn));sf('meta_tz',s(d.timezone));
  })
  .catch(()=>{
    ['meta_ip','meta_city','meta_region','meta_country','meta_postal',
     'meta_lat','meta_lon','meta_isp','meta_org','meta_asn','meta_tz']
    .forEach(id=>sf(id,'unavailable'));
  });

/* ══════════════════════════════════════════════
   CONTACT FORM — SECURITY + VALIDATION
══════════════════════════════════════════════ */
(function(){
  const form=document.getElementById('contactForm');
  if(!form)return;
  const sub=document.getElementById('submitBtn');
  const btnTxt=document.getElementById('btnText');
  const btnLdr=document.getElementById('btnLoading');
  const charCt=document.getElementById('charCount');
  const msgTA=document.getElementById('fmessage');
  const agreeEl=document.getElementById('agreeTerms');
  const fbs={
    success:document.getElementById('formSuccess'),
    error:document.getElementById('formError'),
    rateLimit:document.getElementById('formRateLimit'),
    errMsg:document.getElementById('formErrorMsg'),
  };
  const fields={
    name:{el:document.getElementById('fname'),err:document.getElementById('nameErr')},
    email:{el:document.getElementById('femail'),err:document.getElementById('emailErr')},
    message:{el:msgTA,err:document.getElementById('msgErr')},
    agree:{el:agreeEl,err:document.getElementById('agreeErr')},
  };
  const RATE_MS=5*60*1000,MIN_MS=2500,RL_KEY='pl90_sent';
  const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if(msgTA&&charCt){
    msgTA.addEventListener('input',()=>{
      const len=msgTA.value.length,max=5000;
      charCt.textContent=len.toLocaleString()+' / '+max.toLocaleString();
      charCt.className='ccount'+(len>max*.9?' limit':len>max*.75?' warn':'');
    });
  }

  function setErr(k,msg){
    const f=fields[k];if(!f)return;
    if(msg){f.el.classList.add('invalid');if(f.err)f.err.textContent=msg;}
    else{f.el.classList.remove('invalid');if(f.err)f.err.textContent='';}
  }
  Object.keys(fields).forEach(k=>{
    const el=fields[k].el;if(!el)return;
    el.addEventListener(el.type==='checkbox'?'change':'input',()=>setErr(k,''));
  });

  function clearFb(){Object.values(fbs).forEach(el=>el&&el.classList&&el.classList.remove('show'));}
  function showFb(type,msg){
    clearFb();
    if(type==='success')fbs.success.classList.add('show');
    if(type==='rateLimit')fbs.rateLimit.classList.add('show');
    if(type==='error'){if(msg&&fbs.errMsg)fbs.errMsg.textContent=msg;fbs.error.classList.add('show');}
  }

  const honeypotTripped=()=>['hp_website','hp_phone','hp_company','hp_url'].some(n=>{
    const el=form.querySelector('[name="'+n+'"]');return el&&el.value.trim()!=='';
  });
  const tooFast=()=>(Date.now()-PAGE_LOAD_MS)<MIN_MS;
  const rateLim=()=>{try{return(Date.now()-parseInt(sessionStorage.getItem(RL_KEY)||'0',10))<RATE_MS;}catch{return false;}};
  const recSend=()=>{try{sessionStorage.setItem(RL_KEY,Date.now().toString());}catch{}};

  function validate(){
    let ok=true;
    const name=fields.name.el.value.trim();
    if(!name){setErr('name','Name is required.');ok=false;}
    else if(name.length<2){setErr('name','Name is too short.');ok=false;}
    else setErr('name','');
    const email=fields.email.el.value.trim();
    if(!email){setErr('email','Email is required.');ok=false;}
    else if(!EMAIL_RE.test(email)){setErr('email',"That doesn't look like a valid email.");ok=false;}
    else setErr('email','');
    const msg=fields.message.el.value.trim();
    if(!msg){setErr('message','Message is required.');ok=false;}
    else if(msg.length<10){setErr('message','Write at least a sentence.');ok=false;}
    else if(msg.length>5000){setErr('message','Message exceeds 5,000 characters.');ok=false;}
    else setErr('message','');
    if(!agreeEl||!agreeEl.checked){setErr('agree','You must agree to the Terms and Privacy Policy.');ok=false;}
    else setErr('agree','');
    return ok;
  }

  function setLoading(on){
    sub.disabled=on;btnTxt.style.display=on?'none':'inline';btnLdr.style.display=on?'inline':'none';
  }

  let lastClick=0;
  sub.addEventListener('click',e=>{if(Date.now()-lastClick<900){e.preventDefault();return;}lastClick=Date.now();});

  form.addEventListener('submit',async e=>{
    e.preventDefault();clearFb();
    if(honeypotTripped()||tooFast()){showFb('success');form.reset();return;}
    if(rateLim()){showFb('rateLimit');return;}
    if(!validate()){const first=form.querySelector('.invalid');if(first)first.scrollIntoView({behavior:'smooth',block:'center'});return;}
    const ts=new Date().toISOString();
    sf('meta_submit_ts',ts);
    sf('meta_time_on_page',Math.round((Date.now()-PAGE_LOAD_MS)/1000)+'s');
    sf('meta_agreed','true');sf('meta_agreed_at',ts);
    setLoading(true);
    try{
      const res=await fetch(form.action,{
        method:'POST',body:new FormData(form),
        headers:{'Accept':'application/json'},signal:AbortSignal.timeout(15000),
      });
      if(res.ok){
        recSend();form.reset();
        if(charCt)charCt.textContent='0 / 5,000';
        Object.keys(fields).forEach(k=>setErr(k,''));
        showFb('success');
        fbs.success.scrollIntoView({behavior:'smooth',block:'center'});
      }else{
        let msg='Please try again in a moment.';
        try{const b=await res.json();if(b&&b.error)msg=b.error;}catch{}
        if(res.status===429)msg='Too many requests — wait a few minutes.';
        if(res.status===422)msg='Validation failed. Check your inputs.';
        if(res.status===403)msg='Submission blocked. Refresh and try again.';
        if(res.status>=500)msg='Server error. Try again shortly.';
        showFb('error',msg);
      }
    }catch(err){
      let msg='Network error — please try again.';
      if(err.name==='AbortError'||err.name==='TimeoutError')msg='Request timed out. Check your connection.';
      else if(!navigator.onLine)msg='You appear to be offline.';
      showFb('error',msg);
    }finally{setLoading(false);}
  });
})();
