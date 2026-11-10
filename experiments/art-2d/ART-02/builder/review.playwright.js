async (page) => {
  const root = new URL('/review/r4d/art-2d/', page.url());
  const evidence = 'output/playwright/art02-pixi-03-p-refined-v5-r-flower-locked';
  const requests = new Set();
  const unexpected = [];
  const issues = [];
  let localBlobs = 0;
  const monitor = (context) => {
    context.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol === 'blob:' && url.origin === root.origin) {
        localBlobs += 1;
        return;
      }
      if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) {
        unexpected.push(request.url());
      } else {
        const relative = url.pathname.slice(root.pathname.length);
        requests.add(!relative || relative.endsWith('/') ? relative + 'index.html' : relative);
      }
    });
    context.on('response', (response) => {
      if (response.status() >= 400) issues.push(`${response.status()} ${response.url()}`);
    });
  };
  monitor(page.context());
  const snap = (tab, name) => tab.screenshot({ path: `${evidence}/${name}.png` });
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(root.href);
  await snap(page, '07-review-desktop');
  await page.getByRole('link', { name: /ART-01/ }).click();
  const pictures = await page.locator('figure img').all();
  const files = new Set();
  for (const picture of pictures) {
    await picture.scrollIntoViewIfNeeded();
    files.add(await picture.evaluate(async (image) => {
      await image.decode();
      if (image.naturalWidth < 1) throw new Error('Пустой кадр галереи');
      return image.currentSrc;
    }));
  }
  if (pictures.length !== 13 || files.size !== 11) throw new Error('Не совпал список кадров галереи');
  await page.evaluate(() => scrollTo(0, 0));
  await snap(page, '07-art01-desktop');
  const [full] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: '01-T-01', exact: true }).click(),
  ]);
  const fullSize = await full.locator('#full-image').evaluate(async (image) => {
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  });
  if (fullSize.join(',') !== '1006,1564') throw new Error('Открылся файл другого размера');
  await full.close();
  await page.getByRole('link', { name: '← Оба опыта' }).click();
  await page.getByRole('link', { name: /ART-02/ }).click();
  await page.locator('#scene canvas').waitFor();
  const sheets = await page.locator('.evidence img').all();
  if (sheets.length !== 3) throw new Error('Не совпало число листов ART-02');
  for (const sheet of sheets) {
    await sheet.scrollIntoViewIfNeeded();
    await sheet.evaluate((image) => image.decode());
  }
  const [sheetPage] = await Promise.all([
    page.waitForEvent('popup'), page.getByRole('link', { name: 'Сравнение пересборок в масштабе 1:1' }).click(),
  ]);
  const art02FullSize = await sheetPage.locator('#full-image').evaluate(async (image) => {
    await image.decode();
    if (!image.currentSrc.endsWith('/comparison-1to1.png')) throw new Error('Открылся другой лист ART-02');
    return [image.naturalWidth, image.naturalHeight];
  });
  await sheetPage.close();
  await snap(page, '07-art02-sheets');
  await page.evaluate(() => scrollTo(0, 0));

  const mobile = await page.context().browser().newContext({
    viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1,
  });
  monitor(mobile);
  const phone = await mobile.newPage();
  try {
    await phone.goto(root.href);
    await snap(phone, '08-review-mobile');
    await phone.getByRole('link', { name: /ART-01/ }).tap();
    await phone.waitForLoadState('load');
    for (const image of (await phone.locator('figure img').all()).slice(0, 2)) {
      await image.evaluate((node) => node.decode());
    }
    await phone.evaluate(() => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));
    await snap(phone, '08-art01-mobile');
    await phone.getByRole('link', { name: '← Оба опыта' }).tap();
    await phone.getByRole('link', { name: /ART-02/ }).tap();
    await phone.locator('#scene canvas').waitFor();
    const nav = phone.getByRole('navigation', { name: 'Перейти к колонке' });
    for (const [name, offset] of [['02-P', 366], ['02-R', 732]]) {
      await nav.getByRole('button', { name }).tap();
      const layout = await phone.locator('.viewport').evaluate((view) => ({
        scroll: view.scrollLeft, crop: view.clientWidth, width: document.documentElement.scrollWidth,
      }));
      if (layout.scroll !== offset || layout.crop !== 354 || layout.width !== 360) {
        throw new Error(`Мобильная колонка ${name}: ${JSON.stringify(layout)}`);
      }
    }
    const method = phone.locator('#method-r');
    const hide = method.getByRole('checkbox', { name: 'Скрыть лист' });
    await hide.tap();
    if (!(await hide.isChecked()) || !(await method.getByRole('slider').isDisabled())) {
      throw new Error('Мобильное управление листом недоступно');
    }
    await phone.evaluate(() => scrollTo(0, 0));
    await snap(phone, '08-art02-mobile');
    await phone.evaluate(() => scrollTo(0, 360));
    await snap(phone, '08-art02-mobile-controls');
    await method.getByRole('button', { name: 'Вернуть' }).tap();
    if (await hide.isChecked()) throw new Error('Лист не восстановился на мобильном');
  } finally {
    await mobile.close();
  }
  if (unexpected.length || issues.length) throw new Error(JSON.stringify({ unexpected, issues }));
  return {
    desktop: '1200×900', mobile: '360×800, touch', gallerySlots: pictures.length,
    galleryFiles: files.size, clickedFullSize: fullSize, art02Sheets: sheets.length, art02FullSize,
    externalRequests: unexpected.length,
    failedResponses: issues.length, localBlobs, browserRequests: [...requests].sort(),
  };
}
