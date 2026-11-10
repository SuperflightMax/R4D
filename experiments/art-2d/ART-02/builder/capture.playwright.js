async (page) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.locator('#scene canvas').waitFor();
  const response = await page.request.get(new URL('/assembly.json', page.url()).href);
  const assembly = await response.json();
  const directory = `output/playwright/${assembly.version}`;
  const canvas = page.locator('#scene canvas');
  const overlay = page.locator('#overlay');
  const eye = page.locator('#eye');
  const backdrop = page.locator('#backdrop');
  const capture = (name) => page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
  const frame = await canvas.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    const context = element.getContext('webgl2') ?? element.getContext('webgl');
    return {
      x, y, width, height, bitmap: [element.width, element.height], dpr: devicePixelRatio,
      gl: context?.getParameter(context.VERSION), browser: navigator.userAgent,
    };
  });
  if (frame.width !== 1086 || frame.height !== 320 || frame.dpr !== 1 || !frame.gl) {
    throw new Error(`Неожиданный режим canvas: ${JSON.stringify(frame)}`);
  }
  const baseline = await canvas.screenshot();
  await capture('01-assembled');
  await overlay.check();
  await capture('02-overlay');
  await overlay.uncheck();
  const methods = [];
  for (const [key, path] of Object.entries(assembly.methods)) {
    const panel = page.locator(key === '02-P' ? '#method-p' : '#method-r');
    const slider = panel.getByRole('slider');
    const select = panel.getByRole('combobox');
    const reset = panel.getByRole('button', { name: 'Вернуть' });
    const metadata = panel.locator('.layer-meta li:visible');
    const initial = await metadata.allTextContents();
    const maxShift = await slider.getAttribute('max');
    await slider.press('End');
    const shifted = await metadata.allTextContents();
    if (await slider.inputValue() !== maxShift || (await canvas.screenshot()).equals(baseline)) {
      throw new Error(`${key}: сдвиг не отобразился`);
    }
    await capture(`03-${key}-reveal`);
    await reset.click();
    if (!(await canvas.screenshot()).equals(baseline)) {
      throw new Error(`${key}: возврат отличается от исходного кадра`);
    }
    await select.selectOption('base');
    await capture(`04-${key}-base`);
    await select.selectOption('monstera');
    for (const color of ['white', 'black', 'checker']) {
      await backdrop.selectOption(color);
      await capture(`05-${key}-leaf-${color}`);
    }
    if (await select.locator('option[value="contact-shadow"]').count()) {
      await select.selectOption('contact-shadow');
      await capture(`05-${key}-contact-shadow`);
    }
    await select.selectOption('');
    methods.push({ method: key, path, maxShiftPx: Number(maxShift), initial, shifted, resetIdentical: true });
  }
  if (await eye.isEnabled()) {
    await eye.check();
    if ((await canvas.screenshot()).equals(baseline)) throw new Error('Правка глаза не отобразилась');
    await capture('06-eye-after');
    await eye.uncheck();
    if (!(await canvas.screenshot()).equals(baseline)) throw new Error('Возврат правки изменил исходный кадр');
  }
  return { version: assembly.version, pixi: await page.locator('#version').innerText(), frame, methods };
}
