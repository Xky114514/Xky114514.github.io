const ANNOTATION_STORAGE_KEY = "prd-platform-annotation-overrides";
const ANNOTATION_FILE = "annotations.json";
const appShellTemplate = document.getElementById("app").innerHTML;

const state = {
  route: "projects",
  tabs: [{ key: "projects", label: "项目库", isHome: true }],
  activeDetailId: "PI-20260701-011",
  chatMode: "customer",
  purchaseChatMode: "supplier",
  promptTab: "customer",
  settingsTab: "roles",
  reviewTab: "list",
  groupBoardFilter: "all",
  annotationTab: "overview",
  annotationEditing: false,
  annotationOpen: false,
  filters: {
    salesCustomer: "",
    purchaseSupplier: "",
    salesStatus: "all",
    purchaseStatus: "all",
  },
};

const routes = {
  projects: { label: "PRD 项目库", module: "projects", title: "PRD 展示平台" },
  home: { label: "项目首页", module: "home", title: "AI 录单系统" },
  statistics: { label: "统计", module: "statistics", title: "主工作区" },
  "decision-screen": { label: "决策大屏", module: "decision", title: "主工作区" },
  "sales-entry": { label: "销售订单录入", module: "sales", title: "销售 Agent" },
  "sales-review": { label: "销售订单审核", module: "sales", title: "销售 Agent" },
  "sales-customers": { label: "客户管理", module: "sales", title: "销售 Agent" },
  "sales-customer-groups": { label: "客户分组", module: "sales", title: "销售 Agent" },
  "sales-groups": { label: "销售群聊管理", module: "sales", title: "销售 Agent" },
  "purchase-entry": { label: "采购入库单录入", module: "purchase", title: "采购 Agent" },
  "purchase-review": { label: "采购入库单审核", module: "purchase", title: "采购 Agent" },
  "purchase-detail": { label: "采购入库单详情", module: "purchase", title: "采购 Agent" },
  "purchase-suppliers": { label: "供应商管理", module: "purchase", title: "采购 Agent" },
  "purchase-supplier-groups": { label: "供应商分组", module: "purchase", title: "采购 Agent" },
  "purchase-groups": { label: "采购群聊管理", module: "purchase", title: "采购 Agent" },
  "sales-prompts": { label: "提示词", tabLabel: "销售提示词", module: "sales", title: "销售 Agent" },
  "sales-memory": { label: "AI 记忆", tabLabel: "销售 AI 记忆", module: "sales", title: "销售 Agent" },
  "purchase-prompts": { label: "提示词", tabLabel: "采购提示词", module: "purchase", title: "采购 Agent" },
  "purchase-memory": { label: "AI 记忆", tabLabel: "采购 AI 记忆", module: "purchase", title: "采购 Agent" },
  settings: { label: "租户设置", module: "settings", title: "租户公共设置" },
};

const routeAliases = {
  prompts: "sales-prompts",
  memory: "sales-memory",
};

const primaryMenus = [
  { key: "home", label: "首页", icon: "home", module: "home" },
  { key: "sales-entry", label: "销售 Agent", icon: "sales", module: "sales" },
  { key: "purchase-entry", label: "采购 Agent", icon: "purchase", module: "purchase" },
  { key: "statistics", label: "统计", icon: "stats", module: "statistics" },
  { key: "decision-screen", label: "决策大屏", icon: "dashboard", module: "decision" },
  { key: "settings", label: "租户设置", icon: "setting", module: "settings" },
];

const sideMenus = {
  sales: [
    { key: "sales-entry", label: "订单录入", icon: "edit" },
    { key: "sales-review", label: "订单审核", icon: "review" },
    { key: "sales-customers", label: "客户管理", icon: "customer" },
    { key: "sales-customer-groups", label: "客户分组", icon: "group" },
    { key: "sales-groups", label: "群聊管理", icon: "group" },
    { key: "sales-prompts", label: "提示词", icon: "prompt" },
    { key: "sales-memory", label: "AI 记忆", icon: "memory" },
  ],
  purchase: [
    { key: "purchase-entry", label: "入库录入", icon: "edit" },
    { key: "purchase-review", label: "入库审核", icon: "review" },
    { key: "purchase-suppliers", label: "供应商管理", icon: "supplier" },
    { key: "purchase-supplier-groups", label: "供应商分组", icon: "group" },
    { key: "purchase-groups", label: "群聊管理", icon: "group" },
    { key: "purchase-prompts", label: "提示词", icon: "prompt" },
    { key: "purchase-memory", label: "AI 记忆", icon: "memory" },
  ],
};

const iconSvg = {
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6.5h6l2 2h10V19H3z"/><path d="M3 6.5V5h6l2 2"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>',
  sales: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 20V7h14v13"/><path d="M8 7a4 4 0 0 1 8 0"/><path d="M8 12h8"/><path d="M8 16h6"/></svg>',
  purchase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16l-2 13H6L4 7Z"/><path d="M8 7a4 4 0 0 1 8 0"/><path d="M9 12h6"/><path d="M10 16h4"/></svg>',
  config: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 2.1 2.1"/><path d="m16.3 16.3 2.1 2.1"/><path d="m18.4 5.6-2.1 2.1"/><path d="m7.7 16.3-2.1 2.1"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4"/><path d="M8 16l2.5-.5L17 9l-2-2-6.5 6.5z"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18H6z"/><path d="M9 8h6"/><path d="M9 12h3"/><path d="m9 16 2 2 4-5"/></svg>',
  customer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="10" r="2.5"/><path d="M15 20a4.5 4.5 0 0 1 5.5-4.4"/></svg>',
  supplier: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h16v11H4z"/><path d="M7 8V5h10v3"/><path d="M8 13h8"/><path d="M8 16h5"/></svg>',
  group: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0"/><path d="M12.5 20a5 5 0 0 1 8.5-3.5"/></svg>',
  prompt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h14v12H8l-3 3z"/><path d="M8 8h8"/><path d="M8 12h6"/></svg>',
  memory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M8 18v4"/><path d="M16 18v4"/><path d="M2 8h4"/><path d="M18 8h4"/><path d="M2 16h4"/><path d="M18 16h4"/><circle cx="12" cy="12" r="3"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-9"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 13a8 8 0 1 1 16 0"/><path d="M12 13l4-4"/><path d="M6.5 17h11"/><path d="M9 21h6"/></svg>',
  setting: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .3 2l.1.1-2.1 2.1-.1-.1a1.8 1.8 0 0 0-2-.3 1.8 1.8 0 0 0-1 1.6V21h-3v-.2a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .3l-.1.1-2.1-2.1.1-.1a1.8 1.8 0 0 0 .3-2 1.8 1.8 0 0 0-1.6-1H5v-3h.2a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.3-2l-.1-.1 2.1-2.1.1.1a1.8 1.8 0 0 0 2 .3 1.8 1.8 0 0 0 1-1.6V3h3v.2a1.8 1.8 0 0 0 1 1.6 1.8 1.8 0 0 0 2-.3l.1-.1 2.1 2.1-.1.1a1.8 1.8 0 0 0-.3 2 1.8 1.8 0 0 0 1.6 1h.2v3h-.2a1.8 1.8 0 0 0-1.6 1Z"/></svg>',
};

const salesTasks = [
  { id: "SO-20260701-001", status: "待处理", group: "华南餐饮订货群", store: "天河鲜食店", raw: "土豆 20 斤，前腿肉 8 斤，明早送", items: 2, order: "-", auditor: "李娜" },
  { id: "SO-20260701-002", status: "已完成", group: "江北食堂订货群", store: "江北食堂", raw: "白菜两筐，鸡蛋 5 板", items: 2, order: "GM982711", auditor: "陈林" },
  { id: "SO-20260701-003", status: "失败", group: "直营门店补货群", store: "万象城门店", raw: "昨天一样，饮料少一点", items: 0, order: "-", auditor: "王明" },
  { id: "SO-20260701-004", status: "合单", group: "华南餐饮订货群", store: "天河鲜食店", raw: "追加香菜 3 斤", items: 1, order: "GM982742", auditor: "李娜" },
];

const purchaseTasks = [
  { id: "PI-20260701-011", status: "待处理", supplier: "海盛水产", group: "海鲜供应商对接群", store: "中心仓", raw: "鲈鱼 80 条，基围虾 120 斤，今晚到仓", items: 2, order: "-", auditor: "赵倩" },
  { id: "PI-20260701-012", status: "已完成", supplier: "春田蔬菜基地", group: "蔬菜采购群", store: "一号冷库", raw: "云南生菜 400 斤，油麦菜 260 斤", items: 2, order: "GM-IN-7712", auditor: "周诚" },
  { id: "PI-20260701-013", status: "待处理", supplier: "岭南肉禽", group: "肉禽采购群", store: "二号冷库", raw: "鸡腿 30 件，猪五花 18 件", items: 2, order: "-", auditor: "赵倩" },
];

const customers = [
  { id: "C10021", name: "天河鲜食店", address: "广州天河区体育西路 88 号", phone: "13800001111", groups: "华南餐饮订货群", sku: 428, priority: "订单备注" },
  { id: "C10037", name: "江北食堂", address: "重庆江北区观音桥 17 号", phone: "13600002222", groups: "江北食堂订货群", sku: 312, priority: "合并" },
  { id: "C10052", name: "万象城门店", address: "深圳罗湖区宝安南路 1881 号", phone: "13900003333", groups: "直营门店补货群", sku: 537, priority: "SPU备注" },
  { id: "C10078", name: "云岭酒店", address: "昆明盘龙区白云路 9 号", phone: "13700004444", groups: "未绑定", sku: 0, priority: "订单备注" },
];

const suppliers = [
  { id: "S20011", name: "海盛水产", category: "水产海鲜", contact: "吴经理 13500001111", groups: "海鲜供应商对接群", synced: 146, warehouse: "中心仓" },
  { id: "S20018", name: "春田蔬菜基地", category: "蔬菜", contact: "林主管 13500002222", groups: "蔬菜采购群", synced: 232, warehouse: "一号冷库" },
  { id: "S20022", name: "岭南肉禽", category: "肉禽冻品", contact: "陈经理 13500003333", groups: "肉禽采购群", synced: 98, warehouse: "二号冷库" },
  { id: "S20031", name: "北仓调味品", category: "干调", contact: "周经理 13500004444", groups: "未绑定", synced: 0, warehouse: "干货仓" },
];

const groups = [
  { name: "华南餐饮订货群", members: 42, salesBound: "3 个客户", purchaseBound: "-", reviewer: "李娜", bot: "正常", time: "06:00-22:00", pending: 6 },
  { name: "海鲜供应商对接群", members: 18, salesBound: "-", purchaseBound: "1 个供应商", reviewer: "赵倩", bot: "正常", time: "00:00-23:30", pending: 3 },
  { name: "蔬菜采购群", members: 25, salesBound: "-", purchaseBound: "1 个供应商", reviewer: "周诚", bot: "正常", time: "05:00-20:00", pending: 1 },
  { name: "直营门店补货群", members: 63, salesBound: "8 个客户", purchaseBound: "-", reviewer: "王明", bot: "禁言", time: "不限", pending: 2 },
];

const prdProjects = [
  {
    id: "ai-order",
    name: "AI 录单系统",
    status: "迭代中",
    route: "home",
    version: "V0.3",
    owner: "管理员",
    updated: "2026-07-02",
    desc: "用可交互前端承载销售订单、采购入库、群聊看板、提示词和 AI 记忆等 PRD 内容。",
    pages: ["首页看板", "统计", "决策大屏", "销售 Agent", "采购 Agent", "批注面板"],
  },
  {
    id: "next-retail",
    name: "门店补货移动端 PRD",
    status: "规划中",
    route: "projects",
    version: "待创建",
    owner: "管理员",
    updated: "待排期",
    desc: "预留项目位，后续可把移动端补货流程也接入同一套 PRD 展示平台。",
    pages: ["项目首页", "补货单", "审批流"],
  },
  {
    id: "next-finance",
    name: "经营分析看板 PRD",
    status: "规划中",
    route: "projects",
    version: "待创建",
    owner: "管理员",
    updated: "待排期",
    desc: "预留项目位，用于展示指标口径、图表原型、权限和迭代说明。",
    pages: ["指标总览", "门店排行", "异常预警"],
  },
];

let iterationHistory = [
  {
    version: "V0.3",
    date: "2026-07-02",
    title: "PRD 平台化改造",
    changes: ["增加 PRD 项目库", "增加全局文字批注与迭代记录面板", "支持右侧批注在前端直接编辑"],
  },
  {
    version: "V0.2",
    date: "2026-07-02",
    title: "群聊看板调整",
    changes: ["增加销售订单/采购入库单筛选", "去掉业务域列", "右侧增加全部汇总入口"],
  },
  {
    version: "V0.1",
    date: "2026-07-01",
    title: "AI 录单原型搭建",
    changes: ["拆分销售 Agent 与采购 Agent", "补齐审核、群聊、提示词、AI 记忆与租户设置页面"],
  },
];

let pageAnnotations = {
  projects: {
    title: "PRD 项目库",
    overview: "这是所有前端 PRD 的统一入口。业务方先确认项目范围，开发从这里进入对应原型和页面批注。",
    dev: ["每个项目卡片都预留 route 字段，后续新增 PRD 时只需要扩展项目数据和对应路由。", "规划中项目当前不跳转真实原型，用 toast 明确提示，避免误以为功能已完成。"],
    business: ["项目状态用于区分已可评审、迭代中和规划中的 PRD。", "同一平台承载多个项目，方便历史版本、页面说明和业务规则集中管理。"],
    iteration: ["本次新增项目库，当前 AI 录单系统作为第一个可打开项目。", "点击 AI 录单系统后进入系统首页看板。"],
  },
  home: {
    title: "项目首页",
    overview: "首页汇总销售、采购双 Agent 的业务入口、任务数据、额度和群聊看板，是业务方评审全局方案的第一页。",
    dev: ["业务入口卡片通过 data-route 切换路由，不依赖后端接口。", "群聊看板的销售/采购筛选使用 state.groupBoardFilter 控制，后续接接口时保持字段语义一致即可。"],
    business: ["销售与采购 Agent 的入口相互独立，但首页保留全局汇总，适合管理者查看整体处理情况。", "群聊看板默认展示全部，点击销售订单或采购入库单时只看对应业务域。"],
    iteration: ["V0.2 调整群聊看板，去掉业务域列，新增筛选标签和全部汇总入口。"],
  },
  statistics: {
    title: "统计",
    overview: "统计页用于查看操作员绩效，操作员统一包含审核员和录单员，当前原型重点展示提交订单、下单商品、识别率和平均停留等指标。",
    dev: ["统计页为主工作区一级菜单，路由为 statistics。", "当前数据为静态演示表格，后续可按日期范围、角色和操作员维度接入真实绩效接口。"],
    business: ["业务方重点确认绩效指标口径是否满足审核员和录单员管理。", "导出 Excel 为前端演示按钮，后续需要明确导出字段和权限。"],
    iteration: ["新增主工作区统计菜单和操作员绩效页面。"],
  },
  "decision-screen": {
    title: "决策大屏",
    overview: "决策大屏用于从额度资产、下单类型、异常诊断和操作员效能四个角度总览 AI 录单业务表现。",
    dev: ["决策大屏为主工作区一级菜单，路由为 decision-screen。", "页面按卡片和表格分区承载静态指标，后续可替换为实时指标接口和图表组件。"],
    business: ["管理者可通过大屏快速判断额度消耗、订单提交、识别质量和人工纠错情况。", "时间范围控件用于表达今日实时、昨日、近 7 天、近 30 天和自定义查询。"],
    iteration: ["新增经营决策大屏页面，补充管理层视角。"],
  },
  "sales-entry": {
    title: "销售订单录入",
    overview: "销售录入页模拟录单员从客户或群聊进入，对文字、图片、Excel、PDF 订单内容进行 AI 识别。",
    dev: ["左侧客户/群聊分段切换由 state.chatMode 控制。", "发送消息后会向 chatMessages.sales 追加用户消息和 Agent 响应，便于演示识别链路。"],
    business: ["录单前必须先确定客户或群聊来源，避免订单归属错误。", "识别结果进入销售订单审核，不在录入页直接完成下单。"],
    iteration: ["V0.1 完成销售录入核心交互，后续可补充附件预览和异常商品提示。"],
  },
  "purchase-entry": {
    title: "采购入库单录入",
    overview: "采购录入页模拟仓管或采购从供应商/群聊导入入库信息，由 AI 生成待审核入库单。",
    dev: ["左侧供应链/群聊分段切换由 state.purchaseChatMode 控制。", "消息发送后进入 purchaseTasks 对应的审核演示流程。"],
    business: ["入库信息需要识别供应商、商品、数量和仓库。", "异常商品不自动入库，需要进入人工审核。"],
    iteration: ["V0.1 完成采购入库录入入口，后续可补充到仓时间和批次字段。"],
  },
  "sales-review": {
    title: "销售订单审核",
    overview: "销售审核页用于查看 AI 识别后的订单任务，支持状态筛选、列表视图和群聊视图。",
    dev: ["状态筛选使用 state.filters.salesStatus，列表和群聊视图通过 state.reviewTab 切换。", "失败、合单等状态保留独立标签，方便后续接真实审核动作。"],
    business: ["待处理订单需要人工确认后进入正式订单。", "失败任务需要补充信息或转人工处理。"],
    iteration: ["V0.1 完成销售审核列表，后续可加入批量审核与合单选择。"],
  },
  "purchase-review": {
    title: "采购入库单审核",
    overview: "采购审核页集中处理供应商入库任务，确认后可进入采购入库单详情页。",
    dev: ["采购任务使用 purchaseTasks 数据，详情按钮会路由到 purchase-detail。", "状态筛选使用 state.filters.purchaseStatus，与销售审核保持同构。"],
    business: ["待处理入库单需要确认商品、数量、仓库和入库员。", "审核完成后才允许执行实际入库确认。"],
    iteration: ["V0.1 完成采购审核主流程，后续可增加入库差异对账。"],
  },
  "purchase-detail": {
    title: "采购入库单详情",
    overview: "详情页展示供应商送货单、AI 识别入库明细、系统采购单据匹配结果和逐行差异校验，帮助入库员在确认入库前完成对账。",
    dev: ["当前 activeDetailId 控制详情数据，明细表格使用静态输入框模拟可编辑状态。", "新增系统采购单据匹配区、差异汇总和逐行对账表，后续应分别接入采购单查询、自动匹配、人工改派采购单和差异处理接口。", "保存和全部确认入库使用 toast 演示，后续替换为接口提交。"],
    business: ["入库员先核对供应商送货单与系统采购单是否匹配，再逐行确认商品、数量、单位和仓库。", "数量超出、采购单缺失、商品不一致等差异不得直接全部入库，需要人工确认处理方式。", "允许一张供应商送货单匹配多张系统采购单，系统应展示每张采购单的可入库余额。"],
    iteration: ["V0.1 完成采购详情结构。", "V0.4 新增系统采购单据匹配、AI 明细与采购单逐行对账、差异汇总和处理建议。"],
  },
  "sales-customers": {
    title: "客户管理",
    overview: "客户管理页展示客户、地址、联系方式、绑定群聊和同步 SKU 状态。",
    dev: ["搜索条件写入 state.filters.salesCustomer，查询按钮触发本地过滤。", "表格字段后续可直接映射客户主数据接口。"],
    business: ["客户绑定群聊后，群聊订单才能正确归属客户。", "SKU 同步数量用于判断客户商品范围是否完整。"],
    iteration: ["V0.1 完成客户列表和搜索能力。"],
  },
  "sales-customer-groups": {
    title: "客户分组",
    overview: "客户分组页用于把审核员与客户、客户群聊建立分组关系，便于销售订单进入对应人员的处理范围。",
    dev: ["客户分组属于销售 Agent 二级菜单，路由为 sales-customer-groups。", "新建分组弹窗展示审核员、分组名称、群聊和客户选择区，当前为静态前端原型。"],
    business: ["一个客户分组可以绑定审核员、多个群聊和多个客户。", "客户分组用于明确销售订单审核归属，减少无人处理或重复处理。"],
    iteration: ["新增销售 Agent 客户分组菜单和新建分组弹窗。"],
  },
  "purchase-suppliers": {
    title: "供应商管理",
    overview: "供应商管理页展示供应商分类、联系人、绑定群聊、默认仓库和同步状态。",
    dev: ["搜索条件写入 state.filters.purchaseSupplier，和客户管理共用 partyPage 模板。", "供应商字段与客户字段保持同类结构，便于复用表格组件。"],
    business: ["供应商绑定群聊后，群聊入库消息才能自动归属。", "默认仓库帮助 AI 识别缺失仓库信息。"],
    iteration: ["V0.1 完成供应商列表和搜索能力。"],
  },
  "purchase-supplier-groups": {
    title: "供应商分组",
    overview: "供应商分组页用于把入库员与供应商、供应商群聊建立分组关系，便于采购入库任务进入对应人员的处理范围。",
    dev: ["供应商分组属于采购 Agent 二级菜单，路由为 purchase-supplier-groups。", "新建分组弹窗展示入库员、分组名称、群聊和供应商选择区，当前为静态前端原型。"],
    business: ["一个供应商分组可以绑定入库员、多个供应商和多个供应商群聊。", "供应商分组用于明确采购入库审核和入库确认责任人。"],
    iteration: ["新增采购 Agent 供应商分组菜单和新建分组弹窗。"],
  },
  "sales-groups": {
    title: "销售群聊管理",
    overview: "销售群聊管理页维护销售业务群、绑定客户、审核员、机器人状态和下单时段。",
    dev: ["销售群通过 purchaseBound === '-' 过滤得到。", "机器人状态用 tag 样式表现，后续可接启停和禁言接口。"],
    business: ["每个销售群应绑定客户，减少 AI 识别时的归属歧义。", "禁言状态表示机器人不主动响应或不参与群内处理。"],
    iteration: ["V0.1 完成销售群聊管理列表。"],
  },
  "purchase-groups": {
    title: "采购群聊管理",
    overview: "采购群聊管理页维护供应商群、绑定供应商、审核员、机器人状态和入库时段。",
    dev: ["采购群通过 purchaseBound !== '-' 过滤得到。", "与销售群聊管理共用 groupsPage 模板，只切换业务字段。"],
    business: ["采购群需要绑定供应商，否则无法稳定生成入库单。", "入库时段用于限制机器人处理非工作时间消息。"],
    iteration: ["V0.1 完成采购群聊管理列表。"],
  },
  "sales-prompts": {
    title: "销售提示词",
    overview: "销售提示词页用于维护销售订单解析模板和 Agent 规则。",
    dev: ["promptTab 控制客户提示词和 Agent 提示词两类视图。", "编辑弹窗当前为演示保存，后续接模板版本接口。"],
    business: ["销售提示词只影响销售订单解析，不影响采购入库。", "特殊客户规则可沉淀为独立模板。"],
    iteration: ["V0.1 完成销售提示词配置页。"],
  },
  "purchase-prompts": {
    title: "采购提示词",
    overview: "采购提示词页用于维护供应商入库解析模板和采购 Agent 规则。",
    dev: ["与销售提示词共用 promptsPage，通过 type 区分文案。", "模板目标对象可扩展到供应商、仓库或品类。"],
    business: ["采购提示词只影响采购入库识别。", "异常商品、价格和到仓信息应通过提示词明确处理策略。"],
    iteration: ["V0.1 完成采购提示词配置页。"],
  },
  "sales-memory": {
    title: "销售 AI 记忆",
    overview: "销售 AI 记忆页展示人工审核后沉淀的别名、偏好和客户规则。",
    dev: ["记忆列表为静态 rows，查看按钮打开统一 memoryModal。", "后续可按来源、状态和命中次数接入真实数据。"],
    business: ["记忆应来自人工确认，避免错误规则长期影响销售识别。", "命中次数帮助判断规则是否值得固化。"],
    iteration: ["V0.1 完成销售记忆列表。"],
  },
  "purchase-memory": {
    title: "采购 AI 记忆",
    overview: "采购 AI 记忆页展示供应商商品别名、入库偏好和仓库规则。",
    dev: ["与销售记忆共用 memoryPage，通过 type 切换业务文案。", "后续可以增加记忆审批和过期策略。"],
    business: ["采购记忆影响入库识别，需要关注供应商、规格和仓库准确性。", "错误记忆应能禁用或回滚。"],
    iteration: ["V0.1 完成采购记忆列表。"],
  },
  settings: {
    title: "租户公共设置",
    overview: "租户设置页集中展示角色权限、成员、同步规则和额度配置，是跨 Agent 的公共配置。",
    dev: ["settingsTab 控制四类设置面板，成员新增使用 operatorModal 演示。", "同步和额度目前为静态卡片，后续接租户配置接口。"],
    business: ["管理员可管理成员、同步规则和额度阈值。", "额度低于阈值时应限制普通成员继续提交识别任务。"],
    iteration: ["V0.1 完成租户公共设置框架。"],
  },
};

let annotationChangeLogs = {};

applyAnnotationOverrides();

const annotationFieldLabels = {
  title: "页面标题",
  overview: "页面说明",
  dev: "开发批注",
  business: "业务规则",
  iterationNote: "本页迭代说明",
};

const chatMessages = {
  sales: [
    { role: "assistant", text: "已连接销售订单录入 Agent，请选择客户或群聊后发送订单。" },
    { role: "user", text: "土豆 20 斤，前腿肉 8 斤，明早送天河店" },
    { role: "assistant", text: "已识别 2 个商品，生成待审核销售订单 SO-20260701-001。" },
  ],
  purchase: [
    { role: "assistant", text: "已连接采购入库 Agent，请选择供应商或群聊后发送入库信息。" },
    { role: "user", text: "鲈鱼 80 条，基围虾 120 斤，今晚到中心仓" },
    { role: "assistant", text: "已识别 2 个采购商品，生成待审核入库单 PI-20260701-011。" },
  ],
};

function routeTo(key) {
  if (state.route === "projects" && key !== "projects") {
    state.tabs = [{ key: "home", label: "首页", isHome: true }];
  }
  window.location.hash = key;
}

function getRouteFromHash() {
  const key = window.location.hash.replace(/^#/, "");
  if (routeAliases[key]) return routeAliases[key];
  return routes[key] ? key : "projects";
}

function render() {
  ensureAppShell();
  state.route = getRouteFromHash();
  state.annotationEditing = false;
  document.body.classList.toggle("entry-mode", state.route === "sales-entry" || state.route === "purchase-entry" || state.route === "purchase-detail");
  document.body.classList.toggle("project-mode", state.route === "projects");
  document.body.classList.toggle("annotation-open", state.annotationOpen && state.route !== "projects");
  normalizeTabsForRoute();
  ensureTab(state.route);
  renderSideMenu();
  renderTopbar();
  renderTabs();
  renderContent();
  renderAnnotationPanel();
  bindRouteButtons();
  bindGlobalInteractions();
}

function ensureAppShell() {
  const app = document.getElementById("app");
  if (!app.querySelector("#sideMenu")) app.innerHTML = appShellTemplate;
  app.className = "app-shell";
}

function ensureTab(key) {
  if (state.tabs.some((tab) => tab.key === key)) return;
  state.tabs.push({ key, label: routes[key].tabLabel || routes[key].label, isHome: key === "projects" });
}

function normalizeTabsForRoute() {
  if (state.route === "projects") {
    state.tabs = [{ key: "projects", label: "项目库", isHome: true }];
    return;
  }
  state.tabs = state.tabs.filter((tab) => tab.key !== "projects");
  if (!state.tabs.length) state.tabs.push({ key: "home", label: "首页", isHome: true });
}

function bindRouteButtons(root = document) {
  root.querySelectorAll("[data-route]").forEach((el) => {
    el.onclick = () => routeTo(el.dataset.route);
  });
}

function bindGlobalInteractions() {
  document.querySelectorAll("[data-annotation-toggle]").forEach((button) => {
    button.onclick = () => {
      state.annotationOpen = !state.annotationOpen;
      render();
    };
  });
}

function renderSideMenu() {
  const route = routes[state.route];
  const activeKey = state.route === "purchase-detail" ? "purchase-review" : state.route;
  const moduleTitle = route.module === "sales" ? "销售 Agent" : route.module === "purchase" ? "采购 Agent" : "";
  const primaryHtml = `
    <div class="side-group">
      <div class="side-section">主工作区</div>
      ${primaryMenus.map((item) => `
        <button class="side-item side-primary ${item.module === route.module ? "active" : ""}" data-route="${item.key}" title="${item.label}" aria-label="${item.label}">
          <span class="side-icon" aria-hidden="true">${iconSvg[item.icon] || iconSvg.home}</span>
          <span class="side-label">${item.label}</span>
        </button>
      `).join("")}
    </div>
  `;
  const menu = sideMenus[route.module] || [];
  const moduleHtml = menu.length ? `
    <div class="side-group side-subgroup">
      <div class="side-section">${moduleTitle}</div>
      ${menu.map((item) => `
        <button class="side-item side-subitem ${item.key === activeKey ? "active" : ""}" data-route="${item.key}" title="${item.label}" aria-label="${item.label}">
          <span class="side-icon" aria-hidden="true">${iconSvg[item.icon] || iconSvg.home}</span>
          <span class="side-label">${item.label}</span>
        </button>
      `).join("")}
    </div>
  ` : "";
  document.getElementById("sideMenu").innerHTML = primaryHtml + moduleHtml;
}

function routeBreadcrumb(route) {
  if (route.module === "projects") return "项目库 / 全部 PRD";
  if (route.module === "home") return `${route.title} / 项目首页`;
  return `${route.title} / ${route.label}`;
}

function renderTopbar() {
  const route = routes[state.route];
  document.querySelector(".tenant strong").textContent = "前端 PRD 展示平台";
  document.querySelector(".user-name").textContent = route.module === "projects" ? "" : "管理员";
  const actionButton = document.querySelector(".top-actions .text-btn.muted");
  actionButton.textContent = route.module === "projects" ? "" : "页面批注";
  if (route.module === "projects") delete actionButton.dataset.annotationToggle;
  else actionButton.dataset.annotationToggle = "true";
  document.getElementById("moduleHint").textContent = routeBreadcrumb(route);
}

function renderTabs() {
  document.getElementById("tabbar").innerHTML = state.tabs.map((tab) => `
    <button class="tab ${tab.key === state.route ? "active" : ""}" data-tab="${tab.key}">
      ${tab.key === "projects" ? "项目库" : tab.isHome ? "⌂" : tab.label}
      ${!tab.isHome && state.tabs.length > 1 ? `<span class="tab-close" data-close="${tab.key}">×</span>` : ""}
    </button>
  `).join("");

  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.onclick = (event) => {
      if (event.target.dataset.close) return;
      routeTo(tab.dataset.tab);
    };
  });
  document.querySelectorAll("[data-close]").forEach((close) => {
    close.onclick = (event) => {
      event.stopPropagation();
      const key = close.dataset.close;
      state.tabs = state.tabs.filter((tab) => tab.key !== key);
      if (state.route === key) routeTo(state.tabs[state.tabs.length - 1]?.key || "projects");
      renderTabs();
    };
  });
}

function renderContent() {
  const content = document.getElementById("content");
  if (state.route === "projects") content.innerHTML = projectsPage();
  if (state.route === "home") content.innerHTML = homePage();
  if (state.route === "statistics") content.innerHTML = statisticsPage();
  if (state.route === "decision-screen") content.innerHTML = decisionScreenPage();
  if (state.route === "sales-entry") content.innerHTML = entryPage("sales");
  if (state.route === "purchase-entry") content.innerHTML = entryPage("purchase");
  if (state.route === "sales-review") content.innerHTML = reviewPage("sales");
  if (state.route === "purchase-review") content.innerHTML = reviewPage("purchase");
  if (state.route === "purchase-detail") content.innerHTML = purchaseDetailPage();
  if (state.route === "sales-customers") content.innerHTML = partyPage("sales");
  if (state.route === "purchase-suppliers") content.innerHTML = partyPage("purchase");
  if (state.route === "sales-customer-groups") content.innerHTML = partyGroupPage("sales");
  if (state.route === "purchase-supplier-groups") content.innerHTML = partyGroupPage("purchase");
  if (state.route === "sales-groups") content.innerHTML = groupsPage("sales");
  if (state.route === "purchase-groups") content.innerHTML = groupsPage("purchase");
  if (state.route === "sales-prompts") content.innerHTML = promptsPage("sales");
  if (state.route === "sales-memory") content.innerHTML = memoryPage("sales");
  if (state.route === "purchase-prompts") content.innerHTML = promptsPage("purchase");
  if (state.route === "purchase-memory") content.innerHTML = memoryPage("purchase");
  if (state.route === "settings") content.innerHTML = settingsPage();
  wirePageInteractions();
}

function projectsPage() {
  return `
    <div class="page">
      <section class="prd-hero">
        <div>
          <span class="pill blue">PRD Platform</span>
          <h1>用前端原型管理产品需求</h1>
          <p>每个项目都可以保留交互界面、页面批注、开发说明、业务规则和迭代记录，让开发与业务方在同一处对齐。</p>
        </div>
        <div class="prd-hero-stats">
          <div><strong>${prdProjects.length}</strong><span>PRD 项目</span></div>
          <div><strong>${iterationHistory.length}</strong><span>迭代记录</span></div>
          <div><strong>${Object.keys(pageAnnotations).length}</strong><span>已批注页面</span></div>
        </div>
      </section>

      <div class="section-title"><h2>项目列表</h2><span class="muted">点击项目进入对应前端 PRD</span></div>
      <div class="prd-project-grid">
        ${prdProjects.map((project) => `
          <article class="prd-project-card">
            <div class="prd-project-top">
              <span class="app-icon ${project.id === "ai-order" ? "sales-grad" : "config-grad"}">${project.id === "ai-order" ? "AI" : "PRD"}</span>
              <span class="tag ${project.status === "迭代中" ? "blue" : "gold"}">${project.status}</span>
            </div>
            <h3>${project.name}</h3>
            <p>${project.desc}</p>
            <div class="prd-project-meta">
              <span>版本 <b>${project.version}</b></span>
              <span>更新 <b>${project.updated}</b></span>
              <span>${project.owner}</span>
            </div>
            <div class="agent-menus">
              ${project.pages.map((page) => `<span class="pill">${page}</span>`).join("")}
            </div>
            <div class="prd-project-actions">
              ${project.status === "迭代中"
                ? `<button class="btn primary" data-route="${project.route}">进入录单系统</button>`
                : `<button class="btn" data-toast="${project.name} 还在规划中，后续可接入新的前端 PRD">预留项目</button>`}
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function getCurrentAnnotation() {
  return pageAnnotations[state.route] || {
    title: routes[state.route]?.label || "页面批注",
    overview: "该页面尚未配置专属批注，默认展示通用 PRD 说明。",
    dev: ["新增页面时，请在 pageAnnotations 中补充页面说明、开发批注、业务规则和迭代记录。"],
    business: ["业务方评审时，请优先确认页面目标、流程边界和字段含义。"],
    iteration: ["后续迭代需要补充该页面的变更记录。"],
  };
}

function renderAnnotationPanel() {
  const panel = document.getElementById("annotationPanel");
  if (!panel) return;
  const annotation = getCurrentAnnotation();
  panel.classList.toggle("is-editing", state.annotationEditing);
  const tabs = [
    { key: "overview", label: "页面说明" },
    { key: "dev", label: "开发批注" },
    { key: "business", label: "业务规则" },
    { key: "iteration", label: "迭代记录" },
  ];
  panel.innerHTML = `
    <div class="annotation-head">
      <div>
        <span class="muted">当前页面批注</span>
        <strong>${escapeHTML(annotation.title)}</strong>
      </div>
      <div class="annotation-actions">
        <span class="tag blue">${iterationHistory[0].version}</span>
        <button class="text-btn" data-annotation-close>关闭</button>
        <button class="text-btn" data-annotation-save-file>保存 JSON</button>
        ${state.annotationEditing
          ? `<button class="text-btn" data-annotation-cancel>取消</button><button class="btn primary" data-annotation-save>保存</button>`
          : `<button class="btn" data-annotation-edit>编辑批注</button>`}
      </div>
    </div>
    ${state.annotationEditing ? "" : `
      <div class="annotation-tabs">
        ${tabs.map((tab) => `<button class="${state.annotationTab === tab.key ? "active" : ""}" data-annotation-tab="${tab.key}">${tab.label}</button>`).join("")}
      </div>
    `}
    <div class="annotation-body">
      ${state.annotationEditing ? annotationEditForm(annotation) : annotationContent(annotation)}
    </div>
  `;
  panel.querySelector("[data-annotation-edit]")?.addEventListener("click", () => {
    state.annotationEditing = true;
    renderAnnotationPanel();
  });
  panel.querySelector("[data-annotation-close]")?.addEventListener("click", () => {
    state.annotationOpen = false;
    state.annotationEditing = false;
    render();
  });
  panel.querySelector("[data-annotation-save-file]")?.addEventListener("click", () => {
    saveAnnotationsFile();
  });
  panel.querySelector("[data-annotation-cancel]")?.addEventListener("click", () => {
    state.annotationEditing = false;
    renderAnnotationPanel();
  });
  panel.querySelector("[data-annotation-save]")?.addEventListener("click", () => {
    saveCurrentAnnotation(panel);
  });
  panel.querySelectorAll("[data-annotation-tab]").forEach((button) => {
    button.onclick = () => {
      state.annotationTab = button.dataset.annotationTab;
      renderAnnotationPanel();
    };
  });
  panel.querySelectorAll("[data-annotation-log]").forEach((button) => {
    button.onclick = () => openAnnotationChangeDetail(button.dataset.annotationLog);
  });
}

function annotationContent(annotation) {
  if (state.annotationTab === "overview") {
    return `
      <section class="annotation-section">
        <h3>页面目标</h3>
        <p>${escapeHTML(annotation.overview)}</p>
      </section>
      <section class="annotation-section">
        <h3>评审提示</h3>
        <ul>
          <li>业务方重点确认流程是否符合真实作业场景。</li>
          <li>开发重点确认页面状态、字段含义和后续接口边界。</li>
        </ul>
      </section>
    `;
  }
  if (state.annotationTab === "dev") {
    return annotationList("开发实现要点", annotation.dev);
  }
  if (state.annotationTab === "business") {
    return annotationList("业务确认点", annotation.business);
  }
  return annotationTimeline(annotation);
}

function annotationList(title, items) {
  return `
    <section class="annotation-section">
      <h3>${title}</h3>
      <ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function annotationEditForm(annotation) {
  return `
    <form class="annotation-edit-form">
      <label class="annotation-edit-field">
        <span>页面标题</span>
        <input data-annotation-field="title" value="${escapeAttribute(annotation.title)}">
      </label>
      <label class="annotation-edit-field">
        <span>页面说明</span>
        <textarea data-annotation-field="overview" data-annotation-size="medium" rows="8">${escapeHTML(annotation.overview)}</textarea>
      </label>
      <label class="annotation-edit-field">
        <span>开发批注（每行一条）</span>
        <textarea data-annotation-field="dev" data-annotation-size="large" rows="12">${escapeHTML(annotation.dev.join("\n"))}</textarea>
      </label>
      <label class="annotation-edit-field">
        <span>业务规则（每行一条）</span>
        <textarea data-annotation-field="business" data-annotation-size="large" rows="12">${escapeHTML(annotation.business.join("\n"))}</textarea>
      </label>
      <label class="annotation-edit-field">
        <span>本次修改说明</span>
        <textarea data-annotation-field="changeNote" data-annotation-size="large" rows="12" placeholder="写清楚本次为什么改、改了什么。保存后会自动生成一条带时间的修改记录。"></textarea>
      </label>
      <p class="annotation-edit-tip">保存会先形成本地草稿，并按当前时间新增一条修改记录；点击“保存 JSON”后选择并覆盖项目里的 annotations.json，再提交到 GitHub，其他人就能看到同一份批注和时间线。</p>
    </form>
  `;
}

function saveCurrentAnnotation(panel) {
  const readField = (field) => panel.querySelector(`[data-annotation-field="${field}"]`)?.value.trim() || "";
  const previous = getCurrentAnnotation();
  const next = {
    title: readField("title") || routes[state.route]?.label || "页面批注",
    overview: readField("overview"),
    dev: splitAnnotationLines(readField("dev")),
    business: splitAnnotationLines(readField("business")),
    iteration: previous.iteration || [],
  };
  const changeNote = readField("changeNote");
  appendAnnotationChangeLog(state.route, previous, next, changeNote);
  pageAnnotations[state.route] = next;
  const drafts = readAnnotationDrafts();
  drafts.pageAnnotations[state.route] = next;
  drafts.annotationChangeLogs = annotationChangeLogs;
  localStorage.setItem(ANNOTATION_STORAGE_KEY, JSON.stringify(drafts));
  state.annotationEditing = false;
  state.annotationTab = "iteration";
  renderAnnotationPanel();
  toast("批注已保存为本地草稿，可保存 JSON");
}

function annotationTimeline(annotation) {
  const logs = getCurrentAnnotationLogs();
  const legacyItems = annotation.iteration || [];
  return `
    <section class="annotation-section">
      <h3>本页修改时间线</h3>
      ${logs.length ? `
        <div class="timeline">
          ${logs.map((item) => annotationChangeLogItem(item)).join("")}
        </div>
      ` : `
        <div class="empty-block">暂无带时间的修改记录。下一次保存批注后，这里会自动生成一条记录。</div>
      `}
    </section>
    ${legacyItems.length ? `
      <section class="annotation-section">
        <h3>历史迭代说明</h3>
        <ul>${legacyItems.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
      </section>
    ` : ""}
    <section class="annotation-section">
      <h3>项目迭代记录</h3>
      <div class="timeline">
        ${iterationHistory.map((item) => `
          <article class="timeline-item">
            <strong>${escapeHTML(item.version)} ${escapeHTML(item.title)}</strong>
            <span>${escapeHTML(item.date)}</span>
            <ul>${item.changes.map((change) => `<li>${escapeHTML(change)}</li>`).join("")}</ul>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function annotationChangeLogItem(item) {
  const fields = (item.fields || []).map((field) => annotationFieldLabels[field] || field);
  const changes = Array.isArray(item.changes) ? item.changes : [];
  const note = item.note || "更新页面批注";
  return `
    <article class="timeline-item annotation-change-item">
      <strong>${escapeHTML(formatAnnotationTime(item.time))} ${escapeHTML(item.author || "管理员")}</strong>
      <span>${escapeHTML(item.pageTitle || routes[item.pageKey]?.label || "页面批注")}</span>
      <div class="annotation-change-fields">
        ${fields.map((field) => `<em>${escapeHTML(field)}</em>`).join("")}
      </div>
      <p>${escapeHTML(note.length > 72 ? `${note.slice(0, 72)}...` : note)}</p>
      <div class="annotation-change-foot">
        <span>修改了 ${changes.length || fields.length || 1} 项内容</span>
        <button class="text-btn" data-annotation-log="${escapeAttribute(item.id)}">查看详情</button>
      </div>
    </article>
  `;
}

function appendAnnotationChangeLog(pageKey, previous, next, changeNote) {
  const changes = getAnnotationChanges(previous, next);
  const fields = changes.map((change) => change.field);
  if (changeNote && !fields.includes("iterationNote")) fields.push("iterationNote");
  if (!fields.length) return;
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    pageKey,
    pageTitle: next.title,
    time: new Date().toISOString(),
    author: "管理员",
    fields,
    note: changeNote || "更新页面批注",
    changes,
  };
  annotationChangeLogs[pageKey] = [record, ...(annotationChangeLogs[pageKey] || [])];
}

function getAnnotationChanges(previous, next) {
  return ["title", "overview", "dev", "business"]
    .filter((field) => JSON.stringify(previous[field] || "") !== JSON.stringify(next[field] || ""))
    .map((field) => ({
      field,
      label: annotationFieldLabels[field],
      before: normalizeAnnotationValue(previous[field]),
      after: normalizeAnnotationValue(next[field]),
      beforeSummary: summarizeAnnotationValue(previous[field]),
      afterSummary: summarizeAnnotationValue(next[field]),
    }));
}

function summarizeAnnotationValue(value) {
  const text = normalizeAnnotationValue(value);
  return text.length > 80 ? `${text.slice(0, 80)}...` : text || "已清空";
}

function normalizeAnnotationValue(value) {
  if (Array.isArray(value)) return value.join("\n");
  return String(value || "");
}

function getCurrentAnnotationLogs() {
  return [...(annotationChangeLogs[state.route] || [])].sort((a, b) => new Date(b.time) - new Date(a.time));
}

function formatAnnotationTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "未记录时间";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function openAnnotationChangeDetail(id) {
  const item = Object.values(annotationChangeLogs).flat().find((log) => log.id === id);
  if (!item) {
    toast("未找到修改记录");
    return;
  }
  openModal("批注修改详情", annotationChangeDetailModal(item), { hideSave: true, wide: true });
}

function annotationChangeDetailModal(item) {
  const fields = (item.fields || []).map((field) => annotationFieldLabels[field] || field);
  const changes = Array.isArray(item.changes) ? item.changes : [];
  return `
    <div class="annotation-detail-meta">
      <span><b>修改时间</b>${escapeHTML(formatAnnotationTime(item.time))}</span>
      <span><b>修改人</b>${escapeHTML(item.author || "管理员")}</span>
      <span><b>页面</b>${escapeHTML(item.pageTitle || routes[item.pageKey]?.label || "页面批注")}</span>
    </div>
    <section class="annotation-detail-section">
      <h3>本次修改说明</h3>
      <p>${escapeHTML(item.note || "更新页面批注")}</p>
      <div class="annotation-change-fields">
        ${fields.map((field) => `<em>${escapeHTML(field)}</em>`).join("")}
      </div>
    </section>
    <section class="annotation-detail-section">
      <h3>字段前后对比</h3>
      ${changes.length ? changes.map((change) => annotationDiffBlock(change)).join("") : `<div class="empty-block">本条记录没有字段前后对比，可能来自旧版本批注记录。</div>`}
    </section>
  `;
}

function annotationDiffBlock(change) {
  return `
    <article class="annotation-diff-block">
      <h4>${escapeHTML(change.label || annotationFieldLabels[change.field] || change.field)}</h4>
      <div class="annotation-diff-grid">
        <div>
          <strong>修改前</strong>
          <pre>${escapeHTML(change.before ?? "旧记录未保存修改前内容")}</pre>
        </div>
        <div>
          <strong>修改后</strong>
          <pre>${escapeHTML(change.after ?? change.afterSummary ?? "旧记录未保存修改后内容")}</pre>
        </div>
      </div>
    </article>
  `;
}

async function loadAnnotationsFromFile() {
  try {
    const response = await fetch(ANNOTATION_FILE, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    hydrateAnnotationData(data);
  } catch {
    // 直接用 file:// 打开时，浏览器可能禁止读取旁边的 JSON 文件；此时使用内置批注和本地草稿兜底。
  }
  applyAnnotationOverrides();
}

function hydrateAnnotationData(data) {
  if (Array.isArray(data?.iterationHistory)) iterationHistory = data.iterationHistory;
  if (data?.annotationChangeLogs && typeof data.annotationChangeLogs === "object") {
    annotationChangeLogs = data.annotationChangeLogs;
  }
  if (data?.pageAnnotations && typeof data.pageAnnotations === "object") {
    pageAnnotations = {
      ...pageAnnotations,
      ...data.pageAnnotations,
    };
  }
}

function buildAnnotationsFileData() {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    iterationHistory,
    annotationChangeLogs,
    pageAnnotations,
  };
}

async function saveAnnotationsFile() {
  const data = buildAnnotationsFileData();
  const content = `${JSON.stringify(data, null, 2)}\n`;
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: ANNOTATION_FILE,
        types: [{ description: "JSON 文件", accept: { "application/json": [".json"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      toast("annotations.json 已保存");
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  downloadAnnotationsFile(content);
}

function downloadAnnotationsFile(content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = ANNOTATION_FILE;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("已生成 annotations.json");
}

function splitAnnotationLines(value) {
  return value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
}

function applyAnnotationOverrides() {
  const drafts = readAnnotationDrafts();
  Object.keys(drafts.pageAnnotations).forEach((key) => {
    if (!pageAnnotations[key]) return;
    pageAnnotations[key] = {
      ...pageAnnotations[key],
      ...drafts.pageAnnotations[key],
    };
  });
  annotationChangeLogs = {
    ...annotationChangeLogs,
    ...drafts.annotationChangeLogs,
  };
}

function readAnnotationDrafts() {
  try {
    const data = JSON.parse(localStorage.getItem(ANNOTATION_STORAGE_KEY) || "{}");
    if (data.pageAnnotations || data.annotationChangeLogs) {
      return {
        pageAnnotations: data.pageAnnotations || {},
        annotationChangeLogs: data.annotationChangeLogs || {},
      };
    }
    return {
      pageAnnotations: data,
      annotationChangeLogs: {},
    };
  } catch {
    return {
      pageAnnotations: {},
      annotationChangeLogs: {},
    };
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}

function homePage() {
  return `
    <div class="page">
      <section class="banner">
        <h1>晚上好，演示租户</h1>
        <p>2026年07月01日 星期三。首页聚合双 Agent、全局看板与租户公共设置，提示词和 AI 记忆在各 Agent 内独立维护。</p>
      </section>

      <div class="section-title"><h2>业务入口</h2></div>
      <div class="grid two">
        <button class="agent-card" data-route="sales-entry">
          <span class="agent-head">
            <span class="app-icon sales-grad">销</span>
            <span>
              <h3>销售订单录入</h3>
              <p>销售 Agent 独立处理客户订单、审核、客户与销售群聊。</p>
            </span>
          </span>
          <span class="agent-menus">
            <span class="pill blue">订单录入</span><span class="pill blue">订单审核</span><span class="pill">客户管理</span><span class="pill">客户分组</span><span class="pill">群聊管理</span><span class="pill">提示词</span><span class="pill">AI 记忆</span>
          </span>
        </button>
        <button class="agent-card" data-route="purchase-entry">
          <span class="agent-head">
            <span class="app-icon purchase-grad">采</span>
            <span>
              <h3>采购入库单录入</h3>
              <p>采购 Agent 独立处理供应商入库、审核、供应商与采购群聊。</p>
            </span>
          </span>
          <span class="agent-menus">
            <span class="pill green">入库录入</span><span class="pill green">入库审核</span><span class="pill">供应商管理</span><span class="pill">供应商分组</span><span class="pill">群聊管理</span><span class="pill">提示词</span><span class="pill">AI 记忆</span>
          </span>
        </button>
      </div>

      <div class="section-title"><h2>全局数据看板</h2><button class="text-btn" data-route="sales-review">查看待处理</button></div>
      <div class="grid dashboard">
        <section class="card">
          <div class="card-header">
            <h3>今日任务</h3>
            <span class="pill gold">销售 + 采购汇总</span>
          </div>
          <div class="metric-row">
            <button class="metric clickable" data-route="sales-review"><span class="metric-value" style="color:var(--warning)">12</span><span class="metric-label">待处理</span></button>
            <div class="metric"><span class="metric-value" style="color:var(--success)">34</span><span class="metric-label">已完成</span></div>
            <button class="metric clickable" data-route="purchase-review"><span class="metric-value" style="color:var(--danger)">2</span><span class="metric-label">失败</span></button>
            <div class="metric"><span class="metric-value" style="color:var(--primary)">9</span><span class="metric-label">活跃群</span></div>
          </div>
        </section>
        <section class="card">
          <div class="card-header"><h3>录单额度</h3><span class="pill green">租户共享</span></div>
          <div class="quota-layout">
            <div class="ring"><div class="ring-inner">62%<span>已用</span></div></div>
            <div>
              <div class="quota-num">3,820</div>
              <div class="muted">剩余额度</div>
              <p><b>6,180</b> 已用 <span class="divider">|</span> <b>10,000</b> 总额</p>
            </div>
          </div>
        </section>
      </div>

      <section class="table-card">
        <div class="group-board-tabs">
          <button class="group-board-tab ${state.groupBoardFilter === "sales" ? "active" : ""}" data-group-board-filter="sales">销售订单</button>
          <button class="group-board-tab ${state.groupBoardFilter === "purchase" ? "active" : ""}" data-group-board-filter="purchase">采购入库单</button>
        </div>
        <div class="toolbar">
          <strong>群聊看板</strong>
          <span class="group-board-summary">
            <button class="group-board-all ${state.groupBoardFilter === "all" ? "active" : ""}" data-group-board-filter="all">全部</button>
            <span class="muted">销售、采购渠道汇总展示</span>
          </span>
        </div>
        <div class="table-scroll">
          ${groupBoardTable()}
        </div>
      </section>

      <div class="section-title"><h2>租户基础公共配置</h2></div>
      <div class="grid two">
        ${configCard("statistics", "统", "统计", "按操作员查看审核员、录单员绩效，支持日期筛选和导出演示。")}
        ${configCard("decision-screen", "屏", "决策大屏", "从额度、订单、异常、效能多视角查看 AI 录单业务表现。")}
        ${configCard("settings", "设", "租户设置", "公共参数、租户同步规则、角色身份、成员权限与额度阈值配置。")}
      </div>
    </div>
  `;
}

function configCard(route, icon, title, desc) {
  return `
    <button class="agent-card" data-route="${route}">
      <span class="agent-head"><span class="app-icon config-grad">${icon}</span><span><h3>${title}</h3><p>${desc}</p></span></span>
      <span class="agent-menus"><span class="pill blue">租户级配置</span><span class="pill">全局生效</span></span>
    </button>
  `;
}

function statisticsPage() {
  const rows = [
    { name: "张三", role: "审核员", customers: 1, orders: 2, goods: 8, rate: "100%", stay: "141 秒" },
    { name: "系统管理员", role: "审核员", customers: 2, orders: 2, goods: 2, rate: "100%", stay: "92 秒" },
    { name: "李娜", role: "录单员", customers: 4, orders: 7, goods: 26, rate: "98%", stay: "78 秒" },
    { name: "赵倩", role: "录单员", customers: 3, orders: 5, goods: 18, rate: "96%", stay: "113 秒" },
  ];
  return `
    <div class="page wide-page ops-page">
      <section class="ops-panel">
        <div class="tabs ops-tabs">
          <button class="subtab active">审核员绩效</button>
          <button class="subtab">录单员绩效</button>
          <button class="subtab">操作员汇总</button>
        </div>
      </section>

      <section class="ops-panel">
        <div class="ops-filter-bar">
          <strong>操作员绩效</strong>
          <div class="segmented">
            <button class="active">今日</button><button>昨日</button><button>本周</button><button>本月</button><button>上月</button>
          </div>
          <label class="date-range"><input placeholder="开始日期"><span>→</span><input placeholder="结束日期"></label>
          <button class="btn export-btn" data-toast="已导出操作员绩效 Excel">导出 Excel</button>
        </div>
        <div class="table-scroll">
          <table class="ops-table">
            <thead><tr><th>#</th><th>操作员</th><th>角色</th><th class="right">下单客户数</th><th class="right active-sort">提交订单数</th><th class="right">下单商品数</th><th class="right">识别率</th><th class="right">平均停留</th></tr></thead>
            <tbody>${rows.map((row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${row.name}</strong></td>
                <td><span class="tag blue">${row.role}</span></td>
                <td class="right">${row.customers}</td>
                <td class="right">${row.orders}</td>
                <td class="right">${row.goods}</td>
                <td class="right"><span class="tag green">${row.rate}</span></td>
                <td class="right">${row.stay}</td>
              </tr>
            `).join("")}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function decisionScreenPage() {
  const modalityRows = [
    { title: "纯文本下单", orders: 4, manual: 0, rate: "100%" },
    { title: "图片下单", orders: 1, manual: 0, rate: "100%" },
    { title: "文件下单", orders: 0, manual: 0, rate: "-" },
    { title: "其他类型", orders: 0, manual: 0, rate: "-" },
  ];
  const errorRows = [
    ["d6ef90f3...", "text", "观麦大学", 1, 1, "0 / 1"],
    ["d456761e...", "text", "观麦大学", 2, 2, "0 / 2"],
    ["0476729a...", "image", "张三小学第二食堂", 3, 3, "0 / 3"],
  ];
  return `
    <div class="page wide-page decision-page">
      <div class="decision-head">
        <div>
          <h2>${iconSvg.dashboard} 经营决策大屏</h2>
          <p>从单维看明细到看诊断与管资产，一屏总览 AI 商业价值</p>
        </div>
        <div class="decision-range"><span>时间范围</span><button class="active">今日实时</button><button>昨日</button><button>近 7 天</button><button>近 30 天</button><button>自定义</button></div>
      </div>

      ${decisionSectionTitle("01", "核心指标概览", "资产、经营与降本视角")}
      <section class="decision-card">
        <h3>AI 额度资产与消耗</h3>
        <div class="decision-kpi-grid">
          ${decisionKpi("剩余可用条数", "99,330", "额度充足", "blue")}
          ${decisionKpi("累计充值总额度", "101,170", "历史累计", "")}
          ${decisionKpi("今日提交总条数", "8", "0:00 起统计", "")}
          ${decisionKpi("今日已消耗条数", "8", "成功扣费", "red")}
        </div>
      </section>
      <div class="decision-mini-grid">
        ${decisionMiniCard("累计节省工时", "0.0 人/日", "全职接单员", "green")}
        ${decisionMiniCard("商品识别率", "100.0 %", "商品识别率", "blue")}
        ${decisionMiniCard("活跃群占比", "1 / 4", "下单群 / 绑定群", "")}
        ${decisionMiniCard("订单提交数", "5 / 8", "提交 / 生成", "")}
        ${decisionMiniCard("新增记忆数", "0", "纠错 + 习惯", "blue")}
      </div>

      ${decisionSectionTitle("02", "多模态分析与趋势", "算法表现视角")}
      <section class="decision-card">
        <h3>多模态下单类型分析</h3>
        <div class="modality-grid">
          ${modalityRows.map((row) => `
            <article class="modality-card">
              <h4>${row.title}</h4>
              <div><span>接收订单</span><b>${row.orders}</b></div>
              <div><span>人工干预</span><b class="danger-text">${row.manual}</b></div>
              <div><span>准确率</span><b class="${row.rate === "100%" ? "primary-text" : "muted"}">${row.rate}</b></div>
            </article>
          `).join("")}
        </div>
        <div class="blank-chart">单日数据不展示趋势图</div>
      </section>

      ${decisionSectionTitle("03", "异常诊断", "业务排雷视角")}
      <div class="grid two">
        <section class="decision-card"><h3>商品 SKU 纠错榜 Top 5</h3><div class="empty-block">暂无数据</div></section>
        <section class="decision-card">
          <h3>错误订单 Top 5</h3>
          <table><thead><tr><th>订单编码</th><th>下单类型</th><th>门店</th><th class="right">总条目</th><th class="right">正确数</th><th class="right">人工修改/总提交</th></tr></thead>
          <tbody>${errorRows.map((row) => `<tr><td><code>${row[0]}</code></td><td><span class="tag blue">${row[1]}</span></td><td>${row[2]}</td><td class="right">${row[3]}</td><td class="right">${row[4]}</td><td class="right"><span class="danger-text">${row[5]}</span></td></tr>`).join("")}</tbody></table>
        </section>
      </div>

      ${decisionSectionTitle("04", "操作员效能", "内部管理视角")}
      <section class="decision-card">
        <h3>操作员效能统计 <span class="muted">标红行：单次停留 &lt; 1 秒，疑似首审</span></h3>
        <table><thead><tr><th>接单员</th><th class="right">审核订单</th><th class="right">提交订单</th><th class="right">负责群数</th><th class="right">人工纠错</th><th class="right">识别率</th><th class="right">平均停留</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td><strong>系统管理员</strong></td><td class="right">1</td><td class="right">1</td><td class="right">0</td><td class="right">0</td><td class="right"><span class="primary-text">100%</span></td><td class="right">141 秒</td><td><span class="tag green">正常</span></td></tr>
          <tr><td><strong>0623</strong></td><td class="right">4</td><td class="right">4</td><td class="right">16</td><td class="right">0</td><td class="right"><span class="primary-text">100%</span></td><td class="right">770 秒</td><td><span class="tag green">正常</span></td></tr>
        </tbody></table>
      </section>
      <p class="decision-foot">AI 智能订单助手 · 经营决策大屏 V1.0</p>
    </div>
  `;
}

function decisionSectionTitle(index, title, desc) {
  return `<div class="decision-section-title"><span>${index}</span><h3>${title}</h3><em>${desc}</em></div>`;
}

function decisionKpi(label, value, desc, tone) {
  return `<div class="decision-kpi"><span>${label}</span><strong class="${tone ? `${tone}-text` : ""}">${value}</strong><small>${desc}</small></div>`;
}

function decisionMiniCard(label, value, desc, tone) {
  return `<article class="decision-mini-card"><span>${label}</span><strong class="${tone ? `${tone}-text` : ""}">${value}</strong><small>${desc}</small></article>`;
}

function getGroupDomain(group) {
  return group.purchaseBound === "-" ? "sales" : "purchase";
}

function groupBoardTable() {
  const rows = state.groupBoardFilter === "all"
    ? groups
    : groups.filter((group) => getGroupDomain(group) === state.groupBoardFilter);

  return `
    <table>
      <thead><tr><th>群聊名称</th><th class="right">待处理</th><th class="right">已完成</th><th>机器人</th></tr></thead>
      <tbody>
        ${rows.map((g) => `<tr><td><strong>${g.name}</strong></td><td class="right"><span class="tag gold">${g.pending}</span></td><td class="right">${12 - g.pending}</td><td>${g.bot}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
}

function entryPage(type) {
  const isSales = type === "sales";
  const mode = isSales ? state.chatMode : state.purchaseChatMode;
  const title = isSales ? "销售订单录入" : "采购入库单录入";
  const workspaceTitle = isSales ? "AI 录单" : "AI 入库";
  const firstTabLabel = isSales ? "客户" : "供应链";
  const firstMode = isSales ? "customer" : "supplier";
  const searchPlaceholder = mode === "group"
    ? "搜索群聊名称、ID..."
    : isSales
      ? "搜索客户名称、ID..."
      : "搜索供应链名称、ID...";
  const emptyTitle = isSales ? "让录单 更简单" : "让入库 更简单";
  const emptyDesc = isSales
    ? "选择客户，发送文字 / 图片 / Excel / PDF"
    : "选择供应链，发送文字 / 图片 / Excel / PDF";
  const emptySub = isSales ? "AI 自动识别商品信息并生成订单" : "AI 自动识别商品信息并生成入库单";
  const inputPlaceholder = mode === "group"
    ? "请先在左侧选择群聊..."
    : isSales
      ? "请先在左侧选择客户或群聊..."
      : "请先在左侧选择供应链或群聊...";
  return `
    <div class="entry-workspace">
      <aside class="entry-list-panel">
        <div class="entry-list-head">
          <div>
            <strong>${workspaceTitle}</strong>
            <span>AI</span>
          </div>
          <button class="entry-collapse" title="收起">≡</button>
        </div>
        <div class="entry-tabs" data-segment-root="${type}">
          <button class="${mode === firstMode ? "active" : ""}" data-mode="${firstMode}">${firstTabLabel}</button>
          <button class="${mode === "group" ? "active" : ""}" data-mode="group">群聊</button>
        </div>
        <label class="entry-search">
          <span>${iconSvg.prompt}</span>
          <input placeholder="${searchPlaceholder}">
        </label>
        <div class="entry-list">
          ${entryListItems(type, mode)}
        </div>
      </aside>

      <section class="entry-canvas">
        <div class="entry-center">
          <div class="entry-ai-icon">${iconSvg.purchase}</div>
          <h2>${emptyTitle}</h2>
          <p>${emptyDesc}</p>
          <p>${emptySub}</p>
        </div>
        <div class="entry-composer">
          <textarea id="${type}Input" placeholder="${inputPlaceholder}"></textarea>
          <div class="entry-composer-actions">
            <button class="entry-upload" title="上传图片、Excel、PDF">${iconSvg.config}</button>
            <button class="entry-send" data-send="${type}">发送</button>
          </div>
        </div>
        <div class="entry-composer-hint">支持拖拽、粘贴或上传图片、Excel、PDF文件</div>
      </section>
    </div>
  `;
}

function entryListItems(type, mode) {
  if (mode === "group") {
    return groups.map((item) => `
      <button class="entry-list-item" data-toast="已选择群聊：${item.name}">
        <strong>${item.name}</strong>
        <span>${item.purchaseBound === "-" ? item.salesBound : item.purchaseBound}</span>
      </button>
    `).join("");
  }

  const rows = type === "sales" ? customers : suppliers;
  return rows.map((item) => `
    <button class="entry-list-item" data-toast="已选择：${item.name}">
      <strong>${item.name}</strong>
      <span>${item.id}</span>
    </button>
  `).join("");
}

function taskMiniTable(tasks) {
  return `
    <table>
      <thead><tr><th>状态</th><th>创建时间</th><th>原始内容</th><th>操作</th></tr></thead>
      <tbody>
        ${tasks.slice(0, 4).map((task, i) => `
          <tr>
            <td>${statusTag(task.status)}</td>
            <td>07-01 ${String(9 + i).padStart(2, "0")}:18:32</td>
            <td>${task.raw}</td>
            <td><button class="text-btn" data-detail="${task.id}">查看</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function reviewPage(type) {
  const isSales = type === "sales";
  const title = isSales ? "销售订单审核" : "采购入库单审核";
  const tasks = filterTasks(isSales ? salesTasks : purchaseTasks, isSales ? state.filters.salesStatus : state.filters.purchaseStatus);
  return `
    <div class="page wide-page">
      <div class="page-title">
        <h2>${title}</h2>
        <div>
          <button class="btn" data-toast="已进入合单选择模式">合单</button>
          <button class="btn" data-toast="列表已刷新">刷新</button>
        </div>
      </div>
      <div class="alert">当前有 ${tasks.filter((task) => task.status === "失败").length} 个识别失败的单据待人工处理。</div>
      <section class="filters">
        <label class="field compact"><span>状态</span><select data-status-filter="${type}">
          ${["all", "待处理", "已完成", "失败", "合单"].map((status) => `<option value="${status}" ${getStatus(type) === status ? "selected" : ""}>${status === "all" ? "全部状态" : status}</option>`).join("")}
        </select></label>
        <label class="field compact"><span>下单日期</span><input value="2026-07-01"></label>
        <label class="field compact"><span>${isSales ? "门店" : "仓库"}</span><select><option>全部</option><option>${tasks[0]?.store || "中心仓"}</option></select></label>
        <label class="field compact"><span>审核员</span><select><option>全部</option><option>李娜</option><option>赵倩</option></select></label>
        <button class="btn" data-reset-filter="${type}">重置</button>
      </section>
      <section class="table-card">
        <div class="tabs">
          <button class="subtab ${state.reviewTab === "list" ? "active" : ""}" data-review-tab="list">任务列表</button>
          <button class="subtab ${state.reviewTab === "groups" ? "active" : ""}" data-review-tab="groups">群聊视图</button>
        </div>
        <div style="margin-top:12px" class="table-scroll">
          ${state.reviewTab === "groups" ? groupBoardTable() : reviewTable(tasks, type)}
        </div>
      </section>
    </div>
  `;
}

function getStatus(type) {
  return type === "sales" ? state.filters.salesStatus : state.filters.purchaseStatus;
}

function filterTasks(tasks, status) {
  if (!status || status === "all") return tasks;
  return tasks.filter((task) => task.status === status);
}

function reviewTable(tasks, type = "sales") {
  if (type === "purchase") return purchaseReviewTable(tasks);
  return `
    <table>
      <thead><tr><th>状态</th><th>时间</th><th>接单群</th><th>门店/仓库</th><th>原文</th><th class="right">识别商品数</th><th>系统单号</th><th>审核员</th><th>操作</th></tr></thead>
      <tbody>
        ${tasks.map((task, i) => `
          <tr>
            <td>${statusTag(task.status)}</td>
            <td>07-01 ${String(8 + i).padStart(2, "0")}:32:18</td>
            <td>${task.group}</td>
            <td>${task.store}</td>
            <td>${task.raw}</td>
            <td class="right">${task.items || "-"}</td>
            <td>${task.order}</td>
            <td>${task.auditor}</td>
            <td><button class="text-btn" data-detail="${task.id}">查看</button><button class="text-btn muted" data-toast="演示环境未实际删除">删除</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function purchaseReviewTable(tasks) {
  return `
    <table>
      <thead><tr><th>状态</th><th>时间</th><th>供应商</th><th>群聊</th><th>原文</th><th class="right">识别商品数</th><th>单据编号</th><th>入库员</th><th>操作</th></tr></thead>
      <tbody>
        ${tasks.map((task, i) => `
          <tr>
            <td>${statusTag(task.status)}</td>
            <td>07-01 ${String(8 + i).padStart(2, "0")}:32:18</td>
            <td>${task.supplier}</td>
            <td>${task.group}</td>
            <td>${task.raw}</td>
            <td class="right">${task.items || "-"}</td>
            <td>${task.id}</td>
            <td>${task.auditor}</td>
            <td><button class="text-btn" data-detail="${task.id}">查看</button><button class="text-btn muted" data-toast="演示环境未实际删除">删除</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function statusTag(status) {
  const color = status === "待处理" ? "gold" : status === "已完成" ? "green" : status === "失败" ? "red" : "blue";
  return `<span class="tag ${color}">${status}</span>`;
}

const purchaseDetailItems = [
  { raw: "鲈鱼 80 条", name: "鲜活鲈鱼", category: "水产海鲜", qtyBase: "80 条", priceBase: "18.50 / 条", diff: "0.00", amount: "1480.00", amountNoTax: "1357.80", relatedOrder: "PO-20260701-201" },
  { raw: "基围虾 120 斤", name: "基围虾", category: "水产海鲜", qtyBase: "120 斤", priceBase: "39.00 / 斤", diff: "0.00", amount: "4680.00", amountNoTax: "4293.58", relatedOrder: "PO-20260701-201" },
  { raw: "云南生菜 400 斤", name: "云南生菜", category: "蔬菜", qtyBase: "400 斤", priceBase: "3.20 / 斤", diff: "12.00", amount: "1280.00", amountNoTax: "1174.31", relatedOrder: "PO-20260701-217" },
  { raw: "油麦菜 260 斤", name: "油麦菜", category: "蔬菜", qtyBase: "260 斤", priceBase: "3.80 / 斤", diff: "0.00", amount: "988.00", amountNoTax: "906.42", relatedOrder: "PO-20260701-217" },
  { raw: "鸡腿 30 件", name: "冻鸡腿", category: "肉禽冻品", qtyBase: "300 kg", priceBase: "12.60 / kg", diff: "-18.00", amount: "3780.00", amountNoTax: "3467.89", relatedOrder: "PO-20260701-233" },
  { raw: "猪五花 18 件", name: "猪五花", category: "肉禽冻品", qtyBase: "180 kg", priceBase: "23.80 / kg", diff: "0.00", amount: "4284.00", amountNoTax: "3930.28", relatedOrder: "PO-20260701-233" },
];

const systemPurchaseOrders = [
  { id: "PO-20260701-201", supplier: "海盛水产", warehouse: "中心仓", arrival: "2026-07-01 20:00", status: "待入库", items: 2, ordered: "220 件/斤", received: "20 条", available: "80 条、100 斤", matched: true },
  { id: "PO-20260701-217", supplier: "春田蔬菜基地", warehouse: "中心仓", arrival: "2026-07-01 20:00", status: "部分入库", items: 2, ordered: "620 斤", received: "60 斤", available: "400 斤、220 斤", matched: true },
  { id: "PO-20260701-233", supplier: "岭南肉禽", warehouse: "冷链仓", arrival: "2026-07-01 21:30", status: "待确认", items: 2, ordered: "480 kg", received: "0 kg", available: "300 kg、180 kg", matched: false },
];

const purchaseOrderMatchRows = [
  { raw: "鲈鱼 80 条", aiName: "鲜活鲈鱼", orderName: "鲜活鲈鱼", orderId: "PO-20260701-201", aiQty: "80 条", orderQty: "100 条", received: "20 条", available: "80 条", diff: "一致", suggestion: "可按 AI 数量入库", status: "匹配成功" },
  { raw: "基围虾 120 斤", aiName: "基围虾", orderName: "基围虾", orderId: "PO-20260701-201", aiQty: "120 斤", orderQty: "100 斤", received: "0 斤", available: "100 斤", diff: "超出 20 斤", suggestion: "按 100 斤入库，超出部分转异常确认", status: "数量超出" },
  { raw: "云南生菜 400 斤", aiName: "云南生菜", orderName: "云南生菜", orderId: "PO-20260701-217", aiQty: "400 斤", orderQty: "400 斤", received: "0 斤", available: "400 斤", diff: "一致", suggestion: "可按 AI 数量入库", status: "匹配成功" },
  { raw: "油麦菜 260 斤", aiName: "油麦菜", orderName: "油麦菜", orderId: "PO-20260701-217", aiQty: "260 斤", orderQty: "280 斤", received: "60 斤", available: "220 斤", diff: "超出 40 斤", suggestion: "需入库员确认短缺或拆分入库", status: "需人工确认" },
  { raw: "鸡腿 30 件", aiName: "冻鸡腿", orderName: "冻鸡腿", orderId: "PO-20260701-233", aiQty: "300 kg", orderQty: "300 kg", received: "0 kg", available: "300 kg", diff: "单位已换算", suggestion: "确认 30 件=300 kg 后可入库", status: "单位换算" },
  { raw: "猪五花 18 件", aiName: "猪五花", orderName: "未匹配", orderId: "-", aiQty: "180 kg", orderQty: "-", received: "-", available: "-", diff: "采购单缺失", suggestion: "手动选择采购单或转新增采购异常", status: "采购单缺失" },
];

const purchaseMatchSummary = [
  { label: "匹配成功", value: 2, tone: "green" },
  { label: "数量超出", value: 2, tone: "gold" },
  { label: "单位换算", value: 1, tone: "blue" },
  { label: "采购单缺失", value: 1, tone: "red" },
];

function matchStatusClass(status) {
  if (status === "匹配成功") return "green";
  if (status === "采购单缺失") return "red";
  if (status === "数量超出" || status === "需人工确认") return "gold";
  return "blue";
}

function purchaseDetailPage() {
  const task = purchaseTasks.find((item) => item.id === state.activeDetailId) || purchaseTasks[0];
  return `
    <div class="purchase-detail-page">
      <aside class="detail-source">
        <div class="detail-tabs">
          <button class="active">基本信息</button>
          <button>群聊消息</button>
          <button>定位来源</button>
        </div>
        <div class="detail-source-section">
          <div class="detail-section-title"><span></span><strong>原始文件</strong><span></span></div>
          <div class="source-file">
            <span class="file-icon">${iconSvg.edit}</span>
            <strong>SUP_20260701_091832_PURCHASE.pdf</strong>
            <button class="text-btn" data-toast="演示文件无需下载">下载</button>
          </div>
        </div>
        <div class="detail-source-section">
          <div class="detail-section-title"><span></span><strong>原始消息</strong><span></span></div>
          <pre class="raw-message">--- 2026-07-01 / ${task.group} ---
${task.raw}
到货时间：今晚 20:00 前
入库仓库：${task.store}
          供应商：${task.supplier}

--- 采购入库补充说明 ---
需到仓复称，破损和缺货请在备注中标记。
价格按本周采购入库价执行，异常商品进入人工确认。</pre>
        </div>
      </aside>

      <main class="detail-main">
        <div class="detail-header">
          <div>
            <h2>采购入库单详情 <span class="tag gold">${task.status}</span><span class="tag blue">0/6 商品已入库</span></h2>
            <div class="detail-meta">
              <span>供应群聊：${task.group}</span>
              <span>入库员：${task.auditor}</span>
              <span>创建时间：2026-07-01 09:18:32</span>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn">自定义字段</button>
            <button class="btn">新建入库商品</button>
            <button class="btn danger">删除</button>
            <button class="btn">保存</button>
            <button class="btn primary" data-toast="采购入库单已全部确认入库">全部确认入库</button>
          </div>
        </div>

        <section class="purchase-group po-match-card">
          <div class="purchase-group-head">
            <div><strong>系统采购单据匹配</strong><span class="tag green">已匹配 2 张</span><span class="tag gold">1 张需确认</span></div>
            <div>
              <button class="btn" data-toast="已刷新系统采购单据">刷新系统单据</button>
              <button class="btn" data-toast="已根据供应商、到仓时间和商品重新匹配采购单">自动匹配</button>
              <button class="btn primary" data-toast="手动选择采购单为后续接口动作">手动选择采购单</button>
            </div>
          </div>
          <div class="po-match-intro">
            <div>
              <span class="muted">匹配依据</span>
              <strong>供应商、群聊归属、预计到仓时间、商品名称/别名、剩余可入库数量</strong>
            </div>
            <div>
              <span class="muted">入库校验结论</span>
              <strong>4 行可继续处理，2 行需要人工确认后才能全部入库</strong>
            </div>
          </div>
          <div class="po-order-grid">
            ${systemPurchaseOrders.map((order) => `
              <article class="po-order-card ${order.matched ? "is-matched" : "is-warning"}">
                <div class="po-order-top">
                  <strong>${order.id}</strong>
                  <span class="tag ${order.matched ? "green" : "gold"}">${order.status}</span>
                </div>
                <div class="po-order-meta">
                  <span>供应商：${order.supplier}</span>
                  <span>仓库：${order.warehouse}</span>
                  <span>预计到仓：${order.arrival}</span>
                  <span>商品数：${order.items}</span>
                  <span>已入库：${order.received}</span>
                  <span>可入库：${order.available}</span>
                </div>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="purchase-group reconcile-card">
          <div class="purchase-group-head">
            <div><strong>AI 入库明细与采购单对账</strong><span class="tag blue">实时校验</span></div>
            <div><button class="btn" data-toast="差异处理将在真实系统中写入审核记录">批量处理差异</button></div>
          </div>
          <div class="reconcile-summary">
            ${purchaseMatchSummary.map((item) => `
              <div class="reconcile-stat ${item.tone}">
                <strong>${item.value}</strong>
                <span>${item.label}</span>
              </div>
            `).join("")}
          </div>
          <div class="purchase-table-wrap reconcile-table-wrap">
            <table class="purchase-detail-table reconcile-table">
              <thead>
                <tr><th>送货单识别</th><th>AI 商品</th><th>系统采购商品</th><th>关联采购单</th><th>AI 数量</th><th>采购单数量</th><th>已入库</th><th>本次可入库</th><th>差异</th><th>处理建议</th><th>状态</th></tr>
              </thead>
              <tbody>
                ${purchaseOrderMatchRows.map((item) => `
                  <tr>
                    <td>${item.raw}</td>
                    <td>${item.aiName}</td>
                    <td>${item.orderName}</td>
                    <td>${item.orderId === "-" ? `<button class="text-btn" data-toast="请选择对应系统采购单">选择采购单</button>` : item.orderId}</td>
                    <td>${item.aiQty}</td>
                    <td>${item.orderQty}</td>
                    <td>${item.received}</td>
                    <td>${item.available}</td>
                    <td>${item.diff}</td>
                    <td>${item.suggestion}</td>
                    <td><span class="match-status ${matchStatusClass(item.status)}">${item.status}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>

        <section class="purchase-group">
          <div class="purchase-group-head">
            <div><strong>采购入库明细</strong><span class="tag blue">6 个商品</span></div>
            <div><button class="btn">更多</button></div>
          </div>
          <div class="purchase-form-row">
            <label>供应商 <select><option>海盛水产</option><option>春田蔬菜基地</option><option>岭南肉禽</option></select></label>
            <label>入库仓库 <select><option>${task.store}</option><option>一号冷库</option><option>二号冷库</option></select></label>
            <label>预计到仓 <input value="2026-07-01 20:00"></label>
            <span class="gm-tip">GM建议：20:00前到仓</span>
          </div>
          <div class="purchase-form-row">
            <label class="wide">入库备注 <input value="到仓复称，异常短缺请备注"></label>
          </div>
          <div class="purchase-table-wrap">
            <table class="purchase-detail-table">
              <thead>
                <tr><th>识别文本</th><th>商品名称</th><th>商品分类</th><th>入库数（基本单位）</th><th>入库单价（基本单位）</th><th>补差</th><th>入库金额</th><th>入库金额（不含税）</th><th>关联订单</th></tr>
              </thead>
              <tbody>
                ${purchaseDetailItems.map((item, index) => `
                  <tr>
                    <td>${item.raw}</td>
                    <td><input value="${item.name}"></td>
                    <td><input value="${item.category}"></td>
                    <td><input class="qty-input" value="${item.qtyBase}"></td>
                    <td>¥ <input class="price-input" value="${item.priceBase}"></td>
                    <td><input class="diff-input" value="${item.diff}"></td>
                    <td>¥${item.amount}</td>
                    <td>¥${item.amountNoTax}</td>
                    <td><input value="${item.relatedOrder}"></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          <button class="add-line" data-toast="已新增一行采购入库商品">+ 新增采购入库商品</button>
        </section>
      </main>
    </div>
  `;
}

function partyPage(type) {
  const isSales = type === "sales";
  const title = isSales ? "客户管理" : "供应商管理";
  const rows = isSales ? customers : suppliers;
  const filterKey = isSales ? "salesCustomer" : "purchaseSupplier";
  const keyword = state.filters[filterKey].trim();
  const visible = keyword ? rows.filter((row) => `${row.id}${row.name}${row.address || ""}${row.category || ""}`.includes(keyword)) : rows;
  return `
    <div class="page wide-page">
      <section class="filters">
        <label class="field"><span>${isSales ? "客户名称" : "供应商名称"}</span><input data-party-filter="${type}" value="${keyword}" placeholder="请输入名称、ID 或地址"></label>
        <label class="field compact"><span>绑定状态</span><select><option>全部</option><option>已绑定群</option><option>未绑定群</option></select></label>
        <div style="margin-left:auto"><button class="btn primary" data-party-query="${type}">查询</button><button class="btn" data-party-reset="${type}">重置</button></div>
      </section>
      <section class="table-card">
        <div class="toolbar">
          <strong>${title}</strong>
          <button class="btn" data-toast="${title}已刷新">刷新</button>
        </div>
        <div class="stat-strip">
          <span>总${isSales ? "客户" : "供应商"} <b>${rows.length}</b></span><span class="divider">|</span>
          <span>已绑群 <b>${rows.filter((row) => row.groups !== "未绑定").length}</b></span><span class="divider">|</span>
          <span>已同步 SKU <b>${rows.filter((row) => (row.sku || row.synced) > 0).length}</b></span>
        </div>
        <div class="table-scroll">${isSales ? customerTable(visible) : supplierTable(visible)}</div>
      </section>
    </div>
  `;
}

function customerTable(rows) {
  return `
    <table>
      <thead><tr><th>客户 ID</th><th>客户名称</th><th>地址</th><th>电话</th><th>群绑定</th><th class="right">已同步 SKU</th><th>备注优先级</th></tr></thead>
      <tbody>${rows.map((row) => `<tr><td><code>${row.id}</code></td><td><strong>${row.name}</strong></td><td>${row.address}</td><td>${row.phone}</td><td>${row.groups}</td><td class="right"><span class="tag green">${row.sku}</span></td><td>${row.priority}</td></tr>`).join("")}</tbody>
    </table>
  `;
}

function supplierTable(rows) {
  return `
    <table>
      <thead><tr><th>供应商 ID</th><th>供应商名称</th><th>品类</th><th>联系人</th><th>群绑定</th><th>默认仓库</th><th class="right">已同步 SKU</th></tr></thead>
      <tbody>${rows.map((row) => `<tr><td><code>${row.id}</code></td><td><strong>${row.name}</strong></td><td>${row.category}</td><td>${row.contact}</td><td>${row.groups}</td><td>${row.warehouse}</td><td class="right"><span class="tag green">${row.synced}</span></td></tr>`).join("")}</tbody>
    </table>
  `;
}

function partyGroupPage(type) {
  const isSales = type === "sales";
  const partyLabel = isSales ? "客户" : "供应商";
  const ownerLabel = isSales ? "审核员" : "入库员";
  const modalType = isSales ? "customer-group" : "supplier-group";
  const rows = isSales ? [
    { name: "王五的客群", owner: "王五", groups: 1, parties: 0, editable: false },
    { name: "李四负责客户", owner: "李四", groups: 0, parties: 0, editable: false },
    { name: "xky_test 客户组", owner: "xky_test", groups: 1, parties: 2, editable: true },
  ] : [
    { name: "海鲜供应组", owner: "赵倩", groups: 1, parties: 1, editable: true },
    { name: "蔬菜入库组", owner: "系统管理员", groups: 1, parties: 2, editable: true },
    { name: "冻品供应组", owner: "李娜", groups: 0, parties: 1, editable: false },
  ];
  return `
    <div class="page wide-page group-config-page">
      <section class="table-card group-config-card">
        <div class="toolbar">
          <div class="stat-chip">分组总数 <b>${rows.length}</b></div>
          <button class="btn primary" data-modal="${modalType}">新建分组</button>
        </div>
        <div class="table-scroll">
          <table class="group-config-table">
            <thead><tr><th>分组名称</th><th>${ownerLabel}</th><th class="right">群聊</th><th class="right">${partyLabel}</th><th>操作</th></tr></thead>
            <tbody>${rows.map((row) => `
              <tr>
                <td><strong>${row.name}</strong></td>
                <td><span class="tag purple">${row.owner}</span></td>
                <td class="right"><span class="count-badge blue">${row.groups}</span></td>
                <td class="right"><span class="count-badge green">${row.parties}</span></td>
                <td>${row.editable ? `<button class="text-btn" data-modal="${modalType}">编辑</button><button class="text-btn danger-text" data-toast="演示环境未实际删除">删除</button>` : `<button class="text-btn" data-toast="已打开分组详情">查看</button>`}</td>
              </tr>
            `).join("")}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function groupBindingModal(type) {
  const isSales = type === "customer-group";
  const partyLabel = isSales ? "客户" : "供应商";
  const ownerLabel = isSales ? "审核员" : "入库员";
  const partyRows = isSales ? customers : suppliers;
  const groupRows = groups.filter((group) => isSales ? group.purchaseBound === "-" : group.purchaseBound !== "-");
  return `
    <div class="group-modal-form">
      <label class="field"><span>${ownerLabel}</span><select><option>选择${ownerLabel}（操作员）</option><option>系统管理员</option><option>李娜</option><option>赵倩</option><option>xky_test</option></select></label>
      <label class="field"><span>分组名称</span><input placeholder="输入分组名称"></label>
      <div class="group-modal-grid">
        ${groupPickPanel("群聊", groupRows.map((item) => item.name), `搜索并添加群聊...`)}
        ${groupPickPanel(partyLabel, partyRows.map((item) => item.name), `搜索并添加${partyLabel}...`, isSales ? "不使用群聊录单的客户" : "不使用群聊入库的供应商")}
      </div>
    </div>
  `;
}

function groupPickPanel(title, rows, placeholder, desc = "") {
  return `
    <section class="group-pick-panel">
      <div class="group-pick-title"><strong>${title} (0)</strong>${desc ? `<span>${desc}</span>` : ""}</div>
      <div class="group-pick-list">
        ${rows.slice(0, 4).map((row) => `<label><input type="checkbox"> ${row}</label>`).join("")}
      </div>
      <label class="select-like"><input placeholder="${placeholder}"><span>⌄</span></label>
    </section>
  `;
}

function groupsPage(type) {
  const isSales = type === "sales";
  const rows = groups.filter((row) => isSales ? row.purchaseBound === "-" : row.purchaseBound !== "-");
  return `
    <div class="page wide-page">
      <section class="table-card">
        <div class="toolbar"><strong>${isSales ? "销售群聊管理" : "采购群聊管理"}</strong><button class="btn" data-toast="群聊数据已刷新">刷新</button></div>
        <div class="stat-strip">
          <span>总群聊 <b>${rows.length}</b></span><span class="divider">|</span>
          <span>${isSales ? "已绑客户" : "已绑供应商"} <b>${rows.length}</b></span><span class="divider">|</span>
          <span>已禁言 <b>${rows.filter((row) => row.bot === "禁言").length}</b></span>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>群聊名称</th><th class="right">成员数</th><th>${isSales ? "绑定客户" : "绑定供应商"}</th><th>审核员</th><th>机器人发言</th><th>下单时段</th><th>操作</th></tr></thead>
            <tbody>${rows.map((row) => `<tr><td><strong>${row.name}</strong></td><td class="right">${row.members}</td><td>${isSales ? row.salesBound : row.purchaseBound}</td><td>${row.reviewer}</td><td><span class="tag ${row.bot === "正常" ? "green" : ""}">${row.bot}</span></td><td>${row.time}</td><td><button class="text-btn" data-toast="已打开群聊详情抽屉">详情</button></td></tr>`).join("")}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function promptsPage(type) {
  const isSales = type === "sales";
  return `
    <div class="page wide-page">
      <section class="table-card">
        <div class="tabs">
          <button class="subtab ${state.promptTab === "customer" ? "active" : ""}" data-prompt-tab="customer">${isSales ? "客户提示词" : "供应商提示词"}</button>
          <button class="subtab ${state.promptTab === "system" ? "active" : ""}" data-prompt-tab="system">Agent 提示词</button>
        </div>
        ${state.promptTab === "customer" ? promptCustomerTab(type) : promptSystemTab(type)}
      </section>
    </div>
  `;
}

function promptCustomerTab(type) {
  const isSales = type === "sales";
  const partyLabel = isSales ? "客户" : "供应商";
  const defaultTarget = isSales ? "全部客户" : "全部供应商";
  const specialName = isSales ? "天河鲜食店特殊规则" : "海盛水产入库规则";
  const specialTarget = isSales ? "天河鲜食店" : "海盛水产";
  const preview = isSales ? "“大白”按大白菜识别，备注保留原文..." : "“今晚到”默认入中心仓，鱼类按条解析...";
  return `
    <div style="margin-top:16px">
      <div class="toolbar">
        <div class="stat-strip" style="margin:0"><span>总模板 <b>4</b></span></div>
        <div><label class="field compact"><input placeholder="搜索${partyLabel}名称或 ID"></label><button class="btn primary" data-modal="prompt">新建模板</button></div>
      </div>
      <div class="table-scroll" style="margin-top:12px">
        <table>
          <thead><tr><th>模板名称</th><th>类型</th><th>绑定${partyLabel}</th><th>状态</th><th>Prompt 预览</th><th>更新时间</th><th>操作</th></tr></thead>
          <tbody>
            <tr><td><strong>默认${isSales ? "订单" : "入库"}解析模板</strong></td><td><span class="tag blue">${isSales ? "订单解析" : "入库解析"}</span></td><td>${defaultTarget}</td><td><span class="tag green">启用</span></td><td>识别${partyLabel}消息中的商品、数量、单位、${isSales ? "配送日期" : "入库仓库"}...</td><td>2026-07-01 09:20</td><td><button class="text-btn" data-modal="prompt">编辑</button></td></tr>
            <tr><td><strong>${specialName}</strong></td><td><span class="tag blue">${isSales ? "订单解析" : "入库解析"}</span></td><td>${specialTarget}</td><td><span class="tag green">启用</span></td><td>${preview}</td><td>2026-06-28 18:10</td><td><button class="text-btn" data-modal="prompt">编辑</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function promptSystemTab(type) {
  const isSales = type === "sales";
  return `
    <div style="margin-top:16px">
      <p class="muted">${isSales ? "销售 Agent 提示词仅影响销售订单录入、审核与客户规则。" : "采购 Agent 提示词仅影响采购入库录入、审核与供应商规则。"}</p>
      <textarea style="min-height:320px;font-family:Consolas,monospace"># 商品别名
- 小番茄 / 圣女果 / 千禧果 → 圣女果
- 大白 → 大白菜

# ${isSales ? "销售订单规则" : "采购入库规则"}
- ${isSales ? "客户消息中的“明早送”默认解析为次日配送" : "供应商消息中的“件”优先按入库包装规格解析"}
- ${isSales ? "无法确认客户时进入人工审核，不自动创建新客户" : "未明确仓库时使用供应商默认仓库"}</textarea>
      <div style="text-align:right;margin-top:12px"><button class="btn">重置</button><button class="btn primary" data-toast="Agent 提示词已保存">保存</button></div>
    </div>
  `;
}

function memoryPage(type) {
  const isSales = type === "sales";
  const rows = isSales ? [
    ["修正记忆", "gold", "天河鲜食店", "小番茄", "圣女果", 23, "2026-07-01 10:12"],
    ["下单习惯", "blue", "江北食堂", "白菜一筐", "大白菜 30斤，备注按筐", 17, "2026-06-30 16:41"],
    ["群级记忆", "green", "华南餐饮订货群", "明早送", "默认配送日期为次日", 12, "2026-07-01 08:33"],
  ] : [
    ["修正记忆", "gold", "海盛水产", "基围虾 120 斤", "基围虾 120 斤，入中心仓", 19, "2026-07-01 09:42"],
    ["入库习惯", "blue", "春田蔬菜基地", "油麦菜 260", "油麦菜 260 斤，默认一号冷库", 14, "2026-06-30 16:18"],
    ["群级记忆", "green", "海鲜供应商对接群", "今晚到", "默认入库日期为当日", 9, "2026-07-01 08:33"],
  ];
  return `
    <div class="page wide-page">
      <section class="table-card">
        <div class="toolbar"><strong>${isSales ? "销售 Agent AI 记忆" : "采购 Agent AI 记忆"}</strong><button class="btn" data-toast="记忆列表已刷新">刷新</button></div>
        <div class="stat-strip"><span>修正记忆 <b>${isSales ? 78 : 50}</b></span><span class="divider">|</span><span>${isSales ? "下单习惯" : "入库习惯"} <b>${isSales ? 34 : 22}</b></span><span class="divider">|</span><span>群级记忆 <b>${isSales ? 11 : 7}</b></span></div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>记忆类型</th><th>业务对象</th><th>命中内容</th><th>修正为</th><th class="right">命中次数</th><th>最近更新</th><th>操作</th></tr></thead>
            <tbody>
              ${rows.map((row) => `<tr><td><span class="tag ${row[1]}">${row[0]}</span></td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td class="right">${row[5]}</td><td>${row[6]}</td><td><button class="text-btn" data-modal="memory">查看</button></td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function settingsPage() {
  const tab = state.settingsTab;
  return `
    <div class="page wide-page">
      <section class="table-card">
        <div class="tabs">
          <button class="subtab ${tab === "roles" ? "active" : ""}" data-settings-tab="roles">角色权限</button>
          <button class="subtab ${tab === "operators" ? "active" : ""}" data-settings-tab="operators">成员管理</button>
          <button class="subtab ${tab === "sync" ? "active" : ""}" data-settings-tab="sync">同步规则</button>
          <button class="subtab ${tab === "quota" ? "active" : ""}" data-settings-tab="quota">额度设置</button>
        </div>
        ${tab === "roles" ? roleSettings() : tab === "operators" ? operatorSettings() : tab === "sync" ? syncSettings() : quotaSettings()}
      </section>
    </div>
  `;
}

function roleSettings() {
  return `
    <div style="margin-top:16px" class="grid two">
      <div class="card"><h3>管理员</h3><p>可访问首页、销售 Agent、采购 Agent、租户公共设置，以及各 Agent 内部的提示词和记忆配置。</p><div class="agent-menus"><span class="pill blue">全功能访问</span><span class="pill">配置管理</span></div></div>
      <div class="card"><h3>普通成员</h3><p>拥有基础录单和审核操作权限。身份标签仅用于展示和业务分组，现阶段不做细粒度权限拦截。</p><div class="agent-menus"><span class="pill green">基础录单</span><span class="pill">身份标签</span></div></div>
    </div>
  `;
}

function operatorSettings() {
  return `
    <div style="margin-top:16px">
      <div class="toolbar"><div class="stat-strip" style="margin:0"><span>总成员 <b>6</b></span><span class="divider">|</span><span>已启用 <b>6</b></span></div><button class="btn primary" data-modal="operator">新增成员</button></div>
      <div class="table-scroll" style="margin-top:12px">
        <table><thead><tr><th>用户名</th><th>姓名</th><th>角色</th><th>身份标签</th><th>状态</th><th>操作</th></tr></thead><tbody>
          <tr><td>admin</td><td>王明</td><td><span class="tag blue">管理员</span></td><td>系统管理员</td><td><span class="tag green">启用</span></td><td><button class="text-btn">编辑</button></td></tr>
          <tr><td>lina</td><td>李娜</td><td><span class="tag">普通成员</span></td><td>录单员</td><td><span class="tag green">启用</span></td><td><button class="text-btn">编辑</button></td></tr>
          <tr><td>zhaoqian</td><td>赵倩</td><td><span class="tag">普通成员</span></td><td>仓管员</td><td><span class="tag green">启用</span></td><td><button class="text-btn">编辑</button></td></tr>
        </tbody></table>
      </div>
    </div>
  `;
}

function syncSettings() {
  return `
    <div style="margin-top:16px" class="grid two">
      <div class="card"><h3>业务数据同步</h3><p>客户、供应商、商品、报价单、入库规格使用同一租户配置池。</p><div class="agent-menus"><span class="pill green">已开启</span><span class="pill">每 30 分钟</span></div></div>
      <div class="card"><h3>渠道群聊同步</h3><p>企业微信、微信渠道群聊统一归集，业务绑定关系按销售/采购隔离。</p><div class="agent-menus"><span class="pill green">已开启</span><span class="pill">全渠道</span></div></div>
    </div>
  `;
}

function quotaSettings() {
  return `
    <div style="margin-top:16px" class="grid two">
      <div class="card"><h3>额度阈值</h3><p>租户剩余额度低于 20% 时提示管理员，低于 5% 时限制普通成员提交新识别任务。</p><div class="agent-menus"><span class="pill gold">预警 20%</span><span class="pill red">限制 5%</span></div></div>
      <div class="card"><h3>消耗记录</h3><p>销售与采购 Agent 共用消耗池，记录按业务域打标，账单归集在租户级。</p><div class="agent-menus"><span class="pill blue">共享额度</span><span class="pill">按业务打标</span></div></div>
    </div>
  `;
}

function wirePageInteractions() {
  bindRouteButtons(document.getElementById("content"));
  document.querySelectorAll("[data-toast]").forEach((el) => {
    el.onclick = () => toast(el.dataset.toast);
  });
  document.querySelectorAll("[data-detail]").forEach((el) => {
    el.onclick = () => {
      const id = el.dataset.detail;
      if (id?.startsWith("PI-")) {
        state.activeDetailId = id;
        routeTo("purchase-detail");
        return;
      }
      openModal("单据详情", detailModal(id));
    };
  });
  document.querySelectorAll("[data-send]").forEach((button) => {
    button.onclick = () => sendChat(button.dataset.send);
  });
  document.querySelectorAll("[data-segment-root]").forEach((root) => {
    root.querySelectorAll("[data-mode]").forEach((button) => {
      button.onclick = () => {
        if (root.dataset.segmentRoot === "sales") state.chatMode = button.dataset.mode;
        else state.purchaseChatMode = button.dataset.mode;
        renderContent();
      };
    });
  });
  document.querySelectorAll("[data-status-filter]").forEach((select) => {
    select.onchange = () => {
      if (select.dataset.statusFilter === "sales") state.filters.salesStatus = select.value;
      else state.filters.purchaseStatus = select.value;
      renderContent();
    };
  });
  document.querySelectorAll("[data-reset-filter]").forEach((button) => {
    button.onclick = () => {
      if (button.dataset.resetFilter === "sales") state.filters.salesStatus = "all";
      else state.filters.purchaseStatus = "all";
      renderContent();
    };
  });
  document.querySelectorAll("[data-party-query]").forEach((button) => {
    button.onclick = () => {
      const type = button.dataset.partyQuery;
      const input = document.querySelector(`[data-party-filter="${type}"]`);
      if (type === "sales") state.filters.salesCustomer = input.value;
      else state.filters.purchaseSupplier = input.value;
      renderContent();
    };
  });
  document.querySelectorAll("[data-party-reset]").forEach((button) => {
    button.onclick = () => {
      if (button.dataset.partyReset === "sales") state.filters.salesCustomer = "";
      else state.filters.purchaseSupplier = "";
      renderContent();
    };
  });
  document.querySelectorAll("[data-review-tab]").forEach((button) => {
    button.onclick = () => {
      state.reviewTab = button.dataset.reviewTab;
      renderContent();
    };
  });
  document.querySelectorAll("[data-group-board-filter]").forEach((button) => {
    button.onclick = () => {
      state.groupBoardFilter = button.dataset.groupBoardFilter;
      renderContent();
    };
  });
  document.querySelectorAll("[data-prompt-tab]").forEach((button) => {
    button.onclick = () => {
      state.promptTab = button.dataset.promptTab;
      renderContent();
    };
  });
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.onclick = () => {
      state.settingsTab = button.dataset.settingsTab;
      renderContent();
    };
  });
  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.onclick = () => {
      const type = button.dataset.modal;
      if (type === "customer-group" || type === "supplier-group") {
        openModal(type === "customer-group" ? "新建客户分组" : "新建供应商分组", groupBindingModal(type), { wide: true });
        return;
      }
      const title = type === "prompt" ? "编辑 Prompt 模板" : type === "operator" ? "新增成员" : "AI 记忆详情";
      openModal(title, type === "operator" ? operatorModal() : type === "prompt" ? promptModal() : memoryModal());
    };
  });
}

function sendChat(type) {
  const input = document.getElementById(`${type}Input`);
  const value = input.value.trim();
  if (!value) {
    toast("请输入录单内容");
    return;
  }
  chatMessages[type].push({ role: "user", text: value });
  chatMessages[type].push({ role: "assistant", text: type === "sales" ? "已解析消息并生成新的待审核销售订单。" : "已解析消息并生成新的待审核采购入库单。" });
  input.value = "";
  renderContent();
  toast("消息已发送，Agent 已生成待审核单据");
}

function detailModal(id) {
  return `
    <p><strong>单据编号：</strong>${id}</p>
    <p><strong>AI 解析流程：</strong>意图识别 → 上下文构建 → AI 解析订单 → 结果校验 → 执行下单</p>
    <div class="table-scroll">${reviewTable([...salesTasks, ...purchaseTasks].filter((task) => task.id === id))}</div>
  `;
}

function promptModal() {
  return `
    <label class="field" style="width:100%;margin-bottom:12px"><span>模板名称</span><input value="默认订单解析模板"></label>
    <textarea style="min-height:220px">请将聊天内容解析为结构化商品明细，保留客户备注，无法确认的商品进入人工审核。</textarea>
  `;
}

function memoryModal() {
  return `
    <p><strong>记忆来源：</strong>人工审核修正</p>
    <p><strong>业务范围：</strong>当前 Agent 内部生效</p>
    <textarea style="min-height:180px">小番茄 → 圣女果
白菜一筐 → 大白菜 30斤，备注按筐
今晚到 → 默认入库日期为当日</textarea>
  `;
}

function operatorModal() {
  return `
    <label class="field" style="width:100%;margin-bottom:12px"><span>姓名</span><input placeholder="请输入姓名"></label>
    <label class="field" style="width:100%;margin-bottom:12px"><span>用户名</span><input placeholder="请输入用户名"></label>
    <label class="field" style="width:100%"><span>身份标签</span><select><option>录单员</option><option>仓管员</option><option>审核员</option></select></label>
  `;
}

function openModal(title, body, options = {}) {
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-mask">
      <div class="modal ${options.wide ? "modal-wide" : ""}">
        <div class="modal-head"><strong>${title}</strong><button class="text-btn" data-close-modal>×</button></div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot">
          <button class="btn" data-close-modal>${options.hideSave ? "关闭" : "取消"}</button>
          ${options.hideSave ? "" : `<button class="btn primary" data-save-modal>保存</button>`}
        </div>
      </div>
    </div>
  `;
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.onclick = closeModal);
  const saveButton = document.querySelector("[data-save-modal]");
  if (saveButton) {
    saveButton.onclick = () => {
      closeModal();
      toast("已保存演示数据");
    };
  }
}

function closeModal() {
  document.getElementById("modalRoot").innerHTML = "";
}

let toastTimer;
function toast(message) {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 1800);
}

window.addEventListener("hashchange", render);
if (!window.location.hash) window.location.hash = "projects";
loadAnnotationsFromFile().then(render);
