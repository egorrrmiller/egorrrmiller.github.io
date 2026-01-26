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

        Lampa.Listener.follow('torrent_file', function (e) {
            if (e.type === 'list_open') {
                console.log('TT: list_open', e);
                seasonCache = {};
            } else if (e.type === 'render') {
                var html = e.item;
                var data = e.element;
                var movie = e.params.movie;
                
                // Считаем только видеофайлы для корректного offset
                var videoFiles = e.items.filter(function(item){
                    var ext = (item.path || '').split('.').pop().toLowerCase();
                    return ['mkv', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'].indexOf(ext) !== -1;
                });
                var allFilesCount = videoFiles.length;

                if (!movie || !movie.id) return;

                var seasonNum = data.season || 1;
                var episodeNum = parseInt(data.episode);

                var fileName = data.folder_name || data.path;
                var checkPart = fileName.match(/(?:часть|part|pt?\.?|ep?\.?|s\d+e|эпизод)\s*(\d+)/i);
                
                if (isNaN(episodeNum) && checkPart && checkPart[1]) {
                    episodeNum = parseInt(checkPart[1]);
                }

                console.log('TT: Render item', {
                    fileName: fileName,
                    seasonNum: seasonNum,
                    episodeNum: episodeNum,
                    allFilesCount: allFilesCount,
                    totalItems: e.items.length
                });

                if (isNaN(episodeNum)) {
                    return;
                }

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

                    var targetEpisode = episodes.find(function (ep) {
                        return ep.episode_number === episodeNum;
                    });

                    console.log('TT: Direct find', targetEpisode);

                    // Если прямое совпадение не найдено, пробуем offset
                    if (!targetEpisode) {
                        var totalInTMDB = episodes.length;
                        var offset = Math.max(0, totalInTMDB - allFilesCount);
                        var targetEpisodeNumber = offset + episodeNum;
                        
                        console.log('TT: Offset calc', { 
                            totalInTMDB: totalInTMDB, 
                            allFilesCount: allFilesCount, 
                            offset: offset, 
                            targetEpisodeNumber: targetEpisodeNumber 
                        });

                        targetEpisode = episodes.find(function (ep) {
                            return ep.episode_number === targetEpisodeNumber;
                        });
                        
                        console.log('TT: Offset find', targetEpisode);
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
