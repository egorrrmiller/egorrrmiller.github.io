(function () {
    'use strict';

    function injectCustomButtons() {
        try {
            var keyboard = $('.simple-keyboard');
            
            // Если клавиатура в DOM есть, а стандартного блока кнопок еще нет
            if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
                
                // Создаем блок, используя стандартный класс Lampa
                var $buttons = $(
                    '<div class="simple-keyboard-buttons">' +
                        '<div class="simple-keyboard-buttons__enter selector">Готово</div>' +
                        '<div class="simple-keyboard-buttons__cancel selector">Отменить</div>' +
                    '</div>'
                );

                // Обработчик кнопки "Готово"
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

                            console.log('Lampa Plugin: Native Enter Dispatched');
                        }
                    } catch (err) {
                        console.error('Lampa Plugin: Error in Enter click:', err);
                    }
                });

                // Обработчик кнопки "Отменить"
                $buttons.find('.simple-keyboard-buttons__cancel').on('click', function (e) {
                    try {
                        if (window.Lampa && window.Lampa.Controller) {
                            window.Lampa.Controller.back();
                        }
                    } catch (err) {
                        console.error('Lampa Plugin: Error in Cancel click:', err);
                    }
                });

                // Добавляем кнопки в контейнер
                keyboard.append($buttons);

                // Регистрируем новые элементы в контроллере навигации
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
