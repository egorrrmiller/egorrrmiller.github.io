(function () {
    'use strict';

    var currentMovieId = null;

    // Ждем загрузки Lampa и API
    var waitApi = setInterval(function(){
        if(window.Lampa && Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.parser){
            clearInterval(waitApi);

            var originalGet = Lampa.Api.sources.parser.get;

            // Перехватываем метод get у парсера
            Lampa.Api.sources.parser.get = function(params, oncomplite, onerror){
                if(params && params.movie && params.movie.id){
                    currentMovieId = params.movie.id;
                    // Сбрасываем ID через 5 секунд, чтобы не зацепить лишнее
                    setTimeout(function(){ currentMovieId = null; }, 5000);
                }
                return originalGet.apply(this, arguments);
            };
        }
    }, 200);

    Lampa.Listener.follow('request_before', function (e) {
        // Проверяем, что это запрос к Jackett
        if (e.params.url && e.params.url.indexOf('/api/v2.0/indexers/') !== -1 && e.params.url.indexOf('/results') !== -1) {
            // Если у нас есть сохраненный ID фильма, добавляем его
            if (currentMovieId) {
                e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + currentMovieId);
            }
        }
    });
})();
