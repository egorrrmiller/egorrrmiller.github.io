(function () {
    'use strict';

    // Регистрируем темплейт для настроек (твой вариант)
    Lampa.Template.add('settings_ratings_custom', `
        <div>
            <div class="settings-param selector" data-type="input" data-name="kp_unofficial_token" placeholder="Введите ключ...">
                <div class="settings-param__name">API ключ Кинопоиск</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">Ключ от kinopoiskapiunofficial.tech для получения рейтингов</div>
            </div>
        </div>
    `);

    function addStyles() {
        if ($('#ratings-style-custom').length) return;
        $('body').append(`<style id="ratings-style-custom">
            .full-start__rate { 
                display: inline-flex !important; 
                align-items: center !important; 
                gap: 12px !important; 
                margin-right: 25px !important;
                font-weight: bold !important;
                font-size: 1.45em !important;
            }
            .rate--kp { color: #ff9000 !important; }
            .rate--imdb { color: #f5c518 !important; }
            .rate--tmdb { color: #01b4e4 !important; }
            .rate-png-icon {
                width: 1.85em;
                height: 1.85em;
                object-fit: contain;
                flex-shrink: 0;
            }
        </style>`);
    }

    var png_icons = {
        kp: 'https://logo-teka.com/wp-content/uploads/2025/07/kinopoisk-sign-logo.svg',
        imdb: 'https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg',
        tmdb: 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg'
    };

    /**
     * РЕГИСТРАЦИЯ КОМПОНЕНТА В НАСТРОЙКАХ
     */
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // Слушатель для открытия наших настроек
    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'ratings_tweaks') {
            e.body.empty().append(Lampa.Template.get('settings_ratings_custom', {}, true));
            
            // Инициализация параметров (чтобы инпуты работали и сохраняли)
            Lampa.Settings.main().render(e.body);
            
            // Фокусировка контроллера для навигации пультом
            Lampa.Controller.add('settings_ratings_ctrl', {
                toggle: function () {
                    Lampa.Controller.collectionSet(e.body);
                    Lampa.Controller.render();
                },
                up: Lampa.Select.prev,
                down: Lampa.Select.next,
                back: function () {
                    Lampa.Controller.toggle('settings');
                }
            });
            Lampa.Controller.toggle('settings_ratings_ctrl');
        }
    });

    function rating_kp_imdb(card) {
        var network = new Lampa.Reguest();
        // Берем токен из Storage. По умолчанию стоит твой рабочий.
        var kp_token = Lampa.Storage.get('kp_unofficial_token', '24b4fca8-ab26-4c97-a675-f46012545706');
        var clean_title = card.title.replace(/[\s.,:;’'`!?]+/g, ' ').trim();
        
        var params = {
            url: 'https://kinopoiskapiunofficial.tech/',
            headers: { 'X-API-KEY': kp_token }
        };

        // Рисуем TMDB сразу (он вшит в Lampa)
        if (card.vote_average) {
            var tmdb_html = $(`<div class="full-start__rate rate--tmdb"><img src="${png_icons.tmdb}" class="rate-png-icon"><div>${parseFloat(card.vote_average).toFixed(1)}</div></div>`);
            Lampa.Activity.active().activity.render().find('.rate--tmdb').replaceWith(tmdb_html);
        }

        // Запрос к КП
        var search_url = params.url + 'api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(clean_title);
        network.silent(search_url, function (json) {
            var items = json.films || json.items || [];
            if (items.length) {
                var id = items[0].filmId || items[0].kinopoiskId;
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
        addStyles();
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
