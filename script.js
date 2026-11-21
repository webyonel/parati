(() => {
  const steps = [...document.querySelectorAll('.journey-step')];
  const label = document.querySelector('#progress-label');
  const fill = document.querySelector('#progress-fill');
  let current = 0;
  const requestedImages = new Map();

  function requestImage(url) {
    if (!requestedImages.has(url)) {
      const image = new Image();
      image.decoding = 'async';
      image.fetchPriority = 'low';
      image.src = url;
      requestedImages.set(url, new Promise(resolve => {
        if (image.complete) resolve(image);
        else {
          image.onload = () => resolve(image);
          image.onerror = () => resolve(null);
        }
      }));
    }
    return requestedImages.get(url);
  }

  function loadStepImages(index) {
    const step = steps[index];
    if (!step) return;
    step.querySelectorAll('[data-photo]').forEach(async element => {
      const url = element.dataset.photo;
      const image = await requestImage(url);
      if (image) element.style.backgroundImage = `url("${url}")`;
    });
  }

  function showStep(index) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => {
      step.classList.toggle('active', i === current);
      step.setAttribute('aria-hidden', String(i !== current));
    });
    label.textContent = `${String(current + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    fill.style.width = `${((current + 1) / steps.length) * 100}%`;
    document.body.classList.toggle('is-final', current === steps.length - 1);
    loadStepImages(current);
    // Warm only the next section's images, rather than downloading the whole gallery up front.
    const next = steps[current + 1];
    next?.querySelectorAll('[data-photo]').forEach(element => requestImage(element.dataset.photo));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => showStep(current + 1)));
  document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => showStep(current - 1)));
  document.querySelector('.restart-button').addEventListener('click', () => showStep(0));
  document.querySelector('.brand').addEventListener('click', event => {
    event.preventDefault();
    showStep(0);
  });
  showStep(0);
})();
