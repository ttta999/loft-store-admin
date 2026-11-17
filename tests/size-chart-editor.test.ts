import test from 'node:test'
import assert from 'node:assert/strict'
import {blankChart,chartError,chartPayload,chartTemplates} from '../src/lib/sizeChartEditor.ts'
test('visual tables preserve bilingual columns and shared cells in the existing server format',()=>{
 const draft={...blankChart(),id:'existing',title_ru:'Обувь',title_uz:'Poyabzal',category_id:'shoes',brand_id:'brand',columns_ru:['EU','Длина стопы, см'],columns_uz:['EU','Oyoq uzunligi, sm'],rows:[['42','']]}
 assert.equal(chartError(draft,'brand'),'')
 assert.deepEqual(chartPayload(draft,'brand').rows,[['42','']])
 assert.equal(chartPayload(draft,'category').brand_id,'')
 assert.notEqual(chartError({...draft,rows:[['','']]},'brand'),'')
 assert.notEqual(chartError({...draft,columns_uz:['EU']},'brand'),'')
 assert.notEqual(chartError({...draft,rows:[['42']]},'brand'),'')
 assert.notEqual(chartError({...draft,product_id:''},'product'),'')
 assert.ok(Object.values(chartTemplates).every(template=>template.ru.length===template.uz.length))
 assert.ok(Object.values(chartTemplates).every(template=>template.ru.every(label=>!/[0-9]/.test(label))))
})
test('explicit mapping is opt in and cannot reference the same or nonexistent column',()=>{
 const draft={...blankChart(),title_ru:'Размеры',title_uz:'O‘lchamlar',category_id:'clothes',columns_ru:['Буква','Число'],columns_uz:['Harf','Raqam'],rows:[['M','42']],size_mapping:{source_system:'alphabetical',target_system:'numeric',source_column:0,target_column:1}}
 assert.equal(chartError(draft,'category'),'');assert.deepEqual(chartPayload(draft,'category').size_mapping,draft.size_mapping)
 assert.notEqual(chartError({...draft,size_mapping:{...draft.size_mapping,target_column:0}},'category'),'')
 assert.notEqual(chartError({...draft,size_mapping:{...draft.size_mapping,target_column:10}},'category'),'')
 assert.notEqual(chartError({...draft,size_mapping:{...draft.size_mapping,source_system:'unknown'}},'category'),'')
})
