// Profiles supplied by the project owner on 6 November 2026.
export const socialProfiles = [
  {
    "name": "Facebook",
    "url": "https://www.facebook.com/share/1Dsafj48jn/?mibextid=wwXIfr",
    "icon": "<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\"><path d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z\"></path></svg>"
  },
  {
    "name": "X",
    "url": "https://x.com/agropulsegs",
    "icon": "<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\"><path d=\"M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.2-8.3L1.2 2h6.5l4.5 6.8L18.9 2zm-1.1 18h1.7L6.8 4H5L17.8 20z\"/></svg>"
  },
  {
    "name": "TikTok",
    "url": "https://www.tiktok.com/@agropulse.global",
    "icon": "<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\"><path d=\"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z\"></path></svg>"
  }
];
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function applySocialLinks(html){
 const links=socialProfiles.map(profile=>{const fr=profile.name+' — AgroPulse (nouvel onglet)',en=profile.name+' — AgroPulse (new tab)';return '<a href="'+escape(profile.url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+escape(fr)+'" data-fr-aria-label="'+escape(fr)+'" data-en-aria-label="'+escape(en)+'">'+profile.icon+'</a>';}).join('');
 const pattern=/<div class="soc"[^>]*>[\s\S]*?<\/div>/u;
 if(!pattern.test(html))throw new Error('Missing social footer');
 html=html.replace(pattern,'<div class="soc" style="margin-top:14px">'+links+'</div>');
 if(!html.includes('/* AgroPulse social links */'))html=html.replace('</style>','/* AgroPulse social links */.fcols .soc a{display:grid;place-items:center;min-width:44px;min-height:44px;margin:0}.soc a:focus-visible{outline:3px solid #ffdf8d;outline-offset:4px}</style>');
 html=html.replace(".soc a{min-width:44px;min-height:44px}",".fcols .soc a{display:grid;place-items:center;min-width:44px;min-height:44px;margin:0}");
 return html;
}
