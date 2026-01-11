(function () {
    'use strict';

    function injectCustomButtons() {
        try {
            var keyboard = $('.simple-keyboard');
            
            if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
                
                var $buttons = $(
                    '<div class="simple-keyboard-buttons">' +
                        '<div class="simple-keyboard-buttons__enter selector" data-controller="custom_keyboard">Готово</div>' +
                        '<div class="simple-keyboard-buttons__cancel selector" data-controller="custom_keyboard">Отменить</div>' +
                    '</div>'
                );

                // Логика нажатия Enter (твой рабочий метод)
                var triggerEnter = function() {
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
                };

                // Привязка событий клика/ок
                $buttons.find('.simple-keyboard-buttons__enter').on('click hover:enter', function() {
                    triggerEnter();
                });

                $buttons.find('.simple-keyboard-buttons__cancel').on('click hover:enter', function() {
                    if (window.Lampa && window.Lampa.Controller) window.Lampa.Controller.back();
                });

                keyboard.append($buttons);

                if (window.Lampa && window.Lampa.Controller) {
                    // Регистрируем контроллер
                    window.Lampa.Controller.add('custom_keyboard', {
                        toggle: function() {
                            Lampa.Controller.collectionSet($buttons);
                            Lampa.Controller.collectionFocus($buttons.find('.simple-keyboard-buttons__enter')[0], $buttons);
                        },
                        right: function() { Lampa.Navigator.move('right'); },
                        left: function() { Lampa.Navigator.move('left'); },
                        up: function() { 
                            // Возврат на саму клавиатуру при нажатии "Вверх"
                            Lampa.Controller.toggle('keyboard'); 
                        },
                        back: function() { Lampa.Controller.back(); }
                    });

                    // ХАК: Если фокус на вводе и нажали "ВНИЗ", переходим на наши кнопки
                    $(document).on('keydown.custom_kb', function(e) {
                        if (e.keyCode === 40) { // Down
                            var active = Lampa.Controller.enabled();
                            if (active && active.name === 'keyboard') {
                                Lampa.Controller.toggle('custom_keyboard');
                            }
                        }
                    });

                    window.Lampa.Controller.update();
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
