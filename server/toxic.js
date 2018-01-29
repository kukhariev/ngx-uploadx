/*
 *
 * Simulate unexpected network conditions and server failures
 *
 */

const toxy = require('toxy');
const proxy = toxy();
const rules = proxy.rules;
const poisons = proxy.poisons;

proxy.forward('http://localhost:3003');

proxy.poison(toxy.poisons.abort()).withRule(rules.probability(10));

proxy
  .poison(
    poisons.inject({
      code: 503,
      body: '{"error": "toxy injected error"}',
      headers: { 'Content-Type': 'application/json' }
    })
  )
  .withRule(rules.probability(20));

proxy.all('/*');

proxy.listen(3004);
console.log('Toxy proxy listening on port:', 3004);

module.exports = proxy;
