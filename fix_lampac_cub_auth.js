(function () {
    'use strict';

    // Добавляем стили для визуального выделения (Пульт + Мышь)
    var style = $('<style>' +
        '.simple-keyboard-buttons { display: flex; gap: 10px; margin-top: 10px; padding: 5px; }' +
        '.simple-keyboard-buttons .selector { ' +
            'padding: 10px 20px; border-radius: 5px; background: rgba(255,255,255,0.05); ' +
            'transition: all 0.2s; cursor: pointer; text-align: center; flex: 1; ' +
        '}' +
        /* Подсветка при наведении мышкой */
        '.simple-keyboard-buttons .selector:hover { background: rgba(255,255,255,0.15); }' +
        /* Подсветка когда на кнопку встал ПУЛЬТ (класс .focus добавляет Lampa) */
        '.simple-keyboard-buttons .selector.focus { ' +
            'background: #fff !important; color: #000 !important; transform: scale(1.05); ' +
        '}' +
    '</style>');
    $('head').append(style);

    function inject() {
        try {
            var keyboard = $('.simple-keyboard');
            if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
                
                var $buttons = $(
                    '<div class="simple-keyboard-buttons">' +
                        '<div class="simple-keyboard-buttons__enter selector" nav-selectable="true">Готово</div>' +
                        '<div class="simple-keyboard-buttons__cancel selector" nav-selectable="true">Отменить</div>' +
                    '</div>'
                );

                var doEnter = function() {
                    var input = document.activeElement;
                    if (input && input.tagName === 'INPUT') input.blur();

                    var ev = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
                    document.dispatchEvent(ev);
                    if (input) input.dispatchEvent(ev);
                };

                // События как в твоем плагине для верхней панели
                $buttons.find('.simple-keyboard-buttons__enter').on('hover:enter click', function (e) {
                    e.preventDefault();
                    doEnter();
                });

                $buttons.find('.simple-keyboard-buttons__cancel').on('hover:enter click', function (e) {
                    e.preventDefault();
                    if (window.Lampa && Lampa.Controller) Lampa.Controller.back();
                });

                keyboard.append($buttons);

                if (window.Lampa && window.Lampa.Controller) {
                    Lampa.Controller.update();
                    var active = Lampa.Controller.enabled();
                    if (active && active.name === 'keyboard' && active.render) {
                        active.render();
                    }
                }
            }
        } catch (e) {
            console.error('Keyboard Tweaks Error:', e);
        }
    }

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.addedNodes.length) inject();
        });
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            inject();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
