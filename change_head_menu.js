(function () {
    'use strict';

    // 1. Создаем раздел в меню настроек
    Lampa.SettingsApi.addComponent({
        component: 'header_ui_tweaks',
        name: 'Верхняя панель',
        icon: '<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>'
    });

    // 2. Добавляем параметры
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_reboot_enabled', type: 'trigger', default: true },
        field: { name: 'Кнопка перезагрузки', description: 'Показать кнопку обновления страницы' },
        onChange: applySettings
    });

    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_fullscreen_enabled', type: 'trigger', default: true },
        field: { name: 'Полноэкранный режим', description: 'Показать иконку развертывания (full--screen)' },
        onChange: applySettings
    });

    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_notify_enabled', type: 'trigger', default: true },
        field: { name: 'Уведомления', description: 'Показать колокольчик (notice--icon)' },
        onChange: applySettings
    });

    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: { name: 'head_profile_enabled', type: 'trigger', default: true },
        field: { name: 'Профиль', description: 'Показать иконку входа (open--profile)' },
        onChange: applySettings
    });

    // 3. Основная логика работы
    function applySettings() {
        // --- Кнопка Перезагрузки (Кастомная) ---
        var reboot_btn = $('#custom_reboot_icon');
        if (Lampa.Storage.field('head_reboot_enabled')) {
            if (!reboot_btn.length) {
                var html = '<div id="custom_reboot_icon" class="head__action selector">' +
                    '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19.9383 13C19.9723 12.671 20 12.3394 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C12.3394 20 12.671 19.9723 13 19.9383M13 19.9383V16M13 19.9383L15 17.9383M13 19.9383L11 17.9383" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>' +
                    '</div>';
                $('.head .head__actions').prepend(html);
                $('#custom_reboot_icon').on('hover:enter click', function () { window.location.reload(); });
            }
            $('#custom_reboot_icon').removeClass('hide');
        } else {
            $('#custom_reboot_icon').addClass('hide');
        }

        // --- Управление штатными кнопками по вашим селекторам ---
        
        // Полноэкранный режим (full--screen)
        if (Lampa.Storage.field('head_fullscreen_enabled')) {
            $('.full--screen').removeClass('hide');
        } else {
            $('.full--screen').addClass('hide');
        }

        // Уведомления (notice--icon)
        if (Lampa.Storage.field('head_notify_enabled')) {
            $('.notice--icon').removeClass('hide');
        } else {
            $('.notice--icon').addClass('hide');
        }

        // Профиль (open--profile)
        if (Lampa.Storage.field('head_profile_enabled')) {
            $('.open--profile').removeClass('hide');
        } else {
            $('.open--profile').addClass('hide');
        }

        // Синхронизируем навигацию (чтобы пульт не перескакивал через скрытые кнопки)
        if(window.Lampa && Lampa.Head) Lampa.Head.update();
    }

    // 4. Запуск плагина
    if (window.appready) applySettings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') applySettings();
        });
    }

})();
