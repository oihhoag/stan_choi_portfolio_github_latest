
function openProject(id){
  document.getElementById('home').style.display='none';
  document.querySelectorAll('.detail').forEach(el=>el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}
function goHome(){
  document.querySelectorAll('.detail').forEach(el=>el.classList.remove('active'));
  document.getElementById('home').style.display='block';
  window.scrollTo(0,0);
}

(function(){
  const sidebar=document.querySelector('.line-sidebar'); if(!sidebar) return;
  const list=sidebar.querySelector('.line-sidebar__list');
  const items=Array.from(sidebar.querySelectorAll('.line-sidebar__item'));
  const targets=items.map(()=>0), current=items.map((_,i)=>i===0?1:0);
  let activeIndex=0, raf=null, last=performance.now();
  const radius=92, smoothing=110, ease=p=>p*p*(3-2*p);
  function frame(now){
    const dt=Math.min((now-last)/1000,.05); last=now;
    const k=1-Math.exp(-dt/(Math.max(smoothing,1)/1000)); let moving=false;
    items.forEach((item,i)=>{
      const target=Math.max(targets[i]||0,activeIndex===i?1:0);
      const next=current[i]+(target-current[i])*k;
      const settled=Math.abs(target-next)<.0015;
      current[i]=settled?target:next;
      item.style.setProperty('--effect',current[i].toFixed(4));
      if(!settled) moving=true;
    });
    raf=moving?requestAnimationFrame(frame):null;
  }
  function start(){if(raf!==null)return;last=performance.now();raf=requestAnimationFrame(frame)}
  list.addEventListener('pointermove',e=>{
    const rect=list.getBoundingClientRect(), y=e.clientY-rect.top;
    items.forEach((item,i)=>{const center=item.offsetTop+item.offsetHeight/2;targets[i]=ease(Math.max(0,1-Math.abs(y-center)/radius))});
    start();
  });
  list.addEventListener('pointerleave',()=>{targets.fill(0);start()});
  function activate(i){
    activeIndex=i;
    items.forEach((item,j)=>j===i?item.setAttribute('aria-current','true'):item.removeAttribute('aria-current'));
    const target=document.getElementById(items[i].dataset.target);
    if(target){
      if(target.tagName === 'DETAILS') target.open = true;
      target.scrollIntoView({behavior:'smooth',block:'start'});
    }
    start();
  }
  items.forEach((item,i)=>{
    item.addEventListener('click',()=>activate(i));
    item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(i)}})
  });
  items.forEach((item,i)=>item.style.setProperty('--effect',current[i]));
})();







(function(){
  const subitems = Array.from(document.querySelectorAll('.line-sidebar__subitem'));

  function openDesignSection(item){
    const target = document.getElementById(item.dataset.target);
    if(!target) return;

    if(target.tagName === 'DETAILS') target.open = true;

    document.querySelectorAll('.line-sidebar__subitem').forEach(el=>{
      el.toggleAttribute('aria-current', el === item);
    });

    target.scrollIntoView({behavior:'smooth', block:'start'});
  }

  subitems.forEach(item=>{
    item.addEventListener('click', e=>{
      e.stopPropagation();
      openDesignSection(item);
    });
    item.addEventListener('keydown', e=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        e.stopPropagation();
        openDesignSection(item);
      }
    });
  });

  const designMain = document.querySelector('.line-sidebar__item--group');
  if(designMain){
    designMain.addEventListener('click', e=>{
      if(e.target.closest('.line-sidebar__subitem')) return;
      const first = document.getElementById('work-current');
      if(first){
        first.open = true;
        first.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  }
})();











(function(){
  if(!window.matchMedia('(pointer:fine)').matches) return;

  const cursor = document.querySelector('.target-cursor-wrapper');
  if(!cursor) return;
  document.documentElement.classList.add('target-cursor-ready');

  const dot = cursor.querySelector('.target-cursor-dot');
  const corners = Array.from(cursor.querySelectorAll('.target-cursor-corner'));
  const targets = Array.from(document.querySelectorAll('.cursor-target'));

  let mouse = {x:window.innerWidth/2,y:window.innerHeight/2};
  let pos = {x:mouse.x,y:mouse.y};
  let activeTarget = null;
  let cornerTargets = null;
  let raf = null;
  let visible = false;
  let rotation = 0;

  const rest = [
    {x:-18,y:-18},
    {x:6,y:-18},
    {x:6,y:6},
    {x:-18,y:6}
  ];

  corners.forEach((corner,i)=>{
    corner.dataset.x = rest[i].x;
    corner.dataset.y = rest[i].y;
  });

  function getTargetCorners(target){
    const rect = target.getBoundingClientRect();
    const pad = 4;
    const size = 12;
    return [
      {x:rect.left-pad, y:rect.top-pad},
      {x:rect.right+pad-size, y:rect.top-pad},
      {x:rect.right+pad-size, y:rect.bottom+pad-size*-1},
      {x:rect.left-pad, y:rect.bottom+pad-size*-1}
    ];
  }

  function render(){
    pos.x += (mouse.x-pos.x)*0.24;
    pos.y += (mouse.y-pos.y)*0.24;
    cursor.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;

    if(activeTarget && cornerTargets){
      cornerTargets = getTargetCorners(activeTarget);
      corners.forEach((corner,i)=>{
        const tx = cornerTargets[i].x-pos.x;
        const ty = cornerTargets[i].y-pos.y;
        const cx = parseFloat(corner.dataset.x || 0);
        const cy = parseFloat(corner.dataset.y || 0);
        const nx = cx + (tx-cx)*0.22;
        const ny = cy + (ty-cy)*0.22;
        corner.dataset.x = nx;
        corner.dataset.y = ny;
        corner.style.transform = `translate3d(${nx}px,${ny}px,0) rotate(0deg)`;
      });
      rotation = 0;
    }else{
      rotation += 0.9;
      corners.forEach((corner,i)=>{
        const target = rest[i];
        const cx = parseFloat(corner.dataset.x || target.x);
        const cy = parseFloat(corner.dataset.y || target.y);
        const nx = cx + (target.x-cx)*0.16;
        const ny = cy + (target.y-cy)*0.16;
        corner.dataset.x = nx;
        corner.dataset.y = ny;
        corner.style.transform = `translate3d(${nx}px,${ny}px,0) rotate(${rotation}deg)`;
      });
    }

    raf = requestAnimationFrame(render);
  }

  window.addEventListener('mousemove', e=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if(!visible){
      visible = true;
      cursor.classList.add('is-visible');
    }
  }, {passive:true});

  window.addEventListener('mousedown', ()=>{
    dot.style.transform='translate(-50%,-50%) scale(.7)';
    cursor.style.scale='.92';
  });

  window.addEventListener('mouseup', ()=>{
    dot.style.transform='translate(-50%,-50%) scale(1)';
    cursor.style.scale='1';
  });

  targets.forEach(target=>{
    target.addEventListener('mouseenter', ()=>{
      activeTarget = target;
      cornerTargets = getTargetCorners(target);
    });

    target.addEventListener('mouseleave', ()=>{
      if(activeTarget === target){
        activeTarget = null;
        cornerTargets = null;
      }
    });
  });

  window.addEventListener('mouseleave', ()=>{
    cursor.classList.remove('is-visible');
    visible = false;
  });

  raf = requestAnimationFrame(render);
})();


(function(){
  const detail=document.getElementById('boston-whaler');
  if(!detail) return;
  const bar=detail.querySelector('.bw-progress span');
  const heroMedia=detail.querySelector('[data-bw-parallax]');
  const reveals=[...detail.querySelectorAll('.bw-reveal')];
  const navLinks=[...detail.querySelectorAll('.bw-chapter-nav a')];
  const sections=navLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const positionChapter=detail.querySelector('.bw-position-chapter');
  const positionPercent=detail.querySelector('.bw-position-percent');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } });
  },{threshold:.12,rootMargin:'0px 0px -7%'});
  reveals.forEach(el=>revealObserver.observe(el));

  const update=()=>{
    if(!detail.classList.contains('active')) return;
    const rect=detail.getBoundingClientRect();
    const traveled=Math.max(0,-rect.top);
    const max=Math.max(1,detail.scrollHeight-window.innerHeight);
    const pct=Math.min(100,traveled/max*100);
    bar.style.width=pct+'%';
    if(positionPercent) positionPercent.textContent=Math.round(pct)+'%';
    if(heroMedia && !reduced){ heroMedia.style.transform=`translate3d(0,${Math.min(70,traveled*.09)}px,0) scale(1.02)`; }
    let current=sections[0];
    sections.forEach(section=>{ if(section.getBoundingClientRect().top<window.innerHeight*.36) current=section; });
    navLinks.forEach(a=>a.classList.toggle('is-active',current && a.getAttribute('href')==='#'+current.id));
    if(positionChapter && current){
      const activeLink=navLinks.find(a=>a.getAttribute('href')==='#'+current.id);
      positionChapter.textContent=activeLink?activeLink.textContent.trim():'Overview';
    }
  };
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  detail.querySelectorAll('.bw-chapter-nav a').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault(); const target=detail.querySelector(a.getAttribute('href')); if(target) target.scrollIntoView({behavior:reduced?'auto':'smooth'});
  }));
  detail.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>setTimeout(update,50)));
  update();
})();

// Boston Whaler flagship interactions
(function(){
  const detail=document.getElementById('boston-whaler');
  if(!detail) return;
  const progress=detail.querySelector('.bw-progress span');
  const links=[...detail.querySelectorAll('.bw-chapter-nav a')];
  const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const reveal=detail.querySelectorAll('.bw-reveal');
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.12,rootMargin:'0px 0px -8%'});
  reveal.forEach(el=>io.observe(el));
  const update=()=>{
    if(!detail.classList.contains('active')) return;
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=(max?scrollY/max*100:0)+'%';
    let current=sections[0];
    sections.forEach(s=>{if(s.getBoundingClientRect().top<innerHeight*.38) current=s});
    links.forEach(a=>a.classList.toggle('is-active',current&&a.getAttribute('href')==='#'+current.id));
    const hero=detail.querySelector('[data-bw-parallax]');
    if(hero&&scrollY<innerHeight*1.2) hero.style.transform=`translate3d(0,${scrollY*.12}px,0)`;
  };
  addEventListener('scroll',update,{passive:true}); update();

  detail.querySelectorAll('[data-bw-tilt]').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(matchMedia('(pointer:coarse)').matches) return;
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(1100px) rotateX(${-y*2.4}deg) rotateY(${x*2.4}deg)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });
  const track=detail.querySelector('.bw-brochure-track');
  if(track){let down=false,startX=0,startScroll=0;track.addEventListener('pointerdown',e=>{down=true;startX=e.clientX;startScroll=track.scrollLeft;track.setPointerCapture(e.pointerId)});track.addEventListener('pointermove',e=>{if(down)track.scrollLeft=startScroll-(e.clientX-startX)});track.addEventListener('pointerup',()=>down=false);track.addEventListener('pointercancel',()=>down=false)}
})();

// Boston Whaler V4 interactions
(function(){
  const detail=document.getElementById('boston-whaler');
  if(!detail) return;

  const journey=[...detail.querySelectorAll('[data-bw-step]')];
  const journeyBar=detail.querySelector('.bw-journey-line span');
  journey.forEach((button,index)=>button.addEventListener('click',()=>{
    journey.forEach(item=>item.classList.remove('is-active'));
    button.classList.add('is-active');
    if(journeyBar) journeyBar.style.transform=`translateX(${index*100}%)`;
    const evidence=detail.querySelector('.bw-evidence-grid');
    if(evidence){
      evidence.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(6px)',opacity:.72},{transform:'translateY(0)',opacity:1}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  }));

  const track=detail.querySelector('.bw-concepts');
  const cards=track?[...track.querySelectorAll('.bw-concept-card')]:[];
  const prev=detail.querySelector('[data-bw-concept-prev]');
  const next=detail.querySelector('[data-bw-concept-next]');
  const count=detail.querySelector('[data-bw-concept-count]');
  let conceptIndex=0;
  const syncConcept=(index,scroll=true)=>{
    conceptIndex=Math.max(0,Math.min(cards.length-1,index));
    if(count) count.textContent=`${String(conceptIndex+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    if(scroll&&cards[conceptIndex]) cards[conceptIndex].scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});
  };
  if(prev) prev.addEventListener('click',()=>syncConcept(conceptIndex-1));
  if(next) next.addEventListener('click',()=>syncConcept(conceptIndex+1));
  if(track&&cards.length){
    let timer;
    track.addEventListener('scroll',()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const left=track.scrollLeft;
        let best=0,dist=Infinity;
        cards.forEach((card,i)=>{const d=Math.abs(card.offsetLeft-left);if(d<dist){dist=d;best=i}});
        syncConcept(best,false);
      },80);
    },{passive:true});
  }

  const feature=detail.querySelector('.bw-feature-spread');
  const depth=[...detail.querySelectorAll('.bw-launch-depth span')];
  const motion=()=>{
    if(!detail.classList.contains('active')) return;
    const vh=window.innerHeight||1;
    if(feature){
      const r=feature.getBoundingClientRect();
      const p=Math.max(-1,Math.min(1,(r.top-vh*.5)/vh));
      feature.style.transform=`translateY(${p*-18}px) scale(${1-Math.abs(p)*.012})`;
      depth.forEach((el,i)=>el.style.transform=`translate3d(${p*(i+1)*16}px,${p*(i+1)*-12}px,0) rotate(${28+p*6}deg)`);
    }
  };
  window.addEventListener('scroll',motion,{passive:true});
  motion();
})();

// 290 Outrage mobile carousel interactions: buttons, keyboard, swipe and drag.
(function(){
  document.querySelectorAll('[data-carousel]').forEach(carousel=>{
    const track=carousel.querySelector('.bw290-track');
    const slides=[...carousel.querySelectorAll('.bw290-slide')];
    const prev=carousel.querySelector('.bw290-prev');
    const next=carousel.querySelector('.bw290-next');
    const dots=carousel.querySelector('.bw290-dots');
    const count=carousel.querySelector('.bw290-count span');
    if(!track||slides.length<2)return;
    let index=0,startX=0,deltaX=0,dragging=false;
    slides.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Go to slide ${i+1}`);b.addEventListener('click',()=>go(i));dots.appendChild(b)});
    function go(i){index=(i+slides.length)%slides.length;track.style.transform=`translateX(-${index*100}%)`;[...dots.children].forEach((d,j)=>d.classList.toggle('is-active',j===index));count.textContent=String(index+1).padStart(2,'0')}
    prev.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));
    carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(index-1);if(e.key==='ArrowRight')go(index+1)});
    track.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;deltaX=0;track.setPointerCapture(e.pointerId);track.style.transition='none'});
    track.addEventListener('pointermove',e=>{if(!dragging)return;deltaX=e.clientX-startX;track.style.transform=`translateX(calc(-${index*100}% + ${deltaX}px))`});
    function end(){if(!dragging)return;dragging=false;track.style.transition='';if(Math.abs(deltaX)>45)go(index+(deltaX<0?1:-1));else go(index)}
    track.addEventListener('pointerup',end);track.addEventListener('pointercancel',end);go(0);
  });
})();
