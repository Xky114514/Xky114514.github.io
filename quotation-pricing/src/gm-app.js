(function () {
  'use strict';
  const KEY = 'guanmai-pricing-prototype-v1';
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = v => JSON.parse(JSON.stringify(v));
  let db = GMD.seed(), ctx = {customerId:'A1', quoteId:'', scope:'customer', generation:1};
  let savedError = '', histories = {};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved?.version === 1 && saved.db?.schema === db.schema && Array.isArray(saved.db.skus)) {
      db = saved.db; ctx = {...ctx, ...saved.context, generation:(saved.context.generation || 0) + 1}; histories = saved.histories || {};
    }
  } catch (_) { savedError = '浏览器存储不可用，当前操作仅在本次页面中保留。'; }
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
  const scopeName = () => ctx.scope === 'customer' ? '客户专属价' : '报价单基础价';
  const currency = s => s?.fee_type || quote(s?.salemenu_id)?.fee_type || 'CNY';
  const amount = (v,s) => v == null ? '—' : `${(v/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:4})} ${esc(currency(s))}/${esc(s?.sale_unit_name || '—')}`;
  const baseAmount = s => s.is_price_timing && s.sale_price === 0 ? '待定价（时价）' : amount(s.sale_price,s);
  const strategy = {normal:'报价单固定价',rule:'客户协议价',step:'阶梯价',timing:'时价待定',unsupported:'需原系统确认',missing:'资料缺失'};
  function ruleCalcText(row,s) { const r=db.rules.find(r=>r.id===row.update_rule_id);const unit=r?.locking_price_unit===1?s.std_unit_name_forsale:s.sale_unit_name;return row.rule_type===0?'固定价':row.rule_type===1?'加减值 '+(row.yx_price>=0?'+':'')+row.yx_price/100+' '+currency(s)+'/'+unit:'基础价 × '+row.yx_price/100; }
  function resolved(r,s) { return r.requires_quantity ? '填写数量后查看阶梯价' : r.strategy === 'timing' ? '待定价' : r.strategy === 'unsupported' ? '需原系统确认' : amount(r.settle_price,s); }
  const findPrice = s => GME.resolve(db,ctx.customerId,s.sku_id,state.quantities[s.sku_id] ?? null,{now:now()});
  const historyKey = () => [ctx.customerId,ctx.quoteId,ctx.scope].join('|');
  const messages = () => histories[historyKey()] ||= [];
  function save() { try { localStorage.setItem(KEY,JSON.stringify({version:1,db,context:ctx,histories})); } catch (_) { savedError = '浏览器存储空间不足，本次修改尚未持久保存。请保持页面打开。'; } $('#storage-note').textContent = savedError; }
  function toast(text) { $('#toast').textContent = text; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').textContent = '',4200); }
  function message(role,text,planId) { messages().push({role,text,planId}); save(); }
  function close() { $('#gm-dialog').close(); state.dialog = ''; }
  function dialog(title,body,footer='',narrow=false) {
    $('#dialog-title').textContent = title; $('#dialog-body').innerHTML = body;
    $('#dialog-footer').innerHTML = footer || '<button class="button" data-action="close-dialog">关闭</button>';
    $('#gm-dialog').classList.toggle('narrow',narrow);
    if (!$('#gm-dialog').open) $('#gm-dialog').showModal();
  }
  function switchContext(change) {
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
    $('#context-label').textContent = `${customer().name} / ${quote()?.name || '尚未选择报价单'} / ${scopeName()}`;
    $('#scope-note').textContent = ctx.scope === 'customer' ? '仅设置当前客户的协议价，共享基础价不变。' : '修改共享基础价；各客户仍按自己的取价规则执行。';
    document.querySelectorAll('[data-page]').forEach(b => b.classList.toggle('active',b.dataset.page === state.page));
    renderQuotes(); renderMain(); $('#storage-note').textContent = savedError;
  }
  function renderMain() {
    const target = $('#main-content'); target.classList.toggle('is-chat',state.page === 'chat');
    if (!ctx.quoteId && state.page === 'chat') { target.innerHTML = blank(); return; }
    if (state.page === 'chat') target.innerHTML = chatHTML();
    else if (state.page === 'evidence') target.innerHTML = '<div class="page">'+GMV.evidence(db,ctx,state.evidence)+'</div>';
    else target.innerHTML = '<div class="page">'+GMV.rules(db,ctx,state.evidence)+'</div>';
  }
  function chatHTML() {
    const ms = messages();
    const first=products()[0], example=`${first?.outer_id||'商品编码'}按${ctx.scope==='quote'?'报价单基础价':'客户当前价'}上调5%`;
    return `<div class="chat-wrap"><div class="conversation">${ms.length ? ms.map(m => `<div class="msg ${m.role}">${m.role==='assistant'?'<div class="assistant-mark">✳</div>':''}<div class="${m.role==='user'?'user-bubble':''}">${esc(m.text)}${m.planId ? plans[m.planId] ? planHTML(m.planId) : '<p class="muted small">此为历史预览，重新打开页面后请重新生成。</p>' : ''}</div></div>`).join('') : `<div class="welcome"><span class="eyebrow">${esc(quote().name)} · ${products().length} 个商品</span><h1>这次，想怎么调整报价？</h1><p>说出商品和调价方式，再核对范围与预览。</p><div class="quick-actions"><button class="suggestion" data-suggest="${esc((first?.outer_id||'')+'按报价单基础价上调3%')}">${esc(first?.sku_name||'商品')}按基础价上调 3%</button><button class="suggestion" data-action="rule">按条件选商品</button></div></div>`}</div><div class="composer-area"><form id="chat-form"><div class="composer"><textarea id="chat-input" aria-label="报价调整需求" placeholder="例如：${esc(example)}" rows="2"></textarea><div class="composer-tools"><button type="button" data-action="rule">☷ 按条件调整</button><button type="button" data-page="evidence">▤ 查看依据</button><button class="send" aria-label="发送需求" type="submit">↑</button></div></div></form><p class="composer-foot">本地规则解析演示 · 未接入 AI 或业务系统 · 应用前需要核对预览</p></div></div>`;
  }
  function planHTML(id) {
    const p = plans[id], query = state.planQuery[id] || '', rows = p.rows.filter(r => matches(sku(r.sku_id),query));
    const page = Math.min(state.planPage[id] || 1,Math.max(1,Math.ceil(rows.length/25))); state.planPage[id] = page;
    const stale = p.context.generation !== ctx.generation || p.context.customerId !== ctx.customerId || p.context.quoteId !== ctx.quoteId || p.context.scope !== ctx.scope;
    return `<article class="plan" data-plan="${id}"><div class="plan-head"><strong>${p.context.scope==='customer'?'客户协议价':'报价单基础价'}调整预览</strong><span class="tag ${p.ok?'green':'amber'}">${p.applied?'已应用演示':stale?'预览已失效':p.ok?'待核对':'需处理'}</span></div><p class="plan-meta">${esc(customer(p.context.customerId)?.name)} · ${esc(quote(p.context.quoteId)?.name)}${p.context.scope==='customer'?`<br>${esc(p.spec.begin||'未填写日期')} 至 ${esc(p.spec.end||'未填写日期')} · ${esc(p.spec.begin_time)}–${esc(p.spec.end_time)}${p.spec.time_limit===1?'（跨午夜）':''}`:''}</p><p class="plan-summary">${p.rows.length} 个商品 · 可调整 ${p.eligible_count} · 跳过 ${p.skipped_count}${p.errors.length?`<br><span class="error">${p.errors.map(esc).join('；')}</span>`:''}</p><div class="plan-tools"><input type="search" data-plan-query="${id}" aria-label="搜索预览商品" placeholder="搜索预览中的商品" value="${esc(query)}"><button class="text-button" data-impact="${id}">查看影响范围（${p.affectedCustomers.length} 个客户）</button></div><div class="table-scroll"><table class="data-table plan-table"><thead><tr><th>商品 / 单位</th><th>报价单基础价</th><th>客户当前适用价</th><th>拟调整值</th><th>处理说明</th></tr></thead><tbody>${rows.slice((page-1)*25,page*25).map(r => { const s=sku(r.sku_id);return `<tr><td>${esc(s.sku_name)}<div class="muted small">${esc(s.outer_id)} · ${esc(s.sale_unit_name)} / 基本${esc(s.std_unit_name_forsale)}</div></td><td>${s.is_price_timing&&r.base_price===0?'待定价（时价）':amount(r.base_price,s)}</td><td>${resolved(r.current,s)}<div class="muted small">${strategy[r.current.strategy]}</div></td><td>${r.skip||r.error?'—':amount(r.proposed_price,s)}${p.context.scope==='customer'&&!r.skip&&!r.error?`<div class="muted small">${esc(ruleCalcText(r,s))}</div>`:''}</td><td>${esc(r.error||r.warning||(r.update_rule_id?'修改已有单客户规则':'可调整'))}${r.rule_ids?.length? r.rule_ids.map(rid=>`<br><button class="text-button" data-gm-rule-detail="${esc(rid)}">查看冲突规则</button>`).join(''):''}</td></tr>`;}).join('') || '<tr><td colspan="5">没有匹配商品</td></tr>'}</tbody></table></div><div class="pager"><span>第 ${page} / ${Math.max(1,Math.ceil(rows.length/25))} 页 · 共 ${rows.length} 条</span><button class="button" data-plan-page="${id}" data-number="${page-1}" ${page===1?'disabled':''}>上一页</button><button class="button" data-plan-page="${id}" data-number="${page+1}" ${page*25>=rows.length?'disabled':''}>下一页</button></div><footer><span class="small muted">${p.context.scope==='customer'?'显示规则设置值，未来实际结算价以届时系统取价为准。':'关联客户不一定变价，阶梯、协议及时价仍优先。'}</span><button class="button" data-revise="${id}">调整预览</button><button class="button primary" data-apply="${id}" ${!p.ok||stale||p.applied?'disabled':''}>应用演示（${p.eligible_count}）</button></footer></article>`;
  }
  function matches(s,q) { return !q || [s.sku_name,s.sku_id,s.outer_id,s.specification_desc].some(v => String(v||'').toLowerCase().includes(q.trim().toLowerCase())); }
  function filtered() { return products().filter(s => matches(s,state.pick.query) && (state.pick.category==='all'||s.category_name_1===state.pick.category||s.category_name_2===state.pick.category)); }
  function selectionHTML() {
    const list=filtered(), pages=Math.max(1,Math.ceil(list.length/state.pick.size)); state.pick.page=Math.min(state.pick.page,pages);
    const categories=[...new Set(products().map(s=>s.category_name_1))];
    return `<div class="toolbar"><input id="pick-query" type="search" aria-label="搜索报价单商品" placeholder="搜索名称、编码或规格" value="${esc(state.pick.query)}"><select id="pick-category" aria-label="商品分类"><option value="all">全部分类</option>${categories.map(c=>`<option ${state.pick.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="pick-size" aria-label="每页商品数">${[25,50,100].map(n=>`<option value="${n}" ${state.pick.size===n?'selected':''}>${n} 条/页</option>`).join('')}</select></div><div class="selection-summary"><span>匹配 ${list.length} 个 · 已选 <strong>${state.selected.size}</strong> 个（跨页保留）</span><div class="flex wrap"><button type="button" data-action="pick-page">选择本页</button><button type="button" data-action="pick-all">选择全部匹配</button><button type="button" data-action="pick-clear">清空选择</button></div></div><div class="table-scroll pick-scroll"><table class="data-table pick-table"><thead><tr><th>选择</th><th>商品 / 规格</th><th>销售 / 基本单位</th><th>基础价</th><th>客户当前适用价</th><th>数量 / 数量档</th><th>操作</th></tr></thead><tbody>${list.slice((state.pick.page-1)*state.pick.size,state.pick.page*state.pick.size).map(s=>{const r=findPrice(s);return `<tr><td><input type="checkbox" data-select="${esc(s.sku_id)}" aria-label="选择 ${esc(s.sku_name)} ${esc(s.outer_id)}" ${state.selected.has(s.sku_id)?'checked':''}></td><td>${esc(s.sku_name)}<div class="muted small">${esc(s.outer_id)} · ${esc(s.specification_desc)}</div></td><td>${esc(s.sale_unit_name)} / ${esc(s.std_unit_name_forsale)}</td><td>${baseAmount(s)}</td><td>${resolved(r,s)}<div class="muted small">${strategy[r.strategy]}</div></td><td>${s.is_step_price?`<input class="quantity" type="number" min="0.001" step="any" data-quantity="${esc(s.sku_id)}" aria-label="${esc(s.sku_name)} 取价数量" value="${esc(state.quantities[s.sku_id]??'')}" placeholder="${esc(s.sale_unit_name)}"><div class="muted small">${r.step_tier?esc(r.step_tier.min+' ≤ 数量'+(r.step_tier.max?' < '+r.step_tier.max:'')+' '+s.sale_unit_name):'按销售单位输入'}</div>`:'—'}</td><td><button type="button" class="text-button" data-gm-sku-detail="${esc(s.sku_id)}">详情</button></td></tr>`;}).join('')||'<tr><td colspan="7">没有匹配商品</td></tr>'}</tbody></table></div><div class="pager"><span>第 ${state.pick.page} / ${pages} 页</span><button type="button" class="button" data-pick-page="${state.pick.page-1}" ${state.pick.page===1?'disabled':''}>上一页</button><button type="button" class="button" data-pick-page="${state.pick.page+1}" ${state.pick.page===pages?'disabled':''}>下一页</button></div>`;
  }
  const opt = (v,label,current) => `<option value="${esc(v)}" ${v===current?'selected':''}>${esc(label)}</option>`;
  const field = (name,label,html) => `<label class="field ${name}"><span>${label}</span>${html}</label>`;
  function openSheet() {
    if (!ctx.quoteId) { toast('请先选择报价单。'); return; } state.dialog='sheet';
    dialog(`${quote().name} · ${products().length} 个商品`,`<p class="notice">${esc(customer().name)} · 支持搜索、分类与跨页批选。阶梯价需要填写数量。</p><div id="selection-region">${selectionHTML()}</div>`,`<button class="button" data-action="close-dialog">关闭</button><button class="button primary" data-action="rule">调整所选商品</button>`);
  }
  function openRule(spec={}) {
    if (!ctx.quoteId) { toast('请先选择报价单。'); return; }
    if (spec.ids) state.selected = new Set(spec.ids);
    if (spec.quantities) state.quantities = {...spec.quantities};
    state.dialog='rule';
    dialog(`按条件调整 · ${scopeName()}`,`<p class="notice">${esc(customer().name)} / ${esc(quote().name)}${ctx.scope==='quote'?` · 共 ${GME.linkedCustomers(db,ctx.quoteId).length} 个关联客户`:''}</p><div id="selection-region">${selectionHTML()}</div><form id="rule-form" class="rule-form">${field('','计算方式',`<select name="operation" aria-label="计算方式">${opt('percent','按百分比调整',spec.operation||'percent')}${opt('delta','加减固定金额',spec.operation)}${opt('multiple','乘以倍数',spec.operation)}${opt('set','设为固定价',spec.operation)}</select>`)}${field('','数值（按下方单位提示）',`<input name="value" aria-label="调整数值" type="number" step="any" required value="${esc(spec.value??'')}" placeholder="上调填正数，下调填负数">`)}${field('','计算基准',`<select name="base" aria-label="计算基准" ${ctx.scope==='quote'?'disabled':''}>${opt('quote','报价单基础价',ctx.scope==='quote'?'quote':spec.base||'quote')}${opt('customer','客户当前适用价（一次计算）',spec.base)}</select>`)}<p class="notice" id="calculation-help"></p>${ctx.scope==='customer'?`${field('','规则名称',`<input name="ruleName" value="${esc(spec.ruleName||'')}" placeholder="可选，便于查找">`)}<div></div>${field('','有效开始日期',`<input name="begin" type="date" required value="${esc(spec.begin||'')}" aria-label="有效开始日期">`)}${field('','有效结束日期',`<input name="end" type="date" required value="${esc(spec.end||'')}" aria-label="有效结束日期">`)}<div class="full time-fields">${field('','每日开始时间',`<input name="begin_time" type="time" required value="${esc(spec.begin_time||'00:00')}" aria-label="每日开始时间">`)}${field('','每日结束时间',`<input name="end_time" type="time" required value="${esc(spec.end_time||'23:59')}" aria-label="每日结束时间">`)}${field('','时段方式',`<select name="time_limit" aria-label="时段方式">${opt('2','当日时段',String(spec.time_limit||2))}${opt('1','跨午夜',String(spec.time_limit))}</select>`)}</div><p class="notice full">按客户当前价计算的结果保存为固定价；按基础价加减或乘倍数保存为浮动规则。有效期必填，冲突时不会自动拆分原规则。</p>`:'<p class="notice full">基础价在应用演示后更新。需未来执行时使用已有的报价单周期调价任务。</p>'}<p id="form-error" class="error full" role="alert"></p></form>`,`<button class="button" data-action="close-dialog">取消</button><button class="button primary" type="submit" form="rule-form">生成预览</button>`);
    calculationHelp();
    state.editRuleId=spec.editRuleId||'';
    if(state.editRuleId&&$('#rule-form').elements.ruleName){$('#rule-form').elements.ruleName.readOnly=true;$('#rule-form').elements.ruleName.title='修改已有规则时保留原名称';}
  }
  function calculationHelp() { const f=$('#rule-form'); if (!f) return; const op=f.elements.operation.value; $('#calculation-help').textContent = op==='percent'?'单位：%。例如 3 为上调 3%，-3 为下调 3%。':op==='multiple'?'填写倍率。例如 1.05 为基础价的 1.05 倍。':'金额按商品币种与销售单位输入。混合币种或销售单位请分批调整。'; f.elements.base.disabled = ctx.scope==='quote'||op==='set'; }
  function formSpec() { const f=$('#rule-form'), v=Object.fromEntries(new FormData(f));return {...v,editRuleId:state.editRuleId,operation:f.elements.operation.value,base:ctx.scope==='quote'?'quote':f.elements.base.value,value:Number(v.value),time_limit:Number(v.time_limit||2),ids:[...state.selected],quantities:{...state.quantities}}; }
  function preview(spec) {
    const plan=GME.makePlan(db,{...ctx},spec,now()), id='P'+sessionId+'-'+nextPlan++; plans[id]=plan;
    close(); state.page='chat'; message('assistant',plan.ok?'已生成预览，请核对商品、计算方式和影响范围。':'已生成检查结果，请处理下方阻止项后重新预览。',id); render(); $('.conversation')?.scrollTo(0,$('.conversation').scrollHeight);
  }
  function parseChat(text) {
    if (/报价单(?:基础)?价|基础价/.test(text) && /客户(?:当前|适用|当前适用)价/.test(text)) return {error:'同时提到了报价单基础价和客户当前价，请明确本次计算基准，复杂筛选可使用“按条件调整”。'};
    const filterMatch=text.match(/(报价单(?:基础)?价|基础价|客户(?:当前|适用|当前适用)价|当前(?:执行)?(?:价|价格|单价))\s*(高于|低于|大于|小于|超过|不足)/);
    if(filterMatch && /^当前/.test(filterMatch[1])) return {error:'筛选价格也需要明确口径，请指定“报价单基础价”或“客户当前价”。'};
    const filterQuote=filterMatch&&/基础|报价单/.test(filterMatch[1]);
    const base=/报价单(?:基础)?价|基础价/.test(text)?'quote':/客户(?:当前|适用|当前适用)价/.test(text)?'customer':null;
    const normalized=text.replace(/报价单(?:基础)?价|基础价|客户(?:当前|适用|当前适用)价/g,'当前执行价');
    const dates=[...text.matchAll(/\d{4}-\d{2}-\d{2}/g)].map(m=>m[0]);
    const cleaned=normalized.replace(/(?:有效期|有效日期|从)?\s*\d{4}-\d{2}-\d{2}\s*(?:至|到|~|～)\s*\d{4}-\d{2}-\d{2}/g,'');
    const result=PricingIntent.parse(cleaned,{items:products().map(s=>{const r=findPrice(s);return {id:s.sku_id,name:s.sku_name,code:s.outer_id,spec:s.specification_desc,unit:s.sale_unit_name,category:[s.category_name_1,s.category_name_2],current:filterQuote?(s.sale_price==null||(s.is_price_timing&&s.sale_price===0)?NaN:s.sale_price/100):r.settle_price==null||r.requires_quantity?NaN:r.settle_price/100};}),activeCustomer:customer(),customerNames:db.customers});
    if (result.kind!=='adjust') return {error:result.reason.replace(/“当前执行价”还是“草稿价”/g,'“报价单基础价”还是“客户当前价”').replace(/草稿价/g,'报价单基础价')};
    if(ctx.scope==='quote'&&base==='customer'&&result.operation!=='set') return {error:'当前调整范围是报价单基础价，请以“报价单基础价”计算；如需按客户当前价设置专属规则，请切换调价范围。'};
    if(/[元￥¥]/.test(text)&&result.ids.some(id=>currency(sku(id))!=='CNY')) return {error:'所选商品不是人民币报价，请在“按条件调整”中核对币种后输入金额。'};
    if (!base && result.operation!=='set' && ctx.scope==='customer') return {error:'请明确按“报价单基础价”还是“客户当前价”计算，或点击“按条件调整”选择。'};
    return {spec:{ids:result.ids,operation:result.operation,value:result.value,base:ctx.scope==='quote'?'quote':base||'quote',begin:dates[0]||'',end:dates[1]||''}};
  }
  function sendChat(text) {
    if (!text.trim()) return; message('user',text.trim()); const r=parseChat(text);
    if (r.error) {message('assistant',r.error);renderMain();return;}
    message('assistant',`已识别 ${r.spec.ids.length} 个商品。请核对所选范围${ctx.scope==='customer'?'并补充有效期':''}，然后生成预览。`); renderMain(); openRule(r.spec);
  }
  function affected(id) {
    if (id) {
      const p=plans[id]; state.dialog='impact';
      const rows=p.affectedCustomers.flatMap(c=>c.rows.map(r=>({c,r,s:sku(r.sku_id)})));
      dialog('调整影响范围',`<p class="notice">${p.context.scope==='quote'?'基础价变化不代表所有关联客户都变价。以下按演示当前时点、填写的数量重新取价。':'仅设置当前客户的规则。未来实际结算价由届时数量、有效规则与时价决定。'}</p><p>${p.affectedCustomers.map(c=>esc(c.name)).join('、')}</p><div class="toolbar"><input id="impact-query" type="search" placeholder="搜索影响中的商品" aria-label="搜索影响中的商品"></div><div id="impact-table"></div>`,`<button class="button" data-action="close-dialog">关闭</button>`);
      state.impact={rows,page:1,query:'',scope:p.context.scope}; renderImpact();
    } else {
      if (!ctx.quoteId) {toast('请先选择报价单。');return;} state.dialog='affected';
      dialog('报价单关联客户',`<p class="notice">${esc(quote().name)} · 修改基础价可能影响以下客户，最终价格按各自取价规则决定。</p><div class="impact-list">${GME.linkedCustomers(db,ctx.quoteId).map(c=>`<div><strong>${esc(c.name)}</strong><span class="muted">　${esc(c.customized_code)} · ${esc(c.address_id)}</span></div>`).join('')}</div>`,null,true);
    }
  }
  function renderImpact() {
    const u=state.impact,rows=u.rows.filter(x=>matches(x.s,u.query)),pages=Math.max(1,Math.ceil(rows.length/25));u.page=Math.min(u.page,pages);
    $('#impact-table').innerHTML=`<div class="table-scroll"><table class="data-table"><thead><tr><th>客户</th><th>商品</th><th>调整前适用价</th><th>调整后适用价</th><th>取价方式</th></tr></thead><tbody>${rows.slice((u.page-1)*25,u.page*25).map(({c,r,s})=>`<tr><td>${esc(c.name)}</td><td>${esc(s.sku_name)}<div class="muted small">${esc(s.outer_id)}</div></td><td>${resolved(r.before,s)}</td><td>${r.after?resolved(r.after,s):'以实际生效时取价为准'}</td><td>${strategy[(r.after||r.before).strategy]}</td></tr>`).join('')}</tbody></table></div><div class="pager"><span>共 ${rows.length} 条 · 第 ${u.page} / ${pages} 页</span><button class="button" data-impact-page="${u.page-1}" ${u.page===1?'disabled':''}>上一页</button><button class="button" data-impact-page="${u.page+1}" ${u.page===pages?'disabled':''}>下一页</button></div>`;
  }
  function ruleEdit(id) {
    const r=db.rules.find(r=>r.id===id); if (!r) return;
    if (![2,3].includes(Number(r.status))) {toast('关闭或无效规则仅供查看，请在原系统处理。');return;}
    if (r.address_ids.length!==1 || Number(r.rule_object_type)!==1) {toast('此规则影响多个客户或采用其他对象类型，请在原系统调整。');return;}
    if (r.address_ids[0]!==ctx.customerId || r.salemenu_id!==ctx.quoteId || ctx.scope!=='customer') switchContext({customerId:r.address_ids[0]});
    if (ctx.quoteId!==r.salemenu_id || ctx.scope!=='customer') switchContext({quoteId:r.salemenu_id,scope:'customer'});
    const item=r.skus[0]; const s=sku(item.sku_id); const val=item.yx_price/100;
    openRule({editRuleId:id,ids:r.skus.map(x=>x.sku_id),operation:item.rule_type===0?'set':item.rule_type===1?'delta':'multiple',value:item.rule_type===2?val:Number(r.locking_price_unit)===1?val*s.sale_ratio:val,base:'quote',ruleName:r.name,begin:r.begin,end:r.end,begin_time:r.begin_time,end_time:r.end_time,time_limit:r.time_limit});
    const salesValue=x=>Number(r.locking_price_unit)===1&&x.rule_type!==2?x.yx_price*sku(x.sku_id).sale_ratio:x.yx_price;
    if (r.skus.some(x=>x.rule_type!==item.rule_type||salesValue(x)!==salesValue(item))) {$('#rule-form').elements.value.value=''; $('#form-error').textContent='原规则各商品设置不同，请明确本次统一调整值，或只选择一个商品。';}
  }
  function jobEdit(id) {
    const j=db.jobs.find(j=>j.rule_id===id); if(!j||j.rule_status!==0){toast('只能编辑未开始任务。');return;} state.dialog='job';state.jobId=id;
    dialog('编辑周期调价任务',`<form id="job-form" class="rule-form">${field('full','任务名称',`<input name="rule_name" required value="${esc(j.rule_name)}" aria-label="任务名称">`)}${field('full','执行时间',`<input name="effective_time" required type="datetime-local" step="60" value="${esc(j.effective_time.slice(0,16))}" aria-label="执行时间">`)}<p class="notice full">${esc(quote(j.salemenu_id)?.name)} · 演示当前时间 ${esc(now().replace('T',' '))}。到达执行时间不代表执行成功，状态与结果来自系统任务记录。</p><p id="form-error" role="alert" class="error full"></p></form>`,`<button class="button" data-action="close-dialog">取消</button><button class="button primary" form="job-form" type="submit">保存演示</button>`,true);
  }
  function about() { state.dialog='about';dialog('本地演示使用说明',`<p>先选客户与报价单，再用对话或“按条件调整”选择商品。核对预览后应用演示。</p><div class="impact-list"><div>客户专属价：设置当前客户的系统价格规则。</div><div>报价单基础价：更新共享价格，影响客户需分别核对。</div><div>客户与依据：查看采购、报价记录、行情、客户资料与价格规则。</div><div>规则与调价：查看客户协议价和报价单周期任务。</div></div><p class="notice">固定演示时点：${esc(now().replace('T',' '))}（北京时间）。所有数值均为演示；对话使用本地有限语法解析，尚未接入 AI。旧版浏览器数据保留，不迁移为观麦对象。</p><details class="disclosure"><summary>演示数据管理</summary><p>仅重置本版演示，不删除旧版原型存储。</p><button class="button" data-action="reset">恢复 300 商品演示</button> <button class="button" data-action="load-1000">加载 1000 商品演示</button></details>`,null,true); }
  function reset(size) { db=GMD.seed(size);ctx={customerId:'A1',quoteId:'',scope:'customer',generation:ctx.generation+1};histories={};plans={};state.selected.clear();state.quantities={};state.page='chat';close();save();render();toast(`已载入 ${size} 商品演示。`); }
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
    else if(d.revise){openRule(plans[d.revise].spec);}
    else if(d.apply){const p=plans[d.apply],result=GME.applyPlan(db,p,ctx,now());if(!result.ok){toast(result.error);return;}p.applied=true;ctx.generation++;state.selected.clear();message('assistant',`${result.message}。实际业务系统未修改。`);save();render();toast(result.message);}
    else if(d.gmEvidenceTab){state.evidence={...state.evidence,tab:d.gmEvidenceTab,query:'',category:'all',page:1,from:d.gmEvidenceTab==='customer'?'2026-09-01':'2026-09-24',to:db.fixtureDate};renderMain();}
    else if(d.gmPage){state.evidence.page=Number(d.gmPage);renderMain();}
    else if(d.gmRuleTab){state.evidence.ruleTab=d.gmRuleTab;state.evidence.page=1;state.evidence.query='';renderMain();}
    else if(d.gmSkuDetail){state.returnSpec=state.dialog==='rule'?formSpec():null;state.returnDialog=state.dialog;state.dialog='detail';dialog('商品详情',GMV.detail(db,ctx,d.gmSkuDetail),'<button class="button" data-action="back-detail">返回</button>');}
    else if(d.gmRuleDetail){state.dialog='rule-detail';dialog('系统价格规则',GMV.ruleDetail(db,ctx,d.gmRuleDetail));}
    else if(d.gmRuleEdit){ruleEdit(d.gmRuleEdit);}
    else if(d.gmJobEdit){jobEdit(d.gmJobEdit);}
    else if(d.gmSelectSku){openRule({ids:[d.gmSelectSku]});}
    else if(d.action){
      const a=d.action;
      if(a==='close-dialog')close();else if(a==='toggle-nav')$('#sidebar').classList.toggle('open');else if(a==='sheet')openSheet();else if(a==='rule')openRule();else if(a==='affected')affected();else if(a==='about')about();else if(a==='reset')reset(300);else if(a==='load-1000')reset(1000);
      else if(a==='back-detail'){if(state.returnDialog==='rule')openRule(state.returnSpec);else if(state.returnDialog==='sheet')openSheet();else close();}
      else if(a==='pick-clear'){state.selected.clear();refreshSelection();}
      else if(a==='pick-all'||a==='pick-page'){let list=filtered();if(a==='pick-page')list=list.slice((state.pick.page-1)*state.pick.size,state.pick.page*state.pick.size);list.forEach(s=>state.selected.add(s.sku_id));refreshSelection();}
    }
  });
  document.addEventListener('input',e=>{
    const t=e.target;
    if(t.id==='quote-search')renderQuotes();
    else if(t.id==='pick-query'){state.pick.query=t.value;state.pick.page=1;retainFocus(refreshSelection);}
    else if(t.id==='impact-query'){state.impact.query=t.value;state.impact.page=1;renderImpact();}
    else if(t.dataset.planQuery){state.planQuery[t.dataset.planQuery]=t.value;state.planPage[t.dataset.planQuery]=1;retainFocus(renderMain);}
    else if(t.dataset.gmFilter==='query'){state.evidence.query=t.value;state.evidence.page=1;retainFocus(renderMain);}
  });
  document.addEventListener('change',e=>{
    const t=e.target,d=t.dataset;
    if(t.id==='gm-customer')switchContext({customerId:t.value});
    else if(t.id==='gm-scope')switchContext({scope:t.value});
    else if(t.id==='pick-category'){state.pick.category=t.value;state.pick.page=1;refreshSelection();}
    else if(t.id==='pick-size'){state.pick.size=Number(t.value);state.pick.page=1;refreshSelection();}
    else if(d.select){t.checked?state.selected.add(d.select):state.selected.delete(d.select);refreshSelection();}
    else if(d.quantity){const v=Number(t.value);if(t.value&&Number.isFinite(v)&&v>0)state.quantities[d.quantity]=v;else delete state.quantities[d.quantity];refreshSelection();}
    else if(d.gmFilter && d.gmFilter!=='query'){state.evidence[d.gmFilter]=t.value;state.evidence.page=1;renderMain();}
    else if('gmSize' in d){state.evidence.size=Number(t.value);state.evidence.page=1;renderMain();}
    else if(t.name==='operation'||t.name==='base')calculationHelp();
  });
  document.addEventListener('submit',e=>{
    e.preventDefault();
    if(e.target.id==='chat-form'){sendChat($('#chat-input').value);}
    else if(e.target.id==='rule-form'){if(!state.selected.size){$('#form-error').textContent='请至少选择一个商品。';return;}preview(formSpec());}
    else if(e.target.id==='job-form'){const change=Object.fromEntries(new FormData(e.target));const result=GME.updateJob(db,state.jobId,change,now());if(!result.ok){$('#form-error').textContent=result.error;return;}ctx.generation++;close();save();renderMain();toast('已保存本地任务设置，执行状态未改变。');}
  });
  document.addEventListener('keydown',e=>{if(e.target.id==='chat-input'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();sendChat(e.target.value);}});
  $('#gm-dialog').addEventListener('cancel',()=>state.dialog='');
  window.GMApp={get db(){return db;},get context(){return ctx;},get state(){return state;},get plans(){return plans;},reset,render,openRule,preview,switchContext,now,storageKey:KEY};
  render();
})();
