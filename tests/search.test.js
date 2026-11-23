import test from 'node:test';
import assert from 'node:assert/strict';
import { createSearchHandler } from '../public/search.js';

function createResponse() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('search handler rejects a missing query', async () => {
    const handler = createSearchHandler();
    const res = createResponse();

    await handler({ query: {} }, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'invalid/missing search query' });
});

test('search handler requests and returns ten organic results', async () => {
    let request;
    const organicResults = Array.from({ length: 12 }, (_, index) => ({
        position: index + 1,
        title: `Result ${index + 1}`,
        link: `https://example.com/${index + 1}`,
        snippet: `Snippet ${index + 1}`
    }));
    const handler = createSearchHandler(async options => {
        request = options;
        return { organic_results: organicResults };
    }, () => 'test-api-key');
    const res = createResponse();

    await handler({ query: { q: '  test query  ' } }, res);

    assert.equal(request.num, 10);
    assert.equal(request.q, '  test query  ');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.q, 'test query');
    assert.equal(res.body.results.length, 10);
    assert.equal(res.body.results[9].position, 10);
});

test('search handler maps SerpAPI errors to 502', async () => {
    const handler = createSearchHandler(async () => ({
        error: 'Google is temporarily unavailable'
    }), () => 'test-api-key');
    const res = createResponse();

    await handler({ query: { q: 'weather' } }, res);

    assert.equal(res.statusCode, 502);
    assert.deepEqual(res.body, { error: 'failed to fetch google results' });
});

test('search handler returns 503 when the API key is missing', async () => {
    const handler = createSearchHandler(async () => ({}), () => undefined);
    const res = createResponse();

    await handler({ query: { q: 'weather' } }, res);

    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body, { error: 'search service is not configured' });
});
