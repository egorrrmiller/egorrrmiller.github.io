(function () {
    'use strict';

    // Регистрация раздела в меню настроек
    Lampa.SettingsApi.addComponent({
        component: 'header_ui_tweaks',
        name: 'Верхняя панель',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    });

    // Параметр: Кнопка перезагрузки
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_reboot_enabled', type: 'trigger', default: true },
        field: { name: 'Кнопка перезагрузки', description: 'Показать кнопку обновления страницы' },
        onChange: applySettings
    });

    // Параметр: Поиск
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_search_enabled', type: 'trigger', default: true },
        field: { name: 'Поиск', description: 'Показать иконку поиска' },
        onChange: applySettings
    });

    // Параметр: Полноэкранный режим
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_fullscreen_enabled', type: 'trigger', default: true },
        field: { name: 'Полноэкранный режим', description: 'Показать иконку развертывания' },
        onChange: applySettings
    });

    // Параметр: Уведомления
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_notify_enabled', type: 'trigger', default: true },
        field: { name: 'Уведомления', description: 'Показать колокольчик' },
        onChange: applySettings
    });

    // Параметр: Профиль
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_profile_enabled', type: 'trigger', default: true },
        field: { name: 'Профиль', description: 'Показать иконку входа' },
        onChange: applySettings
    });

    // Параметр: Транслировать
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_broadcast_enabled', type: 'trigger', default: true },
        field: { name: 'Трансляция', description: 'Показать иконку трансляции' },
        onChange: applySettings
    });

    function applySettings() {
        
        // Блок: Кнопка перезагрузки
        var reboot_btn = $('#custom_reboot_icon');
        if (Lampa.Storage.field('head_reboot_enabled')) {
            if (!reboot_btn.length) {
                var html = $('<div id="custom_reboot_icon" class="head__action selector">' +
                    '<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1.5em;">' +
                    '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>' +
                    '</svg></div>');
                $('.head .head__actions').append(html);
                html.on('hover:enter click', function () { window.location.reload(); });
                reboot_btn = html;
            }
            reboot_btn.removeClass('hide');
        } else {
            reboot_btn.addClass('hide');
        }

        // Блок: Поиск
        if (Lampa.Storage.field('head_search_enabled')) $('.open--search').removeClass('hide');
        else $('.open--search').addClass('hide');

        // Блок: Полноэкранный режим
        if (Lampa.Storage.field('head_fullscreen_enabled')) $('.full--screen').removeClass('hide');
        else $('.full--screen').addClass('hide');

        // Блок: Уведомления
        if (Lampa.Storage.field('head_notify_enabled')) $('.notice--icon').removeClass('hide');
        else $('.notice--icon').addClass('hide');

        // Блок: Профиль
        if (Lampa.Storage.field('head_profile_enabled')) $('.open--profile').removeClass('hide');
        else $('.open--profile').addClass('hide');

        // Блок: Трансляция
        if (Lampa.Storage.field('head_broadcast_enabled')) $('.open--broadcast').removeClass('hide');
        else $('.open--broadcast').addClass('hide');

        // Блок: Обновление навигации
        if (window.Lampa && Lampa.Head && typeof Lampa.Head.update === 'function') {
            Lampa.Head.update();
        }
    }

    // Инициализация плагина
    if (window.appready) applySettings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') applySettings();
        });
    }
})();
