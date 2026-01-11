(function () {
    'use strict';

    function injectCustomButtons() {
        var keyboard = $('.simple-keyboard');
        
        if (keyboard.length && !keyboard.find('.my-custom-buttons').length) {
            var $buttons = $(
                '<div class="simple-keyboard-buttons my-custom-buttons">' +
                    '<div class="simple-keyboard-buttons__enter selector" style="pointer-events: all; cursor: pointer;">Готово</div>' +
                    '<div class="simple-keyboard-buttons__cancel selector" style="pointer-events: all; cursor: pointer;">Отменить</div>' +
                '</div>'
            );

            // ОБРАБОТЧИК КНОПКИ "ГОТОВО"
            $buttons.find('.simple-keyboard-buttons__enter').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $input = keyboard.find('input');
                var val = $input.val(); // Забираем текст из инпута

                console.log('Plugin: Preparing to submit value:', val);

                // 1. Принудительно вызываем событие завершения ввода на инпуте
                $input.trigger($.Event('keydown', { keyCode: 13, which: 13 }));
                $input.blur();

                // 2. Если в Lampa активен объект Input, отправляем данные через его слушатель
                if (window.Lampa && window.Lampa.Input && window.Lampa.Input.active) {
                    var activeInput = window.Lampa.Input.active();
                    if (activeInput && activeInput.listener) {
                        activeInput.listener.send('enter', { value: val });
                    }
                }

                // 3. Универсальный способ - закрыть клавиатуру через контроллер
                // В Lampa это часто триггерит сохранение данных
                if (window.Lampa && window.Lampa.Input && window.Lampa.Input.close) {
                    window.Lampa.Input.close();
                }
            });

            // ОБРАБОТЧИК КНОПКИ "ОТМЕНИТЬ"
            $buttons.find('.simple-keyboard-buttons__cancel').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.Lampa && window.Lampa.Controller) {
                    window.Lampa.Controller.back();
                }
            });

            keyboard.append($buttons);

            if (window.Lampa && window.Lampa.Controller) {
                window.Lampa.Controller.update();
            }
        }
    }

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) injectCustomButtons();
        });
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            injectCustomButtons();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
