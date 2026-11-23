import express from 'express';
import { normalizeResults } from './utils.js';
const app = express();
const router = express.Router({ caseSensitive: true, strict: true });
app.use(express.static('public'));

router.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime()
    });
});

app.use(router)


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

