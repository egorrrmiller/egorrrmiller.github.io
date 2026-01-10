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
                    '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' +
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
