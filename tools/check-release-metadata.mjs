#!/usr/bin/env node
/**
 * Release-metadata consistency.
 *
 * The version is written in several places that nothing builds from and no
 * other test reads, so they drift silently. .zenodo.json is the dangerous one:
 * Zenodo's GitHub integration reads it in preference to the release tag and to
 * CITATION.cff, so a stale version there publishes the archive under the wrong
 * label with a correct new DOI — a failure that looks like success.
 *
 * Dependency-free and runnable on a bare Node: node tools/check-release-metadata.mjs
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  —  ' + detail : ''}`);
};
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const has = (p) => existsSync(join(ROOT, p));

/* --- the files that name a version ------------------------------------- */
const versions = {};
if (has('package.json')) versions['package.json'] = JSON.parse(read('package.json')).version;
if (has('.zenodo.json')) versions['.zenodo.json'] = JSON.parse(read('.zenodo.json')).version;

let cff = null, cffVersion = null, cffDois = [];
if (has('CITATION.cff')) {
  cff = read('CITATION.cff');
  cffVersion = (cff.match(/^version:[ \t]*"?([^"\s]+)"?/m) || [])[1];
  versions['CITATION.cff'] = cffVersion;
  cffDois = [...cff.matchAll(/10\.5281\/zenodo\.(\d+)/g)].map((m) => m[0]);
}

const names = Object.keys(versions);
const distinct = [...new Set(Object.values(versions))];
ok(`${names.join(', ')} agree on the version`, distinct.length === 1,
  names.map((n) => `${n} ${versions[n]}`).join(' · '));
const VERSION = distinct[0];

/* --- the documents that print it ---------------------------------------- */
const docs = [];
for (const dir of ['docs', '.']) {
  const full = join(ROOT, dir);
  if (!existsSync(full)) continue;
  for (const f of readdirSync(full)) {
    if (/method-notes.*\.html$/.test(f)) docs.push(dir === '.' ? f : `${dir}/${f}`);
  }
}
ok('the method notes were found', docs.length > 0, docs.join(', ') || 'none');

/* The concept DOI is the one CITATION.cff carries as its top-level `doi:`. */
const conceptDoi = cff
  ? ((cff.match(/^doi:[ \t]*(\S+)/m) || [])[1] || '').replace(/^["']|["']$/g, '') || null
  : null;

/* Whether a version DOI for THIS release exists yet.
   Zenodo mints one only when the release is archived, which happens after the
   tag is cut. Between bumping the version and archiving it there is no version
   DOI to cite, and the documents must fall back to the concept DOI.
   This check used to read "cites a version DOI, not the concept DOI" flatly,
   which made that unavoidable interval look like an error and told whoever saw
   it to go and put a DOI that does not exist into a citation. The identifier's
   description names the release it is frozen on - "Version DOI - 1.0.1" - so
   the rule is derived from that instead of assumed. */
const idEntries = cff
  // Quotes are optional in CFF and both styles are in use across these repos.
  // Without the `"?` this matched nothing in a quoted file, which left the guard
  // silently certain no version DOI had been minted - a check passing on an empty
  // list rather than on the facts.
  ? [...cff.matchAll(/value:[ \t]*"?(10\.5281\/zenodo\.\d+)"?\s*\n\s*description:[ \t]*"?([^"\n]*?)"?[ \t]*$/gm)]
      .map((m) => ({ doi: m[1], desc: m[2] }))
  : [];
const verRe = new RegExp('version doi\\s*[\\u2014-]\\s*' +
                         String(VERSION).replace(/\./g, '\\.') + '(?!\\d)', 'i');
const releaseDoi = (idEntries.find((e) => verRe.test(e.desc)) || {}).doi || null;
ok(`a version DOI for ${VERSION} ${releaseDoi ? 'is declared' : 'is not minted yet'}`,
  true,
  releaseDoi || `documents cite the concept DOI ${conceptDoi} until Zenodo mints one`);

for (const doc of docs) {
  const html = read(doc);
  const byline = (html.match(/Version<\/b>[^0-9]*([0-9][0-9.]*)/) || [])[1];
  ok(`${doc} byline names ${VERSION}`, byline === VERSION, `byline ${byline}`);

  const bibDoi = (html.match(/doi\s*=\s*\{([^}]+)\}/) || [])[1];
  if (bibDoi) {
    const want = releaseDoi || conceptDoi;
    ok(`${doc} cites ${releaseDoi ? 'this release\'s version DOI' : 'the concept DOI, as it must until one is minted'}`,
      !!want && bibDoi.trim() === want.trim(),
      `BibTeX doi ${bibDoi}, wanted ${want}`);
    ok(`${doc} cites a DOI that CITATION.cff declares`,
      cffDois.some((d) => bibDoi.includes(d)),
      `${bibDoi} vs ${cffDois.join(', ') || 'none declared'}`);
  }
}

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
