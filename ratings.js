(function () {
    'use strict';

    // 1. Регистрация компонента настроек
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // 2. Добавление параметров (с безопасными значениями по умолчанию)
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'ratings_kp_unofficial_key', type: 'input', default: '' },
        field: { 
            name: 'API ключ (Unofficial)', 
            description: 'Введите ключ с сайта kinopoiskapiunofficial.tech. Без ключа рейтинг KP не отображается.' 
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'show_imdb_rating', type: 'trigger', default: true },
        field: { name: 'Рейтинг IMDB', description: 'Показать IMDB (желтый текст)' }
    });

    function initRatings() {
        // --- Стили (Минимализм) ---
        if (!$('style#ratings-tweaks-styles').length) {
            $('body').append('<style id="ratings-tweaks-styles">' +
                '.full-start__rate.custom-rate { display: inline-flex !important; align-items: center; gap: 4px; margin-right: 12px; vertical-align: middle; font-weight: normal; }' +
                '.rate--kp-text { color: #ff9000; }' +
                '.rate--imdb-text { color: #f5c518; }' +
                '.custom-rate .source-label { font-size: 0.8em; opacity: 0.7; margin-left: 2px; }' +
                '</style>');
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var rateLine = e.body.find('.full-start-new__rate-line');
                var movie = e.data.movie;
                var type = movie.number_of_seasons ? 'tv' : 'movie';
                
                // Безопасное получение ключа (защита от undefined)
                var kp_key = Lampa.Storage.get('ratings_kp_unofficial_key', '');

                if (rateLine.length) {
                    rateLine.find('.custom-rate').remove();
                    rateLine.find('.rate--kp, .rate--imdb').hide();
                }

                // --- ШАГ 1: Запрос TMDB (для IMDB и ID) ---
                var network = new Lampa.Reguest();
                var tmdb_url = 'https://apitmdb.cub.rip/3/' + type + '/' + movie.id + '?api_key=4ef0d7355d9ffb5151e987764708ce96&append_to_response=external_ids&language=ru';

                network.silent(tmdb_url, function (tmdb_data) {
                    if (!tmdb_data) return;

                    // Отрисовка IMDB
                    if (Lampa.Storage.get('show_imdb_rating', true)) {
                        var imdb_raw = tmdb_data.imdb_rating || (tmdb_data.votes ? tmdb_data.votes.imdb : 0) || tmdb_data.vote_average || 0;
                        if (imdb_raw > 0) {
                            var imdb_val = parseFloat(imdb_raw).toFixed(1);
                            var imdb_html = $('<div class="full-start__rate custom-rate rate--imdb-text"><div>' + imdb_val + '</div><div class="source-label">IMDB</div></div>');
                            var tmdb_block = rateLine.find('.rate--tmdb');
                            if (tmdb_block.length) tmdb_block.after(imdb_html);
                            else rateLine.append(imdb_html);
                        }
                    }

                    // --- ШАГ 2: Запрос KP Unofficial (если есть ключ) ---
                    if (kp_key && kp_key.length > 5) {
                        var kp_id = (tmdb_data.external_ids ? tmdb_data.external_ids.kp_id : null) || movie.id;

                        if (kp_id && !isNaN(kp_id)) {
                            $.ajax({
                                url: 'https://kinopoiskapiunofficial.tech/api/v2.2/films/' + kp_id,
                                method: 'GET',
                                headers: { 'X-API-KEY': kp_key.trim() },
                                success: function (kp_data) {
                                    if (kp_data && kp_data.ratingKinopoisk) {
                                        var kp_val = parseFloat(kp_data.ratingKinopoisk).toFixed(1);
                                        var kp_html = '<div class="full-start__rate custom-rate rate--kp-text"><div>' + kp_val + '</div><div class="source-label">KP</div></div>';
                                        rateLine.prepend(kp_html);
                                    }
                                },
                                error: function() { console.log('Ratings: KP API error or limit reached'); }
                            });
                        }
                    }
                });
            }
        });
    }

    // Инициализация с проверкой готовности
    if (window.appready) initRatings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') initRatings();
        });
    }
})();
