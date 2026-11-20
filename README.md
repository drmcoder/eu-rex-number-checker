# EU REX number checker

Check **EU REX numbers** (Registered Exporter system) against the European Commission's public REX database: one number or up to 10 at once. Returns the status (valid, not valid, not found), the registration date, and the exporter's name and country. No API key needed.

**Use it online, free:** [trishaktiapparel.com/tools/rex-checker/](https://trishaktiapparel.com/tools/rex-checker/) · [Deutsch](https://trishaktiapparel.com/de/tools/rex-checker/)

## What a REX number is
Exporters in countries with EU trade preferences (Nepal, India, Bangladesh, Vietnam, Sri Lanka…) register once in the EU's REX system and get a REX number. On each shipment they write a *statement on origin* on the invoice quoting it, and the EU importer uses that statement to claim reduced or 0% duty. A REX number is two letters (the exporter's country), then `REX`, then up to 30 letters or digits, for example `NPREX…` or `INREX…`.

**A valid number proves the exporter is registered, not that the goods meet the rules of origin.** Check that the exporter name matches the company on your invoice.

## Use in code
```ts
import { checkRex, splitRex, parseRexHtml, REX_RE } from './src/rex.ts';

console.log(await checkRex('NPREX1244417670168NPTEPC, NPREX9999'));
// [ { number: 'NPREX1244417670168NPTEPC', status: 'valid', registered: '24-09-2026', name: 'Trishakti Apparel', country: 'Nepal', … },
//   { number: 'NPREX9999', status: 'not-found', … } ]
```
- `checkRex(text)`: splits pasted text (lines, commas, semicolons), checks the format, asks the Commission's page one number at a time with a short pause, and returns one result per number.
- `parseRexHtml(html)`: reads the Commission's result page. If the page layout is not recognised it returns `unavailable`, never a guess.
- Only status, registration date, exporter name and country are returned. Address, e-mail and phone are left out on purpose.

Please be gentle with the Commission's free service: check a few numbers at a time and cache the answers.

## Run the tests
```sh
node test/test.mjs   # Node 22.18+ runs the .ts source directly
```
The tests use made-up pages in the Commission's layout; no real exporter data is stored here.

## Not advice
This tool shows what the Commission's public database says. It is not customs or legal advice. The Commission's database is the official record.

## Licence and credit
MIT, see [LICENSE](LICENSE). Made by [Trishakti Apparel](https://trishaktiapparel.com), a knitwear factory in Gaindakot, Nepal, registered in REX. If you use it in research or a publication, please cite it (see `CITATION.cff`). Also part of our [open tools for knitwear buyers](https://github.com/SAHARA-Labs-Nepal/nepal-knitwear-sourcing-tools).
