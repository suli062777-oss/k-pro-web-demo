const root = document.querySelector('#anatomy-root');
let started = false;
async function start() {
  if (started) return;
  started = true;
  try {
    const { mountAnatomy } = await import('./assets/anatomy-engine.js?v=20261017-ux-final');
    mountAnatomy(root);
  } catch (error) {
    root.innerHTML = '<div class="anatomy-placeholder"><h2 id="product-title">L Pro</h2><p>产品交互暂时无法加载 / Product preview unavailable.</p><button type="button">重新加载 / Retry</button></div>';
    root.querySelector('button').addEventListener('click', () => { started = false; start(); });
    console.warn('Anatomy module unavailable', error.message);
  }
}
const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { observer.disconnect(); start(); } }, { rootMargin: '400px' });
observer.observe(root);
