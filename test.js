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
                const item = e.item;
                const data = e.element;
                const movie = e.params.movie;
                
                console.log('movie', movie);

                if (!movie || !movie.id || !data.title) return;

                const match = data.title.match(/(?:часть|part|pt?\.?)\s*(\d+)/i);

                if (match) {
                    const partNumber = parseInt(match[1]);
                    const seasonNum = data.season || 1;
                    const cacheKey = `${movie.id}_s${seasonNum}`;

                    const applyEpisodeData = (episodes) => {
                        // Вычисляем номер эпизода: общее кол-во - номер части
                        const totalEpisodes = episodes.length;
                        const targetEpisodeNumber = totalEpisodes - partNumber;

                        console.log('totalEpisodes', totalEpisodes);
                        console.log('partNumber', partNumber);

                        // Ищем эпизод с вычисленным номером
                        const targetEpisode = episodes.find(ep => ep.episode_number === targetEpisodeNumber);

                        if (targetEpisode) {
                            // Обновляем DOM
                            item.find('.torrent-serial__title').text(targetEpisode.name);

                            if (targetEpisode.air_date) {
                                const date = Lampa.Utils.parseTime(targetEpisode.air_date).full;
                                item.find('.torrent-serial__line span:last').text(`Выход - ${date}`);
                            }

                            if (targetEpisode.still_path) {
                                const img = Lampa.TMDB.image(targetEpisode.still_path, 'w500');
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
                        Lampa.TMDB.get(`tv/${movie.id}/season/${seasonNum}?language=ru-RU`, {}, (tmdbData) => {
                            if (tmdbData && tmdbData.episodes) {
                                seasonCache[cacheKey] = tmdbData.episodes;
                                applyEpisodeData(tmdbData.episodes);
                            }
                        });
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('ОШИБКА: ', error)
    }

})();
