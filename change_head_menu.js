(function () {
    'use strict';

    // 1. Настройки плагина и параметры
    // Мы используем тот же метод addParam, что и в tricks.js
    Lampa.SettingsApi.addParam({
        component: 'extended_header',
        param: {
            name: 'header_reboot_btn',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Кнопка перезагрузки',
            description: 'Отображать кнопку обновления страницы'
        },
        onChange: function (value) {
            updateHeader();
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'extended_header',
        param: {
            name: 'header_native_notify',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Уведомления',
            description: 'Стандартный колокольчик'
        },
        onChange: function (value) {
            updateHeader();
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'extended_header',
        param: {
            name: 'header_native_profile',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Профиль',
            description: 'Иконка входа в профиль'
        },
        onChange: function (value) {
            updateHeader();
        }
    });

    // 2. Основная функция обновления шапки
    // Вызывается при старте и при каждом изменении настроек
    function updateHeader() {
        // --- КНОПКА ПЕРЕЗАГРУЗКИ ---
        var reboot_btn = $('#header_reboot_btn');
        
        // Если кнопки нет в DOM, создаем её
        if (!reboot_btn.length) {
            var html = '<div id="header_reboot_btn" class="head__action selector">' +
                '<svg fill="#fff" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,23A11,11,0,1,0,1,12,11.013,11.013,0,0,0,12,23ZM12,3a9,9,0,1,1-9,9A9.01,9.01,0,0,1,12,3ZM8.293,14.293,10.586,12,8.293,9.707A1,1,0,0,1,9.707,8.293L12,10.586l2.293-2.293a1,1,0,0,1,1.414,1.414L13.414,12l2.293,2.293a1,1,0,1,1-1.414,1.414L12,13.414,9.707,15.707a1,1,0,0,1-1.414-1.414Z" fill="currentColor"/></svg>' +
                '</div>';
            
            // Вставляем в шапку (селектор из tricks.js)
            $('.head .head__actions').append(html);
            
            reboot_btn = $('#header_reboot_btn');
            
            // Вешаем событие
            reboot_btn.on('hover:enter click', function () {
                window.location.reload();
            });
        }

        // Проверяем настройку и скрываем/показываем (используем Lampa.Storage.field как в tricks)
        if (Lampa.Storage.field('header_reboot_btn')) {
            reboot_btn.removeClass('hide');
        } else {
            reboot_btn.addClass('hide');
        }

        // --- РОДНЫЕ КНОПКИ ---
        var notify = $('.head__action.head__action--notifications');
        var profile = $('.head__action.head__action--profile');

        if (Lampa.Storage.field('header_native_notify')) notify.removeClass('hide');
        else notify.addClass('hide');

        if (Lampa.Storage.field('header_native_profile')) profile.removeClass('hide');
        else profile.addClass('hide');
        
        // Обновляем навигацию пульта
        if(window.Lampa && Lampa.Head) Lampa.Head.update();
    }

    // 3. Внедрение пункта в меню настроек
    // Точная копия логики слушателя из tricks.js
    function startPlugin() {
        // Запускаем применение настроек сразу
        updateHeader();

        Lampa.Settings.listener.follow('open', function (e) {
            // Проверяем, что открыто главное меню настроек
            if (e.name == 'main') {
                // Создаем элемент меню
                var item = $(
                    '<div class="settings-folder selector" data-component="extended_header">' +
                        '<div class="settings-folder__icon">' +
                            '<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>' +
                        '</div>' +
                        '<div class="settings-folder__name">Верхняя панель</div>' +
                    '</div>'
                );

                // Обработка нажатия на пункт
                item.on('hover:enter', function () {
                    // 1. Очищаем текущий список настроек
                    var scroll = Lampa.Settings.main().render().find('.scroll');
                    
                    // 2. Рендерим наши параметры (component: 'extended_header')
                    var params_list = Lampa.SettingsApi.render({
                        component: 'extended_header'
                    });

                    // 3. Сохраняем текущее состояние для возврата (логика tricks)
                    // (Здесь упрощено: просто заменяем контент)
                    scroll.find('.scroll__content').empty().append(params_list);

                    // 4. Переключаем контроллер пульта на новые кнопки
                    Lampa.Controller.add('extended_header_controller', {
                        toggle: function () {
                            Lampa.Controller.collectionSet(scroll);
                            Lampa.Controller.follow('extended_header_controller');
                        },
                        up: function () {
                            Lampa.Navigator.move('up');
                        },
                        down: function () {
                            Lampa.Navigator.move('down');
                        },
                        back: function () {
                            // При нажатии назад - перерисовываем главное меню
                            Lampa.Settings.main().render();
                        }
                    });

                    Lampa.Controller.toggle('extended_header_controller');
                });

                // Добавляем пункт в конец списка
                e.body.find('.scroll').append(item);
            }
        });
    }

    // Инициализация (стандартная для Lampa)
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') startPlugin();
        });
    }

})();
