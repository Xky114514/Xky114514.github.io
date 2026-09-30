(function (global) {
  'use strict';

  // Deliberately bounded demo parser. Ambiguous commands never become executable changes.
  var NUMBER = '(\\d+(?:\\.\\d+)?)';
  var VERBS = '(上涨|上调|涨价|涨|增加|提高|加价|加|下跌|下调|降价|跌|降|减少|降低|减)';
  var SYNONYMS = [['大白菜', '白菜'], ['鲜鸡蛋', '鸡蛋'], ['西红柿', '番茄']];
  function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function positiveVerb(s) { return /^(上涨|上调|涨价|涨|增加|提高|加价|加)$/.test(s); }
  function aliasesFor(item) {
    var aliases = Array.isArray(item.aliases) ? item.aliases.slice() : (item.aliases ? [item.aliases] : []);
    aliases.push(item.name || '');
    SYNONYMS.forEach(function (group) {
      if (aliases.some(function (name) { return group.indexOf(name) !== -1; })) aliases = aliases.concat(group);
    });
    return aliases.filter(Boolean).sort(function (a, b) { return b.length - a.length; });
  }
  function categoryMatches(item, category) {
    var cats = Array.isArray(item.category) ? item.category : [item.category];
    return cats.indexOf(category) !== -1 || (category === '蔬菜' && cats.indexOf('叶菜') !== -1);
  }
  function parse(text, context) {
    context = context || {};
    var input = String(text || '').trim();
    var items = Array.isArray(context.items) ? context.items : [];
    var result = { kind: 'unknown', ids: [], operation: null, value: null, base: null, reason: '', text: input };
    function finish(kind, reason) { result.kind = kind; result.reason = reason; return result; }
    if (!input) return finish('unknown', '请说出要调整的商品和价格。');

    var active = typeof context.activeCustomer === 'object' && context.activeCustomer
      ? (context.activeCustomer.name || context.activeCustomer.id) : context.activeCustomer;
    var customerNames = (context.customerNames || []).map(function (customer) {
      return typeof customer === 'string' ? customer : customer.name;
    }).filter(Boolean);
    var otherCustomer = customerNames.find(function (name) { return name !== active && input.indexOf(name) !== -1; });
    if (otherCustomer) return finish('clarify', '这条需求涉及“' + otherCustomer + '”。请先切换到该客户的报价任务。');

    var filters = [];
    var working = input.replace(/(?:当前(?:执行)?(?:单价|价格|价)|执行(?:价格|价))\s*(高于|低于|大于|小于|超过|不足)\s*[￥¥]?\s*(\d+(?:\.\d+)?)\s*(?:元|块)?/g,
      function (matched, operator, amount) { filters.push({ high: /高于|大于|超过/.test(operator), amount: Number(amount) }); return ' '; });

    // A filter's “当前价” describes its scope, not the calculation base.
    var currentBase = /当前(?:执行)?(?:单价|价格|价)|执行(?:价格|价)/.test(working);
    var draftBase = /草稿(?:价格|价)|我的报价/.test(working);
    result.base = currentBase && !draftBase ? 'current' : (draftBase && !currentBase ? 'draft' : null);

    var operations = [];
    function collect(regex, fn) {
      var match;
      while ((match = regex.exec(working))) {
        var operation = fn(match); operation.start = match.index; operation.raw = match[0];
        operations.push(operation);
      }
    }
    collect(new RegExp(VERBS + '\\s*' + NUMBER + '\\s*[%％]', 'g'), function (m) {
      return { operation: 'percent', value: Number(m[2]) * (positiveVerb(m[1]) ? 1 : -1) };
    });
    collect(new RegExp(VERBS + '\\s*百分之\\s*' + NUMBER, 'g'), function (m) {
      return { operation: 'percent', value: Number(m[2]) * (positiveVerb(m[1]) ? 1 : -1) };
    });
    collect(new RegExp(VERBS + '\\s*[￥¥]?\\s*' + NUMBER + '\\s*(?:元|块)(?:\\s*(?:[/／]|每)\\s*斤)?(?!\\s*[%％])', 'g'), function (m) {
      return { operation: 'delta', value: Number(m[2]) * (positiveVerb(m[1]) ? 1 : -1) };
    });
    collect(/(?:改为|改成|改到|调为|调成|调到|设为|设成|定为|设定为|调整为|调整成|调整到|降到|涨到|报价为|定价为|定价|报价|报)\s*[￥¥]?\s*(-?\d+(?:\.\d+)?)\s*(?:(?:元|块)(?:\s*(?:[/／]|每)\s*斤)?)?/g,
      function (m) { return { operation: 'set', value: Number(m[1]) }; });
    collect(/(?:采用|采纳|使用|应用|按)(?:\s*(?:AI|人工智能))?\s*(?:建议价|倾向价|推荐价|建议)(?:格)?/gi,
      function () { return { operation: 'adopt', value: null }; });
    operations.sort(function (a, b) { return a.start - b.start; });
    if (operations.length) { result.operation = operations[0].operation; result.value = operations[0].value; }

    var questionIndex = working.search(/为什么|为何|原因|解释|缺什么|缺哪些|哪些依据|有什么依据|合理吗|合适吗|怎么定|怎么调|多少钱|建议多少|价格如何/);
    var firstOperation = operations.length ? operations[0].start : Infinity;
    if ((questionIndex !== -1 && questionIndex < firstOperation) || /(?:会怎样|会怎么样|会发生什么|可以吗|行吗|对吗|吗[？?]?)\s*$/.test(working)) {
      return finish('question', '这是解释或咨询需求，不会调整价格。');
    }

    // Match longest complete names first: “小白菜” must not also select “白菜”.
    function tokensIn(values) {
      var unique = Array.from(new Set(values.filter(Boolean))).sort(function (a, b) { return b.length - a.length; });
      if (!unique.length) return [];
      return Array.from(new Set(working.match(new RegExp(unique.map(escapeRegExp).join('|'), 'g')) || []));
    }
    var nameTokens = tokensIn(items.reduce(function (all, item) { return all.concat(aliasesFor(item)); }, []));
    var namedItems = items.filter(function (item) {
      return nameTokens.some(function (name) { return aliasesFor(item).indexOf(name) !== -1; });
    });
    var codeItems = items.filter(function (item) {
      return item.code && new RegExp('(?:^|[^a-z0-9])' + escapeRegExp(item.code) + '(?=$|[^a-z0-9])', 'i').test(working);
    });
    var knownCategories = items.reduce(function (all, item) {
      return all.concat(Array.isArray(item.category) ? item.category : [item.category]);
    }, []);
    // “蔬菜” also includes leaf vegetables even if no item uses that parent category.
    if (knownCategories.indexOf('叶菜') !== -1) knownCategories.push('蔬菜');
    var categories = tokensIn(knownCategories);
    var specTokens = tokensIn((codeItems.length ? codeItems : namedItems.length ? namedItems : items).map(function (item) { return item.spec; }));
    var allSpecs = /(?:全部|所有|各个|各种)规格/.test(working);
    var allScope = /全部|所有|全单|整单/.test(working);
    var nameMatches = namedItems.map(function (item) { return item.id; });
    var hasScope = codeItems.length || nameMatches.length || categories.length || allScope || filters.length;
    result.ids = items.filter(function (item) {
      var scoped = codeItems.length ? codeItems.some(function (coded) { return coded.id === item.id; }) : nameMatches.length || categories.length
        ? nameMatches.indexOf(item.id) !== -1 || categories.some(function (category) { return categoryMatches(item, category); })
        : !!(allScope || filters.length);
      return scoped && (!specTokens.length || specTokens.indexOf(item.spec) !== -1) && filters.every(function (filter) {
        var price = Number(item.current);
        return Number.isFinite(price) && (filter.high ? price > filter.amount : price < filter.amount);
      });
    }).map(function (item) { return item.id; });

    if (!operations.length) {
      if (/查看|展示|看看|依据|风险|建议|价格|报价单|缺|[？?]/.test(input)) return finish('question', '这是查看或咨询需求，不会调整价格。');
      return finish(hasScope ? 'clarify' : 'unknown', '请说明调整方式，例如“大白菜设为 3.5 元”或“叶菜按当前执行价涨 3%”。');
    }
    if (operations.length !== 1 || filters.length > 1) return finish('clarify', '这条需求包含多条调整或筛选规则。请拆开处理，每次预览一条规则。');
    if (currentBase && draftBase) return finish('clarify', '同时提到了执行价和草稿价，请明确本次计算基准。');
    if (!hasScope) return finish('clarify', '请明确商品、分类或“全部商品”，不会默认调整整张报价单。');
    if (categories.length > 1) {
      result.ids = [];
      return finish('clarify', '同时提到了多个分类，请明确一个分类，或在规则筛选中选择具体商品。');
    }
    if ((nameMatches.length || codeItems.length) && categories.length) return finish('clarify', '同时提到了分类和具体商品，请选用一个明确范围，或在规则筛选中选择商品。');
    if (codeItems.length && nameTokens.some(function (name) {
      return !codeItems.some(function (item) { return aliasesFor(item).indexOf(name) !== -1; });
    })) return finish('clarify', '商品编码与名称未对应，请使用准确编码，或在规则筛选中分别勾选商品。');
    if (!codeItems.length && !allSpecs && nameTokens.some(function (name) {
      return namedItems.filter(function (item) {
        return aliasesFor(item).indexOf(name) !== -1 && (!specTokens.length || specTokens.indexOf(item.spec) !== -1);
      }).length > 1;
    })) {
      result.ids = [];
      return finish('clarify', '同名商品包含多个规格，请指定完整规格或商品编码；需要一起调整时请明确“全部规格”。');
    }
    if (/斤/.test(operations[0].raw) && items.some(function (item) {
      return result.ids.indexOf(item.id) !== -1 && item.unit && item.unit !== '斤';
    })) return finish('clarify', '所选商品的计价单位与“元/斤”不一致，请先确认单位。');

    // Remove only grammar we support; leftover nouns catch “白菜和黄瓜” partial matches.
    var residue = working.replace(operations[0].raw, ' ');
    customerNames.concat(active ? [active] : []).sort(function (a, b) { return b.length - a.length; }).forEach(function (name) {
      residue = residue.replace(new RegExp(escapeRegExp(name), 'g'), ' ');
    });
    nameTokens.concat(specTokens, categories).sort(function (a, b) { return b.length - a.length; }).forEach(function (name) {
      residue = residue.replace(new RegExp(escapeRegExp(name), 'g'), ' ');
    });
    codeItems.forEach(function (item) { residue = residue.replace(new RegExp(escapeRegExp(item.code), 'gi'), ' '); });
    residue = residue
      .replace(/协议(?:商品|价格|价|产品)?(?:保持不变|维持不变|不调整|不变|不动)/g, ' ')
      .replace(/(?:再|并|并且)?(?:解释一下|解释|说明一下|说明)(?:原因|依据)/g, ' ')
      .replace(/当前(?:执行)?(?:单价|价格|价)|执行(?:价格|价)|草稿(?:价格|价)|我的报价/g, ' ')
      .replace(/在此基础上|的基础上|为基准|为基础|基础上/g, ' ')
      .replace(/(?:全部|所有|各个|各种)规格|全部商品|所有商品|全部|所有|全单|整单/g, ' ')
      .replace(/麻烦|请帮我|帮我|请|把|将|给|对|按照|按|基于|以|在|客户|商品|产品|价格|单价|报价|每个|每项|分别|统一|一起|进行|调整|一下|的|中|和|与|以及|及|、/g, ' ')
      .replace(/[\s，,。.!！?？：:；;（）()“”"'【】\[\]+\/]+/g, '');
    if (residue) return finish('clarify', '还有未识别的商品或条件：“' + residue.slice(0, 24) + '”。请明确后再预览，避免只调整部分商品。');
    if (!result.ids.length) return finish('clarify', '当前报价单中没有符合条件的商品，请检查名称或筛选条件。');
    if (result.operation === 'set' && result.value <= 0) return finish('clarify', '指定单价需要大于 0 元。');
    if (result.operation === 'percent' && result.value <= -100) return finish('clarify', '降幅会使单价不大于 0，请重新指定调整幅度。');
    if ((result.operation === 'delta' || result.operation === 'percent') && !result.base) {
      return finish('clarify', '请明确按“当前执行价”还是“草稿价”增减，避免重复计算。');
    }
    return finish('adjust', '已识别调整需求，请核对商品范围和变更预览后应用。');
  }
  global.PricingIntent = { parse: parse };
})(typeof window !== 'undefined' ? window : globalThis);
