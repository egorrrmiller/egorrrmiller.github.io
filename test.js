(function() {
    let seasonCache = {};
    let loadingPromises = {};

    function preloadSeasonData(movieId, seasonNum) {
        const cacheKey = `${movieId}_s${seasonNum}`;

        if (seasonCache[cacheKey]) {
            return Promise.resolve(seasonCache[cacheKey]);
        }

        if (loadingPromises[cacheKey]) {
            return loadingPromises[cacheKey];
        }

        loadingPromises[cacheKey] = new Promise((resolve) => {
            Lampa.Api.sources.tmdb.get(`tv/${movieId}/season/${seasonNum}?language=ru-RU`, {}, (tmdbData) => {
                if (tmdbData && tmdbData.episodes_original) {
                    seasonCache[cacheKey] = tmdbData.episodes_original;
                    resolve(seasonCache[cacheKey]);
                } else {
                    resolve([]);
                }
            });
        });

        return loadingPromises[cacheKey];
    }

    Lampa.Listener.follow('torrent_file', async (e) => {
        if (e.type === 'list_open') {
            seasonCache = {};
            loadingPromises = {};

            // Предзагружаем данные для всего сезона  
            const movie = e.params.movie;
            if (movie && movie.id) {
                // Определяем сезон из первого элемента  
                const firstItem = e.items[0];
                if (firstItem) {
                    const info = Lampa.Torserver.parse({
                        movie: movie,
                        files: e.items,
                        filename: firstItem.path_human,
                        path: firstItem.path,
                    });

                    if (info.season) {
                        await preloadSeasonData(movie.id, info.season);
                    }
                }
            }
        }
        else if (e.type === 'render') {
            const item = e.item;
            const data = e.element;
            const movie = e.params.movie;

            if (!movie || !movie.id || !data.title) return;

            const fileName = data.folder_name || data.path;
            const checkPart = fileName.match(/(?:часть|part|pt?\.?)\s*(\d+)/i);

            if (checkPart) {
                const seasonNum = data.season || 1;
                const cacheKey = `${movie.id}_s${seasonNum}`;

                // Данные уже должны быть в кэше  
                if (seasonCache[cacheKey]) {
                    applyEpisodeData(seasonCache[cacheKey]);
                }
            }
        }
    });

    function applyEpisodeData(e, episodes) {
        console.log('episodes', episodes);
        let allFilesCount = e.items;
        let totalInTorrent = allFilesCount.length;
        let totalInTMDB = episodes.length;

        /* Логика: если в торренте файлов меньше, чем в сезоне,
           считаем, что это "хвост" сезона.
           Пример: TMDB=20, Торрент=5.
           Часть 1 торрента = 16-я серия TMDB (20 - 5 + 1)
        */
        let offset = Math.max(0, totalInTMDB - totalInTorrent);
        console.log('offset', offset);

        let targetEpisodeNumber = offset + episode;
        console.log('targetEpisodeNumber', targetEpisodeNumber);

        let targetEpisode = episodes.find(ep => ep.episode_number === targetEpisodeNumber);

        if (targetEpisode) {
            // Обновление UI
            html.find('.torrent-serial__title').text(targetEpisode.name);

            if (targetEpisode.air_date) {
                let date = Lampa.Utils.parseTime(targetEpisode.air_date).full;
                html.find('.torrent-serial__line span:last').text(`Выход - ${date}`);
            }

            let img;
            if (targetEpisode.still_path) {
                img = getDirectTMDBImage(targetEpisode.still_path, 'w300');
                console.info('img', img)

                html.find('.torrent-serial__img').attr('src', img);
            }

            // Обновление объекта данных (для плеера)
            data.title = targetEpisode.name;
            data.fname = targetEpisode.name;
            data.img = img;
        }
    }
})();
