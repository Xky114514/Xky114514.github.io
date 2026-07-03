const ANNOTATION_STORAGE_KEY = "prd-platform-annotation-overrides";
const ANNOTATION_FILE = "annotations.json";
const appShellTemplate = document.getElementById("app").innerHTML;

const state = {
  route: "projects",
  tabs: [{ key: "projects", label: "项目库", isHome: true }],
  activeDetailId: "PI-20260701-011",
  chatMode: "customer",
  purchaseOrderChatMode: "supplier",
  purchaseChatMode: "supplier",
  promptTab: "customer",
  purchaseDocTab: "order",
  purchaseStatsRole: "buyer",
  purchaseDecisionRole: "buyer",
  memoryScope: "party",
  agentSettingsTab: "robots",
  settingsTab: "roles",
  reviewTab: "list",
  groupBoardFilter: "all",
  purchaseHomeTaskType: "order",
  purchaseHomeGroupType: "order",
  annotationTab: "overview",
  annotationEditing: false,
  annotationOpen: false,
  filters: {
    salesCustomer: "",
    purchaseSupplier: "",
    salesStatus: "all",
    purchaseOrderStatus: "all",
    purchaseStatus: "all",
  },
};

const routes = {
  projects: { label: "PRD 项目库", module: "projects", title: "PRD 展示平台" },
  home: { label: "项目首页", module: "home", title: "AI 录单系统" },
  "purchase-home": { label: "首页", tabLabel: "采购首页", module: "purchase", title: "采购录单" },
  "sales-entry": { label: "销售订单录入", module: "sales", title: "销售订单录单" },
  "sales-review": { label: "销售订单审核", module: "sales", title: "销售订单录单" },
  "sales-statistics": { label: "统计", tabLabel: "销售统计", module: "sales", title: "销售订单录单" },
  "sales-decision-screen": { label: "决策大屏", tabLabel: "销售决策大屏", module: "sales", title: "销售订单录单" },
  "sales-customers": { label: "客户管理", module: "sales", title: "销售订单录单" },
  "sales-customer-groups": { label: "客户分组", module: "sales", title: "销售订单录单" },
  "sales-groups": { label: "销售群聊管理", module: "sales", title: "销售订单录单" },
  "purchase-order-entry": { label: "采购单录入", module: "purchase", title: "采购录单" },
  "purchase-order-review": { label: "采购单审核", module: "purchase", title: "采购录单" },
  "purchase-entry": { label: "入库单录入", module: "purchase", title: "采购录单" },
  "purchase-review": { label: "入库单审核", module: "purchase", title: "采购录单" },
  "purchase-statistics": { label: "统计", tabLabel: "采购统计", module: "purchase", title: "采购录单" },
  "purchase-decision-screen": { label: "决策大屏", tabLabel: "采购决策大屏", module: "purchase", title: "采购录单" },
  "purchase-detail": { label: "审核详情", module: "purchase", title: "采购录单" },
  "purchase-suppliers": { label: "供应商管理", module: "purchase", title: "采购录单" },
  "purchase-supplier-groups": { label: "供应商分组", module: "purchase", title: "采购录单" },
  "purchase-groups": { label: "采购群聊管理", module: "purchase", title: "采购录单" },
  "sales-prompts": { label: "提示词", tabLabel: "销售提示词", module: "sales", title: "销售订单录单" },
  "sales-memory": { label: "AI 记忆", tabLabel: "销售 AI 记忆", module: "sales", title: "销售订单录单" },
  "purchase-prompts": { label: "提示词", tabLabel: "采购提示词", module: "purchase", title: "采购录单" },
  "purchase-memory": { label: "AI 记忆", tabLabel: "采购 AI 记忆", module: "purchase", title: "采购录单" },
  "sales-agent-settings": { label: "设置", tabLabel: "销售设置", module: "sales", title: "销售订单录单" },
  "purchase-agent-settings": { label: "设置", tabLabel: "采购设置", module: "purchase", title: "采购录单" },
  settings: { label: "租户设置", module: "settings", title: "租户公共设置" },
  "tenant-members": { label: "成员管理", module: "settings", title: "租户公共配置" },
  "tenant-quota": { label: "额度管理", module: "settings", title: "租户公共配置" },
};

const routeAliases = {
  prompts: "sales-prompts",
  memory: "sales-memory",
  statistics: "sales-statistics",
  "decision-screen": "sales-decision-screen",
  "purchase-inbound-entry": "purchase-entry",
  "purchase-inbound-review": "purchase-review",
};

const primaryMenus = [
  { key: "home", label: "首页", icon: "home", module: "home" },
  { key: "settings", label: "租户设置", icon: "setting", module: "settings" },
];

const sideMenus = {
  sales: [
    { key: "sales-entry", label: "订单录入", icon: "edit" },
    { key: "sales-review", label: "订单审核", icon: "review" },
    { key: "sales-statistics", label: "统计", icon: "stats" },
    { key: "sales-decision-screen", label: "决策大屏", icon: "dashboard" },
    { key: "sales-customers", label: "客户管理", icon: "customer" },
    { key: "sales-customer-groups", label: "客户分组", icon: "group" },
    { key: "sales-groups", label: "群聊管理", icon: "group" },
    { key: "sales-prompts", label: "提示词", icon: "prompt" },
    { key: "sales-memory", label: "AI 记忆", icon: "memory" },
    { key: "sales-agent-settings", label: "设置", icon: "setting" },
  ],
  purchase: [
    { key: "purchase-order-entry", label: "采购单录入", icon: "edit" },
    { key: "purchase-order-review", label: "采购单审核", icon: "review" },
    { key: "purchase-entry", label: "入库单录入", icon: "edit" },
    { key: "purchase-review", label: "入库单审核", icon: "review" },
    { key: "purchase-statistics", label: "统计", icon: "stats" },
    { key: "purchase-decision-screen", label: "决策大屏", icon: "dashboard" },
    { key: "purchase-suppliers", label: "供应商管理", icon: "supplier" },
    { key: "purchase-supplier-groups", label: "供应商分组", icon: "group" },
    { key: "purchase-groups", label: "群聊管理", icon: "group" },
    { key: "purchase-prompts", label: "提示词", icon: "prompt" },
    { key: "purchase-memory", label: "AI 记忆", icon: "memory" },
    { key: "purchase-agent-settings", label: "设置", icon: "setting" },
  ],
};

const purchaseSideGroups = [
  {
    label: "采购单",
    icon: "edit",
    items: [
      { key: "purchase-order-entry", label: "采购单录入" },
      { key: "purchase-order-review", label: "采购单审核" },
    ],
  },
  {
    label: "入库单",
    icon: "purchase",
    items: [
      { key: "purchase-entry", label: "入库单录入" },
      { key: "purchase-review", label: "入库单审核" },
    ],
  },
  { label: "统计", icon: "stats", items: [{ key: "purchase-statistics", label: "统计" }] },
  { label: "决策大屏", icon: "dashboard", items: [{ key: "purchase-decision-screen", label: "决策大屏" }] },
  {
    label: "供应商与群聊",
    icon: "supplier",
    items: [
      { key: "purchase-suppliers", label: "供应商管理" },
      { key: "purchase-supplier-groups", label: "供应商分组" },
      { key: "purchase-groups", label: "群聊管理" },
    ],
  },
  {
    label: "知识配置",
    icon: "prompt",
    items: [
      { key: "purchase-prompts", label: "提示词" },
      { key: "purchase-memory", label: "AI 记忆" },
    ],
  },
  { label: "设置", icon: "setting", items: [{ key: "purchase-agent-settings", label: "设置" }] },
];

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
  { id: "PI-20260701-012", status: "已完成", supplier: "春田蔬菜基地", group: "蔬菜供应商入库群", store: "一号冷库", raw: "云南生菜 400 斤，油麦菜 260 斤", items: 2, order: "GM-IN-7712", auditor: "周诚" },
  { id: "PI-20260701-013", status: "待处理", supplier: "岭南肉禽", group: "肉禽采购群", store: "二号冷库", raw: "鸡腿 30 件，猪五花 18 件", items: 2, order: "-", auditor: "赵倩" },
];

const purchaseOrderTasks = [
  { id: "PO-20260701-201", status: "待处理", supplier: "海盛水产", group: "采购内部下单群", raw: "明天采购：鲈鱼 100 条，基围虾 100 斤", items: 2, order: "-", auditor: "陈林" },
  { id: "PO-20260701-217", status: "已完成", supplier: "春田蔬菜基地", group: "蔬菜采购群", raw: "云南生菜 400 斤，油麦菜 280 斤", items: 2, order: "GM-PO-7712", auditor: "周诚" },
  { id: "PO-20260701-233", status: "待处理", supplier: "岭南肉禽", group: "采购内部下单群", raw: "冻鸡腿 30 件，猪五花 18 件，明早到", items: 2, order: "-", auditor: "赵倩" },
];

const customers = [
  { id: "C10021", name: "天河鲜食店", address: "广州天河区体育西路 88 号", phone: "13800001111", groups: "华南餐饮订货群", sku: 428, priority: "订单备注" },
  { id: "C10037", name: "江北食堂", address: "重庆江北区观音桥 17 号", phone: "13600002222", groups: "江北食堂订货群", sku: 312, priority: "合并" },
  { id: "C10052", name: "万象城门店", address: "深圳罗湖区宝安南路 1881 号", phone: "13900003333", groups: "直营门店补货群", sku: 537, priority: "SPU备注" },
  { id: "C10078", name: "云岭酒店", address: "昆明盘龙区白云路 9 号", phone: "13700004444", groups: "未绑定", sku: 0, priority: "订单备注" },
];

const suppliers = [
  { id: "S20011", name: "海盛水产", category: "水产海鲜", contact: "吴经理", phone: "13500001111", address: "广州黄沙水产市场 3 栋", groups: "海鲜供应商对接群", synced: 146, warehouse: "中心仓", priority: ["采购备注", "SPU备注", "合并"] },
  { id: "S20018", name: "春田蔬菜基地", category: "蔬菜", contact: "林主管", phone: "13500002222", address: "佛山三水春田蔬菜基地", groups: "蔬菜采购群、蔬菜供应商入库群", synced: 232, warehouse: "一号冷库", priority: ["采购备注", "SPU备注", "合并"] },
  { id: "S20022", name: "岭南肉禽", category: "肉禽冻品", contact: "陈经理", phone: "13500003333", address: "东莞冷链园区 B 区", groups: "肉禽采购群", synced: 98, warehouse: "二号冷库", priority: ["采购备注", "SPU备注", "合并"] },
  { id: "S20031", name: "北仓调味品", category: "干调", contact: "周经理", phone: "13500004444", address: "广州白云干调批发城", groups: "未绑定", synced: 0, warehouse: "干货仓", priority: ["采购备注", "SPU备注", "合并"] },
];

const groups = [
  { name: "华南餐饮订货群", members: 42, salesBound: "3 个客户", purchaseBound: "-", reviewer: "李娜", bot: "正常", time: "06:00-22:00", pending: 6 },
  { name: "海鲜供应商对接群", members: 18, salesBound: "-", purchaseBound: "1 个供应商", purchaseDocType: "inbound", reviewer: "赵倩", bot: "正常", time: "00:00-23:30", pending: 3 },
  { name: "蔬菜采购群", members: 25, salesBound: "-", purchaseBound: "1 个供应商", purchaseDocType: "order", reviewer: "周诚", bot: "正常", time: "05:00-20:00", pending: 1 },
  { name: "蔬菜供应商入库群", members: 21, salesBound: "-", purchaseBound: "1 个供应商", purchaseDocType: "inbound", reviewer: "周诚", bot: "正常", time: "05:00-20:00", pending: 1 },
  { name: "采购内部下单群", members: 16, salesBound: "-", purchaseBound: "3 个供应商", purchaseDocType: "order", reviewer: "陈林", bot: "正常", time: "08:00-20:00", pending: 2 },
  { name: "肉禽采购群", members: 22, salesBound: "-", purchaseBound: "1 个供应商", purchaseDocType: "inbound", reviewer: "赵倩", bot: "正常", time: "00:00-23:30", pending: 2 },
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
    desc: "用可交互前端承载应用中心、销售订单录单、采购录单、全局能力与一期采购入库确认流程。",
    pages: ["应用中心", "统计", "决策大屏", "销售订单录单", "采购录单", "批注面板"],
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
    version: "V0.7",
    date: "2026-07-02",
    title: "采购单与入库单双链路",
    changes: ["采购录单增加采购单录入与采购单审核", "群聊管理增加采购单/入库单类型标签", "提示词和 AI 记忆按采购单/入库单区分"],
  },
  {
    version: "V0.5",
    date: "2026-07-02",
    title: "首页与 Agent 边界调整",
    changes: ["首页改为应用中心与全局额度入口", "销售订单录单/采购录单左侧导航独立展示", "采购入库详情页按一期范围瘦身"],
  },
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
    changes: ["拆分销售订单录单与采购录单", "补齐审核、群聊、提示词、AI 记忆与租户设置页面"],
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
    overview: "首页作为 AI 录单系统入口，展示应用中心、整体额度和租户级公共配置入口。",
    dev: ["销售订单录单卡片进入销售录入，采购录单卡片进入采购首页 purchase-home。", "额度管理和成员管理拆为 tenant-quota、tenant-members 两个公共配置路由，两个 Agent 共用。"],
    business: ["销售订单录单与采购录单的入口相互独立，业务数据进入对应 Agent 后查看。", "额度管理、成员管理、应用中心和整体额度使用概览属于全局能力，不归属单个 Agent。"],
    iteration: ["2026-07-03 将首页成员管理和额度管理拆为公共配置独立入口，并新增采购录单首页入口。"],
  },
  "purchase-home": {
    title: "采购首页",
    overview: "采购首页作为采购录单工作台，展示采购各菜单快捷入口、今日任务和群聊看板。",
    dev: ["路由为 purchase-home，采购录单卡片和采购侧首页图标均进入该页。", "今日任务和群聊看板分别使用 purchaseHomeTaskType、purchaseHomeGroupType 在采购单/入库单之间切换。", "页面不展示录单额度卡片，额度仍回到租户级公共配置查看。"],
    business: ["采购录单首页聚焦采购单和入库单业务处理入口。", "今日任务和群聊看板必须支持按采购单/入库单筛选，方便采购员和入库员分别查看。"],
    iteration: ["2026-07-03 新增采购录单首页，包含快捷入口、今日任务和群聊看板。"],
  },
  "sales-statistics": {
    title: "销售统计",
    overview: "销售统计页用于查看销售订单录单内录单员、审核员和客户订单识别表现。",
    dev: ["统计页归属销售订单录单左侧菜单，路由为 sales-statistics。", "当前数据为静态演示表格，后续可按日期范围、角色和操作员维度接入真实绩效接口。"],
    business: ["业务方重点确认销售订单绩效指标口径是否满足审核员和录单员管理。", "导出 Excel 为前端演示按钮，后续需要明确导出字段和权限。"],
    iteration: ["V0.6 将统计从全局入口移动到销售订单录单内。"],
  },
  "sales-decision-screen": {
    title: "销售决策大屏",
    overview: "销售决策大屏用于在销售订单录单内查看订单识别质量、异常诊断和操作员效能。",
    dev: ["决策大屏归属销售订单录单左侧菜单，路由为 sales-decision-screen。", "页面按卡片和表格分区承载静态指标，后续可替换为实时指标接口和图表组件。"],
    business: ["管理者可通过销售大屏判断销售订单提交、识别质量和人工纠错情况。", "时间范围控件用于表达今日实时、昨日、近 7 天、近 30 天和自定义查询。"],
    iteration: ["V0.6 将决策大屏从全局入口移动到销售订单录单内。"],
  },
  "purchase-statistics": {
    title: "采购统计",
    overview: "采购统计页用于查看采购录单内采购员、入库员和供应商单据识别表现。",
    dev: ["统计页归属采购录单左侧菜单，路由为 purchase-statistics。", "当前数据为静态演示表格，后续可按日期范围、角色和操作员维度接入真实绩效接口。"],
    business: ["业务方重点确认采购绩效指标口径是否满足采购员和入库员管理。", "导出 Excel 为前端演示按钮，后续需要明确导出字段和权限。"],
    iteration: ["V0.6 将统计从全局入口移动到采购录单内。"],
  },
  "purchase-decision-screen": {
    title: "采购决策大屏",
    overview: "采购决策大屏用于在采购录单内查看入库识别质量、异常诊断和操作员效能。",
    dev: ["决策大屏归属采购录单左侧菜单，路由为 purchase-decision-screen。", "页面按卡片和表格分区承载静态指标，后续可替换为实时指标接口和图表组件。"],
    business: ["管理者可通过采购大屏判断采购入库提交、识别质量和人工纠错情况。", "时间范围控件用于表达今日实时、昨日、近 7 天、近 30 天和自定义查询。"],
    iteration: ["V0.6 将决策大屏从全局入口移动到采购录单内。"],
  },
  "sales-entry": {
    title: "销售订单录入",
    overview: "销售录入页模拟录单员从客户或群聊进入，对文字、图片、Excel、PDF 订单内容进行 AI 识别。",
    dev: ["左侧客户/群聊分段切换由 state.chatMode 控制。", "发送消息后会向 chatMessages.sales 追加用户消息和 Agent 响应，便于演示识别链路。"],
    business: ["录单前必须先确定客户或群聊来源，避免订单归属错误。", "识别结果进入销售订单审核，不在录入页直接完成下单。"],
    iteration: ["V0.1 完成销售录入核心交互，后续可补充附件预览和异常商品提示。"],
  },
  "purchase-entry": {
    title: "入库单录入",
    overview: "入库单录入页模拟仓管从供应商、供应商群或送货单图片导入实际收货信息，由 AI 生成待审核入库单。",
    dev: ["左侧供应商/入库单群分段切换由 state.purchaseChatMode 控制。", "群聊列表只展示标记为入库单录入的采购群。"],
    business: ["入库单需要识别供应商、商品、入库数量、入库单价和备注。", "一期与采购单分开录入，不自动混合识别两类单据。"],
    iteration: ["V0.7 将入库单录入从采购单录入中拆出独立入口。"],
  },
  "purchase-order-entry": {
    title: "采购单录入",
    overview: "采购单录入页模拟采购员手写单、微信截图或采购内部群消息导入，由 AI 生成待审核采购单。",
    dev: ["左侧供应商/采购单群分段切换由 state.purchaseOrderChatMode 控制。", "群聊列表只展示标记为采购单录入的采购群。"],
    business: ["采购单一期重点识别供应商、商品名称和采购数量，价格字段默认不作为必填项。", "采购单可作为后续仓库收货依据，但本期不做与入库单的自动匹配。"],
    iteration: ["V0.7 新增采购单录入入口。"],
  },
  "sales-review": {
    title: "销售订单审核",
    overview: "销售审核页用于查看 AI 识别后的订单任务，支持状态筛选、列表视图和群聊视图。",
    dev: ["状态筛选使用 state.filters.salesStatus，列表和群聊视图通过 state.reviewTab 切换。", "失败、合单等状态保留独立标签，方便后续接真实审核动作。"],
    business: ["待处理订单需要人工确认后进入正式订单。", "失败任务需要补充信息或转人工处理。"],
    iteration: ["V0.1 完成销售审核列表，后续可加入批量审核与合单选择。"],
  },
  "purchase-review": {
    title: "入库单审核",
    overview: "入库单审核页集中处理供应商实际到货和送货单识别任务，确认后可进入入库单详情页。",
    dev: ["入库任务使用 purchaseTasks 数据，详情按钮会路由到 purchase-detail。", "状态筛选使用 state.filters.purchaseStatus，与销售审核保持同构。"],
    business: ["待处理入库单需要确认商品、入库数、价格和入库员。", "审核完成后才允许执行实际入库确认。"],
    iteration: ["V0.7 将入库单审核保留为独立入口。"],
  },
  "purchase-order-review": {
    title: "采购单审核",
    overview: "采购单审核页集中处理采购员手写单、微信截图和采购内部群生成的采购单任务。",
    dev: ["采购单任务使用 purchaseOrderTasks 数据。", "状态筛选使用 state.filters.purchaseOrderStatus，群聊视图只展示采购单录入群。"],
    business: ["待处理采购单需要确认供应商、商品和采购数量。", "采购单可作为收货依据，但一期不自动生成或匹配入库单。"],
    iteration: ["V0.7 新增采购单审核入口。"],
  },
  "purchase-detail": {
    title: "采购入库单详情",
    overview: "一期详情页聚焦供应商送货单原始内容、AI 识别结果确认和人工修正入库明细。",
    dev: ["当前 activeDetailId 控制详情数据，明细表格使用静态输入框模拟可编辑状态。", "页面只保留手动选择采购单入口，不提供自动关联逻辑。", "保存修正和确认入库使用 toast 演示，后续替换为接口提交。"],
    business: ["入库员确认供应商、商品名称、入库数、入库单价、入库金额和备注即可。", "一期不展示复杂关联信息或完整 ERP 单据字段。"],
    iteration: ["V0.5 按一期范围瘦身采购详情页，删除复杂对账与自动关联展示。"],
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
    dev: ["客户分组属于销售订单录单二级菜单，路由为 sales-customer-groups。", "新建分组弹窗展示审核员、分组名称、群聊和客户选择区，当前为静态前端原型。"],
    business: ["一个客户分组可以绑定审核员、多个群聊和多个客户。", "客户分组用于明确销售订单审核归属，减少无人处理或重复处理。"],
    iteration: ["新增销售订单录单客户分组菜单和新建分组弹窗。"],
  },
  "purchase-suppliers": {
    title: "供应商管理",
    overview: "供应商管理页展示供应商分类、联系人、绑定群聊、默认仓库和同步状态。",
    dev: ["搜索条件写入 state.filters.purchaseSupplier，和客户管理共用 partyPage 模板。", "供应商字段与客户字段保持同类结构，便于复用表格组件。"],
    business: ["供应商绑定群聊后，采购单和入库单消息才能正确归属。", "默认仓库帮助 AI 识别入库单缺失仓库信息。"],
    iteration: ["V0.1 完成供应商列表和搜索能力。"],
  },
  "purchase-supplier-groups": {
    title: "供应商分组",
    overview: "供应商分组页用于把采购员与供应商、供应商群聊建立分组关系，便于采购任务进入对应人员的处理范围。",
    dev: ["供应商分组属于采购录单二级菜单，路由为 purchase-supplier-groups。", "列表中的采购员字段使用下拉控件，操作列统一展示编辑和删除。", "新建分组弹窗展示人员、分组名称、群聊和供应商选择区，当前为静态前端原型。"],
    business: ["一个供应商分组可以绑定采购员、多个供应商和多个供应商群聊。", "列表中各行操作展示需要一致，避免最后一行只显示查看造成行为口径不一致。"],
    iteration: ["2026-07-03 统一供应商分组操作列，所有行展示编辑和删除。"],
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
    overview: "采购群聊管理页维护采购单群和入库单群，绑定供应商、处理人、机器人状态和生效时段。",
    dev: ["采购群通过 purchaseBound !== '-' 过滤得到，并使用 purchaseDocType 标记采购单录入或入库单录入。", "与销售群聊管理共用 groupsPage 模板，只切换业务字段和群聊类型列。"],
    business: ["一期通过群聊类型区分采购单和入库单来源，避免同一群混发两类票据。", "若同一群后续需要承载两类单据，再考虑按成员 ID 或消息特征识别。"],
    iteration: ["V0.7 增加采购群聊类型标签。"],
  },
  "sales-prompts": {
    title: "销售提示词",
    overview: "销售提示词页用于维护销售订单解析模板和系统规则。",
    dev: ["promptTab 控制客户提示词和系统提示词两类视图。", "编辑弹窗当前为演示保存，后续接模板版本接口。"],
    business: ["销售提示词只影响销售订单解析，不影响采购入库。", "特殊客户规则可沉淀为独立模板。"],
    iteration: ["V0.1 完成销售提示词配置页。"],
  },
  "purchase-prompts": {
    title: "采购提示词",
    overview: "采购提示词页用于维护采购单和入库单两类解析模板，并按单据类型隔离规则。",
    dev: ["与销售提示词共用 promptsPage，通过 purchaseDocTab 区分采购单和入库单。", "模板目标对象可扩展到供应商、群聊或品类。"],
    business: ["采购单提示词重点识别供应商、商品和采购数量，价格默认非必填。", "入库单提示词重点识别供应商、商品、入库数量、入库单价和备注。"],
    iteration: ["V0.7 增加采购单/入库单提示词切换。"],
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
    overview: "采购 AI 记忆页展示采购单和入库单各自沉淀的供应商别名、商品别名和群聊规则。",
    dev: ["与销售记忆共用 memoryPage，通过 purchaseDocTab 切换采购单和入库单记忆。", "后续可以增加记忆审批和过期策略。"],
    business: ["采购单记忆和入库单记忆分开沉淀，避免采购数量规则影响实际入库识别。", "错误记忆应能禁用或回滚。"],
    iteration: ["V0.7 增加采购单/入库单 AI 记忆切换。"],
  },
  "sales-agent-settings": {
    title: "销售设置",
    overview: "销售设置页承载销售录单机器人的启停、回复设置和识别边界。",
    dev: ["路由为 sales-agent-settings，归属销售订单录单左侧菜单。", "当前表单为静态演示，后续可拆接机器人配置和回复模板接口。"],
    business: ["销售机器人、回复设置、提示词和 AI 记忆只影响销售订单链路。"],
    iteration: ["V0.5 新增 Agent 内独立设置入口。"],
  },
  "purchase-agent-settings": {
    title: "采购设置",
    overview: "采购设置页承载采购单/入库单机器人的启停、回复设置和识别边界。",
    dev: ["路由为 purchase-agent-settings，归属采购录单左侧菜单。", "当前表单为静态演示，后续可拆接机器人配置和回复模板接口。"],
    business: ["采购机器人、回复设置、提示词和 AI 记忆只影响采购入库链路。"],
    iteration: ["V0.5 新增 Agent 内独立设置入口。"],
  },
  settings: {
    title: "租户公共设置",
    overview: "租户设置页集中展示角色权限、成员、同步规则和额度配置，是跨 Agent 的公共配置。",
    dev: ["settingsTab 控制四类设置面板，成员新增使用 operatorModal 演示。", "同步和额度目前为静态卡片，后续接租户配置接口。"],
    business: ["管理员可管理成员、同步规则和额度阈值。", "额度低于阈值时应限制普通成员继续提交识别任务。"],
    iteration: ["V0.1 完成租户公共设置框架。"],
  },
  "tenant-members": {
    title: "成员管理",
    overview: "成员管理页是租户级公共配置，用于维护两个 Agent 共用的操作人员、角色和启用状态。",
    dev: ["路由为 tenant-members，从首页成员管理卡片进入。", "新增成员弹窗复用 operatorModal，字段包含姓名、用户名、密码和成员角色。"],
    business: ["新增按钮文案统一为新增成员。", "成员角色可选录单员、采购员、入库员，作为后续业务分工和权限配置基础。"],
    iteration: ["2026-07-03 将成员管理从首页公共配置卡片拆出独立页面，并补充新增成员弹窗。"],
  },
  "tenant-quota": {
    title: "额度管理",
    overview: "额度管理页是租户级公共配置，用于查看共享录单额度、预计可用天数、期间消耗和消耗明细。",
    dev: ["路由为 tenant-quota，从首页额度管理卡片或额度资产入口进入。", "页面当前为静态原型，后续接入租户额度池、充值历史和消耗明细接口。"],
    business: ["额度池由销售订单录单和采购录单共用，不归属单个 Agent。", "录单额度页需要展示剩余额度、累计充值、累计消耗和按时间范围筛选的消耗明细。"],
    iteration: ["2026-07-03 将额度管理从首页公共配置卡片拆出独立页面。"],
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
  "purchase-order": [
    { role: "assistant", text: "已连接采购单录入 Agent，请选择供应商或采购单群后发送采购内容。" },
    { role: "user", text: "明天采购：鲈鱼 100 条，基围虾 100 斤" },
    { role: "assistant", text: "已识别 2 个采购商品，生成待审核采购单 PO-20260701-201。" },
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
  document.body.classList.toggle("entry-mode", state.route === "sales-entry" || state.route === "purchase-order-entry" || state.route === "purchase-entry" || state.route === "purchase-detail");
  document.body.classList.toggle("project-mode", state.route === "projects");
  document.body.classList.toggle("home-mode", state.route === "home");
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
  const sider = document.querySelector(".sider");
  sider?.classList.toggle("purchase-sider", route.module === "purchase");
  if (route.module === "home" || route.module === "projects") {
    document.getElementById("sideMenu").innerHTML = "";
    return;
  }
  const activeKey = state.route === "purchase-detail"
    ? state.activeDetailId?.startsWith("PO-") ? "purchase-order-review" : "purchase-review"
    : state.route;
  const moduleTitle = route.module === "sales" ? "销售订单录单" : route.module === "purchase" ? "采购录单" : "";
  const globalMenuItems = route.module === "settings" && state.route !== "settings"
    ? [
        { key: "home", label: "首页", icon: "home", module: "home" },
        { key: state.route, label: route.label, icon: "setting", module: "settings" },
      ]
    : primaryMenus;
  const globalHtml = !["sales", "purchase"].includes(route.module) ? `
    <div class="side-group">
      <div class="side-section">全局能力</div>
      ${globalMenuItems.map((item) => `
        <button class="side-item side-primary ${item.key === activeKey || (state.route === "settings" && item.key === "settings") ? "active" : ""}" data-route="${item.key}" title="${item.label}" aria-label="${item.label}">
          <span class="side-icon" aria-hidden="true">${iconSvg[item.icon] || iconSvg.home}</span>
          <span class="side-label">${item.label}</span>
        </button>
      `).join("")}
    </div>
  ` : "";
  if (route.module === "purchase") {
    document.getElementById("sideMenu").innerHTML = renderPurchaseIconMenu(activeKey);
    return;
  }
  const menu = sideMenus[route.module] || [];
  const moduleHtml = menu.length ? `
    <div class="side-group">
      <div class="side-section">${moduleTitle}</div>
      ${menu.map((item) => `
        <button class="side-item side-subitem ${item.key === activeKey ? "active" : ""}" data-route="${item.key}" title="${item.label}" aria-label="${item.label}">
          <span class="side-icon" aria-hidden="true">${iconSvg[item.icon] || iconSvg.home}</span>
          <span class="side-label">${item.label}</span>
        </button>
      `).join("")}
    </div>
  ` : "";
  const agentSwitchHtml = ["sales", "purchase"].includes(route.module) ? `
    <div class="side-switch">
      <div class="side-section">切换 Agent</div>
      <button class="side-item" data-route="home" title="应用中心" aria-label="应用中心">
        <span class="side-icon" aria-hidden="true">${iconSvg.home}</span>
        <span class="side-label">应用中心</span>
      </button>
      <button class="side-item" data-route="${route.module === "sales" ? "purchase-home" : "sales-entry"}" title="${route.module === "sales" ? "采购录单" : "销售订单录单"}" aria-label="${route.module === "sales" ? "采购录单" : "销售订单录单"}">
        <span class="side-icon" aria-hidden="true">${route.module === "sales" ? iconSvg.purchase : iconSvg.sales}</span>
        <span class="side-label">${route.module === "sales" ? "采购录单" : "销售订单录单"}</span>
      </button>
    </div>
  ` : "";
  document.getElementById("sideMenu").innerHTML = globalHtml + moduleHtml + agentSwitchHtml;
}

function renderPurchaseIconMenu(activeKey) {
  const groupHtml = purchaseSideGroups.map((group) => {
    const isActive = group.items.some((item) => item.key === activeKey);
    const primaryRoute = group.items[0]?.key || "purchase-order-entry";
    return `
      <div class="side-flyout-wrap">
        <button class="side-item side-icon-only ${isActive ? "active" : ""}" data-route="${primaryRoute}" title="${group.label}" aria-label="${group.label}">
          <span class="side-icon" aria-hidden="true">${iconSvg[group.icon] || iconSvg.home}</span>
        </button>
        <div class="side-flyout" role="menu" aria-label="${group.label}">
          ${group.items.map((item) => `<button class="side-flyout-item ${item.key === activeKey ? "active" : ""}" data-route="${item.key}" role="menuitem">${item.label}</button>`).join("")}
        </div>
      </div>
    `;
  }).join("");
  return `
    <div class="side-group purchase-icon-menu">
      <div class="side-flyout-wrap">
        <button class="side-item side-icon-only ${activeKey === "purchase-home" ? "active" : ""}" data-route="purchase-home" title="采购首页" aria-label="采购首页">
          <span class="side-icon" aria-hidden="true">${iconSvg.home}</span>
        </button>
        <div class="side-flyout" role="menu" aria-label="采购首页">
          <button class="side-flyout-item ${activeKey === "purchase-home" ? "active" : ""}" data-route="purchase-home" role="menuitem">采购首页</button>
        </div>
      </div>
      ${groupHtml}
    </div>
    <div class="side-switch purchase-icon-menu">
      <div class="side-flyout-wrap">
        <button class="side-item side-icon-only" data-route="home" title="应用中心" aria-label="应用中心">
          <span class="side-icon" aria-hidden="true">${iconSvg.home}</span>
        </button>
        <div class="side-flyout" role="menu" aria-label="应用中心">
          <button class="side-flyout-item" data-route="home" role="menuitem">应用中心</button>
        </div>
      </div>
      <div class="side-flyout-wrap">
        <button class="side-item side-icon-only" data-route="sales-entry" title="销售订单录单" aria-label="销售订单录单">
          <span class="side-icon" aria-hidden="true">${iconSvg.sales}</span>
        </button>
        <div class="side-flyout" role="menu" aria-label="销售订单录单">
          <button class="side-flyout-item" data-route="sales-entry" role="menuitem">销售订单录单</button>
        </div>
      </div>
    </div>
  `;
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
  if (state.route === "purchase-home") content.innerHTML = purchaseHomePage();
  if (state.route === "sales-entry") content.innerHTML = entryPage("sales");
  if (state.route === "purchase-order-entry") content.innerHTML = entryPage("purchase-order");
  if (state.route === "purchase-entry") content.innerHTML = entryPage("purchase");
  if (state.route === "sales-review") content.innerHTML = reviewPage("sales");
  if (state.route === "purchase-order-review") content.innerHTML = reviewPage("purchase-order");
  if (state.route === "purchase-review") content.innerHTML = reviewPage("purchase");
  if (state.route === "sales-statistics") content.innerHTML = statisticsPage("sales");
  if (state.route === "purchase-statistics") content.innerHTML = statisticsPage("purchase");
  if (state.route === "sales-decision-screen") content.innerHTML = decisionScreenPage("sales");
  if (state.route === "purchase-decision-screen") content.innerHTML = decisionScreenPage("purchase");
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
  if (state.route === "sales-agent-settings") content.innerHTML = agentSettingsPage("sales");
  if (state.route === "purchase-agent-settings") content.innerHTML = agentSettingsPage("purchase");
  if (state.route === "settings") content.innerHTML = settingsPage();
  if (state.route === "tenant-members") content.innerHTML = memberManagementPage();
  if (state.route === "tenant-quota") content.innerHTML = quotaManagementPage();
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
    <div class="page home-dashboard-page">
      <section class="banner">
        <h1>AI 录单系统应用中心</h1>
        <p>应用入口与公共配置</p>
      </section>

      <div class="section-title"><h2>应用中心</h2></div>
      <div class="grid two">
        <button class="agent-card" data-route="sales-entry">
          <span class="agent-head">
            <span class="app-icon sales-grad">销</span>
            <span>
              <h3>销售订单录单</h3>
              <p>销售录单审核</p>
            </span>
          </span>
        </button>
        <button class="agent-card" data-route="purchase-home">
          <span class="agent-head">
            <span class="app-icon purchase-grad">采</span>
            <span>
              <h3>采购录单</h3>
              <p>采购入库协同</p>
            </span>
          </span>
        </button>
      </div>

      <div class="section-title"><h2>整体额度</h2></div>
      <div class="grid dashboard">
        <section class="card">
          <div class="card-header">
            <h3>额度使用概览</h3>
          </div>
          <div class="quota-layout">
            <div class="ring"><div class="ring-inner">62%<span>已用</span></div></div>
            <div>
              <div class="quota-num">3,820</div>
              <div class="muted">剩余额度</div>
              <p><b>6,180</b> 已用 <span class="divider">|</span> <b>10,000</b> 总额</p>
            </div>
          </div>
        </section>
        <section class="card">
          <div class="card-header"><h3>额度资产</h3><button class="text-btn" data-route="tenant-quota">额度管理</button></div>
          <div class="metric-row global-metric-row">
            <div class="metric"><span class="metric-value" style="color:var(--primary)">10k</span><span class="metric-label">总额度</span></div>
            <div class="metric"><span class="metric-value" style="color:var(--success)">3.8k</span><span class="metric-label">剩余</span></div>
            <div class="metric"><span class="metric-value" style="color:var(--warning)">20%</span><span class="metric-label">预警阈值</span></div>
            <div class="metric"><span class="metric-value" style="color:var(--danger)">5%</span><span class="metric-label">限制阈值</span></div>
          </div>
        </section>
      </div>

      <div class="section-title"><h2>全局入口</h2></div>
      <div class="grid two">
        ${configCard("tenant-quota", "额", "额度管理", "额度与消耗")}
        ${configCard("tenant-members", "员", "成员管理", "成员与权限")}
      </div>
    </div>
  `;
}

function configCard(route, icon, title, desc) {
  return `
    <button class="agent-card" data-route="${route}">
      <span class="agent-head"><span class="app-icon config-grad">${icon}</span><span><h3>${title}</h3><p>${desc}</p></span></span>
    </button>
  `;
}

function purchaseHomePage() {
  const taskType = state.purchaseHomeTaskType || "order";
  const groupType = state.purchaseHomeGroupType || "order";
  const tasks = taskType === "order" ? purchaseOrderTasks : purchaseTasks;
  const groupRows = groups.filter((group) => getGroupDomain(group) === "purchase" && getPurchaseDocType(group) === groupType);
  const pendingCount = tasks.filter((task) => task.status === "待处理").length;
  const finishedCount = tasks.filter((task) => task.status === "已完成").length;
  const failedCount = tasks.filter((task) => task.status === "失败").length;
  const shortcutItems = [
    { route: "purchase-order-entry", icon: "edit", label: "采购单录入" },
    { route: "purchase-order-review", icon: "review", label: "采购单审核" },
    { route: "purchase-entry", icon: "edit", label: "入库单录入" },
    { route: "purchase-review", icon: "review", label: "入库单审核" },
    { route: "purchase-suppliers", icon: "supplier", label: "供应商" },
    { route: "purchase-supplier-groups", icon: "group", label: "供应商分组" },
    { route: "purchase-groups", icon: "group", label: "群聊管理" },
    { route: "purchase-prompts", icon: "prompt", label: "提示词" },
    { route: "purchase-memory", icon: "memory", label: "AI 记忆" },
    { route: "purchase-agent-settings", icon: "setting", label: "设置" },
  ];

  return `
    <div class="page purchase-home-page">
      <section class="purchase-home-hero">
        <div>
          <h1>早上好，采购录单</h1>
          <p>2026年07月03日 星期五</p>
        </div>
        <div class="purchase-shortcuts">
          ${shortcutItems.map((item) => `
            <button class="purchase-shortcut" data-route="${item.route}">
              <span>${iconSvg[item.icon] || iconSvg.home}</span>
              <em>${item.label}</em>
            </button>
          `).join("")}
        </div>
      </section>

      <section class="table-card purchase-home-card">
        <div class="card-header">
          <h3>今日任务</h3>
          <div class="segmented">
            <button class="${taskType === "order" ? "active" : ""}" data-purchase-home-task="order">采购单</button>
            <button class="${taskType === "inbound" ? "active" : ""}" data-purchase-home-task="inbound">入库单</button>
          </div>
        </div>
        <div class="purchase-task-summary">
          <button data-route="${taskType === "order" ? "purchase-order-review" : "purchase-review"}"><strong class="gold-text">${pendingCount}</strong><span>待处理</span></button>
          <button data-route="${taskType === "order" ? "purchase-order-review" : "purchase-review"}"><strong class="green-text">${finishedCount}</strong><span>已完成</span></button>
          <button data-route="${taskType === "order" ? "purchase-order-review" : "purchase-review"}"><strong class="red-text">${failedCount}</strong><span>失败</span></button>
          <button data-route="purchase-groups"><strong class="blue-text">${groupRows.length}</strong><span>活跃群</span></button>
        </div>
        <div class="table-scroll purchase-home-table">
          ${taskMiniTable(tasks)}
        </div>
      </section>

      <section class="table-card purchase-home-card">
        <div class="card-header">
          <h3>群聊看板</h3>
          <div class="segmented">
            <button class="${groupType === "order" ? "active" : ""}" data-purchase-home-group="order">采购单</button>
            <button class="${groupType === "inbound" ? "active" : ""}" data-purchase-home-group="inbound">入库单</button>
          </div>
        </div>
        <div class="table-scroll">
          ${purchaseGroupBoardTable(groupRows)}
        </div>
      </section>
    </div>
  `;
}

function purchaseGroupBoardTable(rows) {
  return `
    <table>
      <thead><tr><th>群聊名称</th><th>群聊类型</th><th class="right">成员数</th><th class="right">待处理</th><th>操作员</th><th>机器人</th></tr></thead>
      <tbody>
        ${rows.map((group) => `<tr>
          <td><strong>${group.name}</strong></td>
          <td><span class="tag ${getPurchaseDocType(group) === "order" ? "blue" : "green"}">${purchaseDocLabel(getPurchaseDocType(group))}</span></td>
          <td class="right">${group.members}</td>
          <td class="right"><span class="tag gold">${group.pending}</span></td>
          <td>${group.reviewer}</td>
          <td><span class="tag green">${group.bot}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function statisticsPage(type = "sales") {
  const isSales = type === "sales";
  const agentName = isSales ? "销售订单录单" : "采购录单";
  const purchaseRole = state.purchaseStatsRole;
  const roleLabel = isSales ? "当前审核员" : purchaseRole === "buyer" ? "采购员" : "入库员";
  const rows = isSales ? [
    { reviewer: "张三", orders: 2, submits: 2, goods: 8 },
    { reviewer: "系统管理员", orders: 2, submits: 2, goods: 2 },
    { reviewer: "李娜", orders: 7, submits: 7, goods: 26 },
  ] : purchaseRole === "buyer" ? [
    { reviewer: "陈林", orders: 6, submits: 6, goods: 20 },
    { reviewer: "周诚", orders: 4, submits: 4, goods: 12 },
    { reviewer: "赵倩", orders: 2, submits: 2, goods: 8 },
  ] : [
    { reviewer: "赵倩", orders: 5, submits: 5, goods: 18 },
    { reviewer: "周诚", orders: 4, submits: 4, goods: 12 },
    { reviewer: "系统管理员", orders: 1, submits: 1, goods: 2 },
  ];
  return `
    <div class="page wide-page ops-page">
      <section class="ops-panel">
        <div class="tabs ops-tabs">
          ${isSales
            ? `<button class="subtab active">审核员绩效</button><button class="subtab">录单员绩效</button>`
            : `<button class="subtab ${purchaseRole === "buyer" ? "active" : ""}" data-stats-role="buyer">采购员绩效</button><button class="subtab ${purchaseRole === "inbound" ? "active" : ""}" data-stats-role="inbound">入库员绩效</button>`}
        </div>
      </section>

      <section class="ops-panel">
        <div class="ops-filter-bar">
          <strong>${agentName} 统计</strong>
          <div class="segmented">
            <button class="active">今日</button><button>昨日</button><button>本周</button><button>本月</button><button>上月</button>
          </div>
          <label class="date-range"><input placeholder="开始日期"><span>→</span><input placeholder="结束日期"></label>
          <button class="btn export-btn" data-toast="已导出操作员绩效 Excel">导出 Excel</button>
        </div>
        <div class="table-scroll">
          <table class="ops-table">
            <thead><tr><th>#</th><th>${roleLabel}</th><th class="right">下单数</th><th class="right active-sort">提交数</th><th class="right">商品总数</th></tr></thead>
            <tbody>${rows.map((row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${row.reviewer}</strong></td>
                <td class="right">${row.orders}</td>
                <td class="right">${row.submits}</td>
                <td class="right">${row.goods}</td>
              </tr>
            `).join("")}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function decisionScreenPage(type = "sales") {
  const isSales = type === "sales";
  const agentName = isSales ? "销售订单录单" : "采购录单";
  const purchaseRole = state.purchaseDecisionRole;
  const roleLabel = isSales ? "接单员" : purchaseRole === "buyer" ? "采购员" : "入库员";
  const orderWord = isSales ? "订单" : purchaseRole === "buyer" ? "采购单" : "入库单";
  const purchaseMetrics = purchaseRole === "buyer"
    ? { today: "6", consumed: "6", savedWorker: "全职采购员", activeGroups: "2 / 5", groupDesc: "采购群 / 绑定群", submitRatio: "4 / 6", memory: "1" }
    : { today: "8", consumed: "8", savedWorker: "全职入库员", activeGroups: "1 / 4", groupDesc: "入库群 / 绑定群", submitRatio: "5 / 8", memory: "0" };
  const modalityRows = [
    { title: isSales ? "纯文本下单" : purchaseRole === "buyer" ? "纯文本采购" : "纯文本入库", orders: 4, manual: 0, rate: "100%" },
    { title: isSales ? "图片下单" : purchaseRole === "buyer" ? "采购单图片" : "送货单图片", orders: 1, manual: 0, rate: "100%" },
    { title: isSales ? "文件下单" : purchaseRole === "buyer" ? "采购单文件" : "送货单文件", orders: 0, manual: 0, rate: "-" },
    { title: "其他类型", orders: 0, manual: 0, rate: "-" },
  ];
  const errorRows = isSales ? [
    ["d6ef90f3...", "text", "观麦大学", 1, 1, "0 / 1"],
    ["d456761e...", "text", "观麦大学", 2, 2, "0 / 2"],
    ["0476729a...", "image", "张三小学第二食堂", 3, 3, "0 / 3"],
  ] : purchaseRole === "buyer" ? [
    ["PO-20260701-201", "text", "海盛水产", 2, 2, "0 / 2"],
    ["PO-20260701-217", "text", "春田蔬菜基地", 2, 2, "0 / 2"],
    ["PO-20260701-233", "image", "岭南肉禽", 2, 1, "1 / 2"],
  ] : [
    ["PI-20260701-011", "text", "海盛水产", 2, 2, "0 / 2"],
    ["PI-20260701-012", "image", "春田蔬菜基地", 2, 2, "0 / 2"],
    ["PI-20260701-013", "text", "岭南肉禽", 2, 1, "1 / 2"],
  ];
  return `
    <div class="page wide-page decision-page">
      <div class="decision-head">
        <div>
          <h2>${iconSvg.dashboard} ${agentName} 决策大屏</h2>
          <p>聚焦${agentName}内部识别质量、异常诊断与${roleLabel}效能</p>
        </div>
        <div class="decision-range">
          ${!isSales ? `<label class="decision-role-select"><span>人员类型</span><select data-decision-role><option value="buyer" ${purchaseRole === "buyer" ? "selected" : ""}>采购员</option><option value="inbound" ${purchaseRole === "inbound" ? "selected" : ""}>入库员</option></select></label>` : ""}
          <span>时间范围</span><button class="active">今日实时</button><button>昨日</button><button>近 7 天</button><button>近 30 天</button><button>自定义</button>
        </div>
      </div>

      ${decisionSectionTitle("01", "核心指标概览", "资产、经营与降本视角")}
      <section class="decision-card">
        <h3>AI 额度资产与消耗</h3>
        <div class="decision-kpi-grid">
          ${decisionKpi("剩余可用条数", "99,330", "额度充足", "blue")}
          ${decisionKpi("累计充值总额度", "101,170", "历史累计", "")}
          ${decisionKpi(`今日提交${orderWord}`, isSales ? "8" : purchaseMetrics.today, "0:00 起统计", "")}
          ${decisionKpi("今日已消耗条数", isSales ? "8" : purchaseMetrics.consumed, "成功扣费", "red")}
        </div>
      </section>
      <div class="decision-mini-grid">
        ${decisionMiniCard("累计节省工时", "0.0 人/日", isSales ? "全职接单员" : purchaseMetrics.savedWorker, "green")}
        ${decisionMiniCard("商品识别率", "100.0 %", "商品识别率", "blue")}
        ${decisionMiniCard("活跃群占比", isSales ? "1 / 4" : purchaseMetrics.activeGroups, isSales ? "下单群 / 绑定群" : purchaseMetrics.groupDesc, "")}
        ${decisionMiniCard(`${orderWord}提交数`, isSales ? "5 / 8" : purchaseMetrics.submitRatio, "提交 / 生成", "")}
        ${decisionMiniCard("新增记忆数", isSales ? "0" : purchaseMetrics.memory, "纠错 + 习惯", "blue")}
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
          <table><thead><tr><th>${orderWord}编码</th><th>来源类型</th><th>${isSales ? "门店" : "供应商"}</th><th class="right">总条目</th><th class="right">正确数</th><th class="right">人工修改/总提交</th></tr></thead>
          <tbody>${errorRows.map((row) => `<tr><td><code>${row[0]}</code></td><td><span class="tag blue">${row[1]}</span></td><td>${row[2]}</td><td class="right">${row[3]}</td><td class="right">${row[4]}</td><td class="right"><span class="danger-text">${row[5]}</span></td></tr>`).join("")}</tbody></table>
        </section>
      </div>

      ${decisionSectionTitle("04", "操作员效能", "内部管理视角")}
      <section class="decision-card">
        <h3>操作员效能统计 <span class="muted">标红行：单次停留 &lt; 1 秒，疑似首审</span></h3>
        <table><thead><tr><th>${roleLabel}</th><th class="right">审核${orderWord}</th><th class="right">提交${orderWord}</th><th class="right">负责群数</th><th class="right">人工纠错</th><th class="right">识别率</th><th class="right">平均停留</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td><strong>系统管理员</strong></td><td class="right">1</td><td class="right">1</td><td class="right">0</td><td class="right">0</td><td class="right"><span class="primary-text">100%</span></td><td class="right">141 秒</td><td><span class="tag green">正常</span></td></tr>
          <tr><td><strong>0623</strong></td><td class="right">4</td><td class="right">4</td><td class="right">16</td><td class="right">0</td><td class="right"><span class="primary-text">100%</span></td><td class="right">770 秒</td><td><span class="tag green">正常</span></td></tr>
        </tbody></table>
      </section>
      <p class="decision-foot">AI 智能订单助手 · ${agentName} 决策大屏 V1.0</p>
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

function getPurchaseDocType(group) {
  return group.purchaseDocType || "inbound";
}

function purchaseDocLabel(docType) {
  return docType === "order" ? "采购单录入" : "入库单录入";
}

function groupBoardTable(domain = "all") {
  const rows = domain === "all"
    ? groups
    : domain === "purchase-order"
      ? groups.filter((group) => getGroupDomain(group) === "purchase" && getPurchaseDocType(group) === "order")
      : domain === "purchase"
        ? groups.filter((group) => getGroupDomain(group) === "purchase" && getPurchaseDocType(group) === "inbound")
        : groups.filter((group) => getGroupDomain(group) === domain);

  return `
    <table>
      <thead><tr><th>群聊名称</th><th>群聊类型</th><th class="right">待处理</th><th class="right">已完成</th><th>机器人</th></tr></thead>
      <tbody>
        ${rows.map((g) => `<tr><td><strong>${g.name}</strong></td><td>${getGroupDomain(g) === "purchase" ? `<span class="tag ${getPurchaseDocType(g) === "order" ? "blue" : "green"}">${purchaseDocLabel(getPurchaseDocType(g))}</span>` : `<span class="tag blue">销售订单录入</span>`}</td><td class="right"><span class="tag gold">${g.pending}</span></td><td class="right">${12 - g.pending}</td><td>${g.bot}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
}

function entryPage(type) {
  const isSales = type === "sales";
  const isPurchaseOrder = type === "purchase-order";
  const mode = isSales ? state.chatMode : isPurchaseOrder ? state.purchaseOrderChatMode : state.purchaseChatMode;
  const title = isSales ? "销售订单录入" : isPurchaseOrder ? "采购单录入" : "入库单录入";
  const workspaceTitle = isSales ? "AI 录单" : isPurchaseOrder ? "AI 采购" : "AI 入库";
  const firstTabLabel = isSales ? "客户" : "供应链";
  const firstMode = isSales ? "customer" : "supplier";
  const searchPlaceholder = mode === "group"
    ? "搜索群聊名称、ID..."
    : isSales
      ? "搜索客户名称、ID..."
      : "搜索供应商名称、ID...";
  const emptyTitle = isSales ? "让录单 更简单" : isPurchaseOrder ? "让采购 更清晰" : "让入库 更简单";
  const emptyDesc = isSales
    ? "选择客户，发送文字 / 图片 / Excel / PDF"
    : isPurchaseOrder
      ? "选择供应商或采购单群，发送手写单 / 图片 / 微信截图"
      : "选择供应商或入库单群，发送文字 / 图片 / Excel / PDF";
  const emptySub = isSales ? "AI 自动识别商品信息并生成订单" : isPurchaseOrder ? "AI 自动识别商品和采购数量并生成采购单" : "AI 自动识别商品、数量和价格并生成入库单";
  const inputPlaceholder = mode === "group"
    ? "请先在左侧选择群聊..."
    : isSales
      ? "请先在左侧选择客户或群聊..."
      : isPurchaseOrder
        ? "请先选择供应商或采购单群..."
        : "请先选择供应商或入库单群...";
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
    const rows = groups.filter((item) => {
      if (type === "sales") return getGroupDomain(item) === "sales";
      if (type === "purchase-order") return getGroupDomain(item) === "purchase" && getPurchaseDocType(item) === "order";
      return getGroupDomain(item) === "purchase" && getPurchaseDocType(item) === "inbound";
    });
    return rows.map((item) => `
      <button class="entry-list-item" data-toast="已选择群聊：${item.name}">
        <strong>${item.name}</strong>
        <span>${item.purchaseBound === "-" ? item.salesBound : `${purchaseDocLabel(getPurchaseDocType(item))} · ${item.purchaseBound}`}</span>
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
  const isPurchaseOrder = type === "purchase-order";
  const title = isSales ? "销售订单审核" : isPurchaseOrder ? "采购单审核" : "入库单审核";
  const taskRows = isSales ? salesTasks : isPurchaseOrder ? purchaseOrderTasks : purchaseTasks;
  const tasks = filterTasks(taskRows, getStatus(type));
  const dateLabel = isSales ? "下单日期" : isPurchaseOrder ? "采购日期" : "入库日期";
  const ownerLabel = isSales ? "审核员" : isPurchaseOrder ? "录单员" : "入库员";
  const partyFilter = isSales || isPurchaseOrder
    ? `<label class="field compact"><span>${isSales ? "门店" : "供应商"}</span><select><option>全部</option><option>${isSales ? tasks[0]?.store || "天河鲜食店" : tasks[0]?.supplier || "海盛水产"}</option></select></label>`
    : "";
  const showGroupTab = isSales;
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
        <label class="field compact"><span>${dateLabel}</span><input value="2026-07-01"></label>
        ${partyFilter}
        <label class="field compact"><span>${ownerLabel}</span><select><option>全部</option><option>李娜</option><option>赵倩</option><option>周诚</option></select></label>
        <button class="btn" data-reset-filter="${type}">重置</button>
      </section>
      <section class="table-card">
        ${showGroupTab ? `
          <div class="tabs">
            <button class="subtab ${state.reviewTab === "list" ? "active" : ""}" data-review-tab="list">任务列表</button>
            <button class="subtab ${state.reviewTab === "groups" ? "active" : ""}" data-review-tab="groups">群聊视图</button>
          </div>
        ` : ""}
        <div style="margin-top:12px" class="table-scroll">
          ${showGroupTab && state.reviewTab === "groups" ? groupBoardTable(type) : reviewTable(tasks, type)}
        </div>
      </section>
    </div>
  `;
}

function getStatus(type) {
  if (type === "sales") return state.filters.salesStatus;
  if (type === "purchase-order") return state.filters.purchaseOrderStatus;
  return state.filters.purchaseStatus;
}

function filterTasks(tasks, status) {
  if (!status || status === "all") return tasks;
  return tasks.filter((task) => task.status === status);
}

function reviewTable(tasks, type = "sales") {
  if (type === "purchase-order") return purchaseOrderReviewTable(tasks);
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

function reviewerSelect(current, options = ["李娜", "赵倩", "周诚", "陈林", "系统管理员"]) {
  const list = [current, ...options.filter((item) => item !== current)];
  return `<select class="table-select" aria-label="选择审核员">${list.map((item) => `<option ${item === current ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function purchaseOrderReviewTable(tasks) {
  return `
    <table class="review-table">
      <thead><tr><th>状态</th><th>时间</th><th>供应商</th><th>群聊</th><th>原文</th><th class="right">识别商品数</th><th>录单员</th><th>操作</th></tr></thead>
      <tbody>
        ${tasks.map((task, i) => `
          <tr>
            <td>${statusTag(task.status)}</td>
            <td>07-01 ${String(8 + i).padStart(2, "0")}:32:18</td>
            <td>${task.supplier}</td>
            <td>${task.group}</td>
            <td>${task.raw}</td>
            <td class="right">${task.items || "-"}</td>
            <td>${reviewerSelect(task.auditor)}</td>
            <td><button class="text-btn" data-detail="${task.id}">查看</button><button class="text-btn" data-toast="已对 ${task.id} 重新执行 AI 识别">重识别</button><button class="text-btn muted" data-toast="演示环境未实际删除">删除</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function purchaseReviewTable(tasks) {
  return `
    <table class="review-table">
      <thead><tr><th>状态</th><th>时间</th><th>供应商</th><th>群聊</th><th>原文</th><th class="right">识别商品数</th><th>入库员</th><th>操作</th></tr></thead>
      <tbody>
        ${tasks.map((task, i) => `
          <tr>
            <td>${statusTag(task.status)}</td>
            <td>07-01 ${String(8 + i).padStart(2, "0")}:32:18</td>
            <td>${task.supplier}</td>
            <td>${task.group}</td>
            <td>${task.raw}</td>
            <td class="right">${task.items || "-"}</td>
            <td>${reviewerSelect(task.auditor)}</td>
            <td><button class="text-btn" data-detail="${task.id}">查看</button><button class="text-btn" data-toast="已对 ${task.id} 重新执行 AI 识别">重识别</button><button class="text-btn muted" data-toast="演示环境未实际删除">删除</button></td>
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
  { raw: "鲈鱼 80 条", name: "鲜活鲈鱼", qty: "80 条", price: "18.50", amount: "1480.00", remark: "到仓复称" },
  { raw: "基围虾 120 斤", name: "基围虾", qty: "120 斤", price: "39.00", amount: "4680.00", remark: "冰鲜称重" },
  { raw: "云南生菜 400 斤", name: "云南生菜", qty: "400 斤", price: "3.20", amount: "1280.00", remark: "" },
  { raw: "油麦菜 260 斤", name: "油麦菜", qty: "260 斤", price: "3.80", amount: "988.00", remark: "" },
  { raw: "鸡腿 30 件", name: "冻鸡腿", qty: "30 件", price: "126.00", amount: "3780.00", remark: "按件入库" },
  { raw: "猪五花 18 件", name: "猪五花", qty: "18 件", price: "238.00", amount: "4284.00", remark: "按件入库" },
];

function purchaseDetailPage() {
  const task = [...purchaseOrderTasks, ...purchaseTasks].find((item) => item.id === state.activeDetailId) || purchaseTasks[0];
  const isPurchaseOrder = task.id.startsWith("PO-");
  const supplierOptions = [task.supplier, ...suppliers.map((supplier) => supplier.name).filter((name) => name !== task.supplier)];
  const detailTitle = isPurchaseOrder ? "采购单详情" : "采购入库单详情";
  const confirmText = isPurchaseOrder ? "确认采购单" : "确认入库";
  const confirmToast = isPurchaseOrder ? "采购单已确认" : "采购入库单已确认入库";
  const detailKindLabel = isPurchaseOrder ? "采购单" : "入库单";
  const qtyLabel = isPurchaseOrder ? "采购数量" : "入库数";
  const priceLabel = "入库单价";
  const amountLabel = "入库金额";
  const remarkLabel = isPurchaseOrder ? "采购备注" : "备注";
  const detailLineActions = `
    <div class="detail-line-actions">
      <button class="btn" data-toast="已打开${detailKindLabel}自定义字段配置">自定义字段</button>
      <button class="btn" data-toast="已打开新建商品">新建商品</button>
      <button class="btn danger" data-toast="已删除选中的${detailKindLabel}商品">删除</button>
      <span class="detail-more-wrap">
        <button class="btn detail-more-btn">更多</button>
        <span class="detail-more-menu">
          <button class="text-btn" data-toast="已提交为补录单">提交为补录单</button>
        </span>
      </span>
      <button class="btn" data-toast="${detailKindLabel}明细已保存">保存</button>
    </div>
  `;
  const rowActions = `
    <button class="circle-btn plus" data-toast="已新增一行${detailKindLabel}商品" aria-label="新增${detailKindLabel}商品">+</button>
    <button class="circle-btn minus" data-toast="已删除当前${detailKindLabel}商品" aria-label="删除${detailKindLabel}商品">-</button>
  `;
  const manualPurchaseSection = isPurchaseOrder ? "" : `
        <section class="purchase-group manual-po-card manual-po-card-lite">
          <button class="btn primary" data-toast="请选择需要关联的采购单">手动选择采购单</button>
        </section>
  `;
  return `
    <div class="purchase-detail-page">
      <aside class="detail-source">
        <div class="detail-tabs">
          <button class="active">基本信息</button>
          <button>群聊消息</button>
        </div>
        <div class="detail-source-section">
          <div class="detail-section-title"><span></span><strong>原始文件</strong><span></span></div>
          <div class="source-file">
            <span class="file-icon">${iconSvg.edit}</span>
            <strong>${isPurchaseOrder ? "PO_20260701_091832_PURCHASE.pdf" : "SUP_20260701_091832_PURCHASE.pdf"}</strong>
            <button class="text-btn" data-toast="演示文件无需下载">下载</button>
          </div>
        </div>
        <div class="detail-source-section">
          <div class="detail-section-title"><span></span><strong>原始消息</strong><span></span></div>
          <pre class="raw-message">--- 2026-07-01 / ${task.group} ---
${task.raw}
${isPurchaseOrder ? "采购日期：2026-07-02" : "到货时间：今晚 20:00 前"}
供应商：${task.supplier}

--- ${detailKindLabel}补充说明 ---
${isPurchaseOrder ? "采购数量以原始输入为准，价格缺失时可留空待采购员确认。" : "需到仓复称，破损和缺货请在备注中标记。"}
${isPurchaseOrder ? "价格缺失时留待录单员确认，不自动关联其他单据。" : "价格按本周采购入库价执行，异常商品进入人工确认。"}</pre>
        </div>
      </aside>

      <main class="detail-main">
        <div class="detail-header">
          <div>
            <h2>${detailTitle} <span class="tag gold">${task.status}</span></h2>
            <div class="detail-meta">
              <span>供应商：${task.supplier}</span>
              <span>${isPurchaseOrder ? "录单员" : "入库员"}：${task.auditor}</span>
              <span>来源群聊：${task.group}</span>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn">保存修正</button>
            <button class="btn primary" data-toast="${confirmToast}">${confirmText}</button>
          </div>
        </div>

        ${manualPurchaseSection}

        <section class="purchase-group">
          <div class="purchase-group-head">
            <div><strong>AI 识别${detailKindLabel}明细</strong></div>
            ${detailLineActions}
          </div>
          <div class="purchase-form-row">
            <label>供应商 <select>${supplierOptions.map((name) => `<option>${name}</option>`).join("")}</select></label>
            <label class="wide">${remarkLabel} <input value="${isPurchaseOrder ? "价格待确认" : "到仓复称，异常短缺请备注"}"></label>
          </div>
          <div class="purchase-table-wrap">
            <table class="purchase-detail-table simple-purchase-table">
              <thead>
                ${isPurchaseOrder
                  ? `<tr><th>商品名称</th><th>${qtyLabel}</th><th>${remarkLabel}</th><th class="operation-col">操作</th></tr>`
                  : `<tr><th>原始输入</th><th>商品名称</th><th>${qtyLabel}</th><th>${priceLabel}</th><th>${amountLabel}</th><th>${remarkLabel}</th><th class="operation-col">操作</th></tr>`}
              </thead>
              <tbody>
                ${purchaseDetailItems.map((item) => `
                  ${isPurchaseOrder
                    ? `<tr><td><input value="${item.name}"></td><td><input class="qty-input" value="${item.qty}"></td><td><input class="remark-input" value="${item.remark || "按采购计划确认"}"></td><td class="detail-row-actions">${rowActions}</td></tr>`
                    : `<tr><td>${item.raw}</td><td><input value="${item.name}"></td><td><input class="qty-input" value="${item.qty}"></td><td>¥ <input class="price-input" value="${item.price}"></td><td>¥${item.amount}</td><td><input class="remark-input" value="${item.remark}"></td><td class="detail-row-actions">${rowActions}</td></tr>`}
                `).join("")}
              </tbody>
            </table>
          </div>
          <button class="add-line" data-toast="已新增一行${detailKindLabel}商品">+ 新增${detailKindLabel}商品</button>
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
  const visible = keyword ? rows.filter((row) => `${row.id}${row.name}${row.address || ""}${row.category || ""}${row.contact || ""}${row.phone || ""}`.includes(keyword)) : rows;
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
          ${isSales ? `<button class="btn" data-toast="${title}已刷新">刷新</button>` : ""}
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
    <table class="supplier-table">
      <thead><tr><th>供应商 ID</th><th>供应商名称</th><th>联系人</th><th>地址</th><th>电话</th><th>群绑定</th><th class="right">已同步 SKU</th><th>备注优先级</th></tr></thead>
      <tbody>${rows.map((row) => `<tr><td><code>${row.id}</code></td><td><strong>${row.name}</strong></td><td>${row.contact}</td><td>${row.address}</td><td>${row.phone}</td><td>${row.groups}</td><td class="right"><span class="tag green">${row.synced}</span></td><td>${priorityTags(row.priority)}</td></tr>`).join("")}</tbody>
    </table>
  `;
}

function priorityTags(items = ["采购备注", "SPU备注", "合并"]) {
  return `<span class="priority-tags">${items.map((item) => `<span class="pill blue">${item}</span>`).join("")}<button class="text-btn priority-edit" data-toast="备注优先级已打开编辑">✎</button></span>`;
}

function partyGroupPage(type) {
  const isSales = type === "sales";
  const partyLabel = isSales ? "客户" : "供应商";
  const ownerLabel = isSales ? "审核员" : "采购员";
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
                <td>${isSales ? `<span class="tag purple">${row.owner}</span>` : operatorSelect(row.owner)}</td>
                <td class="right"><span class="count-badge blue">${row.groups}</span></td>
                <td class="right"><span class="count-badge green">${row.parties}</span></td>
                <td>${isSales && !row.editable ? `<button class="text-btn" data-toast="已打开分组详情">查看</button>` : `<button class="text-btn" data-modal="${modalType}">编辑</button><button class="text-btn danger-text" data-toast="演示环境未实际删除">删除</button>`}</td>
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
  const ownerLabel = isSales ? "审核员" : "采购员";
  const partyRows = isSales ? customers : suppliers;
  const groupRows = groups.filter((group) => isSales ? group.purchaseBound === "-" : group.purchaseBound !== "-");
  return `
    <div class="group-modal-form">
      <label class="field"><span>${ownerLabel}</span><select><option>选择${ownerLabel}（操作员）</option><option>系统管理员</option><option>李娜</option><option>赵倩</option><option>xky_test</option></select></label>
      <label class="field"><span>分组名称</span><input placeholder="输入分组名称"></label>
      <div class="group-modal-grid">
        ${groupPickPanel("群聊", groupRows.map((item) => item.name), `搜索并添加群聊...`)}
        ${groupPickPanel(partyLabel, partyRows.map((item) => item.name), `搜索并添加${partyLabel}...`, isSales ? "不使用群聊录单的客户" : "不使用群聊录入的供应商")}
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

function operatorSelect(current) {
  const options = [current, "赵倩", "周诚", "陈林", "李娜", "系统管理员"].filter((item, index, list) => item && list.indexOf(item) === index);
  return `<select class="table-select group-owner-select" aria-label="选择采购员">${options.map((item) => `<option ${item === current ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function groupsPage(type) {
  const isSales = type === "sales";
  const rows = groups.filter((row) => isSales ? row.purchaseBound === "-" : row.purchaseBound !== "-");
  const orderGroupCount = rows.filter((row) => getPurchaseDocType(row) === "order").length;
  const inboundGroupCount = rows.filter((row) => getPurchaseDocType(row) === "inbound").length;
  return `
    <div class="page wide-page">
      ${!isSales ? `
        <section class="filters purchase-group-filter-bar">
          <label class="field compact"><span>群聊类型</span><select><option>全部</option><option>采购单录入</option><option>入库单录入</option></select></label>
          <label class="field group-search-field"><input placeholder="搜索群聊名称"></label>
        </section>
      ` : ""}
      <section class="table-card">
        <div class="toolbar"><strong>${isSales ? "销售群聊管理" : "采购群聊管理"}</strong><button class="btn" data-toast="群聊数据已刷新">刷新</button></div>
        <div class="stat-strip">
          <span>总群聊 <b>${rows.length}</b></span><span class="divider">|</span>
          <span>${isSales ? "已绑客户" : "已绑供应商"} <b>${rows.length}</b></span><span class="divider">|</span>
          ${!isSales ? `<span>采购单群 <b>${orderGroupCount}</b></span><span class="divider">|</span><span>入库单群 <b>${inboundGroupCount}</b></span><span class="divider">|</span>` : ""}
          <span>已禁言 <b>${rows.filter((row) => row.bot === "禁言").length}</b></span>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>群聊名称</th><th class="right">成员数</th>${!isSales ? "<th>群聊类型</th>" : ""}<th>${isSales ? "绑定客户" : "绑定供应商"}</th><th>操作员</th><th>机器人发言</th><th>下单时段</th><th>操作</th></tr></thead>
            <tbody>${rows.map((row) => `<tr><td><strong>${row.name}</strong></td><td class="right">${row.members}</td>${!isSales ? `<td><span class="tag ${getPurchaseDocType(row) === "order" ? "blue" : "green"}">${purchaseDocLabel(getPurchaseDocType(row))}</span></td>` : ""}<td>${isSales ? row.salesBound : row.purchaseBound}</td><td>${row.reviewer}</td><td><span class="tag ${row.bot === "正常" ? "green" : ""}">${row.bot}</span></td><td>${row.time}</td><td><button class="text-btn" data-group-detail="${escapeAttribute(row.name)}">详情</button></td></tr>`).join("")}</tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function promptsPage(type) {
  const isSales = type === "sales";
  const docType = isSales ? "sales" : state.purchaseDocTab;
  return `
    <div class="page wide-page">
      <section class="table-card">
        ${!isSales ? purchaseDocTabs() : ""}
        <div class="tabs">
          <button class="subtab ${state.promptTab === "customer" ? "active" : ""}" data-prompt-tab="customer">${isSales ? "客户提示词" : "供应商提示词"}</button>
          <button class="subtab ${state.promptTab === "system" ? "active" : ""}" data-prompt-tab="system">系统提示词</button>
        </div>
        ${state.promptTab === "customer" ? promptCustomerTab(type, docType) : promptSystemTab(type, docType)}
      </section>
    </div>
  `;
}

function groupDetailModal(group) {
  const linkedSuppliers = suppliers.slice(0, group.purchaseBound === "-" ? 1 : 3);
  const members = [
    { name: "吴经理", wx: "wx_hs_001", role: "供应商", supplier: "海盛水产" },
    { name: group.reviewer, wx: `wx_${group.reviewer}`, role: getPurchaseDocType(group) === "order" ? "采购员" : "入库员", supplier: "未绑定" },
    { name: "陈林", wx: "wx_buyer_chen", role: "采购员", supplier: "春田蔬菜基地" },
    { name: "赵倩", wx: "wx_inbound_zhao", role: "入库员", supplier: "海盛水产" },
  ];
  const rules = [
    { category: "水产海鲜", merge: "可合并", split: "按供应商拆分" },
    { category: "蔬菜", merge: "可合并", split: "按到货日期拆分" },
    { category: "肉禽冻品", merge: "不可合并", split: "按温区拆分" },
  ];
  return `
    <div class="group-detail">
      <div class="tabs group-detail-tabs">
        <button class="subtab active" data-group-detail-tab="suppliers">供应商列表</button>
        <button class="subtab" data-group-detail-tab="members">群成员</button>
        <button class="subtab" data-group-detail-tab="rules">拆单规则</button>
      </div>
      <section class="group-detail-panel active" data-group-detail-panel="suppliers">
        <table>
          <thead><tr><th>供应商名称</th><th>供应商 ID</th><th>操作</th></tr></thead>
          <tbody>${linkedSuppliers.map((supplier) => `<tr><td><strong>${supplier.name}</strong></td><td><code>${supplier.id}</code></td><td><button class="text-btn danger-text" data-toast="演示环境未实际删除供应商">删除</button></td></tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="group-detail-panel" data-group-detail-panel="members">
        <table>
          <thead><tr><th>成员名称</th><th>微信号</th><th>身份类型</th><th>绑定供应商</th></tr></thead>
          <tbody>${members.map((member) => `<tr><td><strong>${member.name}</strong></td><td>${member.wx}</td><td><span class="tag ${member.role === "供应商" ? "green" : member.role === "采购员" ? "blue" : "gold"}">${member.role}</span></td><td><select class="table-select"><option>${member.supplier}</option>${suppliers.map((supplier) => `<option>${supplier.name}</option>`).join("")}</select></td></tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="group-detail-panel" data-group-detail-panel="rules">
        <table>
          <thead><tr><th>商品品类</th><th>订单可合并</th><th>订单可拆分</th><th>操作</th></tr></thead>
          <tbody>${rules.map((rule) => `<tr><td><strong>${rule.category}</strong></td><td><select class="table-select"><option>${rule.merge}</option><option>可合并</option><option>不可合并</option></select></td><td><select class="table-select"><option>${rule.split}</option><option>按供应商拆分</option><option>按品类拆分</option><option>按温区拆分</option></select></td><td><button class="text-btn" data-toast="拆单规则已保存">保存</button></td></tr>`).join("")}</tbody>
        </table>
      </section>
    </div>
  `;
}

function purchaseDocTabs() {
  return `
    <div class="tabs doc-type-tabs">
      <button class="subtab ${state.purchaseDocTab === "order" ? "active" : ""}" data-purchase-doc-tab="order">采购单</button>
      <button class="subtab ${state.purchaseDocTab === "inbound" ? "active" : ""}" data-purchase-doc-tab="inbound">入库单</button>
    </div>
  `;
}

function promptCustomerTab(type, docType = "sales") {
  return promptTemplateManager(type, docType, "customer");
}

function promptSystemTab(type, docType = "sales") {
  return promptTemplateManager(type, docType, "system");
}

function promptTemplateManager(type, docType, scope) {
  const isSales = type === "sales";
  const isSystem = scope === "system";
  const isPurchaseOrder = docType === "order";
  const partyLabel = isSales ? "客户" : "供应商";
  const searchLabel = isSystem ? "搜索模板名称或 ID" : `搜索${partyLabel}名称或 ID`;
  const docLabel = isSales ? "订单" : isPurchaseOrder ? "采购单" : "入库单";
  const rows = promptTemplateRows({ isSales, isSystem, isPurchaseOrder, partyLabel, docLabel });
  return `
    <div class="prompt-page-shell">
      <div class="prompt-toolbar">
        <div class="prompt-total">总模板 <b>${isSystem ? 8 : 21}</b></div>
        <div class="prompt-actions">
          <label class="prompt-search"><input placeholder="${searchLabel}"></label>
          <button class="btn" data-modal="prompt-import">${iconSvg.config} 导入模板</button>
          <button class="btn" data-modal="prompt-ai">${iconSvg.prompt} AI 预识别</button>
          <button class="btn primary" data-modal="prompt-edit">新建模板</button>
        </div>
      </div>
      <div class="table-scroll prompt-table-scroll">
        <table class="prompt-table">
          <thead><tr><th>模板名称</th><th>类型</th><th>绑定${isSystem ? "范围" : partyLabel}</th><th>状态</th><th>Prompt 预览</th><th>更新时间</th><th>操作</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td><strong>${row.name}</strong></td>
                <td><span class="tag ${row.typeTone}">${row.type}</span></td>
                <td><span class="prompt-bound">${row.bound}</span></td>
                <td>
                  <label class="mini-switch">
                    <input type="checkbox" ${row.enabled ? "checked" : ""}>
                    <i></i>
                    <span>${row.enabled ? "启用" : "禁用"}</span>
                  </label>
                </td>
                <td><span class="prompt-preview">${row.preview}</span></td>
                <td>${row.updated}</td>
                <td><button class="text-btn" data-modal="prompt-edit">编辑</button><button class="text-btn muted" data-toast="演示环境未实际删除模板">删除</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function promptTemplateRows({ isSales, isSystem, isPurchaseOrder, partyLabel, docLabel }) {
  if (isSystem) {
    const systemType = "系统提示词";
    const domainLabel = isSales ? "销售订单录单" : isPurchaseOrder ? "采购单 Agent" : "入库单 Agent";
    return [
      { name: `默认${docLabel}系统提示词`, type: systemType, typeTone: "blue", bound: domainLabel, enabled: true, preview: `你是${domainLabel}，负责识别商品、数量、业务备注，并按审核规则输出结构化结果...`, updated: "2026-06-27 12:17" },
      { name: `${docLabel}表格解析规则`, type: systemType, typeTone: "blue", bound: "Excel / 图片 / PDF", enabled: true, preview: `优先识别有效表头，忽略合计行，保留${isPurchaseOrder ? "采购备注" : isSales ? "配送备注" : "入库备注"}...`, updated: "2026-06-25 16:50" },
      { name: "意图识别增强", type: "意图识别", typeTone: "gold", bound: domainLabel, enabled: true, preview: "判断当前消息是新增、修改、整单转换、取消还是仅聊天，不确定时进入人工审核...", updated: "2026-06-24 15:06" },
      { name: "异常兜底策略", type: "意图识别", typeTone: "gold", bound: "全部任务", enabled: false, preview: `无法确认${partyLabel}或商品时不自动创建，生成待审核任务并标注原因...`, updated: "2026-06-12 10:28" },
    ];
  }
  const defaultTarget = isSales ? "全部客户" : "全部供应商";
  const specialName = isSales ? "特殊模板格式" : isPurchaseOrder ? "采购单样式识别" : "入库单到货规则";
  const specialTarget = isSales ? "李四小学、桐乡市振东小学、张三超市、张三水果..." : "海盛水产、春田蔬菜基地、东升冻品、旺角粮油...";
  const preview = isSales
    ? "你是订单解析专家，请严格按照思维链步骤解析订单，确保输出准确、完整、格式统一..."
    : isPurchaseOrder
      ? "你是采购单解析专家，请提取供应商、商品名称、采购数量和采购备注，价格字段无需输出..."
      : "你是入库单解析专家，请识别供应商、商品、入库数量、到仓备注，异常价格交由人工确认...";
  return [
    { name: specialName, type: `${docLabel}解析`, typeTone: "blue", bound: specialTarget, enabled: true, preview, updated: "2026-06-27 12:17" },
    { name: isSales ? "乌鹏" : "海鲜采购群模板", type: `${docLabel}解析`, typeTone: "blue", bound: isSales ? "城隍阁、容桂渔人码头、桐乡市振东小学..." : "海盛水产、观麦大学、张三超市...", enabled: true, preview: `按${docLabel}业务口径识别商品、数量和备注，保留原始别名用于 AI 记忆沉淀...`, updated: "2026-06-27 11:41" },
    { name: `测试${docLabel}，特殊模板`, type: `${docLabel}解析`, typeTone: "blue", bound: defaultTarget, enabled: true, preview: "结构化输出商品明细，缺失项留空并进入审核，不自动补齐未知业务信息...", updated: "2026-06-27 11:32" },
    { name: "备注填商品", type: `${docLabel}解析`, typeTone: "blue", bound: specialTarget, enabled: true, preview: "备注中的商品名参与识别，商品备注和业务备注拆分保存，避免覆盖原始口径...", updated: "2026-06-25 16:50" },
    { name: "意图识别2", type: "意图识别", typeTone: "gold", bound: defaultTarget, enabled: false, preview: "先判断消息意图，再进入解析链路；非业务消息只沉淀上下文，不生成任务...", updated: "2026-06-24 15:06" },
    { name: "按分类顺序下单", type: `${docLabel}解析`, typeTone: "blue", bound: "观麦大学、李四小学、容桂渔人码头...", enabled: true, preview: "需要按照商品分类顺序进行下单，肉类、蔬菜类、水产类分别排序...", updated: "2026-06-12 10:28" },
  ];
}

function memoryPage(type) {
  const isSales = type === "sales";
  if (!isSales) return purchaseMemoryPage();
  const isPurchaseOrder = !isSales && state.purchaseDocTab === "order";
  const rows = isSales ? [
    ["修正记忆", "gold", "天河鲜食店", "小番茄", "圣女果", 23, "2026-07-01 10:12"],
    ["下单习惯", "blue", "江北食堂", "白菜一筐", "大白菜 30斤，备注按筐", 17, "2026-06-30 16:41"],
    ["群级记忆", "green", "华南餐饮订货群", "明早送", "默认配送日期为次日", 12, "2026-07-01 08:33"],
  ] : isPurchaseOrder ? [
    ["修正记忆", "gold", "海盛水产", "鲈鱼 100 条", "鲜活鲈鱼 100 条，价格待确认", 11, "2026-07-01 09:42"],
    ["采购习惯", "blue", "采购内部下单群", "明天采购", "采购日期默认次日", 8, "2026-06-30 16:18"],
    ["群级记忆", "green", "蔬菜采购群", "采购群", "默认生成采购单，不生成入库单", 9, "2026-07-01 08:33"],
  ] : [
    ["修正记忆", "gold", "海盛水产", "基围虾 120 斤", "基围虾 120 斤，入中心仓", 19, "2026-07-01 09:42"],
    ["入库习惯", "blue", "春田蔬菜基地", "油麦菜 260", "油麦菜 260 斤，默认一号冷库", 14, "2026-06-30 16:18"],
    ["群级记忆", "green", "海鲜供应商对接群", "今晚到", "默认入库日期为当日", 9, "2026-07-01 08:33"],
  ];
  return `
    <div class="page wide-page">
      <section class="table-card">
        ${!isSales ? purchaseDocTabs() : ""}
        <div class="toolbar"><strong>${isSales ? "销售订单录单AI记忆" : "采购录单AI记忆"}</strong><button class="btn" data-toast="记忆列表已刷新">刷新</button></div>
        <div class="stat-strip"><span>修正记忆 <b>${isSales ? 78 : isPurchaseOrder ? 32 : 50}</b></span><span class="divider">|</span><span>${isSales ? "下单习惯" : isPurchaseOrder ? "采购习惯" : "入库习惯"} <b>${isSales ? 34 : isPurchaseOrder ? 15 : 22}</b></span><span class="divider">|</span><span>群级记忆 <b>${isSales ? 11 : isPurchaseOrder ? 6 : 7}</b></span></div>
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

function purchaseMemoryPage() {
  const isPurchaseOrder = state.purchaseDocTab === "order";
  const partyRows = suppliers.map((supplier, index) => ({
    ...supplier,
    fix: [27, 29, 14, 8][index] ?? 3,
    habit: isPurchaseOrder ? [13, 41, 6, 1][index] ?? 0 : [8, 12, 4, 2][index] ?? 0,
    common: [223, 248, 193, 34][index] ?? 12,
    total: [339, 542, 230, 39][index] ?? 18,
    lastOrder: index === 3 ? "06-17 13:26" : "07-02 13:58",
    updated: index === 3 ? "06-17 13:26" : "07-02 13:58",
  }));
  const groupRows = groups.filter((group) => getGroupDomain(group) === "purchase" && getPurchaseDocType(group) === state.purchaseDocTab);
  return `
    <div class="page wide-page memory-page">
      <section class="table-card memory-card">
        ${purchaseDocTabs()}
        <div class="tabs memory-tabs">
          <button class="subtab ${state.memoryScope === "party" ? "active" : ""}" data-memory-scope="party">供应商记忆</button>
          <button class="subtab ${state.memoryScope === "group" ? "active" : ""}" data-memory-scope="group">群聊记忆</button>
        </div>
        ${state.memoryScope === "party" ? purchasePartyMemoryTable(partyRows, isPurchaseOrder) : purchaseGroupMemoryTable(groupRows)}
      </section>
    </div>
  `;
}

function purchasePartyMemoryTable(rows, isPurchaseOrder) {
  return `
    <div class="memory-toolbar">
      <label class="field"><input placeholder="按供应商名 / 供应商 ID 搜索"></label>
    </div>
    <div class="table-scroll">
      <table class="memory-table">
        <thead><tr><th>供应商 ID</th><th>供应商名称</th><th class="right">商品修正</th><th class="right">${isPurchaseOrder ? "下单习惯" : "入库习惯"}</th><th class="right">常购商品</th><th class="right">累计订单</th><th>最近下单</th><th>最近更新</th><th>操作</th></tr></thead>
        <tbody>${rows.map((row) => `
          <tr>
            <td><code>${row.id}</code></td>
            <td><strong>${row.name}</strong></td>
            <td class="right">${row.fix}</td>
            <td class="right">${row.habit}</td>
            <td class="right">${row.common}</td>
            <td class="right">${row.total}</td>
            <td>${row.lastOrder}</td>
            <td>${row.updated}</td>
            <td><button class="text-btn" data-modal="supplier-memory">查看详情</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function purchaseGroupMemoryTable(rows) {
  return `
    <div class="memory-toolbar">
      <label class="field"><input placeholder="按群聊名称搜索"></label>
      <button class="btn primary" data-modal="group-memory-map">新增映射</button>
    </div>
    <div class="table-scroll">
      <table class="memory-table">
        <thead><tr><th>群聊名称</th><th class="right">映射条目数</th><th>最近更新</th><th>操作</th></tr></thead>
        <tbody>${rows.map((row, index) => `
          <tr>
            <td><strong>${row.name}</strong></td>
            <td class="right">${16 - index}</td>
            <td>2026-07-02 10:${53 - index}</td>
            <td><button class="text-btn" data-modal="group-memory-detail" data-group-name="${escapeAttribute(row.name)}">查看详情</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function agentSettingsPage(type) {
  const isSales = type === "sales";
  const agentName = isSales ? "销售订单录单" : "采购录单";
  return `
    <div class="page wide-page">
      <section class="settings-workbench">
        <div class="tabs settings-tabs">
          <button class="subtab ${state.agentSettingsTab === "robots" ? "active" : ""}" data-agent-settings-tab="robots">机器人管理</button>
          <button class="subtab ${state.agentSettingsTab === "reply" ? "active" : ""}" data-agent-settings-tab="reply">回复设置</button>
          <button class="subtab ${state.agentSettingsTab === "notice" ? "active" : ""}" data-agent-settings-tab="notice">通知设置</button>
        </div>
        ${state.agentSettingsTab === "robots" ? agentRobotSettings(agentName, isSales) : state.agentSettingsTab === "reply" ? agentReplySettings(agentName, isSales) : agentNoticeSettings(agentName, isSales)}
      </section>
    </div>
  `;
}

function agentRobotSettings(agentName, isSales) {
  const robotName = isSales ? "销售录单机器人" : "接单助理2";
  return `
    <div class="agent-setting-pane">
      <div class="toolbar">
        <div class="stat-strip" style="margin:0"><span>绑定机器人 <b>1</b></span><span class="divider">|</span><span>在线 <b>1</b></span></div>
        <button class="btn" data-toast="机器人状态已刷新">刷新</button>
      </div>
      <div class="table-scroll">
        <table>
          <thead><tr><th>名称</th><th>类型</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr><td><strong>${robotName}</strong></td><td><span class="tag">微信</span></td><td><span class="online-dot"></span> 在线</td><td><button class="text-btn" data-toast="已打开机器人详情">详情</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function agentReplySettings(agentName, isSales) {
  const rows = isSales
    ? [
      ["订单已收到", "收到，识别中", false],
      ["新建订单", "已创建订单", false],
      ["修改订单", "收到，客户已改为：城东店", true],
      ["提交订单通知", "请核对城东店的订单", false],
    ]
    : [
      ["采购单已收到", "收到，正在识别采购单", false],
      ["入库单已收到", "收到，正在识别入库单", false],
      ["整单转换", "收到，已更新单据", false],
      ["提交审核通知", "请核对供应商单据", true],
    ];
  return `
    <div class="agent-setting-pane">
      <div class="info-banner">共享租户不支持自定义回复内容，仅可控制回复/通知开关和商品明细显示。系统将使用内置默认文案发送。</div>
      ${rows.map((row) => `
        <section class="reply-card">
          <div class="reply-card-head">
            <strong>${row[0]}</strong>
            <span><span>${row[2] ? "开启通知" : "开启回复"}</span><label class="switch"><input type="checkbox" ${row[2] ? "" : "checked"}><i></i></label><button class="btn">恢复默认</button></span>
          </div>
          <input class="reply-input" value="默认文案示例：${row[1]}">
          <label class="check-row"><span>显示商品明细</span><label class="switch"><input type="checkbox" ${row[2] ? "" : "checked"}><i></i></label></label>
        </section>
      `).join("")}
      <button class="btn primary full-save" data-toast="${agentName} 回复设置已保存">保存</button>
    </div>
  `;
}

function agentNoticeSettings(agentName, isSales) {
  return `
    <div class="agent-setting-pane">
      <section class="notice-card">
        <h3>通知群</h3>
        <p>当前通知群：<strong>${isSales ? "销售测试群" : "欧阳测试群"}</strong></p>
      </section>
      <section class="notice-card">
        <h3>每日播报</h3>
        <div class="notice-row"><span>开启每日播报</span><label class="switch"><input type="checkbox" checked><i></i></label></div>
        <div class="notice-row"><span>发送时间</span><input value="03:55"><em>每天 03:55 自动发送昨日统计</em></div>
        <div class="notice-actions"><button class="btn primary" data-toast="${agentName} 通知设置已保存">保存</button><button class="btn" data-toast="已立即发送今日播报">立即发送</button></div>
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

function memberManagementPage() {
  const members = [
    { username: "0623", name: "0623", role: "操作员", status: "启用", actions: true },
    { username: "aiceshi", name: "系统管理员", role: "管理员", status: "启用", actions: false },
    { username: "lcf", name: "lcf", role: "操作员", status: "启用", actions: true },
    { username: "lanxiu", name: "oywj", role: "操作员", status: "启用", actions: true },
  ];
  return `
    <div class="page wide-page tenant-config-page">
      <section class="table-card member-management-card">
        <div class="tenant-config-tabs">
          <button class="subtab active">成员管理</button>
        </div>
        <div class="toolbar member-toolbar">
          <div class="stat-strip" style="margin:0"><span>总操作员 <b>${members.length}</b></span><span class="divider">|</span><span>已启用 <b>${members.filter((item) => item.status === "启用").length}</b></span></div>
          <button class="btn primary" data-modal="operator">新增成员</button>
        </div>
        <div class="table-scroll">
          <table class="member-table">
            <thead><tr><th>用户名</th><th>姓名</th><th>角色</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              ${members.map((member) => `<tr>
                <td>${member.username}</td>
                <td>${member.name}</td>
                <td><span class="tag ${member.role === "管理员" ? "blue" : ""}">${member.role}</span></td>
                <td><span class="tag green">${member.status}</span></td>
                <td>${member.actions ? `<button class="text-btn" data-toast="已打开改密码弹窗">改密码</button><button class="text-btn danger-text" data-toast="演示环境未实际删除成员">删除</button>` : ""}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function quotaManagementPage() {
  return `
    <div class="page wide-page quota-management-page">
      <section class="table-card quota-console-card">
        <div class="tabs quota-tabs">
          <button class="subtab active">录单额度</button>
        </div>
        <section class="quota-available-panel">
          <div class="card-header">
            <h3>可用额度 <span class="pill blue">共享主租户池</span></h3>
            <button class="text-btn blue-text" data-toast="已打开充值历史">◷ 充值历史</button>
          </div>
          <div class="quota-available-grid">
            <div>
              <span class="muted">剩余额度</span>
              <strong class="quota-big blue-text">99,330</strong>
              <div class="quota-pair"><span>累计充值</span><b class="green-text">101,170</b></div>
            </div>
            <div>
              <span class="muted">预计可用天数（近 7 天日均 14.8 行/天）</span>
              <strong class="quota-big blue-text">&gt; 999天</strong>
              <div class="quota-pair"><span>累计消耗</span><b class="red-text">1,840</b></div>
            </div>
          </div>
        </section>
        <section class="quota-section">
          <div class="ops-filter-bar">
            <strong>时间范围</strong>
            <div class="segmented"><button class="active">今天</button><button>昨天</button><button>本周</button><button>本月</button><button>自定义</button></div>
          </div>
        </section>
        <section class="quota-section">
          <h3>期间消耗合计</h3>
          <div class="quota-period-grid">
            <div><span class="muted">扣额行数</span><strong>0</strong></div>
            <div><span class="muted">提交订单数</span><strong>0</strong></div>
          </div>
        </section>
        <section class="quota-section">
          <div class="card-header">
            <h3>消耗明细</h3>
            <button class="btn muted" disabled>⇩ 导出 Excel</button>
          </div>
          <div class="table-scroll">
            <table>
              <thead><tr><th>提交时间</th><th>任务 ID</th><th>订单号</th><th>审核员</th><th>客户</th><th>扣额行数</th><th>订单行数</th><th>状态</th></tr></thead>
              <tbody><tr><td colspan="8"><div class="quota-empty">暂无数据</div></td></tr></tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  `;
}

function roleSettings() {
  return `
    <div style="margin-top:16px" class="grid two">
      <div class="card"><h3>管理员</h3><p>可访问首页、销售订单录单、采购录单、租户公共设置，以及各 Agent 内部的提示词和记忆配置。</p><div class="agent-menus"><span class="pill blue">全功能访问</span><span class="pill">配置管理</span></div></div>
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
      <div class="card"><h3>消耗记录</h3><p>销售订单录单与采购录单共用消耗池，记录按业务域打标，账单归集在租户级。</p><div class="agent-menus"><span class="pill blue">共享额度</span><span class="pill">按业务打标</span></div></div>
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
      if (id?.startsWith("PI-") || id?.startsWith("PO-")) {
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
        else if (root.dataset.segmentRoot === "purchase-order") state.purchaseOrderChatMode = button.dataset.mode;
        else state.purchaseChatMode = button.dataset.mode;
        renderContent();
      };
    });
  });
  document.querySelectorAll("[data-status-filter]").forEach((select) => {
    select.onchange = () => {
      if (select.dataset.statusFilter === "sales") state.filters.salesStatus = select.value;
      else if (select.dataset.statusFilter === "purchase-order") state.filters.purchaseOrderStatus = select.value;
      else state.filters.purchaseStatus = select.value;
      renderContent();
    };
  });
  document.querySelectorAll("[data-reset-filter]").forEach((button) => {
    button.onclick = () => {
      if (button.dataset.resetFilter === "sales") state.filters.salesStatus = "all";
      else if (button.dataset.resetFilter === "purchase-order") state.filters.purchaseOrderStatus = "all";
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
  document.querySelectorAll("[data-purchase-home-task]").forEach((button) => {
    button.onclick = () => {
      state.purchaseHomeTaskType = button.dataset.purchaseHomeTask;
      renderContent();
    };
  });
  document.querySelectorAll("[data-purchase-home-group]").forEach((button) => {
    button.onclick = () => {
      state.purchaseHomeGroupType = button.dataset.purchaseHomeGroup;
      renderContent();
    };
  });
  document.querySelectorAll("[data-prompt-tab]").forEach((button) => {
    button.onclick = () => {
      state.promptTab = button.dataset.promptTab;
      renderContent();
    };
  });
  document.querySelectorAll("[data-purchase-doc-tab]").forEach((button) => {
    button.onclick = () => {
      state.purchaseDocTab = button.dataset.purchaseDocTab;
      renderContent();
    };
  });
  document.querySelectorAll("[data-stats-role]").forEach((button) => {
    button.onclick = () => {
      state.purchaseStatsRole = button.dataset.statsRole;
      renderContent();
    };
  });
  document.querySelectorAll("[data-decision-role]").forEach((select) => {
    select.onchange = () => {
      state.purchaseDecisionRole = select.value;
      renderContent();
    };
  });
  document.querySelectorAll("[data-memory-scope]").forEach((button) => {
    button.onclick = () => {
      state.memoryScope = button.dataset.memoryScope;
      renderContent();
    };
  });
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.onclick = () => {
      state.settingsTab = button.dataset.settingsTab;
      renderContent();
    };
  });
  document.querySelectorAll("[data-agent-settings-tab]").forEach((button) => {
    button.onclick = () => {
      state.agentSettingsTab = button.dataset.agentSettingsTab;
      renderContent();
    };
  });
  bindModalLaunchers(document);
  document.querySelectorAll("[data-group-detail]").forEach((button) => {
    button.onclick = () => {
      const group = groups.find((item) => item.name === button.dataset.groupDetail) || groups[0];
      openModal(`${group.name} - 详情`, groupDetailModal(group), { wide: true });
    };
  });
}

function bindModalLaunchers(root) {
  root.querySelectorAll("[data-modal]").forEach((button) => {
    button.onclick = () => openModalByType(button.dataset.modal, button);
  });
}

function openModalByType(type, button) {
  if (type === "customer-group" || type === "supplier-group") {
    openModal(type === "customer-group" ? "新建客户分组" : "新建供应商分组", groupBindingModal(type), { wide: true });
    return;
  }
  if (type === "supplier-memory") {
    openModal("张三水果（S3866320） - 供应商记忆", supplierMemoryDetail(), { drawer: true, hideFooter: true });
    return;
  }
  if (type === "supplier-memory-edit") {
    openModal("新增修正（供应商级）", supplierMemoryEditModal());
    return;
  }
  if (type === "group-memory-detail") {
    const groupName = button?.dataset.groupName || "AI录单测试群-BD";
    openModal(`${groupName} - 群聊记忆`, groupMemoryDetail(), { drawer: true, hideFooter: true });
    return;
  }
  if (type === "group-memory-map") {
    openModal("编辑群聊记忆映射", groupMemoryModal());
    return;
  }
  if (type === "prompt-import") {
    openModal("从模板库导入", promptImportModal(), { wide: true, hideFooter: true });
    return;
  }
  if (type === "prompt-ai") {
    openModal("AI 预识别", promptAiPreviewModal(), { wide: true, hideFooter: true });
    return;
  }
  if (type === "prompt-edit") {
    openModal("编辑 Prompt 模板", promptEditModal(), { wide: true, hideFooter: true });
    return;
  }
  if (type === "operator") {
    openModal("新增成员", operatorModal(), { saveText: "确认" });
    return;
  }
  const title = type === "prompt" ? "编辑 Prompt 模板" : type === "operator" ? "新增成员" : "AI 记忆详情";
  openModal(title, type === "operator" ? operatorModal() : type === "prompt" ? promptModal() : memoryModal());
}

function sendChat(type) {
  const input = document.getElementById(`${type}Input`);
  const value = input.value.trim();
  if (!value) {
    toast("请输入录单内容");
    return;
  }
  chatMessages[type].push({ role: "user", text: value });
  chatMessages[type].push({ role: "assistant", text: type === "sales" ? "已解析消息并生成新的待审核销售订单。" : type === "purchase-order" ? "已解析消息并生成新的待审核采购单。" : "已解析消息并生成新的待审核入库单。" });
  input.value = "";
  renderContent();
  toast("消息已发送，Agent 已生成待审核单据");
}

function detailModal(id) {
  return `
    <p><strong>单据编号：</strong>${id}</p>
    <p><strong>AI 解析流程：</strong>意图识别 → 上下文构建 → AI 解析订单 → 结果校验 → 执行下单</p>
    <div class="table-scroll">${reviewTable([...salesTasks, ...purchaseOrderTasks, ...purchaseTasks].filter((task) => task.id === id), id?.startsWith("PO-") ? "purchase-order" : "sales")}</div>
  `;
}

function promptModal() {
  return `
    <label class="field" style="width:100%;margin-bottom:12px"><span>模板名称</span><input value="默认系统提示词模板"></label>
    <label class="field" style="width:100%;margin-bottom:12px"><span>绑定供应商</span><select><option>全部供应商</option>${suppliers.map((supplier) => `<option>${supplier.name}</option>`).join("")}</select></label>
    <label class="check-row" style="margin-bottom:12px"><input type="checkbox" checked> 保存时同步更新绑定供应商信息</label>
    <textarea style="min-height:220px">请将聊天内容解析为结构化商品明细，保留业务备注，无法确认的商品进入人工审核。</textarea>
  `;
}

function promptImportModal() {
  const rows = [
    ["分单", "分单规则", "适用于订单分单", "订单拆分规则（通用）- 按供应商、品类或到货批次拆分..."],
    ["竖向识别", "竖向识别", "适用于需要竖向识别的订单", "# 竖向识别规则（通用）- 将竖排商品转换为标准明细..."],
    ["横向识别", "横向识别", "适用于需要横向识别的订单", "# 横向识别规则（通用）- 商品、数量、备注横向展开..."],
    ["数量读取", "数量读取", "适用于数量识别不清的内容", "# 数量读取规则（通用）- 识别斤、件、箱等单位..."],
    ["合单规则", "合单规则", "适用于需要合单的订单", "# 订单合并规则（通用）- 同供应商同到货日期可合并..."],
    ["门店/日期识别", "门店/日期", "适用于识别门店于日期", "# 门店与日期识别规则（通用）- 提取来源与交付时间..."],
  ];
  return `
    <div class="template-library-modal">
      <div class="template-modal-tools">
        <input placeholder="搜索名称、描述、分类">
        <select><option>全部分类</option><option>分单规则</option><option>数量读取</option><option>合单规则</option></select>
      </div>
      <div class="table-scroll template-library-scroll">
        <table class="template-library-table">
          <thead><tr><th>模板名称</th><th>分类</th><th>描述</th><th>内容预览</th><th>操作</th></tr></thead>
          <tbody>${rows.map((row) => `
            <tr>
              <td><strong>${row[0]}</strong></td>
              <td><span class="tag blue">${row[1]}</span></td>
              <td>${row[2]}</td>
              <td><span class="prompt-preview">${row[3]}</span></td>
              <td><button class="text-btn" data-toast="模板已导入到当前提示词列表">导入</button></td>
            </tr>
          `).join("")}</tbody>
        </table>
      </div>
    </div>
  `;
}

function promptAiPreviewModal() {
  return `
    <div class="ai-preview-modal">
      <h3>Step 1：输入订单样例</h3>
      <div class="ai-preview-tabs"><button class="active">粘贴文本</button><button>上传文件</button></div>
      <textarea class="ai-example-input" placeholder="例如：&#10;土豆 5斤&#10;白菜 3斤&#10;西红柿 2斤&#10;..."></textarea>
      <h3>补充要求（可选）</h3>
      <textarea class="ai-extra-input" placeholder="描述你对识别这个订单的特殊要求，例如：&#10;- 这个客户喜欢把数量写在品名左边的格子里&#10;- 这个供应商的单子只提取“合家康”列的商品"></textarea>
      <h3>Step 2：选择需要关注的维度（多选）</h3>
      <div class="ai-dimension-list">
        ${["分单", "竖向识别（生成）", "横向识别（生成）", "数量识别", "合单（生成）", "门店/日期", "通用"].map((item) => `<label><input type="checkbox"> ${item}</label>`).join("")}
      </div>
      <button class="btn primary ai-generate-btn" data-toast="已根据样例生成提示词">⚡ 生成提示词</button>
    </div>
  `;
}

function promptEditModal() {
  const docLabel = state.purchaseDocTab === "inbound" ? "入库单解析（文本/图片识别）" : "采购单解析（文本/图片识别）";
  const tags = ["海盛水产（S20011）", "春田蔬菜基地（S20018）", "岭南肉禽（S20022）", "北仓调味品（S20031）", "观麦大学（S3877821）", "张三超市（S3866322）", "张三水果（S3866320）", "东升冻品（S20041）", "旺角粮油（S20052）"];
  return `
    <div class="prompt-edit-modal">
      <label class="prompt-edit-row required"><span>模板名称：</span><input value="特殊模板格式"></label>
      <label class="prompt-edit-row required"><span>模板类型：</span><select disabled><option>${docLabel}</option></select></label>
      <div class="prompt-edit-row"><span>启用状态：</span><label class="mini-switch prompt-big-switch"><input type="checkbox" checked><i></i><span>启用</span></label></div>
      <label class="prompt-edit-row"><span>按群聊绑定：</span><select><option>按群聊批量绑定供应商（可选）</option><option>采购内部下单群</option><option>海鲜供应商对接群</option><option>蔬菜采购群</option></select></label>
      <div class="prompt-edit-row prompt-tag-row">
        <span>绑定供应商：</span>
        <div class="tag-select-box">
          ${tags.map((item) => `<span class="select-tag">${item}<button data-toast="已移除绑定供应商">×</button></span>`).join("")}
          <span class="tag-select-caret">⌄</span>
        </div>
        <small>可选择多个供应商共用此模板，留空则对该商户全部供应商生效</small>
      </div>
      <label class="prompt-edit-row required prompt-textarea-row">
        <span>自定义追加 Prompt：</span>
        <textarea>### **步骤0：全局判断与预处理**
- 识别订单整体为**单列表格**，无多列竖排结构。所有商品条目均位于同一连续列中。
- 忽略所有完全空白的行。忽略重复的、非当前订单主体的表头区域。
- 采购单中优先提取“物料编码”、“物料名称”、“采购单位”、“采购数量”等字段，备注保留为采购备注。

### **步骤1：版式与列结构解析（竖读规则）**
- **列数判断**：本订单为主流**单列明细**表格，商品信息横向展开。
- **行结构**：每个商品占据一行，该行内包含所有关键字段。必须**按行解析，禁止跨行配对**。</textarea>
        <small>此内容将追加到系统基础 Prompt 之后，不会覆盖核心解析逻辑</small>
      </label>
      <div class="prompt-edit-footer"><button class="btn" data-close-modal>取消</button><button class="btn primary" data-toast="Prompt 模板已保存">保存</button></div>
    </div>
  `;
}

function supplierMemoryDetail() {
  const fixRows = [
    { raw: "五花肉切片", match: "鲜五花肉（斤）", id: "D7750423", hits: 2, status: "生效", source: "自动(旧)", updated: "04-28 00:53" },
    { raw: "前上肉", match: "猪带皮二刀肉（斤）", id: "D7750419", hits: 2, status: "生效", source: "自动(旧)", updated: "04-29 18:37" },
    { raw: "去皮肉末", match: "鲜三层肉沫（斤）", id: "D7750410", hits: 2, status: "生效", source: "自动(旧)", updated: "04-28 19:33" },
    { raw: "圆生菜", match: "生菜（斤）", id: "D7750034", hits: 2, status: "生效", source: "自动(旧)", updated: "04-29 18:37" },
    { raw: "小豆饼", match: "白豆腐干（斤）", id: "D7750138", hits: 2, status: "生效", source: "自动(旧)", updated: "04-29 18:37" },
    { raw: "猪肉", match: "鲜猪肉丝（斤）", id: "D7750405", hits: 1, status: "草稿", source: "文本", updated: "05-02 10:24" },
  ];
  const habitRows = [
    ["下单习惯", "上午消息默认当天采购，晚间消息默认次日采购", 13, "07-02 13:58"],
    ["备注规则", "出现“老板要”时保留为采购备注，不参与商品名匹配", 6, "06-28 18:10"],
    ["单位习惯", "未写单位的肉类默认按斤，冻品默认按件", 11, "06-24 15:06"],
  ];
  const commonRows = [
    ["鲜五花肉", "斤", 223, "07-02 13:58"],
    ["生菜", "斤", 97, "06-29 18:37"],
    ["大白菜", "公斤", 88, "06-25 16:50"],
  ];
  return `
    <div class="memory-detail">
      <div class="tabs memory-detail-tabs">
        <button class="subtab active" data-memory-detail-tab="fix">商品修正</button>
        <button class="subtab" data-memory-detail-tab="habit">下单习惯</button>
        <button class="subtab" data-memory-detail-tab="common">常购商品</button>
      </div>
      <section class="memory-detail-panel active" data-memory-detail-panel="fix">
        <div class="memory-detail-toolbar"><button class="btn primary" data-modal="supplier-memory-edit">＋ 新增商品修正</button></div>
        <table class="memory-detail-table">
          <thead><tr><th>原始输入</th><th>匹配商品</th><th class="right">命中</th><th>状态</th><th>来源</th><th>更新时间</th><th>操作</th></tr></thead>
          <tbody>${fixRows.map((row) => `
            <tr>
              <td><strong>${row.raw}</strong></td>
              <td><strong>${row.match}</strong><small>${row.id}</small></td>
              <td class="right">${row.hits}</td>
              <td><span class="tag ${row.status === "生效" ? "green" : "gold"}">${row.status}</span></td>
              <td><span class="tag ${row.source === "文本" ? "blue" : ""}">${row.source}</span></td>
              <td>${row.updated}</td>
              <td><button class="text-btn" data-toast="已打开商品修正详情">详情</button><button class="text-btn" data-modal="supplier-memory-edit">编辑</button><button class="text-btn muted" data-toast="演示环境未实际删除修正">删除</button></td>
            </tr>
          `).join("")}</tbody>
        </table>
      </section>
      <section class="memory-detail-panel" data-memory-detail-panel="habit">
        <table class="memory-detail-table">
          <thead><tr><th>类型</th><th>规则内容</th><th class="right">命中次数</th><th>最近更新</th><th>操作</th></tr></thead>
          <tbody>${habitRows.map((row) => `<tr><td><span class="tag blue">${row[0]}</span></td><td><strong>${row[1]}</strong></td><td class="right">${row[2]}</td><td>${row[3]}</td><td><button class="text-btn" data-toast="习惯规则已保存">编辑</button></td></tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="memory-detail-panel" data-memory-detail-panel="common">
        <table class="memory-detail-table">
          <thead><tr><th>商品名称</th><th>默认单位</th><th class="right">累计订单</th><th>最近更新</th><th>操作</th></tr></thead>
          <tbody>${commonRows.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td class="right">${row[2]}</td><td>${row[3]}</td><td><button class="text-btn" data-toast="常购商品已更新">编辑</button></td></tr>`).join("")}</tbody>
        </table>
      </section>
    </div>
  `;
}

function supplierMemoryEditModal() {
  return `
    <div class="memory-edit-form">
      <div class="form-note">所属供应商：<span class="tag green">张三水果</span></div>
      <label class="field required"><span>供应商原始输入</span><input placeholder="例如：白才"></label>
      <label class="field required"><span>目标商品</span><input placeholder="搜索该供应商可见商品"></label>
      <label class="field"><span>目标单位</span><input placeholder="例如：斤"></label>
    </div>
  `;
}

function groupMemoryDetail() {
  const rows = [
    ["店名", "李四小学", "小水幼儿", "05-11 17:50"],
    ["店名", "张三超市", "张三猪肉铺", "07-02 10:53"],
    ["文件名", "观麦大学", "AI表格导入.xlsx", "06-08 14:38"],
    ["店名", "张三大排档", "张三", "06-08 15:27"],
    ["店名", "观麦大学", "深圳大学", "06-08 15:49"],
    ["店名", "张三水果", "第三包老区-白享", "05-27 15:09"],
    ["店名", "桐乡市振东小学", "东北商贸", "06-27 14:30"],
  ];
  return `
    <div class="group-memory-detail">
      <div class="memory-detail-toolbar"><button class="btn primary" data-modal="group-memory-map">＋ 新增映射</button></div>
      <table class="memory-detail-table">
        <thead><tr><th>类型</th><th>→ 供应商</th><th>原始名</th><th>更新时间</th><th>操作</th></tr></thead>
        <tbody>${rows.map((row) => `
          <tr>
            <td><span class="tag ${row[0] === "文件名" ? "green" : "blue"}">${row[0]}</span></td>
            <td><strong>${row[1]}</strong></td>
            <td><strong>${row[2]}</strong></td>
            <td>${row[3]}</td>
            <td><button class="text-btn" data-modal="group-memory-map">编辑</button><button class="text-btn muted" data-toast="演示环境未实际删除映射">删除</button></td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function groupMemoryModal() {
  return `
    <div class="memory-edit-form">
      <label class="field required"><span>映射类型</span><select><option>店名映射</option><option>文件名映射</option><option>Sheet 名映射</option></select></label>
      <label class="field required"><span>原始名</span><input value="小水幼儿" placeholder="LLM 识别到的店名 / 文件名 / Sheet名"></label>
      <label class="field required"><span>供应商</span><select>${suppliers.map((supplier) => `<option>${supplier.name} (${supplier.id})</option>`).join("")}</select></label>
      <p class="form-help">映射类型 / 原始名是 unique key，编辑时不能修改；如需更换请删除后新建。</p>
    </div>
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
    <div class="member-modal-form">
      <label class="field required"><span>姓名：</span><input placeholder="请输入姓名" autofocus></label>
      <label class="field required"><span>用户名：</span><input value="aiceshi"></label>
      <label class="field required"><span>密码：</span><span class="password-input"><input type="password" value="123456"><button class="text-btn" type="button">⊘</button></span></label>
      <label class="field required"><span>成员角色：</span><select><option>录单员</option><option>采购员</option><option>入库员</option></select></label>
    </div>
  `;
}

function openModal(title, body, options = {}) {
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-mask ${options.drawer ? "drawer-mask" : ""}">
      <div class="modal ${options.wide ? "modal-wide" : ""} ${options.drawer ? "modal-drawer" : ""}">
        <div class="modal-head"><strong>${title}</strong><button class="text-btn" data-close-modal>×</button></div>
        <div class="modal-body">${body}</div>
        ${options.hideFooter ? "" : `
          <div class="modal-foot">
            <button class="btn" data-close-modal>${options.hideSave ? "关闭" : "取消"}</button>
            ${options.hideSave ? "" : `<button class="btn primary" data-save-modal>${options.saveText || "保存"}</button>`}
          </div>
        `}
      </div>
    </div>
  `;
  document.querySelectorAll("#modalRoot [data-toast]").forEach((el) => {
    el.onclick = () => toast(el.dataset.toast);
  });
  bindModalLaunchers(document.getElementById("modalRoot"));
  bindGroupDetailTabs();
  bindMemoryDetailTabs();
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.onclick = closeModal);
  const saveButton = document.querySelector("[data-save-modal]");
  if (saveButton) {
    saveButton.onclick = () => {
      closeModal();
      toast("已保存演示数据");
    };
  }
}

function bindGroupDetailTabs() {
  const modalRoot = document.getElementById("modalRoot");
  modalRoot.querySelectorAll("[data-group-detail-tab]").forEach((button) => {
    button.onclick = () => {
      const tab = button.dataset.groupDetailTab;
      modalRoot.querySelectorAll("[data-group-detail-tab]").forEach((item) => item.classList.toggle("active", item === button));
      modalRoot.querySelectorAll("[data-group-detail-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.groupDetailPanel === tab);
      });
    };
  });
}

function bindMemoryDetailTabs() {
  const modalRoot = document.getElementById("modalRoot");
  modalRoot.querySelectorAll("[data-memory-detail-tab]").forEach((button) => {
    button.onclick = () => {
      const tab = button.dataset.memoryDetailTab;
      modalRoot.querySelectorAll("[data-memory-detail-tab]").forEach((item) => item.classList.toggle("active", item === button));
      modalRoot.querySelectorAll("[data-memory-detail-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.memoryDetailPanel === tab);
      });
    };
  });
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
