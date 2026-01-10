(function () {
    'use strict';

    function applySettings() {
        document.body.classList.add('mouse-enabled');

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

        const wheelStop = e => {
            e.stopImmediatePropagation();
        };
        window.addEventListener('wheel', wheelStop, { passive: true, capture: true });
        window.addEventListener('mousewheel', wheelStop, { passive: true, capture: true });

        if (!Controller._mousePatchApplied) {
            Controller._mousePatchApplied = true;
            const orig = Controller.move;
            Controller.move = function (dir) {
                if (dir === 'left' || dir === 'right') return;
                return orig.apply(this, arguments);
            };
        }

        console.log('[LAMPA] Mouse mode (arrows blocked) active');
    }

    if (window.appready) {
        applySettings();
    } 
    else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') applySettings();
        });
    }
})();
