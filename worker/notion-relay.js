/**
 * Knowledge Hub → Notion secure relay
 * Deploy as Cloudflare Worker. Configure secrets:
 * NOTION_TOKEN, APP_ACCESS_KEY.
 * Configure ALLOWED_ORIGIN to your exact GitHub Pages origin.
 */
const DATABASE_ID='32fec733-c98a-802a-8e60-f870dae34805';
function reply(data,status=200,origin=''){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...(origin?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}})}
function rich(s){return [{type:'text',text:{content:s}}]}
function textBlocks(s){const chunks=s.match(/[\s\S]{1,1800}/g)||[''];return chunks.slice(0,70).map(t=>({object:'block',type:'paragraph',paragraph:{rich_text:rich(t)}}))}
export default {async fetch(request,env){
 const origin=request.headers.get('origin')||'';
 const allowed=env.ALLOWED_ORIGIN||'';
 const cors=origin===allowed?origin:'';
 if(request.method==='OPTIONS')return new Response(null,{status:cors?204:403,headers:cors?{'access-control-allow-origin':cors,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type, authorization','access-control-max-age':'3600','vary':'Origin'}:{}});
 if(!cors)return reply({error:'許可されていないアクセス元です'},403);
 if(new URL(request.url).pathname!=='/notion/register'||request.method!=='POST')return reply({error:'Not found'},404,cors);
 if(!env.NOTION_TOKEN||!env.APP_ACCESS_KEY)return reply({error:'Workerのシークレット設定が未完了です'},503,cors);
 if(request.headers.get('authorization')!=='Bearer '+env.APP_ACCESS_KEY)return reply({error:'アクセスキーが正しくありません'},401,cors);
 const length=Number(request.headers.get('content-length')||0);if(length>150000)return reply({error:'本文が大きすぎます'},413,cors);
 let data;try{data=await request.json()}catch{return reply({error:'JSON形式が正しくありません'},400,cors)}
 const {title,content,keywords}=data||{};
 if(typeof title!=='string'||typeof content!=='string'||!title.trim()||!content.trim()||title.length>200||content.length>100000||typeof keywords!=='string'||keywords.length>1500)return reply({error:'登録内容を確認してください'},400,cors);
 const props={'タイトル':{title:rich(title.trim().slice(0,200))},'内容':{rich_text:rich(content.slice(0,1900))}};
 if(keywords.trim())props['キーワード']={rich_text:rich(keywords.slice(0,1500))};
 const remaining=content.slice(1900);
 const children=remaining?textBlocks(remaining):[];
 
 try{
  const response=await fetch('https://api.notion.com/v1/pages',{method:'POST',headers:{'authorization':'Bearer '+env.NOTION_TOKEN,'notion-version':'2022-06-28','content-type':'application/json'},body:JSON.stringify({parent:{database_id:DATABASE_ID},properties:props,children})});
  const result=await response.json();
  if(!response.ok)return reply({error:'Notion登録エラー: '+(result.message||response.status)},502,cors);
  return reply({id:result.id,url:result.url,target:'general'},200,cors);
 }catch{return reply({error:'Notionに接続できませんでした'},502,cors)}
}};
