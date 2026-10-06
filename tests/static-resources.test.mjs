import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// By default these checks read the source checkout. Set COURSE_URL (for example
// http://127.0.0.1:8080/ for a local container, or the hosted course URL) to
// check the same resources as served over HTTP.
const courseUrl = process.env.COURSE_URL;

const appleIcons = {
  'apple-touch-icon.png': 180,
  'apple-touch-icon-precomposed.png': 180,
  'apple-touch-icon-240x240.png': 240,
  'apple-touch-icon-240x240-precomposed.png': 240,
};
const rootResources = ['favicon.ico', ...Object.keys(appleIcons), 'robots.txt'];

async function load(path, contentType) {
  if (!courseUrl) return readFileSync(new URL(`../${path || 'ai-101-course.html'}`, import.meta.url));
  const response = await fetch(new URL(path, courseUrl));
  assert.equal(response.status, 200, `/${path} returns HTTP 200`);
  assert.match(response.headers.get('content-type') || '', contentType, `/${path} content type`);
  return Buffer.from(await response.arrayBuffer());
}

function pngInfo(bytes) {
  assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a', 'PNG signature');
  assert.equal(bytes.toString('latin1', 12, 16), 'IHDR');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), colorType: bytes[25] };
}

function icoSizes(bytes) {
  assert.deepEqual([bytes.readUInt16LE(0), bytes.readUInt16LE(2)], [0, 1], 'ICO header');
  return Array.from({ length: bytes.readUInt16LE(4) }, (_, index) => {
    const entry = 6 + index * 16;
    const length = bytes.readUInt32LE(entry + 8);
    const offset = bytes.readUInt32LE(entry + 12);
    assert.ok(length > 0 && offset + length <= bytes.length, 'icon image lies within the file');
    const image = bytes.subarray(offset, offset + length);
    assert.ok(image.toString('hex', 0, 4) === '89504e47' || image.readUInt32LE(0) === 40, 'icon image is PNG or BMP');
    return `${bytes[entry] || 256}x${bytes[entry + 1] || 256}`;
  });
}

test('the course head declares local favicon and Apple touch icon assets', async () => {
  const html = (await load('', /^text\/html\b/)).toString('utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  assert.match(head, /<link rel="icon" href="favicon\.ico" sizes="16x16 32x32 48x48">/);
  assert.match(head, /<link rel="icon" type="image\/png" href="logomark_Liatrio_background\.png">/);
  assert.match(head, /<link rel="apple-touch-icon" href="apple-touch-icon\.png">/);
  assert.doesNotMatch(head, /<link[^>]+href="(?:https?:)?\/\//, 'icons are local, not CDN-hosted');
});

test('/favicon.ico is a multi-size icon', async () => {
  const bytes = await load('favicon.ico', /^image\/(?:x-icon|vnd\.microsoft\.icon)\b/);
  assert.deepEqual(icoSizes(bytes).sort(), ['16x16', '32x32', '48x48']);
});

for (const [path, size] of Object.entries(appleIcons)) {
  test(`/${path} is an opaque ${size}x${size} PNG`, async () => {
    const { width, height, colorType } = pngInfo(await load(path, /^image\/png\b/));
    assert.deepEqual([width, height], [size, size]);
    // iOS fills transparent touch-icon pixels with black.
    assert.ok(![4, 6].includes(colorType), 'no alpha channel');
  });
}

test('precomposed Apple icon aliases match their canonical images', async () => {
  for (const size of ['', '-240x240']) {
    assert.deepEqual(
      await load(`apple-touch-icon${size}-precomposed.png`, /^image\/png\b/),
      await load(`apple-touch-icon${size}.png`, /^image\/png\b/),
    );
  }
});

test('/robots.txt explicitly allows crawling without advertising a sitemap', async () => {
  const robots = (await load('robots.txt', /^text\/plain\b/)).toString('utf8');
  const rules = robots.split(/\r?\n/).map((line) => line.replace(/#.*/, '').trim()).filter(Boolean);
  assert.deepEqual(rules, ['User-agent: *', 'Disallow:']);
});

test('the Docker image copies every root browser resource into /srv', { skip: courseUrl && 'checks the source checkout' }, () => {
  const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
  assert.match(dockerfile, /^WORKDIR \/srv$/m);
  const copied = (dockerfile.match(/^COPY .+ \.\/$/gm) || []).flatMap((line) => line.split(/\s+/).slice(1, -1));
  for (const path of rootResources) assert.ok(copied.includes(path), `Dockerfile copies ${path}`);
});

test('unknown paths still return 404', { skip: !courseUrl && 'needs COURSE_URL' }, async () => {
  const response = await fetch(new URL('no-such-course-page', courseUrl));
  assert.equal(response.status, 404);
});
