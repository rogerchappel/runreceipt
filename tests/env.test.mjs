import assert from 'node:assert/strict';
import test from 'node:test';
import { captureEnvironment, parseCsv } from '../dist/index.js';

test('parseCsv splits repeated comma-separated flags', () => {
  assert.deepEqual(parseCsv(['A,B', ' C ', '', 'D']), ['A', 'B', 'C', 'D']);
});

test('captureEnvironment records only allowlisted values', () => {
  const result = captureEnvironment(
    {
      PUBLIC_VALUE: 'visible',
      OTHER_VALUE: 'ignored'
    },
    ['PUBLIC_VALUE', 'MISSING_VALUE'],
    []
  );

  assert.deepEqual(result.allowed, ['MISSING_VALUE', 'PUBLIC_VALUE']);
  assert.deepEqual(result.values, { PUBLIC_VALUE: 'visible' });
  assert.deepEqual(result.redacted, []);
});

test('captureEnvironment redacts explicit and sensitive-looking keys', () => {
  const result = captureEnvironment(
    {
      API_TOKEN: 'secret-token',
      NORMAL_KEY: 'normal-value'
    },
    ['API_TOKEN', 'NORMAL_KEY'],
    ['NORMAL_KEY']
  );

  assert.equal(result.values.API_TOKEN, '[REDACTED]');
  assert.equal(result.values.NORMAL_KEY, '[REDACTED]');
  assert.deepEqual(result.redacted, ['API_TOKEN', 'NORMAL_KEY']);
});
