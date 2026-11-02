/** SARKSH FOODS V17 — native browser-level river & frond animation.
 * The original photograph and animations are pre-rendered in animated WebP,
 * so animation works WITHOUT Canvas, GPU/WebGL, npm packages, or runtime effects.
 * Only approved V15 hero image content is altered; all HTML site sections remain.
 */
(()=>{
 'use strict';
 const hero=document.querySelector('.hero-v15');if(!hero)return;
 const sky=hero.querySelector('#bird-sky');
 const replay=hero.querySelector('#replay-sunrise');
 const pause=hero.querySelector('#toggle-motion');
 const image=hero.querySelector('.valley-fallback');
 if(!sky||!replay||!pause||!image)return;
 const icon=pause.querySelector('.motion-icon');
 const label=pause.querySelector('.motion-label');
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const animatedSrc='assets/golden-valley-v20-motion.webp';
 const staticSrc='assets/golden-valley-v17-still.webp';
 let isPaused=false,version=0,userMotionOverride=false;
 const scene=hero.querySelector('.valley-photo');
 const snapshot=document.createElement('img');
 snapshot.className='valley-freeze-frame';snapshot.alt='';snapshot.setAttribute('aria-hidden','true');
 scene.appendChild(snapshot);
 hero.dataset.motionEngine='native-animated-webp';
 // Pause captures the displayed frame from the animated image; resume returns to the
 // same native image. Works even when graphics acceleration is unavailable.
 function snapFrame(){
   const cn=document.createElement('canvas');
   cn.width=image.naturalWidth||1672;cn.height=image.naturalHeight||941;
   try {const c=cn.getContext('2d',{alpha:false});c.drawImage(image,0,0,cn.width,cn.height);
     snapshot.src=cn.toDataURL('image/webp',.91);
     hero.dataset.pauseCapture='ok';
   } catch(e){snapshot.src=staticSrc;hero.dataset.pauseCapture='fallback';}
 }
 function setPaused(next){
   isPaused=Boolean(next);
   if(isPaused){snapFrame();hero.classList.add('motion-paused');}
   else{hero.classList.remove('motion-paused');}
   pause.setAttribute('aria-pressed',String(isPaused));
   pause.setAttribute('aria-label',isPaused?'Resume scene motion':'Pause scene motion');
   icon.textContent=isPaused?'▶':'Ⅱ';
   label.textContent=isPaused?'Resume motion':'Pause motion';
 }
 pause.addEventListener('click',()=>{
   if(reduce.matches && !userMotionOverride){
     userMotionOverride=true;reducedScene();setPaused(false);return;
   }
   setPaused(!isPaused);
 });
 replay.addEventListener('click',()=>{
   userMotionOverride=true;reducedScene();setPaused(false);
   version++;
   image.src=animatedSrc+'?v20-replay='+version;
   // Replay birds using same CSS keyframes as V15/V16.
   const nodes=sky.querySelectorAll('.flying-bird,.bird-model,.wing-left,.wing-right');
   nodes.forEach(node=>node.style.animation='none');
   void sky.offsetHeight;
   nodes.forEach(node=>node.style.animation='');
 });
 const reducedScene=()=>{
   if(reduce.matches && !userMotionOverride){image.src=staticSrc;sky.style.display='none';hero.dataset.motionEngine='reduced-motion-static';
     pause.setAttribute('aria-label','Enable website scene motion');label.textContent='Enable motion';icon.textContent='▶';}
   else{image.src=animatedSrc;sky.style.display='';hero.dataset.motionEngine='native-animated-webp';
     if(!isPaused){pause.setAttribute('aria-label','Pause scene motion');label.textContent='Pause motion';icon.textContent='Ⅱ';}}
 };
 if(reduce.addEventListener)reduce.addEventListener('change',reducedScene);
 reducedScene();
 const birdSvg=`<svg viewBox="0 0 100 55" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <g class="wing-left"><path d="M50 24C34 8 18 8 1 14C18 17 29 26 46 32Z" fill="#443934"/></g>
  <g class="wing-right"><path d="M50 24C66 8 82 8 99 14C82 17 71 26 54 32Z" fill="#443934"/></g>
  <path d="M43 22Q50 15 57 22L57 33L51 44L47 44L43 32Z" fill="#3b302d"/><path d="M50 40L43 50L50 46L57 50Z" fill="#42312c"/>
 </svg>`;
 // Identical V15 bird configuration — no edits outside the river.
 const birds=[
  [28,17,22,-1,14,-8,46,.70],[31,22,20,-2.5,15,-12,47,.62],
  [35,19,24,-4,14,-10,44,.68],[38,24,18,-6,16,-16,43,.60],
  [41,18,29,-8,15,-12,40,.78],[44,23,21,-10,17,-17,39,.64],
  [47,20,18,-12,16,-9,36,.66],[50,24,23,-14,15,-15,34,.73],
  [53,18,20,-7,18,-11,30,.62],[56,22,17,-11,17,-14,28,.58]
 ];
 sky.innerHTML=birds.map(([x,y,size,delay,duration,rise,distance,flap])=>
  `<span class="flying-bird" style="--bird-left:${x}%;--bird-top:${y}%;--bird-size:${size}px;--flight-delay:${delay}s;--flight-time:${duration}s;--bird-rise:${rise}px;--bird-distance:${distance}vw;--flap-time:${flap}s"><span class="bird-model">${birdSvg}</span></span>`
 ).join('');

 hero.dataset.birdCount=String(sky.querySelectorAll('.flying-bird').length);
})();
