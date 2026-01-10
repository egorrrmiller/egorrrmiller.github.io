(function () {
    'use strict';

    function rebootPlugin() {
        // Ждем, пока Lampa полностью загрузится
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                // Создаем иконку и функционал
                var button = $(
                    '<div class="head__action head__action--reboot selector">' +
                        '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' +
                    '</div>'
                );

                // Обработчик нажатия
                button.on('hover:enter', function () {
                    window.location.reload();
                });

                // Добавляем кнопку в правую часть верхнего меню (перед поиском или настройками)
                $('.head .head__actions').prepend(button);
            }
        });
    }

    // Регистрация плагина в системе Lampa
    if (window.appready) rebootPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') rebootPlugin();
        });
    }
})();
