console.log('script.js loaded');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const searchForm = document.getElementById('searchForm');
const downloadButton = document.getElementById('downloadButton');



let searchData = null;

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

 console.log('Search button clicked');

    const query = searchInput.value.trim();
    if (!query) return;

    searchData = null; // reset previous search data
    resultsDiv.innerHTML = '<p>Loading...</p>';
    downloadButton.disabled = true;

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (!response.ok || data.error) {
                throw new Error(data.error || 'failed to fetch search results');
        } else {
            resultsDiv.innerHTML = data.results.map(result => `
                <div>
                    <h3><a href="${result.url}" target="_blank" rel="noopener noreferrer">${result.title}</a></h3>
                    <p>${result.description}</p>
                </div>
            `).join('');
            searchData = data; // store data from search results for download
            downloadButton.disabled = false;
        }
    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = '<p>failed to fetch search results</p>';
    }
});

downloadButton.addEventListener('click', () => {
    if (!searchData) {
        return;
    }

    const json = JSON.stringify(searchData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});