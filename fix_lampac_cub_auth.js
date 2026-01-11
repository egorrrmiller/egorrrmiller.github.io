(function () {
    'use strict';

    // Стили для выделения (мышка + пульт)
    var style = $('<style>' +
        '.simple-keyboard-buttons .selector { cursor: pointer; transition: all 0.2s; border-radius: 4px; }' +
        '.simple-keyboard-buttons .selector:hover { background: rgba(255, 255, 255, 0.1); }' +
        '.simple-keyboard-buttons .selector.focus { background: rgba(255, 255, 255, 0.2); border: 1px solid #fff; }' +
        '.simple-keyboard-buttons__enter.selector.focus { background: rgba(0, 255, 0, 0.2); }' +
        '.simple-keyboard-buttons__cancel.selector.focus { background: rgba(255, 0, 0, 0.2); }' +
    '</style>');
    $('head').append(style);

    function injectCustomButtons() {
        try {
            var keyboard = $('.simple-keyboard');
            
            if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
                
                var $buttons = $(
                    '<div class="simple-keyboard-buttons">' +
                        '<div class="simple-keyboard-buttons__enter selector">Готово</div>' +
                        '<div class="simple-keyboard-buttons__cancel selector">Отменить</div>' +
                    '</div>'
                );

                // Добавляем обработчики
                $buttons.find('.simple-keyboard-buttons__enter').on('click', function () {
                    var input = document.querySelector('.simple-keyboard-input') || document.querySelector('#orsay-keyboard');
                    if (input) {
                        input.blur();
                        var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                        input.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                        input.dispatchEvent(new KeyboardEvent('keyup', eventParams));
                        document.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                    }
                });

                $buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                    if (window.Lampa && window.Lampa.Controller) window.Lampa.Controller.back();
                });

                // ВАЖНО: Добавляем кнопки в DOM
                keyboard.append($buttons);

                // ЗАСТАВЛЯЕМ ПУЛЬТ ВИДЕТЬ КНОПКИ
                if (window.Lampa && window.Lampa.Controller) {
                    // 1. Помечаем элементы для навигации
                    $buttons.find('.selector').attr('nav-selectable', 'true');
                    
                    // 2. Обновляем текущий контекст контроллера
                    window.Lampa.Controller.update();
                    
                    // 3. Если фокус сейчас на клавиатуре, заставляем контроллер пересканировать слой
                    var current = window.Lampa.Controller.enabled();
                    if (current && current.name === 'keyboard') {
                        // Добавляем наши кнопки в список доступных для выбора элементов текущего слоя
                        if (current.container) {
                            window.Lampa.Controller.render();
                        }
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
