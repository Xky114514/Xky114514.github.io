const assert=require('node:assert/strict');
global.window=global;require('../src/gm-data.js');require('../src/gm-policy.js');const E=require('../src/gm-engine.js'),T=require('../src/gm-customer-task-engine.js');
const copy=v=>JSON.parse(JSON.stringify(v));let count=0;
const test=(name,fn)=>{fn();count++;console.log('PASS',name);};
const draft=items=>({name:'晨禾十月调价',customer_id:'A1',salemenu_id:'Q1',begin:'2026-09-30',end:'2026-10-07',begin_time:'00:00',end_time:'23:59',time_limit:2,items:items||[{sku_id:'Q1-SKU0001',operation:'set',value:5.5,base:'quote'}]});
test('mixed operations and sales units create one task and native mixed rule, without touching quotation bases',()=>{
  const db=GMD.seed(),bases=db.skus.map(s=>s.sale_price),d=draft([{sku_id:'Q1-SKU0001',operation:'percent',value:3,base:'quote'},{sku_id:'Q1-SKU0008',operation:'delta',value:1.25,base:'quote'},{sku_id:'Q1-SKU0009',operation:'set',value:3.8,base:'quote'}]),p=T.preview(db,d);
  assert(p.ok,p.errors.join(';'));assert.deepEqual(p.rows.map(r=>r.proposed_price),[515,4925,380]);const before=db.customerTasks.length,r=T.apply(db,p,true);assert(r.ok,r.error);assert.equal(db.customerTasks.length,before+1);assert.equal(r.task.items.length,3);assert.equal(r.task.rule_ids.length,1);assert.deepEqual(db.skus.map(s=>s.sale_price),bases);assert.deepEqual(r.task.items.map(i=>i.status),['success','success','success']);assert.equal(E.resolve(db,'A1','Q1-SKU0009').settle_price,380);assert.equal(E.resolve(db,'A2','Q1-SKU0009').settle_price,350);assert(!T.apply(db,p,true).ok);assert.equal(db.customerTasks.length,before+1);
});
test('customer basis is captured once as fixed price, with existing native rule linked',()=>{
  const db=GMD.seed(),d={...draft([{sku_id:'Q1-SKU0004',operation:'percent',value:10,base:'customer'}]),begin:'2026-09-01',end:'2026-10-31'},p=T.preview(db,d);assert(p.ok,p.errors.join(';'));assert.equal(p.rows[0].proposed_price,814);const r=T.apply(db,p,true);assert(r.ok);assert.equal(r.task.items[0].rule_type,0);assert.deepEqual(r.task.rule_ids,['R-FIXED-A1']);db.skus[3].sale_price=900;assert.equal(E.resolve(db,'A1','Q1-SKU0004').settle_price,814);
});
test('blocking conflicts are atomic and show original rule links',()=>{
  const db=GMD.seed(),before=JSON.stringify([db.rules,db.customerTasks]),p=T.preview(db,draft([{sku_id:'Q1-SKU0001',operation:'set',value:5,base:'quote'},{sku_id:'Q1-SKU0006',operation:'set',value:8,base:'quote'}]));assert(!p.ok);assert(p.rows[1].error.includes('多个客户'));assert.deepEqual(p.rows[1].conflict_rule_ids,['R-SHARED']);assert(!T.apply(db,p,true).ok);assert.equal(JSON.stringify([db.rules,db.customerTasks]),before);
});
test('stale prices, changed roles, tampered previews and invalid dates cannot be submitted',()=>{
  for(const mutate of [d=>d.skus[0].sale_price++,d=>d.demoRole='viewer',d=>d.links=d.links.filter(l=>!(l.restaurant_id==='A1'&&l.salemenu_id==='Q1'))]){const db=GMD.seed(),p=T.preview(db,draft()),n=db.customerTasks.length;mutate(db);assert(!T.apply(db,p,true).ok);assert.equal(db.customerTasks.length,n);}
  const db=GMD.seed(),p=T.preview(db,draft());p.rows[0].proposed_price=1;assert(!T.apply(db,p,true).ok);assert(!T.preview(db,{...draft(),end:'2026-09-29'}).ok);db.demoRole='sales';assert(T.preview(db,draft()).ok);db.demoRole='viewer';assert(!T.preview(db,draft()).ok);
});
test('a skipped tier item in its own value group does not block valid rows, requires acknowledgement',()=>{
  const db=GMD.seed(),p=T.preview(db,draft([{sku_id:'Q1-SKU0001',operation:'set',value:5.5,base:'quote'},{sku_id:'Q1-SKU0002',operation:'percent',value:2,base:'quote'}]));assert(p.ok,p.errors.join(';'));assert.equal(p.skipped_count,1);assert(!T.apply(db,p,false).ok);const r=T.apply(db,p,true);assert(r.ok);assert.equal(r.task.processing_status,'completed');assert.equal(r.task.items[1].status,'skipped');assert(!T.draftFromTask(db,r.task.id,true).ok);
});
test('retry copies all failed rows only and preserves history; re-adjustment reads current prices',()=>{
  const db=GMD.seed(),old=JSON.stringify(db.customerTasks[1]),r=T.draftFromTask(db,'CUSTOMER-DEMO-002',true);assert(r.ok);assert.equal(r.draft.items.length,1);assert.equal(r.draft.items[0].sku_id,'Q1-SKU0001');db.skus[0].sale_price=575;const p=T.preview(db,r.draft);assert(p.ok,p.errors.join(';'));assert.equal(p.rows[0].before_price,575);const saved=T.apply(db,p,true);assert(saved.ok);assert.equal(saved.task.source_task_id,'CUSTOMER-DEMO-002');assert.equal(JSON.stringify(db.customerTasks[1]),old);saved.task.items[0].name='caller mutation';assert.notEqual(db.customerTasks.at(-1).items[0].name,'caller mutation');
});
test('existing dialogue plan registers one task after successful application and deduplicates registration',()=>{
  const db=GMD.seed(),context={scope:'customer',customerId:'A1',quoteId:'Q1',generation:1},p=E.makePlan(db,context,{ids:['Q1-SKU0001','Q1-SKU0008'],operation:'percent',value:3,base:'quote',begin:'2026-09-30',end:'2026-10-07',ruleName:'对话批调',source:'报价对话'}),r=E.applyPlan(db,p,context);assert(r.ok);const n=db.customerTasks.length,t=T.fromPlan(db,p,r);assert(t);assert.equal(t.items.length,2);assert.equal(t.source,'报价对话');assert.equal(db.customerTasks.length,n+1);assert.equal(t.rule_ids.length,1);assert.equal(T.fromPlan(db,p,r).id,t.id);assert.equal(db.customerTasks.length,n+1);
});
test('shared native edits retain customers and original rule; category membership is a historical snapshot',()=>{
  const db=GMD.seed(),r=db.rules.find(r=>r.id==='R-SHARED'),old=copy(r);r.skus[0].yx_price=790;const t=T.fromRuleEdit(db,old,r);assert.deepEqual(t.customer_ids,['A1','A2']);assert.equal(t.origin_rule_id,'R-SHARED');assert.equal(t.items[0].before_price,null);assert(!T.draftFromTask(db,t.id).ok);assert.equal(T.fromRuleEdit(db,old,r).id,t.id);
  const cat=db.rules.find(r=>r.id==='R-CATEGORY-A1'),oldCat=copy(cat);cat.category_2_list[0].yx_price=40;const ct=T.fromRuleEdit(db,oldCat,cat);assert(ct.items.length>1);assert.equal(ct.origin_rule_type,2);assert(!T.draftFromTask(db,ct.id).ok);const frozen=JSON.stringify(db.customerTasks);cat.category_2_list[0].yx_price=80;db.skus.find(s=>s.sku_id===ct.items[0].sku_id).sku_name='later renamed';assert.equal(JSON.stringify(db.customerTasks),frozen);
});
test('1000 individually priced products generate one task efficiently and preserve per-SKU amounts',()=>{
  const db=GMD.seed(1000),items=db.skus.filter(s=>s.salemenu_id==='Q1').map((s,i)=>({sku_id:s.sku_id,operation:'set',value:(500+i)/100,base:'quote'})),d={...draft(items),begin:'2026-11-01',end:'2026-11-07'},started=Date.now(),p=T.preview(db,d);assert(p.ok,p.errors.join(';'));assert.equal(p.rows.length,1000);assert.equal(p.skipped_count,1);const r=T.apply(db,p,true);assert(r.ok,r.error);assert.equal(r.task.items.length,1000);assert.equal(r.task.items.filter(i=>i.status==='success').length,999);assert.equal(r.task.rule_ids.length,1);assert.equal(r.task.items[999].proposed_price,1499);assert(Date.now()-started<10000,'1000-product preview and save should finish within 10 seconds');
});
test('names, duplicate SKUs, currency, quantity and object limits respect existing boundaries',()=>{
  const db=GMD.seed();for(const d of [{...draft(),name:''},{...draft(),name:'x'.repeat(81)},{...draft(),name:'bad\tname'},{...draft(),items:[...draft().items,...draft().items]},{...draft(),items:Array.from({length:5001},(_,i)=>({sku_id:'X'+i,operation:'set',value:5,base:'quote'}))},{...draft(),customer_id:'A3',salemenu_id:'Q4',items:[{sku_id:'Q4-SKU0001',operation:'set',value:5,base:'quote'}]}])assert(!T.preview(db,d).ok);
  const p=T.preview(db,draft());assert(p.ok);const r=T.apply(db,p,true);assert(r.ok);assert(T.preview(db,{...draft(),begin:'2026-11-01',end:'2026-11-07'}).ok,'duplicate names allowed');
});
test('basic-unit settings retain native units while task prices and repeated input use sale units',()=>{
  const db=GMD.seed(),d={...draft([{sku_id:'Q1-SKU0008',operation:'delta',value:2,base:'quote'}]),customer_id:'A3',begin:'2026-09-01',end:'2026-10-31'},p=T.preview(db,d);assert(p.ok,p.errors.join(';'));assert.equal(p.rows[0].unit,'箱');assert.equal(p.rows[0].setting_unit,'公斤');assert.equal(p.rows[0].yx_price,20);assert.equal(p.rows[0].proposed_price,5000);const r=T.apply(db,p,true);assert(r.ok);assert.equal(r.task.items[0].setting_unit,'公斤');assert.equal(r.task.items[0].value,2);
  const native=db.rules.find(r=>r.id==='R-BASIC-A3'),old=copy(native);native.skus[0].rule_type=0;native.skus[0].yx_price=470;const t=T.fromRuleEdit(db,old,native);assert.equal(t.items[0].value,47);assert.equal(t.items[0].setting_value,4.7);assert.equal(t.items[0].setting_unit,'公斤');assert.equal(t.items[0].proposed_price,4700);assert.equal(T.draftFromTask(db,t.id).draft.items[0].value,47);
});
test('native shared settings are not labelled predicted customer prices and historical dates must be renewed',()=>{
  const db=GMD.seed(),r=db.rules.find(r=>r.id==='R-SHARED'),old=copy(r);r.skus[0].yx_price=800;const t=T.fromRuleEdit(db,old,r);assert(t.native_rule_snapshot);assert.equal(t.items[0].proposed_price,null);assert.equal(t.items[0].yx_price,800);assert(!T.preview(db,{...draft(),source_task_id:t.id}).ok);
  const seed=db.customerTasks[0];seed.end='2026-09-10';const repeated=T.draftFromTask(db,seed.id);assert(repeated.ok);assert(repeated.notification.includes('重新核对时间'));assert(!T.preview(db,repeated.draft).ok);assert.equal(seed.end,'2026-09-10');
});
test('native follow-up keeps source history and validates origin without merging separate confirmations',()=>{
  const db=GMD.seed(),r=db.rules.find(r=>r.id==='R-SHARED'),before=copy(r);r.skus[0].yx_price=790;const first=T.fromRuleEdit(db,before,r),frozen=JSON.stringify(db.customerTasks.find(t=>t.id===first.id));
  const beforeAgain=copy(r);r.skus[0].yx_price=800;const next=T.fromRuleEdit(db,beforeAgain,r,null,first.id);assert.equal(next.source_task_id,first.id);assert.equal(next.origin_rule_id,'R-SHARED');assert.equal(JSON.stringify(db.customerTasks.find(t=>t.id===first.id)),frozen);assert.equal(T.fromRuleEdit(db,beforeAgain,r,null,first.id).id,next.id);
  const noChangeBefore=copy(r),noChangeNext=copy(r),fresh=T.fromRuleEdit(db,noChangeBefore,noChangeNext,null,first.id);assert.notEqual(fresh.id,next.id);const separatelyConfirmed=T.fromRuleEdit(db,copy(r),copy(r),null,first.id);assert.notEqual(separatelyConfirmed.id,fresh.id);
  const count=db.customerTasks.length;assert.equal(T.fromRuleEdit(db,copy(r),copy(r),null,'missing'),null);assert.equal(T.fromRuleEdit(db,copy(r),copy(r),null,'CUSTOMER-DEMO-001'),null);assert.equal(db.customerTasks.length,count);assert(T.nativeSourceError(db,'CUSTOMER-DEMO-001','R-SHARED'));assert.equal(T.nativeSourceError(db,first.id,'R-SHARED'),'');
});
console.log(count+' customer task scenario groups passed');

