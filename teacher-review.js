/* Teacher-facing review packet: source boundaries, copyright care, and feedback workflow. */
(() => {
  function countLessonPackVocab() {
    return allVocab.filter(v => v.source === 'lessons-v1').length;
  }

  function countLessonPackGrammar() {
    return allGrammar.filter(g => g.source === 'lessons-v1').length;
  }

  function countHanjaItems() {
    return allVocab.filter(v => v.source === 'lessons-v1' && v.hanja).length;
  }

  function countUnverifiedEnrichment() {
    return allVocab.filter(v => v.source === 'lessons-v1' && (v.hanja || v.meaningZh || v.originNote || v.originType) && !v.verified).length;
  }

  function reviewMessage() {
    return [
      'Subject: Korean review website prototype for your feedback',
      '',
      'Hi,',
      '',
      'I made a Korean review website prototype for studying the material from class. I did not upload PPT screenshots or original slide images. I also separated the core lesson structure from enrichment notes such as Hanja, Chinese glosses, English loanword/origin notes, food/culture cards, and generated visuals.',
      '',
      'Could you please look at the Teacher Review page and tell me if anything should be corrected, removed, or relabeled?',
      '',
      'The main things I would like checked are:',
      '- grammar explanation accuracy',
      '- vocabulary placement by lesson',
      '- whether any Hanja / Chinese / word-origin notes are wrong or too speculative',
      '- whether any culture or food notes feel inappropriate for class',
      '- whether anything feels too close to your PPT property and should be removed',
      '',
      'Thank you!'
    ].join('\n');
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }

  async function copyText(text, button) {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {}
    if (!ok) ok = fallbackCopy(text);
    if (button) {
      const old = button.textContent;
      button.textContent = ok ? 'Copied' : 'Copy failed';
      setTimeout(() => { button.textContent = old; }, 1400);
    }
  }

  function teacherFeedbackText() {
    const category = document.getElementById('teacherFeedbackCategory')?.value || 'General feedback';
    const note = document.getElementById('teacherFeedbackNote')?.value.trim() || '';
    return [
      `Teacher feedback category: ${category}`,
      '',
      note || '[Write feedback here]',
      '',
      'Suggested action:',
      '[Correct / remove / relabel / needs more verification]'
    ].join('\n');
  }

  function saveTeacherFeedback(button) {
    const note = document.getElementById('teacherFeedbackNote')?.value.trim();
    const category = document.getElementById('teacherFeedbackCategory')?.value || 'General feedback';
    if (!note) {
      button.textContent = 'Write a note first';
      setTimeout(() => { button.textContent = 'Save locally'; }, 1400);
      return;
    }
    local.feedback.push({ type: `Teacher review: ${category}`, text: note, view: 'teacher', lesson: currentLesson, ts: Date.now() });
    writeJSON(KEYS.local, local);
    button.textContent = 'Saved locally';
    setTimeout(() => { button.textContent = 'Save locally'; }, 1400);
  }

  function teacherReviewHtml() {
    const verified = verificationRegister?.verifiedItems?.length || 0;
    const vocab = countLessonPackVocab();
    const grammar = countLessonPackGrammar();
    const practice = allPractice.filter(q => q.source === 'lesson-practice' || q.source?.startsWith('generated')).length;
    const hanja = countHanjaItems();
    const unverified = countUnverifiedEnrichment();
    const sourceCount = verificationRegister?.sources?.length || 0;

    return `
      <div class="teacher-hero">
        <div class="lesson-eyebrow">For teacher review before wider class sharing</div>
        <h2>Teacher Review Packet</h2>
        <p>This page summarizes what the site contains, what is teacher-derived structure, what is enrichment, and what needs review before it is shared with classmates.</p>
        <div class="teacher-hero-actions">
          <button class="btn primary" id="copyTeacherMessage">Copy teacher message</button>
          <button class="btn ghost" data-teacher-jump="feedback">Go to feedback</button>
        </div>
      </div>

      <div class="teacher-stat-grid">
        <article><b>${coursePacks.length || loadStats.lessonPacks || 0}</b><span>structured lesson packs</span></article>
        <article><b>${vocab}</b><span>lesson vocabulary items</span></article>
        <article><b>${grammar}</b><span>lesson grammar items</span></article>
        <article><b>${practice}</b><span>practice and quiz prompts</span></article>
        <article><b>${verified}</b><span>verified enrichment records</span></article>
        <article><b>${unverified}</b><span>unverified enrichment notes</span></article>
      </div>

      <div class="section-title"><h2>Source Boundaries</h2><span class="muted">The most important thing for teacher review</span></div>
      <div class="teacher-boundary-grid">
        <article class="teacher-boundary-card source">
          <span>Teacher-derived structure</span>
          <h3>Core lesson map</h3>
          <p>Lesson order, taught grammar patterns, class vocabulary grouping, and lesson-level learning goals are organized from class study materials.</p>
          <small>No PPT screenshots or original slide images are uploaded.</small>
        </article>
        <article class="teacher-boundary-card verified">
          <span>Verified enrichment</span>
          <h3>Checked learner aids</h3>
          <p>Some Hanja, Chinese glosses, and word-origin notes are marked verified because they are tracked in the enrichment verification register.</p>
          <small>${verified} verified records from ${sourceCount} reference source groups.</small>
        </article>
        <article class="teacher-boundary-card unverified">
          <span>Unverified enrichment</span>
          <h3>Useful, but review needed</h3>
          <p>Remaining Hanja, Chinese glosses, word origins, culture cards, and generated visuals are learning aids for students and should be corrected or removed if needed.</p>
          <small>${hanja} lesson-pack items include Hanja; ${unverified} enrichment notes still need review.</small>
        </article>
      </div>

      <div class="section-title"><h2>PPT Property Protection</h2></div>
      <div class="teacher-policy-grid">
        <div><b>No slide screenshots</b><p>The site should not include screenshots, copied slide layouts, or teacher-owned images from PPT materials.</p></div>
        <div><b>Original visuals first</b><p>Food and vocabulary images currently use original SVG-style illustrations or generated-style visuals, not PPT images.</p></div>
        <div><b>Real photos only with rights</b><p>Real photos should be self-taken, teacher-approved, public-domain, Creative Commons with credit, or otherwise clearly licensed.</p></div>
        <div><b>Light access gate</b><p>The class passcode deters casual access on GitHub Pages. It is not true private account security.</p></div>
      </div>

      <div class="section-title"><h2>Suggested Review Checklist</h2></div>
      <div class="teacher-checklist">
        ${[
          'Are the grammar explanations accurate and at the right level for this class?',
          'Are vocabulary items assigned to the correct lesson?',
          'Should any Hanja, Chinese gloss, or word-origin note be corrected, deleted, or relabeled?',
          'Are the generated practice and quiz questions fair for students?',
          'Are the food and culture notes appropriate for a U.S. high-school Korean class?',
          'Is anything too close to teacher-owned PPT content and should be removed?'
        ].map((item, index) => `<label><input type="checkbox"><span>${index + 1}. ${esc(item)}</span></label>`).join('')}
      </div>

      <div class="section-title" id="teacherFeedbackSection"><h2>Teacher Feedback</h2><span class="muted">This does not send anything automatically</span></div>
      <div class="teacher-feedback-panel">
        <div>
          <label>Feedback type</label>
          <select id="teacherFeedbackCategory">
            <option>Grammar correction</option>
            <option>Vocabulary placement</option>
            <option>Hanja / Chinese / word origin</option>
            <option>Culture or food note</option>
            <option>Copyright / PPT property concern</option>
            <option>General feedback</option>
          </select>
        </div>
        <div>
          <label>Teacher note</label>
          <textarea id="teacherFeedbackNote" placeholder="Example: Lesson 10 -는데요 explanation is good, but please remove/change..."></textarea>
        </div>
        <div class="teacher-feedback-actions">
          <button class="btn primary" id="copyTeacherFeedback">Copy feedback note</button>
          <button class="btn ghost" id="saveTeacherFeedback">Save locally</button>
        </div>
        <p class="muted">Because this GitHub Pages site has no backend, feedback is either copied for email/message or saved only in this browser.</p>
      </div>
    `;
  }

  function renderTeacherReview() {
    const el = document.getElementById('view-teacher');
    if (!el) return;
    el.innerHTML = teacherReviewHtml();
    document.getElementById('copyTeacherMessage')?.addEventListener('click', e => copyText(reviewMessage(), e.currentTarget));
    document.getElementById('copyTeacherFeedback')?.addEventListener('click', e => copyText(teacherFeedbackText(), e.currentTarget));
    document.getElementById('saveTeacherFeedback')?.addEventListener('click', e => saveTeacherFeedback(e.currentTarget));
    el.querySelectorAll('[data-teacher-jump]').forEach(btn => btn.addEventListener('click', () => {
      document.getElementById('teacherFeedbackSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('teacherFeedbackNote')?.focus();
    }));
  }

  viewTitles.teacher = ['Teacher Review', 'Source boundaries, PPT-property care, and teacher feedback checklist.'];
  window.renderTeacherReviewPage = renderTeacherReview;
  const baseRenderCurrent = renderCurrent;
  renderCurrent = function() {
    if (currentView === 'teacher') renderTeacherReview();
    else baseRenderCurrent();
  };

  if (currentView === 'teacher') renderTeacherReview();
})();
