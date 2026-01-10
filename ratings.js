(function () {
    'use strict';

    // Шаблон интерфейса настроек
    Lampa.Template.add('settings_ratings_custom', `
        <div>
            <div class="settings-param selector" data-name="kp_unofficial_token" data-type="input" placeholder="Введите ключ...">
                <div class="settings-param__name">API ключ Кинопоиск</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">Регистрация на kinopoiskapiunofficial.tech. Если "key" — выключено.</div>
            </div>

            <div class="settings-param selector" data-name="show_imdb_toggle" data-type="trigger">
                <div class="settings-param__name">Рейтинг IMDB</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">Показывать рейтинг IMDB из базы TMDB</div>
            </div>
        </div>
    `);

    // Регистрация раздела в меню настроек
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // Логика отрисовки и работы кнопок в настройках
    Lampa.Listener.follow('settings', function (e) {
        if (e.type == 'open' && e.name == 'ratings_tweaks') {
            var body = $(Lampa.Template.get('settings_ratings_custom', {}));
            
            // Подгрузка текущих значений из Storage
            body.find('.settings-param').each(function () {
                var item = $(this);
                var name = item.data('name');
                var val  = Lampa.Storage.get(name, name == 'kp_unofficial_token' ? 'key' : true);

                item.find('.settings-param__value').text(item.data('type') == 'trigger' ? (val ? 'Да' : 'Нет') : (val || 'key'));
            });

            e.body.append(body);

            // Контроллер для навигации пультом
            Lampa.Controller.add('settings_component', {
                toggle: function () { Lampa.Controller.collectionSet(e.body); Lampa.Controller.render(); },
                up: function () { Lampa.Select.prev(); },
                down: function () { Lampa.Select.next(); },
                back: function () { Lampa.Controller.toggle('settings'); },
                enter: function () {
                    var item = Lampa.Select.active();
                    var name = item.data('name');

                    if (item.data('type') == 'trigger') {
                        var cur = Lampa.Storage.get(name, true);
                        Lampa.Storage.set(name, !cur);
                        item.find('.settings-param__value').text(!cur ? 'Да' : 'Нет');
                    } else {
                        Lampa.Input.edit({ value: Lampa.Storage.get(name, 'key'), free: true }, function (new_val) {
                            if (new_val) { Lampa.Storage.set(name, new_val); item.find('.settings-param__value').text(new_val); }
                        });
                    }
                }
            });
            Lampa.Controller.toggle('settings_component');
        }
    });

    // Основная инициализация плагина
    function init() {
        // Кастомные стили для отображения рейтингов
        if (!$('#ratings-style-final').length) {
            $('body').append('<style id="ratings-style-final">' +
                '.full-start__rate.custom-rate { display: inline-flex !important; align-items: center; gap: 4px; margin-right: 12px; vertical-align: middle; font-weight: normal; }' +
                '.rate--kp-text { color: #ff9000; }' +
                '.rate--imdb-text { color: #f5c518; }' +
                '.custom-rate div:last-child { font-size: 0.8em; opacity: 0.7; margin-left: 2px; }' +
                '</style>');
        }

        // Слушатель открытия карточки фильма
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var rateLine = e.body.find('.full-start-new__rate-line');
                if (!rateLine.length) return;

                // Очистка и скрытие стандартных блоков
                rateLine.find('.custom-rate').remove();
                rateLine.find('.rate--kp, .rate--imdb').hide();

                var movie = e.data.movie;
                var type = movie.number_of_seasons ? 'tv' : 'movie';
                var kp_token = Lampa.Storage.get('kp_unofficial_token', 'key');

                // Получение данных через TMDB Proxy (ID и IMDB)
                var network = new Lampa.Reguest();
                var tmdb_url = 'https://apitmdb.cub.rip/3/' + type + '/' + movie.id + '?api_key=4ef0d7355d9ffb5151e987764708ce96&append_to_response=external_ids&language=ru';

                network.silent(tmdb_url, function (json) {
                    if (!json) return;

                    // Отрисовка IMDB
                    if (Lampa.Storage.get('show_imdb_toggle', true)) {
                        var imdb = json.imdb_rating || (json.votes ? json.votes.imdb : 0) || json.vote_average || 0;
                        if (imdb > 0) {
                            var html = $('<div class="full-start__rate custom-rate rate--imdb-text"><div>' + parseFloat(imdb).toFixed(1) + '</div><div>IMDB</div></div>');
                            var tag = rateLine.find('.rate--tmdb');
                            if (tag.length) tag.after(html); else rateLine.append(html);
                        }
                    }

                    // Запрос к KP Unofficial, если ключ не "key"
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

    // Проверка готовности приложения
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();
