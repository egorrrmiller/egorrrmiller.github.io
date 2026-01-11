(function () {
    'use strict';

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

                var triggerEnter = function() {
                    var input = document.querySelector('.simple-keyboard-input') || document.querySelector('#orsay-keyboard');
                    if (input) {
                        input.blur();
                        var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                        input.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                        input.dispatchEvent(new KeyboardEvent('keyup', eventParams));
                        document.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                    }
                };

                // Логика нажатий (Пульт + Мышь)
                $buttons.find('.selector').on('hover:enter click', function(e) {
                    if (e.type === 'click' && window.Lampa && Lampa.DeviceInput && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                    
                    if ($(this).hasClass('simple-keyboard-buttons__enter')) triggerEnter();
                    else Lampa.Controller.back();
                });

                keyboard.append($buttons);

                // --- АДАПТАЦИЯ НАВИГАЦИИ (МЕТОД SELECT_WEAPON) ---
                if (window.Lampa && window.Lampa.Controller) {
                    // Создаем отдельный микро-контроллер для наших кнопок
                    Lampa.Controller.add('keyboard_custom_nav', {
                        toggle: function () {
                            // Фокусируемся на первой кнопке ("Готово")
                            Lampa.Controller.collectionSet(keyboard);
                            Lampa.Controller.collectionFocus($buttons.find('.simple-keyboard-buttons__enter')[0], keyboard);
                        },
                        left: function () {
                            Lampa.Navigator.move('left');
                        },
                        right: function () {
                            Lampa.Navigator.move('right');
                        },
                        up: function () {
                            Lampa.Navigator.move('up');
                        },
                        down: function () {
                            Lampa.Navigator.move('down');
                        },
                        back: function () {
                            Lampa.Controller.back();
                        }
                    });

                    // Слушаем, когда фокус уходит вниз с основной клавиатуры
                    // Мы подменяем стандартный контроллер, когда нужно
                    window.Lampa.Controller.update();
                }
            }
        } catch (globalErr) {
            console.error('Lampa Plugin Error:', globalErr);
        }
    }

    // Следим за появлением клавиатуры
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                injectCustomButtons();
            }
        });
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            
            // Хак: слушаем событие открытия клавиатуры, чтобы помочь навигации
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'keyboard_open') {
                    setTimeout(injectCustomButtons, 100);
                }
            });
            
            injectCustomButtons();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
