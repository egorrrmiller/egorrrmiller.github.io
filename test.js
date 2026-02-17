(function () {
    'use strict';

    // Перехват запросов
    Lampa.Listener.follow('request_before', function (e) {
        if (e.params.url && e.params.url.indexOf('/api/v2.0/indexers/') !== -1 && e.params.url.indexOf('/results') !== -1) {
            e.params.url = e.params.url.replace(/([?&])year=[^&]*&?/, '$1').replace(/&$/, '');
        }
    });

    // Добавляем кнопку перезагрузки
    Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'start' && e.component === 'torrents') {
            var waitFilter = setInterval(function(){
                var filter = $('.torrent-filter');
                if (filter.length) {
                    clearInterval(waitFilter);
                    
                    if (filter.find('.filter--reload').length) return;

                    var btn = $(`
                        <div class="simple-button simple-button--filter selector filter--reload">
                            <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1.5em;">
                                <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>
                            </svg>
                        </div>
                    `);

                    filter.find('.filter--sort').after(btn);

                    btn.on('hover:enter', function () {
                        forceSearch();
                    });
                }
            }, 200);
        }
    });

    function forceSearch() {
        console.log('SS: Force Search started');
        var activity = Lampa.Activity.active();
        var movie = activity.movie;
        var query = activity.search;

        var url = Lampa.Storage.field('jackett_url');
        var key = Lampa.Storage.field('jackett_key');
        var interview = Lampa.Storage.field('jackett_interview') == 'healthy' ? 'status:healthy' : 'all';

        if (!url || !key) {
            Lampa.Noty.show('Jackett не настроен');
            return;
        }

        url = Lampa.Utils.checkEmptyUrl(url);

        var u = url + '/api/v2.0/indexers/' + interview + '/results?apikey=' + key + '&Query=' + encodeURIComponent(query);
        console.log('SS: Base URL:', u);

        var cats;
        if (movie) {
            try {
                u += '&title=' + encodeURIComponent(movie.title);
                u += '&title_original=' + encodeURIComponent(movie.original_title || movie.original_name);
                
                var is_serial = (movie.original_name || movie.number_of_seasons > 0) ? '2' : '1';
                u += '&is_serial=' + is_serial;

                if (movie.genres) {
                    var genres = movie.genres.map(function(a) { return a.name; }).join(',');
                    u += '&genres=' + encodeURIComponent(genres);
                }

                var cat = (movie.number_of_seasons > 0 ? 5000 : 2000) + (movie.original_language == 'ja' ? ',5070' : '');
                console.log('SS: Category:', cat);
                cats = '&Category[]=' + cat;
            } catch (e) {
                console.error('SS: Error building URL params', e);
            }
        }

        u += '&force_search=true';
        u += cats;

        console.log('SS: Final URL:', u);
        Lampa.Noty.show('Начат принудительный поиск');

        $.ajax({
            url: u,
            type: 'GET',
            success: function() {
                console.log('SS: Request success');
                if (activity.component === 'torrents') {
                    Lampa.Activity.replace({
                        component: 'torrents',
                        movie: movie,
                        search: query,
                        page: 1
                    });
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('SS: Request error', textStatus, errorThrown);
                Lampa.Noty.show('Ошибка запроса Force Search');
            }
        });
    }

})();
