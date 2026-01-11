(function () {
    'use strict';

    var style = $('<style>' +
        '.simple-keyboard-buttons .selector { cursor: pointer; transition: all 0.2s; border-radius: 4px; padding: 10px; margin: 5px; text-align: center; background: rgba(255, 255, 255, 0.05); }' +
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

                // Обработчик "Готово" (Enter)
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

                // Обработчик "Отменить" (Back)
                $buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                    if (window.Lampa && window.Lampa.Controller) window.Lampa.Controller.back();
                });

                keyboard.append($buttons);

                // ИНТЕГРАЦИЯ В КОНТРОЛЛЕР
                if (window.Lampa && window.Lampa.Controller) {
                    // Ждем микросекунду, чтобы DOM прожевал кнопки
                    setTimeout(function() {
                        var current = window.Lampa.Controller.enabled();
                        
                        // Если мы в слое клавиатуры
                        if (current && (current.name === 'keyboard' || keyboard.is(':visible'))) {
                            // Добавляем наши кнопки в коллекцию элементов текущего слоя
                            current.container.find('.selector').off('hover').on('hover', function() {
                                // Позволяем Lampa подсвечивать их при наведении
                            });
                            
                            // Принудительно обновляем список доступных элементов
                            window.Lampa.Controller.add({
                                name: 'keyboard_buttons',
                                selector: '.simple-keyboard-buttons .selector',
                                layer: current.layer || 'content',
                                parent: current,
                                onEnter: function(el) {
                                    $(el).trigger('click');
                                }
                            });
                            
                            window.Lampa.Controller.update();
                        }
                    }, 100);
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
