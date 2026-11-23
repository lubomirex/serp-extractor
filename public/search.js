import express from 'express';
import dotenv from 'dotenv';
import { getJson } from "serpapi";
import { normalizeResults } from '../utils.js';
import { fileURLToPath } from 'node:url';


dotenv.config();


const app = express();
const router = express.Router({ caseSensitive: true, strict: true });
const PORT = 3000;

export function createSearchHandler(fetchJson = getJson, getApiKey = () => process.env.SERPAPI_KEY) {
    return async (req, res) => {
    const query = req.query.q;
    if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
        error: 'invalid/missing search query'
    });
}
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('SERAPI error: missing SERPAPI_KEY');
        return res.status(503).json({
            error: 'search service is not configured'
        });
    }
    try {
        const response = await fetchJson({
            engine: "google",
            api_key: apiKey,
            q: query,
            num: 10,
        });


        if (response.error) {
            console.error('SERAPI error:', response.error);
            return res.status(502).json({
                error: 'failed to fetch google results'
            });
        }

        const results = normalizeResults(response.organic_results ?? []);

    res.json({
        q: query.trim(),
        results: results // if no results were found, return empty array
    });
} catch (error) {
    console.error(error);
    res.status(502).json({
        error: 'failed to fetch google results'
    });
}
    };
}

router.get('/api/search', createSearchHandler());

app.use(express.static('public'));
app.use(router);

export { app };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
}