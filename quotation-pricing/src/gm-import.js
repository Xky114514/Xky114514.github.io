(function(root){
  'use strict';
  function csv(text){
    const rows=[];let row=[],cell='',quoted=false;const sep=text.split(/\r?\n/)[0].includes('\t')?'\t':',';
    for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===sep&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}
    if(quoted)throw Error('CSV 引号未闭合');if(cell||row.length){row.push(cell);rows.push(row);}return rows.filter(r=>r.some(x=>String(x).trim()));
  }
  async function unzip(buffer){
    const bytes=new Uint8Array(buffer),view=new DataView(buffer);let end=bytes.length-22;
    while(end>=Math.max(0,bytes.length-65558)&&view.getUint32(end,true)!==0x06054b50)end--;
    if(end<0||end<bytes.length-65558)throw Error('无法读取此 XLSX，请使用标准 Excel 工作簿');
    let cursor=view.getUint32(end+16,true),total=0;const count=view.getUint16(end+10,true),files={};
    if(count>1500)throw Error('工作簿内容过多，请仅导入调价工作表');
    for(let i=0;i<count;i++){
      if(view.getUint32(cursor,true)!==0x02014b50)throw Error('工作簿目录损坏');
      const method=view.getUint16(cursor+10,true),compressed=view.getUint32(cursor+20,true),size=view.getUint32(cursor+24,true),n=view.getUint16(cursor+28,true),extra=view.getUint16(cursor+30,true),comment=view.getUint16(cursor+32,true),offset=view.getUint32(cursor+42,true);
      const name=new TextDecoder().decode(bytes.slice(cursor+46,cursor+46+n));cursor+=46+n+extra+comment;
      total+=size;if(total>20*1024*1024)throw Error('工作簿解压后超过20MB，请精简后导入');
      if(!name.endsWith('.xml')&&!name.endsWith('.rels'))continue;
      if(view.getUint16(offset+6,true)&1)throw Error('不支持加密工作簿');
      const start=offset+30+view.getUint16(offset+26,true)+view.getUint16(offset+28,true),data=bytes.slice(start,start+compressed);
      let raw;if(method===0)raw=data;else if(method===8){raw=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());}else throw Error('不支持此工作簿压缩格式');
      if(raw.length!==size)throw Error('工作簿文件长度不一致');files[name]=new TextDecoder().decode(raw);
    }return files;
  }
  const xml=t=>{const d=new DOMParser().parseFromString(t||'','application/xml');if(d.querySelector('parsererror'))throw Error('工作簿 XML 无效');return d;};
  async function xlsx(buffer){
    const files=await unzip(buffer),strings=[];
    const percentStyles=new Set();
    if(files['xl/styles.xml']){const styles=xml(files['xl/styles.xml']),custom=new Map([...styles.getElementsByTagName('numFmt')].map(n=>[Number(n.getAttribute('numFmtId')),n.getAttribute('formatCode')||'']));const formats=styles.getElementsByTagName('cellXfs')[0];if(formats)[...formats.children].forEach((f,i)=>{const id=Number(f.getAttribute('numFmtId'));if(id===9||id===10||custom.get(id)?.includes('%'))percentStyles.add(i);});}
    if(files['xl/sharedStrings.xml'])for(const si of xml(files['xl/sharedStrings.xml']).getElementsByTagName('si'))strings.push([...si.getElementsByTagName('t')].map(t=>t.textContent).join(''));
    const book=xml(files['xl/workbook.xml']),first=book.getElementsByTagName('sheet')[0];if(!first)throw Error('工作簿没有工作表');
    const relId=first.getAttribute('r:id'),rels=xml(files['xl/_rels/workbook.xml.rels']);
    const rel=[...rels.getElementsByTagName('Relationship')].find(r=>r.getAttribute('Id')===relId);if(!rel)throw Error('找不到首张工作表');
    const target=rel.getAttribute('Target'),path=target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.\//,'');
    if(!files[path])throw Error('首张工作表不可读取');
    const rows=[];for(const r of xml(files[path]).getElementsByTagName('row')){
      const row=[];for(const c of r.getElementsByTagName('c')){if(c.getElementsByTagName('f').length)throw Error('第 '+r.getAttribute('r')+' 行含公式，请粘贴为数值后导入');if(percentStyles.has(Number(c.getAttribute('s')||0)))throw Error('第 '+r.getAttribute('r')+' 行使用百分比单元格格式，请改为常规数值；上调3%填写3，倍率95%填写0.95');
        const ref=c.getAttribute('r')||'A1';let col=0;for(const ch of ref.replace(/\d/g,''))col=col*26+ch.charCodeAt(0)-64;
        const type=c.getAttribute('t'),v=c.getElementsByTagName('v')[0]?.textContent||'';row[col-1]=type==='s'?strings[Number(v)]||'':type==='inlineStr'?[...c.getElementsByTagName('t')].map(n=>n.textContent).join(''):v;
      }if(row.some(v=>String(v||'').trim()))rows.push(row);
    }return rows;
  }
  async function read(file){
    if(file.size>5*1024*1024)throw Error('文件超过5MB，请分批导入');const data=await file.arrayBuffer();
    if(/\.xlsx$/i.test(file.name))return xlsx(data);
    if(!/\.(csv|tsv)$/i.test(file.name))throw Error('支持 XLSX、CSV、TSV；旧版 XLS 请另存为 XLSX');
    let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(data);}catch(_){text=new TextDecoder('gb18030').decode(data);}return csv(text.replace(/^\uFEFF/,''));
  }
  function validate(rows,db,quoteId){
    if(!rows.length)return {errors:['文件没有内容'],items:[]};
    const header=rows[0].map(v=>String(v||'').trim()),at=name=>header.indexOf(name),errors=[],items=[],seen=new Set();
    if(new Set(header.filter(Boolean)).size!==header.filter(Boolean).length)errors.push('存在重复列名，请保留唯一列名');
    if(at('商品编码')<0&&at('SKU')<0)errors.push('缺少“商品编码”或“SKU”列');
    if(at('目标价')<0&&(at('调整方式')<0||at('数值')<0))errors.push('需提供“调整方式＋数值”或“目标价”列');
    if(at('销售单位')<0)errors.push('需提供“销售单位”列');
    if(rows.length>5001)errors.push('单次最多导入5000行');if(errors.length)return {errors,items};
    const all=db.skus.filter(s=>s.salemenu_id===quoteId),ops={'固定价':'set','设为固定价':'set','加减值':'delta','加减固定金额':'delta','百分比':'percent','按百分比调整':'percent','倍数':'multiple','乘以倍数':'multiple',set:'set',delta:'delta',percent:'percent',multiple:'multiple'};
    rows.slice(1).forEach((row,i)=>{
      const get=name=>String(row[at(name)]??'').trim(),prefix='第 '+(i+2)+' 行：';
      const matched=all.filter(s=>get('SKU')?s.sku_id===get('SKU'):s.outer_id===get('商品编码'));
      if(matched.length!==1){errors.push(prefix+'商品不存在、编码不唯一或属于其他报价单');return;}const s=matched[0];
      if(get('SKU')&&get('商品编码')&&s.outer_id!==get('商品编码')){errors.push(prefix+'SKU与商品编码不匹配');return;}
      if(seen.has(s.sku_id)){errors.push(prefix+'文件中商品重复');return;}seen.add(s.sku_id);
      const currency=s.fee_type||db.salemenus.find(q=>q.id===quoteId)?.fee_type;
      if(get('销售单位')!==s.sale_unit_name){errors.push(prefix+'销售单位不匹配');return;}
      // Native price metadata still guards imports; the current template needs no currency column.
      if(currency!=='CNY'){errors.push(prefix+'当前报价单不支持导入调价');return;}
      if(at('币种')>=0&&get('币种')&&get('币种').toUpperCase()!==currency){errors.push(prefix+'旧文件的币种与当前商品不符，请使用当前模板');return;}
      const explicit=get('目标价'),operation=explicit?'set':ops[get('调整方式')],raw=explicit||get('数值');
      if(!/^-?\d+(\.\d+)?$/.test(raw)){errors.push(prefix+'数值必须为数字，百分比填3表示3%');return;}
      const item=root.GMX.taskRow(db,quoteId,s.sku_id,operation,Number(raw));if(item.error)errors.push(prefix+item.error);else items.push(item);
    });
    if(!items.length&&!errors.length)errors.push('没有商品数据行');return {errors,items};
  }
  root.GMImport={read,validate,csv};if(typeof module!=='undefined'&&module.exports)module.exports=root.GMImport;
})(typeof window!=='undefined'?window:globalThis);
