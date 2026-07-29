(() => {
  "use strict";

  const storagePrefix = "sales-receipt-prototype";
  const saveTimers = new Map();
  let toastTimer = 0;
  let attachments = [];
  let pendingOrderId = "";
  let pendingDeleteRow = null;

  const receiptOrderCatalog = {
    "SO-20260725-1028": {
      id: "SO-20260725-1028",
      merchant: "华南鲜食店",
      orderDate: "2026-07-25",
      orderTime: "2026-07-25T08:32",
      orderStatus: "已签收",
      matchLabel: "AI 唯一匹配",
      matchReason: "商户、订单号与商品组合命中",
      lines: [
        {
          id: "SKU-10021",
          name: "大白菜",
          spec: "散装",
          outbound: 25,
          actual: "22",
          unit: "斤",
          aiText: "大白菜 22斤",
          remark: "按商户实收数调整",
        },
        {
          id: "SKU-10083",
          name: "青椒",
          spec: "中号",
          outbound: 12,
          actual: "0",
          unit: "斤",
          aiText: "青椒，实收字迹模糊",
          remark: "",
        },
        {
          id: "SKU-10126",
          name: "油麦菜",
          spec: "散装",
          outbound: 18,
          actual: "18.5",
          unit: "斤",
          aiText: "油麦菜 18.5斤",
          remark: "按商户实收数调整",
        },
        {
          id: "SKU-10148",
          name: "白萝卜",
          spec: "散装",
          outbound: 9,
          actual: "0",
          unit: "斤",
          aiText: "",
          remark: "",
        },
      ],
    },
    "SO-20260726-1066": {
      id: "SO-20260726-1066",
      merchant: "华南鲜食店",
      orderDate: "2026-07-26",
      orderTime: "2026-07-26T08:05",
      orderStatus: "已签收",
      matchLabel: "AI 唯一匹配",
      matchReason: "商户、订单号与商品组合命中",
      lines: [
        {
          id: "SKU-10021",
          name: "大白菜",
          spec: "散装",
          outbound: 25,
          actual: "22",
          unit: "斤",
          aiText: "大白菜 22斤",
          remark: "按商户实收数调整",
        },
        {
          id: "SKU-10083",
          name: "青椒",
          spec: "中号",
          outbound: 12,
          actual: "10",
          unit: "斤",
          aiText: "青椒 10斤",
          remark: "按商户实收数调整",
        },
        {
          id: "SKU-10126",
          name: "油麦菜",
          spec: "散装",
          outbound: 18,
          actual: "18.5",
          unit: "斤",
          aiText: "油麦菜 18.5斤",
          remark: "按商户实收数调整",
        },
      ],
    },
    "SO-20260727-1120": {
      id: "SO-20260727-1120",
      merchant: "华南鲜食店",
      orderDate: "2026-07-27",
      orderTime: "2026-07-27T07:46",
      orderStatus: "配送中",
      matchLabel: "人工选择",
      matchReason: "更换后按原始 AI 结果重新匹配",
      lines: [
        {
          id: "SKU-10021",
          name: "大白菜",
          spec: "散装",
          outbound: 30,
          actual: "22",
          unit: "斤",
          aiText: "大白菜 22斤",
          remark: "由原始 AI 结果重新匹配",
        },
        {
          id: "SKU-10083",
          name: "青椒",
          spec: "中号",
          outbound: 15,
          actual: "0",
          unit: "斤",
          aiText: "青椒，实收字迹模糊",
          remark: "",
        },
        {
          id: "SKU-10126",
          name: "油麦菜",
          spec: "散装",
          outbound: 20,
          actual: "18.5",
          unit: "斤",
          aiText: "油麦菜 18.5斤",
          remark: "由原始 AI 结果重新匹配",
        },
        {
          id: "SKU-10208",
          name: "西红柿",
          spec: "大果",
          outbound: 12,
          actual: "0",
          unit: "斤",
          aiText: "",
          remark: "",
        },
        {
          id: "SKU-10311",
          name: "鸡蛋",
          spec: "30枚/盒",
          outbound: 24,
          actual: "0",
          unit: "盒",
          aiText: "",
          remark: "",
        },
      ],
    },
    "SO-20260726-2058": {
      id: "SO-20260726-2058",
      merchant: "城东实验小学",
      orderDate: "2026-07-26",
      orderTime: "2026-07-26T08:46",
      orderStatus: "已签收",
      matchLabel: "AI 唯一匹配",
      matchReason: "门店、单据编号与商品组合命中",
      lines: [
        {
          id: "SKU-20021",
          name: "大白菜",
          spec: "散装",
          outbound: 20,
          actual: "18",
          unit: "斤",
          aiText: "大白菜 18斤",
          remark: "按商户实收数调整",
        },
        {
          id: "SKU-20083",
          name: "青椒",
          spec: "中号",
          outbound: 10,
          actual: "10",
          unit: "斤",
          aiText: "青椒 10斤",
          remark: "",
        },
        {
          id: "SKU-20126",
          name: "油麦菜",
          spec: "散装",
          outbound: 15,
          actual: "14.5",
          unit: "斤",
          aiText: "油麦菜 14.5斤",
          remark: "按商户实收数调整",
        },
      ],
    },
    "SO-20260726-3054": {
      id: "SO-20260726-3054",
      merchant: "观麦大学",
      orderDate: "2026-07-26",
      orderTime: "2026-07-26T07:55",
      orderStatus: "已签收",
      matchLabel: "AI 唯一匹配",
      matchReason: "门店、单据编号与商品组合命中",
      lines: [
        {
          id: "SKU-30021",
          name: "大白菜",
          spec: "散装",
          outbound: 25,
          actual: "25",
          unit: "斤",
          aiText: "大白菜 25斤",
          remark: "",
        },
        {
          id: "SKU-30083",
          name: "青椒",
          spec: "中号",
          outbound: 12,
          actual: "0",
          unit: "斤",
          aiText: "",
          remark: "",
        },
        {
          id: "SKU-30126",
          name: "油麦菜",
          spec: "散装",
          outbound: 18,
          actual: "18",
          unit: "斤",
          aiText: "油麦菜 18斤",
          remark: "",
        },
      ],
    },
  };

  const receiptAiExceptions = [
    {
      id: "AI-EXTRA-01",
      text: "土豆 5斤",
      name: "土豆",
      actual: "5",
      unit: "斤",
      type: "new",
      label: "订单无此商品",
      action: "确认不在本单",
      resolvedLabel: "已核对，不在本单",
    },
    {
      id: "AI-DUP-01",
      text: "大白菜 21斤",
      name: "大白菜",
      actual: "21",
      unit: "斤",
      type: "duplicate",
      label: "重复识别",
      action: "标记为重复",
      resolvedLabel: "已核对为重复项",
    },
  ];

  const receiptAiOriginalLines = [
    {
      id: "AI-ORIGINAL-01",
      text: "大白菜 22斤",
      name: "大白菜",
      actual: "22",
      unit: "斤",
    },
    {
      id: "AI-ORIGINAL-02",
      text: "青椒，实收字迹模糊",
      name: "青椒",
      actual: "0",
      unit: "斤",
    },
    {
      id: "AI-ORIGINAL-03",
      text: "油麦菜 18.5斤",
      name: "油麦菜",
      actual: "18.5",
      unit: "斤",
    },
    ...receiptAiExceptions,
  ];

  let activeReceiptAiExceptions = [...receiptAiExceptions];
  let activeReceiptAiOriginalLines = [...receiptAiOriginalLines];

  const receiptScenarioCatalog = {
    "ambiguous-order": {
      receiptId: "SR-20260727-021",
      state: "待处理",
      merchant: "华南鲜食店",
      group: "华南鲜食店收货群",
      operator: "王明",
      createdTime: "2026-07-27 11:06:12",
      signDate: "2026-07-27",
      signClock: "11:06",
      documentNumber: "SO-2026072",
      orderId: "",
      candidateIds: ["SO-20260725-1028", "SO-20260727-1120"],
      remark: "单据编号字迹模糊，待确认关联订单",
      messages: [
        "回单上的单据编号后四位字迹模糊，AI 仅识别到“SO-2026072”。",
        "门店识别为华南鲜食店，大白菜实收 22 斤，油麦菜实收 18.5 斤。",
        "系统匹配到两张候选销售订单，请操作员人工选择。",
      ],
      author: "刘店长",
      aiLines: [
        {
          id: "AI-AMBIGUOUS-01",
          text: "大白菜 22斤",
          name: "大白菜",
          actual: "22",
          unit: "斤",
        },
        {
          id: "AI-AMBIGUOUS-02",
          text: "油麦菜 18.5斤",
          name: "油麦菜",
          actual: "18.5",
          unit: "斤",
        },
      ],
      exceptionIds: [],
    },
    "complete-manual": {
      receiptId: "SR-20260727-019",
      state: "已完成",
      merchant: "华南鲜食店",
      group: "华南鲜食店收货群",
      operator: "李娜",
      createdTime: "2026-07-27 10:28:36",
      signDate: "2026-07-27",
      signClock: "10:28",
      documentNumber: "SO-20260727-1120",
      orderId: "SO-20260727-1120",
      candidateIds: ["SO-20260727-1120"],
      remark: "AI 识别完整，人工核对后提交",
      messages: [
        "单据编号：SO-20260727-1120。",
        "大白菜实收 22 斤，青椒实收 15 斤，油麦菜实收 18.5 斤。",
        "商品与数量均清晰，已由李娜核对并确认提交。",
      ],
      author: "刘店长",
      orderStatus: "已签收",
      orderLines: [
        {
          id: "SKU-10021",
          name: "大白菜",
          spec: "散装",
          outbound: 30,
          actual: "22",
          unit: "斤",
          aiText: "大白菜 22斤",
          remark: "人工核对完成",
        },
        {
          id: "SKU-10083",
          name: "青椒",
          spec: "中号",
          outbound: 15,
          actual: "15",
          unit: "斤",
          aiText: "青椒 15斤",
          remark: "人工核对完成",
        },
        {
          id: "SKU-10126",
          name: "油麦菜",
          spec: "散装",
          outbound: 20,
          actual: "18.5",
          unit: "斤",
          aiText: "油麦菜 18.5斤",
          remark: "人工核对完成",
        },
      ],
      exceptionIds: [],
    },
    "extra-item": {
      receiptId: "SR-20260726-015",
      state: "待处理",
      merchant: "城东实验小学",
      group: "城东实验小学配送群",
      operator: "赵倩",
      createdTime: "2026-07-26 10:16:32",
      signDate: "2026-07-26",
      signClock: "10:16",
      documentNumber: "SO-20260726-2058",
      orderId: "SO-20260726-2058",
      candidateIds: ["SO-20260726-2058"],
      remark: "存在订单外商品，待人工核对",
      messages: [
        "单据编号：SO-20260726-2058。",
        "大白菜实收 18 斤，青椒实收 10 斤，油麦菜实收 14.5 斤。",
        "单据底部另写“土豆 5 斤”，但关联销售订单中没有土豆。",
      ],
      author: "张老师",
      exceptionIds: ["AI-EXTRA-01"],
    },
    "missed-item": {
      receiptId: "SR-20260726-012",
      state: "待处理",
      merchant: "观麦大学",
      group: "观麦大学食堂回单群",
      operator: "王明",
      createdTime: "2026-07-26 09:28:18",
      signDate: "2026-07-26",
      signClock: "09:28",
      documentNumber: "SO-20260726-3054",
      orderId: "SO-20260726-3054",
      candidateIds: ["SO-20260726-3054"],
      remark: "青椒未识别，实际出库数按规则填 0",
      messages: [
        "单据编号：SO-20260726-3054。",
        "AI 识别到大白菜实收 25 斤、油麦菜实收 18 斤。",
        "销售订单中还有青椒，回单材料未识别到该商品，实际出库数填 0。",
      ],
      author: "陈老师",
      exceptionIds: [],
    },
    "unique-document": {
      receiptId: "SR-20260725-009",
      state: "待处理",
      merchant: "华南鲜食店",
      group: "华南鲜食店收货群",
      operator: "李娜",
      createdTime: "2026-07-25 18:44:20",
      signDate: "2026-07-25",
      signClock: "18:44",
      documentNumber: "SO-20260725-1028",
      orderId: "SO-20260725-1028",
      candidateIds: ["SO-20260725-1028"],
      remark: "单据编号唯一命中，待人工确认",
      messages: [
        "AI 清晰识别单据编号 SO-20260725-1028。",
        "系统按单据编号唯一命中销售订单并自动关联。",
        "大白菜实收 22 斤，青椒实收 12 斤，油麦菜实收 18.5 斤。",
      ],
      author: "刘店长",
      orderLines: [
        {
          id: "SKU-10021",
          name: "大白菜",
          spec: "散装",
          outbound: 25,
          actual: "22",
          unit: "斤",
          aiText: "大白菜 22斤",
          remark: "按商户实收数调整",
        },
        {
          id: "SKU-10083",
          name: "青椒",
          spec: "中号",
          outbound: 12,
          actual: "12",
          unit: "斤",
          aiText: "青椒 12斤",
          remark: "",
        },
        {
          id: "SKU-10126",
          name: "油麦菜",
          spec: "散装",
          outbound: 18,
          actual: "18.5",
          unit: "斤",
          aiText: "油麦菜 18.5斤",
          remark: "按商户实收数调整",
        },
      ],
      exceptionIds: [],
    },
    "merchant-multiple": {
      receiptId: "SR-20260725-006",
      state: "待处理",
      merchant: "华南鲜食店",
      group: "华南鲜食店收货群",
      operator: "赵倩",
      createdTime: "2026-07-25 16:08:45",
      signDate: "2026-07-25",
      signClock: "16:08",
      documentNumber: "",
      orderId: "",
      candidateIds: [
        "SO-20260725-1028",
        "SO-20260726-1066",
        "SO-20260727-1120",
      ],
      remark: "仅识别到门店，待选择销售订单",
      messages: [
        "回单上没有可识别的有效单据编号。",
        "AI 识别到系统已有门店“华南鲜食店”及商品实收数量。",
        "该门店时间范围内有多张配送中或已签收订单，请人工选择。",
      ],
      author: "刘店长",
      aiLines: [
        {
          id: "AI-MERCHANT-01",
          text: "大白菜 22斤",
          name: "大白菜",
          actual: "22",
          unit: "斤",
        },
        {
          id: "AI-MERCHANT-02",
          text: "油麦菜 18.5斤",
          name: "油麦菜",
          actual: "18.5",
          unit: "斤",
        },
      ],
      exceptionIds: [],
    },
  };

  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];

  function showToast(message) {
    const toast = one("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("open");
  }

  function closeModal(modal) {
    const target =
      typeof modal === "string" ? document.getElementById(modal) : modal;
    target?.classList.remove("open");
  }

  function bindGlobalControls() {
    all("[data-toast]").forEach((button) => {
      button.addEventListener("click", () => showToast(button.dataset.toast));
    });

    all("[data-open-modal]").forEach((button) => {
      button.addEventListener("click", () => openModal(button.dataset.openModal));
    });

    all("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", () =>
        closeModal(button.closest(".modal-backdrop")),
      );
    });

    all(".modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) closeModal(backdrop);
      });
    });

    all(".switch").forEach((control) => {
      control.addEventListener("click", () => {
        control.classList.toggle("on");
        control.setAttribute(
          "aria-checked",
          control.classList.contains("on") ? "true" : "false",
        );
      });
    });
  }

  function bindAgentSwitcher() {
    const sider = one(".sider");
    if (!sider || one(".agent-switcher", sider)) return;

    const switcher = document.createElement("details");
    switcher.className = "agent-switcher";
    switcher.innerHTML = `
      <summary aria-label="切换 Agent 应用" title="切换 Agent 应用">
        <span class="agent-center-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </summary>
      <div class="agent-switch-popover">
        <div class="agent-switch-title">切换 Agent</div>
        <a class="agent-switch-link" href="../ai_order/home.html">
          <span class="agent-app-icon sales">销</span>
          <span class="agent-switch-copy"><strong>销售订单录单</strong><span>进入销售录单首页</span></span>
        </a>
        <a class="agent-switch-link" href="../index.html#purchase-home">
          <span class="agent-app-icon purchase">采</span>
          <span class="agent-switch-copy"><strong>采购录单</strong><span>进入采购录单首页</span></span>
        </a>
      </div>`;
    sider.appendChild(switcher);

    document.addEventListener("click", (event) => {
      if (!switcher.contains(event.target)) switcher.removeAttribute("open");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") switcher.removeAttribute("open");
    });
  }

  const specHtml = (summary, rules = [], feedback = [], boundaries = []) => `
    <p>${summary}</p>
    <h3>业务规则</h3>
    <ul>${rules.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h3>操作与反馈</h3>
    <ul>${feedback.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h3>异常与边界</h3>
    <ul>${boundaries.map((item) => `<li>${item}</li>`).join("")}</ul>`;

  const taskSpecTargets = [
    {
      id: "task-overview",
      selectors: [".page-head"],
      title: "回单任务｜页面目标与状态边界",
      html: specHtml(
        "用于集中查询待人工处理和已经提交完成的销售回单。识别中的任务不进入列表，避免操作员处理尚未形成稳定识别结果的数据。",
        [
          "待处理：允许进入可编辑详情，核对订单、商品和实际出库数。",
          "已完成：销售订单实际出库数已写入，只允许查看只读详情。",
          "列表中的业务场景是演示样例，用于覆盖候选不唯一、完整识别、多识别、漏识别、单据编号唯一命中、仅门店多候选六类路径。",
        ],
        [
          "筛选条件按交集生效，查询后同步刷新可见行数和分页总数。",
          "点击查看时，根据任务状态进入可编辑或只读详情。",
        ],
        [
          "无数据时保留筛选条件并显示空状态。",
          "加载失败时保留原列表和筛选值，提示重试，不展示半更新结果。",
        ],
      ),
    },
    {
      id: "task-filters",
      selectors: [".filters"],
      title: "筛选区｜组合查询口径",
      html: specHtml(
        "筛选区用于从当前账号有权查看的回单任务中定位目标记录。",
        [
          "状态、门店、时间范围和操作员按交集查询。",
          "默认状态、门店、操作员均为全部；默认时间范围以页面预设值为准。",
          "时间按回单材料进入系统的时间统计，日期区间包含开始日和结束日。",
        ],
        ["查询刷新列表；重置恢复默认条件并立即刷新。"],
        ["开始日期晚于结束日期时阻止查询并提示修正。"],
      ),
    },
    {
      id: "task-status-filter",
      selectors: ["[data-filter-status]"],
      title: "状态筛选｜可选状态",
      html: specHtml(
        "按回单任务当前处理状态筛选。",
        [
          "选项仅包含全部状态、待处理、已完成。",
          "识别中的任务不属于操作员工作列表，因此不提供筛选项。",
        ],
        ["切换选项后需点击查询生效。"],
        ["未知状态不展示在列表，并进入数据质量排查。"],
      ),
    },
    {
      id: "task-store-filter",
      selectors: ["[data-filter-merchant]"],
      title: "门店筛选｜数据范围",
      html: specHtml(
        "按销售回单归属门店筛选任务。",
        ["候选项来自当前操作员数据权限范围内的门店；默认全部门店。"],
        ["选择门店后点击查询，与其余筛选条件共同生效。"],
        ["门店停用后历史回单仍可按原门店名称查询。"],
      ),
    },
    {
      id: "task-time-filter",
      selectors: [".task-time-filter"],
      title: "时间范围｜回单接收时间",
      html: specHtml(
        "限定回单材料进入系统的日期范围。",
        [
          "开始日与结束日均包含在统计范围内。",
          "列表展示精确到分钟，筛选以本地自然日 00:00:00 至 23:59:59 计算。",
        ],
        ["修改任一日期后点击查询生效。"],
        ["开始日不可晚于结束日；非法区间不发送查询。"],
      ),
    },
    {
      id: "task-operator-filter",
      selectors: ["[data-filter-operator]"],
      title: "操作员筛选｜责任人定义",
      html: specHtml(
        "按最近一次实际处理该回单的人员筛选。",
        [
          "人工处理显示人员姓名。",
          "无需人工修正且由系统提交时显示“系统自动处理”。",
        ],
        ["选择后点击查询生效。"],
        ["人员离职或停用不影响历史任务按原姓名查询。"],
      ),
    },
    {
      id: "task-query",
      selectors: ["[data-apply-filter]"],
      title: "查询｜触发规则",
      html: specHtml(
        "按当前筛选条件重新读取任务列表。",
        ["重复点击时仅保留最后一次有效请求结果。"],
        ["成功后刷新列表、结果数与分页；失败时提示重试。"],
        ["查询期间按钮应防重复触发；失败不得清空已有列表。"],
      ),
    },
    {
      id: "task-reset",
      selectors: ["[data-reset-filter]"],
      title: "重置｜恢复默认条件",
      html: specHtml(
        "清除人工选择的筛选条件并恢复页面默认值。",
        ["状态、门店、操作员恢复为全部；时间恢复为默认区间。"],
        ["重置后立即刷新列表，不需要再次点击查询。"],
        ["重置不影响任务数据本身。"],
      ),
    },
    {
      id: "task-list",
      selectors: [".table-card"],
      title: "回单列表｜字段与排序",
      html: specHtml(
        "每一行代表一张销售回单任务，并关联至一张销售订单。",
        [
          "默认按回单进入系统时间倒序排列。",
          "状态为待处理或已完成；业务场景说明当前样例的主要处理路径。",
          "来源展示客户入口或群聊名称；门店展示回单归属；操作员展示最近处理人。",
        ],
        ["刷新保留当前筛选条件；分页只切换当前条件下的数据页。"],
        ["字段缺失显示“--”；不得用其他字段猜测替代。"],
      ),
    },
    {
      id: "task-scenario",
      selectors: [".scenario-column", ".scenario-cell"],
      title: "业务场景｜六类演示任务",
      html: specHtml(
        "用于在原型中明确每条任务覆盖的识别与关联结果，不作为正式业务状态。",
        [
          "候选订单不唯一：系统给出多张候选，操作员单选确认。",
          "AI 识别完整：订单和商品均匹配，操作员核对后提交。",
          "AI 多识别：订单外条目追加在订单商品末尾，不直接回写。",
          "AI 漏识别：订单商品仍按订单顺序保留，实际出库数置 0。",
          "已有单据编号且唯一：系统自动选中唯一订单。",
          "仅识别已有门店且多候选：按门店和时间给出多张候选。",
        ],
        ["点击该场景对应行的查看，可进入匹配该场景的数据详情。"],
        ["同一任务可同时存在商品漏识别和多识别，但列表仅展示主场景。"],
      ),
    },
    {
      id: "task-view",
      selectors: [".task-actions a"],
      title: "查看｜详情入口",
      html: specHtml(
        "打开当前回单的详情页。",
        [
          "待处理任务进入可编辑详情。",
          "已完成任务进入只读详情，关联订单、表单和商品行均不可修改。",
        ],
        ["保留当前任务标识和场景参数，详情展示对应数据。"],
        ["任务不存在或无权限时返回列表并提示记录不可访问。"],
      ),
    },
    {
      id: "task-delete",
      selectors: ["[data-delete-task]"],
      title: "删除｜任务移除规则",
      html: specHtml(
        "从回单任务列表删除当前任务。",
        [
          "删除前必须二次确认并展示回单编号。",
          "删除任务不等于撤销已经写入销售订单的数据；已完成任务的删除权限应由后端单独控制。",
        ],
        ["确认成功后移除当前行并更新总数；取消不改变数据。"],
        ["失败时保留原行并提示原因；重复请求按同一任务幂等处理。"],
      ),
    },
    {
      id: "task-refresh",
      selectors: [".table-toolbar .btn"],
      title: "刷新｜保留查询条件",
      html: specHtml(
        "重新读取当前筛选条件下的最新任务数据。",
        ["不重置状态、门店、时间范围、操作员和当前页。"],
        ["成功后同步刷新列表与总数。"],
        ["失败时保留原数据并提示重试。"],
      ),
    },
    {
      id: "task-pagination",
      selectors: [".pager"],
      title: "分页｜总数一致性",
      html: specHtml(
        "切换当前筛选结果的数据页。",
        ["总条数、当前可见行和页码必须使用同一次查询结果。"],
        ["上一页、下一页和指定页码均保留筛选条件。"],
        ["无数据时总数为 0，翻页按钮不可用。"],
      ),
    },
  ];

  const detailSpecTargets = [
    {
      id: "detail-overview",
      selectors: [".receipt-record-summary"],
      title: "回单详情｜处理目标与状态",
      html: specHtml(
        "操作员在本页核对原始回单、确认唯一销售订单、修正实际出库数并提交。",
        [
          "一张销售回单只关联一张销售订单；销售订单与销售出库单一对一，但本流程直接更新销售订单实际出库数。",
          "待处理允许编辑和提交；确认提交并写入成功后立即变为已完成。",
          "已完成详情只读，不允许再次修改或更换关联。",
        ],
        ["页面保留来源材料、候选订单、回单组及商品明细四个业务区域。"],
        ["保存失败保持待处理；提交写入失败不得变更任务状态。"],
      ),
    },
    {
      id: "detail-source",
      selectors: [".receipt-source-pane"],
      title: "来源材料｜审核凭证",
      html: specHtml(
        "集中展示生成本次回单任务的原始文件、群聊消息、基础信息与定位来源。",
        [
          "来源内容只读，作为操作员判断门店、单据编号、商品和实收数量的凭证。",
          "切换标签不改变回单编辑内容。",
        ],
        ["下载原文件或定位群聊原消息，用于人工复核。"],
        ["文件失效时保留文件名并提示无法下载；原消息被撤回时显示历史快照。"],
      ),
    },
    {
      id: "detail-source-tabs",
      selectors: [".source-tabs"],
      title: "来源标签｜基本信息、群聊消息、定位来源",
      html: specHtml(
        "在同一来源卡片内切换三类只读凭证。",
        [
          "基本信息：回单编号、门店、来源群聊、签收时间、处理状态。",
          "群聊消息：原始附件和消息文本。",
          "定位来源：原消息所在群聊及发送时间。",
        ],
        ["切换后仅更新左侧内容，不刷新整页。"],
        ["当前标签无内容时展示对应空状态。"],
      ),
    },
    {
      id: "detail-candidates",
      selectors: [".candidate-order-panel"],
      title: "选择销售订单｜候选生成与唯一关联",
      html: specHtml(
        "系统根据 AI 识别的门店、单据编号、商品及数量生成候选销售订单，由操作员确认唯一关联。",
        [
          "只查询状态为配送中或已签收的销售订单。",
          "单据编号命中时优先精确匹配；未唯一命中时再结合门店、时间、商品与数量缩小范围。",
          "一张回单只能单选一张销售订单；已关联其他回单的订单不可选择。",
        ],
        ["修改回单组的门店或单据编号后，候选列表同步刷新；选择新订单需确认后重建商品匹配。"],
        ["无候选时不得提交；候选不唯一时必须人工选择。"],
      ),
    },
    {
      id: "detail-period",
      selectors: ["[data-order-period]"],
      title: "下单时间｜候选订单范围",
      html: specHtml(
        "限制候选销售订单的下单时间范围。",
        [
          "选项为今天、近7天、近一个月、近三个月。",
          "分别覆盖当前自然日、当前日及前6日、前29日、前89日；默认近7天。",
        ],
        ["切换后立即按当前门店、单据编号和时间范围刷新候选列表。"],
        ["时间范围内无订单时显示空候选，不自动扩大范围。"],
      ),
    },
    {
      id: "detail-order-choice",
      selectors: [".candidate-order-table", "[data-select-order]"],
      title: "候选订单单选｜关联与重建",
      html: specHtml(
        "选择本回单最终要写入的销售订单。",
        [
          "列表字段为销售订单号、门店、下单时间和状态。",
          "切换订单时清除旧订单商品匹配及人工修改，用原始 AI 结果按新订单商品顺序重新匹配。",
          "旧订单如已被当前回单写入，必须先撤销本回单影响再向新订单应用，整个过程保持原子性。",
        ],
        ["选择与当前关联不同的订单时弹出确认；成功后刷新回单组和商品行。"],
        ["重建任一步失败时恢复原关联、原商品匹配及原订单数据。"],
      ),
    },
    {
      id: "detail-group",
      selectors: [".related-order-panel", ".receipt-ai-panel"],
      title: "回单组｜编辑与回写范围",
      html: specHtml(
        "一张回单只有一个回单组，包含门店、签收时间、单据编号、备注和商品明细。",
        [
          "门店与单据编号默认来自 AI，可人工修改，并同步影响候选订单。",
          "商品明细最终回写销售订单的实际出库数；出库数量只读。",
        ],
        ["保存只保存草稿；确认提交才校验并写入销售订单。"],
        ["未关联订单、数量不合法或人工新增行不完整时不得提交。"],
      ),
    },
    {
      id: "detail-store",
      selectors: [".merchant-field"],
      title: "门店｜识别值与候选联动",
      html: specHtml(
        "回单归属门店，默认采用 AI 识别结果，操作员可修正。",
        ["修改后与单据编号、下单时间共同刷新候选销售订单，不直接更换当前关联。"],
        ["输入后失焦触发候选刷新；保存记录当前值。"],
        ["门店为空时不生成候选订单，确认提交被阻止。"],
      ),
    },
    {
      id: "detail-sign-time",
      selectors: [".sign-time-field"],
      title: "签收时间｜业务发生时间",
      html: specHtml(
        "记录客户现场完成签收的日期和时间。",
        ["日期与时分共同组成签收时间；待处理可修改，已完成只读。"],
        ["保存草稿时写入回单，确认提交时一并固化。"],
        ["日期或时间为空时不得确认提交。"],
      ),
    },
    {
      id: "detail-document",
      selectors: [".document-number-field"],
      title: "单据编号｜订单定位条件",
      html: specHtml(
        "销售订单编号与对应销售出库单编号一致，本页统一称为单据编号。",
        [
          "默认采用 AI 识别值，操作员可修改。",
          "系统用该编号优先精确匹配候选销售订单。",
        ],
        ["修改后同步刷新上方候选订单，但不直接改变已选关联。"],
        ["编号未识别或输入为空时，改用门店、时间、商品和数量生成候选。"],
      ),
    },
    {
      id: "detail-remark",
      selectors: [".receipt-form-grid .wide"],
      title: "回单备注｜人工调整依据",
      html: specHtml(
        "记录破损、字迹模糊、数量修正等整张回单级说明。",
        ["默认可承接 AI 提取的备注，操作员可补充；不得替代商品行备注。"],
        ["保存或确认提交时一并提交。"],
        ["超出后端长度限制时阻止保存并提示剩余可输入长度。"],
      ),
    },
    {
      id: "detail-products",
      selectors: [".quantity-table"],
      title: "商品明细｜匹配、排序与数量口径",
      html: specHtml(
        "按关联销售订单商品顺序展示商品，并承载实际出库数的核对与回写。",
        [
          "未关联订单时按 AI 原始识别顺序；关联后按销售订单商品顺序重建。",
          "AI 漏识别的订单商品保留原位置，实际出库数填 0，不增加漏识别标签。",
          "AI 多识别或无法一一匹配的重复条目按 AI 顺序追加到末尾，默认不回写。",
          "差异＝出库数量－实际出库数，输入时实时计算。",
        ],
        ["行内加号在当前行后新增空白行；减号删除当前回单商品行；底部新增商品追加空白行。"],
        ["出库数量只读；实际出库数允许 0 和小数，不允许空值、负数或非数字。"],
      ),
    },
    {
      id: "detail-outbound",
      selectors: [".quantity-table th:nth-child(4)", "[data-quantity-row] td:nth-child(4)"],
      title: "出库数量｜只读基准",
      html: specHtml(
        "来自销售订单的系统已有出库数量，是差异计算基准。",
        ["回单页面不得修改；关联订单变化时随新订单商品明细更新。"],
        ["用于实时计算差异。"],
        ["订单外 AI 条目没有出库数量，显示“--”且不直接回写。"],
      ),
    },
    {
      id: "detail-actual",
      selectors: [".quantity-table th:nth-child(5)", ".actual-input"],
      title: "实际出库数｜商户实收数回写字段",
      html: specHtml(
        "AI 识别的商户实收数与销售订单实际出库数共用此字段，操作员在此直接修正。",
        [
          "AI 匹配成功时预填识别数量；漏识别的订单商品填 0。",
          "允许 0 和小数，不允许空值、负数或非数字。",
          "确认提交成功后写入销售订单实际出库数。",
        ],
        ["输入时实时更新差异；修改后自动保存草稿，保存按钮可立即保存。"],
        ["校验失败保留输入并定位当前行，不写入销售订单。"],
      ),
    },
    {
      id: "detail-difference",
      selectors: [".quantity-table th:nth-child(6)", ".variance"],
      title: "差异｜实时计算口径",
      html: specHtml(
        "用于反映原出库数量与客户实收数量之间的差额。",
        ["差异＝出库数量－实际出库数；正数表示少收，负数表示多收，0 表示一致。"],
        ["实际出库数变化时当前行立即重算。"],
        ["订单外条目缺少出库数量时差异显示“--”。"],
      ),
    },
    {
      id: "detail-row-actions",
      selectors: ["[data-add-row]", "[data-delete-row]", "[data-add-product]"],
      title: "新增/删除商品行｜人工补录",
      html: specHtml(
        "用于补充 AI 未形成的商品条目或移除不应保留的回单行。",
        [
          "行内加号在当前行后插入空白行；底部新增商品在末尾追加。",
          "减号只删除当前回单行，不删除销售订单原商品。",
          "人工新增行提交前必须补全商品名称、实际出库数和单位。",
        ],
        ["新增后聚焦商品名称；删除后重新编号并保存草稿。"],
        ["已完成任务禁用新增和删除；最后一条订单商品不可通过删除绕过订单完整性校验。"],
      ),
    },
    {
      id: "detail-save",
      selectors: ["[data-save-now]"],
      title: "保存｜草稿持久化",
      html: specHtml(
        "保存当前关联、回单字段和商品编辑结果，但不写入销售订单、不改变任务状态。",
        ["仅保存通过字段级校验的数据；同一任务重复保存覆盖当前草稿版本。"],
        ["成功提示已保存；失败保留页面输入并允许重试。"],
        ["保存成功后任务仍为待处理；已完成任务不可保存。"],
      ),
    },
    {
      id: "detail-submit",
      selectors: ["[data-confirm-submit]"],
      title: "确认提交｜写入与状态终点",
      html: specHtml(
        "将核对后的实际出库数写入已关联销售订单，成功后完成回单任务。",
        [
          "前置条件：已唯一关联销售订单；门店、签收时间、单据编号有效；订单商品实际出库数合法；人工新增行完整。",
          "写入成功后任务立即从待处理变为已完成，并进入只读状态。",
          "销售订单与销售回单一一对应，已完成任务不得再次提交。",
        ],
        ["提交期间按钮禁用防重复；成功提示并切换只读详情。"],
        ["任一写入失败时整体回滚，任务保持待处理，保留草稿并展示失败原因。"],
      ),
    },
  ];

  function bindSpecDrawer() {
    const drawer = one("#specDrawer");
    const mask = one("#drawerMask");
    const template = one("#pageSpec");
    const body = one("#specDrawerBody");
    if (!drawer || !mask || !template || !body) return;

    const page = document.body.dataset.page || "";
    const targets = page === "receipts" ? taskSpecTargets : page.startsWith("detail-") ? detailSpecTargets : [];
    const title = one(".spec-drawer-head strong", drawer);
    let specMode = false;

    targets.forEach((target) => {
      target.selectors.forEach((selector) => {
        all(selector).forEach((element) => {
          if (!element.dataset.specId) element.dataset.specId = target.id;
          if (!element.hasAttribute("tabindex") && !element.matches("button, a, input, select, textarea")) {
            element.setAttribute("tabindex", "0");
          }
        });
      });
    });

    const targetById = new Map(targets.map((target) => [target.id, target]));
    const renderOverview = () => {
      if (title) title.textContent = "当前页面业务说明";
      body.innerHTML = template.innerHTML;
    };
    const toggleDrawer = (open) => {
      drawer.classList.toggle("open", open);
      mask.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
    };
    const restoreDisabledControls = () => {
      all("[data-spec-was-disabled]").forEach((control) => {
        control.disabled = true;
        delete control.dataset.specWasDisabled;
      });
    };
    const setSpecMode = (enabled) => {
      specMode = enabled;
      document.body.classList.toggle("spec-mode", enabled);
      all("[data-spec-toggle]").forEach((button) => {
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = enabled ? "退出说明" : "业务说明";
      });
      if (enabled) {
        all("[data-spec-id]:disabled").forEach((control) => {
          control.dataset.specWasDisabled = "true";
          control.disabled = false;
        });
        showToast("说明模式已开启，点击蓝色标记区域查看规则");
      } else {
        restoreDisabledControls();
        toggleDrawer(false);
      }
    };
    const openTarget = (element) => {
      const target = targetById.get(element?.dataset.specId);
      if (!target) return;
      if (title) title.textContent = target.title;
      body.innerHTML = target.html;
      toggleDrawer(true);
    };

    renderOverview();
    all("[data-spec-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => setSpecMode(!specMode));
    });
    document.addEventListener(
      "click",
      (event) => {
        if (!specMode) return;
        const target = event.target.closest("[data-spec-id]");
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openTarget(target);
      },
      true,
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (!specMode || !["Enter", " "].includes(event.key)) return;
        const target = event.target.closest("[data-spec-id]");
        if (!target) return;
        event.preventDefault();
        openTarget(target);
      },
      true,
    );
    all("[data-spec-close]").forEach((button) => {
      button.addEventListener("click", () => toggleDrawer(false));
    });
    mask.addEventListener("click", () => toggleDrawer(false));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (drawer.classList.contains("open")) toggleDrawer(false);
      else if (specMode) setSpecMode(false);
    });
  }

  function bindTabs() {
    all("[data-tabs]").forEach((root) => {
      const buttons = all("[data-tab-target]", root);
      const panels = all("[data-tab-panel]", root);
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const key = button.dataset.tabTarget;
          buttons.forEach((item) =>
            item.classList.toggle("active", item === button),
          );
          panels.forEach((panel) =>
            panel.classList.toggle("active", panel.dataset.tabPanel === key),
          );
        });
      });
    });
  }

  function bindTaskFilters() {
    const table = one("[data-task-table]");
    if (!table) return;
    const status = one("[data-filter-status]");
    const merchant = one("[data-filter-merchant]");
    const operator = one("[data-filter-operator]");
    const start = one("[data-filter-start]");
    const end = one("[data-filter-end]");
    const count = one("[data-result-count]");
    const pagerCount = one("[data-pager-count]");

    const query = new URLSearchParams(window.location.search);
    if (status && query.get("status")) status.value = query.get("status");

    const apply = () => {
      const statusValue = status?.value || "all";
      const merchantValue = merchant?.value || "all";
      const operatorValue = operator?.value || "all";
      const startValue = start?.value || "";
      const endValue = end?.value || "";
      if (startValue && endValue && startValue > endValue) {
        showToast("开始日期不能晚于结束日期");
        return;
      }
      let visible = 0;

      all(".task-row", table).forEach((row) => {
        const taskDate = (row.dataset.time || "").slice(0, 10);
        const matchesStatus =
          statusValue === "all" || row.dataset.status === statusValue;
        const matchesMerchant =
          merchantValue === "all" || row.dataset.merchant === merchantValue;
        const matchesOperator =
          operatorValue === "all" || row.dataset.operator === operatorValue;
        const matchesStart = !startValue || taskDate >= startValue;
        const matchesEnd = !endValue || taskDate <= endValue;
        const show =
          matchesStatus &&
          matchesMerchant &&
          matchesOperator &&
          matchesStart &&
          matchesEnd;
        row.classList.toggle("hidden", !show);
        if (show) visible += 1;
      });

      one(".empty-row", table)?.classList.toggle("hidden", visible !== 0);
      if (count) count.textContent = String(visible);
      if (pagerCount) pagerCount.textContent = String(visible);
    };

    one("[data-apply-filter]")?.addEventListener("click", apply);
    one("[data-reset-filter]")?.addEventListener("click", () => {
      if (status) status.value = "all";
      if (merchant) merchant.value = "all";
      if (operator) operator.value = "all";
      if (start) start.value = "2026-07-25";
      if (end) end.value = "2026-07-27";
      apply();
    });

    all("[data-delete-task]", table).forEach((button) => {
      button.addEventListener("click", () => {
        const row = button.closest(".task-row");
        if (!row) return;
        pendingDeleteRow = row;
        const target = one("[data-delete-task-name]");
        if (target) target.textContent = row.dataset.taskId || "当前回单";
        openModal("deleteTaskConfirm");
      });
    });

    one("[data-confirm-delete-task]")?.addEventListener("click", () => {
      if (!pendingDeleteRow) return;
      pendingDeleteRow.remove();
      pendingDeleteRow = null;
      closeModal("deleteTaskConfirm");
      apply();
      showToast("回单任务已删除");
    });
    apply();
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "--";
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    return Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function setTaskState(state) {
    all("[data-task-status]").forEach((badge) => {
      badge.classList.remove("processing", "pending", "completed");
      badge.classList.add(
        state === "识别中"
          ? "processing"
          : state === "已完成"
            ? "completed"
            : "pending",
      );
      badge.innerHTML = `<span class="status-dot"></span>${state}`;
      badge.dataset.state = state;
    });
    all("[data-task-status-text]").forEach((item) => {
      item.textContent = state;
    });
  }

  function updateGlobalSaveState() {
    const global = one("[data-global-save]");
    if (!global) return;
    const rowStates = all("[data-row-save]");
    const hasSaving = rowStates.some((item) =>
      item.classList.contains("saving"),
    );
    const hasFailed = rowStates.some((item) =>
      item.classList.contains("failed"),
    );
    const invalid = all(".actual-input").some((input) =>
      input.classList.contains("invalid"),
    );

    global.classList.remove("good", "bad");
    if (hasSaving) {
      global.textContent = "● 正在自动保存…";
      return;
    }
    if (hasFailed || invalid) {
      global.classList.add("bad");
      global.textContent = "● 存在未保存内容";
      setTaskState("待处理");
      return;
    }
    global.classList.add("good");
    global.textContent = "● 全部数据已保存";
  }

  function updateQuantityRow(input) {
    const row = input.closest("[data-quantity-row]");
    if (!row) return false;
    const outbound = Number(row.dataset.outbound);
    const raw = input.value.trim();
    const actual = raw === "" ? Number.NaN : Number(raw);
    const valid =
      raw !== "" &&
      Number.isFinite(actual) &&
      actual >= 0 &&
      /^\d+(?:\.\d{0,2})?$/.test(raw);
    const variance = one("[data-variance]", row);
    const unit = row.dataset.unit || "";

    input.classList.toggle("invalid", !valid);
    row.classList.remove("row-short", "row-over", "row-error");
    if (!valid) {
      row.dataset.currentDiff = "";
      row.classList.add("row-error");
      if (variance) {
        variance.textContent = "--";
        variance.className = "variance";
      }
      updateGlobalSaveState();
      return false;
    }

    const difference =
      Math.round((outbound - actual + Number.EPSILON) * 100) / 100;
    row.dataset.currentDiff = String(difference);
    if (variance) {
      variance.textContent = `${formatNumber(difference)} ${unit}`;
      variance.className = `variance ${
        difference > 0 ? "short" : difference < 0 ? "over" : "equal"
      }`;
    }
    if (difference > 0) row.classList.add("row-short");
    if (difference < 0) row.classList.add("row-over");
    return true;
  }

  function rowSaveElement(input) {
    return one("[data-row-save]", input.closest("[data-quantity-row]"));
  }

  function markRowState(input, state, message) {
    const target = rowSaveElement(input);
    if (!target) return;
    target.className = `row-save ${state}`;
    target.innerHTML =
      state === "failed"
        ? `${message}<br><button type="button" class="retry-save" data-retry-item="${input.dataset.itemId}">点击重试</button>`
        : message;
    bindRetryButtons();
    updateGlobalSaveState();
  }

  function quantityStorageKey(receiptId, itemId) {
    const orderField = one("[data-order-id-display]");
    const orderId =
      document.body.dataset.orderId ||
      orderField?.value ||
      orderField?.textContent.trim() ||
      "unassociated";
    return `${storagePrefix}:${receiptId}:${orderId}:${itemId}`;
  }

  function performSave(input) {
    if (!updateQuantityRow(input)) {
      markRowState(input, "failed", "请输入有效数量");
      return;
    }
    const receiptId = document.body.dataset.receiptId || "receipt-demo";
    const itemId = input.dataset.itemId;
    const failOnce =
      input.dataset.failOnce === "true" &&
      input.dataset.failedOnce !== "true";

    window.setTimeout(() => {
      if (failOnce) {
        input.dataset.failedOnce = "true";
        markRowState(input, "failed", "保存失败");
        setTaskState("待处理");
        return;
      }
      try {
        localStorage.setItem(
          quantityStorageKey(receiptId, itemId),
          input.value,
        );
      } catch {
        // The prototype remains usable when browser storage is unavailable.
      }
      const now = new Date().toLocaleTimeString("zh-CN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      markRowState(input, "saved", `已保存 ${now}`);
      const recent = one("[data-recent-save-time]");
      if (recent) recent.textContent = now;
      setTaskState("已完成");
    }, 480);
  }

  function scheduleSave(input, immediate = false) {
    const key = input.dataset.itemId || String(Math.random());
    if (!updateQuantityRow(input)) {
      window.clearTimeout(saveTimers.get(key));
      markRowState(input, "failed", "请输入有效数量");
      setTaskState("待处理");
      return;
    }
    markRowState(input, "saving", "保存中…");
    window.clearTimeout(saveTimers.get(key));
    saveTimers.set(
      key,
      window.setTimeout(() => performSave(input), immediate ? 20 : 650),
    );
  }

  function bindRetryButtons() {
    all("[data-retry-item]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const input = one(
          `.actual-input[data-item-id="${button.dataset.retryItem}"]`,
        );
        if (input) scheduleSave(input, true);
      });
    });
  }

  function bindQuantityEditing() {
    const inputs = all(".actual-input");
    if (!inputs.length) return;
    const receiptId = document.body.dataset.receiptId || "receipt-demo";

    inputs.forEach((input) => {
      if (input.dataset.quantityBound === "true") return;
      input.dataset.quantityBound = "true";
      let restored = false;
      try {
        const stored = localStorage.getItem(
          quantityStorageKey(receiptId, input.dataset.itemId),
        );
        if (stored !== null) {
          input.value = stored;
          input.dataset.failedOnce = "true";
          restored = true;
        }
      } catch {
        // Ignore unavailable or damaged local storage in this static prototype.
      }
      updateQuantityRow(input);
      if (restored) markRowState(input, "saved", "已保存（本地演示）");
      input.addEventListener("input", () => scheduleSave(input));
      input.addEventListener("blur", () => {
        const key = input.dataset.itemId;
        if (saveTimers.has(key)) {
          window.clearTimeout(saveTimers.get(key));
          scheduleSave(input, true);
        }
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") input.blur();
      });
    });

    bindRetryButtons();
    updateGlobalSaveState();

    all("[data-quantity-row]").forEach((row) => {
      row.addEventListener("click", (event) => {
        if (event.target.closest("input, button, a")) return;
        all(".recognition-box").forEach((box) =>
          box.classList.remove("active"),
        );
        one(`.recognition-box.${row.dataset.box}`)?.classList.add("active");
      });
    });

    if (document.body.dataset.quantityUnloadBound !== "true") {
      document.body.dataset.quantityUnloadBound = "true";
      window.addEventListener("beforeunload", (event) => {
        const hasFailed = all("[data-row-save]").some((item) =>
          item.classList.contains("failed"),
        );
        if (hasFailed) {
          event.preventDefault();
          event.returnValue = "";
        }
      });
    }
  }

  function bindManualSave() {
    all("[data-save-now]").forEach((button) => {
      button.addEventListener("click", () => {
        const inputs = all(".actual-input").filter(
          (input) => input.value.trim() !== "",
        );
        if (!inputs.length) {
          showToast("暂无可保存的实际出库数");
          return;
        }
        inputs.forEach((input) => scheduleSave(input, true));
        showToast("正在保存实际出库数");
      });
    });
  }

  function bindConfirmSubmit() {
    all("[data-confirm-submit]").forEach((button) => {
      if (button.dataset.submitBound === "true") return;
      button.dataset.submitBound = "true";
      button.addEventListener("click", () => {
        const orderId = document.body.dataset.orderId || "";
        if (!orderId) {
          showToast("请先选择销售订单");
          return;
        }

        const incompleteManualRow = all("[data-manual-row]").find((row) => {
          const productName = one(".detail-product-input", row)?.value.trim();
          const actual = one(".local-actual-input", row)?.value.trim();
          return !productName || !actual;
        });
        if (incompleteManualRow) {
          one(".detail-product-input", incompleteManualRow)?.focus();
          showToast("请补全新增商品的名称和实际出库数");
          return;
        }

        const writebackInputs = all(".actual-input");
        const invalidInput = writebackInputs.find(
          (input) => !updateQuantityRow(input),
        );
        if (invalidInput) {
          invalidInput.focus();
          showToast("请检查实际出库数");
          return;
        }

        button.disabled = true;
        button.textContent = "提交中…";
        writebackInputs.forEach((input) => scheduleSave(input, true));
        window.setTimeout(() => {
          setTaskState("已完成");
          button.disabled = false;
          button.textContent = "确认提交";
          showToast("销售回单已确认提交");
        }, 720);
      });
    });
  }

  function renderAttachments() {
    const list = one("[data-attachment-list]");
    if (!list) return;
    list.innerHTML = attachments
      .map(
        (file, index) => `
          <span class="attachment">
            <b>${file.type.includes("pdf") ? "PDF" : file.type.includes("sheet") || file.name.endsWith(".xlsx") ? "XLS" : "IMG"}</b>
            <span>${escapeHTML(file.name)}</span>
            <button type="button" data-remove-attachment="${index}" aria-label="移除 ${escapeHTML(file.name)}">×</button>
          </span>
        `,
      )
      .join("");
    all("[data-remove-attachment]", list).forEach((button) => {
      button.addEventListener("click", () => {
        attachments.splice(Number(button.dataset.removeAttachment), 1);
        renderAttachments();
      });
    });
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function acceptFiles(fileList) {
    const supported = [
      "image/png",
      "image/jpeg",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const incoming = [...fileList];
    const rejected = incoming.filter(
      (file) =>
        !supported.includes(file.type) &&
        !/\.(png|jpe?g|pdf|xlsx)$/i.test(file.name),
    );
    const accepted = incoming.filter((file) => !rejected.includes(file));
    attachments = [...attachments, ...accepted].slice(0, 8);
    renderAttachments();
    if (rejected.length) showToast("存在不支持的文件，已自动忽略");
  }

  function bindEntryPage() {
    const root = one("[data-entry-page]");
    if (!root) return;
    const textarea = one("[data-entry-text]", root);
    const fileInput = one("[data-file-input]", root);
    const composer = one(".composer", root);
    const contextName = one("[data-context-name]", root);
    const sendButton = one("[data-send-receipt]", root);
    const customerSelect = one("[data-entry-customer]", root);
    const customerPicker = customerSelect?.closest(".entry-customer-picker");
    let selectedContext = "";
    let selectedCustomer = "";

    all("[data-source-mode]", root).forEach((button) => {
      button.addEventListener("click", () => {
        all("[data-source-mode]", root).forEach((item) =>
          item.classList.toggle("active", item === button),
        );
        const mode = button.dataset.sourceMode;
        const isGroupMode = mode === "group";
        all(".entry-list-item", root).forEach((item) =>
          item.classList.toggle("hidden", item.dataset.kind !== mode),
        );
        selectedContext = "";
        selectedCustomer = isGroupMode ? customerSelect?.value || "" : "";
        customerPicker?.classList.toggle("hidden", !isGroupMode);
        all(".entry-list-item", root).forEach((item) =>
          item.classList.remove("active"),
        );
        if (contextName) contextName.textContent = "尚未选择来源";
      });
    });

    all(".entry-list-item", root).forEach((item) => {
      item.addEventListener("click", () => {
        all(".entry-list-item", root).forEach((row) =>
          row.classList.remove("active"),
        );
        item.classList.add("active");
        selectedContext = item.dataset.name || "";
        const isGroupItem = item.dataset.kind === "group";
        selectedCustomer = isGroupItem ? customerSelect?.value || "" : "";
        customerPicker?.classList.toggle("hidden", !isGroupItem);
        if (contextName) contextName.textContent = selectedContext;
      });
    });

    customerSelect?.addEventListener("change", () => {
      selectedCustomer = customerSelect.value;
    });

    one("[data-entry-search]", root)?.addEventListener("input", (event) => {
      const keyword = event.target.value.trim().toLowerCase();
      const activeMode =
        one("[data-source-mode].active", root)?.dataset.sourceMode || "merchant";
      all(".entry-list-item", root).forEach((item) => {
        const show =
          item.dataset.kind === activeMode &&
          (!keyword ||
            (item.dataset.search || "").toLowerCase().includes(keyword));
        item.classList.toggle("hidden", !show);
      });
    });

    one("[data-upload-trigger]", root)?.addEventListener("click", () =>
      fileInput?.click(),
    );
    fileInput?.addEventListener("change", () => {
      acceptFiles(fileInput.files || []);
      fileInput.value = "";
    });

    ["dragenter", "dragover"].forEach((type) => {
      composer?.addEventListener(type, (event) => {
        event.preventDefault();
        composer.classList.add("dragging");
      });
    });
    ["dragleave", "drop"].forEach((type) => {
      composer?.addEventListener(type, (event) => {
        event.preventDefault();
        composer.classList.remove("dragging");
      });
    });
    composer?.addEventListener("drop", (event) => {
      acceptFiles(event.dataTransfer?.files || []);
    });

    sendButton?.addEventListener("click", () => {
      const text = textarea?.value.trim() || "";
      if (!selectedContext) {
        showToast("请先选择客户或群聊");
        return;
      }
      const activeMode =
        one("[data-source-mode].active", root)?.dataset.sourceMode || "merchant";
      if (activeMode === "group" && !selectedCustomer) {
        showToast("请选择群聊对应的客户");
        return;
      }
      if (!text && !attachments.length) {
        showToast("请至少输入文字或上传一个回单附件");
        return;
      }
      sendButton.disabled = true;
      const feed = one("[data-entry-feed]", root);
      const empty = one(".entry-empty", root);
      empty?.classList.add("hidden");
      if (feed) {
        feed.insertAdjacentHTML(
          "beforeend",
          `<div class="message">${text ? escapeHTML(text) : "已发送回单附件"}${
            attachments.length
              ? `<div class="message-time">${attachments.length} 个附件 · ${escapeHTML(selectedContext)}</div>`
              : `<div class="message-time">${escapeHTML(selectedContext)}</div>`
          }</div>
          <div class="message system">
            <span class="status processing"><span class="status-dot"></span>识别中</span>
            已创建销售回单任务 SR-20260727-018，正在识别商户实收数量并关联销售订单。
            <div class="message-time">刚刚</div>
          </div>`,
        );
        feed.scrollTop = feed.scrollHeight;
      }
      textarea.value = "";
      attachments = [];
      renderAttachments();
      window.setTimeout(() => {
        if (feed) {
          feed.insertAdjacentHTML(
            "beforeend",
            `<div class="message system">
              <span class="status pending"><span class="status-dot"></span>待处理</span>
              已识别 3 个商品，其中 1 个实际出库数需要人工补充。
              <a class="text-btn" href="receipt-detail.html">查看回单</a>
              <div class="message-time">刚刚</div>
            </div>`,
          );
          feed.scrollTop = feed.scrollHeight;
        }
        sendButton.disabled = false;
      }, 900);
    });
  }

  function setDetailText(selector, value) {
    all(selector).forEach((target) => {
      target.textContent = value;
    });
  }

  function setDetailValue(selector, value) {
    all(selector).forEach((target) => {
      if ("value" in target) target.value = value;
      else target.textContent = value;
    });
  }

  function renderScenarioCandidateOrders(config) {
    const body = one(".candidate-order-table tbody");
    if (!body) return;
    const rows = config.candidateIds
      .map((orderId) => {
        const order = receiptOrderCatalog[orderId];
        if (!order) return "";
        const checked = config.orderId === orderId ? " checked" : "";
        const time = order.orderTime || `${order.orderDate}T00:00`;
        return `
          <tr${checked ? ' class="selected"' : ""} data-order-candidate data-order-number="${escapeHTML(order.id)}" data-order-merchant="${escapeHTML(order.merchant)}" data-order-time="${escapeHTML(time)}">
            <td><input type="radio" name="candidate-order" aria-label="选择销售订单 ${escapeHTML(order.id)}" data-select-order="${escapeHTML(order.id)}" data-order-merchant="${escapeHTML(order.merchant)}"${checked}></td>
            <td><strong>${escapeHTML(order.id)}</strong></td>
            <td>${escapeHTML(order.merchant)}</td>
            <td>${escapeHTML(time.replace("T", " "))}</td>
            <td>${escapeHTML(order.orderStatus)}</td>
          </tr>`;
      })
      .join("");
    body.innerHTML = `${rows}<tr class="empty-row hidden" data-order-candidate-empty><td colspan="5">未找到匹配的销售订单</td></tr>`;
  }

  function applyReceiptScenario() {
    if (!document.body.dataset.page?.startsWith("detail-")) return;
    const scenarioKey = new URLSearchParams(window.location.search).get(
      "scenario",
    );
    const config = receiptScenarioCatalog[scenarioKey];
    if (!config) return;

    document.body.dataset.scenario = scenarioKey;
    document.body.dataset.receiptId = config.receiptId;
    if (config.orderId) {
      document.body.dataset.orderId = config.orderId;
      document.body.dataset.orderUnassociated = "false";
    } else {
      delete document.body.dataset.orderId;
      document.body.dataset.orderUnassociated = "true";
    }

    const associatedOrder = config.orderId
      ? receiptOrderCatalog[config.orderId]
      : null;
    if (associatedOrder && config.orderLines) {
      associatedOrder.lines = config.orderLines.map((line) => ({ ...line }));
    }
    if (associatedOrder && config.orderStatus) {
      associatedOrder.orderStatus = config.orderStatus;
    }

    activeReceiptAiExceptions = receiptAiExceptions.filter((item) =>
      (config.exceptionIds || []).includes(item.id),
    );
    activeReceiptAiOriginalLines = (config.aiLines || []).map((line) => ({
      ...line,
    }));

    setTaskState(config.state);
    setDetailText("[data-detail-receipt-id]", config.receiptId);
    setDetailText("[data-detail-merchant]", config.merchant);
    setDetailText("[data-detail-source]", config.group);
    setDetailText("[data-detail-sign-time]", config.createdTime);
    setDetailText("[data-detail-group]", config.group);
    setDetailText("[data-detail-operator]", config.operator);
    setDetailText("[data-detail-created]", config.createdTime);
    setDetailText(
      "[data-detail-file-name]",
      `${config.receiptId.replaceAll("-", "_")}_RECEIPT.jpg`,
    );
    setDetailValue("[data-order-merchant-display]", config.merchant);
    setDetailValue("[data-order-id-display]", config.documentNumber);
    setDetailValue("[data-detail-sign-date]", config.signDate);
    setDetailValue("[data-detail-sign-clock]", config.signClock);
    setDetailValue("[data-detail-remark]", config.remark);

    const message = one("[data-detail-message]");
    if (message) {
      message.innerHTML = [
        `<p>--- ${escapeHTML(config.signDate)} / ${escapeHTML(config.group)} ---</p>`,
        ...config.messages.map((text) => `<p>${escapeHTML(text)}</p>`),
        `<span>${escapeHTML(config.author)} · ${escapeHTML(config.createdTime)}</span>`,
      ].join("");
    }
    const location = one("[data-detail-location]");
    if (location) {
      location.innerHTML = `${escapeHTML(config.group)}<br>${escapeHTML(config.createdTime)} · ${escapeHTML(config.author)}`;
    }

    renderScenarioCandidateOrders(config);
  }

  function renderOrderLine(line, index) {
    const actual = line.actual === "" ? "0" : String(line.actual);
    const difference = line.outbound - Number(actual);
    const rowClass =
      difference > 0 ? "row-short" : difference < 0 ? "row-over" : "";
    const varianceClass =
      difference > 0 ? "short" : difference < 0 ? "over" : "equal";
    const recognitionText = line.aiText || "--";
    return `
      <tr class="${rowClass}" data-product-row data-quantity-row data-order-line data-outbound="${line.outbound}" data-unit="${escapeHTML(line.unit)}" data-current-diff="${difference}">
        <td data-row-index>${index + 1}</td>
        <td><span class="receipt-recognition-text">${escapeHTML(recognitionText)}</span></td>
        <td><strong>${escapeHTML(line.name)}</strong></td>
        <td class="right"><strong>${formatNumber(line.outbound)}</strong></td>
        <td><div class="quantity-input-wrap"><input class="quantity-input actual-input" inputmode="decimal" value="${escapeHTML(actual)}" placeholder="请填写" aria-label="${escapeHTML(line.name)}实际出库数" data-item-id="${escapeHTML(line.id)}"><span class="unit-suffix">${escapeHTML(line.unit)}</span></div></td>
        <td class="right"><span class="variance ${varianceClass}" data-variance>${formatNumber(difference)} ${escapeHTML(line.unit)}</span></td>
        <td>${escapeHTML(line.unit)}</td>
        <td><input class="detail-remark-input" value="${escapeHTML(line.remark)}" placeholder="填写备注" aria-label="${escapeHTML(line.name)}备注"></td>
        <td>${renderRowActions(line.name)}</td>
      </tr>`;
  }

  function renderRowActions(name = "当前商品") {
    const safeName = escapeHTML(name);
    return `<div class="row-action-buttons">
      <button class="row-action add" type="button" data-add-row aria-label="在${safeName}后新增空白行">＋</button>
      <button class="row-action remove" type="button" data-delete-row aria-label="删除${safeName}行">−</button>
    </div>`;
  }

  function renderUnmatchedRow(item, index) {
    return `
      <tr data-product-row data-unmatched-row data-exception-id="${escapeHTML(item.id)}">
        <td data-row-index>${index + 1}</td>
        <td><span class="receipt-recognition-text">${escapeHTML(item.text || "--")}</span></td>
        <td><strong>${escapeHTML(item.name)}</strong></td>
        <td class="right">--</td>
        <td><div class="quantity-input-wrap"><input class="quantity-input local-actual-input" inputmode="decimal" value="${escapeHTML(item.actual ?? "")}" placeholder="请填写" aria-label="${escapeHTML(item.name)}实收数"><span class="unit-suffix">${escapeHTML(item.unit)}</span></div></td>
        <td class="right">--</td>
        <td>${escapeHTML(item.unit)}</td>
        <td><input class="detail-remark-input" value="" placeholder="填写备注" aria-label="${escapeHTML(item.name)}备注"></td>
        <td>${renderRowActions(item.name)}</td>
      </tr>`;
  }

  function renderAiLine(item, index) {
    return `
      <tr data-product-row data-ai-line>
        <td data-row-index>${index + 1}</td>
        <td><span class="receipt-recognition-text">${escapeHTML(item.text || "--")}</span></td>
        <td><strong>${escapeHTML(item.name)}</strong></td>
        <td class="right">--</td>
        <td><div class="quantity-input-wrap"><input class="quantity-input local-actual-input" inputmode="decimal" value="${escapeHTML(item.actual ?? "")}" placeholder="请填写" aria-label="${escapeHTML(item.name)}实收数"><span class="unit-suffix">${escapeHTML(item.unit)}</span></div></td>
        <td class="right">--</td>
        <td>${escapeHTML(item.unit)}</td>
        <td><input class="detail-remark-input" value="" placeholder="填写备注" aria-label="${escapeHTML(item.name)}备注"></td>
        <td>${renderRowActions(item.name)}</td>
      </tr>`;
  }

  function renderBlankRow() {
    const rowId = `MANUAL-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `
      <tr data-product-row data-manual-row data-manual-id="${rowId}">
        <td data-row-index></td>
        <td><span class="receipt-recognition-text">--</span></td>
        <td><input class="detail-product-input" value="" placeholder="请输入商品名称" aria-label="商品名称"></td>
        <td class="right">--</td>
        <td><div class="quantity-input-wrap"><input class="quantity-input local-actual-input" inputmode="decimal" value="" placeholder="请填写" aria-label="实际出库数"><span class="unit-suffix">斤</span></div></td>
        <td class="right">--</td>
        <td><input class="detail-unit-input" value="斤" aria-label="单位"></td>
        <td><input class="detail-remark-input" value="" placeholder="填写备注" aria-label="备注"></td>
        <td>${renderRowActions("空白商品")}</td>
      </tr>`;
  }

  function renumberProductRows() {
    all("[data-product-row]", one("[data-quantity-body]")).forEach(
      (row, index) => {
        const target = one("[data-row-index]", row);
        if (target) target.textContent = String(index + 1);
      },
    );
  }

  function bindLocalQuantityEditing() {
    all(".local-actual-input").forEach((input) => {
      if (input.dataset.localQuantityBound === "true") return;
      input.dataset.localQuantityBound = "true";
      input.addEventListener("input", () => {
        const raw = input.value.trim();
        const valid =
          raw === "" ||
          (/^\d+(?:\.\d{0,2})?$/.test(raw) && Number(raw) >= 0);
        input.classList.toggle("invalid", !valid);
      });
    });
  }

  function insertBlankProductRow(referenceRow = null) {
    const target = one("[data-quantity-body]");
    if (!target) return;
    if (referenceRow) {
      referenceRow.insertAdjacentHTML("afterend", renderBlankRow());
    } else {
      target.insertAdjacentHTML("beforeend", renderBlankRow());
    }
    renumberProductRows();
    bindLocalQuantityEditing();
    const newRow = referenceRow
      ? referenceRow.nextElementSibling
      : target.lastElementChild;
    one(".detail-product-input", newRow)?.focus();
  }

  function bindAddProductButton() {
    all("[data-add-product]").forEach((button) => {
      if (button.dataset.addProductBound === "true") return;
      button.dataset.addProductBound = "true";
      button.addEventListener("click", () => {
        insertBlankProductRow();
        showToast("已在明细末尾新增空白商品行");
      });
    });
  }

  function bindRowActions() {
    const target = one("[data-quantity-body]");
    if (!target || target.dataset.rowActionsBound === "true") return;
    target.dataset.rowActionsBound = "true";
    target.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-add-row]");
      const deleteButton = event.target.closest("[data-delete-row]");
      if (!addButton && !deleteButton) return;
      const row = event.target.closest("[data-product-row]");
      if (!row) return;

      if (addButton) {
        insertBlankProductRow(row);
        showToast("已在当前行后新增空白行");
        return;
      }

      const itemId = one(".actual-input", row)?.dataset.itemId;
      if (itemId && saveTimers.has(itemId)) {
        window.clearTimeout(saveTimers.get(itemId));
        saveTimers.delete(itemId);
      }
      row.remove();
      renumberProductRows();
      updateGlobalSaveState();
      showToast("已删除当前行");
    });
  }

  function renderQuantityRows(order) {
    const target = one("[data-quantity-body]");
    if (!target) return;
    if (!order) {
      target.innerHTML = activeReceiptAiOriginalLines
        .map((item, index) => renderAiLine(item, index))
        .join("");
    } else {
      const orderRows = order.lines
        .map((line, index) => renderOrderLine(line, index))
        .join("");
      const exceptionRows = activeReceiptAiExceptions
        .map((item, index) =>
          renderUnmatchedRow(item, order.lines.length + index),
        )
        .join("");
      target.innerHTML = `${orderRows}${exceptionRows}`;
    }
    target.hidden = false;
    renumberProductRows();
    bindQuantityEditing();
    bindLocalQuantityEditing();
    bindRowActions();
  }

  function initializeQuantityRows() {
    const target = one("[data-quantity-body]");
    if (!target) return;
    const initialOrderField = one("[data-order-id-display]");
    const initialOrderId =
      document.body.dataset.orderUnassociated === "true"
        ? ""
        : document.body.dataset.orderId ||
          initialOrderField?.value ||
          initialOrderField?.textContent.trim() ||
          "";
    if (initialOrderId) document.body.dataset.orderId = initialOrderId;
    renderQuantityRows(receiptOrderCatalog[initialOrderId] || null);
  }

  function renderAssociatedOrder(order) {
    all("[data-order-id-display]").forEach((item) => {
      if ("value" in item) item.value = order.id;
      else item.textContent = order.id;
    });
    all("[data-order-status-display]").forEach((item) => {
      if ("value" in item) item.value = order.orderStatus;
      else item.textContent = order.orderStatus;
    });
    all("[data-order-merchant-display]").forEach((item) => {
      if ("value" in item) item.value = order.merchant;
      else item.textContent = order.merchant;
    });
  }

  function clearReceiptDrafts() {
    const receiptId = document.body.dataset.receiptId || "receipt-demo";
    const prefix = `${storagePrefix}:${receiptId}:`;
    try {
      const keys = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key?.startsWith(prefix)) keys.push(key);
      }
      keys.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Reassociation still works when browser storage is unavailable.
    }
  }

  function updateOrderPickerState(orderId) {
    all("[data-select-order]").forEach((control) => {
      const isCurrent = control.dataset.selectOrder === orderId;
      if (control.matches('input[type="radio"]')) {
        control.checked = isCurrent;
        control.disabled = control.dataset.locked === "true";
        control
          .closest("[data-order-candidate]")
          ?.classList.toggle("selected", isCurrent);
        return;
      }
      control.disabled = isCurrent;
      control.classList.toggle("primary", isCurrent);
      control.textContent = isCurrent ? "当前关联" : "选择";
    });
  }

  function filterCandidateOrders(panel) {
    if (!panel) return;
    const activePeriod = one("[data-order-period]", panel)?.value || "7";
    const merchantKeyword =
      one("[data-candidate-merchant-input]")?.value.trim().toLowerCase() || "";
    const documentKeyword =
      one("[data-candidate-document-input]")?.value.trim().toLowerCase() || "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const periodDays =
      activePeriod === "today" ? 1 : Number.parseInt(activePeriod, 10) || 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (periodDays - 1));
    let visible = 0;

    all("[data-order-candidate]", panel).forEach((row) => {
      const orderNumber = (row.dataset.orderNumber || "").toLowerCase();
      const merchant = (row.dataset.orderMerchant || "").toLowerCase();
      const orderDate = new Date(row.dataset.orderTime || "");
      orderDate.setHours(0, 0, 0, 0);
      const matchesTime =
        !Number.isNaN(orderDate.getTime()) &&
        orderDate >= startDate &&
        orderDate <= today;
      const matchesMerchant =
        !merchantKeyword || merchant.includes(merchantKeyword);
      const matchesDocument =
        !documentKeyword || orderNumber.includes(documentKeyword);
      const matches = matchesTime && matchesMerchant && matchesDocument;
      row.classList.toggle("hidden", !matches);
      if (matches) visible += 1;
    });

    one("[data-order-candidate-empty]", panel)?.classList.toggle(
      "hidden",
      visible !== 0,
    );
  }

  function bindOrderSelection() {
    const initialOrderField = one("[data-order-id-display]");
    const initialOrderId =
      document.body.dataset.orderUnassociated === "true"
        ? ""
        : document.body.dataset.orderId ||
          initialOrderField?.value ||
          initialOrderField?.textContent.trim() ||
          "";
    if (initialOrderId) document.body.dataset.orderId = initialOrderId;
    updateOrderPickerState(initialOrderId);

    all(".candidate-order-panel").forEach((panel) => {
      one("[data-order-period]", panel)?.addEventListener("change", () =>
        filterCandidateOrders(panel),
      );
      filterCandidateOrders(panel);
    });

    all(
      "[data-candidate-merchant-input], [data-candidate-document-input]",
    ).forEach((input) => {
      input.addEventListener("input", () => {
        filterCandidateOrders(one(".candidate-order-panel"));
      });
    });

    all("[data-select-order]").forEach((control) => {
      if (control.dataset.orderBound === "true") return;
      control.dataset.orderBound = "true";
      const eventName = control.matches('input[type="radio"]')
        ? "change"
        : "click";
      control.addEventListener(eventName, () => {
        if (control.disabled) return;
        if (eventName === "change" && !control.checked) return;
        const orderId = control.dataset.selectOrder;
        if (orderId === document.body.dataset.orderId) return;
        if (!receiptOrderCatalog[orderId]) {
          showToast("该候选订单暂无可演示的销售订单商品明细");
          updateOrderPickerState(document.body.dataset.orderId || "");
          return;
        }
        pendingOrderId = orderId;
        const oldOrder = document.body.dataset.orderId || "--";
        const oldTarget = one("[data-reassociate-old]");
        const newTarget = one("[data-reassociate-new]");
        if (oldTarget) oldTarget.textContent = oldOrder;
        if (newTarget) newTarget.textContent = orderId;
        openModal("reassociateConfirm");
      });
    });

    all("#reassociateConfirm [data-close-modal]").forEach((button) => {
      if (button.dataset.orderCancelBound === "true") return;
      button.dataset.orderCancelBound = "true";
      button.addEventListener("click", () => {
        pendingOrderId = "";
        updateOrderPickerState(document.body.dataset.orderId || "");
      });
    });

    const confirm = one("[data-confirm-reassociate]");
    if (!confirm || confirm.dataset.bound === "true") return;
    confirm.dataset.bound = "true";
    confirm.addEventListener("click", () => {
      const nextOrder = receiptOrderCatalog[pendingOrderId];
      if (!nextOrder) return;
      const oldOrderId = document.body.dataset.orderId || "--";
      confirm.disabled = true;
      confirm.textContent = "正在撤销并重新匹配…";
      window.setTimeout(() => {
        clearReceiptDrafts();
        document.body.dataset.orderId = nextOrder.id;
        document.body.dataset.orderUnassociated = "false";
        renderAssociatedOrder(nextOrder);
        renderQuantityRows(nextOrder);
        updateOrderPickerState(nextOrder.id);
        filterCandidateOrders(one(".candidate-order-panel"));
        setTaskState("待处理");
        const recent = one("[data-recent-save-time]");
        if (recent) recent.textContent = "--";
        const result = one("[data-reassociation-result]");
        if (result) {
          result.classList.remove("hidden");
          result.innerHTML = `<strong>关联已更新</strong><span>${escapeHTML(oldOrderId)} → ${escapeHTML(nextOrder.id)}</span>`;
        }
        closeModal("reassociateConfirm");
        confirm.disabled = false;
        confirm.textContent = "确认更换并重新匹配";
        pendingOrderId = "";
        showToast(`已关联 ${nextOrder.id}，商品列表已重新匹配`);
      }, 700);
    });
  }

  function bindSearchTables() {
    all("[data-simple-search]").forEach((input) => {
      const target = document.getElementById(input.dataset.simpleSearch);
      if (!target) return;
      const rows = all("tbody tr[data-search]", target);
      input.addEventListener("input", () => {
        const keyword = input.value.trim().toLowerCase();
        let visible = 0;
        rows.forEach((row) => {
          const show =
            !keyword ||
            (row.dataset.search || "").toLowerCase().includes(keyword);
          row.classList.toggle("hidden", !show);
          if (show) visible += 1;
        });
        one(".empty-row", target)?.classList.toggle("hidden", visible !== 0);
      });
    });
  }

  function bindProcessingDemo() {
    const progress = one("[data-processing-progress]");
    const label = one("[data-processing-label]");
    const button = one("[data-refresh-processing]");
    if (!progress || !label || !button) return;
    let value = 64;
    button.addEventListener("click", () => {
      value = Math.min(92, value + 9);
      progress.style.width = `${value}%`;
      label.textContent = `${value}% · 正在匹配销售订单`;
      showToast("识别进度已刷新");
    });
  }

  function bindApplicationCenterLinks() {
    all(".back-app").forEach((link) => {
      link.href = "../index.html#home";
    });
    const brand = one(".brand");
    if (brand) {
      brand.href = "home.html";
      brand.title = "销售回单首页";
    }
  }

  function applyDetailReadOnlyMode() {
    if (document.body.dataset.readonly !== "true") return;

    all(".candidate-order-panel input[type='radio']").forEach((input) => {
      input.disabled = true;
    });
    all(".receipt-ai-panel input").forEach((input) => {
      input.readOnly = true;
      input.setAttribute("aria-readonly", "true");
    });
    all(
      "[data-save-now], [data-confirm-submit], [data-add-product], [data-add-row], [data-delete-row], [data-confirm-reassociate]",
    ).forEach((control) => {
      control.disabled = true;
    });
  }

  function init() {
    bindApplicationCenterLinks();
    bindAgentSwitcher();
    bindGlobalControls();
    bindTabs();
    bindTaskFilters();
    applyReceiptScenario();
    bindSpecDrawer();
    initializeQuantityRows();
    bindManualSave();
    bindConfirmSubmit();
    bindAddProductButton();
    bindEntryPage();
    bindOrderSelection();
    bindSearchTables();
    bindProcessingDemo();
    applyDetailReadOnlyMode();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
