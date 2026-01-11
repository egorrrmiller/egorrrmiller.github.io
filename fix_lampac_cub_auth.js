(function () {
    'use strict';

    function inject() {
        var keyboard = $('.simple-keyboard');
        
        // Если клавиатура есть, а наших кнопок еще нет
        if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
            
            // 1. Создаем кнопки (твой код)
            var Lang = Lampa.Lang;
            var buttons = $('<div class="simple-keyboard-buttons"><div class="simple-keyboard-buttons__enter">' + Lang.translate('ready') + '</div><div class="simple-keyboard-buttons__cancel">' + Lang.translate('cancel') + '</div></div>');
            
            // 2. Вешаем обработчики, которые найдут _this и input прямо в секунду нажатия
            buttons.find('.simple-keyboard-buttons__enter').on('click', function () {
                var _this = Lampa.Input.active();
                var input = $('.simple-keyboard').find('#orsay-keyboard');
                
                if (_this && _this.listener) {
                    input.blur();
                    _this.listener.send('enter');
                }
            });
            
            buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                var _this = Lampa.Input.active();
                if (_this) {
                    _this.value('');
                    Lampa.Controller.back();
                }
            });

            // 3. Вставляем кнопки
            keyboard.append(buttons);

            // 4. Добавляем селекторы для управления
            buttons.find('div').addClass('selector');
            
            if (Lampa.Controller.update) {
                Lampa.Controller.update();
            }
        }
    }

    // Следим за появлением элементов
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
            setTimeout(start, 200);
        }
    }

    start();
})();
