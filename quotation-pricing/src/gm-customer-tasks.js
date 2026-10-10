(function () {
  'use strict';
  let api, u = null, detail = null;
  const listing = { query: '', customer: 'all', quote: 'all', status: 'all', page: 1 };
  const $ = s => document.querySelector(s), clone = v => JSON.parse(JSON.stringify(v));
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const db = () => api.db(), help = (text, label) => GMHelp.button(text, label);
  const customer = id => db().customers.find(c => c.address_id === id), quote = id => db().salemenus.find(q => q.id === id), sku = id => db().skus.find(s => s.sku_id === id);
  const option = (v, label, selected) => `<option value="${esc(v)}" ${String(v) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
  const field = (label, content, info = '') => `<label class="field"><span>${esc(label)} ${info ? help(info, label + '说明') : ''}</span>${content}</label>`;
  const operations = { set: '固定价', delta: '加减值', percent: '百分比', multiple: '倍数' };
  const statusLabel = { completed: '配置完成', partial: '部分完成', failed: '配置失败' };
  const resultLabel = { success: '配置成功', failed: '配置失败', skipped: '已跳过' };
  function money(v, s) { return v == null || !Number.isFinite(Number(v)) || (s?.currency || s?.fee_type || 'CNY') !== 'CNY' ? '—' : `${(Number(v) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} 元/${esc(s?.unit || s?.sale_unit_name || '—')}`; }
  const ruleLinks = ids => [...new Set(ids || [])].map(id => `<button class="text-button" data-ct-rule="${esc(id)}">${esc(id)}</button>`).join(' ');
  function period(d) { return d.begin && d.end ? `${esc(d.begin)} — ${esc(d.end)}<div class="small muted">${esc(d.begin_time || '00:00')}–${esc(d.end_time || '23:59')}${Number(d.time_limit) === 1 ? ' · 跨午夜' : ''}</div>` : '—'; }
  function taskCustomers(t) { return (t.customer_ids?.length ? t.customer_ids : [t.customer_id]).filter(Boolean); }
  function customerNames(ids) { return ids.map(id => customer(id)?.name || id).join('、'); }
  function snapshotNames(t) { return t.customer_names?.length ? t.customer_names.join('、') : t.customer_name || taskCustomers(t).join('、'); }
  function taskQuote(t) { return t.salemenu_name || t.salemenu_id; }
  function permission(quoteId, customers) { return window.GMP?.error(db(), 'customer', quoteId, customers) || ''; }
  function quoteOption(q, selected, cid) { const blocked = permission(q.id, [cid]); return `<option value="${esc(q.id)}" ${q.id === selected ? 'selected' : ''} ${blocked ? 'disabled' : ''}>${esc(q.name)}${blocked ? '（仅查看）' : ''}</option>`; }
  function taskBlocked(t) { return permission(t.salemenu_id, taskCustomers(t)); }
  function taskCounts(t) { return ['success', 'failed', 'skipped'].reduce((a, k) => (a[k] = (t.items || []).filter(i => i.status === k).length, a), {}); }
  function status(t) { const n = taskCounts(t); return `${esc(statusLabel[t.processing_status] || '待核对')}<div class="small muted">${n.success} 成功${n.failed ? ` · ${n.failed} 失败` : ''}${n.skipped ? ` · ${n.skipped} 跳过` : ''}</div>`; }
  function taskRows() {
    const query = listing.query.trim().toLowerCase();
    return [...(db().customerTasks || [])].filter(t => (listing.customer === 'all' || taskCustomers(t).includes(listing.customer)) && (listing.quote === 'all' || t.salemenu_id === listing.quote) && (listing.status === 'all' || t.processing_status === listing.status) && (!query || [t.id, t.name, t.actor, snapshotNames(t), taskQuote(t)].some(v => String(v || '').toLowerCase().includes(query)))).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || String(b.id).localeCompare(String(a.id)));
  }
  function list() {
    const all = taskRows(), pages = Math.max(1, Math.ceil(all.length / 25)); listing.page = Math.max(1, Math.min(listing.page, pages));
    const canCreate = db().links.some(l => l.station_id === db().station_id && !permission(l.salemenu_id, [l.restaurant_id]));
    return `<section class="ct-list"><div class="section-title flex spread"><strong>客户协议调价 ${help('针对客户设置协议价，现在确认保存，按有效日期和每日时段参与取价。例如晨禾10月白菜固定4.80元，不改变报价单标准价。列表一行记录一次配置；配置完成不等于价格此刻生效。需要预约改报价单默认售价，请使用“报价单定时调价”。', '客户协议调价说明')}</strong><div class="ct-heading-actions"><button class="button" data-ct="rules">查看现有价格规则</button><button class="button primary" data-ct="new" ${canCreate ? '' : 'disabled'}>设置客户协议价</button>${canCreate ? '' : help('当前角色或关联报价单没有客户协议调价权限。', '新建调价限制')}</div></div><div class="toolbar ct-list-filters"><input id="ct-list-query" type="search" maxlength="100" placeholder="搜索任务、客户或报价单" aria-label="搜索客户协议调价任务" value="${esc(listing.query)}"><select id="ct-list-customer" aria-label="筛选任务客户">${option('all', '全部客户', listing.customer)}${db().customers.map(c => option(c.address_id, c.name, listing.customer)).join('')}</select><select id="ct-list-quote" aria-label="筛选任务报价单">${option('all', '全部报价单', listing.quote)}${db().salemenus.filter(q => q.station_id === db().station_id || !q.station_id).map(q => option(q.id, q.name, listing.quote)).join('')}</select><select id="ct-list-status" aria-label="筛选任务处理状态">${option('all', '全部处理状态', listing.status)}${Object.entries(statusLabel).map(([k, v]) => option(k, v, listing.status)).join('')}</select></div><div class="table-scroll"><table class="data-table ct-task-table"><thead><tr><th>调价任务</th><th>客户／报价单</th><th>涉及商品数</th><th>有效日期 ${help('同一普通任务使用统一有效日期和每日时段。原生规则编辑保留原范围；历史任务不跟随当前价格变化。', '有效日期说明')}</th><th>配置结果 ${help('配置成功不等于当前生效，也不等于所有渠道实际取价。部分完成的任务应核对失败和跳过商品。', '处理状态说明')}</th><th>操作</th></tr></thead><tbody>${all.slice((listing.page - 1) * 25, listing.page * 25).map(t => `<tr><td><strong>${esc(t.name)}</strong><div class="small muted">${esc(t.id)}</div></td><td>${esc(snapshotNames(t))}<div class="small muted">${esc(taskQuote(t))}</div></td><td>${(t.items || []).length}${t.kind === 'native_rule_edit' ? ' 个商品' : ''}</td><td>${period(t)}</td><td>${status(t)}</td><td><div class="ct-row-actions"><button class="text-button" data-ct-view="${esc(t.id)}">查看</button><button class="text-button" data-ct-repeat="${esc(t.id)}" ${taskBlocked(t) ? 'disabled' : ''}>再次调整</button>${taskCounts(t).failed ? `<button class="text-button" data-ct-failed="${esc(t.id)}" ${taskBlocked(t) ? 'disabled' : ''}>处理失败项</button>` : ''}${taskBlocked(t) ? help(taskBlocked(t), '任务操作限制') : ''}</div></td></tr>`).join('') || '<tr><td colspan="6" class="empty">暂无匹配的客户协议调价任务。已有系统规则可通过“查看现有价格规则”查询。</td></tr>'}</tbody></table></div>${pager('list', listing.page, pages, all.length)}</section>`;
  }
  function pager(type, page, pages, total) { return `<div class="pager"><span>${total} 条 · ${page} / ${pages} 页</span><button class="button" data-ct-page="${type}" data-number="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button><button class="button" data-ct-page="${type}" data-number="${page + 1}" ${page >= pages ? 'disabled' : ''}>下一页</button></div>`; }
  function readForm() {
    const form = $('#ct-editor-form'); if (!u || !form) return;
    const f = new FormData(form); ['name', 'begin', 'end', 'begin_time', 'end_time'].forEach(k => u.draft[k] = String(f.get(k) || ''));
    u.draft.time_limit = Number(f.get('time_limit') || 2);
  }
  function captured() { readForm(); return u ? JSON.stringify(u.draft) : ''; }
  function hasUnsavedChanges() { return !!u && !!$('#gm-dialog')?.open && !!($('#ct-editor-form') || $('#ct-review') || u.stage === 'rule-detail') && (captured() !== u.initial || priceEditorDirty()); }
  function canClose() { if (u?.stage === 'rule-detail') { editor(); return false; } if (hasUnsavedChanges() && !window.confirm('有未保存的客户协议调价内容，确定放弃并关闭？')) return false; u = null; return true; }
  function openNew(initial = {}) {
    const ctx = api.context(), cid = initial.customer_id || ctx.customerId || db().customers[0]?.address_id || '';
    const linked = GME.linkedQuotes(db(), cid), qid = initial.salemenu_id || (linked.some(q => q.id === ctx.quoteId) ? ctx.quoteId : linked.length === 1 ? linked[0].id : '');
    const access = qid ? permission(qid, [cid]) : (window.GMP?.role(db()).id === 'viewer' ? '当前角色只能查看，不能新建客户协议调价。' : '');
    if (access) { api.toast(access); return; }
    if (u && !canClose()) return;
    detail = null;
    u = { stage: 'edit', draft: { name: '', customer_id: cid, salemenu_id: qid, begin: '', end: '', begin_time: '00:00', end_time: '23:59', time_limit: 2, items: [], source: '手动客户协议调价', ...clone(initial) }, query: '', category: 'all', only: false, page: 1, size: 25, bulk: 'percent', bulkValue: '', bulkBase: 'quote', preview: null, reviewPage: 1, reviewQuery: '', ack: false };
    u.draft.items ||= []; u.selected = new Set(); u.only = u.draft.items.length > 0; u.initial = initial.source_task_id || u.draft.items.length ? '' : JSON.stringify(u.draft); editor();
  }
  function editor() {
    u.stage = 'edit'; const d = u.draft, linked = GME.linkedQuotes(db(), d.customer_id);
    api.dialog('新建客户协议调价任务', `<form id="ct-editor-form" class="ct-editor-form">${field('任务名称', `<input name="name" maxlength="80" required placeholder="如：晨禾十月蔬菜调价" value="${esc(d.name)}">`)}${field('客户', `<select id="ct-customer" name="customer_id" required>${db().customers.map(c => option(c.address_id, c.name, d.customer_id)).join('')}</select>`)}${field('报价单', `<select id="ct-quote" name="salemenu_id" required>${option('', '请选择报价单', d.salemenu_id)}${linked.map(q => quoteOption(q, d.salemenu_id, d.customer_id)).join('')}</select>`)}${field('有效开始日期', `<input name="begin" type="date" required value="${esc(d.begin)}">`)}${field('有效结束日期', `<input name="end" type="date" required value="${esc(d.end)}">`)}${field('每日开始时间', `<input name="begin_time" type="time" required value="${esc(d.begin_time)}">`)}${field('每日结束时间', `<input name="end_time" type="time" required value="${esc(d.end_time)}">`)}${field('时段方式', `<select name="time_limit">${option(2, '当日时段', d.time_limit)}${option(1, '跨午夜', d.time_limit)}</select>`, '一个任务统一生效日期和每日时段；不同生效时间请拆分任务。跨午夜的结束时间必须早于开始时间。')}<div class="ct-editor-context">客户协议价 ${help('选择单个客户和一张关联报价单。商品允许不同计算方式；已有共享、分类、SPU或整单规则请使用原规则入口，不能自动拆分成单客户商品规则。', '任务调整范围说明')}</div></form><section id="ct-products"></section><p id="ct-error" class="error" role="alert"></p>`, `<button class="button" data-action="close-dialog">取消</button><button class="button primary" form="ct-editor-form" type="submit">核对调价</button>`);
    renderProducts();
  }
  function catalog() { return db().skus.filter(s => s.salemenu_id === u.draft.salemenu_id); }
  function matched() { const term = u.query.trim().toLowerCase(); return catalog().filter(s => (!term || [s.sku_id, s.sku_name, s.outer_id, s.specification_desc].some(x => String(x || '').toLowerCase().includes(term))) && (u.category === 'all' || s.category_name_1 === u.category) && (!u.only || u.draft.items.some(i => i.sku_id === s.sku_id))); }
  function currentPrice(s, row) { const p = GME.resolve(db(), u.draft.customer_id, s.sku_id, row?.quantity ?? null, { now: api.now() }); return p.requires_quantity ? '填写数量后查看' : p.strategy === 'timing' ? '待定价' : p.settle_price == null ? '需原系统确认' : money(p.settle_price, s); }
  function basePrice(s) { return s.is_price_timing && s.sale_price === 0 ? '待定价（时价）' : money(s.sale_price, s); }
  const configured = row => row && row.value !== '' && row.value != null && Number.isFinite(Number(row.value));
  const intentOf = row => !row?.operation ? 'mixed' : row.operation === 'set' ? 'fixed' : row.base === 'customer' ? 'current' : 'follow';
  const intentOptions = current => (current==='mixed'?'<option value="mixed" selected disabled>多种设置，选择统一修改</option>':'') + option('fixed', '直接指定客户价格', current) + option('follow', '随报价单标准价浮动', current) + option('current', '按客户当前价调整一次', current);
  const selectedRows = () => u.draft.items.filter(row => u.selected.has(row.sku_id));
  function priceDraft() { return {operation:u.bulk, value:u.bulkValue, base:u.bulkBase, quantity:u.bulkQuantity}; }
  function updatePriceDraft(values) {
    if('operation' in values)u.bulk=values.operation;
    if('value' in values)u.bulkValue=values.value;
    if('base' in values)u.bulkBase=values.base;
    if('quantity' in values)u.bulkQuantity=values.quantity;
  }
  function editorSnapshot() { return JSON.stringify(priceDraft()); }
  function priceEditorDirty() { return !!u?.bulkOpen && editorSnapshot() !== u.priceInitial; }
  function discardPriceEditor() {
    if (priceEditorDirty() && !window.confirm('放弃尚未填入商品的价格设置？')) return false;
    u.bulkOpen = false; u.priceError = ''; return true;
  }
  function openPriceEditor() {
    if (u.bulkOpen || !u.selected.size) return;
    const targets=selectedRows();if(!targets.length)return;
    const first=targets[0],same=targets.every(r=>configured(r)&&r.operation===first.operation&&(r.operation==='set'||r.base===first.base)&&Number(r.value)===Number(first.value));
    const row=same||targets.length===1?first:null, mixed=!row&&targets.some(configured);
    u.bulkOpen=true;u.bulk=mixed?null:row?.operation||'set';u.bulkValue=row?.value??'';u.bulkBase=row?.base||'quote';u.bulkQuantity=targets.length===1?first.quantity??null:null;
    u.priceInitial=editorSnapshot();renderProducts();
    $('#ct-price-editor')?.scrollIntoView({block:'nearest'});($('#ct-price-value')||$('#ct-price-mode'))?.focus();
  }
  function priceError(text) { u.priceError = text; const el = $('#ct-price-error'); if (el) el.textContent = text; else setError(text); }
  function valueError(row) {
    if(!['set','delta','percent','multiple'].includes(row.operation))return '请选择本次统一修改的定价方式。';
    if (row.value == null || String(row.value).trim() === '' || !Number.isFinite(Number(row.value))) return '请填写有效数值。';
    const v = Number(row.value);
    if (['set','delta'].includes(row.operation) && (Math.abs(v)>999999.99 || Math.abs(v*100-Math.round(v*100))>1e-7)) return '金额最多两位小数，绝对值不超过999999.99元。';
    if (row.operation==='set' && v<0) return '客户价格不能为负数。';
    if (row.operation==='percent' && (v<=-100 || v>9900)) return '百分比须大于-100%且不超过9900%。';
    if (row.operation==='multiple' && (v<=0 || v>100)) return '倍数须大于0且不超过100。';
    if (row.quantity!=null && (!Number.isFinite(Number(row.quantity)) || Number(row.quantity)<=0)) return '取价数量必须大于0。';
    return '';
  }
  function settingsSummary(row,s) {
    if (!row) return '<span class="muted">未加入任务</span>';
    if (!configured(row)) return '<span class="tag amber">待设置</span>';
    const flag='<span class="tag price-result-flag">已设置</span>', v=Number(row.value), basis=row.base==='customer'?'客户当前价':'报价单标准价';
    if (row.operation==='set') return `${flag}<strong>固定 ${money(v*100,s)}</strong>`;
    const formula=row.operation==='percent'?`${basis}${v>=0?'上调':'下调'} ${Math.abs(v)}%`:row.operation==='multiple'?`${basis} × ${v}`:`${basis} ${v>=0?'+':'−'} ${money(Math.abs(v)*100,s)}`;
    return `${flag}${formula}<div class="small muted">${row.base==='customer'?'算一次，保存固定价':'随标准价变化'}</div>`;
  }
  function renderPriceEditor() {
    const target=$('#ct-price-editor'); if (!target) return;
    if (!u.bulkOpen) { target.innerHTML=''; return; }
    const targets=selectedRows(), row=priceDraft(), single=targets.length===1, product=single?sku(targets[0].sku_id):null, mode=intentOf(row),mixed=mode==='mixed',ready=targets.filter(configured).length;
    const selected=targets.map(i=>sku(i.sku_id)), units=[...new Set(selected.map(s=>s?.sale_unit_name).filter(Boolean))];
    const unit=single?product.sale_unit_name:units.length===1?units[0]:'按商品单位';
    const valueLabel=row.operation==='set'?`新价格（元/${unit}）`:row.operation==='delta'?`增减金额（元/${unit}）`:row.operation==='percent'?'涨跌幅（%）':'倍数';
    const info=mode==='fixed'?'直接填写客户协议价，不需要参考其他价格。仍按阶梯价优先及原规则判断实际取价。':mode==='follow'?'保存相对报价单标准价的规则。例：标准价5元上浮3%，当前计算为5.15元；标准价以后变6元时，协议规则计算为6.18元。': '只读取一次客户当前价并算成固定价。例：当前4.80元上调3%，保存固定4.94元；以后标准价变化时，此固定值不跟着变化。';
    const valueInfo=row.operation==='set'?'金额按商品销售单位填写，最多两位小数。':row.operation==='delta'?'增加填正数，减少填负数，例如-0.20表示减0.20元。':row.operation==='percent'?'上调填正数，下调填负数，例如3表示上调3%，-3表示下调3%。':'例如1.03表示原价的1.03倍，0.95表示原价的95%。';
    const ops=[['percent','按百分比调整'],['delta','加减金额'],['multiple','乘以倍数']].map(([v,label])=>option(v,label,row.operation)).join('');
    const status=ready?`<div class="batch-retained-status" role="status">已保留 ${ready} 个商品的价格设置${mixed?' · 设置不一致':''}${targets.length>ready?' · '+(targets.length-ready)+' 个待设置':''} ${help('列表保留各商品已填入的结果。相同设置会自动回显；不同设置需明确选择后才能统一修改。打开或取消面板、勾选或取消勾选都不会清除原结果。','已保留设置说明')}</div>`:'';
    target.innerHTML=`<section class="ct-price-panel" aria-label="价格设置"><div class="flex spread"><strong>批量设置价格 · 本次勾选 ${targets.length} 个商品</strong>${help('只修改本次勾选的商品，包含其他页和筛选之外仍勾选的商品。未勾选商品保留已有设置；不同价格可分批勾选后设置。','本次填写范围说明')}</div>${status}<div class="ct-price-fields">${field('定价方式',`<select id="ct-price-mode">${intentOptions(mode)}</select>`)}${!mixed&&mode!=='fixed'?field('怎样调整',`<select id="ct-price-op">${ops}</select>`):''}${mixed?'':field(valueLabel,`<input id="ct-price-value" type="number" step="any" value="${esc(row.value??'')}" placeholder="${row.operation==='percent'?'例如 3 或 -3':row.operation==='multiple'?'例如 1.03':'请输入金额'}">`,valueInfo)}</div>${mixed?'':`<div class="ct-save-kind">将保存：<strong>${mode==='follow'?'随标准价浮动的客户协议':'固定客户协议价'}</strong> ${help(info,'保存方式说明')}${mode!=='fixed'?`<span class="small muted">参考：${mode==='follow'?'报价单标准价':'客户当前价'}</span>`:''}</div>`}${single&&product.is_step_price?`<div class="ct-price-quantity">${field('取价数量',`<input id="ct-price-quantity" type="number" min="0.0001" step="any" value="${esc(row.quantity??'')}" placeholder="${esc(unit)}">`,'仅用来核对当前阶梯价；客户协议不修改阶梯档位，阶梯商品的跳过情况仍需在预览中核对。')}<span id="ct-edit-current">客户当前价：${currentPrice(product,row)}</span></div>`:''}<p id="ct-price-error" class="error" role="alert">${esc(u.priceError||'')}</p><div class="ct-price-actions"><button class="button" data-ct="cancel-price">取消</button><button class="button primary" data-ct="bulk" ${mixed?'disabled':''}>填入本次勾选 ${targets.length} 个商品</button></div></section>`;
    GMHelp.upgrade(target);
  }
  function renderProducts() {
    const target = $('#ct-products'); if (!target || !u) return;
    if (!u.draft.salemenu_id) { target.innerHTML = '<p class="empty">先选择本次调整的报价单</p>'; return; }
    const all=matched(), pages=Math.max(1,Math.ceil(all.length/u.size));u.page=Math.max(1,Math.min(u.page,pages));
    const cats=[...new Set(catalog().map(s=>s.category_name_1))], count=u.draft.items.length, ready=u.draft.items.filter(configured).length, checked=u.selected.size;
    target.innerHTML=`<div class="section-title flex spread"><strong>调价商品 <span class="tag">任务商品 ${count}</span>${count?` <span class="small muted">已设置 ${ready} · 待设置 ${count-ready}</span>`:''}</strong>${help('勾选商品后用“批量设置价格”填写，可分批使用不同价格。取消勾选只改变下次操作范围，保留任务商品及价格；移出任务请用“移除”。核对包含全部任务商品，最多5000项。','商品设置步骤')}</div><div class="toolbar"><input id="ct-query" type="search" maxlength="100" aria-label="搜索调价商品" placeholder="搜索名称、编码或规格" value="${esc(u.query)}"><select id="ct-category" aria-label="筛选商品分类">${option('all','全部分类',u.category)}${cats.map(c=>option(c,c,u.category)).join('')}</select><label class="inline-check"><input id="ct-only" type="checkbox" ${u.only?'checked':''}>只看任务商品</label><select id="ct-size" aria-label="商品每页条数">${[25,50,100].map(n=>option(n,n+'条/页',u.size)).join('')}</select></div><div class="ct-selection"><button class="text-button" data-ct="select-page">勾选本页</button><button class="text-button" data-ct="select-all">勾选全部匹配（${all.length}）</button><button class="text-button" data-ct="clear" ${checked?'':'disabled'}>取消勾选</button><button class="text-button" data-ct="remove-selected" ${checked?'':'disabled'}>移除勾选商品</button><button class="button" data-ct="open-bulk" ${checked?'':'disabled'}>批量设置价格${checked?'（'+checked+'）':''}</button></div><div id="ct-price-editor"></div><div class="table-scroll ct-product-scroll"><table class="data-table ct-products-table"><thead><tr><th>本次勾选 ${help('取消勾选不移除任务商品，也不清除价格；只有点击移除才会移出任务。','勾选与移除说明')}</th><th>商品／规格</th><th>报价单标准价 ${GMHelp.priceTip('报价单标准价')}</th><th>客户当前价 ${GMHelp.priceTip('客户当前价')}</th><th>本次协议设置 ${GMHelp.priceTip('客户协议价')}</th><th>操作</th></tr></thead><tbody>${all.slice((u.page-1)*u.size,u.page*u.size).map(s=>{
      const row=u.draft.items.find(i=>i.sku_id===s.sku_id);
      return `<tr><td><input type="checkbox" data-ct-select="${esc(s.sku_id)}" aria-label="选择${esc(s.sku_name)} ${esc(s.outer_id)}" ${u.selected.has(s.sku_id)?'checked':''}></td><td><strong>${esc(s.sku_name)}</strong><div class="small muted">${esc(s.outer_id)} · ${esc(s.specification_desc)}</div><div class="small muted">${esc(s.sale_unit_name)}</div></td><td>${basePrice(s)}</td><td data-ct-current="${esc(s.sku_id)}">${currentPrice(s,row)}</td><td data-ct-setting="${esc(s.sku_id)}">${settingsSummary(row,s)}</td><td>${row?`<button class="text-button" data-ct-remove="${esc(s.sku_id)}" aria-label="移除${esc(s.sku_name)} ${esc(s.outer_id)}">移除</button>`:'—'}</td></tr>`;
    }).join('')||'<tr><td colspan="6" class="empty">没有匹配商品，请调整搜索或分类</td></tr>'}</tbody></table></div>${pager('products',u.page,pages,all.length)}`;
    renderPriceEditor(); GMHelp.upgrade(target);
  }
  function select(ids) {
    const unique=[...new Set(ids)], fresh=unique.filter(id=>!u.draft.items.some(i=>i.sku_id===id));
    if (u.draft.items.length+fresh.length>5000) {setError('每个任务最多5000个商品，请缩小范围。');return;}
    if (!discardPriceEditor()) return;
    u.draft.items.push(...fresh.map(sku_id=>({sku_id,operation:'set',value:'',base:'quote'})));
    unique.forEach(id=>u.selected.add(id));if(fresh.length)u.preview=null;setError('');renderProducts();
  }
  function removeProducts(ids) {
    const removing=new Set(ids), targets=u.draft.items.filter(i=>removing.has(i.sku_id));if(!targets.length)return;
    const ready=targets.filter(configured).length;
    if(!window.confirm(`从任务草稿移除 ${targets.length} 个商品${ready?'，其中 '+ready+' 个已设置价格':''}？移除后不再参与本次提交。`))return;
    if(!discardPriceEditor())return;
    u.draft.items=u.draft.items.filter(i=>!removing.has(i.sku_id));ids.forEach(id=>u.selected.delete(id));
    u.preview=null;setError('');renderProducts();
  }
  function setError(text) { const target=$('#ct-error');if(target)target.textContent=text||'';else api.toast(text); }
  function bulk() {
    const targets=selectedRows();if(!u.bulkOpen||!targets.length){priceError('请先勾选商品。');return;}
    const draft=priceDraft(),error=valueError(draft);if(error){priceError(error);return;}
    const units=new Set(targets.map(i=>{const s=sku(i.sku_id);return (s?.fee_type||'CNY')+'/'+s?.sale_unit_name;}));
    if(['set','delta'].includes(draft.operation)&&units.size>1){priceError('固定价格或加减金额不能跨销售单位统一填写。请按相同单位分批勾选，或改用百分比。');return;}
    const next={operation:draft.operation,value:Number(draft.value),base:draft.operation==='set'?'quote':draft.base};
    if(targets.length===1&&sku(targets[0].sku_id)?.is_step_price)next.quantity=draft.quantity;
    const replaceCount=targets.filter(i=>configured(i)&&(i.operation!==next.operation||Number(i.value)!==next.value||i.base!==next.base||('quantity' in next&&i.quantity!==next.quantity))).length;
    if(replaceCount&&!window.confirm(`将更新本次勾选 ${targets.length} 个商品，其中 ${replaceCount} 个已有设置将被替换，是否继续？`))return;
    targets.forEach(i=>Object.assign(i,next));u.bulkOpen=false;u.preview=null;u.priceError='';setError('');renderProducts();
  }

  function review() {
    if (!u || api.guard?.() === false) { setError('其他页面已更新数据，请核对内容后重新预览。'); return; }
    if(u.bulkOpen){priceError('请先把本次价格设置填入商品，或点击取消，再核对调价。');$('#ct-price-editor')?.scrollIntoView({block:'nearest'});return;}
    readForm(); u.preview = GMT.preview(db(), u.draft, api.now());
    if (!u.preview.ok) {
      setError((u.preview.errors || ['无法生成预览']).map(e => typeof e === 'string' ? e : e.message || e.error || JSON.stringify(e)).join('；'));
      const conflicts = [...new Set((u.preview.rows || []).flatMap(r => r.conflict_rule_ids || r.conflicting_rule_ids || []))];
      if (conflicts.length) $('#ct-error').insertAdjacentHTML('beforeend', `<div>冲突规则：${ruleLinks(conflicts)}</div>`);
      const invalid = (u.preview.rows || []).filter(r => r.error);
      if (invalid.length) $('#ct-error').insertAdjacentHTML('beforeend', `<div class="ct-error-items"><strong>${invalid.length} 个商品需处理</strong><ul>${invalid.slice(0, 20).map(r => `<li><button class="text-button" data-ct-error-sku="${esc(r.sku_id)}">${esc(r.code || r.sku_id)} · ${esc(r.name || '')}</button>：${esc(r.error)}</li>`).join('')}</ul>${invalid.length > 20 ? `<span class="small">先展示前20个商品；处理后重新核对，其余阻止项不会被忽略。</span>` : ''}</div>`); return;
    }
    u.stage = 'review'; u.reviewPage = 1; u.reviewQuery = ''; u.ack = false;
    api.dialog('核对客户协议调价任务', '<section id="ct-review"></section><p id="ct-error" class="error" role="alert"></p>', '<button class="button" data-ct="back">返回编辑</button><button class="button primary" data-ct="submit">确认提交</button>'); renderReview();
  }
  function setting(row, objectType) {
    if (row.removed) return '移出原规则';
    const unit = { ...row, unit: row.setting_unit || row.unit, currency: row.setting_currency || row.currency };
    if (Number(objectType) === 4 && row.rule_type === 2) return '适用商品金额 × ' + (row.yx_price / 100);
    if (row.rule_type === 0 && row.yx_price != null) return '固定 ' + money(row.yx_price, unit);
    if (row.rule_type === 1 && row.yx_price != null) return '标准价 ' + (row.yx_price >= 0 ? '+ ' : '− ') + money(Math.abs(row.yx_price), unit);
    if (row.rule_type === 2 && row.yx_price != null) return '标准价 × ' + (row.yx_price / 100);
    return `${esc(operations[row.operation] || '原生规则')} ${esc(row.value ?? '')}`;
  }
  function reviewRows() { const term = u.reviewQuery.trim().toLowerCase(); return u.preview.rows.filter(r => !term || [r.sku_id, r.name, r.code, r.spec, sku(r.sku_id)?.sku_name, sku(r.sku_id)?.outer_id].some(v => String(v || '').toLowerCase().includes(term))); }
  function reviewBase(r) { return r.base_price === 0 && sku(r.sku_id)?.is_price_timing ? '待定价（时价）' : money(r.base_price, r); }
  function reviewBefore(r) { return r.current?.requires_quantity ? '填写数量后查看阶梯价' : r.current?.strategy === 'timing' ? '待定价' : money(r.before_price ?? r.customer_price, r); }
  function renderReview() {
    const p = u.preview, all = reviewRows(), pages = Math.max(1, Math.ceil(all.length / 25)); u.reviewPage = Math.max(1, Math.min(u.reviewPage, pages)); const d = p.draft;
    $('#ct-review').innerHTML = `<div class="ct-summary"><strong>${esc(d.name)}</strong><div>${esc(customer(d.customer_id)?.name || d.customer_id)} · ${esc(quote(d.salemenu_id)?.name || d.salemenu_id)}</div><div>${period(d)}</div><div>可提交 ${p.eligible_count} 个 · 跳过 ${p.skipped_count} 个 ${help('以客户当前价计算的一次性结果保存为固定价；基于报价单标准价的浮动规则会随标准价变化。配置后仍遵循阶梯价优先及原生取价规则，已建订单不自动重算。', '提交后行为说明')}</div></div><div class="toolbar"><input id="ct-review-query" type="search" maxlength="100" placeholder="搜索预览商品" aria-label="搜索预览商品" value="${esc(u.reviewQuery)}"></div><div class="table-scroll"><table class="data-table ct-preview-table"><thead><tr><th>商品</th><th>报价单标准价 ${GMHelp.priceTip('报价单标准价')}</th><th>客户当前价 ${GMHelp.priceTip('客户当前价')}</th><th>本次定价方式</th><th>本次协议设置</th><th>处理说明</th></tr></thead><tbody>${all.slice((u.reviewPage - 1) * 25, u.reviewPage * 25).map(r => `<tr><td>${productName(r)}</td><td>${reviewBase(r)}</td><td>${reviewBefore(r)}</td><td>${r.operation==='set'?'直接指定价格':r.base==='customer'?'按客户当前价调整一次':'随报价单标准价浮动'}<div class="small muted">${esc(operations[r.operation] || '—')} ${esc(r.value ?? '')}</div></td><td>${r.skip ? '—' : setting(r)}</td><td>${r.skip ? '<span class="tag amber">跳过</span>' : '<span class="tag">可提交</span>'}<div class="small">${esc(r.warning || r.error || '')}</div>${ruleLinks(r.conflict_rule_ids || [])}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">没有匹配商品</td></tr>'}</tbody></table></div>${pager('review', u.reviewPage, pages, all.length)}${p.skipped_count ? `<label class="shared-ack"><input id="ct-ack" type="checkbox" ${u.ack ? 'checked' : ''}> 我已核对全部 ${p.skipped_count} 个跳过商品，只提交其余 ${p.eligible_count} 个商品</label>` : ''}`;
    GMHelp.upgrade($('#ct-review'));
  }
  function productName(r) { return `<strong>${esc(r.name || r.sku_name || r.sku_id || r.object_name || '规则对象')}</strong><div class="small muted">${esc(r.code || r.outer_id || r.sku_id || '')} · ${esc(r.spec || r.specification_desc || '')}</div><div class="small muted">${esc(r.unit || '—')}</div>`; }
  function submit() {
    if (!u?.preview || api.guard?.() === false) { setError('数据已更新，本预览失效。请返回编辑后重新核对。'); return; }
    const out = GMT.apply(db(), u.preview, !!u.ack, api.now()); if (!out.ok) { setError(out.error || '提交失败，请重新核对。'); return; }
    const id = out.task.id; api.commit(); u = null; api.close(true); api.render(); api.toast('客户协议调价任务已保存（本地演示）'); view(id);
  }
  function view(id) {
    const t = (db().customerTasks || []).find(t => t.id === id); if (!t) { api.toast('任务不存在或已不可访问。'); return; }
    if (u && !canClose()) return; u = null; detail = { task: clone(t), query: '', category: 'all', page: 1, result: 'all' };
    const blocked = taskBlocked(t), advanced = t.kind === 'native_rule_edit' || t.source === '原规则编辑';
    api.dialog('客户协议调价任务详情', `<div class="ct-summary"><strong>${esc(t.name)}</strong><div>${esc(snapshotNames(t))} · ${esc(taskQuote(t))}</div><div>${period(t)}</div><div>${status(t)}</div><div class="small muted">${esc(t.created_at || '—')} · ${esc(t.actor || '—')} · ${esc(t.source || '—')}</div>${t.source_task_id ? `<div>来源任务：<button class="text-button" data-ct-view="${esc(t.source_task_id)}">${esc(t.source_task_id)}</button></div>` : ''}${help('此处展示提交时的不可变快照。再次调整会读取最新价格并新建记录，不覆盖历史任务。配置完成不代表未来成交价，也不改变已创建订单。', '历史任务说明')}</div>${advanced ? `<div class="ct-native-note">原生价格规则编辑记录 ${help('保留共享客户、分类、SPU或整单等原生范围。通过原规则编辑继续操作，不按商品自动拆分。关闭、到期或复杂继承规则仍遵循原有只读限制。', '原生任务范围说明')}<div>关联规则：${ruleLinks(t.rule_ids)}</div></div>` : ''}<div class="toolbar"><input id="ct-detail-query" type="search" maxlength="100" placeholder="搜索商品、编码或处理原因" aria-label="搜索任务商品" value=""><select id="ct-detail-category" aria-label="筛选任务商品分类">${option('all', '全部分类', 'all')}${[...new Set(t.items.map(i => i.category_name_1 || i.category || i.category_name).filter(Boolean))].map(c => option(c, c, '')).join('')}</select><select id="ct-detail-status" aria-label="筛选商品处理状态">${option('all', '全部处理情况', 'all')}${Object.entries(resultLabel).map(([k, v]) => option(k, v, '')).join('')}</select></div><section id="ct-detail-table"></section>`, `<button class="button" data-action="close-dialog">关闭</button>${taskCounts(t).failed ? `<button class="button" data-ct-failed="${esc(t.id)}" ${blocked ? 'disabled' : ''}>复制全部失败项</button>` : ''}<button class="button primary" data-ct-repeat="${esc(t.id)}" ${blocked ? 'disabled' : ''}>${advanced ? '进入原规则调整' : '再次调整'}</button>${blocked ? help(blocked, '任务操作限制') : ''}`);
    renderDetail();
  }
  function renderDetail() {
    if (!detail || !$('#ct-detail-table')) return; const d = detail, query = d.query.trim().toLowerCase();
    const all = d.task.items.filter(r => (!query || [r.name, r.code, r.spec, r.sku_id, r.reason].some(v => String(v || '').toLowerCase().includes(query))) && (d.category === 'all' || (r.category_name_1 || r.category || r.category_name) === d.category) && (d.result === 'all' || r.status === d.result));
    const pages = Math.max(1, Math.ceil(all.length / 25)); d.page = Math.max(1, Math.min(d.page, pages));
    $('#ct-detail-table').innerHTML = `<div class="table-scroll"><table class="data-table ct-detail-table"><thead><tr><th>商品／规则对象</th><th>调整前客户价</th><th>调整方式</th><th>设置值</th><th>处理情况</th><th>详情</th></tr></thead><tbody>${all.slice((d.page - 1) * 25, d.page * 25).map(r => `<tr><td>${productName(r)}</td><td>${money(r.before_price, r)}</td><td>${esc(operations[r.operation] || r.operation_label || '原生规则')}</td><td>${r.status === 'skipped' ? '—' : setting(r, d.task.origin_rule_type)}</td><td><span class="tag ${r.status === 'failed' || r.status === 'skipped' ? 'amber' : ''}">${esc(resultLabel[r.status] || r.status)}</span><div class="small">${esc(r.reason || '')}</div></td><td><details><summary>展开</summary><div class="ct-inline-details">当时标准价：${money(r.base_price, r)}<br>计算依据：${r.base === 'customer' ? '调整时客户价' : r.base === 'quote' ? '报价单标准价' : '原生规则'}<br>关联规则：${ruleLinks(r.rule_ids) || '—'}${r.quantity != null ? '<br>计算数量：' + esc(r.quantity) : ''}</div></details></td></tr>`).join('') || '<tr><td colspan="6" class="empty">没有匹配商品，请调整筛选条件</td></tr>'}</tbody></table></div>${pager('detail', d.page, pages, all.length)}`;
  }
  function repeat(id, failedOnly = false) {
    const t = (db().customerTasks || []).find(t => t.id === id); if (!t) return;
    const blocked = taskBlocked(t); if (blocked) { api.toast(blocked); return; }
    if (t.kind === 'native_rule_edit' && t.rule_ids?.length === 1 && !failedOnly) { if (u && !canClose()) return; u = null; api.ruleEdit?.(t.rule_ids[0], t.id); return; }
    const out = GMT.draftFromTask(db(), id, failedOnly);
    if (!out.ok || !out.draft) {
      if (t.kind === 'native_rule_edit' && t.rule_ids?.length === 1 && !failedOnly) { u = null; api.ruleEdit?.(t.rule_ids[0], t.id); return; }
      api.toast((out.errors || ['请通过关联原规则继续调整。']).join('；')); return;
    }
    openNew(out.draft); if (out.notification) api.toast(out.notification);
  }
  function preserveSearch(fn, id, value) { const start = document.getElementById(id)?.selectionStart; fn(); const el = document.getElementById(id); if (el) { el.focus(); if (el.type === 'search') el.setSelectionRange(start ?? value.length, start ?? value.length); } }
  document.addEventListener('submit', e => { if (e.target.id === 'ct-editor-form') { e.preventDefault(); review(); } });
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'ct-list-query') { listing.query = el.value; listing.page = 1; preserveSearch(() => api.render(), el.id, el.value); }
    if (el.id === 'ct-query' && u) { u.query = el.value; u.page = 1; preserveSearch(renderProducts, el.id, el.value); }
    if (el.id === 'ct-review-query' && u) { u.reviewQuery = el.value; u.reviewPage = 1; preserveSearch(renderReview, el.id, el.value); }
    if (el.id === 'ct-detail-query' && detail) { detail.query = el.value; detail.page = 1; renderDetail(); }
    if (el.id === 'ct-price-value' && u) { updatePriceDraft({value:el.value});priceError(''); }
    if (el.id === 'ct-price-quantity' && u?.bulkOpen) { updatePriceDraft({quantity:el.value===''?null:Number(el.value)});const selected=selectedRows(),target=$('#ct-edit-current');if(target&&selected.length===1)target.innerHTML='客户当前价：'+currentPrice(sku(selected[0].sku_id),priceDraft());priceError(''); }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    const filters = { 'ct-list-customer': 'customer', 'ct-list-quote': 'quote', 'ct-list-status': 'status' };
    if (filters[el.id]) { listing[filters[el.id]] = el.value; listing.page = 1; api.render(); }
    if (el.id === 'ct-detail-category' && detail) { detail.category = el.value; detail.page = 1; renderDetail(); }
    if (el.id === 'ct-detail-status' && detail) { detail.result = el.value; detail.page = 1; renderDetail(); }
    if (!u) return;
    if (el.id === 'ct-customer' || el.id === 'ct-quote') {
      const oldCustomer = u.draft.customer_id, oldQuote = u.draft.salemenu_id; readForm();
      if (u.draft.items.length && !window.confirm('切换客户或报价单会清空任务商品及价格设置，确定继续？')) { el.value = el.id === 'ct-customer' ? oldCustomer : oldQuote; return; }
      if (el.id === 'ct-customer') { u.draft.customer_id = el.value; const linked = GME.linkedQuotes(db(), el.value); u.draft.salemenu_id = linked.length === 1 ? linked[0].id : ''; } else u.draft.salemenu_id = el.value;
      u.draft.items = []; u.selected.clear(); u.query = ''; u.category = 'all'; u.only = false; u.page = 1; u.preview = null; u.bulkOpen=false;u.priceError='';editor();
    }
    if (el.id === 'ct-category') { u.category = el.value; u.page = 1; renderProducts(); }
    if (el.id === 'ct-only') { u.only = el.checked; u.page = 1; renderProducts(); }
    if (el.id === 'ct-size') { u.size = Number(el.value); u.page = 1; renderProducts(); }
    if (el.id === 'ct-price-mode') { updatePriceDraft({operation:el.value==='fixed'?'set':'percent',base:el.value==='current'?'customer':'quote',value:''});u.priceError='';renderPriceEditor(); }
    if (el.id === 'ct-price-op') { updatePriceDraft({operation:el.value,value:''});u.priceError='';renderPriceEditor(); }
    if (el.id === 'ct-ack') u.ack = el.checked;
    if (el.dataset.ctSelect) { const id=el.dataset.ctSelect;if(el.checked){select([id]);el.checked=u.selected.has(id);}else if(discardPriceEditor()){u.selected.delete(id);renderProducts();}else el.checked=true; }
  });
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-ct],[data-ct-view],[data-ct-repeat],[data-ct-failed],[data-ct-rule],[data-ct-page],[data-ct-error-sku],[data-ct-remove]'); if (!el || el.disabled) return;
    if(el.dataset.ctRemove&&u)return removeProducts([el.dataset.ctRemove]);
    if (el.dataset.ctErrorSku && u) { if(!discardPriceEditor())return;readForm();u.query=el.dataset.ctErrorSku;u.category='all';u.only=false;u.page=1;u.selected=new Set([el.dataset.ctErrorSku]);renderProducts();openPriceEditor();return; }
    if (el.dataset.ctView) return view(el.dataset.ctView);
    if (el.dataset.ctRepeat) return repeat(el.dataset.ctRepeat);
    if (el.dataset.ctFailed) return repeat(el.dataset.ctFailed, true);
    if (el.dataset.ctRule) { if (u) { readForm(); u.stage = 'rule-detail'; api.ruleDetail?.(el.dataset.ctRule, '', true); } else api.ruleDetail?.(el.dataset.ctRule, detail?.task?.id); return; }
    if (el.dataset.ctPage) { const n = Number(el.dataset.number), type = el.dataset.ctPage; if (type === 'list') { listing.page = n; api.render(); } else if (type === 'products' && u) { u.page = n; renderProducts(); } else if (type === 'review' && u) { u.reviewPage = n; renderReview(); } else if (type === 'detail' && detail) { detail.page = n; renderDetail(); } return; }
    const action = el.dataset.ct;
    if (action === 'rules') return api.openRules(); if (action === 'new') return openNew();
    if (!u) return;
    if (action === 'select-page') select(matched().slice((u.page - 1) * u.size, u.page * u.size).map(s => s.sku_id));
    if (action === 'select-all') select(matched().map(s => s.sku_id));
    if (action === 'clear' && discardPriceEditor()) { u.selected.clear();renderProducts(); }
    if(action==='remove-selected')removeProducts([...u.selected]);
    if(action==='open-bulk')openPriceEditor();
    if(action==='cancel-price'){u.bulkOpen=false;u.priceError='';renderProducts();}
    if (action === 'bulk') bulk(); if (action === 'back') editor(); if (action === 'submit') submit();
  });
  window.GCT = { connect: value => { api = value; }, list, openNew, view, repeat, canClose, hasUnsavedChanges, get state() { return u; }, get listState() { return listing; } };
})();


