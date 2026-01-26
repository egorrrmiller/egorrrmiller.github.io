(function () {
    'use strict';
    var tryCount = 0;
    var timer = setInterval(function () {
        if (window.Lampa && window.Lampa.TorrServer && window.Lampa.TorrServer.search) {
            clearInterval(timer);
            window.Lampa.TorrServer.search = function (object, render) {
                var item = object.movie || object.card;
                var host = Lampa.Storage.get('torrserver_url');
                var apikey = Lampa.Storage.get('torrserver_apikey');
                
                // --- ЛОГИКА ОПРЕДЕЛЕНИЯ КАТЕГОРИЙ ---
                
                // 1. Определяем базовый тип: Сериал или Фильм
                var is_serial = (item.number_of_seasons || item.first_air_date) ? true : false;
                
                // 2. Определяем, Аниме ли это (Жанр "Animation" id 16 + Язык "ja")
                // В Lampa жанры лежат в item.genres (массив объектов {id, name})
                var is_anime = false;
                if (item.original_language === 'ja' && item.genres) {
                    is_anime = item.genres.some(function(g) { return g.id === 16 || g.name === 'Мультфильм' || g.name === 'Animation'; });
                }

                // 3. Достаем настройки из Storage (если пользователь настроил их в меню) или ставим дефолт
                var cat_movie = Lampa.Storage.get('torrserver_cat_movie') || '2000,2010,2020,2030,2040,2045,2050,2060';
                var cat_serial = Lampa.Storage.get('torrserver_cat_serial') || '5000,5020,5030,5040,5080';
                var cat_anime = Lampa.Storage.get('torrserver_cat_anime') || '5070';

                // 4. Собираем итоговый массив категорий
                var cats = [];
                
                if (is_serial) {
                    cats.push(cat_serial);
                } else {
                    cats.push(cat_movie);
                }

                // Если это аниме, добавляем категорию аниме к уже выбранным (чтобы искало и в Anime, и в TV/Movie)
                if (is_anime) {
                    cats.push(cat_anime);
                }
                
                // Превращаем в строку "5000,5070"
                var category_param = cats.join(',');
                // -------------------------------------

                var query = encodeURIComponent(Lampa.Utils.cleanTitle(item.original_title || item.title));
                var year = item.year || '';
                var is_serial_num = is_serial ? 2 : 0;
                var genres = '';
                if (item.genres && item.genres.length) {
                    genres = encodeURIComponent(item.genres.map(function(g){ return g.name }).join(','));
                }
                var tmdb = item.id || '';
                var imdb = item.imdb_id || '';
                var kp = item.kp_id || '';
                var base_url = (host || '').replace(/\/$/, '');
                
                var url = base_url + '/api/v2.0/indexers/all/results' +
                          '?apikey=' + apikey +
                          '&Query=' + query +
                          '&year=' + year +
                          '&is_serial=' + is_serial_num +
                          '&genres=' + genres +
                          '&Category[]=' + category_param + // Вставляем динамические категории
                          '&tmdb=' + tmdb +
                          '&imdb=' + imdb +
                          '&kp=' + kp;
                          
                Lampa.Network.silent(url, function (json) {
                    if (json) {
                        if (json.Results) render(json.Results);
                        else if (Array.isArray(json)) render(json);
                        else render([]);
                    } else {
                        render([]);
                    }
                }, function (a, c) {
                    render([]);
                });
            };
        } else {
            tryCount++;
            if(tryCount > 50) clearInterval(timer);
        }
    }, 200);
})();
