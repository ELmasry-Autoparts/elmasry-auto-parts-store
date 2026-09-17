(() => {
  const emit = (name, detail = {}) => {
    window.dispatchEvent(new CustomEvent(`elmasry:${name}`, { detail }));
    if (window.Shopify && window.Shopify.analytics && window.Shopify.analytics.publish) {
      window.Shopify.analytics.publish(`elmasry_${name}`, detail);
    }
  };

  document.querySelectorAll('[data-em-fill]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.querySelector('[data-em-search-input]');
      if (!input) return;
      input.value = button.dataset.emFill || '';
      input.focus();
      emit('search_hint_selected', { query: input.value });
    });
  });

  const searchForm = document.querySelector('[data-em-search-form]');
  if (searchForm) {
    searchForm.addEventListener('submit', () => {
      const input = searchForm.querySelector('[data-em-search-input]');
      emit('search_submitted', { queryLength: (input?.value || '').length });
    });
  }

  const matcher = document.querySelector('[data-em-matcher]');
  if (matcher) {
    const query = matcher.querySelector('[data-em-query]');
    const submit = matcher.querySelector('[data-em-submit]');
    const status = matcher.querySelector('[data-em-status]');
    submit?.addEventListener('click', () => {
      const value = (query?.value || '').trim();
      if (!value) {
        if (status) status.textContent = 'اكتب وصفًا أو رقم OEM أولًا.';
        return;
      }
      if (status) status.textContent = 'في النسخة الإنتاجية سيتم إرسال الطلب إلى تطبيق المطابقة الآمن. تواصل معنا لتأكيد الشاسيه.';
      emit('matcher_started', { mode: 'text', queryLength: value.length });
    });
  }
})();
