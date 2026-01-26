(function () {
    'use strict';

    Lampa.Listener.follow('request_before', function (e) {
        // Проверяем, что это запрос к Jackett
        if (e.params.url && e.params.url.indexOf('/api/v2.0/indexers/') !== -1 && e.params.url.indexOf('/results') !== -1) {
            var activity = Lampa.Activity.active();
            var movie = null;

            if (activity.component === 'full' && activity.card) movie = activity.card;
            if (activity.component === 'torrents' && activity.movie) movie = activity.movie;

            if (movie && movie.id) {
                // Дополнительная проверка, чтобы убедиться, что запрос соответствует текущей карточке
                var match = e.params.url.match(/title_original=([^&]+)/);
                
                if (match && match[1]) {
                    var urlTitle = decodeURIComponent(match[1]).toLowerCase();
                    var cardTitle = (movie.original_title || movie.original_name || '').toLowerCase();

                    // Простая проверка на вхождение
                    if (urlTitle === cardTitle || cardTitle.indexOf(urlTitle) > -1 || urlTitle.indexOf(cardTitle) > -1) {
                        e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + movie.id);
                    }
                } else {
                    // Если в URL нет title_original, но мы в активности торрентов, считаем, что это правильный фильм
                    e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + movie.id);
                }
            }
        }
    });
})();
