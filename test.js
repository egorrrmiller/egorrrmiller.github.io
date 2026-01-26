(function () {
    'use strict';

    Lampa.Listener.follow('request_before', function (e) {
        // Проверяем, что URL соответствует запросу к Jackett
        if (e.params.url && e.params.url.indexOf('/api/v2.0/indexers/') !== -1 && e.params.url.indexOf('/results') !== -1) {
            // Проверяем, что в параметрах запроса есть объект movie и у него есть id (TMDB ID)
            if (e.params.movie && e.params.movie.id) {
                // Добавляем параметр 'tmdb' с ID фильма/сериала к URL
                e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + e.params.movie.id);
            }
        }
    });
})();
