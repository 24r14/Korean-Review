/* Quiz patch: keep questions within a type that has enough distractors. */
newQuiz = function(){
  const box=document.getElementById('quizCard');
  if(!box)return;

  const p=currentPool();
  const vocab=p.vocab.filter(x=>x.korean && x.meaning).map(x=>({...x,_type:'v'}));
  const grammar=p.grammar.filter(x=>x.pattern && x.explain).map(x=>({...x,_type:'g'}));

  let groups=[];
  if(quizType==='vocab') groups=[vocab];
  else if(quizType==='grammar') groups=[grammar];
  else groups=[vocab,grammar].filter(g=>g.length>=2);

  if(!groups.length || groups.every(g=>g.length<2)){
    const label=quizType==='vocab'?'vocabulary items':quizType==='grammar'?'grammar points':'items of the same type';
    box.innerHTML=`<div class="empty">This lesson does not have enough ${label} for a multiple-choice quiz yet. Try <b>All lessons</b>, another lesson, or add more content.</div>`;
    return;
  }

  // In Mixed mode, prefer the larger pool but still occasionally mix question types.
  let group;
  if(groups.length===1) group=groups[0];
  else {
    const weighted=[];
    groups.forEach(g=>{ for(let i=0;i<Math.max(1,g.length);i++) weighted.push(g); });
    group=weighted[Math.floor(Math.random()*weighted.length)];
  }

  const target=group[Math.floor(Math.random()*group.length)];
  let question,correct,values;

  if(target._type==='v'){
    const reverse=Math.random()<0.5;
    question=reverse?target.meaning:target.korean;
    correct=reverse?target.korean:target.meaning;
    values=group.filter(x=>x.id!==target.id).map(x=>reverse?x.korean:x.meaning);
  }else{
    question=target.pattern;
    correct=target.explain;
    values=group.filter(x=>x.id!==target.id).map(x=>x.explain);
  }

  const distractors=[...new Set(values.map(x=>String(x||'').trim()).filter(x=>x && x!==String(correct).trim()))]
    .sort(()=>Math.random()-0.5)
    .slice(0,3);

  if(!correct || distractors.length<1){
    box.innerHTML='<div class="empty">There are not enough distinct answers to build a useful quiz for this selection yet.</div>';
    return;
  }

  const choices=[correct,...distractors].sort(()=>Math.random()-0.5);
  quiz={target,question,correct,choices,answered:false};

  const countNote=choices.length<4
    ? `<div class="muted" style="margin-top:7px">${choices.length} choices available from this lesson. Add more ${target._type==='v'?'vocabulary':'grammar'} to get 4-choice questions.</div>`
    : '';

  box.innerHTML=`
    <div class="muted">${target._type==='v'?'Vocabulary':'Grammar'}</div>
    <h3 style="margin:7px 0 0">${esc(question)}</h3>
    ${countNote}
    <div class="quiz-options">
      ${choices.map((c,i)=>`<button class="quiz-choice" data-i="${i}">${esc(String(c).length>180?String(c).slice(0,180)+'…':c)}</button>`).join('')}
    </div>
    <div class="quiz-feedback" id="quizFeedback"></div>`;

  box.querySelectorAll('.quiz-choice').forEach((b,i)=>b.onclick=()=>answerQuiz(i));
};
