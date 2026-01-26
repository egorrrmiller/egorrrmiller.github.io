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
                
                // Попытка получить ID из активности
                var activity = Lampa.Activity.active();
                console.log('TMDB Plugin: Current Activity:', activity);
                
                var movie = null;
                
                if(activity.component === 'full' && activity.card) movie = activity.card;
                if(activity.component === 'torrents' && activity.movie) movie = activity.movie;
                
                if (movie && movie.id) {
                     // Дополнительная проверка, чтобы убедиться, что запрос соответствует текущей карточке
                     // Например, проверяем наличие оригинального названия в URL
                     var match = e.params.url.match(/title_original=([^&]+)/);
                     if(match && match[1]){
                         var urlTitle = decodeURIComponent(match[1]).toLowerCase();
                         var cardTitle = (movie.original_title || movie.original_name || '').toLowerCase();
                         
                         // Простая проверка на вхождение, так как названия могут немного отличаться
                         if(urlTitle === cardTitle || cardTitle.indexOf(urlTitle) > -1 || urlTitle.indexOf(cardTitle) > -1){
                             console.log('TMDB Plugin: Found ID from Activity:', movie.id);
                             e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + movie.id);
                             console.log('TMDB Plugin: New URL (from Activity)', e.params.url);
                         } else {
                             console.log('TMDB Plugin: Activity card title mismatch', urlTitle, cardTitle);
                         }
                     } else {
                         // Если в URL нет title_original, но мы в активности торрентов, скорее всего это тот самый фильм
                         console.log('TMDB Plugin: No title_original in URL, but assuming correct movie from activity');
                         e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + movie.id);
                         console.log('TMDB Plugin: New URL (from Activity)', e.params.url);
                     }
                }
            }
        }
    });
})();
