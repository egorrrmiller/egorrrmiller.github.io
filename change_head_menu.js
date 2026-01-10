(function () {
    'use strict';

    function startPlugin() {
        // --- 1. ПАРАМЕТРЫ ---
        // Регистрируем их в системе Lampa
        Lampa.SettingsApi.addParam({
            component: 'head_manager',
            param: { name: 'head_reboot', type: 'trigger', default: true },
            field: { name: 'Кнопка перезагрузки', description: 'Показать/скрыть иконку перезагрузки' },
            onChange: applyChanges
        });

        Lampa.SettingsApi.addParam({
            component: 'head_manager',
            param: { name: 'head_notifications', type: 'trigger', default: true },
            field: { name: 'Уведомления', description: 'Показать/скрыть колокольчик' },
            onChange: applyChanges
        });

        Lampa.SettingsApi.addParam({
            component: 'head_manager',
            param: { name: 'head_profile', type: 'trigger', default: true },
            field: { name: 'Профиль', description: 'Показать/скрыть иконку профиля' },
            onChange: applyChanges
        });

        // --- 2. ЛОГИКА КНОПОК ---
        function applyChanges() {
            // Кнопка перезагрузки (создаем один раз, потом просто скрываем/показываем)
            if (Lampa.Storage.field('head_reboot')) {
                if (!$('#RELOAD_BUTTON').length) {
                    var btn = $('<div id="RELOAD_BUTTON" class="head__action selector"><svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></svg></div>');
                    $('#app > div.head > div > div.head__actions').append(btn);
                    btn.on('hover:enter hover:click hover:touch', function() {
                        location.reload();
                    });
                }
                $('#RELOAD_BUTTON').removeClass('hide');
            } else {
                $('#RELOAD_BUTTON').addClass('hide');
            }

            // Уведомления
            if (Lampa.Storage.field('head_notifications')) $('.head__action--notifications').removeClass('hide');
            else $('.head__action--notifications').addClass('hide');

            // Профиль
            if (Lampa.Storage.field('head_profile')) $('.head__action--profile').removeClass('hide');
            else $('.head__action--profile').addClass('hide');

            if (window.Lampa && Lampa.Head) Lampa.Head.update();
        }

        // --- 3. ВНЕДРЕНИЕ В МЕНЮ (МЕТОД TRICKS) ---
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') {
                var item = $('<div class="settings-folder selector" data-component="head_manager">' +
                    '<div class="settings-folder__icon"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg></div>' +
                    '<div class="settings-folder__name">Верхняя панель</div>' +
                '</div>');

                item.on('hover:enter', function () {
                    // Очищаем текущий список настроек и вставляем наш рендер
                    var render = Lampa.SettingsApi.render({ component: 'head_manager' });
                    
                    Lampa.Settings.main().render().find('.scroll').empty().append(render);

                    // Добавляем контроллер для пульта (как в tricks.js)
                    Lampa.Controller.add('settings_head_manager', {
                        toggle: function () {
                            Lampa.Controller.collectionSet(render);
                            Lampa.Controller.follow('settings_head_manager');
                        },
                        up: function () { Lampa.Navigator.move('up'); },
                        down: function () { Lampa.Navigator.move('down'); },
                        back: function () { Lampa.Settings.main().render(); }
                    });

                    Lampa.Controller.toggle('settings_head_manager');
                });

                // Добавляем в конец списка настроек
                e.body.find('.scroll').append(item);
            }
        });

        // Применяем при запуске
        applyChanges();
    }

    // Инициализация
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
