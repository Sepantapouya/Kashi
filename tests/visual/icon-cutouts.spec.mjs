import { test, expect } from '@playwright/test';
import { renderBody } from '../../packages/icons/src/render.js';

const frame = '<path d="M3 3h14v14H3Z"/>';
const cases = [
  ['filled letter', '<path d="M6 7h8v2h-3v4H9V9H6Z" fill="currentColor" stroke="none"/>', [10, 8]],
  ['filled dot', '<circle cx="10" cy="10" r="1.25" fill="currentColor" stroke="none"/>', [10, 10]],
];

for (const [label, detail, point] of cases) {
  test(`bold ${label} stays transparent for dark and light icon colors`, async ({ page }) => {
    const body = renderBody(frame + detail, 'bold', { uid: 'cutout-test' });
    const samples = await page.evaluate(async ({ body, point }) => {
      const result = [];
      for (const color of ['#161616', '#ffffff']) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" style="color:${color}">${body}</svg>`;
        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 80;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const alpha = (x, y) => ctx.getImageData(x * 4, y * 4, 1, 1).data[3];
        result.push({ cutout: alpha(...point), body: alpha(5, 10), outside: alpha(1, 1) });
      }
      return result;
    }, { body, point });
    expect(samples).toEqual([
      { cutout: 0, body: 255, outside: 0 },
      { cutout: 0, body: 255, outside: 0 },
    ]);
  });
}
