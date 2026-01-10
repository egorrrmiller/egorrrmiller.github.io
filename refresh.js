(function () {

    function addButton() {
        // проверяем контейнер
        let actions = $('#app > div.head > div > div.head__actions');

        if (!actions.length) return;

        // уже есть кнопка — выходим
        if ($('#RELOAD').length) return;

        // Код кнопки
        var my_reload = `
        <div id="RELOAD" class="head__action selector reload-screen">
            <svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.4800000000000001">
            <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>
            </svg>
        </div>`;

        // в самый конец панели
        actions.append(my_reload);

        // события OK/Click
        $('#RELOAD').on('hover:enter hover:click hover:touch', function () {
            location.reload();
        });

        // (опционально) чтение настройки видимости
        if (Lampa.Storage.field('Reloadbutton') === false) {
            $('#RELOAD').addClass('hide');
        }
    }

    function init() {
        addButton();

        // реакция на смену экранов
        Lampa.Listener.follow('app', addButton);

        // на случай поздней загрузки DOM
        let tries = 0;
        let timer = setInterval(function () {
            addButton();
            tries++;
            if (tries > 30) clearInterval(timer);
        }, 300);
    }

    Lampa.Plugin.create('reload-topbar', init);

})();
