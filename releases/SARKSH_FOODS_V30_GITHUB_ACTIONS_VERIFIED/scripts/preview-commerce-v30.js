/** V30 GitHub Pages DESIGN PREVIEW ONLY. Production cart/accounts are on the live app. */
(()=>{'use strict';
 const page=document.body.dataset.page;
 if(page==='account'){location.replace('/account/');return;}
 if(page==='cart'){location.replace('/products/');return;}
 const action=document.querySelector('.site-header .header-actions');
 if(action&&!action.querySelector('.cc-header-links')){
  const el=document.createElement('div');el.className='cc-header-links';
  el.innerHTML=`<a class="cc-header-link cc-cart-link" href="/products/" aria-label="Shop on the live SARKSH FOODS store" title="Shop on the live store"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2 12h12l2-9H6m3 13h.01M18 20h.01"/></svg><span class="cc-cart-count" aria-hidden="true">0</span><span class="cc-header-label">Shop</span></a><a class="cc-header-link cc-account-link" href="/account/" aria-label="Visit live customer account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/></svg><span class="cc-header-label">Account</span></a>`;
  action.insertBefore(el,action.firstChild);
 }
 const mobile=document.querySelector('#mobile-nav');
 if(mobile&&!mobile.querySelector('.cc-mobile-link'))mobile.insertAdjacentHTML('beforeend','<a class="cc-mobile-link" href="/products/">Shop live &nbsp;→</a><a class="cc-mobile-link" href="/account/">Customer portal &nbsp;→</a>');
 const footer=document.querySelector('.footer-links');
 if(footer&&!footer.querySelector('a[href="/account/"]'))footer.insertAdjacentHTML('beforeend','<a href="/products/">Live store</a><a href="/account/">Customer Account</a>');
 const liveButton=card=>{
  if(card.querySelector('.cc-add'))return;
  const label=card.querySelector('h3')?.textContent?.trim()||'product';
  const b=document.createElement('button');b.className='cc-add';b.type='button';b.textContent='+ Add to cart';
  b.setAttribute('aria-label',`Shop ${label} on the live store`);b.title='The live store handles customer orders';
  b.addEventListener('click',()=>{location.assign('/products/');});card.append(b);
 };
 document.querySelectorAll('.product-name-card').forEach(liveButton);
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a)return;
  const href=a.getAttribute('href')||'';
  if(/^account\.html(?:[?#]|$)/.test(href)){e.preventDefault();location.assign('/account/');}
  if(/^cart\.html(?:[?#]|$)/.test(href)){e.preventDefault();location.assign('/products/');}
 },true);
 document.addEventListener('submit',e=>{
  if(!e.target.matches('#contact-form'))return;
  e.preventDefault();e.stopImmediatePropagation();
  const out=document.querySelector('#contact-feedback');
  if(out){out.innerHTML='This is the design preview. Please send enquiries through the <a href="/contact/">live contact page</a>.';out.className='contact-feedback';}
 },true);
})();
