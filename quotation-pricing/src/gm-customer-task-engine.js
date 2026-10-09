(function(root){
  'use strict';
  const copy=v=>JSON.parse(JSON.stringify(v)),list=v=>Array.isArray(v)?v:[],eq=(a,b)=>String(a)===String(b);
  const nowOf=(db,now)=>String(now||db.meta?.now||'2026-09-30T10:00').replace(' ','T').slice(0,16);
  const skuOf=(db,id)=>list(db.skus).find(s=>eq(s.sku_id,id));
  const ruleId=r=>r.id||r._id;
  const customers=r=>list(r.address_ids||r.addresses).map(a=>typeof a==='object'?a.address_id||a.id:a);
  const fingerprint=db=>JSON.stringify([db.station_id,db.demoRole,db.customers,db.links,db.salemenus,db.skus,db.rules]);
  let counter=0;
  const nativeRegistrations=new WeakMap();
  const token=prefix=>prefix+'-'+Date.now().toString(36)+'-'+(++counter).toString(36)+'-'+Math.random().toString(36).slice(2,7);
  const unique=a=>[...new Set(a)];
  function snapshot(db,id){const s=skuOf(db,id),q=list(db.salemenus).find(q=>eq(q.id,s?.salemenu_id));return {sku_id:id,name:s?.sku_name||'已移除商品',code:s?.outer_id||'',spec:s?.specification_desc||'',unit:s?.sale_unit_name||'',basic_unit:s?.std_unit_name_forsale||s?.std_unit_name||'',currency:q?.fee_type||s?.fee_type||null,category_name_1:s?.category_name_1||'',category_name_2:s?.category_name_2||'',category_id_2:s?.category_id_2||null};}
  function cleanDraft(d){return {name:String(d?.name||'').trim(),customer_id:String(d?.customer_id||''),salemenu_id:String(d?.salemenu_id||''),begin:d?.begin||'',end:d?.end||'',begin_time:d?.begin_time||'00:00',end_time:d?.end_time||'23:59',time_limit:d?.time_limit==null?2:Number(d.time_limit),items:list(d?.items).map(i=>({sku_id:String(i.sku_id||''),operation:i.operation,value:i.value,base:i.base||'quote',...(i.quantity==null||i.quantity===''?{}:{quantity:i.quantity})})),source_task_id:d?.source_task_id||null,source:d?.source||'手动客户协议调价'};}
  function preview(db,input,now){
    const draft=cleanDraft(input),p={ok:false,errors:[],warnings:[],draft,rows:[],eligible_count:0,skipped_count:0,fingerprint:fingerprint(db),created_at:nowOf(db,now),token:token('CUSTOMER-PREVIEW'),requires_confirmation:false};
    const error=s=>{if(s&&!p.errors.includes(s))p.errors.push(s);};
    if(!draft.name)error('请填写调价任务名称');
    if(draft.name.length>80)error('任务名称最多80个字符');
    if(/[\x00-\x1f\x7f]/.test(String(input?.name||'')))error('任务名称不能包含换行、制表符或控制字符');
    if(!draft.items.length)error('请至少选择一个商品');
    if(draft.items.length>5000)error('每次最多调整5000个商品');
    if(unique(draft.items.map(i=>i.sku_id)).length!==draft.items.length)error('同一任务中的商品不能重复，请合并重复商品');
    error(root.GMP?.error(db,'customer',draft.salemenu_id,[draft.customer_id]));
    if(!root.GME.linkedQuotes(db,draft.customer_id).some(q=>eq(q.id,draft.salemenu_id)))error('请选择该客户关联的一张报价单');
    if(draft.source_task_id){const origin=list(db.customerTasks).find(t=>eq(t.id,draft.source_task_id));if(!origin)error('来源任务不存在，请从任务列表重新发起');else if(origin.customer_ids?.length>1||(origin.native_edit&&Number(origin.origin_rule_type)!==1))error('共享或范围规则任务不能拆成单客户商品调整，请处理原规则');}
    if(draft.items.length>5000)return p;
    // Group equal operations, while splitting fixed amounts by unit. Per-row
    // values may differ; units are never converted or mixed by this adapter.
    const groups=new Map(),index=new Map(list(db.skus).map(s=>[String(s.sku_id),s]));
    draft.items.forEach(i=>{const s=index.get(i.sku_id),key=JSON.stringify([i.operation,i.value,i.base,['set','delta'].includes(i.operation)?s?.sale_unit_name:null]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);});
    const byId=new Map();
    for(const items of groups.values()){
      const first=items[0],ids=items.map(i=>i.sku_id),selected=ids.map(id=>index.get(id)).filter(Boolean);
      // GME validates only selected SKUs. Narrowing this read view avoids
      // repeatedly fingerprinting a thousand unrelated products per row.
      const view={...db,skus:selected};
      const plan=root.GME.makePlan(view,{scope:'customer',customerId:draft.customer_id,quoteId:draft.salemenu_id,generation:1},{ids,operation:first.operation,value:first.value,base:first.base,begin:draft.begin,end:draft.end,begin_time:draft.begin_time,end_time:draft.end_time,time_limit:draft.time_limit,ruleName:draft.name,quantities:Object.fromEntries(items.filter(i=>i.quantity!=null).map(i=>[i.sku_id,i.quantity]))},nowOf(db,now));
      plan.errors.filter(e=>!(e==='所选商品均无法通过此调价方式调整'&&plan.rows.length&&plan.rows.every(r=>r.skip))).forEach(error);
      plan.rows.forEach(r=>{const snap=snapshot(db,r.sku_id),rule=list(db.rules).find(n=>eq(ruleId(n),r.update_rule_id));byId.set(r.sku_id,{...r,...snap,before_price:r.customer_price,setting_unit:Number(rule?.locking_price_unit)===1?snap.basic_unit:snap.unit,setting_currency:snap.currency,conflict_rule_ids:r.rule_ids||[]});});
    }
    p.rows=draft.items.map(i=>({...snapshot(db,i.sku_id),...i,...(byId.get(i.sku_id)||{base_price:null,customer_price:null,before_price:null,proposed_price:null,skip:false,error:'商品不存在或不属于当前报价单',conflict_rule_ids:[]})}));
    p.eligible_count=p.rows.filter(r=>!r.skip&&!r.error&&r.proposed_price!=null).length;
    p.skipped_count=p.rows.filter(r=>r.skip).length;
    p.requires_confirmation=p.skipped_count>0;
    if(!p.eligible_count&&!p.errors.length)error('所选商品均无法通过此调价方式调整');
    if(p.skipped_count)p.warnings.push('有 '+p.skipped_count+' 个商品不会调整，请确认后再提交');
    p.ok=!p.errors.length&&p.eligible_count>0;
    return p;
  }
  const signature=p=>JSON.stringify([p.draft,p.rows,p.errors,p.eligible_count,p.skipped_count]);
  function nativeRule(db,row,draft){
    if(row.update_rule_id)return list(db.rules).find(r=>eq(ruleId(r),row.update_rule_id));
    return list(db.rules).find(r=>Number(r.rule_object_type||1)===1&&customers(r).length===1&&eq(customers(r)[0],draft.customer_id)&&String(r.begin).slice(0,10)===draft.begin&&String(r.end).slice(0,10)===draft.end&&(r.begin_time||'00:00')===draft.begin_time&&(r.end_time||'23:59')===draft.end_time&&Number(r.time_limit??2)===draft.time_limit&&list(r.skus).some(s=>eq(s.sku_id||s.id,row.sku_id)&&s.rule_type===row.rule_type&&s.yx_price===row.yx_price));
  }
  function taskBase(db,draft,now){const name=list(db.customers).find(c=>eq(c.address_id,draft.customer_id))?.name||'';return {id:token('CUSTOMER-TASK'),name:draft.name,customer_id:draft.customer_id,customer_ids:[draft.customer_id],customer_name:name,customer_names:[name],salemenu_id:draft.salemenu_id,salemenu_name:list(db.salemenus).find(q=>eq(q.id,draft.salemenu_id))?.name||'',begin:draft.begin,end:draft.end,begin_time:draft.begin_time,end_time:draft.end_time,time_limit:draft.time_limit,created_at:nowOf(db,now),actor:root.GMP?root.GMP.role(db).name+'（演示）':'演示操作员',source:draft.source,source_task_id:draft.source_task_id||null,kind:'customer_adjustment',native_edit:false,items:[],rule_ids:[]};}
  function taskRows(db,rows,draft){return rows.map(r=>{const rule=!r.skip&&!r.error?nativeRule(db,r,draft):null,snap=snapshot(db,r.sku_id);return {...snap,operation:r.operation,value:r.value,base:r.base,quantity:r.quantity??null,before_price:r.customer_price??r.before_price??null,base_price:r.base_price??null,proposed_price:r.proposed_price??null,rule_type:r.rule_type??null,yx_price:r.yx_price??null,setting_unit:Number(rule?.locking_price_unit)===1?snap.basic_unit:snap.unit,setting_currency:snap.currency,status:r.skip?'skipped':r.error?'failed':'success',reason:r.skip?r.warning:r.error||r.warning||'',rule_ids:rule?[ruleId(rule)]:[],...(r.conflict_rule_ids?.length?{conflict_rule_ids:copy(r.conflict_rule_ids)}:{})};});}
  function register(db,task){task.rule_ids=unique(task.items.flatMap(i=>i.rule_ids||[]));const done=task.items.filter(i=>i.status==='success').length,failed=task.items.filter(i=>i.status==='failed').length;task.processing_status=failed?(done?'partial':'failed'):'completed';db.customerTasks||=[];db.customerTasks.push(copy(task));return copy(task);}
  function apply(db,p,confirmed,now){
    if(!p?.ok)return {ok:false,error:'当前任务预览不可提交，请先处理阻止项'};
    if(list(db.customerTasks).some(t=>t.preview_token===p.token))return {ok:false,error:'该任务已经提交，请查看任务记录'};
    const access=root.GMP?.error(db,'customer',p.draft.salemenu_id,[p.draft.customer_id]);if(access)return {ok:false,error:access};
    if(p.requires_confirmation&&!confirmed)return {ok:false,error:'请确认未处理商品，再提交任务'};
    if(p.fingerprint!==fingerprint(db))return {ok:false,error:'客户、商品、价格或权限已变化，请重新预览'};
    const fresh=preview(db,p.draft,now);
    if(!fresh.ok||signature(fresh)!==signature(p))return {ok:false,error:'调价内容或适用规则已变化，请重新预览'};
    const next=copy(db),rows=fresh.rows.filter(r=>!r.skip&&!r.error&&r.proposed_price!=null),draft=fresh.draft;
    // Commit all valid rows to a private copy, then publish the two related
    // collections together. Validation errors never leave partial changes.
    rows.filter(r=>r.update_rule_id).forEach(r=>{const rule=next.rules.find(x=>eq(ruleId(x),r.update_rule_id)),entry=rule.skus.find(s=>eq(s.sku_id||s.id,r.sku_id));entry.rule_type=r.rule_type;entry.yx_price=r.yx_price;});
    const insert=rows.filter(r=>!r.update_rule_id);
    if(insert.length){let n=1;while(next.rules.some(r=>eq(ruleId(r),'LOCAL-RULE-'+n)))n++;next.rules.push({id:'LOCAL-RULE-'+n,name:draft.name,type:'customer',salemenu_id:draft.salemenu_id,address_ids:[draft.customer_id],rule_object_type:1,skus:insert.map(r=>({sku_id:r.sku_id,rule_type:r.rule_type,yx_price:r.yx_price})),category_2_list:[],begin:draft.begin,end:draft.end,begin_time:draft.begin_time,end_time:draft.end_time,time_limit:draft.time_limit,locking_price_unit:0,price_type:1,status:draft.begin>nowOf(db,now).slice(0,10)?2:3});}
    const task=taskBase(next,draft,now);task.items=taskRows(next,fresh.rows,draft);task.preview_token=p.token;const saved=register(next,task);
    root.GMP?.record(next,{action:'客户协议调价任务',object_id:saved.id,quote_id:draft.salemenu_id,customer_ids:[draft.customer_id],summary:draft.name+'：'+rows.length+' 个商品配置成功，'+fresh.skipped_count+' 个未处理',source:draft.source,changes:saved.items.filter(i=>i.status==='success').map(i=>({field:i.code+' '+i.name,before:{price:i.before_price,unit:i.unit,currency:i.currency},after:{price:i.proposed_price,unit:i.unit,currency:i.currency,rule_type:i.rule_type,yx_price:i.yx_price,begin:draft.begin,end:draft.end}}))});
    db.rules=next.rules;db.customerTasks=next.customerTasks;db.operationLogs=next.operationLogs;
    return {ok:true,task:saved,changed:rows.length,skipped:fresh.skipped_count};
  }
  function fromPlan(db,plan,result,now){
    if(!result?.ok||plan?.context?.scope!=='customer')return null;
    if(plan.customer_task_id)return copy(list(db.customerTasks).find(t=>eq(t.id,plan.customer_task_id))||null);
    const s=plan.spec,fallback=(list(db.customers).find(c=>eq(c.address_id,plan.context.customerId))?.name||'客户')+' '+nowOf(db,now).slice(0,10)+' 调价',draft=cleanDraft({name:(String(s.ruleName||'').trim()||fallback).slice(0,80),customer_id:plan.context.customerId,salemenu_id:plan.context.quoteId,begin:s.begin,end:s.end,begin_time:s.begin_time,end_time:s.end_time,time_limit:s.time_limit,source:s.source||'报价对话',source_task_id:s.source_task_id,items:list(plan.rows).map(r=>({sku_id:r.sku_id,operation:s.operation,value:s.value,base:s.base,quantity:s.quantities?.[r.sku_id]}))});
    const task=taskBase(db,draft,now);task.items=taskRows(db,plan.rows.map(r=>({...r,operation:s.operation,value:s.value,base:s.base,quantity:s.quantities?.[r.sku_id]})),draft);const saved=register(db,task);plan.customer_task_id=saved.id;return saved;
  }
  function ruleEntry(rule,s){if(!rule)return null;const type=Number(rule.rule_object_type||1);return type===1?list(rule.skus).find(e=>eq(e.sku_id||e.id,s.sku_id)):type===2?list(rule.category_2_list).find(e=>eq(e.category_2_id,s.category_id_2)):type===3?list(rule.spus).find(e=>eq(e.spu_id||e.id,s.spu_id)):type===4?{rule_type:2,yx_price:rule.change_rate}:null;}
  function entryValue(s,rule,e){if(!e)return null;const k=Number(rule.locking_price_unit)===1?Number(s.sale_ratio):1;if(!Number.isFinite(k)||k<=0||rule.price_type!=null&&Number(rule.price_type)!==1)return null;const raw=e.rule_type===0?e.yx_price*k:e.rule_type===1?s.sale_price+e.yx_price*k:s.sale_price*e.yx_price/100,lo=Math.floor(raw);return Math.abs(raw-lo-.5)<1e-9?(lo%2===0?lo:lo+1):Math.round(raw);}
  function nativeSourceError(db,sourceTaskId,id){
    if(!sourceTaskId)return '';
    const source=list(db.customerTasks).find(t=>eq(t.id,sourceTaskId));
    if(!source)return '来源调价任务不存在，请重新打开任务';
    if(source.origin_rule_id?!eq(source.origin_rule_id,id):!list(source.rule_ids).some(r=>eq(r,id)))return '来源任务未关联该原生价格规则，请重新选择';
    return '';
  }
  function fromRuleEdit(db,old,next,now,sourceTaskId=null){
    if(!old||!next)return null;
    const ids=unique([...customers(old),...customers(next)]),id=ruleId(next);
    if(nativeSourceError(db,sourceTaskId,id))return null;
    // Deduplicate registration of the same in-memory confirmed preview, not a
    // later, explicit no-op confirmation with equal values in the same minute.
    const signature=JSON.stringify([old,next,sourceTaskId||null]),registrations=nativeRegistrations.get(old)||new Map();
    const registration=registrations.get(signature)||token('NATIVE-EDIT');
    const existing=list(db.customerTasks).find(t=>t.native_registration===registration);if(existing)return copy(existing);
    const draft=cleanDraft({name:('修改规则：'+next.name).slice(0,80),customer_id:ids[0],salemenu_id:next.salemenu_id,begin:String(next.begin).slice(0,10),end:String(next.end).slice(0,10),begin_time:next.begin_time,end_time:next.end_time,time_limit:next.time_limit,source:'人工编辑现有价格规则',source_task_id:sourceTaskId}),task=taskBase(db,draft,now);
    task.customer_ids=ids;task.customer_names=ids.map(id=>list(db.customers).find(c=>eq(c.address_id,id))?.name||String(id));task.kind='native_rule_edit';task.native_edit=true;task.origin_rule_id=id;task.origin_rule_type=Number(next.rule_object_type||1);task.native_rule_snapshot=ids.length>1||task.origin_rule_type!==1;task.native_registration=registration;task.rule_snapshot={before:copy(old),after:copy(next)};
    const beforeDB={...db,rules:list(db.rules).map(r=>eq(ruleId(r),id)?old:r)};
    task.items=list(db.skus).filter(s=>eq(s.salemenu_id,next.salemenu_id)&&(ruleEntry(old,s)||ruleEntry(next,s))).map(s=>{const e=ruleEntry(next,s),k=Number(next.locking_price_unit)===1?Number(s.sale_ratio):1,before=!task.native_rule_snapshot?root.GME.resolve(beforeDB,ids[0],s.sku_id):null,value=e?(e.rule_type===2?e.yx_price/100:e.yx_price*k/100):null;return {...snapshot(db,s.sku_id),operation:e?['set','delta','multiple'][e.rule_type]:'set',value,base:'quote',quantity:null,before_price:before?.requires_quantity?null:before?.settle_price??null,base_price:s.sale_price??null,proposed_price:e&&!task.native_rule_snapshot?entryValue(s,next,e):null,rule_type:e?.rule_type??null,yx_price:e?.yx_price??null,native_rule_snapshot:task.native_rule_snapshot,setting_value:e?(e.rule_type===2?e.yx_price/100:e.yx_price/100):null,setting_unit:Number(next.locking_price_unit)===1?s.std_unit_name_forsale||s.std_unit_name:s.sale_unit_name,setting_currency:s.fee_type||list(db.salemenus).find(q=>eq(q.id,s.salemenu_id))?.fee_type||null,locking_price_unit:Number(next.locking_price_unit||0),status:'success',removed:!e,reason:!e?'从原规则移除；实际取价按剩余规则决定':task.origin_rule_type!==1?'原生范围规则调整的商品范围快照；不代表逐商品独立修改':ids.length>1?'多个客户共用的规则修改；客户当前价需分别查询':'规则配置已修改',rule_ids:[id]};});
    const saved=register(db,task);registrations.set(signature,registration);nativeRegistrations.set(old,registrations);if(!saved.items.length){const stored=db.customerTasks.find(t=>t.id===saved.id);stored.rule_ids=[id];saved.rule_ids=[id];}return saved;
  }
  function draftFromTask(db,id,failedOnly=false){
    const task=list(db.customerTasks).find(t=>eq(t.id,id)),errors=[];
    if(!task)return {ok:false,errors:['调价任务不存在'],notification:'',draft:null};
    if(task.customer_ids?.length>1||(task.native_edit&&Number(task.origin_rule_type)!==1))errors.push('该任务来自共享或范围价格规则，请通过“查看现有价格规则”处理原规则，不能拆成单客户商品调整');
    const items=list(task.items).filter(i=>!i.removed&&(!failedOnly||i.status==='failed'));
    if(!items.length)errors.push(failedOnly?'该任务没有失败商品可补处理':'该任务没有可再次调整的商品');
    const draft=cleanDraft({name:(failedOnly?'补处理：':'再次调整：')+task.name,customer_id:task.customer_id,salemenu_id:task.salemenu_id,begin:task.begin,end:task.end,begin_time:task.begin_time,end_time:task.end_time,time_limit:task.time_limit,items:items.map(i=>({sku_id:i.sku_id,operation:i.operation,value:i.value,base:i.base,quantity:i.quantity})),source_task_id:task.id,source:failedOnly?'失败商品补处理':'再次调整'});draft.name=draft.name.slice(0,80);
    const access=root.GMP?.error(db,'customer',draft.salemenu_id,[draft.customer_id]);if(access)errors.push(access);
    if(!root.GME.linkedQuotes(db,draft.customer_id).some(q=>eq(q.id,draft.salemenu_id)))errors.push('原客户与报价单已解除关联，请先处理客户报价单关联');
    return {ok:!errors.length,draft,errors,notification:'已复制'+items.length+'个商品及原有效期；请重新核对时间。预览将重新读取当前价格与规则，原任务保持不变。'};
  }
  root.GMT={preview,apply,fromPlan,fromRuleEdit,draftFromTask,nativeSourceError};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GMT;
})(typeof window!=='undefined'?window:globalThis);

