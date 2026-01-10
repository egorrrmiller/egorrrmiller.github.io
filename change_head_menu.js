(function () {
    'use strict';

    // 1. Создаем раздел в меню настроек
    Lampa.SettingsApi.addComponent({
        component: 'header_ui_tweaks',
        name: 'Верхняя панель',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    });

    // 2. Добавляем параметры (настройки)
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_reboot_enabled', type: 'trigger', default: true },
        field: { name: 'Кнопка перезагрузки', description: 'Показать кнопку обновления страницы' },
        onChange: applySettings
    });

    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_search_enabled', type: 'trigger', default: true },
        field: { name: 'Поиск', description: 'Показать иконку поиска (open--search)' },
        onChange: applySettings
    });

    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_fullscreen_enabled', type: 'trigger', default: true },
        field: { name: 'Полноэкранный режим', description: 'Показать иконку развертывания' },
        onChange: applySettings
    });

    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_notify_enabled', type: 'trigger', default: true },
        field: { name: 'Уведомления', description: 'Показать колокольчик' },
        onChange: applySettings
    });

    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_profile_enabled', type: 'trigger', default: true },
        field: { name: 'Профиль', description: 'Показать иконку входа' },
        onChange: applySettings
    });

    // 3. Основная логика применения настроек
    function applySettings() {
        // --- Кнопка Перезагрузки (Ваша новая иконка) ---
        var reboot_btn = $('#custom_reboot_icon');
        if (Lampa.Storage.field('head_reboot_enabled')) {
            if (!reboot_btn.length) {
                var html = '<div id="custom_reboot_icon" class="head__action selector">' +
                    '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48" style="width: 1.5em; height: 1.5em;">' +
                    '<g id="SVGRepo_bgCarrier" stroke-width="0"></g>' +
                    '<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>' +
                    '<g id="SVGRepo_iconCarrier">' +
                    '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>' +
                    '</g></svg>' +
                    '</div>';
                
                $('.head .head__actions').prepend(html);
                
                reboot_btn = $('#custom_reboot_icon');
                reboot_btn.on('hover:enter click', function () { 
                    window.location.reload(); 
                });
            }
            reboot_btn.removeClass('hide');
        } else {
            reboot_btn.addClass('hide');
        }

        // --- Управление штатными кнопками (через селекторы) ---
        
        // Поиск
        if (Lampa.Storage.field('head_search_enabled')) $('.open--search').removeClass('hide');
        else $('.open--search').addClass('hide');

        // Полноэкранный режим
        if (Lampa.Storage.field('head_fullscreen_enabled')) $('.full--screen').removeClass('hide');
        else $('.full--screen').addClass('hide');

        // Уведомления
        if (Lampa.Storage.field('head_notify_enabled')) $('.notice--icon').removeClass('hide');
        else $('.notice--icon').addClass('hide');

        // Профиль
        if (Lampa.Storage.field('head_profile_enabled')) $('.open--profile').removeClass('hide');
        else $('.open--profile').addClass('hide');

        // Обновляем Head, чтобы Lampa пересчитала доступные кнопки для пульта
        if(window.Lampa && Lampa.Head) Lampa.Head.update();
    }

    // 4. Инициализация
    if (window.appready) applySettings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') applySettings();
        });
    }
})();
