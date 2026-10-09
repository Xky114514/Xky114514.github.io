(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const asArray = value => Array.isArray(value) ? value : [];
  const eq = (a, b) => String(a) === String(b);
  const number = value => typeof value === 'number' && Number.isFinite(value);
  const cents = value => number(value) && Number.isSafeInteger(value) && value >= 0;
  const datePart = value => String(value || '').slice(0, 10);
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
  const validTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '');
  const localNow = value => String(value || '2026-09-30T10:00').replace(' ', 'T').slice(0, 16);
  const round = value => {
    const lo = Math.floor(value), fraction = value - lo;
    if (Math.abs(fraction - .5) < 1e-9) return lo % 2 === 0 ? lo : lo + 1;
    return Math.round(value);
  };
  const ruleId = r => r.id || r._id;
  const skuId = s => s.sku_id || s.id || s._id;
  const addresses = r => asArray(r.address_ids || r.addresses).map(a => typeof a === 'object' ? a.address_id || a.id : a);
  const skuOf = (db, id) => asArray(db.skus).find(s => eq(s.sku_id, id));
  const quoteOf = (db, id) => asArray(db.salemenus).find(q => eq(q.id, id));
  const customerOf = (db, id) => asArray(db.customers).find(c => eq(c.address_id, id));
  const currency = (db, sku) => quoteOf(db, sku.salemenu_id)?.fee_type || null;
  function linkedQuotes(db, addressId) {
    const ids = new Set(asArray(db.links).filter(l => eq(l.restaurant_id, addressId) && (!db.station_id || !l.station_id || eq(l.station_id,db.station_id))).map(l => String(l.salemenu_id)));
    return asArray(db.salemenus).filter(q => ids.has(String(q.id)));
  }
  function linkedCustomers(db, salemenuId) {
    const ids = new Set(asArray(db.links).filter(l => eq(l.salemenu_id, salemenuId)).map(l => String(l.restaurant_id)));
    return asArray(db.customers).filter(c => ids.has(String(c.address_id)));
  }
  function quoteSkus(db, salemenuId) {
    return asArray(db.skus).filter(s => eq(s.salemenu_id, salemenuId));
  }
  function entryFor(rule, sku) {
    const type = Number(rule.rule_object_type || 1);
    if (type === 1) return asArray(rule.skus).find(s => eq(skuId(s), sku.sku_id)) || null;
    if (type === 2 && eq(rule.salemenu_id, sku.salemenu_id)) return asArray(rule.category_2_list).find(c => eq(c.category_2_id, sku.category_id_2)) || null;
    if (type === 3) return asArray(rule.spus).find(s => eq(s.spu_id || s.id, sku.spu_id)) || null;
    if (type === 4) return { rule_type: 2, yx_price: rule.change_rate };
    return null;
  }
  function ruleActive(rule, now) {
    // Backend status is authoritative; the browser never promotes an unstarted rule.
    if (Number(rule.status) !== 3) return false;
    const current = localNow(now), date = current.slice(0, 10), time = current.slice(11, 16);
    const begin = datePart(rule.begin), end = datePart(rule.end);
    if (!validDate(begin) || !validDate(end) || date < begin || date > end || !validTime(time)) return false;
    const from = rule.begin_time || '00:00', to = rule.end_time || '23:59';
    if (!validTime(from) || !validTime(to)) return false;
    if (Number(rule.time_limit) !== 1) return time >= from && time <= to;
    // Exact source semantics: the first date has only the late segment.
    return date === begin ? time >= from : time >= from || time <= to;
  }
  function rulePrice(sku, rule, entry, baseOverride) {
    if (rule.price_type != null && Number(rule.price_type) !== 1) return null;
    const type = Number(entry.rule_type), yx = entry.yx_price;
    if (!number(yx) || ![0, 1, 2].includes(type)) return null;
    const base = baseOverride === undefined ? sku.sale_price : baseOverride;
    const ratio = Number(sku.sale_ratio), basic = Number(rule.locking_price_unit) === 1;
    if (basic && (!Number.isFinite(ratio) || ratio <= 0)) return null;
    if (type !== 0 && !cents(base)) return null;
    let operand = basic ? (baseOverride === undefined ? sku.std_sale_price_forsale : base / ratio) : base;
    if (type !== 0 && !number(operand)) return null;
    let answer = type === 0 ? yx : type === 1 ? operand + yx : operand * yx / 100;
    if (basic) answer *= ratio;
    return Number.isFinite(answer) && answer >= 0 ? round(answer) : null;
  }
  function resolve(db, addressId, id, quantity = null, options = {}) {
    const sku = skuOf(db, id), now = options.now || db.meta?.now || '2026-09-30T10:00';
    const result = {sku_id: id, settle_price: null, unit_name: sku?.sale_unit_name || '', strategy: 'missing', is_time_priced: !!sku?.is_price_timing};
    if (!sku || !linkedQuotes(db, addressId).some(q => eq(q.id, sku.salemenu_id))) return {...result, reason: '商品不存在或不属于该客户关联的报价单'};
    if (sku.is_step_price && asArray(sku.step_price_table).length) {
      const table = sku.step_price_table, missing = quantity == null || quantity === '';
      if (!missing && (!number(quantity) || quantity <= 0)) return {...result, strategy: 'step', requires_quantity: true, reason: '请填写有效下单数量'};
      const qty = missing ? table[0].min : quantity;
      const tier = table.find(t => qty >= t.min && (t.max === '' || t.max == null || t.max === 0 || qty < t.max)) || table[table.length - 1];
      const valid = cents(tier.step_sale_price);
      return {...result, settle_price: valid ? tier.step_sale_price : null, strategy: 'step', step_tier: {min: tier.min, max: tier.max || null, unit_name: result.unit_name}, requires_quantity: missing, reason: missing ? '阶梯价：待填数量；显示首档参考' : valid ? '' : '阶梯价格缺失'};
    }
    const matches = asArray(db.rules).filter(r => addresses(r).some(a => eq(a, addressId)) && ruleActive(r, now)).map(r => ({rule: r, entry: entryFor(r, sku)})).filter(v => v.entry);
    // SKU rules precede category fallback in get_sku_rule_map. Multiple active SKU rules use the native minimum yx_price choice.
    const direct = matches.filter(v => Number(v.rule.rule_object_type || 1) === 1).sort((a, b) => a.entry.yx_price - b.entry.yx_price);
    const category = matches.filter(v => Number(v.rule.rule_object_type) === 2);
    const chosen = direct[0] || category[category.length - 1] || matches[0];
    if (chosen) {
      const {rule, entry} = chosen;
      if (Object.keys(rule.category1_change_rates||{}).length) return {...result, strategy:'unsupported',rule_id:ruleId(rule),reason:'涉及分类继承的上浮规则，需原系统确认'};
      const price = rulePrice(sku, rule, entry, options.basePriceOverride);
      return {...result, strategy: price == null ? 'unsupported' : 'rule', settle_price: price, rule_id: ruleId(rule), rule_ids: matches.map(m => ruleId(m.rule)), rule_type: entry.rule_type, reason: price == null ? '规则基价、金额或换算资料不足，无法确定客户适用价' : ''};
    }
    if (sku.is_price_timing) return {...result, strategy: 'timing', reason: '时价待定价'};
    const base = options.basePriceOverride === undefined ? sku.sale_price : options.basePriceOverride;
    return {...result, strategy: cents(base) ? 'normal' : 'missing', settle_price: cents(base) ? base : null, reason: cents(base) ? '' : '报价单基础销售价缺失或不是原生分值'};
  }
  function periodError(spec) {
    if (!validDate(spec.begin) || !validDate(spec.end)) return '客户协议价需要完整、有效的起止日期';
    if (spec.end < spec.begin) return '结束日期不能早于开始日期';
    if (!validTime(spec.begin_time) || !validTime(spec.end_time)) return '每日时段必须为 HH:MM';
    if (![1, 2].includes(Number(spec.time_limit))) return '请选择当天时段或跨午夜时段';
    if (Number(spec.time_limit) === 2 && spec.end_time < spec.begin_time) return '当天时段的结束时间不能早于开始时间';
    if (Number(spec.time_limit) === 1 && spec.end_time >= spec.begin_time) return '跨午夜时段必须以次日较早时间结束';
    return '';
  }
  const overlaps = (rule, spec) => datePart(rule.begin) <= spec.end && datePart(rule.end) >= spec.begin;
  const samePeriod = (rule, spec) => datePart(rule.begin) === spec.begin && datePart(rule.end) === spec.end && (rule.begin_time || '00:00') === spec.begin_time && (rule.end_time || '23:59') === spec.end_time && Number(rule.time_limit ?? 2) === Number(spec.time_limit);
  function conflictFor(db, context, sku, spec) {
    const mine = asArray(db.rules).filter(r => addresses(r).some(a => eq(a, context.customerId)));
    const broad = mine.find(r => [3, 4].includes(Number(r.rule_object_type)) && Number(r.status) === 3);
    if (broad) return {error: '该客户已有有效上浮率或整单规则，需先在原规则中处理', rule_ids: [ruleId(broad)]};
    const matches = mine.filter(r => [1, 2].includes(Number(r.rule_object_type || 1)) && [2, 3].includes(Number(r.status)) && overlaps(r, spec) && entryFor(r, sku));
    if (!matches.length) return {};
    if (matches.some(r => addresses(r).length !== 1)) return {error: '命中多个客户共用的价格规则，不能作为仅调整当前客户直接覆盖', rule_ids: matches.map(ruleId)};
    if (matches.some(r => Number(r.rule_object_type || 1) !== 1)) return {error: '命中分类或其他范围规则，请查看原规则；本原型不自动覆盖其商品范围', rule_ids: matches.map(ruleId)};
    if (matches.length !== 1 || !samePeriod(matches[0], spec)) return {error: '相同客户和 SKU 存在日期重叠规则；请使用原规则的日期及时段修改，或改用不重叠日期', rule_ids: matches.map(ruleId)};
    return {update_rule_id: ruleId(matches[0]), rule: matches[0]};
  }
  function fingerprint(db) {
    return JSON.stringify([db.links, db.salemenus, db.skus, db.rules]);
  }
  function makePlan(db, context, requested, now = db.meta?.now || '2026-09-30T10:00') {
    const spec = {...requested, ids: [...new Set(asArray(requested.ids).map(String))], quantities: {...requested.quantities}, base: requested.base || 'quote', begin_time: requested.begin_time || '00:00', end_time: requested.end_time || '23:59', time_limit: requested.time_limit == null ? 2 : Number(requested.time_limit)};
    const plan = {context: clone(context), spec, rows: [], affectedCustomers: [], errors: [], warnings: [], created_at: localNow(now), fingerprint: fingerprint(db), eligible_count: 0, skipped_count: 0, ok: false};
    const fail = text => {if (!plan.errors.includes(text)) plan.errors.push(text);};
    if (!customerOf(db, context.customerId)) fail('请选择有效客户');
    if (!['customer', 'quote'].includes(context.scope)) fail('请选择客户协议价或报价单标准价');
    if (!quoteOf(db, context.quoteId) || !linkedQuotes(db, context.customerId).some(q => eq(q.id, context.quoteId))) fail('请明确选择当前客户关联的一张报价单');
    const permissionError=root.GMP?.error(db,context.scope,context.quoteId,[context.customerId]); if(permissionError) fail(permissionError);
    if (!Number.isInteger(context.generation)) fail('调整上下文无效，请重新选择范围');
    if (!spec.ids.length) fail('请至少选择一个商品'); if(spec.ids.length>5000)fail('每次最多调整5000个商品');
    if (!['set', 'delta', 'percent', 'multiple'].includes(spec.operation)) fail('不支持该调价方式');
    if (!number(spec.value)) fail('请填写有效调整值');
    if(['set','delta'].includes(spec.operation)&&Math.abs(spec.value)>999999.99)fail('金额绝对值不能超过999999.99');
    if((spec.operation==='multiple'&&spec.value>100)||(spec.operation==='percent'&&spec.value>9900))fail('倍率不能超过100，百分比不能超过9900%');
    if (['set', 'delta'].includes(spec.operation) && number(spec.value) && Math.abs(spec.value * 100 - Math.round(spec.value * 100)) > 1e-7) fail('固定金额最多保留两位小数');
    if ((spec.operation === 'set' && spec.value < 0) || (spec.operation === 'percent' && spec.value <= -100) || (spec.operation === 'multiple' && spec.value <= 0)) fail('调整后价格不能为负数，倍数必须大于零');
    if (!['customer', 'quote'].includes(spec.base)) fail('请选择计算基准');
    if (context.scope === 'customer') {const error = periodError(spec); if (error) fail(error); if(spec.end && spec.end<datePart(now))fail('有效结束日期不能早于演示当前日期；已到期规则不可重新启用');}
    if(/[\r\n\t]/.test(String(spec.ruleName||'')))fail('规则名称不能含换行或制表符');
    if(String(spec.ruleName||'').trim().length>80)fail('规则名称最多80个字符');
    const selected = spec.ids.map(id => skuOf(db, id)).filter(Boolean);
    if (selected.length !== spec.ids.length || selected.some(s => !eq(s.salemenu_id, context.quoteId))) fail('所选商品已改变或不属于当前报价单，请重新选择');
    if (['set', 'delta'].includes(spec.operation)) {
      if (new Set(selected.map(s => currency(db, s))).size > 1) fail('固定金额操作不能混用币种');
      if (new Set(selected.map(s => s.sale_unit_name)).size > 1) fail('固定金额操作需要统一销售单位，请按单位分批调整；百分比可以跨单位');
    }
    if (selected.some(s => !currency(db, s))) fail('商品币种缺失，无法生成调价预览');
    for (const sku of selected) {
      const current = resolve(db, context.customerId, sku.sku_id, spec.quantities[sku.sku_id] ?? null, {now});
      const row = {sku_id: sku.sku_id, base_price: cents(sku.sale_price) ? sku.sale_price : null, customer_price: current.requires_quantity ? null : current.settle_price, proposed_price: null, rule_type: null, yx_price: null, skip: false, warning: '', current, update_rule_id: null};
      plan.rows.push(row);
      if (context.scope==='quote' && sku.is_price_timing && sku.sale_price===0 && spec.operation!=='set') {row.skip=true;row.warning='时价标准价待定，已跳过；如需设置标准价请明确填写固定目标价';continue;}
      if (context.scope === 'customer' && current.strategy === 'step') {row.skip = true; row.warning = '阶梯价优先，客户协议调价不覆盖阶梯表；请使用原阶梯定价功能'; continue;}
      if (context.scope === 'customer' && current.strategy === 'timing' && spec.operation !== 'set') {row.error = '时价尚未确定，不能以占位零价计算调幅；请直接指定固定价'; fail(row.error); continue;}
      let conflict = {};
      if (context.scope === 'customer' && !periodError(spec)) {
        conflict = conflictFor(db, context, sku, spec);
        if (conflict.error) {row.error = conflict.error; row.rule_ids = conflict.rule_ids; fail(conflict.error); continue;}
      }
      let operand = context.scope === 'quote' || spec.base === 'quote' ? row.base_price : row.customer_price;
      if (spec.operation !== 'set' && operand == null) {row.error = '计算基准价缺失或待定，请补齐数量/价格，或使用固定价'; fail(row.error); continue;}
      const value = spec.value;
      const raw = spec.operation === 'set' ? value * 100 : spec.operation === 'delta' ? operand + value * 100 : spec.operation === 'percent' ? operand * (1 + value / 100) : operand * value;
      if (!Number.isFinite(raw) || raw < 0 || raw>99999999 || !Number.isSafeInteger(round(raw))) {row.error = '目标价须为0至999999.99，且计算基准有效'; fail(row.error); continue;}
      row.proposed_price = round(raw);
      if (context.scope === 'customer') {
        row.rule_type = spec.base === 'customer' || spec.operation === 'set' ? 0 : spec.operation === 'delta' ? 1 : 2;
        row.yx_price = row.rule_type === 0 ? row.proposed_price : row.rule_type === 1 ? round(value * 100) : spec.operation === 'percent' ? 100 + value : value * 100;
        if (conflict.update_rule_id) {
          row.update_rule_id = conflict.update_rule_id;
          if (Number(conflict.rule.locking_price_unit) === 1 && row.rule_type !== 2) {
            if (!number(sku.sale_ratio) || sku.sale_ratio <= 0) {row.error = '原规则按基本单位计价，但商品换算比例缺失'; fail(row.error); continue;}
            row.yx_price /= sku.sale_ratio;
          }
        }
        if (spec.base === 'customer' && spec.operation !== 'set') row.warning = '按客户当前价一次计算，保存为固定价规则';
        if (spec.begin > datePart(now)) row.warning += (row.warning ? '；' : '') + '此处为规则设置值，不代表未来实际结算价';
      } else {
        if (current.strategy === 'step') row.warning = '标准价调整不覆盖阶梯定价';
        else if (current.strategy === 'timing') row.warning = '标准价调整后仍为时价待定价';
        else if (current.strategy === 'rule') row.warning = '客户实际价格继续按其协议计算';
      }
    }
    plan.skipped_count = plan.rows.filter(r => r.skip).length;
    plan.eligible_count = plan.rows.filter(r => !r.skip && !r.error && r.proposed_price != null).length;
    if (!plan.eligible_count && !plan.errors.length) fail('所选商品均无法通过此调价方式调整');
    plan.ok = plan.errors.length === 0 && plan.eligible_count > 0;
    const affected = context.scope === 'quote' ? linkedCustomers(db, context.quoteId) : [customerOf(db, context.customerId)].filter(Boolean);
    plan.affectedCustomers = affected.map(customer => ({address_id: customer.address_id, name: customer.name, rows: plan.rows.map(row => ({sku_id: row.sku_id, before: resolve(db, customer.address_id, row.sku_id, spec.quantities[row.sku_id] ?? null, {now}), after: context.scope === 'quote' && row.proposed_price != null ? resolve(db, customer.address_id, row.sku_id, spec.quantities[row.sku_id] ?? null, {now, basePriceOverride: row.proposed_price}) : null}))}));
    return plan;
  }
  function planSignature(plan) {
    return JSON.stringify([plan.context, plan.spec, plan.rows, plan.affectedCustomers, plan.errors, plan.eligible_count, plan.skipped_count]);
  }
  function applyPlan(db, plan, context, now = db.meta?.now || '2026-09-30T10:00') {
    if (!plan || !plan.ok) return {ok: false, error: '当前预览不可应用，请先处理阻止项'};
    if (['customerId', 'quoteId', 'scope', 'generation'].some(key => !eq(plan.context[key], context[key]))) return {ok: false, error: '客户、报价单或调价范围已切换，请重新生成预览'};
    const permissionError=root.GMP?.error(db,context.scope,context.quoteId,[context.customerId]); if(permissionError)return {ok:false,error:permissionError};
    if(root.GMP && ((context.scope==='quote'&&linkedCustomers(db,context.quoteId).length>1)||plan.skipped_count>0) && !plan.confirmed)return {ok:false,error:'请先确认全部关联客户和未处理商品'};
    if (plan.fingerprint !== fingerprint(db)) return {ok: false, error: '数据已变化，当前预览已过期，请重新生成'};
    const fresh = makePlan(db, context, plan.spec, now);
    if (!fresh.ok || planSignature(fresh) !== planSignature(plan)) return {ok: false, error: '价格、规则或适用时段已变化，请重新生成预览'};
    const rows = fresh.rows.filter(r => !r.skip && !r.error && r.proposed_price != null);
    if (context.scope === 'quote') {
      for (const row of rows) {
        const sku = skuOf(db, row.sku_id);
        const changed = sku.sale_price !== row.proposed_price;
        sku.sale_price = row.proposed_price;
        if (number(sku.sale_ratio) && sku.sale_ratio > 0) sku.std_sale_price_forsale = Math.round(row.proposed_price / sku.sale_ratio * 100) / 100;
        if (changed) {
          if (!Array.isArray(db.snapshots)) db.snapshots = [];
          const timestamp = localNow(now) + ':00+08:00';
          db.snapshots.filter(s => eq(s.sku_id, row.sku_id) && !s.next_modify_time).forEach(s => { s.next_modify_time = timestamp; });
          db.snapshots.push({sku_id: sku.sku_id, modify_time: timestamp, next_modify_time: null, sale_price: sku.sale_price, std_sale_price_forsale: sku.std_sale_price_forsale, sale_unit_name: sku.sale_unit_name, std_unit_name_forsale: sku.std_unit_name_forsale, sale_ratio: sku.sale_ratio});
        }
      }
    } else {
      for (const row of rows.filter(r => r.update_rule_id)) {
        const rule = db.rules.find(r => eq(ruleId(r), row.update_rule_id));
        const entry = rule.skus.find(s => eq(skuId(s), row.sku_id));
        entry.rule_type = row.rule_type;
        entry.yx_price = row.yx_price;
      }
      const insert = rows.filter(r => !r.update_rule_id);
      if (insert.length) {
        let suffix = 1;
        while (db.rules.some(r => eq(ruleId(r), 'LOCAL-RULE-' + suffix))) suffix++;
        db.rules.push({id: 'LOCAL-RULE-' + suffix, name: (plan.spec.ruleName || '本地客户协议调价演示').trim(), type: 'customer', salemenu_id: context.quoteId, address_ids: [context.customerId], rule_object_type: 1, skus: insert.map(r => ({sku_id: r.sku_id, rule_type: r.rule_type, yx_price: r.yx_price})), category_2_list: [], begin: plan.spec.begin, end: plan.spec.end, begin_time: plan.spec.begin_time, end_time: plan.spec.end_time, time_limit: plan.spec.time_limit, locking_price_unit: 0, price_type: 1, status: plan.spec.begin > datePart(now) ? 2 : plan.spec.end < datePart(now) ? 1 : 3});
      }
    }
    root.GMP?.record(db,{action:context.scope==='quote'?'调整标准价':'调整客户协议价',object_id:context.quoteId,quote_id:context.quoteId,customer_ids:fresh.affectedCustomers.map(c=>c.address_id),summary:`已调整 ${rows.length} 个商品，跳过 ${fresh.skipped_count} 个`,source:plan.spec.source||'按条件调整',changes:rows.map(r=>({field:skuOf(db,r.sku_id).outer_id+' '+skuOf(db,r.sku_id).sku_name,before:{price:context.scope==='quote'?r.base_price:r.customer_price,unit:skuOf(db,r.sku_id).sale_unit_name,currency:currency(db,skuOf(db,r.sku_id))},after:{price:r.proposed_price,unit:skuOf(db,r.sku_id).sale_unit_name,currency:currency(db,skuOf(db,r.sku_id)),rule_type:r.rule_type,yx_price:r.yx_price,begin:plan.spec.begin,end:plan.spec.end}}))});
    return {ok: true, changed: rows.length, skipped: fresh.skipped_count, message: `已应用本地演示：${rows.length} 个商品`};
  }
  function validateJobEdit(db, id, changes, now = db.meta?.now || '2026-09-30T10:00') {
    const job = asArray(db.jobs).find(j => eq(j.rule_id || j.id, id));
    if (!job) return '周期调价任务不存在';
    if (Number(job.rule_status) !== 0) return '只能编辑未开始的周期调价任务';
    const name = String(changes.rule_name || '').trim(), time = localNow(changes.effective_time);
    if (!name) return '请填写任务名称';
    if (!changes.effective_time || !validDate(time.slice(0, 10)) || !validTime(time.slice(11, 16))) return '请填写有效执行时间';
    if (time <= localNow(now)) return '执行时间必须晚于当前演示时间';
    const others = asArray(db.jobs).filter(j => !eq(j.rule_id || j.id, id) && eq(j.salemenu_id, job.salemenu_id));
    if (others.some(j => j.rule_name === name)) return '同一报价单的任务名称已存在';
    if (others.some(j => localNow(j.effective_time) === time)) return '同一报价单的这个执行时间已有任务';
    return '';
  }
  function updateJob(db, id, changes, now) {
    const error = validateJobEdit(db, id, changes, now);
    if (error) return {ok: false, error};
    const job = db.jobs.find(j => eq(j.rule_id || j.id, id));
    job.rule_name = changes.rule_name.trim(); job.effective_time = localNow(changes.effective_time);
    return {ok: true};
  }
  root.GME = {linkedQuotes, linkedCustomers, quoteSkus, resolve, makePlan, applyPlan, validateJobEdit, updateJob, ruleActive};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.GME;
})(typeof window !== 'undefined' ? window : globalThis);
