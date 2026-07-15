
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
