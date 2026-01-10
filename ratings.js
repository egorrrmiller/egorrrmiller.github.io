(function () {
    'use strict';

    // Регистрация раздела в настройках
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // Отрисовка элементов настроек
    Lampa.Listener.follow('settings', function (e) {
        if (e.type == 'open' && e.name == 'ratings_tweaks') {
            var items = [
                {
                    name: 'kp_unofficial_token',
                    type: 'input',
                    label: 'API ключ Кинопоиск',
                    descr: 'Регистрация на kinopoiskapiunofficial.tech. Если "key" — выключено.'
                },
                {
                    name: 'show_imdb_toggle',
                    type: 'trigger',
                    label: 'Рейтинг IMDB',
                    descr: 'Показывать рейтинг IMDB из базы TMDB'
                }
            ];

            e.body.empty(); // Очистка перед отрисовкой

            items.forEach(function (item) {
                var val = Lampa.Storage.get(item.name, item.name == 'kp_unofficial_token' ? 'key' : true);
                var view_val = item.type == 'trigger' ? (val ? 'Да' : 'Нет') : (val || 'key');

                var html = $(`
                    <div class="settings-param selector" data-name="${item.name}" data-type="${item.type}">
                        <div class="settings-param__name">${item.label}</div>
                        <div class="settings-param__value">${view_val}</div>
                        <div class="settings-param__descr">${item.descr}</div>
                    </div>
                `);

                e.body.append(html);
            });

            // Управление навигацией и вводом через Lampa.Input
            Lampa.Controller.add('settings_ratings', {
                toggle: function () {
                    Lampa.Controller.collectionSet(e.body);
                    Lampa.Controller.render();
                },
                up: Lampa.Select.prev,
                down: Lampa.Select.next,
                back: function () { Lampa.Controller.toggle('settings'); },
                enter: function () {
                    var active = Lampa.Select.active();
                    var name = active.data('name');
                    var type = active.data('type');

                    if (type == 'trigger') {
                        var cur = Lampa.Storage.get(name, true);
                        Lampa.Storage.set(name, !cur);
                        active.find('.settings-param__value').text(!cur ? 'Да' : 'Нет');
                    } else {
                        // Используем системный Lampa.Input для ввода текста
                        Lampa.Input.edit({
                            value: Lampa.Storage.get(name, 'key'),
                            free: true,
                            title: 'Введите API ключ'
                        }, function (new_val) {
                            if (new_val !== null) {
                                Lampa.Storage.set(name, new_val || 'key');
                                active.find('.settings-param__value').text(new_val || 'key');
                            }
                        });
                    }
                }
            });

            Lampa.Controller.toggle('settings_ratings');
        }
    });

    // Логика инъекции рейтингов в карточку
    function init() {
        // Стили отображения (без иконок и жирности)
        if (!$('#ratings-style-final').length) {
            $('body').append('<style id="ratings-style-final">' +
                '.full-start__rate.custom-rate { display: inline-flex !important; align-items: center; gap: 4px; margin-right: 12px; vertical-align: middle; font-weight: normal; }' +
                '.rate--kp-text { color: #ff9000; }' +
                '.rate--imdb-text { color: #f5c518; }' +
                '.custom-rate div:last-child { font-size: 0.8em; opacity: 0.7; margin-left: 2px; }' +
                '</style>');
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var rateLine = e.body.find('.full-start-new__rate-line');
                if (!rateLine.length) return;

                rateLine.find('.custom-rate').remove();
                rateLine.find('.rate--kp, .rate--imdb').hide();

                var movie = e.data.movie;
                var type = movie.number_of_seasons ? 'tv' : 'movie';
                var kp_token = Lampa.Storage.get('kp_unofficial_token', 'key');

                // Запрос внешних ID через TMDB Proxy
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

                    // Запрос к Кинопоиску (только если ключ не default)
                    if (kp_token && kp_token !== 'key') {
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

    // Запуск плагина
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();
