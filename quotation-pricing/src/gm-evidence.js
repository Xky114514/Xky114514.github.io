(function () {
  'use strict';
  // Present only fields with an identified Guanmai source. Demo stores are adapters,
  // not invented endpoint responses; money conversions are explicit per collection.
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const present = v => v !== null && v !== undefined && v !== '';
  const show = v => present(v) ? esc(v) : '—';
  const num = v => present(v) && Number.isFinite(Number(v)) ? Number(v).toLocaleString('zh-CN', {maximumFractionDigits: 4}) : '—';
  const money = (v, divisor, currency) => present(v) && Number.isFinite(Number(v)) && (!currency || currency === 'CNY') ? (Number(v) / divisor).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 4}) + ' 元' : '—';
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
  const unitPrice = (v, db, s, basic) => present(v) ? `${fen(v, qCurrency(db, s))} / ${show(basic ? s.std_unit_name_forsale : s.sale_unit_name)}` : '—';
  const field = (label, html) => `<label class="field"><span>${esc(label)}</span>${html}</label>`;
  const option = (value, label, selected) => `<option value="${esc(value)}"${String(value) === String(selected) ? ' selected' : ''}>${esc(label)}</option>`;
  const tag = (label, klass = '') => `<span class="tag ${esc(klass)}">${esc(label)}</span>`;
  const help = (text, label = '查看说明') => window.GMHelp?.button ? window.GMHelp.button(text,label) : `<button type="button" class="help-tip" data-help="${esc(text)}" aria-label="${esc(label)}">?</button>`;
  const role = db => window.GMP?.role ? window.GMP.role(db) : { cost:true, audit:true, job:true };
  const permission = (db, action, quoteId, customerIds=[]) => window.GMP?.error ? window.GMP.error(db,action,quoteId,customerIds) : '';
  const nowDate = db => String(db.meta?.now || db.fixtureDate || '2026-09-30').slice(0,10);
  function oldData(db, value, days=3) { const t=dateValue(value), now=dateValue(nowDate(db)); return t !== null && now !== null && now-t>days*86400000; }
  const btn = (label, key, value, extra = '') => `<button type="button" class="btn slim" data-gm-${esc(key)}="${esc(value)}" ${extra}>${esc(label)}</button>`;
  const table = (head, rows, empty = '当前条件下没有记录') => `<div class="table-scroll"><table class="data-table"><thead><tr>${head.map(h => `<th scope="col">${esc(h)}${window.GMHelp?.priceTip?.(h)||''}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${head.length}" class="empty">${esc(empty)}</td></tr>`}</tbody></table></div>`;
  const kv = rows => table(['项目', '内容'], rows.map(([key, value]) => [esc(key)+(window.GMHelp?.priceTip?.(key)||''), value])).replace('class="data-table"', 'class="detail-table"');
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
  function source(db,s,key) { return db.purchaseSources?.[skuId(s)]?.[key] || null; }
  function purchasePrice(db,s) {
    if(!role(db).cost) return '<span class="muted">无权查看</span>';
    const value=s.last_purchase_price;
    if(!present(value)) return '—';
    const sourceInfo=source(db,s,'supplier');
    if(qCurrency(db,s)!=='CNY') return tag('无法比较','amber')+help('本期只支持人民币调价。采购来源与报价单币种不同，或缺少可核对的汇率，不将采购金额标成报价单外币，也不用于比较。','外币采购说明');
    if(sourceInfo?.fee_type && sourceInfo.fee_type !== 'CNY') return tag('无法比较','amber')+help('采购来源币种与报价单币种不同，未提供有效汇率，不能直接比较。','采购币种说明');
    return `${fen(value,sourceInfo?.fee_type || 'CNY')} / ${show(s.std_unit_name_forsale)}`;
  }
  function purchaseSources(db,s) {
    if(!role(db).cost) return '<span class="muted">无权查看</span>';
    const hasValue=present(s.last_purchase_price), info=db.purchaseSources?.[skuId(s)];
    if(!hasValue) return '—';
    const items=[['供应商最近采购价','supplier',s.last_purchase_price]];
    const stale=items.some(x=>oldData(db,info?.[x[1]]?.record_date,7));
    return `${stale?tag('旧数据','amber'):''}<details class="purchase-source"><summary>来源 ${help('供应商、采购记录日期和来源类型为演示追溯信息；正式接入由原采购记录补全。金额已按接口提供的基本销售单位展示，不重复换算。采购记录超过 7 日仅提示，不自动禁止明确基价的调价。','采购来源说明')}</summary><div class="source-lines">${items.map(([label,key])=>{const item=info?.[key];return `<div><strong>${esc(label)}</strong><br>${show(item?.supplier_name)} · ${show(item?.source_type)}<br>${present(item?.record_date)?dateText(item.record_date).slice(0,10):'来源日期未提供'}</div>`;}).join('')}</div></details>`;
  }
  function cost(db, ctx, ui) {
    const p = pageRows(products(db, ctx, ui), ui);
    const blocked=permission(db,ctx.scope==='quote'?'quote':'customer',ctx.quoteId,[ctx.customerId]);
    return `<div class="toolbar">${searchTools(db, ctx, ui)}${help('采购参考不是完整经营成本，也不自动代表毛利。供应商最近采购价按基本销售单位展示，不重复换算。商品设定损耗率不是本次实际损耗。选入调价只选择商品，不采用采购价作为售价。','采购参考口径')}</div>${table(['商品 / 规格', '供应商最近采购价', '采购来源', '商品设定损耗率', '销售单位 / 基本单位', '操作'], p.rows.map(s => [productName(s), purchasePrice(db,s),purchaseSources(db,s),present(s.attrition_rate) ? `${num(s.attrition_rate)}%` : '—', `${show(s.sale_unit_name)} / ${show(s.std_unit_name_forsale)}`, btn('查看商品', 'sku-detail', skuId(s)) + ' ' + btn('选入调价', 'select-sku', skuId(s),blocked?'disabled':'')+(blocked?help(blocked,'选入调价限制'): '')]))}${pager(p)}`;
  }
  function history(db, ctx, ui) {
    const map = new Map(products(db, ctx, ui).map(s => [skuId(s), s]));
    const records = arr(db.snapshots).filter(r => map.has(String(r.sku_id)) && overlaps(r.modify_time, r.next_modify_time, ui)).sort((a,b) => (dateValue(b.modify_time) || 0) - (dateValue(a.modify_time) || 0));
    const p = pageRows(records, ui);
    return `<div class="toolbar">${searchTools(db, ctx, ui)}${dateControls(ui)}</div><p class="muted section-note">商品历史报价：按日期展示报价单 SKU 的记录价格和适用日期，不是客户成交价，也不是谁修改了价格的操作日志。按适用区间与查询日期重叠筛选；未发生变更的日期不补记录。</p>${!rangeValid(ui) ? '<p class="error">结束日期不能早于开始日期。</p>' : ''}${table(['商品 / 规格', '报价单当前标准价', '记录销售价', '记录基本单价', '适用开始日期', '适用结束日期', '操作'], p.rows.map(r => { const s = map.get(String(r.sku_id)); return [productName(s), s.is_price_timing ? '待定价' : unitPrice(s.sale_price, db, s, false), r.is_price_timing ? '待定价' : `${fen(r.sale_price, r.fee_type || qCurrency(db, s))} / ${show(r.sale_unit_name)}`, r.is_price_timing ? '待定价' : `${fen(r.std_sale_price_forsale, r.fee_type || qCurrency(db, s))} / ${show(r.std_unit_name_forsale)}`, dateText(r.modify_time).slice(0, 10), dateText(r.next_modify_time).slice(0, 10), btn('查看商品', 'sku-detail', skuId(s))]; }))}${pager(p)}`;
  }
  function market(db, ctx, ui) {
    const map = new Map(products(db, ctx, ui).map(s => [skuId(s), s]));
    const records = arr(db.market).filter(r => map.has(String(r.sku_id))).flatMap(r => arr(r.matched_products).map(m => ({...m, gmSku: map.get(String(r.sku_id)), isDefault: String(m.product_id) === String(r.default_product_id)})));
    const p = pageRows(records, ui);
    return `<div class="toolbar">${searchTools(db, ctx, ui)}</div><p class="muted section-note">最新可用行情 · 保留来源平台商品、单位及数据日期；平台关联不代表规格或价格口径完全可比。</p>${table(['关联商品', '平台 / 市场', '平台商品 / 规格', '平均价', '最高价', '最低价', '平台单位', '数据日期'], p.rows.map(r => [productName(r.gmSku), `${show(r.source_platform_name)}${r.market_name ? `<div class="muted small">${esc(r.market_name)}</div>` : ''}`, `<strong>${show(r.sku_name)}</strong><div class="muted small">${show(r.standard)}</div>${r.isDefault ? tag('默认关联') : ''}`, yuan(r.market_price_avg, 'CNY'), yuan(r.market_price_max, 'CNY'), yuan(r.market_price_min, 'CNY'), show(r.unit_name), dateText(r.record_date)+(oldData(db,r.record_date)?`<div>${tag('旧数据','amber')}${help('行情数据日期距离演示当前日期已超过 3 日。仅提示时效风险，不自动判断可比，也不直接套用商品销售单位。','行情时效说明')}</div>`:'')]), '当前商品没有提供行情记录')}${pager(p)}`;
  }
  function settlement(a) {
    if (!a) return [['结算配置', '—']];
    const pm = Number(a.pay_method), names = {1:'日结', 2:'周结', 3:'月结', 4:'自定义', 5:'半月结'};
    const rows = [['结算方式', names[pm] ? esc(names[pm]) : show(a.pay_method)], ['收付款方式', ({1:'先货后款', 2:'先款后货'})[a.settle_way] || '—'], ['结算日期口径', ({1:'按下单日期', 2:'按收货日期'})[a.settle_date_type] || '—']];
    if (pm === 2) { const week = n => present(n) ? '周' + (['', '一', '二', '三', '四', '五', '六', '日'][Number(n)] || esc(n)) : '—'; rows.push(['账期起始日', week(a.begin_day)], ['结算日', week(a.settle_day)]); }
    if (pm === 3) { rows.push(['账期起始日', present(a.begin_day) ? `每月 ${num(a.begin_day)} 日` : '—'], ['结算日', present(a.settle_day) ? `每月 ${num(a.settle_day)} 日` : '—']); }
    if (pm === 5) rows.push(['半月结周期','每月 1–15 日、16 日–月末'], ['周期后延天数',present(a.delay_day)?`周期末延后 ${num(a.delay_day)} 天`:'—']);
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
  function ruleScope(db, r) { const type = objectType(r); if (type === 1) { const members = ruleMembers(r); const names = members.slice(0,2).map(m => sku(db,m.sku_id)?.sku_name || m.sku_id); return names.length ? names.map(esc).join('、') + (members.length > 2 ? ` 等 ${members.length} 个 SKU` : '') : '—'; } if (type === 2) return arr(r.category_2_list).map(x => show(x.category_2_name || x.category_2_id)).join('、') || '—'; if (type === 3) return arr(r.spus).length ? `${arr(r.spus).length} 个商品（SPU）` : '—'; return type === 4 ? '适用客户商品（运费等另计）' : '—'; }
  function rulePeriod(r) { return `${dateText(r.begin || r.start_date || r.begin_date)} 至 ${dateText(r.end || r.end_date)}`; }
  function dailyWindow(r) { const from = r.start_time_of_day || r.begin_time || r.begin_hm || r.start_hm || '00:00'; const to = r.end_time_of_day || r.end_time || r.end_hm || '23:59'; return `${show(from)}–${show(to)}${Number(r.time_limit) === 1 ? '（跨午夜）' : ''}`; }
  function calcText(db, r, m) { const rt = Number(m.rule_type ?? r.rule_type); const v = m.yx_price ?? r.yx_price; const basis = Number(r.locking_price_unit) === 1 ? '报价单基本单价' : ({2:'创价网行情价',3:'新发地平均价',4:'新发地最高价',5:'新发地最低价'})[r.price_type] || '报价单标准价'; if (!present(v)) return '—'; if (rt === 2) return `${basis} × ${num(Number(v) / 100)}`; const s = sku(db,m.sku_id || m.id); const cur = s ? qCurrency(db,s) : 'CNY'; const unit = s ? (Number(r.locking_price_unit) === 1 ? s.std_unit_name_forsale : s.sale_unit_name) : null; return rt === 0 ? `固定价 ${fen(v,cur)}${unit ? ' / '+esc(unit) : ''}` : rt === 1 ? `${basis} ${Number(v) >= 0 ? '+' : '−'} ${fen(Math.abs(Number(v)),cur)}${unit ? ' / '+esc(unit) : ''}` : '—'; }
  function ruleCalculation(db, r) { if (objectType(r) === 4) return present(r.change_rate) ? `适用商品金额 × ${num(Number(r.change_rate) / 100)}` : '—'; const members = objectType(r) === 1 ? ruleMembers(r) : objectType(r) === 2 ? arr(r.category_2_list) : arr(r.spus); const result = [...new Set(members.map(m => calcText(db,r,m)))]; return result.length === 1 ? result[0] : result.length ? '按商品分别设置' : '—'; }
  function ruleQuoteRelevant(db, r, ctx) { if (!ctx.quoteId) return true; if (r.salemenu_id) return String(r.salemenu_id) === String(ctx.quoteId); if (objectType(r) !== 1) return true; const allowed = new Set(quoteSkus(db,ctx).map(skuId)); return ruleMembers(r).some(m => allowed.has(String(m.sku_id))); }
  function ruleReadOnly(db,r) {
    if(Number(r.status)===0 || (present(r.end || r.end_date) && String(r.end || r.end_date).slice(0,10)<nowDate(db))) return '已关闭或已到期规则只读；需要新的价格约定时创建新规则，不恢复旧规则。';
    if(Number(r.price_type)>1) return '行情基准规则本期只读；行情、单位匹配及价格结果需在原系统核对。';
    if(objectType(r)===3 && r.category1_change_rates && Object.keys(r.category1_change_rates).length) return '含分类继承的商品上浮规则本期只读，避免移除商品后仍被分类规则继承。';
    if(![1,2,3,4].includes(objectType(r))) return '该规则类型本期只读。';
    return permission(db,'rule',r.salemenu_id,addresses(r));
  }
  function ruleEditButton(db,r) { const reason=ruleReadOnly(db,r);return ' '+btn('人工编辑','rule-edit',ruleId(r),reason?'disabled':'')+(reason?help(reason,'规则编辑限制'):''); }
  function protocolRows(db, ctx, ui, evidenceMode) {
    return arr(db.rules).filter(r => (!evidenceMode && ui.ruleFilter !== 'current' || addresses(r).includes(String(ctx.customerId))) && (!evidenceMode || ruleQuoteRelevant(db,r,ctx)) && (!ui.query || lower([r.name,r.rule_name,ruleId(r),addresses(r).map(id=>customer(db,id)?.name || id).join(' ')].join(' ')).includes(lower(ui.query).trim())));
  }
  function protocol(db, ctx, ui, evidenceMode) {
    const p = pageRows(protocolRows(db,ctx,ui,evidenceMode),ui);
    return `<div class="toolbar">${field('搜索规则', `<input type="search" data-gm-filter="query" value="${esc(ui.query || '')}" placeholder="规则名称、编号或客户">`)}${!evidenceMode ? field('查看范围', `<select data-gm-filter="ruleFilter">${option('all','全部客户',ui.ruleFilter || 'all')}${option('current','当前客户',ui.ruleFilter || 'all')}</select>`) : ''}</div><p class="muted section-note">系统已配置的价格规则。状态按原记录展示；有效规则仍需满足客户、商品、日期和每日时段。</p>${table(['规则名称', '适用客户', '对象 / 商品范围', '计算方式', '有效日期', '每日时段', '状态', '操作'], p.rows.map(r => [`<strong>${show(r.name || r.rule_name)}</strong><div class="muted small">${esc(ruleId(r))}</div>`, ruleCustomers(db,r) + (addresses(r).length > 1 ? `<div>${tag('多个客户共用')}</div>` : ''), `${tag(objectNames[objectType(r)] || '—')}<div class="small">${ruleScope(db,r)}</div>`, ruleCalculation(db,r), rulePeriod(r), dailyWindow(r), tag(ruleStatuses[r.status] || '—', Number(r.status) === 3 ? 'green' : ''), btn('详情','rule-detail',ruleId(r)) + ruleEditButton(db,r)]))}${pager(p)}`;
  }
  function jobs(db, ctx, ui) {
    const records=arr(db.jobs).filter(j=>(ui.ruleFilter!=='current'||String(j.salemenu_id)===String(ctx.quoteId))&&(!ui.query||lower([j.rule_name,j.rule_id,quote(db,j.salemenu_id)?.name].join(' ')).includes(lower(ui.query).trim())));
    const p=pageRows(records,ui), createError=role(db).job?'':'当前角色无权新建计划调价任务。';
    return `<div class="toolbar">${field('搜索任务',`<input type="search" data-gm-filter="query" value="${esc(ui.query||'')}" placeholder="任务名称、编号或报价单">`)}${field('查看范围',`<select data-gm-filter="ruleFilter">${option('all','全部报价单',ui.ruleFilter||'all')}${option('current','当前报价单',ui.ruleFilter||'all')}</select>`)}<button class="button primary" data-gm-job-new ${createError?'disabled':''}>预约报价单调价</button>${createError?help(createError,'新建任务限制'):''}${help('计划调价是预约一次修改报价单标准价。按保存时的标准价算好目标价，到计划时间执行固定目标价，不在执行时再次计算百分比。每个任务只能属于一张报价单，保存后不能换单；仅支持人民币。原生“已生效”不保证每项成功，异常查看详情，失败商品可重新核对后另建任务。','计划调价说明')}</div>${table(['任务名称','报价单','计划执行时间','商品数','调价方式','执行状态','操作'],p.rows.map(j=>{
      const error=permission(db,'job',j.salemenu_id), readonlyCurrency=(quote(db,j.salemenu_id)?.fee_type || 'CNY')!=='CNY';
      const failure=Number(j.abnormal_status || 0)!==0 || arr(j.failures).length>0;
      const editReason=error || (readonlyCurrency?'本期仅支持人民币任务；外币历史任务只读。':'');
      return [`<strong>${show(j.rule_name)}</strong><div class="muted small">${show(j.rule_id)}</div>`,show(quote(db,j.salemenu_id)?.name),dateText(j.effective_time),Array.isArray(j.items)?String(j.items.length):'—',Array.isArray(j.items)?[...new Set(j.items.map(i=>({set:'固定价',delta:'加减值',percent:'百分比',multiple:'倍数'})[i.operation]||'固定价'))].join('、')||'—':'—',tag(({0:'未开始',1:'已生效',2:'已结束'})[j.rule_status]||'—')+(failure?' '+tag('异常','amber')+help('原生状态与异常标识同时保留。请查看详情；存在明确失败商品时可将失败项复制为新任务，原成功项不会重复加入。','任务异常说明'):''),btn('详情','job-view',j.rule_id)+(Number(j.rule_status)===0?' '+btn('编辑任务','job-edit',j.rule_id,editReason?'disabled':'')+(editReason?help(editReason,'任务编辑限制'):''):'')+(arr(j.failures).length?' '+btn('处理失败项','job-retry',j.rule_id,editReason?'disabled':'')+(editReason?help(editReason,'失败项处理限制'):''):'')];
    }))}${pager(p)}`;
  }
  function operationLogs(db,ctx,ui) {
    if(!role(db).audit) return '<p class="empty">无权查看操作记录。</p>';
    const records=arr(db.operationLogs).filter(r=>!ui.query || lower([r.id,r.object_id,r.quote_id,r.actor,r.action,r.summary].join(' ')).includes(lower(ui.query).trim())).slice().sort((a,b)=>(dateValue(b.time)||0)-(dateValue(a.time)||0)||(b.sequence||0)-(a.sequence||0));
    const p=pageRows(records,{...ui,size:25});
    return `<div class="toolbar">${field('搜索操作',`<input type="search" data-gm-filter="query" value="${esc(ui.query||'')}" placeholder="对象编号、操作人或摘要">`)}${help('记录本地演示中已确认的规则修改、报价调整和任务保存，以及修改前后值。此处是操作追溯，不是商品历史报价，也不代表真实后台审计记录。','操作记录说明')}</div>${table(['时间','操作人','动作','对象','摘要','操作'],p.rows.map(r=>[dateText(r.time),show(r.actor),show(({rule:'人工修改规则',job:'保存计划任务'})[r.action]||r.action),show(r.object_id),show(r.summary),btn('详情','log-view',r.id)]),'尚无操作记录。确认一次价格调整或任务保存后可查看。')}<div class="toolbar pagination"><span class="muted">共 ${p.count} 条 · 每页 25 条 · 第 ${p.page} / ${p.pages} 页</span><div class="toolbar">${btn('上一页','page',p.page-1,p.page===1?'disabled':'')}${btn('下一页','page',p.page+1,p.page===p.pages?'disabled':'')}</div></div>`;
  }
  function evidence(db, ctx, ui) {
    const tabs = [['cost','采购参考'],['history','商品历史报价'],['market','市场行情'],['customer','客户资料'],['rules','价格规则']]; const active = tabs.some(t=>t[0] === ui.tab) ? ui.tab : 'cost';
    const head = `<div class="section-head"><h2>客户与依据</h2><span class="muted">${show(customer(db,ctx.customerId)?.name)}${ctx.quoteId ? ' · ' + show(quote(db,ctx.quoteId)?.name) : ''}</span></div><div class="tabs" role="tablist" aria-label="资料类型">${tabs.map(([id,label])=>`<button type="button" role="tab" aria-selected="${id===active}" data-gm-evidence-tab="${id}">${label}</button>`).join('')}</div>`;
    if (active !== 'customer' && !ctx.quoteId) return head + '<p class="empty">请先从左侧明确选择一张报价单，再查看该报价单的商品资料。</p>';
    return head + ({cost,history,market,customer:customerView,rules:(d,c,u)=>protocol(d,c,u,true)})[active](db,ctx,ui);
  }
  function rules(db,ctx,ui) {
    const tabs=[['protocol','客户协议调价'],['jobs','报价单定时调价']];if(role(db).audit)tabs.push(['logs','操作记录']);
    const active=tabs.some(t=>t[0]===ui.ruleTab)?ui.ruleTab:'protocol';
    const body=ui.ruleTab==='native'?`<div class="toolbar"><button class="button" data-gm-rule-tab="protocol">← 返回客户协议调价任务</button><strong>现有价格规则</strong>${help('这里按一条原生价格规则一行展示。旧规则没有调价任务记录时保持原样，不根据名称或日期猜测历史任务。人工修改后会新增本次客户协议调价任务记录；共享、分类和SPU规则仍按原范围管理。','现有规则说明')}</div>${protocol(db,ctx,ui,false)}`:active==='jobs'?jobs(db,ctx,ui):active==='logs'?operationLogs(db,ctx,ui):window.GCT?.list(db,ctx,ui)||'<p class="empty">客户协议调价任务尚未加载</p>';
    return `<div class="section-head"><h2>规则与调价</h2>${help('两类操作都需要选商品、设价、核对。客户协议调价：现在保存客户规则，在指定有效期内参与取价，例如晨禾10月白菜固定4.80元。报价单定时调价：预约未来一次修改报价单标准价，例如明早8点将白菜标准价改为5.20元，可能影响多个关联客户。前者是规则配置记录，后者是待执行任务；不应混用。','两类调价的区别')}</div><div class="tabs" role="tablist" aria-label="规则类型">${tabs.map(([id,label])=>`<button type="button" role="tab" aria-selected="${id===active}" data-gm-rule-tab="${id}">${label}</button>`).join('')}</div>${body}`;
  }
  function detail(db, ctx, id) {
    const s = sku(db,id); if (!s || String(s.salemenu_id) !== String(ctx.quoteId)) return '<p class="empty">当前报价单中没有此 SKU。</p>';
    const resolved = window.GME?.resolve ? window.GME.resolve(db,ctx.customerId,skuId(s),null,{now:db.meta?.now || db.fixtureDate + 'T10:00'}) : null;
    const rows = [['商品', show(s.sku_name)], ['SKU 标识', show(skuId(s))], ['商品编码',show(s.outer_id)], ['规格', show(s.specification_desc)], ['所属报价单',show(quote(db,s.salemenu_id)?.name)], ['销售单位',show(s.sale_unit_name)], ['基本销售单位',show(s.std_unit_name_forsale)], ['商品基本单位',show(s.std_unit_name)], ['报价单标准价',s.is_price_timing ? '待定价' : unitPrice(s.sale_price,db,s,false)], ['基本单价',s.is_price_timing ? '待定价' : unitPrice(s.std_sale_price_forsale,db,s,true)]];
    if (resolved) rows.push(['客户当前价', resolved.requires_quantity ? '需输入采购数量确定阶梯档位' : present(resolved.settle_price) ? unitPrice(resolved.settle_price,db,s,false) : show(resolved.reason || '待定价')]);
    rows.push(['供应商最近采购价',purchasePrice(db,s)], ['采购来源',purchaseSources(db,s)], ['商品设定损耗率',present(s.attrition_rate) ? num(s.attrition_rate)+'%' : '—'], ['系统建议价范围', `${unitPrice(s.suggest_price_min,db,s,true)} 至 ${unitPrice(s.suggest_price_max,db,s,true)}`]);
    const steps = arr(s.step_price_table); return `<h3>${show(s.sku_name)}</h3>${kv(rows)}${s.is_step_price ? `<h3 class="section-title">阶梯价格档</h3><p class="section-note">数量与价格均按系统档位口径，需提供采购数量才可确定当前适用价。当前价格不保证是未来配送日价格，也不重算已创建订单。</p>${table(['数量档', '价格'], steps.map(t => [`${num(t.min)} ${show(s.sale_unit_name)} ≤ 数量${present(t.max) ? ' < ' + num(t.max) + ' ' + show(s.sale_unit_name) : ''}`, unitPrice(t.step_sale_price,db,s,false)]))}` : ''}`;
  }
  function ruleDetail(db, ctx, id, ui={}) {
    const r=arr(db.rules).find(r=>ruleId(r)===String(id));if(!r)return '<p class="empty">没有找到该价格规则。</p>';
    const members=ruleMembers(r),rows=[['名称',show(r.name||r.rule_name)],['规则编号',show(ruleId(r))],['适用客户',ruleCustomers(db,r)],['规则对象',show(objectNames[objectType(r)])],['商品范围',ruleScope(db,r)],['有效日期',rulePeriod(r)],['每日时段',dailyWindow(r)],['原生状态',show(ruleStatuses[r.status])],['计价单位',Number(r.locking_price_unit)===1?'基本单价':'销售单价']];
    const matches=members.filter(m=>{const s=sku(db,m.sku_id);return !ui.query||lower([m.sku_id,s?.sku_name,s?.outer_id,s?.specification_desc].join(' ')).includes(lower(ui.query).trim());});
    const p=pageRows(matches,{page:ui.page||1,size:25});
    const detailTable=objectType(r)===1?`<div class="toolbar"><input id="native-rule-query" type="search" maxlength="100" aria-label="搜索原规则商品" placeholder="搜索商品名称、编码或规格" value="${esc(ui.query||'')}"></div>${table(['SKU','商品 / 规格','计算方式'],p.rows.map(m=>{const s=sku(db,m.sku_id);return[show(m.sku_id),s?productName(s):'—',calcText(db,r,m)];}))}<div class="pager"><span>匹配 ${p.count} / 全部 ${members.length} 项 · 第 ${p.page} / ${p.pages} 页</span><button class="button" data-gm-native-rule-page="${p.page-1}" ${p.page===1?'disabled':''}>上一页</button><button class="button" data-gm-native-rule-page="${p.page+1}" ${p.page===p.pages?'disabled':''}>下一页</button></div>`:kv([['计算方式',ruleCalculation(db,r)]]);
    return `${kv(rows)}${ruleReadOnly(db,r)?`<div class="toolbar">${tag('只读')}${help(ruleReadOnly(db,r),'规则只读说明')}</div>`:''}${objectType(r)===4?help('整单折扣作用于适用商品价格，不自动包含运费等费用。例如商品100元、运费10元，九折后为90元加运费10元。','整单折扣口径'):''}${addresses(r).length>1?help('此规则服务多个客户。人工编辑修改原规则并影响完整客户范围，不会自动拆成单客户商品规则。','共享规则说明'):''}${detailTable}`;
  }
  window.GMV = {evidence,rules,detail,ruleDetail,customer:customerView,escape:esc,moneyFen:fen,moneyYuan:yuan};
})();
