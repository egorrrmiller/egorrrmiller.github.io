(function () {
    'use strict';

    const plugin = {};

    plugin.id = 'mouse_control';
    plugin.version = '1.0.0';
    plugin.name = 'Mouse Control';
    plugin.description = 'Добавляет нормальное управление мышью';
    plugin.author = 'ChatGPT';

    /**
     * Основной режим LAMPA – управление по фокусу с клавиатуры.
     * Ниже перехватываем мышь и вручную ставим фокус на элемент.
     */
    function initMouseSupport() {
        document.body.classList.add('mouse-enabled');

        // Наведение — просто подсвечиваем
        document.addEventListener('mousemove', e => {
            const hover = e.target.closest('[data-film], [data-uid], .selector, .focusable, a, button');
            if (!hover) return;

            // Убираем предыдущий фокус
            const current = document.querySelector('.focus');
            if (current && current !== hover) current.classList.remove('focus');

            hover.classList.add('focus');
        });

        // Клик → нажимаем ENTER для элемента
        document.addEventListener('click', e => {
            const target = e.target.closest('[data-film], [data-uid], .selector, .focusable, a, button');
            if (!target) return;
            e.preventDefault();
            e.stopPropagation();

            // Сгенерировать ENTER для совместимости
            const evt = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13 });
            target.dispatchEvent(evt);
        });

        // Колёсико — не передаём в scroll-навигацию
        document.addEventListener('wheel', e => {
            e.stopPropagation();
        }, { passive: true });
    }

    plugin.run = function () {
        initMouseSupport();
        console.log('[LAMPA] Mouse Control enabled');
    };

    Lampa.Plugins.add(plugin);
    Lampa.Plugins.listener.add(plugin.id, plugin.run);

})();
