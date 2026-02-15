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
                    console.log('TT: Torrent Title:', title);
                    
                    var matchSeason = title.match(/(?:season|сезон|s)\s*:?\s*(\d+)/i);
                    if (matchSeason && matchSeason[1]) {
                        torrentSeason = parseInt(matchSeason[1]);
                        console.log('TT: Detected season:', torrentSeason);
                    }

                    var matchOffset = title.match(/(?:offset|start)\s*:?\s*(\d+)/i);
                    if (matchOffset && matchOffset[1]) {
                        var val = parseInt(matchOffset[1]);
                        if (title.toLowerCase().indexOf('start') > -1) {
                            torrentOffset = val - 1;
                        } else {
                            torrentOffset = val;
                        }
                        console.log('TT: Detected offset:', torrentOffset);
                    }

                    if (title.match(/(?:part|часть|cour)\s*2/i)) {
                        isPart2 = true;
                        console.log('TT: Detected Part 2 flag');
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

                console.log('TT: Render item', {
                    fileName: fileName,
                    seasonNum: seasonNum,
                    episodeNum: episodeNum,
                    isPart2: isPart2,
                    allFilesCount: allFilesCount
                });

                if (isNaN(episodeNum)) return;

                var cacheKey = movie.id + '_s' + seasonNum;
                var titleElem = html.find('.torrent-serial__title');
                var lineElem = html.find('.torrent-serial__line');
                var imgElem = html.find('.torrent-serial__img');

                var applyData = function (episodes) {
                    console.log('TT: applyData', { episodesCount: episodes ? episodes.length : 0 });

                    if (!episodes || !episodes.length) {
                        titleElem.removeClass('ts-hidden');
                        lineElem.removeClass('ts-hidden');
                        imgElem.removeClass('ts-hidden');
                        return;
                    }

                    var targetEpisode = null;
                    var totalInTMDB = episodes.length;

                    // 1. Part 2 Logic
                    if (isPart2 && torrentOffset === 0) {
                        var autoOffset = Math.max(0, totalInTMDB - allFilesCount);
                        console.log('TT: Part 2 Logic. Total:', totalInTMDB, 'Files:', allFilesCount, 'Offset:', autoOffset);
                        
                        if (autoOffset > 0) {
                            var targetNum = autoOffset + episodeNum;
                            targetEpisode = episodes.find(function (ep) {
                                return ep.episode_number === targetNum;
                            });
                            if (targetEpisode) console.log('TT: Found via Part 2 Offset:', targetEpisode.name);
                            else console.log('TT: Not found via Part 2 Offset');
                        }
                    }

                    // 2. Direct Logic
                    if (!targetEpisode) {
                        targetEpisode = episodes.find(function (ep) {
                            return ep.episode_number === episodeNum;
                        });
                        if (targetEpisode) console.log('TT: Found via Direct:', targetEpisode.name);
                    }

                    // 3. Tail Logic
                    if (!targetEpisode && torrentOffset === 0) {
                        var offset = Math.max(0, totalInTMDB - allFilesCount);
                        console.log('TT: Tail Logic. Offset:', offset);
                        if (offset > 0) {
                             targetEpisode = episodes.find(function (ep) {
                                return ep.episode_number === offset + episodeNum;
                            });
                            if (targetEpisode) console.log('TT: Found via Tail Offset:', targetEpisode.name);
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
                    } else {
                        console.log('TT: Episode NOT FOUND');
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
                    console.log('TT: Data from params');
                    hasData = true;
                    episodesData = e.params.seasons[seasonNum].episodes;
                } else if (seasonCache[cacheKey]) {
                    console.log('TT: Data from cache');
                    hasData = true;
                    episodesData = seasonCache[cacheKey];
                }

                if (hasData) {
                    applyData(episodesData);
                } else {
                    console.log('TT: Fetching data for season', seasonNum);
                    titleElem.addClass('ts-hidden');
                    lineElem.addClass('ts-hidden');
                    imgElem.addClass('ts-hidden');

                    Lampa.Api.sources.tmdb.get('tv/' + movie.id + '/season/' + seasonNum + '?language=' + Lampa.Storage.get('language','ru'), {}, function (tmdbData) {
                        console.log('TT: API success');
                        if (tmdbData && (tmdbData.episodes || tmdbData.episodes_original)) {
                            var eps = tmdbData.episodes || tmdbData.episodes_original;
                            seasonCache[cacheKey] = eps;
                            applyData(eps);
                        } else {
                            applyData(null);
                        }
                    }, function (error) {
                        console.log('TT: API error', error);
                        applyData(null);
                    });
                }
            }
        });
    }
})();
