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

                // Функция "прожатия"
                var triggerEnter = function() {
                    var input = document.querySelector('.simple-keyboard-input') || document.querySelector('#orsay-keyboard');
                    if (input) {
                        $(input).off('blur.prevent'); // Снимаем защиту если была
                        input.blur();
                        var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                        input.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                        input.dispatchEvent(new KeyboardEvent('keyup', eventParams));
                        document.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                        console.log('Lampa Plugin: Enter Force Triggered');
                    }
                };

                // Привязываем клики (для мыши и пульта через систему Lampa)
                $buttons.find('.selector').on('click hover:enter', function (e) {
                    if (e.type === 'click' && window.Lampa && Lampa.DeviceInput && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                    
                    if ($(this).hasClass('simple-keyboard-buttons__enter')) triggerEnter();
                    else Lampa.Controller.back();
                });

                keyboard.append($buttons);

                // --- ХАК ДЛЯ ПЕРЕХВАТА ФОКУСА ---
                if (window.Lampa && window.Lampa.Controller) {
                    // Создаем контроллер для наших кнопок
                    Lampa.Controller.add('my_keyboard_btns', {
                        toggle: function () {
                            Lampa.Controller.collectionSet($buttons);
                            Lampa.Controller.collectionFocus($buttons.find('.selector')[0], $buttons);
                        },
                        up: function () {
                            // Возвращаемся к инпуту/клавиатуре
                            Lampa.Controller.toggle('keyboard');
                        },
                        left: function () { Lampa.Navigator.move('left'); },
                        right: function () { Lampa.Navigator.move('right'); },
                        back: function () { Lampa.Controller.back(); }
                    });

                    // Чтобы "слезть" с инпута, нам нужно слушать нажатие "Вниз"
                    // Но так как инпут перехватывает всё, мы добавим глобальный слушатель
                    $(document).on('keydown.my_nav', function(e) {
                        var active = Lampa.Controller.enabled();
                        if (active && active.name === 'keyboard' && e.keyCode === 40) { // 40 - Down
                            // Если нажали "Вниз" на клавиатуре, принудительно уходим на наши кнопки
                            Lampa.Controller.toggle('my_keyboard_btns');
                        }
                    });

                    Lampa.Controller.update();
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
