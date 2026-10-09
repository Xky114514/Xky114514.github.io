(function(root){
  'use strict';
  const roles={
    manager:{id:'manager',name:'定价主管',cost:true,customer:true,quote:true,job:true,shared:true,audit:true},
    sales:{id:'sales',name:'报价员',cost:false,customer:true,quote:false,job:false,shared:false,audit:false},
    viewer:{id:'viewer',name:'查看者',cost:false,customer:false,quote:false,job:false,shared:false,audit:false}
  };
  const role=db=>roles[db.demoRole]||roles.viewer;
  function error(db,action,quoteId,customerIds=[]){
    const r=role(db),q=(db.salemenus||[]).find(q=>q.id===quoteId);
    if(!q)return '请先选择有效报价单';
    if(q.station_id&&q.station_id!==db.station_id)return '报价单不属于当前站点，无法调整';
    if(!q.is_active)return '报价单已停用，仅可查看';
    if(q.fee_type!=='CNY')return '本期仅支持人民币调价，外币报价单只读';
    if(action==='quote'&&!r.quote)return '当前角色无权修改报价单标准价';
    if(action==='job'&&!r.job)return '当前角色无权管理计划调价任务';
    if(['customer','rule'].includes(action)&&!r.customer)return '当前角色无权修改客户价格规则';
    if(['customer','rule'].includes(action)&&new Set(customerIds).size>1&&!r.shared)return '当前角色无权修改多个客户共用的价格规则';
    return '';
  }
  function record(db,event){
    db.operationLogs ||= [];
    db.operationLogs.push({id:'LOG-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),time:db.meta?.now||db.fixtureDate+'T10:00',actor:role(db).name+'（演示）',role:role(db).id,action:event.action,object_id:event.object_id||'',quote_id:event.quote_id||'',customer_ids:[...new Set(event.customer_ids||[])],summary:event.summary||'',changes:JSON.parse(JSON.stringify(event.changes||[])),source:event.source||'人工确认',sequence:db.operationLogs.length+1});
  }
  root.GMP={roles,role,error,record};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GMP;
})(typeof window!=='undefined'?window:globalThis);
