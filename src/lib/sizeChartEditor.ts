export type ChartDraft={id:string|null;title_ru:string;title_uz:string;category_id:string;subcategory_id:string;brand_id:string;product_id:string;columns_ru:string[];columns_uz:string[];rows:string[][];size_mapping?:{source_system:string;target_system:string;source_column:number;target_column:number}|null}
export type ChartScope='category'|'brand'|'product'
export const blankChart=():ChartDraft=>({id:null,title_ru:'',title_uz:'',category_id:'',subcategory_id:'',brand_id:'',product_id:'',columns_ru:['Размер'],columns_uz:['O‘lcham'],rows:[['']]})
export const chartTemplates={
 shoes:{ru:['Размер EU','Длина стопы, см'],uz:['EU o‘lcham','Oyoq uzunligi, sm']},
 clothing:{ru:['Размер','Обхват груди, см','Обхват талии, см'],uz:['O‘lcham','Ko‘krak aylanasi, sm','Bel aylanasi, sm']},
 trousers:{ru:['Размер','Обхват талии, см','Длина по внутреннему шву, см'],uz:['O‘lcham','Bel aylanasi, sm','Ichki chok uzunligi, sm']},
 custom:{ru:['Размер'],uz:['O‘lcham']},
}
export function chartError(d:ChartDraft,scope:ChartScope){
 if(d.size_mapping&&(!['numeric','alphabetical','EU','UK','US','IT'].includes(d.size_mapping.source_system)||!['numeric','alphabetical','EU','UK','US','IT'].includes(d.size_mapping.target_system)||d.size_mapping.source_column===d.size_mapping.target_column||[d.size_mapping.source_column,d.size_mapping.target_column].some(i=>!Number.isInteger(i)||i<0||i>=d.columns_ru.length)))return 'Проверьте системы и колонки соответствия размеров'
 if(!d.title_ru.trim()||!d.title_uz.trim())return 'Укажите название на русском и узбекском'
 if(!d.category_id||(scope==='brand'&&!d.brand_id)||(scope==='product'&&!d.product_id))return 'Выберите область действия таблицы'
 if(!d.columns_ru.length||d.columns_ru.length>12||d.columns_ru.length!==d.columns_uz.length||[...d.columns_ru,...d.columns_uz].some(v=>!v.trim()||v.length>80))return 'Заполните заголовки колонок на двух языках'
 if(!d.rows.length||d.rows.length>100||d.rows.some(row=>row.length!==d.columns_ru.length||row.every(v=>!v.trim())||row.some(v=>v.length>200)))return 'Заполните строки таблицы и удалите пустые строки'
 return ''
}
export function chartPayload(d:ChartDraft,scope:ChartScope){return {...d,title_ru:d.title_ru.trim(),title_uz:d.title_uz.trim(),brand_id:scope==='category'?'':d.brand_id,product_id:scope==='product'?d.product_id:'',columns_ru:d.columns_ru.map(v=>v.trim()),columns_uz:d.columns_uz.map(v=>v.trim()),rows:d.rows.map(r=>r.map(v=>v.trim()))}}
