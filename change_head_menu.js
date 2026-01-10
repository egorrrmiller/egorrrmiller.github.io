(function () {
    'use strict';

    function initCustomHead() {
        // Создаем кнопку перезагрузки (если её нет)
        if (!$('#reboot-plugin').length) {
            var icon = '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></svg>';
            var button = $('<div id="reboot-plugin" class="head__action selector">' + icon + '</div>');
            
            button.on('hover:enter hover:click hover:touch', function() {
                window.location.reload();
            });

            $('#app > div.head > div > div.head__actions').append(button);
        }

        // Функция применения видимости
        function applyVisibility() {
            // Кнопка перезагрузки
            if (Lampa.Storage.get('head_reboot', 'true')) $('#reboot-plugin').removeClass('hide');
            else $('#reboot-plugin').addClass('hide');

            // Уведомления
            if (Lampa.Storage.get('head_notifications', 'true')) $('.head__action--notifications').removeClass('hide');
            else $('.head__action--notifications').addClass('hide');

            // Профиль
            if (Lampa.Storage.get('head_profile', 'true')) $('.head__action--profile').removeClass('hide');
            else $('.head__action--profile').addClass('hide');

            if (window.Lampa && Lampa.Head) Lampa.Head.update();
        }

        // Регистрируем параметры в Storage
        Lampa.SettingsApi.addParam({
            component: 'head_settings',
            param: { name: 'head_reboot', type: 'trigger', default: true },
            field: { name: 'Кнопка перезагрузки', description: 'Показать/скрыть кнопку перезагрузки' },
            onChange: applyVisibility
        });

        Lampa.SettingsApi.addParam({
            component: 'head_settings',
            param: { name: 'head_notifications', type: 'trigger', default: true },
            field: { name: 'Уведомления', description: 'Показать/скрыть колокольчик' },
            onChange: applyVisibility
        });

        Lampa.SettingsApi.addParam({
            component: 'head_settings',
            param: { name: 'head_profile', type: 'trigger', default: true },
            field: { name: 'Профиль', description: 'Показать/скрыть иконку профиля' },
            onChange: applyVisibility
        });

        // Добавляем пункт "Верхняя панель" в список настроек
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                var item = $('<div class="settings-folder selector" data-component="head_settings">' +
                    '<div class="settings-folder__icon"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg></div>' +
                    '<div class="settings-folder__name">Верхняя панель</div>' +
                '</div>');

                item.on('hover:enter', function () {
                    Lampa.Settings.main().render().find('.scroll').empty(); // Очищаем экран настроек
                    Lampa.Settings.main().render().find('.scroll').append(Lampa.SettingsApi.render({component: 'head_settings'})); // Рисуем наши параметры
                });

                e.body.find('.scroll').append(item);
            }
        });

        // Запуск при старте
        applyVisibility();
    }

    // Ожидание готовности
    if (window.appready) initCustomHead();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initCustomHead();
        });
    }
})();
