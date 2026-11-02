/* V24 single India heritage image — static, no interactive maps or animation. */
(()=>{'use strict';if(document.body.dataset.page!=='story')return;
const main=document.querySelector('main#main');if(!main)return;
const section=document.createElement('section');section.className='sm-section sm-india-only';section.id='india-map';
section.setAttribute('aria-label','India and our agricultural inspiration');
section.innerHTML=`<div class="wrap sm-wrap">
 <div class="sm-copy"><p class="eyebrow">SOURCED WITH PURPOSE</p>
 <h2>From the Heart of India to Homes Around the World</h2>
 <p>Our approach celebrates the land, craftsmanship, and culinary traditions behind India's aromatic spices—from sun-dried chillies and turmeric to curry leaves and traditional lentil powders.</p>
 <div class="sm-values"><div><strong>Indian farming heritage</strong><span>Ingredients and recipes rooted in regional food traditions</span></div><div><strong>Thoughtful preparation</strong><span>Respect for aroma, flavour and freshness</span></div><div><strong>Rooted in quality</strong><span>Careful handling and transparent product information</span></div></div>
 <p class="sm-attribution">A visual tribute to India’s agriculture, food traditions and the people behind every harvest.</p>
 </div>
 <div class="sm-map sm-india-art"><div class="sm-map-glow" aria-hidden="true"></div><div class="sm-arthead"><span>THE LAND BEHIND THE FLAVOUR</span><strong>INDIA</strong></div>
 <img src="assets/india-sourcing-heritage-v24.webp" alt="India-inspired heritage artwork filled with chilli farms, a sunrise over mountains, coconut palms and a traditional temple" decoding="async" loading="eager">
 <div class="sm-artfooter"><span>Rich land</span><span class="sm-artdot"></span><span>Rooted traditions</span><span class="sm-artdot"></span><span>Enduring flavour</span></div>
 </div></div>`;main.append(section);})();
