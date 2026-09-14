/* Explore v2: stable navigation, morphology, number systems, speech levels, culture, and etymology. */
(() => {
  let exploreData={grammarGuide:[],wordBuilding:[],numbers:null,speechLevels:[],honorificSystem:[],culture:[]};
  let vocabEnrichment={};
  let exploreMode='grammar';

  const rrCho=['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
  const rrJung=['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
  const rrJong=['','k','k','k','n','n','n','t','l','k','m','p','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','h'];
  function romanize(text){return [...String(text||'')].map(ch=>{const c=ch.charCodeAt(0);if(c<0xAC00||c>0xD7A3)return ch;const n=c-0xAC00,a=Math.floor(n/588),b=Math.floor((n%588)/28),d=n%28;return rrCho[a]+rrJung[b]+rrJong[d]}).join('').replace(/\s+/g,' ').trim()}
  function naverUrl(word){return 'https://en.dict.naver.com/#/search?query='+encodeURIComponent(word)}
  function visualKind(x){const hay=[x.korean,x.meaning,...(x.tags||[])].join(' ').toLowerCase();if(/school|class|student|teacher|수업|학교|학생|선생/.test(hay))return'school';if(/book|서점|책|library/.test(hay))return'book';if(/airport|taxi|bus|subway|transport|공항|택시|버스|지하철|역|정류장/.test(hay))return'transport';if(/phone|전화|message|call/.test(hay))return'phone';if(/health|body|cold|head|stomach|doctor|감기|머리|배|몸|아프/.test(hay))return'health';if(/food|restaurant|coffee|rice|밥|음식|식당|커피|카페/.test(hay))return'food';if(/clothes|shirt|pants|wear|옷|셔츠|바지|입다|색/.test(hay))return'clothes';if(/weather|rain|snow|hot|cold|날씨|비|눈|덥|춥/.test(hay))return'weather';if(/money|price|won|원|가격|비/.test(hay))return'money';if(/home|family|집|가족|어머니|아버지|동생/.test(hay))return'home';return'word'}
  function sceneSvg(kind){const common='<rect width="64" height="64" rx="14" fill="#eef6f1"/><circle cx="50" cy="14" r="8" fill="#d89a3a" opacity=".85"/>';const map={
    school:`${common}<rect x="13" y="25" width="38" height="25" rx="3" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M10 25h44L32 13 10 25Z" fill="#9fc7b2" stroke="#365446" stroke-width="2"/><path d="M21 50V34h22v16" fill="#e7efe9" stroke="#365446" stroke-width="2"/><path d="M29 41h6" stroke="#c9683c" stroke-width="2"/>`,
    book:`${common}<path d="M16 18h20c5 0 8 3 8 8v24H24c-5 0-8-3-8-8V18Z" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M44 22h5v28h-5M25 26h11M25 33h11M25 40h8" stroke="#4c7a66" stroke-width="2" stroke-linecap="round"/>`,
    transport:`${common}<rect x="13" y="23" width="38" height="21" rx="5" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M19 23l4-8h18l4 8M20 44l-4 7M44 44l4 7" stroke="#365446" stroke-width="2" stroke-linecap="round"/><circle cx="23" cy="44" r="4" fill="#365446"/><circle cx="41" cy="44" r="4" fill="#365446"/><path d="M21 30h22" stroke="#9fc7b2" stroke-width="5"/>`,
    phone:`${common}<rect x="22" y="10" width="22" height="44" rx="5" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M27 18h12M27 24h12M27 30h9" stroke="#4c7a66" stroke-width="2" stroke-linecap="round"/><circle cx="33" cy="47" r="2" fill="#c9683c"/>`,
    health:`${common}<circle cx="32" cy="30" r="16" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M32 18v24M20 30h24" stroke="#c9683c" stroke-width="5" stroke-linecap="round"/><path d="M18 50c8-6 20-6 28 0" stroke="#4c7a66" stroke-width="2" stroke-linecap="round"/>`,
    food:`${common}<circle cx="32" cy="34" r="17" fill="#fff" stroke="#365446" stroke-width="2"/><circle cx="27" cy="31" r="4" fill="#9fc7b2"/><circle cx="37" cy="35" r="5" fill="#c9683c"/><path d="M14 16v24M18 16v24M16 40v12M50 16c-5 7-5 17 0 24v12" stroke="#365446" stroke-width="2" stroke-linecap="round"/>`,
    clothes:`${common}<path d="M24 16l8 5 8-5 11 9-7 8-4-4v22H24V29l-4 4-7-8 11-9Z" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M26 38h12" stroke="#c9683c" stroke-width="2" stroke-linecap="round"/>`,
    weather:`${common}<circle cx="23" cy="23" r="9" fill="#d89a3a"/><path d="M22 41h25a9 9 0 0 0-2-18 13 13 0 0 0-25 4 7 7 0 0 0 2 14Z" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M25 48l-3 5M35 48l-3 5M45 48l-3 5" stroke="#4c7a66" stroke-width="2" stroke-linecap="round"/>`,
    money:`${common}<rect x="13" y="22" width="38" height="24" rx="4" fill="#fff" stroke="#365446" stroke-width="2"/><circle cx="32" cy="34" r="7" fill="#e7efe9" stroke="#4c7a66" stroke-width="2"/><path d="M25 16h14M22 51h20" stroke="#c9683c" stroke-width="2" stroke-linecap="round"/>`,
    home:`${common}<path d="M12 31l20-17 20 17" fill="none" stroke="#365446" stroke-width="3" stroke-linecap="round"/><rect x="18" y="30" width="28" height="22" rx="3" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M29 52V40h8v12" fill="#e7efe9" stroke="#4c7a66" stroke-width="2"/>`,
    word:`${common}<rect x="12" y="18" width="40" height="32" rx="6" fill="#fff" stroke="#365446" stroke-width="2"/><path d="M21 28h22M21 36h16M21 44h20" stroke="#4c7a66" stroke-width="2" stroke-linecap="round"/><circle cx="45" cy="22" r="5" fill="#c9683c"/>`
  };return `<svg viewBox="0 0 64 64" role="img" focusable="false">${map[kind]||map.word}</svg>`}
  function generatedVisual(x){if(x.source!=='lessons-v1')return'';return `<div class="entry-visual generated-visual">${sceneSvg(visualKind(x))}</div>`}

  /* Keep Browse rich without making Explore responsible for the whole app. */
  const previousEntryHtml=entryHtml;
  entryHtml=function(x){
    if(x._type!=='v'||x.userCreated)return previousEntryHtml(x);
    const e=vocabEnrichment[x.korean]||{};
    const example=x.example||e.example||'';
    const exampleEn=e.exampleEn||'';
    const rr=romanize(x.korean);
    const visual=x.image?`<div class="entry-visual"><img src="${esc(x.image)}" alt="${esc(x.korean)} visual" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`:(generatedVisual(x)||(e.visual?`<div class="entry-visual" aria-hidden="true">${esc(e.visual)}</div>`:''));
    const origin=x.origin||[x.hanja,x.originType].filter(Boolean).join(' · ');
    const hanja=x.hanja||e.hanja||'', chinese=x.meaningZh||e.chinese||'';
    const qaBadge=x.source==='lessons-v1'?` <span class="qa-badge ${x.verified?'verified':'unverified'}">${x.verified?'verified enrichment':'unverified enrichment'}</span>`:'';
    const etymology=(hanja||chinese||e.originNote||x.originNote||origin)?`<div class="etymology-box"><div class="etymology-main"><span class="etymology-tag">Word origin</span>${hanja?`<b>${esc(hanja)}</b>`:''}${chinese?`<span>中文: ${esc(chinese)}</span>`:''}</div>${origin?`<div class="etymology-note">${esc(origin)}</div>`:''}${x.originNote?`<div class="etymology-note">${esc(x.originNote)}</div>`:''}${e.originNote?`<div class="etymology-note">${esc(e.originNote)}</div>`:''}</div>`:'';
    return `<div class="entry">${visual}<div class="entry-body"><div><span class="entry-title">${esc(x.korean)}</span>${x.pos?`<span class="entry-meta">${esc(x.pos)}</span>`:''}${qaBadge} <button class="btn ghost small" data-speak="${esc(x.korean)}">🔊</button></div><div class="pronunciation-line"><span>RR</span> ${esc(rr||'—')} <button class="pron-text-btn" data-speak="${esc(x.korean)}">hear pronunciation</button> <button class="naver-link" data-naver="${esc(x.korean)}">Naver ↗</button></div><div class="entry-meaning">${esc(x.meaning)}${x.meaningZh?` · ${esc(x.meaningZh)}`:''}</div>${etymology}${example?`<div class="example-rich"><div class="ko">${esc(example)}</div>${exampleEn?`<div class="en">${esc(exampleEn)}</div>`:''}</div>`:''}</div><div class="entry-actions"><button class="star ${isFav(x.id)?'on':''}" data-fav="${esc(x.id)}">★</button></div></div>`;
  };

  const baseRenderBrowse=renderBrowse;
  renderBrowse=function(){
    baseRenderBrowse();
    document.querySelectorAll('[data-naver]').forEach(b=>b.onclick=()=>window.open(naverUrl(b.dataset.naver),'_blank','noopener'));
  };

  function grammarGuideHtml(){
    if(!exploreData.grammarGuide?.length)return '<div class="empty">Grammar guide is loading…</div>';
    return `<div class="grammar-guide-grid">${exploreData.grammarGuide.map(g=>`<article class="grammar-guide-card"><span class="guide-level">${esc(g.level||'Guide')}</span><h3>${esc(g.title)}</h3><p class="guide-summary">${esc(g.summary)}</p><div class="pattern-list">${(g.items||[]).map(i=>`<div class="pattern-row"><b>${esc(i.label)}</b><code>${esc(i.pattern)}</code><span>${esc(i.example)}</span></div>`).join('')}</div>${g.note?`<div class="guide-note">${esc(g.note)}</div>`:''}</article>`).join('')}</div>`;
  }

  function wordBuildingHtml(){
    if(!exploreData.wordBuilding?.length)return '<div class="empty">Word-building notes are loading…</div>';
    return `<div class="explore-intro"><h2>How Korean words are built</h2><p>Instead of memorizing every word as an isolated item, notice productive families such as <b>N + 하다</b>, <b>N + 되다</b>, and common Sino-Korean suffixes.</p></div><div class="grammar-guide-grid">${exploreData.wordBuilding.map(w=>`<article class="grammar-guide-card"><span class="guide-level">Word family</span><h3>${esc(w.title)}</h3><p class="guide-summary">${esc(w.summary)}</p><div class="pattern-list">${(w.patterns||[]).map(p=>`<div class="pattern-row"><b>${esc(p.form)}</b><span>${esc(p.meaning)}</span></div>`).join('')}</div>${w.note?`<div class="guide-note">${esc(w.note)}</div>`:''}</article>`).join('')}</div>`;
  }

  function numbersHtml(){
    const n=exploreData.numbers;if(!n)return '<div class="empty">Number guide is loading…</div>';
    const system=(x,label)=>`<article class="grammar-guide-card"><span class="guide-level">${esc(label)}</span><h3>${esc(x.title)}</h3><p class="guide-summary">${esc(x.summary)}</p><h4>Core numbers</h4><div class="focus-row">${(x.ones||[]).map(v=>`<span class="focus-chip">${esc(v)}</span>`).join('')}</div>${x.tens?`<h4>Tens</h4><div class="focus-row">${x.tens.map(v=>`<span class="focus-chip">${esc(v)}</span>`).join('')}</div>`:''}${x.units?`<h4>Large units</h4><div class="focus-row">${x.units.map(v=>`<span class="focus-chip">${esc(v)}</span>`).join('')}</div>`:''}${x.special?`<h4>Forms before counters</h4><div class="pattern-list">${x.special.map(v=>`<div class="pattern-row"><b>${esc(v)}</b></div>`).join('')}</div>`:''}<h4>Common uses</h4><div class="pattern-list">${(x.uses||[]).map(v=>`<div class="pattern-row"><span>${esc(v)}</span></div>`).join('')}</div></article>`;
    return `<div class="explore-intro"><h2>Two Korean number systems</h2><p>Korean switches between Native Korean and Sino-Korean numbers depending on what is being counted. The system is not random: the noun/counter usually tells you which family to use.</p></div><div class="grammar-guide-grid">${system(n.native,'Native Korean')}${system(n.sino,'Sino-Korean')}</div><div class="section-title"><h2>Side-by-side examples</h2></div><div class="grammar-guide-grid">${(n.compare||[]).map(c=>`<article class="grammar-guide-card"><span class="guide-level">${esc(c.situation)}</span><h3>${esc(c.korean)}</h3><p class="guide-summary">${esc(c.why)}</p></article>`).join('')}</div>`;
  }

  function speechHtml(){
    const levels=exploreData.speechLevels||[],hon=exploreData.honorificSystem||[];
    if(!levels.length)return '<div class="empty">Speech-level guide is loading…</div>';
    return `<div class="explore-intro"><h2>Speech levels are two decisions, not one</h2><p><b>Formality</b> and <b>politeness</b> interact, while subject honorifics such as <b>-(으)시-</b> are a separate layer. This is why “casual vs formal” alone is too simple.</p></div><div class="grammar-guide-grid">${levels.map(l=>`<article class="grammar-guide-card"><span class="guide-level">${esc(l.formality)} · ${esc(l.politeness)}</span><h3>${esc(l.name)}</h3><div class="formula">${esc(l.example)}</div><p class="guide-summary"><b>Use:</b> ${esc(l.use)}</p><div class="guide-note"><b>Watch out:</b> ${esc(l.warning)}</div></article>`).join('')}</div><div class="section-title"><h2>Honorific layer · 높임말</h2></div><div class="grammar-guide-grid">${hon.map(h=>`<article class="grammar-guide-card"><span class="guide-level">${esc(h.label)}</span><h3>${esc(h.pattern)}</h3><div class="formula">${esc(h.example)}</div><p class="guide-summary">${esc(h.meaning)}</p></article>`).join('')}</div>`;
  }

  function cultureHtml(){
    if(!exploreData.culture?.length)return '<div class="empty">Culture cards are loading…</div>';
    return `<div class="culture-grid">${exploreData.culture.map(c=>`<article class="culture-card"><div class="culture-visual">${esc(c.emoji||'🇰🇷')}</div><div class="culture-category">${esc(c.category)}</div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><div class="culture-language">${esc(c.language||'')}</div></article>`).join('')}</div>`;
  }

  function etymologyItems(){
    const items=[];
    const add=(item)=>{if(!item.korean)return;items.push(item)};
    if(typeof allVocab!=='undefined'){
      allVocab
        .filter(v=>v.source==='lessons-v1'&&(v.hanja||v.originNote||/sino|loan|mixed/.test(v.originType||'')))
        .forEach(v=>add({
          korean:v.korean,meaning:v.meaning,meaningZh:v.meaningZh,hanja:v.hanja,originType:v.originType,
          originNote:v.originNote,lessonName:v.lessonName,lessonId:v.lessonId,verified:!!v.verified,source:'lessons-v1'
        }));
    }
    Object.entries(vocabEnrichment).forEach(([word,e])=>{
      if(!e.hanja&&!e.originNote)return;
      const already=items.some(x=>x.korean===word&&(x.hanja||'')===(e.hanja||''));
      if(!already)add({korean:word,meaning:'',meaningZh:e.chinese||'',hanja:e.hanja||'',originType:e.hanja?'sino-korean':'word-origin',originNote:e.originNote||'',example:e.example||'',exampleEn:e.exampleEn||'',lessonName:'Explore enrichment',lessonId:'explore',verified:false,source:'vocab-enrichment'});
    });
    return items.sort((a,b)=>{
      const la=+(String(a.lessonId||'').match(/\d+/)||[99])[0],lb=+(String(b.lessonId||'').match(/\d+/)||[99])[0];
      return la-lb||String(a.korean).localeCompare(String(b.korean),'ko');
    });
  }

  function etymologyHtml(){
    const items=etymologyItems();
    if(!items.length)return '<div class="empty">Etymology cards are loading…</div>';
    const verified=items.filter(x=>x.verified).length,hanja=items.filter(x=>x.hanja).length;
    return `<div class="explore-intro"><h2>汉字词 / Hanja word families</h2><p>This page now pulls from the Lesson 1-14 JSON packs. Teacher PPTs define the classroom vocabulary; Hanja, Chinese glosses, and word-origin notes stay labeled as verified or unverified enrichment.</p></div><div class="section-title"><h2>${items.length} Hanja / origin cards</h2><span class="muted">${hanja} include Hanja · ${verified} verified enrichment · ${items.length-verified} still labeled for review</span></div><div class="grammar-guide-grid">${items.map(e=>`<article class="grammar-guide-card"><span class="guide-level">${e.hanja?'한자어 / Hanja':'Word origin'}</span><h3>${esc(e.korean)} ${e.hanja?`· ${esc(e.hanja)}`:''} <button class="btn ghost small" data-etym-word="${esc(e.korean)}">🔊</button></h3>${e.meaning||e.meaningZh?`<div class="formula">${esc(e.meaning||'')}${e.meaningZh?` · 中文: ${esc(e.meaningZh)}`:''}</div>`:''}<p class="guide-summary">${esc(e.originNote||e.originType||'Use this as a meaning clue, not as proof that modern Korean and Mandarin match one-to-one.')}</p>${e.example?`<div class="example-rich"><div class="ko">${esc(e.example)}</div>${e.exampleEn?`<div class="en">${esc(e.exampleEn)}</div>`:''}</div>`:''}<div class="guide-note">${esc(e.lessonName||e.lessonId||'Explore')} · <span class="qa-badge ${e.verified?'verified':'unverified'}">${e.verified?'verified enrichment':'unverified enrichment'}</span> <button class="naver-link" data-etym-naver="${esc(e.korean)}">Naver ↗</button></div></article>`).join('')}</div>`;
  }

  function paneHtml(){
    if(exploreMode==='grammar')return grammarGuideHtml();
    if(exploreMode==='words')return wordBuildingHtml();
    if(exploreMode==='numbers')return numbersHtml();
    if(exploreMode==='speech')return speechHtml();
    if(exploreMode==='culture')return cultureHtml();
    return etymologyHtml();
  }

  function renderExplore(){
    const el=document.getElementById('view-explore');if(!el)return;
    const tabs=[['grammar','Grammar systems'],['words','Word building'],['numbers','Numbers'],['speech','Speech levels'],['culture','Culture & food'],['etymology','汉字词 / Hanja']];
    el.innerHTML=`<div class="explore-intro"><h2>Explore Korean beyond one lesson</h2><p>See the systems behind Korean: how words are built, how numbers switch, how speech level and honorifics interact, and how grammar connects to real culture.</p></div><div class="explore-toolbar"><div class="explore-tabs">${tabs.map(([k,n])=>`<button class="chip ${exploreMode===k?'active':''}" data-explore="${k}">${n}</button>`).join('')}</div><div class="audio-check"><button class="btn ghost small" id="audioTest">🔊 Test audio</button><span class="audio-status" data-audio-status>Audio uses the site pronunciation system.</span></div></div><div id="explorePane">${paneHtml()}</div>`;
    el.querySelectorAll('[data-explore]').forEach(b=>b.onclick=()=>{exploreMode=b.dataset.explore;renderExplore()});
    document.getElementById('audioTest')?.addEventListener('click',()=>speak('안녕하세요. 한국어 공부를 시작해 볼까요?'));
    el.querySelectorAll('[data-etym-word]').forEach(b=>b.onclick=()=>speak(b.dataset.etymWord));
    el.querySelectorAll('[data-etym-naver]').forEach(b=>b.onclick=()=>window.open(naverUrl(b.dataset.etymNaver),'_blank','noopener'));
  }

  viewTitles.explore=['Explore','Word building, number systems, speech levels, culture, and word origins.'];
  window.renderExplorePage=renderExplore;
  const baseRenderCurrent=renderCurrent;
  renderCurrent=function(){if(currentView==='explore')renderExplore();else baseRenderCurrent()};

  /* Extra safety: if an older cached handler fails, this ensures the Explore panel is still rendered. */
  const exploreTab=document.querySelector('.tab[data-view="explore"]');
  exploreTab?.addEventListener('click',()=>setTimeout(()=>{if(currentView==='explore')renderExplore()},0));

  async function loadExploreData(){
    try{
      const [a,b]=await Promise.allSettled([
        fetch(`content/explore.json?ts=${Date.now()}`,{cache:'default'}).then(r=>{if(!r.ok)throw new Error('Explore content');return r.json()}),
        fetch(`content/vocab-enrichment.json?ts=${Date.now()}`,{cache:'default'}).then(r=>{if(!r.ok)throw new Error('Vocabulary enrichment');return r.json()})
      ]);
      if(a.status==='fulfilled')exploreData=a.value;
      if(b.status==='fulfilled')vocabEnrichment=b.value;
    }catch(e){console.warn('Explore data load failed',e)}
    if(currentView==='explore')renderExplore();
    if(currentView==='browse')renderBrowse();
  }
  loadExploreData();
})();
