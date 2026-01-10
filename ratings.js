(function () {
    'use strict';

    // Регистрация раздела в настройках
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // Параметр: Кинопоиск
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'show_kp_rating', type: 'trigger', default: true },
        field: { name: 'Рейтинг Кинопоиск', description: 'Отображать KP в карточке' }
    });

    // Параметр: IMDB
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'show_imdb_rating', type: 'trigger', default: true },
        field: { name: 'Рейтинг IMDB', description: 'Отображать IMDB в карточке' }
    });

    function initRatings() {
        // Добавляем стили для красоты
        var style = $('<style>' +
            '.full-start__rate.rate--kp { color: #ff9000; font-weight: bold; }' +
            '.full-start__rate.rate--imdb { color: #f5c518; font-weight: bold; }' +
            '.full-start__rate div:first-child { font-size: 1.2em; }' +
            '.full-start-new__rate-line { align-items: center; display: flex; }' +
            '</style>');
        $('body').append(style);

        // Следим за открытием страницы фильма
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var container = e.body;
                var data = e.data.movie;

                // Блок: Поиск строки с рейтингами
                var rateLine = container.find('.full-start-new__rate-line');

                if (rateLine.length) {
                    // Блок: Обработка Кинопоиска
                    if (Lampa.Storage.field('show_kp_rating') && data.kp_rating) {
                        var kpBlock = rateLine.find('.rate--kp');
                        if (kpBlock.length) {
                            kpBlock.find('div:first-child').text(data.kp_rating);
                        } else {
                            rateLine.prepend('<div class="full-start__rate rate--kp"><div>' + data.kp_rating + '</div><div class="source--name">KP</div></div>');
                        }
                    }

                    // Блок: Обработка IMDB
                    if (Lampa.Storage.field('show_imdb_rating') && data.imdb_rating) {
                        var imdbBlock = rateLine.find('.rate--imdb');
                        if (imdbBlock.length) {
                            imdbBlock.find('div:first-child').text(data.imdb_rating);
                        } else {
                            // Вставляем после TMDB или просто в начало
                            rateLine.find('.rate--tmdb').after('<div class="full-start__rate rate--imdb"><div>' + data.imdb_rating + '</div><div class="source--name">IMDB</div></div>');
                        }
                    }
                }
            }
        });
    }

    // Запуск
    if (window.appready) initRatings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') initRatings();
        });
    }
})();
