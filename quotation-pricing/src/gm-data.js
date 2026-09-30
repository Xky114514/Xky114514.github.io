(function (global) {
  'use strict';
  // All records below are deterministic, fictional fixtures. Native amounts and
  // enums are preserved; address_ids and sku_id are explicit local adapters for
  // price-rule addresses and skus[].id, never claims about an API response.
  const specialIds = Object.freeze({
    customers: ['A1', 'A2', 'A3'], salemenus: ['Q1', 'Q2', 'Q3', 'Q4'],
    ordinary: 'Q1-SKU0001', stepped: 'Q1-SKU0002', timing: 'Q1-SKU0003',
    fixedAndFloating: 'Q1-SKU0004', variation: 'Q1-SKU0005',
    sharedRule: 'Q1-SKU0006', overnight: 'Q1-SKU0007',
    box: 'Q1-SKU0008', pack: 'Q1-SKU0009', missing: 'Q1-SKU0010'
  });
  function seed(options) {
    const size = Math.max(10, Math.min(10000, Number(typeof options === 'number' ? options : options && options.size) || 300));
    const db = { schema: 3, fixtureDate: '2026-09-30', station_id: 'ST01',
      customers: [
        { address_id: 'A1', user_id: 'U1', name: '晨禾食堂', customized_code: 'KH001', contact: '陈先生', phone: '138****1001', address: '示例市晨禾路 18 号·食堂收货点', time_config_ids: ['TC01', 'TC02'] },
        { address_id: 'A2', user_id: 'U2', name: '云栖酒店', customized_code: 'KH002', contact: '林女士', phone: '138****1002', address: '示例市云栖路 26 号·酒店收货点', time_config_ids: ['TC01', 'TC02'] },
        { address_id: 'A3', user_id: 'U3', name: '桥头餐厅', customized_code: 'KH003', contact: '周先生', phone: '138****1003', address: '示例市桥头路 36 号·餐厅收货点', time_config_ids: ['TC01', 'TC03'] }
      ],
      accounts: [
        { user_id: 'U1', pay_method: 3, settle_way: 1, settle_date_type: 1, begin_day: 1, settle_day: 5 },
        { user_id: 'U2', pay_method: 2, settle_way: 1, settle_date_type: 2, begin_day: 1, settle_day: 5 },
        { user_id: 'U3', pay_method: 4, settle_way: 1, settle_date_type: 1, cycle_length: 14, delay_day: 3, effective_date: '2026-09-01', begin_day: null, settle_day: null }
      ],
      salemenus: [
        { id: 'Q1', name: '日常配送报价单', is_active: true, fee_type: 'CNY', time_config: { id: 'TC01', name: '上午运营' }, type: 4 },
        { id: 'Q2', name: '食堂补充报价单', is_active: true, fee_type: 'CNY', time_config: { id: 'TC02', name: '下午运营' }, type: 4 },
        { id: 'Q3', name: '酒店精选报价单', is_active: true, fee_type: 'CNY', time_config: { id: 'TC02', name: '下午运营' }, type: 4 },
        { id: 'Q4', name: '外币商品报价单', is_active: true, fee_type: 'USD', time_config: { id: 'TC03', name: '外币运营' }, type: 4 }
      ],
      links: [
        ['A1', 'Q1'], ['A1', 'Q2'], ['A2', 'Q1'], ['A2', 'Q3'], ['A3', 'Q1'], ['A3', 'Q4']
      ].map(([restaurant_id, salemenu_id]) => ({ restaurant_id, station_id: 'ST01', salemenu_id })),
      skus: [], rules: [], snapshots: [], market: [], customerAnalysis: [], recentOrders: [], jobs: []
    };
    const catalog = [
      ['大白菜', '净菜', '斤', '斤', 1, '叶菜', 'C21', 500],
      ['土豆', '一级', '公斤', '公斤', 1, '根茎', 'C22', 640],
      ['鲈鱼', '鲜活', '斤', '斤', 1, '水产', 'C25', 0],
      ['鲜鸡蛋', 'M级散装', '斤', '斤', 1, '蛋类', 'C23', 760],
      ['西红柿', '一级', '斤', '斤', 1, '果菜', 'C24', 520],
      ['黄瓜', '一级', '公斤', '公斤', 1, '果菜', 'C24', 800],
      ['生菜', '精选', '斤', '斤', 1, '叶菜', 'C21', 580],
      ['胡萝卜', '10公斤/箱', '箱', '公斤', 10, '根茎', 'C22', 4800],
      ['豆腐', '0.5公斤/包', '包', '公斤', 0.5, '豆制品', 'C26', 350],
      ['香菇', '散装', '斤', '斤', 1, '菌菇', 'C27', 1300],
      ['苹果', '一级', '公斤', '公斤', 1, '水果', 'C28', 1180],
      ['菠菜', '净菜', '斤', '斤', 1, '叶菜', 'C21', 650],
      ['白萝卜', '一级', '公斤', '公斤', 1, '根茎', 'C22', 460],
      ['鸡胸肉', '冷鲜', '公斤', '公斤', 1, '肉禽', 'C29', 2460],
      ['金针菇', '200克/包', '包', '公斤', 0.2, '菌菇', 'C27', 240],
      ['香蕉', '一级', '公斤', '公斤', 1, '水果', 'C28', 920],
      ['南瓜', '一级', '公斤', '公斤', 1, '果菜', 'C24', 520],
      ['青椒', '一级', '斤', '斤', 1, '果菜', 'C24', 630],
      ['蒜苗', '精选', '斤', '斤', 1, '叶菜', 'C21', 730],
      ['洋葱', '一级', '公斤', '公斤', 1, '根茎', 'C22', 550]
    ];
    db.salemenus.forEach((menu, mi) => {
      const count = mi === 0 ? size : 48;
      for (let i = 1; i <= count; i++) {
        const base = catalog[(i - 1) % catalog.length], batch = Math.floor((i - 1) / catalog.length);
        const [name, spec, unit, std, ratio, category, categoryId, rawPrice] = base;
        const timing = mi === 0 && i === 3;
        const price = timing ? 0 : Math.round((rawPrice || 1580) * (mi === 3 ? 0.16 : 1) + mi * 13 + batch * 7);
        const stdPrice = Math.round(price / ratio * 100) / 100;
        const missing = i % 31 === 0 || i === 10;
        const sku = {
          sku_id: menu.id + '-SKU' + String(i).padStart(4, '0'), salemenu_id: menu.id,
          sku_name: name, spu_id: 'SPU' + String((i - 1) % catalog.length + 1).padStart(4, '0'),
          outer_id: menu.id + '-' + String(i).padStart(4, '0'),
          specification_desc: spec + (batch ? ' · 规格' + (batch + 1) : ''),
          sale_unit_name: unit, std_unit_name: std, std_unit_name_forsale: std,
          sale_ratio: ratio, std_ratio: 1, sale_price: price, std_sale_price_forsale: stdPrice,
          fee_type: menu.fee_type,
          latest_purchase_price: missing ? null : Math.round((timing ? 1300 : stdPrice * 0.78)),
          last_purchase_price: missing ? null : Math.round((timing ? 1280 : stdPrice * 0.76)),
          attrition_rate: missing ? null : (category === '叶菜' ? 5 : category === '根茎' ? 3 : 0),
          category_name_1: ['水产', '肉禽', '蛋类'].includes(category) ? '鲜品' : '生鲜食材',
          category_name_2: category, category_id_2: categoryId, state: 2,
          is_price_timing: timing ? 1 : 0, is_step_price: mi === 0 && i === 2 ? 1 : 0,
          step_price_table: mi === 0 && i === 2 ? [
            { index: 0, min: 0, max: 20, step_sale_price: 640, step_std_price: 640 },
            { index: 1, min: 20, max: 50, step_sale_price: 610, step_std_price: 610 },
            { index: 2, min: 50, max: '', step_sale_price: 590, step_std_price: 590 }
          ] : [],
          suggest_price_min: missing || timing ? null : Math.round(stdPrice * 0.88),
          suggest_price_max: missing || timing ? null : Math.round(stdPrice * 1.18)
        };
        db.skus.push(sku);
        // Sparse actual change records, never fabricated daily closing prices.
        if (!timing && i % 17 !== 0) {
          const changeDates = i % 3 === 0 ? ['2026-09-24T08:00:00+08:00', '2026-09-28T09:30:00+08:00'] : ['2026-09-26T08:30:00+08:00'];
          changeDates.forEach((time, index) => {
            const sale = index === changeDates.length - 1 ? price : Math.max(1, price - 20);
            db.snapshots.push({ sku_id: sku.sku_id, modify_time: time, next_modify_time: changeDates[index + 1] || null,
              sale_price: sale, std_sale_price_forsale: Math.round(sale / ratio * 100) / 100,
              sale_unit_name: unit, std_unit_name_forsale: std, sale_ratio: ratio });
          });
        }
        // Market amounts retain platform yuan/unit. Q4 deliberately has no
        // implicit FX mapping or fabricated USD market data.
        if (mi !== 3 && i % 7 !== 0 && !missing) {
          const marketPrice = Math.round(((timing ? 1450 : stdPrice) / 100) * 0.92 * 100) / 100;
          const productId = 'XFD-' + sku.spu_id;
          db.market.push({ sku_id: sku.sku_id, default_product_id: productId, matched_products: [
            { product_id: productId, source_platform_name: '新发地', sku_name: name,
              standard: '平台规格：' + base[1], unit_name: std, market_price_avg: marketPrice,
              market_price_max: Number((marketPrice + 0.4).toFixed(2)),
              market_price_min: i % 19 === 0 ? null : Number(Math.max(0.01, marketPrice - 0.3).toFixed(2)),
              record_date: Date.parse('2026-09-29T08:00:00+08:00') }
          ] });
        } else db.market.push({ sku_id: sku.sku_id, default_product_id: null, matched_products: [] });
      }
    });
    const rule = (id, name, salemenu_id, address_ids, skus, extra) => Object.assign({
      id, name, type: 'customer', salemenu_id, address_ids, rule_object_type: 1, skus,
      begin: '2026-09-01', end: '2026-10-31', begin_time: '00:00', end_time: '23:59',
      time_limit: 2, locking_price_unit: 0, status: 3
    }, extra || {});
    db.rules = [
      rule('R-FIXED-A1', '晨禾鸡蛋固定价', 'Q1', ['A1'], [{ sku_id: 'Q1-SKU0004', rule_type: 0, yx_price: 740 }]),
      rule('R-MULTIPLE-A2', '云栖鸡蛋倍率价', 'Q1', ['A2'], [{ sku_id: 'Q1-SKU0004', rule_type: 2, yx_price: 95 }]),
      rule('R-VARIATION-A1', '晨禾西红柿加价', 'Q1', ['A1'], [{ sku_id: 'Q1-SKU0005', rule_type: 1, yx_price: 30 }]),
      rule('R-SHARED', '晨禾与云栖黄瓜统一价', 'Q1', ['A1', 'A2'], [{ sku_id: 'Q1-SKU0006', rule_type: 0, yx_price: 780 }]),
      rule('R-NIGHT-A1', '晨禾生菜夜间价格', 'Q1', ['A1'], [{ sku_id: 'Q1-SKU0007', rule_type: 0, yx_price: 550 }], { begin_time: '22:00', end_time: '06:00', time_limit: 1 }),
      rule('R-BASIC-A3', '桥头胡萝卜基本单位价', 'Q1', ['A3'], [{ sku_id: 'Q1-SKU0008', rule_type: 0, yx_price: 450 }], { locking_price_unit: 1 }),
      rule('R-CATEGORY-A1', '晨禾水果分类加价', 'Q2', ['A1'], [], { rule_object_type: 2, category_2_list: [{ category_2_id: 'C28', rule_type: 1, yx_price: 20 }] }),
      rule('R-SPU-A2', '云栖苹果上浮率', 'Q3', ['A2'], [], { rule_object_type: 3, price_type: 1, spus: [{ spu_id: 'SPU0011', rule_type: 2, yx_price: 105 }] }),
      rule('R-ORDER-A3', '桥头外币整单折扣', 'Q4', ['A3'], [], { rule_object_type: 4, change_rate: 98, begin: '2026-10-01', end: '2026-10-31', status: 2 }),
      rule('R-EXPIRED-A2', '云栖九月初叶菜价', 'Q3', ['A2'], [{ sku_id: 'Q3-SKU0001', rule_type: 0, yx_price: 510 }], { end: '2026-09-10', status: 1 }),
      rule('R-CLOSED-A3', '桥头暂停的豆腐价', 'Q4', ['A3'], [{ sku_id: 'Q4-SKU0009', rule_type: 0, yx_price: 98 }], { status: 0 })
    ];
    // /station_statistics/order/customers_analysis returns modelValues[].kv.
    // grpc_client/client.py strips `_alias` and stringifies these native keys.
    // The envelope is local query context; figures are fixture response values,
    // not a frontend aggregation of recentOrders and not renamed API fields.
    const analysis = [
      ['A1', '26', '48320.50', '48800.50'], ['A2', '41', '98650.25', '99520.75'], ['A3', '18', '21780.00', '21998.00']
    ];
    analysis.forEach(([address_id, old_order_id, account_price, order_price], ci) => {
      db.customerAnalysis.push({ address_id, time_field: 'order_time', begin: '2026-09-01', end: '2026-09-30',
        kv: { shop_id: address_id, old_order_id, account_price, order_price } });
      for (let i = 0; i < 12; i++) {
        const price = Number((750 + ci * 395 + (i * 173.47) % 1700).toFixed(2));
        db.recentOrders.push({ address_id, time_config_id: 'TC01', id: 'DD202609' + String(29 - i * 2).padStart(2, '0') + '-' + address_id,
          date_time_str: '2026-09-' + String(29 - i * 2).padStart(2, '0') + ' 08:30',
          origin_total_price: price, sale_outstock_price: Number((price - 12.5).toFixed(2)),
          merchandise_count: 8 + (i % 10), order_process_type_id: 1 });
      }
    });
    db.jobs = [
      { rule_id: 'JOB-001', rule_name: '十月日常报价单调价', salemenu_id: 'Q1', effective_time: '2026-10-01T06:00', rule_status: 0,
        creator: '演示操作员', create_time: '2026-09-29 15:00', last_operator: '演示操作员', modify_time: '2026-09-29 15:00', abnormal_status: 0, task_id: null, task_result: null },
      { rule_id: 'JOB-002', rule_name: '食堂补充单九月调价', salemenu_id: 'Q2', effective_time: '2026-09-28T06:00', rule_status: 1,
        creator: '演示操作员', create_time: '2026-09-27 15:00', last_operator: '演示操作员', modify_time: '2026-09-28 06:01', abnormal_status: 0, task_id: 'TASK-DEMO-002', task_result: '演示执行记录：已完成' },
      { rule_id: 'JOB-003', rule_name: '酒店九月上旬调价', salemenu_id: 'Q3', effective_time: '2026-09-10T06:00', rule_status: 2,
        creator: '演示操作员', create_time: '2026-09-09 15:00', last_operator: '演示操作员', modify_time: '2026-09-11 09:00', abnormal_status: 0, task_id: 'TASK-DEMO-003', task_result: '演示执行记录：已结束' },
      { rule_id: 'JOB-004', rule_name: '外币商品待执行任务', salemenu_id: 'Q4', effective_time: '2026-09-29T06:00', rule_status: 0,
        creator: '演示操作员', create_time: '2026-09-28 15:00', last_operator: '演示操作员', modify_time: '2026-09-29 06:01', abnormal_status: 1, task_id: 'TASK-DEMO-004', task_result: '演示执行记录：任务未完成，需检查执行结果' }
    ];
    return db;
  }
  function currencyName(value) { return ({ CNY: '人民币', USD: '美元' })[value] || value || '—'; }
  global.GMD = { seed, currencyName, specialIds };
})(window);
