export function normalizeResults(organicResults = []) {
    if (!Array.isArray(organicResults)) {
        return [];
    }

    return organicResults.slice(0, 10).map(item => ({
        position: item.position,
        title: item.title,
        url: item.link,
        description: item.snippet
    }));
}