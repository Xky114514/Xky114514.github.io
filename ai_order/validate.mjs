import fs from 'node:fs';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Za-z]):)/, '$1:'));
const tenantPages = [
  'home.html', 'chat-simulator.html', 'tasks.html', 'order-board.html',
  'task-detail.html', 'task-detail-single.html', 'task-detail-standard.html', 'task-detail-normal.html', 'task-detail-normal-presplit.html', 'task-detail-normal-multigroup.html',
  'customers.html', 'groups.html', 'group-detail.html',
  'customer-groups.html', 'sku.html', 'prompts.html', 'memory.html',
  'stats.html', 'decision-dashboard.html', 'settings.html',
  'settings-replies.html', 'settings-channel-detail.html',
];

const missingLinks = [];
const missingAssets = [];
const replacementChars = [];
const interactionMarkers = [];
const pageControls = [];

for (const file of tenantPages) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  if (html.includes('\uFFFD')) replacementChars.push(file);

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1].split('#')[0];
    if (href && !/^(https?:|mailto:|javascript:)/.test(href) && !fs.existsSync(path.join(dir, href))) {
      missingLinks.push(`${file} -> ${href}`);
    }
  }

  for (const match of html.matchAll(/(?:src|poster)="([^"]+)"/g)) {
    const asset = match[1].split('#')[0];
    if (asset && !/^(https?:|data:|blob:)/.test(asset) && !fs.existsSync(path.join(dir, asset))) {
      missingAssets.push(`${file} -> ${asset}`);
    }
  }

  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    // Parse each inline prototype script without executing it.
    new Function(match[1]);
  }

  pageControls.push({
    file,
    buttons: (html.match(/<button/g) || []).length,
    fields: (html.match(/<(?:input|textarea)/g) || []).length,
    tables: (html.match(/<table/g) || []).length,
  });
}

for (const file of ['task-detail.html', 'task-detail-single.html']) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const required = ['data-panel="auditBase"', 'source-feature-bar compact', 'detail-left-tab combined', 'data-link-row', 'qty-unit', 'price-box', '人工删除/不下单', 'data-source-zoom="out"', 'data-source-zoom="reset"', 'data-source-zoom="in"', 'data-source-binary', 'data-source-image="corrected"', 'data-enhancement-state=', 'function setSourceImageView(root,view)', 'function refreshSourceEnhancement(root,source)', 'refreshSourceEnhancement(root,source)', '.source-enhance-chip[hidden]{display:none}', '.source-image-switch[hidden]{display:none}', '.source-canvas[data-image-view="original"] .source-box{display:none!important}', "e.target.closest('[data-source-view]')", 'function setSourceZoom(root,value)', 'function zoomSourceAt(root,value,clientX,clientY)', 'function centerSourceBox(root,box,autoZoom=false)', "document.addEventListener('wheel'", "document.addEventListener('pointerdown'", "document.addEventListener('pointermove'", "document.addEventListener('pointerup'", 'e.target.closest(\'.source-box\')', 'touch-action:none', 'cursor:grabbing!important', '.source-image-viewport.binary .source-canvas img', 'border:0!important', 'background:rgba(31,41,55,.42)!important', 'border:2px solid #0958d9!important', 'background:rgba(22,119,255,.42)!important', '@keyframes rowBlueBreath', 'background:linear-gradient(90deg,#fff,rgba(22,119,255,.2),#fff)!important'];
  const missing = required.filter((marker) => !html.includes(marker));
  if (missing.length) interactionMarkers.push(`${file} -> ${missing.join(', ')}`);
  if (html.includes('AI重新识别')) interactionMarkers.push(`${file} -> 不应包含 AI重新识别`);
  if (html.includes('<th>来源状态</th>')) interactionMarkers.push(`${file} -> 不应包含来源状态列`);
  if (!html.includes('.source-box-label{display:none!important}')) interactionMarkers.push(`${file} -> 标注框文字未隐藏`);
  if (html.includes('业务场景：')) interactionMarkers.push(`${file} -> 不应显示业务场景标签条`);
  if (html.includes('删除后右侧商品隐藏，左侧来源保留')) interactionMarkers.push(`${file} -> 不应显示删除说明`);
  if (html.includes('class="circle-history"')) interactionMarkers.push(`${file} -> 不应显示修改记录图标`);
  if (html.includes('data-subtab="auditSource"')) interactionMarkers.push(`${file} -> 定位来源不应作为独立标签页`);
  if (html.includes('data-link-degrade>模拟定位失败')) interactionMarkers.push(`${file} -> 不应显示模拟定位失败`);
  if (html.includes('<div class="source-statusbar"')) interactionMarkers.push(`${file} -> 不应显示来源说明栏`);
  if (html.includes('class="source-box modified')) interactionMarkers.push(`${file} -> 人工修改不应改变原图色块状态`);
  if (html.includes("classList.add('modified')")) interactionMarkers.push(`${file} -> 人工修改不应触发色块颜色变化`);
  if (html.includes("row.classList.add('is-dirty')")) interactionMarkers.push(`${file} -> 人工修改不应触发右侧行颜色变化`);
  if (html.includes('@keyframes rowOrangeBreath') || html.includes('@keyframes sourceOrangeBreath')) interactionMarkers.push(`${file} -> 不应保留旧的橙色呼吸动画`);
  if (html.includes('border:2px solid #fa8c16!important') || html.includes('background:rgba(255,77,79,.43)!important')) interactionMarkers.push(`${file} -> 左侧标注只能使用蓝白状态，不应出现橙色或红色`);
  if (html.includes("if(first)activateSource(root,first.dataset.item,1)")) interactionMarkers.push(`${file} -> 页面初始不应自动选中商品`);
  for (const marker of ['已新增商品；', '对应商品已删除，原图区域不再定位', '商品已删除；左侧来源保留']) {
    if (html.includes(marker)) interactionMarkers.push(`${file} -> 新增或删除商品不应弹出提示：${marker}`);
  }
}

const multiDetail = fs.readFileSync(path.join(dir, 'task-detail.html'), 'utf8');
for (const marker of ['2026.07.15_14.31.49.jpg', '人工新增', 'data-source-count="2"', 'SKU-LINK-0004', 'deletedItem', '李锦记蒸鱼豉油', '一次性手套', 'data-source-step="prev"', 'data-source-step="next"', 'data-unlinked="true"', '该原图区域暂无对应商品，请核对是否漏单', 'function sourceSequence(root)', 'function stepSource(root,direction)', 'class="source-enhance-chip"', 'data-enhancement-state="processed"', 'data-enhancement-state="none"', '>已自动校正</span>', '当前图片已进行倾斜校正，可切换查看原图和校正图。', 'aria-pressed="true">校正图</button>', 'aria-pressed="false">原图</button>', 'alt="自动校正后的订单图片"', 'alt="客户上传的订单原图"']) {
  if (!multiDetail.includes(marker)) interactionMarkers.push(`task-detail.html -> ${marker}`);
}
const multiDetailMarkup = multiDetail.split('<script>')[0];
if (multiDetailMarkup.includes('额外识别成本') || multiDetailMarkup.includes('额外计费')) interactionMarkers.push('task-detail.html -> 审核页面只提示实际校正结果，不应展示计费信息');
if (multiDetailMarkup.includes('source-link-label') || multiDetailMarkup.includes('>图框联动识别</span>')) interactionMarkers.push('task-detail.html -> 图框联动为默认能力，审核页不应显示功能标题');
const singleDetail = fs.readFileSync(path.join(dir, 'task-detail-single.html'), 'utf8');
if (!singleDetail.includes('data-enhancement-state="none"')) interactionMarkers.push('task-detail-single.html -> 未使用自动校正时应记录 none 状态');
const singleDetailMarkup = singleDetail.split('<script>')[0];
if (singleDetailMarkup.includes('<span class="source-enhance-chip" data-source-enhancement-chip') || singleDetailMarkup.includes('<div class="source-image-switch" data-source-view-switch') || singleDetailMarkup.includes('<img data-source-image="original"')) interactionMarkers.push('task-detail-single.html -> 未使用自动校正时不应渲染校正标签、切换或对照图');
if (singleDetailMarkup.includes('source-link-label') || singleDetailMarkup.includes('>图框联动识别</span>')) interactionMarkers.push('task-detail-single.html -> 图框联动为默认能力，审核页不应显示功能标题');
const standardDetail = fs.readFileSync(path.join(dir, 'task-detail-standard.html'), 'utf8');
const standardDetailMarkup = standardDetail.split('<script>')[0];
const standardDetailBody = standardDetailMarkup.split('</style>')[1] || standardDetailMarkup;
for (const marker of ['class="detail-layout linked-detail standard-linked-detail"', 'data-enhancement-state="none"', 'data-link-row', 'data-source-zoom="out"', 'data-source-zoom="reset"', 'data-source-zoom="in"', 'data-source-binary', '大白菜', '李锦记蒸鱼豉油', '油麦菜', '香菇', '白萝卜', '木耳', '一次性手套', '7 个商品', '¥560.60']) {
  if (!standardDetail.includes(marker)) interactionMarkers.push(`task-detail-standard.html -> ${marker}`);
}
for (const marker of ['已自动校正', 'data-source-view-switch', '<img data-source-image="original"', '人工新增', 'data-source-count="2"', 'data-unlinked="true"', '人工删除/不下单']) {
  if (standardDetailBody.includes(marker)) interactionMarkers.push(`task-detail-standard.html -> 基础多商品示例不应包含特殊场景：${marker}`);
}
const standardBoxCount = (standardDetailMarkup.match(/<button class="source-box/g) || []).length;
if (standardBoxCount !== 7) interactionMarkers.push(`task-detail-standard.html -> 应展示 7 个常规商品标框（当前 ${standardBoxCount} 个）`);
const standardRowCount = (standardDetailMarkup.match(/<tr data-link-row/g) || []).length;
if (standardRowCount !== 7) interactionMarkers.push(`task-detail-standard.html -> 应展示 7 个常规商品行（当前 ${standardRowCount} 个）`);
const sourceBoxCount = (multiDetail.match(/<button class="source-box/g) || []).length;
if (sourceBoxCount < 11) interactionMarkers.push(`task-detail.html -> 原图标注框不足 11 个（当前 ${sourceBoxCount} 个）`);
const itemOrder = [...multiDetail.matchAll(/<tr data-link-row data-item="([^"]+)"/g)].map((match) => match[1]);
const expectedItemOrder = ['cabbage', 'soySauce', 'pepper', 'merged', 'oil', 'mushroom', 'radish', 'woodEar', 'glove', 'manual'];
if (expectedItemOrder.some((item, index) => itemOrder[index] !== item)) {
  interactionMarkers.push(`task-detail.html -> 商品默认顺序未按原图标框顺序生成：${itemOrder.slice(0, 10).join(', ')}`);
}

const tasksPage = fs.readFileSync(path.join(dir, 'tasks.html'), 'utf8');
for (const marker of ['业务场景', '多商品图框联动', 'href="task-detail-standard.html"', '大白菜100斤、蒸鱼豉油3瓶、油麦菜13斤等7个商品', '人工修改后保留来源', '手动排序后保留来源', '人工新增商品无来源', '合单商品双来源切换', '已删除商品来源保留', '标记区域人工核对漏单']) {
  if (!tasksPage.includes(marker)) interactionMarkers.push(`tasks.html -> ${marker}`);
}
for (const marker of ['跨分组移动（稳定商品ID）', '复制商品不复制来源']) {
  if (tasksPage.includes(marker)) interactionMarkers.push(`tasks.html -> 不应显示 ${marker}`);
}

const settingsPage = fs.readFileSync(path.join(dir, 'settings.html'), 'utf8');
const settingsMarkup = settingsPage.split('<script>')[0];
for (const marker of ['订单可见范围', '仅自己负责及未分配订单', '全部订单', '现有模式', '新模式', '仅管理员可修改', '订单可见范围设置已保存']) {
  if (!settingsPage.includes(marker)) interactionMarkers.push(`settings.html -> 订单可见范围缺少 ${marker}`);
}
for (const marker of ['功能设置', 'class="feature-static-line"', '图框联动识别', '在订单审核详情中，将原图标注区域与识别商品进行双向定位。该功能对全部客户和群聊开放。', '倾斜图片自动校正', '自动校正倾斜、旋转或透视变形的订单图片，并基于校正后的图片进行识别。可单独指定适用客户和群聊。', 'data-help-tip', 'data-help-trigger', 'role="tooltip"', 'aria-expanded="false"', '.feature-help-tip:hover .feature-help-pop', 'data-tilt-toggle', 'data-tilt-scope', '选择自动校正的适用客户和群聊', 'data-tilt-selected-scope', 'data-tilt-list="group"', 'data-tilt-list="customer"', 'class="tilt-choice-select"', 'data-tilt-add="group"', 'data-tilt-add="customer"', '搜索并选择群聊...', '搜索并选择客户...', "e.target.closest('[data-tilt-add]')", '已加入自动校正范围', 'data-combined-feature-save', '请至少选择一个自动校正适用对象', 'AI录单测试群-BD', '潭文测试邮件群', '城隍阁', '张三超市']) {
  if (!settingsPage.includes(marker)) interactionMarkers.push(`settings.html -> ${marker}`);
}
const featureCardCount = (settingsPage.match(/class="feature-settings feature-settings-card" data-feature-settings/g) || []).length;
if (featureCardCount !== 1) interactionMarkers.push(`settings.html -> 图框联动与倾斜图片自动校正应合并为 1 个功能卡片（当前 ${featureCardCount} 个）`);
if (!settingsPage.includes('class="switch" data-tilt-toggle aria-label="启用倾斜图片自动校正"')) interactionMarkers.push('settings.html -> 倾斜图片自动校正应作为默认关闭的子功能');
for (const marker of ['class="tilt-choice-title-actions"', 'data-tilt-all="group"', 'data-tilt-all="customer"', '适用全部群聊', '适用全部客户', 'data-tilt-subset="group"', 'data-tilt-subset="customer"', 'class="tilt-choice-remove"', 'data-tilt-remove', '暂无已选对象', 'function tiltSelectedRow(value,label,type)', 'function refreshTiltSelection(root)', "e.target.closest('[data-tilt-all]')", "e.target.closest('[data-tilt-remove]')", "count.textContent=allEnabled?'全部':choices.length+'/'+options.length", "document.querySelectorAll('[data-feature-settings]').forEach(refreshTiltSelection)"]) {
  if (!settingsPage.includes(marker)) interactionMarkers.push(`settings.html -> 全部对象开关或指定对象设置缺少 ${marker}`);
}
const tiltAllSwitchCount = (settingsMarkup.match(/data-tilt-all="(?:group|customer)"/g) || []).length;
if (tiltAllSwitchCount !== 2) interactionMarkers.push(`settings.html -> 群聊与客户应各有 1 个全部对象开关（当前 ${tiltAllSwitchCount} 个）`);
for (const marker of ['data-tilt-select-all', '>全选</button>', '>清空</button>', '额外计费', '额外识别成本', '计费规则待定']) {
  if (settingsMarkup.includes(marker)) interactionMarkers.push(`settings.html -> 不应保留旧范围或计费内容：${marker}`);
}
for (const choice of settingsMarkup.matchAll(/<div class="tilt-choice"[\s\S]*?<\/div>/g)) {
  if (choice[0].includes('class="checkbox"')) interactionMarkers.push('settings.html -> 已选客户或群聊不应继续显示 checkbox');
}
for (const marker of ['data-split-feature', '群聊拆单', '管理群聊拆单设置', 'data-split-feature-enabled-count', 'id="splitGroupManagerModal"', 'id="splitGroupConfigModal"', 'id="splitGroupRuleModal"', 'data-split-group-search', 'data-split-group-row', 'data-split-group-config', 'refreshSplitFeatureCount', 'openSplitGroupConfig', 'splitPlanSelectedRow', 'refreshSplitPlanGroups']) {
  if (settingsMarkup.includes(marker)) interactionMarkers.push(`settings.html -> 群聊拆单已迁回群聊详情，不应保留 ${marker}`);
}
for (const marker of ['<div class="feature-description">', '<div class="subfeature-help">', '<div class="feature-cost-note">']) {
  if (settingsPage.includes(marker)) interactionMarkers.push(`settings.html -> 说明文字应收纳到问号提示中，不应常驻显示：${marker}`);
}
for (const marker of ['功能能力：', '启用状态：', '规则说明：', '在订单审核详情页中，实现销售订单原图标注框与AI识别商品的双向定位。', '不使用群聊录单的客户', '基础适用范围', '基础功能·不增加成本', '全部客户和群聊均可使用', '无需配置适用范围', '增强功能·增加成本', '图框联动基础功能始终对全部客户和群聊开放', 'aria-label="图框联动识别已对全部客户和群聊开放"', '与图框联动范围一致', '指定部分范围', 'data-feature-toggle', 'data-feature-selected-scope', 'data-feature-list="group"', 'data-feature-list="customer"']) {
  if (settingsMarkup.includes(marker)) interactionMarkers.push(`settings.html -> 不应显示 ${marker}`);
}
for (const file of ['settings.html', 'task-detail.html', 'task-detail-single.html']) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const marker of ['倾斜图片增强识别', '倾斜图片增强', '>倾斜增强</span>', '增强未完成', '图片校正未完成', '自动校正未完成', '已按原图识别']) {
    if (html.includes(marker)) interactionMarkers.push(`${file} -> 旧命名未替换：${marker}`);
  }
}

for (const file of ['customers.html', 'groups.html', 'customer-groups.html', 'group-detail.html']) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const marker of ['class="t-nav-flyout"', 'role="menu"', 'href="customers.html"', 'href="groups.html"', 'href="customer-groups.html"', '客户管理', '群聊管理', '客户分组']) {
    if (!html.includes(marker)) interactionMarkers.push(`${file} -> 客户域菜单缺少 ${marker}`);
  }
}

const customersPage = fs.readFileSync(path.join(dir, 'customers.html'), 'utf8');
for (const marker of ['>客户便签</th>', 'class="customer-note-cell"', 'class="customer-note-edit-btn"', '暂无便签', 'data-customer-note-text', 'data-customer-note-edit', 'id="customerNoteEdit"', 'data-customer-note-editor', 'data-customer-note-limit="150"', 'placeholder="请输入客户便签，记录备忘信息"', '最多150字，每行最多20字；编辑内容即时保存。', 'function openCustomerNoteEditor(trigger)', 'function saveCustomerNote(modal,value)']) {
  if (!customersPage.includes(marker)) interactionMarkers.push(`customers.html -> 客户便签缺少 ${marker}`);
}
if (customersPage.includes('客户备忘')) interactionMarkers.push('customers.html -> 应统一使用“客户便签”，不应保留“客户备忘”');

for (const file of ['task-detail.html', 'task-detail-single.html', 'task-detail-standard.html', 'task-detail-normal.html', 'task-detail-normal-presplit.html', 'task-detail-normal-multigroup.html']) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const marker of ['class="order-info-layout"', 'class="order-info-main"', 'class="customer-note-card"', 'class="customer-note-display-btn"', 'aria-expanded="false"', '>显示全部</button>', 'data-customer-note-input', 'data-customer-note-display', 'data-customer-note-limit="150"', 'placeholder="请输入客户便签，记录备忘信息"', 'class="customer-note-empty-action"', 'data-customer-note-empty', 'aria-label="添加客户便签"', 'title="添加客户便签"', '<path d="M6 3.5h9l3 3V20H6zM15 3.5V7h3M9 11h6M9 15h5"/>', 'function normalizeCustomerNote(value=', 'function syncCustomerNoteEmptyState(card,editing=false)', 'function toggleCustomerNoteDisplay(trigger)', '.customer-note-card.is-expanded', '.customer-note-card.is-empty textarea', 'overflow-y:auto', '.delivery-row .gm-recommend{margin-left:0}', 'grid-template-columns:minmax(560px,1fr) 380px', 'width:380px', 'color:var(--text)']) {
    if (!html.includes(marker)) interactionMarkers.push(`${file} -> 销售录单客户便签缺少 ${marker}`);
  }
  if (html.includes('客户备忘')) interactionMarkers.push(`${file} -> 应统一使用“客户便签”，不应保留“客户备忘”`);
  if (html.includes('GM推荐')) interactionMarkers.push(`${file} -> 推荐时间文案应使用“推荐”，不应保留“GM推荐”`);
  if (html.includes('customer-note-card-head') || html.includes('id="customerNotePreview"')) interactionMarkers.push(`${file} -> 销售录单客户便签不应保留标题栏或弹窗预览`);
  if (html.includes('暂无便签，点击添加')) interactionMarkers.push(`${file} -> 空便签状态不应保留强提示文案`);
  const bodyMarkup = html.split('<script>')[0];
  const infoIndex = bodyMarkup.indexOf('class="order-info-layout"');
  const tableIndex = bodyMarkup.indexOf('class="x-table-wrap"');
  if (infoIndex < 0 || tableIndex < 0 || infoIndex > tableIndex) interactionMarkers.push(`${file} -> 客户便签双栏基础信息区应位于商品表格上方`);
}

const groupsPage = fs.readFileSync(path.join(dir, 'groups.html'), 'utf8');
if (!groupsPage.includes('href="group-detail.html"')) interactionMarkers.push('groups.html -> 群聊列表缺少群聊详情入口');

const promptsPage = fs.readFileSync(path.join(dir, 'prompts.html'), 'utf8');
for (const marker of ['data-subtab="customerView"', '>客户视图</button>', 'data-panel="customerView"', '已配置客户', '订单解析提示词', '意图识别提示词', '启用模板数', 'data-prompt-customer-search', 'S3866318', '城隍阁', '特殊模板格式', 'function toast(s)', "e.target.closest('[data-prompt-customer-search]')"]) {
  if (!promptsPage.includes(marker)) interactionMarkers.push(`prompts.html -> 客户视图缺少 ${marker}`);
}

const groupDetailPage = fs.readFileSync(path.join(dir, 'group-detail.html'), 'utf8');
for (const marker of ['华南小学订单群', '成员数', '绑定客户', '机器人发言', '下单时段', '审核员', 'data-subtab="groupCustomers"', 'data-subtab="groupMembers"', 'data-subtab="groupSplit"', '客户列表', '群成员', '>拆单设置</button>', 'data-panel="groupSplit"', 'class="group-split-panel"', '<span>启用拆单</span>', '查看拆单适用范围', '订单只有一个原始分组时可按设置执行；存在多个原始分组时需逐组确认是否拆单，不支持全部确认下单。', '执行时间', '审核前自动拆单', '订单进入审核前，系统依据已配置规则自动生成订单分组。', '确认下单时选择', '订单审核完成后，由审核人员选择是否执行拆单。', '商品分类拆单规则', 'data-split-timing="before"', 'data-split-timing="confirm"', 'data-modal="splitGroupRuleModal"', 'id="splitGroupRuleModal"', 'data-category-check', '继承当前群聊绑定客户', '当前群聊的拆单设置已保存', 'S3877081', 'S3883292', 'S3877082', 'S3886664', 'wxid_oik8mjxu2ogw21', 'wxid_bv3uqcdttaj22']) {
  if (!groupDetailPage.includes(marker)) interactionMarkers.push(`group-detail.html -> ${marker}`);
}
if (!groupDetailPage.includes('class="btn link red" data-row-remove')) interactionMarkers.push('group-detail.html -> 客户删除操作不可交互');
const groupDetailMarkup = groupDetailPage.split('<script>')[0];
for (const marker of ['class="group-split-status"', 'href="settings.html#function"', '前往功能设置', '管理群聊拆单设置', '拆单方案', '学校客户分类拆单', '仅影响当前群聊的正常订单', '何时执行拆单']) {
  if (groupDetailMarkup.includes(marker)) interactionMarkers.push(`group-detail.html -> 群聊内直接配置拆单，不应保留 ${marker}`);
}

const normalTasksPage = fs.readFileSync(path.join(dir, 'tasks.html'), 'utf8');
for (const marker of ['href="task-detail-normal.html"', 'href="task-detail-normal-presplit.html"', 'href="task-detail-normal-multigroup.html"', '正常订单·确认时拆单', '正常订单·审核前拆单', '正常订单·多分组逐组拆单', '已有2个原始分组，确认下单时需逐组选择是否拆单']) {
  if (!normalTasksPage.includes(marker)) interactionMarkers.push(`tasks.html -> 正常订单示例缺少 ${marker}`);
}

for (const file of ['task-detail-normal.html', 'task-detail-normal-presplit.html']) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const marker of ['华南中心小学（老师）', '一次性餐盒', '可口可乐', '五常大米', '不锈钢菜刀', '鲜鸡蛋', '订单分组 1', '订单分组 4', '¥1,769.00', 'class="detail-layout normal-order-detail', 'normal-audit-left', 'normal-audit-right', '基本信息', '群聊消息', 'assets/order-source.jpg', '原始消息', 'normal-order-group-head', '识别文本', '数量 / 单位', 'data-normal-final', 'data-normal-submit-group', 'data-normal-submit-count', 'data-normal-item=', 'data-normal-field=', 'data-normal-group-only', '确认下单', '全部确认下单']) {
    if (!html.includes(marker)) interactionMarkers.push(`${file} -> ${marker}`);
  }
  if (html.includes('class="detail-layout linked-detail"')) interactionMarkers.push(`${file} -> 正常订单示例不应使用图框联动详情结构`);
  const bodyMarkup = html.split('<script>')[0];
  if (bodyMarkup.includes('<button class="source-box')) interactionMarkers.push(`${file} -> 正常订单左侧不应出现图框联动标注框`);
  const pageMarkup = bodyMarkup.split('<body>')[1] || bodyMarkup;
  for (const marker of ['<span class="tag blue">正常订单</span>', '<span class="tag green">确认下单时询问</span>', '<span class="tag purple">审核前自动拆单</span>', 'class="normal-flow-note"', '完整订单·尚未拆单']) {
    if (pageMarkup.includes(marker)) interactionMarkers.push(`${file} -> 应删除红框内容：${marker}`);
  }
}
const confirmSplitPage = fs.readFileSync(path.join(dir, 'task-detail-normal.html'), 'utf8');
for (const marker of ['订单已核对完成，请选择是否拆单。', 'id="normalSplitConfirm"', 'class="modal normal-split-modal"', 'data-normal-confirm="group"', 'data-normal-confirm="all"', 'data-normal-split-choice="no"', 'data-normal-split-choice="yes"', 'aria-pressed="false"', 'data-normal-split-next disabled', '>下一步</button>', 'modal.dataset.splitChoice=\'\'', "modal.querySelector('[data-normal-split-next]').disabled=false", '<strong>拆单预览</strong>', '已生成当前订单组的拆单预览', '已按原订单组分别生成拆单预览', "final.textContent=remaining?'全部确认下单':'已全部提交'", 'function openNormalSplitModal(trigger)', 'function refreshNormalSubmitState(root)', 'function normalInputKey(input)', 'function syncNormalPreviewFromOriginal(root)', 'function submitNormalOriginal(root,scope,sourceGroup)', 'function enterNormalSplitPreview(root,scope,sourceGroup)']) {
  if (!confirmSplitPage.includes(marker)) interactionMarkers.push(`task-detail-normal.html -> ${marker}`);
}
const confirmSplitMarkup = confirmSplitPage.split('<script>')[0];
const confirmSplitBody = confirmSplitMarkup.split('</style>')[1] || confirmSplitMarkup;
for (const marker of ['当前群聊设置为', '保持当前完整订单，不生成订单分组并直接提交。', '暂不提交，先按现有分类规则生成 4 个订单分组供再次核对。', 'class="normal-confirm-scope"', 'data-normal-scope-title', 'data-normal-scope-copy', '全部未提交订单</b>', '拆单时按原订单组逐组应用分类规则，不跨原订单组合并。', 'class="tag green">规则：']) {
  if (confirmSplitMarkup.includes(marker)) interactionMarkers.push(`task-detail-normal.html -> 拆单弹窗不应显示说明：${marker}`);
}
for (const marker of ['>按规则拆单</strong>', '确认本组', '>提交本组</button>', '确认全部 4 组并下单', '拆单预览 · 尚未提交', '当前页面已完整展示拆单结果', '可提交单个订单组', 'data-normal-preview-panel', 'data-normal-preview-back', 'data-normal-preview-review', '进入订单组核对', '拆单异常说明']) {
  if (confirmSplitMarkup.includes(marker)) interactionMarkers.push(`task-detail-normal.html -> 应使用拆单预览流程，不应保留旧入口：${marker}`);
}
for (const marker of ['data-normal-direct', 'data-normal-preview', 'id="normalReturnConfirm"', 'data-normal-back', '返回完整订单', '继续预览', '保留修改并返回']) {
  if (confirmSplitBody.includes(marker)) interactionMarkers.push(`task-detail-normal.html -> 拆单选择或预览页不应保留旧交互：${marker}`);
}
const preSplitPage = fs.readFileSync(path.join(dir, 'task-detail-normal-presplit.html'), 'utf8');
for (const marker of ['pre-split', '拆单待确认']) {
  if (!preSplitPage.includes(marker)) interactionMarkers.push(`task-detail-normal-presplit.html -> ${marker}`);
}
const multiGroupPage = fs.readFileSync(path.join(dir, 'task-detail-normal-multigroup.html'), 'utf8');
for (const marker of ['multi-original', '订单1组 · 食堂补给', '订单2组 · 小卖部补给', '0/2 组已提交', 'data-normal-original-group="1"', 'data-normal-original-group="2"', 'class="normal-multi-group-note"', '当前订单包含 2 个原始分组，需逐组确认是否拆单；暂不支持全部确认下单。', 'data-normal-confirm="group"', 'data-normal-all-disabled', 'disabled aria-disabled="true" title="多分组订单需逐组确认是否拆单"', '客户下单时已明确分为两个订单组。', '当前配置为确认下单时选择拆单，需逐个原始分组确认。', 'id="normalSplitConfirm"', '当前原始分组拆单预览', 'data-normal-source-group="1"', 'data-normal-source-group="2"', '订单1组 · 西餐用品', '订单2组 · 饮料', 'function completeNormalMultiGroupPreview(root)', "root.classList.remove('split-preview')", "const multiSource=root.classList.contains('multi-original')?root.dataset.previewSourceGroup:''", '当前原始分组已完成，请继续处理其他订单组', '全部原始分组已确认下单']) {
  if (!multiGroupPage.includes(marker)) interactionMarkers.push(`task-detail-normal-multigroup.html -> ${marker}`);
}
const multiGroupMarkup = multiGroupPage.split('<script>')[0];
for (const marker of ['class="detail-layout normal-order-detail', 'normal-audit-left', 'normal-audit-right', '基本信息', '群聊消息', 'assets/order-source.jpg', '原始消息', 'normal-order-group-head', '识别文本', '数量 / 单位', 'data-normal-submit-count', 'data-normal-item=', 'data-normal-field=', 'data-normal-group-only', '确认下单', '全部确认下单']) {
  if (!multiGroupPage.includes(marker)) interactionMarkers.push(`task-detail-normal-multigroup.html -> ${marker}`);
}
if (multiGroupMarkup.includes('data-normal-confirm="all"') || multiGroupMarkup.includes('data-normal-existing-confirm="all"')) interactionMarkers.push('task-detail-normal-multigroup.html -> 多原始分组不应提供可用的全部确认入口');
if ((multiGroupMarkup.match(/data-normal-confirm="group"/g) || []).length !== 2) interactionMarkers.push('task-detail-normal-multigroup.html -> 应为两个原始分组分别提供确认下单入口');
if ((multiGroupMarkup.match(/data-normal-all-disabled/g) || []).length !== 1) interactionMarkers.push('task-detail-normal-multigroup.html -> 全部确认下单应保持禁用');
if ((multiGroupMarkup.match(/data-normal-source-group="1"/g) || []).length !== 3) interactionMarkers.push('task-detail-normal-multigroup.html -> 订单1组应展示3个拆单预览分组');
if ((multiGroupMarkup.match(/data-normal-source-group="2"/g) || []).length !== 2) interactionMarkers.push('task-detail-normal-multigroup.html -> 订单2组应展示2个拆单预览分组');
if (multiGroupPage.includes('class="detail-layout linked-detail"')) interactionMarkers.push('task-detail-normal-multigroup.html -> 正常订单示例不应使用图框联动详情结构');
if (multiGroupMarkup.includes('<button class="source-box')) interactionMarkers.push('task-detail-normal-multigroup.html -> 正常订单左侧不应出现图框联动标注框');
const multiOriginalCount = (multiGroupMarkup.match(/data-normal-original-group="(?:1|2)"/g) || []).length;
if (multiOriginalCount !== 2) interactionMarkers.push(`task-detail-normal-multigroup.html -> 应展示 2 个原始订单组（当前 ${multiOriginalCount} 个）`);

for (const file of ['task-detail.html', 'task-detail-single.html', 'task-detail-standard.html', 'task-detail-normal.html', 'task-detail-normal-presplit.html', 'task-detail-normal-multigroup.html']) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const marker of ['data-modal="customFieldModal"', 'id="customFieldModal"', 'class="modal custom-field-modal"', '自定义字段设置', '配置录单系统已有字段和自定义字段', '可选字段', '已显示字段', '拖拽调整展示顺序', '录单系统已有字段', '<div class="custom-field-group-title"><span>自定义字段</span>', 'SPU 名称', '商品编码', '一级分类', '二级分类', '自定义编码', '报价单', '品牌', '产地', '商品等级', '包装规格', '包装方式', '保质期', '储存方式', '客户商品编码', '供应商商品编码', '配送温层', '加工要求', '称重方式', '税率', '批次要求', '质检要求', '生产日期', '有效期至', '商品备注', 'data-field-id="system-spu"', 'data-field-id="system-product-code"', 'data-field-id="system-category-1"', 'data-field-id="system-category-2"', 'data-field-id="system-custom-code"', 'data-field-id="system-quotation"', 'data-field-source="system"', 'data-field-source="guanmai"', 'data-custom-field-search', 'data-custom-field-choice', 'data-custom-field-selected-list', 'draggable="true"', 'data-custom-field-reset', 'data-custom-field-save', 'data-custom-field-table', 'function customFieldCellValue(row,rowIndex,field)', 'function applyCustomFieldColumns(modal)', 'custom-field-input', "table.style.width=tableWidth+'px'", "document.addEventListener('dragstart'", '字段设置已保存，商品列表顺序已更新']) {
    if (!html.includes(marker)) interactionMarkers.push(`${file} -> 自定义字段设置缺少 ${marker}`);
  }
  const modalCount = (html.match(/id="customFieldModal"/g) || []).length;
  if (modalCount !== 1) interactionMarkers.push(`${file} -> 自定义字段弹窗应只有 1 个（当前 ${modalCount} 个）`);
  const bodyMarkup = html.split('<script>')[0];
  if (bodyMarkup.includes('<th>SPU 名称</th>')) interactionMarkers.push(`${file} -> SPU 名称应由字段设置动态控制，不应保留固定表头`);
  const customGroupMarker = '<div class="custom-field-group-title"><span>自定义字段</span>';
  if (bodyMarkup.indexOf('录单系统已有字段') > bodyMarkup.indexOf(customGroupMarker)) interactionMarkers.push(`${file} -> 录单系统已有字段应排在自定义字段之前`);
  for (const marker of ['观麦同步的用户自定义字段', '演示字段', 'class="custom-field-source']) {
    if (bodyMarkup.includes(marker)) interactionMarkers.push(`${file} -> 自定义字段弹窗不应显示旧内容：${marker}`);
  }
  for (const marker of ['共 <b>24</b> 个字段', 'data-custom-field-count', '<small>6 个</small>', '<small>18 个</small>']) {
    if (bodyMarkup.includes(marker)) interactionMarkers.push(`${file} -> 自定义字段弹窗不应显示数量信息：${marker}`);
  }
}

const result = { tenantPages: tenantPages.length, missingLinks, missingAssets, replacementChars, interactionMarkers, pageControls };
console.log(JSON.stringify(result, null, 2));
if (missingLinks.length || missingAssets.length || replacementChars.length || interactionMarkers.length) process.exitCode = 1;
