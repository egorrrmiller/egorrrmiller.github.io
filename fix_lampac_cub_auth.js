(function () {
    'use strict';

    function inject() {
        var keyboard = $('.simple-keyboard');
        
        // Если клавиатура есть в DOM
        if (keyboard.length) {
            // Если кнопки уже добавлены, ничего не делаем
            if (keyboard.find('.simple-keyboard-buttons').length) return;

            // Пробуем получить объект ввода
            var _this = Lampa.Input.active ? Lampa.Input.active() : null;

            // Если объект еще не готов — ждем 50мс и пробуем снова (цикл до победного)
            if (!_this || !_this.listener) {
                setTimeout(inject, 50);
                return;
            }

            var input = keyboard.find('#orsay-keyboard');
            var Lang = Lampa.Lang;
            var Controller = Lampa.Controller;

            // --- ТВОЙ КОД (CTRL+C / CTRL+V) ---
            var buttons = $('<div class="simple-keyboard-buttons"><div class="simple-keyboard-buttons__enter">' + Lang.translate('ready') + '</div><div class="simple-keyboard-buttons__cancel">' + Lang.translate('cancel') + '</div></div>');
            
            buttons.find('.simple-keyboard-buttons__enter').on('click', function () {
                input.blur();

                _this.listener.send('enter');
            });
            
            buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                _this.value('');

                Controller.back();
            });

            keyboard.append(buttons);
            // --- КОНЕЦ ТВОЕГО КОДА ---

            // Добавляем селекторы для управления
            buttons.find('div').addClass('selector');
            if (Controller.update) Controller.update();
        }
    }

    // Следим за DOM
    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length) inject();
        }
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
