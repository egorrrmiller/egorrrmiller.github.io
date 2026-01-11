(function () {
    'use strict';

    function inject() {
        var keyboard = $('.simple-keyboard');
        
        if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
            // Подготавливаем окружение для твоего кода
            var _this = Lampa.Input.active();
            if (!_this) return; // Ждем, пока Lampa создаст объект

            var input = keyboard.find('#orsay-keyboard');
            var Lang = Lampa.Lang;
            var Controller = Lampa.Controller;

            // --- ТВОЙ КОД (БЕЗ ИЗМЕНЕНИЙ) ---
            var buttons = $('<div class="simple-keyboard-buttons"><div class="simple-keyboard-buttons__enter">' + Lang.translate('ready') + '</div><div class="simple-keyboard-buttons__cancel">' + Lang.translate('cancel') + '</div></div>');
            
            buttons.find('.simple-keyboard-buttons__enter').on('click', function () {
                input.blur();

                _this.listener.send('enter');
            });

            buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                _this.value('');

                Controller.back();
            });

            $('.simple-keyboard').append(buttons);
            // --- КОНЕЦ ТВОЕГО КОДА ---

            // Добавляем селекторы, чтобы Lampa видела кнопки пультом/мышью
            buttons.find('div').addClass('selector');
            if (Controller.update) Controller.update();
        }
    }

    // Слушатель для отрисовки
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) inject();
        });
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            inject();
        } else {
            setTimeout(start, 100);
        }
    }

    start();
})();
