(function () {
    'use strict';

    // Добавляем стили для выделения кнопок
    var style = $('<style>' +
        '.simple-keyboard-buttons .selector { cursor: pointer; transition: background 0.2s; }' +
        '.simple-keyboard-buttons .selector:hover { background: rgba(255, 255, 255, 0.1); }' +
        '.simple-keyboard-buttons__enter.selector:hover { background: rgba(0, 255, 0, 0.15); }' +
        '.simple-keyboard-buttons__cancel.selector:hover { background: rgba(255, 0, 0, 0.15); }' +
    '</style>');
    $('head').append(style);

    function injectCustomButtons() {
        try {
            var keyboard = $('.simple-keyboard');
            
            if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
                
                var $buttons = $(
                    '<div class="simple-keyboard-buttons">' +
                        '<div class="simple-keyboard-buttons__enter selector">Готово</div>' +
                        '<div class="simple-keyboard-buttons__cancel selector">Отменить</div>' +
                    '</div>'
                );

                $buttons.find('.simple-keyboard-buttons__enter').on('click', function (e) {
                    try {
                        var input = document.querySelector('.simple-keyboard-input') || document.querySelector('#orsay-keyboard');
                        if (input) {
                            input.blur();
                            var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                            var down = new KeyboardEvent('keydown', eventParams);
                            var up = new KeyboardEvent('keyup', eventParams);
                            input.dispatchEvent(down);
                            document.dispatchEvent(down);
                            input.dispatchEvent(up);
                            document.dispatchEvent(up);
                        }
                    } catch (err) {
                        console.error('Lampa Plugin: Error in Enter click:', err);
                    }
                });

                $buttons.find('.simple-keyboard-buttons__cancel').on('click', function (e) {
                    try {
                        if (window.Lampa && window.Lampa.Controller) {
                            window.Lampa.Controller.back();
                        }
                    } catch (err) {
                        console.error('Lampa Plugin: Error in Cancel click:', err);
                    }
                });

                keyboard.append($buttons);

                if (window.Lampa && window.Lampa.Controller && window.Lampa.Controller.update) {
                    window.Lampa.Controller.update();
                }
            }
        } catch (globalErr) {
            console.error('Lampa Plugin: Critical Error:', globalErr);
        }
    }

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) injectCustomButtons();
        });
    });

    function start() {
        if (window.appready) {
            observer.observe(document.body, { childList: true, subtree: true });
            injectCustomButtons();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
