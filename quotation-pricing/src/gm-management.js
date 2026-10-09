(function(){
  'use strict';let api,u=null,sequence=0,detail=null;
  const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),copy=v=>JSON.parse(JSON.stringify(v));
  const db=()=>api.db(),help=(text,label)=>GMHelp.button(text,label),field=(label,input,info='')=>`<label class="field"><span>${label}${info?' '+help(info,label+'说明'):''}</span>${input}</label>`;
  const q=id=>db().salemenus.find(q=>q.id===id),s=id=>db().skus.find(s=>s.sku_id===id),currency=sku=>sku.fee_type||q(sku.salemenu_id)?.fee_type||'CNY';
  const money=(v,sku,basic=false)=>v==null||currency(sku)!=='CNY'?'—':(v/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:4})+' 元/'+esc(basic?sku.std_unit_name_forsale:sku.sale_unit_name);
  const names=ids=>ids.map(id=>db().customers.find(c=>c.address_id===id)?.name||id).join('、');
  const opt=(v,label,current)=>`<option value="${v}" ${String(v)===String(current)?'selected':''}>${label}</option>`;
  const operationLabel={set:'固定价',delta:'加减值',percent:'百分比',multiple:'倍数'};
  const operations=(selected,rule=false,type=1)=>Object.entries(operationLabel).filter(([k])=>!rule||k!=='percent'&&(type!==3||k==='multiple')&&(type!==2||k!=='set')).map(([v,l])=>opt(v,l,selected)).join('');
  const nativeOperation={0:'set',1:'delta',2:'multiple'},nativeType={set:0,delta:1,multiple:2};
  const permission=(kind,id,customers=[])=>window.GMP?.error(db(),kind,id,customers)||'';
  function protectedMember(id){return u.kind==='rule'&&u.draft.rule_object_type===3&&GMX.ruleMembers(u.original).some(r=>r.spu_id===id);}
  function hasUnsavedChanges(){
    if(!u||!$('#gm-dialog')?.open||!$('#management-form')&&!$('#management-review'))return false;
    return JSON.stringify(capturedDraft())!==u.initial||!!u.imported||!!u.importing||jobPriceEditorDirty();
  }
  function canClose(){
    if(!u||!$('#gm-dialog')?.open||!$('#management-form')&&!$('#management-review'))return true;
    if(hasUnsavedChanges()&&!window.confirm('有未保存的修改，确定放弃并关闭？'))return false;
    u=null;return true;
  }
  const quoteId=()=>u.kind==='job'?u.draft.salemenu_id:u.draft.salemenu_id;
  const memberKey=()=>u.kind==='job'||u.draft.rule_object_type===1?'sku_id':u.draft.rule_object_type===2?'category_2_id':'spu_id';
  const rows=()=>u.kind==='job'?u.draft.items:GMX.ruleMembers(u.draft);
  function setRows(value){if(u.kind==='job')u.draft.items=value;else u.draft[{1:'skus',2:'category_2_list',3:'spus'}[u.draft.rule_object_type]]=value;}
  function catalog(){
    const products=db().skus.filter(p=>p.salemenu_id===quoteId());
    if(u.kind==='job'||u.draft.rule_object_type===1)return products.map(p=>({id:p.sku_id,label:p.sku_name,sub:p.outer_id+' · '+p.specification_desc,sku:p}));
    const type=u.draft.rule_object_type,key=type===2?'category_id_2':'spu_id';
    return [...new Map(products.map(p=>[p[key],{id:p[key],label:type===2?p.category_name_2:p.spu_name||p.sku_name,sub:p[key],sku:p}])).values()];
  }
  function subset(){return catalog().filter(c=>(!u.query||[c.id,c.label,c.sub].some(x=>String(x).toLowerCase().includes(u.query.toLowerCase())))&&(u.category==='all'||c.sku.category_name_1===u.category)&&(!u.onlySelected||rows().some(r=>r[memberKey()]===c.id)));}
  function header(){
    const d=u.draft,job=u.kind==='job';
    return `<form id="management-form" class="management-form">${field(job?'任务名称':'规则名称',`<input name="rule_name" required maxlength="80" value="${esc(job?d.rule_name:d.name)}">`)}${field('报价单',job?`<select name="salemenu_id" required ${d.rule_id?'disabled':''}>${opt('','请选择报价单',d.salemenu_id)}${db().salemenus.filter(x=>x.id===d.salemenu_id||!GMX.writableQuote(db(),x.id)&&!permission('job',x.id)).map(x=>opt(x.id,esc(x.name),d.salemenu_id)).join('')}</select>`:`<input value="${esc(q(d.salemenu_id)?.name)}" readonly>`,job?'任务保存后不可更换报价单；新建时切换报价单将清空商品。仅修改报价单标准价，关联客户仍按各自规则取价。':'编辑保留原规则的报价单、对象类型、计算基准和计价单位。')}${job?field('计划执行时间',`<input name="effective_time" type="datetime-local" step="3600" required value="${esc(d.effective_time||'')}">`,'演示当前时间为 '+api.now().replace('T',' ')+'。仅支持未来整点，一次执行。保存只安排任务，不立即调价；计划时点不保证秒级完成，时间到达不代表成功。'):''}${job?`<div class="management-context"><span>报价单标准价</span> ${help('先选商品，再批量设置价格，个别商品可单独设置。可直接指定标准价，或按现标准价调整一次；填入后保留目标价，未来不重新按比例计算。','任务价格计算说明')}</div>`:`${field('有效开始日期',`<input name="begin" type="date" required value="${d.begin}">`)}${field('有效结束日期',`<input name="end" type="date" required value="${d.end}">`)}${field('每日开始时间',`<input name="begin_time" type="time" required value="${d.begin_time}">`)}${field('每日结束时间',`<input name="end_time" type="time" required value="${d.end_time}">`)}${field('时段方式',`<select name="time_limit">${opt(2,'当日时段',d.time_limit)}${opt(1,'跨午夜',d.time_limit)}</select>`)}${field('规则开关',`<select name="enabled">${opt('yes','启用',d.status===1?'no':'yes')}${opt('no','停用',d.status===1?'no':'yes')}</select>`,'保存时根据启用状态和有效日期校验原生状态；关闭的历史规则不可修改。')}<div class="full"><div class="section-title">适用客户 ${help('编辑的是原规则，保留原编号。多个客户共用时，修改会影响全部所选客户；保存前需核对影响范围。','适用客户说明')}</div><div class="customer-checks">${GME.linkedCustomers(db(),d.salemenu_id).map(c=>`<label><input type="checkbox" name="address_ids" value="${c.address_id}" ${d.address_ids.includes(c.address_id)?'checked':''}> ${esc(c.name)} <span class="muted">${esc(c.customized_code)}</span></label>`).join('')}</div></div><div class="full management-context">${esc(({1:'SKU规则',2:'二级分类规则',3:'SPU上浮率',4:'整单折扣'})[d.rule_object_type])} · ${d.locking_price_unit===1?'基本单价':'销售单价'} ${help('金额按该规则的计价单位填写；倍率如0.95表示基准价的95%。保留原对象类型，避免将分类或整单规则改成商品固定价。','规则计算说明')}</div>${d.rule_object_type===4?field('整单折扣倍率',`<input name="change_rate" type="number" step="any" min="0.0001" max="1" required value="${d.change_rate/100}">`,'填0.98表示适用商品金额的98%，不包括配送费、运费等费用。'):''}`}</form>`;
  }
  function editor(){
    u.stage='edit';const job=u.kind==='job';
    api.dialog(job?(u.draft.rule_id?'编辑报价单定时任务':'预约报价单调价'):'人工编辑价格规则',`${header()}${!job&&u.draft.rule_object_type===4?'':'<section id="management-products"></section>'}<section id="management-import"></section><p id="management-error" class="error" role="alert"></p>`,`<button class="button" data-action="close-dialog">取消</button><button class="button primary" type="submit" form="management-form">核对${job?'任务':'修改'}</button>`);
    renderProducts();
  }
  function openJob(id){
    const old=id?db().jobs.find(j=>j.rule_id===id):null;if(id&&!old)return;
    if(old&&old.rule_status!==0){viewJob(id);return;}
    let idQ=old?.salemenu_id||api.context().quoteId||'';if(!old&&(GMX.writableQuote(db(),idQ)||permission('job',idQ)))idQ=db().salemenus.find(x=>!GMX.writableQuote(db(),x.id)&&!permission('job',x.id))?.id||'';
    const access=permission('job',idQ)||GMX.writableQuote(db(),idQ);if(access){api.toast(access);return;}
    u={kind:'job',token:++sequence,stage:'edit',draft:old?copy(old):{rule_name:'',salemenu_id:idQ,effective_time:'',items:[]},query:'',category:'all',page:1,size:25,onlySelected:false,bulk:'percent',bulkValue:''};u.draft.items ||= [];u.initial=JSON.stringify(u.draft);editor();
  }
  function openRule(id,sourceTaskId=null){
    const old=db().rules.find(r=>r.id===id);if(!old)return;const blocked=GMX.ruleReadOnly(db(),old)||GMX.writableQuote(db(),old.salemenu_id)||permission('rule',old.salemenu_id,old.address_ids);if(blocked){api.toast(blocked);return;}
    u={kind:'rule',sourceTaskId,token:++sequence,stage:'edit',draft:copy(old),original:copy(old),query:'',category:'all',page:1,size:25,onlySelected:true,bulk:old.rule_object_type===3?'multiple':'delta',bulkValue:''};u.initial=JSON.stringify(u.draft);editor();
  }
  function renderProducts(){
    if(u.kind==='job'){renderJobProducts();return;}
    const root=$('#management-products');if(!root)return;const job=u.kind==='job',type=u.draft.rule_object_type,all=subset(),count=rows().length,pages=Math.max(1,Math.ceil(all.length/u.size));u.page=Math.min(u.page,pages);
    const cats=[...new Set(catalog().map(c=>c.sku.category_name_1))];
    root.innerHTML=`<div class="section-title flex spread"><strong>${job?'调价商品':'规则对象'} <span class="tag">已选 ${count}</span></strong>${help('搜索名称、编码或规格后，可选择本页或全部匹配；跨页选择会保留，仅选择此刻匹配的对象，后续新增商品不自动加入。每次最多5000项。SPU规则原有对象不能在此删除；需到原系统处理。','商品选择说明')}</div><div class="toolbar"><input id="management-query" type="search" maxlength="100" placeholder="搜索名称、编码或规格" value="${esc(u.query)}"><select id="management-category" aria-label="管理商品分类">${opt('all','全部分类',u.category)}${cats.map(c=>opt(c,esc(c),u.category)).join('')}</select><label class="inline-check"><input id="management-only" type="checkbox" ${u.onlySelected?'checked':''}>只看已选</label><select id="management-size" aria-label="管理每页条数">${[25,50,100].map(n=>opt(n,n+'条/页',u.size)).join('')}</select></div><div class="management-actions"><button class="text-button" data-mg="select-page">选择本页</button><button class="text-button" data-mg="select-all">选择全部匹配（${all.length}）</button><button class="text-button" data-mg="clear">清空选择</button>${job?`<span class="action-divider"></span><button class="button" data-mg="template">下载导入模板</button><label class="button import-button">导入商品<input id="management-file" type="file" accept=".csv,.tsv,.xlsx"></label>${help('支持XLSX首张工作表、CSV、TSV。按模板填写商品编码、调整方式、数值和销售单位；也可用“目标价”列。百分比填3表示3%。公式需转为数值；导入检查通过后才会加入任务。','商品导入说明')}`:''}</div><div class="management-bulk"><span>批量设置已选 ${help('仅作用于全部已选对象，包含当前筛选和分页之外的已选项；各行也可单独修改。','批量设置说明')}</span><select id="management-bulk-op" aria-label="批量计算方式">${operations(u.bulk,!job,type)}</select><input id="management-bulk-value" type="number" step="any" aria-label="批量调整数值" placeholder="数值" value="${esc(u.bulkValue)}"><button class="button" data-mg="bulk">应用到已选</button></div><div class="table-scroll management-scroll"><table class="data-table management-table"><thead><tr><th>选择</th><th>商品 / 范围</th><th>${job?'标准价':'计价单位'}</th><th>计算方式</th><th>数值 ${help('固定价与加减值按行内计价单位；百分比填3为上调3%，填-3为下调3%；倍数填1.03为原价的1.03倍。','调整数值说明')}</th><th>${job?'待执行目标价':'设置值'}</th></tr></thead><tbody>${all.slice((u.page-1)*u.size,u.page*u.size).map(c=>{
      const row=rows().find(r=>r[memberKey()]===c.id),op=job?row?.operation:nativeOperation[row?.rule_type],value=job?row?.value:row?.yx_price==null?'':row.yx_price/100,basic=!job&&u.draft.locking_price_unit===1;
      return `<tr><td><input type="checkbox" data-mg-select="${c.id}" aria-label="选择 ${esc(c.label)} ${esc(c.sub)}" ${row?'checked':''} ${protectedMember(c.id)?'disabled':''}></td><td>${esc(c.label)}<div class="small muted">${esc(c.sub)}</div></td><td>${job?c.sku.is_price_timing?'待定价':money(c.sku.sale_price,c.sku):esc(basic?c.sku.std_unit_name_forsale:c.sku.sale_unit_name)}</td><td><select data-mg-op="${c.id}" aria-label="${esc(c.label)}计算方式" ${row?'':'disabled'}>${operations(op||'set',!job,type)}</select></td><td><input data-mg-value="${c.id}" type="number" step="any" aria-label="${esc(c.label)}调整数值" value="${esc(value??'')}" ${row?'':'disabled'}></td><td data-mg-price="${c.id}">${row?row.error?`<span class="error">${esc(row.error)}</span>`:job?money(row.sale_price,c.sku):row.yx_price==null?'待填写':row.rule_type===2?'× '+row.yx_price/100:money(row.yx_price,c.sku,basic):'—'}</td></tr>`;
    }).join('')||'<tr><td colspan="6" class="empty">请选择报价单或调整搜索条件</td></tr>'}</tbody></table></div><div class="pager"><span>共 ${all.length} 条 · ${u.page} / ${pages} 页</span><button class="button" data-mg-page="${u.page-1}" ${u.page===1?'disabled':''}>上一页</button><button class="button" data-mg-page="${u.page+1}" ${u.page===pages?'disabled':''}>下一页</button></div>`;
    GMHelp.upgrade(root);
  }
  const jobConfigured=row=>!!row&&row.sale_price!=null&&Number.isFinite(row.sale_price)&&!row.error;
  function jobPriceDraft(){return u.rowEdit||{operation:u.bulk,value:u.bulkValue};}
  function updateJobPriceDraft(values){
    if(u.rowEdit)Object.assign(u.rowEdit,values);
    else{if('operation' in values)u.bulk=values.operation;if('value' in values)u.bulkValue=values.value;}
  }
  function jobPriceEditorDirty(){return u?.kind==='job'&&!!(u.rowEdit||u.bulkOpen)&&JSON.stringify(jobPriceDraft())!==u.priceInitial;}
  function clearJobPriceEditor(){u.rowEdit=null;u.bulkOpen=false;u.priceError='';}
  function discardJobPriceEditor(){
    if(u.kind!=='job')return true;
    if(jobPriceEditorDirty()&&!window.confirm('放弃尚未填入商品的价格设置？'))return false;
    clearJobPriceEditor();return true;
  }
  function openJobPriceEditor(id){
    if(id&&u.rowEdit?.sku_id===id)return;
    if(!discardJobPriceEditor())return;
    if(id){const row=rows().find(r=>r.sku_id===id);if(!row)return;u.rowEdit=copy(row);}
    else{if(!rows().length)return;u.bulkOpen=true;u.bulk='set';u.bulkValue='';}
    u.priceInitial=JSON.stringify(jobPriceDraft());renderProducts();
    $('#management-price-editor')?.scrollIntoView({block:'nearest'});$('#management-price-value')?.focus();
  }
  function jobPriceError(message){u.priceError=message;const target=$('#management-price-error');if(target)target.textContent=message;}
  function jobValueError(row){
    if(row.value==null||String(row.value).trim()===''||!Number.isFinite(Number(row.value)))return '请填写有效数值。';
    const v=Number(row.value);
    if(['set','delta'].includes(row.operation)&&(Math.abs(v)>999999.99||Math.abs(v*100-Math.round(v*100))>1e-7))return '金额最多两位小数，绝对值不超过999999.99元。';
    if(row.operation==='set'&&v<0)return '报价单标准价不能为负数。';
    if(row.operation==='percent'&&(v<=-100||v>9900))return '百分比须大于-100%且不超过9900%。';
    if(row.operation==='multiple'&&(v<=0||v>100))return '倍数须大于0且不超过100。';
    return '';
  }
  function jobFormula(row,product){
    const v=Number(row.value);
    if(row.operation==='set')return '直接指定价格';
    if(row.operation==='percent')return `标准价${v>=0?'上调':'下调'} ${Math.abs(v)}%`;
    if(row.operation==='multiple')return `标准价 × ${v}`;
    return `标准价 ${v>=0?'+':'−'} ${money(Math.abs(v)*100,product)}`;
  }
  function jobSetting(row,product){
    if(!row)return '<span class="muted">未选入</span>';
    if(row.error)return `<span class="tag amber">需处理</span><div class="small error">${esc(row.error)}</div>`;
    if(!jobConfigured(row))return '<span class="tag amber">待设置</span>';
    return `<strong>目标 ${money(row.sale_price,product)}</strong><div class="small muted">${jobFormula(row,product)}${row.operation==='set'?'':' · 计算一次'}</div>`;
  }
  function renderJobPriceEditor(){
    const target=$('#management-price-editor');if(!target)return;
    if(!u.rowEdit&&!u.bulkOpen){target.innerHTML='';return;}
    const row=jobPriceDraft(),single=!!u.rowEdit,product=single?s(row.sku_id):null,fixed=row.operation==='set';
    const units=[...new Set(rows().map(r=>s(r.sku_id)?.sale_unit_name).filter(Boolean))],unit=single?product.sale_unit_name:units.length===1?units[0]:'按商品单位';
    const label=fixed?`新价格（元/${unit}）`:row.operation==='delta'?`增减金额（元/${unit}）`:row.operation==='percent'?'涨跌幅（%）':'倍数';
    const info=fixed?'直接填写新的报价单标准价，无需选择参考价。保存任务不会立即改价。':'参考填入时的报价单标准价计算一次目标价并保留；到计划时间写入该目标价，不再重新按涨幅计算。例：标准价5元上调3%，目标价为5.15元。';
    const valueInfo=fixed?'金额按商品销售单位填写，最多两位小数；不同销售单位请分批设置或单独设置。':row.operation==='delta'?'增加填正数，减少填负数，例如-0.20表示减0.20元；不同销售单位请分批设置或单独设置。':row.operation==='percent'?'上调填正数，下调填负数，例如3表示上调3%，-3表示下调3%。':'例如1.03表示标准价的1.03倍，0.95表示标准价的95%。';
    const ops=[['percent','按百分比调整'],['delta','加减金额'],['multiple','乘以倍数']].map(([v,label])=>opt(v,label,row.operation)).join('');
    target.innerHTML=`<section class="ct-price-panel" aria-label="价格设置"><div class="flex spread"><strong>${single?'单独设置：'+esc(product.sku_name)+' · '+esc(product.outer_id):'统一设置已选 '+rows().length+' 个商品'}</strong>${help(single?'只修改此商品的任务草稿，其他商品和原目标价保持不变。':'作用于全部已选商品，包含其他页和筛选之外的已选商品；后续新增选品不会自动继承。','本次填写范围说明')}</div><div class="ct-price-fields">${field('定价方式',`<select id="management-price-mode">${opt('fixed','直接指定报价单标准价',fixed?'fixed':'quoteOnce')}${opt('quoteOnce','按现标准价调整一次',fixed?'fixed':'quoteOnce')}</select>`)}${fixed?'':field('怎样调整',`<select id="management-price-op">${ops}</select>`)}${field(label,`<input id="management-price-value" type="number" step="any" value="${esc(row.value??'')}" placeholder="${row.operation==='percent'?'例如 3 或 -3':row.operation==='multiple'?'例如 1.03':'请输入金额'}">`,valueInfo)}</div><div class="ct-save-kind">将保存：<strong>待执行的报价单标准价</strong> ${help(info,'保存方式说明')}${fixed?'':'<span class="small muted">参考：报价单标准价 · 计算一次</span>'}</div><p id="management-price-error" class="error" role="alert">${esc(u.priceError||'')}</p><div class="ct-price-actions"><button class="button" data-mg="cancel-price">取消</button><button class="button primary" data-mg="${single?'apply-price':'apply-bulk-price'}">${single?'填入此商品':'填入已选 '+rows().length+' 个商品'}</button></div></section>`;
    GMHelp.upgrade(target);
  }
  function renderJobProducts(){
    const root=$('#management-products');if(!root)return;
    const all=subset(),list=rows(),pages=Math.max(1,Math.ceil(all.length/u.size));u.page=Math.max(1,Math.min(u.page,pages));
    const count=list.length,ready=list.filter(jobConfigured).length,failed=list.filter(r=>r.error).length,cats=[...new Set(catalog().map(c=>c.sku.category_name_1))],selected=new Map(list.map(r=>[r.sku_id,r]));
    root.innerHTML=`<div class="section-title flex spread"><strong>调价商品 <span class="tag">已选 ${count}</span>${count?` <span class="small muted">已设置 ${ready} · 待设置 ${count-ready-failed}${failed?' · 需处理 '+failed:''}</span>`:''}</strong>${help('先勾选商品，再用“批量设置价格”统一填写；例外商品可“单独设置”。选品只加入任务，不会默认沿用现价。最多5000项。','商品设置步骤')}</div><div class="toolbar"><input id="management-query" type="search" maxlength="100" aria-label="搜索调价商品" placeholder="搜索名称、编码或规格" value="${esc(u.query)}"><select id="management-category" aria-label="管理商品分类">${opt('all','全部分类',u.category)}${cats.map(c=>opt(c,esc(c),u.category)).join('')}</select><label class="inline-check"><input id="management-only" type="checkbox" ${u.onlySelected?'checked':''}>只看已选</label><select id="management-size" aria-label="管理每页条数">${[25,50,100].map(n=>opt(n,n+'条/页',u.size)).join('')}</select></div><div class="ct-selection"><button class="text-button" data-mg="select-page">选择本页</button><button class="text-button" data-mg="select-all">选择全部匹配（${all.length}）</button><button class="text-button" data-mg="clear" ${count?'':'disabled'}>清空选择</button><button class="button" data-mg="open-bulk-price" ${count?'':'disabled'}>批量设置价格${count?'（'+count+'）':''}</button></div><div class="management-actions"><button class="button" data-mg="template">下载导入模板</button><label class="button import-button">导入商品<input id="management-file" type="file" accept=".csv,.tsv,.xlsx"></label>${help('支持XLSX首张工作表、CSV、TSV。按模板填写商品编码、调整方式、数值和销售单位；也可用“目标价”列。百分比填3表示3%。公式需转为数值；检查并确认导入后加入草稿，可再单独设置。','商品导入说明')}</div><div id="management-price-editor"></div><div class="table-scroll ct-product-scroll"><table class="data-table job-products-table"><thead><tr><th>选择</th><th>商品／规格</th><th>报价单标准价 ${GMHelp.priceTip('报价单标准价')}</th><th>本次价格设置 ${help('显示已填入草稿的待执行目标价；按标准价调整一次会同时显示计算方式。目标价已确定，执行时不重新计算。没有填入的编辑不会改变此列。','本次价格设置说明')}</th><th>操作</th></tr></thead><tbody>${all.slice((u.page-1)*u.size,u.page*u.size).map(c=>{
      const row=selected.get(c.id);
      return `<tr><td><input type="checkbox" data-mg-select="${esc(c.id)}" aria-label="选择 ${esc(c.label)} ${esc(c.sub)}" ${row?'checked':''}></td><td><strong>${esc(c.label)}</strong><div class="small muted">${esc(c.sub)}</div><div class="small muted">${esc(c.sku.sale_unit_name)}</div></td><td>${c.sku.is_price_timing?'待定价（时价）':money(c.sku.sale_price,c.sku)}</td><td>${jobSetting(row,c.sku)}</td><td>${row?`<button class="text-button" data-mg-edit-price="${esc(c.id)}">单独设置</button>`:'—'}</td></tr>`;
    }).join('')||'<tr><td colspan="5" class="empty">请选择报价单或调整搜索条件</td></tr>'}</tbody></table></div><div class="pager"><span>共 ${all.length} 条 · ${u.page} / ${pages} 页</span><button class="button" data-mg-page="${u.page-1}" ${u.page===1?'disabled':''}>上一页</button><button class="button" data-mg-page="${u.page+1}" ${u.page===pages?'disabled':''}>下一页</button></div>`;
    renderJobPriceEditor();GMHelp.upgrade(root);if(u.imported)renderImport();
  }
  function applyJobPrices(){
    const entry=jobPriceDraft(),single=!!u.rowEdit,targets=single?rows().filter(r=>r.sku_id===entry.sku_id):rows(),error=jobValueError(entry);
    if(error){jobPriceError(error);return;}if(!targets.length){jobPriceError('请先选择商品。');return;}
    if(['set','delta'].includes(entry.operation)&&new Set(targets.map(r=>{const product=s(r.sku_id);return currency(product)+'|'+product.sale_unit_name;})).size>1){jobPriceError('固定金额不能跨销售单位设置，请分批选择或使用“单独设置”。');return;}
    const next=targets.map(row=>{const result=GMX.taskRow(db(),quoteId(),row.sku_id,entry.operation,Number(entry.value));return result.error?{...row,operation:entry.operation,value:Number(entry.value),sale_price:null,error:result.error}:result;});
    if(single&&next[0].error){jobPriceError(next[0].error);return;}
    const overwrite=targets.filter((row,i)=>jobConfigured(row)&&(row.operation!==next[i].operation||row.value!==next[i].value||row.sale_price!==next[i].sale_price)).length;
    if(!single&&overwrite&&!window.confirm(`将覆盖 ${overwrite} 个商品已有的不同价格设置，确定填入？`))return;
    const replacements=new Map(next.map(row=>[row.sku_id,row]));setRows(rows().map(row=>replacements.get(row.sku_id)||row));
    clearJobPriceEditor();$('#management-error').textContent='';renderProducts();
    const failed=next.filter(row=>row.error).length;api.toast(failed?`已填入草稿，${failed} 个商品需单独处理；全部修正后才能保存任务。`:'价格已填入任务草稿，请核对后保存。');
  }
  function add(c){
    if(!c)return;
    if(rows().some(r=>r[memberKey()]===c.id))return;
    if(rows().length>=5000){api.toast('每次最多选择5000项。');return;}
    if(u.kind==='job')rows().push({sku_id:c.id,sale_price:null,operation:'set',value:null,sale_unit_name:c.sku.sale_unit_name,fee_type:currency(c.sku)});
    else{const type=u.draft.rule_object_type,entry={[memberKey()]:c.id,rule_type:type===1?0:type===2?1:2,yx_price:type===1?(c.sku.is_price_timing?null:u.draft.locking_price_unit===1?c.sku.std_sale_price_forsale:c.sku.sale_price):type===2?0:100};rows().push(entry);}
  }
  function capturedDraft(){
    const draft=copy(u.draft),f=$('#management-form');if(!f)return draft;const data=Object.fromEntries(new FormData(f));
    if(u.kind==='job'){draft.rule_name=data.rule_name;draft.effective_time=data.effective_time;}
    else{for(const key of ['begin','end','begin_time','end_time'])draft[key]=data[key];draft.name=data.rule_name;draft.time_limit=Number(data.time_limit);draft.status=data.enabled==='no'?1:draft.begin>db().fixtureDate?2:3;draft.address_ids=[...f.querySelectorAll('[name="address_ids"]:checked')].map(x=>x.value);if(draft.rule_object_type===4)draft.change_rate=data.change_rate===''?null:Number(data.change_rate)*100;}
    return draft;
  }
  function capture(){if(u)u.draft=capturedDraft();}
  function updateRow(id,op,raw){
    const i=rows().findIndex(r=>r[memberKey()]===id);if(i<0)return;const value=raw===''?NaN:Number(raw);
    if(u.kind==='job'){const next=GMX.taskRow(db(),quoteId(),id,op,value);rows()[i]=next.error?{...rows()[i],operation:op,value:Number.isNaN(value)?null:value,sale_price:null,error:next.error}:next;}
    else{rows()[i].rule_type=nativeType[op];rows()[i].yx_price=Number.isNaN(value)?null:Math.round(value*100*1e8)/1e8;}
  }
  function review(){
    if(u.kind==='job'&&(u.rowEdit||u.bulkOpen)){ $('#management-error').textContent='请先填入或取消正在编辑的价格设置，再核对任务。';return; }
    if(u.kind==='job'&&(u.imported||u.importing)){ $('#management-error').textContent='请先完成或取消商品导入，再核对任务。';return; }
    if(api.guard&&api.guard()===false){$('#management-error').textContent='其他窗口已更新数据，请核对表单并再次生成预览。';return;}
    capture();const errors=rows().filter(r=>r.error).map(r=>r.error);u.preview=u.kind==='job'?GMX.previewTask(db(),u.draft):GMX.previewRule(db(),u.draft.id,u.draft);
    if(errors.length||!u.preview.ok){$('#management-error').textContent=[...new Set([...errors,...u.preview.errors])].join('；');return;}
    u.stage='review';u.reviewPage=1;u.ack=false;
    // Details remain visible; explanatory notes live in help tooltips.
    api.dialog(u.kind==='job'?'核对计划调价任务':'核对规则修改',`<div id="management-review"></div><p id="management-error" class="error" role="alert"></p>`,`<button class="button" data-mg="back">返回编辑</button><button class="button primary" data-mg="save">${u.kind==='job'?'保存任务':'保存原规则'}</button>`);renderReview();
  }
  function renderReview(){
    const p=u.preview,job=u.kind==='job',d=job?p.draft:p.next,all=job?d.items:GMX.ruleMembers(d),pages=Math.max(1,Math.ceil(all.length/25)); const removed=job?[]:GMX.ruleMembers(p.old).filter(r=>!all.some(x=>x[memberKey()]===r[memberKey()]));
    $('#management-review').innerHTML=`<div class="review-summary"><strong>${esc(job?d.rule_name:d.name)}</strong><div>${esc(q(d.salemenu_id)?.name)} · ${job?esc(d.effective_time.replace('T',' ')):esc(d.begin+' 至 '+d.end+' / '+d.begin_time+'–'+d.end_time)}</div><div>${job?'关联':'影响'}客户：${esc(names(p.affected))} ${help(job?'任务只保存目标价，不立即改价；阶梯价、客户协议价、时价仍按原生优先顺序取价。':'将更新原规则，保留规则编号；客户、日期、范围和价格一起校验。移出的客户不再适用本条规则。','影响范围说明')}</div>${!job?`<div>原名称：${esc(p.old.name)} → 新名称：${esc(d.name)}</div><div>适用客户：${esc(names(p.old.address_ids))} → ${esc(names(d.address_ids))}</div><div>有效日期：${p.old.begin} 至 ${p.old.end} → ${d.begin} 至 ${d.end}</div><div>每日时段：${p.old.begin_time}–${p.old.end_time} → ${d.begin_time}–${d.end_time} · ${d.time_limit===1?'跨午夜':'当日'}</div><div>状态：${({1:'无效',2:'未开始',3:'有效'})[p.old.status]} → ${({1:'无效',2:'未开始',3:'有效'})[d.status]}</div>${removed.length?`<div>移出 ${removed.length} 个对象：${esc(removed.map(x=>catalog().find(c=>c.id===x[memberKey()])?.label||x[memberKey()]).join('、'))}</div>`:''}`:''}</div>${!job&&d.rule_object_type===4?`<p>整单折扣：× ${p.old.change_rate/100} → × ${d.change_rate/100}</p>`:`<div class="table-scroll"><table class="data-table management-table"><thead><tr><th>商品 / 对象</th><th>${job?'计算时标准价':'原值'}</th><th>${job?'本次价格设置':'计算方式'}</th><th>${job?'待执行目标价':'新设置值'}</th></tr></thead><tbody>${all.slice((u.reviewPage-1)*25,u.reviewPage*25).map(row=>{
      const c=catalog().find(c=>c.id===row[memberKey()]),old=job?null:GMX.ruleMembers(p.old).find(x=>x[memberKey()]===row[memberKey()]);
      return `<tr><td>${esc(c?.label||row[memberKey()])}<div class="muted small">${esc(c?.sub||'')}</div></td><td>${job?row.operation==='set'||row.base_price==null?'—':money(row.base_price,c.sku):old?setting(old,c.sku,p.old):'新增'}</td><td>${job?jobFormula(row,c.sku):operationLabel[nativeOperation[row.rule_type]]}</td><td>${job?money(row.sale_price,c.sku):setting(row,c.sku,d)}</td></tr>`;
    }).join('')}</tbody></table></div><div class="pager"><span>${all.length} 条 · ${u.reviewPage} / ${pages} 页</span><button class="button" data-mg-review-page="${u.reviewPage-1}" ${u.reviewPage===1?'disabled':''}>上一页</button><button class="button" data-mg-review-page="${u.reviewPage+1}" ${u.reviewPage===pages?'disabled':''}>下一页</button></div>`}${job?overlapSummary(p):''}${p.shared?`<label class="shared-ack"><input id="management-ack" type="checkbox" ${u.ack?'checked':''}> 我已核对全部 ${p.affected.length} 个客户的影响范围</label>`:''}${help(job?'按创建或编辑时的基准计算一次，保存的目标价不会在执行时重新随标准价计算。此原型不连接执行队列。':'修改前后日期或每日时段的变化也影响客户取价；旧的对话预览将在保存后失效。','保存说明')}`;
  }
  function setting(row,sku,r){return row.rule_type===2?'× '+row.yx_price/100:(row.rule_type===1?'加减 ':'固定 ')+money(row.yx_price,sku,r.locking_price_unit===1);}
  function overlapSummary(p){
    if(!p.overlaps?.length)return '';
    return `<div class="management-overlap"><strong>与 ${p.overlaps.length} 个待执行任务有重复商品</strong> ${help('按计划时间排序展示；若两次任务均成功写入，同一商品后写入的目标价覆盖前值。任务不会重新按比例计算。发生延迟、失败或同一时段人工改价时，以实际写入结果为准。','任务重叠说明')}<ul>${p.overlaps.map(j=>`<li>${esc(j.rule_name)} · ${esc(j.effective_time.replace('T',' '))} · ${j.sku_ids.length} 个重复商品 · ${j.sequence==='before'?'计划先执行，本任务随后写入':'计划后执行，将再次写入目标价'}</li>`).join('')}</ul></div>`;
  }
  function save(){
    if(api.guard&&api.guard()===false){$('#management-error').textContent='其他窗口已更新数据，本预览已失效，请返回编辑后重新预览。';return;}
    const sourceError=u.kind==='rule'?window.GMT?.nativeSourceError(db(),u.sourceTaskId,u.preview?.id):'';if(sourceError){$('#management-error').textContent=sourceError;return;}
    const result=u.kind==='job'?GMX.saveTask(db(),u.preview,!!$('#management-ack')?.checked):GMX.applyRule(db(),u.preview,!!$('#management-ack')?.checked);
    if(!result.ok){$('#management-error').textContent=result.error;return;}const kind=u.kind;if(kind==='rule')window.GMT?.fromRuleEdit(db(),u.preview.old,u.preview.next,api.now(),u.sourceTaskId);api.commit();u=null;api.close(true);api.render();api.toast(kind==='job'?'已保存待执行任务（本地演示）':'已更新原价格规则，并记录客户协议调价任务（本地演示）');
  }
  function viewJob(id){
    const j=db().jobs.find(j=>j.rule_id===id);if(!j)return;u=null;detail={job:j,page:1,query:'',failurePage:1,failureQuery:''};
    const failures=Array.isArray(j.failures)?j.failures:[],blocked=permission('job',j.salemenu_id)||GMX.writableQuote(db(),j.salemenu_id);
    api.dialog('计划调价任务详情',`<div class="review-summary"><strong>${esc(j.rule_name)}</strong><div>${esc(q(j.salemenu_id)?.name)} · ${esc(j.effective_time.replace('T',' '))}</div><div>${({0:'未开始',1:'已生效',2:'已结束'})[j.rule_status]} ${help('原生状态不等于全部商品成功。存在异常时，请查看失败商品；已经成功的商品不自动撤回。时间到达不会在本地自动改变状态。','任务状态说明')}</div><div>异常标识：${Number(j.abnormal_status)?'<span class="error">有异常</span>':'无异常'}</div></div>${Number(j.abnormal_status)||failures.length?`<section class="management-failures"><div class="section-title"><strong>失败商品 · ${failures.length} 项</strong> ${help('保留已成功项；修正后只把有明确失败明细的商品复制到新草稿。必须重新设置整点执行时间并核对价格，不自动重试或撤回原任务。','异常处理说明')}</div>${failures.length?`<div class="toolbar"><input id="management-failure-query" type="search" maxlength="100" placeholder="搜索失败商品名称、编码、规格或原因" aria-label="搜索失败商品"></div><div id="management-task-failures"></div><button class="button" data-mg="copy-failed" ${blocked?'disabled':''}>复制全部失败项新建任务</button>${blocked?help(blocked,'重建任务限制'):''}`:'<p class="error">当前缺少失败商品明细，请在原系统核查；不能自动生成重试草稿。</p>'}</section>`:''}<div class="toolbar"><input id="management-detail-query" type="search" maxlength="100" placeholder="搜索任务商品名称、编码或规格" aria-label="搜索任务商品"></div><div id="management-task-detail"></div>`);renderTaskDetail();renderTaskFailures();
  }
  function copyFailedJob(id){
    const old=db().jobs.find(j=>j.rule_id===id);if(!old)return;
    const blocked=permission('job',old.salemenu_id)||GMX.writableQuote(db(),old.salemenu_id);if(blocked){api.toast(blocked);return;}
    const ids=[...new Set((old.failures||[]).map(f=>f.sku_id))];if(!ids.length){api.toast('没有明确失败商品，不能生成重试草稿。');return;}
    if(ids.some(id=>!(old.items||[]).some(r=>r.sku_id===id))){api.toast('部分失败项缺少原目标价格，请先在原系统核查。');return;}
    const items=ids.map(id=>{const oldRow=old.items.find(r=>r.sku_id===id),row=GMX.taskRow(db(),old.salemenu_id,id,'set',oldRow.sale_price/100);return row.error?{...copy(oldRow),error:row.error}:row;});
    u={kind:'job',token:++sequence,stage:'edit',draft:{rule_name:(old.rule_name+' · 失败项重建').slice(0,80),salemenu_id:old.salemenu_id,effective_time:'',items,source_job_id:id},query:'',category:'all',page:1,size:25,onlySelected:true,bulk:'percent',bulkValue:''};u.initial='';editor();api.toast('已复制失败项。请修正问题并填写新的整点执行时间，原任务保持不变。');
  }
  function renderTaskFailures(){
    const root=$('#management-task-failures');if(!root||!detail)return;
    const query=detail.failureQuery.toLowerCase(),all=(detail.job.failures||[]).filter(f=>{const sku=s(f.sku_id);return !query||[f.sku_id,f.reason,sku?.sku_name,sku?.outer_id,sku?.specification_desc].some(v=>String(v||'').toLowerCase().includes(query));}),pages=Math.max(1,Math.ceil(all.length/25));detail.failurePage=Math.min(detail.failurePage,pages);
    root.innerHTML=`<div class="table-scroll"><table class="data-table"><thead><tr><th>商品</th><th>失败原因</th></tr></thead><tbody>${all.slice((detail.failurePage-1)*25,detail.failurePage*25).map(f=>`<tr><td>${esc(s(f.sku_id)?.sku_name||f.sku_id)}<div class="muted small">${esc(s(f.sku_id)?.outer_id||f.sku_id)} · ${esc(s(f.sku_id)?.specification_desc||'—')}</div></td><td>${esc(f.reason||'—')}</td></tr>`).join('')||'<tr><td colspan="2" class="empty">没有匹配的失败商品，请调整搜索条件</td></tr>'}</tbody></table></div><div class="pager"><span>匹配 ${all.length} / 全部 ${detail.job.failures.length} 项 · ${detail.failurePage} / ${pages} 页</span><button class="button" data-mg-failure-page="${detail.failurePage-1}" ${detail.failurePage===1?'disabled':''}>上一页</button><button class="button" data-mg-failure-page="${detail.failurePage+1}" ${detail.failurePage===pages?'disabled':''}>下一页</button></div>`;
  }
  function renderTaskDetail(){
    const all=(detail.job.items||[]).filter(r=>{const sku=s(r.sku_id);return !detail.query||[r.sku_id,sku?.sku_name,sku?.outer_id,sku?.specification_desc].some(v=>String(v||'').toLowerCase().includes(detail.query.toLowerCase()));}),pages=Math.max(1,Math.ceil(all.length/25));detail.page=Math.min(detail.page,pages);
    $('#management-task-detail').innerHTML=`<div class="table-scroll"><table class="data-table"><thead><tr><th>商品</th><th>本次价格设置</th><th>任务目标价</th></tr></thead><tbody>${all.slice((detail.page-1)*25,detail.page*25).map(r=>`<tr><td>${esc(s(r.sku_id)?.sku_name||r.sku_id)}<div class="muted small">${esc(s(r.sku_id)?.outer_id)}</div></td><td>${s(r.sku_id)?jobFormula(r,s(r.sku_id)):'—'}</td><td>${s(r.sku_id)?money(r.sale_price,s(r.sku_id)):'—'}</td></tr>`).join('')||'<tr><td colspan="3" class="empty">当前筛选没有商品明细</td></tr>'}</tbody></table></div><div class="pager"><span>共 ${all.length} 条 · ${detail.page} / ${pages} 页</span><button class="button" data-mg-detail-page="${detail.page-1}" ${detail.page===1?'disabled':''}>上一页</button><button class="button" data-mg-detail-page="${detail.page+1}" ${detail.page===pages?'disabled':''}>下一页</button></div>`;
  }
  function download(){
    const list=catalog().filter(c=>rows().some(r=>r.sku_id===c.id)),chosen=list.length?list:catalog().slice(0,2);
    if(!quoteId()){api.toast('请先选择报价单。');return;}
    const quoteCell=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
    const data=[['商品编码','调整方式','数值','销售单位'],...chosen.map(c=>[c.sku.outer_id,'固定价',c.sku.is_price_timing?'':c.sku.sale_price==null?'':c.sku.sale_price/100,c.sku.sale_unit_name])].map(r=>r.map(quoteCell).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+data],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='调价商品模板-'+quoteId()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importFile(file){
    if(!file)return;if(!quoteId()){api.toast('请先选择报价单。');return;}if(!discardJobPriceEditor()){if($('#management-file'))$('#management-file').value='';return;}renderJobPriceEditor();const token=u.token,qid=quoteId();u.imported=null;u.importing=true;$('#management-import').textContent='正在检查文件…';
    try{const table=await GMImport.read(file);if(!u||u.token!==token||quoteId()!==qid||!$('#management-form')||!$('#gm-dialog').open)return;
      u.imported=GMImport.validate(table,db(),qid);renderImport();
    }catch(e){if(u?.token===token&&$('#management-import'))$('#management-import').innerHTML='<p class="error">'+esc(e.message)+'</p>';}
    finally{if(u?.token===token){u.importing=false;if($('#management-file'))$('#management-file').value='';}}
  }
  function renderImport(){
    const r=u.imported,existing=new Set(rows().map(x=>x.sku_id)),duplicates=r.items.filter(x=>existing.has(x.sku_id)).length;
    $('#management-import').innerHTML=r.errors.length?`<div class="import-check"><strong>导入未通过 · ${r.errors.length} 项问题</strong><ul class="error">${r.errors.slice(0,30).map(e=>'<li>'+esc(e)+'</li>').join('')}</ul>${r.errors.length>30?'<p>仅显示前30项，请修正后重新导入。</p>':''}<button class="button" data-mg="cancel-import">取消导入</button></div>`:`<div class="import-check"><div class="flex spread"><strong>检查通过 · ${r.items.length} 个商品</strong><span>新增 ${r.items.length-duplicates} · 更新已选 ${duplicates}</span></div><div class="table-scroll"><table class="data-table"><thead><tr><th>商品</th><th>本次价格设置</th><th>待执行目标价</th></tr></thead><tbody>${r.items.slice(0,10).map(x=>`<tr><td>${esc(s(x.sku_id).sku_name)}</td><td>${jobFormula(x,s(x.sku_id))}</td><td>${money(x.sale_price,s(x.sku_id))}</td></tr>`).join('')}</tbody></table></div><div class="toolbar"><span class="muted">${r.items.length>10?'展示前10条，确认后可搜索全部导入项。':''}</span><button class="button" data-mg="cancel-import">取消</button><button class="button primary" data-mg="confirm-import">${duplicates?'确认导入并更新重复项':'确认导入'}</button></div></div>`;
  }
  function rerenderWithFocus(){const a=document.activeElement,id=a?.id,start=a?.selectionStart;renderProducts();const n=id?document.getElementById(id):null;if(n){n.focus();try{n.setSelectionRange(start,start);}catch(_){}}}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
    if(d.mg==='copy-failed'&&detail){copyFailedJob(detail.job.rule_id);return;}
    if(d.mgFailurePage&&detail){detail.failurePage=Number(d.mgFailurePage);renderTaskFailures();return;}
    if(d.gmJobNew!==undefined){openJob();return;}if(d.gmJobView){viewJob(d.gmJobView);return;}if(d.mgDetailPage&&detail){detail.page=Number(d.mgDetailPage);renderTaskDetail();return;}
    if(!u||!$('#gm-dialog').open)return;
    if(d.mgEditPrice&&u.kind==='job'){capture();openJobPriceEditor(d.mgEditPrice);return;}
    if(d.mgPage){u.page=Number(d.mgPage);renderProducts();return;}
    if(d.mgReviewPage){u.ack=!!$('#management-ack')?.checked;u.reviewPage=Number(d.mgReviewPage);renderReview();return;}
    if(!d.mg)return;
    if(d.mg==='back'){editor();return;}if(d.mg==='save'){save();return;}
    capture();
    if(d.mg==='open-bulk-price'){openJobPriceEditor();return;}
    if(d.mg==='cancel-price'){clearJobPriceEditor();renderProducts();return;}
    if(d.mg==='apply-price'||d.mg==='apply-bulk-price'){applyJobPrices();return;}
    if(['select-page','select-all','clear','confirm-import'].includes(d.mg)&&!discardJobPriceEditor())return;
    if(d.mg==='select-page'||d.mg==='select-all'){let items=subset();if(d.mg==='select-page')items=items.slice((u.page-1)*u.size,u.page*u.size);items.forEach(add);renderProducts();}
    if(d.mg==='clear'){setRows(rows().filter(r=>protectedMember(r[memberKey()])));renderProducts();if(u.kind==='rule'&&u.draft.rule_object_type===3)api.toast('原有SPU对象保留；删除需在原系统处理。');}
    if(d.mg==='bulk'){
      const op=$('#management-bulk-op').value,raw=$('#management-bulk-value').value;u.bulk=op;u.bulkValue=raw;
      if(!rows().length||raw===''){api.toast('请先选择商品并填写数值。');return;}
      if(['set','delta'].includes(op)){const selected=catalog().filter(c=>rows().some(r=>r[memberKey()]===c.id));if(new Set(selected.map(c=>currency(c.sku)+'|'+(u.kind==='rule'&&u.draft.locking_price_unit===1?c.sku.std_unit_name_forsale:c.sku.sale_unit_name))).size>1){api.toast('固定金额需使用相同计价单位，请分批设置。');return;}}
      rows().map(r=>r[memberKey()]).forEach(id=>updateRow(id,op,raw));renderProducts();
    }
    if(d.mg==='template')download();
    if(d.mg==='cancel-import'){u.imported=null;$('#management-import').innerHTML='';}
    if(d.mg==='confirm-import'&&u.imported&&!u.imported.errors.length){const map=new Map(rows().map(x=>[x.sku_id,x]));u.imported.items.forEach(x=>map.set(x.sku_id,x));if(map.size>5000){api.toast('导入后超过5000个商品，请减少选择后再确认。');return;}u.draft.items=[...map.values()];u.draft.import_source=true;u.imported=null;$('#management-import').innerHTML='';u.onlySelected=true;u.query='';u.page=1;renderProducts();api.toast('已加入任务草稿，请核对后保存。');}
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='management-failure-query'&&detail){detail.failureQuery=e.target.value.slice(0,100);detail.failurePage=1;renderTaskFailures();return;}
    if(e.target.id==='management-detail-query'&&detail){detail.query=e.target.value.slice(0,100);detail.page=1;renderTaskDetail();return;}if(!u||u.stage!=='edit')return;const t=e.target,d=t.dataset;
    if(t.id==='management-query'){u.query=t.value.slice(0,100);u.page=1;rerenderWithFocus();}
    else if(t.id==='management-price-value'){updateJobPriceDraft({value:t.value});u.priceError='';$('#management-price-error').textContent='';}
    else if(t.id==='management-bulk-value')u.bulkValue=t.value;
    else if(d.mgValue){const op=document.querySelector(`[data-mg-op="${d.mgValue}"]`).value;updateRow(d.mgValue,op,t.value);const row=rows().find(r=>r[memberKey()]===d.mgValue),c=catalog().find(c=>c.id===d.mgValue);document.querySelector(`[data-mg-price="${d.mgValue}"]`).textContent=row.error|| (u.kind==='job'?money(row.sale_price,c.sku):row.yx_price==null?'待填写':setting(row,c.sku,u.draft));}
  });
  document.addEventListener('change',e=>{
    if(!u||u.stage!=='edit'||!$('#management-form'))return;const t=e.target,d=t.dataset;
    if(t.name==='salemenu_id'){
      if(u.draft.rule_id){t.value=u.draft.salemenu_id;api.toast('已保存任务不能更换报价单。');return;}
      if(t.value===u.draft.salemenu_id)return;
      if((rows().length||u.imported||u.importing)&&!window.confirm('切换报价单将清空已选商品和待导入内容，确定切换？')){t.value=u.draft.salemenu_id;return;}
      capture();u.draft.salemenu_id=t.value;u.draft.items=[];delete u.draft.import_source;clearJobPriceEditor();u.query='';u.page=1;u.category='all';u.imported=null;u.importing=false;u.token=++sequence;$('#management-import').innerHTML='';renderProducts();api.toast('已切换报价单，任务商品已清空。');
    }
    else if(t.id==='management-category'){u.category=t.value;u.page=1;renderProducts();}
    else if(t.id==='management-only'){u.onlySelected=t.checked;u.page=1;renderProducts();}
    else if(t.id==='management-size'){u.size=Number(t.value);u.page=1;renderProducts();}
    else if(t.id==='management-bulk-op')u.bulk=t.value;
    else if(t.id==='management-price-mode'){updateJobPriceDraft({operation:t.value==='fixed'?'set':'percent',value:''});u.priceError='';renderJobPriceEditor();}
    else if(t.id==='management-price-op'){updateJobPriceDraft({operation:t.value,value:''});u.priceError='';renderJobPriceEditor();}
    else if(t.id==='management-file')importFile(t.files[0]);
    else if(d.mgSelect){if(!discardJobPriceEditor()){t.checked=rows().some(r=>r[memberKey()]===d.mgSelect);return;}if(t.checked)add(catalog().find(c=>c.id===d.mgSelect));else if(!protectedMember(d.mgSelect))setRows(rows().filter(r=>r[memberKey()]!==d.mgSelect));renderProducts();}
    else if(d.mgOp){const input=document.querySelector(`[data-mg-value="${d.mgOp}"]`);updateRow(d.mgOp,t.value,input.value);renderProducts();}
  });
  document.addEventListener('submit',e=>{if(e.target.id==='management-form'){e.preventDefault();review();}});
  window.GMM={connect:bridge=>api=bridge,openRule,openJob,viewJob,copyFailedJob,canClose,hasUnsavedChanges,get state(){return u;}};
})();
