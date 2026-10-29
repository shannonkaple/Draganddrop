import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isMobileTouchDevice,mobileArrowPadHtml,bindMobileArrows} from '../mobile-touch.mjs';

test('mobile devices use touch while ChromeOS and desktop retain keyboard/trackpad', () => {
  assert.equal(isMobileTouchDevice({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1)'}),true);
  assert.equal(isMobileTouchDevice({userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 7)'}),true);
  assert.equal(isMobileTouchDevice({userAgent:'Mozilla/5.0 (iPad; CPU OS 17_0)'}),true);
  assert.equal(isMobileTouchDevice({userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)',platform:'MacIntel',maxTouchPoints:5}),true);
  assert.equal(isMobileTouchDevice({userAgent:'Mozilla/5.0 (X11; CrOS x86_64)',maxTouchPoints:10}),false);
  assert.equal(isMobileTouchDevice({userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}),false);
  assert.equal(isMobileTouchDevice({userAgent:'Mozilla/5.0 (Macintosh)',platform:'MacIntel',maxTouchPoints:0}),false);
});

test('mobile arrow pad has four accessible native buttons with no baked-in JS', () => {
  const html=mobileArrowPadHtml();
  assert.equal((html.match(/data-mobile-arrow=/g)||[]).length,4);
  for(const dir of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){
    assert.ok(html.includes('data-mobile-arrow="'+dir+'"'));
  }
  assert.ok(html.includes('type="button"'));
  assert.ok(html.includes('aria-label'));
  assert.doesNotMatch(html,/onclick=/i);
});

test('a mobile arrow tap forwards exactly one direction', () => {
  const seen=[];
  const buttons=['ArrowUp','ArrowRight'].map(dir=>({
    dataset:{mobileArrow:dir},
    addEventListener(event,callback){
      assert.equal(event,'click');
      this.press=callback;
    }
  }));
  bindMobileArrows({querySelectorAll:()=>buttons},dir=>seen.push(dir));
  buttons[0].press();buttons[1].press();
  assert.deepEqual(seen,['ArrowUp','ArrowRight']);
});

test('touch is enabled only on mobile, and new controls use existing maze progress', () => {
  const game=readFileSync(new URL('../game.mjs',import.meta.url),'utf8');
  const adventure=readFileSync(new URL('../adventure.mjs',import.meta.url),'utf8');
  const styles=readFileSync(new URL('../mobile-touch.css',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(game.includes('if(mobileTouch||touchLoginPickerOpen())return'));
  assert.ok(game.includes('pressPracticeArrow(e.key)'));
  assert.ok(game.includes('target.onclick=()=>pressPracticeArrow(key)'));
  assert.ok(adventure.includes("mobileArrowPadHtml('Touch arrows to move through the maze')"));
  assert.ok(adventure.includes("mobileArrowPadHtml('Tap the matching pattern arrow')"));
  assert.ok(adventure.includes("mobileArrowPadHtml('Tap the matching rescue arrow')"));
  assert.ok(adventure.includes("bindMobileArrows($('app'),move)"));
  assert.ok(adventure.includes("if(mobileTouch)bindMobileArrows(d,challengeKeys)"));
  assert.ok(adventure.includes("mobileTouch&&e.pointerType==='touch'"));
  assert.ok(styles.includes('.mobile-touch-enabled #collection-scene'));
  assert.ok(html.includes('mobile-touch.css?v='));
  assert.doesNotMatch(readFileSync(new URL('../mobile-touch.mjs',import.meta.url),'utf8'),/localStorage|sessionStorage|indexedDB/);
});
