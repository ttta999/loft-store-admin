import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

test('MFA login challenges only an owner-approved verified factor',async()=> {
  const root=await mkdtemp(join(tmpdir(),'loft-admin-mfa-'))
  const repo=fileURLToPath(new URL('../',import.meta.url))
  try {
    await writeFile(join(root,'package.json'),'{"type":"module"}')
    await writeFile(join(root,'supabase.js'),`
      export const state={member:true,required:true,verified:false,approved:'existing-factor',level:'aal1',allowed:false,enrollments:0,signedOut:0,revocations:0,failedRevocation:false};
      export const detachAdminSession=()=>{state.signedOut++;return 'fixture-token'};
      export const prepareAdminLogin=async()=>{};
      export const isAdminSessionCurrent=()=>true;
      export const supabase={
        rpc:async name=>({data:name==='store_admin_auth_state'?{isAdmin:state.member,mfaRequired:state.required,factorId:state.approved}:state.allowed,error:null}),
        auth:{
          signInWithPassword:async()=>({data:{user:{id:'admin-fixture'}},error:null}),
          signOut:async()=>{state.signedOut++;return {error:null}},
          admin:{signOut:async()=>{state.revocations++;return {error:state.failedRevocation?{status:503}:null}}},
          getUser:async()=>({data:{user:{id:'admin-fixture'}},error:null}),
          mfa:{
            listFactors:async()=>({data:{totp:state.verified?[{id:'existing-factor',status:'verified'}]:[],all:[]},error:null}),
            getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:state.level},error:null}),
            enroll:async()=>{state.enrollments++;return {data:{id:'new-factor',totp:{qr_code:'test-qr',secret:'test-secret'}},error:null}},
            challengeAndVerify:async({code})=>{if(code!=='123456')return {error:{message:'invalid'}};state.level='aal2';state.verified=true;state.allowed=true;return {error:null}},
            unenroll:async()=>({error:null}),
          }
        }
      };
    `)
    const source=(await readFile(join(repo,'src/lib/auth.ts'),'utf8')).replace("from './supabase'","from './supabase.js'")
    await writeFile(join(root,'auth.js'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2023}}).outputText)
    const auth=await import(pathToFileURL(join(root,'auth.js')).href)
    const {state}=await import(pathToFileURL(join(root,'supabase.js')).href)
    const enrolled=await auth.login('admin@example.test','test-password')
    assert.equal(enrolled.success,false)
    assert.equal(state.enrollments,0)
    assert.equal(state.allowed,false)
    assert.equal(await auth.getCurrentUser(),null)
    state.verified=true
    const approved=await auth.login('admin@example.test','test-password')
    assert.deepEqual(approved.mfa,{factorId:'existing-factor'})
    await assert.rejects(()=>auth.verifySecondFactor('existing-factor','000000'))
    assert.equal(await auth.getCurrentUser(),null)
    await auth.verifySecondFactor('existing-factor','123456')
    assert.equal((await auth.getCurrentUser()).id,'admin-fixture')
    state.level='aal1';state.allowed=false
    const challenge=await auth.login('admin@example.test','test-password')
    assert.deepEqual(challenge.mfa,{factorId:'existing-factor'})
    assert.equal(state.enrollments,0)
    state.level='aal2';state.allowed=false
    const stale=await auth.login('admin@example.test','test-password')
    assert.ok(stale.mfa)
    assert.equal(await auth.getCurrentUser(),null)
    state.member=false
    const outsider=await auth.login('outsider@example.test','test-password')
    assert.equal(outsider.success,false)
    assert.equal(state.signedOut,2)
    assert.equal(state.enrollments,0)
    state.failedRevocation=true
    const before=state.revocations
    const first=auth.logout()
    assert.equal(auth.logout(),first)
    assert.deepEqual(await first,{success:false})
    assert.equal(state.revocations,before+1)
    state.failedRevocation=false
    assert.deepEqual(await auth.retryLogout(),{success:true})
    assert.equal(state.revocations,before+2)
  } finally { await rm(root,{recursive:true,force:true}) }
})
