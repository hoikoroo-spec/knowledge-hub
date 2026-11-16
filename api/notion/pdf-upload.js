export const config={api:{bodyParser:false}};
const DB='4574e726dab04a09a9e95bf426332098';
const ALLOWED_ORIGINS=new Set(['https://hoikoroo-spec.github.io','https://knowledge-hub-hoikoroo-6618.vercel.app']);
const headers={Authorization:'Bearer '+(process.env.NOTION_TOKEN||''),'Notion-Version':'2022-06-28'};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(ALLOWED_ORIGINS.has(req.headers.origin))res.setHeader('Access-Control-Allow-Origin',req.headers.origin);
 res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
 res.setHeader('Access-Control-Allow-Headers','Authorization,Content-Type,X-PDF-Filename');
 res.setHeader('Vary','Origin');
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='POST')return res.status(405).json({error:'POSTのみ対応'});
 if(req.headers.origin&&!ALLOWED_ORIGINS.has(req.headers.origin))return res.status(403).json({error:'許可されていない送信元です'});
 if(!process.env.NOTION_TOKEN||!process.env.APP_ACCESS_KEY)return res.status(503).json({error:'連携設定がありません'});
 if(req.headers.authorization!=='Bearer '+process.env.APP_ACCESS_KEY)return res.status(401).json({error:'アクセスキーが違います'});
 const filename=decodeURIComponent(req.headers['x-pdf-filename']||'');
 if(!filename.endsWith('.pdf')||filename.length>180)return res.status(400).json({error:'PDFファイル名を確認してください'});
 const parts=[];let size=0;
 try{
  for await(const part of req){size+=part.length;if(size>18*1024*1024)return res.status(413).json({error:'PDFは18MB以下にしてください'});parts.push(part)}
  const pdf=Buffer.concat(parts);
  if(pdf.subarray(0,5).toString()!=='%PDF-')return res.status(400).json({error:'PDF形式ではありません'});
  const h={...headers,'Content-Type':'application/json'};
  const create=await fetch('https://api.notion.com/v1/file_uploads',{method:'POST',headers:h,body:JSON.stringify({mode:'single_part',filename,content_type:'application/pdf'})});
  const upload=await create.json();
  if(!create.ok)throw new Error('アップロード準備: '+(upload.message||create.status));
  const form=new FormData();form.append('file',new Blob([pdf],{type:'application/pdf'}),filename);
  const sent=await fetch('https://api.notion.com/v1/file_uploads/'+upload.id+'/send',{method:'POST',headers,body:form});
  const sentData=await sent.json();if(!sent.ok)throw new Error('PDF送信: '+(sentData.message||sent.status));
  const page=await fetch('https://api.notion.com/v1/pages',{method:'POST',headers:h,body:JSON.stringify({parent:{database_id:DB},properties:{'タイトル':{title:[{text:{content:filename}}]},'PDF':{files:[{type:'file_upload',name:filename,file_upload:{id:upload.id}}]}}})});
  const result=await page.json();if(!page.ok)throw new Error('データベース登録: '+(result.message||page.status));
  return res.status(200).json({ok:true,url:result.url,id:result.id});
 }catch(e){return res.status(502).json({error:e.message||'Notionへの送信に失敗しました'})}
}