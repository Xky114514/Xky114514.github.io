import fs from 'node:fs';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Za-z]):)/, '$1:'));
const tenantPages = [
  'home.html', 'chat-simulator.html', 'tasks.html', 'order-board.html',
  'task-detail.html', 'task-detail-single.html', 'customers.html', 'groups.html', 'group-detail.html',
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
  const required = ['图框联动识别', 'data-panel="auditBase"', 'detail-left-tab combined', 'data-link-row', 'qty-unit', 'price-box', '人工删除/不下单'];
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
  for (const marker of ['已新增商品；', '对应商品已删除，原图区域不再定位', '商品已删除；左侧来源保留']) {
    if (html.includes(marker)) interactionMarkers.push(`${file} -> 新增或删除商品不应弹出提示：${marker}`);
  }
}

const multiDetail = fs.readFileSync(path.join(dir, 'task-detail.html'), 'utf8');
for (const marker of ['2026.07.15_14.31.49.jpg', '人工新增', 'data-source-count="2"', 'SKU-LINK-0004', 'deletedItem', '李锦记蒸鱼豉油', '一次性手套', 'data-source-step="prev"', 'data-source-step="next"', 'data-unlinked="true"', '该原图区域暂无对应商品，请核对是否漏单', 'function sourceSequence(root)', 'function stepSource(root,direction)', '@keyframes sourceOrangeBreath', '@keyframes rowOrangeBreath', '@media(prefers-reduced-motion:reduce)']) {
  if (!multiDetail.includes(marker)) interactionMarkers.push(`task-detail.html -> ${marker}`);
}
const sourceBoxCount = (multiDetail.match(/<button class="source-box/g) || []).length;
if (sourceBoxCount < 11) interactionMarkers.push(`task-detail.html -> 原图标注框不足 11 个（当前 ${sourceBoxCount} 个）`);
const itemOrder = [...multiDetail.matchAll(/<tr data-link-row data-item="([^"]+)"/g)].map((match) => match[1]);
const expectedItemOrder = ['cabbage', 'soySauce', 'pepper', 'merged', 'oil', 'mushroom', 'radish', 'woodEar', 'glove', 'manual'];
if (expectedItemOrder.some((item, index) => itemOrder[index] !== item)) {
  interactionMarkers.push(`task-detail.html -> 商品默认顺序未按原图标框顺序生成：${itemOrder.slice(0, 10).join(', ')}`);
}

const tasksPage = fs.readFileSync(path.join(dir, 'tasks.html'), 'utf8');
for (const marker of ['业务场景', '人工修改后保留来源', '手动排序后保留来源', '人工新增商品无来源', '合单商品双来源切换', '已删除商品来源保留', '标记区域人工核对漏单']) {
  if (!tasksPage.includes(marker)) interactionMarkers.push(`tasks.html -> ${marker}`);
}
for (const marker of ['跨分组移动（稳定商品ID）', '复制商品不复制来源']) {
  if (tasksPage.includes(marker)) interactionMarkers.push(`tasks.html -> 不应显示 ${marker}`);
}

const settingsPage = fs.readFileSync(path.join(dir, 'settings.html'), 'utf8');
for (const marker of ['功能设置', '图框联动识别', 'data-feature-toggle', 'data-feature-list="group"', 'data-feature-list="customer"', 'data-feature-select-all="group"', 'data-feature-select-all="customer"', '搜索并添加群聊', '搜索并添加客户', '.feature-scope[hidden]']) {
  if (!settingsPage.includes(marker)) interactionMarkers.push(`settings.html -> ${marker}`);
}
for (const marker of ['功能能力：', '启用状态：', '规则说明：', '在订单审核详情页中，实现销售订单原图标注框与AI识别商品的双向定位。', '不使用群聊录单的客户']) {
  if (settingsPage.includes(marker)) interactionMarkers.push(`settings.html -> 不应显示 ${marker}`);
}

const result = { tenantPages: tenantPages.length, missingLinks, missingAssets, replacementChars, interactionMarkers, pageControls };
console.log(JSON.stringify(result, null, 2));
if (missingLinks.length || missingAssets.length || replacementChars.length || interactionMarkers.length) process.exitCode = 1;
