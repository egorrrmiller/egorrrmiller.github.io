(function () {
    Lampa.Platform.tv();

    function getDirectTMDBImage(path, size) {
        return `https://imagetmdb.com/t/p/${size}/${path}`;
    }

    try {
        let seasonCache = {};

        // сюда попадем столько раз, сколько файлов в торренте
        Lampa.Listener.follow('torrent_file', (e) => {
            if (e.type === 'list_open') {
                const originalModalUpdate = Lampa.Modal.update;

                Lampa.Modal.update = function(html) {
                    // Проверяем содержит ли html класс torrent-files  
                    if (html && html.hasClass && html.hasClass('torrent-files')) {
                            return; // Блокируем открытие
                    }

                    return originalModalUpdate.call(this, html);
                };
                
                seasonCache = {};
            }
            else if (e.type === 'render') {
                console.log('e', e)

                let html = e.item;
                let data = e.element;
                let movie = e.params.movie;

                let episode = data.episode; // каждый раз разный эпизод.
                let seasonNum = data.season || 1;
                let cacheKey = `${movie.id}_s${seasonNum}`;

                let allFilesCount = e.items;

                if (!movie || !movie.id || !data.title || !allFilesCount) return;

                let fileName = data.folder_name || data.path;
                let checkPart = fileName.match(/(?:часть|part|pt?\.?)\s*(\d+)/i);
                console.log('checkPart', checkPart);

                if (checkPart) {

                    let applyEpisodeData = (episodes) => {
                        console.log('episodes', episodes);
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
                    };

                    // Проверка кэша или запрос к API
                    if (seasonCache[cacheKey]) {
                        applyEpisodeData(seasonCache[cacheKey]);
                    } else {
                        Lampa.Api.sources.tmdb.get(`tv/${movie.id}/season/${seasonNum}?language=ru-RU`, {}, (tmdbData) => {
                            if (tmdbData && (tmdbData.episodes_original)) {
                                let eps = tmdbData.episodes_original;
                                seasonCache[cacheKey] = eps;
                                applyEpisodeData(eps);

                                console.log(tmdbData);
                            }
                        }, (error) => {
                            console.error('TMDB API Error:', error);
                        });
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('Plugin Error: ', error);
    }
})();

