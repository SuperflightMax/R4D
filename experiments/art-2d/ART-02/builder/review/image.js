const images = new Map(/* IMAGE_CATALOG */ []);
const entry = images.get(new URLSearchParams(location.search).get('file'));

if (entry) {
  const section = entry.section.toUpperCase();
  const back = document.querySelector('#back');
  const caption = document.querySelector('#caption');
  const size = document.querySelector('#size');
  const image = document.querySelector('#full-image');
  document.title = `${entry.title} · ${section}`;
  document.querySelector('h1').textContent = entry.title;
  document.querySelector('#section').textContent = `R4D / ${section}`;
  back.href = `./${entry.section}/`;
  back.textContent = `← ${section}`;
  caption.textContent = entry.caption;
  caption.hidden = !entry.caption;
  image.alt = entry.title;
  image.addEventListener('load', () => {
    size.textContent = `${image.naturalWidth}×${image.naturalHeight} px · 1:1`;
    size.hidden = false;
    image.hidden = false;
  }, { once: true });
  image.src = `./${entry.section}/${entry.path}`;
}
