/* Culture, grammar roadmap, etymology, examples, and audio reliability */
(() => {
  let exploreData={grammarGuide:[],culture:[]};
  let vocabEnrichment={};
  let exploreMode='grammar';
  let lastUtterance=null;
  let koVoices=[];

  const rrCho=['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
  const rrJung=['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
  const rrJong=['','k','k','k','n','n','n','t','l','k','m','p','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','h'];
  function romanize(text){return [...String(text||'')].map(ch=>{const c=ch.charCodeAt(0);if(c<0xAC00||c>0xD7A3)return ch;const n=c-0xAC00,a=Math.floor(n/588),b=Math.floor((n%588)/28),d=n%28;return rrCho[a]+rrJung[b]+rrJong[d]}).join('').replace(/\s+/g,' ').trim()}

  function refreshVoices(){
    if(!('speechSynthesis' in window))return;
    const voices=window.speechSynthesis.getVoices();
    koVoices=voices.filter(v=>/^ko([-_]|$)/i.test(v.lang||''));
    document.querySelectorAll('[data-audio-status]').forEach(el=>el.textContent=audioStatusText());
  }
  function audioStatusText(){
    if(!('speechSynthesis' in window))return 'Audio is not supported by this browser.';
    if(koVoices.length)return `Korean voice ready: ${koVoices[0].name}`;
    return 'No Korean-specific system voice detected. The browser will still try ko-KR; Naver is available as a fallback.';
  }
  function toast(msg){
    document.querySelector('.audio-toast')?.remove();
    const t=document.createElement('div');t.className='audio-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),4200);
  }
  function robustSpeak(text){
    text=String(text||'').trim();if(!text)return;
    if(!('speechSynthesis' in window)){toast('This browser does not expose speech synthesis. Use the Naver link beside the word for pronunciation.');return}
    const synth=window.speechSynthesis;
    const start=()=>{
      refreshVoices();
      try{
        synth.cancel();
        if(synth.paused)synth.resume();
        const u=new SpeechSynthesisUtterance(text);
        u.lang='ko-KR';u.rate=.88;u.pitch=1;u.volume=1;
        if(koVoices.length)u.voice=koVoices[0];
        let began=false;
        u.onstart=()=>{began=true};
        u.onerror=e=>toast(`Audio could not start${e?.error?`: ${e.error}`:''}. Try Naver pronunciation or install/enable a Korean system voice.`);
        u.onend=()=>{lastUtterance=null};
        lastUtterance=u;
        synth.speak(u);
        setTimeout(()=>{if(synth.paused)synth.resume();if(!began&&synth.pending===false&&synth.speaking===false)toast('No speech output was detected. Your device may not have an available Korean TTS voice; use Naver pronunciation as a fallback.')},1200);
      }catch(e){toast('Audio failed on this device. Use the Naver pronunciation link as a fallback.')}
    };
    if(!synth.getVoices().length){refreshVoices();setTimeout(start,180)}else start();
  }
  speak=robustSpeak;
  if('speechSynthesis' in window){refreshVoices();window.speechSynthesis.addEventListener?.('voiceschanged',refreshVoices)}

  function naverUrl(word){return 'https://en.dict.naver.com/#/search?query='+encodeURIComponent(word)}

  const previousEntryHtml=entryHtml;
  entryHtml=function(x){
    if(x._type!=='v')return previousEntryHtml(x);
    const e=vocabEnrichment[x.korean]||{};
    const example=x.example||e.example||'';
    const exampleEn=e.exampleEn||'';
    const origin=x.origin||'';
    const rr=romanize(x.korean);
    const visual=x.image?`<div class="entry-visual"><img src="${esc(x.image)}" alt="${esc(x.korean)} visual" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`:(e.visual?`<div class="entry-visual" aria-hidden="true">${esc(e.visual)}</div>`:'');
    const etymology=(e.hanja||e.chinese||e.originNote||origin)?`<div class="etymology-box"><div class="etymology-main"><span class="etymology-tag">Word origin</span>${e.hanja?`<b>${esc(e.hanja)}</b>`:''}${e.chinese?`<span>中文: ${esc(e.chinese)}</span>`:''}</div>${origin?`<div class="etymology-note">${esc(origin)}</div>`:''}${e.originNote?`<div class="etymology-note">${esc(e.originNote)}</div>`:''}</div>`:'';
    return `<div class="entry">${visual}<div class="entry-body"><div><span class="entry-title">${esc(x.korean)}</span>${x.pos?`<span class="entry-meta">${esc(x.pos)}</span>`:''} <button class="btn ghost small" data-speak="${esc(x.korean)}">🔊</button></div><div class="pronunciation-line"><span>RR</span> ${esc(rr||'—')} <button class="pron-text-btn" data-speak="${esc(x.korean)}">hear pronunciation</button> <button class="naver-link" data-naver="${esc(x.korean)}">Naver ↗</button></div><div class="entry-meaning">${esc(x.meaning)}</div>${etymology}${example?`<div class="example-rich"><div class="ko">${esc(example)}</div>${exampleEn?`<div class="en">${esc(exampleEn)}</div>`:''}</div>`:''}</div><div class="entry-actions"><button class="star ${isFav(x.id)?'on':''}" data-fav="${esc(x.id)}">★</button></div></div>`;
  };

  const baseRenderBrowse=renderBrowse;
  renderBrowse=function(){
    baseRenderBrowse();
    document.querySelectorAll('[data-naver]').forEach(b=>b.onclick=()=>window.open(naverUrl(b.dataset.naver),'_blank','noopener'));
  };

  function renderExplore(){
    const el=document.getElementById('view-explore');if(!el)return;
    el.innerHTML=`<div class="explore-intro"><h2>Explore Korean beyond one lesson</h2><p>Use the grammar map to see how tense, aspect, negation, passive/causative, honorifics, and connectors fit together. Culture cards connect language with food, holidays, social context, and everyday situations.</p></div>
      <div class="explore-toolbar"><div class="explore-tabs"><button class="chip ${exploreMode==='grammar'?'active':''}" data-explore="grammar">Grammar map</button><button class="chip ${exploreMode==='culture'?'active':''}" data-explore="culture">Culture & food</button><button class="chip ${exploreMode==='etymology'?'active':''}" data-explore="etymology">汉字词 / Hanja</button></div><div class="audio-check"><button class="btn ghost small" id="audioTest">🔊 Test Korean audio</button><span class="audio-status" data-audio-status>${esc(audioStatusText())}</span></div></div>
      <div class="explore-pane ${exploreMode==='grammar'?'active':''}" id="exploreGrammar">${grammarGuideHtml()}</div>
      <div class="explore-pane ${exploreMode==='culture'?'active':''}" id="exploreCulture">${cultureHtml()}</div>
      <div class="explore-pane ${exploreMode==='etymology'?'active':''}" id="exploreEtymology">${etymologyHtml()}</div>`;
    el.querySelectorAll('[data-explore]').forEach(b=>b.onclick=()=>{exploreMode=b.dataset.explore;renderExplore()});
    document.getElementById('audioTest').onclick=()=>robustSpeak('안녕하세요. 한국어 공부를 시작해 볼까요?');
    el.querySelectorAll('[data-etym-word]').forEach(b=>b.onclick=()=>robustSpeak(b.dataset.etymWord));
  }
  function grammarGuideHtml(){
    if(!exploreData.grammarGuide.length)return '<div class="empty">Grammar guide is loading…</div>';
    return `<div class="grammar-guide-grid">${exploreData.grammarGuide.map(g=>`<article class="grammar-guide-card"><span class="guide-level">${esc(g.level||'Guide')}</span><h3>${esc(g.title)}</h3><p class="guide-summary">${esc(g.summary)}</p><div class="pattern-list">${(g.items||[]).map(i=>`<div class="pattern-row"><b>${esc(i.label)}</b><code>${esc(i.pattern)}</code><span>${esc(i.example)}</span></div>`).join('')}</div>${g.note?`<div class="guide-note">${esc(g.note)}</div>`:''}</article>`).join('')}</div>`;
  }
  function cultureHtml(){
    if(!exploreData.culture.length)return '<div class="empty">Culture cards are loading…</div>';
    return `<div class="culture-grid">${exploreData.culture.map(c=>`<article class="culture-card"><div class="culture-visual">${esc(c.emoji||'🇰🇷')}</div><div class="culture-category">${esc(c.category)}</div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><div class="culture-language">${esc(c.language||'')}</div></article>`).join('')}</div>`;
  }
  function etymologyHtml(){
    const items=Object.entries(vocabEnrichment).filter(([,e])=>e.hanja||e.originNote).slice(0,50);
    if(!items.length)return '<div class="empty">Etymology cards are loading…</div>';
    return `<div class="grammar-guide-grid">${items.map(([word,e])=>`<article class="grammar-guide-card"><span class="guide-level">${e.hanja?'한자어 / Sino-Korean':'Origin'}</span><h3>${esc(word)} ${e.hanja?`· ${esc(e.hanja)}`:''} <button class="btn ghost small" data-etym-word="${esc(word)}">🔊</button></h3>${e.chinese?`<div class="formula">中文对应：${esc(e.chinese)}</div>`:''}<p class="guide-summary">${esc(e.originNote||'')}</p>${e.example?`<div class="example-rich"><div class="ko">${esc(e.example)}</div>${e.exampleEn?`<div class="en">${esc(e.exampleEn)}</div>`:''}</div>`:''}</article>`).join('')}</div>`;
  }

  viewTitles.explore=['Explore','Grammar systems, Korean culture, food, and word origins.'];
  const baseRenderCurrent=renderCurrent;
  renderCurrent=function(){if(currentView==='explore')renderExplore();else baseRenderCurrent()};

  const feedbackButton=document.getElementById('feedbackBtn');
  if(feedbackButton)feedbackButton.onclick=()=>{
    const recent=(local.feedback||[]).slice(-4).reverse();
    openModal(`<h2>Feedback · HCI notes</h2><p class="muted">Record what felt confusing, slow, unnecessary, or unexpectedly helpful while using the site.</p><label>What happened?</label><select id="feedbackType"><option>I couldn't find something</option><option>I didn't understand a question</option><option>I didn't know what a button did</option><option>This page felt overwhelming</option><option>Something is broken</option><option>I liked this interaction</option><option>Other</option></select><label>Tell us more</label><textarea id="feedbackText" placeholder="What were you trying to do? What did you expect to happen?"></textarea><div class="feedback-local-note"><b>Prototype note:</b> feedback is currently stored only in this browser. Export it when testing with users; a shared Google Form/Sheet can be connected later so feedback from multiple students arrives in one place.</div>${recent.length?`<div class="feedback-history"><b>Recent notes on this device</b>${recent.map(x=>`<div class="feedback-history-item"><b>${esc(x.type)}</b><p>${esc(x.text||'(no details)')}</p></div>`).join('')}</div>`:''}<div class="modal-actions"><button class="btn ghost" id="exportFeedback">Export feedback</button><button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="saveFeedback">Save feedback</button></div>`);
    document.getElementById('saveFeedback').onclick=()=>{local.feedback.push({type:document.getElementById('feedbackType').value,text:document.getElementById('feedbackText').value.trim(),view:currentView,lesson:currentLesson,ts:Date.now()});writeJSON(KEYS.local,local);closeModal();toast('Feedback saved on this device.')};
    document.getElementById('exportFeedback').onclick=()=>{const blob=new Blob([JSON.stringify(local.feedback||[],null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='korean-review-feedback.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
    bindModalClose();
  };

  async function loadExploreData(){
    const [a,b]=await Promise.allSettled([fetch(`content/explore.json?ts=${Date.now()}`,{cache:'no-store'}).then(r=>r.json()),fetch(`content/vocab-enrichment.json?ts=${Date.now()}`,{cache:'no-store'}).then(r=>r.json())]);
    if(a.status==='fulfilled')exploreData=a.value;if(b.status==='fulfilled')vocabEnrichment=b.value;
    if(currentView==='explore')renderExplore();if(currentView==='browse')renderBrowse();
  }
  loadExploreData();
})();