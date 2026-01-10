(function () {
    'use strict';

    // Регистрируем компонент в боковом меню
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // Слушатель открытия нашей вкладки
    Lampa.Listener.follow('settings', function (e) {
        if (e.type == 'open' && e.name == 'ratings_tweaks') {
            renderMySettings(e.body);
        }
    });

    function renderMySettings(body) {
        body.empty();

        // Массив параметров
        var params = [
            {
                name: 'kp_unofficial_token',
                title: 'API ключ Кинопоиск',
                descr: 'Регистрация на kinopoiskapiunofficial.tech. Если "key" — выключено.',
                type: 'input'
            },
            {
                name: 'show_imdb_toggle',
                title: 'Рейтинг IMDB',
                descr: 'Показывать рейтинг IMDB из базы TMDB',
                type: 'trigger'
            }
        ];

        // Отрисовка каждого пункта
        params.forEach(function (p) {
            var value = Lampa.Storage.get(p.name, p.name == 'kp_unofficial_token' ? 'key' : true);
            var display_value = p.type == 'trigger' ? (value ? 'Да' : 'Нет') : value;

            var item = $(`
                <div class="settings-param selector" data-name="${p.name}" data-type="${p.type}">
                    <div class="settings-param__name">${p.title}</div>
                    <div class="settings-param__value">${display_value}</div>
                    <div class="settings-param__descr">${p.descr}</div>
                </div>
            `);

            // Важно: регистрируем элемент для навигации
            item.on('hover:enter', function () {
                if (p.type == 'trigger') {
                    var cur = Lampa.Storage.get(p.name, true);
                    Lampa.Storage.set(p.name, !cur);
                    $(this).find('.settings-param__value').text(!cur ? 'Да' : 'Нет');
                } else {
                    // Вызов системного ввода Lampa.Input
                    Lampa.Input.edit({
                        value: Lampa.Storage.get(p.name, 'key'),
                        free: true,
                        title: p.title
                    }, function (new_value) {
                        if (new_value !== null) {
                            Lampa.Storage.set(p.name, new_value || 'key');
                            item.find('.settings-param__value').text(new_value || 'key');
                        }
                    });
                }
            });

            body.append(item);
        });

        // ПРИНУДИТЕЛЬНЫЙ РЕНДЕР: Без этого меню будет пустым
        Lampa.Controller.add('ratings_tweaks_ctrl', {
            toggle: function () {
                Lampa.Controller.collectionSet(body);
                Lampa.Controller.render();
            },
            up: function () { Lampa.Select.prev(); },
            down: function () { Lampa.Select.next(); },
            back: function () { Lampa.Controller.toggle('settings'); }
        });

        Lampa.Controller.toggle('ratings_tweaks_ctrl');
    }

    /**
     * ЛОГИКА ОТОБРАЖЕНИЯ РЕЙТИНГОВ В КАРТОЧКЕ
     */
    function init() {
        // Подключаем стили
        if (!$('#ratings-style-fix').length) {
            $('body').append('<style id="ratings-style-fix">' +
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

                var network = new Lampa.Reguest();
                var tmdb_url = 'https://apitmdb.cub.rip/3/' + type + '/' + movie.id + '?api_key=4ef0d7355d9ffb5151e987764708ce96&append_to_response=external_ids&language=ru';

                network.silent(tmdb_url, function (json) {
                    if (!json) return;

                    // IMDB (из TMDB)
                    if (Lampa.Storage.get('show_imdb_toggle', true)) {
                        var imdb = json.imdb_rating || (json.votes ? json.votes.imdb : 0) || json.vote_average || 0;
                        if (imdb > 0) {
                            var html = $('<div class="full-start__rate custom-rate rate--imdb-text"><div>' + parseFloat(imdb).toFixed(1) + '</div><div>IMDB</div></div>');
                            var tag = rateLine.find('.rate--tmdb');
                            if (tag.length) tag.after(html); else rateLine.append(html);
                        }
                    }

                    // Кинопоиск (Unofficial API)
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

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();
