(function () {
    'use strict';

    function enableMouse() {
        document.body.classList.add('mouse-enabled');

        // Наведение – ставим focus
        document.addEventListener('mousemove', e => {
            const hover = e.target.closest('[data-film], [data-uid], .selector, .focusable, a, button');
            if (!hover) return;

            const cur = document.querySelector('.focus');
            if (cur && cur !== hover) cur.classList.remove('focus');

            hover.classList.add('focus');
        });

        // Клик – эквивалент ENTER
        document.addEventListener('click', e => {
            const target = e.target.closest('[data-film], [data-uid], .selector, .focusable, a, button');
            if (!target) return;

            e.preventDefault();
            e.stopPropagation();

            Lampa.Utils.trigger(target, 'hover:enter');
        });

        // Отключаем авто-скролл навигации колёсиком
        document.addEventListener('wheel', e => {
            e.stopPropagation();
        }, { passive: true });

        console.log('[LAMPA] Mouse control ready');
    }

    // Вешаемся когда Lampa прогрузилась
     if (window.appready) applySettings();
    else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') enableMouse();
        });
    }
})();
