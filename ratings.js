(function () {
    'use strict';

    var default_token = '24b4fca8-ab26-4c97-a675-f46012545706';

    // Твои ссылки на официальные логотипы
    var svg_icons = {
        kp: 'https://logo-teka.com/wp-content/uploads/2025/07/kinopoisk-sign-logo.svg',
        tmdb: 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg',
        imdb: 'https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg'
    };

    function addSettingsStyles() {
        if ($('#ratings-style-custom').length) return;
        $('body').append(`<style id="ratings-style-custom">
            .full-start__rate.custom-rate { 
                display: inline-flex !important; 
                align-items: center !important; 
                gap: 8px !important; 
                margin-right: 15px !important;
                font-weight: bold !important;
                font-size: 1.1em !important;
                vertical-align: middle;
            }
            /* Цвета для цифр */
            .rate--kp-custom { color: #ff9000 !important; }
            .rate--imdb-custom { color: #f5c518 !important; }
            .rate--tmdb-custom { color: #01b4e4 !important; }
            
            /* Стили для SVG иконок */
            .rate-svg-icon {
                height: 1.2em;
                width: auto;
                display: block;
                object-fit: contain;
            }
        </style>`);
    }

    // Регистрация в меню (без инпутов через API, рисуем сами)
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
        
        // Поиск фильма в КП
        var search_url = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(card.title);
        
        network.silent(search_url, function (json) {
            var items = json.films || json.items || [];
            if (items.length) {
                var id = items[0].filmId || items[0].kinopoiskId;
                network.silent('https://kinopoiskapiunofficial.tech/api/v2.2/films/' + id, function (data) {
                    _showRating(data.ratingKinopoisk, data.ratingImdb, card.vote_average);
                }, function(){}, false, { headers: { 'X-API-KEY': kp_token } });
            }
        }, function(){}, false, { headers: { 'X-API-KEY': kp_token } });

        function _showRating(kp, imdb, tmdb) {
            var render = Lampa.Activity.active().activity.render();
            $('.wait_rating', render).remove();
            
            // Прячем стандартные элементы
            $('.rate--kp, .rate--imdb, .rate--tmdb', render).addClass('hide');
            // Удаляем наши старые кастомные элементы, если они были
            $('.custom-rate', render).remove();

            var rateLine = $('.info__rate', render);

            // Отрисовка TMDB
            if (tmdb) {
                rateLine.append(`<div class="full-start__rate custom-rate rate--tmdb-custom"><img src="${svg_icons.tmdb}" class="rate-svg-icon"><div>${parseFloat(tmdb).toFixed(1)}</div></div>`);
            }
            // Отрисовка КП
            if (kp && kp !== 'null') {
                rateLine.append(`<div class="full-start__rate custom-rate rate--kp-custom"><img src="${svg_icons.kp}" class="rate-svg-icon"><div>${kp}</div></div>`);
            }
            // Отрисовка IMDb
            if (imdb && imdb !== 'null') {
                rateLine.append(`<div class="full-start__rate custom-rate rate--imdb-custom"><img src="${svg_icons.imdb}" class="rate-svg-icon"><div>${imdb}</div></div>`);
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
