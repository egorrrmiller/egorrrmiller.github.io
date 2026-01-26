(function () {
    'use strict';

    var currentMovieId = null;

    console.log('TMDB Plugin: Init started');

    // Ждем загрузки Lampa и API
    var waitApi = setInterval(function(){
        if(window.Lampa && Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.parser){
            clearInterval(waitApi);
            console.log('TMDB Plugin: Lampa API found, hooking parser.get');

            var originalGet = Lampa.Api.sources.parser.get;

            // Перехватываем метод get у парсера
            Lampa.Api.sources.parser.get = function(params, oncomplite, onerror){
                console.log('TMDB Plugin: parser.get called', params);
                
                if(params && params.movie && params.movie.id){
                    currentMovieId = params.movie.id;
                    console.log('TMDB Plugin: Captured Movie ID:', currentMovieId);
                    
                    // Сбрасываем ID через 5 секунд, чтобы не зацепить лишнее
                    setTimeout(function(){ 
                        if(currentMovieId) console.log('TMDB Plugin: Clearing ID timeout');
                        currentMovieId = null; 
                    }, 5000);
                } else {
                    console.log('TMDB Plugin: No movie ID in params');
                }
                return originalGet.apply(this, arguments);
            };
        }
    }, 200);

    Lampa.Listener.follow('request_before', function (e) {
        // Проверяем, что это запрос к Jackett
        if (e.params.url && e.params.url.indexOf('/api/v2.0/indexers/') !== -1 && e.params.url.indexOf('/results') !== -1) {
            console.log('TMDB Plugin: Jackett request detected', e.params.url);
            
            // Если у нас есть сохраненный ID фильма, добавляем его
            if (currentMovieId) {
                console.log('TMDB Plugin: Appending TMDB ID', currentMovieId);
                e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + currentMovieId);
                console.log('TMDB Plugin: New URL', e.params.url);
            } else {
                console.log('TMDB Plugin: No currentMovieId to append');
            }
        }
    });
})();
