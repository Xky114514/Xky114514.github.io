# 报价助手 · 观麦字段对应表 V2.1

原接口口径核对记录：2026-09-30；本轮产品采纳设计更新：2026-10-09。依据为本机 `D:/guanmai/gm_service` 的现有实现。此交付是离线演示，数据为虚构样例；未连接上述接口，也未修改观麦后端。字段映射说明的是后续接入时的来源与含义。完整产品字段和异常要求见[需求说明（简版）](requirements-v2.md)。本表同时区分已有来源、原型适配和本轮新增交互，不能据本地字段推定后端已有同名能力。

## 对象、标识与关系

| 页面对象 | 观麦字段 / 来源 | 本地适配 | 口径 |
|---|---|---|---|
| 客户 / 门店 / 收货地址 | 客户查询的 `address_id`，底层 `Restaurant.id` | `customers[].address_id` | 定价上下文以门店 / 收货地址为单位；不是客户账号 ID |
| 所属客户账号 | `Restaurant.user_id`；`FinalCustomerUser` | `customers[].user_id`、`accounts[]` | 结算配置跟随客户账号，不能放在 SKU 上 |
| 客户名称 / 编码 | `Restaurant.resname`、`res_custom_code` | `name`、`customized_code` | 展示为客户名称与客户编码 |
| 联系人 / 电话 / 地址 | `Restaurant.name`、`telephone`、`addr_detail` | `contact`、`phone`、`address` | 缺失显示“—”，不猜测配送要求 |
| 报价单 | `/salemenu/list`、`/salemenu/sale/detail`：`id`、`name`、`is_active`、`fee_type`、`time_config`、`type` | `salemenus[]` | 独立于客户保存；运营时间按报价单配置关联 |
| 客户与报价单关联 | `get_restaurant_salemenu` 的 `restaurant_id`、`station_id`、`salemenu_id`（底层 `RestaurantSalemenu` 关联） | `links[]` | 多对多：一个客户可有多张报价单，同一报价单可服务多个客户 |
| 报价单商品 | `/product/sku_salemenu/list`：`sku_id`、`salemenu_id` | `skus[]` | 按 SKU 标识与所属报价单处理；同名、同 SPU 不代表同一报价项 |

客户资料由客户查询、档案与结算信息组合获取。`/station/customer/search` 和 `/station/order/customer/search` 用于已有客户查询；档案源字段见 `common/mysql/restaurant.py` 的 `customerDetailInfo`。本文不把本地统一命名误称为上述接口的原样响应。

## 商品、采购与当前价格

| 页面字段 | 原生字段 | 接口 / 源码来源 | 单位及处理 |
|---|---|---|---|
| 商品名称 / 编码 / 规格 | `sku_name`、`outer_id`、`specification_desc` | `/product/sku_salemenu/list` | 原值；空值显示“—” |
| 分类 | `category_name_1`、`category_name_2`、`category_id_2` | 同上 | 分类筛选，不按商品名称猜分类 |
| 销售单位 / 基本销售单位 | `sale_unit_name`、`std_unit_name_forsale` | 同上 | 逐行保留斤、公斤、箱、包等 |
| 商品基本单位及换算参数 | `std_unit_name`、`sale_ratio`、`std_ratio` | 商品资料 / material | 用于识别原生单位关系；不再次换算已转换的采购参考价 |
| 内部金额校验（不展示） | `fee_type` | SKU / 报价单资料 | 界面和模板无币种字段；人民币金额显示“元”及原单位，其他金额不冒标为元并保持只读；原字段仍用于校验 |
| 报价单基础销售价 | `sale_price` | `/product/sku_salemenu/list` | 分，展示除以 100 一次，按销售单位 |
| 基本销售单价 | `std_sale_price_forsale` | 同上 | 分，展示除以 100 一次，按基本销售单位 |
| 供应商最近采购价 | `last_purchase_price` | 同上；`common/ref_price.py` | 仅展示供应商维度最近采购参考，金额分转元一次；按原接口基本销售单位展示，不重复乘规格换算率，缺失不使用其他采购价替代。供应商及日期追溯需由原采购记录补齐，本地适配不是该SKU接口的新增原生字段 |
| 商品设定损耗率 | `attrition_rate` | 商品资料 | 原值为百分数，直接加 `%`；不是单位损耗重量，也不是实际履约损耗 |
| 系统建议价范围 | `suggest_price_min`、`suggest_price_max` | `/product/sku_salemenu/list` | 分、按基本销售单价；仅商品详情展示，不解释为 AI 结论 |
| 客户当前价 | `items[].settle_price`、`unit_name`、`strategy` | `POST /product/customer_settle_prices` | `settle_price` 为分，按返回销售单位显示；请求 `customer_id=address_id`、`items[{sku_id,quantity?}]` |
| 阶梯价 | `is_step_price`、`step_price_table[].min/max/step_sale_price/step_std_price` | 商品资料、`website/product/dals/step_price.py` | 数量档按销售单位；未输入数量时原型要求补充，避免把首档当成确定客户价 |
| 时价 | `is_price_timing`；取价返回 `strategy=timing` | 客户结算价接口 | 待人工定价的原生 0 展示为“待定价”；正常固定价 0 不擅自判成缺失 |

普通后台报价的客户取价顺序为 **阶梯价 → 客户协议价 → 时价 → 报价单标准价**。会员、活动、人工指定及对外展示价格不据此简化。依据 `website/product/dals/customer_settle_prices.py`。接口不提供任意未来日期实际取价，规则按取价时刻判断；原型未来日期仅配置有效期，不按未来配送日期宣称结算价。调整不自动重算已创建订单。普通报价单基准SPU与适用商品折扣可在本地演示；行情基准／分类继承型SPU本期只读，不能宣称本地预览覆盖全部原生组合。

## 商品历史报价与市场行情

| 页面字段 | 原生字段 | 来源 | 处理 |
|---|---|---|---|
| 商品历史报价 | `sku_id`、`snapshot_list[]` | `/product/sku_snapshot/detail` | 本地 `snapshots[]` 展平列表；页面按日期级展示，不是客户成交记录，也不是含操作人的审计日志 |
| 记录销售价 / 基本单价 | `sale_price`、`std_sale_price_forsale` | 同上 | 分值各除以 100；按记录自己的单位展示；内部核对原金额类型，不把外币标为元 |
| 适用时间段 | `modify_time`、`next_modify_time` | 同上 | 与查询日期做时间段重叠筛选；默认近七日，不补造每日收盘价 |
| 记录单位、内部金额校验、时价标记 | `sale_unit_name`、`std_unit_name_forsale`、`fee_type`、`is_price_timing` | 同上 | 按历史记录本身展示单位，fee_type仅内部校验；时价标记优先于裸 0 值 |
| 关联平台商品 | `spu_ids`、平台商品 `id`、`source_platform_name`、`sku_name`、`standard`、`unit_name` | `/product/spu/market_price_list` | 通过 SPU 关联到报价单 SKU；关联并不证明口径完全可比 |
| 平均价 / 最高价 / 最低价 | `market_price_avg`、`market_price_max`、`market_price_min` | `/data_center/market_price/list` | 保留平台原单位，原值按人民币主币单位展示，不除以 100、不乘 SKU 规格换算率 |
| 平台单位 / 数据日期 / 市场 | `unit_name`、`record_date`、`market_name` | 同上 | 显示最新可用记录日期，不能据此宣称实时更新；本轮超过3天仅显示旧数据提示，不自动判不可用 |

`db.market[].matched_products` 是平台商品关系与原始行情结果组合后的**本地适配结构**，并非某接口的原样结果。原型没有直接使用可能已转换均价的“匹配试算”响应。行情源接口日期为格式化字符串；演示统一转成毫秒时间戳存储，按北京时间显示。没有原生税价依据时不显示“含税”或“未税”。

## 客户结算与采购记录

| 页面字段 | 观麦来源字段 | 口径 |
|---|---|---|
| 结算方式 | `pay_method` | 1 日结、2 周结、3 月结、4 自定义、5 半月结 |
| 收付款方式 | `settle_way` | 1 先货后款、2 先款后货 |
| 结算日期口径 | `settle_date_type` | 1 按下单日期、2 按收货日期 |
| 周期配置 | `begin_day`、`settle_day`、`cycle_length`、`delay_day`、`effective_date` | 来自 `UserPayMethod`，周结／月结／自定义按各自配置显示，不统一改写成“对账后 N 天” |
| 半月结 | `pay_method=5`、`delay_day` | 每月1–15日、16日–月末；各周期末再按配置延后。不是按月结的begin_day／settle_day显示 |
| 客户购买分析订单数 / 销售额 / 下单额 | `/station_statistics/order/customers_analysis` 返回的 `data[].modelValues[].kv` 中 `old_order_id`、`account_price`、`order_price` | 总表按 `shop_id` 聚合；金额原值为元，不除以 100；默认近 30 天按 `order_time` 查询 |
| 最近订单 | `id`、`date_time_str`、`merchandise_count` | `/station/order/recent_order/get`，请求 `address_id`、`time_config_id` |
| 最近订单下单金额 / 出库金额 | `origin_total_price`、`sale_outstock_price` | 接口原值为元，不除以 100 |

购买分析本地保存为 `customerAnalysis[].kv`，外层客户标识、起止日期和时间口径仅是查询上下文。原生模型定义来自 `ceres/app/databi/internal/service/gm_preset_order.go`；`gm_statistics/grpc_client/client.py` 将列名去除 `_alias` 后形成 `kv`。不自造 `order_count`、`sale_amount`、`avg_order_amount` 响应字段，也不从最近订单计算平均金额。演示仅提供固定查询快照；其他区间或收货时间口径显示“未提供演示快照”。

最近订单的原生范围是近 90 天内最近 50 单，按下单时间倒序，排除删除订单与超时 / 退款关闭订单。`merchandise_count` 为明细数量，页面写“商品明细数”；不把它写成采购重量。最近订单不能替代客户完整购买分析的汇总来源。

## 原生客户价格规则与报价单定时调价（原生 cycle_pricing 任务）

原生客户价格规则从“查看现有价格规则”和依据页访问；客户协议调价默认列表展示本项目新增任务集合，不能直接用原生规则列表响应替代该任务集合。一次客户任务可以关联多条规则；一次规则编辑也会形成独立任务快照。

| 页面字段 | 原生字段 / 来源 | 口径 |
|---|---|---|
| 协议规则名称与标识 | `/station/price_rule/index`、`/station/price_rule/edit` 的名称、规则 ID | 系统已配置价格规则，不等同于已签署合同 |
| 适用客户 | 原生 `addresses` | 本地适配为 `address_ids`；多个客户共用时在人工编辑入口完整修改并确认全部影响客户；对话不会自动拆分为当前客户规则 |
| 对象类型 | `rule_object_type` | 1 SKU，2 二级分类，3 上浮率，4 整单折扣 |
| SKU 范围 | 原生 `skus[].id` | 本地适配为 `skus[].sku_id`，准确关联当前报价单商品 |
| 分类 / SPU / 整单范围 | `category_2_list[]`、`spus[]`、`change_rate` | 保留实际对象范围，不把所有规则伪装成SKU固定价。SPU只增改，不移除原对象；含category1_change_rates继承配置只读。整单折扣作用于适用商品，不包含运费等费用 |
| 计算方式 | `rule_type`、`yx_price` | 0 固定值、1 加减值、2 倍数；金额为分；倍数使用百分数尺度，例如 95 显示 ×0.95 |
| 计算基准 | `price_type`、`locking_price_unit` | 正常报价单价 / 创价网行情 / 新发地平均、最高、最低价；基本单价锁价按原生基本单价路径处理，界面明确基准；本轮仅普通报价单基准允许编辑，行情基准只读 |
| 计价单位 | `locking_price_unit` | 0 销售单价，1 基本单价；与 SKU 单位一起显示 |
| 有效日期 / 每日时段 | `begin`、`end`、`begin_time`、`end_time`、`time_limit` | 日期与每日时段分列；`time_limit=1` 跨午夜、2 非跨午夜，不把 1 当作全天 |
| 规则状态 | `status` | 0关闭、1无效、2未开始、3有效；原型过期样例为0关闭，已关闭或已到期规则只读，不把到期当成可恢复停用。展示原状态，不由浏览器时钟推进状态 |
| 报价单定时调价列表 | `/salemenu/cycle_pricing/search` | 报价单级预约一次执行任务，不是客户独占策略，也不是重复计划；与另一类报价周期公式重新计算分开 |
| 任务名称 / 报价单 / 执行时间 | `rule_id`、`rule_name`、`salemenu_id`、`effective_time` | 只有rule_status=0允许编辑。本轮要求未来整点；保存后不允许更换报价单，改名／时间／明细仍需校验。原型的整点限制不代表生产可保证秒级执行 |
| 报价单定时调价状态 | `rule_status` | 0未开始、1已生效、2已结束；已生效不保证全部商品成功，需并列查看异常标识 |
| 异常标识 | `abnormal_status` | 保留原标识，在原生状态旁提示异常；不由异常标识反向改写rule_status。明确失败商品列表由真实执行反馈适配，本地failures不是已确认同名原生字段 |
| 执行结果 | 原记录 `task_result` | 从列表移除此列，保留原生异常标识及异常处理入口，不把移除列理解为丢弃失败信息；不由时间自动宣告成功 |
| 报价单定时调价新建／编辑 | `/salemenu/cycle_pricing/create`、`/salemenu/cycle_pricing/edit` | 原接口已有文件导入与任务基础；原型新增手工选品、逐行改价和简化导入，不调用接口，正式接入需适配原文件流程。保存时算好目标价，未来不重新按百分比计算 |
| 本地任务商品明细 | `jobs[].items[]`（本地适配） | `sku_id`关联原SKU，`sale_price`为分、销售单位；`operation/value/base_price`仅记录本地草稿的计算输入，不能冒充原生任务接口字段 |
| 已有价格规则人工编辑 | `/station/price_rule/edit` | 复用原编号和原字段；保留类型及计价单位，按原生日期／类型互斥检查；关闭或已到期只读，行情基准／继承型SPU只读；权限在提交再次检查 |

固定值与加减值按原计价单位展示为元，本轮写入仅人民币；界面不再单独展示币种；倍数与整单折扣不得套用金额分转元逻辑。不存在“同一个客户同一时刻只能有一套规则”的额外限制；冲突按原生客户、对象、商品范围和日期约束判断。

## 客户协议调价任务：明确为本项目新增对象

| 页面信息 | 业务来源 | 本项目记录与尺度 | 不得混淆 |
|---|---|---|---|
| 任务编号、名称、创建人／时间、来源 | 本次人工确认操作 | 新增聚合头，名称1—80、编号唯一；名称允许重复 | 不是原生价格规则编号，也不是cycle_pricing任务 |
| 客户和报价单 | 原客户address_id、报价单salemenu_id、关联关系 | 保存确认时标识及展示快照；常规单客户单报价单 | 共享编辑按完整新旧客户集合，不能只记当前客户 |
| 统一有效日期、每日时段 | 本次原规则设置 | begin／end与每日时段的确认快照，遵原生语义 | 不新增客户任务计划执行时间；未来适用由原规则决定 |
| 商品明细、单位、调整前客户价／标准价 | 原SKU及当前取价结果 | 保存当时快照；金额分值与显示单位对应，缺失保留 | 不把后续现价当成历史原价，不把时价占位0当确定价 |
| 调整方式、输入值、基准、规则设置值 | 人工或对话生成后确认的草稿 | 每行独立；百分比转倍率，当前价一次计算转固定价 | 规则设置值不等于未来实际成交价 |
| 成功／失败／跳过及原因 | 本次配置处理结果 | 本项目逐项反馈；生产需按原规则写入边界聚合 | 本地部分失败样例不是现成后端部分成功API |
| 关联原规则 | 本次创建／修改的原规则标识及类型 | 任务保存规则引用和快照；原规则后续变化不改旧快照 | 不以商品列表扁平写入共享、分类、SPU或折扣规则 |
| 来源任务 | 再次调整／失败补处理入口 | 新任务指向原任务；原任务只读 | 不编辑旧任务，不把补处理完成倒写成旧任务全部成功 |

原生价格规则仍是客户价权威。客户任务没有独立取价优先级，也不新增“一个客户只能有一套策略”的限制。客户任务首期使用统一日期与每日时段，逐商品计算方式可以不同；不同生效时间拆任务。

`db.customerTasks[]` 为本地新增适配集合，不是已存在的观麦接口。保留本地v2存储键和schema4；已保存记录缺集合时只补空，不根据既有规则名称／日期自动造任务；新建演示数据库的任务样例是明确虚构记录。客户任务的正式存储、查询、追溯、幂等及部分成功反馈是新增研发范围。

### 客户任务本地适配字段

| 本地字段 | 含义与格式 | 数据权威与限制 |
|---|---|---|
| `id/name/created_at/actor/source` | 本次任务标识、名称、时间、确认者和入口 | 标识独立于原规则；演示用户／时间不是生产身份 |
| `customer_id/customer_ids/customer_names` | 主要客户标识、完整影响客户及名称快照 | 常规单客户；原共享编辑为旧新客户并集 |
| `salemenu_id/salemenu_name` | 报价单标识与确认时名称 | 只关联当前报价单，不按同名跨单合并 |
| `begin/end/begin_time/end_time/time_limit` | 统一有效日期与每日时段快照 | 与原规则时间语义一致，不作为客户任务调度时间 |
| `processing_status` | completed／partial／failed | 分别配置完成／部分完成／配置失败；仅配置处理结果 |
| `items[].status/reason` | success／failed／skipped和原因 | 逐项反馈；不从后来的实时价格反推历史成功 |
| `items[].before_price/base_price/proposed_price` | 当时客户价、标准价、一次参考计算值，分值 | proposed_price不是保证的未来成交价；缺失保留null |
| `items[].operation/value/base/quantity` | 本行输入方式、数值、基准、取价核对数量 | set／delta的value主币金额，percent为百分数，multiple为倍率；quantity不是协议价门槛 |
| `items[].rule_type/yx_price/setting_unit/setting_currency` | 实际原生设置方式、原值、设置单位币种 | rule_type0／1金额为分，2倍率为百分数尺度；基本单位锁价不误套销售单位 |
| `items[].name/code/spec/unit/basic_unit/currency` | 商品名称、编码、规格、单位和币种的确认时快照 | 以后商品改名不反写原任务 |
| `rule_ids/items[].rule_ids` | 本任务及各商品关联原规则标识 | 引用原规则决定价格，任务不创建新的优先级 |
| `kind/native_edit/origin_rule_id/origin_rule_type/rule_snapshot` | 原规则编辑任务的来源类型与前后配置 | 共享／分类／SPU／折扣保持原类型，禁止将快照表扁平写回 |
| `source_task_id` | 再次调整或失败补处理的来源任务 | 新记录关联旧记录；旧记录不改为新结果 |
| `preview_token` | 防止同一预览本地重复提交的标识 | 本地交互保护，不替代正式服务幂等与结果查询 |

## 已移除的自建字段和本地边界

- 移除单位损耗重量、单位配送成本、自算毛利、客户跨单位采购总重量、推算采购频次、虚构配送要求。
- 移除市场新闻、微信 / 企业微信聊天原文、人工核实状态、勾选生效条件、条件快照。
- 移除 AI 倾向价 / 区间、助手报价版本、人工落实核验、客户独占策略、结束后自动恢复旧价格。
- “对话识别、调整预览、应用演示、选择范围、分页”是本地交互，不是新增的观麦业务字段或后端状态。
- 采用本地键guanmai-pricing-prototype-v2，存储version2、数据schema4；旧键保留但不迁移。未提供值显示“—”，正常零值保留，时价待定单列。

## 核对入口

主要源码：`website/product/views/sku.py`、`website/product/views/customer_settle_prices.py`、`website/product/dals/customer_settle_prices.py`、`website/product/dals/sku_snapshot.py`、`common/ref_price.py`、`common/mysql/restaurant.py`、`common/mysql/models/customer_model.py`、`website/station/views/order.py`、`website/data_center/views/market_price.py`、`website/merchandise/views/spu_market_price.py`、`common/price_rule_status.py`、`website/station/price_rule/urls.py`、`website/salemenu/views/cycle_pricing.py`。

本轮扩展（2026-10-09）：新建／导入／逐项编辑计划任务、成本权限体验、失效预览、操作记录和失败项重建是本地原型能力；不声称观麦现有接口直接接受这些适配对象。全部解释使用问号Tooltip，字段、状态及校验错误仍直接显示。


## 本轮采纳设计、演示适配与既有能力的区别

| 能力 | 观麦已有基础 | 本轮采纳设计／需要对接补充 |
|---|---|---|
| 客户与报价单 | 门店、账号、报价单及站点关联 | 持续展示上下文；选择后按站点／启用／币种校验。演示salemenus[].station_id由已知站点上下文组合，不宣称所有报价单接口均返回该字段 |
| 成本参考 | 原接口最近采购参考及单位转换 | 按原参考价格显示；采购记录超过7天提示，日期缺失不猜测。币种与汇率无法核对显示无法比较，不冒标USD。来源须补取采购记录 |
| 权限 | 原系统角色与业务授权 | 原型三种体验角色不是现成原生角色配置；正式需映射权限，且列表、详情、对话与提交一致 |
| 价格预演 | 当前客户取价与价格规则 | 对未保存调整逐客户预演、记录跳过项和数量不足；不承诺已经覆盖所有订单入口和未来结算 |
| 规则编辑 | 原规则编辑与冲突校验 | 对关闭／过期／行情／继承SPU限制；共享需确认全部影响。SPU不删已有对象，原规则不静默拆分 |
| 计划任务 | 原任务、导入、状态及异常 | 手工选品、简化导入、保存目标价、锁定报价单、整点限制、重叠提示、全量失败项重建；执行反馈仍需真实队列接入 |
| 客户协议调价任务 | 原生客户规则、SKU、当前价和规则编辑 | 新增一次操作的任务头、冻结商品明细、逐项处理结果、来源任务及关联原规则；不能把原规则列表直接叫任务列表 |
| 修改追溯 | 已有部分业务日志和报价快照 | 原型独立操作记录连接意图、确认与前后值；与商品历史报价分开；不提供自动回滚 |
| 并发与重试 | 真实接口的既有更新流程 | 本地同源页面修改会使预览失效，仅验证交互。生产需后端版本／幂等／部分成功与重试规则 |

### 明确为本地适配的字段

| 本地结构 | 含义及尺度 | 原生对应与限制 |
|---|---|---|
| `db.demoRole` | manager／sales／viewer体验角色 | 不是观麦真实账号授权字段，正式不允许任意切换权限 |
| `db.meta.now`、`station_name` | 固定演示业务时点及展示站点名称 | 不当成真实时钟、站点接口或未来取价接口 |
| `db.purchaseSources[sku_id].supplier` | supplier_name、record_date、source_type、fee_type；仅供应商采购来源用于展示 | 本地组合结构；需原采购记录补齐，不属于SKU列表已确认返回的新增字段。日期为原记录日期，缺失显示未提供 |
| `purchaseSources[sku_id].fx_status` | 演示币种是否可核对 | 不代表真实汇率接口结果，不据其自行换算 |
| `jobs[].items[]` | 确定目标价sale_price为分，base_price为保存时参考分值；operation/value是本地编辑输入；sku_id、单位、币种用于核对 | 不是原生任务API请求体。正式需适配现有任务明细和文件流程，只改价格，不覆盖其他资料 |
| `jobs[].failures[]` | 失败SKU和reason | 本地异常适配，需真实执行反馈形成。分页25不缩小复制范围；复制全部明确失败项形成新草稿，无明细不能复制 |
| `jobs[].execution_summary` | 成功／失败项数的演示摘要 | 本地示例辅助，不作为原生状态或生产执行结果证明 |
| `jobs[].source_job_id` | 失败项新草稿的来源任务 | 本地追溯适配，不声称已有原生同名字段 |
| `db.operationLogs[]` | id、time、actor、role、action、object_id、quote_id、customer_ids、summary、changes、source等 | 本地追溯集合，不是原生操作日志响应。changes保留原值尺度，展示时区分金额分值和倍率；同商品快照分开 |
| 本地存储revision及预览指纹 | 判断当前演示数据是否变化 | 本地并发交互保护，不替代生产事务、接口幂等与权限验证 |

异常和时间边界：未来整点仅为本期产品输入要求；浏览器到时不执行、不改变状态、不补执行。原生状态与异常并列展示；成功项保留，失败全量复制至新草稿后重新核对，不自动重试、不撤回、不恢复旧价。

关闭规则不因改未来日期而恢复；普通无效规则仍按原约束重新校验。每日时段错开不当然解除日期级冲突。限时固定价仍受阶梯价优先，结束后回到届时有效取价路径，不能承诺回到原价。


### 界面名称与输入联动

“报价单标准价”对应既有基础销售价字段，“客户协议价”对应原价格规则，“客户当前价”对应当前取价结果，原生字段与优先级不变。客户设置先选意图：直接指定价格→固定值；随标准价浮动→标准价基准的加减／倍率；按客户当前价调整一次→以当前结果计算后转固定值。百分比仍转换为原生倍率。计算基准由意图确定，界面不提供独立组合选择；任务明细保存原计算来源。一个或多个商品均通过“批量设置价格”填写，只改本次勾选商品的草稿；取消勾选不改变任务商品或价格，移除才改变任务范围。本次勾选是临时界面状态，不增加观麦业务字段。

预约报价单调价使用相同的选品、分批勾选和批量填写交互，仅有“直接指定标准价”和“按现标准价调整一次”。后者仍以 `sale_price` 为基准生成本地确定目标价；不读取客户当前价，不新增持续浮动规则，不改变原生任务字段。
