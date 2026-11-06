import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

test('emitted server entrypoints load their emitted JS dependencies and reject unauthenticated requests', async () => {
  const repo=fileURLToPath(new URL('../',import.meta.url)), root=await mkdtemp(join(tmpdir(),'loft-admin-packaging-'))
  try {
    const config=JSON.parse(await readFile(join(repo,'tsconfig.json'),'utf8'))
    await writeFile(join(root,'package.json'),'{"type":"module"}')
    await symlink(join(repo,'node_modules'),join(root,'node_modules'),'dir')
    await mkdir(join(root,'api'));await mkdir(join(root,'server'))
    for (const file of ['api/getExchangeRate','api/sendNotification','server/exchangeRate','server/types']) {
      const source=await readFile(join(repo,file+'.ts'),'utf8')
      const result=ts.transpileModule(source,{compilerOptions:{...config.compilerOptions,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2023}})
      await writeFile(join(root,file+'.js'),result.outputText)
    }
    const original=globalThis.fetch
    globalThis.fetch=async()=>{throw new Error('Unauthenticated entrypoint must not call a provider')}
    try {
      for (const [entry,method] of [['getExchangeRate','GET'],['sendNotification','POST']]) {
        const {default:handler}=await import(pathToFileURL(join(root,'api',entry+'.js')).href)
        const response={statusCode:200,setHeader(){},status(code:number){this.statusCode=code;return this},json(){return this}}
        await handler({method,headers:{},body:{}},response)
        assert.equal(response.statusCode,401)
      }
    } finally {globalThis.fetch=original}
  } finally {await rm(root,{recursive:true,force:true})}
})
