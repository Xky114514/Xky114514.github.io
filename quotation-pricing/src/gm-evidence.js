(function () {
  'use strict';
  // Present only fields with an identified Guanmai source. Demo stores are adapters,
  // not invented endpoint responses; money conversions are explicit per collection.
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const present = v => v !== null && v !== undefined && v !== '';
  const show = v => present(v) ? esc(v) : '—';
  const num = v => present(v) && Number.isFinite(Number(v)) ? Number(v).toLocaleString('zh-CN', {maximumFractionDigits: 4}) : '—';
  const money = (v, divisor, currency) => present(v) && Number.isFinite(Number(v)) ? (Number(v) / divisor).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 4}) + ' ' + esc(currency || 'CNY') : '—';
  const fen = (v, currency) => money(v, 100, currency);
  const yuan = (v, currency) => money(v, 1, currency);
  const arr = v => Array.isArray(v) ? v : [];
  const skuId = s => String(s.sku_id || s.id || '');
  const ruleId = r => String(r.id || r.rule_id || r.price_rule_id || '');
  const objectType = r => Number(r.rule_object_type ?? r.object_type);
  const quote = (db, id) => arr(db.salemenus).find(q => String(q.id) === String(id));
  const sku = (db, id) => arr(db.skus).find(s => skuId(s) === String(id));
  const customer = (db, id) => arr(db.customers).find(c => String(c.address_id) === String(id));
  const qCurrency = (db, s) => s.fee_type || quote(db, s.salemenu_id)?.fee_type || 'CNY';
  const currencyUnit = (db, s, basic) => `${esc(qCurrency(db, s))} / ${show(basic ? s.std_unit_name_forsale : s.sale_unit_name)}`;
  const unitPrice = (v, db, s, basic) => present(v) ? `${fen(v, qCurrency(db, s))} / ${show(basic ? s.std_unit_name_forsale : s.sale_unit_name)}` : '—';
  const field = (label, html) => `<label class="field"><span>${esc(label)}</span>${html}</label>`;
  const option = (value, label, selected) => `<option value="${esc(value)}"${String(value) === String(selected) ? ' selected' : ''}>${esc(label)}</option>`;
  const tag = (label, klass = '') => `<span class="tag ${esc(klass)}">${esc(label)}</span>`;
  const btn = (label, key, value, extra = '') => `<button type="button" class="btn slim" data-gm-${esc(key)}="${esc(value)}" ${extra}>${esc(label)}</button>`;
  const table = (head, rows, empty = '当前条件下没有记录') => `<div class="table-scroll"><table class="data-table"><thead><tr>${head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${head.length}" class="empty">${esc(empty)}</td></tr>`}</tbody></table></div>`;
  const kv = rows => table(['项目', '内容'], rows.map(([key, value]) => [esc(key), value])).replace('class="data-table"', 'class="detail-table"');
  const lower = v => String(v || '').toLocaleLowerCase();
  function match(s, query) { return !query || [s.sku_name, s.name, s.outer_id, s.specification_desc, skuId(s), s.spu_id].some(v => lower(v).includes(lower(query).trim())); }
  function inCategory(s, group) { return !group || group === 'all' || s.category_name_1 === group || s.category_name_2 === group; }
  function quoteSkus(db, ctx) { return arr(db.skus).filter(s => String(s.salemenu_id) === String(ctx.quoteId) && Number(s.state) !== 1); }
  function products(db, ctx, ui) { return quoteSkus(db, ctx).filter(s => match(s, ui.query) && inCategory(s, ui.category)); }
  function productName(s) { return `<strong>${show(s.sku_name)}</strong><div class="muted small">${show(s.outer_id)} · ${show(s.specification_desc)}</div>`; }
  function pageRows(rows, ui) { const size = [10, 25, 50, 100].includes(Number(ui.size)) ? Number(ui.size) : 25; const pages = Math.max(1, Math.ceil(rows.length / size)); const page = Math.min(Math.max(1, Number(ui.page) || 1), pages); return {rows: rows.slice((page - 1) * size, page * size), count: rows.length, size, pages, page}; }
  function pager(p) { return `<div class="toolbar pagination"><span class="muted">共 ${p.count} 条 · 第 ${p.page} / ${p.pages} 页</span><div class="toolbar">${field('每页', `<select data-gm-size aria-label="每页记录数">${[25, 50, 100].map(n => option(n, n + ' 条', p.size)).join('')}</select>`)}${btn('上一页', 'page', p.page - 1, p.page === 1 ? 'disabled' : '')}${btn('下一页', 'page', p.page + 1, p.page === p.pages ? 'disabled' : '')}</div></div>`; }
  function searchTools(db, ctx, ui, placeholder = '搜索商品名称、编码或规格') { const cats = [...new Set(quoteSkus(db, ctx).map(s => s.category_name_1).filter(Boolean))]; return `${field('搜索', `<input type="search" data-gm-filter="query" value="${esc(ui.query || '')}" placeholder="${esc(placeholder)}" autocomplete="off">`)}${field('分类', `<select data-gm-filter="category">${option('all', '全部分类', ui.category || 'all')}${cats.map(c => option(c, c, ui.category)).join('')}</select>`)}`; }
  function dateControls(ui) { return `${field('开始日期', `<input type="date" data-gm-filter="from" value="${esc(ui.from || '')}">`)}${field('结束日期', `<input type="date" data-gm-filter="to" value="${esc(ui.to || '')}">`)}`; }
  function dateValue(v) { if (!present(v)) return null; if (typeof v === 'number') return v; const val = String(v).replace(' ', 'T'); const n = Date.parse(val.length === 10 ? val + 'T00:00:00+08:00' : /Z$|[+-]\d\d:\d\d$/.test(val) ? val : val + '+08:00'); return Number.isFinite(n) ? n : null; }
  function dateText(v) { if (!present(v)) return '—'; if (typeof v === 'number') { return esc(new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Shanghai', year: 'numeric', month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v))); } return esc(String(v).replace('T', ' ').replace(/(?:\.\d+)?(?:Z|\+08:00)$/, '').slice(0, 19)); }
  function rangeValid(ui) { return !ui.from || !ui.to || ui.from <= ui.to; }
  function overlaps(start, end, ui) { if (!rangeValid(ui)) return false; const lo = dateValue(ui.from); const hi = dateValue(ui.to); const a = dateValue(start); const b = dateValue(end); return (hi === null || a === null || a < hi + 86400000) && (lo === null || b === null || b >= lo); }
  function timeConfigs(db, c) { return arr(db.salemenus).map(q => q.time_config).filter((t, i, all) => t && (!c || !arr(c.time_config_ids).length || arr(c.time_config_ids).includes(t.id)) && all.findIndex(x => x && x.id === t.id) === i); }
  function timeConfigSelect(db, c, ui) { const configs = timeConfigs(db, c); const active = configs.some(t => t.id === ui.timeConfigId) ? ui.timeConfigId : configs[0]?.id; return field('运营时间', `<select data-gm-filter="timeConfigId">${configs.length ? configs.map(t => option(t.id, t.name, active)).join('') : option('', '—', '')}</select>`); }
  function cost(db, ctx, ui) {
    const p = pageRows(products(db, ctx, ui), ui);
    return `<div class="toolbar">${searchTools(db, ctx, ui)}</div><p class="muted section-note">采购参考按商品基本销售单位展示；“供应商最近采购价”与“最近采购价”分别保留原来源口径。</p>${table(['商品 / 规格', '最近采购价', '供应商最近采购价', '商品设定损耗率', '销售单位 / 基本单位', '操作'], p.rows.map(s => [productName(s), unitPrice(s.latest_purchase_price, db, s, true), unitPrice(s.last_purchase_price, db, s, true), present(s.attrition_rate) ? `${num(s.attrition_rate)}%` : '—', `${show(s.sale_unit_name)} / ${show(s.std_unit_name_forsale)}`, btn('查看商品', 'sku-detail', skuId(s)) + ' ' + btn('选入调价', 'select-sku', skuId(s))]))}${pager(p)}`;
  }
  function history(db, ctx, ui) {
    const map = new Map(products(db, ctx, ui).map(s => [skuId(s), s]));
    const records = arr(db.snapshots).filter(r => map.has(String(r.sku_id)) && overlaps(r.modify_time, r.next_modify_time, ui)).sort((a,b) => (dateValue(b.modify_time) || 0) - (dateValue(a.modify_time) || 0));
    const p = pageRows(records, ui);
    return `<div class="toolbar">${searchTools(db, ctx, ui)}${dateControls(ui)}</div><p class="muted section-note">报价单 SKU 的价格变更记录，按适用时间段与查询日期重叠筛选。未发生变更的日期不补造记录。</p>${!rangeValid(ui) ? '<p class="error">结束日期不能早于开始日期。</p>' : ''}${table(['商品 / 规格', '报价单当前基础价', '记录销售价', '记录基本单价', '适用开始日期', '适用结束日期', '操作'], p.rows.map(r => { const s = map.get(String(r.sku_id)); return [productName(s), s.is_price_timing ? '待定价' : unitPrice(s.sale_price, db, s, false), r.is_price_timing ? '待定价' : `${fen(r.sale_price, r.fee_type || qCurrency(db, s))} / ${show(r.sale_unit_name)}`, r.is_price_timing ? '待定价' : `${fen(r.std_sale_price_forsale, r.fee_type || qCurrency(db, s))} / ${show(r.std_unit_name_forsale)}`, dateText(r.modify_time).slice(0, 10), dateText(r.next_modify_time).slice(0, 10), btn('查看商品', 'sku-detail', skuId(s))]; }))}${pager(p)}`;
  }
  function market(db, ctx, ui) {
    const map = new Map(products(db, ctx, ui).map(s => [skuId(s), s]));
    const records = arr(db.market).filter(r => map.has(String(r.sku_id))).flatMap(r => arr(r.matched_products).map(m => ({...m, gmSku: map.get(String(r.sku_id)), isDefault: String(m.product_id) === String(r.default_product_id)})));
    const p = pageRows(records, ui);
    return `<div class="toolbar">${searchTools(db, ctx, ui)}</div><p class="muted section-note">最新可用行情 · 保留来源平台商品、单位及数据日期；平台关联不代表规格或价格口径完全可比。</p>${table(['关联商品', '平台 / 市场', '平台商品 / 规格', '平均价', '最高价', '最低价', '平台单位', '数据日期'], p.rows.map(r => [productName(r.gmSku), `${show(r.source_platform_name)}${r.market_name ? `<div class="muted small">${esc(r.market_name)}</div>` : ''}`, `<strong>${show(r.sku_name)}</strong><div class="muted small">${show(r.standard)}</div>${r.isDefault ? tag('默认关联') : ''}`, yuan(r.market_price_avg, 'CNY'), yuan(r.market_price_max, 'CNY'), yuan(r.market_price_min, 'CNY'), show(r.unit_name), dateText(r.record_date)]), '当前商品没有提供行情记录')}${pager(p)}`;
  }
  function settlement(a) {
    if (!a) return [['结算配置', '—']];
    const pm = Number(a.pay_method), names = {1:'日结', 2:'周结', 3:'月结', 4:'自定义', 5:'半月结'};
    const rows = [['结算方式', names[pm] ? esc(names[pm]) : show(a.pay_method)], ['收付款方式', ({1:'先货后款', 2:'先款后货'})[a.settle_way] || '—'], ['结算日期口径', ({1:'按下单日期', 2:'按收货日期'})[a.settle_date_type] || '—']];
    if (pm === 2) { const week = n => present(n) ? '周' + (['', '一', '二', '三', '四', '五', '六', '日'][Number(n)] || esc(n)) : '—'; rows.push(['账期起始日', week(a.begin_day)], ['结算日', week(a.settle_day)]); }
    if (pm === 3 || pm === 5) { rows.push(['账期起始日', present(a.begin_day) ? `每月 ${num(a.begin_day)} 日` : '—'], ['结算日', present(a.settle_day) ? `每月 ${num(a.settle_day)} 日` : '—']); }
    if (pm === 4) rows.push(['自定义周期长度', present(a.cycle_length) ? `${num(a.cycle_length)} 天` : '—'], ['周期后延天数', present(a.delay_day) ? `${num(a.delay_day)} 天` : '—'], ['配置生效日期', dateText(a.effective_date)]);
    return rows;
  }
  function analysisRange(db, ui) { const end = ui.to || db.fixtureDate || '2026-09-30'; const endStamp = Date.parse(end + 'T12:00:00Z'); const begin = ui.from || new Date(endStamp - 29 * 86400000).toISOString().slice(0, 10); return {from: begin, to: end}; }
  function customerView(db, ctx, ui) {
    const c = customer(db, ctx.customerId); if (!c) return '<p class="empty">请选择客户。</p>';
    const a = arr(db.accounts).find(x => String(x.user_id) === String(c.user_id));
    const cfgs = timeConfigs(db, c), timeConfigId = cfgs.some(t => t.id === ui.timeConfigId) ? ui.timeConfigId : cfgs[0]?.id;
    const dates = analysisRange(db, ui); const queryUi = {...ui, ...dates}; const timeField = ui.timeField || 'order_time';
    const snapshot = rangeValid(queryUi) ? arr(db.customerAnalysis).find(r => String(r.address_id) === String(c.address_id) && r.time_field === timeField && String(r.begin).slice(0,10) === dates.from && String(r.end).slice(0,10) === dates.to && (!r.time_config_id || String(r.time_config_id) === String(timeConfigId))) : null;
    const orders = arr(db.recentOrders).filter(r => String(r.address_id) === String(c.address_id) && String(r.time_config_id) === String(timeConfigId)).slice().sort((a,b) => (dateValue(b.date_time_str)||0)-(dateValue(a.date_time_str)||0)).slice(0,50);
    const p = pageRows(orders, ui);
    return `<h3>客户档案与结算</h3>${kv([['客户名称', show(c.name)], ['客户编码', show(c.customized_code)], ['门店 / 收货地址标识', show(c.address_id)], ['所属客户账号', show(c.user_id)], ['联系人', show(c.contact)], ['联系电话', show(c.phone)], ['收货地址', show(c.address)], ['运营时间', cfgs.length ? cfgs.map(t => show(t.name)).join('、') : '—'], ...settlement(a)])}<h3 class="section-title">客户购买分析</h3><div class="toolbar">${dateControls(queryUi)}${field('统计日期', `<select data-gm-filter="timeField">${option('order_time', '下单日期', timeField)}${option('receive_begin_time', '收货日期', timeField)}</select>`)}</div><p class="muted section-note">按客户完整业务范围展示已有购买分析结果，包含其不同报价单；演示仅提供预设查询区间快照。</p>${!rangeValid(queryUi) ? '<p class="error">结束日期不能早于开始日期。</p>' : ''}${snapshot ? table(['订单数', '销售额', '下单额'], [[num(snapshot.kv?.old_order_id), yuan(snapshot.kv?.account_price, snapshot.fee_type || 'CNY'), yuan(snapshot.kv?.order_price, snapshot.fee_type || 'CNY')]]) : '<p class="empty">当前日期或统计口径未提供演示快照。订单数、销售额和下单额不根据下方最近订单另行推算。</p>'}<h3 class="section-title">最近订单</h3><div class="toolbar">${timeConfigSelect(db, c, ui)}<span class="muted">近 90 天内最近 50 单 · 按下单时间倒序</span></div>${table(['订单编号', '下单时间', '下单金额', '出库金额', '商品明细数'], p.rows.map(r => [show(r.id), dateText(r.date_time_str), yuan(r.origin_total_price, r.fee_type || 'CNY'), yuan(r.sale_outstock_price, r.fee_type || 'CNY'), num(r.merchandise_count)]))}${pager(p)}`;
  }
  const objectNames = {1:'SKU',2:'二级分类',3:'上浮率',4:'整单折扣'};
  const ruleStatuses = {0:'关闭',1:'无效',2:'未开始',3:'有效'};
  function addresses(r) { return arr(r.address_ids || r.addresses).map(a => typeof a === 'object' ? String(a.address_id || a.id) : String(a)); }
  function ruleCustomers(db, r) { const list = addresses(r); return list.length ? list.map(id => customer(db, id)?.name || id).map(esc).join('、') : '—'; }
  function ruleMembers(r) { return arr(r.skus).map(m => ({...m, sku_id: m.sku_id || m.id})); }
  function ruleScope(db, r) { const type = objectType(r); if (type === 1) { const members = ruleMembers(r); const names = members.slice(0,2).map(m => sku(db,m.sku_id)?.sku_name || m.sku_id); return names.length ? names.map(esc).join('、') + (members.length > 2 ? ` 等 ${members.length} 个 SKU` : '') : '—'; } if (type === 2) return arr(r.category_2_list).map(x => show(x.category_2_name || x.category_2_id)).join('、') || '—'; if (type === 3) return arr(r.spus).length ? `${arr(r.spus).length} 个商品（SPU）` : '—'; return type === 4 ? '适用客户整单' : '—'; }
  function rulePeriod(r) { return `${dateText(r.begin || r.start_date || r.begin_date)} 至 ${dateText(r.end || r.end_date)}`; }
  function dailyWindow(r) { const from = r.start_time_of_day || r.begin_time || r.begin_hm || r.start_hm || '00:00'; const to = r.end_time_of_day || r.end_time || r.end_hm || '23:59'; return `${show(from)}–${show(to)}${Number(r.time_limit) === 1 ? '（跨午夜）' : ''}`; }
  function calcText(db, r, m) { const rt = Number(m.rule_type ?? r.rule_type); const v = m.yx_price ?? r.yx_price; const basis = Number(r.locking_price_unit) === 1 ? '报价单基本单价' : ({2:'创价网行情价',3:'新发地平均价',4:'新发地最高价',5:'新发地最低价'})[r.price_type] || '报价单销售价'; if (!present(v)) return '—'; if (rt === 2) return `${basis} × ${num(Number(v) / 100)}`; const s = sku(db,m.sku_id || m.id); const cur = s ? qCurrency(db,s) : 'CNY'; const unit = s ? (Number(r.locking_price_unit) === 1 ? s.std_unit_name_forsale : s.sale_unit_name) : null; return rt === 0 ? `固定价 ${fen(v,cur)}${unit ? ' / '+esc(unit) : ''}` : rt === 1 ? `${basis} ${Number(v) >= 0 ? '+' : '−'} ${fen(Math.abs(Number(v)),cur)}${unit ? ' / '+esc(unit) : ''}` : '—'; }
  function ruleCalculation(db, r) { if (objectType(r) === 4) return present(r.change_rate) ? `整单金额 × ${num(Number(r.change_rate) / 100)}` : '—'; const members = objectType(r) === 1 ? ruleMembers(r) : objectType(r) === 2 ? arr(r.category_2_list) : arr(r.spus); const result = [...new Set(members.map(m => calcText(db,r,m)))]; return result.length === 1 ? result[0] : result.length ? '按商品分别设置' : '—'; }
  function ruleQuoteRelevant(db, r, ctx) { if (!ctx.quoteId) return true; if (r.salemenu_id) return String(r.salemenu_id) === String(ctx.quoteId); if (objectType(r) !== 1) return true; const allowed = new Set(quoteSkus(db,ctx).map(skuId)); return ruleMembers(r).some(m => allowed.has(String(m.sku_id))); }
  function ruleEditable(r) { return objectType(r) === 1 && addresses(r).length === 1 && [2, 3].includes(Number(r.status)); }
  function protocolRows(db, ctx, ui, evidenceMode) {
    return arr(db.rules).filter(r => (!evidenceMode && ui.ruleFilter !== 'current' || addresses(r).includes(String(ctx.customerId))) && (!evidenceMode || ruleQuoteRelevant(db,r,ctx)) && (!ui.query || lower([r.name,r.rule_name,ruleId(r),addresses(r).map(id=>customer(db,id)?.name || id).join(' ')].join(' ')).includes(lower(ui.query).trim())));
  }
  function protocol(db, ctx, ui, evidenceMode) {
    const p = pageRows(protocolRows(db,ctx,ui,evidenceMode),ui);
    return `<div class="toolbar">${field('搜索规则', `<input type="search" data-gm-filter="query" value="${esc(ui.query || '')}" placeholder="规则名称、编号或客户">`)}${!evidenceMode ? field('查看范围', `<select data-gm-filter="ruleFilter">${option('all','全部客户',ui.ruleFilter || 'all')}${option('current','当前客户',ui.ruleFilter || 'all')}</select>`) : ''}</div><p class="muted section-note">系统已配置的价格规则。状态按原记录展示；有效规则仍需满足客户、商品、日期和每日时段。</p>${table(['规则名称', '适用客户', '对象 / 商品范围', '计算方式', '有效日期', '每日时段', '状态', '操作'], p.rows.map(r => [`<strong>${show(r.name || r.rule_name)}</strong><div class="muted small">${esc(ruleId(r))}</div>`, ruleCustomers(db,r) + (addresses(r).length > 1 ? `<div>${tag('多个客户共用')}</div>` : ''), `${tag(objectNames[objectType(r)] || '—')}<div class="small">${ruleScope(db,r)}</div>`, ruleCalculation(db,r), rulePeriod(r), dailyWindow(r), tag(ruleStatuses[r.status] || '—', Number(r.status) === 3 ? 'green' : ''), btn('详情','rule-detail',ruleId(r)) + (ruleEditable(r) ? ' ' + btn('调整预览','rule-edit',ruleId(r)) : '')]))}${pager(p)}`;
  }
  function jobs(db, ctx, ui) {
    const records = arr(db.jobs).filter(j => (ui.ruleFilter !== 'current' || String(j.salemenu_id) === String(ctx.quoteId)) && (!ui.query || lower([j.rule_name,j.rule_id,quote(db,j.salemenu_id)?.name].join(' ')).includes(lower(ui.query).trim())));
    const p = pageRows(records,ui); const result = j => { if (!present(j.task_result)) return '—'; if (typeof j.task_result === 'object') { const r = j.task_result; if (r.message || r.msg) return show(r.message || r.msg); return `<code>${esc(JSON.stringify(r))}</code>`; } return show(j.task_result); };
    return `<div class="toolbar">${field('搜索任务', `<input type="search" data-gm-filter="query" value="${esc(ui.query || '')}" placeholder="任务名称、编号或报价单">`)}${field('查看范围', `<select data-gm-filter="ruleFilter">${option('all','全部报价单',ui.ruleFilter || 'all')}${option('current','当前报价单',ui.ruleFilter || 'all')}</select>`)}</div><p class="muted section-note">按任务原始状态及执行结果展示。仅“未开始”任务可编辑名称与执行时间。</p>${table(['任务名称', '报价单', '执行时间', '原生状态', '执行结果', '操作'],p.rows.map(j=>[`<strong>${show(j.rule_name)}</strong><div class="muted small">${show(j.rule_id)}</div>`, show(quote(db,j.salemenu_id)?.name || j.salemenu_name), dateText(j.effective_time), tag(({0:'未开始',1:'已生效',2:'已结束'})[j.rule_status] || '—'), `${result(j)}${Number(j.abnormal_status) === 1 ? `<div>${tag('有异常','amber')}</div>` : ''}`, Number(j.rule_status) === 0 ? btn('编辑任务','job-edit',j.rule_id) : '—']))}${pager(p)}`;
  }
  function evidence(db, ctx, ui) {
    const tabs = [['cost','采购参考'],['history','报价记录'],['market','市场行情'],['customer','客户资料'],['rules','价格规则']]; const active = tabs.some(t=>t[0] === ui.tab) ? ui.tab : 'cost';
    const head = `<div class="section-head"><h2>客户与依据</h2><span class="muted">${show(customer(db,ctx.customerId)?.name)}${ctx.quoteId ? ' · ' + show(quote(db,ctx.quoteId)?.name) : ''}</span></div><div class="tabs" role="tablist" aria-label="资料类型">${tabs.map(([id,label])=>`<button type="button" role="tab" aria-selected="${id===active}" data-gm-evidence-tab="${id}">${label}</button>`).join('')}</div>`;
    if (active !== 'customer' && !ctx.quoteId) return head + '<p class="empty">请先从左侧明确选择一张报价单，再查看该报价单的商品资料。</p>';
    return head + ({cost,history,market,customer:customerView,rules:(d,c,u)=>protocol(d,c,u,true)})[active](db,ctx,ui);
  }
  function rules(db, ctx, ui) { const isJobs = ui.ruleTab === 'jobs'; return `<div class="section-head"><h2>规则与调价</h2></div><div class="tabs" role="tablist" aria-label="规则类型"><button type="button" role="tab" aria-selected="${!isJobs}" data-gm-rule-tab="protocol">客户协议价</button><button type="button" role="tab" aria-selected="${isJobs}" data-gm-rule-tab="jobs">报价单周期调价</button></div>${isJobs ? jobs(db,ctx,ui) : protocol(db,ctx,ui,false)}`; }
  function detail(db, ctx, id) {
    const s = sku(db,id); if (!s || String(s.salemenu_id) !== String(ctx.quoteId)) return '<p class="empty">当前报价单中没有此 SKU。</p>';
    const resolved = window.GME?.resolve ? window.GME.resolve(db,ctx.customerId,skuId(s),null,{now:db.fixtureDate + 'T10:00'}) : null;
    const rows = [['商品', show(s.sku_name)], ['SKU 标识', show(skuId(s))], ['商品编码',show(s.outer_id)], ['规格', show(s.specification_desc)], ['所属报价单',show(quote(db,s.salemenu_id)?.name)], ['销售单位',show(s.sale_unit_name)], ['基本销售单位',show(s.std_unit_name_forsale)], ['商品基本单位',show(s.std_unit_name)], ['币种',show(qCurrency(db,s))], ['报价单基础价',s.is_price_timing ? '待定价' : unitPrice(s.sale_price,db,s,false)], ['基本单价',s.is_price_timing ? '待定价' : unitPrice(s.std_sale_price_forsale,db,s,true)]];
    if (resolved) rows.push(['客户当前适用价', resolved.requires_quantity ? '需输入采购数量确定阶梯档位' : present(resolved.settle_price) ? unitPrice(resolved.settle_price,db,s,false) : show(resolved.reason || '待定价')]);
    rows.push(['最近采购价',unitPrice(s.latest_purchase_price,db,s,true)], ['供应商最近采购价',unitPrice(s.last_purchase_price,db,s,true)], ['商品设定损耗率',present(s.attrition_rate) ? num(s.attrition_rate)+'%' : '—'], ['系统建议价范围', `${unitPrice(s.suggest_price_min,db,s,true)} 至 ${unitPrice(s.suggest_price_max,db,s,true)}`]);
    const steps = arr(s.step_price_table); return `<h3>${show(s.sku_name)}</h3>${kv(rows)}${s.is_step_price ? `<h3 class="section-title">阶梯价格档</h3><p class="muted">数量与价格均按系统档位口径，需提供采购数量才可确定当前适用价。</p>${table(['数量档', '价格'], steps.map(t => [`${num(t.min)} ${show(s.sale_unit_name)} ≤ 数量${present(t.max) ? ' < ' + num(t.max) + ' ' + show(s.sale_unit_name) : ''}`, unitPrice(t.step_sale_price,db,s,false)]))}` : ''}`;
  }
  function ruleDetail(db, ctx, id) { const r = arr(db.rules).find(r=>ruleId(r)===String(id)); if (!r) return '<p class="empty">没有找到该价格规则。</p>'; const members=ruleMembers(r); const rows=[['名称',show(r.name || r.rule_name)],['规则编号',show(ruleId(r))],['适用客户',ruleCustomers(db,r)],['规则对象',show(objectNames[objectType(r)])],['商品范围',ruleScope(db,r)],['有效日期',rulePeriod(r)],['每日时段',dailyWindow(r)],['原生状态',show(ruleStatuses[r.status])],['计价单位',Number(r.locking_price_unit)===1?'基本单价':'销售单价']];return `${kv(rows)}${addresses(r).length>1?'<p class="section-note">此规则同时服务多个客户。此处保留完整范围，不提供“仅修改当前客户”的应用操作。</p>':''}${objectType(r)===1?table(['SKU','商品 / 规格','计算方式'],members.map(m=>{const s=sku(db,m.sku_id);return[show(m.sku_id),s?productName(s):'—',calcText(db,r,m)];})):kv([['计算方式',ruleCalculation(db,r)]])}`; }
  window.GMV = {evidence,rules,detail,ruleDetail,customer:customerView,escape:esc,moneyFen:fen,moneyYuan:yuan};
})();
