# 报价助手在线原型

- 网站首页：https://xky114514.github.io/ （自动跳转至报价助手）
- 应用地址：https://xky114514.github.io/quotation-pricing/
- 发布分支：`quotation_Pricing`

原型用于配送业务报价：支持客户与报价单多对多、客户协议调价、共享报价单标准价调整、预约调价，以及采购、历史报价、行情和客户资料查询。界面采用对话与列表，商品支持搜索、分页和跨页批选。

**全部数据为演示数据。没有连接观麦后端、真实 AI 或任务执行队列。** 本地保存仅作用于当前浏览器；演示业务时间固定为 2026-09-30 10:00（北京时间）。

## 文件与使用说明

- [`quotation-pricing/README.md`](quotation-pricing/README.md)：业务背景、试用流程和构建方式。
- [`quotation-pricing/docs/requirements-v2.md`](quotation-pricing/docs/requirements-v2.md)：精简需求说明。
- [`quotation-pricing/docs/guanmai-fields.md`](quotation-pricing/docs/guanmai-fields.md)：观麦字段及业务口径。
- [`quotation-pricing/docs/user-trial.md`](quotation-pricing/docs/user-trial.md)：试用与验证记录。
- `quotation-pricing/src/`、`scripts/`、`tests/`：源码、构建脚本与逻辑验证。

## 发布

在 `quotation-pricing/` 中修改源码后运行 `python scripts/build.py`，按应用 README 运行验证，将源码、生成的 HTML 和文档一并提交到 `quotation_Pricing` 分支。GitHub Pages 从该分支根目录发布，部署成功后更新网站。

根目录 `index.html` 仅负责跳转到 `quotation-pricing/`。原根目录的其他平台文件保留在仓库中；如需恢复旧首页，可从 Git 历史找回。
