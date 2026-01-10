(function () {
    'use strict';

    function applySettings() {
        document.body.classList.add('mouse-enabled');

        /** --- НОРМАЛЬНЫЙ МЫШИНЫЙ ФОКУС --- **/
        document.addEventListener('mousemove', e => {
            const hover = e.target.closest('[data-film], [data-uid], .selector, .focusable, a, button');
            if (!hover) return;

            const cur = document.querySelector('.focus');
            if (cur && cur !== hover) cur.classList.remove('focus');
            hover.classList.add('focus');
        });

        document.addEventListener('click', e => {
            const target = e.target.closest('[data-film], [data-uid], .selector, .focusable, a, button');
            if (!target) return;

            e.preventDefault();
            e.stopPropagation();
            Lampa.Utils.trigger(target, 'hover:enter');
        });

        /** --- 1. БЛОКИРУЕМ ВСЁ, ЧТО МОЖЕТ ДАТЬ move() --- **/
        const wheelBlocker = e => {
            // Оставляем нативный scroll браузеру
            e.stopImmediatePropagation();    // самое важное
        };

        window.addEventListener('wheel', wheelBlocker, { passive: true, capture: true });
        window.addEventListener('mousewheel', wheelBlocker, { passive: true, capture: true });
        window.addEventListener('DOMMouseScroll', wheelBlocker, { passive: true, capture: true });

        /** --- 2. ИЗБИВАЕМ scroll-to-focus у контейнеров --- **/
        document.addEventListener('scroll', e => {
            const cur = document.querySelector('.focus');
            if (cur) cur.classList.add('focus');
        }, true);   // важно: логируем на захвате

        /** --- 3. Деактивируем wheel-драйвер внутри контроллера --- **/
        if (Controller && Controller.move) {
            // запоминаем
            Controller._wheelPatch = Controller.move;
            // подменяем движок
            Controller.move = function (dir) {
                // пропускаем всё, что не мышь
                if (dir === 'up' || dir === 'down' || dir === 'left' || dir === 'right') return;
                return Controller._wheelPatch.apply(this, arguments);
            };
        }

        console.log('[LAMPA] ✨ Full mouse mode enabled (all directional wheel nav suppressed)');
    }

    /** порядок — как ты хотел **/
    if (window.appready) {
        applySettings();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') applySettings();
        });
    }

})();
