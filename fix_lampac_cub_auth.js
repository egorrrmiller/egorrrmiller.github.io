(function () {
    'use strict';

    function inject() {
        var keyboard = $('.simple-keyboard');
        
        // Если клавиатура в DOM есть, а кнопок еще нет
        if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
            
            // Получаем объект ввода
            var _this = Lampa.Input.active ? Lampa.Input.active() : null;

            // Если объект еще не готов (undefined), не продолжаем, чтобы не было ошибки и зависания
            if (!_this || !_this.listener) return;

            var input = keyboard.find('#orsay-keyboard');
            var Lang = Lampa.Lang;
            var Controller = Lampa.Controller;

            // ТВОЙ КОД (CTRL+C / CTRL+V)
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
            // КОНЕЦ ТВОЕГО КОДА

            // Чтобы кнопки работали с пульта и мыши в браузере
            buttons.find('div').addClass('selector');
            if (Controller.update) Controller.update();
        }
    }

    // Слушаем изменения DOM
    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length) inject();
        }
    });

    function start() {
        if (window.appready && window.Lampa && window.Lampa.Input) {
            observer.observe(document.body, { childList: true, subtree: true });
            inject();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
