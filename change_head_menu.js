(function () {
    'use strict';

    // 1. Создаем раздел в меню настроек (ОФИЦИАЛЬНЫЙ МЕТОД)
    Lampa.SettingsApi.addComponent({
        component: 'header_ui_tweaks', // Уникальный ID компонента
        name: 'Верхняя панель',        // Название пункта в меню
        icon: '<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>'
    });

    // 2. Добавляем параметры в этот раздел
    
    // --- Параметр 1: Кнопка перезагрузки ---
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: {
            name: 'head_reboot_enabled',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Кнопка перезагрузки',
            description: 'Показать кнопку обновления страницы'
        },
        onChange: applySettings // При изменении вызываем функцию применения
    });

    // --- Параметр 2: Уведомления ---
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: {
            name: 'head_notify_enabled',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Уведомления',
            description: 'Показать стандартный колокольчик'
        },
        onChange: applySettings
    });

    // --- Параметр 3: Профиль ---
    Lampa.SettingsApi.addParam({
        component: 'header_ui_tweaks',
        param: {
            name: 'head_profile_enabled',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Профиль',
            description: 'Показать иконку входа'
        },
        onChange: applySettings
    });

    // 3. Основная логика работы (Скрытие/Показ элементов)
    function applySettings() {
        // --- Логика для кнопки Перезагрузки ---
        var reboot_btn = $('#custom_reboot_icon');
        
        // Если кнопки еще нет - создаем её
        if (Lampa.Storage.field('head_reboot_enabled')) {
            if (!reboot_btn.length) {
                var html = '<div id="custom_reboot_icon" class="head__action selector">' +
                    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12C2.5 17.25 6.75 21.5 12 21.5C17.25 21.5 21.5 17.25 21.5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2.5V6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 2.5L12 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                    '</div>';
                
                // Вставляем перед другими иконками
                $('.head .head__actions').prepend(html);
                
                // Вешаем клик
                $('#custom_reboot_icon').on('hover:enter click', function () {
                    window.location.reload();
                });
            }
            $('#custom_reboot_icon').removeClass('hide');
        } else {
            $('#custom_reboot_icon').addClass('hide');
        }

        // --- Логика для стандартных кнопок ---
        // Уведомления
        if (Lampa.Storage.field('head_notify_enabled')) {
            $('.head__action--notifications').removeClass('hide');
        } else {
            $('.head__action--notifications').addClass('hide');
        }

        // Профиль
        if (Lampa.Storage.field('head_profile_enabled')) {
            $('.head__action--profile').removeClass('hide');
        } else {
            $('.head__action--profile').addClass('hide');
        }

        // Обновляем навигацию пульта в шапке
        if(window.Lampa && Lampa.Head) Lampa.Head.update();
    }

    // 4. Запуск при старте приложения
    if (window.appready) applySettings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') applySettings();
        });
    }

})();
