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
  purchaseCalcPriorityLevel: "default",
  purchaseCustomCalcPriority: "采购数优先",
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
  "purchase-entry": { label: "采购入库单录入", module: "purchase", title: "采购录单" },
  "purchase-review": { label: "采购入库单审核", module: "purchase", title: "采购录单" },
  "purchase-statistics": { label: "统计", tabLabel: "采购统计", module: "purchase", title: "采购录单" },
  "purchase-decision-screen": { label: "决策大屏", tabLabel: "采购决策大屏", module: "purchase", title: "采购录单" },
  "purchase-detail": { label: "采购入库单详情", module: "purchase", title: "采购录单" },
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

const hiddenRoutes = new Set(["purchase-decision-screen", "purchase-supplier-groups"]);

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
    { key: "purchase-entry", label: "采购入库单录入", icon: "edit" },
    { key: "purchase-review", label: "采购入库单审核", icon: "review" },
    { key: "purchase-statistics", label: "统计", icon: "stats" },
    { key: "purchase-suppliers", label: "供应商管理", icon: "supplier" },
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
    label: "采购入库单",
    icon: "purchase",
    items: [
      { key: "purchase-entry", label: "采购入库单录入" },
      { key: "purchase-review", label: "采购入库单审核" },
    ],
  },
  { label: "统计", icon: "stats", items: [{ key: "purchase-statistics", label: "统计" }] },
  {
    label: "供应商与群聊",
    icon: "supplier",
    items: [
      { key: "purchase-suppliers", label: "供应商管理" },
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
  {
    id: "PI-20260701-010",
    scenario: "未关联采购单",
    status: "待审核",
    supplier: "北仓调味品",
    group: "干调供应商入库群",
    store: "干货仓",
    raw: "临采到货：生抽 20 箱，白砂糖 10 袋，采购单还未同步",
    items: 2,
    order: "-",
    auditor: "陈林",
    warehouse: "干货仓",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-BC-0701-TEMP",
    buyer: "陈林",
    linkedPurchaseOrderIds: [],
    gmInboundNo: "",
    canSubmit: true,
    permission: "可操作",
    detailItems: [
      { category: "干调", raw: "生抽 20 箱", name: "生抽", qty: "20 箱", purchaseQty: 20, receivedQty: 20, unit: "箱", price: "42.00", amount: "840.00", remark: "采购单待同步", spu: "生抽", code: "SPU-D-4101" },
      { category: "干调", raw: "白砂糖 10 袋", name: "白砂糖", qty: "10 袋", purchaseQty: 10, receivedQty: 10, unit: "袋", price: "86.00", amount: "860.00", remark: "采购单待同步", spu: "白砂糖", code: "SPU-D-4102" },
    ],
  },
  {
    id: "PI-20260701-011",
    scenario: "单采购单无其它采购入库单",
    status: "待审核",
    supplier: "岭南肉禽",
    group: "肉禽采购群",
    store: "二号冷库",
    raw: "鸡腿 30 件，猪五花 18 件，明早到仓",
    items: 2,
    order: "-",
    auditor: "赵倩",
    warehouse: "二号冷库",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-LN-0701",
    buyer: "赵倩",
    linkedPurchaseOrderIds: ["GM-PO-8818"],
    gmInboundNo: "",
    canSubmit: true,
    permission: "可操作",
    detailItems: [
      { category: "肉禽冻品", raw: "鸡腿 30 件", name: "冻鸡腿", qty: "30 件", purchaseQty: 30, receivedQty: 30, unit: "件", price: "126.00", amount: "3780.00", remark: "按件入库", spu: "冻鸡腿", code: "SPU-M-3018" },
      { category: "肉禽冻品", raw: "猪五花 18 件", name: "猪五花", qty: "18 件", purchaseQty: 18, receivedQty: 18, unit: "件", price: "238.00", amount: "4284.00", remark: "按件入库", spu: "猪五花", code: "SPU-M-3021" },
    ],
  },
  {
    id: "PI-20260701-012",
    scenario: "已有入库确认只读",
    status: "已确认入库",
    supplier: "春田蔬菜基地",
    group: "蔬菜供应商入库群",
    store: "一号冷库",
    raw: "第一批到仓：云南生菜 220 斤，油麦菜 160 斤",
    items: 2,
    order: "GM-IN-7712",
    auditor: "周诚",
    warehouse: "一号冷库",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-CT-0701-A1",
    buyer: "周诚",
    linkedPurchaseOrderIds: ["GM-PO-7712"],
    gmInboundNo: "GM-IN-7712",
    canSubmit: false,
    permission: "可查看",
    detailItems: [
      { category: "蔬菜", raw: "云南生菜 220 斤", name: "云南生菜", qty: "220 斤", purchaseQty: 400, receivedQty: 220, unit: "斤", price: "3.20", amount: "704.00", remark: "第一批已确认", spu: "云南生菜", code: "SPU-V-2031" },
      { category: "蔬菜", raw: "油麦菜 160 斤", name: "油麦菜", qty: "160 斤", purchaseQty: 300, receivedQty: 160, unit: "斤", price: "3.80", amount: "608.00", remark: "第一批已确认", spu: "油麦菜", code: "SPU-V-2032" },
    ],
  },
  {
    id: "PI-20260701-014",
    scenario: "分批送货：已有确认历史",
    status: "待审核",
    supplier: "春田蔬菜基地",
    group: "蔬菜供应商入库群",
    store: "一号冷库",
    raw: "第二批到仓：云南生菜 180 斤，油麦菜 100 斤，剩余明天补",
    items: 2,
    order: "-",
    auditor: "周诚",
    warehouse: "一号冷库",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-CT-0701-B2",
    buyer: "周诚",
    linkedPurchaseOrderIds: ["GM-PO-7712"],
    gmInboundNo: "",
    canSubmit: true,
    permission: "可操作",
    detailItems: [
      { category: "蔬菜", raw: "云南生菜 180 斤", name: "云南生菜", qty: "180 斤", purchaseQty: 400, receivedQty: 180, unit: "斤", price: "3.20", amount: "576.00", remark: "第二批到仓", spu: "云南生菜", code: "SPU-V-2031" },
      { category: "蔬菜", raw: "油麦菜 100 斤", name: "油麦菜", qty: "100 斤", purchaseQty: 300, receivedQty: 100, unit: "斤", price: "3.80", amount: "380.00", remark: "分批送货", spu: "油麦菜", code: "SPU-V-2032" },
    ],
  },
  {
    id: "PI-20260701-015",
    scenario: "分批+合并混合",
    status: "待审核",
    supplier: "海盛水产",
    group: "海鲜供应商对接群",
    store: "中心仓",
    raw: "合并送货：8801 和 8820 一起到，鲈鱼 162 条，基围虾 240 斤",
    items: 2,
    order: "-",
    auditor: "赵倩",
    warehouse: "中心仓",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-HS-0701-MERGE",
    buyer: "陈林",
    linkedPurchaseOrderIds: ["GM-PO-8801", "GM-PO-8820"],
    gmInboundNo: "",
    canSubmit: true,
    permission: "可操作",
    detailItems: [
      { category: "水产海鲜", raw: "鲈鱼 162 条", name: "鲜活鲈鱼", qty: "162 条", purchaseQty: 162, receivedQty: 162, unit: "条", price: "18.50", amount: "2997.00", remark: "两张采购单合并送货", spu: "鲜活鲈鱼", code: "SPU-P-1001" },
      { category: "水产海鲜", raw: "基围虾 240 斤", name: "基围虾", qty: "240 斤", purchaseQty: 240, receivedQty: 240, unit: "斤", price: "39.00", amount: "9360.00", remark: "两张采购单合并送货", spu: "基围虾", code: "SPU-P-1002" },
    ],
  },
  {
    id: "PI-20260701-016",
    scenario: "采购单已关闭",
    status: "待审核",
    supplier: "北仓调味品",
    group: "干调供应商入库群",
    store: "干货仓",
    raw: "生抽 95 箱，白砂糖 50 袋；关联采购单已被采购关闭",
    items: 2,
    order: "-",
    auditor: "陈林",
    warehouse: "干货仓",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-BC-0701",
    buyer: "陈林",
    linkedPurchaseOrderIds: ["GM-PO-8833"],
    gmInboundNo: "",
    canSubmit: true,
    permission: "可操作",
    detailItems: [
      { category: "干调", raw: "生抽 95 箱", name: "生抽", qty: "95 箱", purchaseQty: 100, receivedQty: 95, unit: "箱", price: "42.00", amount: "3990.00", remark: "采购单已关闭，需重新关联", spu: "生抽", code: "SPU-D-4101" },
      { category: "干调", raw: "白砂糖 50 袋", name: "白砂糖", qty: "50 袋", purchaseQty: 50, receivedQty: 50, unit: "袋", price: "86.00", amount: "4300.00", remark: "采购单已关闭，需重新关联", spu: "白砂糖", code: "SPU-D-4102" },
    ],
  },
  {
    id: "PI-20260701-017",
    scenario: "同采购单入库暂存联动",
    status: "入库暂存",
    supplier: "海盛水产",
    group: "海鲜供应商对接群",
    store: "中心仓",
    raw: "补充到仓：鲈鱼 20 条，基围虾 30 斤",
    items: 2,
    order: "-",
    auditor: "赵倩",
    warehouse: "中心仓",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-HS-0701-SUP",
    buyer: "陈林",
    linkedPurchaseOrderIds: ["GM-PO-8801"],
    gmInboundNo: "",
    canSubmit: true,
    permission: "可操作",
    detailItems: [
      { category: "水产海鲜", raw: "鲈鱼 20 条", name: "鲜活鲈鱼", qty: "20 条", purchaseQty: 82, receivedQty: 20, unit: "条", price: "18.50", amount: "370.00", remark: "同采购单另一张入库暂存采购入库单", spu: "鲜活鲈鱼", code: "SPU-P-1001" },
      { category: "水产海鲜", raw: "基围虾 30 斤", name: "基围虾", qty: "30 斤", purchaseQty: 120, receivedQty: 30, unit: "斤", price: "39.00", amount: "1170.00", remark: "同采购单另一张入库暂存采购入库单", spu: "基围虾", code: "SPU-P-1002" },
    ],
  },
  {
    id: "PI-20260701-018",
    scenario: "含待审核关联单",
    status: "待审核",
    supplier: "春田蔬菜基地",
    group: "蔬菜供应商入库群",
    store: "一号冷库",
    raw: "夜间补货：小白菜 80 斤，菜心 60 斤",
    items: 2,
    order: "-",
    auditor: "周诚",
    warehouse: "一号冷库",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-CT-0701-N1",
    buyer: "周诚",
    linkedPurchaseOrderIds: ["GM-PO-8844"],
    gmInboundNo: "",
    canSubmit: true,
    permission: "可操作",
    detailItems: [
      { category: "蔬菜", raw: "小白菜 80 斤", name: "小白菜", qty: "80 斤", purchaseQty: 120, receivedQty: 80, unit: "斤", price: "2.60", amount: "208.00", remark: "当前单据待审核", spu: "小白菜", code: "SPU-V-2041" },
      { category: "蔬菜", raw: "菜心 60 斤", name: "菜心", qty: "60 斤", purchaseQty: 90, receivedQty: 60, unit: "斤", price: "4.20", amount: "252.00", remark: "当前单据待审核", spu: "菜心", code: "SPU-V-2042" },
    ],
  },
  {
    id: "PI-20260701-019",
    scenario: "同采购单入库暂存待联动",
    status: "入库暂存",
    supplier: "春田蔬菜基地",
    group: "蔬菜供应商入库群",
    store: "一号冷库",
    raw: "同采购单补到：小白菜 40 斤，菜心 30 斤",
    items: 2,
    order: "-",
    auditor: "周诚",
    warehouse: "一号冷库",
    arrivalDate: "2026-07-01",
    deliveryNo: "DN-CT-0701-N2",
    buyer: "周诚",
    linkedPurchaseOrderIds: ["GM-PO-8844"],
    gmInboundNo: "",
    canSubmit: true,
    permission: "可操作",
    detailItems: [
      { category: "蔬菜", raw: "小白菜 40 斤", name: "小白菜", qty: "40 斤", purchaseQty: 120, receivedQty: 40, unit: "斤", price: "2.60", amount: "104.00", remark: "同采购单入库暂存", spu: "小白菜", code: "SPU-V-2041" },
      { category: "蔬菜", raw: "菜心 30 斤", name: "菜心", qty: "30 斤", purchaseQty: 90, receivedQty: 30, unit: "斤", price: "4.20", amount: "126.00", remark: "同采购单入库暂存", spu: "菜心", code: "SPU-V-2042" },
    ],
  },
];

const purchaseOrderTasks = [
  { id: "PO-20260701-201", status: "待处理", supplier: "海盛水产", group: "采购内部下单群", raw: "明天采购：鲈鱼 100 条，基围虾 100 斤", items: 2, order: "-", auditor: "陈林" },
  { id: "PO-20260701-217", status: "已完成", supplier: "春田蔬菜基地", group: "蔬菜采购群", raw: "云南生菜 400 斤，油麦菜 280 斤", items: 2, order: "GM-PO-7712", auditor: "周诚", gmOrderId: "GM-PO-7712" },
  { id: "PO-20260701-233", status: "已完成", supplier: "岭南肉禽", group: "采购内部下单群", raw: "冻鸡腿 30 件，猪五花 18 件，明早到", items: 2, order: "GM-PO-8818", auditor: "赵倩", gmOrderId: "GM-PO-8818" },
];

const guanmaiPurchaseOrders = [
  {
    id: "GM-PO-8801",
    source: "观麦系统录入",
    gmStatus: "未提交",
    supplier: "海盛水产",
    orderDate: "2026-07-02",
    categorySummary: "水产海鲜",
    linkedInboundIds: ["PI-20260630-031", "PI-20260701-015", "PI-20260701-017"],
    items: [
      { name: "鲜活鲈鱼", category: "水产海鲜", qty: 82, unit: "条" },
      { name: "基围虾", category: "水产海鲜", qty: 120, unit: "斤" },
    ],
  },
  {
    id: "GM-PO-7712",
    source: "AI确认回传",
    aiTaskId: "PO-20260701-217",
    gmStatus: "未提交",
    supplier: "春田蔬菜基地",
    orderDate: "2026-07-01",
    categorySummary: "蔬菜",
    linkedInboundIds: ["PI-20260630-008", "PI-20260701-012", "PI-20260701-014"],
    items: [
      { name: "云南生菜", category: "蔬菜", qty: 400, unit: "斤" },
      { name: "油麦菜", category: "蔬菜", qty: 300, unit: "斤" },
    ],
  },
  {
    id: "GM-PO-8818",
    source: "AI确认回传",
    aiTaskId: "PO-20260701-233",
    gmStatus: "未提交",
    supplier: "岭南肉禽",
    orderDate: "2026-07-02",
    categorySummary: "肉禽冻品",
    linkedInboundIds: ["PI-20260701-011"],
    items: [
      { name: "冻鸡腿", category: "肉禽冻品", qty: 30, unit: "件" },
      { name: "猪五花", category: "肉禽冻品", qty: 18, unit: "件" },
    ],
  },
  {
    id: "GM-PO-8820",
    source: "观麦系统录入",
    gmStatus: "未提交",
    supplier: "海盛水产",
    orderDate: "2026-07-03",
    categorySummary: "水产海鲜",
    linkedInboundIds: ["PI-20260701-015"],
    items: [
      { name: "鲜活鲈鱼", category: "水产海鲜", qty: 80, unit: "条" },
      { name: "基围虾", category: "水产海鲜", qty: 120, unit: "斤" },
    ],
  },
  {
    id: "GM-PO-8833",
    source: "观麦系统录入",
    gmStatus: "已关闭",
    supplier: "北仓调味品",
    orderDate: "2026-07-03",
    categorySummary: "干调",
    linkedInboundIds: ["PI-20260701-016"],
    closedReason: "采购侧已关闭，不允许继续关联入库",
    items: [
      { name: "生抽", category: "干调", qty: 100, unit: "箱" },
      { name: "白砂糖", category: "干调", qty: 50, unit: "袋" },
    ],
  },
  {
    id: "GM-PO-8844",
    source: "观麦系统录入",
    gmStatus: "未提交",
    supplier: "春田蔬菜基地",
    orderDate: "2026-07-03",
    categorySummary: "蔬菜",
    linkedInboundIds: ["PI-20260701-018", "PI-20260701-019"],
    items: [
      { name: "小白菜", category: "蔬菜", qty: 120, unit: "斤" },
      { name: "菜心", category: "蔬菜", qty: 90, unit: "斤" },
    ],
  },
  {
    id: "GM-PO-8855",
    source: "观麦系统录入",
    gmStatus: "未提交",
    supplier: "北仓调味品",
    orderDate: "2026-07-03",
    categorySummary: "干调",
    linkedInboundIds: [],
    items: [
      { name: "生抽", category: "干调", qty: 20, unit: "箱" },
      { name: "白砂糖", category: "干调", qty: 10, unit: "袋" },
    ],
  },
];

const historicalInboundRecords = [
  { id: "PI-20260630-008", status: "已确认入库", supplier: "春田蔬菜基地", warehouse: "一号冷库", arrivalDate: "2026-06-30", operator: "周诚", raw: "首批到仓：云南生菜 120 斤，油麦菜 40 斤", gmInboundNo: "GM-IN-7688", permission: "可查看", linkedPurchaseOrderIds: ["GM-PO-7712"], items: [{ name: "云南生菜", receivedQty: 120, unit: "斤" }, { name: "油麦菜", receivedQty: 40, unit: "斤" }] },
  { id: "PI-20260630-031", status: "已确认入库", supplier: "海盛水产", warehouse: "中心仓", arrivalDate: "2026-06-30", operator: "赵倩", raw: "首批到仓：鲈鱼 62 条，基围虾 90 斤", gmInboundNo: "GM-IN-7631", permission: "可查看", linkedPurchaseOrderIds: ["GM-PO-8801"], items: [{ name: "鲜活鲈鱼", receivedQty: 62, unit: "条" }, { name: "基围虾", receivedQty: 90, unit: "斤" }] },
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
    title: "采购单与采购入库单双链路",
    changes: ["采购录单增加采购单录入与采购单审核", "群聊管理增加采购单/采购入库单类型标签", "提示词和 AI 记忆按采购单/采购入库单区分"],
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
    dev: ["路由为 purchase-home，采购录单卡片和采购侧首页图标均进入该页。", "今日任务保留采购单、采购入库单卡片，群聊看板按采购单和采购入库单分别展示表格。", "页面不展示录单额度卡片，额度仍回到租户级公共配置查看。", "本次批注已补充采购入库单全场景样例入口，包括未关联采购单、单采购单、分批送货、合并送货、分批与合并混合、采购单关闭和待审核不联动。"],
    business: ["采购录单首页聚焦采购单和采购入库单业务处理入口。", "群聊看板按今日活跃群展示待处理、已完成、失败数量，并区分采购单群和采购入库单群。", "采购首页中的采购入库单任务用于覆盖真实收货场景，便于产品和开发按场景校验状态、提示和跳转。"],
    iteration: ["2026-07-03 新增采购录单首页，包含快捷入口、今日任务和群聊看板。", "2026-07-09 群聊看板命名统一为采购单和采购入库单两类表格。", "2026-07-10 将采购入库全场景修改写入页面批注。"],
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
    overview: "采购统计页用于查看采购录单内操作员和供应商单据识别表现。",
    dev: ["统计页归属采购录单左侧菜单，路由为 purchase-statistics。", "当前数据为静态演示表格，后续可按日期范围、角色和操作员维度接入真实绩效接口。"],
    business: ["业务方重点确认采购绩效指标口径是否满足操作员管理。", "导出 Excel 为前端演示按钮，后续需要明确导出字段和权限。"],
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
    title: "采购入库单录入",
    overview: "采购入库单录入页模拟仓管从供应商、供应商群或送货单图片导入实际收货信息，由 AI 生成待审核采购入库单。",
    dev: ["左侧供应商/采购入库单群分段切换由 state.purchaseChatMode 控制。", "群聊列表只展示标记为采购入库单录入的采购群。", "本次批注明确：录入页只生成采购入库单草稿，识别到货数来自 AI 原文解析，实收数在详情审核页确认。"],
    business: ["采购入库单需要识别供应商、商品、识别到货数、入库单价和备注。", "一期与采购单分开录入，不自动混合识别两类单据。", "识别到货数不是最终入库数量，最终入库以详情页操作员确认的实收数为准。"],
    iteration: ["V0.7 将采购入库单录入从采购单录入中拆出独立入口。", "2026-07-09 统一采购入库单命名并拆清识别到货数与实收数。", "2026-07-10 将识别到货数和实收数的字段区别写入页面批注。"],
  },
  "purchase-order-entry": {
    title: "采购单录入",
    overview: "采购单录入页模拟操作员手写单、微信截图或采购内部群消息导入，由 AI 生成待审核采购单。",
    dev: ["左侧供应商/采购单群分段切换由 state.purchaseOrderChatMode 控制。", "群聊列表只展示标记为采购单录入的采购群。"],
    business: ["采购单一期重点识别供应商、商品名称和采购数量，价格字段默认不作为必填项。", "采购单可作为后续仓库收货依据，但本期不做与采购入库单的自动匹配。"],
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
    title: "采购入库单审核",
    overview: "采购入库单审核页集中处理供应商实际到货和送货单识别任务，确认后可进入采购入库单详情页。",
    dev: ["采购入库任务使用 purchaseTasks 数据，详情按钮会路由到 purchase-detail。", "状态筛选使用 state.filters.purchaseStatus，展示待审核、入库暂存和已确认入库。", "审核列表展示流程场景、采购单入库流转状态和确认入库影响提示。", "本次批注明确列表字段口径：采购入库单状态只代表当前单据，采购单入库流转状态由关联采购入库单和采购单关闭状态推导，确认入库影响只做提示不驱动数量决策。"],
    business: ["确认入库只按采购单关联关系提示，不用数量统计或差异计算做自动决策。", "采购单已有入库确认后仍可继续被其它采购入库单关联，只有采购单关闭时才阻断确认。", "同一采购单下，入库暂存采购入库单可随本次确认联动入库；待审核采购入库单不会随本次提交。", "审核列表必须展示未关联、已关联未确认、已有入库确认、已关闭不可再关联等状态，用于覆盖分批、合并和混合送货场景。"],
    iteration: ["V0.7 将采购入库单审核保留为独立入口。", "2026-07-09 采购入库审核列表按关联采购单摘要收口展示。", "2026-07-09 补充分批、合并、混合送货下的采购单入库流转状态和确认提示。", "2026-07-10 将状态字段、确认影响和待审核不联动规则写入页面批注。"],
  },
  "purchase-order-review": {
    title: "采购单审核",
    overview: "采购单审核页集中处理操作员手写单、微信截图和采购内部群生成的采购单任务。",
    dev: ["采购单任务使用 purchaseOrderTasks 数据。", "状态筛选使用 state.filters.purchaseOrderStatus，群聊视图只展示采购单录入群。"],
    business: ["待处理采购单需要确认供应商、商品和采购数量。", "采购单可作为收货依据，但一期不自动生成或匹配采购入库单。"],
    iteration: ["V0.7 新增采购单审核入口。"],
  },
  "purchase-detail": {
    title: "采购入库单详情",
    overview: "采购入库单详情页聚焦供应商送货单原始内容、AI 识别结果确认、关联采购单选择和确认入库前的关联采购入库单影响提示。",
    dev: ["当前 activeDetailId 控制详情数据，明细表格使用静态输入框模拟可编辑状态。", "采购入库单详情展示关联采购单入库流转状态、已有入库确认和未确认联动提示。", "暂存入库和确认入库会更新当前静态任务状态。", "金额按采购设置中的计算优先级取数后乘以单价。", "本次批注补充字段字典：识别到货数来自 AI 原文，实收数为操作员确认数量，差异等于采购数减实收数，金额按实收数优先、采购数优先或取两者最小值计算。", "关联采购入库单弹窗只展示采购入库单号、状态、入库时间、供应商和查看操作；查看会进入对应采购入库单详情页。"],
    business: ["操作员确认供应商、商品名称、识别到货数、实收数、单价、金额、备注和关联采购单即可。", "关联采购单确认过入库后不自动关闭，后续仍可继续关联；确认时只提示直接关联采购入库单范围。", "总采购数、总实收数、总差异数和总差异占比只做页面提示，不驱动确认入库流程。", "同一采购单下，待审核采购入库单不随本次提交；入库暂存采购入库单在二次确认后可联动入库；已确认入库的历史单据只提示不重复提交。"],
    iteration: ["V0.5 按一期范围瘦身采购详情页，删除复杂对账与自动关联展示。", "2026-07-09 采购入库单详情支持多选关联采购单、历史关联入口和入库暂存。", "2026-07-09 确认入库改为关联关系提示，不按差异计算分支。", "2026-07-10 将字段含义、计算口径、关联字段、异常说明和查看跳转写入页面批注。"],
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
    business: ["供应商绑定群聊后，采购单和采购入库单消息才能正确归属。", "默认仓库帮助 AI 识别采购入库单缺失仓库信息。"],
    iteration: ["V0.1 完成供应商列表和搜索能力。"],
  },
  "purchase-supplier-groups": {
    title: "供应商分组",
    overview: "供应商分组页用于把操作员与供应商、供应商群聊建立分组关系，便于采购任务进入对应人员的处理范围。",
    dev: ["供应商分组属于采购录单二级菜单，路由为 purchase-supplier-groups。", "列表中的操作员字段使用下拉控件，操作列统一展示编辑和删除。", "新建分组弹窗展示人员、分组名称、群聊和供应商选择区，当前为静态前端原型。"],
    business: ["一个供应商分组可以绑定操作员、多个供应商和多个供应商群聊。", "列表中各行操作展示需要一致，避免最后一行只显示查看造成行为口径不一致。"],
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
    overview: "采购群聊管理页维护采购单群和采购入库单群，展示群聊类型、信道类型、绑定供应商数量和操作员。",
    dev: ["采购群通过 purchaseBound !== '-' 过滤得到，并使用 purchaseDocType 标记采购单录入或采购入库单录入。", "筛选栏展示群聊类型、操作员和群聊名称搜索；列表按群聊名称、群聊类型、信道类型、绑定供应商、成员数、操作员、发言、采购时段和操作展示。"],
    business: ["绑定供应商在列表中只展示数量，详情或供应商管理再查看完整明细。", "操作列保留详情并新增删除入口，便于表达群聊维护闭环。"],
    iteration: ["2026-07-03 调整采购群聊管理筛选项和列表字段顺序。", "2026-07-10 页面批注同步采购单群和采购入库单群命名口径。"],
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
    overview: "采购提示词页用于维护采购单和采购入库单两类解析模板，并按单据类型隔离规则。",
    dev: ["与销售提示词共用 promptsPage，通过 purchaseDocTab 区分采购单和采购入库单。", "提示词工具栏隐藏导入模板和 AI 预识别，只保留搜索和新建模板。"],
    business: ["采购单提示词重点识别供应商、商品和采购数量，价格默认非必填。", "采购入库单提示词重点识别供应商、商品、识别到货数、入库单价和备注。"],
    iteration: ["2026-07-03 去掉导入模板和 AI 预识别入口。", "2026-07-10 页面批注同步采购入库单解析字段：识别到货数、入库单价和备注。"],
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
    overview: "采购 AI 记忆页展示采购单和采购入库单各自沉淀的供应商别名、商品别名和群聊规则。",
    dev: ["与销售记忆共用 memoryPage，通过 purchaseDocTab 切换采购单和采购入库单记忆。", "后续可以增加记忆审批和过期策略。"],
    business: ["采购单记忆和采购入库单记忆分开沉淀，避免采购数量规则影响实际入库识别。", "错误记忆应能禁用或回滚。"],
    iteration: ["V0.7 增加采购单/采购入库单 AI 记忆切换。", "2026-07-10 页面批注同步采购单记忆和采购入库单记忆隔离规则。"],
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
    overview: "采购设置页承载采购单/采购入库单机器人的启停、回复设置和识别边界。",
    dev: ["路由为 purchase-agent-settings，归属采购录单左侧菜单。", "采购侧隐藏通知设置，保留机器人管理、回复设置和计算优先级。", "本次批注明确计算优先级配置会影响采购入库单详情页金额字段，默认设置级固定为实收数优先。"],
    business: ["采购机器人、回复设置、提示词、AI 记忆和计算优先级只影响采购入库链路。", "金额计算优先级支持实收数优先、采购数优先和取两者最小值；默认按实际收货金额入库。"],
    iteration: ["2026-07-03 隐藏采购设置中的通知设置标签。", "2026-07-09 新增计算优先级标签页。", "2026-07-10 将实收数优先的金额口径写入页面批注。"],
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
    dev: ["路由为 tenant-members，从首页成员管理卡片进入。", "新增成员弹窗复用 operatorModal，字段包含姓名、用户名、密码和成员角色。", "成员角色拆分为订单操作员和采购操作员。"],
    business: ["新增按钮文案统一为新增成员。", "订单操作员用于销售订单录单链路，采购操作员用于采购录单链路。"],
    iteration: ["2026-07-03 将成员管理从首页公共配置卡片拆出独立页面，并补充新增成员弹窗。", "2026-07-03 新增成员角色拆分为订单操作员和采购操作员。"],
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
    { role: "assistant", text: "已识别 2 个采购商品，生成入库暂存采购入库单 PI-20260701-011。" },
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

function openPurchaseDetail(id) {
  if (!id) return;
  state.activeDetailId = id;
  if (state.route === "purchase-detail") {
    renderContent();
    return;
  }
  routeTo("purchase-detail");
}

function getRouteFromHash() {
  const key = window.location.hash.replace(/^#/, "");
  if (routeAliases[key]) return routeAliases[key];
  if (hiddenRoutes.has(key)) return "purchase-home";
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
  state.tabs = state.tabs.filter((tab) => tab.key !== "projects" && !hiddenRoutes.has(tab.key));
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
        { key: "tenant-quota", label: "额度管理", icon: "setting", module: "settings" },
        { key: "tenant-members", label: "成员管理", icon: "group", module: "settings" },
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
  document.getElementById("moduleHint").textContent = "";
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
  const orderGroups = groups.filter((group) => getGroupDomain(group) === "purchase" && getPurchaseDocType(group) === "order");
  const inboundGroups = groups.filter((group) => getGroupDomain(group) === "purchase" && getPurchaseDocType(group) === "inbound");
  const taskCards = [
    { label: "采购单", route: "purchase-order-review", groups: orderGroups, tasks: purchaseOrderTasks, tone: "blue" },
    { label: "采购入库单", route: "purchase-review", groups: inboundGroups, tasks: purchaseTasks, tone: "green" },
  ].map((card) => {
    const isInbound = card.label === "采购入库单";
    return {
      ...card,
      firstMetric: {
        label: isInbound ? "入库暂存" : "待处理",
        value: card.tasks.filter((task) => task.status === (isInbound ? "入库暂存" : "待处理")).length,
        tone: isInbound ? "blue-text" : "gold-text",
      },
      secondMetric: {
        label: isInbound ? "待审核" : "已完成",
        value: card.tasks.filter((task) => task.status === (isInbound ? "待审核" : "已完成")).length,
        tone: isInbound ? "gold-text" : "green-text",
      },
      thirdMetric: {
        label: isInbound ? "已确认入库" : "失败",
        value: card.tasks.filter((task) => task.status === (isInbound ? "已确认入库" : "失败")).length,
        tone: isInbound ? "green-text" : "red-text",
      },
    };
  });
  const shortcutItems = [
    { route: "purchase-order-entry", icon: "edit", label: "采购单录入" },
    { route: "purchase-order-review", icon: "review", label: "采购单审核" },
    { route: "purchase-entry", icon: "edit", label: "采购入库单录入" },
    { route: "purchase-review", icon: "review", label: "采购入库单审核" },
    { route: "purchase-suppliers", icon: "supplier", label: "供应商" },
    { route: "purchase-groups", icon: "group", label: "群聊管理" },
    { route: "purchase-prompts", icon: "prompt", label: "提示词" },
    { route: "purchase-memory", icon: "memory", label: "AI 记忆" },
    { route: "purchase-agent-settings", icon: "setting", label: "设置" },
  ];
  const syncMetrics = [
    { label: "已有入库确认采购单", value: guanmaiPurchaseOrders.filter((order) => getPurchaseOrderFlowStatus(order) === "已有入库确认").length, note: "仍可继续关联", tone: "green" },
    { label: "已关联未确认采购单", value: guanmaiPurchaseOrders.filter((order) => getPurchaseOrderFlowStatus(order) === "已关联未确认").length, note: "按采购入库单状态提示", tone: "blue" },
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
        <div class="card-header purchase-task-head">
          <h3><span class="task-clock" aria-hidden="true"></span>今日任务</h3>
        </div>
        <div class="purchase-home-card-grid">
          ${taskCards.map((card) => `
            <article class="purchase-home-mini-card">
              <div class="mini-card-title">
                <span class="tag ${card.tone}">${card.label}</span>
                <button class="text-btn blue-text" data-route="${card.route}">去处理 ›</button>
              </div>
              <div class="purchase-task-summary mini">
                <button data-route="${card.route}"><strong class="${card.firstMetric.tone}">${card.firstMetric.value}</strong><span>${card.firstMetric.label} ›</span></button>
                <button data-route="${card.route}"><strong class="${card.secondMetric.tone}">${card.secondMetric.value}</strong><span>${card.secondMetric.label}</span></button>
                <button data-route="${card.route}"><strong class="${card.thirdMetric.tone}">${card.thirdMetric.value}</strong><span>${card.thirdMetric.label} ›</span></button>
                <button data-route="purchase-groups"><strong class="blue-text">${card.groups.length}</strong><span>活跃群</span></button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="table-card purchase-home-card purchase-sync-card">
        <div class="card-header">
          <h3>跨系统同步看板</h3>
        </div>
        <div class="sync-metric-grid">
          ${syncMetrics.map((item) => `
            <div class="sync-metric ${item.tone}">
              <strong>${item.value}</strong>
              <span>${item.label}</span>
              <em>${item.note}</em>
            </div>
          `).join("")}
        </div>
        <div class="purchase-table-wrap sync-table-wrap">
          <table class="purchase-group-board-table sync-order-table">
            <thead><tr><th>采购单号</th><th>来源</th><th>供应商</th><th>观麦业务状态 <span class="help-icon" title="观麦系统中未提交的采购单会同步至录单系统">?</span></th><th>采购单入库状态</th><th>入库确认提示</th></tr></thead>
            <tbody>
              ${guanmaiPurchaseOrders.map((order) => {
                const inboundStatus = getPurchaseOrderFlowStatus(order);
                return `
                  <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${order.source}</td>
                    <td>${order.supplier}</td>
                    <td>${purchaseOrderStatusPill(order)}</td>
                    <td>${statusTag(inboundStatus)} ${inboundStatus === "未关联" ? "" : `<button class="text-btn" data-view-linked-inbounds="${order.id}">详情</button>`}</td>
                    <td>${purchaseOrderFlowNotice(order)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="table-card purchase-home-card purchase-group-board-section">
        <div class="card-header">
          <h3>群聊看板</h3>
        </div>
        <div class="purchase-home-card-grid">
          ${taskCards.map((card) => `
            <article class="purchase-home-mini-card group-board-card">
              <div class="purchase-group-board-head">
                <h3>${iconSvg.group}<span>${card.label}群聊看板</span><em>今日 ${purchaseActiveGroupRows(card.tasks).length} 个群活跃</em></h3>
                <button class="text-btn blue-text" data-route="purchase-groups">› 全部</button>
              </div>
              ${purchaseGroupBoardTable(card.tasks)}
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function purchaseActiveGroupRows(tasks = [...purchaseOrderTasks, ...purchaseTasks]) {
  const metrics = tasks.reduce((acc, task) => {
    if (!acc[task.group]) acc[task.group] = { name: task.group, pending: 0, finished: 0, failed: 0 };
    if (["待处理", "待审核", "入库暂存"].includes(task.status)) acc[task.group].pending += 1;
    if (["已完成", "已提交", "已确认入库"].includes(task.status)) acc[task.group].finished += 1;
    if (task.status === "失败") acc[task.group].failed += 1;
    return acc;
  }, {});
  return Object.values(metrics).sort((a, b) => {
    const aScore = a.pending + a.finished + a.failed;
    const bScore = b.pending + b.finished + b.failed;
    return bScore - aScore || a.name.localeCompare(b.name, "zh-Hans-CN");
  });
}

function purchaseGroupBoardTable(tasks) {
  const rows = purchaseActiveGroupRows(tasks);
  return `
    <table class="purchase-group-board-table">
      <thead><tr><th>群聊名称</th><th class="right">待办</th><th class="right">完成</th><th class="right">异常</th></tr></thead>
      <tbody>
        ${rows.map((group) => `<tr>
          <td><strong>${group.name}</strong></td>
          <td class="right"><span class="board-count gold-text">${group.pending}</span></td>
          <td class="right"><span class="board-count muted-text">${group.finished}</span></td>
          <td class="right"><span class="board-count red-text">${group.failed}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function statisticsPage(type = "sales") {
  const isSales = type === "sales";
  const agentName = isSales ? "销售订单录单" : "采购录单";
  const roleLabel = isSales ? "当前审核员" : "操作员";
  const rows = isSales ? [
    { reviewer: "张三", orders: 2, submits: 2, goods: 8 },
    { reviewer: "系统管理员", orders: 2, submits: 2, goods: 2 },
    { reviewer: "李娜", orders: 7, submits: 7, goods: 26 },
  ] : [
    { reviewer: "陈林", orders: 6, submits: 6, goods: 20 },
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
            : `<button class="subtab active">操作员绩效</button>`}
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
  const roleLabel = isSales ? "接单员" : "操作员";
  const orderWord = isSales ? "订单" : "单据";
  const purchaseMetrics = { today: "14", consumed: "14", savedWorker: "全职操作员", activeGroups: "3 / 5", groupDesc: "单据群 / 绑定群", submitRatio: "9 / 14", memory: "1" };
  const modalityRows = [
    { title: isSales ? "纯文本下单" : "纯文本单据", orders: 4, manual: 0, rate: "100%" },
    { title: isSales ? "图片下单" : "单据图片", orders: 1, manual: 0, rate: "100%" },
    { title: isSales ? "文件下单" : "单据文件", orders: 0, manual: 0, rate: "-" },
    { title: "其他类型", orders: 0, manual: 0, rate: "-" },
  ];
  const errorRows = isSales ? [
    ["d6ef90f3...", "text", "观麦大学", 1, 1, "0 / 1"],
    ["d456761e...", "text", "观麦大学", 2, 2, "0 / 2"],
    ["0476729a...", "image", "张三小学第二食堂", 3, 3, "0 / 3"],
  ] : [
    ["PO-20260701-201", "text", "海盛水产", 2, 2, "0 / 2"],
    ["PO-20260701-217", "text", "春田蔬菜基地", 2, 2, "0 / 2"],
    ["PI-20260701-011", "text", "海盛水产", 2, 2, "0 / 2"],
  ];
  return `
    <div class="page wide-page decision-page">
      <div class="decision-head">
        <div>
          <h2>${iconSvg.dashboard} ${agentName} 决策大屏</h2>
          <p>聚焦${agentName}内部识别质量、异常诊断与${roleLabel}效能</p>
        </div>
        <div class="decision-range">
          ${!isSales ? `<label class="decision-role-select"><span>人员类型</span><select><option>操作员</option></select></label>` : ""}
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
  return docType === "order" ? "采购单录入" : "采购入库单录入";
}

function getGroupChannel(group, index = 0) {
  if (group.channel) return group.channel;
  if (group.name.includes("邮件")) return "邮件";
  return ["企微", "个微", "邮件"][index % 3];
}

function getBoundCount(value) {
  const match = String(value || "").match(/\d+/);
  return match ? match[0] : "-";
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
  const title = isSales ? "销售订单录入" : isPurchaseOrder ? "采购单录入" : "采购入库单录入";
  const workspaceTitle = isSales ? "AI 录单" : isPurchaseOrder ? "AI 采购" : "AI 采购入库";
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
      : "选择供应商或采购入库单群，发送文字 / 图片 / Excel / PDF";
  const emptySub = isSales ? "AI 自动识别商品信息并生成订单" : isPurchaseOrder ? "AI 自动识别商品和采购数量并生成采购单" : "AI 自动识别商品、到货数量和价格并生成采购入库单";
  const inputPlaceholder = mode === "group"
    ? "请先在左侧选择群聊..."
    : isSales
      ? "请先在左侧选择客户或群聊..."
      : isPurchaseOrder
        ? "请先选择供应商或采购单群..."
        : "请先选择供应商或采购入库单群...";
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
  const title = isSales ? "销售订单审核" : isPurchaseOrder ? "采购单审核" : "采购入库单审核";
  const taskRows = isSales ? salesTasks : isPurchaseOrder ? purchaseOrderTasks : purchaseTasks;
  const tasks = filterTasks(taskRows, getStatus(type));
  const statusOptions = isSales
    ? ["all", "待处理", "已完成", "失败", "合单"]
    : isPurchaseOrder
      ? ["all", "待处理", "已完成", "失败"]
      : ["all", "待审核", "入库暂存", "已确认入库"];
  const alertText = isSales
    ? `当前有 ${tasks.filter((task) => task.status === "失败").length} 个识别失败的单据待人工处理。`
    : isPurchaseOrder
      ? "采购单确认后自动回传到观麦系统，并在观麦中保持未提交状态，供后续采购入库单关联。"
      : "采购入库单关联采购单后可确认入库；其它入库暂存的采购入库单可联动入库，待审核单据不随本次提交。";
  const dateLabel = isSales ? "下单日期" : isPurchaseOrder ? "采购时间" : "入库时间";
  const ownerLabel = isSales ? "审核员" : "操作员";
  const partyFilter = isSales || isPurchaseOrder
    ? `<label class="field compact"><span>${isSales ? "门店" : "供应商"}</span><select><option>全部</option><option>${isSales ? tasks[0]?.store || "天河鲜食店" : tasks[0]?.supplier || "海盛水产"}</option></select></label>`
    : "";
  const purchaseFilters = !isSales ? `
        <label class="field compact"><span>群聊</span><select><option>全部</option><option>${tasks[0]?.group || "采购内部下单群"}</option></select></label>
        <label class="field compact"><span>${ownerLabel}</span><select><option>全部</option><option>陈林</option><option>赵倩</option><option>周诚</option></select></label>
        <label class="field compact"><span>供应商</span><select><option>全部</option><option>${tasks[0]?.supplier || "海盛水产"}</option></select></label>
  ` : "";
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
      <div class="alert">${alertText}</div>
      <section class="filters">
        <label class="field compact"><span>状态</span><select data-status-filter="${type}">
          ${statusOptions.map((status) => `<option value="${status}" ${getStatus(type) === status ? "selected" : ""}>${status === "all" ? "全部状态" : status}</option>`).join("")}
        </select></label>
        <label class="field compact"><span>${dateLabel}</span><input value="2026-07-01"></label>
        ${isSales ? partyFilter : purchaseFilters}
        ${isSales ? `<label class="field compact"><span>${ownerLabel}</span><select><option>全部</option><option>李娜</option><option>赵倩</option><option>周诚</option></select></label>` : ""}
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
  return `<select class="table-select" aria-label="选择操作员">${list.map((item) => `<option ${item === current ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function formatPurchaseAmount(quantity, price) {
  return ((Number(quantity) || 0) * (Number(price) || 0)).toFixed(2);
}

function getPurchaseCalcPriorityLabel() {
  return state.purchaseCalcPriorityLevel === "custom" ? state.purchaseCustomCalcPriority : "实收数优先";
}

function getPurchaseAmountBaseQty(purchaseQty, receivedQty) {
  const purchase = Number(purchaseQty) || 0;
  const received = Number(receivedQty) || 0;
  const priority = getPurchaseCalcPriorityLabel();
  if (priority === "采购数优先") return purchase;
  if (priority === "取两者最小值") return Math.min(purchase, received);
  return received;
}

function formatInboundAmount(purchaseQty, receivedQty, price) {
  return formatPurchaseAmount(getPurchaseAmountBaseQty(purchaseQty, receivedQty), price);
}

function isGuanmaiOrderLinkable(order) {
  return order?.gmStatus === "未提交" && !order.closed;
}

function getGuanmaiOrderById(id) {
  return guanmaiPurchaseOrders.find((order) => order.id === id);
}

function getGuanmaiOrderByTask(task) {
  return guanmaiPurchaseOrders.find((order) => order.id === task?.gmOrderId || order.aiTaskId === task?.id || order.id === task?.order);
}

function getInboundRecordById(id) {
  return purchaseTasks.find((task) => task.id === id) || historicalInboundRecords.find((record) => record.id === id);
}

function getAllInboundRecords() {
  return [...purchaseTasks, ...historicalInboundRecords];
}

function getLinkedPurchaseOrderIds(task) {
  if (!task) return [];
  const ids = Array.isArray(task.linkedPurchaseOrderIds) ? task.linkedPurchaseOrderIds : task.linkedPurchaseOrderId ? [task.linkedPurchaseOrderId] : [];
  return [...new Set(ids.filter(Boolean))];
}

function setLinkedPurchaseOrderIds(task, ids) {
  if (!task) return;
  task.linkedPurchaseOrderIds = [...new Set(ids.filter(Boolean))];
  task.linkedPurchaseOrderId = task.linkedPurchaseOrderIds[0] || "";
}

function getLinkedPurchaseOrders(task) {
  return getLinkedPurchaseOrderIds(task).map(getGuanmaiOrderById).filter(Boolean);
}

function getLinkedPurchaseOrder(task) {
  return getLinkedPurchaseOrders(task)[0];
}

function getPurchaseDetailItems(task) {
  if (Array.isArray(task?.detailItems) && task.detailItems.length) return task.detailItems;
  if (Array.isArray(task?.items) && task.items.length) {
    return task.items.map((item) => ({
      category: item.category || "",
      raw: `${item.name} ${item.receivedQty || item.qty || 0} ${item.unit || ""}`.trim(),
      name: item.name,
      qty: `${item.receivedQty || item.qty || 0} ${item.unit || ""}`.trim(),
      purchaseQty: Number(item.purchaseQty ?? item.receivedQty ?? item.qty) || 0,
      receivedQty: Number(item.receivedQty ?? item.qty) || 0,
      unit: item.unit || "",
      price: item.price || "0.00",
      amount: item.amount || "0.00",
      remark: item.remark || "",
      spu: item.spu || item.name,
      code: item.code || "-",
    }));
  }
  const rows = purchaseDetailItems.filter((item) => item.supplier === task?.supplier);
  return rows.length ? rows : purchaseDetailItems;
}

function inboundRawText(inbound) {
  if (!inbound) return "-";
  const fallbackRaw = getInboundComparisonItems(inbound).map((item) => `${item.name} ${item.receivedQty}${item.unit}`).join("、");
  return inbound.raw || fallbackRaw || "-";
}

function getOrderAssociationStatus(order) {
  return order?.linkedInboundIds?.length ? "已关联" : "未关联";
}

function isInboundConfirmed(record) {
  return ["已确认入库", "已提交", "同步成功", "历史已确认"].includes(record?.status);
}

function isInboundBatchConfirmable(record) {
  return ["入库暂存", "已审核待提交"].includes(record?.status);
}

function isPurchaseOrderClosed(order) {
  return order?.gmStatus === "已关闭" || order?.closed;
}

function getInboundRecordsForOrder(order) {
  return (order?.linkedInboundIds || []).map(getInboundRecordById).filter(Boolean);
}

function getPurchaseOrderFlowStatus(order) {
  if (!order) return "未关联";
  if (isPurchaseOrderClosed(order)) return "已关闭不可再关联";
  const records = getInboundRecordsForOrder(order);
  if (!records.length) return "未关联";
  return records.some(isInboundConfirmed) ? "已有入库确认" : "已关联未确认";
}

function getLinkedInboundStatus(order) {
  const ids = order?.linkedInboundIds || [];
  if (!ids.length) return "未关联";
  const tasks = ids.map(getInboundRecordById).filter(Boolean);
  if (!tasks.length) return "已有入库确认";
  if (tasks.some((task) => task.status === "同步失败")) return "同步失败";
  return tasks.every(isInboundConfirmed) ? "已有入库确认" : "已关联未确认";
}

function getOtherLinkedInboundIds(order, inboundId) {
  return (order?.linkedInboundIds || []).filter((id) => id !== inboundId);
}

function uniqueInboundIds(ids) {
  return [...new Set(ids.filter(Boolean))];
}

function ensureOrderInboundLink(order, inboundId) {
  if (!order || !inboundId) return;
  if (!order.linkedInboundIds.includes(inboundId)) order.linkedInboundIds.push(inboundId);
}

function removeOrderInboundLink(order, inboundId) {
  if (!order || !inboundId) return;
  order.linkedInboundIds = order.linkedInboundIds.filter((id) => id !== inboundId);
}

function togglePurchaseOrderLink(task, order) {
  if (!task || !order) return;
  const ids = getLinkedPurchaseOrderIds(task);
  if (ids.includes(order.id)) {
    setLinkedPurchaseOrderIds(task, ids.filter((id) => id !== order.id));
    removeOrderInboundLink(order, task.id);
    return;
  }
  setLinkedPurchaseOrderIds(task, [...ids, order.id]);
  ensureOrderInboundLink(order, task.id);
}

function getInboundConfirmationContext(task) {
  const orders = getLinkedPurchaseOrders(task);
  const closedOrders = orders.filter(isPurchaseOrderClosed);
  const otherInboundIds = uniqueInboundIds(orders.flatMap((order) => getOtherLinkedInboundIds(order, task?.id)));
  const otherRecords = otherInboundIds.map((id) => getInboundRecordById(id) || { id, status: "历史已确认", supplier: task?.supplier, permission: "可查看" });
  const confirmedRecords = otherRecords.filter(isInboundConfirmed);
  const batchConfirmRecords = otherRecords.filter(isInboundBatchConfirmable);
  const reviewPendingRecords = otherRecords.filter((record) => !isInboundConfirmed(record) && !isInboundBatchConfirmable(record));
  return {
    orders,
    closedOrders,
    otherRecords,
    confirmedRecords,
    batchConfirmRecords,
    reviewPendingRecords,
    hasOtherInbounds: otherRecords.length > 0,
    hasConfirmedHistory: confirmedRecords.length > 0,
    hasBatchConfirmRecords: batchConfirmRecords.length > 0,
    hasReviewPendingRecords: reviewPendingRecords.length > 0,
  };
}

function purchaseOrderStatusTags(orders) {
  if (!orders.length) return statusTag("未关联");
  return orders.map((order) => `${order.id} ${statusTag(getPurchaseOrderFlowStatus(order))}`).join("<br>");
}

function purchaseOrderFlowNotice(order) {
  if (isPurchaseOrderClosed(order)) return "采购单已关闭，不允许继续关联或确认入库";
  const records = getInboundRecordsForOrder(order);
  if (!records.length) return "可被新的采购入库单关联";
  const hasConfirmed = records.some(isInboundConfirmed);
  const hasBatchConfirmable = records.some(isInboundBatchConfirmable);
  const hasReviewPending = records.some((record) => !isInboundConfirmed(record) && !isInboundBatchConfirmable(record));
  if (hasConfirmed && hasBatchConfirmable) return "已有入库确认，仍有入库暂存采购入库单可联动";
  if (hasConfirmed && hasReviewPending) return "已有入库确认，仍有待审核采购入库单需单独审核";
  if (hasConfirmed) return "已有入库确认，后续采购入库单仍可继续关联";
  if (hasBatchConfirmable) return "已有入库暂存采购入库单，确认时会提示联动入库";
  return "已有关联待审核采购入库单，本次不自动提交";
}

function inboundConfirmImpactText(task) {
  const context = getInboundConfirmationContext(task);
  if (!context.orders.length) return "需先关联采购单";
  if (context.closedOrders.length) return "关联采购单已关闭";
  if (context.hasBatchConfirmRecords && context.hasReviewPendingRecords) return "入库暂存采购入库单会联动，待审核单不提交";
  if (context.hasBatchConfirmRecords) return "确认后，其它入库暂存采购入库单也会一起入库";
  if (context.hasReviewPendingRecords) return "存在其它待审核采购入库单，本次不联动提交";
  if (context.hasConfirmedHistory) return "已有入库确认，本次仅确认当前采购入库单";
  return "仅确认当前采购入库单";
}

function getInboundTaskById(id) {
  return purchaseTasks.find((task) => task.id === id);
}

function getInboundComparisonItems(record) {
  if (!record) return [];
  if (Array.isArray(record.items)) {
    return record.items.map((item) => ({
      name: item.name,
      category: item.category || "",
      receivedQty: Number(item.receivedQty) || 0,
      unit: item.unit,
      sourceInboundId: record.id,
    }));
  }
  return getPurchaseDetailItems(record).map((item) => ({
    name: item.name,
    category: item.category,
    receivedQty: Number(item.receivedQty) || 0,
    unit: item.unit,
    sourceInboundId: record.id,
  }));
}


function linkedInboundLabel(id) {
  const task = getInboundTaskById(id);
  if (!task) return `${id}（历史采购入库单）`;
  return `${id}（${task.status}）`;
}

function submitCurrentInbound(task, order) {
  submitCurrentInboundForOrders(task, order ? [order] : []);
}

function submitCurrentInboundForOrders(task, orders) {
  if (!task || !orders?.length) return;
  task.status = "已确认入库";
  task.gmInboundNo = task.gmInboundNo || `GM-IN-${task.id.slice(-3)}${String(Date.now()).slice(-2)}`;
  task.order = task.gmInboundNo;
  orders.forEach((order) => ensureOrderInboundLink(order, task.id));
}

function submitPendingLinkedInboundsForOrders(task, orders) {
  if (!task || !orders?.length) return;
  orders.forEach((order) => {
    ensureOrderInboundLink(order, task.id);
    order.linkedInboundIds.forEach((id) => {
      const inboundTask = getInboundTaskById(id);
      if (inboundTask && (inboundTask.id === task.id || isInboundBatchConfirmable(inboundTask))) {
        inboundTask.status = "已确认入库";
        inboundTask.gmInboundNo = inboundTask.gmInboundNo || `GM-IN-${inboundTask.id.slice(-3)}${String(Date.now()).slice(-2)}`;
        inboundTask.order = inboundTask.gmInboundNo;
      }
    });
  });
}

function saveInboundDraftForOrders(task, orders) {
  if (!task || !orders?.length) return;
  task.status = "入库暂存";
  orders.forEach((order) => ensureOrderInboundLink(order, task.id));
}

function purchaseOrderStatusPill(order) {
  return statusTag(order?.gmStatus || "未提交");
}

function purchaseOrderReviewTable(tasks) {
  return `
    <table class="review-table">
      <thead><tr><th>状态</th><th>时间</th><th>群聊</th><th>供应商</th><th>原文</th><th class="right">商品数</th><th>操作员</th><th>操作</th></tr></thead>
      <tbody>
        ${tasks.map((task, i) => `
          <tr>
            <td>${statusTag(task.status)}</td>
            <td>07-01 ${String(8 + i).padStart(2, "0")}:32:18</td>
            <td>${task.group}</td>
            <td>${task.supplier}</td>
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
      <thead><tr><th>采购入库单状态</th><th>流程场景</th><th>时间</th><th>群聊</th><th>供应商</th><th>原文</th><th class="right">商品数</th><th>关联采购单</th><th>采购单入库流转状态</th><th>确认入库影响</th><th>操作员</th><th>操作</th></tr></thead>
      <tbody>
        ${tasks.map((task, i) => {
          const linkedOrders = getLinkedPurchaseOrders(task);
          const impactText = inboundConfirmImpactText(task);
          return `
            <tr>
              <td>${statusTag(task.status)}</td>
              <td>${task.scenario ? `<span class="tag purple">${task.scenario}</span>` : "-"}</td>
              <td>07-01 ${String(8 + i).padStart(2, "0")}:32:18</td>
              <td>${task.group}</td>
              <td>${task.supplier}</td>
              <td>${task.raw}</td>
              <td class="right">${task.items || "-"}</td>
              <td>${linkedOrders.length ? linkedOrders.map((order) => `<strong>${order.id}</strong>`).join("、") : "未关联"}</td>
              <td class="wrap-cell">${purchaseOrderStatusTags(linkedOrders)}</td>
              <td class="wrap-cell">${impactText}</td>
              <td>${reviewerSelect(task.auditor)}</td>
              <td><button class="text-btn" data-detail="${task.id}">查看</button><button class="text-btn" data-toast="已对 ${task.id} 重新执行 AI 识别">重识别</button><button class="text-btn muted" data-toast="演示环境未实际删除">删除</button></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

function statusTag(status) {
  const color = ["待处理", "待审核", "入库暂存", "需人工确认", "已关联未确认"].includes(status)
    ? "gold"
    : ["已完成", "已提交", "已确认入库", "未提交", "已关联", "已生成", "已确认", "已有入库确认", "历史已确认", "无差异"].includes(status)
      ? "green"
      : ["失败", "已提交到观麦", "同步失败", "商品不一致", "已关闭", "已关闭不可再关联"].includes(status)
        ? "red"
        : "blue";
  return `<span class="tag ${color}">${status}</span>`;
}

const purchaseDetailItems = [
  { supplier: "海盛水产", category: "水产海鲜", raw: "鲈鱼 80 条", name: "鲜活鲈鱼", qty: "80 条", purchaseQty: 82, receivedQty: 80, unit: "条", price: "18.50", amount: "1480.00", remark: "到仓复称", spu: "鲜活鲈鱼", code: "SPU-P-1001" },
  { supplier: "海盛水产", category: "水产海鲜", raw: "基围虾 120 斤", name: "基围虾", qty: "120 斤", purchaseQty: 120, receivedQty: 120, unit: "斤", price: "39.00", amount: "4680.00", remark: "冰鲜称重", spu: "基围虾", code: "SPU-P-1002" },
  { supplier: "春田蔬菜基地", category: "蔬菜", raw: "云南生菜 400 斤", name: "云南生菜", qty: "400 斤", purchaseQty: 400, receivedQty: 400, unit: "斤", price: "3.20", amount: "1280.00", remark: "", spu: "云南生菜", code: "SPU-V-2031" },
  { supplier: "春田蔬菜基地", category: "蔬菜", raw: "油麦菜 260 斤", name: "油麦菜", qty: "260 斤", purchaseQty: 280, receivedQty: 256, unit: "斤", price: "3.80", amount: "988.00", remark: "", spu: "油麦菜", code: "SPU-V-2032" },
  { supplier: "岭南肉禽", category: "肉禽冻品", raw: "鸡腿 30 件", name: "冻鸡腿", qty: "30 件", purchaseQty: 30, receivedQty: 30, unit: "件", price: "126.00", amount: "3780.00", remark: "按件入库", spu: "冻鸡腿", code: "SPU-M-3018" },
  { supplier: "岭南肉禽", category: "肉禽冻品", raw: "猪五花 18 件", name: "猪五花", qty: "18 件", purchaseQty: 18, receivedQty: 18, unit: "件", price: "238.00", amount: "4284.00", remark: "按件入库", spu: "猪五花", code: "SPU-M-3021" },
];

function purchaseOrderSyncSection(task) {
  return `
    <section class="purchase-group po-sync-card">
      <p class="manual-po-note">AI 录单系统确认的采购单会回传到观麦系统，并保持“未提交”状态；只有该状态下才允许后续采购入库单读取并关联。</p>
    </section>
  `;
}

function purchaseAssociationSection(task) {
  const selectedOrderIds = getLinkedPurchaseOrderIds(task);
  const eligibleOrders = guanmaiPurchaseOrders.filter((order) => (order.supplier === task.supplier && isGuanmaiOrderLinkable(order)) || selectedOrderIds.includes(order.id));
  const readonlyAssociation = isInboundConfirmed(task);
  return `
    <section class="purchase-group po-association-card">
      <div class="purchase-group-head">
        <div><strong>关联采购单</strong><span class="gm-tip">仅观麦未提交可关联</span></div>
      </div>
      <div class="purchase-table-wrap po-link-table-wrap">
        <table class="purchase-group-board-table po-link-table">
          <thead><tr><th class="check-col">选择</th><th>采购单</th><th>采购单入库流转状态</th><th>关联采购入库单提示</th><th>操作</th></tr></thead>
          <tbody>
            ${eligibleOrders.length ? eligibleOrders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);
              const otherInboundIds = getOtherLinkedInboundIds(order, task.id);
              const hasOtherInbounds = otherInboundIds.length > 0;
              const rowDisabled = readonlyAssociation || (!isSelected && !isGuanmaiOrderLinkable(order));
              return `
                <tr class="${isSelected ? "selected-row" : ""}">
                  <td class="check-col"><label class="check-only"><input type="checkbox" ${isSelected ? "checked" : ""} ${rowDisabled ? "disabled" : ""} data-link-po="${order.id}" data-inbound-id="${task.id}"></label></td>
                  <td>
                    <div class="po-row-main">
                      <strong>${order.id}</strong>
                      <span>${order.source} · ${order.orderDate}</span>
                      ${isSelected ? `<em>已选</em>` : ""}
                    </div>
                  </td>
                  <td>
                    <div class="history-cell">
                      ${statusTag(getPurchaseOrderFlowStatus(order))}
                    </div>
                  </td>
                  <td>
                    <div class="history-cell">
                      ${hasOtherInbounds ? `<button class="text-btn" data-view-po-history="${order.id}" data-inbound-id="${task.id}">查看关联采购入库单</button>` : `<span class="tag green">无其它关联采购入库单</span>`}
                    </div>
                  </td>
                  <td><button class="text-btn" data-view-gm-po="${order.id}">详情</button></td>
                </tr>
              `;
            }).join("") : `<tr><td colspan="5"><div class="empty-note">暂无同供应商、观麦业务状态为“未提交”的采购单可关联。</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function purchaseDetailPage() {
  const task = [...purchaseOrderTasks, ...purchaseTasks, ...historicalInboundRecords].find((item) => item.id === state.activeDetailId) || purchaseTasks[0];
  const isPurchaseOrder = task.id.startsWith("PO-");
  const readonlyDetail = !isPurchaseOrder && isInboundConfirmed(task);
  const disabledAttr = readonlyDetail ? " disabled" : "";
  const operationHeader = readonlyDetail ? "" : `<th class="operation-col">操作</th>`;
  const supplierOptions = [task.supplier, ...suppliers.map((supplier) => supplier.name).filter((name) => name !== task.supplier)];
  const taskOperator = task.auditor || task.operator || "-";
  const taskGroup = task.group || "历史入库记录";
  const detailTitle = isPurchaseOrder ? "采购单详情" : "采购入库单详情";
  const confirmText = isPurchaseOrder ? "确认采购单" : "确认入库";
  const confirmToast = isPurchaseOrder ? "采购单已确认，并以未提交状态回传观麦系统" : "";
  const detailKindLabel = isPurchaseOrder ? "采购单" : "采购入库单";
  const qtyLabel = isPurchaseOrder ? "数量/单位" : "识别到货数/单位";
  const priceLabel = "单价";
  const amountLabel = "金额";
  const remarkLabel = isPurchaseOrder ? "采购备注" : "备注";
  const detailItems = getPurchaseDetailItems(task);
  const totalPurchaseQty = detailItems.reduce((sum, item) => sum + (Number(item.purchaseQty) || 0), 0);
  const totalReceivedQty = detailItems.reduce((sum, item) => sum + (Number(item.receivedQty) || 0), 0);
  const totalDiffQty = totalPurchaseQty - totalReceivedQty;
  const totalDiffRate = totalPurchaseQty ? `${((totalDiffQty / totalPurchaseQty) * 100).toFixed(1)}%` : "0.0%";
  const detailLineActions = readonlyDetail ? "" : `
    <div class="detail-line-actions">
      <button class="btn danger" data-toast="已删除选中的${detailKindLabel}商品">删除</button>
      <button class="btn" ${isPurchaseOrder ? `data-toast="${detailKindLabel}明细已保存"` : `data-save-inbound-draft="${task.id}"`}>${isPurchaseOrder ? "保存" : "暂存入库"}</button>
      <button class="btn primary" ${isPurchaseOrder ? `data-toast="${confirmToast}"` : `data-confirm-inbound="${task.id}"`}>${confirmText}</button>
    </div>
  `;
  const rowActions = readonlyDetail ? "" : `
    <button class="circle-btn plus" data-toast="已新增一行${detailKindLabel}商品" aria-label="新增${detailKindLabel}商品">+</button>
    <button class="circle-btn minus" data-toast="已删除当前${detailKindLabel}商品" aria-label="删除${detailKindLabel}商品">-</button>
  `;
  const relationSection = isPurchaseOrder ? purchaseOrderSyncSection(task) : purchaseAssociationSection(task);
  return `
    <div class="purchase-detail-page">
      <aside class="detail-source">
        <div class="detail-tabs">
          <button class="active">基本信息</button>
          <button><small class="source-locator">定位来源</small>群聊消息</button>
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
          <pre class="raw-message">--- 2026-07-01 / ${taskGroup} ---
${task.raw}
${isPurchaseOrder ? "采购日期：2026-07-02" : "到货时间：今晚 20:00 前"}
供应商：${task.supplier}

--- ${detailKindLabel}补充说明 ---
${isPurchaseOrder ? "采购数量以原始输入为准，价格缺失时可留空待操作员确认。" : "需到仓复称，破损和缺货请在备注中标记。"}
${isPurchaseOrder ? "价格缺失时留待操作员确认，不自动关联其他单据。" : "价格按本周采购入库价执行，异常商品进入人工确认。"}</pre>
        </div>
      </aside>

      <main class="detail-main">
        <div class="detail-header">
          <div>
            <h2>${detailTitle} ${statusTag(task.status)}</h2>
            <div class="detail-meta">
              <span>供应商：${task.supplier}</span>
              <span>操作员：${taskOperator}</span>
              <span>来源群聊：${taskGroup}</span>
            </div>
          </div>
        </div>

        ${relationSection}

        <section class="purchase-group">
          <div class="purchase-group-head">
            <div><strong>AI 识别${detailKindLabel}明细</strong></div>
            ${detailLineActions}
          </div>
          ${!isPurchaseOrder ? `
            <div class="inbound-review-tip">
              确认入库前请重点核对关联采购单。若关联采购单下还有其它入库暂存采购入库单，提交前系统会再次提示并按直接关联范围一起入库；待审核单据保持不变。
            </div>
          ` : ""}
          <div class="purchase-form-row">
            <label>供应商 <select${disabledAttr}>${supplierOptions.map((name) => `<option>${name}</option>`).join("")}</select></label>
            <label class="wide">${remarkLabel} <input value="${isPurchaseOrder ? "价格待确认" : "到仓复称，异常短缺请备注"}"${disabledAttr}></label>
          </div>
          ${!isPurchaseOrder ? `
            <div class="inbound-summary-row">
              <span>总采购数 <b>${totalPurchaseQty}</b></span>
              <span>总实收数 <b>${totalReceivedQty}</b></span>
              <span>总差异数 <b class="${totalDiffQty ? "red-text" : "green-text"}">${totalDiffQty}</b></span>
              <span>总差异占比 <b class="${totalDiffQty ? "red-text" : "green-text"}">${totalDiffRate}</b></span>
            </div>
          ` : ""}
          <div class="purchase-table-wrap">
            <table class="purchase-detail-table simple-purchase-table">
              <thead>
                ${isPurchaseOrder
                  ? `<tr><th>序号</th><th>识别文本</th><th>商品名称</th><th>${qtyLabel}</th><th>${remarkLabel}</th><th>SPU 名称</th><th>商品编码</th>${operationHeader}</tr>`
                  : `<tr><th>序号</th><th>识别文本</th><th>商品名称</th><th>采购数</th><th>实收数</th><th>差异</th><th>${qtyLabel}</th><th>${priceLabel}</th><th>${amountLabel}</th><th>${remarkLabel}</th><th>SPU 名称</th><th>商品编码</th>${operationHeader}</tr>`}
              </thead>
              <tbody>
                ${detailItems.map((item, index) => {
                  const diffQty = item.purchaseQty - item.receivedQty;
                  const amount = formatInboundAmount(item.purchaseQty, item.receivedQty, item.price);
                  return isPurchaseOrder
                    ? `<tr><td><b>${index + 1}</b></td><td>${item.raw}</td><td><input value="${item.name}"${disabledAttr}></td><td><input class="qty-input" value="${item.qty}"${disabledAttr}></td><td><input class="remark-input" value="${item.remark || "按采购计划确认"}"${disabledAttr}></td><td>${item.spu}</td><td><code>${item.code}</code></td>${readonlyDetail ? "" : `<td class="detail-row-actions">${rowActions}</td>`}</tr>`
                    : `<tr data-inbound-detail-row data-purchase-qty="${item.purchaseQty}" data-unit="${item.unit}">
                        <td><b>${index + 1}</b></td>
                        <td>${item.raw}</td>
                        <td><input value="${item.name}"${disabledAttr}></td>
                        <td><span data-purchase-qty>${item.purchaseQty}</span> ${item.unit}</td>
                        <td><input class="qty-input received-input" data-received-input value="${item.receivedQty}"${disabledAttr}> ${item.unit}</td>
                        <td><span data-diff-cell class="${diffQty ? "red-text" : "green-text"}">${diffQty} ${item.unit}</span></td>
                        <td><input class="qty-input" value="${item.qty}"${disabledAttr}></td>
                        <td>¥ <input class="price-input" data-price-input value="${item.price}"${disabledAttr}></td>
                        <td><span data-amount-cell>¥${amount}</span></td>
                        <td><input class="remark-input" value="${item.remark}"${disabledAttr}></td>
                        <td>${item.spu}</td>
                        <td><code>${item.code}</code></td>
                        ${readonlyDetail ? "" : `<td class="detail-row-actions">${rowActions}</td>`}
                      </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
          ${readonlyDetail ? "" : `<button class="add-line" data-toast="已新增一行${detailKindLabel}商品">+ 新增${detailKindLabel}商品</button>`}
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
  const ownerLabel = isSales ? "审核员" : "操作员";
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
  const ownerLabel = isSales ? "审核员" : "操作员";
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
  return `<select class="table-select group-owner-select" aria-label="选择操作员">${options.map((item) => `<option ${item === current ? "selected" : ""}>${item}</option>`).join("")}</select>`;
}

function groupsPage(type) {
  const isSales = type === "sales";
  const rows = groups.filter((row) => isSales ? row.purchaseBound === "-" : row.purchaseBound !== "-");
  const orderGroupCount = rows.filter((row) => getPurchaseDocType(row) === "order").length;
  const inboundGroupCount = rows.filter((row) => getPurchaseDocType(row) === "inbound").length;
  const operatorOptions = [...new Set(rows.map((row) => row.reviewer).filter(Boolean))];
  return `
    <div class="page wide-page">
      ${!isSales ? `
        <section class="filters purchase-group-filter-bar">
          <label class="field compact"><span>群聊类型</span><select><option>全部</option><option>采购单录入</option><option>采购入库单录入</option></select></label>
          <label class="field compact"><span>操作员</span><select><option>全部</option>${operatorOptions.map((name) => `<option>${name}</option>`).join("")}</select></label>
          <label class="field group-search-field"><input placeholder="搜索群聊名称"></label>
        </section>
      ` : ""}
      <section class="table-card">
        <div class="toolbar">
          <strong>${isSales ? "销售群聊管理" : "采购群聊管理"}</strong>
          <div class="group-toolbar-actions">
            ${!isSales ? `
              <button class="btn danger" data-toast="已选择批量删除群聊">批量删除</button>
              <button class="btn" data-toast="已打开群聊迁移配置">群聊迁移</button>
              <button class="btn" data-toast="已打开新增邮件群">新增邮件群</button>
            ` : ""}
            <button class="btn" data-toast="群聊数据已刷新">刷新</button>
          </div>
        </div>
        <div class="stat-strip">
          <span>总群聊 <b>${rows.length}</b></span><span class="divider">|</span>
          <span>${isSales ? "已绑客户" : "已绑供应商"} <b>${rows.length}</b></span><span class="divider">|</span>
          ${!isSales ? `<span>采购单群 <b>${orderGroupCount}</b></span><span class="divider">|</span><span>采购入库单群 <b>${inboundGroupCount}</b></span><span class="divider">|</span>` : ""}
          <span>已禁言 <b>${rows.filter((row) => row.bot === "禁言").length}</b></span>
        </div>
        <div class="table-scroll">
          ${isSales ? `
            <table>
              <thead><tr><th>群聊名称</th><th class="right">成员数</th><th>绑定客户</th><th>操作员</th><th>机器人发言</th><th>下单时段</th><th>操作</th></tr></thead>
              <tbody>${rows.map((row) => `<tr><td><strong>${row.name}</strong></td><td class="right">${row.members}</td><td>${row.salesBound}</td><td>${row.reviewer}</td><td><span class="tag ${row.bot === "正常" ? "green" : ""}">${row.bot}</span></td><td>${row.time}</td><td><button class="text-btn" data-group-detail="${escapeAttribute(row.name)}">详情</button></td></tr>`).join("")}</tbody>
            </table>
          ` : `
            <table>
              <thead><tr><th>群聊名称</th><th>群聊类型</th><th>信道类型</th><th class="right">绑定供应商</th><th class="right">成员数</th><th>操作员</th><th>发言</th><th>采购时段</th><th>操作</th></tr></thead>
              <tbody>${rows.map((row, index) => `<tr>
                <td><strong>${row.name}</strong></td>
                <td><span class="tag ${getPurchaseDocType(row) === "order" ? "blue" : "green"}">${purchaseDocLabel(getPurchaseDocType(row))}</span></td>
                <td><span class="tag">${getGroupChannel(row, index)}</span></td>
                <td class="right"><span class="count-badge green">${getBoundCount(row.purchaseBound)}</span></td>
                <td class="right">${row.members}</td>
                <td>${row.reviewer}</td>
                <td><span class="tag ${row.bot === "正常" ? "green" : ""}">${row.bot}</span></td>
                <td>${row.time}</td>
                <td><button class="text-btn" data-group-detail="${escapeAttribute(row.name)}">详情</button><button class="text-btn danger-text" data-toast="演示环境未实际删除群聊">删除</button></td>
              </tr>`).join("")}</tbody>
            </table>
          `}
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
    { name: group.reviewer, wx: `wx_${group.reviewer}`, role: "操作员", supplier: "未绑定" },
    { name: "陈林", wx: "wx_buyer_chen", role: "操作员", supplier: "春田蔬菜基地" },
    { name: "赵倩", wx: "wx_inbound_zhao", role: "操作员", supplier: "海盛水产" },
  ];
  const ownerLabel = "操作员";
  return `
    <div class="group-detail">
      <div class="group-detail-overview">
        <div class="group-detail-title">
          <strong>${group.name}</strong>
          <span class="tag ${group.bot === "正常" ? "green" : ""}">${group.bot}</span>
        </div>
        <button class="btn" data-toast="群聊详情已刷新">刷新</button>
      </div>
      <div class="group-detail-metrics">
        <div class="group-detail-metric">
          <span>成员数</span>
          <strong>${group.members}</strong>
          <i>${iconSvg.group}</i>
        </div>
        <div class="group-detail-metric">
          <span>绑定供应商</span>
          <strong>${linkedSuppliers.length}</strong>
          <i>${iconSvg.supplier || iconSvg.group}</i>
        </div>
      </div>
      <div class="group-detail-config">
        <label><span>机器人发言</span><em class="tag ${group.bot === "正常" ? "blue" : ""}">${group.bot}</em></label>
        <label><span>下单时段</span><input value="${group.time}" readonly></label>
        <label><span>${ownerLabel}</span><select><option>${group.reviewer}</option><option>赵倩</option><option>周诚</option><option>陈林</option></select></label>
      </div>
      <div class="tabs group-detail-tabs">
        <button class="subtab active" data-group-detail-tab="suppliers">供应商列表</button>
        <button class="subtab" data-group-detail-tab="members">群成员</button>
      </div>
      <section class="group-detail-panel active" data-group-detail-panel="suppliers">
        <div class="group-detail-panel-head">
          <button class="btn" data-toast="已打开供应商管理">供应商管理</button>
        </div>
        <table>
          <thead><tr><th>供应商名称</th><th>供应商 ID</th><th>操作</th></tr></thead>
          <tbody>${linkedSuppliers.map((supplier) => `<tr><td><strong>${supplier.name}</strong></td><td><code>${supplier.id}</code></td><td><button class="text-btn danger-text" data-toast="演示环境未实际删除供应商">删除</button></td></tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="group-detail-panel" data-group-detail-panel="members">
        <table>
          <thead><tr><th>成员名称</th><th>微信号</th><th>身份类型</th><th>绑定供应商</th></tr></thead>
          <tbody>${members.map((member) => `<tr><td><strong>${member.name}</strong></td><td>${member.wx}</td><td><span class="tag ${member.role === "供应商" ? "green" : "blue"}">${member.role}</span></td><td><select class="table-select"><option>${member.supplier}</option>${suppliers.map((supplier) => `<option>${supplier.name}</option>`).join("")}</select></td></tr>`).join("")}</tbody>
        </table>
      </section>
    </div>
  `;
}

function purchaseDocTabs() {
  return `
    <div class="tabs doc-type-tabs">
      <button class="subtab ${state.purchaseDocTab === "order" ? "active" : ""}" data-purchase-doc-tab="order">采购单</button>
      <button class="subtab ${state.purchaseDocTab === "inbound" ? "active" : ""}" data-purchase-doc-tab="inbound">采购入库单</button>
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
  const docLabel = isSales ? "订单" : isPurchaseOrder ? "采购单" : "采购入库单";
  const rows = promptTemplateRows({ isSales, isSystem, isPurchaseOrder, partyLabel, docLabel });
  return `
    <div class="prompt-page-shell">
      <div class="prompt-toolbar">
        <div class="prompt-total">总模板 <b>${isSystem ? 8 : 21}</b></div>
        <div class="prompt-actions">
          <label class="prompt-search"><input placeholder="${searchLabel}"></label>
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
    const domainLabel = isSales ? "销售订单录单" : isPurchaseOrder ? "采购单 Agent" : "采购入库单 Agent";
    return [
      { name: `默认${docLabel}系统提示词`, type: systemType, typeTone: "blue", bound: domainLabel, enabled: true, preview: `你是${domainLabel}，负责识别商品、数量、业务备注，并按审核规则输出结构化结果...`, updated: "2026-06-27 12:17" },
      { name: `${docLabel}表格解析规则`, type: systemType, typeTone: "blue", bound: "Excel / 图片 / PDF", enabled: true, preview: `优先识别有效表头，忽略合计行，保留${isPurchaseOrder ? "采购备注" : isSales ? "配送备注" : "入库备注"}...`, updated: "2026-06-25 16:50" },
      { name: "意图识别增强", type: "意图识别", typeTone: "gold", bound: domainLabel, enabled: true, preview: "判断当前消息是新增、修改、整单转换、取消还是仅聊天，不确定时进入人工审核...", updated: "2026-06-24 15:06" },
      { name: "异常兜底策略", type: "意图识别", typeTone: "gold", bound: "全部任务", enabled: false, preview: `无法确认${partyLabel}或商品时不自动创建，生成待审核任务并标注原因...`, updated: "2026-06-12 10:28" },
    ];
  }
  const defaultTarget = isSales ? "全部客户" : "全部供应商";
  const specialName = isSales ? "特殊模板格式" : isPurchaseOrder ? "采购单样式识别" : "采购入库单到货规则";
  const specialTarget = isSales ? "李四小学、桐乡市振东小学、张三超市、张三水果..." : "海盛水产、春田蔬菜基地、东升冻品、旺角粮油...";
  const preview = isSales
    ? "你是订单解析专家，请严格按照思维链步骤解析订单，确保输出准确、完整、格式统一..."
    : isPurchaseOrder
      ? "你是采购单解析专家，请提取供应商、商品名称、采购数量和采购备注，价格字段无需输出..."
      : "你是采购入库单解析专家，请识别供应商、商品、识别到货数、到仓备注，异常价格交由人工确认...";
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
    ["群级记忆", "green", "蔬菜采购群", "采购群", "默认生成采购单，不生成采购入库单", 9, "2026-07-01 08:33"],
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
  const purchaseTabs = new Set(["robots", "reply", "calc-priority"]);
  const activeTab = isSales ? state.agentSettingsTab : purchaseTabs.has(state.agentSettingsTab) ? state.agentSettingsTab : "robots";
  return `
    <div class="page wide-page">
      <section class="settings-workbench">
        <div class="tabs settings-tabs">
          <button class="subtab ${activeTab === "robots" ? "active" : ""}" data-agent-settings-tab="robots">机器人管理</button>
          <button class="subtab ${activeTab === "reply" ? "active" : ""}" data-agent-settings-tab="reply">回复设置</button>
          ${!isSales ? `<button class="subtab ${activeTab === "calc-priority" ? "active" : ""}" data-agent-settings-tab="calc-priority">计算优先级</button>` : ""}
          ${isSales ? `<button class="subtab ${activeTab === "notice" ? "active" : ""}" data-agent-settings-tab="notice">通知设置</button>` : ""}
        </div>
        ${activeTab === "robots" ? agentRobotSettings(agentName, isSales) : activeTab === "reply" ? agentReplySettings(agentName, isSales) : activeTab === "calc-priority" ? purchaseCalcPrioritySettings() : agentNoticeSettings(agentName, isSales)}
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
      ["采购入库单已收到", "收到，正在识别采购入库单", false],
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

function purchaseCalcPrioritySettings() {
  const customDisabled = state.purchaseCalcPriorityLevel !== "custom";
  return `
    <div class="agent-setting-pane">
      <div class="info-banner">用于采购入库单金额与差异计算。仅可选中一个配置级别；默认设置级固定为实收数优先，不支持修改。</div>
      <div class="calc-priority-table">
        <label class="calc-priority-row ${state.purchaseCalcPriorityLevel === "default" ? "active" : ""}">
          <span class="calc-radio"><input type="radio" name="purchase-calc-priority-level" value="default" ${state.purchaseCalcPriorityLevel === "default" ? "checked" : ""} data-calc-priority-level="default"></span>
          <span class="calc-level">
            <strong>默认设置级</strong>
            <em>系统内置，不可更改</em>
          </span>
          <span class="calc-value"><span class="tag blue">实收数优先</span></span>
          <span class="calc-action muted">固定规则</span>
        </label>
        <label class="calc-priority-row ${state.purchaseCalcPriorityLevel === "custom" ? "active" : ""}">
          <span class="calc-radio"><input type="radio" name="purchase-calc-priority-level" value="custom" ${state.purchaseCalcPriorityLevel === "custom" ? "checked" : ""} data-calc-priority-level="custom"></span>
          <span class="calc-level">
            <strong>自定义设置</strong>
            <em>选中后按自定义规则计算</em>
          </span>
          <span class="calc-value">
            <select data-custom-calc-priority ${customDisabled ? "disabled" : ""}>
              ${["实收数优先", "采购数优先", "取两者最小值"].map((item) => `<option value="${item}" ${state.purchaseCustomCalcPriority === item ? "selected" : ""}>${item}</option>`).join("")}
            </select>
          </span>
          <span class="calc-action">${customDisabled ? "未启用" : "已启用"}</span>
        </label>
      </div>
      <button class="btn primary full-save" data-toast="采购录单计算优先级已保存">保存</button>
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
    { username: "0623", name: "0623", role: "订单操作员", status: "启用", actions: true },
    { username: "aiceshi", name: "系统管理员", role: "管理员", status: "启用", actions: false },
    { username: "lcf", name: "lcf", role: "采购操作员", status: "启用", actions: true },
    { username: "lanxiu", name: "oywj", role: "采购操作员", status: "启用", actions: true },
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
                <td><span class="tag ${member.role === "管理员" ? "blue" : member.role === "采购操作员" ? "green" : ""}">${member.role}</span></td>
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
            <div><span class="muted">提交单据数</span><strong>0</strong></div>
          </div>
        </section>
        <section class="quota-section">
          <div class="card-header">
            <h3>消耗明细</h3>
            <button class="btn muted" disabled>⇩ 导出 Excel</button>
          </div>
          <div class="table-scroll">
            <table>
              <thead><tr><th>提交时间</th><th>任务 ID</th><th>操作员</th><th>供应商</th><th>扣额行数</th><th>订单行数</th><th>状态</th></tr></thead>
              <tbody><tr><td colspan="7"><div class="quota-empty">暂无数据</div></td></tr></tbody>
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
          <tr><td>lina</td><td>李娜</td><td><span class="tag">普通成员</span></td><td>操作员</td><td><span class="tag green">启用</span></td><td><button class="text-btn">编辑</button></td></tr>
          <tr><td>zhaoqian</td><td>赵倩</td><td><span class="tag">普通成员</span></td><td>操作员</td><td><span class="tag green">启用</span></td><td><button class="text-btn">编辑</button></td></tr>
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

function bindPurchaseAssociationActions(root = document) {
  root.querySelectorAll("[data-link-po]").forEach((button) => {
    button.onclick = () => {
      const task = getInboundTaskById(button.dataset.inboundId);
      const order = getGuanmaiOrderById(button.dataset.linkPo);
      if (!task || !order) return;
      const alreadyLinked = getLinkedPurchaseOrderIds(task).includes(order.id);
      if (!alreadyLinked && !isGuanmaiOrderLinkable(order)) {
        toast("该采购单在观麦系统中不是未提交状态，不允许关联");
        return;
      }
      togglePurchaseOrderLink(task, order);
      toast(`${getLinkedPurchaseOrderIds(task).includes(order.id) ? "已关联" : "已取消关联"}采购单 ${order.id}`);
      renderContent();
    };
  });

  root.querySelectorAll("[data-view-po-history]").forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      const order = getGuanmaiOrderById(button.dataset.viewPoHistory);
      if (order) openModal(`${order.id} - 历史关联采购入库单`, linkedInboundHistoryModal(order, button.dataset.inboundId), { wide: true, hideFooter: true });
    };
  });

  root.querySelectorAll("[data-view-gm-po]").forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      const order = getGuanmaiOrderById(button.dataset.viewGmPo);
      if (order) openModal(`${order.id} - 采购单明细`, gmPurchaseOrderDetailModal(order), { wide: true, hideFooter: true });
    };
  });

  root.querySelectorAll("[data-view-linked-inbounds]").forEach((button) => {
    button.onclick = () => {
      const order = getGuanmaiOrderById(button.dataset.viewLinkedInbounds);
      if (order) openModal(`${order.id} - 关联采购入库单详情`, linkedInboundDetailModal(order), { wide: true, hideFooter: true });
    };
  });

  root.querySelectorAll("[data-save-inbound-draft]").forEach((button) => {
    button.onclick = () => {
      const task = getInboundTaskById(button.dataset.saveInboundDraft);
      if (!task) return;
      const orders = getLinkedPurchaseOrders(task);
      if (orders.length) saveInboundDraftForOrders(task, orders);
      else {
        task.status = "入库暂存";
      }
      toast("已入库暂存，暂不提交观麦");
      renderContent();
    };
  });

  root.querySelectorAll("[data-confirm-inbound]").forEach((button) => {
    button.onclick = () => handleInboundConfirm(button.dataset.confirmInbound);
  });

  root.querySelectorAll("[data-temp-hold-inbound]").forEach((button) => {
    button.onclick = () => {
      const task = getInboundTaskById(button.dataset.tempHoldInbound);
      if (!task) return;
      task.status = "入库暂存";
      closeModal();
      toast("已入库暂存，暂不提交观麦");
      renderContent();
    };
  });

  root.querySelectorAll("[data-submit-association]").forEach((button) => {
    button.onclick = () => handleAssociationSubmit(button);
  });

}

function handleInboundConfirm(inboundId) {
  const task = getInboundTaskById(inboundId);
  if (!task) return;
  const context = getInboundConfirmationContext(task);
  if (!context.orders.length) {
    toast("请先关联采购单，或选择暂存入库");
    return;
  }
  if (context.closedOrders.length) {
    toast(`关联采购单 ${context.closedOrders.map((order) => order.id).join("、")} 已关闭，不允许确认入库`);
    return;
  }
  if (context.hasOtherInbounds) {
    openModal("确认入库前核对关联采购入库单", inboundAssociationImpactModal(task, context), { wide: true, hideFooter: true });
    return;
  }
  openModal("确认入库", inboundSingleConfirmModal(task, context), { wide: true, hideFooter: true });
}

function handleAssociationSubmit(button) {
  const task = getInboundTaskById(button.dataset.inboundId);
  const orders = getOrdersFromButton(button);
  if (!task || !orders.length) return;
  if (button.dataset.submitAssociation === "draft") {
    saveInboundDraftForOrders(task, orders);
    closeModal();
    toast("已入库暂存，暂不提交观麦");
    renderContent();
    return;
  }
  if (button.dataset.submitAssociation === "current") {
    submitCurrentInboundForOrders(task, orders);
    closeModal();
    toast("已确认入库，仅当前采购入库单完成入库");
    renderContent();
    return;
  }
  submitPendingLinkedInboundsForOrders(task, orders);
  closeModal();
  toast("已确认入库，直接关联的入库暂存采购入库单已一起入库");
  renderContent();
}

function getOrdersFromButton(button) {
  if (button.dataset.orderIds) return button.dataset.orderIds.split(",").map(getGuanmaiOrderById).filter(Boolean);
  const order = getGuanmaiOrderById(button.dataset.orderId);
  return order ? [order] : [];
}

function inboundSingleConfirmModal(task, context) {
  const orderIds = context.orders.map((order) => order.id);
  return `
    <div class="association-modal decision-modal">
      <div class="decision-banner success">
        <strong>请检查是否确认入库？</strong>
        <p>当前采购入库单关联的采购单没有其它关联采购入库单，本次确认只会处理当前采购入库单。</p>
      </div>
      <div class="po-modal-summary">
        <div><span>当前采购入库单</span><strong>${task.id}</strong></div>
        <div><span>关联采购单</span><strong>${orderIds.join("、")}</strong></div>
        <div><span>确认影响</span><strong>仅确认当前采购入库单</strong></div>
      </div>
      <div class="decision-actions">
        <div>
          <strong>确认后状态</strong>
          <span>当前采购入库单完成入库，关联采购单入库流转状态变为已有入库确认。</span>
        </div>
        <button class="btn" data-close-modal>取消</button>
        <button class="btn primary" data-submit-association="current" data-inbound-id="${task.id}" data-order-ids="${orderIds.join(",")}">确认入库</button>
      </div>
    </div>
  `;
}

function inboundAssociationImpactModal(task, context) {
  const orderIds = context.orders.map((order) => order.id);
  const shouldBatchConfirm = context.batchConfirmRecords.length > 0;
  const hasReviewPending = context.reviewPendingRecords.length > 0;
  return `
    <div class="association-modal decision-modal">
      <div class="decision-banner warning">
        <strong>${shouldBatchConfirm ? "当前关联的采购单还关联了其它入库暂存采购入库单" : hasReviewPending ? "当前关联的采购单还有待审核采购入库单" : "当前关联的采购单已有采购入库单确认入库"}</strong>
        <p>${shouldBatchConfirm ? "确认后，当前采购入库单和其它入库暂存的直接关联采购入库单会一起入库；待审核单据和已确认入库单保持不变。" : hasReviewPending ? "待审核单据还没有完成审核，不会随着本次确认入库一起提交。本次只处理当前采购入库单。" : "已确认入库的历史单据只作为提示，不会重复入库。本次确认只会处理当前采购入库单。"}</p>
      </div>
      <div class="po-modal-summary">
        <div><span>当前采购入库单</span><strong>${task.id}</strong></div>
        <div><span>关联采购单</span><strong>${orderIds.join("、")}</strong></div>
        <div><span>确认影响</span><strong>${shouldBatchConfirm ? "联动入库暂存采购入库单" : "仅确认当前采购入库单"}</strong></div>
      </div>
      <section class="linked-history-block">
        <div class="modal-subtitle">
          <div>
            <strong>将一起入库的单据</strong>
            <span>只包含当前采购入库单，以及当前关联采购单下处于入库暂存状态的直接关联采购入库单</span>
          </div>
        </div>
        ${inboundImpactTable([task, ...context.batchConfirmRecords], "暂无其它可联动采购入库单。")}
      </section>
      ${context.reviewPendingRecords.length ? `
        <section class="linked-history-block">
          <div class="modal-subtitle">
            <div>
              <strong>待审核，保持不变</strong>
              <span>这些单据需先完成审核，本次不会自动提交入库</span>
            </div>
          </div>
          ${inboundImpactTable(context.reviewPendingRecords, "暂无待审核关联采购入库单。")}
        </section>
      ` : ""}
      ${context.confirmedRecords.length ? `
        <section class="linked-history-block">
          <div class="modal-subtitle">
            <div>
              <strong>已确认入库，保持不变</strong>
              <span>这些单据只用于提示已有入库确认历史</span>
            </div>
          </div>
          ${inboundImpactTable(context.confirmedRecords, "暂无已确认入库历史。")}
        </section>
      ` : ""}
      <div class="decision-actions">
        <div>
          <strong>${shouldBatchConfirm ? "请确认联动范围" : "请确认当前采购入库单"}</strong>
          <span>${shouldBatchConfirm ? "系统不会沿其它采购入库单继续扩散关联采购单，待审核单据也不会被本次提交。" : "采购单后续仍可继续被新的采购入库单关联。"}</span>
        </div>
        <button class="btn" data-close-modal>放弃确认</button>
        <button class="btn primary" data-submit-association="${shouldBatchConfirm ? "force" : "current"}" data-inbound-id="${task.id}" data-order-ids="${orderIds.join(",")}">${shouldBatchConfirm ? "确认入库并联动" : "确认入库"}</button>
      </div>
    </div>
  `;
}

function purchaseOrderItemsTable(order) {
  return `
    <div class="purchase-table-wrap modal-table-wrap">
      <table class="purchase-group-board-table order-items-table">
        <thead><tr><th>商品</th><th>品类</th><th class="right">采购数量</th></tr></thead>
        <tbody>${(order.items || []).map((item) => `<tr><td><strong>${item.name}</strong></td><td>${item.category}</td><td class="right">${item.qty} ${item.unit}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function inboundImpactTable(records, emptyText) {
  const rows = records.filter(Boolean);
  if (!rows.length) return `<div class="empty-note">${emptyText}</div>`;
  return `
    <div class="purchase-table-wrap modal-table-wrap">
      <table class="purchase-group-board-table history-inbound-table">
        <thead><tr><th>采购入库单号</th><th>状态</th><th>入库时间</th><th>供应商</th></tr></thead>
        <tbody>
          ${rows.map((inbound) => `
            <tr>
              <td><strong>${inbound.id}</strong></td>
              <td>${statusTag(inbound.status || "待审核")}</td>
              <td>${inbound.arrivalDate || "-"}</td>
              <td>${inbound.supplier || "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function linkedInboundHistoryTable(order, currentInboundId, includeCurrent = false) {
  const rows = includeCurrent ? (order.linkedInboundIds || []) : (order.linkedInboundIds || []).filter((id) => id !== currentInboundId);
  if (!rows.length) return `<div class="empty-note">${includeCurrent ? "暂无关联采购入库单。" : "暂无其它采购入库单关联记录。"}</div>`;
  return `
    <div class="purchase-table-wrap modal-table-wrap">
      <table class="purchase-group-board-table history-inbound-table">
        <thead><tr><th>采购入库单号</th><th>状态</th><th>入库时间</th><th>供应商</th><th>操作</th></tr></thead>
        <tbody>
          ${rows.map((id) => {
            const inbound = getInboundRecordById(id);
            if (inbound?.permission === "无权限") {
              return `<tr><td colspan="5"><span class="tag red">存在无权限查看的关联采购入库单</span></td></tr>`;
            }
            return `<tr>
              <td><strong>${id}</strong></td>
              <td>${inbound ? statusTag(inbound.status) : "历史已确认"}</td>
              <td>${inbound?.arrivalDate || "-"}</td>
              <td>${inbound?.supplier || order.supplier}</td>
              <td>${inbound ? `<button class="text-btn" data-detail="${inbound.id}">查看</button>` : `<button class="text-btn" data-toast="${id} 为历史记录，当前原型仅展示摘要">查看</button>`}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function linkedInboundHistoryModal(order, currentInboundId) {
  return `
    <div class="association-modal">
      ${linkedInboundHistoryTable(order, currentInboundId)}
    </div>
  `;
}

function linkedInboundDetailModal(order) {
  return `
    <div class="association-modal review-modal">
      <div class="po-modal-summary">
        <div><span>采购单</span><strong>${order.id}</strong></div>
        <div><span>供应商</span><strong>${order.supplier}</strong></div>
        <div><span>关联采购入库单状态</span><strong>${getLinkedInboundStatus(order)}</strong></div>
      </div>
      <section class="modal-review-section">
        <div class="modal-section-title">
          <strong>全部关联采购入库单</strong>
          <span>用于查看该采购单下所有采购入库记录</span>
        </div>
        ${linkedInboundHistoryTable(order, null, true)}
      </section>
    </div>
  `;
}

function gmPurchaseOrderDetailModal(order) {
  return `
    <div class="association-modal">
      ${purchaseOrderItemsTable(order)}
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
        openPurchaseDetail(id);
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
  const recalcInboundDetailRows = () => {
    document.querySelectorAll("[data-inbound-detail-row]").forEach((row) => {
      const purchaseQty = Number(row.dataset.purchaseQty) || 0;
      const unit = row.dataset.unit || "";
      const receivedQty = Number(row.querySelector("[data-received-input]")?.value) || 0;
      const price = Number(row.querySelector("[data-price-input]")?.value) || 0;
      const diff = purchaseQty - receivedQty;
      const diffCell = row.querySelector("[data-diff-cell]");
      const amountCell = row.querySelector("[data-amount-cell]");
      if (diffCell) {
        diffCell.textContent = `${diff} ${unit}`;
        diffCell.classList.toggle("red-text", diff !== 0);
        diffCell.classList.toggle("green-text", diff === 0);
      }
      if (amountCell) amountCell.textContent = `¥${formatInboundAmount(purchaseQty, receivedQty, price)}`;
    });
  };
  document.querySelectorAll("[data-received-input], [data-price-input]").forEach((input) => {
    input.oninput = recalcInboundDetailRows;
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
  document.querySelectorAll("[data-calc-priority-level]").forEach((input) => {
    input.onchange = () => {
      state.purchaseCalcPriorityLevel = input.value;
      renderContent();
    };
  });
  document.querySelectorAll("[data-custom-calc-priority]").forEach((select) => {
    select.onchange = () => {
      state.purchaseCustomCalcPriority = select.value;
      state.purchaseCalcPriorityLevel = "custom";
      renderContent();
    };
  });
  bindModalLaunchers(document);
  bindPurchaseAssociationActions(document);
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
  if (type === "manual-product") {
    openModal("手动建品并加入报价单", manualProductModal(), { hideFooter: true });
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
  chatMessages[type].push({ role: "assistant", text: type === "sales" ? "已解析消息并生成新的待审核销售订单。" : type === "purchase-order" ? "已解析消息并生成新的待审核采购单。" : "已解析消息并生成新的待审核采购入库单。" });
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
  const docLabel = state.purchaseDocTab === "inbound" ? "采购入库单解析（文本/图片识别）" : "采购单解析（文本/图片识别）";
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

function manualProductModal() {
  return `
    <div class="manual-product-modal">
      <label class="product-field required full">
        <span>目标报价单</span>
        <select><option>默认报价单</option><option>采购默认报价单</option><option>入库补录报价单</option></select>
      </label>
      <label class="product-field required">
        <span>商品销售名称</span>
        <input placeholder="例：大白菜">
      </label>
      <label class="product-field full">
        <span>关联 SPU（可选）<em>?</em></span>
        <select><option>输入关键词搜索 SPU</option><option>大白菜</option><option>鲜五花肉</option></select>
      </label>
      <div class="product-form-grid">
        <label class="product-field required">
          <span>所属品类 <em>?</em></span>
          <select><option>菌菇</option><option>蔬菜</option><option>水产</option><option>肉禽冻品</option></select>
        </label>
        <label class="product-field required">
          <span>销售单价</span>
          <input value="￥ 1.0">
        </label>
        <label class="product-field required">
          <span>销售单位</span>
          <input value="斤">
        </label>
        <label class="product-field">
          <span>最小下单数量 <em>?</em></span>
          <input value="1.0">
        </label>
        <label class="product-field">
          <span>是否记重 <em>?</em></span>
          <select><option>不记重</option><option>记重</option></select>
        </label>
        <label class="product-field">
          <span>是否上架 <em>?</em></span>
          <select><option>上架</option><option>下架</option></select>
        </label>
      </div>
      <div class="product-spec-section">
        <label class="product-field required full">
          <span>采购规格</span>
          <button class="btn primary" type="button" data-toast="已加载采购规格">加载采购规格</button>
        </label>
        <p>先选品类后点「按品类加载采购规格」获取该品类下规格与 SPU。供应商由二级分类 id 决定，选完品类后自动按品类加载并选中供应商。</p>
        <label class="product-field required full">
          <span>选择采购规格 <em>?</em></span>
          <select><option>请先点击「按品类加载采购规格」</option><option>斤装</option><option>件装</option></select>
        </label>
        <label class="product-field full">
          <span>选择供应商 <em>?</em></span>
          <select><option>lcfcs (A1234)</option><option>海盛水产 (S20011)</option><option>春田蔬菜基地 (S20018)</option></select>
        </label>
      </div>
      <div class="product-modal-footer">
        <button class="btn" data-close-modal>取消</button>
        <button class="btn primary" data-toast="新商品已加入明细">确定</button>
      </div>
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
      <label class="field required"><span>成员角色：</span><select><option>订单操作员</option><option>采购操作员</option></select></label>
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
  bindPurchaseAssociationActions(document.getElementById("modalRoot"));
  document.querySelectorAll("#modalRoot [data-detail]").forEach((el) => {
    el.onclick = () => {
      const id = el.dataset.detail;
      if (id?.startsWith("PI-") || id?.startsWith("PO-")) {
        closeModal();
        openPurchaseDetail(id);
      }
    };
  });
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
