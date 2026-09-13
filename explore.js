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

  /* Keep Browse rich without making Explore responsible for the whole app. */
  const previousEntryHtml=entryHtml;
  entryHtml=function(x){
    if(x._type!=='v'||x.userCreated)return previousEntryHtml(x);
    const e=vocabEnrichment[x.korean]||{};
    const example=x.example||e.example||'';
    const exampleEn=e.exampleEn||'';
    const rr=romanize(x.korean);
    const visual=x.image?`<div class="entry-visual"><img src="${esc(x.image)}" alt="${esc(x.korean)} visual" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`:(e.visual?`<div class="entry-visual" aria-hidden="true">${esc(e.visual)}</div>`:'');
    const origin=x.origin||'';
    const etymology=(e.hanja||e.chinese||e.originNote||origin)?`<div class="etymology-box"><div class="etymology-main"><span class="etymology-tag">Word origin</span>${e.hanja?`<b>${esc(e.hanja)}</b>`:''}${e.chinese?`<span>中文: ${esc(e.chinese)}</span>`:''}</div>${origin?`<div class="etymology-note">${esc(origin)}</div>`:''}${e.originNote?`<div class="etymology-note">${esc(e.originNote)}</div>`:''}</div>`:'';
    return `<div class="entry">${visual}<div class="entry-body"><div><span class="entry-title">${esc(x.korean)}</span>${x.pos?`<span class="entry-meta">${esc(x.pos)}</span>`:''} <button class="btn ghost small" data-speak="${esc(x.korean)}">🔊</button></div><div class="pronunciation-line"><span>RR</span> ${esc(rr||'—')} <button class="pron-text-btn" data-speak="${esc(x.korean)}">hear pronunciation</button> <button class="naver-link" data-naver="${esc(x.korean)}">Naver ↗</button></div><div class="entry-meaning">${esc(x.meaning)}</div>${etymology}${example?`<div class="example-rich"><div class="ko">${esc(example)}</div>${exampleEn?`<div class="en">${esc(exampleEn)}</div>`:''}</div>`:''}</div><div class="entry-actions"><button class="star ${isFav(x.id)?'on':''}" data-fav="${esc(x.id)}">★</button></div></div>`;
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

  function etymologyHtml(){
    const items=Object.entries(vocabEnrichment).filter(([,e])=>e.hanja||e.originNote).slice(0,80);
    if(!items.length)return '<div class="empty">Etymology cards are loading…</div>';
    return `<div class="explore-intro"><h2>汉字词 / Hanja word families</h2><p>Many Korean academic and everyday words are Sino-Korean. Use the Hanja as a semantic clue, but remember that modern Chinese and Korean may not use the same word in exactly the same way.</p></div><div class="grammar-guide-grid">${items.map(([word,e])=>`<article class="grammar-guide-card"><span class="guide-level">${e.hanja?'한자어 / Sino-Korean':'Origin'}</span><h3>${esc(word)} ${e.hanja?`· ${esc(e.hanja)}`:''} <button class="btn ghost small" data-etym-word="${esc(word)}">🔊</button></h3>${e.chinese?`<div class="formula">中文对应：${esc(e.chinese)}</div>`:''}<p class="guide-summary">${esc(e.originNote||'')}</p>${e.example?`<div class="example-rich"><div class="ko">${esc(e.example)}</div>${e.exampleEn?`<div class="en">${esc(e.exampleEn)}</div>`:''}</div>`:''}</article>`).join('')}</div>`;
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