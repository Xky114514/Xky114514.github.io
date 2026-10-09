(function(){
  'use strict';let active=null,bubble=null,serial=0;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function button(text,label='查看说明'){return `<button type="button" class="help-tip" aria-label="${esc(label)}" data-help="${esc(text)}">?</button>`;}
  const priceMeanings={
    '报价单标准价':'这张报价单的默认售价，也是浮动协议的计算参考。例如白菜标准价5元/斤；修改它可能影响多个关联客户，已有固定协议价或阶梯价的客户不一定变价。',
    '客户协议价':'为指定客户设置的价格规则，可以是固定价、在标准价上加减金额或乘倍数，并有有效日期和每日时段。例如给晨禾设为4.80元/斤；它不会修改报价单标准价，也不等于客户最终一定使用这个价。',
    '客户当前价':'只读结果：按当前时点、该客户的规则和数量得到的价格。取价顺序为阶梯价→客户协议价→时价→报价单标准价。例如标准价5元、有效固定协议4.80元且未命中阶梯价时，客户当前价为4.80元。它不是未来结算价。'
  };
  function priceTip(name){return priceMeanings[name]?button(priceMeanings[name],name+'说明'):'';}
  function hide(){if(active)active.removeAttribute('aria-describedby');bubble?.remove();bubble=null;active=null;}
  function show(el){
    if(active===el&&bubble)return;hide();active=el;bubble=document.createElement('div');bubble.id='gm-tip-'+(++serial);bubble.className='tooltip-bubble';bubble.role='tooltip';bubble.textContent=el.dataset.help;
    (el.closest('dialog')||document.body).appendChild(bubble);el.setAttribute('aria-describedby',bubble.id);
    const r=el.getBoundingClientRect(),b=bubble.getBoundingClientRect();bubble.style.left=Math.max(10,Math.min(r.left,innerWidth-b.width-10))+'px';bubble.style.top=(r.bottom+b.height+12<innerHeight?r.bottom+8:Math.max(8,r.top-b.height-8))+'px';
  }
  function upgrade(root=document){
    root.querySelectorAll('input[type=search]').forEach(el=>el.maxLength=100);
    const selectors='p.notice,p.section-note,p.composer-foot,.welcome>p,.gm-blank>p,.sidebar-foot>small,#scope-note,#calculation-help,.plan footer span.small';
    root.querySelectorAll(selectors).forEach(el=>{if(el.querySelector('.help-tip')||el.closest('#about-content'))return;const text=el.textContent.trim();if(!text)return;el.dataset.explanation='true';el.innerHTML=button(text);el.classList.add('help-holder');if(el.classList.contains('section-note')&&el.previousElementSibling?.matches('.toolbar'))el.previousElementSibling.appendChild(el);});
    root.querySelectorAll('input[title]').forEach(el=>{const title=el.title;if(!title)return;el.removeAttribute('title');el.insertAdjacentHTML('afterend',button(title));});
  }
  document.addEventListener('pointerover',e=>{const el=e.target.closest('.help-tip');if(el)show(el);});
  document.addEventListener('pointerout',e=>{if(e.target.closest('.help-tip')&&!bubble?.contains(e.relatedTarget)&&document.activeElement!==active)hide();});
  document.addEventListener('focusin',e=>{const el=e.target.closest('.help-tip');if(el)show(el);else hide();});
  document.addEventListener('click',e=>{const el=e.target.closest('.help-tip');if(el){e.preventDefault();show(el);}else if(!bubble?.contains(e.target))hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bubble){e.preventDefault();e.stopImmediatePropagation();hide();}},true);
  window.addEventListener('resize',hide);document.addEventListener('scroll',hide,true);
  window.GMHelp={button,upgrade,hide,priceTip};
})();
