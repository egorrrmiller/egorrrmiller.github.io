/*
* 1. Получаем карточку фильма/сериала
*
* */

(function () {

    try {
        let seasonCache = {};

        Lampa.Listener.follow('torrent_file', (e) => {
            if (e.type === 'list_open') {
                seasonCache = {};
            }
            else if (e.type === 'render') {

                e.items.forEach(item => {
                    let data = e.element;
                    let movie = e.params.movie;

                    console.log('e', e);

                    if (!movie || !movie.id || !data.title) return;

                    let fileName = data.folder_name || data.path;

                    let isPart = fileName.match(/(?:часть|part|pt?\.?)\s*(\d+)/i);

                    console.log('match', isPart);

                    if (isPart) {
                        let partNumber = parseInt(isPart[1]);
                        let seasonNum = data.season || 1;
                        let cacheKey = `${movie.id}_s${seasonNum}`;

                        const applyEpisodeData = (episodes) => {
                            // Вычисляем номер эпизода: общее кол-во - номер части
                            let totalEpisodes = episodes.length;
                            let targetEpisodeNumber = totalEpisodes - partNumber;

                            console.log('totalEpisodes', totalEpisodes);
                            console.log('partNumber', partNumber);

                            // Ищем эпизод с вычисленным номером
                            let targetEpisode = episodes.find(ep => ep.episode_number === targetEpisodeNumber);

                            if (targetEpisode) {
                                // Обновляем DOM
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

                                // Обновляем данные
                                data.title = targetEpisode.name;
                                data.fname = targetEpisode.name;
                                data.air_date = targetEpisode.air_date;

                                data.img = img;

                                console.log(`Часть ${partNumber} → Эпизод ${targetEpisodeNumber}: ${targetEpisode.name}`);
                            }
                        };

                        if (seasonCache[cacheKey]) {
                            applyEpisodeData(seasonCache[cacheKey]);
                        } else {
                            Lampa.Api.sources.tmdb.get(`tv/${movie.id}/season/${seasonNum}?language=ru-RU`, {}, (tmdbData) => {
                                console.log('tmdbData', tmdbData);
                                if (tmdbData && tmdbData.episodes_original) {
                                    seasonCache[cacheKey] = tmdbData.episodes_original;
                                    applyEpisodeData(tmdbData.episodes_original);
                                }
                            }, (error) => {
                                console.error('API error:', error);
                            });
                        }
                    }
                })
            }
        });
    }
    catch (error) {
        console.error('ОШИБКА: ', error)
    }

})();
