(function () {
    'use strict';

    // Стили для фокуса с пульта
    var style = $('<style>' +
        '.simple-keyboard-buttons .selector.focus { background: rgba(255, 255, 255, 0.2) !important; border: 1px solid #fff; }' +
    '</style>');
    $('head').append(style);

    function injectCustomButtons() {
        try {
            var keyboard = $('.simple-keyboard');
            
            if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
                
                var $buttons = $(
                    '<div class="simple-keyboard-buttons">' +
                        '<div class="simple-keyboard-buttons__enter selector" nav-selectable="true">Готово</div>' +
                        '<div class="simple-keyboard-buttons__cancel selector" nav-selectable="true">Отменить</div>' +
                    '</div>'
                );

                // Твой рабочий метод прожатия Enter
                $buttons.find('.simple-keyboard-buttons__enter').on('click', function () {
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
                });

                $buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                    if (window.Lampa && window.Lampa.Controller) {
                        window.Lampa.Controller.back();
                    }
                });

                // Вставляем кнопки
                keyboard.append($buttons);

                // РЕГИСТРАЦИЯ ДЛЯ ПУЛЬТА (как в select_weapon, но без создания нового слоя)
                if (window.Lampa && window.Lampa.Controller) {
                    var controller = window.Lampa.Controller.enabled();
                    
                    if (controller && controller.name === 'keyboard') {
                        // Добавляем наши кнопки в текущую коллекцию элементов контроллера
                        controller.collection = keyboard.find('.selector');
                        
                        // Пересчитываем навигацию
                        window.Lampa.Controller.update();
                    }
                }
            }
        } catch (globalErr) {
            console.error('Lampa Plugin Error:', globalErr);
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
