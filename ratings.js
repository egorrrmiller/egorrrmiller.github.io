(function () {
    'use strict';

    var default_token = '24b4fca8-ab26-4c97-a675-f46012545706';

    // Официальные стабильные ссылки на PNG
    var png_icons = {
        kp: 'https://img.icons8.com/color/48/kinopoisk.png',
        imdb: 'https://img.icons8.com/color/48/imdb.png'
    };

    function addSettingsStyles() {
        if ($('#ratings-style-custom').length) return;
        $('body').append(`<style id="ratings-style-custom">
            .full-start__rate.custom-rate { 
                display: inline-flex !important; 
                align-items: center !important; 
                gap: 5px !important; 
                margin-right: 15px !important;
                font-weight: bold !important;
                font-size: 1.2em !important;
                background: rgba(255,255,255,0.05);
                padding: 2px 8px;
                border-radius: 6px;
            }
            .rate--kp-custom { color: #ff9000 !important; }
            .rate--imdb-custom { color: #f5c518 !important; }
            
            .rate-png-icon {
                width: 1.1em;
                height: 1.1em;
                object-fit: contain;
            }
        </style>`);
    }

    // Регистрация в меню (исправлено)
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
                    <div class="settings-param__descr">Нажмите для изменения ключа (Unofficial API).</div>
                </div>
            `);

            item.on('hover:enter', function () {
                Lampa.Input.edit({
                    title: 'API Ключ',
                    value: Lampa.Storage.get('kp_unofficial_token', default_token),
                    free: true
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

    function rating_kp_imdb(card) {
        var network = new Lampa.Reguest();
        var kp_token = Lampa.Storage.get('kp_unofficial_token', default_token);
        
        // Поиск ID фильма через API КП
        var search_url = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(card.title);
        
        network.silent(search_url, function (json) {
            var items = json.films || json.items || [];
            if (items.length) {
                var id = items[0].filmId || items[0].kinopoiskId;
                network.silent('https://kinopoiskapiunofficial.tech/api/v2.2/films/' + id, function (data) {
                    _showRating(data.ratingKinopoisk, data.ratingImdb);
                }, function(){}, false, { headers: { 'X-API-KEY': kp_token } });
            }
        }, function(){}, false, { headers: { 'X-API-KEY': kp_token } });

        function _showRating(kp, imdb) {
            var render = Lampa.Activity.active().activity.render();
            $('.wait_rating', render).remove();
            
            // Удаляем старые, если были
            $('.custom-rate', render).remove();
            // Прячем стандартные
            $('.rate--kp, .rate--imdb', render).addClass('hide');

            var rateLine = $('.info__rate', render);

            if (kp && kp !== 'null') {
                rateLine.append(`<div class="full-start__rate custom-rate rate--kp-custom"><img src="${png_icons.kp}" class="rate-png-icon"><div>${kp}</div></div>`);
            }
            if (imdb && imdb !== 'null') {
                rateLine.append(`<div class="full-start__rate custom-rate rate--imdb-custom"><img src="${png_icons.imdb}" class="rate-png-icon"><div>${imdb}</div></div>`);
            }
        }
    }

    function startPlugin() {
        window.rating_plugin = true;
        addSettingsStyles();
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();
                if (!$('.wait_rating', render).length) {
                    $('.info__rate', render).after('<div style="width:2em;margin-top:1em;margin-right:1em" class="wait_rating"><div class="broadcast__scan"><div></div></div><div>');
                    rating_kp_imdb(e.data.movie);
                }
            }
        });
    }

    if (!window.rating_plugin) startPlugin();
})();
