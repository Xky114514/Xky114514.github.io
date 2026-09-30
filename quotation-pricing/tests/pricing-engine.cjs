const assert = require('node:assert/strict');
global.window = global;
require('../src/gm-data.js');
const E = require('../src/gm-engine.js');
const NOW = '2026-09-30T10:00';
const seed = () => GMD.seed();
const ctx = (scope = 'customer', customerId = 'A1', quoteId = 'Q1') => ({customerId, quoteId, scope, generation: 1});
const spec = (ids, extra = {}) => ({ids, operation: 'percent', value: 10, base: 'quote', begin: '2026-09-01', end: '2026-10-31', begin_time: '00:00', end_time: '23:59', time_limit: 2, ...extra});
let count = 0;
function test(name, fn) { fn(); count++; process.stdout.write(`PASS ${name}\n`); }
test('many-to-many customer and quote scope', () => {
  const db = seed();
  assert.deepEqual(E.linkedQuotes(db, 'A1').map(q => q.id), ['Q1', 'Q2']);
  assert.equal(E.linkedCustomers(db, 'Q1').length, 3);
  assert.equal(E.quoteSkus(db, 'Q1').length, 300);
  assert.equal(E.resolve(db, 'A1', 'Q3-SKU0001').strategy, 'missing');
  assert.notEqual(E.resolve(db, 'A1', 'Q1-SKU0001').settle_price, E.resolve(db, 'A1', 'Q2-SKU0001').settle_price);
});
test('native price strategy priority and timing semantics', () => {
  const db = seed();
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0001').settle_price, 500);
  const stepped = E.resolve(db, 'A1', 'Q1-SKU0002');
  assert.equal(stepped.strategy, 'step'); assert.equal(stepped.requires_quantity, true); assert.equal(stepped.settle_price, 640);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0002', 20).settle_price, 610);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0002', 50).settle_price, 590);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0003').settle_price, null);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0003').strategy, 'timing');
  db.rules.push({...db.rules[0], id: 'timingrule', skus: [{sku_id: 'Q1-SKU0003', rule_type: 0, yx_price: 1200}]});
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0003').settle_price, 1200);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0003').is_time_priced, true);
});
test('native fixed / variation / multiple and basic-unit conversion', () => {
  const db = seed();
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0004').settle_price, 740);
  assert.equal(E.resolve(db, 'A2', 'Q1-SKU0004').settle_price, 722);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0005').settle_price, 550);
  assert.equal(E.resolve(db, 'A3', 'Q1-SKU0008').settle_price, 4500);
  assert.equal(E.resolve(db, 'A1', 'Q2-SKU0011').settle_price, 1213);
  assert.equal(E.resolve(db, 'A2', 'Q3-SKU0011').strategy, 'unsupported');
});
test('cross-midnight source behavior and backend statuses', () => {
  const db = seed();
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0007', null, {now: '2026-09-01T05:00'}).strategy, 'normal');
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0007', null, {now: '2026-09-01T22:00'}).settle_price, 550);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0007', null, {now: '2026-09-02T05:00'}).settle_price, 550);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0007', null, {now: '2026-09-02T10:00'}).strategy, 'normal');
  assert.equal(E.resolve(db, 'A3', 'Q4-SKU0001', null, {now: '2026-10-02T10:00'}).strategy, 'normal');
});
test('customer floating rule changes only customer and creates native values', () => {
  const db = seed(), c = ctx(), p = E.makePlan(db, c, spec(['Q1-SKU0001']), NOW);
  assert.equal(p.ok, true); assert.equal(p.rows[0].rule_type, 2); assert.equal(p.rows[0].yx_price, 110);
  assert.equal(E.applyPlan(db, p, c, NOW).ok, true);
  assert.equal(E.resolve(db, 'A1', 'Q1-SKU0001').settle_price, 550);
  assert.equal(E.resolve(db, 'A3', 'Q1-SKU0001').settle_price, 500);
  assert.equal(db.skus[0].sale_price, 500);
});
test('current customer basis becomes fixed one-time price', () => {
  const db = seed(), c = ctx(), p = E.makePlan(db, c, spec(['Q1-SKU0005'], {base:'customer'}), NOW);
  assert.equal(p.rows[0].proposed_price, 605); assert.equal(p.rows[0].rule_type, 0);
  assert.equal(p.rows[0].update_rule_id, 'R-VARIATION-A1');
  assert.equal(E.applyPlan(db,p,c,NOW).ok, true);
  assert.equal(E.resolve(db,'A1','Q1-SKU0005').settle_price,605);
});
test('single-customer existing rule keeps sibling SKU lines unchanged', () => {
  const db = seed(), c = ctx();
  db.rules[0].skus.push({sku_id:'Q1-SKU0024',rule_type:0,yx_price:713});
  const p = E.makePlan(db,c,spec(['Q1-SKU0004'],{operation:'set',value:7.9}),NOW);
  assert.equal(p.ok,true); assert.equal(E.applyPlan(db,p,c,NOW).ok,true);
  assert.equal(db.rules[0].skus.length,2); assert.equal(db.rules[0].skus[1].yx_price,713);
  assert.equal(db.rules[0].skus[0].yx_price,790);
});
test('shared rule, category coverage, SPU exclusivity and date conflicts block', () => {
  const db = seed();
  let p = E.makePlan(db,ctx(),spec(['Q1-SKU0006']),NOW);
  assert.equal(p.ok,false); assert.match(p.errors.join(''),/多个客户/);
  p = E.makePlan(db,ctx(),spec(['Q1-SKU0004'],{begin:'2026-10-01'}),NOW);
  assert.equal(p.ok,false); assert.match(p.errors.join(''),/日期重叠/);
  p = E.makePlan(db,ctx(),spec(['Q1-SKU0004'],{begin_time:'10:00',end_time:'11:00'}),NOW);
  assert.equal(p.ok,false);
  p = E.makePlan(db,ctx('customer','A1','Q2'),spec(['Q2-SKU0011']),NOW);
  assert.equal(p.ok,false); assert.match(p.errors.join(''),/分类/);
  p = E.makePlan(db,ctx('customer','A2','Q1'),spec(['Q1-SKU0001']),NOW);
  assert.equal(p.ok,false); assert.match(p.errors.join(''),/上浮率/);
});
test('different SKUs can coexist and nonoverlapping dates create new rule', () => {
  const db = seed(), c = ctx();
  const p = E.makePlan(db,c,spec(['Q1-SKU0004'],{begin:'2026-11-01',end:'2026-11-30'}),NOW);
  assert.equal(p.ok,true); assert.equal(p.rows[0].update_rule_id,null);
  assert.equal(E.applyPlan(db,p,c,NOW).ok,true);
  assert.equal(db.rules.at(-1).status,2);
});
test('missing dates, unknown price and stepped customer prices handled explicitly', () => {
  const db = seed(), c = ctx();
  assert.equal(E.makePlan(db,c,spec(['Q1-SKU0001'],{begin:''}),NOW).ok,false);
  assert.equal(E.makePlan(db,c,spec(['Q1-SKU0003'],{base:'customer'}),NOW).ok,false);
  assert.equal(E.makePlan(db,c,spec(['Q1-SKU0003'],{base:'quote'}),NOW).ok,false);
  assert.equal(E.makePlan(db,c,spec(['Q1-SKU0003'],{operation:'set',value:12}),NOW).ok,true);
  const p = E.makePlan(db,c,spec(['Q1-SKU0001','Q1-SKU0002']),NOW);
  assert.equal(p.ok,true); assert.equal(p.skipped_count,1); assert.equal(p.rows[1].customer_price,null);
});
test('shared quote preview resolves fixed, floating, and regular customers', () => {
  const db = seed(), c = ctx('quote'), p = E.makePlan(db,c,spec(['Q1-SKU0004'],{operation:'set',value:8}),NOW);
  assert.equal(p.ok,true); assert.equal(p.affectedCustomers.length,3);
  assert.deepEqual(p.affectedCustomers.map(c=>c.rows[0].after.settle_price),[740,760,800]);
  assert.equal(E.applyPlan(db,p,c,NOW).ok,true);
  assert.equal(E.resolve(db,'A1','Q1-SKU0004').settle_price,740);
  assert.equal(E.resolve(db,'A2','Q1-SKU0004').settle_price,760);
  assert.equal(E.resolve(db,'A3','Q1-SKU0004').settle_price,800);
});
test('quote changes do not override timing or step pricing', () => {
  const db = seed(), c = ctx('quote');
  const p = E.makePlan(db,c,spec(['Q1-SKU0002','Q1-SKU0003'],{operation:'percent',value:5}),NOW);
  assert.equal(p.ok,true); assert.equal(p.skipped_count,0);
  assert.equal(p.affectedCustomers[0].rows[0].after.requires_quantity,true);
  assert.equal(p.affectedCustomers[0].rows[1].after.settle_price,null);
});
test('unit guard, native cents validation, missing values and no fabricated zero', () => {
  const db = seed(), c = ctx('quote');
  assert.equal(E.makePlan(db,c,spec(['Q1-SKU0001','Q1-SKU0008'],{operation:'delta',value:1}),NOW).ok,false);
  assert.equal(E.makePlan(db,c,spec(['Q1-SKU0001','Q1-SKU0008']),NOW).ok,true);
  db.skus[0].sale_price = null;
  assert.equal(E.resolve(db,'A1','Q1-SKU0001').settle_price,null);
  assert.equal(E.makePlan(db,c,spec(['Q1-SKU0001']),NOW).ok,false);
  db.skus[0].sale_price = 5.22;
  assert.equal(E.resolve(db,'A1','Q1-SKU0001').strategy,'missing');
});
test('basic-unit existing rule conversion preserves sibling interpretation', () => {
  const db = seed(), c = ctx('customer','A3');
  const p = E.makePlan(db,c,spec(['Q1-SKU0008'],{operation:'set',value:48}),NOW);
  assert.equal(p.ok,true); assert.equal(p.rows[0].yx_price,480);
  assert.equal(E.applyPlan(db,p,c,NOW).ok,true);
  assert.equal(E.resolve(db,'A3','Q1-SKU0008').settle_price,4800);
});
test('stale contexts, data mutation and tampered preview apply atomically rejected', () => {
  let db = seed(), c = ctx('quote'), p = E.makePlan(db,c,spec(['Q1-SKU0001']),NOW);
  assert.equal(E.applyPlan(db,p,{...c,generation:2},NOW).ok,false);
  assert.equal(db.skus[0].sale_price,500);
  db.skus[1].sale_price += 1;
  assert.equal(E.applyPlan(db,p,c,NOW).ok,false);
  db=seed(); p=E.makePlan(db,c,spec(['Q1-SKU0001']),NOW); p.rows[0].proposed_price=9999;
  assert.equal(E.applyPlan(db,p,c,NOW).ok,false); assert.equal(db.skus[0].sale_price,500);
});
test('apply rechecks current time across daily rule boundary', () => {
  const db=seed(),c=ctx('quote'),p=E.makePlan(db,c,spec(['Q1-SKU0007']), '2026-09-30T21:59');
  assert.equal(E.applyPlan(db,p,c,'2026-09-30T22:01').ok,false);
});
test('jobs preserve status and enforce original uniqueness constraints', () => {
  const db=seed();
  assert.match(E.validateJobEdit(db,'JOB-002',{rule_name:'x',effective_time:'2026-10-01T09:00'},NOW),/未开始/);
  assert.match(E.validateJobEdit(db,'JOB-001',{rule_name:'x',effective_time:'2026-09-20T09:00'},NOW),/晚于/);
  db.jobs.push({...db.jobs[0],rule_id:'OTHER',rule_name:'重复名',effective_time:'2026-10-03T10:00'});
  assert.match(E.validateJobEdit(db,'JOB-001',{rule_name:'重复名',effective_time:'2026-10-02T09:00'},NOW),/名称/);
  assert.match(E.validateJobEdit(db,'JOB-001',{rule_name:'新名',effective_time:'2026-10-03T10:00'},NOW),/时间/);
  assert.equal(E.updateJob(db,'JOB-001',{rule_name:'新名',effective_time:'2026-10-02T09:00'},NOW).ok,true);
  assert.equal(db.jobs[0].rule_status,0);
  assert.equal(db.jobs[3].rule_status,0);
});
test('1000 SKU plans retain all IDs and atomically apply', () => {
  const db=GMD.seed(1000),c=ctx('quote'),ids=E.quoteSkus(db,'Q1').map(s=>s.sku_id);
  const p=E.makePlan(db,c,spec(ids),NOW);
  assert.equal(p.ok,true); assert.equal(p.rows.length,1000);
  assert.equal(E.applyPlan(db,p,c,NOW).changed,1000);
});
process.stdout.write(`\n${count} scenario groups passed.\n`);
