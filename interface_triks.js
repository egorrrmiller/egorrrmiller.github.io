(function () {
    'use strict';

    function applySettings() {
        document.body.classList.add('mouse-enabled');

        // Наведение — перенос фокуса
        document.addEventListener('mousemove', e => {
            const hover = e.target.closest('[data-film], [data-uid], .selector, .focusable, a, button');
            if (!hover) return;

            const cur = document.querySelector('.focus');
            if (cur && cur !== hover) cur.classList.remove('focus');
            hover.classList.add('focus');
        });

        // Клик -> hover:enter
        document.addEventListener('click', e => {
            const target = e.target.closest('[data-film], [data-uid], .selector, .focusable, a, button');
            if (!target) return;

            e.preventDefault();
            e.stopPropagation();

            Lampa.Utils.trigger(target, 'hover:enter');
        });

        // Отключаем навигацию колесом
        document.addEventListener('wheel', e => {
            Controller.block('wheel_block');
            setTimeout(() => Controller.unblock('wheel_block'), 100);

            e.stopImmediatePropagation();
        }, { passive: true });

        console.log('[LAMPA] Mouse mode enabled');
    }

    // Сначала проверяем — Lampa уже готова?
    if (window.appready) {
        applySettings();
    } 
    else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') applySettings();
        });
    }

})();
