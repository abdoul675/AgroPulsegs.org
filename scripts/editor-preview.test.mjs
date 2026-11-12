import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';

const source=readFileSync(new URL('../public/editorial-client.js',import.meta.url),'utf8');
const ordering=source.slice(source.indexOf(' const ordered='),source.indexOf('\n let sequence='));
const movement=source.slice(source.indexOf(' function move('),source.indexOf(' function handle('));
const receiver=source.slice(source.indexOf(" window.addEventListener('message'"),source.indexOf(' window.render='));

function preview(){
 const messages=[],applied=[],parent={};let receive;
 const context={messages,applied,parent,Number,JSON,Set,structuredClone,URL,
  CUR:'ressources',locale:()=> 'fr',preview:true,adminOrigin:'https://cms.example.org',
  window:{parent,addEventListener:(_type,handler)=>receive=handler},
  originals:{ressources:{sections:[{id:'exemples',groups:[{title:'A'},{title:'B'}]},{id:'notif',groups:[]}]}},
  apply:(copy,layout)=>applied.push(structuredClone({copy,layout})),send:data=>messages.push(structuredClone(data)),
  reference:()=>({page:'ressources'}),focusPreview:()=>{},
 };
 runInNewContext('let draft=null,revision=0;'+ordering+movement+receiver+'\nglobalThis.moveItem=move;globalThis.state=()=>({draft,revision});',context);
 return {context,messages,applied,dispatch:(data,overrides={})=>receive({source:parent,origin:'https://cms.example.org',data:{channel:'agropulse-editor',page:'ressources',locale:'fr',...data},...overrides})};
}

test('a delayed parent draft cannot undo a newer move in the preview',()=>{
 const p=preview();
 p.dispatch({type:'draft',revision:0,copy:{hero:{title:'Private draft'}},layout:{styles:{cardRadius:24}}});
 p.context.moveItem('section','exemples','exemples',1);
 assert.equal(p.context.state().revision,1);
 assert.deepEqual(Array.from(p.context.state().draft.layout.sections),['notif','exemples']);
 const count=p.applied.length;
 p.dispatch({type:'draft',revision:0,copy:{},layout:{sections:['exemples','notif']}});
 assert.equal(p.applied.length,count,'An old echo must not redraw the page');
 p.dispatch({type:'draft',revision:1,copy:{hero:{title:'Updated copy'}},layout:{sections:['notif','exemples'],styles:{cardRadius:24}}});
 assert.equal(p.applied.at(-1).copy.hero.title,'Updated copy');
 assert.deepEqual(Array.from(p.applied.at(-1).layout.sections),['notif','exemples']);
});

test('section and card moves preserve copy, styles and each other across repeated actions',()=>{
 const p=preview();
 p.dispatch({type:'draft',revision:0,copy:{hero:{title:'Keep text'}},layout:{styles:{cardRadius:24}}});
 p.context.moveItem('card','exemples',0,1);
 p.context.moveItem('section','exemples','exemples',1);
 p.context.moveItem('card','exemples',1,0,true);
 const {draft,revision}=p.context.state();
 assert.equal(revision,3);
 assert.equal(draft.copy.hero.title,'Keep text');
 assert.equal(draft.layout.styles.cardRadius,24);
 assert.deepEqual(Array.from(draft.layout.sections),['notif','exemples']);
 assert.deepEqual(Array.from(draft.layout.cards.exemples),[0,1]);
 assert.equal(p.messages.filter(m=>m.type==='layout').length,3);
});

test('preview ignores messages from another origin, frame, page or language',()=>{
 const p=preview(),payload={type:'draft',revision:0,copy:{hero:{title:'untrusted'}},layout:{}};
 p.dispatch(payload,{origin:'https://untrusted.example'});
 p.dispatch(payload,{source:{}});
 p.dispatch({...payload,page:'accueil'});
 p.dispatch({...payload,locale:'en'});
 assert.equal(p.applied.length,0);
 p.dispatch({type:'hello'});
 assert.equal(p.messages[0].type,'ready');
});
