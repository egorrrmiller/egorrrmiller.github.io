(function () {
    'use strict';

    // Добавляем настройку
    /*
    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'parser') {
            var item = $(`
                <div class="settings-param selector" data-type="toggle" data-name="parser_use_tmdb_id">
                    <div class="settings-param__name">Поиск по TMDB ID</div>
                    <div class="settings-param__value"></div>
                    <div class="settings-param__descr">Добавлять ID TMDB к запросу поиска торрентов</div>
                </div>
            `);

            var target = e.body.find('[data-name="parser_torrent_type"]');
            if (target.length) {
                target.after(item);
            } else {
                e.body.find('.settings-param').first().before(item);
            }

            Lampa.Params.bind(item);
        }
    });
    */

    Lampa.Listener.follow('request_before', function (e) {
        // Проверяем, что это запрос к Jackett
        if (e.params.url && e.params.url.indexOf('/api/v2.0/indexers/') !== -1 && e.params.url.indexOf('/results') !== -1) {
            
            // Убираем параметр year из запроса
            e.params.url = e.params.url.replace(/([?&])year=[^&]*&?/, '$1').replace(/&$/, '');

            
            // Логика добавления TMDB ID
            if (Lampa.Storage.field('parser_use_tmdb_id')) {
                var activity = Lampa.Activity.active();
                var movie = null;

                if (activity.component === 'full' && activity.card) movie = activity.card;
                if (activity.component === 'torrents' && activity.movie) movie = activity.movie;

                if (movie && movie.id) {
                    var match = e.params.url.match(/title_original=([^&]+)/);
                    
                    if (match && match[1]) {
                        var urlTitle = decodeURIComponent(match[1]).toLowerCase();
                        var cardTitle = (movie.original_title || movie.original_name || '').toLowerCase();

                        if (urlTitle === cardTitle || cardTitle.indexOf(urlTitle) > -1 || urlTitle.indexOf(cardTitle) > -1) {
                            e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + movie.id);
                            e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb-search=true');
                        }
                    } else {
                        e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb=' + movie.id);
                        e.params.url = Lampa.Utils.addUrlComponent(e.params.url, 'tmdb-search=true');
                    }
                }
            }
        }
    });
})();
