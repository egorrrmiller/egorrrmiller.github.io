(function () {
    'use strict';

    function initReboot() {
        // SVG иконка перезагрузки
        var icon = '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></svg>';
        
        // Создаем элемент кнопки
        var button = $('<div id="reboot-plugin" class="head__action selector">' + icon + '</div>');

        // Обработка нажатия (для пультов и мыши)
        button.on('hover:enter hover:click hover:touch', function() {
            window.location.reload();
        });

        // Добавляем в панель (используем путь из вашего рабочего примера)
        $('#app > div.head > div > div.head__actions').append(button);

        // Обновляем навигацию Lampa, чтобы пульт "увидел" новую кнопку
        if (window.Lampa && Lampa.Head) {
            Lampa.Head.update();
        }
    }

    // Запуск плагина после готовности приложения
    if (window.appready) {
        initReboot();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initReboot();
        });
    }
})();
