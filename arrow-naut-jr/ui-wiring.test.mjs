import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const source=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');

test('puzzle click guard is declared before a child can click Level 1',()=>{
 assert.match(source,/import\s*\{\s*touchGeneratedClick\s*\}\s*from\s*['"]\.\/input-policy\.mjs(?:\?[^'"]*)?['"]/);
 assert.match(source,/if\s*\(e\.target\.closest\('\.game-board'\)\s*&&\s*touchGeneratedClick\(e,lastPointer\)\)/);
 assert.match(source,/if\s*\(d\.select\)\s*\{selectPiece\(d\.select\);return\}/);
});

test('all mission pages display a speaker and allow repeated speech',()=>{
 assert.match(source,/speaker-icon/);
 assert.match(source,/HEAR DIRECTIONS/);
 assert.match(source,/case\s*'listen':/);
 assert.match(source,/speechSynthesis\.cancel\(\)/);
 assert.match(source,/speechSynthesis\.speak\(utterance\)/);
 assert.match(html,/app\.mjs\?v=jr-clickfix-and-speaker/);
});
