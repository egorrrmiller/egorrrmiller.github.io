(function () {
    'use strict';

    function injectCustomButtons() {
        try {
            // Ищем контейнер клавиатуры
            var keyboard = $('.test-buttons');
            
            // Если клавиатура на месте, а наших кнопок еще нет
            if (keyboard.length) {
                
                // Создаем блок кнопок
                var $buttons = $(
                    '<div class="test-buttons">' +
                        '<div class="test-buttons__enter">Готово</div>' +
                        '<div class="test-buttons__cancel">Отменить</div>' +
                    '</div>'
                );

                // Обработчик кнопки "Готово"
                $buttons.find('.test-buttons__enter').on('click', function (e) {
                    try {
                        Lampa.Controller.enter();
                        console.log('Lampa Plugin: press enter');
                    } catch (err) {
                        console.error('Lampa Plugin: Error in Enter click:', err);
                    }
                });

                // Обработчик кнопки "Отменить"
                $buttons.find('.test-buttons__cancel').on('click', function (e) {
                    try {
                        e.preventDefault();
                        
                        if (window.Lampa && window.Lampa.Controller) {
                            window.Lampa.Controller.back();
                        } else {
                            var event = $.Event('keydown');
                            event.which = 27; // Esc
                            $(document).trigger(event);
                        }
                    } catch (err) {
                        console.error('Lampa Plugin: Error in Cancel click:', err);
                    }
                });

                // Добавляем кнопки
                keyboard.append($buttons);

                // Обновляем контроллер
                if (window.Lampa && window.Lampa.Controller && window.Lampa.Controller.update) {
                    window.Lampa.Controller.update();
                }
            }
        } catch (globalErr) {
            console.error('Lampa Plugin: Critical Error in injectCustomButtons:', globalErr);
        }
    }

    // Следим за изменениями DOM
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                injectCustomButtons();
            }
        });
    });

    function start() {
        try {
            if (window.appready) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                injectCustomButtons();
            } else {
                setTimeout(start, 200);
            }
        } catch (e) {
            console.error('Lampa Plugin: Start function failed:', e);
        }
    }

    start();
})();
