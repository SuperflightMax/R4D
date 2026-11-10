async (page) => {
  const root = new URL('/review/r4d/art-2d/', page.url());
  const dimensions = new Map([
    ['01-D-01.png', [1006, 1564]], ['01-D-02.png', [1006, 1564]],
    ['01-D-edit-01.png', [1005, 1565]], ['01-D-edit-02.png', [1006, 1564]],
    ['01-T-01.png', [1006, 1564]], ['01-T-02.png', [1006, 1564]],
    ['01-T-edit-01.png', [1006, 1564]], ['01-T-edit-02.png', [1005, 1565]],
    ['01-initial.jpg', [1506, 696]], ['02-before-after.jpg', [1506, 696]], ['03-detail.jpg', [1186, 1180]],
    ['comparison-1to1.png', [1122, 1150]], ['bronze-detail-4x.png', [485, 472]],
    ['alpha-boards-1to1.png', [1461, 1135]],
  ]);
  const problems = [];
  const results = [];
  const context = page.context();
  context.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol === 'blob:' && url.origin === root.origin) return;
    if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) problems.push(request.url());
  });
  context.on('response', (response) => {
    if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
  });
  for (const [section, selector] of [['art-01', '.gallery figure'], ['art-02', '.evidence figure']]) {
    const parent = new URL(`${section}/`, root);
    await page.goto(parent.href);
    for (const figure of await page.locator(selector).all()) {
      const preview = figure.locator('img');
      const expected = await preview.evaluate((image) => ({ src: image.src, title: image.alt }));
      const expectedCaption = await figure.locator('figcaption').innerText();
      const [popup] = await Promise.all([page.waitForEvent('popup'), figure.getByRole('link').click()]);
      try {
        await popup.waitForLoadState('networkidle');
        const opened = await popup.locator('#full-image').evaluate(async (image) => {
          await image.decode();
          const rect = image.getBoundingClientRect();
          return { src: image.currentSrc, natural: [image.naturalWidth, image.naturalHeight],
            rendered: [rect.width, rect.height] };
        });
        const filename = new URL(expected.src).pathname.split('/').at(-1);
        const caption = await popup.locator('#caption').innerText();
        if (new URL(popup.url()).pathname !== new URL('image.html', root).pathname
            || opened.src !== expected.src
            || opened.natural.join() !== dimensions.get(filename)?.join()
            || opened.rendered.join() !== opened.natural.join()
            || await popup.locator('h1').innerText() !== expected.title
            || await popup.locator('#back').getAttribute('href') !== `./${section}/`
            || await popup.locator('link[rel="icon"]').getAttribute('href') !== 'data:,'
            || (caption && !expectedCaption.includes(caption))) {
          throw new Error(`Неверное полноразмерное открытие ${filename}: ${JSON.stringify(opened)}`);
        }
        results.push({ title: expected.title, file: filename, natural: opened.natural });
      } finally {
        await popup.close();
      }
    }
  }
  for (const unknown of ['../favicon.ico', 'https://example.invalid/test.png', 'art02-unknown.png']) {
    const invalid = new URL('image.html', root);
    invalid.searchParams.set('file', unknown);
    await page.goto(invalid.href, { waitUntil: 'networkidle' });
    if (await page.locator('#full-image').getAttribute('src') !== null) {
      throw new Error(`Неизвестный ID загрузил файл: ${unknown}`);
    }
  }
  if (new Set(results.map(({ file }) => file)).size !== dimensions.size || results.length !== 16 || problems.length) {
    throw new Error(JSON.stringify({ results, problems }));
  }
  return { opened: results, rejectedIds: 3, unexpectedOrFailed: problems.length };
}
