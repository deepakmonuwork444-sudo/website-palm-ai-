// Render a PDF's pages to PNG with pdf.js in headless Chrome (to look at a generated PDF).
// Usage: node research-tools/pdf-pages.mjs <file.pdf> <pdfjsBuildDir> <outPrefix>
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [file, pdfjsDir, outPrefix] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
await page.route('https://pdfjs.local/**', (route) => {
  const name = route.request().url().split('/').pop();
  route.fulfill({ body: readFileSync(join(pdfjsDir, name)), contentType: 'text/javascript' });
});
await page.route('https://pdfjs.local/index.html', (route) => route.fulfill({ body: '<!doctype html><body></body>', contentType: 'text/html' }));
await page.goto('https://pdfjs.local/index.html');
const data = readFileSync(file).toString('base64');
const pages = await page.evaluate(async (b64) => {
  const pdfjs = await import('https://pdfjs.local/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://pdfjs.local/pdf.worker.min.mjs';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const p = await doc.getPage(i);
    const vp = p.getViewport({ scale: 1.4 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width;
    canvas.height = vp.height;
    await p.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    const links = (await p.getAnnotations()).filter((a) => a.subtype === 'Link').map((a) => a.url);
    out.push({ png: canvas.toDataURL('image/png').split(',')[1], links });
  }
  return out;
}, data);
pages.forEach((p, i) => writeFileSync(`${outPrefix}-p${i + 1}.png`, Buffer.from(p.png, 'base64')));
console.log(JSON.stringify({ pages: pages.length, links: pages.map((p) => p.links), bytes: readFileSync(file).length }));
await browser.close();
