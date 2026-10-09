(function () {
  'use strict';
  const KEY = 'guanmai-pricing-prototype-v2';
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = v => JSON.parse(JSON.stringify(v));
  let db = GMD.seed(), ctx = {customerId:'A1', quoteId:'', scope:'customer', generation:1};
  let savedError = '', histories = {}, revision = '', writeCount = 0, externalChange = false;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved?.version === 2 && saved.db?.schema === db.schema && Array.isArray(saved.db.skus)) {
      revision=saved.revision||''; db = saved.db; ctx = {...ctx, ...saved.context, generation:(saved.context.generation || 0) + 1}; histories = saved.histories || {};
    }
  } catch (_) { savedError = '浏览器存储不可用，当前操作仅在本次页面中保留。'; }
  // Add only the new local collection; never infer historical tasks from rules.
  if(!Array.isArray(db.customerTasks))db.customerTasks=[];
  if (!db.customers.some(c => c.address_id === ctx.customerId)) ctx.customerId = db.customers[0].address_id;
  if (!GME.linkedQuotes(db, ctx.customerId).some(q => q.id === ctx.quoteId)) ctx.quoteId = '';
  const state = {page:'chat', evidence:{tab:'cost',query:'',category:'all',page:1,size:25,from:'2026-09-24',to:db.fixtureDate,ruleTab:'protocol',ruleFilter:'all'}, pick:{query:'',category:'all',page:1,size:25}, selected:new Set(), quantities:{}, dialog:'', planPage:{}, planQuery:{}};
  let plans = {}, nextPlan = 1, toastTimer;
  const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  const now = () => db.fixtureDate + 'T10:00';
  const customer = id => db.customers.find(c => c.address_id === (id || ctx.customerId));
  const quote = id => db.salemenus.find(q => q.id === (id || ctx.quoteId));
  const sku = id => db.skus.find(s => s.sku_id === id);
  const products = () => GME.quoteSkus(db, ctx.quoteId);
  const scopeName = () => ctx.scope === 'customer' ? '客户协议价' : '报价单标准价';
  const currency = s => s?.fee_type || quote(s?.salemenu_id)?.fee_type || 'CNY';
  const amount = (v,s) => v == null || currency(s) !== 'CNY' ? '—' : `${(v/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:4})} 元/${esc(s?.sale_unit_name || '—')}`;
  const baseAmount = s => s.is_price_timing && s.sale_price === 0 ? '待定价（时价）' : amount(s.sale_price,s);
  const strategy = {normal:'报价单标准价',rule:'客户协议价',step:'阶梯价',timing:'时价待定',unsupported:'需原系统确认',missing:'资料缺失'};
  function ruleCalcText(row,s) { const r=db.rules.find(r=>r.id===row.update_rule_id), basic=r?.locking_price_unit===1, unit=basic?s.std_unit_name_forsale:s.sale_unit_name, basis=basic?'基本单价':'报价单标准价';const value=(v)=>(v/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:4})+' 元/'+unit;return row.rule_type===0?'固定 '+value(row.yx_price):row.rule_type===1?basis+' '+(row.yx_price>=0?'+ ':'− ')+value(Math.abs(row.yx_price)):basis+' × '+row.yx_price/100; }
  function resolved(r,s) { return r.requires_quantity ? '填写数量后查看阶梯价' : r.strategy === 'timing' ? '待定价' : r.strategy === 'unsupported' ? '需原系统确认' : amount(r.settle_price,s); }
  const findPrice = s => GME.resolve(db,ctx.customerId,s.sku_id,state.quantities[s.sku_id] ?? null,{now:now()});
  const historyKey = () => [ctx.customerId,ctx.quoteId,ctx.scope].join('|');
  const messages = () => histories[historyKey()] ||= [];
  function guard() {
    try {
      const saved=JSON.parse(localStorage.getItem(KEY)||'null');
      if(saved?.version===2 && saved.db?.schema===db.schema && saved.revision && saved.revision!==revision){
        db=saved.db; if(!Array.isArray(db.customerTasks))db.customerTasks=[]; revision=saved.revision; histories=saved.histories||{}; externalChange=false;
        ctx.generation++;state.selected.clear();state.quantities={};
        render();toast('数据已由其他页面更新，请重新预览后再提交。未保存表单仍保留。');return false;
      }
    }catch(_){savedError='浏览器存储不可用，操作仅在本页面保留。';}
    return true;
  }
  function save() {
    if(!guard())return false;
    try{revision=sessionId+'-'+(++writeCount);localStorage.setItem(KEY,JSON.stringify({version:2,revision,db,context:ctx,histories}));savedError='';}
    catch(_){savedError='浏览器存储空间不足，本次修改尚未持久保存。请保持页面打开。';}
    $('#storage-note').textContent=savedError;return true;
  }
  function toast(text) { $('#toast').textContent = text; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').textContent = '',6000); }
  function message(role,text,planId) { messages().push({role,text,planId}); save(); }
  function close(force=false) {
    if(!force&&window.GCT?.canClose&&!GCT.canClose())return false;
    if(!force&&window.GMM?.canClose&&!GMM.canClose())return false;
    if(!force&&state.dialog==='rule'&&$('#rule-form')&&state.formInitial!==JSON.stringify(formSpec())&&!confirm('放弃尚未生成预览的调整内容？'))return false;
    GMHelp.hide();$('#gm-dialog').close();state.dialog='';return true;
  }
  function dialog(title,body,footer='',narrow=false) {
    $('#dialog-title').textContent = title; $('#dialog-body').innerHTML = body;
    $('#dialog-footer').innerHTML = footer || '<button class="button" data-action="close-dialog">关闭</button>';
    $('#gm-dialog').classList.toggle('narrow',narrow);
    if (!$('#gm-dialog').open) $('#gm-dialog').showModal();
    document.querySelectorAll('input[type=search]').forEach(el=>el.maxLength=100);
    GMHelp.upgrade($('#gm-dialog'));
  }
  function switchContext(change) {
    if(!guard())return; if($('#gm-dialog').open&&!close())return;
    const old = JSON.stringify(ctx); Object.assign(ctx,change);
    if ('customerId' in change) { const links = GME.linkedQuotes(db,ctx.customerId); ctx.quoteId = links.length === 1 ? links[0].id : ''; }
    if (JSON.stringify(ctx) === old) return;
    ctx.generation++; state.selected.clear(); state.quantities = {}; state.pick = {query:'',category:'all',page:1,size:25}; state.evidence.query = ''; state.evidence.category = 'all'; state.evidence.page = 1;
    close(); save(); render(); toast('已切换范围，商品选择已清空；旧预览不可应用。');
  }
  function renderQuotes() {
    const query = $('#quote-search').value.trim().toLowerCase();
    $('#quote-list').innerHTML = GME.linkedQuotes(db,ctx.customerId).filter(q => (q.name+q.id).toLowerCase().includes(query)).map(q => `<button class="quote-row ${ctx.quoteId===q.id?'active':''}" data-quote="${esc(q.id)}"><strong>${esc(q.name)}</strong><small>${productsFor(q.id).length} 个商品 · ${GME.linkedCustomers(db,q.id).length} 个关联客户</small></button>`).join('') || '<p class="muted small">没有匹配的报价单</p>';
  }
  const productsFor = id => GME.quoteSkus(db,id);
  function blank() { return `<div class="gm-blank"><span class="eyebrow">${esc(customer().name)}</span><h2>先选择一张报价单</h2><p>该客户关联多张报价单，请明确本次调整对象。</p><div class="inline-quote-picker">${GME.linkedQuotes(db,ctx.customerId).map(q => `<button data-quote="${esc(q.id)}">${esc(q.name)}<small>${productsFor(q.id).length} 个商品 · ${GME.linkedCustomers(db,q.id).length} 个关联客户</small></button>`).join('')}</div></div>`; }
  function render() {
    $('#gm-customer').innerHTML = db.customers.map(c => `<option value="${esc(c.address_id)}" ${ctx.customerId===c.address_id?'selected':''}>${esc(c.name)} · ${GME.linkedQuotes(db,c.address_id).length} 张报价单</option>`).join('');
    $('#gm-scope').value = ctx.scope;
    $('#context-label').innerHTML = `<strong>${esc(quote()?.name || '尚未选择报价单')}</strong><small>${esc(db.meta?.station_name||db.station_id)} · ${esc(quote()?.time_config?.name||'请选择运营报价单')} · ${esc(scopeName())}</small>`;
    const accessError=ctx.quoteId?GMP.error(db,ctx.scope,ctx.quoteId,[ctx.customerId]):'';$('#access-tag').textContent=GMP.role(db).name;$('#access-tag').className='tag '+(GMP.role(db).id==='manager'?'green':'');
    $('#scope-note').dataset.accessError=accessError;
    $('#scope-note').innerHTML=(accessError?`<span class="tag amber">${esc(accessError)}</span> `:'')+GMHelp.button('这里选择要修改的对象：报价单标准价是默认售价，客户协议价是针对客户的价格规则；客户当前价是按现有规则算出的只读结果。例如标准价5元、固定协议4.80元，未命中阶梯价时客户当前价为4.80元。标准价修改可能影响多个客户，客户协议只作用于规则包含的客户；均不重算已创建订单。','三种价格的区别');
    document.querySelectorAll('[data-page]').forEach(b => b.classList.toggle('active',b.dataset.page === state.page));
    renderQuotes(); renderMain(); $('#storage-note').textContent = savedError; document.querySelectorAll('input[type=search]').forEach(el=>el.maxLength=100); GMHelp.upgrade();
  }
  function renderMain() {
    const target = $('#main-content'); target.classList.toggle('is-chat',state.page === 'chat');
    if (!ctx.quoteId && state.page === 'chat') { target.innerHTML = blank(); return; }
    if (state.page === 'chat') target.innerHTML = chatHTML();
    else if (state.page === 'evidence') target.innerHTML = '<div class="page">'+GMV.evidence(db,ctx,state.evidence)+'</div>';
    else target.innerHTML = '<div class="page">'+GMV.rules(db,ctx,state.evidence)+'</div>';
    GMHelp.upgrade(target);
  }
  function chatHTML() {
    const ms = messages();
    const first=products()[0], example=`${first?.outer_id||'商品编码'}按${ctx.scope==='quote'?'报价单标准价':'客户当前价'}上调5%`;
    return `<div class="chat-wrap"><div class="conversation">${ms.length ? ms.map(m => `<div class="msg ${m.role}">${m.role==='assistant'?'<div class="assistant-mark">✳</div>':''}<div class="${m.role==='user'?'user-bubble':''}">${esc(m.text)}${m.planId ? plans[m.planId] ? planHTML(m.planId) : '<p class="muted small">此为历史预览，重新打开页面后请重新生成。</p>' : ''}</div></div>`).join('') : `<div class="welcome"><span class="eyebrow">${esc(quote().name)} · ${products().length} 个商品</span><h1>这次，想怎么调整报价？</h1><p>说出商品和调价方式，再核对范围与预览。</p><div class="quick-actions"><button class="suggestion" data-suggest="${esc((first?.outer_id||'')+'按报价单标准价上调3%')}">${esc(first?.sku_name||'商品')}按标准价上调 3%</button><button class="suggestion" data-action="rule">按条件选商品</button></div></div>`}</div><div class="composer-area"><form id="chat-form"><div class="composer"><textarea id="chat-input" aria-label="报价调整需求" maxlength="2000" placeholder="例如：${esc(example)}" rows="2"></textarea><div class="composer-tools"><button type="button" data-action="rule">☷ 按条件调整</button><button type="button" data-page="evidence">▤ 查看依据</button><button class="send" aria-label="发送需求" type="submit">↑</button></div></div></form><p class="composer-foot">本地规则解析演示 · 未接入 AI 或业务系统 · 应用前需要核对预览</p></div></div>`;
  }
  function planHTML(id) {
    const p = plans[id], query = state.planQuery[id] || '', rows = p.rows.filter(r => matches(sku(r.sku_id),query));
    const page = Math.min(state.planPage[id] || 1,Math.max(1,Math.ceil(rows.length/25))); state.planPage[id] = page;
    const stale = p.context.generation !== ctx.generation || p.context.customerId !== ctx.customerId || p.context.quoteId !== ctx.quoteId || p.context.scope !== ctx.scope || externalChange;
    return `<article class="plan" data-plan="${id}"><div class="plan-head"><strong>${p.context.scope==='customer'?'客户协议价':'报价单标准价'}调整预览</strong><span class="tag ${p.ok?'green':'amber'}">${p.applied?'已应用演示':stale?'预览已失效':p.ok?'待核对':'需处理'}</span></div><p class="plan-meta">${esc(customer(p.context.customerId)?.name)} · ${esc(quote(p.context.quoteId)?.name)}${p.context.scope==='customer'?`<br>${esc(p.spec.begin||'未填写日期')} 至 ${esc(p.spec.end||'未填写日期')} · ${esc(p.spec.begin_time)}–${esc(p.spec.end_time)}${p.spec.time_limit===1?'（跨午夜）':''}`:''}</p><p class="plan-summary">${p.rows.length} 个商品 · 可调整 ${p.eligible_count} · 跳过 ${p.skipped_count}${p.errors.length?`<br><span class="error">${p.errors.map(esc).join('；')}</span>`:''}</p><div class="plan-tools"><input type="search" data-plan-query="${id}" aria-label="搜索预览商品" placeholder="搜索预览中的商品" value="${esc(query)}"><button class="text-button" data-impact="${id}">查看影响范围（${p.affectedCustomers.length} 个客户）</button></div><div class="table-scroll"><table class="data-table plan-table"><thead><tr><th>商品 / 单位</th><th>报价单标准价 ${GMHelp.priceTip('报价单标准价')}</th><th>客户当前价 ${GMHelp.priceTip('客户当前价')}</th><th>${p.context.scope==='customer'?'本次协议设置':'调整后标准价'}</th><th>处理说明</th></tr></thead><tbody>${rows.slice((page-1)*25,page*25).map(r => { const s=sku(r.sku_id);return `<tr><td>${esc(s.sku_name)}<div class="muted small">${esc(s.outer_id)} · ${esc(s.sale_unit_name)} / 基本${esc(s.std_unit_name_forsale)}</div></td><td>${s.is_price_timing&&r.base_price===0?'待定价（时价）':amount(r.base_price,s)}</td><td>${resolved(r.current,s)}<div class="muted small">${strategy[r.current.strategy]}</div></td><td>${r.skip||r.error?'—':p.context.scope==='customer'?esc(ruleCalcText(r,s)):amount(r.proposed_price,s)}${p.context.scope==='customer'&&!r.skip&&!r.error&&r.rule_type!==0?`<div class="muted small">当前计算：${amount(r.proposed_price,s)} ${GMHelp.button('仅供本次核对。保存的是浮动规则，之后标准价变化时会重新计算。','浮动规则计算值说明')}</div>`:''}</td><td>${esc(r.error||r.warning||(r.update_rule_id?'修改已有单客户规则':'可调整'))}${r.rule_ids?.length? r.rule_ids.map(rid=>`<br><button class="text-button" data-gm-rule-detail="${esc(rid)}">查看冲突规则</button>`).join(''):''}</td></tr>`;}).join('') || '<tr><td colspan="5">没有匹配商品</td></tr>'}</tbody></table></div><div class="pager"><span>第 ${page} / ${Math.max(1,Math.ceil(rows.length/25))} 页 · 共 ${rows.length} 条</span><button class="button" data-plan-page="${id}" data-number="${page-1}" ${page===1?'disabled':''}>上一页</button><button class="button" data-plan-page="${id}" data-number="${page+1}" ${page*25>=rows.length?'disabled':''}>下一页</button></div><footer><span class="small muted">${p.context.scope==='customer'?'显示规则设置值，未来实际结算价以届时系统取价为准。':'关联客户不一定变价，阶梯、协议及时价仍优先。'}</span>${p.task_id?`<button class="button" data-ct-view="${esc(p.task_id)}">查看调价任务</button>`:''}<button class="button" data-revise="${id}">${p.applied?'再次调整':'调整预览'}</button>${((p.context.scope==='quote'&&p.affectedCustomers.length>1)||p.skipped_count>0)?`<label class="plan-confirm"><input type="checkbox" data-plan-confirm="${id}" ${p.confirmed?'checked':''} ${stale||p.applied?'disabled':''}>已核对关联客户及跳过商品</label>`:''}<button class="button primary" data-apply="${id}" ${!p.ok||stale||p.applied?'disabled':''}>应用演示（${p.eligible_count}）</button></footer></article>`;
  }
  function matches(s,q) { return !q || [s.sku_name,s.sku_id,s.outer_id,s.specification_desc].some(v => String(v||'').toLowerCase().includes(q.trim().toLowerCase())); }
  function filtered() { return products().filter(s => matches(s,state.pick.query) && (state.pick.category==='all'||s.category_name_1===state.pick.category||s.category_name_2===state.pick.category)); }
  function selectionHTML() {
    const list=filtered(), pages=Math.max(1,Math.ceil(list.length/state.pick.size)); state.pick.page=Math.min(state.pick.page,pages);
    const categories=[...new Set(products().map(s=>s.category_name_1))];
    return `<div class="toolbar"><input id="pick-query" type="search" aria-label="搜索报价单商品" placeholder="搜索名称、编码或规格" value="${esc(state.pick.query)}"><select id="pick-category" aria-label="商品分类"><option value="all">全部分类</option>${categories.map(c=>`<option ${state.pick.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="pick-size" aria-label="每页商品数">${[25,50,100].map(n=>`<option value="${n}" ${state.pick.size===n?'selected':''}>${n} 条/页</option>`).join('')}</select></div><div class="selection-summary"><span>匹配 ${list.length} 个 · 已选 <strong>${state.selected.size}</strong> 个（跨页保留）</span><div class="flex wrap"><button type="button" data-action="pick-page">选择本页</button><button type="button" data-action="pick-all">选择全部匹配</button><button type="button" data-action="pick-clear">清空选择</button></div></div><div class="table-scroll pick-scroll"><table class="data-table pick-table"><thead><tr><th>选择</th><th>商品 / 规格</th><th>销售 / 基本单位</th><th>报价单标准价 ${GMHelp.priceTip('报价单标准价')}</th><th>客户当前价 ${GMHelp.priceTip('客户当前价')}</th><th>数量 / 数量档</th><th>操作</th></tr></thead><tbody>${list.slice((state.pick.page-1)*state.pick.size,state.pick.page*state.pick.size).map(s=>{const r=findPrice(s);return `<tr><td><input type="checkbox" data-select="${esc(s.sku_id)}" aria-label="选择 ${esc(s.sku_name)} ${esc(s.outer_id)}" ${state.selected.has(s.sku_id)?'checked':''}></td><td>${esc(s.sku_name)}<div class="muted small">${esc(s.outer_id)} · ${esc(s.specification_desc)}</div></td><td>${esc(s.sale_unit_name)} / ${esc(s.std_unit_name_forsale)}</td><td>${baseAmount(s)}</td><td>${resolved(r,s)}<div class="muted small">${strategy[r.strategy]}</div></td><td>${s.is_step_price?`<input class="quantity" type="number" min="0.001" step="any" data-quantity="${esc(s.sku_id)}" aria-label="${esc(s.sku_name)} 取价数量" value="${esc(state.quantities[s.sku_id]??'')}" placeholder="${esc(s.sale_unit_name)}"><div class="muted small">${r.step_tier?esc(r.step_tier.min+' ≤ 数量'+(r.step_tier.max?' < '+r.step_tier.max:'')+' '+s.sale_unit_name):'按销售单位输入'}</div>`:'—'}</td><td><button type="button" class="text-button" data-gm-sku-detail="${esc(s.sku_id)}">详情</button></td></tr>`;}).join('')||'<tr><td colspan="7">没有匹配商品</td></tr>'}</tbody></table></div><div class="pager"><span>第 ${state.pick.page} / ${pages} 页</span><button type="button" class="button" data-pick-page="${state.pick.page-1}" ${state.pick.page===1?'disabled':''}>上一页</button><button type="button" class="button" data-pick-page="${state.pick.page+1}" ${state.pick.page===pages?'disabled':''}>下一页</button></div>`;
  }
  const opt = (v,label,current) => `<option value="${esc(v)}" ${v===current?'selected':''}>${esc(label)}</option>`;
  const field = (name,label,html) => `<label class="field ${name}"><span>${label}</span>${html}</label>`;
  function openSheet() {
    if (!ctx.quoteId) { toast('请先选择报价单。'); return; } state.dialog='sheet';
    dialog(`${quote().name} · ${products().length} 个商品`,`<p class="management-context">${esc(customer().name)} ${GMHelp.button('支持搜索、分类与跨页批选。阶梯价需要填写数量。','商品选择说明')}</p><div id="selection-region">${selectionHTML()}</div>`,`<button class="button" data-action="close-dialog">关闭</button><button class="button primary" data-action="rule">调整所选商品</button>`);
  }
  function ruleIntent(spec) { return !spec.operation || spec.operation==='set'?'fixed':ctx.scope==='quote'?'quoteOnce':spec.base==='customer'?'current':'follow'; }
  function openRule(spec={}) {
    if (!ctx.quoteId) { toast('请先选择报价单。'); return; }
    const denied=GMP.error(db,ctx.scope,ctx.quoteId,[ctx.customerId]);if(denied){toast(denied);return;}
    if (spec.ids) state.selected = new Set(spec.ids);
    if (spec.quantities) state.quantities = {...spec.quantities};
    state.dialog='rule';const intent=ruleIntent(spec),isQuote=ctx.scope==='quote';
    const intents=opt('fixed',isQuote?'直接指定报价单标准价':'直接指定客户价格',intent)+(isQuote?opt('quoteOnce','按现标准价调整一次',intent):opt('follow','随报价单标准价浮动',intent)+opt('current','按客户当前价调整一次',intent));
    dialog(`按条件调整 · ${scopeName()}`,`<p class="management-context">${esc(customer().name)} / ${esc(quote().name)}${isQuote?` · 共 ${GME.linkedCustomers(db,ctx.quoteId).length} 个关联客户`:''}</p><div id="selection-region">${selectionHTML()}</div><form id="rule-form" class="rule-form">${field('intent-field','定价方式',`<select name="pricingIntent" aria-label="定价方式">${intents}</select>`)}${field('pricing-operation','怎样调整',`<select name="operation" aria-label="怎样调整">${opt('set','设为固定价',spec.operation||'set')}${opt('percent','按百分比调整',spec.operation)}${opt('delta','加减金额',spec.operation)}${opt('multiple','乘以倍数',spec.operation)}</select>`)}${field('','<span id="rule-value-label">新价格（元/销售单位）</span>',`<input name="value" aria-label="调整数值" type="number" step="any" required value="${esc(spec.value??'')}" placeholder="请输入数值">`)}<input name="base" type="hidden" value="${intent==='current'?'customer':'quote'}"><div id="pricing-behavior" class="pricing-behavior"></div><p class="notice" id="calculation-help"></p>${!isQuote?`${field('','调价名称',`<input name="ruleName" maxlength="80" value="${esc(spec.ruleName||'')}" placeholder="可选，留空自动生成名称">`)}<div></div>${field('','有效开始日期',`<input name="begin" type="date" required value="${esc(spec.begin||'')}" aria-label="有效开始日期">`)}${field('','有效结束日期',`<input name="end" type="date" required value="${esc(spec.end||'')}" aria-label="有效结束日期">`)}<div class="full time-fields">${field('','每日开始时间',`<input name="begin_time" type="time" required value="${esc(spec.begin_time||'00:00')}" aria-label="每日开始时间">`)}${field('','每日结束时间',`<input name="end_time" type="time" required value="${esc(spec.end_time||'23:59')}" aria-label="每日结束时间">`)}${field('','时段方式',`<select name="time_limit" aria-label="时段方式">${opt('2','当日时段',String(spec.time_limit||2))}${opt('1','跨午夜',String(spec.time_limit))}</select>`)}</div>`:'<p class="notice full">确认后修改当前报价单标准价。需要未来执行时，使用“报价单定时调价”；同一份报价单的客户仍按各自规则取价。</p>'}<p id="form-error" class="error full" role="alert"></p></form>`,`<button class="button" data-action="close-dialog">取消</button>${!isQuote?'<button class="button" type="button" data-action="customer-row-editor">逐商品设置</button>':''}<button class="button primary" type="submit" form="rule-form">生成预览</button>`);
    calculationHelp();
    state.editRuleId=spec.editRuleId||'';state.formSource=spec.source||'按条件调整';state.formInitial=JSON.stringify(formSpec());
  }
  function calculationHelp(reset=false) {
    const f=$('#rule-form');if(!f)return;const intent=f.elements.pricingIntent.value, fixed=intent==='fixed';
    if(reset){f.elements.operation.value=fixed?'set':'percent';f.elements.value.value='';}
    if(fixed)f.elements.operation.value='set';else if(f.elements.operation.value==='set')f.elements.operation.value='percent';
    for(const option of f.elements.operation.options)option.hidden=fixed?option.value!=='set':option.value==='set';
    f.elements.operation.closest('.pricing-operation').hidden=fixed;f.elements.base.value=intent==='current'?'customer':'quote';
    const op=f.elements.operation.value;
    $('#rule-value-label').textContent=op==='set'?'新价格（元/销售单位）':op==='delta'?'增减金额（元/销售单位）':op==='percent'?'涨跌幅（%）':'倍数';
    const result=ctx.scope==='quote'?'将修改：报价单标准价':intent==='follow'?'将保存：随标准价浮动的客户协议':'将保存：固定客户协议价';
    const info=ctx.scope==='quote'?'按本次填写或当前标准价计算目标价，确认后修改标准价；不是让标准价持续按自身涨幅变化。':intent==='fixed'?'直接填写客户协议价，无需选择参考价；按客户、有效期和原生优先级参与取价。':intent==='follow'?'例如标准价5元上浮3%，当前计算为5.15元；标准价以后变6元时，协议计算为6.18元。':'例如客户当前价4.80元上调3%，只计算一次并保存固定4.94元；以后标准价变化时不跟随变化。';
    $('#pricing-behavior').innerHTML=`<strong>${result}</strong>${GMHelp.button(info,'定价方式说明')}`;
    $('#calculation-help').textContent=op==='percent'?'填3表示上调3%，填-3表示下调3%。':op==='multiple'?'填1.03表示原价的1.03倍，填0.95表示原价的95%。':'按各商品销售单位填写金额，最多两位小数；固定价或加减金额跨单位时请分批调整。';
    GMHelp.upgrade($('#gm-dialog'));
  }

  function formSpec() { const f=$('#rule-form'), v=Object.fromEntries(new FormData(f));return {...v,source:state.formSource||'按条件调整',editRuleId:state.editRuleId,operation:f.elements.operation.value,base:ctx.scope==='quote'?'quote':f.elements.base.value,value:Number(v.value),time_limit:Number(v.time_limit||2),ids:[...state.selected],quantities:{...state.quantities}}; }
  function preview(spec) {
    if(!guard())return;
    const plan=GME.makePlan(db,{...ctx},spec,now()), id='P'+sessionId+'-'+nextPlan++; plans[id]=plan;
    close(true); state.page='chat'; message('assistant',plan.ok?'已生成预览，请核对商品、计算方式和影响范围。':'已生成检查结果，请处理下方阻止项后重新预览。',id); render(); $('.conversation')?.scrollTo(0,$('.conversation').scrollHeight);
  }
  function openCustomerEditor(){
    if(ctx.scope!=='customer'||!$('#rule-form'))return;
    const spec=formSpec(),raw=$('#rule-form').elements.value.value;
    const draft={name:spec.ruleName||'',customer_id:ctx.customerId,salemenu_id:ctx.quoteId,begin:spec.begin,end:spec.end,begin_time:spec.begin_time,end_time:spec.end_time,time_limit:spec.time_limit,source:state.formSource||'按条件调整',items:spec.ids.map(sku_id=>({sku_id,operation:spec.operation,value:raw===''?null:spec.value,base:spec.base,quantity:spec.quantities[sku_id]}))};
    close(true);GCT.openNew(draft);
  }
  function parseChat(text) {
    if (/报价单(?:基础|标准)?价|基础价|标准价/.test(text) && /客户(?:当前|适用|当前适用)价/.test(text)) return {error:'同时提到了报价单标准价和客户当前价，请明确本次计算基准，复杂筛选可使用“按条件调整”。'};
    const filterMatch=text.match(/(报价单(?:基础|标准)?价|基础价|标准价|客户(?:当前|适用|当前适用)价|当前(?:执行)?(?:价|价格|单价))\s*(高于|低于|大于|小于|超过|不足)/);
    if(filterMatch && /^当前/.test(filterMatch[1])) return {error:'筛选价格也需要明确口径，请指定“报价单标准价”或“客户当前价”。'};
    const filterQuote=filterMatch&&/基础|标准|报价单/.test(filterMatch[1]);
    const base=/报价单(?:基础|标准)?价|基础价|标准价/.test(text)?'quote':/客户(?:当前|适用|当前适用)价/.test(text)?'customer':null;
    const normalized=text.replace(/报价单(?:基础|标准)?价|基础价|标准价|客户(?:当前|适用|当前适用)价/g,'当前执行价');
    const dates=[...text.matchAll(/\d{4}-\d{2}-\d{2}/g)].map(m=>m[0]);
    const cleaned=normalized.replace(/(?:有效期|有效日期|从)?\s*\d{4}-\d{2}-\d{2}\s*(?:至|到|~|～)\s*\d{4}-\d{2}-\d{2}/g,'');
    const result=PricingIntent.parse(cleaned,{items:products().map(s=>{const r=findPrice(s);return {id:s.sku_id,name:s.sku_name,code:s.outer_id,spec:s.specification_desc,unit:s.sale_unit_name,category:[s.category_name_1,s.category_name_2],current:filterQuote?(s.sale_price==null||(s.is_price_timing&&s.sale_price===0)?NaN:s.sale_price/100):r.settle_price==null||r.requires_quantity?NaN:r.settle_price/100};}),activeCustomer:customer(),customerNames:db.customers});
    if (result.kind!=='adjust') {let reason=result.reason.replace(/“当前执行价”还是“草稿价”/g,'“报价单标准价”还是“客户当前价”').replace(/草稿价/g,'报价单标准价');if(ctx.scope==='customer'&&reason.includes('多条调整或筛选规则'))reason='这条需求包含多种调整。请打开“按条件调整 → 逐商品设置”，在同一任务内分别核对商品价格；本地对话解析不会替你猜测各商品的调整方式。';return {error:reason};}
    if(ctx.scope==='quote'&&base==='customer'&&result.operation!=='set') return {error:'当前调整范围是报价单标准价，请以“报价单标准价”计算；如需按客户当前价设置专属规则，请切换调价范围。'};
    if(/[元￥¥]/.test(text)&&result.ids.some(id=>currency(sku(id))!=='CNY')) return {error:'当前报价单仅可查看，暂不支持调价。'};
    if (!base && result.operation!=='set' && ctx.scope==='customer') return {error:'请明确按“报价单标准价”还是“客户当前价”计算，或点击“按条件调整”选择。'};
    return {spec:{ids:result.ids,operation:result.operation,value:result.value,base:ctx.scope==='quote'?'quote':base||'quote',begin:dates[0]||'',end:dates[1]||''}};
  }
  function sendChat(text) {
    if(!guard())return; if(!text.trim())return;if(text.length>2000){toast('对话内容最多2000个字符');return;} const denied=GMP.error(db,ctx.scope,ctx.quoteId,[ctx.customerId]);if(denied){toast(denied);return;} message('user',text.trim()); const r=parseChat(text);
    if (r.error) {message('assistant',r.error);renderMain();return;}
    message('assistant',`已识别 ${r.spec.ids.length} 个商品。请核对所选范围${ctx.scope==='customer'?'并补充有效期':''}，然后生成预览。`); renderMain(); openRule({...r.spec,source:'报价对话'});
  }
  function affected(id) {
    if (id) {
      const p=plans[id]; state.dialog='impact';
      const rows=p.affectedCustomers.flatMap(c=>c.rows.map(r=>({c,r,s:sku(r.sku_id)})));
      dialog('调整影响范围',`<p class="notice">${p.context.scope==='quote'?'标准价变化不代表所有关联客户都变价。以下按演示当前时点、填写的数量重新取价。':'仅设置当前客户的规则。未来实际结算价由届时数量、有效规则与时价决定。'}</p><p>${p.affectedCustomers.map(c=>esc(c.name)).join('、')}</p><div class="toolbar"><input id="impact-query" type="search" placeholder="搜索影响中的商品" aria-label="搜索影响中的商品"></div><div id="impact-table"></div>`,`<button class="button" data-action="close-dialog">关闭</button>`);
      state.impact={rows,page:1,query:'',scope:p.context.scope}; renderImpact();
    } else {
      if (!ctx.quoteId) {toast('请先选择报价单。');return;} state.dialog='affected';
      dialog('报价单关联客户',`<p class="notice">${esc(quote().name)} · 修改标准价可能影响以下客户，最终价格按各自取价规则决定。</p><div class="impact-list">${GME.linkedCustomers(db,ctx.quoteId).map(c=>`<div><strong>${esc(c.name)}</strong><span class="muted">　${esc(c.customized_code)} · ${esc(c.address_id)}</span></div>`).join('')}</div>`,null,true);
    }
  }
  function renderImpact() {
    const u=state.impact,rows=u.rows.filter(x=>matches(x.s,u.query)),pages=Math.max(1,Math.ceil(rows.length/25));u.page=Math.min(u.page,pages);
    $('#impact-table').innerHTML=`<div class="table-scroll"><table class="data-table"><thead><tr><th>客户</th><th>商品</th><th>调整前适用价</th><th>调整后适用价</th><th>取价方式 / 影响</th></tr></thead><tbody>${rows.slice((u.page-1)*25,u.page*25).map(({c,r,s})=>`<tr><td>${esc(c.name)}</td><td>${esc(s.sku_name)}<div class="muted small">${esc(s.outer_id)}</div></td><td>${resolved(r.before,s)}</td><td>${r.after?resolved(r.after,s):'以实际生效时取价为准'}</td><td>${strategy[(r.after||r.before).strategy]}<div class="muted small">${!r.after?'规则设置，实际取价待生效':r.before.requires_quantity||r.after.requires_quantity||r.before.settle_price==null||r.after.settle_price==null?'暂不能确定':r.before.settle_price===r.after.settle_price?'适用价不变':'适用价变化'}</div></td></tr>`).join('')}</tbody></table></div><div class="pager"><span>共 ${rows.length} 条 · 第 ${u.page} / ${pages} 页</span><button class="button" data-impact-page="${u.page-1}" ${u.page===1?'disabled':''}>上一页</button><button class="button" data-impact-page="${u.page+1}" ${u.page===pages?'disabled':''}>下一页</button></div>`;
  }
  function about() {
    state.dialog='about';dialog('本地演示与角色',`<div class="management-context">演示时间：${esc(now().replace('T',' '))} · 北京时间 ${GMHelp.button('所有记录为演示数据；不会连接真实AI、修改订单或自动执行计划任务。当前价仅针对普通后台报价，未来实际价格由届时规则和数量决定。','演示边界')}</div><label class="field"><span>体验角色 ${GMHelp.button('定价主管：可查看成本并管理所有报价。报价员：不看成本，只能修改单客户协议价。查看者：只读。此处用于体验，正式权限由观麦账号授予。','角色说明')}</span><select id="demo-role">${Object.values(GMP.roles).map(r=>opt(r.id,r.name,GMP.role(db).id)).join('')}</select></label><div class="impact-list"><div>客户协议调价：每次确认形成一条任务记录，详情按商品查看；价格仍由原生规则决定。</div><div>报价单标准价：影响共享报价单，逐客户核对。</div><div>报价单定时调价：保存确定目标价，在未来整点安排一次执行。</div><div>操作记录：查看确认人、对象和修改前后值。</div></div><p class="notice">本期仅支持人民币写入；外币报价单只读。原有浏览器记录保留，不自动迁移到本版。采购与行情旧数据仅提示；没有完整来源时不自动推荐价格。</p><details class="disclosure"><summary>演示数据管理</summary><p class="notice">重置会清除本版演示修改、对话和操作记录，不影响旧版本存储或真实系统。</p><button class="button" data-action="reset">恢复 300 商品演示</button> <button class="button" data-action="load-1000">加载 1000 商品演示</button></details>`,null,true);
  }
  function logRows(log){
    const out=[],statuses={0:'关闭',1:'无效',2:'未开始',3:'有效'};
    const add=(field,before,after)=>{if(JSON.stringify(before)!==JSON.stringify(after))out.push({field,before,after});};
    const customers=v=>(v||[]).map(id=>customer(id)?.name||id).join('、');
    const calc=(r,m)=>{if(!m)return '—';const s=sku(m.sku_id)||db.skus.find(s=>s.salemenu_id===r.salemenu_id&&(s.spu_id===m.spu_id||s.category_id_2===m.category_2_id));const unit=r.locking_price_unit===1?s?.std_unit_name_forsale:s?.sale_unit_name;return m.rule_type===2?'基准价 × '+(m.yx_price/100):m.rule_type===0?'固定 '+(m.yx_price/100).toFixed(2)+' 元/'+(unit||'原计价单位'):'基准价 '+(m.yx_price>=0?'+':'')+(m.yx_price/100).toFixed(2)+' 元/'+(unit||'各商品原单位');};
    for(const c of log.changes||[]){
      const a=c.before,b=c.after;
      if(b?.rule_name&&Array.isArray(b.items)){
        add('任务名称',a?.rule_name,b.rule_name);add('报价单',a?.salemenu_id?quote(a.salemenu_id)?.name:null,quote(b.salemenu_id)?.name);add('计划执行时间',a?.effective_time,b.effective_time);
        const ids=[...new Set([...(a?.items||[]).map(x=>x.sku_id),...b.items.map(x=>x.sku_id)])];
        for(const id of ids){const x=a?.items?.find(x=>x.sku_id===id),y=b.items.find(x=>x.sku_id===id),z=sku(id);add((z?.outer_id||id)+' '+(z?.sku_name||''),x?{price:x.sale_price,unit:x.sale_unit_name,currency:x.fee_type}:null,y?{price:y.sale_price,unit:y.sale_unit_name,currency:y.fee_type}:null);}
      }else if(b?.rule_object_type){
        add('规则名称',a?.name,b.name);add('适用客户',customers(a?.address_ids),customers(b.address_ids));add('状态',statuses[a?.status],statuses[b.status]);add('有效日期',a?a.begin+' 至 '+a.end:null,b.begin+' 至 '+b.end);add('每日时段',a?a.begin_time+'–'+a.end_time:null,b.begin_time+'–'+b.end_time);add('时段方式',a?.time_limit===1?'跨午夜':'当日',b.time_limit===1?'跨午夜':'当日');
        if(b.rule_object_type===4)add('适用商品折扣',a?'× '+a.change_rate/100:null,'× '+b.change_rate/100);
        else{const av=GMX.ruleMembers(a||{}),bv=GMX.ruleMembers(b),key=b.rule_object_type===1?'sku_id':b.rule_object_type===2?'category_2_id':'spu_id',ids=[...new Set([...av,...bv].map(x=>x[key]))];for(const id of ids){const x=av.find(x=>x[key]===id),y=bv.find(x=>x[key]===id),z=sku(id)||db.skus.find(s=>s.salemenu_id===b.salemenu_id&&(s.category_id_2===id||s.spu_id===id));add((z?.outer_id||id)+' '+(b.rule_object_type===2?z?.category_name_2:z?.sku_name||''),calc(a||b,x),calc(b,y));}}
      }else add(c.field,c.before,c.after);
    }
    return out;
  }
  function showLog(id,page=1){
    if(!GMP.role(db).audit){toast('当前角色无权查看完整操作记录');return;}
    const log=db.operationLogs?.find(x=>x.id===id);if(!log){toast('操作记录不存在');return;}
    state.dialog='log';const changes=logRows(log),pages=Math.max(1,Math.ceil(changes.length/25));page=Math.max(1,Math.min(page,pages));
    const value=v=>v==null?'—':typeof v==='object'&&'price'in v?((v.price==null?'未确定':(v.currency&&v.currency!=='CNY'?'—':(v.price/100).toFixed(2)+' 元/'+(v.unit||'原单位')))+(v.begin?'；有效 '+v.begin+' 至 '+v.end:'')):typeof v==='object'?'相关配置已调整':String(v);
    dialog('操作记录详情',`<div class="management-context">${esc(log.actor)} · ${esc(log.time)} · ${esc(log.source)} ${GMHelp.button('记录人工确认的变更前后值。金额按商品单位显示，折扣仅作用于适用商品。本记录与商品历史报价分开保存，不能自动撤销后续业务变化。','记录口径')}</div><p>${esc(log.summary)}</p><div class="table-scroll"><table class="data-table"><thead><tr><th>字段 / 对象</th><th>修改前</th><th>修改后</th></tr></thead><tbody>${changes.slice((page-1)*25,page*25).map(c=>`<tr><td>${esc(c.field)}</td><td class="log-value">${esc(value(c.before))}</td><td class="log-value">${esc(value(c.after))}</td></tr>`).join('')||'<tr><td colspan="3">本记录未提供逐项变更</td></tr>'}</tbody></table></div><div class="pager"><span>共 ${changes.length} 项 · ${page} / ${pages} 页</span><button class="button" data-log-page="${page-1}" data-log-id="${esc(id)}" ${page===1?'disabled':''}>上一页</button><button class="button" data-log-page="${page+1}" data-log-id="${esc(id)}" ${page===pages?'disabled':''}>下一页</button></div>`);
  }
  function reset(size) { db=GMD.seed(size);ctx={customerId:'A1',quoteId:'',scope:'customer',generation:ctx.generation+1};histories={};plans={};state.selected.clear();state.quantities={};state.page='chat';close(true);save();render();toast(`已载入 ${size} 商品演示。`); }
  function showRuleDetail(id,taskId='',query='',page=1,backEditor=false){
    state.dialog='rule-detail';state.nativeRule={id,taskId,query,page,backEditor};
    dialog('系统价格规则',GMV.ruleDetail(db,ctx,id,{query,page}),backEditor?'<button class="button" data-ct="back">返回调价编辑</button>':taskId?`<button class="button" data-ct-view="${esc(taskId)}">返回调价任务</button><button class="button" data-action="close-dialog">关闭</button>`:'');
  }
  function refreshSelection() { const el=$('#selection-region'); if(el) el.innerHTML=selectionHTML(); }
  function retainFocus(fn) { const active=document.activeElement, key=active?.id, val=active?.getAttribute('data-gm-filter'), plan=active?.dataset.planQuery, start=active?.selectionStart;fn();const next=key?document.getElementById(key):val?document.querySelector(`[data-gm-filter="${val}"]`):plan?document.querySelector(`[data-plan-query="${plan}"]`):null;if(next){next.focus();try{next.setSelectionRange(start,start);}catch(_){}} }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,[data-quote]');if(!b||b.disabled)return;const d=b.dataset;
    if (d.page) {state.page=d.page;$('#sidebar').classList.remove('open');render();}
    else if(d.quote){switchContext({quoteId:d.quote});$('#sidebar').classList.remove('open');}
    else if(d.suggest){sendChat(d.suggest);}
    else if(d.pickPage){state.pick.page=Number(d.pickPage);refreshSelection();}
    else if(d.planPage){state.planPage[d.planPage]=Number(d.number);renderMain();}
    else if(d.impact){affected(d.impact);}
    else if(d.impactPage){state.impact.page=Number(d.impactPage);renderImpact();}
    else if(d.revise){const p=plans[d.revise];if(p.task_id)GCT.repeat(p.task_id,false);else openRule(p.spec);}
    else if(d.apply){if(!guard())return;const p=plans[d.apply],result=GME.applyPlan(db,p,ctx,now());if(!result.ok){toast(result.error);return;}const task=ctx.scope==='customer'?GMT.fromPlan(db,p,result,now()):null;p.applied=true;if(task)p.task_id=task.id;ctx.generation++;state.selected.clear();message('assistant',`${result.message}${task?'，已记录客户协议调价任务「'+task.name+'」':''}。实际业务系统未修改。`);save();render();toast(task?'客户协议调价配置完成，已生成任务记录':result.message);}
    else if(d.gmEvidenceTab){state.evidence={...state.evidence,tab:d.gmEvidenceTab,query:'',category:'all',page:1,from:d.gmEvidenceTab==='customer'?'2026-09-01':'2026-09-24',to:db.fixtureDate};renderMain();}
    else if(d.gmPage){state.evidence.page=Number(d.gmPage);renderMain();}
    else if(d.gmRuleTab){state.evidence.ruleTab=d.gmRuleTab;state.evidence.page=1;state.evidence.query='';renderMain();}
    else if(d.gmSkuDetail){state.returnSpec=state.dialog==='rule'?formSpec():null;state.returnDialog=state.dialog;state.dialog='detail';dialog('商品详情',GMV.detail(db,ctx,d.gmSkuDetail),'<button class="button" data-action="back-detail">返回</button>');}
    else if(d.gmRuleDetail){showRuleDetail(d.gmRuleDetail);}
    else if(d.gmNativeRulePage){const n=state.nativeRule;showRuleDetail(n.id,n.taskId,n.query,Number(d.gmNativeRulePage),n.backEditor);}
    else if(d.gmRuleEdit){GMM.openRule(d.gmRuleEdit);}
    else if(d.gmJobEdit){GMM.openJob(d.gmJobEdit);}
    else if(d.gmJobRetry){GMM.copyFailedJob(d.gmJobRetry);}
    else if(d.gmLogView){showLog(d.gmLogView);}
    else if(d.logPage){showLog(d.logId,Number(d.logPage));}
    else if(d.gmSelectSku){openRule({ids:[d.gmSelectSku]});}
    else if(d.action){
      const a=d.action;
      if(a==='close-dialog')close();else if(a==='toggle-nav')$('#sidebar').classList.toggle('open');else if(a==='sheet')openSheet();else if(a==='rule')openRule();else if(a==='customer-row-editor')openCustomerEditor();else if(a==='affected')affected();else if(a==='about')about();else if(a==='reset'){if(confirm('重置本版演示数据？当前修改、对话及操作记录将清除。'))reset(300);}else if(a==='load-1000'){if(confirm('载入1000商品并重置本版演示数据？'))reset(1000);}
      else if(a==='back-detail'){if(state.returnDialog==='rule')openRule(state.returnSpec);else if(state.returnDialog==='sheet')openSheet();else close();}
      else if(a==='pick-clear'){state.selected.clear();refreshSelection();}
      else if(a==='pick-all'||a==='pick-page'){let list=filtered();if(a==='pick-page')list=list.slice((state.pick.page-1)*state.pick.size,state.pick.page*state.pick.size);list.forEach(s=>state.selected.add(s.sku_id));refreshSelection();}
    }
  });
  document.addEventListener('input',e=>{
    const t=e.target;
    if(t.id==='quote-search')renderQuotes();
    else if(t.id==='native-rule-query'){const n=state.nativeRule;retainFocus(()=>showRuleDetail(n.id,n.taskId,t.value,1,n.backEditor));}
    else if(t.id==='pick-query'){state.pick.query=t.value;state.pick.page=1;retainFocus(refreshSelection);}
    else if(t.id==='impact-query'){state.impact.query=t.value;state.impact.page=1;renderImpact();}
    else if(t.dataset.planQuery){state.planQuery[t.dataset.planQuery]=t.value;state.planPage[t.dataset.planQuery]=1;retainFocus(renderMain);}
    else if(t.dataset.gmFilter==='query'){state.evidence.query=t.value;state.evidence.page=1;retainFocus(renderMain);}
  });
  document.addEventListener('change',e=>{
    const t=e.target,d=t.dataset;
    if(t.id==='demo-role'){if(!guard())return; db.demoRole=t.value;ctx.generation++;state.selected.clear();plans={};if(!GMP.role(db).audit)state.evidence.ruleTab='protocol';save();render();toast('已切换演示角色，旧预览失效');}
    else if(d.planConfirm){plans[d.planConfirm].confirmed=t.checked;}
    else if(t.id==='gm-customer')switchContext({customerId:t.value});
    else if(t.id==='gm-scope')switchContext({scope:t.value});
    else if(t.id==='pick-category'){state.pick.category=t.value;state.pick.page=1;refreshSelection();}
    else if(t.id==='pick-size'){state.pick.size=Number(t.value);state.pick.page=1;refreshSelection();}
    else if(d.select){t.checked?state.selected.add(d.select):state.selected.delete(d.select);refreshSelection();}
    else if(d.quantity){const v=Number(t.value);if(t.value&&Number.isFinite(v)&&v>0)state.quantities[d.quantity]=v;else delete state.quantities[d.quantity];refreshSelection();}
    else if(d.gmFilter && d.gmFilter!=='query'){state.evidence[d.gmFilter]=t.value;state.evidence.page=1;renderMain();}
    else if('gmSize' in d){state.evidence.size=Number(t.value);state.evidence.page=1;renderMain();}
    else if(t.name==='pricingIntent')calculationHelp(true);
    else if(t.name==='operation'&&$('#rule-form')?.contains(t)){$('#rule-form').elements.value.value='';calculationHelp();}
  });
  document.addEventListener('submit',e=>{
    e.preventDefault();
    if(e.target.id==='chat-form'){sendChat($('#chat-input').value);}
    else if(e.target.id==='rule-form'){if(!state.selected.size){$('#form-error').textContent='请至少选择一个商品。';return;}preview(formSpec());}
  });
  document.addEventListener('keydown',e=>{if(e.target.id==='chat-input'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();sendChat(e.target.value);}});
  $('#gm-dialog').addEventListener('cancel',e=>{e.preventDefault();close();});
  window.addEventListener('beforeunload',e=>{
    const dirtyRule=$('#gm-dialog').open&&state.dialog==='rule'&&$('#rule-form')&&state.formInitial!==JSON.stringify(formSpec());
    if(dirtyRule||window.GMM?.hasUnsavedChanges?.()||window.GCT?.hasUnsavedChanges?.()||savedError){e.preventDefault();e.returnValue='';}
  });
  window.addEventListener('storage',e=>{if(e.key===KEY && e.newValue){externalChange=true;ctx.generation++;renderMain();toast('其他页面已更新数据，提交前需要重新预览。');}});
  window.GMApp={get db(){return db;},get context(){return ctx;},get state(){return state;},get plans(){return plans;},guard,save,reset,render,openRule,preview,switchContext,now,storageKey:KEY};
  GMM.connect({db:()=>db,context:()=>ctx,now,dialog,close,toast,render,guard,commit:()=>{ctx.generation++;state.selected.clear();save();}});
  GCT.connect({db:()=>db,context:()=>ctx,now,dialog,close,toast,render,guard,commit:()=>{ctx.generation++;state.selected.clear();save();},openRules:()=>{state.page='rules';state.evidence.ruleTab='native';state.evidence.query='';state.evidence.page=1;render();},ruleDetail:(id,taskId='',backEditor=false)=>showRuleDetail(id,taskId,'',1,backEditor),ruleEdit:(id,sourceTaskId)=>GMM.openRule(id,sourceTaskId)});
  render();
})();
