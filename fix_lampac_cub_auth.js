(function () {
    'use strict';

    function inject() {
        var keyboard = $('.simple-keyboard');
        
        // Если клавиатура есть, а кнопок еще нет
        if (keyboard.length && !keyboard.find('.my-added-buttons').length) {
            
            var Lang = Lampa.Lang;
            var Controller = Lampa.Controller;

            // 1. Создаем кнопки (ТВОЙ КОД)
            // Добавим класс my-added-buttons, чтобы избежать повторов
            var buttons = $('<div class="simple-keyboard-buttons my-added-buttons"><div class="simple-keyboard-buttons__enter">' + Lang.translate('ready') + '</div><div class="simple-keyboard-buttons__cancel">' + Lang.translate('cancel') + '</div></div>');
            
            // 2. Вешаем обработчики (ТВОЙ КОД)
            // Переменные _this и input определяются ВНУТРИ клика, чтобы не вешать окно при загрузке
            buttons.find('.simple-keyboard-buttons__enter').on('click', function () {
                var _this = Lampa.Input.active();
                var input = $('.simple-keyboard').find('#orsay-keyboard');
                
                input.blur();

                _this.listener.send('enter');
            });
            
            buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                var _this = Lampa.Input.active();
                
                _this.value('');

                Controller.back();
            });

            // 3. Вставляем (ТВОЙ КОД)
            $('.simple-keyboard').append(buttons);

            // Добавляем селекторы для работы навигации
            buttons.find('div').addClass('selector');
            if (Controller.update) Controller.update();
        }
    }

    // Слушатель изменений DOM
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
