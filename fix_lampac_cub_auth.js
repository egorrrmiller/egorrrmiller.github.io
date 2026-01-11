(function () {
    'use strict';

    function injectCustomButtons() {
        try {
            var keyboard = $('.simple-keyboard');
            if (keyboard.length && !keyboard.find('.my-custom-buttons').length) {
                
                var $buttons = $(
                    '<div class="simple-keyboard-buttons my-custom-buttons">' +
                        '<div class="simple-keyboard-buttons__enter selector" style="pointer-events: all; cursor: pointer; background: #00ff402e; padding: 10px; margin: 5px; border-radius: 5px;">Готово</div>' +
                        '<div class="simple-keyboard-buttons__cancel selector" style="pointer-events: all; cursor: pointer; background: #ff00002e; padding: 10px; margin: 5px; border-radius: 5px;">Отменить</div>' +
                    '</div>'
                );

                $buttons.find('.simple-keyboard-buttons__enter').on('click', function (e) {
                    try {
                        // Находим поле ввода
                        var input = document.querySelector('.simple-keyboard-input') || document.querySelector('#orsay-keyboard');
                        
                        if (input) {
                            // 1. Убираем фокус, чтобы данные сохранились в value
                            input.blur();

                            // 2. Создаем честное событие нажатия Enter
                            var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                            var down = new KeyboardEvent('keydown', eventParams);
                            var up = new KeyboardEvent('keyup', eventParams);

                            // 3. Стреляем по документу и по инпуту
                            input.dispatchEvent(down);
                            document.dispatchEvent(down);
                            
                            input.dispatchEvent(up);
                            document.dispatchEvent(up);

                            console.log('Lampa Plugin: Autonomous Native Enter Dispatched');
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
