import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const app = read("app.js");
const productHeaders = ["序号", "订单商品", "识别商品", "下单数", "出库数", "实收数", "差异数?", "备注"];
const afterSalesHeaders = ["序号", "商品", "出库数", "实收数", "售后类型", "售后原因", "售后数?", "操作"];
const pickerHeaders = ["选择", "商品", "出库数", "实收数"];

test("after-sales uses one concise shared heading in both receipt views", () => {
  for (const page of ["receipt-detail.html", "receipt-completed.html"]) {
    const html = read(page);
    assert.match(html, /class="after-sales-workbench-head">\s*<div><strong>售后<\/strong><\/div>/);
    assert.doesNotMatch(html, /<strong>商品售后<\/strong>/);
  }
  const workspace = functionSource("ensureInlineReceiptWorkspace");
  assert.doesNotMatch(workspace, /afterSalesTitle|<strong>售后<\/strong>/);
  assert.match(workspace, /<strong>商品核对<\/strong>/);
});

function tableMarkup(source, className) {
  const table = source.match(new RegExp(`<table class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)</table>`));
  assert.ok(table, `Missing ${className}`);
  return table[1];
}

function headers(table) {
  return [...table.matchAll(/<th\b[^>]*>(.*?)<\/th>/g)].map((match) =>
    match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim(),
  );
}

function functionSource(name) {
  const start = app.indexOf(`  function ${name}(`);
  assert.notEqual(start, -1, `Missing ${name}`);
  const next = app.indexOf("\n  function ", start + 1);
  return app.slice(start, next === -1 ? undefined : next);
}

for (const page of ["receipt-detail.html", "receipt-completed.html"]) {
  test(`${page}: static product and picker columns remain aligned`, () => {
    const html = read(page);
    const products = tableMarkup(html, "quantity-table");
    assert.deepEqual(headers(products), productHeaders);
    assert.deepEqual(headers(tableMarkup(html, "after-sales-product-options-table")), pickerHeaders);
    assert.match(products, /data-tooltip="差异数 = 出库数 - 实收数"/);
  });
}

test("dynamically rendered rows match the remaining table headers", () => {
  assert.deepEqual(headers(tableMarkup(app, "after-sales-flat-table")), afterSalesHeaders);
  for (const [name, expectedCount] of [
    ["renderOrderLine", productHeaders.length],
    ["renderAfterSalesWorkbenchRow", afterSalesHeaders.length],
    ["renderAfterSalesProductOptions", pickerHeaders.length],
  ]) {
    const source = functionSource(name);
    assert.equal([...source.matchAll(/<td\b/g)].length, expectedCount, name);
    assert.doesNotMatch(source, /data-variance/);
  }
});

test("difference and after-sales quantities use the outbound/actual calculation", () => {
  assert.match(functionSource("renderQuantityRows"), /colspan="8"/);
  assert.match(functionSource("updateQuantityRow"), /row\.dataset\.currentDiff = String\(difference\)/);
  assert.match(functionSource("updateQuantityRow"), /updateDifferenceCell\(row, difference\)/);
  assert.match(functionSource("updateQuantityRow"), /updateSignedQuantityWarning\(row, difference\)/);
  assert.match(functionSource("createAutomaticProductAfterSalesAction"), /afterSalesQuantity: Number\.isFinite\(difference\)/);
  assert.match(app, /售后数 = 差异数；正数表示多送，负数表示少送/);
});

test("completed receipt removes repeat-after-sales entry and uses concise actions", () => {
  const html = read("receipt-completed.html");
  assert.doesNotMatch(html, />继续售后<|>提交后续售后</);
  assert.match(html, /href="receipts\.html">取消<\/a>/);
  assert.match(html, /data-submit-after-sales>提交<\/button>/);
});
