(function () {
    'use strict';

    function init() {
        // 1. Регистрируем параметры в Storage
        Lampa.SettingsApi.addParam({
            component: 'head_custom',
            param: { name: 'head_reboot', type: 'trigger', default: true },
            field: { name: 'Кнопка перезагрузки', description: 'Показать/скрыть иконку перезагрузки' },
            onChange: apply
        });

        Lampa.SettingsApi.addParam({
            component: 'head_custom',
            param: { name: 'head_notifications', type: 'trigger', default: true },
            field: { name: 'Уведомления', description: 'Показать/скрыть колокольчик' },
            onChange: apply
        });

        Lampa.SettingsApi.addParam({
            component: 'head_custom',
            param: { name: 'head_profile', type: 'trigger', default: true },
            field: { name: 'Профиль', description: 'Показать/скрыть иконку профиля' },
            onChange: apply
        });

        // 2. Функция применения видимости
        function apply() {
            // Кнопка перезагрузки
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

            // Стандартные кнопки
            if (Lampa.Storage.field('head_notifications')) $('.head__action--notifications').removeClass('hide');
            else $('.head__action--notifications').addClass('hide');

            if (Lampa.Storage.field('head_profile')) $('.head__action--profile').removeClass('hide');
            else $('.head__action--profile').addClass('hide');

            if (window.Lampa && Lampa.Head) Lampa.Head.update();
        }

        // 3. Создаем компонент для отрисовки нашего окна настроек
        Lampa.Component.add('head_custom', function (object) {
            var comp = this;
            this.create = function () {
                var scroll = Lampa.Template.get('scroll');
                var list = Lampa.SettingsApi.render({ component: 'head_custom' });
                
                scroll.find('.scroll__content').append(list);
                this.element = scroll;
            };
            this.render = function () {
                return this.element;
            };
        });

        // 4. Добавляем пункт в главное меню настроек
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') {
                var item = $('<div class="settings-folder selector" data-component="head_custom">' +
                    '<div class="settings-folder__icon"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.81,11.69,4.81,12c0,0.31,0.02,0.65,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg></div>' +
                    '<div class="settings-folder__name">Верхняя панель</div>' +
                '</div>');

                // Обработка входа в наш пункт
                item.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: '',
                        title: 'Верхняя панель',
                        component: 'head_custom',
                        page: 1
                    });
                });

                e.body.find('.scroll__content').append(item);
            }
        });

        apply();
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
