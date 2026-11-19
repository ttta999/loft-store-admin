import test from 'node:test'
import assert from 'node:assert/strict'
import {PANTS_SIZE_GRID,shopSizeOptions} from '../src/lib/shopSizeGrid.ts'
test('shop pants grid has eleven numeric sizes while legacy variant labels remain untouched',()=>{
 assert.equal(PANTS_SIZE_GRID.length,11);assert.deepEqual(PANTS_SIZE_GRID,['36','38','40','42','44','46','48','50','52','54','56'])
 const actual=['M','48'],before=[...actual];assert.deepEqual(shopSizeOptions('clothes','pants',actual),[...PANTS_SIZE_GRID,'M']);assert.deepEqual(actual,before)
 assert.deepEqual(shopSizeOptions('shoes','sneakers',['42']),['42'])
})
