import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
function setup(){
 const storage=new Map<string,string>(),context:any={localStorage:{getItem:(key:string)=>storage.get(key)||null,setItem:(key:string,value:string)=>storage.set(key,value)},document:{documentElement:{lang:''}}}
 const exports:Record<string,any>={}
 const load=(path:string):any=>{if(exports[path])return exports[path];const module={exports:{}};const source=readFileSync(new URL('../src/lib/'+path+'.ts',import.meta.url),'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext('(function(require,module,exports){'+code+'})',context)((name:string)=>name==='react'?{useSyncExternalStore(){}}:load(name.replace(/^\.\//,'')),module,module.exports);return exports[path]=module.exports}
 return {i:load('i18n'),ru:load('locales/ru').ru,uz:load('locales/uz').uz,storage,context}
}
test('all UI translations have matching placeholders, no Russian copy in Uzbek dictionary',()=>{
 const {ru,uz}=setup();assert.deepEqual(Object.keys(uz).sort(),Object.keys(ru).sort());assert.ok(Object.keys(ru).length>800)
 for(const key of Object.keys(ru)){assert.ok(uz[key]?.trim(),key);assert.doesNotMatch(uz[key],/[А-Яа-яЁё]/,key);assert.deepEqual((uz[key].match(/\{\d+\}/g)||[]).sort(),(ru[key].match(/\{\d+\}/g)||[]).sort(),key)}
})
test('language is scoped to each manager, survives visits, formats UI without translating arbitrary content',()=>{
 const {i,storage,context}=setup();i.setLanguageScope('manager-a');i.setAdminLanguage('uz');assert.equal(i.t('Заказы'),'Buyurtmalar');assert.equal(i.tx('Активный'),'Qabul qilindi');assert.equal(i.tx('Customer text'),'Customer text');assert.equal(i.uiError('internal database relation error'),i.t('Не удалось выполнить действие. Попробуйте ещё раз.'));assert.equal(context.document.documentElement.lang,'uz');i.setLanguageScope('manager-b');assert.equal(i.t('Заказы'),'Заказы');i.setLanguageScope('manager-a');assert.equal(i.t('Заказы'),'Buyurtmalar');i.setLanguageScope(null);assert.equal(i.getAdminLanguage(),'ru');assert.equal(storage.get('loft-admin-language:manager-a'),'uz')
})
