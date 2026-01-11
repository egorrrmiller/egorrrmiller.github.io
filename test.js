(function() {
    const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // <--- вставь свой API ключ

    // Простое кэширование
    const cache = {};

    // Функция получения данных с TMDB
    async function fetchTMDB(title, season, episode) {
        const cacheKey = `${title}_S${season}E${episode}`;
        if (cache[cacheKey]) return cache[cacheKey];

        try {
            // Поиск сериала
            let res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
            let data = await res.json();
            if (!data.results || data.results.length === 0) return null;

            const tv = data.results[0];

            // Получение данных конкретного эпизода
            res = await fetch(`https://api.themoviedb.org/3/tv/${tv.id}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`);
            const ep = await res.json();

            const info = {
                name: ep.name || `Episode ${episode}`,
                air_date: ep.air_date || '--',
                image: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null
            };

            cache[cacheKey] = info;
            return info;
        } catch (e) {
            console.error('TMDB fetch error:', e);
            return null;
        }
    }

    // Функция перерисовки блока torrent-files
    async function redrawTorrentFiles() {
        const container = document.querySelector('.torrent-files');
        if (!container) return;

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

            // Обновляем название и дату
            if (titleDiv) titleDiv.innerText = tmdbData.name;
            const lineSpans = epDiv.querySelectorAll('.torrent-serial__line span');
            if (lineSpans[1]) lineSpans[1].innerText = `Выход - ${tmdbData.air_date}`;

            // Обновляем изображение
            const img = epDiv.querySelector('img.torrent-serial__img');
            if (img && tmdbData.image) img.src = tmdbData.image;
        }
    }

    // Проверка наличия .torrent-files каждые 500ms
    const interval = setInterval(() => {
        const container = document.querySelector('.torrent-files');
        if (container) {
            clearInterval(interval);
            redrawTorrentFiles();
        }
    }, 500);
})();
