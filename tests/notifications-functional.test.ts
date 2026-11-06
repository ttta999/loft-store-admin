import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/sendNotification.ts'
process.env.SUPABASE_URL='https://admin-functional.supabase.co'
process.env.SUPABASE_ANON_KEY='fixture-anon'
process.env.SUPABASE_SERVICE_ROLE_KEY='fixture-service'
process.env.TELEGRAM_BOT_TOKEN='12345:fixture-only'
const request=(body:any,auth='Bearer fixture',method='POST')=>({method,headers:{authorization:auth},body}) as any
const response=()=>({statusCode:200,body:null as any,setHeader(){return this},status(code:number){this.statusCode=code;return this},json(data:any){this.body=data;return this}})
const body={chatId:'900000001',botType:'client',message:'Тестовое сообщение'}
test('manager notifications require a verified manager, a known customer and rate-limit capacity',async()=>{
 const original=globalThis.fetch;let allowed=false,known=false,capacity=false,sent=0
 globalThis.fetch=async(input,init)=>{
  const url=new URL(String(input))
  if(url.hostname==='api.telegram.org'){sent++;return Response.json({ok:true})}
  assert.equal(url.hostname,'admin-functional.supabase.co')
  if(url.pathname.endsWith('/auth/v1/user'))return Response.json({id:'fixture-admin'})
  if(url.pathname.endsWith('/rpc/store_is_admin'))return Response.json(allowed)
  if(url.pathname.endsWith('/rpc/store_rate_limit'))return Response.json(capacity)
  if(url.pathname.endsWith('/rpc/store_queue_admin_message'))return Response.json({id:1001,user_id:body.chatId,payload:{message:body.message}})
  if(url.pathname.endsWith('/rpc/store_claim_custom_notification'))return Response.json({id:1001,user_id:body.chatId,payload:{message:body.message}})
  if(url.pathname.endsWith('/rpc/store_complete_notification'))return Response.json(null)
  if(url.pathname.endsWith('/orders')||url.pathname.endsWith('/china_requests')) {assert.equal(url.searchParams.get('user_id'),'eq.900000001');return Response.json(known?[{id:1}]:[])}
  throw Error('Unexpected request')
 }
 try{
  for(const [patch,expected] of [[{},403],[{allowed:true},403],[{known:true},429],[{capacity:true},200]] as any){if(patch.allowed)allowed=true;if(patch.known)known=true;if(patch.capacity)capacity=true;const res=response();await handler(request(body),res as any);assert.equal(res.statusCode,expected)}
  assert.equal(sent,1)
 }finally{globalThis.fetch=original}
})
test('manager notification input cannot select another bot, inject a recipient or send empty messages',async()=>{
 const original=globalThis.fetch;let sent=0
 globalThis.fetch=async(input)=>{const url=new URL(String(input));if(url.hostname==='api.telegram.org'){sent++;throw Error('Sending forbidden')};if(url.pathname.endsWith('/user'))return Response.json({id:'fixture-admin'});if(url.pathname.endsWith('/rpc/store_is_admin'))return Response.json(true);throw Error('Unexpected request')}
 try{
  for(const invalid of [{...body,botType:'manager'},{...body,chatId:'-100123'},{...body,message:' '},{...body,message:'a'.repeat(4001)}]){const res=response();await handler(request(invalid),res as any);assert.equal(res.statusCode,400)}
  const noAuth=response();await handler(request(body,''),noAuth as any);assert.equal(noAuth.statusCode,401)
  const method=response();await handler(request(body,'','GET'),method as any);assert.equal(method.statusCode,405);assert.equal(sent,0)
 }finally{globalThis.fetch=original}
})
