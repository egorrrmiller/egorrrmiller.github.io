(function () {
    'use strict';

    Lampa.Listener.follow('request_before', function (e) {
        // Проверяем, что это запрос к Jackett
        if (e.params.url && e.params.url.indexOf('/api/v2.0/indexers/') !== -1 && e.params.url.indexOf('/results') !== -1) {
            var activity = Lampa.Activity.active();
            var movie = null;

            if (activity.component === 'full' && activity.card) movie = activity.card;
            if (activity.component === 'torrents' && activity.movie) movie = activity.movie;

            if (movie) {
                // 1. Добавляем TMDB ID
                /* if (movie.id) {
                    var match = e.params.url.match(/title_original=([^&]+)/);
                    var shouldAddId = false;

                    if (match && match[1]) {
                        var urlTitle = decodeURIComponent(match[1]).toLowerCase();
                        var cardTitle = (movie.original_title || movie.original_name || '').toLowerCase();

                        if (urlTitle === cardTitle || cardTitle.indexOf(urlTitle) > -1 || urlTitle.indexOf(cardTitle) > -1) {
                            shouldAddId = true;
                        }
                    } else {
                        shouldAddId = true;
                    }

                    if (shouldAddId) {
                        e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + movie.id);
                    }
                } */

                // 2. Фикс поиска (Query = search_one + search_two)
                if (activity.component === 'torrents' && activity.search_one && activity.search_two) {
                    var newQuery = activity.search_one + ' ' + activity.search_two;
                    
                    // Обновляем Query в URL
                    e.params.url = e.params.url.replace(/([?&]Query=)([^&]*)/, function(match, prefix, oldValue) {
                        return prefix + encodeURIComponent(newQuery);
                    });

                    // Обновляем отображаемый поисковый запрос в активности, если нужно
                    if (activity.search !== newQuery) {
                        activity.search = newQuery;
                    }
                }
            }
        }
    });
})();
