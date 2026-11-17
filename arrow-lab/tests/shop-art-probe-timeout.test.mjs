// Run: node --test arrow-lab/tests/shop-art-probe-timeout.test.mjs
// Source-level + executable image-probe checks. Real browser acceptance remains open.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {probePublishedPngWithTimeout,publishedShopDecorations} from '../shop-purchasable-decorations.mjs';

const png={ok:true,headers:{get:()=> 'image/png'}};
const html={ok:true,headers:{get:()=> 'text/html; charset=utf-8'}};
const notFound={ok:false,headers:{get:()=> 'image/png'}};
const resolveUrl=path=>'https://example.invalid/'+path;

test('accepts a real PNG and passes an unmodified URL to HEAD',async()=>{
 let called;
 assert.equal(await probePublishedPngWithTimeout('a.png',async(url,options)=>{
  called={url,options};return png;
 },resolveUrl,50),true);
 assert.equal(called.url,'https://example.invalid/a.png');
 assert.equal(called.options.method,'HEAD');
});

test('rejects HTML fallbacks and missing files',async()=>{
 assert.equal(await probePublishedPngWithTimeout('a.png',async()=>html,resolveUrl,50),false);
 assert.equal(await probePublishedPngWithTimeout('a.png',async()=>notFound,resolveUrl,50),false);
});

test('network rejection never makes missing artwork purchasable',async()=>{
 assert.equal(await probePublishedPngWithTimeout('a.png',async()=>{throw Error('offline')},resolveUrl,50),false);
});

test('hung fetch resolves false within the deadline and aborts the request',async()=>{
 let signal;
 const started=Date.now();
 const ready=await probePublishedPngWithTimeout('a.png',async(_url,options)=>{
  signal=options.signal;
  return new Promise(()=>{});
 },resolveUrl,20);
 assert.equal(ready,false);
 assert.ok(Date.now()-started<500,'the student should not wait indefinitely');
 assert.equal(signal?.aborted,true);
});

test('all catalog probes can fail without blocking forever',async()=>{
 const ready=await publishedShopDecorations(path=>probePublishedPngWithTimeout(
  path,()=>new Promise(()=>{}),resolveUrl,10));
 assert.deepEqual(ready,[]);
});

test('the game uses the bounded probe and clears failed JSON-load cache',()=>{
 const source=readFileSync(new URL('../adventure.mjs',import.meta.url),'utf8');
 assert.match(source,/probePublishedPngWithTimeout\(path,fetch,asset,1800\)/);
 assert.match(source,/dataPromise=undefined;throw error/);
});
