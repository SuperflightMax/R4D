const images = new Map([["art02-comparison-1to1.png",{"section":"art-02","path":"artwork/evidence/comparison-1to1.png","title":"Сравнение пересборок в масштабе 1:1","caption":"Исходник и пересборки 1:1. Первый 02-P показан для сравнения с коррекцией."}],["art02-bronze-detail-4x.png",{"section":"art-02","path":"artwork/evidence/bronze-detail-4x.png","title":"Кольцо глаза до и после правки, 4×","caption":"Кольцо глаза до и после правки, 4×."}],["art02-alpha-boards-1to1.png",{"section":"art-02","path":"artwork/evidence/alpha-boards-1to1.png","title":"Прозрачность краёв на трёх подложках","caption":"Края листа на белой, чёрной и контрастной подложках."}],["art01-initial-01-T-01.png",{"section":"art-01","path":"images/01-T-01.png","title":"01-T-01","caption":"Прямой текст"}],["art01-initial-01-T-02.png",{"section":"art-01","path":"images/01-T-02.png","title":"01-T-02","caption":"Прямой текст · мастер"}],["art01-initial-01-D-01.png",{"section":"art-01","path":"images/01-D-01.png","title":"01-D-01","caption":"Художественная постановка · мастер"}],["art01-initial-01-D-02.png",{"section":"art-01","path":"images/01-D-02.png","title":"01-D-02","caption":"Художественная постановка"}],["art01-pair-01-T-02.png",{"section":"art-01","path":"images/01-T-02.png","title":"01-T-02 · Мастер","caption":""}],["art01-pair-01-T-edit-02.png",{"section":"art-01","path":"images/01-T-edit-02.png","title":"01-T-edit-02 · Уточнение","caption":"Горловина с 12% до 29% ширины при цели 27%. Сохранились глазурь, птица и силуэт без ручек."}],["art01-pair-01-D-01.png",{"section":"art-01","path":"images/01-D-01.png","title":"01-D-01 · Мастер","caption":""}],["art01-pair-01-D-edit-02.png",{"section":"art-01","path":"images/01-D-edit-02.png","title":"01-D-edit-02 · Уточнение","caption":"Горловина с 18% до 38% ширины при цели 33%. Сохранились крупный цветок, форма горловины и ножка."}],["art01-pair-01-T-edit-01.png",{"section":"art-01","path":"images/01-T-edit-01.png","title":"01-T-edit-01 · Общая правка","caption":"Горловина с 12% до 42% ширины при цели 27%. Появились две ручки, изменились ветки орнамента."}],["art01-pair-01-D-edit-01.png",{"section":"art-01","path":"images/01-D-edit-01.png","title":"01-D-edit-01 · Общая правка","caption":"Горловина с 18% до 40% ширины при цели 33%. Цветок, форма сосуда и кольцевая ножка узнаваемы."}],["art01-sheets-01-initial.jpg",{"section":"art-01","path":"images/01-initial.jpg","title":"Четыре исходных кадра","caption":""}],["art01-sheets-02-before-after.jpg",{"section":"art-01","path":"images/02-before-after.jpg","title":"Сравнение до и после","caption":""}],["art01-sheets-03-detail.jpg",{"section":"art-01","path":"images/03-detail.jpg","title":"Детали в исходном масштабе","caption":""}]]);
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
