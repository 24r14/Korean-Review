/* Korean Review UX enhancements: pronunciation, 2-set keyboard, richer feedback */
(() => {
  const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const vowelParts = {'ㅘ':['ㅗ','ㅏ'],'ㅙ':['ㅗ','ㅐ'],'ㅚ':['ㅗ','ㅣ'],'ㅝ':['ㅜ','ㅓ'],'ㅞ':['ㅜ','ㅔ'],'ㅟ':['ㅜ','ㅣ'],'ㅢ':['ㅡ','ㅣ']};
  const finalParts = {'ㄳ':['ㄱ','ㅅ'],'ㄵ':['ㄴ','ㅈ'],'ㄶ':['ㄴ','ㅎ'],'ㄺ':['ㄹ','ㄱ'],'ㄻ':['ㄹ','ㅁ'],'ㄼ':['ㄹ','ㅂ'],'ㄽ':['ㄹ','ㅅ'],'ㄾ':['ㄹ','ㅌ'],'ㄿ':['ㄹ','ㅍ'],'ㅀ':['ㄹ','ㅎ'],'ㅄ':['ㅂ','ㅅ']};
  const combineVowels = {'ㅗㅏ':'ㅘ','ㅗㅐ':'ㅙ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ','ㅜㅔ':'ㅞ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ'};
  const combineFinals = {'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ','ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ','ㅂㅅ':'ㅄ'};
  const vowelSet = new Set(['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']);
  const consonantSet = new Set(CHO.concat(Object.keys(finalParts), JONG.slice(1)));
  const finalSet = new Set(JONG.slice(1));
  const latinMap = {q:'ㅂ',w:'ㅈ',e:'ㄷ',r:'ㄱ',t:'ㅅ',y:'ㅛ',u:'ㅕ',i:'ㅑ',o:'ㅐ',p:'ㅔ',a:'ㅁ',s:'ㄴ',d:'ㅇ',f:'ㄹ',g:'ㅎ',h:'ㅗ',j:'ㅓ',k:'ㅏ',l:'ㅣ',z:'ㅋ',x:'ㅌ',c:'ㅊ',v:'ㅍ',b:'ㅠ',n:'ㅜ',m:'ㅡ'};
  const shiftMap = {q:'ㅃ',w:'ㅉ',e:'ㄸ',r:'ㄲ',t:'ㅆ',o:'ㅒ',p:'ㅖ'};

  const initialRR = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
  const vowelRR = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
  const finalRR = ['', 'k','k','k','n','n','n','t','l','k','m','p','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','h'];

  function romanizeKorean(text){
    return [...String(text||'')].map(ch => {
      const code=ch.charCodeAt(0);
      if(code<0xAC00||code>0xD7A3) return ch;
      const n=code-0xAC00, cho=Math.floor(n/588), jung=Math.floor((n%588)/28), jong=n%28;
      return initialRR[cho]+vowelRR[jung]+finalRR[jong];
    }).join('').replace(/\s+/g,' ').trim();
  }

  function decomposeText(text){
    const out=[];
    for(const ch of String(text||'')){
      const code=ch.charCodeAt(0);
      if(code>=0xAC00&&code<=0xD7A3){
        const n=code-0xAC00, ci=Math.floor(n/588), vi=Math.floor((n%588)/28), fi=n%28;
        out.push(CHO[ci]);
        const v=JUNG[vi]; out.push(...(vowelParts[v]||[v]));
        if(fi){ const f=JONG[fi]; out.push(...(finalParts[f]||[f])); }
      } else out.push(ch);
    }
    return out;
  }

  function composeJamo(tokens){
    let out='',i=0;
    while(i<tokens.length){
      const t=tokens[i];
      if(!vowelSet.has(t)&&!consonantSet.has(t)){out+=t;i++;continue;}
      let onset, vowel;
      if(vowelSet.has(t)){onset='ㅇ';}
      else if(vowelSet.has(tokens[i+1])){onset=t;i++;}
      else {out+=t;i++;continue;}
      if(!vowelSet.has(tokens[i])){out+=onset;i++;continue;}
      vowel=tokens[i++];
      if(vowelSet.has(tokens[i])&&combineVowels[vowel+tokens[i]]) vowel=combineVowels[vowel+tokens[i++]];
      let final='';
      if(consonantSet.has(tokens[i])&&finalSet.has(tokens[i])){
        const first=tokens[i];
        if(!vowelSet.has(tokens[i+1])){
          final=first;i++;
          if(consonantSet.has(tokens[i])&&combineFinals[final+tokens[i]]&&!vowelSet.has(tokens[i+1])) final=combineFinals[final+tokens[i++]];
        }
      }
      const ci=CHO.indexOf(onset),vi=JUNG.indexOf(vowel),fi=JONG.indexOf(final);
      if(ci>=0&&vi>=0&&fi>=0) out+=String.fromCharCode(0xAC00+(ci*21+vi)*28+fi);
      else out+=onset+vowel+final;
    }
    return out;
  }

  function insertJamo(input,jamo){
    const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
    const before=input.value.slice(0,start),after=input.value.slice(end);
    const raw=decomposeText(before);raw.push(jamo);
    const composed=composeJamo(raw);
    input.value=composed+after;
    const pos=composed.length;input.setSelectionRange(pos,pos);input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();
  }
  function eraseJamo(input){
    const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
    if(start!==end){input.value=input.value.slice(0,start)+input.value.slice(end);input.setSelectionRange(start,start);return;}
    if(start<=0)return;
    const before=input.value.slice(0,start),after=input.value.slice(start);const raw=decomposeText(before);raw.pop();const composed=composeJamo(raw);input.value=composed+after;input.setSelectionRange(composed.length,composed.length);input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();
  }

  function keyboardHtml(mode){
    const rows=[
      [['q','ㅂ'],['w','ㅈ'],['e','ㄷ'],['r','ㄱ'],['t','ㅅ'],['y','ㅛ'],['u','ㅕ'],['i','ㅑ'],['o','ㅐ'],['p','ㅔ']],
      [['a','ㅁ'],['s','ㄴ'],['d','ㅇ'],['f','ㄹ'],['g','ㅎ'],['h','ㅗ'],['j','ㅓ'],['k','ㅏ'],['l','ㅣ']],
      [['z','ㅋ'],['x','ㅌ'],['c','ㅊ'],['v','ㅍ'],['b','ㅠ'],['n','ㅜ'],['m','ㅡ']]
    ];
    return `<div class="kr-keyboard" data-keyboard="${mode}">
      <div class="kr-kb-head"><div><b>한글 2-set keyboard</b><span> Your English keys map to Korean letters.</span></div><button type="button" class="kb-mode on" data-kb-mode>한글 ON</button></div>
      <div class="kr-kb-hint">Example: <kbd>r</kbd> = ㄱ · <kbd>k</kbd> = ㅏ · <kbd>s</kbd> = ㄴ. Use Shift for ㄲ/ㄸ/ㅃ/ㅆ/ㅉ and ㅒ/ㅖ.</div>
      ${rows.map(row=>`<div class="kr-key-row">${row.map(([latin,jamo])=>`<button type="button" class="kr-key" data-jamo="${jamo}" data-latin="${latin}"><span>${jamo}</span><small>${latin.toUpperCase()}</small></button>`).join('')}</div>`).join('')}
      <div class="kr-key-row utility"><button type="button" class="kr-key wide" data-kb-space><span>Space</span><small>space</small></button><button type="button" class="kr-key wide" data-kb-backspace><span>⌫</span><small>backspace</small></button></div>
    </div>`;
  }

  function bindKoreanKeyboard(root,input){
    const kb=root.querySelector('.kr-keyboard');if(!kb||!input)return;
    let enabled=true;
    const mode=kb.querySelector('[data-kb-mode]');
    const syncMode=()=>{mode.textContent=enabled?'한글 ON':'English ON';mode.classList.toggle('on',enabled)};
    mode.addEventListener('click',()=>{enabled=!enabled;syncMode();input.focus()});
    kb.querySelectorAll('[data-jamo]').forEach(btn=>btn.addEventListener('click',()=>insertJamo(input,btn.dataset.jamo)));
    kb.querySelector('[data-kb-space]').addEventListener('click',()=>{const s=input.selectionStart??input.value.length;input.setRangeText(' ',s,input.selectionEnd??s,'end');input.focus()});
    kb.querySelector('[data-kb-backspace]').addEventListener('click',()=>eraseJamo(input));
    input.addEventListener('keydown',e=>{
      if(!enabled||e.ctrlKey||e.metaKey||e.altKey)return;
      const key=e.key.toLowerCase();
      if(key==='backspace'){e.preventDefault();eraseJamo(input);return;}
      if(latinMap[key]){e.preventDefault();insertJamo(input,(e.shiftKey&&shiftMap[key])?shiftMap[key]:latinMap[key]);}
    });
    syncMode();
  }

  function conceptDetails(q){
    if(!q)return null;
    if(q.tag&&q.tag.startsWith('g13-')&&coursePack){
      const g=coursePack.grammar.find(x=>x.id===q.tag);
      if(g)return {title:`${g.code} · ${g.pattern}`,rule:g.explain,formula:g.formula||'',pitfall:g.pitfall||''};
    }
    if(q.tag==='phone')return {title:'Phone flow',rule:'Choose the expression that matches the stage of the phone call and the relationship between speakers.',formula:'여보세요 → identify → ask for someone → close',pitfall:'Telephone Korean uses conventional expressions; a literal translation can sound unnatural.'};
    if(q.tag==='body')return {title:'Body & health',rule:'Use the body part with 이/가, then 아파요 to say that it hurts.',formula:'body part + 이/가 + 아파요',pitfall:'Choose 이 after a final consonant and 가 after a vowel.'};
    return null;
  }

  const oldQuestionHtml=questionHtml;
  questionHtml=function(q,mode){
    if(q.type==='mcq')return oldQuestionHtml(q,mode);
    return `<div class="question-kicker">${esc(tagName(q.tag))}</div><div class="question">${esc(q.prompt)}</div>
      <div class="answer-row"><input class="answer-input" id="${mode}Input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer"><button class="btn primary" id="${mode}Submit">Check</button></div>
      ${keyboardHtml(mode)}<div id="${mode}Feedback"></div>`;
  };

  const oldBindQuestion=bindQuestion;
  bindQuestion=function(box,q,mode){
    oldBindQuestion(box,q,mode);
    if(q.type!=='mcq')bindKoreanKeyboard(box,document.getElementById(`${mode}Input`));
  };

  checkQuestion=function(q,userAnswer,mode,clicked){
    if((mode==='practice'&&practiceAnswered)||(mode==='quiz'&&quizAnswered))return;
    const correct=isCorrect(q,userAnswer);if(mode==='practice')practiceAnswered=true;else quizAnswered=true;
    if(correct){if(mode==='quiz')quizScore++;resolveMistake(q.id)}else recordMistake(q,userAnswer);
    recordAttempt(q,correct);logActivity(mode);
    const root=document.getElementById(mode==='practice'?'practiceCard':'quizCard');
    if(q.type==='mcq')root.querySelectorAll('[data-choice]').forEach(b=>{const val=q.choices[+b.dataset.choice];if(val===q.answer)b.classList.add('correct');if(b===clicked&&!correct)b.classList.add('wrong');b.disabled=true});
    const f=document.getElementById(`${mode}Feedback`),correctText=q.displayAnswer||q.answer,concept=conceptDetails(q),userText=String(userAnswer||'').trim()||'—';
    const koreanAnswer=/[가-힣]/.test(correctText);
    f.innerHTML=`<div class="feedback-box rich-feedback">
      <div class="feedback-status ${correct?'ok':'no'}">${correct?'✓ Correct':'✕ Not quite'}</div>
      <div class="answer-compare"><div><span>Your answer</span><b>${esc(userText)}</b></div><div><span>Correct answer</span><b>${esc(correctText)}</b>${koreanAnswer?` <button type="button" class="btn ghost small" data-hear-answer>🔊 Hear</button>`:''}</div></div>
      <div class="explain-panel"><b>解析 · Explanation</b><p>${esc(q.why||'Review the related pattern and try again.')}</p>${concept?`<div class="concept-rule"><strong>${esc(concept.title)}</strong><div>${esc(concept.rule)}</div>${concept.formula?`<code>${esc(concept.formula)}</code>`:''}${concept.pitfall?`<small>Watch out: ${esc(concept.pitfall)}</small>`:''}</div>`:''}</div>
      <div class="confidence"><span>How sure were you?</span><button class="btn ghost" data-confidence="guess">Guess</button><button class="btn ghost" data-confidence="unsure">Unsure</button><button class="btn ghost" data-confidence="confident">Confident</button></div>
      <button class="btn primary" style="margin-top:10px" id="${mode}Next">${mode==='quiz'&&quizIndex>=quizQueue.length-1?'See result':'Next'}</button>
    </div>`;
    const hear=f.querySelector('[data-hear-answer]');if(hear)hear.onclick=()=>speak(correctText.replace(/[.?!]/g,''));
    f.querySelectorAll('[data-confidence]').forEach(b=>b.onclick=()=>{recordConfidence(q,b.dataset.confidence);f.querySelectorAll('[data-confidence]').forEach(x=>x.disabled=true);b.textContent='Saved ✓'});
    document.getElementById(`${mode}Next`).onclick=()=>{if(mode==='practice'){practiceIndex=(practiceIndex+1)%practiceQueue.length;renderPracticeQuestion()}else{quizIndex++;if(quizIndex>=quizQueue.length)renderQuizResult();else renderQuizQuestion()}};
  };

  entryHtml=function(x){
    if(x._type==='v'){
      const rr=romanizeKorean(x.korean);
      return `<div class="entry"><div class="entry-body"><div><span class="entry-title">${esc(x.korean)}</span>${x.pos?`<span class="entry-meta">${esc(x.pos)}</span>`:''} <button class="btn ghost small" data-speak="${esc(x.korean)}">🔊</button></div><div class="pronunciation-line"><span>RR</span> ${esc(rr||'—')} <button class="pron-text-btn" data-speak="${esc(x.korean)}">hear pronunciation</button></div><div class="entry-meaning">${esc(x.meaning)}</div>${x.origin?`<div class="entry-origin">${esc(x.origin)}</div>`:''}${x.example?`<div class="entry-example">${esc(oneExample(x.example))}</div>`:''}</div><div class="entry-actions"><button class="star ${isFav(x.id)?'on':''}" data-fav="${esc(x.id)}">★</button></div></div>`;
    }
    return `<div class="entry"><div class="entry-body"><div><span class="entry-title">${esc(x.pattern)}</span>${x.code?`<span class="entry-meta">${esc(x.code)}</span>`:''}</div><div class="entry-meaning">${esc(x.explain)}</div>${x.contrast?`<div class="compare-box"><b>Compare:</b> ${esc(x.contrast)}</div>`:''}</div><div class="entry-actions"><button class="star ${isFav(x.id)?'on':''}" data-fav="${esc(x.id)}">★</button></div></div>`;
  };

  const oldRenderBasics=renderBasics;
  renderBasics=function(){
    oldRenderBasics();
    const syllable=document.getElementById('syllable');if(!syllable)return;
    const card=syllable.closest('.basic-card');
    const line=document.createElement('div');line.className='builder-pronunciation';line.innerHTML='<span id="syllableRR">ga</span><button type="button" class="btn ghost small" id="hearSyllable">🔊 Hear this block</button>';
    syllable.insertAdjacentElement('afterend',line);
    const updatePron=()=>{const s=syllable.textContent.trim();document.getElementById('syllableRR').textContent=`RR: ${romanizeKorean(s)}`;document.getElementById('hearSyllable').onclick=()=>speak(s)};
    ['cho','jung','jong'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(updatePron,0)));
    updatePron();
    const note=document.createElement('div');note.className='beginner-sound-note';note.innerHTML='<b>Sound it out as one block.</b><span>The letters combine visually into one syllable, and the speaker button lets you hear the completed block instead of isolated letters.</span>';
    card.appendChild(note);
  };

  if(typeof renderCurrent==='function')renderCurrent();
})();