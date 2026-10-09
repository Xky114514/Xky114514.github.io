(function(root){
  'use strict';
  const copy=v=>JSON.parse(JSON.stringify(v)), list=v=>Array.isArray(v)?v:[], finite=v=>typeof v==='number'&&Number.isFinite(v);
  const day=v=>String(v||'').slice(0,10), time=v=>String(v||'').replace(' ','T').slice(0,16);
  const dateOK=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!isNaN(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
  const clockOK=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(v||'');
  const current=db=>db.fixtureDate+'T10:00';
  const permission=(db,action,quoteId,customers=[])=>root.GMP?.error(db,action,quoteId,customers)||'';
  function writableQuote(db,id){const q=db.salemenus.find(q=>q.id===id);return !q?'请选择报价单':!q.is_active?'停用报价单仅可查看':q.station_id&&q.station_id!==db.station_id?'仅可修改本站报价单':q.fee_type!=='CNY'?'本期仅支持人民币报价单调价':'';}
  function ruleReadOnly(db,r){
    if(r.status===0)return '已关闭规则按观麦约束不可直接修改';
    if(r.end<day(current(db)))return '规则有效期已结束，仅可查看；需要新价格时请新建规则';
    if(r.price_type!=null&&r.price_type!==1)return '行情基准规则本期只读，请到原系统管理';
    if(r.rule_object_type===3&&r.category1_change_rates&&Object.keys(r.category1_change_rates).length)return '含分类继承配置的SPU规则本期只读，请到原系统管理';
    return '';
  }
  const moneyOK=v=>finite(v)&&Number.isSafeInteger(v)&&v>=0&&v<=99999999;
  const round=v=>{const f=Math.floor(v);return Math.abs(v-f-.5)<1e-9?(f%2===0?f:f+1):Math.round(v);};
  function period(r){
    if(!dateOK(r.begin)||!dateOK(r.end)||r.begin>r.end)return '请填写正确的有效起止日期';
    if(!clockOK(r.begin_time)||!clockOK(r.end_time)||![1,2].includes(Number(r.time_limit)))return '请填写每日时段';
    if(r.time_limit===2&&r.begin_time>r.end_time)return '当日时段的结束时间不能早于开始时间';
    if(r.time_limit===1&&r.begin_time<=r.end_time)return '跨午夜时段的结束时间应早于开始时间';
    return '';
  }
  function ruleMembers(r){return r.rule_object_type===1?list(r.skus):r.rule_object_type===2?list(r.category_2_list):r.rule_object_type===3?list(r.spus):[];}
  function ruleConflicts(db,r){
    const ids=[];
    for(const other of db.rules){
      if(other.id===r.id||!other.address_ids.some(a=>r.address_ids.includes(a)))continue;
      const a=r.rule_object_type,b=other.rule_object_type;
      let broad=false;
      if([3,4].includes(a))broad=(b===a&&[1,3].includes(other.status))||(r.status!==1&&b!==a&&[2,3].includes(other.status));
      else broad=[3,4].includes(b)&&other.status===3;
      const duplicate=[2,3].includes(r.status)&&[2,3].includes(other.status)&&a===b&&r.begin<=other.end&&r.end>=other.begin&&
        (a===1?ruleMembers(r).some(m=>other.skus?.some(n=>n.sku_id===m.sku_id)):a===2?r.salemenu_id===other.salemenu_id&&ruleMembers(r).some(m=>other.category_2_list?.some(n=>n.category_2_id===m.category_2_id)):false);
      if(broad||duplicate)ids.push(other.id);
    }return ids;
  }
  function previewRule(db,id,changes){
    const old=db.rules.find(r=>r.id===id), errors=[];
    if(!old)return {ok:false,errors:['规则不存在']};
    const readOnly=ruleReadOnly(db,old);if(readOnly)return {ok:false,errors:[readOnly]};
    const next=copy(old);
    for(const k of ['name','address_ids','begin','end','begin_time','end_time','time_limit','status','skus','category_2_list','spus','change_rate'])if(k in changes)next[k]=copy(changes[k]);
    next.name=String(next.name||'').trim();next.address_ids=[...new Set(next.address_ids||[])];
    if(!next.name)errors.push('请输入规则名称');
    if(next.name.length>80)errors.push('规则名称不能超过80个字符');
    if(/[\r\n\t]/.test(String(changes.name??old.name)))errors.push('规则名称不能包含换行或制表符');
    const access=permission(db,'rule',old.salemenu_id,[...new Set([...old.address_ids,...next.address_ids])]),quoteError=writableQuote(db,old.salemenu_id);if(access)errors.push(access);if(quoteError)errors.push(quoteError);
    if(!next.address_ids.length)errors.push('至少选择一个适用客户');
    const linked=root.GME.linkedCustomers(db,next.salemenu_id).map(c=>c.address_id);
    if(next.address_ids.some(a=>!linked.includes(a)))errors.push('适用客户必须关联该报价单');
    const pe=period(next);if(pe)errors.push(pe);
    if(next.end<day(current(db)))errors.push('有效结束日期不能早于演示当前日期');
    if(![1,2,3].includes(next.status))errors.push('请选择启用或停用');
    if(next.status!==1)next.status=next.begin>day(current(db))?2:3;
    const members=ruleMembers(next),qskus=db.skus.filter(s=>s.salemenu_id===next.salemenu_id);
    if(next.rule_object_type!==4&&!members.length)errors.push('至少保留一个规则对象');
    if(members.length>5000)errors.push('每条规则最多5000个对象');
    const key=next.rule_object_type===1?'sku_id':next.rule_object_type===2?'category_2_id':'spu_id';
    if(new Set(members.map(m=>m[key])).size!==members.length)errors.push('规则对象不能重复');
    if(next.rule_object_type===3&&ruleMembers(old).some(m=>!members.some(n=>n.spu_id===m.spu_id)))errors.push('SPU规则采用增量维护，不能删除原有商品；请到原系统管理移除');
    for(const m of members){
      if(!qskus.some(s=>s[key==='category_2_id'?'category_id_2':key]===m[key])){errors.push('规则对象不属于当前报价单');continue;}
      if(![0,1,2].includes(Number(m.rule_type))||!finite(m.yx_price))errors.push('请填写每个对象的计算方式与数值');
      else if(m.rule_type===2&&m.yx_price<=0)errors.push('倍数必须大于零');
      else if(m.rule_type===2&&m.yx_price>10000)errors.push('倍数不能超过100');
      else if(m.rule_type===0&&m.yx_price<0)errors.push('固定价不能为负数');
      else if(m.rule_type!==2&&Math.abs(m.yx_price)>99999999)errors.push('金额绝对值不能超过999999.99元');
      else if(next.rule_object_type===2&&m.rule_type===0)errors.push('分类规则使用加减值或倍数');
      else if(next.rule_object_type===3&&m.rule_type!==2)errors.push('SPU上浮率使用倍数');
      else if(m.rule_type!==2&&!Number.isSafeInteger(m.yx_price))errors.push('金额最多保留两位小数');
      if(m.rule_type===1&&(next.price_type==null||next.price_type===1)){
        const affected=qskus.filter(s=>s[key==='category_2_id'?'category_id_2':key]===m[key]);
        if(affected.some(s=>{const base=next.locking_price_unit===1?s.std_sale_price_forsale:s.sale_price;return base!=null&&!s.is_price_timing&&base+m.yx_price<0;}))errors.push('加减值使当前商品价格为负数，请检查');
      }
    }
    if(next.rule_object_type===4&&(!finite(next.change_rate)||next.change_rate<=0||next.change_rate>100))errors.push('整单折扣倍率需大于0且不超过1');
    const conflicts=errors.length?[]:ruleConflicts(db,next);
    if(conflicts.length)errors.push('与已有规则冲突：'+conflicts.map(i=>db.rules.find(r=>r.id===i).name).join('、'));
    const affected=[...new Set([...old.address_ids,...next.address_ids])];
    return {ok:!errors.length,errors:[...new Set(errors)],kind:'rule',id,old:copy(old),next,conflicts,affected,shared:affected.length>1,fingerprint:JSON.stringify([db.rules,db.links,db.skus])};
  }
  function applyRule(db,p,acknowledged){
    if(!p?.ok)return {ok:false,error:'请先生成有效修改预览'};
    const access=permission(db,'rule',p.next.salemenu_id,p.affected);if(access)return {ok:false,error:access};
    if(p.fingerprint!==JSON.stringify([db.rules,db.links,db.skus]))return {ok:false,error:'规则或商品数据已变化，请重新预览'};
    if(p.shared&&!acknowledged)return {ok:false,error:'请确认本次修改影响所有列出的客户'};
    const fresh=previewRule(db,p.id,p.next);
    if(!fresh.ok||JSON.stringify(fresh.next)!==JSON.stringify(p.next))return {ok:false,error:'预览已经失效，请重新检查'};
    db.rules[db.rules.findIndex(r=>r.id===p.id)]=copy(p.next);
    root.GMP?.record(db,{action:'rule',object_id:p.id,quote_id:p.next.salemenu_id,customer_ids:p.affected,summary:'人工修改价格规则：'+p.next.name,changes:[{field:'价格规则',before:copy(p.old),after:copy(p.next)}],source:'人工编辑'});return {ok:true};
  }
  function taskRow(db,quoteId,skuId,operation,value){
    const s=db.skus.find(s=>s.sku_id===skuId&&s.salemenu_id===quoteId);
    if(!s)return {error:'商品不属于所选报价单'};
    const quoteError=writableQuote(db,quoteId);if(quoteError)return {error:quoteError};
    if((s.fee_type||db.salemenus.find(q=>q.id===quoteId)?.fee_type)!=='CNY')return {error:'本期仅支持人民币商品调价'};
    if(!['set','delta','percent','multiple'].includes(operation)||!finite(value))return {error:'请填写调整方式和有效数值'};
    if(['set','delta'].includes(operation)&&Math.abs(value*100-Math.round(value*100))>1e-7)return {error:'金额最多保留两位小数'};
    if(['set','delta'].includes(operation)&&Math.abs(value)>999999.99)return {error:'金额绝对值不能超过999999.99元'};
    if(operation!=='set'&&(s.sale_price==null||s.is_price_timing))return {error:'待定价或缺失基准价的商品，请直接设置固定价'};
    if((operation==='percent'&&value<=-100)||(operation==='multiple'&&value<=0))return {error:'百分比需大于-100%，倍数需大于0'};
    if((operation==='percent'&&value>9900)||(operation==='multiple'&&value>100))return {error:'百分比不能超过9900%，倍数不能超过100'};
    const price=operation==='set'?value*100:operation==='delta'?s.sale_price+value*100:operation==='percent'?s.sale_price*(1+value/100):s.sale_price*value;
    if(!Number.isFinite(price)||price<0||!moneyOK(round(price)))return {error:'目标价须在0至999999.99元之间'};
    return {sku_id:skuId,sale_price:round(price),operation,value,base_price:s.sale_price,sale_unit_name:s.sale_unit_name,fee_type:s.fee_type||db.salemenus.find(q=>q.id===quoteId)?.fee_type};
  }
  function validateTask(db,draft){
    const errors=[],old=draft.rule_id?db.jobs.find(j=>j.rule_id===draft.rule_id):null;
    if(draft.rule_id&&!old)errors.push('原任务不存在');
    if(old&&old.rule_status!==0)errors.push('仅未开始任务可编辑');
    if(old&&old.salemenu_id!==draft.salemenu_id)errors.push('已保存任务不能更换报价单，请另建任务');
    if(!String(draft.rule_name||'').trim())errors.push('请输入任务名称');
    if(String(draft.rule_name||'').trim().length>80)errors.push('任务名称不能超过80个字符');
    if(/[\r\n\t]/.test(String(draft.rule_name||'')))errors.push('任务名称不能包含换行或制表符');
    if(!db.salemenus.some(q=>q.id===draft.salemenu_id))errors.push('请选择报价单');
    const access=permission(db,'job',draft.salemenu_id,root.GME.linkedCustomers(db,draft.salemenu_id).map(c=>c.address_id)),quoteError=writableQuote(db,draft.salemenu_id);if(access)errors.push(access);if(quoteError)errors.push(quoteError);
    const t=time(draft.effective_time);
    if(!dateOK(day(t))||!clockOK(t.slice(11))||t<=time(current(db)))errors.push('执行时间必须晚于演示当前时间 '+current(db).replace('T',' '));
    if(clockOK(t.slice(11))&&t.slice(14)!=='00')errors.push('计划执行时间仅支持整点，请将分钟设为00');
    const others=db.jobs.filter(j=>j.rule_id!==draft.rule_id&&j.salemenu_id===draft.salemenu_id);
    if(others.some(j=>j.rule_name===String(draft.rule_name||'').trim()))errors.push('同一报价单已有同名任务');
    if(others.some(j=>time(j.effective_time)===t))errors.push('同一报价单的该执行时间已有任务');
    if(!list(draft.items).length)errors.push('请至少添加一个调价商品');
    if(list(draft.items).length>5000)errors.push('每个任务最多5000个商品');
    const seen=new Set();
    for(const row of list(draft.items)){
      if(seen.has(row.sku_id)){errors.push('任务中存在重复商品');continue;}seen.add(row.sku_id);
      const s=db.skus.find(s=>s.sku_id===row.sku_id&&s.salemenu_id===draft.salemenu_id);
      if(!s)errors.push('任务含其他报价单的商品');
      else if((s.fee_type||db.salemenus.find(q=>q.id===draft.salemenu_id)?.fee_type)!=='CNY')errors.push(s.sku_name+'：本期仅支持人民币商品调价');
      else if(!moneyOK(row.sale_price))errors.push(s.sku_name+'：请填写有效目标价');
      else if(s.sale_unit_name!==row.sale_unit_name||(s.fee_type||db.salemenus.find(q=>q.id===draft.salemenu_id)?.fee_type)!==row.fee_type)errors.push(s.sku_name+'：销售单位或币种已变化，请重新添加');
      if(!['set','delta','percent','multiple'].includes(row.operation)||!finite(row.value))errors.push('任务商品的调整方式或数值无效');
      else if(['set','delta'].includes(row.operation)&&(Math.abs(row.value)>999999.99||Math.abs(row.value*100-Math.round(row.value*100))>1e-7))errors.push('固定金额最多两位小数且绝对值不超过999999.99元');
      else if(row.operation==='set'&&row.value<0)errors.push('固定价不能为负数');
      else if(row.operation==='percent'&&(row.value<=-100||row.value>9900))errors.push('百分比须大于-100%且不超过9900%');
      else if(row.operation==='multiple'&&(row.value<=0||row.value>100))errors.push('倍数须大于0且不超过100');
    }return [...new Set(errors)];
  }
  function previewTask(db,draft){
    const errors=validateTask(db,draft),affected=root.GME.linkedCustomers(db,draft.salemenu_id).map(c=>c.address_id),ids=new Set(list(draft.items).map(r=>r.sku_id));
    const overlaps=db.jobs.filter(j=>j.rule_id!==draft.rule_id&&j.salemenu_id===draft.salemenu_id&&j.rule_status===0&&time(j.effective_time)>time(current(db))).map(j=>({rule_id:j.rule_id,rule_name:j.rule_name,effective_time:j.effective_time,sku_ids:list(j.items).filter(r=>ids.has(r.sku_id)).map(r=>r.sku_id),sequence:time(j.effective_time)<time(draft.effective_time)?'before':'after'})).filter(j=>j.sku_ids.length);
    return {ok:!errors.length,errors,kind:'job',draft:copy(draft),fingerprint:JSON.stringify([db.jobs,db.skus,db.links]),affected,shared:affected.length>1,overlaps};
  }
  function saveTask(db,p,acknowledged){
    if(!p?.ok)return {ok:false,error:'请先检查任务预览'};
    if(p.fingerprint!==JSON.stringify([db.jobs,db.skus,db.links]))return {ok:false,error:'任务或报价单数据已变化，请重新预览'};
    const errors=validateTask(db,p.draft);if(errors.length)return {ok:false,error:errors.join('；')};
    if(p.shared&&!acknowledged)return {ok:false,error:'请核对共享报价单的全部关联客户并确认'};
    const d=p.draft,old=db.jobs.find(j=>j.rule_id===d.rule_id);
    const saved={...(old||{}),rule_id:old?.rule_id||'LOCAL-JOB-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),rule_name:d.rule_name.trim(),salemenu_id:d.salemenu_id,effective_time:time(d.effective_time),rule_status:0,items:copy(d.items),abnormal_status:0,failures:[],source_job_id:d.source_job_id||old?.source_job_id||null};
    if(old)db.jobs[db.jobs.indexOf(old)]=saved;else db.jobs.push(saved);
    root.GMP?.record(db,{action:'job',object_id:saved.rule_id,quote_id:saved.salemenu_id,customer_ids:p.affected,summary:(old?'修改':'新建')+'计划调价任务：'+saved.rule_name,changes:[{field:'计划任务',before:old?copy(old):null,after:copy(saved)}],source:d.import_source?'商品导入':d.source_job_id?'异常任务重建':'人工编辑'});
    return {ok:true,id:saved.rule_id};
  }
  root.GMX={period,ruleMembers,ruleReadOnly,writableQuote,previewRule,applyRule,taskRow,validateTask,previewTask,saveTask};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GMX;
})(typeof window!=='undefined'?window:globalThis);
