import test from 'node:test';
import assert from 'node:assert/strict';
import {icons,iconSvg,variants,searchIcons} from '../dist/index.js';
import {renderBody} from '../dist/render.js';

test('official brand geometry and palette survive every style and stroke setting',()=>{
  const brands=Object.entries(icons).filter(([,i])=>i.brand);
  assert.ok(brands.length>=1600);
  for(const[name,i]of brands){
    const expected=renderBody(i.body,'light',{uid:'fixed'});
    for(const variant of variants)for(const sw of [1.5,2,3])
      assert.equal(renderBody(i.body,variant,{uid:'fixed',sw}),expected,`${name}: ${variant}, ${sw}`);
    assert.doesNotMatch(expected,/data-brand=|\btransform=/,name);
  }
});

test('brand gradients have separate ids for separate SVG instances',()=>{
  const a=iconSvg('crypto-wallet-trust'),b=iconSvg('crypto-wallet-trust');
  const idA=a.match(/<linearGradient id="([^"]+)"/)[1];
  const idB=b.match(/<linearGradient id="([^"]+)"/)[1];
  assert.notEqual(idA,idB);
  assert.ok(a.includes(`url(#${idA})`));
  assert.ok(b.includes(`url(#${idB})`));
  assert.doesNotMatch(a,/data-brand=/);
});

test('common apps and wallets are discoverable in Persian',()=>{
  for(const[q,name]of [['تلگرام','brand-telegram'],['واتساپ','brand-whatsapp'],['اینستاگرام','brand-instagram'],['فیگما','brand-figma'],['متامسک','crypto-wallet-metamask'],['تراست ولت','crypto-wallet-trust']])
    assert.ok(searchIcons(q).includes(name),`${q}: ${name}`);
  assert.ok(searchIcons('اتریوم').some(n=>icons[n].category.startsWith('crypto-')));
  assert.ok(searchIcons('USDC').some(n=>icons[n].category==='crypto-stablecoins'));
});


test('explicit SVG id prefixes keep SSR code examples deterministic',()=>{
  const options={idPrefix:'example-trust'};
  assert.equal(iconSvg('crypto-wallet-trust',options),iconSvg('crypto-wallet-trust',options));
  assert.match(iconSvg('crypto-wallet-trust',options),/id="example-trust-brand-/);
});


test('brand attribution remains valid inside XML comments',()=>{
  for(const[name,i]of Object.entries(icons).filter(([,i])=>i.brand))
    for(const match of i.body.matchAll(/<!--([\s\S]*?)-->/g))
      assert.ok(!match[1].includes('--'),name);
});
