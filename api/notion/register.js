const DATABASE_ID='32fec733-c98a-802a-8e60-f870dae34805';
function rich(s){return [{type:'text',text:{content:s}}]}
function blocks(s){return (s.match(/[\s\S]{1,1800}/g)||[]).slice(0,80).map(t=>({object:'block',type:'paragraph',paragraph:{rich_text:rich(t)}}))}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'POSTのみ利用できます'});
 if(!process.env.NOTION_TOKEN||!process.env.APP_ACCESS_KEY)return res.status(503).json({error:'Notion連携の秘密キーが未設定です'});
 if(req.headers.authorization!=='Bearer '+process.env.APP_ACCESS_KEY)return res.status(401).json({error:'アプリ用アクセスキーが違います'});
 const {title,content,keywords=''}=req.body||{};
 if(typeof title!=='string'||!title.trim()||title.length>200||typeof content!=='string'||!content.trim()||content.length>100000||typeof keywords!=='string'||keywords.length>1500)return res.status(400).json({error:'登録内容を確認してください'});
 const properties={'タイトル':{title:rich(title.trim())},'内容':{rich_text:rich(content.slice(0,1900))}};
 if(keywords.trim())properties['キーワード']={rich_text:rich(keywords.slice(0,1500))};
 try{
 const response=await fetch('https://api.notion.com/v1/pages',{method:'POST',headers:{Authorization:'Bearer '+process.env.NOTION_TOKEN,'Notion-Version':'2022-06-28','Content-Type':'application/json'},body:JSON.stringify({parent:{database_id:DATABASE_ID},properties,children:blocks(content.slice(1900))})});
 const data=await response.json();if(!response.ok)return res.status(502).json({error:'Notion登録エラー: '+(data.message||response.status)});
 return res.status(200).json({id:data.id,url:data.url,target:'general'});
 }catch{return res.status(502).json({error:'Notionに接続できませんでした'})}
}