(function () {
    'use strict';

    // Регистрируем раздел в настройках для управления плагином
    Lampa.SettingsApi.addComponent({
        component: 'ratings_tweaks',
        name: 'Рейтинги',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/></svg>'
    });

    // Параметр: Показывать Кинопоиск
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'show_kp_rating', type: 'trigger', default: true },
        field: { name: 'Рейтинг Кинопоиск', description: 'Отображать KP в карточках и описании' }
    });

    // Параметр: Показывать TMDB
    Lampa.SettingsApi.addParam({
        component: 'ratings_tweaks',
        param: { name: 'show_tmdb_rating', type: 'trigger', default: true },
        field: { name: 'Рейтинг TMDB', description: 'Отображать TMDB в карточках и описании' }
    });

    // --- ЛОГИКА ОТОБРАЖЕНИЯ ---

    function initRatings() {
        
        // Блок: Обработка карточек в списках
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                renderRatings(e);
            }
        });

        // Блок: Функция рендеринга данных
        function renderRatings(e) {
            var card = e.object;
            var container = e.body;
            
            // Получаем данные из API (используем штатный прокси Lampa для рейтингов)
            if (card.method !== 'person') {
                var url = 'https://api.tmdb.org/3/' + card.method + '/' + card.id + '?api_key=4ef0d3844422e11e86053351ec3c6902&language=ru-RU';
                
                // Для Кинопоиска в Lampa обычно используется отдельный парсер или готовые поля в e.data
                // Если данные доступны в e.data (после загрузки страницы фильма)
                if (e.data && e.data.movie) {
                    displayOnFullPage(e.data.movie, container);
                }
            }
        }

        // Блок: Отображение на странице фильма (описание)
        function displayOnFullPage(data, container) {
            var info = container.find('.full-start__details');
            if (info.length && !info.find('.custom-ratings').length) {
                var html = $('<div class="custom-ratings" style="display: flex; gap: 15px; margin-top: 10px; font-weight: bold;"></div>');
                
                if (Lampa.Storage.field('show_kp_rating') && data.kp_rating) {
                    html.append('<span style="color: #ff9000;">KP: ' + data.kp_rating + '</span>');
                }
                
                if (Lampa.Storage.field('show_tmdb_rating') && data.vote_average) {
                    html.append('<span style="color: #01d277;">TMDB: ' + data.vote_average + '</span>');
                }
                
                info.append(html);
            }
        }
    }

    // Инициализация
    if (window.appready) initRatings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') initRatings();
        });
    }
})();
