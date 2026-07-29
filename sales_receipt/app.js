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
      orderTimeEnd: "2026-07-25T08:40",
      receiveTime: "2026-07-26T09:30",
      receiveTimeEnd: "2026-07-26T11:00",
      totalAmount: 1485.5,
      orderStatus: "已签收",
      matchLabel: "AI 唯一匹配",
      matchReason: "商户、订单号与商品组合命中",
      lines: [
        {
          id: "SKU-10021",
          name: "大白菜",
          spec: "散装",
          outbound: 25,
          price: 20,
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
          price: 30,
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
          price: 30,
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
          price: 9.5,
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
      orderTimeEnd: "2026-07-26T08:12",
      receiveTime: "2026-07-26T08:30",
      receiveTimeEnd: "2026-07-26T10:30",
      totalAmount: 1628,
      orderStatus: "已签收",
      matchLabel: "AI 唯一匹配",
      matchReason: "商户、订单号与商品组合命中",
      lines: [
        {
          id: "SKU-10021",
          name: "大白菜",
          spec: "散装",
          outbound: 25,
          price: 20,
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
          price: 34,
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
          price: 40,
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
      orderTimeEnd: "2026-07-27T07:55",
      receiveTime: "2026-07-27T10:00",
      receiveTimeEnd: "2026-07-27T12:00",
      totalAmount: 1756,
      orderStatus: "配送中",
      matchLabel: "人工选择",
      matchReason: "更换后按当前商品修改结果重新匹配",
      lines: [
        {
          id: "SKU-10021",
          name: "大白菜",
          spec: "散装",
          outbound: 30,
          price: 20,
          actual: "22",
          unit: "斤",
          aiText: "大白菜 22斤",
          remark: "保留当前人工核对结果",
        },
        {
          id: "SKU-10083",
          name: "青椒",
          spec: "中号",
          outbound: 15,
          price: 28,
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
          price: 26,
          actual: "18.5",
          unit: "斤",
          aiText: "油麦菜 18.5斤",
          remark: "保留当前人工核对结果",
        },
        {
          id: "SKU-10208",
          name: "西红柿",
          spec: "大果",
          outbound: 12,
          price: 8,
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
          price: 5,
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
      orderTimeEnd: "2026-07-26T08:52",
      receiveTime: "2026-07-26T09:30",
      receiveTimeEnd: "2026-07-26T11:00",
      totalAmount: 1286.5,
      orderStatus: "已签收",
      matchLabel: "AI 唯一匹配",
      matchReason: "门店、单据编号与商品组合命中",
      lines: [
        {
          id: "SKU-20021",
          name: "大白菜",
          spec: "散装",
          outbound: 20,
          price: 20,
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
          price: 30,
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
          price: 39.1,
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
      orderTimeEnd: "2026-07-26T08:03",
      receiveTime: "2026-07-26T09:00",
      receiveTimeEnd: "2026-07-26T10:30",
      totalAmount: 1368,
      orderStatus: "已签收",
      matchLabel: "AI 唯一匹配",
      matchReason: "门店、单据编号与商品组合命中",
      lines: [
        {
          id: "SKU-30021",
          name: "大白菜",
          spec: "散装",
          outbound: 25,
          price: 18,
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
          price: 30,
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
          price: 31,
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
      sceneLabel: "候选订单不唯一",
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
      aiOrderStart: "",
      aiOrderEnd: "",
      aiReceiveStart: "",
      aiReceiveEnd: "",
      aiTotalAmount: "",
      candidateIds: [
        "SO-20260725-1028",
        "SO-20260726-1066",
        "SO-20260727-1120",
      ],
      remark: "单据编号字迹模糊，待确认关联订单",
      messages: [
        "回单上的单据编号后四位字迹模糊，AI 仅识别到“SO-2026072”。",
        "门店识别为华南鲜食店，大白菜实收 22 斤，油麦菜实收 18.5 斤。",
        "系统匹配到多张候选销售订单，请操作员人工选择。",
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
      sceneLabel: "AI 识别完整，人工确认提交",
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
          price: 20,
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
          price: 28,
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
          price: 26,
          actual: "18.5",
          unit: "斤",
          aiText: "油麦菜 18.5斤",
          remark: "人工核对完成",
        },
      ],
      exceptionIds: [],
    },
    "extra-item": {
      sceneLabel: "AI 多识别订单外商品",
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
      sceneLabel: "AI 漏识别订单商品",
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
      sceneLabel: "单据编号唯一命中",
      receiptId: "SR-20260725-009",
      state: "待处理",
      merchant: "华南鲜食店",
      group: "华南鲜食店收货群",
      operator: "李娜",
      createdTime: "2026-07-25 18:44:20",
      signDate: "2026-07-25",
      signClock: "18:44",
      documentNumber: "SO-20260725-1028",
      orderId: "",
      aiOrderStart: "2026-07-25T08:30",
      aiOrderEnd: "2026-07-25T08:45",
      aiReceiveStart: "2026-07-26T09:20",
      aiReceiveEnd: "2026-07-26T11:10",
      aiTotalAmount: 1485.5,
      candidateIds: ["SO-20260725-1028"],
      remark: "单据编号唯一命中，待查询并确认关联",
      messages: [
        "AI 清晰识别单据编号 SO-20260725-1028。",
        "点击查询订单后，系统按订单号返回唯一销售订单，仍需操作员确认关联。",
        "大白菜实收 22 斤，青椒实收 12 斤，油麦菜实收 18.5 斤。",
      ],
      author: "刘店长",
      aiLines: [
        {
          id: "AI-UNIQUE-01",
          text: "大白菜 22斤",
          name: "大白菜",
          actual: "22",
          unit: "斤",
        },
        {
          id: "AI-UNIQUE-02",
          text: "青椒 12斤",
          name: "青椒",
          actual: "12",
          unit: "斤",
        },
        {
          id: "AI-UNIQUE-03",
          text: "油麦菜 18.5斤",
          name: "油麦菜",
          actual: "18.5",
          unit: "斤",
        },
      ],
      exceptionIds: [],
    },
    "merchant-multiple": {
      sceneLabel: "仅识别门店，候选订单不唯一",
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
      aiOrderStart: "",
      aiOrderEnd: "",
      aiReceiveStart: "",
      aiReceiveEnd: "",
      aiTotalAmount: "",
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
        <a class="agent-switch-link" href="../index.html#home">
          <span class="agent-app-icon platform">台</span>
          <span class="agent-switch-copy"><strong>录单平台首页</strong><span>返回应用中心</span></span>
        </a>
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
          "单据编号唯一命中：点击查询后只返回一张订单，仍需操作员确认关联。",
          "仅识别门店且候选不唯一：点击查询后按门店及其他已识别字段给出多张候选。",
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
        ["页面常驻来源材料、回单组和商品明细；候选订单仅在点击“查询订单”后以弹窗展示。"],
        ["保存失败保持待处理；提交写入失败不得变更任务状态。"],
      ),
    },
    {
      id: "detail-source",
      selectors: [".receipt-source-pane"],
      title: "来源材料｜审核凭证",
      html: specHtml(
        "集中展示纸质配送单回单、原始文件、群聊消息与定位来源。",
        [
          "来源内容只读，作为操作员判断门店、订单号、商品和实收数量的凭证。",
          "“定位来源”与“群聊消息”位于同一标题栏，定位时不离开原始消息内容。",
        ],
        ["下载原文件或定位群聊原消息，用于人工复核。"],
        ["文件失效时保留文件名并提示无法下载；原消息被撤回时显示历史快照。"],
      ),
    },
    {
      id: "detail-source-tabs",
      selectors: [".source-tabs-combined"],
      title: "来源区域｜基本信息、群聊消息与定位来源",
      html: specHtml(
        "基本信息与群聊消息是两个页签；定位来源作为紧邻群聊消息的行内操作，不是第三个页签。",
        [
          "基本信息：展示纸质配送单回单图片；点击图片打开大图预览，可放大、缩小、还原或关闭。",
          "群聊消息：展示原始附件和消息文本。",
          "定位来源：点击后自动进入群聊消息页签，并将视线定位到原始消息区域。",
        ],
        ["点击定位来源后滚动并短暂高亮原始消息，同时提示已定位。"],
        ["原消息不存在时保留来源卡片并提示无法定位，不切换到空白页面。"],
      ),
    },
    {
      id: "detail-query-order",
      selectors: ["[data-open-order-query]"],
      title: "查询订单｜显式触发候选匹配",
      html: specHtml(
        "操作员修改 AI 识别字段后，点击本按钮才发起销售订单查询；字段编辑本身不实时查询、不自动改关联。",
        [
          "只查询状态为配送中或已签收的销售订单。",
          "订单号精确命中时返回该唯一订单；未精确命中时综合门店、订单号片段、下单时间范围、收货时间范围和总金额生成候选。",
          "门店能命中系统门店时优先在该门店订单内查询；门店无匹配时不直接判定失败，回退到其他字段继续查询。",
          "无论查询到一张还是多张订单，都必须由操作员在弹窗中选择并点击“关联订单”。",
        ],
        ["点击后读取此刻页面字段并打开查询结果弹窗；此前已关联订单保持不变。"],
        ["无结果时展示空态，保留当前字段、商品数据和原关联，不自动扩大查询范围。"],
      ),
    },
    {
      id: "detail-order-query-modal",
      selectors: ["#orderQueryModal"],
      title: "订单查询结果｜人工确认关联",
      html: specHtml(
        "展示本次查询得到的候选销售订单，供操作员核对并单选最终关联。",
        [
          "列表固定展示门店、订单号、下单时间范围、收货时间范围和总金额。",
          "一张回单只能关联一张销售订单；候选为一张时默认选中，候选为多张时由操作员选择。",
          "选择当前已关联订单只关闭弹窗，不重建商品明细。",
        ],
        ["选中订单并点击“关联订单”后，才正式改变当前关联。"],
        ["未选择时关联按钮不可用；关联失败时保留原关联与当前商品数据。"],
      ),
    },
    {
      id: "detail-order-choice",
      selectors: [".order-query-table", "[data-confirm-order-link]"],
      title: "更换关联订单｜保留当前商品修改",
      html: specHtml(
        "选择新的销售订单后，系统用当前页面已经修改过的商品数据重新匹配新订单，而不是回退到最初的 AI 识别结果。",
        [
          "保留项包括当前识别商品名称、实际出库数/实收数、单位、备注和人工新增行。",
          "新订单商品按销售订单商品顺序展示，并与保留商品按名称一一匹配；未匹配的新订单商品实际出库数填 0。",
          "未被新订单使用的当前商品按现有顺序追加到列表末尾，便于操作员继续排查。",
        ],
        ["关联成功后更新订单商品顺序和出库数量，但不覆盖回单组上方的 AI 识别字段。"],
        ["重匹配任一步失败时恢复原关联、原商品列表和原输入，不保留部分结果。"],
      ),
    },
    {
      id: "detail-group",
      selectors: [".related-order-panel", ".receipt-ai-panel"],
      title: "回单组｜编辑与回写范围",
      html: specHtml(
        "一张回单只有一个回单组，包含 AI 识别字段、备注和商品明细。",
        [
          "门店、订单号、下单时间范围、收货时间范围和总金额均来自 AI 识别，待处理时可人工修正。",
          "字段修改只更新当前回单草稿；只有点击“查询订单”才会生成候选，不会实时改变已关联订单。",
          "商品明细最终回写销售订单的实际出库数；出库数量和订单商品系统单价只读。",
          "关联销售订单后，标题区展示实收金额、金额差异和数量差异；未关联时隐藏。",
        ],
        ["保存只保存草稿；确认提交才校验并写入销售订单。"],
        ["未关联订单、数量不合法或人工新增行不完整时不得提交。"],
      ),
    },
    {
      id: "detail-store",
      selectors: [".merchant-field"],
      title: "门店｜AI 识别查询条件",
      html: specHtml(
        "回单归属门店，默认采用 AI 识别结果，操作员可修正。",
        ["修改后只更新查询条件，不立即检索销售订单，也不改变当前关联。"],
        ["点击“查询订单”时与订单号、两个时间范围和总金额一并参与候选匹配。"],
        ["门店为空时仍可通过精确订单号查询；订单号也为空时其余字段用于辅助匹配。"],
      ),
    },
    {
      id: "detail-order-time",
      selectors: [".order-time-field"],
      title: "下单时间｜AI 识别时间范围",
      html: specHtml(
        "记录 AI 从回单材料中识别出的下单开始与结束时间，用作查询订单的辅助条件。",
        ["待处理可修改，已完成只读；修改后不实时查询。"],
        ["点击“查询订单”时用于与系统销售订单下单时间判断区间重叠。"],
        ["无法识别时允许为空，不阻断使用精确订单号查询。"],
      ),
    },
    {
      id: "detail-receive-time",
      selectors: [".receive-time-field"],
      title: "收货时间｜AI 识别时间范围",
      html: specHtml(
        "记录 AI 识别出的预计或实际收货时间范围，作为候选排序与核对信息。",
        ["待处理可修改，已完成只读；修改后不实时查询。"],
        ["点击“查询订单”时用于与系统销售订单收货时间判断区间重叠。"],
        ["无法识别时允许为空，不单独作为关联成功的必要条件。"],
      ),
    },
    {
      id: "detail-document",
      selectors: [".document-number-field"],
      title: "订单号｜唯一定位优先条件",
      html: specHtml(
        "订单号默认采用 AI 识别结果，待处理时允许操作员修正。",
        [
          "点击“查询订单”后，系统优先按订单号精确匹配；系统内订单号与销售订单一对一。",
          "未精确命中时，订单号片段与其他 AI 字段共同参与候选评分。",
        ],
        ["修改字段本身不查询、不自动关联；点击查询后才展示订单列表供人工选择。"],
        ["订单号为空时改用门店、时间范围和总金额生成候选。"],
      ),
    },
    {
      id: "detail-amount",
      selectors: [".amount-field"],
      title: "总金额｜AI 识别辅助条件",
      html: specHtml(
        "总金额来自 AI 识别，用于在订单号未唯一命中时辅助缩小候选范围。",
        ["待处理可修正，已完成只读；仅接受非负金额。"],
        ["点击“查询订单”时与系统订单总金额比较，精确一致优先，近似金额仅作为排序依据。"],
        ["金额为空或识别错误不直接阻止查询，也不单独触发关联。"],
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
          "更换已有订单时保留当前已修改商品数据，以这些当前值重新匹配新订单，不回退到原始 AI 结果。",
          "数量差异＝|出库数量－实际出库数/实收数|，输入时实时计算并始终显示非负值。",
          "订单商品单价来自系统且只读；订单外商品和人工新增商品单价可编辑。行金额＝实收数×单价。",
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
        ["差异＝|出库数量－实际出库数/实收数|，取绝对值；0 表示数量一致。"],
        ["实际出库数变化时当前行立即重算。"],
        ["订单外条目缺少出库数量时差异显示“--”。"],
      ),
    },
    {
      id: "detail-unit-price",
      selectors: [
        ".quantity-table th:nth-child(8)",
        ".unit-price-input",
      ],
      title: "单价｜系统值与新增商品录入",
      html: specHtml(
        "用于计算当前商品的实收金额。",
        [
          "销售订单商品的单价来自系统销售订单，页面只读，不得被 AI 或操作员覆盖。",
          "订单外 AI 商品与人工新增商品没有系统单价，允许操作员填写或修改。",
        ],
        ["新增商品单价变化时，当前行金额立即按“实收数×单价”重新计算。"],
        ["单价仅允许非负数，最多两位小数；人工新增商品提交前必须填写单价。"],
      ),
    },
    {
      id: "detail-line-amount",
      selectors: [
        ".quantity-table th:nth-child(9)",
        "[data-line-amount]",
      ],
      title: "金额｜行级实时计算",
      html: specHtml(
        "表示当前商品按商户实收数量计算的金额。",
        ["金额＝实际出库数/实收数×单价，按两位小数展示。"],
        ["实收数或可编辑单价变化时立即重算；金额本身不可编辑。"],
        ["实收数或单价为空、格式非法时显示“--”，不得参与提交汇总。"],
      ),
    },
    {
      id: "detail-order-summary",
      selectors: [".receipt-order-summary"],
      title: "关联订单汇总｜金额与数量差异",
      html: specHtml(
        "关联销售订单后，为操作员集中展示当前回单与系统订单的差异结果。",
        [
          "实收金额＝关联订单商品各行“实收数×系统单价”之和；订单外商品不计入。",
          "金额差异＝|销售订单总金额－实收金额|。",
          "数量差异＝关联订单各商品绝对数量差异之和；不同单位不做换算，仅作为快速排查指标。",
        ],
        ["实收数变化时三项汇总立即重算；更换关联订单后按新订单单价和当前保留实收数重算。"],
        ["未关联销售订单时不展示汇总；存在非法数量时不得提交。"],
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
          "人工新增行提交前必须补全商品名称、实际出库数、单位和单价。",
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
          "前置条件：已由操作员确认关联唯一销售订单；订单商品实际出库数合法；人工新增行的商品名称、实收数、单位和单价完整。",
          "写入成功后任务立即从待处理变为已完成，并进入只读状态。",
          "销售订单与销售回单一一对应，已完成任务不得再次提交。",
        ],
        ["提交期间按钮禁用防重复；成功提示并切换只读详情。"],
        ["任一写入失败时整体回滚，任务保持待处理，保留草稿并展示失败原因。"],
      ),
    },
  ];

  function decorateSpecTargets(targets) {
    targets.forEach((target) => {
      target.selectors.forEach((selector) => {
        all(selector).forEach((element) => {
          if (!element.dataset.specId) element.dataset.specId = target.id;
          if (
            !element.hasAttribute("tabindex") &&
            !element.matches("button, a, input, select, textarea")
          ) {
            element.setAttribute("tabindex", "0");
          }
        });
      });
    });
  }

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

    decorateSpecTargets(targets);

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

  function bindInlineSourceLocation() {
    all("[data-locate-source-inline]").forEach((button) => {
      button.addEventListener("click", () => {
        const sourcePane = button.closest(".receipt-source-pane");
        const message = one("[data-detail-message]", sourcePane);
        if (!message) {
          showToast("未找到可定位的群聊原消息");
          return;
        }
        const messageTab = one('[data-tab-target="messages"]', sourcePane);
        if (messageTab && !messageTab.classList.contains("active")) {
          messageTab.click();
        }
        message.classList.remove("source-located");
        requestAnimationFrame(() => {
          message.classList.add("source-located");
          message.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        window.setTimeout(() => message.classList.remove("source-located"), 950);
        showToast("已定位到群聊原消息");
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

  function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function formatMoney(value) {
    return Number.isFinite(Number(value))
      ? `¥${roundMoney(value).toFixed(2)}`
      : "--";
  }

  function updateReceiptSummary() {
    const summary = one("[data-order-summary]");
    if (!summary) return;
    const order = receiptOrderCatalog[document.body.dataset.orderId || ""];
    if (!order) {
      summary.hidden = true;
      return;
    }

    let actualAmount = 0;
    let quantityDifference = 0;
    all("[data-order-line]", one("[data-quantity-body]")).forEach((row) => {
      const actual = Number(
        one(".actual-input", row)?.value ?? row.dataset.actual ?? 0,
      );
      const price = Number(row.dataset.price);
      const outbound = Number(row.dataset.outbound);
      if (Number.isFinite(actual) && Number.isFinite(price)) {
        actualAmount += actual * price;
      }
      if (Number.isFinite(actual) && Number.isFinite(outbound)) {
        quantityDifference += Math.abs(outbound - actual);
      }
    });

    const orderAmount = Number(order.totalAmount);
    summary.hidden = false;
    const actualAmountTarget = one("[data-summary-actual-amount]", summary);
    const amountDifferenceTarget = one(
      "[data-summary-amount-difference]",
      summary,
    );
    const quantityDifferenceTarget = one(
      "[data-summary-quantity-difference]",
      summary,
    );
    if (actualAmountTarget) {
      actualAmountTarget.textContent = formatMoney(actualAmount);
    }
    if (amountDifferenceTarget) {
      amountDifferenceTarget.textContent = formatMoney(
        Math.abs(orderAmount - actualAmount),
      );
    }
    if (quantityDifferenceTarget) {
      quantityDifferenceTarget.textContent = formatNumber(
        Math.round((quantityDifference + Number.EPSILON) * 100) / 100,
      );
    }
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
    const invalid = all(
      ".actual-input, .local-actual-input, .unit-price-input",
    ).some((input) => input.classList.contains("invalid"));

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
      const amount = one("[data-line-amount]", row);
      if (amount) amount.textContent = "--";
      updateReceiptSummary();
      updateGlobalSaveState();
      return false;
    }

    const difference =
      Math.round((Math.abs(outbound - actual) + Number.EPSILON) * 100) / 100;
    row.dataset.currentDiff = String(difference);
    if (variance) {
      variance.textContent = `${formatNumber(difference)} ${unit}`;
      variance.className = `variance ${difference > 0 ? "short" : "equal"}`;
    }
    if (difference > 0) row.classList.add("row-short");
    const amount = one("[data-line-amount]", row);
    const price = Number(row.dataset.price);
    if (amount) {
      amount.textContent =
        Number.isFinite(price) && Number.isFinite(actual)
          ? formatMoney(actual * price)
          : "--";
    }
    updateReceiptSummary();
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
      setTaskState("待处理");
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
      if (input.dataset.preserveCurrent !== "true") {
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
          const price = one(".unit-price-input", row)?.value.trim();
          return !productName || !actual || !price;
        });
        if (incompleteManualRow) {
          one(".detail-product-input", incompleteManualRow)?.focus();
          showToast("请补全新增商品的名称、实际出库数和单价");
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
        const invalidLocalInput = all(
          ".local-actual-input, .unit-price-input:not([readonly])",
        ).find((input) => input.classList.contains("invalid"));
        if (invalidLocalInput) {
          invalidLocalInput.focus();
          showToast("请检查新增商品的实收数或单价");
          return;
        }

        button.disabled = true;
        button.textContent = "提交中…";
        writebackInputs.forEach((input) => scheduleSave(input, true));
        window.setTimeout(() => {
          setTaskState("已完成");
          document.body.dataset.readonly = "true";
          applyDetailReadOnlyMode();
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
    const recognizedOrder = associatedOrder;
    setDetailValue(
      "[data-ai-order-start]",
      config.aiOrderStart || recognizedOrder?.orderTime || "",
    );
    setDetailValue(
      "[data-ai-order-end]",
      config.aiOrderEnd || recognizedOrder?.orderTimeEnd || "",
    );
    setDetailValue(
      "[data-ai-receive-start]",
      config.aiReceiveStart || recognizedOrder?.receiveTime || "",
    );
    setDetailValue(
      "[data-ai-receive-end]",
      config.aiReceiveEnd || recognizedOrder?.receiveTimeEnd || "",
    );
    setDetailValue(
      "[data-ai-total-amount]",
      config.aiTotalAmount ?? recognizedOrder?.totalAmount ?? "",
    );

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
  }

  function normalizeProductName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function renderOrderLine(line, index, receiptItem = null) {
    const recognizedName =
      receiptItem?.recognizedName ?? (line.aiText ? line.name : "");
    const actual =
      receiptItem?.actual ?? (line.actual === "" ? "0" : String(line.actual));
    const remark = receiptItem?.remark ?? line.remark ?? "";
    const aiText = receiptItem?.aiText ?? line.aiText ?? "";
    const difference = Math.abs(line.outbound - Number(actual));
    const rowClass = difference > 0 ? "row-short" : "";
    const varianceClass = difference > 0 ? "short" : "equal";
    const lineAmount = Number(actual) * Number(line.price);
    return `
      <tr class="${rowClass}" data-product-row data-quantity-row data-order-line data-order-product-name="${escapeHTML(line.name)}" data-recognized-name="${escapeHTML(recognizedName)}" data-ai-text="${escapeHTML(aiText)}" data-outbound="${line.outbound}" data-unit="${escapeHTML(line.unit)}" data-price="${line.price}" data-current-diff="${difference}">
        <td data-row-index>${index + 1}</td>
        <td><strong>${escapeHTML(line.name)}</strong></td>
        <td data-recognized-product>${escapeHTML(recognizedName || "--")}</td>
        <td class="right"><strong>${formatNumber(line.outbound)}</strong></td>
        <td><div class="quantity-input-wrap"><input class="quantity-input actual-input" inputmode="decimal" value="${escapeHTML(actual)}" placeholder="请填写" aria-label="${escapeHTML(line.name)}实际出库数" data-item-id="${escapeHTML(line.id)}"${receiptItem ? ' data-preserve-current="true"' : ""}><span class="unit-suffix">${escapeHTML(line.unit)}</span></div></td>
        <td class="right"><span class="variance ${varianceClass}" data-variance>${formatNumber(difference)} ${escapeHTML(line.unit)}</span></td>
        <td>${escapeHTML(line.unit)}</td>
        <td><div class="price-input-wrap readonly"><span>¥</span><input class="unit-price-input system-unit-price" inputmode="decimal" value="${Number(line.price).toFixed(2)}" readonly aria-label="${escapeHTML(line.name)}系统单价"></div></td>
        <td class="right"><strong class="line-amount" data-line-amount>${formatMoney(lineAmount)}</strong></td>
        <td><input class="detail-remark-input" value="${escapeHTML(remark)}" placeholder="填写备注" aria-label="${escapeHTML(line.name)}备注"></td>
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

  function renderReceiptOnlyRow(item, index) {
    const editableName = item.editableName === true;
    const nameControl = editableName
      ? `<input class="detail-product-input" value="${escapeHTML(item.name || "")}" placeholder="请输入商品名称" aria-label="识别商品">`
      : `<strong>${escapeHTML(item.name || "--")}</strong>`;
    const unitControl = editableName
      ? `<input class="detail-unit-input" value="${escapeHTML(item.unit || "斤")}" aria-label="单位">`
      : escapeHTML(item.unit || "--");
    const price = item.price ?? "";
    const actual = item.actual ?? "";
    const amount =
      String(price).trim() !== "" &&
      String(actual).trim() !== "" &&
      Number.isFinite(Number(price)) &&
      Number.isFinite(Number(actual))
        ? formatMoney(Number(price) * Number(actual))
        : "--";
    return `
      <tr data-product-row data-unmatched-row data-recognized-name="${escapeHTML(item.name || "")}" data-ai-text="${escapeHTML(item.aiText || item.text || "")}" data-unit="${escapeHTML(item.unit || "")}" data-price="${escapeHTML(price)}" data-exception-id="${escapeHTML(item.id || "")}">
        <td data-row-index>${index + 1}</td>
        <td>--</td>
        <td data-recognized-product>${nameControl}</td>
        <td class="right">--</td>
        <td><div class="quantity-input-wrap"><input class="quantity-input local-actual-input" inputmode="decimal" value="${escapeHTML(actual)}" placeholder="请填写" aria-label="${escapeHTML(item.name || "当前商品")}实收数"><span class="unit-suffix">${escapeHTML(item.unit || "斤")}</span></div></td>
        <td class="right">--</td>
        <td>${unitControl}</td>
        <td><div class="price-input-wrap"><span>¥</span><input class="unit-price-input" inputmode="decimal" value="${escapeHTML(price)}" placeholder="请填写" aria-label="${escapeHTML(item.name || "当前商品")}单价"></div></td>
        <td class="right"><strong class="line-amount" data-line-amount>${amount}</strong></td>
        <td><input class="detail-remark-input" value="${escapeHTML(item.remark || "")}" placeholder="填写备注" aria-label="${escapeHTML(item.name || "当前商品")}备注"></td>
        <td>${renderRowActions(item.name || "当前商品")}</td>
      </tr>`;
  }

  function renderUnmatchedRow(item, index) {
    return renderReceiptOnlyRow(item, index);
  }

  function renderAiLine(item, index) {
    return renderReceiptOnlyRow(item, index);
  }

  function renderBlankRow() {
    const rowId = `MANUAL-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `
      <tr data-product-row data-manual-row data-recognized-name="" data-ai-text="" data-unit="斤" data-price="" data-manual-id="${rowId}">
        <td data-row-index></td>
        <td>--</td>
        <td data-recognized-product><input class="detail-product-input" value="" placeholder="请输入商品名称" aria-label="识别商品"></td>
        <td class="right">--</td>
        <td><div class="quantity-input-wrap"><input class="quantity-input local-actual-input" inputmode="decimal" value="" placeholder="请填写" aria-label="实际出库数"><span class="unit-suffix">斤</span></div></td>
        <td class="right">--</td>
        <td><input class="detail-unit-input" value="斤" aria-label="单位"></td>
        <td><div class="price-input-wrap"><span>¥</span><input class="unit-price-input" inputmode="decimal" value="" placeholder="请填写" aria-label="单价"></div></td>
        <td class="right"><strong class="line-amount" data-line-amount>--</strong></td>
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

  function updateReceiptOnlyAmount(row) {
    if (!row) return;
    const actualInput = one(".local-actual-input", row);
    const priceInput = one(".unit-price-input", row);
    const amount = one("[data-line-amount]", row);
    const actualRaw = actualInput?.value.trim() || "";
    const priceRaw = priceInput?.value.trim() || "";
    const actualValid =
      actualRaw === "" ||
      (/^\d+(?:\.\d{0,2})?$/.test(actualRaw) && Number(actualRaw) >= 0);
    const priceValid =
      priceRaw === "" ||
      (/^\d+(?:\.\d{0,2})?$/.test(priceRaw) && Number(priceRaw) >= 0);
    actualInput?.classList.toggle("invalid", !actualValid);
    priceInput?.classList.toggle("invalid", !priceValid);
    row.dataset.price = priceRaw;
    if (amount) {
      amount.textContent =
        actualRaw !== "" &&
        priceRaw !== "" &&
        actualValid &&
        priceValid
          ? formatMoney(Number(actualRaw) * Number(priceRaw))
          : "--";
    }
    updateGlobalSaveState();
  }

  function bindLocalQuantityEditing() {
    all("[data-unmatched-row], [data-manual-row]").forEach((row) => {
      if (row.dataset.localQuantityBound === "true") return;
      row.dataset.localQuantityBound = "true";
      const actualInput = one(".local-actual-input", row);
      const priceInput = one(".unit-price-input", row);
      actualInput?.addEventListener("input", () =>
        updateReceiptOnlyAmount(row),
      );
      priceInput?.addEventListener("input", () =>
        updateReceiptOnlyAmount(row),
      );
      updateReceiptOnlyAmount(row);
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
    decorateSpecTargets(detailSpecTargets);
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
      updateReceiptSummary();
      updateGlobalSaveState();
      showToast("已删除当前行");
    });
  }

  function captureCurrentProductData() {
    const target = one("[data-quantity-body]");
    if (!target) return [];
    return all("[data-product-row]", target).map((row, index) => {
      const productInput = one(".detail-product-input", row);
      const recognizedCell = one("[data-recognized-product]", row);
      const recognizedText = productInput
        ? productInput.value.trim()
        : row.dataset.recognizedName ||
          recognizedCell?.textContent.trim().replace(/^--$/, "") ||
          "";
      const orderProductName = row.dataset.orderProductName || "";
      const currentProductName = recognizedText || orderProductName;
      const quantityInput = one(
        ".actual-input, .local-actual-input",
        row,
      );
      const unitInput = one(".detail-unit-input", row);
      const priceInput = one(".unit-price-input", row);
      const remarkInput = one(".detail-remark-input", row);
      return {
        id:
          quantityInput?.dataset.itemId ||
          row.dataset.manualId ||
          row.dataset.exceptionId ||
          `CURRENT-${index + 1}`,
        name: currentProductName,
        recognizedName: currentProductName,
        matchName: currentProductName,
        actual: quantityInput?.value ?? "",
        price: priceInput?.value ?? row.dataset.price ?? "",
        unit: unitInput?.value.trim() || row.dataset.unit || "",
        remark: remarkInput?.value ?? "",
        aiText: row.dataset.aiText || "",
        editableName: Boolean(productInput),
      };
    });
  }

  function rematchCurrentProducts(order, currentProducts) {
    const used = new Set();
    const matched = order.lines.map((line) => {
      const matchIndex = currentProducts.findIndex(
        (item, index) =>
          !used.has(index) &&
          normalizeProductName(item.matchName) ===
            normalizeProductName(line.name),
      );
      if (matchIndex < 0) {
        return {
          recognizedName: "",
          actual: "0",
          remark: "",
          aiText: "",
        };
      }
      used.add(matchIndex);
      return currentProducts[matchIndex];
    });
    const extras = currentProducts.filter((_, index) => !used.has(index));
    return { matched, extras };
  }

  function renderQuantityRows(order, currentProducts = null) {
    const target = one("[data-quantity-body]");
    if (!target) return;
    if (!order) {
      target.innerHTML = activeReceiptAiOriginalLines
        .map((item, index) => renderAiLine(item, index))
        .join("");
    } else if (currentProducts) {
      const rematched = rematchCurrentProducts(order, currentProducts);
      const orderRows = order.lines
        .map((line, index) =>
          renderOrderLine(line, index, rematched.matched[index]),
        )
        .join("");
      const extraRows = rematched.extras
        .map((item, index) =>
          renderReceiptOnlyRow(item, order.lines.length + index),
        )
        .join("");
      target.innerHTML = `${orderRows}${extraRows}`;
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
    updateReceiptSummary();
    decorateSpecTargets(detailSpecTargets);
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
    const openButton = one("[data-open-order-query]");
    const queryBody = one("[data-order-query-body]");
    const confirm = one("[data-confirm-order-link]");
    if (!openButton || !queryBody || !confirm) return;

    const readCriteria = () => ({
      merchant: one("[data-order-merchant-display]")?.value.trim() || "",
      orderId: one("[data-order-id-display]")?.value.trim() || "",
      orderStart: one("[data-ai-order-start]")?.value || "",
      orderEnd: one("[data-ai-order-end]")?.value || "",
      receiveStart: one("[data-ai-receive-start]")?.value || "",
      receiveEnd: one("[data-ai-receive-end]")?.value || "",
      totalAmount: one("[data-ai-total-amount]")?.value.trim() || "",
    });

    const rangesOverlap = (startA, endA, startB, endB) => {
      if (!startA || !startB) return false;
      const a1 = new Date(startA).getTime();
      const a2 = new Date(endA || startA).getTime();
      const b1 = new Date(startB).getTime();
      const b2 = new Date(endB || startB).getTime();
      if ([a1, a2, b1, b2].some(Number.isNaN)) return false;
      return a1 <= b2 && b1 <= a2;
    };

    const scoreOrder = (order, criteria) => {
      let score = 0;
      const orderId = criteria.orderId.toLowerCase();
      const merchant = criteria.merchant.toLowerCase();
      if (orderId) {
        if (order.id.toLowerCase() === orderId) score += 120;
        else if (order.id.toLowerCase().includes(orderId)) score += 70;
      }
      if (merchant) {
        if (order.merchant.toLowerCase() === merchant) score += 40;
        else if (order.merchant.toLowerCase().includes(merchant)) score += 20;
      }
      if (
        rangesOverlap(
          criteria.orderStart,
          criteria.orderEnd,
          order.orderTime,
          order.orderTimeEnd,
        )
      ) {
        score += 18;
      }
      if (
        rangesOverlap(
          criteria.receiveStart,
          criteria.receiveEnd,
          order.receiveTime,
          order.receiveTimeEnd,
        )
      ) {
        score += 18;
      }
      const amount = Number(criteria.totalAmount);
      if (criteria.totalAmount && Number.isFinite(amount)) {
        const difference = Math.abs(order.totalAmount - amount);
        if (difference < 0.01) score += 16;
        else if (difference / Math.max(order.totalAmount, 1) <= 0.1) score += 8;
      }
      return score;
    };

    const queryOrders = () => {
      const criteria = readCriteria();
      const eligibleOrders = Object.values(receiptOrderCatalog).filter(
        (order) =>
          order.orderStatus === "配送中" || order.orderStatus === "已签收",
      );
      const exactOrder = eligibleOrders.find(
        (order) =>
          criteria.orderId &&
          order.id.toLowerCase() === criteria.orderId.toLowerCase(),
      );
      if (exactOrder) return [exactOrder];
      const merchantKeyword = criteria.merchant.toLowerCase();
      const merchantOrders = merchantKeyword
        ? eligibleOrders.filter((order) => {
            const merchant = order.merchant.toLowerCase();
            return (
              merchant === merchantKeyword ||
              merchant.includes(merchantKeyword) ||
              merchantKeyword.includes(merchant)
            );
          })
        : [];
      const searchableOrders = merchantOrders.length
        ? merchantOrders
        : eligibleOrders;
      const hasCriteria = Object.values(criteria).some(Boolean);
      return searchableOrders
        .map((order) => ({ order, score: scoreOrder(order, criteria) }))
        .filter((item) => !hasCriteria || item.score > 0)
        .sort(
          (left, right) =>
            right.score - left.score ||
            right.order.orderTime.localeCompare(left.order.orderTime),
        )
        .map((item) => item.order);
    };

    const formatDateTime = (value) =>
      value ? value.replace("T", " ").replaceAll("-", "/") : "--";
    const formatTimeRange = (start, end) =>
      `${formatDateTime(start)} ～ ${formatDateTime(end || start)}`;

    const renderQueryResults = () => {
      const orders = queryOrders();
      const currentOrderId = document.body.dataset.orderId || "";
      const defaultOrderId = orders.some(
        (order) => order.id === currentOrderId,
      )
        ? currentOrderId
        : orders.length === 1
          ? orders[0].id
          : "";
      pendingOrderId = defaultOrderId;
      confirm.disabled = !defaultOrderId;
      if (!orders.length) {
        queryBody.innerHTML =
          '<tr class="empty-row"><td colspan="6">未查询到符合条件的销售订单</td></tr>';
        return;
      }
      queryBody.innerHTML = orders
        .map((order) => {
          const checked = order.id === defaultOrderId ? " checked" : "";
          return `<tr${checked ? ' class="selected"' : ""}>
            <td><input type="radio" name="query-order" value="${escapeHTML(order.id)}" aria-label="选择销售订单 ${escapeHTML(order.id)}"${checked}></td>
            <td>${escapeHTML(order.merchant)}</td>
            <td><strong>${escapeHTML(order.id)}</strong></td>
            <td>${escapeHTML(formatTimeRange(order.orderTime, order.orderTimeEnd))}</td>
            <td>${escapeHTML(formatTimeRange(order.receiveTime, order.receiveTimeEnd))}</td>
            <td class="right">¥${Number(order.totalAmount).toFixed(2)}</td>
          </tr>`;
        })
        .join("");
    };

    openButton.addEventListener("click", () => {
      renderQueryResults();
      openModal("orderQueryModal");
    });

    queryBody.addEventListener("change", (event) => {
      const radio = event.target.closest('input[name="query-order"]');
      if (!radio) return;
      pendingOrderId = radio.value;
      all("tr", queryBody).forEach((row) =>
        row.classList.toggle("selected", row.contains(radio)),
      );
      confirm.disabled = false;
    });

    confirm.addEventListener("click", () => {
      const nextOrder = receiptOrderCatalog[pendingOrderId];
      if (!nextOrder) {
        showToast("请先选择需要关联的销售订单");
        return;
      }
      const oldOrderId = document.body.dataset.orderId || "";
      if (oldOrderId === nextOrder.id) {
        closeModal("orderQueryModal");
        pendingOrderId = "";
        showToast(`当前已关联 ${nextOrder.id}`);
        return;
      }
      const currentProducts = captureCurrentProductData();
      confirm.disabled = true;
      confirm.textContent = "正在关联…";
      window.setTimeout(() => {
        document.body.dataset.orderId = nextOrder.id;
        document.body.dataset.orderUnassociated = "false";
        renderQuantityRows(nextOrder, currentProducts);
        setTaskState("待处理");
        closeModal("orderQueryModal");
        confirm.disabled = false;
        confirm.textContent = "关联订单";
        pendingOrderId = "";
        showToast(
          `已关联 ${nextOrder.id}，并按当前已修改商品数据重新匹配`,
        );
      }, 450);
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

    all(".receipt-ai-panel input").forEach((input) => {
      input.readOnly = true;
      input.setAttribute("aria-readonly", "true");
    });
    all(
      "[data-save-now], [data-confirm-submit], [data-add-product], [data-add-row], [data-delete-row], [data-open-order-query], [data-confirm-order-link]",
    ).forEach((control) => {
      control.disabled = true;
    });
  }

  function bindReceiptImageViewer() {
    const triggers = all("[data-receipt-image-open]");
    if (!triggers.length) return;

    const viewer = document.createElement("div");
    viewer.className = "receipt-image-viewer";
    viewer.hidden = true;
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "纸质配送单预览");
    viewer.innerHTML = `
      <div class="receipt-image-viewer-toolbar">
        <button class="receipt-image-viewer-button" type="button" data-image-zoom-out aria-label="缩小">−</button>
        <span class="receipt-image-viewer-zoom" data-image-zoom-label>100%</span>
        <button class="receipt-image-viewer-button" type="button" data-image-zoom-in aria-label="放大">＋</button>
        <button class="receipt-image-viewer-button" type="button" data-image-zoom-reset>还原</button>
        <button class="receipt-image-viewer-button receipt-image-viewer-close" type="button" data-image-close aria-label="关闭预览">×</button>
      </div>
      <div class="receipt-image-viewer-canvas">
        <img src="" alt="纸质配送单回单大图" data-image-viewer-img>
      </div>
    `;
    document.body.appendChild(viewer);

    const previewImage = one("[data-image-viewer-img]", viewer);
    const canvas = one(".receipt-image-viewer-canvas", viewer);
    const zoomLabel = one("[data-image-zoom-label]", viewer);
    const zoomIn = one("[data-image-zoom-in]", viewer);
    const zoomOut = one("[data-image-zoom-out]", viewer);
    const zoomReset = one("[data-image-zoom-reset]", viewer);
    const closeButton = one("[data-image-close]", viewer);
    const minZoom = 0.5;
    const maxZoom = 3;
    const zoomStep = 0.25;
    let zoom = 1;
    let baseWidth = 0;
    let activeTrigger = null;

    function refreshImageWidth() {
      if (!baseWidth) return;
      previewImage.style.width = `${Math.round(baseWidth * zoom)}px`;
      zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
      zoomOut.disabled = zoom <= minZoom;
      zoomIn.disabled = zoom >= maxZoom;
    }

    function calculateBaseWidth() {
      const availableWidth = Math.max(240, canvas.clientWidth - 48);
      baseWidth = Math.min(previewImage.naturalWidth || availableWidth, availableWidth);
      refreshImageWidth();
    }

    function setZoom(nextZoom) {
      zoom = Math.min(maxZoom, Math.max(minZoom, nextZoom));
      refreshImageWidth();
    }

    function closeViewer() {
      if (viewer.hidden) return;
      viewer.hidden = true;
      document.body.classList.remove("receipt-image-viewer-open");
      activeTrigger?.focus();
    }

    function openViewer(trigger) {
      const sourceImage = one("img", trigger);
      if (!sourceImage) return;
      activeTrigger = trigger;
      zoom = 1;
      baseWidth = 0;
      previewImage.src = sourceImage.currentSrc || sourceImage.src;
      previewImage.alt = `${sourceImage.alt || "纸质配送单回单"}大图`;
      viewer.hidden = false;
      document.body.classList.add("receipt-image-viewer-open");
      if (previewImage.complete) calculateBaseWidth();
      closeButton.focus();
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openViewer(trigger));
    });
    previewImage.addEventListener("load", calculateBaseWidth);
    zoomIn.addEventListener("click", () => setZoom(zoom + zoomStep));
    zoomOut.addEventListener("click", () => setZoom(zoom - zoomStep));
    zoomReset.addEventListener("click", () => setZoom(1));
    closeButton.addEventListener("click", closeViewer);
    viewer.addEventListener("click", (event) => {
      if (event.target === viewer) closeViewer();
    });
    window.addEventListener("resize", () => {
      if (!viewer.hidden) calculateBaseWidth();
    });
    document.addEventListener("keydown", (event) => {
      if (viewer.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeViewer();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom(zoom + zoomStep);
      } else if (event.key === "-") {
        event.preventDefault();
        setZoom(zoom - zoomStep);
      } else if (event.key === "0") {
        event.preventDefault();
        setZoom(1);
      }
    });
  }

  function init() {
    bindApplicationCenterLinks();
    bindAgentSwitcher();
    bindGlobalControls();
    bindTabs();
    bindTaskFilters();
    applyReceiptScenario();
    bindInlineSourceLocation();
    bindSpecDrawer();
    initializeQuantityRows();
    bindManualSave();
    bindConfirmSubmit();
    bindAddProductButton();
    bindEntryPage();
    bindOrderSelection();
    bindSearchTables();
    bindProcessingDemo();
    bindReceiptImageViewer();
    applyDetailReadOnlyMode();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
