(() => {
  "use strict";

  const storagePrefix = "sales-receipt-prototype";
  const saveTimers = new Map();
  let toastTimer = 0;
  let attachments = [];
  let pendingOrderId = "";
  let pendingDeleteRow = null;
  let pendingSubmitPayload = null;
  let receiptMode = "normal";

  const afterSalesTypes = {
    non_product_exception: {
      label: "非商品异常",
      fieldLabel: "异常金额",
    },
    product_exception: {
      label: "商品异常—异常",
      fieldLabel: "异常数",
    },
    product_return: {
      label: "商品异常—退货",
      fieldLabel: "应退数",
    },
  };

  // 生产环境由观麦同步；静态原型先用示例数据演示可输入下拉。
  const guanmaiAfterSalesReasonOptions = [
    { code: "GM-R001", label: "商品破损" },
    { code: "GM-R002", label: "商品质量异常" },
    { code: "GM-R003", label: "缺货未配" },
    { code: "GM-R004", label: "错配漏配" },
    { code: "GM-R005", label: "商户拒收" },
    { code: "GM-R006", label: "配送延误" },
    { code: "GM-R007", label: "价格或优惠调整" },
    { code: "GM-R999", label: "其他" },
  ];

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
      matchReason: "商户、单据编号与商品组合命中",
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
      matchReason: "商户、单据编号与商品组合命中",
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

  receiptOrderCatalog["SO-20260727-1205"] = {
    ...receiptOrderCatalog["SO-20260727-1120"],
    id: "SO-20260727-1205",
    orderTime: "2026-07-27T09:06",
    orderTimeEnd: "2026-07-27T09:14",
    receiveTime: "2026-07-27T15:30",
    receiveTimeEnd: "2026-07-27T17:00",
    totalAmount: 1552,
    lines: receiptOrderCatalog["SO-20260727-1120"].lines.map((line) => ({
      ...line,
    })),
  };
  receiptOrderCatalog["SO-20260725-0997"] = {
    ...receiptOrderCatalog["SO-20260727-1120"],
    id: "SO-20260725-0997",
    orderTime: "2026-07-25T07:48",
    orderTimeEnd: "2026-07-25T07:55",
    receiveTime: "2026-07-25T14:00",
    receiveTimeEnd: "2026-07-25T16:00",
    totalAmount: 1498,
    lines: receiptOrderCatalog["SO-20260727-1120"].lines.map((line) => ({
      ...line,
    })),
  };

  // 静态原型不模拟其他回单对订单的占用；生产环境的一单一回单约束由服务端兜底。
  const receiptOrderBindings = new Map();

  function currentReceiptId() {
    return document.body.dataset.receiptId || "";
  }

  function bindOrderToCurrentReceipt(nextOrderId, previousOrderId = "") {
    const receiptId = currentReceiptId();
    if (!receiptId || !nextOrderId) return false;
    if (
      previousOrderId &&
      previousOrderId !== nextOrderId &&
      receiptOrderBindings.get(previousOrderId) === receiptId
    ) {
      receiptOrderBindings.delete(previousOrderId);
    }
    receiptOrderBindings.set(nextOrderId, receiptId);
    return true;
  }

  const receiptAfterSalesCatalog = {
    "SO-20260725-1028": {
      "SKU-10021": {
        type: "product_exception",
        reason: "商品质量异常",
      },
      "SKU-10083": {
        type: "product_return",
        reason: "商品破损",
        returnInboundId: "THRK-20260726-0081",
      },
      "SKU-10126": {
        type: "non_product_exception",
        reason: "价格或优惠调整",
        exceptionAmount: "15.00",
      },
      "SKU-10148": {
        type: "product_return",
        reason: "商户拒收",
        returnInboundId: "THRK-20260726-0081",
      },
    },
    "SO-20260726-1066": {
      "SKU-10021": {
        type: "product_exception",
        reason: "商品质量异常",
      },
      "SKU-10083": {
        type: "product_return",
        reason: "商品破损",
        returnInboundId: "THRK-20260726-0086",
      },
      "SKU-10126": {
        type: "non_product_exception",
        reason: "价格或优惠调整",
        exceptionAmount: "12.00",
      },
    },
    "SO-20260727-1120": {
      "SKU-10021": {
        type: "product_exception",
        reason: "商品质量异常",
      },
      "SKU-10083": {
        type: "product_return",
        reason: "商品破损",
        returnInboundId: "THRK-20260727-0093",
      },
      "SKU-10126": {
        type: "non_product_exception",
        reason: "价格或优惠调整",
        exceptionAmount: "13.00",
      },
      "SKU-10208": { type: "product_return", reason: "商户拒收" },
      "SKU-10311": {
        type: "product_exception",
        reason: "错配漏配",
      },
    },
    "SO-20260726-2058": {
      "SKU-20021": {
        type: "product_exception",
        reason: "商品质量异常",
      },
      "SKU-20126": { type: "product_return", reason: "商品破损" },
    },
    "SO-20260726-3054": {
      "SKU-30083": { type: "product_return", reason: "缺货未配" },
    },
  };
  receiptAfterSalesCatalog["SO-20260727-1205"] =
    receiptAfterSalesCatalog["SO-20260727-1120"];
  receiptAfterSalesCatalog["SO-20260725-0997"] =
    receiptAfterSalesCatalog["SO-20260727-1120"];

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
      orderId: "SO-20260727-1120",
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
      remark: "单据编号字迹模糊，AI 已默认关联，可人工更换",
      messages: [
        "回单上的单据编号后四位字迹模糊，AI 仅识别到“SO-2026072”。",
        "商户识别为华南鲜食店，大白菜实收 22 斤，油麦菜实收 18.5 斤。",
        "系统匹配到多张候选销售订单，AI 已默认关联评分最高的一张，操作员可人工更换。",
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
      documentNumber: "SO-20260727-1205",
      orderId: "SO-20260727-1205",
      candidateIds: ["SO-20260727-1205"],
      remark: "AI 识别完整，人工核对后提交",
      messages: [
        "单据编号：SO-20260727-1205。",
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
      remark: "青椒未识别，签收数按规则填 0",
      messages: [
        "单据编号：SO-20260726-3054。",
        "AI 识别到大白菜实收 25 斤、油麦菜实收 18 斤。",
        "销售订单中还有青椒，回单材料未识别到该商品，签收数填 0。",
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
      orderId: "SO-20260725-1028",
      aiOrderStart: "2026-07-25T08:30",
      aiOrderEnd: "2026-07-25T08:45",
      aiReceiveStart: "2026-07-26T09:20",
      aiReceiveEnd: "2026-07-26T11:10",
      aiTotalAmount: 1485.5,
      candidateIds: ["SO-20260725-1028"],
      remark: "单据编号唯一命中，AI 已默认关联",
      messages: [
        "AI 清晰识别单据编号 SO-20260725-1028。",
        "系统按订单号唯一命中并默认关联销售订单，操作员可查询更换。",
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
      sceneLabel: "仅识别商户，候选订单不唯一",
      receiptId: "SR-20260725-006",
      state: "待处理",
      merchant: "华南鲜食店",
      group: "华南鲜食店收货群",
      operator: "赵倩",
      createdTime: "2026-07-25 16:08:45",
      signDate: "2026-07-25",
      signClock: "16:08",
      documentNumber: "",
      orderId: "SO-20260725-0997",
      aiOrderStart: "",
      aiOrderEnd: "",
      aiReceiveStart: "",
      aiReceiveEnd: "",
      aiTotalAmount: "",
      candidateIds: [
        "SO-20260725-1028",
        "SO-20260726-1066",
        "SO-20260725-0997",
      ],
      remark: "仅识别到商户，AI 已默认关联，可人工更换",
      messages: [
        "回单上没有可识别的有效单据编号。",
        "AI 识别到系统已有商户“华南鲜食店”及商品实收数量。",
        "该商户有多张可处理状态的销售订单，AI 已默认关联评分最高的一张，操作员可人工更换。",
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
  const merchantTerminology = (value) =>
    String(value).replaceAll("客户", "商户").replaceAll("门店", "商户");

  function showToast(message) {
    const toast = one("#toast");
    if (!toast) return;
    toast.textContent = merchantTerminology(message);
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
          "待处理：允许进入可编辑详情，核对订单、商品签收数和售后处理。",
          "已完成：三个售后字段已同步观麦，只允许查看只读详情。",
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
          "状态、商户、时间范围和操作员按交集查询。",
          "默认状态、商户、操作员均为全部；默认时间范围以页面预设值为准。",
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
      title: "商户筛选｜数据范围",
      html: specHtml(
        "按销售回单归属商户筛选任务。",
        ["候选项来自当前操作员数据权限范围内的商户；默认全部商户。"],
        ["选择商户后点击查询，与其余筛选条件共同生效。"],
        ["商户停用后历史回单仍可按原商户名称查询。"],
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
        ["状态、商户、操作员恢复为全部；时间恢复为默认区间。"],
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
          "状态为待处理或已完成；列表不展示内部识别或匹配场景。",
          "来源展示商户入口或群聊名称；商户展示回单归属；操作员展示最近处理人。",
        ],
        ["刷新保留当前筛选条件；分页只切换当前条件下的数据页。"],
        ["字段缺失显示“--”；不得用其他字段猜测替代。"],
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
          "删除任务不等于撤销已经同步观麦的数据或退货入库单；已完成任务的删除权限应由后端单独控制。",
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
        ["不重置状态、商户、时间范围、操作员和当前页。"],
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
        "操作员在本页核对原始回单、确认唯一销售订单、修正签收数并完成售后分流。",
        [
          "观麦是销售回单应用的关联系统，不属于 AI 录单系统；本页只读取订单并回写异常金额、异常数、应退数。",
          "AI 识别完成后默认关联评分最高的可处理订单；默认关联可直接提交，也允许人工更换。",
          "三种售后处理均不修改销售订单下单数；签收数仅作为差异计算和审核依据。",
          "待处理允许编辑和提交；观麦字段及退货入库单同步成功后立即变为已完成。",
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
          "来源内容只读，作为操作员判断商户、订单号、商品和实收数量的凭证。",
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
        "操作员需要复核或更换 AI 默认关联订单时，点击本按钮发起销售订单查询；字段编辑本身不实时查询、不自动改关联。",
        [
          "只查询状态为等待分拣、分拣中、配送中或已签收的销售订单。",
          "订单号精确命中时返回该唯一订单；未精确命中时综合商户、订单号片段、下单具体时间段和收货具体时间段生成候选。",
          "商户能命中系统商户时优先在该商户订单内查询；商户无匹配时不直接判定失败，回退到其他字段继续查询。",
          "已有默认关联时预选当前订单；只有选择其他订单并确认后才改变关联。",
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
        "展示本次查询得到的候选销售订单，供操作员保留 AI 默认关联或人工改绑。",
        [
          "列表固定展示商户、订单号、下单具体时间段和收货具体时间段。",
          "一张回单只能关联一张销售订单；当前关联订单默认选中并显示“当前”。",
          "选择当前已关联订单只关闭弹窗，不重建商品明细。",
        ],
        ["选中订单并点击“关联订单”后，才正式改变当前关联。"],
        ["未选择时关联按钮不可用；关联失败时保留原关联与当前商品数据。"],
      ),
    },
    {
      id: "detail-current-association",
      selectors: ["[data-order-association]"],
      title: "当前关联订单｜默认关联与人工改绑",
      html: specHtml(
        "独立展示真正参与商品匹配和提交的观麦销售订单，避免与 AI 识别订单号混淆。",
        [
          "AI 识别完成后默认关联评分最高的可处理订单，并标记“AI 默认”。",
          "操作员改绑成功后标记“人工选择”；已完成详情标记“提交快照”。",
          "修改商户、识别订单号或时间不会自动改变当前关联。",
        ],
        ["有默认关联时可直接提交；商品条目尚未人工修改时，也可点击“更换订单”复核并改绑。"],
        ["没有任何可关联订单时显示“未关联”，确认提交不可用。"],
      ),
    },
    {
      id: "detail-order-choice",
      selectors: [".order-query-table", "[data-confirm-order-link]"],
      title: "更换关联订单｜商品修改后锁定",
      html: specHtml(
        "仅在回单组商品条目尚未被人工修改时，允许选择新的销售订单；一旦商品条目发生人工修改，当前关联订单立即锁定。",
        [
          "商品人工修改包括修改签收数或商品备注；商品行本身完全由关联销售订单生成，不提供新增、删除或改名。",
          "锁定后“更换订单”按钮禁用并说明原因，订单查询入口和确认改绑动作均须做逻辑拦截。",
          "锁定状态随当前回单草稿保存，刷新页面或点击保存均不解除；未关联订单时仍允许完成首次关联。",
        ],
        ["未修改商品条目前，选择并确认其他候选订单后更新关联及订单商品明细。"],
        ["即使通过非按钮方式触发改绑，系统仍须校验锁定状态并拒绝变更。"],
      ),
    },
    {
      id: "detail-group",
      selectors: [".related-order-panel", ".receipt-ai-panel"],
      title: "回单组｜编辑与回写范围",
      html: specHtml(
        "一张回单只有一个回单组，包含 AI 识别字段、备注和商品明细。",
        [
          "商户、订单号、下单具体时间段和收货具体时间段均来自 AI 识别，待处理时可人工修正。",
          "AI 默认关联与识别字段分开展示；字段修改只更新查询条件，不会实时改变已关联订单。",
          "商品明细只向观麦回写异常金额、异常数、应退数；销售订单下单数始终只读且不被修改。",
          "关联销售订单后，标题区汇总异常金额、异常数和应退数；不同计量单位分开展示。",
        ],
        ["保存只保存 AI 录单平台草稿；确认提交才向观麦同步售后原因及三个售后字段。"],
        ["未关联订单、签收数不合法、差异行未选择售后类型、未填写售后原因或异常金额无效时不得提交。"],
      ),
    },
    {
      id: "detail-store",
      selectors: [".merchant-field"],
      title: "商户｜AI 识别查询条件",
      html: specHtml(
        "回单归属商户，默认采用 AI 识别结果，操作员可修正。",
        ["修改后只更新查询条件，不立即检索销售订单，也不改变当前关联。"],
        ["点击“查询订单”时与订单号、下单具体时间段和收货具体时间段一并参与候选匹配。"],
        ["商户为空时仍可通过精确订单号查询；订单号也为空时其余字段用于辅助匹配。"],
      ),
    },
    {
      id: "detail-order-time",
      selectors: [".order-time-field"],
      title: "下单时间｜AI 识别具体时间段",
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
      title: "收货时间｜AI 识别具体时间段",
      html: specHtml(
        "记录 AI 识别出的预计或实际收货具体时间段，作为候选排序与核对信息。",
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
        ["订单号为空时改用商户、下单具体时间段和收货具体时间段生成候选。"],
      ),
    },
    {
      id: "detail-remark",
      selectors: ["[data-detail-remark]"],
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
      title: "商品明细｜签收数量确认",
      html: specHtml(
        "按关联销售订单商品顺序展示商品，主表只负责签收数核对与差异计算。",
        [
          "未关联订单时显示空态；关联后按销售订单商品顺序重建。",
          "AI 漏识别的订单商品保留原位置，签收数填 0。",
          "订单外识别条目不进入主商品表；主表不提供新增、删除或行级操作。",
          "商品尚未人工修改时可更换关联订单，更换后按新订单重新生成全部商品行。",
          "差异数＝下单数－签收数，输入时实时计算并保留正负号。",
          "默认按正常签收处理；只有操作员点击售后处理后，当前回单才切换为售后单。",
        ],
        ["商品主表固定为七列：序号、订单商品、识别商品、下单数、签收数、差异数、备注。"],
        ["下单数只读；签收数允许 0 和最多两位小数，不允许空值、负数或非数字。"],
      ),
    },
    {
      id: "detail-outbound",
      selectors: [".quantity-table th:nth-child(4)", "[data-quantity-row] td:nth-child(4)"],
      title: "下单数｜观麦只读基准",
      html: specHtml(
        "来自观麦销售订单，是差异计算基准。",
        ["回单页面不得修改；关联订单变化时随新订单商品明细更新。"],
        ["用于实时计算差异数，任何售后分支提交后均保持原值。"],
        ["订单商品均来自当前关联销售订单；未关联时不生成商品行。"],
      ),
    },
    {
      id: "detail-actual",
      selectors: [".quantity-table th:nth-child(5)", ".actual-input"],
      title: "签收数｜AI 识别与人工确认",
      html: specHtml(
        "AI 识别商户实收数并预填为签收数，操作员在此直接修正。",
        [
          "AI 匹配成功时预填识别数量；漏识别的订单商品填 0。",
          "允许 0 和小数，不允许空值、负数或非数字。",
          "签收数保存在回单审核记录中；观麦开启销售实收时，确认提交后写入销售订单出库数。",
        ],
        ["输入时实时更新差异数；保存按钮只保存本应用草稿。"],
        ["校验失败保留输入并定位当前行，不向观麦同步数据。"],
      ),
    },
    {
      id: "detail-difference",
      selectors: [".quantity-table th:nth-child(6)", ".variance"],
      title: "差异数｜实时计算口径",
      html: specHtml(
        "用于反映观麦下单数与商户签收数之间的有向差额。",
        ["差异数＝下单数－签收数；正数表示少收，0 表示一致，负数表示多收。"],
        ["签收数变化时当前行立即重算；售后单首次纳入差异商品时，异常数或应退数默认取差异绝对量，操作员可修正。"],
        ["差异只针对当前关联销售订单商品计算。"],
      ),
    },
    {
      id: "detail-after-sales-entry",
      selectors: ["[data-enter-after-sales]", "[data-cancel-after-sales]"],
      title: "售后处理｜独立弹窗维护",
      html: specHtml(
        "主页面始终保持签收核对视图；点击后在独立弹窗维护售后商品和处理方式。",
        [
          "首次打开时默认加入当前差异商品，并可从关联订单已有商品继续新增或移除售后明细。",
          "移除售后明细不删除订单商品，也不清除签收数。",
          "非商品异常对应观麦销售订单异常金额。",
          "商品异常—异常对应观麦商品异常数。",
          "商品异常—退货对应观麦商品应退数，并生成退货入库单。",
        ],
        ["点击“保存售后处理”后才更新草稿；直接关闭不保存本次弹窗改动。已保存售后可二次确认取消。"],
        ["未关联订单时不能打开售后处理；售后单没有商品或字段未完善时不能提交。"],
      ),
    },
    {
      id: "detail-order-summary",
      selectors: [".receipt-order-summary"],
      title: "关联订单汇总｜签收处理进度",
      html: specHtml(
        "关联销售订单后，仅汇总订单商品数和差异商品数；当前单据模式只由回单组标题区的单个标签展示。",
        [
          "正常模式不因差异自动转售后。",
          "售后模式的明细状态在售后处理弹窗内查看。",
        ],
        ["签收数或售后草稿变化时立即重算。"],
        ["未关联销售订单时不展示汇总。"],
      ),
    },
    {
      id: "detail-save",
      selectors: ["[data-save-now]"],
      title: "保存｜草稿持久化",
      html: specHtml(
        "保存当前关联、回单字段和签收数草稿，但不调用观麦接口、不改变任务状态。",
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
        "根据当前单据模式提交正常签收结果或售后单结果。",
        [
          "前置条件：已关联唯一销售订单且签收数合法。",
          "正常模式即使存在差异，也按正常签收提交，不写入售后三字段。",
          "售后模式至少保留一个售后商品，且每项售后类型、原因和处理值完整。",
          "未关联订单时按钮禁用，提交校验再次拦截；AI 默认关联可直接作为有效关联提交。",
          "提交时读取观麦销售实收开关；开启时签收数写入出库数，关闭时不修改出库数。",
          "下单数不参与写入并始终保持不变。",
          "字段同步及退货入库单创建全部成功后，任务从待处理变为已完成并进入只读状态。",
          "销售订单与销售回单一一对应，已完成任务不得再次提交。",
        ],
        ["提交期间按钮禁用防重复；成功弹窗回显观麦同步结果及退货入库单号。"],
        ["任一同步失败时任务保持待处理，保留草稿并允许按回单编号幂等重试。"],
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
    if (query.get("status") === "待处理") {
      const heading = one(".page-head h1");
      const route = one(".route-tab.active");
      if (heading) heading.textContent = "回单审核";
      if (route) route.textContent = "回单审核　×";
      document.title = "回单审核｜销售回单";
    }

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

  function signedDifference(outbound, actual) {
    if (!Number.isFinite(outbound) || !Number.isFinite(actual)) return Number.NaN;
    return Math.round((outbound - actual + Number.EPSILON) * 100) / 100;
  }

  function rowDifference(row) {
    const value = Number(row?.dataset.currentDiff);
    return row?.dataset.currentDiff === "" || !Number.isFinite(value)
      ? Number.NaN
      : value;
  }

  function afterSalesDemoFor(line) {
    if (document.body.dataset.readonly !== "true") return {};
    const orderId = document.body.dataset.orderId || "";
    return receiptAfterSalesCatalog[orderId]?.[line.id] || {};
  }

  function ensureAfterSalesReasonOptions() {
    if (document.getElementById("afterSalesReasonOptions")) return;
    const list = document.createElement("datalist");
    list.id = "afterSalesReasonOptions";
    list.innerHTML = guanmaiAfterSalesReasonOptions
      .map(
        (item) =>
          `<option value="${escapeHTML(item.label)}" data-reason-code="${escapeHTML(item.code)}"></option>`,
      )
      .join("");
    document.body.appendChild(list);
  }

  function renderAfterSalesOptions(value) {
    return [
      '<option value="">请选择</option>',
      ...Object.entries(afterSalesTypes).map(([key, item]) => {
        const selected = key === value ? " selected" : "";
        return `<option value="${key}"${selected}>${item.label}</option>`;
      }),
    ].join("");
  }

  function renderAfterSalesValue({
    type,
    difference,
    unit,
    exceptionAmount = "",
    afterSalesQuantity = "",
    returnInboundId = "",
  }) {
    if (!type) {
      return '<span class="after-sales-empty pending">请选择类型</span>';
    }
    const defaultQuantity =
      Number.isFinite(difference) && difference !== 0
        ? Math.abs(difference)
        : "";
    const quantity = afterSalesQuantity === "" ? defaultQuantity : afterSalesQuantity;
    const readonly = document.body.dataset.readonly === "true";
    if (type === "non_product_exception") {
      if (readonly) {
        return `<span class="after-sales-field"><span>异常金额</span><strong>${formatMoney(Number(exceptionAmount || 0))}</strong></span>`;
      }
      return `<label class="after-sales-field amount"><span>异常金额</span><span class="after-sales-money">¥<input class="exception-amount-input" inputmode="decimal" value="${escapeHTML(exceptionAmount)}" placeholder="0.00" aria-label="异常金额"></span></label>`;
    }
    const fieldLabel = type === "product_exception" ? "异常数" : "应退数";
    const quantityControl = readonly
      ? `<strong>${formatNumber(Number(quantity || 0))} ${escapeHTML(unit)}</strong>`
      : `<span class="after-sales-quantity"><input class="after-sales-quantity-input" inputmode="decimal" value="${escapeHTML(quantity)}" placeholder="0" aria-label="${fieldLabel}"><span>${escapeHTML(unit)}</span></span>`;
    if (type === "product_exception") {
      return `<label class="after-sales-field quantity"><span>异常数</span>${quantityControl}</label>`;
    }
    const completedReference =
      readonly && returnInboundId
        ? `<em class="return-order-id">${escapeHTML(returnInboundId)}</em>`
        : '<em class="return-order-tag">生成退货单</em>';
    return `<label class="after-sales-field return"><span>应退数</span>${quantityControl}${completedReference}</label>`;
  }

  function syncAfterSalesRow(row, preferred = {}) {
    if (!row?.matches("[data-order-line]")) return;
    const difference = rowDifference(row);
    let type = preferred.type ?? row.dataset.afterSalesType ?? "";
    const currentAmount =
      preferred.exceptionAmount ??
      row.dataset.exceptionAmount ??
      "";
    const exceptionAmount = type === "non_product_exception" ? currentAmount : "";
    let reason =
      preferred.reason ??
      row.dataset.afterSalesReason ??
      "";
    const fallbackQuantity =
      Number.isFinite(difference) && difference !== 0
        ? String(Math.abs(difference))
        : "";
    const shouldResetQuantity = preferred.resetQuantity === true;
    let afterSalesQuantity =
      preferred.afterSalesQuantity ?? row.dataset.afterSalesQuantity ?? "";
    if (type === "product_exception" || type === "product_return") {
      const hasPreferredQuantity = preferred.afterSalesQuantity !== undefined;
      if (
        shouldResetQuantity ||
        (!hasPreferredQuantity && row.dataset.afterSalesQuantityManual !== "true")
      ) {
        afterSalesQuantity = fallbackQuantity;
      }
    } else {
      afterSalesQuantity = "";
    }

    row.dataset.afterSalesType = type;
    row.dataset.afterSalesReason = reason;
    row.dataset.exceptionAmount = exceptionAmount;
    row.dataset.afterSalesQuantity = afterSalesQuantity;
    row.dataset.abnormalCount =
      type === "product_exception" ? afterSalesQuantity : "";
    row.dataset.returnCount = type === "product_return" ? afterSalesQuantity : "";
    if (preferred.returnInboundId !== undefined) {
      row.dataset.returnInboundId = preferred.returnInboundId || "";
    }
    updateReceiptSummary();
  }

  function addUnitTotal(target, unit, value) {
    if (!Number.isFinite(value) || value <= 0) return;
    const key = unit || "";
    target.set(key, roundMoney((target.get(key) || 0) + value));
  }

  function formatUnitTotals(target) {
    if (!target.size) return "0";
    return [...target.entries()]
      .map(([unit, value]) => `${formatNumber(value)}${unit}`)
      .join("、");
  }

  function updateReceiptSummary() {
    const summary = one("[data-order-summary]");
    const order = receiptOrderCatalog[document.body.dataset.orderId || ""];
    const rows = all("[data-order-line]", one("[data-quantity-body]") || document);
    const differenceRows = rows.filter((row) => {
      const difference = rowDifference(row);
      return Number.isFinite(difference) && difference !== 0;
    });
    if (summary) {
      summary.hidden = !order;
      const productTarget = one("[data-summary-product-count]", summary);
      const differenceTarget = one("[data-summary-difference-count]", summary);
      if (productTarget) productTarget.textContent = String(rows.length);
      if (differenceTarget) differenceTarget.textContent = String(differenceRows.length);
    }
    const enterButton = one("[data-enter-after-sales]");
    if (enterButton) {
      enterButton.disabled = !order;
      enterButton.title = order ? "打开售后处理" : "请先关联销售订单";
    }
    const badge = one("[data-receipt-mode-badge]");
    if (badge) {
      badge.hidden = false;
      badge.textContent = receiptMode === "aftersales" ? "售后单" : "正常签收";
      badge.className = receiptMode === "aftersales"
        ? "receipt-mode-badge after-sales"
        : "receipt-mode-badge normal";
    }
  }

  function receiptDifferenceRows() {
    return all("[data-order-line]").filter((row) => {
      const difference = rowDifference(row);
      return Number.isFinite(difference) && difference !== 0;
    });
  }

  function findOrderLineByItemId(itemId) {
    return all("[data-order-line]").find(
      (row) => one(".actual-input", row)?.dataset.itemId === itemId,
    );
  }

  function receiptAfterSalesRows() {
    return all("[data-order-line]").filter(
      (row) => row.dataset.afterSalesSelected === "true",
    );
  }

  function isAfterSalesRowComplete(row) {
    if (!row) return false;
    const type = row.dataset.afterSalesType || "";
    const reason = (row.dataset.afterSalesReason || "").trim();
    if (!type || !reason || reason.length > 100) return false;
    if (type === "non_product_exception") {
      const amount = Number(row.dataset.exceptionAmount);
      return Number.isFinite(amount) && amount > 0;
    }
    const quantity = Number(row.dataset.afterSalesQuantity);
    return Number.isFinite(quantity) && quantity > 0;
  }

  function readSalesActualFeature() {
    const value = new URLSearchParams(window.location.search).get("salesActual");
    return !["0", "false", "off", "disabled"].includes(
      String(value || "").toLowerCase(),
    );
  }

  function renderAfterSalesWorkbenchRow(sourceRow, index) {
    if (!sourceRow?.matches("[data-order-line]")) return "";
    const input = one(".actual-input", sourceRow);
    const itemId = input?.dataset.itemId || "";
    const productName = sourceRow.dataset.orderProductName || "--";
    const unit = sourceRow.dataset.unit || "";
    const outbound = Number(sourceRow.dataset.outbound);
    const actual = Number(input?.value);
    const difference = rowDifference(sourceRow);
    const selected = sourceRow.dataset.afterSalesSelected === "true";
    const type = selected ? sourceRow.dataset.afterSalesType || "" : "";
    const reason = selected ? sourceRow.dataset.afterSalesReason || "" : "";
    const exceptionAmount = selected ? sourceRow.dataset.exceptionAmount || "" : "";
    const afterSalesQuantity = selected
      ? sourceRow.dataset.afterSalesQuantity || ""
      : Number.isFinite(difference) && difference !== 0
        ? String(Math.abs(difference))
        : "";
    const readonly = document.body.dataset.readonly === "true";
    const typeControl = readonly
      ? `<span class="after-sales-type-text">${escapeHTML(afterSalesTypes[type]?.label || "--")}</span>`
      : `<select class="after-sales-select" aria-label="${escapeHTML(productName)}售后类型">${renderAfterSalesOptions(type)}</select>`;
    const reasonControl = readonly
      ? `<span class="after-sales-reason-text">${escapeHTML(reason || "--")}</span>`
      : `<input class="after-sales-reason-input" list="afterSalesReasonOptions" value="${escapeHTML(reason)}" placeholder="选择或输入" maxlength="100" autocomplete="off" aria-label="${escapeHTML(productName)}售后原因">`;
    const actionCell = readonly
      ? ""
      : `<td><button class="link danger" type="button" data-remove-after-sales-item aria-label="移除${escapeHTML(productName)}">移除</button></td>`;
    return `<tr data-after-sales-item="${escapeHTML(itemId)}" data-after-sales-type="${escapeHTML(type)}" data-unit="${escapeHTML(unit)}" data-current-diff="${Number.isFinite(difference) ? difference : ""}">
      <td data-after-sales-index>${index + 1}</td>
      <td><strong>${escapeHTML(productName)}</strong></td>
      <td class="right">${formatNumber(outbound)} ${escapeHTML(unit)}</td>
      <td class="right">${formatNumber(actual)} ${escapeHTML(unit)}</td>
      <td class="right"><span class="variance ${difference > 0 ? "short" : difference < 0 ? "over" : "equal"}">${formatNumber(difference)} ${escapeHTML(unit)}</span></td>
      <td>${typeControl}</td>
      <td>${reasonControl}</td>
      <td data-after-sales-value>${renderAfterSalesValue({
        type,
        difference,
        unit,
        exceptionAmount,
        afterSalesQuantity,
        returnInboundId: sourceRow.dataset.returnInboundId || "",
      })}</td>
      ${actionCell}
    </tr>`;
  }

  function updateAfterSalesWorkbenchState() {
    const body = one("[data-after-sales-body]");
    const rows = body ? all("[data-after-sales-item]", body) : [];
    const count = one("[data-after-sales-count]");
    const empty = one("[data-after-sales-empty]");
    if (count) count.textContent = String(rows.length);
    if (empty) empty.hidden = rows.length > 0;
    rows.forEach((row, index) => {
      const target = one("[data-after-sales-index]", row);
      if (target) target.textContent = String(index + 1);
    });
  }

  function renderAfterSalesWorkbench({ initialize = false } = {}) {
    const body = one("[data-after-sales-body]");
    if (!body) return;
    const rows = receiptMode === "aftersales" || document.body.dataset.readonly === "true"
      ? receiptAfterSalesRows()
      : initialize
        ? receiptDifferenceRows()
        : [];
    body.innerHTML = rows
      .map((row, index) => renderAfterSalesWorkbenchRow(row, index))
      .join("");
    const readonly = document.body.dataset.readonly === "true";
    one("[data-cancel-after-sales]")?.toggleAttribute(
      "hidden",
      readonly || receiptMode !== "aftersales",
    );
    one("[data-add-after-sales-product]")?.toggleAttribute("hidden", readonly);
    one("[data-save-after-sales]")?.toggleAttribute("hidden", readonly);
    updateAfterSalesWorkbenchState();
  }

  function readAfterSalesWorkbenchRow(row) {
    const type = one(".after-sales-select", row)?.value || row.dataset.afterSalesType || "";
    return {
      itemId: row.dataset.afterSalesItem || "",
      type,
      reason: one(".after-sales-reason-input", row)?.value.trim() || "",
      exceptionAmount: one(".exception-amount-input", row)?.value.trim() || "",
      afterSalesQuantity: one(".after-sales-quantity-input", row)?.value.trim() || "",
    };
  }

  function validateAfterSalesWorkbench() {
    const rows = all("[data-after-sales-body] [data-after-sales-item]");
    if (!rows.length) {
      showToast("请至少新增一个售后商品，或取消售后处理");
      return false;
    }
    for (const row of rows) {
      const select = one(".after-sales-select", row);
      const reason = one(".after-sales-reason-input", row);
      select?.classList.remove("invalid");
      reason?.classList.remove("invalid");
      if (!select?.value) {
        select?.classList.add("invalid");
        select?.focus();
        showToast("请选择售后类型");
        return false;
      }
      const reasonValue = reason?.value.trim() || "";
      if (!reasonValue || reasonValue.length > 100) {
        reason?.classList.add("invalid");
        reason?.focus();
        showToast(reasonValue.length > 100 ? "售后原因最多 100 个字符" : "请选择或输入售后原因");
        return false;
      }
      if (select.value === "non_product_exception") {
        const amount = one(".exception-amount-input", row);
        const raw = amount?.value.trim() || "";
        if (!/^\d+(?:\.\d{1,2})?$/.test(raw) || Number(raw) <= 0) {
          amount?.classList.add("invalid");
          amount?.focus();
          showToast("请填写大于 0 的异常金额");
          return false;
        }
      } else {
        const quantity = one(".after-sales-quantity-input", row);
        const raw = quantity?.value.trim() || "";
        if (!/^\d+(?:\.\d{1,2})?$/.test(raw) || Number(raw) <= 0) {
          quantity?.classList.add("invalid");
          quantity?.focus();
          showToast(`请填写大于 0 的${afterSalesTypes[select.value]?.fieldLabel || "处理数量"}`);
          return false;
        }
      }
    }
    return true;
  }

  function applyAfterSalesWorkbench() {
    if (!validateAfterSalesWorkbench()) return false;
    const staged = new Map(
      all("[data-after-sales-body] [data-after-sales-item]").map((row) => {
        const value = readAfterSalesWorkbenchRow(row);
        return [value.itemId, value];
      }),
    );
    all("[data-order-line]").forEach((row) => {
      const itemId = one(".actual-input", row)?.dataset.itemId || "";
      const value = staged.get(itemId);
      if (value) {
        row.dataset.afterSalesSelected = "true";
        row.dataset.afterSalesQuantityManual = value.type === "non_product_exception" ? "false" : "true";
        syncAfterSalesRow(row, {
          type: value.type,
          reason: value.reason,
          exceptionAmount: value.exceptionAmount,
          afterSalesQuantity: value.afterSalesQuantity,
        });
      } else {
        row.dataset.afterSalesSelected = "false";
        row.dataset.afterSalesType = "";
        row.dataset.afterSalesReason = "";
        row.dataset.exceptionAmount = "";
        row.dataset.afterSalesQuantity = "";
        row.dataset.afterSalesQuantityManual = "false";
        row.dataset.abnormalCount = "";
        row.dataset.returnCount = "";
        row.dataset.returnInboundId = "";
      }
      persistAfterSalesRow(row);
    });
    setReceiptMode("aftersales");
    return true;
  }

  function openAfterSalesWorkbench() {
    if (
      document.body.dataset.readonly !== "true" &&
      !validateReceiptBasics()
    ) {
      return;
    }
    renderAfterSalesWorkbench({ initialize: receiptMode !== "aftersales" });
    openModal("afterSalesWorkbenchModal");
  }

  function receiptModeStorageKey() {
    return `${storagePrefix}:${currentReceiptId() || "receipt-demo"}:${document.body.dataset.orderId || "unassociated"}:mode`;
  }

  function persistReceiptMode() {
    if (document.body.dataset.readonly === "true") return;
    try {
      localStorage.setItem(receiptModeStorageKey(), receiptMode);
    } catch {
      // The prototype remains usable when browser storage is unavailable.
    }
  }

  function setReceiptMode(mode, { initialize = false, persist = true } = {}) {
    receiptMode = mode === "aftersales" ? "aftersales" : "normal";
    document.body.dataset.receiptMode =
      receiptMode === "aftersales" ? "after-sales" : "normal";
    if (persist) persistReceiptMode();
    updateReceiptSummary();
  }

  function initializeReceiptMode() {
    let initialMode = "normal";
    if (document.body.dataset.readonly === "true") {
      initialMode = all("[data-order-line]").some(
        (row) => row.dataset.afterSalesSelected === "true",
      )
        ? "aftersales"
        : "normal";
    } else {
      try {
        initialMode = localStorage.getItem(receiptModeStorageKey()) || "normal";
      } catch {
        initialMode = "normal";
      }
    }
    setReceiptMode(initialMode, {
      initialize: initialMode === "aftersales",
      persist: false,
    });
  }

  function clearAfterSalesDraft() {
    const receiptId = currentReceiptId() || "receipt-demo";
    all("[data-order-line]").forEach((row) => {
      const itemId = one(".actual-input", row)?.dataset.itemId || "";
      row.dataset.afterSalesSelected = "false";
      row.dataset.afterSalesType = "";
      row.dataset.afterSalesReason = "";
      row.dataset.exceptionAmount = "";
      row.dataset.afterSalesQuantity = "";
      row.dataset.afterSalesQuantityManual = "false";
      row.dataset.abnormalCount = "";
      row.dataset.returnCount = "";
      row.dataset.returnInboundId = "";
      if (itemId) {
        try {
          localStorage.removeItem(afterSalesStorageKey(receiptId, itemId));
        } catch {
          // The prototype remains usable when browser storage is unavailable.
        }
      }
    });
    setReceiptMode("normal");
  }

  function renderAfterSalesProductOptions() {
    const target = one("[data-after-sales-product-options]");
    if (!target) return;
    const empty = one("[data-after-sales-product-empty]");
    const stagedIds = new Set(
      all("[data-after-sales-body] [data-after-sales-item]").map(
        (row) => row.dataset.afterSalesItem,
      ),
    );
    const availableRows = all("[data-order-line]").filter((row) => {
      const itemId = one(".actual-input", row)?.dataset.itemId || "";
      return itemId && !stagedIds.has(itemId);
    });
    target.innerHTML = availableRows
      .map((row) => {
        const itemId = one(".actual-input", row)?.dataset.itemId || "";
        const difference = rowDifference(row);
        const unit = escapeHTML(row.dataset.unit || "");
        return `<tr><td><input type="checkbox" value="${escapeHTML(itemId)}" aria-label="选择${escapeHTML(row.dataset.orderProductName || "当前商品")}"></td><td><strong>${escapeHTML(row.dataset.orderProductName || "--")}</strong></td><td class="right">${formatNumber(Number(row.dataset.outbound))} ${unit}</td><td class="right">${formatNumber(Number(one(".actual-input", row)?.value))} ${unit}</td><td class="right"><span class="variance ${difference > 0 ? "short" : difference < 0 ? "over" : "equal"}">${formatNumber(difference)} ${unit}</span></td></tr>`;
      })
      .join("");
    if (empty) empty.hidden = availableRows.length > 0;
    one(".after-sales-product-options-wrap")?.toggleAttribute(
      "hidden",
      availableRows.length === 0,
    );
  }

  function openAfterSalesProductSelector() {
    renderAfterSalesProductOptions();
    openModal("afterSalesProductModal");
  }

  function removeAfterSalesRow(row) {
    if (!row?.matches("[data-after-sales-item]")) return;
    row.remove();
    updateAfterSalesWorkbenchState();
    showToast("已从售后单移除，原订单商品和签收数保持不变");
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
      ".receipt-ai-panel .actual-input",
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
      const afterSalesSelect = one(".after-sales-select", row);
      if (afterSalesSelect) afterSalesSelect.disabled = true;
      const afterSalesReason = one(".after-sales-reason-input", row);
      if (afterSalesReason) afterSalesReason.disabled = true;
      updateReceiptSummary();
      updateGlobalSaveState();
      return false;
    }

    const difference = signedDifference(outbound, actual);
    row.dataset.currentDiff = String(difference);
    if (variance) {
      variance.textContent = `${formatNumber(difference)} ${unit}`;
      variance.className = `variance ${difference > 0 ? "short" : difference < 0 ? "over" : "equal"}`;
    }
    if (difference > 0) row.classList.add("row-short");
    if (difference < 0) row.classList.add("row-over");
    syncAfterSalesRow(row);
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

  function afterSalesStorageKey(receiptId, itemId) {
    return `${quantityStorageKey(receiptId, itemId)}:after-sales`;
  }

  function persistAfterSalesRow(row) {
    if (!row?.matches("[data-order-line]")) return;
    const itemId = one(".actual-input", row)?.dataset.itemId;
    if (!itemId) return;
    const receiptId = document.body.dataset.receiptId || "receipt-demo";
    const payload = {
      selected: row.dataset.afterSalesSelected === "true",
      type: row.dataset.afterSalesType || "",
      reason:
        one(".after-sales-reason-input", row)?.value.trim() ??
        row.dataset.afterSalesReason ??
        "",
      exceptionAmount:
        one(".exception-amount-input", row)?.value ??
        row.dataset.exceptionAmount ??
        "",
      afterSalesQuantity:
        one(".after-sales-quantity-input", row)?.value ??
        row.dataset.afterSalesQuantity ??
        "",
      quantityManual: row.dataset.afterSalesQuantityManual === "true",
    };
    try {
      const key = afterSalesStorageKey(receiptId, itemId);
      if (!payload.selected && !payload.type && !payload.reason) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(payload));
      }
    } catch {
      // The prototype remains usable when browser storage is unavailable.
    }
  }

  function restoreAfterSalesRow(row) {
    if (!row?.matches("[data-order-line]") || row.dataset.afterSalesRestored === "true") {
      return;
    }
    row.dataset.afterSalesRestored = "true";
    const itemId = one(".actual-input", row)?.dataset.itemId;
    if (!itemId) return;
    const receiptId = document.body.dataset.receiptId || "receipt-demo";
    try {
      const stored = localStorage.getItem(afterSalesStorageKey(receiptId, itemId));
      if (!stored) return;
      const payload = JSON.parse(stored);
      row.dataset.afterSalesSelected = payload.selected ? "true" : "false";
      row.dataset.afterSalesQuantityManual = payload.quantityManual
        ? "true"
        : "false";
      syncAfterSalesRow(row, {
        type: payload.type || "",
        reason: payload.reason || "",
        exceptionAmount: payload.exceptionAmount || "",
        afterSalesQuantity: payload.afterSalesQuantity || "",
      });
    } catch {
      // Ignore unavailable or damaged local storage in this static prototype.
    }
  }

  function bindAfterSalesEditing() {
    all("[data-order-line]").forEach(restoreAfterSalesRow);
    if (document.body.dataset.afterSalesBound === "true") return;
    document.body.dataset.afterSalesBound = "true";

    document.body.addEventListener("change", (event) => {
      const select = event.target.closest(".after-sales-select");
      if (!select) return;
      const row = select.closest("[data-after-sales-item]");
      if (!row) return;
      select.classList.remove("invalid");
      row.dataset.afterSalesType = select.value;
      const valueCell = one("[data-after-sales-value]", row);
      if (valueCell) {
        valueCell.innerHTML = renderAfterSalesValue({
          type: select.value,
          difference: Number(row.dataset.currentDiff),
          unit: row.dataset.unit || "",
        });
      }
    });

    document.body.addEventListener("input", (event) => {
      event.target.classList.remove("invalid");
    });

    all("[data-enter-after-sales]").forEach((button) => {
      button.addEventListener("click", openAfterSalesWorkbench);
    });

    all("[data-cancel-after-sales]").forEach((button) => {
      button.addEventListener("click", () => {
        openModal("cancelAfterSalesModal");
      });
    });

    one("[data-confirm-cancel-after-sales]")?.addEventListener("click", () => {
      clearAfterSalesDraft();
      closeModal("cancelAfterSalesModal");
      closeModal("afterSalesWorkbenchModal");
      setTaskState("待处理");
      showToast("已取消售后处理，签收数已保留");
    });

    one("[data-save-after-sales]")?.addEventListener("click", () => {
      if (!applyAfterSalesWorkbench()) return;
      closeModal("afterSalesWorkbenchModal");
      setTaskState("待处理");
      showToast("售后处理已保存");
    });

    all("[data-add-after-sales-product]").forEach((button) => {
      button.addEventListener("click", openAfterSalesProductSelector);
    });

    one("[data-confirm-add-after-sales-products]")?.addEventListener("click", () => {
      const selectedIds = all(
        '[data-after-sales-product-options] input[type="checkbox"]:checked',
      ).map((input) => input.value);
      if (!selectedIds.length) {
        showToast("请选择需要加入售后单的商品");
        return;
      }
      const body = one("[data-after-sales-body]");
      const startIndex = body ? all("[data-after-sales-item]", body).length : 0;
      if (body) {
        body.insertAdjacentHTML(
          "beforeend",
          selectedIds
            .map((itemId, index) =>
              renderAfterSalesWorkbenchRow(findOrderLineByItemId(itemId), startIndex + index),
            )
            .join(""),
        );
      }
      updateAfterSalesWorkbenchState();
      closeModal("afterSalesProductModal");
      showToast(`已新增 ${selectedIds.length} 个售后商品`);
    });

    document.body.addEventListener("click", (event) => {
      const remove = event.target.closest(
        "[data-remove-after-sales-row], [data-remove-after-sales-item]",
      );
      if (!remove) return;
      removeAfterSalesRow(remove.closest("[data-after-sales-item]"));
    });
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
      persistAfterSalesRow(input.closest("[data-order-line]"));
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
        const rows = all("[data-order-line]");
        if (!inputs.length && !rows.length) {
          showToast("暂无可保存的审核内容");
          return;
        }
        inputs.forEach((input) => scheduleSave(input, true));
        rows.forEach(persistAfterSalesRow);
        showToast("正在保存审核草稿");
      });
    });
  }

  function collectAfterSalesPayload() {
    const rows = [];
    const abnormalTotals = new Map();
    const returnTotals = new Map();
    let exceptionAmount = 0;
    receiptAfterSalesRows().forEach((row) => {
      const difference = rowDifference(row);
      const type = row.dataset.afterSalesType || "";
      const reason =
        one(".after-sales-reason-input", row)?.value.trim() ||
        row.dataset.afterSalesReason ||
        "";
      const amount = Number(
        one(".exception-amount-input", row)?.value ?? row.dataset.exceptionAmount,
      );
      const afterSalesQuantity = Number(
        one(".after-sales-quantity-input", row)?.value ??
          row.dataset.afterSalesQuantity,
      );
      const item = {
        itemId: one(".actual-input", row)?.dataset.itemId || "",
        productName: row.dataset.orderProductName || "",
        orderedQuantity: Number(row.dataset.outbound),
        receivedQuantity: Number(one(".actual-input", row)?.value),
        difference,
        unit: row.dataset.unit || "",
        type,
        reason,
        exceptionAmount:
          type === "non_product_exception" && Number.isFinite(amount)
            ? roundMoney(amount)
            : 0,
        abnormalCount:
          type === "product_exception" && Number.isFinite(afterSalesQuantity)
            ? afterSalesQuantity
            : 0,
        returnCount:
          type === "product_return" && Number.isFinite(afterSalesQuantity)
            ? afterSalesQuantity
            : 0,
      };
      rows.push(item);
      exceptionAmount += item.exceptionAmount;
      addUnitTotal(abnormalTotals, item.unit, item.abnormalCount);
      addUnitTotal(returnTotals, item.unit, item.returnCount);
    });
    return {
      receiptId: document.body.dataset.receiptId || "",
      orderId: document.body.dataset.orderId || "",
      associationSource:
        document.body.dataset.orderAssociationSource === "manual"
          ? "人工选择"
          : "AI 默认",
      rows,
      exceptionAmount: roundMoney(exceptionAmount),
      abnormalTotals,
      returnTotals,
      nonProductCount: rows.filter(
        (item) => item.type === "non_product_exception",
      ).length,
      productExceptionCount: rows.filter(
        (item) => item.type === "product_exception",
      ).length,
      productReturnCount: rows.filter(
        (item) => item.type === "product_return",
      ).length,
      receiptMode,
    };
  }

  function validateReceiptBasics() {
    if (!document.body.dataset.orderId) {
      showToast("请先选择销售订单");
      return false;
    }
    const writebackInputs = all(".actual-input");
    const invalidInput = writebackInputs.find(
      (input) => !updateQuantityRow(input),
    );
    if (invalidInput) {
      invalidInput.focus();
      showToast("请检查签收数");
      return false;
    }
    return true;
  }

  function validateReceiptSubmission() {
    if (!validateReceiptBasics()) return null;
    if (
      receiptMode === "aftersales" &&
      (!receiptAfterSalesRows().length ||
        receiptAfterSalesRows().some((row) => !isAfterSalesRowComplete(row)))
    ) {
      renderAfterSalesWorkbench();
      openModal("afterSalesWorkbenchModal");
      showToast("请先完善并保存售后处理");
      return null;
    }
    return receiptMode === "aftersales"
      ? collectAfterSalesPayload()
      : {
          receiptId: document.body.dataset.receiptId || "",
          orderId: document.body.dataset.orderId || "",
          associationSource:
            document.body.dataset.orderAssociationSource === "manual"
              ? "人工选择"
              : "AI 默认",
          rows: [],
          exceptionAmount: 0,
          abnormalTotals: new Map(),
          returnTotals: new Map(),
          nonProductCount: 0,
          productExceptionCount: 0,
          productReturnCount: 0,
          receiptMode: "normal",
        };
  }

  function prepareReceiptSubmission(payload) {
    const receivedRows = all("[data-order-line]").map((row) => ({
      itemId: one(".actual-input", row)?.dataset.itemId || "",
      productName: row.dataset.orderProductName || "",
      receivedQuantity: Number(one(".actual-input", row)?.value),
      unit: row.dataset.unit || "",
    }));
    pendingSubmitPayload = {
      ...payload,
      receivedRows,
      differenceCount: receiptDifferenceRows().length,
      normalReceipt: payload.receiptMode !== "aftersales",
      salesActualEnabled: readSalesActualFeature(),
    };
    renderSubmitSummary(pendingSubmitPayload);
    openModal("submitConfirmModal");
  }

  function renderSubmitSummary(payload) {
    const target = one("[data-submit-summary]");
    if (!target) return;
    const reasons = [...new Set(payload.rows.map((item) => item.reason).filter(Boolean))];
    const salesActualNotice = payload.salesActualEnabled
      ? '<p class="sales-actual-notice on"><strong>销售实收已开启</strong><span>确认后将签收数写入销售订单出库数。</span></p>'
      : '<p class="sales-actual-notice off"><strong>销售实收未开启</strong><span>本次不修改出库数，回单仍可正常完成。</span></p>';
    const afterSalesSummary = payload.normalReceipt
      ? `<div class="normal-receipt-summary"><strong>正常签收</strong><span>${payload.differenceCount ? `当前存在 ${payload.differenceCount} 个差异商品，本次不生成售后单。` : "所有商品签收数与下单数一致，无需售后处理。"}</span></div>`
      : `<div class="submit-summary-grid">
          <span><b>非商品异常</b><strong>${payload.nonProductCount} 项 · ${formatMoney(payload.exceptionAmount)}</strong></span>
          <span><b>商品异常</b><strong>${payload.productExceptionCount} 项 · ${formatUnitTotals(payload.abnormalTotals)}</strong></span>
          <span><b>商品退货</b><strong>${payload.productReturnCount} 项 · ${formatUnitTotals(payload.returnTotals)}</strong></span>
        </div>
        <p class="submit-reason-notice">售后原因：${reasons.map(escapeHTML).join("、")}</p>
        ${payload.productReturnCount ? '<p class="submit-return-notice">提交后将在观麦生成退货入库单。</p>' : ""}`;
    target.innerHTML = `
      <div class="submit-summary-order">销售订单 <strong>${escapeHTML(payload.orderId)}</strong><em>${escapeHTML(payload.associationSource)}</em><span class="prototype-badge">原型演示</span></div>
      <div class="receipt-submit-facts"><span>${payload.normalReceipt ? "正常签收" : "售后单"}</span><span>${payload.normalReceipt ? `商品 ${payload.receivedRows.length} 项` : `售后商品 ${payload.rows.length} 项`}</span><span>差异 ${payload.differenceCount} 项</span></div>
      ${salesActualNotice}
      ${afterSalesSummary}`;
  }

  function completeReceiptSubmission(button) {
    if (!pendingSubmitPayload) return;
    const payload = pendingSubmitPayload;
    if (!bindOrderToCurrentReceipt(payload.orderId)) {
      showToast("订单关联状态已变化，请重新确认");
      return;
    }
    button.disabled = true;
    button.textContent = "同步中…";
    all(".actual-input").forEach((input) => scheduleSave(input, true));
    if (!payload.normalReceipt) receiptAfterSalesRows().forEach(persistAfterSalesRow);

    window.setTimeout(() => {
      const returnRows = receiptAfterSalesRows().filter(
        (row) => row.dataset.afterSalesType === "product_return",
      );
      const existingReturnId = returnRows
        .map((row) => row.dataset.returnInboundId)
        .find(Boolean);
      const generatedReturnId = returnRows.length
        ? existingReturnId ||
          `THRK-20260804-${String(payload.receiptId.slice(-3) || "001").padStart(4, "0")}`
        : "";
      returnRows.forEach((row) => {
        row.dataset.returnInboundId = generatedReturnId;
      });
      const generatedIds = generatedReturnId ? [generatedReturnId] : [];

      setTaskState("已完成");
      document.body.dataset.readonly = "true";
      returnRows.forEach((row) => syncAfterSalesRow(row, {
        type: "product_return",
        returnInboundId: row.dataset.returnInboundId,
      }));
      applyDetailReadOnlyMode();
      button.disabled = false;
      button.textContent = "确认提交";
      closeModal("submitConfirmModal");
      const result = one("[data-submit-result]");
      if (result) {
        result.innerHTML = `
          <div class="submit-result-success">原型演示：已模拟同步观麦</div>
          <dl><div><dt>销售订单</dt><dd>${escapeHTML(payload.orderId)}</dd></div><div><dt>单据类型</dt><dd>${payload.normalReceipt ? "正常签收" : "售后单"}</dd></div><div><dt>下单数</dt><dd>保持不变</dd></div><div><dt>出库数</dt><dd>${payload.salesActualEnabled ? "已按签收数更新" : "未更新（销售实收未开启）"}</dd></div><div><dt>处理结果</dt><dd>${payload.normalReceipt ? "已按正常签收提交，不生成售后字段" : `已处理 ${payload.rows.length} 项售后`}</dd></div>${generatedIds.length ? `<div><dt>退货入库单</dt><dd>${generatedIds.map(escapeHTML).join("、")}</dd></div>` : ""}</dl>`;
      }
      openModal("submitResultModal");
      showToast("原型演示完成，未产生真实观麦数据");
      pendingSubmitPayload = null;
    }, 720);
  }

  function bindConfirmSubmit() {
    all("[data-confirm-submit]").forEach((button) => {
      if (button.dataset.submitBound === "true") return;
      button.dataset.submitBound = "true";
      button.addEventListener("click", () => {
        const payload = validateReceiptSubmission();
        if (!payload) return;
        prepareReceiptSubmission(payload);
      });
    });

    const confirm = one("[data-confirm-submit-action]");
    if (confirm && confirm.dataset.bound !== "true") {
      confirm.dataset.bound = "true";
      confirm.addEventListener("click", () => completeReceiptSubmission(confirm));
    }
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
    return merchantTerminology(value)
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
        showToast("请先选择商户或群聊");
        return;
      }
      const activeMode =
        one("[data-source-mode].active", root)?.dataset.sourceMode || "merchant";
      if (activeMode === "group" && !selectedCustomer) {
        showToast("请选择群聊对应的商户");
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
              已识别 3 个商品，其中 1 个签收数需要人工补充。
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
      target.textContent = merchantTerminology(value);
    });
  }

  function setDetailValue(selector, value) {
    all(selector).forEach((target) => {
      if ("value" in target) target.value = merchantTerminology(value);
      else target.textContent = merchantTerminology(value);
    });
  }

  function productModificationStorageKey() {
    return `${storagePrefix}:${currentReceiptId() || "receipt-demo"}:products-modified`;
  }

  function hasProductModifications() {
    return document.body.dataset.productRowsModified === "true";
  }

  function isOrderAssociationLocked() {
    return Boolean(document.body.dataset.orderId) && hasProductModifications();
  }

  function markReceiptProductsModified() {
    if (document.body.dataset.readonly === "true") return;
    document.body.dataset.productRowsModified = "true";
    try {
      localStorage.setItem(productModificationStorageKey(), "true");
    } catch {
      // Ignore unavailable local storage in this static prototype.
    }
    updateOrderAssociationUI();
  }

  function restoreProductModificationLock() {
    try {
      if (localStorage.getItem(productModificationStorageKey()) === "true") {
        document.body.dataset.productRowsModified = "true";
      }
    } catch {
      // Ignore unavailable local storage in this static prototype.
    }
    updateOrderAssociationUI();
  }

  function bindProductModificationLock() {
    const target = one("[data-quantity-body]");
    if (!target || document.body.dataset.readonly === "true") return;
    restoreProductModificationLock();
    if (target.dataset.productModificationBound === "true") return;
    target.dataset.productModificationBound = "true";
    target.addEventListener("input", (event) => {
      if (
        event.target.matches(
          ".actual-input, .detail-remark-input",
        )
      ) {
        markReceiptProductsModified();
      }
    });
  }

  function updateOrderAssociationUI() {
    const orderId = document.body.dataset.orderId || "";
    const source = document.body.dataset.orderAssociationSource ||
      (orderId ? "ai" : "none");
    const container = one("[data-order-association]");
    const idTarget = one("[data-associated-order-id]");
    const sourceTarget = one("[data-association-source]");
    const queryButton = one("[data-open-order-query]");
    const submitButton = one("[data-confirm-submit]");
    const associationLocked = isOrderAssociationLocked();
    const sourceLabels = {
      ai: "AI 默认",
      manual: "人工选择",
      submitted: "提交快照",
      none: "未关联",
    };

    container?.classList.toggle("is-linked", Boolean(orderId));
    container?.classList.toggle("is-unlinked", !orderId);
    container?.classList.toggle("is-locked", associationLocked);
    if (idTarget) idTarget.textContent = orderId || "--";
    if (sourceTarget) sourceTarget.textContent = sourceLabels[source] || sourceLabels.ai;
    if (queryButton) {
      queryButton.textContent = orderId ? "更换订单" : "查询订单";
      queryButton.disabled = associationLocked;
      queryButton.setAttribute("aria-disabled", String(associationLocked));
      queryButton.title = associationLocked
        ? "商品条目已人工修改，不可更换关联订单"
        : orderId
          ? `当前关联 ${orderId}，点击查询并更换`
          : "查询并关联销售订单";
    }
    if (submitButton && document.body.dataset.readonly !== "true") {
      submitButton.disabled = !orderId;
      submitButton.title = orderId ? "" : "请先关联销售订单";
    }
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
    const resolvedOrderId = config.orderId || (config.candidateIds || [])[0] || "";
    if (resolvedOrderId) {
      document.body.dataset.orderId = resolvedOrderId;
      document.body.dataset.orderUnassociated = "false";
      document.body.dataset.orderAssociationSource =
        config.state === "已完成" ? "submitted" : "ai";
    } else {
      delete document.body.dataset.orderId;
      document.body.dataset.orderUnassociated = "true";
      document.body.dataset.orderAssociationSource = "none";
    }

    const associatedOrder = resolvedOrderId
      ? receiptOrderCatalog[resolvedOrderId]
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

  function renderOrderLine(line, index, receiptItem = null) {
    const recognizedName =
      receiptItem?.recognizedName ?? (line.aiText ? line.name : "");
    const actual =
      receiptItem?.actual ?? (line.actual === "" ? "0" : String(line.actual));
    const remark = receiptItem?.remark ?? line.remark ?? "";
    const aiText = receiptItem?.aiText ?? line.aiText ?? "";
    const difference = signedDifference(Number(line.outbound), Number(actual));
    const rowClass = difference > 0 ? "row-short" : difference < 0 ? "row-over" : "";
    const varianceClass =
      difference > 0 ? "short" : difference < 0 ? "over" : "equal";
    const demo = afterSalesDemoFor(line);
    const hasPreservedType =
      receiptItem && Object.prototype.hasOwnProperty.call(receiptItem, "afterSalesType");
    let afterSalesType = hasPreservedType
      ? receiptItem.afterSalesType || ""
      : demo.type || "";
    if (!Number.isFinite(difference)) {
      afterSalesType = "";
    }
    const afterSalesReason =
      afterSalesType
        ? receiptItem?.afterSalesReason ?? demo.reason ?? ""
        : "";
    const exceptionAmount = hasPreservedType
      ? receiptItem.exceptionAmount || ""
      : demo.exceptionAmount || "";
    const returnInboundId =
      receiptItem?.returnInboundId || demo.returnInboundId || "";
    const quantity = Number.isFinite(difference) ? Math.abs(difference) : "";
    const afterSalesSelected =
      receiptItem?.afterSalesSelected === true || Boolean(afterSalesType);
    const afterSalesQuantity =
      receiptItem?.afterSalesQuantity ??
      (afterSalesType === "product_exception" || afterSalesType === "product_return"
        ? String(quantity)
        : "");
    return `
      <tr class="${rowClass}" data-product-row data-quantity-row data-order-line data-order-product-name="${escapeHTML(line.name)}" data-recognized-name="${escapeHTML(recognizedName)}" data-ai-text="${escapeHTML(aiText)}" data-outbound="${line.outbound}" data-unit="${escapeHTML(line.unit)}" data-current-diff="${difference}" data-after-sales-selected="${afterSalesSelected}" data-after-sales-type="${afterSalesType}" data-after-sales-reason="${escapeHTML(afterSalesReason)}" data-exception-amount="${escapeHTML(exceptionAmount)}" data-after-sales-quantity="${escapeHTML(afterSalesQuantity)}" data-after-sales-quantity-manual="false" data-abnormal-count="${afterSalesType === "product_exception" ? afterSalesQuantity : ""}" data-return-count="${afterSalesType === "product_return" ? afterSalesQuantity : ""}" data-return-inbound-id="${escapeHTML(returnInboundId)}">
        <td data-row-index>${index + 1}</td>
        <td><strong>${escapeHTML(line.name)}</strong></td>
        <td data-recognized-product>${escapeHTML(recognizedName || "--")}</td>
        <td class="right"><strong>${formatNumber(line.outbound)} ${escapeHTML(line.unit)}</strong></td>
        <td><div class="quantity-input-wrap"><input class="quantity-input actual-input" inputmode="decimal" value="${escapeHTML(actual)}" placeholder="请填写" aria-label="${escapeHTML(line.name)}签收数" data-item-id="${escapeHTML(line.id)}"${receiptItem ? ' data-preserve-current="true"' : ""}><span class="unit-suffix">${escapeHTML(line.unit)}</span></div></td>
        <td class="right"><span class="variance ${varianceClass}" data-variance>${formatNumber(difference)} ${escapeHTML(line.unit)}</span></td>
        <td><input class="detail-remark-input" value="${escapeHTML(remark)}" placeholder="填写备注" aria-label="${escapeHTML(line.name)}备注"></td>
      </tr>`;
  }

  function renderQuantityRows(order) {
    const target = one("[data-quantity-body]");
    if (!target) return;
    if (!order) {
      target.innerHTML = '<tr class="empty-row"><td colspan="7">请先关联销售订单</td></tr>';
    } else {
      target.innerHTML = order.lines
        .map((line, index) => renderOrderLine(line, index))
        .join("");
    }
    target.hidden = false;
    bindQuantityEditing();
    bindAfterSalesEditing();
    initializeReceiptMode();
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
    if (initialOrderId) {
      document.body.dataset.orderId = initialOrderId;
      document.body.dataset.orderAssociationSource ||= "ai";
    }
    renderQuantityRows(receiptOrderCatalog[initialOrderId] || null);
    updateOrderAssociationUI();
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
    if (initialOrderId) {
      document.body.dataset.orderId = initialOrderId;
      document.body.dataset.orderAssociationSource ||= "ai";
    }
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
    });

    const periodsOverlap = (startA, endA, startB, endB) => {
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
        periodsOverlap(
          criteria.orderStart,
          criteria.orderEnd,
          order.orderTime,
          order.orderTimeEnd,
        )
      ) {
        score += 18;
      }
      if (
        periodsOverlap(
          criteria.receiveStart,
          criteria.receiveEnd,
          order.receiveTime,
          order.receiveTimeEnd,
        )
      ) {
        score += 18;
      }
      return score;
    };

    const queryOrders = () => {
      const criteria = readCriteria();
      const eligibleStatuses = ["等待分拣", "分拣中", "配送中", "已签收"];
      const eligibleOrders = Object.values(receiptOrderCatalog).filter(
        (order) => eligibleStatuses.includes(order.orderStatus),
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
    const formatTimePeriod = (start, end) =>
      `${formatDateTime(start)} ～ ${formatDateTime(end || start)}`;

    const renderQueryResults = () => {
      const orders = queryOrders();
      const currentOrderId = document.body.dataset.orderId || "";
      const defaultOrderId = orders.some((order) => order.id === currentOrderId)
        ? currentOrderId
        : orders.length === 1
          ? orders[0].id
          : "";
      pendingOrderId = defaultOrderId;
      confirm.disabled = !defaultOrderId;
      confirm.textContent =
        defaultOrderId && defaultOrderId === currentOrderId
          ? "保持关联"
          : "关联订单";
      if (!orders.length) {
        queryBody.innerHTML =
          '<tr class="empty-row"><td colspan="5">未查询到符合条件的销售订单</td></tr>';
        return;
      }
      queryBody.innerHTML = orders
        .map((order) => {
          const checked = order.id === defaultOrderId ? " checked" : "";
          const currentTag =
            order.id === currentOrderId
              ? '<em class="current-order-tag">当前</em>'
              : "";
          const rowClasses = checked ? "selected" : "";
          return `<tr${rowClasses ? ` class="${rowClasses}"` : ""}>
            <td><input type="radio" name="query-order" value="${escapeHTML(order.id)}" aria-label="选择销售订单 ${escapeHTML(order.id)}"${checked}></td>
            <td>${escapeHTML(order.merchant)}</td>
            <td><strong>${escapeHTML(order.id)}</strong>${currentTag}</td>
            <td>${escapeHTML(formatTimePeriod(order.orderTime, order.orderTimeEnd))}</td>
            <td>${escapeHTML(formatTimePeriod(order.receiveTime, order.receiveTimeEnd))}</td>
          </tr>`;
        })
        .join("");
    };

    openButton.addEventListener("click", () => {
      if (isOrderAssociationLocked()) {
        showToast("商品条目已人工修改，不可更换关联订单");
        return;
      }
      const criteria = readCriteria();
      if (
        criteria.orderStart &&
        criteria.orderEnd &&
        new Date(criteria.orderStart) > new Date(criteria.orderEnd)
      ) {
        showToast("下单时间段的开始时间不可晚于结束时间");
        return;
      }
      if (
        criteria.receiveStart &&
        criteria.receiveEnd &&
        new Date(criteria.receiveStart) > new Date(criteria.receiveEnd)
      ) {
        showToast("收货时间段的开始时间不可晚于结束时间");
        return;
      }
      renderQueryResults();
      const title = one("#orderQueryModalTitle");
      if (title) {
        title.textContent = document.body.dataset.orderId
          ? "更换关联订单"
          : "查询销售订单";
      }
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
      confirm.textContent =
        radio.value === (document.body.dataset.orderId || "")
          ? "保持关联"
          : "关联订单";
    });

    confirm.addEventListener("click", () => {
      if (isOrderAssociationLocked()) {
        closeModal("orderQueryModal");
        showToast("商品条目已人工修改，不可更换关联订单");
        return;
      }
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
      confirm.disabled = true;
      confirm.textContent = "正在关联…";
      window.setTimeout(() => {
        if (!bindOrderToCurrentReceipt(nextOrder.id, oldOrderId)) {
          confirm.disabled = false;
          confirm.textContent = "关联订单";
          showToast("订单关联状态已变化，请重新选择");
          return;
        }
        clearAfterSalesDraft();
        document.body.dataset.orderId = nextOrder.id;
        document.body.dataset.orderUnassociated = "false";
        document.body.dataset.orderAssociationSource = "manual";
        renderQuantityRows(nextOrder);
        setReceiptMode("normal");
        updateOrderAssociationUI();
        setTaskState("待处理");
        closeModal("orderQueryModal");
        confirm.disabled = false;
        confirm.textContent = "关联订单";
        pendingOrderId = "";
        showToast(`已关联 ${nextOrder.id}，商品列表已按该订单重新生成`);
      }, 450);
    });
    updateOrderAssociationUI();
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

  function applyMerchantTerminology() {
    const roots = [document.body, ...all("template").map((item) => item.content)];
    roots.forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        node.nodeValue = merchantTerminology(node.nodeValue);
        node = walker.nextNode();
      }
      all("[title], [aria-label], [placeholder]", root).forEach((element) => {
        ["title", "aria-label", "placeholder"].forEach((attribute) => {
          if (element.hasAttribute(attribute)) {
            element.setAttribute(
              attribute,
              merchantTerminology(element.getAttribute(attribute)),
            );
          }
        });
      });
    });
    document.title = merchantTerminology(document.title);
  }

  function integrateReceiptNavigation() {
    const nav = one(".nav");
    if (!nav) return;
    const page = document.body.dataset.page || "";
    const params = new URLSearchParams(window.location.search);
    const receiptPages = new Set([
      "home",
      "receipts",
      "entry",
      "detail-pending",
      "detail-processing",
      "detail-completed",
    ]);
    const receiptActive = receiptPages.has(page);
    const currentReceiptPermission =
      page === "stats"
        ? "stats"
        : page === "settings"
          ? "settings"
          : page === "entry"
            ? "entry"
            : "audit";
    const active = (condition) => (condition ? " active" : "");
    const navIcons = {
      home: '<path d="M3 11.5 12 4l9 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6"/>',
      review: '<path d="M6 3h12v18H6zM9 8h6M9 12h4M15.5 15.5l4 4M18 15.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>',
      edit: '<path d="M5 19l4-.8L19 8l-3-3L5.8 15.2 5 19zM14 7l3 3M4 21h16"/>',
      receipt: '<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h3M15.5 15.5l1.5 1.5 3-3"/>',
      users: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13 20a4.5 4.5 0 0 1 8 0"/>',
      bag: '<path d="M5 8h14l-1 12H6L5 8zM9 8a3 3 0 0 1 6 0"/>',
      code: '<path d="M4 5h16v14H4zM8 10l3 2-3 2M13 15h3"/>',
      chart: '<path d="M4 20V9m5 11V4m5 16v-7m5 7V6M2 20h20"/>',
      dash: '<path d="M4 18a8 8 0 1 1 16 0M12 12l4-4M7 17h10"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/>',
    };
    const navIcon = (name) => `<span class="nav-symbol"><svg viewBox="0 0 24 24" aria-hidden="true">${navIcons[name]}</svg></span>`;
    nav.innerHTML = `
      <a class="nav-item" href="../ai_order/home.html" data-title="首页" aria-label="首页" data-nav-scope="shared">${navIcon("home")}</a>
      <a class="nav-item" href="../ai_order/tasks.html" data-title="订单审核" aria-label="订单审核" data-nav-scope="order">${navIcon("review")}</a>
      <a class="nav-item" href="../ai_order/chat-simulator.html" data-title="订单录入" aria-label="订单录入" data-nav-scope="order">${navIcon("edit")}</a>
      <div class="nav-group" data-receipt-module-root>
        <a class="nav-item nav-parent${active(receiptActive)}" href="receipts.html" data-title="销售回单" aria-label="销售回单" aria-haspopup="true">${navIcon("receipt")}</a>
        <div class="nav-flyout" role="menu" aria-label="销售回单菜单">
          <a class="${active(page === "receipts" || page === "detail-pending" || page === "detail-processing" || page === "detail-completed")}" href="receipts.html" data-receipt-permission="audit" role="menuitem">回单审核</a>
          <a class="${active(page === "entry")}" href="receipt-entry.html" data-receipt-permission="entry" role="menuitem">录入回单</a>
          <a href="../ai_order/stats.html?tab=receipt" data-receipt-permission="stats" role="menuitem">回单统计</a>
        </div>
      </div>
      <div class="nav-group">
        <a class="nav-item nav-parent${active(page === "merchants" || page === "groups" || page === "groups-detail")}" href="../ai_order/customers.html" data-title="商户管理" aria-label="商户管理" aria-haspopup="true">${navIcon("users")}</a>
        <div class="nav-flyout" role="menu" aria-label="商户管理菜单">
          <a class="${active(page === "merchants")}" href="../ai_order/customers.html" role="menuitem">商户管理</a>
          <a class="${active(page === "groups" || page === "groups-detail")}" href="../ai_order/groups.html" role="menuitem">群聊管理</a>
          <a href="../ai_order/customer-groups.html" role="menuitem">商户分组</a>
        </div>
      </div>
      <a class="nav-item" href="../ai_order/sku.html" data-title="报价单" aria-label="报价单" data-nav-scope="order">${navIcon("bag")}</a>
      <div class="nav-group">
        <a class="nav-item nav-parent" href="../ai_order/prompts.html" data-title="提示词" aria-label="提示词" aria-haspopup="true">${navIcon("code")}</a>
        <div class="nav-flyout" role="menu" aria-label="提示词菜单">
          <a href="../ai_order/prompts.html" role="menuitem">提示词</a>
          <a href="../ai_order/memory.html" role="menuitem">AI 记忆</a>
        </div>
      </div>
      <a class="nav-item${active(page === "stats")}" href="../ai_order/stats.html${page === "stats" ? "?tab=receipt" : ""}" data-title="统计" aria-label="统计" data-nav-scope="shared">${navIcon("chart")}</a>
      <a class="nav-item" href="../ai_order/decision-dashboard.html" data-title="决策大屏" aria-label="决策大屏" data-nav-scope="shared">${navIcon("dash")}</a>
      <a class="nav-item${active(page === "settings")}" href="../ai_order/settings.html" data-title="设置" aria-label="设置" data-nav-scope="shared">${navIcon("settings")}</a>`;

    const disabledFlag = (value) =>
      ["0", "false", "off", "none"].includes(String(value || "").toLowerCase());
    const moduleEnabled = !disabledFlag(params.get("receiptEnabled"));
    const modulePermission = !disabledFlag(params.get("receiptPermission"));
    const moduleVisible = moduleEnabled && modulePermission;
    const permissionParams = {
      entry: "receiptEntryPermission",
      audit: "receiptAuditPermission",
      stats: "receiptStatsPermission",
      settings: "receiptSettingsPermission",
    };
    all("[data-receipt-permission]", nav).forEach((item) => {
      item.hidden =
        !moduleVisible ||
        disabledFlag(params.get(permissionParams[item.dataset.receiptPermission]));
    });
    const receiptRoot = one("[data-receipt-module-root]", nav);
    const visibleChildren = all("[data-receipt-permission]", receiptRoot).filter(
      (item) => !item.hidden,
    );
    if (receiptRoot) receiptRoot.hidden = !moduleVisible || !visibleChildren.length;
    const receiptParent = one(".nav-parent", receiptRoot);
    if (receiptParent && visibleChildren[0]) receiptParent.href = visibleChildren[0].href;

    const currentPermissionAllowed =
      moduleVisible &&
      !disabledFlag(params.get(permissionParams[currentReceiptPermission]));
    if ((receiptActive || page === "stats" || page === "settings") && !currentPermissionAllowed) {
      const content = one(".content");
      if (content) {
        const title = moduleEnabled ? "暂无此回单功能权限" : "销售回单未开通";
        content.innerHTML = `<div class="page"><section class="module-access-state"><strong>${title}</strong><a class="btn primary" href="../ai_order/home.html">返回首页</a></section></div>`;
      }
    }

    const requirementsLink = one('.sider > a[data-title="需求框架"]');
    if (requirementsLink) requirementsLink.hidden = true;
  }

  function bindApplicationCenterLinks() {
    all(".back-app").forEach((link) => link.remove());
    const brand = one(".brand");
    if (brand) {
      brand.href = "../ai_order/home.html";
      brand.title = "销售录单首页";
    }
    const tenant = one(".tenant");
    if (tenant) tenant.innerHTML = `
      <strong>测试企业 1318</strong>
      <details class="scene-switcher">
        <summary aria-label="切换当前场景"><span class="scene-current-icon sales" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V11M10 20V5M16 20v-7M3 20h18"/></svg></span><strong>销售录单</strong></summary>
        <div class="scene-switch-menu" role="menu" aria-label="场景切换菜单">
          <a class="scene-switch-option current" href="../ai_order/home.html" role="menuitem" aria-current="page">
            <span class="scene-switch-icon sales" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V11M10 20V5M16 20v-7M3 20h18"/></svg></span>
            <span class="scene-switch-copy"><strong>销售录单</strong></span>
          </a>
          <a class="scene-switch-option" href="../index.html#purchase-home" role="menuitem">
            <span class="scene-switch-icon purchase" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 4h2l2 11h10l2-8H6M9 19h.01M17 19h.01"/></svg></span>
            <span class="scene-switch-copy"><strong>采购录单</strong></span>
          </a>
        </div>
      </details>`;
    const topActions = one(".top-actions");
    if (topActions && !one(".prd-home-link", topActions)) {
      const prdHomeLink = document.createElement("a");
      prdHomeLink.className = "prd-home-link";
      prdHomeLink.href = "../index.html#projects";
      prdHomeLink.textContent = "← 返回 PRD 首页";
      topActions.prepend(prdHomeLink);
    }
    const userChip = one(".user-chip");
    if (userChip) {
      const menu = document.createElement("details");
      menu.className = "admin-menu";
      menu.innerHTML = `
        <summary>系统管理员</summary>
        <div class="admin-menu-popover" role="menu" aria-label="系统管理员菜单">
          <a href="../index.html#tenant-members" role="menuitem">成员管理</a>
          <a href="../index.html#tenant-quota" role="menuitem">额度管理</a>
        </div>`;
      userChip.replaceWith(menu);
    }
  }

  function applyDetailReadOnlyMode() {
    if (document.body.dataset.readonly !== "true") return;

    all(".receipt-ai-panel input").forEach((input) => {
      input.readOnly = true;
      input.setAttribute("aria-readonly", "true");
    });
    all(".receipt-ai-panel select").forEach((select) => {
      select.disabled = true;
      select.setAttribute("aria-disabled", "true");
    });
    all(
      "[data-save-now], [data-confirm-submit], [data-open-order-query], [data-confirm-order-link]",
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
    applyMerchantTerminology();
    integrateReceiptNavigation();
    bindApplicationCenterLinks();
    bindGlobalControls();
    bindTabs();
    bindTaskFilters();
    applyReceiptScenario();
    bindInlineSourceLocation();
    bindSpecDrawer();
    ensureAfterSalesReasonOptions();
    initializeQuantityRows();
    bindProductModificationLock();
    bindManualSave();
    bindConfirmSubmit();
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
