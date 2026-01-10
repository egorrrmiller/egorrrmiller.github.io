(function () {
    'use strict';

    function initCustomHead() {
        // --- 1. ПАРАМЕТРЫ В STORAGE ---
        Lampa.SettingsApi.addParam({
            component: 'head_settings',
            param: { name: 'head_reboot', type: 'trigger', default: true },
            field: { name: 'Кнопка перезагрузки', description: 'Показать/скрыть иконку перезагрузки' },
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

        // --- 2. ЛОГИКА ВИДИМОСТИ ---
        function applyVisibility() {
            // Перезагрузка
            if (Lampa.Storage.field('head_reboot')) {
                if (!$('#RELOAD_BTN').length) {
                    var icon = '<div id="RELOAD_BTN" class="head__action selector"><svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></svg></div>';
                    $('#app > div.head > div > div.head__actions').append(icon);
                    $('#RELOAD_BTN').on('hover:enter hover:click hover:touch', function() {
                        location.reload();
                    });
                }
                $('#RELOAD_BTN').removeClass('hide');
            } else {
                $('#RELOAD_BTN').addClass('hide');
            }

            // Уведомления и Профиль
            if (Lampa.Storage.field('head_notifications')) $('.head__action--notifications').removeClass('hide');
            else $('.head__action--notifications').addClass('hide');

            if (Lampa.Storage.field('head_profile')) $('.head__action--profile').removeClass('hide');
            else $('.head__action--profile').addClass('hide');

            if (window.Lampa && Lampa.Head) Lampa.Head.update();
        }

        // --- 3. ВНЕДРЕНИЕ В МЕНЮ НАСТРОЕК ---
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                var item = $('<div class="settings-folder selector" data-component="head_settings">' +
                    '<div class="settings-folder__icon"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg></div>' +
                    '<div class="settings-folder__name">Верхняя панель</div>' +
                '</div>');

                item.on('hover:enter', function () {
                    // Отрисовка подменю
                    var body = Lampa.Settings.main().render();
                    body.find('.scroll').empty().append(Lampa.SettingsApi.render({component: 'head_settings'}));
                    
                    // Передаем управление контроллеру (чтобы работал пульт)
                    Lampa.Controller.add('settings_head', {
                        toggle: function () {
                            Lampa.Controller.collectionSet(body);
                            Lampa.Controller.follow('settings_head');
                        },
                        up: function () { Lampa.Navigator.move('up'); },
                        down: function () { Lampa.Navigator.move('down'); },
                        back: function () { Lampa.Settings.main().render(); }
                    });
                    Lampa.Controller.toggle('settings_head');
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
