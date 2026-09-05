(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const fillRows = (id, rows) => { const node = document.getElementById(id); if (node) node.innerHTML = rows.map(cells => `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join(''); };
  const tag = (text, color = '') => `<span class="tag ${color}">${text}</span>`;
  const toggle = on => `<span class="toggle${on ? ' on' : ''}"></span>`;
  const helpTip = (text, label = '查看字段说明') => `<span class="field-help" tabindex="0" role="button" data-help="${String(text).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" aria-label="${label}">?</span>`;
  const tableFieldHelp = {
    '优先级':'使用颜色圆点区分异常处理紧急度：红色为高、橙色为中、蓝色为低。',
    '当前值':'触发异常时采集到的实时或当前周期数据。',
    '当前状态':'触发异常时系统检测到的实际状态。',
    '参考值':'用于判断是否异常的阈值、历史值或期望状态。',
    '异常说明':'说明本行为什么进入异常列表以及建议关注的业务影响。',
    '错误摘要':'最近一次系统或配置异常返回的关键信息。',
    '异常时间':'该异常最近一次满足触发条件的时间。',
    '录单版本':'租户当前启用的录单流程版本。',
    'Station':'外部业务系统中的站点标识，用于数据归属与同步。',
    'Group':'租户在对接平台中的业务分组标识。',
    '信道类型':'租户接收订单消息所使用的接入方式。',
    '通知群':'接收异常、任务及运营提醒的群聊。',
    '总额度':'租户当前生效的可用额度总量。',
    '已用':'当前额度周期内已经消耗的额度。',
    '剩余':'总额度扣除已使用额度后的可用余额。',
    '使用率':'已使用额度占总额度的比例。',
    '已收':'合同金额中已确认到账的金额。',
    '未收':'合同金额中尚未确认到账的应收金额。',
    '退款':'当前合同关联的累计退款金额。',
    '提交任务数':'已成功提交的任务数；单元格下方同时展示任务总数。',
    '提交比例':'成功提交任务数占全部任务数的比例。',
    '提交商品数':'识别结果中的有效商品行数与原始商品行总数。',
    '商品识别率':'正确识别的商品行数占全部商品行数的比例。',
    '数量识别率':'正确识别数量的商品行数占全部商品行数的比例。',
    '备注识别率':'正确识别备注的商品行数占全部商品行数的比例。',
    '图片订单数':'当前统计周期内，以图片作为主要原始内容的订单数。',
    '图片占比':'图片订单数占全部提交订单数的比例，支持点击表头排序。',
    '原因标签':'系统或人工为问题案例确认的标准原因，可多选。',
    '归因状态':'区分待归因、归因中、已归因与归因失败。',
    '归因来源':'显示当前有效归因来自 AI 还是人工复核。',
    'AI置信度':'AI 对当前原因判断的可信程度；人工归因不展示该值。',
    '判断依据':'AI 或人工确认原因标签时使用的关键证据摘要。',
    '问题案例数':'商品识别率低于设定阈值的问题案例数，按案例去重。',
    '主要原因':'该租户问题案例中出现次数最多的原因标签。',
    '平均识别率':'当前筛选范围内问题案例的商品平均识别率。',
    '总 Token 数 (M)':'Prompt 与 Completion Token 之和，以百万为单位。',
    'Prompt Tokens (M)':'发送给模型的输入 Token 数，以百万为单位。',
    'Completion Tokens (M)':'模型生成内容使用的输出 Token 数，以百万为单位。',
    '每行 Token':'总 Token 数除以成功提交的商品行数。',
    '平均语音时长':'成功发起识别的语音平均时长。',
    'temperature':'控制模型输出随机性；数值越低，结果通常越稳定。',
    'max_tokens':'单次模型生成允许使用的最大输出 Token 数。',
    '思考强度':'控制模型推理投入程度，具体能力取决于所选模型。',
    '实际生效':'综合租户、群级、系统默认及环境变量后最终使用的配置。',
    '凭证':'供应商访问凭证的脱敏摘要及区域信息。',
    '引擎/资源':'语音识别供应商实际调用的引擎或资源标识。',
    'API Key':'Bridge 调用平台服务时使用的访问密钥，页面仅显示脱敏值。',
    '环境':'区分生产、测试等 Bridge 运行环境。',
    '自动绑定':'启用后，新发现的来源群聊会自动绑定到当前 Bridge。',
    '来源信道':'允许通过当前 Bridge 接入的上游信道。',
    '群聊数量':'当前 Bridge 已关联的群聊总数。',
    '过期时间':'API Key 或 Bridge 授权失效的时间。',
    '展示排序':'数值越小，在原因标签选择器中的展示位置越靠前。',
    '适用类型':'限定标签可用于文本、图片、文件或全部内容类型。',
    '启用状态':'停用后不再用于新案例归因，但历史案例仍保留。',
    '近 30 天案例':'最近 30 天内使用该原因标签的案例数量。',
    '主要内容':'该原因在当前租户中最集中的订单内容类型。',
    '近期情况':'结合发生频率、时间和内容给出的近期问题概述。'
  };
  $$('.data-table th').forEach(header => {
    const key = header.textContent.replace(/[⇅↓↑]/g,'').trim();
    if (tableFieldHelp[key] && !header.querySelector('.field-help')) header.insertAdjacentHTML('beforeend', helpTip(tableFieldHelp[key], `查看${key}说明`));
  });

  const quotaNames = ['yyysl01','hzcg','郑州市好鲜升食品配送有限公司','cbfc56','jinwang','gmstest141'];
  fillRows('quotaRows', quotaNames.map(name => [
    `<b>${name}</b><small>${name}</small>`, '0', '0', '<span class="red-text">0</span>',
    '<div class="progress-cell"><span class="progress"><i style="width:0%"></i></span><span>0%</span></div>', tag('正常','green'),
    '<a>ⓢ 充值</a><a>◷ 记录</a><a>扣减</a>'
  ]));

  fillRows('contractRows', [
    ['杭州艺禾供应链','充值',tag('无金额'),'¥0.00','¥0.00','¥0.00','¥0.00','2026-08-31','何嘉庆','0','<a>编辑</a><a class="danger">删除</a>'],
    ['灵武市德利鲜蔬菜配送','充值',tag('全额收款','green'),'¥10000.00','¥10000.00','¥0.00','¥0.00','2026-08-29','况琴','0','<a>编辑</a><a class="danger">删除</a>'],
    ['无锡腾之锋生鲜','充值',tag('全额收款','green'),'¥30000.00','¥30000.00','¥0.00','¥0.00','2026-08-26','王荣华','0','<a>编辑</a><a class="danger">删除</a>'],
    ['蚌埠菜易购商贸有限公司','充值',tag('全额收款','green'),'¥50000.00','¥50000.00','¥0.00','¥0.00','2026-08-23','王洋','0','<a>编辑</a><a class="danger">删除</a>'],
    ['深圳市湘鲜鲜农业科技有限公司','充值',tag('未收款'),'¥8000.00','¥0.00','<span class="gold">¥8000.00</span>','¥0.00','2026-08-22','付星星','0','<a>编辑</a><a class="danger">删除</a>'],
    ['佛山市农香贸易有限公司','充值',tag('全额收款','green'),'¥10000.00','¥10000.00','¥0.00','¥0.00','2026-08-16','林灿飞','0','<a>编辑</a><a class="danger">删除</a>'],
    ['四川岷丰','充值',tag('全额收款','green'),'¥50000.00','¥50000.00','¥0.00','¥0.00','2026-08-12','冷俣兵','0','<a>编辑</a><a class="danger">删除</a>'],
    ['江苏聚宝生态农业发展有限公司','充值',tag('全额收款','green'),'¥50000.00','¥50000.00','¥0.00','¥0.00','2026-07-29','吴开河','0','<a>编辑</a><a class="danger">删除</a>']
  ]);

  const priority = level => `<span class="priority ${level === '高' ? 'high' : level === '中' ? 'medium' : 'low'}" aria-label="${level}优先级" title="${level}优先级"><i></i></span>`;
  const dashboardActionMap = {
    '转正式':'convert-tenant', '调整额度':'adjust-quota', '调整试用期':'extend-trial', '查看合同':'view-contract',
    '查看案例':'view-cases', '查看群聊':'view-groups', '进入信道设置':'channel-config', '查看错误':'view-sync-error',
    '重新同步':'retry-sync', '立即同步':'retry-sync', '修改通知配置':'notification-config', '编辑租户配置':'tenant-config'
  };
  const actionLinks = (actions, tenant, alertType) => actions.map(([label]) => {
    if (label === '查看租户' || label === '租户分析') return `<button class="table-action" data-action="tenant-drill" data-tenant="${tenant}">${label}</button>`;
    return `<button class="table-action" data-action="dashboard-operation" data-operation="${dashboardActionMap[label] || 'quick-action'}" data-label="${label}" data-tenant="${tenant}" data-alert-type="${alertType}">${label}</button>`;
  }).join('');
  const alertSummary = (id, values) => {
    const node = document.getElementById(id);
    if (node) node.innerHTML = values.map(([label, value, level]) => `<div class="alert-stat ${level}"><span>${label}</span><b>${value}</b><small>条异常</small></div>`).join('');
  };
  const alertRows = rows => rows.map(row => [
    priority(row[0]), `<button class="link-button tenant-drill" data-action="tenant-drill" data-tenant="${row[1]}">${row[1]}</button>`, tag(row[2], row[0] === '高' ? 'red' : row[0] === '中' ? 'orange' : 'blue'),
    `<b>${row[3]}</b>`, row[4], row[5], row[6], `<span>${row[7]}</span>`, actionLinks(row[8], row[1], row[2])
  ]);

  alertSummary('trialSummary', [['试用未使用','2','high'],['试用额度耗尽','1','high'],['试用即将到期','3','medium'],['试用已经到期','2','high']]);
  fillRows('trialAlertRows', alertRows([
    ['高','贵州省绿色农产品','试用未使用','连续 4 天无有效订单','连续 3 天','试用开始后尚未产生有效订单','2026-09-04 09:20','肖紫薇',[['查看租户'],['转正式','toast']]],
    ['高','阜阳市优佳香学生营养餐','试用额度耗尽','今日剩余 0','应大于 0','试用额度已耗尽，录单能力受限','2026-09-04 08:45','林灿飞',[['调整额度','toast']]],
    ['中','上海湘巨农副产品','试用即将到期','剩余 3 小时','预警周期 24 小时','试用即将结束，建议确认转化意向','2026-09-04 10:03','付星星',[['转正式','toast'],['调整试用期','toast']]],
    ['高','海南鲜配达','试用已经到期','已到期 2 天','仍为试用状态','试用结束后仍未转为正式','2026-09-03 18:40','肖紫薇',[['转正式','toast'],['查看租户']]]
  ]));

  alertSummary('quotaContractSummary', [['正式额度不足','2','high'],['正式额度耗尽','1','high'],['即将续费','1','medium'],['合同到期/应收','2','low']]);
  fillRows('quotaContractAlertRows', alertRows([
    ['高','菜怡怡','正式额度不足','剩余 9 / 使用率 99%','阈值 20%','按当前日均用量预计 1 天后耗尽','2026-09-04 10:16','林灿飞',[['调整额度','toast'],['查看租户']]],
    ['高','四川箫丰林商贸有限公司-甘孜','正式额度耗尽','剩余额度 0','应大于 0','正式额度已耗尽','2026-09-04 08:12','肖紫薇',[['调整额度','toast']]],
    ['中','深圳市湘鲜鲜农业科技有限公司','即将续费','合同剩余 12 天','续费提醒 30 天','合同即将结束，当前可用额度 47,051.5','2026-09-04 09:44','付星星',[['查看合同','toast']]],
    ['低','深圳市湘鲜鲜农业科技有限公司','合同应收异常','未收 ¥8,000','合同到期前应收清','合同存在到期未收款项','2026-09-03 17:30','付星星',[['查看合同','toast']]],
    ['高','温州萝卜伯电子商务有限公司','合同已到期','到期 3 天未续签','合同状态应有效','合同结束且尚未完成续签','2026-09-03 09:12','肖紫薇',[['查看合同','toast']]],
    ['高','武汉田野','预计额度不足','预计可用 6 天','合同剩余 21 天','按近期日均用量预计无法使用到合同结束','2026-09-04 10:28','肖紫薇',[['调整额度','toast']]]
  ]));

  alertSummary('usageEffectSummary', [['识别质量','3','medium'],['提交质量','2','medium'],['订单趋势','3','low'],['使用活跃','2','medium']]);
  fillRows('usageEffectAlertRows', alertRows([
    ['中','赤峰嘉航蔬菜有限责任公司','商品识别率过低','61.3%','告警阈值 70%','当前周期商品识别率低于设定阈值','2026-09-04 10:46','佘卓杰',[['租户分析'],['查看案例','toast']]],
    ['中','四川箫丰林商贸有限公司','识别率明显下降','72.4%','上周期 86.8%','相比上一周期下降 14.4%','2026-09-04 10:10','林灿飞',[['租户分析']]],
    ['中','宁波市奉化锦屏绿苑配菜有限公司','提交成功率过低','33.3%','告警阈值 80%','已提交任务数 / 总任务数低于阈值','2026-09-04 09:51','林灿飞',[['查看案例','toast']]],
    ['低','北京圣源鑫食品销售有限公司','订单量骤减','0 单','前 7 天 12 单','最近 7 天订单量低于前 7 天的 50%','2026-09-04 08:30','肖紫薇',[['查看租户']]],
    ['中','马咀优选生鲜供应链','用量异常增长','今日 394 次','近期日均 126 次','当日调用量超过近期日均值 3 倍','2026-09-04 11:02','付星星',[['租户分析']]],
    ['低','合家康','群使用率过低','在用 9 / 绑定 51','近 30 天在用率 17.6%','绑定群较多，但实际下单群占比过低','2026-09-04 07:54','林灿飞',[['查看群聊','toast']]],
    ['中','深圳乐颐食品','失败任务增加','今日 19 个','昨日 4 个','当前周期失败任务数量明显增加','2026-09-04 11:24','李希希',[['查看案例','toast']]],
    ['低','江苏聚宝生态农业发展有限公司','连续下降','连续 5 日下降','历史日均 28 单','订单量连续多日下降','2026-09-04 08:36','吴开河',[['租户分析']]],
    ['中','海南鲜配达','长时间无订单','连续 8 天无订单','正式租户应持续活跃','正式租户连续多日没有有效订单','2026-09-04 07:40','肖紫薇',[['查看租户']]],
    ['中','浙江菜妞','已付费未上线','已签合同 18 天','上线标准 14 天','已充值并签约，但尚未达到上线标准','2026-09-03 16:22','林灿飞',[['查看租户']]]
  ]));

  alertSummary('systemConfigSummary', [['信道异常','2','high'],['群聊静音','1','high'],['同步异常','2','high'],['配置异常','1','low']]);
  fillRows('systemConfigAlertRows', alertRows([
    ['高','测试桥接1318','信道停用或断开','桥接信道离线','信道应在线','租户绑定信道当前不可用','2026-09-04 10:18','实施-王洋',[['进入信道设置','toast']]],
    ['高','广州荟鲜惠绿','群聊静音','关键群已静音','关键群应启用','录单消息无法正常进入处理队列','2026-09-04 09:36','实施-李希希',[['查看群聊','toast']]],
    ['高','赤峰嘉航蔬菜有限责任公司','数据同步失败','最近同步：失败','最近同步应成功','订单同步返回字段校验错误','2026-09-04 10:44','实施-佘卓杰',[['查看错误','toast'],['重新同步','toast']]],
    ['高','江苏聚宝生态农业发展有限公司','长时间未同步','18 小时未成功','最大间隔 6 小时','超过规定时间没有成功同步','2026-09-04 08:00','实施-吴开河',[['立即同步','toast']]],
    ['低','上海湘巨农副产品','通知配置异常','未配置通知群','应配置有效通知群','异常提醒无法触达客户负责人','2026-09-04 07:32','实施-付星星',[['修改通知配置','toast']]],
    ['高','辽宁皓盈食品配送有限公司','对接配置缺失','Station 未配置','平台凭证应完整','平台凭证或必要配置不完整','2026-09-04 06:58','实施-王洋',[['编辑租户配置','toast']]]
  ]));

  const merchantBody = $('.tenant-table tbody');
  if (merchantBody) merchantBody.insertAdjacentHTML('beforeend', '<tr><td><b>上海湘巨农副产品</b><small>trial-tenant-20260904 ▣</small></td><td><span class="tag blue">试用</span></td><td>V1　⌄</td><td>T908241</td><td>2981</td><td><span class="tag blue">共享</span></td><td>运营通知群</td><td>试用管理员</td><td>陈经理</td><td>138****6210</td><td><button class="table-action" data-action="toast">转正式</button><button class="table-action" data-action="tenant-drill" data-tenant="上海湘巨农副产品">查看租户</button></td></tr>');

  const templates = [
    ['通用诊断','预识别指令','通用','不确定具体问题时使用：从样例中诊断有证据的客户差异，只生成增量规则。','# 通用差异诊断维度 ## 观察目标 从样例中寻找系统默认规则之外…','2026-07-30 09:35'],
    ['分组/分单诊断','预识别指令','分单规则','分析门店、日期、人群、备注标签和显式分单标记，支持多轴组合。','# 分组/分单诊断维度 ## 观察信号 1. 门店轴：门店标题…','2026-07-30 09:35'],
    ['防误拆/合单诊断','预识别指令','合单规则','识别空行、品类标题、人名、餐次等假边界，同时保留真实分组信号。','# 防误拆/合单诊断维度 ## 观察目标 找出样例中容易被误认为…','2026-07-30 09:35'],
    ['行式/横向配对诊断','预识别指令','横向识别','分析一行一商品的字段配对；不适用于多门店矩阵数量列。','# 行式/横向配对诊断维度 ## 适用版式 每一数据行代表…','2026-07-30 09:35'],
    ['并排商品块/竖读诊断','预识别指令','竖向识别','分析多个独立商品清单并排时的块边界和块内读取顺序。','# 并排商品块/竖读诊断维度 ## 适用版式 页面由两…','2026-07-30 09:35'],
    ['数量语义诊断','预识别指令','数量读取','分析数量位置、空白/模糊、手写覆盖、同上和加号语义，不做单位换算。','# 数量语义诊断维度 ## 观察内容 - 数量来源：同行…','2026-07-30 09:35'],
    ['门店/日期来源诊断','预识别指令','门店/日期','分析门店和收货日期的稳定来源、优先级、分段作用及噪声排除。','# 门店/日期来源诊断维度 ## 门店证据 观察门店来源…','2026-08-11 16:49'],
    ['矩阵/多门店分栏诊断','预识别指令','矩阵分栏','分析商品行与多门店/多日期数量列的矩阵结构和组合分组。','# 矩阵/多门店分栏诊断维度 ## 适用版式 商品位于…','2026-07-30 09:35'],
    ['供应商/区域筛选诊断','预识别指令','范围筛选','分析多供应商、多区域表中目标提取范围及汇总/噪声排除。','# 供应商/区域筛选诊断维度 ## 观察内容 - 表格是…','2026-07-30 09:35'],
    ['加号数量语义诊断','预识别指令','加号数量','判断同商品加号数量应求和还是拆成多行；证据不足时不擅自决定。','# 加号数量语义诊断维度 ## 需要确认的问题 同一商…','2026-07-30 09:35'],
    ['分组/分单规则','通用规则','分单规则','按门店、日期、人群和显式分单标记建立订单组。','# 客户分组/分单补充规则 ## 适用条件 订单中出现…','2026-07-30 09:35']
  ];
  fillRows('templateRows', templates.map((r,i) => [`<b>${r[0]}</b>`,tag(r[1], i>9?'green':'blue'),tag(r[2], ['orange','green','red','blue'][i%4]),r[3],`<div class="template-preview">${r[4]}</div>`,toggle(true),r[5],'<a>编辑</a><a>删除</a>']));

  const toolbar = (caseMode = false) => `<div class="toolbar-dates"><button class="active">${caseMode?'今天':'今日'}</button><button>${caseMode?'昨天':'昨日'}</button><button>本周</button><button>上周</button><button>本月</button><button>自定义</button></div><span class="toolbar-label">订阅状态 <button class="select">不限⌄</button></span><span class="toolbar-label">上线阶段 <button class="select">不限⌄</button></span><span class="toolbar-label">CSM售后 <button class="select">不限⌄</button></span>${caseMode?'<span class="toolbar-label">商品识别率区间 <button class="select">不限⌄</button></span><span class="toolbar-label">数量识别率区间 <button class="select">不限⌄</button></span>':'<button class="btn primary export-btn"><svg><use href="#i-download"/></svg>导出 Excel</button>'}`;
  ['salesToolbar','purchaseToolbar'].forEach(id => document.getElementById(id).innerHTML = toolbar(false));
  ['salesCaseToolbar','purchaseCaseToolbar'].forEach(id => document.getElementById(id).innerHTML = toolbar(true));

  const metrics = (values) => values.map(([label,value,sub]) => `<div><span>${label}</span><b>${value}</b>${sub?`<small>${sub}</small>`:''}</div>`).join('');
  $('#salesMetrics').innerHTML = metrics([['下单租户数','52'],['下单群聊数','367'],['下单客户数','517'],['提交订单数','710'],['商品识别率','87.0%','9073/10428'],['数量识别率','81.5%','8497/10428'],['备注识别率','73.5%','7661/10428']]);
  $('#purchaseMetrics').innerHTML = metrics([['下单租户数','3'],['下单群聊数','2'],['下单客户数','0'],['提交订单数','3'],['商品识别率','80.0%','68/85'],['数量识别率','9.4%','8/85'],['备注识别率','9.4%','8/85']]);

  const rankData = {
    sales: [
      { tenant:'灵武市德利鲜蔬菜配送', status:'正式', csm:'林灿飞', orders:107, chats:54, customers:82, tasks:'72 / 87', submit:'82.8%', products:'1087/1199', productRate:90.7, quantityRate:85.6, imageOrders:42, imageShare:39.3, noteRate:83.9 },
      { tenant:'重庆桉禾萍', status:'正式', csm:'肖紫薇', orders:54, chats:23, customers:28, tasks:'50 / 52', submit:'96.2%', products:'919/1002', productRate:91.7, quantityRate:87.1, imageOrders:31, imageShare:57.4, noteRate:84.5 },
      { tenant:'四川箫丰林商贸有限公司', status:'正式', csm:'林灿飞', orders:48, chats:26, customers:30, tasks:'39 / 55', submit:'70.9%', products:'544/643', productRate:84.6, quantityRate:80.7, imageOrders:37, imageShare:77.1, noteRate:73.3 },
      { tenant:'武汉田野', status:'正式', csm:'肖紫薇', orders:42, chats:22, customers:37, tasks:'36 / 37', submit:'97.3%', products:'668/764', productRate:87.4, quantityRate:83.0, imageOrders:0, imageShare:0, noteRate:75.0 },
      { tenant:'广东华记蔬菜有限公司（净菜）', status:'试用', csm:'李希希', orders:0, chats:0, customers:0, tasks:'0 / 0', submit:'—', products:'—', productRate:null, quantityRate:null, imageOrders:null, imageShare:null, noteRate:null }
    ],
    purchase: [
      { tenant:'赤峰嘉航蔬菜有限责任公司', status:'正式', csm:'佘卓杰', orders:2, chats:1, customers:0, tasks:'2 / 2', submit:'100.0%', products:'67/82', productRate:81.7, quantityRate:8.5, imageOrders:2, imageShare:100, noteRate:8.5 },
      { tenant:'宁波市奉化锦屏绿苑配菜有限公司', status:'正式', csm:'林灿飞', orders:1, chats:1, customers:0, tasks:'0 / 0', submit:'—', products:'1/3', productRate:33.3, quantityRate:33.3, imageOrders:1, imageShare:100, noteRate:33.3 },
      { tenant:'广东华记蔬菜有限公司（净菜）', status:'试用', csm:'李希希', orders:0, chats:0, customers:0, tasks:'0 / 1', submit:'0.0%', products:'—', productRate:null, quantityRate:null, imageOrders:null, imageShare:null, noteRate:null }
    ]
  };
  const rate = value => value == null ? '—' : `<span class="${value < 70 ? 'red-text' : value < 86 ? 'gold' : 'rate-good'}">${value.toFixed(1)}%</span>`;
  function renderRank(type) {
    fillRows(`${type}RankRows`, rankData[type].map((row, index) => [
      String(index + 1), `<button class="link-button tenant-drill" data-action="tenant-drill" data-tenant="${row.tenant}">${row.tenant}</button>`, tag(row.status, row.status === '正式' ? 'green' : 'blue'), row.csm,
      row.orders || '—', row.chats || '—', row.customers || '—', `<b>${row.tasks.split(' / ')[0]}</b><small>总 ${row.tasks.split(' / ')[1]}</small>`, row.submit, row.products,
      rate(row.productRate), rate(row.quantityRate), row.imageOrders == null ? '—' : row.imageOrders, row.imageShare == null ? '—' : `<b>${row.imageShare.toFixed(1)}%</b>`, rate(row.noteRate)
    ]));
  }
  renderRank('sales');
  renderRank('purchase');

  const caseData = {
    sales: [
      { id:'S-0904-001', time:'09-04 00:02', tenant:'深圳市湘鲜鲜农业科技有限公司', group:'VIP【西乡】老湘南配送菜群', customer:'B297_老湘南(西乡店)+', type:'图片', product:66.8, quantity:71.4, labels:['图片模糊','手写覆盖'], status:'已归因', source:'AI', confidence:'92%', basis:'图片分辨率低，3 行手写覆盖', state:'done' },
      { id:'S-0904-002', time:'09-04 00:05', tenant:'深圳市湘鲜鲜农业科技有限公司', group:'湖南老板铺·湘鲜鲜配送', customer:'B376_湖南老板铺(塘朗店)', type:'文本', product:65.5, quantity:95.5, labels:['商品别名未匹配'], status:'已归因', source:'人工', confidence:'—', basis:'人工确认客户使用本地别名', state:'done' },
      { id:'S-0904-003', time:'09-04 00:07', tenant:'四川箫丰林商贸有限公司', group:'4481647', customer:'B334_仿入湘家宴', type:'图片', product:64.8, quantity:81.8, labels:[], status:'归因中', source:'AI', confidence:'—', basis:'正在分析原始图片与修正差异', state:'running' },
      { id:'S-0904-004', time:'09-04 00:09', tenant:'灵武市德利鲜蔬菜配送', group:'【菜记老湖南】下单沟通群', customer:'A021_菜记老湖南', type:'文件', product:61.7, quantity:91.7, labels:['表头结构复杂'], status:'已归因', source:'AI', confidence:'86%', basis:'多级表头导致商品列错位', state:'done' },
      { id:'S-0904-005', time:'09-04 00:16', tenant:'重庆桉禾萍', group:'3999059', customer:'C817_三胖子下饭菜(布吉店)', type:'图片', product:62.9, quantity:92.9, labels:[], status:'归因失败', source:'AI', confidence:'—', basis:'原始内容加载失败，可手动重试', state:'failed' }
    ],
    purchase: [
      { id:'P-0904-001', time:'09-04 04:16', tenant:'宁波市奉化锦屏绿苑配菜有限公司', group:'AI采购录单-下单群/宁波绿苑', customer:'—', type:'图片', product:33.3, quantity:33.3, labels:['图片模糊','数量手写'], status:'已归因', source:'AI', confidence:'95%', basis:'图片压缩严重，数量栏为潦草手写', state:'done' },
      { id:'P-0904-002', time:'09-04 10:46', tenant:'赤峰嘉航蔬菜有限责任公司', group:'AI采购录单-下单群/赤峰嘉航蔬菜', customer:'—', type:'图片', product:68.3, quantity:6.3, labels:[], status:'待归因', source:'—', confidence:'—', basis:'等待异步归因任务', state:'pending' },
      { id:'P-0904-003', time:'09-03 19:31', tenant:'广东华记蔬菜有限公司（净菜）', group:'华记净菜采购群', customer:'—', type:'文件', product:58.6, quantity:72.1, labels:['表格合并单元格'], status:'已归因', source:'人工', confidence:'—', basis:'人工确认 Excel 合并单元格导致错列', state:'done' }
    ]
  };
  const labelTags = labels => labels.length ? labels.map(label => `<span class="tag purple">${label}</span>`).join(' ') : tag('待归因','default');
  function renderCases(type) {
    fillRows(`${type}CaseRows`, caseData[type].map(row => [
      row.time,
      `<button class="link-button tenant-drill" data-action="tenant-drill" data-tenant="${row.tenant}">${row.tenant}</button>`,
      `<b>${row.group}</b><small>${row.customer}</small>`,
      `<button class="type-tag" data-action="preview" data-case-id="${row.id}">${row.type}　◉</button>`,
      rate(row.product), rate(row.quantity),
      `<button class="labels-button" data-action="tag-edit" data-case-id="${row.id}">${labelTags(row.labels)}</button>`,
      tag(row.status, row.state === 'done' ? 'green' : row.state === 'failed' ? 'red' : row.state === 'running' ? 'orange' : 'blue'),
      row.source, row.confidence, `<span class="basis" title="${row.basis}">${row.basis}</span>`,
      `<button class="table-action" data-action="preview" data-case-id="${row.id}">预览</button><button class="table-action" data-action="tag-edit" data-case-id="${row.id}">调整标签</button>${row.state === 'failed' ? `<button class="table-action" data-action="rerun" data-case-id="${row.id}">重新归因</button>` : ''}<button class="table-action" data-action="toast">查看详情</button>`
    ]));
  }
  renderCases('sales');
  renderCases('purchase');

  fillRows('contractStatRows', [
    ['宁波市奉化锦屏绿苑配菜有限公司','1','¥50000.00','¥50000.00','¥0.00','¥0.00'],['四川箫丰林商贸有限公司','2','¥50000.00','¥50000.00','¥0.00','¥0.00'],['四川岷丰','1','¥50000.00','¥50000.00','¥0.00','¥0.00'],['温州萝卜伯电子商务有限公司','2','¥40000.00','¥40000.00','¥0.00','¥0.00'],['浙江菜妞','2','¥35000.00','¥35000.00','¥0.00','¥0.00'],['汕头奕大食品有限公司','1','¥30000.00','¥30000.00','¥0.00','¥0.00'],['无锡腾之锋生鲜','1','¥30000.00','¥30000.00','¥0.00','¥0.00'],['深圳市湘鲜鲜农业科技有限公司','4','¥29000.00','¥21000.00','<span class="gold">¥8000.00</span>','¥0.00'],['浙江腾头阿宝菜篮子配送有限公司','2','¥10000.00','¥10000.00','¥0.00','¥0.00'],['甘肃望家欢农产品科技有限公司','1','¥10000.00','¥10000.00','¥0.00','¥0.00']
  ]);

  $('#tokenMetrics').innerHTML = metrics([['活跃租户数','57'],['总 Token 数 (M)','35.55'],['Prompt Tokens (M)','29.52'],['Completion Tokens (M)','6.03'],['调用次数','5,347'],['提交订单数','752'],['商品行数','11,015']]);
  fillRows('tokenRows', [
    ['1','<b>灵武市德利鲜蔬菜配送</b>','2.81','2.43','0.38','472','108','1,203','2,334'],['2','<b>马咀优选生鲜供应链</b>','2.76','2.25','0.50','394','32','597','4,616'],['3','<b>深圳乐颐食品</b>','2.47','2.10','0.37','277','40','624','3,958'],['4','<b>四川箫丰林商贸有限公司</b>','1.87','1.50','0.37','251','50','665','2,815'],['5','<b>重庆桉禾萍</b>','1.69','1.40','0.28','176','56','1,058','1,594'],['6','<b>深圳市湘鲜鲜农业科技有限公司</b>','1.55','1.37','0.18','306','16','309','5,017'],['7','<b>无锡腾之锋生鲜</b>','1.35','1.13','0.22','156','29','369','3,658'],['8','<b>四川优勤商贸有限公司</b>','1.23','1.05','0.18','197','25','70','17,557']
  ]);

  $('#asrMetrics').innerHTML = metrics([['活跃租户数','16'],['识别总次数','64'],['成功次数','64'],['失败次数','0'],['成功率','100%'],['平均语音时长','9.4s']]);
  fillRows('asrRows', [
    ['1','<b>辽宁皓盈食品配送有限公司</b>','8','100%','9.7s','2026-09-04 15:44'],['2','<b>灵武市德利鲜蔬菜配送</b>','7','100%','6.2s','2026-09-04 14:00'],['3','<b>四川箫丰林商贸有限公司</b>','7','100%','8.3s','2026-09-04 09:37'],['4','<b>四川优勤商贸有限公司</b>','6','100%','6.8s','2026-09-04 14:08'],['5','<b>宁夏鲜之源供应链科技有限公司</b>','6','100%','14.7s','2026-09-04 15:15'],['6','<b>温州萝卜伯电子商务有限公司</b>','5','100%','5s','2026-09-04 12:58'],['7','<b>福建省光泽县大森林</b>','5','100%','16.2s','2026-09-04 14:36'],['8','<b>深圳市湘鲜鲜农业科技有限公司</b>','5','100%','5.4s','2026-09-04 10:07']
  ]);

  fillRows('channelRows', [
    ['<b>测试桥接1318</b><small>9e739143-a16c-46e3-9558-542111919fb9</small>',tag('桥接'),'离线',toggle(false),'<a>◉ 详情</a><a>⌕ 编辑</a>'],
    ['<b>xky测试 / 2357434552@qq.com</b><small>2e01e3e1-d1a6-42d0-b6a9-1388cc141fcf</small>',tag('邮件'),'-',toggle(false),'<a>◉ 详情</a><a>⌕ 编辑</a>'],
    ['<b>希希测试邮箱机器人 / 3292562940@qq.com</b><small>09db19f9-8e4e-4b76-9493-f30c98c3858e</small>',tag('邮件'),'-',toggle(true),'<a>◉ 详情</a><a>⌕ 编辑</a>'],
    ['<b>广州市荟鲜惠绿农产品有限公司邮箱机器人 / 3448726861@qq.com</b><small>6fc24b25-2196-492b-8664-840d9718d471</small>',tag('邮件'),'-',toggle(true),'<a>◉ 详情</a><a>⌕ 编辑</a>'],
    ['<b>广州市荟鲜惠绿农产品有限公司邮箱机器人2 / hxhldd168@126.com</b><small>233a2c71-c72e-4aaa-b90c-65ee1e2af53b</small>',tag('邮件'),'-',toggle(true),'<a>◉ 详情</a><a>⌕ 编辑</a>'],
    ['<b>测试邮件 / liutanwen@guanmai.cn</b><small>e8183b97-5708-43e5-9b5b-cf4f4e5fd8db</small>',tag('邮件'),'-',toggle(true),'<a>◉ 详情</a><a>⌕ 编辑</a>']
  ]);

  fillRows('modelRows', [
    ['<b>文本主模型</b><small>LLM</small>','<span class="field-look">volcengine　⌄</span>','<span class="field-look">deepseek-v4-flash-ga-260731　⌄</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">模型默认　⌄</span>','<span class="effective">系统默认　<code>deepseek-v4-flash-ga-260731</code><small>https://ark.cn-beijing.volces.com/api/v3</small></span>','<a class="danger">清空</a>'],
    ['<b>文本快模型</b><small>FAST_LLM</small>','<span class="field-look">volcengine　⌄</span>','<span class="field-look">deepseek-v4-flash-ga-260731　⌄</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">模型默认　⌄</span>','<span class="effective">系统默认　<code>deepseek-v4-flash-ga-260731</code><small>https://ark.cn-beijing.volces.com/api/v3</small></span>','<a class="danger">清空</a>'],
    ['<b>视觉主模型</b><small>VLM</small>','<span class="field-look muted">未配置　⌄</span>','<span class="field-look muted">请先选供应商　⌄</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">模型默认　⌄</span>','<span class="effective">来自 env　<code>doubao-seed-2-0-pro-260215</code><small>https://ark.cn-beijing.volces.com/api/v3</small></span>','<span class="muted">清空</span>'],
    ['<b>视觉快模型</b><small>FAST_VLM</small>','<span class="field-look muted">未配置　⌄</span>','<span class="field-look muted">请先选供应商　⌄</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">模型默认　⌄</span>','<span class="effective">来自 env　<code>doubao-seed-2-0-lite-260215</code><small>https://ark.cn-beijing.volces.com/api/v3</small></span>','<span class="muted">清空</span>'],
    ['<b>扫描PDF OCR</b><small>OCR</small>','<span class="field-look">aliyuncs　⌄</span>','<span class="field-look">qwen3.5-ocr　⌄</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">默认</span>','<span class="field-look muted">模型默认　⌄</span>','<span class="effective">系统默认　<code>qwen3.5-ocr</code><small>https://dashscope.aliyuncs.com/compatible-mode/v1</small></span>','<a class="danger">清空</a>']
  ]);

  fillRows('bridgeRows', [
    ['Agent平台','<code>ak-ESe...gTVQ</code>　▣',tag('生产','green'),toggle(true),toggle(false),'<div class="source-list"><span>小Mai助手　8eecdb14 ▣</span><span>丹墨　c24d4b25 ▣</span><span>订单助手　d1246e0b ▣</span></div>','11','永不过期','2026/8/17 10:03:58','<a>⌕ 编辑</a><a>♧ 管理群聊</a><a>⚿ 重置 Key</a><a class="danger">删除</a>'],
    ['Agent平台-测试','<code>ak-7Q9...XPWk</code>　▣',tag('生产','green'),toggle(true),toggle(false),'<div class="source-list"><span>接单助手10　1f38f7bf ▣</span><span>接单助理1　d00c4d67 ▣</span><span>订单助手　d1246e0b ▣</span></div>','5','永不过期','2026/7/31 11:04:41','<a>⌕ 编辑</a><a>♧ 管理群聊</a><a>⚿ 重置 Key</a><a class="danger">删除</a>'],
    ['合家康','<code>ak-8Xs...w53w</code>　▣',tag('生产','green'),toggle(true),toggle(true),'<div class="source-list"><span>合家康智能接单1　070915ee ▣</span></div>','51','永不过期','2026/7/20 15:39:36','<a>⌕ 编辑</a><a>♧ 管理群聊</a><a>⚿ 重置 Key</a><a class="danger">删除</a>'],
    ['合家康-测试','<code>ak-G7b...nWjS</code>　▣',tag('生产','green'),toggle(true),toggle(false),'<div class="source-list"><span>接单助理　d94dcc64 ▣</span></div>','2','永不过期','2026/7/7 14:57:53','<a>⌕ 编辑</a><a>♧ 管理群聊</a><a>⚿ 重置 Key</a><a class="danger">删除</a>']
  ]);

  fillRows('causeTagRows', [
    ['1','<b>图片模糊</b>','图片',toggle(true),'126','2026-09-04 09:30','<button class="table-action" data-action="toast">编辑</button><button class="table-action danger" data-action="toast">停用</button>'],
    ['2','<b>手写覆盖</b>','图片',toggle(true),'84','2026-09-03 18:12','<button class="table-action" data-action="toast">编辑</button><button class="table-action danger" data-action="toast">停用</button>'],
    ['3','<b>商品别名未匹配</b>','全部',toggle(true),'73','2026-09-03 16:45','<button class="table-action" data-action="toast">编辑</button><button class="table-action danger" data-action="toast">停用</button>'],
    ['4','<b>表头结构复杂</b>','文件',toggle(true),'55','2026-09-02 14:20','<button class="table-action" data-action="toast">编辑</button><button class="table-action danger" data-action="toast">停用</button>'],
    ['5','<b>数量手写</b>','图片',toggle(true),'47','2026-09-02 11:08','<button class="table-action" data-action="toast">编辑</button><button class="table-action danger" data-action="toast">停用</button>'],
    ['6','<b>表格合并单元格</b>','文件',toggle(true),'31','2026-09-01 10:22','<button class="table-action" data-action="toast">编辑</button><button class="table-action danger" data-action="toast">停用</button>'],
    ['7','<b>历史商品编码缺失</b>','文本',toggle(false),'19','2026-08-28 15:16','<button class="table-action" data-action="toast">编辑</button><span class="muted">已停用</span>']
  ]);

  const reasonFilter = `<div class="toolbar-dates"><button class="active">今日</button><button>本周</button><button>本月</button><button>自定义</button></div><span class="toolbar-label">时间粒度 <button class="select">日⌄</button></span><span class="toolbar-label">内容类型 <button class="select">全部⌄</button></span><span class="toolbar-label">文件类型 <button class="select">全部⌄</button></span><span class="toolbar-label">租户类型 <button class="select">全部⌄</button></span><span class="toolbar-label">指定租户 <button class="select wide">全部租户⌄</button></span><span class="toolbar-label">原因标签 <button class="select">全部⌄</button></span><span class="toolbar-label">归因状态 <button class="select">全部⌄</button></span><span class="toolbar-label">订阅状态 <button class="select">全部⌄</button></span><span class="toolbar-label">上线阶段 <button class="select">全部⌄</button></span><span class="toolbar-label">CSM <button class="select">全部⌄</button></span><button class="btn" data-action="toast">批量归因历史</button>`;
  ['salesReasonFilter','purchaseReasonFilter'].forEach(id => { const node = document.getElementById(id); if (node) node.innerHTML = reasonFilter; });
  const reasonMetricHelp = {
    '问题案例数':'商品识别率低于 70% 的案例数，按案例去重。',
    '已归因案例数':'已经由 AI 或人工确认至少一个有效原因标签的案例数。',
    '待归因案例数':'尚未确认有效原因标签的案例数。',
    '原因种类':'当前启用且在筛选范围内出现过的系统原因标签数。',
    '原因出现总次数':'一条案例包含多个原因标签时，每个标签分别计数。',
    '平均商品识别率':'仅统计当前筛选范围内的问题案例。'
  };
  const reasonMetrics = (id, values) => { const node = document.getElementById(id); if (node) node.innerHTML = values.map(([label,value,sub]) => `<div class="reason-metric"><span class="reason-metric-label">${label}${helpTip(reasonMetricHelp[label], `查看${label}说明`)}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div>`).join(''); };
  reasonMetrics('salesReasonMetrics', [['问题案例数','286',''],['已归因案例数','231','80.8%'],['待归因案例数','55','19.2%'],['原因种类','12',''],['原因出现总次数','354',''],['平均商品识别率','61.8%','']]);
  reasonMetrics('purchaseReasonMetrics', [['问题案例数','38',''],['已归因案例数','29','76.3%'],['待归因案例数','9','23.7%'],['原因种类','8',''],['原因出现总次数','47',''],['平均商品识别率','54.2%','']]);

  const barChart = (id, rows, group = '') => {
    const node = document.getElementById(id);
    if (!node) return;
    node.innerHTML = rows.map(([label,value,total]) => {
      const inner = `<span class="bar-label">${label}</span><div class="bar-track"><i style="width:${value}%"></i></div><b>${total}</b><small>${value}%</small>${group ? '<em>›</em>' : ''}`;
      return group
        ? `<button class="bar-row reason-bar" data-action="reason-drill" data-reason-group="${group}" data-reason="${label}" data-total="${total}" aria-label="查看${label}对应租户情况">${inner}</button>`
        : `<div class="bar-row">${inner}</div>`;
    }).join('');
  };
  barChart('salesReasonBars', [['图片模糊',78,96],['商品别名未匹配',62,76],['手写覆盖',49,61],['表头结构复杂',38,47],['单位表达不规范',29,36]], 'sales');
  barChart('purchaseReasonBars', [['数量手写',82,14],['图片模糊',65,11],['表格合并单元格',41,7],['商品别名未匹配',29,5],['其他',18,3]], 'purchase');

  const trendDates = ['08/29','08/30','08/31','09/01','09/02','09/03','09/04'];
  const smoothTrendChart = (id, values, { color = '#1677ff', suffix = '次', min: fixedMin, max: fixedMax, target = null } = {}) => {
    const plotWidth = 1000, plotHeight = 180;
    let min = fixedMin ?? Math.max(0, Math.floor((Math.min(...values) - 8) / 10) * 10);
    let max = fixedMax ?? Math.ceil((Math.max(...values) + 8) / 10) * 10;
    if (max - min < 20) max = min + 20;
    const y = value => plotHeight - ((value - min) / (max - min)) * plotHeight;
    const points = values.map((value,index) => ({ x:index * plotWidth / (values.length - 1), y:y(value), value }));
    const linePath = points.reduce((path,point,index) => {
      if (!index) return `M ${point.x} ${point.y}`;
      const previous = points[index - 1];
      const middle = (previous.x + point.x) / 2;
      return `${path} C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
    }, '');
    const gradientId = `${id}-gradient`;
    const yLabels = Array.from({length:5}, (_,index) => max - ((max - min) / 4) * index);
    const grids = yLabels.map((_,index) => `<line x1="0" y1="${index * plotHeight / 4}" x2="${plotWidth}" y2="${index * plotHeight / 4}" class="chart-grid-line"/>`).join('');
    const targetLine = target != null && target >= min && target <= max
      ? `<line x1="0" y1="${y(target)}" x2="${plotWidth}" y2="${y(target)}" class="target-line"/>`
      : '';
    const dots = points.map((point,index) => `<button class="chart-dot" style="--dot-x:${index * 100 / (values.length - 1)}%;--dot-y:${point.y * 100 / plotHeight}%;--dot-color:${color}" data-tip="${trendDates[index]}　${point.value}${suffix}" aria-label="${trendDates[index]} ${point.value}${suffix}"></button>`).join('');
    const targetLabel = targetLine ? `<span class="chart-reference" style="top:${y(target) * 100 / plotHeight}%">目标 ${target}${suffix}</span>` : '';
    return `<div class="responsive-trend"><div class="chart-y-axis">${yLabels.map(value => `<span>${Math.round(value)}${suffix === '%' ? '%' : ''}</span>`).join('')}</div><div class="chart-main"><div class="chart-plot">${targetLabel}<svg viewBox="0 0 ${plotWidth} ${plotHeight}" preserveAspectRatio="none" role="img" aria-label="近七日趋势图"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity=".025"/></linearGradient></defs>${grids}${targetLine}<path d="${linePath} L ${plotWidth} ${plotHeight} L 0 ${plotHeight} Z" fill="url(#${gradientId})"/><path d="${linePath}" fill="none" stroke="${color}" stroke-width="5" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>${dots}</div><div class="chart-x-axis">${trendDates.map(date => `<span>${date}</span>`).join('')}</div></div></div>`;
  };
  $('#salesReasonTrend').innerHTML = smoothTrendChart('sales-reason', [38,52,47,71,65,58,76], { color:'#3d87f5', min:20, max:80 });
  $('#purchaseReasonTrend').innerHTML = smoothTrendChart('purchase-reason', [18,25,20,34,27,42,38], { color:'#6f5ce7', min:10, max:50 });

  fillRows('salesReasonTenantRows', [
    ['1','<button class="link-button" data-action="tenant-drill" data-tenant="四川箫丰林商贸有限公司">四川箫丰林商贸有限公司</button>','42',tag('图片模糊','purple'),'77.1%','58.7%','<button class="table-action" data-action="tenant-drill" data-tenant="四川箫丰林商贸有限公司">下钻分析</button>'],
    ['2','<button class="link-button" data-action="tenant-drill" data-tenant="深圳市湘鲜鲜农业科技有限公司">深圳市湘鲜鲜农业科技有限公司</button>','37',tag('手写覆盖','purple'),'68.4%','62.1%','<button class="table-action" data-action="tenant-drill" data-tenant="深圳市湘鲜鲜农业科技有限公司">下钻分析</button>'],
    ['3','<button class="link-button" data-action="tenant-drill" data-tenant="灵武市德利鲜蔬菜配送">灵武市德利鲜蔬菜配送</button>','29',tag('表头结构复杂','purple'),'39.3%','64.8%','<button class="table-action" data-action="tenant-drill" data-tenant="灵武市德利鲜蔬菜配送">下钻分析</button>']
  ]);
  fillRows('purchaseReasonTenantRows', [
    ['1','<button class="link-button" data-action="tenant-drill" data-tenant="宁波市奉化锦屏绿苑配菜有限公司">宁波市奉化锦屏绿苑配菜有限公司</button>','17',tag('数量手写','purple'),'100%','33.3%','<button class="table-action" data-action="tenant-drill" data-tenant="宁波市奉化锦屏绿苑配菜有限公司">下钻分析</button>'],
    ['2','<button class="link-button" data-action="tenant-drill" data-tenant="赤峰嘉航蔬菜有限责任公司">赤峰嘉航蔬菜有限责任公司</button>','13',tag('图片模糊','purple'),'100%','58.3%','<button class="table-action" data-action="tenant-drill" data-tenant="赤峰嘉航蔬菜有限责任公司">下钻分析</button>']
  ]);

  const presetTags = ['图片模糊','手写覆盖','商品别名未匹配','表头结构复杂','数量手写','表格合并单元格','单位表达不规范','门店信息缺失'];
  let editingCase = null;
  let draftTags = [];
  const allCases = () => [...caseData.sales, ...caseData.purchase];
  const findCase = id => allCases().find(item => item.id === id);
  function showToast(message) {
    const node = $('#toast');
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => node.classList.remove('show'), 2200);
  }
  const globalHelpTooltip = $('#globalHelpTooltip');
  let activeHelpTarget = null;
  function showHelpTooltip(target) {
    if (!target?.dataset.help) return;
    activeHelpTarget = target;
    globalHelpTooltip.textContent = target.dataset.help;
    globalHelpTooltip.hidden = false;
    const rect = target.getBoundingClientRect();
    const tipRect = globalHelpTooltip.getBoundingClientRect();
    let top = rect.bottom + 9;
    const placeAbove = top + tipRect.height > window.innerHeight - 10;
    if (placeAbove) top = rect.top - tipRect.height - 9;
    globalHelpTooltip.classList.toggle('above', placeAbove);
    const left = Math.max(10, Math.min(window.innerWidth - tipRect.width - 10, rect.left + rect.width / 2 - tipRect.width / 2));
    globalHelpTooltip.style.top = `${top}px`;
    globalHelpTooltip.style.left = `${left}px`;
    globalHelpTooltip.style.setProperty('--help-arrow-left', `${Math.max(9, Math.min(tipRect.width - 9, rect.left + rect.width / 2 - left))}px`);
  }
  function hideHelpTooltip() {
    activeHelpTarget = null;
    globalHelpTooltip.hidden = true;
  }
  document.addEventListener('mouseover', event => {
    const target = event.target.closest('.field-help');
    if (target) showHelpTooltip(target);
  });
  document.addEventListener('mouseout', event => {
    const target = event.target.closest('.field-help');
    if (target && !target.contains(event.relatedTarget)) hideHelpTooltip();
  });
  document.addEventListener('focusin', event => {
    const target = event.target.closest('.field-help');
    if (target) showHelpTooltip(target);
  });
  document.addEventListener('focusout', event => {
    if (event.target.closest('.field-help')) hideHelpTooltip();
  });
  document.addEventListener('click', event => {
    const target = event.target.closest('.field-help');
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    if (activeHelpTarget === target && !globalHelpTooltip.hidden) hideHelpTooltip();
    else showHelpTooltip(target);
  }, true);
  document.addEventListener('keydown', event => {
    const target = event.target.closest('.field-help');
    if (target && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      if (activeHelpTarget === target && !globalHelpTooltip.hidden) hideHelpTooltip();
      else showHelpTooltip(target);
    } else if (event.key === 'Escape' && !globalHelpTooltip.hidden) hideHelpTooltip();
  });
  window.addEventListener('resize', hideHelpTooltip);
  $('.workspace').addEventListener('scroll', hideHelpTooltip, true);
  function openDrawer(drawer) {
    $('#drawerMask').hidden = false;
    $$('.detail-drawer').forEach(item => {
      if (item !== drawer) {
        item.classList.remove('open');
        item.setAttribute('aria-hidden', 'true');
      }
    });
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawers() {
    $('#drawerMask').hidden = true;
    $$('.detail-drawer').forEach(drawer => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); });
  }
  function openPreview(id) {
    const item = findCase(id);
    if (!item) return;
    $('#previewCaseId').textContent = item.id;
    $('#previewMeta').innerHTML = `<span>${tag(item.type,'blue')}</span><span>租户：${item.tenant}</span><span>提交时间：${item.time}</span>`;
    if (item.state === 'failed') $('#sourcePreview').innerHTML = `<div class="preview-error"><b>原始内容加载失败</b><span>文件链接已失效或解析服务暂不可用</span><button class="btn" data-action="rerun" data-case-id="${item.id}">重新加载并归因</button></div>`;
    else if (item.type === '文本') $('#sourcePreview').innerHTML = `<div class="text-source">白菜 10斤<br>红萝卜 5斤<br>香菜 2把<br><button class="copy-btn" data-action="copy-text">复制原文</button></div>`;
    else if (item.type === '图片') $('#sourcePreview').innerHTML = `<div class="image-source"><div class="order-paper"><b>今日订货单</b><span>白菜　10斤</span><span>红萝卜　5斤</span><span>香菜　2把</span><em>图片 1 / 2　 <button data-action="zoom-out">－</button> 100% <button data-action="zoom-in">＋</button></em></div><button class="thumb active" data-action="switch-image">图片 1</button><button class="thumb" data-action="switch-image">图片 2</button></div>`;
    else $('#sourcePreview').innerHTML = `<div class="file-source"><strong>采购订单_0904.xlsx</strong><span>Excel 工作簿 · 28 KB</span><button class="btn">打开原始文件</button><div class="file-grid">商品名称　规格　数量　单位<br>白菜　　　散装　10　斤<br>红萝卜　　散装　5　 斤</div></div>`;
    $('#recognitionPreview').innerHTML = `<table class="mini-table"><tr><th>商品</th><th>数量</th><th>单位</th><th>备注</th></tr><tr><td>大白菜</td><td>10</td><td>斤</td><td class="red-text">识别偏差</td></tr><tr><td>红萝卜</td><td>5</td><td>斤</td><td>—</td></tr></table>`;
    $('#confirmPreview').innerHTML = `<table class="mini-table"><tr><th>商品</th><th>数量</th><th>单位</th><th>修正</th></tr><tr><td>白菜</td><td>10</td><td>斤</td><td>${tag('已人工确认','green')}</td></tr><tr><td>红萝卜</td><td>5</td><td>斤</td><td>—</td></tr></table>`;
    openDrawer($('#previewDrawer'));
  }
  function openTenant(tenant) {
    const rank = [...rankData.sales, ...rankData.purchase].find(row => row.tenant === tenant) || { orders:24, imageOrders:12, imageShare:50, productRate:62.5, quantityRate:71.2, noteRate:69.8 };
    const cases = allCases().filter(item => item.tenant === tenant);
    $('#tenantDrawerTitle').textContent = tenant;
    $('#tenantDrawerKpis').innerHTML = metrics([['文本订单数',Math.max(0,(rank.orders || 24)-(rank.imageOrders || 0)-2)],['图片订单数',rank.imageOrders == null ? '—' : rank.imageOrders],['文件订单数',rank.orders ? 2 : '—'],['图片占比',rank.imageShare == null ? '—' : `${rank.imageShare.toFixed(1)}%`],['商品识别率',rank.productRate == null ? '—' : `${rank.productRate.toFixed(1)}%`],['数量识别率',rank.quantityRate == null ? '—' : `${rank.quantityRate.toFixed(1)}%`],['备注识别率',rank.noteRate == null ? '—' : `${rank.noteRate.toFixed(1)}%`],['问题案例数',cases.length || 6]]);
    barChart('tenantReasonBars', [['图片模糊',72,12],['手写覆盖',48,8],['商品别名未匹配',30,5]]);
    fillRows('tenantCaseRows', (cases.length ? cases : caseData.sales.slice(0,2)).map(item => [item.time, `<button class="type-tag" data-action="preview" data-case-id="${item.id}">${item.type}</button>`, rate(item.product), labelTags(item.labels), tag(item.status, item.state === 'done' ? 'green' : 'blue')]));
    openDrawer($('#tenantDrawer'));
  }

  const reasonTenantData = {
    sales: {
      '图片模糊': [
        ['四川箫丰林商贸有限公司',42,'图片订单 81%',58.7,'晚间拍照偏暗，近 3 日持续高发'],
        ['深圳市湘鲜鲜农业科技有限公司',31,'图片订单 92%',60.4,'手写单据清晰度波动，今日新增 8 例'],
        ['贵州省绿色农产品',23,'图片订单 88%',55.2,'首次试用批次集中出现低分辨率图片']
      ],
      '商品别名未匹配': [
        ['深圳市湘鲜鲜农业科技有限公司',28,'文本 / 图片',62.1,'本地简称集中在叶菜与冻品，待补充词库'],
        ['灵武市德利鲜蔬菜配送',24,'文本订单 73%',64.8,'客户自定义品名较多，较昨日下降 3 例'],
        ['重庆桉禾萍',18,'群聊文本',66.2,'新客户群使用地方别名，连续 2 日发生']
      ],
      '手写覆盖': [
        ['深圳市湘鲜鲜农业科技有限公司',26,'图片订单 95%',59.6,'数量栏被二次涂改，晚间订单最集中'],
        ['四川箫丰林商贸有限公司',21,'图片订单 77%',61.2,'手写内容覆盖印刷商品名'],
        ['海南鲜配达',14,'图片订单 86%',57.9,'试用期模板不统一，今日新增 5 例']
      ],
      '表头结构复杂': [
        ['灵武市德利鲜蔬菜配送',19,'Excel 文件',64.8,'多级合并表头导致列映射不稳定'],
        ['江苏聚宝生态农业发展有限公司',16,'Excel 文件',61.5,'门店与日期采用双层分组表头'],
        ['温州萝卜伯电子商务有限公司',12,'PDF / Excel',63.7,'跨页表头重复，近 7 日保持稳定']
      ],
      '单位表达不规范': [
        ['重庆桉禾萍',14,'群聊文本',66.2,'斤、件、袋混写，缺少稳定换算关系'],
        ['马咀优选生鲜供应链',12,'文本 / 图片',63.4,'数量与单位连写，今日较昨日增加'],
        ['浙江菜妞',10,'Excel 文件',65.1,'单位列存在空值与简称']
      ]
    },
    purchase: {
      '数量手写': [
        ['宁波市奉化锦屏绿苑配菜有限公司',7,'图片订单 100%',33.3,'数量栏手写且多次涂改，当前需优先跟进'],
        ['赤峰嘉航蔬菜有限责任公司',4,'图片订单 100%',48.5,'小数点与单位连写，今日新增 2 例'],
        ['广东华记蔬菜有限公司（净菜）',3,'图片订单',51.6,'首次采购模板，手写笔迹差异较大']
      ],
      '图片模糊': [
        ['赤峰嘉航蔬菜有限责任公司',5,'图片订单 100%',58.3,'群内压缩图较多，早间订单最集中'],
        ['宁波市奉化锦屏绿苑配菜有限公司',4,'图片订单 100%',46.7,'拍摄角度倾斜并伴随反光'],
        ['广东华记蔬菜有限公司（净菜）',2,'图片订单',55.1,'试用阶段图片分辨率不稳定']
      ],
      '表格合并单元格': [
        ['赤峰嘉航蔬菜有限责任公司',3,'Excel 文件',56.8,'门店数量列使用横向合并单元格'],
        ['宁波市奉化锦屏绿苑配菜有限公司',2,'Excel 文件',49.2,'品类标题与商品行混合合并'],
        ['广东华记蔬菜有限公司（净菜）',2,'Excel 文件',53.6,'跨区域采购模板尚未完成适配']
      ],
      '商品别名未匹配': [
        ['赤峰嘉航蔬菜有限责任公司',2,'文本 / 图片',61.8,'供应商简称未进入商品别名库'],
        ['宁波市奉化锦屏绿苑配菜有限公司',2,'图片订单',50.4,'地方品名与系统标准品名存在差异'],
        ['广东华记蔬菜有限公司（净菜）',1,'Excel 文件',57.3,'净菜规格被写入商品名称']
      ],
      '其他': [
        ['宁波市奉化锦屏绿苑配菜有限公司',1,'图片订单',52.3,'图片边缘裁切，部分商品行缺失'],
        ['赤峰嘉航蔬菜有限责任公司',1,'Excel 文件',60.7,'文件内存在隐藏列与空白分页'],
        ['广东华记蔬菜有限公司（净菜）',1,'文本订单',58.1,'原始信息不足，等待人工复核']
      ]
    }
  };
  function openReason(group, reason, total) {
    const rows = reasonTenantData[group]?.[reason] || [];
    const averageRate = rows.length ? rows.reduce((sum,row) => sum + row[3], 0) / rows.length : 0;
    $('#reasonDrawerTitle').textContent = `${reason} · 对应租户情况`;
    $('#reasonDrawerMeta').textContent = group === 'sales' ? '销售分析' : '采购分析';
    $('#reasonDrawerKpis').innerHTML = metrics([
      ['原因案例数',String(total || rows.reduce((sum,row) => sum + row[1], 0))],
      ['重点租户',String(rows.length),'当前展示'],
      ['平均识别率',`${averageRate.toFixed(1)}%`,'对应租户均值'],
      ['最新发生','今天 10:46','持续监测中']
    ]);
    fillRows('reasonTenantRows', rows.map(row => [
      `<button class="link-button" data-action="tenant-drill" data-tenant="${row[0]}">${row[0]}</button>`,
      `<b>${row[1]}</b>`, row[2], rate(row[3]), `<span class="situation-text">${row[4]}</span>`,
      `<button class="table-action" data-action="tenant-drill" data-tenant="${row[0]}">查看租户</button>`
    ]));
    $$('.reason-bar').forEach(button => button.classList.toggle('selected', button.dataset.reasonGroup === group && button.dataset.reason === reason));
    openDrawer($('#reasonDrawer'));
  }

  const operationOverview = items => `<div class="operation-overview">${items.map(([label,value,tone = '']) => `<div><span>${label}</span><b class="${tone}">${value}</b></div>`).join('')}</div>`;
  const operationField = (label, control, hint = '') => `<label class="operation-field"><span>${label}${hint ? helpTip(hint, `查看${label}说明`) : ''}</span>${control}</label>`;
  function getDashboardOperation(operation, tenant, alertType, label) {
    const common = `<div class="operation-context"><span>当前租户</span><b>${tenant}</b><em>${alertType}</em></div>`;
    const trialState = alertType === '试用已经到期' ? ['已到期 2 天','red-text'] : alertType === '试用未使用' ? ['尚未产生有效订单','gold'] : ['剩余 3 小时','gold'];
    const quotaEmpty = alertType.includes('耗尽');
    const quotaValues = quotaEmpty ? ['100','100','0'] : ['10,000','9,991','9'];
    if (operation === 'convert-tenant') return {
      title:'转为正式租户', confirm:'确认转正式', success:`${tenant} 已提交转正式`,
      html:`${common}${operationOverview([['当前阶段','试用中'],['试用情况',trialState[0],trialState[1]],['当前剩余额度',quotaEmpty ? '0' : '26',quotaEmpty ? 'red-text' : '']])}<section class="operation-section"><h3>正式租户配置</h3><div class="operation-form-grid">${operationField('生效日期','<input class="operation-input" type="date" value="2026-09-05">')}${operationField('合同方案','<select class="operation-input"><option>标准版 · 年度</option><option>标准版 · 月度</option><option>企业版 · 年度</option></select>')}${operationField('初始正式额度','<input class="operation-input" type="number" value="50000">','转正式后立即生效')}${operationField('负责人','<select class="operation-input"><option>付星星</option><option>林灿飞</option><option>肖紫薇</option></select>')}</div>${operationField('操作说明','<textarea class="operation-textarea" placeholder="填写转正式原因或客户确认信息">客户已确认正式使用，按标准方案开通</textarea>')}</section><div class="operation-notice">确认后将结束试用状态，并按照上述额度与生效日期创建正式租户配置。</div>`
    };
    if (operation === 'adjust-quota') return {
      title:'调整租户额度', confirm:'确认调整', success:`${tenant} 的额度调整已提交`,
      html:`${common}${operationOverview([['当前总额度',quotaValues[0]],['已使用',quotaValues[1]],['剩余额度',quotaValues[2],'red-text']])}<section class="operation-section"><h3>额度调整</h3><div class="operation-mode"><button class="active" data-action="operation-mode">增加额度</button><button data-action="operation-mode">扣减额度</button></div><div class="quick-values"><span>快捷选择</span><button data-action="operation-quick" data-value="1000">+1,000</button><button class="active" data-action="operation-quick" data-value="5000">+5,000</button><button data-action="operation-quick" data-value="10000">+10,000</button></div><div class="operation-form-grid">${operationField('调整数量','<input class="operation-input" id="quotaAdjustValue" type="number" value="5000">')}${operationField('生效时间','<select class="operation-input"><option>立即生效</option><option>次日 00:00 生效</option></select>')}</div>${operationField('调整原因','<textarea class="operation-textarea" placeholder="请输入额度调整原因">运营异常处理</textarea>')}</section><div class="operation-result-preview"><span>调整后总额度</span><b>${quotaEmpty ? '5,100' : '15,000'}</b><small>额度调整后立即恢复录单能力</small></div>`
    };
    if (operation === 'extend-trial') return {
      title:'调整试用期', confirm:'保存试用期', success:`${tenant} 的试用期已更新`,
      html:`${common}${operationOverview([['试用开始','2026-08-29'],['原到期时间','2026-09-05 18:00'],['当前状态','即将到期','gold']])}<section class="operation-section"><h3>新的试用周期</h3><div class="quick-values"><span>延长天数</span><button data-action="operation-trial-day" data-value="3">3 天</button><button class="active" data-action="operation-trial-day" data-value="7">7 天</button><button data-action="operation-trial-day" data-value="14">14 天</button><button data-action="operation-trial-day" data-value="30">30 天</button></div><div class="operation-form-grid">${operationField('延长天数','<input class="operation-input" id="trialDayValue" type="number" value="7">')}${operationField('新到期时间','<input class="operation-input" type="datetime-local" value="2026-09-12T18:00">')}</div>${operationField('调整原因','<textarea class="operation-textarea">客户仍在验证识别效果，延长试用观察周期</textarea>')}</section>`
    };
    if (operation === 'view-contract') return {
      title:'合同与应收详情', confirm:'进入合同管理', success:'已进入合同管理',
      html:`${common}${operationOverview([['合同状态','执行中'],['合同金额','¥8,000'],['待收金额','¥8,000','gold']])}<section class="operation-section"><div class="operation-section-head"><h3>最近合同</h3><span class="tag orange">存在应收</span></div><table class="mini-table"><tr><th>合同编号</th><th>有效期</th><th>回款状态</th></tr><tr><td>HT-2026-0822</td><td>2026-08-22 至 2027-08-21</td><td><span class="gold">未收款</span></td></tr></table></section><div class="operation-notice warning">合同已进入续费提醒周期，请在到期前完成回款确认。</div>`
    };
    if (operation === 'view-cases') return {
      title:'关联问题案例', confirm:'进入案例分析', success:'已进入案例分析',
      html:`${common}${operationOverview([['关联案例','6'],['待归因','2','gold'],['平均识别率','61.3%','red-text']])}<section class="operation-section"><h3>最近案例</h3><table class="mini-table"><tr><th>提交时间</th><th>内容类型</th><th>原因标签</th><th>识别率</th></tr><tr><td>09-04 10:31</td><td>图片</td><td>图片模糊</td><td class="red-text">56.8%</td></tr><tr><td>09-04 09:48</td><td>文件</td><td>表头结构复杂</td><td class="gold">68.2%</td></tr><tr><td>09-03 18:20</td><td>图片</td><td>待归因</td><td class="red-text">58.9%</td></tr></table></section>`
    };
    if (operation === 'view-groups') return {
      title:'关联群聊情况', confirm:'进入群聊管理', success:'已打开群聊管理入口',
      html:`${common}${operationOverview([['已绑定群聊','51'],['近 30 天在用','9'],['群使用率','17.6%','red-text']])}<section class="operation-section"><h3>低活跃群聊</h3><div class="group-status-list"><div><b>合家康智能接单 1 群</b><span>最近下单：8 天前</span><em class="tag orange">低活跃</em></div><div><b>采购对接 3 群</b><span>最近下单：12 天前</span><em class="tag red">长期未使用</em></div><div><b>测试录单群</b><span>最近下单：今天 09:42</span><em class="tag green">正常</em></div></div></section>`
    };
    if (operation === 'channel-config') return {
      title:'信道配置', confirm:'进入信道管理', success:'已进入信道管理',
      html:`${common}${operationOverview([['当前状态','离线','red-text'],['信道类型','Bridge'],['最后在线','18 小时前']])}<section class="operation-section"><h3>连接信息</h3><div class="operation-form-grid">${operationField('信道名称','<input class="operation-input" value="测试桥接1318">')}${operationField('来源平台','<select class="operation-input"><option>Agent 平台</option></select>')}${operationField('自动绑定','<select class="operation-input"><option>关闭</option><option>开启</option></select>')}${operationField('通知群','<select class="operation-input"><option>运营通知群</option></select>')}</div></section><div class="operation-notice warning">最近一次心跳连接失败，请检查 Bridge 服务与 API Key。</div>`
    };
    if (operation === 'view-sync-error') return {
      title:'同步错误详情', confirm:'重新同步', success:`${tenant} 已重新提交同步任务`,
      html:`${common}<div class="error-detail"><div><span>错误码</span><code>FIELD_VALIDATION_FAILED</code></div><h3>订单同步返回字段校验错误</h3><p>字段 <code>station_id</code> 与当前租户配置不一致，最近一次成功同步时间为 2026-09-03 22:14。</p><pre>station_id: expected T48275\nreceived: T48257\nsource: order_sync_worker</pre></div><section class="operation-section"><h3>处理建议</h3><ol class="operation-steps"><li>核对租户 Station 配置</li><li>确认上游平台授权仍然有效</li><li>修正后重新提交同步任务</li></ol></section>`
    };
    if (operation === 'retry-sync') return {
      title:label || '重新同步', confirm:'开始同步', success:`${tenant} 已进入同步队列`,
      html:`${common}${operationOverview([['上次同步','失败','red-text'],['失败时间','今天 10:44'],['待同步订单','18']])}<section class="operation-section"><h3>同步范围</h3><div class="operation-form-grid">${operationField('时间范围','<select class="operation-input"><option>从上次成功位置继续</option><option>重新同步今日数据</option><option>自定义范围</option></select>')}${operationField('冲突处理','<select class="operation-input"><option>跳过已成功订单</option><option>覆盖已有结果</option></select>')}</div></section><div class="operation-notice">提交后任务将在后台运行，可在本页查看最新同步状态。</div>`
    };
    if (operation === 'notification-config') return {
      title:'修改通知配置', confirm:'保存配置', success:`${tenant} 的通知配置已保存`,
      html:`${common}<section class="operation-section"><h3>异常通知</h3><div class="operation-form-grid">${operationField('通知群','<select class="operation-input"><option>请选择通知群</option><option>运营通知群</option><option>项目交付群</option></select>')}${operationField('通知方式','<select class="operation-input"><option>群消息 + 系统消息</option><option>仅系统消息</option></select>')}${operationField('通知频率','<select class="operation-input"><option>首次触发时通知</option><option>每 6 小时提醒</option></select>')}${operationField('接收负责人','<select class="operation-input"><option>实施-付星星</option><option>CSM-林灿飞</option></select>')}</div></section><div class="operation-notice warning">当前未配置有效通知群，异常提醒只能在系统内查看。</div>`
    };
    if (operation === 'tenant-config') return {
      title:'编辑租户配置', confirm:'保存配置', success:`${tenant} 的对接配置已保存`,
      html:`${common}<section class="operation-section"><h3>平台对接配置</h3><div class="operation-form-grid">${operationField('Station','<input class="operation-input" placeholder="请输入 Station">','必填，对接平台的站点标识')}${operationField('Group','<input class="operation-input" value="200991">')}${operationField('对接平台','<select class="operation-input"><option>观麦 SaaS</option><option>第三方 ERP</option></select>')}${operationField('同步状态','<select class="operation-input"><option>启用</option><option>停用</option></select>')}</div></section><div class="operation-notice warning">Station 缺失会导致订单同步和租户数据归属失败。</div>`
    };
    return { title:label || '快捷操作', confirm:'确认', success:'操作已提交', html:`${common}<div class="operation-empty">请确认是否执行“${label || '当前操作'}”。</div>` };
  }
  function openDashboardOperation(operation, tenant, alertType, label) {
    const config = getDashboardOperation(operation, tenant, alertType, label);
    $('#operationDrawerTitle').textContent = config.title;
    $('#operationDrawerMeta').textContent = `${tenant} · 数据看板快捷操作`;
    $('#operationDrawerBody').innerHTML = config.html;
    const confirm = $('#operationConfirm');
    confirm.textContent = config.confirm;
    confirm.dataset.operation = operation;
    confirm.dataset.success = config.success;
    openDrawer($('#operationDrawer'));
  }
  function renderTagPicker() {
    const query = ($('#tagSearch').value || '').trim();
    $('#tagPicker').innerHTML = presetTags.filter(label => !query || label.includes(query)).map(label => `<button class="tag-choice${draftTags.includes(label) ? ' selected' : ''}" data-pick-tag="${label}">${label}<span>${draftTags.includes(label) ? '✓' : '+'}</span></button>`).join('');
    $('#selectedTags').innerHTML = draftTags.length ? draftTags.map(label => `<span class="tag purple">${label}</span>`).join(' ') : '<span class="muted">未选择，保存后状态为“待归因”</span>';
  }
  function openTagEditor(id) {
    editingCase = findCase(id);
    if (!editingCase) return;
    draftTags = [...editingCase.labels];
    $('#tagSearch').value = '';
    renderTagPicker();
    openDrawer($('#tagDrawer'));
  }

  function activateTabs(container, target) {
    if (!container) return;
    const panelClass = container.classList.contains('analysis-tabs') ? '.analysis-panel' : container.classList.contains('sub-tabs') ? '.sub-panel' : '.tab-panel';
    const root = container.closest('.stats-view') || container.closest('.tab-panel') || container.closest('.page');
    $$(':scope > button[data-target]', container).forEach(button => button.classList.toggle('active', button.dataset.target === target));
    $$(panelClass, root).forEach(panel => panel.classList.toggle('active', panel.dataset.panel === target));
  }

  $$('[data-tabs]').forEach(container => {
    $$(':scope > button[data-target]', container).forEach(button => button.addEventListener('click', () => {
      activateTabs(container, button.dataset.target);
      const group = container.dataset.tabs;
      if (group === 'tenant') location.hash = `tenants/${button.dataset.target}`;
      else if (group === 'dashboard') location.hash = `dashboard/${button.dataset.target}`;
      else if (group === 'system') location.hash = `system/${button.dataset.target}`;
      else if (group === 'sales-analysis') location.hash = `stats/sales/${button.dataset.target}`;
      else if (group === 'purchase-analysis') location.hash = `stats/purchase/${button.dataset.target}`;
    }));
  });

  $$('.toolbar-dates').forEach(group => $$('button', group).forEach(button => button.addEventListener('click', () => {
    $$('button', group).forEach(item => item.classList.toggle('active', item === button));
  })));

  $$('[data-sort-table]').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.sortTable;
    const direction = button.dataset.direction === 'desc' ? 'asc' : 'desc';
    button.dataset.direction = direction;
    button.textContent = `图片占比 ${direction === 'desc' ? '↓' : '↑'}`;
    rankData[type].sort((a,b) => direction === 'desc' ? (b.imageShare ?? -1) - (a.imageShare ?? -1) : (a.imageShare ?? Infinity) - (b.imageShare ?? Infinity));
    renderRank(type);
  }));

  $$('.export-btn').forEach(button => button.addEventListener('click', () => {
    const type = button.closest('.stats-view')?.dataset.statsView || 'sales';
    const headers = ['租户','订阅状态','CSM','提交订单数','图片订单数','图片占比','商品识别率','数量识别率','备注识别率'];
    const lines = rankData[type].map(row => [row.tenant,row.status,row.csm,row.orders,row.imageOrders ?? '-',row.imageShare == null ? '-' : `${row.imageShare}%`,row.productRate ?? '-',row.quantityRate ?? '-',row.noteRate ?? '-'].join('\t'));
    const blob = new Blob(['\ufeff' + [headers.join('\t'), ...lines].join('\n')], { type:'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type === 'sales' ? '销售' : '采购'}分析-租户图片占比.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('已导出，包含图片订单数与图片占比');
  }));

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (button) {
      const action = button.dataset.action;
      if (action === 'preview') openPreview(button.dataset.caseId);
      else if (action === 'tag-edit') openTagEditor(button.dataset.caseId);
      else if (action === 'tenant-drill') openTenant(button.dataset.tenant || button.closest('tr')?.querySelector('.tenant-drill')?.dataset.tenant || '租户分析');
      else if (action === 'reason-drill') openReason(button.dataset.reasonGroup, button.dataset.reason, Number(button.dataset.total));
      else if (action === 'dashboard-operation') openDashboardOperation(button.dataset.operation, button.dataset.tenant, button.dataset.alertType, button.dataset.label);
      else if (action === 'operation-mode') {
        $$('button', button.parentElement).forEach(item => item.classList.toggle('active', item === button));
      } else if (action === 'operation-quick') {
        $$('button', button.parentElement).forEach(item => item.classList.toggle('active', item === button));
        const input = $('#quotaAdjustValue');
        if (input) input.value = button.dataset.value;
        const preview = $('.operation-result-preview b');
        if (preview) preview.textContent = (10000 + Number(button.dataset.value)).toLocaleString('zh-CN');
      } else if (action === 'operation-trial-day') {
        $$('button', button.parentElement).forEach(item => item.classList.toggle('active', item === button));
        const input = $('#trialDayValue');
        if (input) input.value = button.dataset.value;
      }
      else if (action === 'rerun') {
        const item = findCase(button.dataset.caseId);
        if (item && item.source !== '人工') { item.status = '归因中'; item.state = 'running'; item.basis = '已重新提交异步归因任务'; renderCases(item.id.startsWith('S-') ? 'sales' : 'purchase'); showToast('已重新提交归因任务'); }
      } else if (action === 'copy-text') showToast('原文已复制');
      else if (action === 'switch-image') {
        $$('.thumb', button.parentElement).forEach(item => item.classList.toggle('active', item === button));
        showToast(`已切换到${button.textContent}`);
      } else if (action === 'zoom-in' || action === 'zoom-out') {
        const paper = button.closest('.order-paper');
        const current = Number(paper.dataset.zoom || 100);
        const next = Math.max(60, Math.min(160, current + (action === 'zoom-in' ? 20 : -20)));
        paper.dataset.zoom = String(next);
        paper.style.fontSize = `${next}%`;
        button.parentElement.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('%')) node.textContent = ` 图片 1 / 2　 ${next}% `; });
      }
      else showToast('已打开对应快捷操作入口');
    }
    const choice = event.target.closest('[data-pick-tag]');
    if (choice) {
      const label = choice.dataset.pickTag;
      draftTags = draftTags.includes(label) ? draftTags.filter(item => item !== label) : [...draftTags, label];
      renderTagPicker();
    }
  });
  $$('[data-close-drawer]').forEach(button => button.addEventListener('click', closeDrawers));
  $('#drawerMask').addEventListener('click', closeDrawers);
  $('#tagSearch').addEventListener('input', renderTagPicker);
  $('#saveCaseTags').addEventListener('click', () => {
    if (!editingCase) return;
    editingCase.labels = [...draftTags];
    editingCase.status = draftTags.length ? '已归因' : '待归因';
    editingCase.source = draftTags.length ? '人工' : '—';
    editingCase.confidence = '—';
    editingCase.basis = draftTags.length ? '人工复核并确认原因标签' : '人工移除全部有效标签';
    editingCase.state = draftTags.length ? 'done' : 'pending';
    renderCases(editingCase.id.startsWith('S-') ? 'sales' : 'purchase');
    closeDrawers();
    showToast('人工归因结果已保存，后续 AI 不会覆盖');
  });
  $('#operationConfirm').addEventListener('click', event => {
    const operation = event.currentTarget.dataset.operation;
    const success = event.currentTarget.dataset.success || '操作已提交';
    closeDrawers();
    if (operation === 'view-contract') {
      showPage('tenants');
      activateTabs($('[data-tabs="tenant"]'), 'contracts');
      location.hash = 'tenants/contracts';
    } else if (operation === 'view-cases') {
      showPage('stats', 'sales');
      activateTabs($('[data-tabs="sales-analysis"]'), 'sales-cases');
      location.hash = 'stats/sales/sales-cases';
    } else if (operation === 'channel-config') {
      showPage('system');
      activateTabs($('.system-tabs'), 'channels');
      location.hash = 'system/channels';
    }
    showToast(success);
  });

  const statsLabels = { sales: '销售分析', purchase: '采购分析', contract: '合同统计', token: 'Token 用量', asr: '语音识别用量' };
  function showPage(page, statsView = 'sales') {
    $$('.page').forEach(node => node.classList.toggle('active', node.id === `page-${page}`));
    $$('.side-item').forEach(node => node.classList.remove('active'));
    const direct = $(`.side-item[data-page="${page}"]`);
    if (direct) direct.classList.add('active');
    if (page === 'stats') {
      $('#statsButton').classList.add('active');
      $$('.stats-view').forEach(view => view.classList.toggle('active', view.dataset.statsView === statsView));
      $$('#statsFlyout button').forEach(button => button.classList.toggle('active', button.dataset.stats === statsView));
      $('#pageTabText').textContent = statsLabels[statsView];
      $('#pageTab').hidden = false;
    } else if (page === 'system') {
      $('#pageTabText').textContent = '系统设置';
      $('#pageTab').hidden = false;
    } else {
      $('#pageTab').hidden = true;
    }
  }

  $$('.side-item[data-page]').forEach(button => button.addEventListener('click', () => { showPage(button.dataset.page); location.hash = button.dataset.page; }));
  $('#statsButton').addEventListener('click', event => { event.stopPropagation(); $('#statsFlyout').classList.toggle('open'); });
  $$('#statsFlyout button').forEach(button => button.addEventListener('click', () => { showPage('stats', button.dataset.stats); $('#statsFlyout').classList.remove('open'); location.hash = `stats/${button.dataset.stats}`; }));
  document.addEventListener('click', event => { if (!event.target.closest('.stats-wrap')) $('#statsFlyout').classList.remove('open'); });

  function syncFromHash() {
    const parts = location.hash.slice(1).split('/');
    if (parts[0] === 'dashboard' || (parts[0] === 'tenants' && parts[1] === 'dashboard')) {
      showPage('dashboard');
      const dashboardPanel = parts[0] === 'dashboard' ? parts[1] : parts[2];
      if (dashboardPanel) activateTabs($('[data-tabs="dashboard"]'), dashboardPanel);
    } else if (parts[0] === 'stats') {
      const view = ['sales', 'purchase', 'contract', 'token', 'asr'].includes(parts[1]) ? parts[1] : 'sales';
      showPage('stats', view);
      if (parts[2] && (view === 'sales' || view === 'purchase')) activateTabs($(`[data-tabs="${view}-analysis"]`), parts[2]);
    } else if (parts[0] === 'templates') {
      showPage('templates');
    } else if (parts[0] === 'system') {
      showPage('system');
      if (parts[1]) activateTabs($('.system-tabs'), parts[1]);
    } else if (parts[0] === 'tenants') {
      showPage('tenants');
      if (parts[1]) activateTabs($('[data-tabs="tenant"]'), parts[1]);
    } else {
      showPage('dashboard');
    }
  }

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
})();
