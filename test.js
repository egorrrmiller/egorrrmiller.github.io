/*
* 1. Получаем карточку фильма/сериала
*
* */

(function () {

    function isPart(e, data, movie, episodes, partNumber) {

        // Вычисляем номер эпизода: общее кол-во - номер части
        let totalEpisodes = episodes.length;
        let targetEpisodeNumber = totalEpisodes - partNumber;

        console.log('totalEpisodes', totalEpisodes);
        console.log('partNumber', partNumber);

        // Ищем эпизод с вычисленным номером
        let targetEpisode = episodes.find(ep => ep.episode_number === targetEpisodeNumber);

        if (targetEpisode) {
            // Обновляем DOM
            e.item.find('.torrent-serial__title').text(targetEpisode.name);

            if (targetEpisode.air_date) {
                let date = Lampa.Utils.parseTime(targetEpisode.air_date).full;
                e.item.find('.torrent-serial__line span:last').text(`Выход - ${date}`);
            }
            let img;
            if (targetEpisode.still_path) {
                img = Lampa.TMDB.image(targetEpisode.still_path, 'w500');
                e.item.find('.torrent-serial__img').attr('src', img);
            }

            // Обновляем данные
            data.title = targetEpisode.name;
            data.fname = targetEpisode.name;
            data.air_date = targetEpisode.air_date;

            data.img = img;

            console.log(`Часть ${partNumber} → Эпизод ${targetEpisodeNumber}: ${targetEpisode.name}`);
        }

    }

    try {
        let seasonCache = {};

        Lampa.Listener.follow('torrent_file', (e) => {
            if (e.type === 'list_open') {
                seasonCache = {};
            } else if (e.type === 'render') {
                let data = e.element;
                let seasonNum = data.season || 1;
                let movie = e.params.movie;
                let episodes;

                if (seasonCache[data.folder_name]) {
                    episodes = seasonCache[data.folder_name];
                } else {
                    Lampa.Api.sources.tmdb.get(`tv/${movie.id}/season/${seasonNum}?language=ru-RU`, {}, (tmdbData) => {
                        console.log('tmdbData', tmdbData);
                        if (tmdbData && tmdbData.episodes_original) {
                            seasonCache[data.folder_name] = tmdbData.episodes_original;
                            episodes = tmdbData.episodes_original;
                        }
                    }, (error) => {
                        console.error('API error:', error);
                    });
                }

                if (!movie || !movie.id || !data.title) return;

                let fileName = data.folder_name || data.path;

                let checkPart = fileName.match(/(?:часть|part|pt?\.?)\s*(\d+)/i)
                if (checkPart)
                    isPart(e, e.element, e.params.movie, episodes, parseInt(checkPart[1]))

                console.log('match', isPart);
            }
        });
    } catch (error) {
        console.error('ОШИБКА: ', error)
    }
})();
