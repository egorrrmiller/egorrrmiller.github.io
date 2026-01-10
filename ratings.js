(function () {
    'use strict';

    // Регистрация раздела в настройках
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // --- ПАРАМЕТРЫ В МЕНЮ ---

    // Поле для ключа KinopoiskAPIUnofficial
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'ratings_kp_unofficial_key', type: 'input', default: '' },
        field: { 
            name: 'API ключ (Unofficial)', 
            description: 'Получить на kinopoiskapiunofficial.tech. Если поле пустое — рейтинг KP не отображается.' 
        }
    });

    // Настройка IMDB
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'show_imdb_rating', type: 'trigger', default: true },
        field: { name: 'Рейтинг IMDB', description: 'Показать IMDB (желтый текст)' }
    });

    function initRatings() {
        // --- СТИЛИ ---
        var style = $('<style>' +
            '.full-start__rate.custom-rate { display: inline-flex !important; align-items: center; gap: 4px; margin-right: 12px; vertical-align: middle; font-weight: normal; }' +
            '.rate--kp-text { color: #ff9000; }' +
            '.rate--imdb-text { color: #f5c518; }' +
            '.custom-rate .source-label { font-size: 0.8em; opacity: 0.7; margin-left: 2px; }' +
            '</style>');
        $('body').append(style);

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var rateLine = e.body.find('.full-start-new__rate-line');
                var movie = e.data.movie;
                var type = movie.number_of_seasons ? 'tv' : 'movie';
                var kp_key = Lampa.Storage.field('ratings_kp_unofficial_key');

                // Очистка и подготовка строки
                if (rateLine.length) {
                    rateLine.find('.custom-rate').remove();
                    rateLine.find('.rate--kp, .rate--imdb').hide();
                }

                // --- ШАГ 1: Запрос к TMDB Proxy для получения внешних ID и IMDB ---
                var network = new Lampa.Reguest();
                var tmdb_url = 'https://apitmdb.cub.rip/3/' + type + '/' + movie.id + '?api_key=4ef0d7355d9ffb5151e987764708ce96&append_to_response=external_ids&language=ru';

                network.silent(tmdb_url, function (tmdb_data) {
                    
                    // Блок: Отрисовка IMDB (из данных TMDB)
                    if (Lampa.Storage.field('show_imdb_rating')) {
                        var imdb_raw = tmdb_data.imdb_rating || (tmdb_data.votes ? tmdb_data.votes.imdb : 0) || tmdb_data.vote_average || 0;
                        if (imdb_raw > 0) {
                            var imdb_val = parseFloat(imdb_raw).toFixed(1);
                            var imdb_html = $('<div class="full-start__rate custom-rate rate--imdb-text"><div>' + imdb_val + '</div><div class="source-label">IMDB</div></div>');
                            var tmdb_block = rateLine.find('.rate--tmdb');
                            if (tmdb_block.length) tmdb_block.after(imdb_html);
                            else rateLine.append(imdb_html);
                        }
                    }

                    // --- ШАГ 2: Запрос к Kinopoisk Unofficial (только если есть ключ) ---
                    if (kp_key && kp_key.trim().length > 0) {
                        
                        // Пытаемся найти KP ID (в Lampa он часто сидит в movie.id, если источник KP, или в external_ids)
                        var kp_id = (tmdb_data.external_ids ? tmdb_data.external_ids.kp_id : null) || movie.id;

                        // Если ID похож на правду (числовой), делаем запрос
                        if (kp_id && !isNaN(kp_id)) {
                            $.ajax({
                                url: 'https://kinopoiskapiunofficial.tech/api/v2.2/films/' + kp_id,
                                method: 'GET',
                                headers: {
                                    'X-API-KEY': kp_key.trim(),
                                    'Content-Type': 'application/json',
                                },
                                success: function (kp_data) {
                                    if (kp_data.ratingKinopoisk) {
                                        var kp_val = parseFloat(kp_data.ratingKinopoisk).toFixed(1);
                                        var kp_html = '<div class="full-start__rate custom-rate rate--kp-text"><div>' + kp_val + '</div><div class="source-label">KP</div></div>';
                                        rateLine.prepend(kp_html);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    // --- ЗАПУСК ---
    if (window.appready) initRatings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') initRatings();
        });
    }
})();
