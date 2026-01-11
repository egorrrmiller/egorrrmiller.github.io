(function () {
    let seasonCache = {};

    function getDirectTMDBImage(path, size) {
        return `https://imagetmdb.com/t/p/${size}/${path}`;
    }

    function tttt(e, episodes) {
        const html = e.item;
        const data = e.element;
        const allFilesCount = e.items;

        const episode = data.episode;
        console.log('episodes', episodes);
        const totalInTorrent = allFilesCount.length;
        const totalInTMDB = episodes.length;

        let targetEpisodeNumber = episode;
        console.log('targetEpisodeNumber', targetEpisodeNumber);

        const fileName = data.folder_name || data.path;
        const checkPart = fileName.match(/(?:часть|part|pt?\.?)\s*(\d+)/i);
        if (checkPart) {
            /* Логика: если в торренте файлов меньше, чем в сезоне,
               считаем, что это "хвост" сезона.
               Пример: TMDB=20, Торрент=5.
               Часть 1 торрента = 16-я серия TMDB (20 - 5 + 1)
            */
            const offset = Math.max(0, totalInTMDB - totalInTorrent);
            targetEpisodeNumber = offset + episode;

            console.log('offset', offset);
        }

        const targetEpisode = episodes.find(ep => ep.episode_number === targetEpisodeNumber);
        
        if (targetEpisode) {
            // Обновление UI
            html.find('.torrent-serial__title').text(targetEpisode.name);

            if (targetEpisode.air_date) {
                const date = Lampa.Utils.parseTime(targetEpisode.air_date).full;
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

    function setCache(e) {
        const data = e.element;
        const movie = e.params.movie;
        const seasonNum = data.season || 1;
        const cacheKey = `${movie.id}_s${seasonNum}`;

        // Проверка кэша или запрос к API
        if (seasonCache[cacheKey]) {
            tttt(e, seasonCache[cacheKey]);
        } else {
            Lampa.Api.sources.tmdb.get(`tv/${movie.id}/season/${seasonNum}?language=ru-RU`, {}, (tmdbData) => {
                if (tmdbData && (tmdbData.episodes_original)) {
                    const eps = tmdbData.episodes_original;
                    seasonCache[cacheKey] = eps;
                    tttt(e, eps);

                    console.log(tmdbData);
                }
            }, (error) => {
                console.error('TMDB API Error:', error);
            });
        }
    }

    try {

        // сюда попадем столько раз, сколько файлов в торренте
        Lampa.Listener.follow('torrent_file', (e) => {
            console.log('e', e)
            if (e.type === 'list_open') {
                setCache(e)
            } else if (e.type === 'render') {

                setCache(e)
            }
        });
    } catch (error) {
        console.error('Plugin Error: ', error);
    }
})();

