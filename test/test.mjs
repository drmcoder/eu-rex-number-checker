// Checks for src/rex.ts. Made-up pages in the Commission's layout; no real exporter data.
//   node test/test.mjs   (Node 22.18+, which runs .ts imports directly)
import assert from 'node:assert/strict';
import * as REX from '../src/rex.ts';

const row = (l, v) => `<tr><td>\n<b>${l}</b></td>\n<td class="rex_det_cell_last">${v}\n</td></tr>`;
const VALID = `<table>${row('Status of the REX number', 'The REX number is valid')}${row('Date of registration', '01-02-2026')}${row('Name of the registered exporter', 'Example &amp; Sons')}${row('E-mail address', 'owner@example.com')}${row('Street and Number', 'Secret Street 1')}${row('Country', 'Nepal')}</table>`;
// Same shape as the real page: the message box is padded with long runs of whitespace.
const MISSING = `<div id="search_info" >\n${' '.repeat(28)}<p>This REX or EORI/TIN number does not exist</p>${`\n${' '.repeat(32)}`.repeat(30)}</div>`;

// Format
assert.ok(REX.REX_RE.test('NPREX1244417670168NPTEPC') && REX.REX_RE.test('INREXAB1234'));
for (const bad of ['NPREX', 'NPX123', 'nprex123', '1PREX123', 'NPREX' + '1'.repeat(31)]) assert.ok(!REX.REX_RE.test(bad), bad);
// Input: spaces inside one number kept together, lists split, duplicates dropped, at most 10
assert.deepEqual(REX.splitRex('NPREX 1244417670168 NPTEPC'), ['NPREX1244417670168NPTEPC']);
assert.deepEqual(REX.splitRex('NPREX11 DEREX22'), ['NPREX11', 'DEREX22']);
assert.deepEqual(REX.splitRex('NPREX1, nprex1;DEREX2\nINREX3'), ['NPREX1', 'DEREX2', 'INREX3']);
assert.equal(REX.splitRex(Array.from({ length: 25 }, (_, i) => `NPREX${i}`).join(',')).length, REX.REX_MAX);
// Parsing
const v = REX.parseRexHtml(VALID);
assert.equal(v.status, 'valid'); assert.equal(v.registered, '01-02-2026'); assert.equal(v.name, 'Example & Sons'); assert.equal(v.country, 'Nepal');
assert.ok(!JSON.stringify(v).includes('@') && !JSON.stringify(v).includes('Secret'), 'address and e-mail never passed on');
assert.equal(REX.parseRexHtml(MISSING).status, 'not-found');
assert.equal(REX.parseRexHtml(`<table>${row('Status of the REX number', 'The REX number is not valid')}</table>`).status, 'not-valid');
assert.equal(REX.parseRexHtml('<p>If a number does not exist, contact us.</p>' + VALID).status, 'valid');
assert.equal(REX.parseRexHtml('<html><body>Service maintenance</body></html>').status, 'unavailable');
// Links
assert.match(REX.ecRexUrl('NPREX1', 'de'), /Lang=de/); assert.match(REX.ecRexUrl('NPREX1', 'ja'), /Lang=en/);
// checkRex with a stand-in for the Commission's page
const realFetch = globalThis.fetch;
globalThis.fetch = async (u) => new Response(new URL(String(u)).searchParams.get('Number') === 'NPREXGOOD1' ? VALID : MISSING);
try {
  const r = await REX.checkRex('NPREXGOOD1, hello, NPREXNONE2', { pauseMs: 0 });
  assert.deepEqual(r.map((x) => [x.number, x.status]), [['NPREXGOOD1', 'valid'], ['HELLO', 'bad-format'], ['NPREXNONE2', 'not-found']]);
} finally { globalThis.fetch = realFetch; }

console.log('all checks passed');
