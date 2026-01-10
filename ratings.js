(function () {
    'use strict';

    // Регистрация компонента в настройках
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // Добавление параметра для ключа (твой ключ установлен по умолчанию)
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: {
            name: 'kp_unofficial_token',
            type: 'input',
            default: '24b4fca8-ab26-4c97-a675-f46012545706'
        },
        field: {
            name: 'API ключ Кинопоиск',
            description: 'Токен от kinopoiskapiunofficial.tech. Если оставить "key" — запрос не уйдет.'
        }
    });

    // Параметр для включения IMDB
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: {
            name: 'show_imdb_rating',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Рейтинг IMDB',
            description: 'Показывать рейтинг IMDB (желтый цвет)'
        }
    });

    function init() {
        // Стили для корректного отображения цифр
        if (!$('#ratings-style-final').length) {
            $('body').append('<style id="ratings-style-final">' +
                '.full-start__rate.custom-rate { display: inline-flex !important; align-items: center; gap: 4px; margin-right: 12px; vertical-align: middle; font-weight: normal; }' +
                '.rate--kp-text { color: #ff9000; }' +
                '.rate--imdb-text { color: #f5c518; }' +
                '.custom-rate div:last-child { font-size: 0.8em; opacity: 0.7; margin-left: 2px; }' +
                '</style>');
        }

        // Слушатель завершения загрузки карточки
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var rateLine = e.body.find('.full-start-new__rate-line');
                if (!rateLine.length) return;

                // Очищаем старые данные
                rateLine.find('.custom-rate').remove();
                rateLine.find('.rate--kp, .rate--imdb').hide();

                var movie = e.data.movie;
                var type = movie.number_of_seasons ? 'tv' : 'movie';
                var kp_token = Lampa.Storage.get('kp_unofficial_token', '24b4fca8-ab26-4c97-a675-f46012545706');

                // Запрос к TMDB Proxy для получения внешних ID и базового рейтинга
                var network = new Lampa.Reguest();
                var tmdb_url = 'https://apitmdb.cub.rip/3/' + type + '/' + movie.id + '?api_key=4ef0d7355d9ffb5151e987764708ce96&append_to_response=external_ids&language=ru';

                network.silent(tmdb_url, function (json) {
                    if (!json) return;

                    // Отрисовка IMDB
                    if (Lampa.Storage.get('show_imdb_rating', true)) {
                        var imdb = json.imdb_rating || (json.votes ? json.votes.imdb : 0) || json.vote_average || 0;
                        if (imdb > 0) {
                            var html = $('<div class="full-start__rate custom-rate rate--imdb-text"><div>' + parseFloat(imdb).toFixed(1) + '</div><div>IMDB</div></div>');
                            var tag = rateLine.find('.rate--tmdb');
                            if (tag.length) tag.after(html); else rateLine.append(html);
                        }
                    }

                    // Запрос к Кинопоиску через Unofficial API
                    if (kp_token && kp_token !== 'key' && kp_token.trim() !== '') {
                        var kp_id = (json.external_ids ? json.external_ids.kp_id : null) || movie.id;
                        if (kp_id && !isNaN(kp_id)) {
                            $.ajax({
                                url: 'https://kinopoiskapiunofficial.tech/api/v2.2/films/' + kp_id,
                                method: 'GET',
                                headers: { 'X-API-KEY': kp_token.trim() },
                                success: function (data) {
                                    if (data && data.ratingKinopoisk) {
                                        var val = parseFloat(data.ratingKinopoisk).toFixed(1);
                                        // Вставляем KP первым в строке
                                        rateLine.prepend('<div class="full-start__rate custom-rate rate--kp-text"><div>' + val + '</div><div>KP</div></div>');
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    // Запуск при готовности приложения
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();
