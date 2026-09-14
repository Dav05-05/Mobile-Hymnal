import fs from 'node:fs/promises';
import path from 'node:path';
import { createWorker } from 'tesseract.js';
import { englishHymns } from '../src/data/english.js';

const root = process.cwd();
const lyricsPath = path.join(root, 'src/lyrics.js');

const normalize = (value) => value
  .replace(/[|_~=]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const isLyricLine = (line, title) => {
  const normalized = normalize(line);
  const words = normalized.match(/[A-Za-z]+(?:['’-][A-Za-z]+)?/g) || [];
  const titleWords = title.toLowerCase().split(/\s+/).filter(Boolean);
  const titleMatch = titleWords.filter((word) => normalized.toLowerCase().includes(word)).length;
  const letters = (normalized.match(/[A-Za-z]/g) || []).length;
  const symbols = (normalized.match(/[^A-Za-z0-9\s'’-]/g) || []).length;

  if (words.length < 3 || words.filter((word) => word.length > 2).length < 2) return false;
  if (letters < 18 || symbols > letters / 3) return false;
  if (titleMatch >= Math.max(2, titleWords.length - 1) && words.length <= titleWords.length + 2) return false;
  if (/^(?:page|music|hymn)\s*\d*$/i.test(normalized)) return false;
  return true;
};

const worker = await createWorker('eng');
const lyrics = {};

try {
  for (const hymn of englishHymns) {
    const lines = [];

    for (const page of hymn.pages) {
      const imagePath = path.join(root, 'public/english-scans', `page-${String(page).padStart(3, '0')}.jpg`);
      const result = await worker.recognize(imagePath);
      lines.push(...result.data.text.split('\n'));
      process.stdout.write(`OCR ${hymn.id}/${englishHymns.length}: ${hymn.title}\n`);
    }

    const cleaned = lines
      .map(normalize)
      .filter((line) => isLyricLine(line, hymn.title));

    lyrics[`english-${hymn.id}`] = cleaned.length ? `\n${cleaned.join('\n')}\n` : '';
  }
} finally {
  await worker.terminate();
}

const formatEntry = ([key, value]) => {
  const safeValue = value.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  return `  "${key}": \`${safeValue}\`,`;
};

const currentLyrics = await fs.readFile(lyricsPath, 'utf8');
const englishStart = currentLyrics.indexOf('  // English Category ("english-id")');
const worshipStart = currentLyrics.indexOf('  // Worship Category ("worship-id")');

if (englishStart === -1 || worshipStart === -1 || englishStart >= worshipStart) {
  throw new Error(`Could not find the English and Worship sections in ${lyricsPath}`);
}

const englishSection = [
  '  // English Category ("english-id")',
  ...Object.entries(lyrics).map(formatEntry),
  '',
].join('\n');

await fs.writeFile(lyricsPath, `${currentLyrics.slice(0, englishStart)}${englishSection}${currentLyrics.slice(worshipStart)}`);
console.log(`Wrote ${Object.keys(lyrics).length} English hymn OCR entries to ${path.relative(root, lyricsPath)}`);