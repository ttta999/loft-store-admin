import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/getExchangeRate.ts'
process.env.SUPABASE_URL='https://currency-fixture.supabase.co'
process.env.SUPABASE_ANON_KEY='fixture-anon'
process.env.SUPABASE_SERVICE_ROLE_KEY='fixture-server'
test('currency refresh requires admin MFA and rate-limit capacity before calling any external provider',async()=>{
  const original=globalThis.fetch; let allowed=false,capacity=false,providers=0
  globalThis.fetch=async input=>{
    const url=new URL(String(input))
    if(url.hostname==='cbu.uz'){providers++;return Response.json([{Ccy:'USD',Rate:'12000'}])}
    assert.equal(url.hostname,'currency-fixture.supabase.co')
    if(url.pathname.endsWith('/user'))return Response.json({id:'fixture-admin'})
    if(url.pathname.endsWith('/store_is_admin'))return Response.json(allowed)
    if(url.pathname.endsWith('/store_rate_limit'))return Response.json(capacity)
    throw new Error('Unexpected request')
  }
  const response=()=>({statusCode:200,body:null as any,setHeader(){},status(code:number){this.statusCode=code;return this},json(body:any){this.body=body;return this}})
  try{
    for(const [auth,role,quota,expected] of [['',false,false,401],['Bearer fixture',false,false,403],['Bearer fixture',true,false,429],['Bearer fixture',true,true,200]] as const){
      allowed=role;capacity=quota;const res=response()
      await handler({method:'GET',headers:{authorization:auth}} as any,res as any)
      assert.equal(res.statusCode,expected)
    }
    assert.equal(providers,1)
  }finally{globalThis.fetch=original}
})
