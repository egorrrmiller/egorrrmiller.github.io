(function () {
    try {
        let seasonCache = {};

        Lampa.Listener.follow('torrent_file', (e) => {
            if (e.type === 'list_open') {
                seasonCache = {}; // Очистка при открытии нового списка
            }
            else if (e.type === 'render') {
                let item = e.item;
                let data = e.element;
                let movie = e.params.movie;
                let allFiles = e.items; // Весь список файлов в торренте

                console.log('e', e)

                if (!movie || !movie.id || !data.title || !allFiles) return;

                let fileName = data.folder_name || data.path;
                let checkPart = fileName.match(/(?:часть|part|pt?\.?)\s*(\d+)/i);
                console.log('checkPart', checkPart);

                if (checkPart) {
                    let partNumber = parseInt(checkPart[1]);
                    let seasonNum = data.season || 1;
                    let cacheKey = `${movie.id}_s${seasonNum}`;

                    const applyEpisodeData = (episodes) => {
                        let totalInTorrent = allFiles.length;
                        let totalInTMDB = episodes.length;

                        /* Логика: если в торренте файлов меньше, чем в сезоне,
                           считаем, что это "хвост" сезона.
                           Пример: TMDB=20, Торрент=5.
                           Часть 1 торрента = 16-я серия TMDB (20 - 5 + 1)
                        */
                        let offset = Math.max(0, totalInTMDB - totalInTorrent);
                        let targetEpisodeNumber = offset + partNumber;

                        let targetEpisode = episodes.find(ep => ep.episode_number === targetEpisodeNumber);

                        if (targetEpisode) {
                            // Обновление UI
                            item.find('.torrent-serial__title').text(targetEpisode.name);

                            if (targetEpisode.air_date) {
                                let date = Lampa.Utils.parseTime(targetEpisode.air_date).full;
                                item.find('.torrent-serial__line span:last').text(`Выход - ${date}`);
                            }

                            let img;
                            if (targetEpisode.still_path) {
                                img = Lampa.TMDB.image(targetEpisode.still_path, 'w500');
                                item.find('.torrent-serial__img').attr('src', img);
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
