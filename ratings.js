(function () {
    'use strict';

    // Регистрация раздела в настройках
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // --- ПАРАМЕТРЫ В МЕНЮ ---

    // Параметр: Кинопоиск
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'show_kp_rating', type: 'trigger', default: true },
        field: { name: 'Рейтинг Кинопоиск', description: 'Показать иконку и балл KP' }
    });

    // Параметр: IMDB
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'show_imdb_rating', type: 'trigger', default: true },
        field: { name: 'Рейтинг IMDB', description: 'Показать иконку и балл IMDB' }
    });

    function initRatings() {
        // --- СТИЛИ ИКОНОК ---
        var style = $('<style>' +
            '.full-start__rate.custom-rate { display: flex !important; align-items: center; gap: 5px; margin-right: 15px; }' +
            '.full-start__rate.custom-rate svg { width: 1.2em; height: 1.2em; }' +
            '.rate--kp-icon { color: #ff9000; }' +
            '.rate--imdb-icon { color: #f5c518; }' +
            '</style>');
        $('body').append(style);

        // --- SVG ИКОНКИ ---
        var icons = {
            kp: '<svg class="rate--kp-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.17 4.142c-.476 0-.86.386-.86.861v14c0 .476.384.86.86.86h.861c.476 0 .861-.384.861-.86v-14a.861.861 0 0 0-.86-.861h-.862zM3.86 4.142c-.475 0-.86.386-.86.861v14c0 .476.385.86.86.86h.862c.476 0 .86-.384.86-.86v-5.286l3.41 5.286h1.258l-3.832-5.717 3.551-3.665h-1.12L5.581 9.471V5.003a.861.861 0 0 0-.86-.861H3.86zM11.583 4.142c-.476 0-.861.386-.861.861v14c0 .476.385.86.861.86h.86a.86.86 0 0 0 .86-.86v-14a.86.86 0 0 0-.86-.861h-.86z"/></svg>',
            imdb: '<svg class="rate--imdb-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22.067 4H1.933C.866 4 0 4.866 0 5.933v12.134C0 19.134.866 20 1.933 20h20.134c1.067 0 1.933-.866 1.933-1.933V5.933C24 4.866 23.134 4 22.067 4zM6.556 15.421H4.665V8.632h1.891v6.789zm4.276 0H8.941V8.632h1.891v6.789zm5.556-2.616c0 .425-.054.79-.161 1.096-.107.306-.263.556-.467.751-.203.195-.453.338-.751.428-.297.091-.635.136-1.012.136h-1.892V8.632h1.892c.365 0 .692.043.982.128.29.085.532.22.727.404.195.184.341.424.439.719.098.295.147.653.147 1.074v1.848zm4.056 2.616h-1.943l-1.066-2.502-1.067 2.502H18.37l-1.631-6.789h1.942l.756 3.75 1.109-3.75h1.942l-1.632 6.789z"/></svg>'
        };

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var rateLine = e.body.find('.full-start-new__rate-line');
                var movie = e.data.movie;
                var type = movie.number_of_seasons ? 'tv' : 'movie';

                // --- ЗАПРОС ДАННЫХ (apitmdb.cub.rip + новый API ключ) ---
                var network = new Lampa.Reguest();
                var url = 'https://apitmdb.cub.rip/3/' + type + '/' + movie.id + '?api_key=4ef0d7355d9ffb5151e987764708ce96&append_to_response=external_ids&language=ru';

                network.silent(url, function (json) {
                    if (rateLine.length) {
                        // Очистка старых и скрытие стандартных блоков
                        rateLine.find('.custom-rate').remove();
                        rateLine.find('.rate--kp, .rate--imdb').hide();

                        // Блок: Отрисовка Кинопоиск
                        var kp_val = json.kp_rating || (json.votes ? json.votes.kp : 0);
                        if (Lampa.Storage.field('show_kp_rating') && kp_val > 0) {
                            rateLine.prepend('<div class="full-start__rate custom-rate rate--kp"><div>' + kp_val + '</div>' + icons.kp + '</div>');
                        }

                        // Блок: Отрисовка IMDB
                        var imdb_val = json.imdb_rating || (json.votes ? json.votes.imdb : 0) || json.vote_average;
                        if (Lampa.Storage.field('show_imdb_rating') && imdb_val > 0) {
                            var imdbItem = $('<div class="full-start__rate custom-rate rate--imdb"><div>' + imdb_val + '</div>' + icons.imdb + '</div>');
                            var tmdb = rateLine.find('.rate--tmdb');
                            if (tmdb.length) tmdb.after(imdbItem);
                            else rateLine.append(imdbItem);
                        }
                    }
                });
            }
        });
    }

    // --- ИНИЦИАЛИЗАЦИЯ ПЛАГИНА ---
    if (window.appready) initRatings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') initRatings();
        });
    }
})();
