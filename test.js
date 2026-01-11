(function() {
    const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // вставь свой API ключ
    const cache = {};

    async function fetchTMDB(title, season, episode) {
        const key = `${title}_S${season}E${episode}`;
        if (cache[key]) return cache[key];

        try {
            const searchRes = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
            const searchData = await searchRes.json();
            if (!searchData.results || searchData.results.length === 0) return null;

            const tvId = searchData.results[0].id;
            const epRes = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`);
            const epData = await epRes.json();

            const result = {
                name: epData.name || `Episode ${episode}`,
                air_date: epData.air_date || '--',
                image: epData.still_path ? `https://image.tmdb.org/t/p/w500${epData.still_path}` : null
            };

            cache[key] = result;
            return result;
        } catch (e) {
            console.error('TMDB fetch error:', e);
            return null;
        }
    }

    async function redrawTorrentFiles(container) {
        const episodes = container.querySelectorAll('.torrent-serial');
        for (let epDiv of episodes) {
            const titleDiv = epDiv.querySelector('.torrent-serial__title');
            const seasonSpan = epDiv.querySelector('.torrent-serial__line span b');
            const episodeNumDiv = epDiv.querySelector('.torrent-serial__episode');

            const title = titleDiv ? titleDiv.innerText : '';
            const season = seasonSpan ? parseInt(seasonSpan.innerText) : 1;
            const episodeNum = episodeNumDiv ? parseInt(episodeNumDiv.innerText) : 1;

            const tmdbData = await fetchTMDB(title, season, episodeNum);
            if (!tmdbData) continue;

            // Перерисовываем
            if (titleDiv) titleDiv.innerText = tmdbData.name;
            const lineSpans = epDiv.querySelectorAll('.torrent-serial__line span');
            if (lineSpans[1]) lineSpans[1].innerText = `Выход - ${tmdbData.air_date}`;

            const img = epDiv.querySelector('img.torrent-serial__img');
            if (img && tmdbData.image) img.src = tmdbData.image;
        }
    }

    // Настройка MutationObserver
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;

                const container = node.matches('.torrent-files') ? node : node.querySelector('.torrent-files');
                if (container) {
                    redrawTorrentFiles(container);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log('TMDB Lampa plugin loaded: observing DOM for .torrent-files');
})();
