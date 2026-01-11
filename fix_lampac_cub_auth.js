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

                // Функция для имитации Enter (твой рабочий метод)
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

                // Применяем логику нажатий как в select_weapon (через hover:enter и click)
                $buttons.find('.simple-keyboard-buttons__enter').on('hover:enter', function() {
                    triggerEnter();
                }).on('click', function(e) {
                    if (Lampa.DeviceInput.canClick(e.originalEvent)) triggerEnter();
                });

                $buttons.find('.simple-keyboard-buttons__cancel').on('hover:enter', function() {
                    if (window.Lampa && window.Lampa.Controller) window.Lampa.Controller.back();
                }).on('click', function(e) {
                    if (Lampa.DeviceInput.canClick(e.originalEvent)) window.Lampa.Controller.back();
                });

                // Добавляем кнопки
                keyboard.append($buttons);

                // ОБНОВЛЕНИЕ НАВИГАЦИИ (метод из select_weapon)
                if (window.Lampa && window.Lampa.Controller) {
                    // Даем контроллеру понять, что список селекторов изменился
                    window.Lampa.Controller.update();
                    
                    // Если мы уже в слое клавиатуры, заставляем его пересчитать коллекцию
                    var current = window.Lampa.Controller.enabled();
                    if (current && current.name === 'keyboard') {
                        // В Lampa коллекция обновляется через обращение к контейнеру
                        Lampa.Controller.collectionSet(keyboard);
                    }
                }
            }
        } catch (globalErr) {
            console.error('Lampa Plugin: Critical Error:', globalErr);
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
