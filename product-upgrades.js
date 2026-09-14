/* Product upgrades: online Korean audio, easy user-created content, and free-form themes */
(() => {
  const ONLINE_TTS = text => `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q=${encodeURIComponent(String(text||'').slice(0,180))}`;
  let currentAudio=null;

  function toastUpgrade(msg){
    document.querySelector('.upgrade-toast')?.remove();
    const t=document.createElement('div');t.className='upgrade-toast';t.textContent=msg;document.body.appendChild(t);
    setTimeout(()=>t.remove(),4200);
  }

  async function playRemote(url){
    if(currentAudio){try{currentAudio.pause()}catch{}}
    const a=new Audio(url);currentAudio=a;a.preload='auto';
    await a.play();
    return a;
  }

  function browserKoreanSpeak(text){
    text=String(text||'').trim();if(!text||!('speechSynthesis'in window))return false;
    const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';
    const voices=window.speechSynthesis.getVoices?.()||[];
    const ko=voices.find(v=>/^ko/i.test(v.lang)||/korean|한국/i.test(v.name));
    if(ko)u.voice=ko;
    window.speechSynthesis.cancel();window.speechSynthesis.speak(u);return true;
  }
  async function directKoreanAudio(text,audioUrl=''){
    text=String(text||'').trim();if(!text&&!audioUrl)return;
    try{
      if(audioUrl){await playRemote(audioUrl);return;}
      if(browserKoreanSpeak(text))return;
      await playRemote(ONLINE_TTS(text));
    }catch(err){
      if(browserKoreanSpeak(text))return;
      toastUpgrade('Audio could not play on this device. Use the Naver pronunciation link as a backup.');
    }
  }
  speak=(text)=>directKoreanAudio(text);
  window.playKoreanAudio=directKoreanAudio;

  // Explore's original audio test uses a private function, so intercept it before that handler runs.
  document.addEventListener('click',e=>{
    const test=e.target.closest?.('#audioTest');
    const etym=e.target.closest?.('[data-etym-word]');
    if(test){e.preventDefault();e.stopImmediatePropagation();directKoreanAudio('안녕하세요. 한국어 공부를 시작해 볼까요?');return;}
    if(etym){e.preventDefault();e.stopImmediatePropagation();directKoreanAudio(etym.dataset.etymWord);return;}
    const custom=e.target.closest?.('[data-custom-audio]');
    if(custom){e.preventDefault();directKoreanAudio(custom.dataset.word||'',custom.dataset.customAudio||'');}
  },true);

  function refreshAudioStatus(){
    document.querySelectorAll('[data-audio-status]').forEach(el=>{
      el.textContent='Browser Korean pronunciation is enabled. Naver remains a backup for dictionary audio.';
      el.classList.add('online-ready');
    });
  }
  const statusObserver=new MutationObserver(refreshAudioStatus);
  statusObserver.observe(document.body,{childList:true,subtree:true});
  refreshAudioStatus();

  function lessonOptions(selected=''){
    return allLessons.map(l=>`<option value="${esc(l.id)}" ${l.id===selected?'selected':''}>${esc(l.name)}</option>`).join('')+
      `<option value="__new__">+ New personal collection</option>`;
  }

  function creatorForm(type){
    const selected=currentLesson!=='all'?currentLesson:(allLessons[0]?.id||'');
    if(type==='grammar')return `
      <label>Collection / lesson</label><select id="createLesson">${lessonOptions(selected)}</select><input id="createNewLesson" class="creator-new-lesson" placeholder="New collection name" hidden>
      <label>Grammar pattern *</label><input id="createPattern" placeholder="e.g. -고 싶다">
      <label>Meaning / explanation *</label><textarea id="createExplain" placeholder="What does it mean and when do you use it?"></textarea>
      <label>Formation</label><input id="createFormula" placeholder="verb stem + 고 싶다">
      <label>Example</label><textarea id="createGrammarExample" placeholder="한국에 가고 싶어요. — I want to go to Korea."></textarea>
      <label>Compare / common mistake</label><textarea id="createContrast" placeholder="What is it often confused with?"></textarea>`;
    return `
      <label>Collection / lesson</label><select id="createLesson">${lessonOptions(selected)}</select><input id="createNewLesson" class="creator-new-lesson" placeholder="New collection name" hidden>
      <div class="creator-grid"><div><label>Korean *</label><input id="createKorean" placeholder="학교"></div><div><label>English *</label><input id="createMeaning" placeholder="school"></div></div>
      <div class="creator-grid"><div><label>Hanja</label><input id="createHanja" placeholder="學校"></div><div><label>Chinese</label><input id="createChinese" placeholder="学校"></div></div>
      <label>Word origin / memory note</label><input id="createOrigin" placeholder="Sino-Korean, loanword, mnemonic…">
      <label>Example sentence</label><textarea id="createExample" placeholder="저는 학교에 가요. — I go to school."></textarea>
      <div class="creator-grid"><div><label>Image URL (optional)</label><input id="createImage" placeholder="https://..."></div><div><label>Audio URL (optional)</label><input id="createAudio" placeholder="https://...mp3"></div></div>
      <div class="creator-help-inline">No audio URL? The site will use built-in online Korean pronunciation automatically.</div>`;
  }

  function bindCreateLessonToggle(){
    const select=document.getElementById('createLesson'),input=document.getElementById('createNewLesson');if(!select||!input)return;
    const sync=()=>input.hidden=select.value!=='__new__';select.onchange=sync;sync();
  }

  function resolveCreateLesson(){
    const sel=document.getElementById('createLesson');if(!sel)return null;
    if(sel.value!=='__new__')return sel.value;
    const name=document.getElementById('createNewLesson').value.trim();if(!name){toastUpgrade('Give the new collection a name first.');return null}
    const id='personal-'+lessonKey(name)+'-'+uid();local.lessons.push({id,name,shared:false,source:'local'});return id;
  }

  function openCreator(initial='vocab'){
    let type=initial;
    const render=()=>{
      openModal(`<h2>Create your own study item</h2><p class="muted">Add something you met in class, a K-pop song, a drama, a picture dictionary, or daily life. It stays in this browser and joins Browse + Flashcards.</p>
        <div class="creator-type-tabs"><button class="chip ${type==='vocab'?'active':''}" data-create-type="vocab">Vocabulary</button><button class="chip ${type==='grammar'?'active':''}" data-create-type="grammar">Grammar</button></div>
        <div class="creator-steps"><span>1 · Choose type</span><span>2 · Add the essentials</span><span>3 · Save & study</span></div>
        <div id="creatorFields">${creatorForm(type)}</div>
        <div class="creator-guide"><b>How it works</b><p>Required fields are marked *. Everything else is optional. Images and custom MP3 links can be added when you have them; otherwise pronunciation still works online.</p></div>
        <div class="modal-actions"><button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="saveCreatedItem">Save item</button></div>`);
      document.querySelectorAll('[data-create-type]').forEach(b=>b.onclick=()=>{type=b.dataset.createType;render()});
      bindCreateLessonToggle();bindModalClose();
      document.getElementById('saveCreatedItem').onclick=()=>saveCreated(type);
    };
    render();
  }

  function saveCreated(type){
    const lessonId=resolveCreateLesson();if(!lessonId)return;
    const lessonName=local.lessons.find(l=>l.id===lessonId)?.name||allLessons.find(l=>l.id===lessonId)?.name||'Personal';
    if(type==='grammar'){
      const pattern=document.getElementById('createPattern').value.trim(),explain=document.getElementById('createExplain').value.trim();
      if(!pattern||!explain){toastUpgrade('Grammar pattern and explanation are required.');return}
      local.grammar.push({id:'pg-'+uid(),lessonId,lessonName,pattern,explain,formula:document.getElementById('createFormula').value.trim(),example:document.getElementById('createGrammarExample').value.trim(),contrast:document.getElementById('createContrast').value.trim(),shared:false,source:'local',userCreated:true});
    }else{
      const korean=document.getElementById('createKorean').value.trim(),meaning=document.getElementById('createMeaning').value.trim();
      if(!korean||!meaning){toastUpgrade('Korean and English meaning are required.');return}
      local.vocab.push({id:'pv-'+uid(),lessonId,lessonName,korean,meaning,hanja:document.getElementById('createHanja').value.trim(),chinese:document.getElementById('createChinese').value.trim(),origin:document.getElementById('createOrigin').value.trim(),example:document.getElementById('createExample').value.trim(),image:document.getElementById('createImage').value.trim(),audio:document.getElementById('createAudio').value.trim(),shared:false,source:'local',userCreated:true});
    }
    writeJSON(KEYS.local,local);merge();currentLesson=lessonId;currentView='browse';closeModal();renderAll();
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view==='browse'));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-browse'));
    document.getElementById('pageTitle').textContent='Browse';document.getElementById('pageSubtitle').textContent='Your new item is ready to study.';
    toastUpgrade('Saved. It is now part of your personal study set.');
  }

  const sidebarActions=document.querySelector('.sidebar-actions');
  if(sidebarActions&&!document.getElementById('createBtn')){
    const b=document.createElement('button');b.className='btn subtle wide create-study-btn';b.id='createBtn';b.textContent='+ Create study item';b.onclick=()=>openCreator('vocab');
    sidebarActions.prepend(b);
  }

  // Preserve the rich shared vocabulary renderer, but give user-created items their own structured card.
  const richEntryHtml=entryHtml;
  entryHtml=function(x){
    if(!x.userCreated)return richEntryHtml(x);
    if(x._type==='g')return `<div class="entry user-created-entry"><div class="entry-body"><div><span class="entry-title">${esc(x.pattern)}</span><span class="entry-meta">My grammar</span></div><div class="entry-meaning">${esc(x.explain)}</div>${x.formula?`<div class="formula">${esc(x.formula)}</div>`:''}${x.example?`<div class="example-rich"><div class="ko">${esc(x.example)}</div></div>`:''}${x.contrast?`<div class="compare-box"><b>Compare / note:</b> ${esc(x.contrast)}</div>`:''}</div><div class="entry-actions"><button class="star ${isFav(x.id)?'on':''}" data-fav="${esc(x.id)}">★</button></div></div>`;
    const originBits=[x.hanja?`<b>${esc(x.hanja)}</b>`:'',x.chinese?`<span>中文: ${esc(x.chinese)}</span>`:''].filter(Boolean).join(' ');
    return `<div class="entry user-created-entry">${x.image?`<div class="entry-visual"><img src="${esc(x.image)}" alt="${esc(x.korean)}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`:''}<div class="entry-body"><div><span class="entry-title">${esc(x.korean)}</span><span class="entry-meta">My word</span> <button class="btn ghost small" data-custom-audio="${esc(x.audio||'')}" data-word="${esc(x.korean)}">🔊</button></div><div class="entry-meaning">${esc(x.meaning)}</div>${originBits||x.origin?`<div class="etymology-box"><div class="etymology-main"><span class="etymology-tag">Word origin</span>${originBits}</div>${x.origin?`<div class="etymology-note">${esc(x.origin)}</div>`:''}</div>`:''}${x.example?`<div class="example-rich"><div class="ko">${esc(x.example)}</div></div>`:''}</div><div class="entry-actions"><button class="star ${isFav(x.id)?'on':''}" data-fav="${esc(x.id)}">★</button></div></div>`;
  };

  const browseWithSharedBindings=renderBrowse;
  renderBrowse=function(){browseWithSharedBindings();document.querySelectorAll('[data-custom-audio]').forEach(b=>b.onclick=()=>directKoreanAudio(b.dataset.word,b.dataset.customAudio))};

  function hexToRgb(hex){const h=String(hex).replace('#','');if(!/^[0-9a-f]{6}$/i.test(h))return null;return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
  function rgbToHex(rgb){return '#'+rgb.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
  function mix(a,b,weight=.5){const A=hexToRgb(a),B=hexToRgb(b);if(!A||!B)return a;return rgbToHex(A.map((v,i)=>v*(1-weight)+B[i]*weight))}
  function currentTheme(){return themeState.custom||THEMES[themeState.preset]||THEMES.celadon}

  const appearance=document.getElementById('appearanceBtn');
  if(appearance)appearance.onclick=()=>{
    const t=currentTheme();
    openModal(`<h2>Appearance</h2><p class="muted">Use a preset or make the site any colors you want. Your theme is saved only in this browser.</p>
      <h3>Presets</h3><div class="theme-presets">${Object.entries(THEMES).map(([k,v])=>`<button class="theme-swatch ${!themeState.custom&&themeState.preset===k?'active':''}" data-theme-preset="${k}" style="background:linear-gradient(135deg,${v.bg} 50%,${v.accent} 50%)" title="${esc(v.name)}"><span>${esc(v.name)}</span></button>`).join('')}</div>
      <h3>Custom colors</h3><div class="custom-theme-grid">
        <label><span>Background</span><input type="color" id="themeBg" value="${esc(t.bg)}"></label>
        <label><span>Cards</span><input type="color" id="themePanel" value="${esc(t.panel)}"></label>
        <label><span>Text</span><input type="color" id="themeInk" value="${esc(t.ink)}"></label>
        <label><span>Primary</span><input type="color" id="themeAccent" value="${esc(t.accent)}"></label>
        <label><span>Warm accent</span><input type="color" id="themeWarm" value="${esc(t.warm)}"></label>
        <label><span>Highlight</span><input type="color" id="themeGold" value="${esc(t.gold)}"></label>
      </div><div class="custom-theme-preview" id="themePreview"><span>Preview</span><b>한국어 공부</b><button type="button">Button</button></div>
      <div class="modal-actions"><button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="saveCustomTheme">Apply custom theme</button></div>`);
    document.querySelectorAll('[data-theme-preset]').forEach(b=>b.onclick=()=>{themeState={preset:b.dataset.themePreset,custom:null};writeJSON(KEYS.theme,themeState);applyTheme();closeModal();toastUpgrade(`${THEMES[b.dataset.themePreset].name} theme applied.`)});
    const inputs=['themeBg','themePanel','themeInk','themeAccent','themeWarm','themeGold'];
    const preview=()=>{const p=document.getElementById('themePreview');if(!p)return;p.style.background=document.getElementById('themeBg').value;p.style.color=document.getElementById('themeInk').value;p.style.borderColor=mix(document.getElementById('themeInk').value,document.getElementById('themeBg').value,.82);p.querySelector('button').style.background=document.getElementById('themeAccent').value;p.querySelector('button').style.color='#fff'};inputs.forEach(id=>document.getElementById(id).oninput=preview);preview();
    document.getElementById('saveCustomTheme').onclick=()=>{const bg=document.getElementById('themeBg').value,panel=document.getElementById('themePanel').value,ink=document.getElementById('themeInk').value,accent=document.getElementById('themeAccent').value,warm=document.getElementById('themeWarm').value,gold=document.getElementById('themeGold').value;themeState={preset:'custom',custom:{bg,panel,ink,accent,accent2:mix(accent,ink,.24),soft:mix(accent,bg,.84),warm,gold,line:mix(ink,bg,.84)}};writeJSON(KEYS.theme,themeState);applyTheme();closeModal();toastUpgrade('Custom theme applied.')};bindModalClose();
  };

  // Re-render once so creator-aware cards and audio status are immediately active.
  if(typeof renderCurrent==='function')renderCurrent();
})();
