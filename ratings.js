(function () {
    'use strict';

    // Твой токен по умолчанию
    var default_token = '24b4fca8-ab26-4c97-a675-f46012545706';

    /**
     * СТИЛИ ОФОРМЛЕНИЯ
     */
    function addSettingsStyles() {
        if ($('#ratings-style-custom').length) return;
        $('body').append(`<style id="ratings-style-custom">
            .full-start__rate { 
                display: inline-flex !important; 
                align-items: center !important; 
                gap: 8px !important; 
                margin-right: 15px !important;
                font-weight: bold !important;
                font-size: 1.1em !important;
            }
            .rate--kp { color: #ff9000 !important; }
            .rate--imdb { color: #f5c518 !important; }
            .rate--tmdb { color: #01b4e4 !important; }

            .rate-png-icon {
                width: 1.4em;
                height: 1.4em;
                object-fit: contain;
                flex-shrink: 0;
            }
        </style>`);
    }

    // Официальные PNG иконки
    var png_icons = {
        kp: 'https://raw.githubusercontent.com/nb557/plugins/master/rating/img/kp.png',
        imdb: 'https://raw.githubusercontent.com/nb557/plugins/master/rating/img/imdb.png'
    };

    /**
     * МЕНЮ НАСТРОЕК (Исправлено по документации)
     */
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    Lampa.Listener.follow('settings', function (e) {
        if (e.type == 'open' && e.name == 'ratings_tweaks') {
            e.body.empty();
            var current_token = Lampa.Storage.get('kp_unofficial_token', default_token);

            var item = $(`
                <div class="settings-param selector">
                    <div class="settings-param__name">API ключ Кинопоиск</div>
                    <div class="settings-param__value">${current_token}</div>
                    <div class="settings-param__descr">Нажмите для изменения. Используется для получения рейтинга KP.</div>
                </div>
            `);

            item.on('hover:enter', function () {
                Lampa.Input.edit({
                    title: 'API Ключ',
                    value: Lampa.Storage.get('kp_unofficial_token', default_token),
                    free: true,
                    nosave: false
                }, function (new_val) {
                    if (new_val) {
                        Lampa.Storage.set('kp_unofficial_token', new_val);
                        item.find('.settings-param__value').text(new_val);
                    }
                });
            });

            e.body.append(item);

            Lampa.Controller.add('ratings_tweaks_ctrl', {
                toggle: function () {
                    Lampa.Controller.collectionSet(e.body);
                    Lampa.Controller.render();
                },
                up: Lampa.Select.prev,
                down: Lampa.Select.next,
                back: function () { Lampa.Controller.toggle('settings'); }
            });
            Lampa.Controller.toggle('ratings_tweaks_ctrl');
        }
    });

    /**
     * ОСНОВНАЯ ЛОГИКА (Твой рабочий код)
     */
    function rating_kp_imdb(card) {
        var network = new Lampa.Reguest();
        var kp_token = Lampa.Storage.get('kp_unofficial_token', default_token);
        var clean_title = card.title.replace(/[\s.,:;’'`!?]+/g, ' ').trim();
        
        var params = {
            id: card.id,
            url: 'https://kinopoiskapiunofficial.tech/',
            headers: { 'X-API-KEY': kp_token },
            cache_time: 86400000 
        };

        // Поиск фильма
        var search_url = params.url + 'api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(clean_title);
        network.silent(search_url, function (json) {
            var items = json.films || json.items || [];
            if (items.length) {
                var id = items[0].filmId || items[0].kinopoiskId;
                // Получение деталей (рейтингов)
                network.silent(params.url + 'api/v2.2/films/' + id, function (data) {
                    _showRating(data.ratingKinopoisk, data.ratingImdb);
                }, function(){}, false, { headers: params.headers });
            }
        }, function(){}, false, { headers: params.headers });

        function _showRating(kp, imdb) {
            var render = Lampa.Activity.active().activity.render();
            $('.wait_rating', render).remove();

            if (kp) {
                var kp_html = $(`<div class="full-start__rate rate--kp"><img src="${png_icons.kp}" class="rate-png-icon"><div>${parseFloat(kp).toFixed(1)}</div></div>`);
                $('.rate--kp', render).replaceWith(kp_html);
            }
            if (imdb) {
                var imdb_html = $(`<div class="full-start__rate rate--imdb"><img src="${png_icons.imdb}" class="rate-png-icon"><div>${parseFloat(imdb).toFixed(1)}</div></div>`);
                $('.rate--imdb', render).replaceWith(imdb_html);
            }
        }
    }

    function startPlugin() {
        window.rating_plugin = true;
        addSettingsStyles();
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();
                $('.info__rate', render).after('<div style="width:2em;margin-top:1em;margin-right:1em" class="wait_rating"><div class="broadcast__scan"><div></div></div><div>');
                rating_kp_imdb(e.data.movie);
            }
        });
    }

    if (!window.rating_plugin) startPlugin();
})();
