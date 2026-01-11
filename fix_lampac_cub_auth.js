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

                // Твой рабочий метод для браузера/ПК
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
                        console.log('Lampa Plugin: Native Enter Triggered');
                    }
                };

                // Универсальный обработчик (Пульт + Мышь)
                var bindEvents = function(el, action) {
                    el.on('hover:enter', function() {
                        action();
                    }).on('click', function(e) {
                        // canClick проверяет, было ли это реальное нажатие (из кода weapon)
                        if (window.Lampa && Lampa.DeviceInput && Lampa.DeviceInput.canClick(e.originalEvent)) {
                            action();
                        } else if (!window.Lampa || !Lampa.DeviceInput) {
                            action(); // Для обычного браузера
                        }
                    });
                };

                bindEvents($buttons.find('.simple-keyboard-buttons__enter'), triggerEnter);
                bindEvents($buttons.find('.simple-keyboard-buttons__cancel'), function() {
                    if (window.Lampa && window.Lampa.Controller) window.Lampa.Controller.back();
                });

                // Вставляем кнопки
                keyboard.append($buttons);

                // ЛОГИКА ДЛЯ ТВ
                if (window.Lampa && window.Lampa.Controller) {
                    // Даем небольшую задержку, чтобы DOM обновился
                    setTimeout(function() {
                        var current = Lampa.Controller.enabled();
                        
                        // Если мы на ТВ или в слое клавиатуры
                        if (current && current.name === 'keyboard') {
                            // Принудительно обновляем коллекцию элементов, чтобы пульт их "увидел"
                            // Передаем весь контейнер клавиатуры, чтобы Lampa пересканировала все .selector
                            Lampa.Controller.collectionSet(keyboard);
                            
                            // Вызываем обновление навигации
                            Lampa.Controller.update();
                            
                            console.log('Lampa Plugin: Controller collection updated for TV');
                        }
                    }, 100);
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
        // Проверяем appready и наличие Lampa
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            injectCustomButtons();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
