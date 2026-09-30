# 报价助手 · 观麦字段对应表

核对日期：2026-09-30。依据为本机 `D:/guanmai/gm_service` 的现有实现。此交付是离线演示，数据为虚构样例；未连接上述接口，也未修改观麦后端。字段映射说明的是后续接入时的来源与含义。

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
| 币种 | `fee_type` | SKU / 报价单资料 | 例如 CNY、USD；不能统一标“元/斤” |
| 报价单基础销售价 | `sale_price` | `/product/sku_salemenu/list` | 分，展示除以 100 一次，按销售单位 |
| 基本销售单价 | `std_sale_price_forsale` | 同上 | 分，展示除以 100 一次，按基本销售单位 |
| 最近采购价 | `latest_purchase_price` | 同上；`common/ref_price.py` | 不限供应商的最近采购参考。列表返回值已按基本销售单位及币种处理；仅从分转到主币单位 |
| 供应商最近采购价 | `last_purchase_price` | 同上；`common/ref_price.py` | 供应商维度最近采购参考，与 `latest_purchase_price` 分列；不重复乘规格换算率 |
| 商品设定损耗率 | `attrition_rate` | 商品资料 | 原值为百分数，直接加 `%`；不是单位损耗重量，也不是实际履约损耗 |
| 系统建议价范围 | `suggest_price_min`、`suggest_price_max` | `/product/sku_salemenu/list` | 分、按基本销售单价；仅商品详情展示，不解释为 AI 结论 |
| 客户当前适用价 | `items[].settle_price`、`unit_name`、`strategy` | `POST /product/customer_settle_prices` | `settle_price` 为分，按返回销售单位显示；请求 `customer_id=address_id`、`items[{sku_id,quantity?}]` |
| 阶梯价 | `is_step_price`、`step_price_table[].min/max/step_sale_price/step_std_price` | 商品资料、`website/product/dals/step_price.py` | 数量档按销售单位；未输入数量时原型要求补充，避免把首档当成确定客户价 |
| 时价 | `is_price_timing`；取价返回 `strategy=timing` | 客户结算价接口 | 待人工定价的原生 0 展示为“待定价”；正常固定价 0 不擅自判成缺失 |

客户取价顺序为 **阶梯价 → 客户协议价 → 时价 → 报价单固定价**。依据 `website/product/dals/customer_settle_prices.py`。接口不提供任意未来日期试算，原型未来日期仅配置规则有效期，不声称获得未来实际结算价。

## 报价记录与市场行情

| 页面字段 | 原生字段 | 来源 | 处理 |
|---|---|---|---|
| SKU 报价记录 | `sku_id`、`snapshot_list[]` | `/product/sku_snapshot/detail` | 本地 `snapshots[]` 展平列表；不是客户成交记录 |
| 记录销售价 / 基本单价 | `sale_price`、`std_sale_price_forsale` | 同上 | 分值各除以 100；保留记录自己的单位和币种 |
| 适用时间段 | `modify_time`、`next_modify_time` | 同上 | 与查询日期做时间段重叠筛选；默认近七日，不补造每日收盘价 |
| 记录单位、币种、时价标记 | `sale_unit_name`、`std_unit_name_forsale`、`fee_type`、`is_price_timing` | 同上 | 按历史记录本身展示；时价标记优先于裸 0 值 |
| 关联平台商品 | `spu_ids`、平台商品 `id`、`source_platform_name`、`sku_name`、`standard`、`unit_name` | `/product/spu/market_price_list` | 通过 SPU 关联到报价单 SKU；关联并不证明口径完全可比 |
| 平均价 / 最高价 / 最低价 | `market_price_avg`、`market_price_max`、`market_price_min` | `/data_center/market_price/list` | 保留平台原单位，原值按人民币主币单位展示，不除以 100、不乘 SKU 规格换算率 |
| 平台单位 / 数据日期 / 市场 | `unit_name`、`record_date`、`market_name` | 同上 | 显示最新可用记录日期，不能据此宣称实时更新 |

`db.market[].matched_products` 是平台商品关系与原始行情结果组合后的**本地适配结构**，并非某接口的原样结果。原型没有直接使用可能已转换均价的“匹配试算”响应。行情源接口日期为格式化字符串；演示统一转成毫秒时间戳存储，按北京时间显示。没有原生税价依据时不显示“含税”或“未税”。

## 客户结算与采购记录

| 页面字段 | 观麦来源字段 | 口径 |
|---|---|---|
| 结算方式 | `pay_method` | 1 日结、2 周结、3 月结、4 自定义、5 半月结 |
| 收付款方式 | `settle_way` | 1 先货后款、2 先款后货 |
| 结算日期口径 | `settle_date_type` | 1 按下单日期、2 按收货日期 |
| 周期配置 | `begin_day`、`settle_day`、`cycle_length`、`delay_day`、`effective_date` | 来自 `UserPayMethod`，按所选结算方式显示配置，不统一改写成“对账后 N 天” |
| 客户购买分析订单数 / 销售额 / 下单额 | `/station_statistics/order/customers_analysis` 返回的 `data[].modelValues[].kv` 中 `old_order_id`、`account_price`、`order_price` | 总表按 `shop_id` 聚合；金额原值为元，不除以 100；默认近 30 天按 `order_time` 查询 |
| 最近订单 | `id`、`date_time_str`、`merchandise_count` | `/station/order/recent_order/get`，请求 `address_id`、`time_config_id` |
| 最近订单下单金额 / 出库金额 | `origin_total_price`、`sale_outstock_price` | 接口原值为元，不除以 100 |

购买分析本地保存为 `customerAnalysis[].kv`，外层客户标识、起止日期和时间口径仅是查询上下文。原生模型定义来自 `ceres/app/databi/internal/service/gm_preset_order.go`；`gm_statistics/grpc_client/client.py` 将列名去除 `_alias` 后形成 `kv`。不自造 `order_count`、`sale_amount`、`avg_order_amount` 响应字段，也不从最近订单计算平均金额。演示仅提供固定查询快照；其他区间或收货时间口径显示“未提供演示快照”。

最近订单的原生范围是近 90 天内最近 50 单，按下单时间倒序，排除删除订单与超时 / 退款关闭订单。`merchandise_count` 为明细数量，页面写“商品明细数”；不把它写成采购重量。最近订单不能替代客户完整购买分析的汇总来源。

## 客户协议价与报价单周期调价

| 页面字段 | 原生字段 / 来源 | 口径 |
|---|---|---|
| 协议规则名称与标识 | `/station/price_rule/index`、`/station/price_rule/edit` 的名称、规则 ID | 系统已配置价格规则，不等同于已签署合同 |
| 适用客户 | 原生 `addresses` | 本地适配为 `address_ids`；多个客户共用的规则只读查看，不自动拆分成当前客户的规则 |
| 对象类型 | `rule_object_type` | 1 SKU，2 二级分类，3 上浮率，4 整单折扣 |
| SKU 范围 | 原生 `skus[].id` | 本地适配为 `skus[].sku_id`，准确关联当前报价单商品 |
| 分类 / SPU / 整单范围 | `category_2_list[]`、`spus[]`、`change_rate` | 保留实际对象范围，原型不把所有规则伪装成 SKU 固定价 |
| 计算方式 | `rule_type`、`yx_price` | 0 固定值、1 加减值、2 倍数；金额为分；倍数使用百分数尺度，例如 95 显示 ×0.95 |
| 计算基准 | `price_type`、`locking_price_unit` | 正常报价单价 / 创价网行情 / 新发地平均、最高、最低价；基本单价锁价按原生基本单价路径处理，界面明确写出基准 |
| 计价单位 | `locking_price_unit` | 0 销售单价，1 基本单价；与 SKU 单位一起显示 |
| 有效日期 / 每日时段 | `begin`、`end`、`begin_time`、`end_time`、`time_limit` | 日期与每日时段分列；`time_limit=1` 跨午夜、2 非跨午夜，不把 1 当作全天 |
| 规则状态 | `status` | 0 关闭、1 无效、2 未开始、3 有效；展示原始状态，不从前端时钟擅自改状态 |
| 周期任务列表 | `/salemenu/cycle_pricing/search` | 报价单级任务，不是客户独占策略 |
| 任务名称 / 报价单 / 执行时间 | `rule_id`、`rule_name`、`salemenu_id`、`effective_time` | 只有 `rule_status=0` 的任务允许编辑名称和执行时间 |
| 周期任务状态 | `rule_status` | 0 未开始、1 已生效、2 已结束 |
| 执行结果与异常 | `task_result`、`abnormal_status` | 结果直接来自任务记录；异常 0 无异常、1 有异常。时间到达不等于执行成功 |
| 修改未开始任务 | `/salemenu/cycle_pricing/edit` | 本原型仅演示本地编辑；没有新建 Excel 导入任务流程 |

固定值与加减值的本地显示按各 SKU 币种处理；倍数与整单折扣不得套用金额分转元逻辑。不存在“同一个客户同一时刻只能有一套规则”的额外限制；冲突按原生客户、对象、商品范围和日期约束判断。

## 已移除的自建字段和本地边界

- 移除单位损耗重量、单位配送成本、自算毛利、客户跨单位采购总重量、推算采购频次、虚构配送要求。
- 移除市场新闻、微信 / 企业微信聊天原文、人工核实状态、勾选生效条件、条件快照。
- 移除 AI 倾向价 / 区间、助手报价版本、人工落实核验、客户独占策略、结束后自动恢复旧价格。
- “对话识别、调整预览、应用演示、选择范围、分页”是本地交互，不是新增的观麦业务字段或后端状态。
- 采用新的本地存储命名空间；旧演示记录留在浏览器原键下，不自动迁移为观麦对象。未提供值显示“—”，不补成 0。

## 核对入口

主要源码：`website/product/views/sku.py`、`website/product/views/customer_settle_prices.py`、`website/product/dals/customer_settle_prices.py`、`website/product/dals/sku_snapshot.py`、`common/ref_price.py`、`common/mysql/restaurant.py`、`common/mysql/models/customer_model.py`、`website/station/views/order.py`、`website/data_center/views/market_price.py`、`website/merchandise/views/spu_market_price.py`、`common/price_rule_status.py`、`website/station/price_rule/urls.py`、`website/salemenu/views/cycle_pricing.py`。
