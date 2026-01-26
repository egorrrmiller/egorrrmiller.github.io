(function () {
    'use strict';

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

            // Пытаемся определить номер сезона и эпизода
            var seasonNum = data.season || 1;
            var episodeNum = data.episode;

            // Если эпизод не определен Lampa, пробуем вытащить из имени файла
            var fileName = data.folder_name || data.path;
            var checkPart = fileName.match(/(?:часть|part|pt?\.?|ep?\.?)\s*(\d+)/i);
            
            if (!episodeNum && checkPart && checkPart[1]) {
                episodeNum = parseInt(checkPart[1]);
            }

            if (!episodeNum) return; // Не смогли определить номер эпизода

            var cacheKey = movie.id + '_s' + seasonNum;

            // Функция применения данных к элементу
            var applyData = function (episodes) {
                if (!episodes || !episodes.length) return;

                // Логика смещения (offset)
                // Если файлов в торренте меньше, чем эпизодов в сезоне, считаем, что это конец сезона
                // Но это работает только если файлы идут подряд.
                // Если это просто папка с сериями, то offset может быть лишним, если нумерация совпадает.
                // Попробуем найти эпизод напрямую по номеру.
                
                var targetEpisode = episodes.find(function (ep) {
                    return ep.episode_number === episodeNum;
                });

                // Если не нашли напрямую, пробуем логику со смещением (для сквозной нумерации или частей)
                if (!targetEpisode) {
                    var totalInTMDB = episodes.length;
                    var offset = Math.max(0, totalInTMDB - allFilesCount);
                    var targetEpisodeNumber = offset + episodeNum;
                    
                    targetEpisode = episodes.find(function (ep) {
                        return ep.episode_number === targetEpisodeNumber;
                    });
                }

                if (targetEpisode) {
                    // Обновляем UI
                    html.find('.torrent-serial__title').text(targetEpisode.name);

                    if (targetEpisode.air_date) {
                        var date = Lampa.Utils.parseTime(targetEpisode.air_date).full;
                        var line = html.find('.torrent-serial__line');
                        // Ищем span с датой или добавляем
                        if(line.find('span').length > 1) line.find('span').last().text('Выход - ' + date);
                        else line.append('<span>Выход - ' + date + '</span>');
                    }

                    if (targetEpisode.still_path) {
                        var img = getDirectTMDBImage(targetEpisode.still_path, 'w300');
                        var imgElem = html.find('.torrent-serial__img');
                        
                        // Меняем картинку только если она отличается
                        if(imgElem.attr('src') !== img){
                            imgElem.attr('src', img);
                            // Обновляем данные для плеера
                            data.img = img;
                        }
                    }

                    // Обновляем название для плеера
                    data.title = targetEpisode.name;
                    data.fname = targetEpisode.name;
                    
                    // Показываем элемент (если скрывали)
                    html.css('opacity', 1);
                } else {
                    // Если эпизод не найден, просто показываем как есть
                    html.css('opacity', 1);
                }
            };

            // Скрываем элемент, чтобы избежать мигания при асинхронной загрузке
            // Но если данные есть синхронно, скрывать не обязательно, но для единообразия можно
            // html.css('opacity', 0); 
            // Лучше не скрывать полностью, а то будет пустота. Пусть лучше обновится.
            // Но пользователь жаловался на "скачки".
            
            // Проверяем, есть ли данные о сезонах уже в params (Lampa их загрузила)
            if (e.params.seasons && e.params.seasons[seasonNum] && e.params.seasons[seasonNum].episodes) {
                applyData(e.params.seasons[seasonNum].episodes);
            } 
            // Проверяем наш кэш
            else if (seasonCache[cacheKey]) {
                applyData(seasonCache[cacheKey]);
            } 
            // Загружаем
            else {
                // Чтобы не мигало, можно скрыть текст или поставить заглушку?
                // Нет, лучше пусть пользователь видит хоть что-то (имя файла), чем пустоту.
                // Но если мы хотим "идеально", то можно html.addClass('loading-info') и стилизовать.
                
                Lampa.Api.sources.tmdb.get('tv/' + movie.id + '/season/' + seasonNum + '?language=' + Lampa.Storage.get('language','ru'), {}, function (tmdbData) {
                    if (tmdbData && (tmdbData.episodes || tmdbData.episodes_original)) {
                        var eps = tmdbData.episodes || tmdbData.episodes_original;
                        seasonCache[cacheKey] = eps;
                        applyData(eps);
                    }
                }, function (error) {
                    // Ошибка, оставляем как есть
                });
            }
        }
    });
})();
