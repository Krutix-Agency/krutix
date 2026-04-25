/* ---- MENU ---- */
function toggleMenu(){
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('mobile-menu').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on careers page
  if (window.location.pathname.includes('careers.html') || document.getElementById('page-careers')) {
    setTimeout(startHumanTypewriter,400);
  }

  // Active Nav Link Logic
  function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash;
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const rawHref = link.getAttribute('href') || '';
      let targetPath = rawHref.split('#')[0];
      let targetHash = rawHref.includes('#') ? '#' + rawHref.split('#')[1] : '';
      if (targetPath === '') targetPath = 'index.html';
      
      // Add active if path matches, and hash matches (or both have no hash)
      if (currentPath === targetPath && currentHash === targetHash) {
        link.classList.add('active');
      }
    });
  }
  
  setActiveNavLink();
  window.addEventListener('hashchange', setActiveNavLink);
  // Intersection Observer for scroll-based highlighting on the home page
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section crosses the middle of the screen
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        
        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, '#' + id);
        } else {
          window.location.hash = '#' + id;
        }
        
        setActiveNavLink(); // Rely on our updated hash location
      }
    });
  }, observerOptions);

  // Watch all sections that have an ID corresponding to a navigation link (like #services)
  document.querySelectorAll('.section[id]').forEach((section) => {
    navObserver.observe(section);
  });
  
  // Also watch hero to reset to Home
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (history.pushState) {
          history.pushState(null, null, window.location.pathname);
        } else {
          window.location.hash = ''; // Clear hash
        }
        setActiveNavLink();
      }
    }, observerOptions);
    heroObserver.observe(heroSection);
  }
});

function filterWork(btn,cat){
  document.querySelectorAll('.filt').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.wproject').forEach(p=>{p.style.display=(cat==='all'||p.dataset.cat===cat)?'block':'none'});
}
async function submitContact(e) {
  e.preventDefault();
  const btn = document.getElementById('contact-submit-btn');
  const ok = document.getElementById('success-msg');
  const err = document.getElementById('contact-error');
  const fCont = document.getElementById('contact-form-content');
  const origText = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;
  try {
    const res = await fetch('https://formspree.io/f/maqavddy', {
      method: 'POST',
      body: new FormData(e.target),
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      ok.style.display = 'flex';
      err.style.display = 'none';
      if (fCont) fCont.style.opacity = '0';
      e.target.reset();
    } else {
      throw new Error();
    }
  } catch (ex) {
    err.style.display = 'block';
    ok.style.display = 'none';
  }
  btn.disabled = false;
  btn.textContent = origText;
}

function closeContactSuccess() {
  const ok = document.getElementById('success-msg');
  const fCont = document.getElementById('contact-form-content');
  if (ok) ok.style.display = 'none';
  if (fCont) fCont.style.opacity = '1';
}
window.addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('scrolled',scrollY>40));

/* ---- INTRO ANIMATION ---- */
(function(){
  const intro=document.getElementById('krutix-intro');
  const fill=document.getElementById('ki-fill');
  const bar=document.getElementById('ki-bar');
  if(!intro)return;
  // Intelligent Intro Animation Logic
  let shouldPlayIntro = true;
  
  if (window.performance && window.performance.getEntriesByType) {
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const navType = navEntries[0].type;
      
      // If navigating internally or using back/forward, don't play
      if ((navType === 'navigate' && document.referrer.includes(window.location.host)) || navType === 'back_forward') {
        shouldPlayIntro = false;
      }
    }
  }

  // Fallback for older browsers: use sessionStorage, but allow reload to bypass
  if (shouldPlayIntro && sessionStorage.getItem('krutixIntroPlayed') === 'internal') {
     // Wait, if we use navigation API, we don't strictly need sessionStorage except for edge cases.
     // Let's just rely on referrer instead of sessionStorage.
  }

  // Set internal marker on clicks
  document.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      sessionStorage.setItem('krutixIntroPlayed', 'internal');
    });
  });

  if (!shouldPlayIntro) {
    intro.style.display = 'none';
    if(typeof startCountUps === 'function') startCountUps();
    return;
  }
  
  // Clear it so manual refresh works next time
  sessionStorage.removeItem('krutixIntroPlayed');

  document.body.style.overflow='hidden';
  let start=null;
  const dur=2000;
  function step(ts){
    if(!start) start=ts;
    const p=Math.min((ts-start)/dur,1);
    const ease=p<.5?2*p*p:-1+(4-2*p)*p;
    fill.style.width=(ease*100)+'%';
    bar.style.width=(p*100)+'%';
    if(p<1){requestAnimationFrame(step);return}
    setTimeout(()=>{
      intro.style.transition='opacity .8s ease,transform .8s ease';
      intro.style.opacity='0';
      intro.style.transform='scale(1.05)';
      document.body.style.overflow='';
      setTimeout(()=>{intro.style.display='none';startCountUps()},800);
    },800);
  }
  setTimeout(()=>requestAnimationFrame(step),400);
})();

/* ---- COUNT UP ---- */
function startCountUps(){
  document.querySelectorAll('.count').forEach(el=>{
    const target=+el.dataset.target;
    if(target===0)return;
    let cur=0;const step=Math.ceil(target/60);
    const t=setInterval(()=>{cur=Math.min(cur+step,target);el.textContent=cur;if(cur>=target)clearInterval(t)},22);
  });
}

/* ---- PARTICLES ---- */
(function(){
  const canvas=document.getElementById('particles-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let W,H;
  const pts=Array.from({length:60},()=>({
    x:Math.random()*1400,y:Math.random()*800,
    vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,
    r:Math.random()*1.3+.3,o:Math.random()*.45+.08
  }));
  function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight}
  resize();window.addEventListener('resize',resize);
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;
      if(p.y<0)p.y=H;if(p.y>H)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,255,209,${p.o})`;ctx.fill();
    });
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<130){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(0,255,209,${.08*(1-d/130)})`;ctx.lineWidth=.5;ctx.stroke()}
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---- CAREERS TYPEWRITER & MODAL ---- */
function startHumanTypewriter(){
  const el=document.getElementById('human-typewriter');
  if(!el||el.dataset.started)return;
  el.dataset.started='1';
  const lines=['Hey, are you Human? 👀','Wait — this section is for you.'];
  let li=0,ci=0,phase='type';
  function tick(){
    const line=lines[li];
    if(phase==='type'){
      el.textContent=line.slice(0,++ci)+(li===0?'▌':'');
      if(ci===line.length){
        if(li===0){phase='pause';setTimeout(()=>{phase='delete';setTimeout(tick,0)},1200);return;}
        else{el.textContent=line;return;}
      }
    } else if(phase==='delete'){
      el.textContent=line.slice(0,--ci)+'▌';
      if(ci===0){li=1;phase='type';}
    } else if(phase==='pause'){return;}
    setTimeout(tick,phase==='delete'?40:90);
  }
  tick();
}

function openApply(role, meta){
  const isAI = role.toLowerCase().includes('ai agent') || role.toLowerCase().includes('agent');
  document.getElementById('modal-role').textContent = role;
  document.getElementById('modal-type-label').textContent = isAI ? 'Agent Registration' : 'Apply for Role';
  document.getElementById('modal-type-label').style.color = 'var(--cyan)';
  // show correct form
  document.getElementById('cv-form-human').style.display = isAI ? 'none' : 'block';
  document.getElementById('cv-form-ai').style.display = isAI ? 'block' : 'none';
  // reset
  document.getElementById('cv-form-human').reset();
  document.getElementById('cv-form-ai').reset();
  ['human-success','human-error','ai-success','ai-error'].forEach(id=>{document.getElementById(id).style.display='none'});
  ['human-form-content','ai-form-content'].forEach(id=>{const el=document.getElementById(id); if(el) el.style.opacity='1'});
  if(isAI) document.getElementById('ai-role-input').value = role+' — '+meta;
  else document.getElementById('human-role-input').value = role+' — '+meta;
  const m=document.getElementById('cv-modal');
  m.style.display='flex';
  document.body.style.overflow='hidden';
}
function closeApply(){
  document.getElementById('cv-modal').style.display='none';
  document.body.style.overflow='';
}
async function submitForm(e, type){
  e.preventDefault();
  const btn=document.getElementById(type+'-submit-btn');
  const ok=document.getElementById(type+'-success');
  const err=document.getElementById(type+'-error');
  const origText=btn.textContent;
  btn.textContent='Sending...';btn.disabled=true;
  try{
    const res=await fetch('https://formspree.io/f/xyklodoe',{method:'POST',body:new FormData(e.target),headers:{Accept:'application/json'}});
    const data = await res.json().catch(() => ({}));
    if(res.ok){
      ok.style.display='flex';
      err.style.display='none';
      const fCont=document.getElementById(type+'-form-content');
      if(fCont) fCont.style.opacity='0';
      e.target.reset();
    }
    else {
      throw new Error(data.error || 'Submission failed. Please retry.');
    }
  }catch(ex){
    err.style.display='block';
    ok.style.display='none';
    err.textContent = ex.message || 'Something went wrong. Please try again.';
  }
  btn.disabled=false;btn.textContent=origText;
}
(function(){
  const phrases=['digital systems','AI agents','web apps','mobile systems'];
  let pi=0,ci=0,del=false;
  const el=document.getElementById('typed-text');
  if(!el)return;
  function tick(){
    const w=phrases[pi];
    el.textContent=del?w.slice(0,--ci):w.slice(0,++ci);
    if(!del&&ci===w.length){del=true;setTimeout(tick,1800);return}
    if(del&&ci===0){del=false;pi=(pi+1)%phrases.length}
    setTimeout(tick,del?55:110);
  }
  setTimeout(tick,1000);
})();