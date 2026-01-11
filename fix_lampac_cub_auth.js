(function () {
    'use strict';

    function inject() {
        var keyboard = $('.simple-keyboard');
        
        if (keyboard.length && !keyboard.find('.my-browser-buttons').length) {
            
            // Создаем кнопки
            var buttons = $('<div class="simple-keyboard-buttons my-browser-buttons"><div class="simple-keyboard-buttons__enter selector">Готово</div><div class="simple-keyboard-buttons__cancel selector">Отменить</div></div>');
            
            // Функция для отправки нажатия клавиши в браузер
            var sendKey = function(keyCode) {
                var e = $.Event('keydown', { keyCode: keyCode, which: keyCode, bubbles: true });
                $(document).trigger(e);
            };

            // Кнопка Готово -> Жмем Enter
            buttons.find('.simple-keyboard-buttons__enter').on('click', function () {
                var input = $('.simple-keyboard').find('input');
                input.blur(); // Снимаем фокус
                sendKey(13);  // Код Enter
            });

            // Кнопка Отменить -> Жмем Escape
            buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                sendKey(27);  // Код Escape
            });

            keyboard.append(buttons);

            // Обновляем навигацию, чтобы кнопки были кликабельны
            if (window.Lampa && window.Lampa.Controller && window.Lampa.Controller.update) {
                window.Lampa.Controller.update();
            }
        }
    }

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) inject();
        });
    });

    function start() {
        if (window.appready) {
            observer.observe(document.body, { childList: true, subtree: true });
            inject();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
