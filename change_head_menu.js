(function () {
    'use strict';

    function initCustomHead() {
        // 1. Регистрация параметров в настройках
        Lampa.SettingsApi.addParam({
            component: 'custom_head',
            param: {
                name: 'head_reboot',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Кнопка перезагрузки',
                description: 'Показывать иконку перезагрузки в меню'
            },
            onChange: applyChanges
        });

        Lampa.SettingsApi.addParam({
            component: 'custom_head',
            param: {
                name: 'head_notifications',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Уведомления',
                description: 'Показывать стандартную иконку колокольчика'
            },
            onChange: applyChanges
        });

        Lampa.SettingsApi.addParam({
            component: 'custom_head',
            param: {
                name: 'head_profile',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Профиль',
                description: 'Показывать иконку пользователя'
            },
            onChange: applyChanges
        });

        // 2. Создание кнопки перезагрузки (если её еще нет)
        if (!$('#reboot-plugin').length) {
            var icon = '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></svg>';
            var button = $('<div id="reboot-plugin" class="head__action selector">' + icon + '</div>');
            
            button.on('hover:enter hover:click hover:touch', function() {
                window.location.reload();
            });

            $('#app > div.head > div > div.head__actions').append(button);
        }

        // 3. Функция применения настроек
        function applyChanges() {
            // Перезагрузка
            if (Lampa.Storage.get('head_reboot', 'true')) $('#reboot-plugin').removeClass('hide');
            else $('#reboot-plugin').addClass('hide');

            // Уведомления (стандартный класс Lampa)
            var notify = $('.head__action--notifications');
            if (Lampa.Storage.get('head_notifications', 'true')) notify.removeClass('hide');
            else notify.addClass('hide');

            // Профиль (стандартный класс Lampa)
            var profile = $('.head__action--profile');
            if (Lampa.Storage.get('head_profile', 'true')) profile.removeClass('hide');
            else profile.addClass('hide');

            // Обновляем навигацию
            if (window.Lampa && Lampa.Head) Lampa.Head.update();
        }

        // Добавляем раздел в общее меню настроек Lampa
        Lampa.Settings.add({
            title: 'Верхняя панель',
            component: 'custom_head',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>'
        });

        // Запуск при старте
        applyChanges();
    }

    // Инициализация
    if (window.appready) initCustomHead();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initCustomHead();
        });
    }
})();
