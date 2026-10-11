/* yanneshmeijman.com — small behaviours, no dependencies. */

/* ---------- Background videos ----------
   <div class="backdrop" data-youtube="VIDEO_ID" data-fit="contain|cover" data-ratio="1.777">
   The YouTube player is made taller than the video and cropped, which pushes
   YouTube's title bar and controls out of view (same trick Cargo used). */
const YT_CROP = 200; // px of player hidden above and below the video

function youtubeSrc(id) {
  const p = new URLSearchParams({
    autoplay: 1, mute: 1, loop: 1, playlist: id, controls: 0, disablekb: 1,
    playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, fs: 0,
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${p}`;
}

function sizeBackdrop(box) {
  const frame = box.querySelector('.frame');
  if (!frame) return;
  const W = box.clientWidth, H = box.clientHeight;
  const r = parseFloat(box.dataset.ratio) || 16 / 9;
  const fit = box.dataset.fit || 'contain';
  const w = fit === 'cover' ? Math.max(W, H * r) : Math.min(W, H * r);
  const h = w / r;
  frame.style.width = `${w}px`;
  frame.style.height = `${h}px`;
  const iframe = frame.querySelector('iframe');
  if (iframe) {
    iframe.style.height = `${h + YT_CROP * 2}px`;
    iframe.style.top = `${-YT_CROP}px`;
  }
}

function startBackdrop(box) {
  if (box.dataset.started) return;
  box.dataset.started = '1';
  const frame = box.querySelector('.frame');
  if (box.dataset.youtube) {
    const iframe = document.createElement('iframe');
    iframe.src = youtubeSrc(box.dataset.youtube);
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.tabIndex = -1;
    iframe.title = box.dataset.title || 'Background video';
    iframe.addEventListener('load', () => setTimeout(() => box.classList.add('playing'), 1200));
    frame.appendChild(iframe);
  } else if (box.dataset.video) {
    const v = document.createElement('video');
    Object.assign(v, { src: box.dataset.video, autoplay: true, muted: true, loop: true, playsInline: true });
    frame.appendChild(v);
  }
  sizeBackdrop(box);
}

const backdrops = [...document.querySelectorAll('.backdrop')];
const visible = box => getComputedStyle(box).display !== 'none';

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting && visible(e.target)) startBackdrop(e.target); });
}, { rootMargin: '50% 0px' });

const ro = new ResizeObserver(entries => entries.forEach(e => sizeBackdrop(e.target)));
backdrops.forEach(box => { sizeBackdrop(box); io.observe(box); ro.observe(box); });

/* ---------- Mobile header height (content starts below it) ---------- */
const mobileHeader = document.querySelector('.site-header.mobile');
function setHeaderHeight() {
  if (mobileHeader) document.documentElement.style.setProperty('--mobile-header-h', `${mobileHeader.offsetHeight}px`);
}
setHeaderHeight();
addEventListener('resize', setHeaderHeight);
document.fonts && document.fonts.ready.then(setHeaderHeight);

/* ---------- Draggable business card ---------- */
document.querySelectorAll('[data-draggable]').forEach(el => {
  let sx, sy, ox = 0, oy = 0, moved = false;
  el.addEventListener('pointerdown', e => {
    sx = e.clientX - ox; sy = e.clientY - oy; moved = false;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    ox = e.clientX - sx; oy = e.clientY - sy;
    if (Math.abs(ox) + Math.abs(oy) > 3) moved = true;
    el.style.setProperty('--dx', `${ox}px`);
    el.style.setProperty('--dy', `${oy}px`);
  });
  // a drag should not count as a click on the e-mail link inside
  el.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
});

/* ---------- Flying object (the pigeon on the About page) ---------- */
document.querySelectorAll('.flyer').forEach(img => {
  const speed = parseFloat(img.dataset.speed) || 40; // px per second-ish, like Cargo's setting
  let x = -innerWidth * 0.3, y = innerHeight * 0.4, angle = 0.15;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(now - last, 50) / 1000; last = now;
    angle += (Math.random() - 0.5) * 0.08;               // gentle wandering
    x += Math.cos(angle) * speed * 4 * dt;
    y += Math.sin(angle) * speed * 4 * dt;
    const w = img.offsetWidth, h = img.offsetHeight;
    if (x > innerWidth + 20) { x = -w; y = Math.random() * (innerHeight - h); angle = (Math.random() - 0.5) * 0.6; }
    if (y < -h) y = innerHeight;
    if (y > innerHeight) y = -h;
    img.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(frame);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(frame);
  else img.remove();
});

/* ---------- Click-to-zoom images ---------- */
document.addEventListener('click', e => {
  const img = e.target.closest('img.zoomable');
  if (img) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    const big = new Image();
    big.src = img.dataset.full || img.currentSrc || img.src;
    big.alt = img.alt;
    box.appendChild(big);
    box.addEventListener('click', () => box.remove());
    document.body.appendChild(box);
    return;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.lightbox').forEach(b => b.remove());
});
