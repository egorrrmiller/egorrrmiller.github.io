(function () {
    'use strict';

    function init() {
        // --- 1. ПАРАМЕТРЫ (Хранятся в Lampa) ---
        Lampa.SettingsApi.addParam({
            component: 'panel_settings',
            param: { name: 'head_reboot', type: 'trigger', default: true },
            field: { name: 'Кнопка перезагрузки', description: 'Показать иконку обновления страницы' },
            onChange: updatePanel
        });

        Lampa.SettingsApi.addParam({
            component: 'panel_settings',
            param: { name: 'head_notifications', type: 'trigger', default: true },
            field: { name: 'Уведомления', description: 'Показать стандартный колокольчик' },
            onChange: updatePanel
        });

        Lampa.SettingsApi.addParam({
            component: 'panel_settings',
            param: { name: 'head_profile', type: 'trigger', default: true },
            field: { name: 'Профиль', description: 'Показать иконку пользователя' },
            onChange: updatePanel
        });

        // --- 2. ЛОГИКА ПАНЕЛИ ---
        function updatePanel() {
            // Управление кнопкой перезагрузки
            if (Lampa.Storage.field('head_reboot')) {
                if (!$('#RELOAD_BUTTON').length) {
                    var btn = $('<div id="RELOAD_BUTTON" class="head__action selector"><svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:1.8em; height:1.8em;"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg></div>');
                    $('#app .head__actions').append(btn);
                    btn.on('hover:enter click', function() { location.reload(); });
                }
                $('#RELOAD_BUTTON').removeClass('hide');
            } else {
                $('#RELOAD_BUTTON').addClass('hide');
            }

            // Управление штатными кнопками
            if (Lampa.Storage.field('head_notifications')) $('.head__action--notifications').removeClass('hide');
            else $('.head__action--notifications').addClass('hide');

            if (Lampa.Storage.field('head_profile')) $('.head__action--profile').removeClass('hide');
            else $('.head__action--profile').addClass('hide');

            if (window.Lampa && Lampa.Head) Lampa.Head.update();
        }

        // --- 3. ВНЕДРЕНИЕ В НАСТРОЙКИ (СТИЛЬ TRICKS) ---
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') {
                // Используем setTimeout, чтобы Lampa не затерла наш пункт при отрисовке
                setTimeout(function () {
                    var scroll = e.body.find('.scroll');
                    if (scroll.length && !scroll.find('[data-component="panel_settings"]').length) {
                        var item = $('<div class="settings-folder selector" data-component="panel_settings">' +
                            '<div class="settings-folder__icon"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg></div>' +
                            '<div class="settings-folder__name">Верхняя панель</div>' +
                        '</div>');

                        item.on('hover:enter', function () {
                            // Отрисовка подменю (метод прямой подмены)
                            var list = Lampa.SettingsApi.render({ component: 'panel_settings' });
                            
                            // Сохраняем оригинальный контент, чтобы вернуться (эмуляция кнопки назад)
                            var original = scroll.find('.scroll__content').children();
                            scroll.find('.scroll__content').empty().append(list);

                            // Добавляем обработку пульта для подменю
                            Lampa.Controller.add('panel_settings_list', {
                                toggle: function () {
                                    Lampa.Controller.collectionSet(list);
                                    Lampa.Controller.follow('panel_settings_list');
                                },
                                up: Lampa.Navigator.move.bind(Lampa.Navigator, 'up'),
                                down: Lampa.Navigator.move.bind(Lampa.Navigator, 'down'),
                                back: function () {
                                    scroll.find('.scroll__content').empty().append(original);
                                    Lampa.Controller.toggle('settings'); // Возврат к основному контроллеру настроек
                                }
                            });
                            Lampa.Controller.toggle('panel_settings_list');
                        });

                        scroll.append(item);
                    }
                }, 10);
            }
        });

        updatePanel();
    }

    // Старт
    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
