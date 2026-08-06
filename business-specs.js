(() => {
  "use strict";

  const path = window.location.pathname.replace(/\\/g, "/");
  const app = path.includes("/sales_receipt/")
    ? "receipt"
    : path.includes("/ai_order/")
      ? "order"
      : "";
  if (!app) return;

  const file = path.split("/").pop() || "index.html";
  const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
  const field = (name, meaning, source, rule) => ({ name, meaning, source, rule });
  const profile = (title, goal, logic, fields, operations, exceptions, role = "系统管理员及获得本页面权限的业务人员；仅可查看和处理当前租户、当前数据权限范围内的数据。") => ({
    title,
    goal,
    logic,
    fields,
    operations,
    exceptions,
    role,
  });

  const orderDetailFields = [
    field("客户/门店", "确定销售订单归属和可选商品、报价范围。", "AI 识别结果或人工选择；候选来自当前租户客户主数据。", "提交前必须能唯一定位客户；人工修改后重新校验报价与商品范围。"),
    field("订单组", "同一来源消息内需要分别生成销售订单的业务分组。", "AI 按客户、商品分类和既定拆单规则生成。", "组内商品必须归属同一客户；拆单预览确认前不写入正式订单。"),
    field("商品", "销售订单商品名称及其主数据身份。", "AI 识别后匹配商品主数据和有效报价单，允许人工改选。", "未匹配、歧义或停用商品必须人工确认；更换商品后同步更新单位、规格和价格。"),
    field("数量", "客户本次订购数量。", "AI 从原始消息识别或人工录入。", "必填，必须为大于 0 的数字；小数精度服从商品销售单位规则。"),
    field("单价/金额", "当前客户报价及订单金额。", "单价来自生效报价单，金额按数量×单价计算。", "无有效报价时不得静默填 0；人工改价需保留原报价和修改记录。"),
    field("销售规格/商品规格", "说明销售计量口径和商品包装、等级等属性。", "来自商品与报价主数据。", "随商品联动，只读字段不得脱离主数据单独保存。"),
    field("客户便签/备注", "记录配送、包装、联系和本单特殊要求。", "客户档案便签、AI 识别备注或人工补充。", "客户便签最多 150 个字符；订单备注随订单提交，空值不阻断。"),
  ];

  const reminderFields = [
    field("催单状态/启用催单", "控制群聊是否执行未下单检查和自动提醒。", "群聊催单配置；列表只显示“已启用”或“已停用”，配置弹窗和详情使用开关维护。", "开关为必填项。关闭后立即停止后续检查和发送，但保留日期、时间和话术；再次开启时恢复原配置。"),
    field("日常下单日期", "定义该群聊每周应正常下单、需要检查是否漏单的星期。", "周一至周日多选；批量设置默认选择周一至周五，单群修改回显已保存值。", "启用催单时至少选择一天；未选择时阻止保存并提示“请至少选择一个日常下单日期”。"),
    field("提醒时间", "定义系统开始生成当日未下单检查任务的计划时间。", "时间选择器；批量设置默认 16:30，单群修改回显已保存值；按北京时间 24 小时制、精确到分钟。", "启用催单时必填；为空时阻止保存并提示“请设置提醒时间”。计划时间已过后启用或修改，当天不补发。"),
    field("催单话术", "当天未检测到有效销售订单时，由机器人发送到目标群聊的消息内容。", "多行文本；批量设置使用预置话术，单群修改回显已保存内容。", "启用催单时必填；去除首尾空格后为 1～200 个用户可见字符，允许换行和表情；为空或超长时阻止保存并显示对应错误。"),
    field("设置范围/群聊勾选/全选", "确定本次批量配置需要覆盖的群聊集合。", "进入批量选择态后由管理员逐项勾选；表头“全选”只作用于当前搜索结果。", "默认不选择。至少选择一个群聊后“设置催单”才可用；搜索不清除已选但暂时不可见的群聊，取消批量模式时清空全部选择。"),
  ];

  const reminderLogic = [
    "催单配置以群聊唯一标识保存；群聊改名不新建配置，也不影响原配置继续生效。",
    "到达提醒时间后，仅当催单已启用且当天属于所选日常下单日期时，系统才生成当日检查任务。",
    "系统为每个“群聊 + 日期”的任务生成一次 0～15 分钟随机延迟，以分散消息发送；该规则内置，不在页面展示，也不允许人工配置。",
    "到达实际执行时间后，系统查询当天零点至当前时刻的有效销售订单；已下单则取消提醒，未下单才发送催单话术。",
    "同一群聊同一天最多成功发送一次；重复调度、并发执行或任务重试不得产生第二条成功提醒。",
  ];

  const orderProfiles = {
    "home.html": profile("首页与经营概览", "汇总今日订单处理情况、额度余额和快捷入口，帮助管理员判断待办优先级。", ["进入页面后读取当前租户当日统计和剩余额度。", "指标卡只用于概览，点击业务入口进入对应列表或配置页面。", "刷新时各指标必须使用同一统计时点，避免总数和明细不一致。"], [field("统计日期", "首页指标的统计自然日。", "系统当前日期。", "按北京时间自然日计算，开始和结束边界均包含。"), field("今日接收/待审核/已提交/异常", "分别表示当日进入、待人工处理、提交成功和处理异常的任务数。", "订单任务状态汇总，按任务唯一标识去重。", "无数据展示 0；点击指标后按对应状态进入任务列表。"), field("剩余额度", "租户可继续用于 AI 识别的额度。", "租户额度账户。", "显示整数余额；耗尽时阻止新识别但保留历史查询。")], ["快捷入口：进入订单录入、订单审核、销售回单或客户管理，不改变业务数据。", "刷新：重新读取当前租户指标；失败时保留上次成功数据并提示重试。"], ["部分指标加载失败时不得用 0 代替真实缺失值。", "无权限入口隐藏；额度不足时展示明确阻断原因和恢复方式。"]),
    "chat-simulator.html": profile("订单录入", "接收群聊文本、图片和文件，形成 AI 识别任务并进入订单审核流程。", ["操作员选择来源群聊或客户后输入订单内容。", "发送时校验消息或附件至少存在一项，再创建唯一识别任务。", "AI 识别完成后生成订单组；存在歧义时进入待人工确认。"], [field("群聊/客户", "确定消息来源、客户候选和数据权限范围。", "当前账号可操作的群聊与客户。", "必选；切换来源不自动提交已有输入。"), field("消息内容", "客户原始下单文本。", "人工输入或粘贴。", "保留原文用于追溯；仅空白内容视为空。"), field("附件", "订单图片、表格或文档。", "本地上传。", "上传失败不得创建空任务；重复文件按文件标识去重。")], ["发送：提交原文和附件并创建识别任务；重复点击只创建一个任务。", "查看任务：跳转到本次识别产生的审核详情。"], ["识别超时保持任务可重试，不丢失原始消息。", "额度不足、文件不支持或网络失败时给出具体原因。"]),
    "tasks.html": profile("订单审核列表", "查询不同识别状态的销售订单任务，并进入对应审核详情。", ["筛选条件按交集查询当前权限范围内的任务。", "默认按任务进入系统时间倒序，分页与总数使用同一次查询结果。", "查看任务时根据识别场景和状态进入相应详情页面。"], [field("状态", "订单任务当前处理阶段。", "任务状态机。", "枚举至少区分识别中、待审核、待确认、已完成和失败；历史状态按原值回显。"), field("客户/群聊", "任务归属客户和消息来源。", "客户、群聊主数据及原始消息快照。", "筛选候选受数据权限限制。"), field("时间范围", "任务进入系统的日期区间。", "操作员选择。", "北京时间，起止日均包含；开始日期不得晚于结束日期。"), field("操作员", "最近一次实际处理任务的人员。", "操作日志。", "离职人员的历史记录仍按原姓名查询。")], ["查询/重置：刷新列表并同步总数；重置恢复页面默认条件。", "查看：携带任务唯一标识进入详情；无权限或任务不存在时返回列表。"], ["查询失败保留原列表和筛选条件。", "未知状态不猜测映射，显示异常标识并记录数据质量问题。"]),
    "order-board.html": profile("录单工作台", "按处理阶段汇总订单任务，帮助操作员从待办到完成连续跟进。", ["各泳道或统计区按任务当前状态归集。", "任务状态变化后从原分组移出并进入目标分组。", "工作台数据与订单审核列表使用同一任务状态口径。"], [field("任务状态", "决定任务所在工作区和可执行动作。", "订单任务状态机。", "状态变更必须由合法事件触发，不允许仅修改展示标签。"), field("更新时间", "任务最近一次业务状态变化时间。", "任务操作日志。", "按北京时间精确到分钟展示。")], ["打开任务：进入详情处理，不在工作台直接修改订单。", "刷新：保留当前视图并重新汇总任务。"], ["状态更新失败时任务保持原分组。", "同一任务不得同时出现在多个互斥状态区。"]),
    "customers.html": profile("客户管理", "维护客户主数据、业务状态、群聊关系和订单识别上下文。", ["列表只展示当前租户可管理客户。", "新增或修改客户后，相关群聊、报价和识别规则按客户唯一标识关联。", "停用客户保留历史订单，但不再作为新订单默认候选。"], [field("客户名称", "客户业务名称。", "客户主数据。", "必填；租户内按规范化名称校验重复。"), field("客户 ID", "跨页面定位客户的稳定标识。", "系统或观麦客户主数据。", "唯一且保存后不可随意修改。"), field("客户分组", "用于权限、提示词和统计分组。", "客户分组配置。", "分组停用后历史客户仍回显原分组。"), field("客户便签", "配送、包装和联系人等长期备忘。", "人工维护。", "最多 150 个字符，订单详情按客户读取但不覆盖历史订单快照。")], ["新增/编辑：提交前校验必填、唯一性及关联关系。", "启用/停用：二次确认；只影响后续业务，不改历史订单。"], ["存在未完成任务时停用客户需提示影响。", "并发修改时以最新版本校验，避免覆盖他人更新。"]),
    "groups.html": profile("群聊管理", "集中管理订单来源群聊，并按单个或多个群聊配置自动催单。", ["列表催单列位于“下单时段”之后、“操作”之前，只展示启停状态和“设置”入口，不展示日期、时间和话术。", "点击“批量设置催单”后进入选择态，可逐项多选或全选当前搜索结果；搜索只改变可见行，不清空已选群聊。", "批量保存以同一组配置覆盖所有已选群聊，未选群聊不受影响；保存后仍可单独修改某一群聊。", ...reminderLogic], [field("群聊名称/ID", "展示群聊名称并以群聊 ID 唯一定位消息来源和催单配置。", "信道同步结果。", "同一信道内群聊 ID 唯一；重名群聊不得合并。"), field("绑定商户", "限定该群聊消息的商户候选范围。", "商户主数据。", "允许绑定多个商户；催单判断仍以来源群聊为单位，不按商户分别发送。"), ...reminderFields], ["批量设置催单：具备群聊管理权限时进入选择态；可逐项多选或全选当前搜索结果，至少选择一个群聊后才能打开配置弹窗。", "催单设置：从列表行进入时回显当前群聊配置；保存只更新该群聊，并提示“群聊催单设置已保存”。", "保存催单设置：批量模式使用同一配置覆盖全部已选群聊；处理中禁止重复提交，成功后退出选择态并提示“已批量保存 {{群聊数量}} 个群聊的催单设置”。", "取消：关闭弹窗不保存输入；退出批量选择态时清空已选群聊。"], ["批量保存部分失败时必须分别返回成功和失败群聊，不得提示全部成功。", "订单查询失败时不发送，避免误催；保留任务并记录失败原因。", "群聊停用、信道离线或机器人无发言权限时不发送，并记录可追溯原因。"]),
    "group-detail.html": profile("群聊详情", "查看单个群聊的成员、绑定商户、业务识别、催单和拆单规则。", ["页面以群聊 ID 读取最新配置和成员。", "订单识别与回单识别独立开关，消息按业务意图进入对应流程。", "催单设置只更新当前群聊，不影响其他群聊。", ...reminderLogic, "拆单规则只作用于本群聊后续订单，保存前校验分类冲突。"], [field("机器人发言", "控制机器人是否可在群内发送确认或催单消息。", "群聊配置。", "关闭后仍可接收消息，但不发送自动回复或催单。"), field("下单时段", "群聊正常接单时间范围。", "人工配置。", "开始时间不得晚于结束时间；跨日场景需明确标识。"), field("群成员类型", "区分工作人员与商户成员。", "同步成员后人工配置。", "商户成员可绑定商户；工作人员不得误绑定商户身份。"), ...reminderFields.filter((item) => item.name !== "设置范围/群聊勾选/全选"), field("拆单规则", "按商品分类和运营时间拆分销售订单。", "群聊级配置。", "同一分类不得存在互相冲突的目标规则。")], ["保存催单设置：校验启用状态、日期、时间和话术；通过后只更新当前群聊并记录修改人和修改时间，提示“当前群聊的催单设置已保存”。", "同步成员：按 wxid 更新成员并保留人工类型。", "保存识别或拆单设置：分别校验后生效，不互相覆盖。"], ["订单查询失败时不得发送催单，并记录失败原因等待重试。", "群聊停用、信道离线或机器人无发言权限时不发送催单。", "成员已退出群聊时保留历史快照；识别意图不明确时进入人工确认，不得同时创建订单和回单。"]),
    "customer-groups.html": profile("客户分组", "将客户按业务规则归类，用于权限、提示词、统计和运营配置。", ["分组列表按当前租户加载。", "客户加入或移出分组后，仅影响后续规则匹配。", "删除前检查客户、提示词和统计引用。"], [field("分组名称", "客户分组的业务名称。", "人工维护。", "必填且租户内唯一；保存时去除首尾空格。"), field("客户数量", "当前归属该分组的有效客户数。", "客户与分组关系汇总。", "按客户唯一标识去重。")], ["新增/编辑：校验名称和规则后保存。", "删除：存在关联时禁止删除并给出解除入口。"], ["空分组允许保留。", "历史订单统计按任务快照，不随客户移组回算。"]),
    "sku.html": profile("报价单", "管理客户可购买商品、销售规格、价格和运营时间。", ["报价单在有效期和适用客户范围内参与商品匹配。", "同一商品命中多个报价时按客户专属、有效时间和配置优先级排序。", "停用报价不影响历史订单价格快照。"], [field("报价单名称/编码", "报价配置的名称和唯一编码。", "人工维护或业务系统同步。", "编码租户内唯一；名称必填。"), field("适用客户", "限定报价单生效的客户范围。", "客户主数据。", "未选择客户时按页面明确的公共范围处理，不得默认全租户。"), field("商品/销售规格", "报价中的商品和销售计量口径。", "商品主数据。", "商品停用后不可新增引用，历史行保留。"), field("单价/运营时间", "客户价格和可履约时间范围。", "报价配置。", "单价不得为负；运营时间用于确认提交时拆单。")], ["查看/编辑：保存新配置，不回写历史订单。", "启用/停用：变更后影响新识别任务。"], ["有效报价冲突时进入人工确认。", "无报价不得自动使用其他客户价格。"]),
    "prompts.html": profile("提示词", "按业务场景、客户或群聊维护 AI 识别与回复规则。", ["系统提示词提供基础能力，租户提示词按适用范围覆盖或补充。", "保存配置与正式生效必须区分；只有启用版本参与后续任务。", "任务保存提示词版本快照，便于复盘。"], [field("提示词名称", "提示词配置名称。", "人工维护。", "必填，租户同范围内唯一。"), field("适用场景", "限定订单识别、回单识别或回复等业务阶段。", "系统枚举。", "必选；场景变化时重新校验可用变量。"), field("适用范围", "限定全租户、客户分组、客户或群聊。", "业务对象选择。", "范围越具体优先级越高；同级冲突需明确排序。"), field("提示词内容", "发送给模型的业务指令。", "人工编辑。", "保存前校验必填变量和长度；不得展示敏感密钥。")], ["新增/编辑：保存草稿并校验变量。", "启用/停用：影响后续任务，历史任务不重算。"], ["冲突规则显示命中顺序。", "模型调用失败不得修改提示词状态。"]),
    "memory.html": profile("AI 记忆", "维护可复用的客户、群聊和商品识别经验，提升后续订单匹配稳定性。", ["记忆按租户和适用对象隔离。", "启用记忆仅影响创建后的新识别任务。", "人工修正形成的新记忆需可追溯来源。"], [field("记忆内容", "需要长期复用的业务事实或映射。", "人工录入或审核结果沉淀。", "内容必填；不得存储密码、密钥等敏感信息。"), field("适用对象", "限定记忆作用的客户、群聊或商品。", "业务主数据。", "至少选择一个明确范围。"), field("状态", "控制记忆是否参与识别。", "启用/停用。", "停用不删除历史命中记录。")], ["新增/编辑：校验范围后保存。", "停用/删除：存在审计记录时采用逻辑停用。"], ["相互冲突的记忆按范围与更新时间提示人工处理。", "对象停用后记忆不再参与新任务。"]),
    "stats.html": profile("业务统计", "按时间、客户、群聊和操作员统计订单与回单处理质量和效率。", ["筛选条件按交集确定统计范围。", "指标必须使用同一时间口径和去重键。", "下钻明细与汇总指标使用同一筛选条件。"], [field("时间范围", "指标统计窗口。", "操作员选择。", "北京时间自然日，起止均包含。"), field("订单量/回单量", "统计窗口内创建的唯一业务任务数。", "任务数据，按任务 ID 去重。", "撤销或删除数据是否计入以页面口径为准。"), field("识别准确率", "无需人工修正的有效字段数占已确认字段数的比例。", "审核差异记录。", "分母为 0 显示“--”，比例保留两位小数。"), field("处理时长", "从任务可处理到首次成功提交的耗时。", "状态时间戳。", "失败重试时间计入总耗时，未完成任务不计完成时长。")], ["查询：刷新指标与明细。", "导出：导出全部命中记录并保留筛选口径。"], ["迟到数据按最新刷新结果补入。", "指标接口失败时不得展示上次值为当前值。"]),
    "decision-dashboard.html": profile("经营决策大屏", "集中展示订单趋势、异常、客户和操作员效率，辅助经营判断。", ["大屏指标继承当前租户和时间范围。", "趋势和排行均可追溯到明细口径。", "自动刷新时整屏使用同一数据版本。"], [field("核心指标", "订单规模、异常和效率的聚合结果。", "统计服务。", "展示单位、精度和时间范围必须明确。"), field("趋势", "按日或小时展示指标变化。", "统计时间序列。", "缺失时间点显示断点或 0 必须按指标口径区分。"), field("排行", "按客户或人员指标排序。", "聚合统计。", "并列值使用同一名次或稳定次序，页面需统一。")], ["刷新/切换时间：整屏同步更新。", "下钻：携带当前指标和筛选条件进入明细。"], ["无数据展示空态，不生成虚假趋势。", "部分模块失败时标识模块异常并允许单独重试。"]),
    "settings.html": profile("销售订单设置", "统一维护信道、通知和功能配置，控制机器人如何接收、处理和反馈订单。", ["设置只保留信道设置、通知设置、回复设置和功能设置。", "保存只更新当前配置域，不覆盖其他页签配置。", "启停配置影响后续消息和任务，历史任务保留原配置快照。", "群聊级催单配置统一在群聊管理列表或群聊详情维护。"], [field("信道", "机器人接入微信或企业微信的连接配置。", "管理员配置。", "密钥类字段仅允许授权管理员查看和修改。"), field("通知", "任务失败、额度和新订单的提醒开关及接收范围。", "租户设置。", "关闭后不再发送新通知，已发送记录保留。"), field("回复设置", "控制订单识别、提交和失败等场景的自动回复。", "回复规则配置。", "通过独立页签进入，规则启停只影响后续事件。"), field("功能开关", "控制识别、拆单和订单可见范围等能力。", "租户或群聊配置。", "保存后只影响新任务；依赖未满足时阻止开启。")], ["保存：仅提交当前页签配置并提示成功或具体失败项。", "进入群聊管理：从商户管理菜单进入群聊列表配置催单。"], ["多人并发修改时提示配置已更新并重新加载。", "依赖服务异常时不得将未保存配置展示为已生效。"]),
    "settings-replies.html": profile("回复设置", "配置订单识别、提交和失败等场景下的群聊自动回复。", ["业务事件命中已启用规则后生成回复。", "同一场景存在多条规则时按适用范围和优先级选择唯一结果。", "变量在发送前替换，缺失变量不得原样泄露模板。"], [field("规则名称", "回复规则的管理名称。", "人工维护。", "必填，租户内唯一。"), field("触发场景", "决定规则匹配的业务事件。", "系统场景枚举。", "必选；停用场景历史规则只读回显。"), field("回复内容", "发送到群聊的文本模板。", "人工编辑。", "必填；变量统一使用 {{变量名}}，发送前转义用户内容。"), field("状态", "控制规则是否参与匹配。", "启用/停用。", "停用立即影响后续事件，不撤回已发送消息。")], ["保存：校验名称、场景、变量后生效。", "删除：二次确认，不影响历史发送记录。"], ["变量缺失时使用明确兜底或终止发送。", "发送失败记录原因并按消息幂等键重试。"]),
    "settings-channel-detail.html": profile("信道详情", "维护消息信道凭证、回调地址、启用状态和关联群聊。", ["测试连接只校验当前输入，不保存配置。", "保存后新连接使用最新凭证，历史消息仍保留原信道标识。", "回调验签失败的消息不得进入识别流程。"], [field("信道名称/类型", "标识接入渠道及协议类型。", "管理员配置。", "名称必填；类型保存后变更需重新校验凭证。"), field("AccessKey/AccessSecret/RobotKey", "信道认证和机器人身份凭证。", "外部渠道提供。", "必填；密钥默认脱敏，不写入日志或说明面板。"), field("回调地址", "接收渠道消息的服务地址。", "系统生成或管理员配置。", "必须为合法 HTTPS 地址。"), field("启用", "控制信道是否接收新消息。", "管理员操作。", "关闭后停止新消息接入，历史任务不受影响。")], ["测试连接：返回成功、鉴权失败或网络失败。", "保存：校验凭证和回调后更新配置。"], ["保存失败保留输入但不得明文回显密钥。", "群聊同步部分失败时列出失败群聊。"]),
    "deployment-pricing.html": profile("部署与收费标准", "说明产品部署范围、计费构成、套餐能力和实施边界。", ["费用按页面明确的部署、消息和 AI 识别量口径计算。", "套餐选择只用于方案评估，不在本原型直接完成支付。", "价格、用量和服务范围必须保持同一版本日期。"], [field("部署方案", "区分实施与运行环境范围。", "产品方案配置。", "选择后联动展示包含能力和费用。"), field("消息量/识别量", "用于测算资源消耗和费用。", "客户预估或历史统计。", "必须明确计量周期、单位和超量价格。")], ["返回：回到应用首页，不保存临时选择。", "方案选择：刷新费用试算和服务清单。"], ["价格版本过期时提示联系商务确认。", "超量和续费规则未确认时不得展示为最终合同金额。"]),
  };

  const detailProfile = profile("订单审核详情", "核对 AI 识别结果、确认客户和商品，按拆单规则生成并提交销售订单。", ["页面保留原始消息或图片，作为识别结果的审核凭证。", "AI 结果先形成订单组；操作员可修正客户、商品、数量、价格和备注。", "首次确认提交时按商品分类和报价运营时间生成拆单预览。", "所有订单组校验通过并提交成功后，任务进入已完成；部分失败保持可恢复状态。"], orderDetailFields, ["保存：保存当前审核草稿，不创建正式销售订单。", "确认提交：执行完整校验、展示拆单结果并创建订单；重复点击按任务幂等。", "新增/删除商品：只改变当前草稿，删除前确认并重新计算金额。"], ["未匹配商品、无有效报价、客户不唯一或数量非法时阻止提交并定位字段。", "提交部分失败时展示成功与失败订单组，不重复创建已成功订单。", "多人同时处理时后提交者必须看到版本冲突提示。"]);
  ["task-detail.html", "task-detail-single.html", "task-detail-standard.html", "task-detail-normal.html", "task-detail-normal-presplit.html", "task-detail-normal-precategory.html", "task-detail-normal-multigroup.html", "task-detail-normal-unconfirmed.html"].forEach((name) => { orderProfiles[name] = detailProfile; });

  const adminProfile = (title, goal, fields = []) => profile(title, goal, ["管理员进入页面后仅加载其权限范围内的租户或系统数据。", "查询、保存和状态变更均记录操作者、时间、对象和结果。", "系统级配置变更只影响后续业务，历史记录按原快照保留。"], fields.length ? fields : [field("查询条件", "定位当前管理对象。", "管理员输入或系统枚举。", "多条件按交集查询；重置恢复默认值。"), field("状态", "表示管理对象当前是否可用。", "对象生命周期。", "状态变更前校验权限与依赖。")], ["查询/刷新：保留有效条件并更新结果。", "新增/编辑/保存：校验字段和权限后提交，重复点击只生效一次。"], ["无权限时隐藏入口或明确拦截。", "系统错误保留原数据并提供重试，不展示半更新结果。"], "平台系统管理员；仅可操作授权租户和系统资源。");
  Object.assign(orderProfiles, {
    "admin.html": adminProfile("平台管理首页", "汇总租户、用量、系统运行状态和管理员待办。"),
    "admin-tenants.html": adminProfile("租户管理", "维护租户账号、套餐、有效期、额度和启停状态。", [field("租户名称/编号", "唯一识别企业租户。", "注册信息或管理员创建。", "编号唯一；名称必填。"), field("套餐/有效期/额度", "控制租户可用能力和资源上限。", "合同与充值记录。", "到期与额度耗尽分别校验并给出恢复方式。")]),
    "admin-presets.html": adminProfile("模板库", "维护可复用的行业提示词、识别和回复模板。"),
    "admin-stats.html": adminProfile("平台统计分析", "按租户、时间和业务类型分析用量与处理质量。"),
    "admin-stats-case.html": adminProfile("统计案例详情", "查看单个统计案例的指标、样本和问题定位过程。"),
    "admin-system.html": adminProfile("系统设置", "维护平台级公共参数、能力开关和安全策略。"),
    "admin-system-admins.html": adminProfile("系统管理员", "管理平台管理员账号、角色和权限范围。", [field("管理员账号", "平台管理身份。", "管理员创建或身份系统同步。", "账号唯一；停用后禁止新登录。"), field("角色/权限", "决定可见菜单、操作和租户范围。", "系统角色配置。", "最小权限原则；变更记录审计。")]),
    "admin-login.html": adminProfile("系统管理员登录", "验证管理员身份并进入平台管理端。", [field("账号", "管理员登录标识。", "人工输入。", "必填，去除首尾空格。"), field("验证码/扫码结果", "完成登录身份校验。", "认证服务。", "一次性使用，过期后重新获取。")]),
    "admin-login-callback.html": adminProfile("扫码登录回调", "接收扫码认证结果并完成管理员会话建立。"),
    "login.html": profile("登录", "验证租户成员身份并进入 AI 销售订单应用。", ["提交登录信息后校验账号、租户状态和权限。", "认证成功建立会话并跳转首页。"], [field("账号/手机号", "登录身份标识。", "人工输入。", "必填，格式错误时阻止提交。"), field("验证码/密码", "验证当前登录人。", "认证服务。", "不得明文记录；连续失败触发安全限制。")], ["登录：成功进入首页，失败保留账号并清空敏感输入。"], ["租户停用、套餐到期或账号无权限时显示明确原因。"]),
    "register.html": profile("注册商户", "创建租户和首个管理员账号。", ["填写企业和管理员信息并完成验证。", "创建成功后生成唯一租户并进入初始化流程。"], [field("企业名称", "新租户的业务名称。", "人工输入。", "必填；重复名称需人工确认而非静默合并。"), field("管理员信息", "首个租户管理员身份。", "人工输入并验证。", "手机号或账号必须唯一并完成验证码校验。")], ["注册：字段校验通过后创建租户，重复点击只创建一次。"], ["创建部分失败时回滚未完成租户或提供继续初始化入口。"]),
    "daily-report.html": adminProfile("经营决策日报", "按自然日汇总订单规模、异常、客户变化和处理效率。"),
    "embed.html": adminProfile("嵌入入口", "校验外部系统上下文后打开对应租户和业务页面。"),
    "embed-test.html": adminProfile("嵌入链路联调", "验证外部系统参数、登录态和跳转结果。"),
    "index.html": adminProfile("静态原型总览", "集中访问销售订单应用、平台管理和联调页面。"),
  });

  const receiptProfiles = {
    "index.html": profile("销售回单应用中心", "提供销售回单各业务页面入口和原型导航。", ["入口只负责页面跳转，不创建业务数据。", "业务处理以回单审核列表和详情为主链路。"], [field("页面入口", "进入回单审核、录入、统计或设置。", "静态导航配置。", "无权限入口应隐藏。")], ["打开页面：保留当前登录租户并进入目标模块。"], ["目标页面不存在或无权限时返回应用中心并提示。"]),
    "home.html": profile("销售回单首页", "汇总今日回单、待处理、已完成和异常情况，并提供快捷入口。", ["指标按当前租户和北京时间自然日统计。", "待处理任务优先进入审核列表。", "刷新时指标和待办使用同一统计时点。"], [field("今日回单", "当天进入系统的唯一回单任务数。", "回单任务，按任务 ID 去重。", "无数据为 0。"), field("待处理/已完成", "当前需要人工处理和已成功同步的任务数。", "回单状态机。", "点击进入带对应状态筛选的列表。"), field("异常", "识别、匹配或提交失败的任务数。", "任务错误记录。", "必须可下钻查看原因。")], ["快捷入口：进入审核、录入或统计。", "刷新：失败时保留上次数据。"], ["部分指标失败显示“--”，不得使用 0 冒充。"]),
    "receipts.html": profile("回单审核列表", "查询待处理和已完成回单并进入审核详情。", ["状态、商户、时间和操作员按交集查询。", "识别中任务不进入人工工作列表。", "默认按回单进入系统时间倒序。"], [field("状态", "回单当前处理状态。", "回单状态机。", "只展示待处理、已完成等可理解业务状态。"), field("商户", "回单归属商户。", "AI 识别及商户主数据。", "停用商户历史记录仍可查询。"), field("时间范围", "回单材料进入系统的日期区间。", "操作员选择。", "北京时间自然日，起止包含。"), field("操作员", "最近一次处理人员。", "操作日志。", "系统自动处理单独展示。")], ["查询/重置/刷新：保留一致的筛选和分页口径。", "查看：待处理进入可编辑详情，已完成进入只读详情。", "删除：二次确认，失败保留原行。"], ["加载失败保留原列表。", "未知状态不进入列表并记录数据质量问题。"]),
    "receipt-entry.html": profile("录入回单", "通过群聊、文本或附件人工提交销售回单材料并创建识别任务。", ["选择消息来源并输入文本或上传附件。", "发送后创建唯一识别任务并保留原始材料。", "识别完成后进入回单审核列表。"], [field("来源群聊/商户", "限定回单来源和候选销售订单范围。", "当前账号可见群聊与商户。", "至少明确一个来源。"), field("消息文本", "司机、商户或业务人员提交的原始说明。", "人工输入。", "保留原文；仅空白不视为有效内容。"), field("附件", "纸质回单、配送单或签收凭证。", "本地上传。", "上传成功后方可随任务提交。")], ["发送：文本或附件至少一项有效；重复点击只创建一个任务。"], ["识别失败保留原材料并允许重试。", "额度不足或文件不支持时明确提示。"]),
    "receipt-detail.html": profile("回单审核详情", "核对原始回单、关联唯一销售订单、确认签收数并完成正常或售后提交。", ["AI 默认关联评分最高的可处理销售订单，人工可在商品修改前更换。", "商品行来自关联销售订单，下单数只读；签收数由 AI 预填并允许人工修正。", "差异数等于下单数减签收数；售后内容在独立弹窗维护。", "观麦字段和退货入库单全部同步成功后任务才进入已完成。"], [field("商户/订单号/时间", "用于查询和确认唯一销售订单。", "AI 识别或人工修正。", "字段修改不自动改绑，点击查询订单后才生成候选。"), field("下单数", "关联销售订单的原始数量。", "观麦销售订单。", "只读，任何回单处理不得修改。"), field("签收数", "商户实际签收数量。", "AI 识别后人工确认。", "必填，允许 0 和业务精度内小数，不允许负数。"), field("差异数", "下单数与签收数的有向差额。", "系统实时计算。", "下单数－签收数；正数少收，负数多收。"), field("售后类型/原因/处理值", "确定异常金额、异常数或应退数。", "人工在售后弹窗选择。", "售后模式至少一条明细且所有必填项完整。")], ["保存：只保存应用草稿。", "查询/更换订单：未修改商品前允许，关联失败保留原订单。", "确认提交：按回单编号幂等写入观麦。"], ["任一同步失败保持待处理并保留草稿。", "已完成详情只读，不允许再次提交。"]),
    "receipt-processing.html": profile("回单识别处理中", "展示回单材料处理进度，并在完成后进入审核或展示失败原因。", ["任务创建后依次完成文件处理、字段识别和订单候选匹配。", "状态完成后跳转审核详情；失败保留任务和材料。"], [field("处理状态", "当前识别步骤及结果。", "异步任务状态。", "状态更新需单调前进，重试单独记录次数。"), field("失败原因", "识别或匹配失败的可诊断原因。", "任务错误记录。", "不得展示系统密钥或内部堆栈。")], ["重试：复用原任务和材料，不创建重复业务回单。"], ["超时后允许重试或转人工录入。"]),
    "receipt-completed.html": profile("已完成回单详情", "查看已经成功同步的回单结果和提交快照。", ["页面读取提交时的关联订单、字段、商品和售后快照。", "已完成为当前流程终态，所有业务字段只读。", "历史展示不得被后续客户或商品主数据变更覆盖。"], [field("同步结果", "观麦字段及退货入库单的成功结果。", "提交响应快照。", "展示单号和成功时间；缺失值显示“--”。"), field("操作员/完成时间", "记录最终提交责任人和时间。", "审计日志。", "北京时间精确到分钟。")], ["返回列表/查看来源：只读操作。"], ["历史附件失效时保留文件名和不可下载状态。"]),
    "merchants.html": profile("回单商户管理", "查看商户基础信息、绑定群聊和历史回单，用于订单匹配。", ["商户以业务系统唯一标识关联群聊和回单。", "停用商户不再作为新回单默认候选，历史仍可查看。"], [field("商户名称/ID", "回单归属的业务主体。", "观麦商户主数据。", "ID 唯一；同名商户不得合并。"), field("绑定群聊", "商户可能提交回单的消息来源。", "群聊配置。", "解绑只影响后续识别。"), field("历史回单", "商户已创建回单数量。", "回单任务汇总。", "按任务 ID 去重。")], ["查看：进入商户回单或群聊明细。"], ["商户同步失败时保留上次成功数据并标记更新时间。"]),
    "groups.html": profile("回单群聊管理", "维护回单来源群、商户绑定、机器人和识别状态。", ["群聊按信道唯一 ID 同步。", "回单识别开关决定新消息是否创建回单任务。", "配置变更不重算历史回单。"], [field("群聊名称/ID", "群聊展示名称和唯一定位标识。", "信道同步。", "ID 唯一。"), field("绑定商户", "限定回单候选商户。", "商户主数据。", "多商户时需结合成员或回单字段判断。"), field("机器人/识别状态", "控制消息接收和自动识别。", "群聊配置。", "关闭后不创建新任务。")], ["同步/查看/修改：按群聊 ID 幂等更新。"], ["机器人离线显示异常并提供连接检查入口。"]),
    "group-detail.html": profile("回单群聊详情", "查看群聊成员、来源消息、回单任务和群级识别配置。", ["页面按群聊 ID 加载成员和回单任务。", "成员身份和商户绑定用于辅助归属判断。", "识别开关保存后只影响新消息。"], [field("群成员类型", "区分工作人员、司机和商户成员。", "同步后人工配置。", "成员 wxid 唯一；历史昵称按快照保留。"), field("绑定商户", "成员代表的商户。", "商户主数据。", "仅业务成员需要绑定。"), field("回单任务", "由本群消息创建的回单。", "回单任务。", "点击进入对应状态详情。")], ["同步成员：保留人工类型和绑定。", "保存识别设置：记录修改人和时间。"], ["成员退出不删除历史来源快照。"]),
    "stats.html": profile("回单统计", "按时间和操作员统计回单处理规模、商户覆盖和效率。", ["筛选按交集确定统计范围。", "提交量按成功完成回单任务 ID 去重。", "商户数按商户唯一标识去重。"], [field("提交回单数", "成功同步观麦的唯一回单任务数。", "已完成任务。", "按任务 ID 去重。"), field("覆盖商户数", "完成回单涉及的不同商户数。", "任务关联商户。", "按商户 ID 去重。"), field("处理时长", "从可处理到首次成功提交的耗时。", "状态日志。", "未完成任务不计。")], ["查询/导出：继承当前筛选口径。"], ["分母为 0 的比例显示“--”。"]),
    "settings.html": profile("回单设置", "配置回单机器人、群回复、自动识别和自动保存规则。", ["各配置独立启停并影响后续消息。", "保存前校验信道、回复和识别依赖。", "配置修改记录操作者和时间。"], [field("机器人开关", "控制群内自动回复。", "租户配置。", "关闭后不撤回已发送消息。"), field("自动识别", "控制回单消息是否自动创建识别任务。", "租户或群聊配置。", "关闭后允许人工录入。"), field("自动保存", "控制识别结果是否自动保存为待处理草稿。", "租户配置。", "不得绕过人工提交观麦。")], ["保存：仅更新当前设置，重复点击幂等。"], ["依赖信道离线时阻止开启并说明原因。"]),
    "requirements.html": profile("销售回单需求框架", "集中展示销售回单的业务范围、字段、流程和验收说明。", ["说明内容用于研发、测试和评审，不直接修改业务数据。", "页面规则应与回单列表和详情的说明保持一致。"], [field("需求章节", "按业务背景、页面、字段、流程和验收组织的说明。", "项目需求文档。", "版本更新需记录变更摘要。")], ["查看/导航：只读，不改变业务状态。"], ["说明与原型冲突时标记待确认，不静默覆盖。"]),
  };

  const current = (app === "receipt" ? receiptProfiles : orderProfiles)[file] || profile(
    document.title.split("｜")[0] || "当前页面",
    "完成当前页面展示的查询、维护或业务处理任务。",
    ["页面只读取当前登录账号权限范围内的数据。", "筛选、编辑和提交按页面可见业务对象执行。", "状态变化必须由明确操作触发并提供成功或失败反馈。"],
    [field("页面字段", "展示或维护当前业务对象属性。", "当前页面数据和业务主数据。", "输入字段提交前校验；只读字段不得通过页面修改。")],
    ["查询、保存和状态操作均需校验权限、数据范围及对象状态。"],
    ["无数据、无权限、网络失败和重复提交均需给出可恢复反馈。"],
  );

  function injectStyle() {
    if (document.getElementById("globalBusinessSpecStyle")) return;
    const style = document.createElement("style");
    style.id = "globalBusinessSpecStyle";
    style.textContent = `
      .global-business-spec-toggle{height:28px;padding:0;border:0;background:transparent;color:#1677ff;font:inherit;cursor:pointer;white-space:nowrap}.global-business-spec-toggle:hover,.global-business-spec-toggle[aria-pressed="true"]{color:#0958d9;font-weight:600}.business-spec-floating{position:fixed;right:20px;top:12px;z-index:980;padding:6px 12px!important;border:1px solid #d6e4ff!important;border-radius:6px;background:#fff!important;box-shadow:0 4px 14px rgba(0,0,0,.08)}
      .global-business-spec-drawer{position:fixed;right:0;top:0;width:min(520px,94vw);height:100vh;background:#fff;z-index:1000;box-shadow:-12px 0 34px rgba(16,24,40,.18);transform:translateX(103%);transition:transform .2s ease;display:flex;flex-direction:column}.global-business-spec-drawer.open{transform:translateX(0)}.global-business-spec-head{height:58px;flex:0 0 58px;padding:0 18px;border-bottom:1px solid #eaecf0;display:flex;align-items:center;gap:12px}.global-business-spec-head strong{font-size:16px;color:#101828}.global-business-spec-head button{margin-left:auto;width:32px;height:32px;border:0;border-radius:6px;background:transparent;color:#667085;font-size:22px;cursor:pointer}.global-business-spec-head button:hover{background:#f2f4f7}.global-business-spec-body{flex:1;overflow:auto;padding:18px 20px 30px;color:#475467;line-height:1.72}.global-business-spec-body h3{margin:20px 0 8px;color:#1d2939;font-size:15px}.global-business-spec-body h3:first-child{margin-top:0}.global-business-spec-body p{margin:7px 0}.global-business-spec-body ul,.global-business-spec-body ol{margin:7px 0;padding-left:22px}.global-business-spec-body li{margin:5px 0}.global-business-spec-body table{width:100%;border-collapse:collapse;margin:8px 0;font-size:12px}.global-business-spec-body th,.global-business-spec-body td{padding:8px;border:1px solid #e4e7ec;text-align:left;vertical-align:top}.global-business-spec-body th{background:#f7f9fc;color:#344054}.global-business-spec-note{padding:10px 12px;border-radius:7px;background:#f7faff;border:1px solid #d6e4ff;color:#344054}.global-business-spec-tag{display:inline-flex;margin-right:6px;padding:1px 7px;border-radius:10px;background:#e6f4ff;color:#1677ff;font-size:11px}.global-business-spec-mode [data-global-business-spec-id]{outline:2px solid rgba(22,119,255,.72)!important;outline-offset:2px;border-radius:5px;cursor:help!important}.global-business-spec-mode [data-global-business-spec-id]:hover,.global-business-spec-mode [data-global-business-spec-id]:focus{outline-color:#0958d9!important;background-color:rgba(230,244,255,.55)!important}.global-business-spec-mode .global-business-spec-drawer,.global-business-spec-mode .global-business-spec-drawer *{outline:0!important;cursor:auto!important}.global-business-spec-mode .global-business-spec-drawer button{cursor:pointer!important}@media(max-width:760px){.global-business-spec-drawer{width:94vw}.global-business-spec-body{padding:16px}.global-business-spec-body table{font-size:11px}}
    `;
    document.head.appendChild(style);
  }

  function list(items) {
    return `<ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
  }

  function renderOverview() {
    return `
      <h3>1. 页面目标</h3><p>${escapeHTML(current.goal)}</p>
      <h3>2. 角色、权限与数据范围</h3><p>${escapeHTML(current.role)}</p>
      <h3>3. 页面业务逻辑</h3>${list(current.logic)}
      <h3>4. 字段说明</h3>
      <table><thead><tr><th>字段</th><th>业务含义</th><th>来源/格式</th><th>校验与联动</th></tr></thead><tbody>${current.fields.map((item) => `<tr><td>${escapeHTML(item.name)}</td><td>${escapeHTML(item.meaning)}</td><td>${escapeHTML(item.source)}</td><td>${escapeHTML(item.rule)}</td></tr>`).join("")}</tbody></table>
      <h3>5. 操作与反馈</h3>${list(current.operations)}
      <h3>6. 异常与边界</h3>${list(current.exceptions)}
      <p class="global-business-spec-note">说明模式下，页面蓝色标记表示可查看注释的字段、表头、按钮、开关或页签。点击标记只查看说明，不执行原操作；退出说明模式后恢复正常交互。</p>`;
  }

  function elementLabel(element) {
    const explicit = element.getAttribute("aria-label") || element.getAttribute("title") || "";
    const fieldBox = element.closest(".field,.form-item,.filter-item,.select-wrap,.group-config-item,.reminder-form-field");
    const fieldLabel = fieldBox?.querySelector("label,.lab,strong,span")?.textContent || "";
    const regionLabel = element.querySelector?.(".home-card-head,.panel-head,.metric-title,.card-title,h1,h2,h3,strong")?.textContent || "";
    const header = element.matches("th") ? element.textContent : "";
    const placeholder = element.getAttribute("placeholder") || "";
    const text = element.matches("button,a,[role='tab'],th") ? element.textContent : "";
    return [explicit, fieldLabel, regionLabel, header, text, placeholder]
      .map((value) => value.replace(/\s+/g, " ").trim())
      .find(Boolean) || "当前控件";
  }

  function findField(label) {
    const normalized = label.replace(/[：:（(].*$/, "").replace(/搜索|请输入|请选择|筛选|全部/g, "").trim();
    return current.fields.find((item) => item.name.split(/[\/、]/).some((part) => normalized.includes(part) || part.includes(normalized)));
  }

  function findOperation(label) {
    const normalized = label.replace(/[：:（(].*$/, "").replace(/\s+/g, "").trim();
    return current.operations.find((item) => {
      const name = item.split(/[：:]/)[0].replace(/\s+/g, "").trim();
      return normalized.includes(name) || name.includes(normalized);
    });
  }

  function elementKind(element) {
    if (element.matches("th")) return "列表字段";
    if (element.matches("textarea")) return "多行文本";
    if (element.matches("input[type='date'],input[type='datetime-local'],input[type='time']")) return "日期时间";
    if (element.matches("input[type='checkbox'],input[type='radio'],.switch,[role='switch']")) return "开关/选择项";
    if (element.matches("input")) return "输入字段";
    if (element.matches("select,.select-wrap")) return "下拉字段";
    if (element.matches("[role='tab'],.subtab,.settings-tab")) return "页签";
    if (element.matches("button,a")) return "操作";
    if (element.matches("table,.metric-card,.home-card,.panel,.card")) return "业务区域";
    return "页面元素";
  }

  function genericRule(element, kind, label) {
    if (kind === "列表字段") return "只读展示字段；数据来自当前列表业务对象。空值显示“--”，长文本截断时应可查看完整内容；排序、分页和导出使用同一字段口径。";
    if (kind === "日期时间") return "由操作员选择；按北京时间展示。日期区间起止边界均包含，开始值不得晚于结束值；提交时再次校验。";
    if (kind === "开关/选择项") return "取值来自页面枚举或布尔配置。切换仅更新当前编辑态，保存成功后影响后续业务；失败时恢复原值并提示原因。";
    if (kind === "下拉字段") return "候选项来自当前租户、权限和业务状态范围；历史停用值只读回显。与其他筛选条件按交集生效。";
    if (kind === "多行文本") {
      const max = element.getAttribute("maxlength");
      return `人工输入文本；${max ? `最多 ${max} 个字符，` : "按页面业务限制校验长度，"}保留必要换行。保存失败时保留输入并定位错误。`;
    }
    if (kind === "输入字段") {
      const max = element.getAttribute("maxlength");
      return `人工输入或由业务数据预填；提交前去除无意义首尾空格并校验格式${max ? `，最多 ${max} 个字符` : ""}。非法值阻止保存并显示字段级错误。`;
    }
    if (kind === "页签") return "切换当前业务视图，不修改业务数据；切换后保留已保存条件，未保存内容按页面规则提示确认。";
    if (kind === "操作") return `执行“${label}”前校验功能权限、数据范围和对象状态；处理中防重复点击。成功后刷新受影响数据并提示结果，失败时保持原状态并给出可重试原因。`;
    return "本区域展示当前业务对象的核心信息；数据刷新、空态和异常提示必须与页面整体口径一致。";
  }

  function renderElement(element) {
    const label = elementLabel(element);
    const kind = elementKind(element);
    const matched = findField(label);
    const matchedOperation = kind === "操作" ? findOperation(label) : "";
    const isReminderElement = app === "order" && (
      label.includes("催单") ||
      element.matches("[data-reminder-enter-batch],[data-reminder-edit],[data-reminder-batch],[data-reminder-select-all],[data-reminder-detail-save]") ||
      element.closest("[data-reminder-row],[data-reminder-modal],[data-reminder-detail]")
    );
    const operationMeaning = matchedOperation ? matchedOperation.replace(/^[^：:]+[：:]\s*/, "") : "";
    const meaning = matched?.meaning || operationMeaning || (kind === "操作" ? `触发“${label}”对应的页面业务动作。` : `${label}用于展示或维护当前页面业务信息。`);
    const source = matched?.source || (kind === "操作" || kind === "页签" ? "由当前用户在页面触发。" : "来自当前业务对象、关联主数据或操作员输入。 ");
    const rule = matched?.rule || matchedOperation || genericRule(element, kind, label);
    return `
      <p><span class="global-business-spec-tag">${escapeHTML(kind)}</span><strong>${escapeHTML(label)}</strong></p>
      <h3>业务含义</h3><p>${escapeHTML(meaning)}</p>
      <h3>来源与展示</h3><p>${escapeHTML(source)}</p>
      <h3>校验、联动与状态</h3><p>${escapeHTML(rule)}</p>
      <h3>操作与反馈</h3><p>${escapeHTML(genericRule(element, kind, label))}</p>
      ${isReminderElement ? `<h3>催单执行规则</h3>${list(reminderLogic)}` : ""}
      <h3>异常处理</h3><p>无权限时隐藏或明确拦截；数据缺失时显示空值而不猜测；请求失败时保留原数据和当前输入，提示原因并允许重试；重复触发不得产生重复业务数据。</p>`;
  }

  function createDrawer() {
    const drawer = document.createElement("aside");
    drawer.className = "global-business-spec-drawer";
    drawer.id = "globalBusinessSpecDrawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("aria-label", "当前页面业务说明");
    drawer.innerHTML = `<div class="global-business-spec-head"><strong>${escapeHTML(current.title)}业务说明</strong><button type="button" aria-label="关闭业务说明">×</button></div><div class="global-business-spec-body"></div>`;
    document.body.appendChild(drawer);
    return drawer;
  }

  function prepareToggle() {
    const old = document.querySelector("[data-spec-toggle]");
    let toggle = document.querySelector("[data-page-spec-toggle]");
    if (!toggle && old) {
      toggle = old.cloneNode(true);
      toggle.removeAttribute("data-spec-toggle");
      toggle.setAttribute("data-page-spec-toggle", "");
      old.replaceWith(toggle);
    }
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.textContent = "业务说明";
      toggle.setAttribute("data-page-spec-toggle", "");
      const host = document.querySelector(".t-top-right,.top-actions,.header-actions,.admin-top-actions,.topbar-actions,.top-right");
      if (host) host.insertBefore(toggle, host.children[Math.min(1, host.children.length)] || null);
      else {
        toggle.classList.add("business-spec-floating");
        document.body.appendChild(toggle);
      }
    }
    toggle.hidden = false;
    toggle.classList.add("global-business-spec-toggle");
    toggle.setAttribute("aria-pressed", "false");
    return toggle;
  }

  function collectTargets() {
    const selectors = [
      ".t-content .field", ".t-content input", ".t-content textarea", ".t-content select", ".t-content .select-wrap",
      "main .field", "main input", "main textarea", "main select", "main .select-wrap",
      ".content input", ".content textarea", ".content select", ".content .select-wrap",
      "th", "button:not([data-page-spec-toggle])", "a.btn", ".t-content a", "main .content a", "[role='tab']", ".subtab", ".settings-tab",
      ".metric-card", ".home-card", ".stat-card",
    ];
    const seen = new Set();
    const targets = [];
    document.querySelectorAll(selectors.join(",")).forEach((element) => {
      if (element.closest("#globalBusinessSpecDrawer,.modal-bg:not(.open),.spec-drawer")) return;
      if (element.matches("script,style,[hidden]") || element.getClientRects().length === 0) return;
      const fieldBox = element.closest(".field,.form-item,.filter-item,.reminder-form-field");
      const target = fieldBox || element;
      if (target.closest("#globalBusinessSpecDrawer") || seen.has(target)) return;
      seen.add(target);
      targets.push(target);
    });
    targets.slice(0, 120).forEach((element, index) => {
      element.dataset.globalBusinessSpecId = `${file.replace(/\W/g, "-")}-${index + 1}`;
      if (!element.matches("button,a,input,select,textarea") && !element.hasAttribute("tabindex")) element.tabIndex = 0;
    });
    return targets.slice(0, 120);
  }

  function init() {
    injectStyle();
    const toggle = prepareToggle();
    const drawer = createDrawer();
    const drawerTitle = drawer.querySelector("strong");
    const drawerBody = drawer.querySelector(".global-business-spec-body");
    const close = drawer.querySelector("button");
    collectTargets();
    let enabled = false;

    const open = (title, html) => {
      drawerTitle.textContent = title;
      drawerBody.innerHTML = html;
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
    };
    const closeDrawer = () => {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
    };
    const restoreDisabled = () => document.querySelectorAll("[data-global-spec-was-disabled]").forEach((control) => {
      control.disabled = true;
      delete control.dataset.globalSpecWasDisabled;
    });
    const setEnabled = (value) => {
      enabled = value;
      document.body.classList.toggle("global-business-spec-mode", enabled);
      toggle.setAttribute("aria-pressed", String(enabled));
      toggle.textContent = enabled ? "退出说明" : "业务说明";
      if (enabled) {
        document.querySelectorAll("[data-global-business-spec-id]:disabled").forEach((control) => {
          control.dataset.globalSpecWasDisabled = "true";
          control.disabled = false;
        });
        closeDrawer();
      } else {
        restoreDisabled();
        closeDrawer();
      }
    };

    toggle.addEventListener("click", () => setEnabled(!enabled));
    close.addEventListener("click", closeDrawer);
    document.addEventListener("click", (event) => {
      if (enabled) return;
      if (event.target.closest("[data-subtab],[data-tab-target],[role='tab'],.settings-tab,.subtab")) {
        window.setTimeout(collectTargets, 0);
      }
    });
    document.addEventListener("click", (event) => {
      if (!enabled) return;
      const element = event.target.closest("[data-global-business-spec-id]");
      if (!element || element.closest("#globalBusinessSpecDrawer")) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      open(`${elementLabel(element)}｜业务说明`, renderElement(element));
    }, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && enabled) {
        event.preventDefault();
        if (drawer.classList.contains("open")) closeDrawer();
        else setEnabled(false);
        return;
      }
      if (!enabled || !["Enter", " "].includes(event.key)) return;
      const element = event.target.closest("[data-global-business-spec-id]");
      if (!element || element.closest("#globalBusinessSpecDrawer")) return;
      event.preventDefault();
      open(`${elementLabel(element)}｜业务说明`, renderElement(element));
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
