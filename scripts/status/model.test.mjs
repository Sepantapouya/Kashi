import {test} from 'node:test';
import assert from 'node:assert/strict';
import {daily,fresh,validFeed,services} from './model.mjs';
const now=Date.parse('2026-11-05T12:00:00Z');
const sample=(at,state)=>({at:new Date(at).toISOString(),checks:Object.fromEntries(services.map(s=>[s.id,{state,ms:42}]))});
test('missing, future and stale samples are not current',()=>{assert.equal(fresh(null,now),false);assert.equal(fresh(sample(now-7200001,'up'),now),false);assert.equal(fresh(sample(now+86400000,'up'),now),false);assert.equal(fresh(sample(now,'up'),now),true);});
test('unmeasured days unknown; mixed checks partial',()=>{const rows=daily([sample(now-10000,'down'),sample(now,'up')],'site',7,now);assert.equal(rows.length,7);assert.equal(rows[0].state,'unknown');assert.equal(rows[6].state,'partial');assert.equal(rows[6].ok,1);assert.equal(rows[6].total,2);});
test('invalid feeds rejected',()=>{assert.equal(validFeed({version:1,samples:[sample(now,'up')]}),true);assert.equal(validFeed({version:1,samples:[{at:'bad',checks:{}}]}),false);assert.equal(validFeed({version:1,samples:[sample(now,'unknown')]}),false);});
