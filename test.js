(function () {
    'use strict';

    var waitLampa = setInterval(function(){
        if(window.Lampa && window.Lampa.Listener){
            clearInterval(waitLampa);
            init();
        }
    }, 200);

    function init(){
        console.log('TT: Plugin init');

        var style = document.createElement('style');
        style.innerHTML = '.torrent-serial__title, .torrent-serial__line, .torrent-serial__img { transition: opacity 0.3s ease; } .ts-hidden { opacity: 0; }';
        document.head.appendChild(style);

        function getDirectTMDBImage(path, size) {
            return 'https://imagetmdb.com/t/p/' + size + '/' + path;
        }

        var seasonCache = {};
        var torrentSeason = null;
        var torrentOffset = 0;
        var isPart2 = false;

        Lampa.Listener.follow('torrent_file', function (e) {
            if (e.type === 'list_open') {
                console.log('TT: list_open', e);
                seasonCache = {};
                torrentSeason = null;
                torrentOffset = 0;
                isPart2 = false;

                var activity = Lampa.Activity.active();
                if (activity && activity.component === 'torrents' && activity.object && activity.object.title) {
                    var title = activity.object.title;
                    
                    // Сезон
                    var matchSeason = title.match(/(?:season|сезон|s)\s*:?\s*(\d+)/i);
                    if (matchSeason && matchSeason[1]) {
                        torrentSeason = parseInt(matchSeason[1]);
                    }

                    // Смещение (явное)
                    var matchOffset = title.match(/(?:offset|start)\s*:?\s*(\d+)/i);
                    if (matchOffset && matchOffset[1]) {
                        var val = parseInt(matchOffset[1]);
                        if (title.toLowerCase().indexOf('start') > -1) {
                            torrentOffset = val - 1;
                        } else {
                            torrentOffset = val;
                        }
                    }

                    // Авто-детект "Часть 2"
                    if (title.match(/(?:part|часть|cour)\s*2/i)) {
                        isPart2 = true;
                        console.log('TT: Detected Part 2');
                    }
                }
            } else if (e.type === 'render') {
                var html = e.item;
                var data = e.element;
                var movie = e.params.movie;
                
                var videoFiles = e.items.filter(function(item){
                    var ext = (item.path || '').split('.').pop().toLowerCase();
                    return ['mkv', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'].indexOf(ext) !== -1;
                });
                var allFilesCount = videoFiles.length;

                if (!movie || !movie.id) return;

                var seasonNum = data.season || torrentSeason || 1;
                var episodeNum = parseInt(data.episode);

                var fileName = data.folder_name || data.path;
                var checkPart = fileName.match(/(?:часть|part|pt?\.?|ep?\.?|s\d+e|эпизод)\s*(\d+)/i);
                
                if (isNaN(episodeNum) && checkPart && checkPart[1]) {
                    episodeNum = parseInt(checkPart[1]);
                }

                if (!isNaN(episodeNum) && torrentOffset > 0) {
                    episodeNum += torrentOffset;
                }

                if (isNaN(episodeNum)) return;

                var cacheKey = movie.id + '_s' + seasonNum;
                var titleElem = html.find('.torrent-serial__title');
                var lineElem = html.find('.torrent-serial__line');
                var imgElem = html.find('.torrent-serial__img');

                var applyData = function (episodes) {
                    if (!episodes || !episodes.length) {
                        titleElem.removeClass('ts-hidden');
                        lineElem.removeClass('ts-hidden');
                        imgElem.removeClass('ts-hidden');
                        return;
                    }

                    var targetEpisode = null;
                    var totalInTMDB = episodes.length;

                    // 1. Если это Part 2, пробуем найти эпизод во второй половине
                    if (isPart2 && torrentOffset === 0) {
                        // Предполагаем, что Part 2 - это вторая половина
                        // Вычисляем offset как разницу, если файлов меньше чем серий
                        var autoOffset = Math.max(0, totalInTMDB - allFilesCount);
                        
                        // Если offset > 0 (значит это хвост), пробуем применить его
                        if (autoOffset > 0) {
                            var targetNum = autoOffset + episodeNum;
                            targetEpisode = episodes.find(function (ep) {
                                return ep.episode_number === targetNum;
                            });
                            if (targetEpisode) console.log('TT: Part 2 Auto-Offset applied', autoOffset);
                        }
                    }

                    // 2. Если не нашли (или не Part 2), ищем напрямую
                    if (!targetEpisode) {
                        targetEpisode = episodes.find(function (ep) {
                            return ep.episode_number === episodeNum;
                        });
                    }

                    // 3. Если не нашли напрямую, пробуем обычный авто-offset (для хвостов без метки Part 2)
                    if (!targetEpisode && torrentOffset === 0) {
                        var offset = Math.max(0, totalInTMDB - allFilesCount);
                        if (offset > 0) {
                             targetEpisode = episodes.find(function (ep) {
                                return ep.episode_number === offset + episodeNum;
                            });
                        }
                    }

                    if (targetEpisode) {
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

                    requestAnimationFrame(function() {
                        titleElem.removeClass('ts-hidden');
                        lineElem.removeClass('ts-hidden');
                        imgElem.removeClass('ts-hidden');
                    });
                };

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
                    applyData(episodesData);
                } else {
                    titleElem.addClass('ts-hidden');
                    lineElem.addClass('ts-hidden');
                    imgElem.addClass('ts-hidden');

                    Lampa.Api.sources.tmdb.get('tv/' + movie.id + '/season/' + seasonNum + '?language=' + Lampa.Storage.get('language','ru'), {}, function (tmdbData) {
                        if (tmdbData && (tmdbData.episodes || tmdbData.episodes_original)) {
                            var eps = tmdbData.episodes || tmdbData.episodes_original;
                            seasonCache[cacheKey] = eps;
                            applyData(eps);
                        } else {
                            applyData(null);
                        }
                    }, function (error) {
                        applyData(null);
                    });
                }
            }
        });
    }
})();
