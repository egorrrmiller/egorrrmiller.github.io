/**
 * Плагин для коррекции названий серий в торрентах
 * Подменяет данные для серий с названиями типа "часть 1", "part 2" и т.д.
 */
(function() {
    'use strict';

    // Кэш для данных о сезонах  
    let seasonCache = {};
    let loadingPromises = {};
    let currentMovie = null;

    // Получение прямого URL изображения TMDB  
    function getDirectTMDBImage(path, size) {
        return `https://imagetmdb.com/t/p/${size}/${path}`;
    }

    // Предзагрузка данных сезона  
    function preloadSeasonData(movieId, seasonNum) {
        const cacheKey = `${movieId}_s${seasonNum}`;

        if (seasonCache[cacheKey]) {
            return Promise.resolve(seasonCache[cacheKey]);
        }

        if (loadingPromises[cacheKey]) {
            return loadingPromises[cacheKey];
        }

        loadingPromises[cacheKey] = new Promise((resolve) => {
            Lampa.Api.sources.tmdb.get(
                `tv/${movieId}/season/${seasonNum}?language=ru-RU`,
                {},
                (tmdbData) => {
                    if (tmdbData && tmdbData.episodes_original) {
                        seasonCache[cacheKey] = tmdbData.episodes_original;
                        resolve(seasonCache[cacheKey]);
                    } else {
                        resolve([]);
                    }
                },
                (error) => {
                    console.error('TMDB API Error:', error);
                    resolve([]);
                }
            );
        });

        return loadingPromises[cacheKey];
    }

    // Применение данных к элементу  
    function applyEpisodeData(item, data, episodes, partNumber, totalInTorrent) {
        const totalInTMDB = episodes.length;

        // Вычисляем смещение для "хвоста" сезона  
        const offset = Math.max(0, totalInTMDB - totalInTorrent);
        const targetEpisodeNumber = offset + partNumber;

        const targetEpisode = episodes.find(ep => ep.episode_number === targetEpisodeNumber);

        if (!targetEpisode) return;

        // Обновляем DOM элементы  
        item.find('.torrent-serial__title').text(targetEpisode.name);

        if (targetEpisode.air_date) {
            const date = Lampa.Utils.parseTime(targetEpisode.air_date).full;
            item.find('.torrent-serial__line span:last').text(`Выход - ${date}`);
        }

        // Обновляем изображение с обработкой ошибок  
        const imgElement = item.find('.torrent-serial__img');
        if (targetEpisode.still_path) {
            const img = getDirectTMDBImage(targetEpisode.still_path, 'w300');

            imgElement.on('error', function() {
                $(this).attr('src', './img/img_broken.svg');
            });

            imgElement.attr('src', img);
        }

        // Обновляем данные объекта  
        data.title = targetEpisode.name;
        data.fname = targetEpisode.name;
        data.air_date = targetEpisode.air_date;
        data.img = imgElement.attr('src');

        console.log(`Часть ${partNumber} → Эпизод ${targetEpisodeNumber}: ${targetEpisode.name}`);
    }

    // Инициализация плагина  
    function init() {
        Lampa.Listener.follow('torrent_file', (e) => {
            console.info('torrent_file', e)

            if (e.type === 'list_open') {
                // Очистка кэша при открытии нового списка  
                seasonCache = {};
                loadingPromises = {};
                currentMovie = e.params.movie;

                // Предзагрузка данных для всех сезонов  
                const seasons = new Set();
                e.items.forEach(item => {
                    if (item.season) seasons.add(item.season);
                });

                const preloadPromises = Array.from(seasons).map(season =>
                    preloadSeasonData(currentMovie.id, season)
                );

                Promise.all(preloadPromises).then(() => {
                    console.log('All season data preloaded');
                });

            } else if (e.type === 'render') {
                const item = e.item;
                const data = e.element;
                const movie = e.params.movie;

                if (!movie || !movie.id || !data.title) return;

                // Проверяем название по regex  
                const fileName = data.folder_name || data.path;
                const match = fileName.match(/(?:часть|part|pt?\.?)\s*(\d+)/i);

                if (match) {
                    const partNumber = data.episode;
                    const seasonNum = data.season || 1;
                    const cacheKey = `${movie.id}_s${seasonNum}`;

                    // Применяем данные если уже загружены
                    console.info('season', seasonCache[cacheKey])
                    if (seasonCache[cacheKey]) {
                        applyEpisodeData(
                            item,
                            data,
                            seasonCache[cacheKey],
                            partNumber,
                            e.items.length
                        );
                    }
                }
            } else if (e.type === 'list_close') {
                // Очистка при закрытии  
                currentMovie = null;
            }
        });
    }

    // Запуск после инициализации Lampa  
    function waitForLampa() {
        if (window.Lampa && window.Lampa.Listener && window.Lampa.Api) {
            init();
        } else {
            setTimeout(waitForLampa, 100);
        }
    }

    // Обработка ошибок  
    try {
        waitForLampa();
        console.log('Torrent episode corrector plugin initialized');
    } catch (error) {
        console.error('Plugin Error:', error);
    }
})();
