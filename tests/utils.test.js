import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeResults } from '../utils.js';

test('normalizeResults converts SerpAPI results', () => {
    const input = [
        {
            position: 1,
            title: 'Google',
            link: 'https://google.com',
            snippet: 'Search engine'
        }
    ];

    const result = normalizeResults(input);

    assert.deepEqual(result, [
        {
            position: 1,
            title: 'Google',
            url: 'https://google.com',
            description: 'Search engine'
        }
    ]);
});

test('normalizeResults handles empty input', () => {
    const result = normalizeResults([]);
    assert.deepEqual(result, []);
});

test('normalizeResults handles missing fields', () => {
    const input = [
        {
            position: 1,
            title: 'Google'
        }
    ];

    const result = normalizeResults(input);

    assert.deepEqual(result, [
        {
            position: 1,
            title: 'Google',
            url: undefined,
            description: undefined
        }
    ]);
});

test('normalizeResults limits output to ten organic results', () => {
    const input = Array.from({ length: 15 }, (_, index) => ({
        position: index + 1,
        title: `Result ${index + 1}`,
        link: `https://example.com/${index + 1}`,
        snippet: `Snippet ${index + 1}`
    }));

    const result = normalizeResults(input);

    assert.equal(result.length, 10);
    assert.equal(result[0].position, 1);
    assert.equal(result[9].position, 10);
});

test('normalizeResults handles null and non-array organic results', () => {
    assert.deepEqual(normalizeResults(null), []);
    assert.deepEqual(normalizeResults({ organic_results: [] }), []);
    assert.deepEqual(normalizeResults(undefined), []);
});