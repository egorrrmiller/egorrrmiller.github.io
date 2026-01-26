(function () {
    'use strict';

    // Добавляем стили для плавности
    var style = document.createElement('style');
    style.innerHTML = '.torrent-serial__title, .torrent-serial__line, .torrent-serial__img { transition: opacity 0.3s ease; } .ts-hidden { opacity: 0; }';
    document.head.appendChild(style);

    function getDirectTMDBImage(path, size) {
        return 'https://imagetmdb.com/t/p/' + size + '/' + path;
    }

    var seasonCache = {};

    Lampa.Listener.follow('torrent_file', function (e) {
        if (e.type === 'list_open') {
            seasonCache = {};
        } else if (e.type === 'render') {
            var html = e.item;
            var data = e.element;
            var movie = e.params.movie;
            var allFilesCount = e.items.length;

            if (!movie || !movie.id) return;

            var seasonNum = data.season || 1;
            var episodeNum = data.episode;

            var fileName = data.folder_name || data.path;
            var checkPart = fileName.match(/(?:часть|part|pt?\.?|ep?\.?)\s*(\d+)/i);
            
            if (!episodeNum && checkPart && checkPart[1]) {
                episodeNum = parseInt(checkPart[1]);
            }

            if (!episodeNum) return;

            var cacheKey = movie.id + '_s' + seasonNum;
            var titleElem = html.find('.torrent-serial__title');
            var lineElem = html.find('.torrent-serial__line');
            var imgElem = html.find('.torrent-serial__img');

            // Функция применения данных
            var applyData = function (episodes) {
                if (!episodes || !episodes.length) {
                    // Если данных нет, показываем как есть
                    titleElem.removeClass('ts-hidden');
                    lineElem.removeClass('ts-hidden');
                    imgElem.removeClass('ts-hidden');
                    return;
                }

                var targetEpisode = episodes.find(function (ep) {
                    return ep.episode_number === episodeNum;
                });

                if (!targetEpisode) {
                    var totalInTMDB = episodes.length;
                    var offset = Math.max(0, totalInTMDB - allFilesCount);
                    var targetEpisodeNumber = offset + episodeNum;
                    
                    targetEpisode = episodes.find(function (ep) {
                        return ep.episode_number === targetEpisodeNumber;
                    });
                }

                if (targetEpisode) {
                    // Обновляем данные
                    titleElem.text(targetEpisode.name);

                    if (targetEpisode.air_date) {
                        var date = Lampa.Utils.parseTime(targetEpisode.air_date).full;
                        if(lineElem.find('span').length > 1) lineElem.find('span').last().text('Выход - ' + date);
                        else lineElem.append('<span>Выход - ' + date + '</span>');
                    }

                    if (targetEpisode.still_path) {
                        var img = getDirectTMDBImage(targetEpisode.still_path, 'w300');
                        if(imgElem.attr('src') !== img){
                            imgElem.attr('src', img);
                            data.img = img;
                        }
                    }

                    data.title = targetEpisode.name;
                    data.fname = targetEpisode.name;
                }

                // Плавно показываем
                requestAnimationFrame(function() {
                    titleElem.removeClass('ts-hidden');
                    lineElem.removeClass('ts-hidden');
                    imgElem.removeClass('ts-hidden');
                });
            };

            // Проверяем наличие данных
            var hasData = false;
            var episodesData = null;

            if (e.params.seasons && e.params.seasons[seasonNum] && e.params.seasons[seasonNum].episodes) {
                hasData = true;
                episodesData = e.params.seasons[seasonNum].episodes;
            } else if (seasonCache[cacheKey]) {
                hasData = true;
                episodesData = seasonCache[cacheKey];
            }

            if (hasData) {
                // Если данные есть сразу, применяем их без скрытия (или с очень быстрым обновлением)
                applyData(episodesData);
            } else {
                // Если данных нет, скрываем элементы, чтобы не было скачка текста
                titleElem.addClass('ts-hidden');
                lineElem.addClass('ts-hidden');
                imgElem.addClass('ts-hidden');

                Lampa.Api.sources.tmdb.get('tv/' + movie.id + '/season/' + seasonNum + '?language=' + Lampa.Storage.get('language','ru'), {}, function (tmdbData) {
                    if (tmdbData && (tmdbData.episodes || tmdbData.episodes_original)) {
                        var eps = tmdbData.episodes || tmdbData.episodes_original;
                        seasonCache[cacheKey] = eps;
                        applyData(eps);
                    } else {
                        // Если не удалось загрузить, показываем исходное
                        applyData(null);
                    }
                }, function (error) {
                    applyData(null);
                });
            }
        }
    });
})();
