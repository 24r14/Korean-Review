/* Prevent a MutationObserver feedback loop in the audio-status helper from freezing Explore. */
(() => {
  const NativeMutationObserver = window.MutationObserver;
  if (!NativeMutationObserver || window.__koreanReviewSafeMutationObserver) return;
  window.__koreanReviewSafeMutationObserver = true;

  window.MutationObserver = class SafeMutationObserver {
    constructor(callback) {
      this._observer = new NativeMutationObserver((mutations) => {
        const meaningful = mutations.filter((mutation) => {
          const target = mutation.target?.nodeType === 1
            ? mutation.target
            : mutation.target?.parentElement;
          return !(target?.closest && target.closest('[data-audio-status]'));
        });
        if (meaningful.length) callback(meaningful, this);
      });
    }
    observe(target, options) { return this._observer.observe(target, options); }
    disconnect() { return this._observer.disconnect(); }
    takeRecords() { return this._observer.takeRecords(); }
  };
})();
