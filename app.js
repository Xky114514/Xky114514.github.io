const state = {
  route: "home",
  tabs: [{ key: "home", label: "首页", isHome: true }],
  activeDetailId: "PI-20260701-011",
  chatMode: "customer",
  purchaseChatMode: "supplier",
  promptTab: "customer",
  settingsTab: "roles",
  reviewTab: "list",
  groupBoardFilter: "all",
  filters: {
    salesCustomer: "",
    purchaseSupplier: "",
    salesStatus: "all",
    purchaseStatus: "all",
  },
};

const routes = {
  home: { label: "首页", module: "home", title: "系统总门户" },
  "sales-entry": { label: "销售订单录入", module: "sales", title: "销售 Agent" },
  "sales-review": { label: "销售订单审核", module: "sales", title: "销售 Agent" },
  "sales-customers": { label: "客户管理", module: "sales", title: "销售 Agent" },
  "sales-groups": { label: "销售群聊管理", module: "sales", title: "销售 Agent" },
  "purchase-entry": { label: "采购入库单录入", module: "purchase", title: "采购 Agent" },
  "purchase-review": { label: "采购入库单审核", module: "purchase", title: "采购 Agent" },
  "purchase-detail": { label: "采购入库单详情", module: "purchase", title: "采购 Agent" },
  "purchase-suppliers": { label: "供应商管理", module: "purchase", title: "采购 Agent" },
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
  { key: "settings", label: "租户设置", icon: "setting", module: "settings" },
];

const sideMenus = {
  sales: [
    { key: "sales-entry", label: "订单录入", icon: "edit" },
    { key: "sales-review", label: "订单审核", icon: "review" },
    { key: "sales-customers", label: "客户管理", icon: "customer" },
    { key: "sales-groups", label: "群聊管理", icon: "group" },
    { key: "sales-prompts", label: "提示词", icon: "prompt" },
    { key: "sales-memory", label: "AI 记忆", icon: "memory" },
  ],
  purchase: [
    { key: "purchase-entry", label: "入库录入", icon: "edit" },
    { key: "purchase-review", label: "入库审核", icon: "review" },
    { key: "purchase-suppliers", label: "供应商管理", icon: "supplier" },
    { key: "purchase-groups", label: "群聊管理", icon: "group" },
    { key: "purchase-prompts", label: "提示词", icon: "prompt" },
    { key: "purchase-memory", label: "AI 记忆", icon: "memory" },
  ],
};

const iconSvg = {
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
  window.location.hash = key;
}

function getRouteFromHash() {
  const key = window.location.hash.replace(/^#/, "");
  if (routeAliases[key]) return routeAliases[key];
  return routes[key] ? key : "home";
}

function render() {
  state.route = getRouteFromHash();
  document.body.classList.toggle("entry-mode", state.route === "sales-entry" || state.route === "purchase-entry" || state.route === "purchase-detail");
  ensureTab(state.route);
  renderSideMenu();
  renderTopbar();
  renderTabs();
  renderContent();
  bindRouteButtons();
}

function ensureTab(key) {
  if (state.tabs.some((tab) => tab.key === key)) return;
  state.tabs.push({ key, label: routes[key].tabLabel || routes[key].label, isHome: key === "home" });
}

function bindRouteButtons(root = document) {
  root.querySelectorAll("[data-route]").forEach((el) => {
    el.onclick = () => routeTo(el.dataset.route);
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
  if (route.module === "home") return route.title;
  return `${route.title} / ${route.label}`;
}

function renderTopbar() {
  const route = routes[state.route];
  document.querySelector(".tenant strong").textContent = "观麦演示租户";
  document.querySelector(".user-name").textContent = "管理员 王明";
  document.querySelector(".top-actions .text-btn.muted").textContent = "退出";
  document.getElementById("moduleHint").textContent = routeBreadcrumb(route);
}

function renderTabs() {
  document.getElementById("tabbar").innerHTML = state.tabs.map((tab) => `
    <button class="tab ${tab.key === state.route ? "active" : ""}" data-tab="${tab.key}">
      ${tab.isHome ? "⌂" : tab.label}
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
      if (state.route === key) routeTo(state.tabs[state.tabs.length - 1]?.key || "home");
      renderTabs();
    };
  });
}

function renderContent() {
  const content = document.getElementById("content");
  if (state.route === "home") content.innerHTML = homePage();
  if (state.route === "sales-entry") content.innerHTML = entryPage("sales");
  if (state.route === "purchase-entry") content.innerHTML = entryPage("purchase");
  if (state.route === "sales-review") content.innerHTML = reviewPage("sales");
  if (state.route === "purchase-review") content.innerHTML = reviewPage("purchase");
  if (state.route === "purchase-detail") content.innerHTML = purchaseDetailPage();
  if (state.route === "sales-customers") content.innerHTML = partyPage("sales");
  if (state.route === "purchase-suppliers") content.innerHTML = partyPage("purchase");
  if (state.route === "sales-groups") content.innerHTML = groupsPage("sales");
  if (state.route === "purchase-groups") content.innerHTML = groupsPage("purchase");
  if (state.route === "sales-prompts") content.innerHTML = promptsPage("sales");
  if (state.route === "sales-memory") content.innerHTML = memoryPage("sales");
  if (state.route === "purchase-prompts") content.innerHTML = promptsPage("purchase");
  if (state.route === "purchase-memory") content.innerHTML = memoryPage("purchase");
  if (state.route === "settings") content.innerHTML = settingsPage();
  wirePageInteractions();
}

function homePage() {
  return `
    <div class="page">
      <section class="banner">
        <h1>晚上好，观麦演示租户</h1>
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
            <span class="pill blue">订单录入</span><span class="pill blue">订单审核</span><span class="pill">客户管理</span><span class="pill">群聊管理</span><span class="pill">提示词</span><span class="pill">AI 记忆</span>
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
            <span class="pill green">入库录入</span><span class="pill green">入库审核</span><span class="pill">供应商管理</span><span class="pill">群聊管理</span><span class="pill">提示词</span><span class="pill">AI 记忆</span>
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
          </span>
        </div>
        <div class="table-scroll">
          ${groupBoardTable()}
        </div>
      </section>

      <div class="section-title"><h2>租户基础公共配置</h2></div>
      <div class="grid two">
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
      <thead><tr><th>状态</th><th>时间</th><th>接单群</th><th>门店/仓库</th><th>原文</th><th class="right">识别商品数</th><th>观麦单号</th><th>审核员</th><th>操作</th></tr></thead>
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
          <tr><td>admin</td><td>王明</td><td><span class="tag blue">管理员</span></td><td>系统管理员</td><td><span class="tag green">启用</span></td><td><button class="text-btn">改密码</button></td></tr>
          <tr><td>lina</td><td>李娜</td><td><span class="tag">普通成员</span></td><td>录单员</td><td><span class="tag green">启用</span></td><td><button class="text-btn">改密码</button></td></tr>
          <tr><td>zhaoqian</td><td>赵倩</td><td><span class="tag">普通成员</span></td><td>仓管员</td><td><span class="tag green">启用</span></td><td><button class="text-btn">改密码</button></td></tr>
        </tbody></table>
      </div>
    </div>
  `;
}

function syncSettings() {
  return `
    <div style="margin-top:16px" class="grid two">
      <div class="card"><h3>观麦数据同步</h3><p>客户、供应商、商品、报价单、入库规格使用同一租户配置池。</p><div class="agent-menus"><span class="pill green">已开启</span><span class="pill">每 30 分钟</span></div></div>
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

function openModal(title, body) {
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-mask">
      <div class="modal">
        <div class="modal-head"><strong>${title}</strong><button class="text-btn" data-close-modal>×</button></div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot"><button class="btn" data-close-modal>取消</button><button class="btn primary" data-save-modal>保存</button></div>
      </div>
    </div>
  `;
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.onclick = closeModal);
  document.querySelector("[data-save-modal]").onclick = () => {
    closeModal();
    toast("已保存演示数据");
  };
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
if (!window.location.hash) window.location.hash = "home";
render();
