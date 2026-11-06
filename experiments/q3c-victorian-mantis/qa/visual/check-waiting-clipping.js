async (page) => {
  const results = [];
  for (const viewport of [{ width: 360, height: 732 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4187/?seed=42');
    await page.waitForTimeout(900);
    const filename = `output/playwright/mobile/waiting-${viewport.width}x${viewport.height}.png`;
    await page.screenshot({ path: filename });
    results.push({ viewport, filename, snapshot: await page.evaluate(() => window.__Q3C__.snapshot()), geometry: await page.evaluate(() => {
      const stage = document.getElementById('stage').getBoundingClientRect();
      return { stage: { x: stage.x, y: stage.y, width: stage.width, height: stage.height }, canvas: { width: document.querySelector('canvas').width, height: document.querySelector('canvas').height }, scrollWidth: document.documentElement.scrollWidth, innerWidth };
    }) });
  }
  return results;
}
