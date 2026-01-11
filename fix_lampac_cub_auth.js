(function () {
    'use strict';

    var _this = this;

    function injectCustomButtons() {
        // Ищем контейнер клавиатуры
        var keyboard = $('.simple-keyboard');
        
        // Если клавиатура на месте, а наших кнопок еще нет
        if (keyboard.length && !keyboard.find('.my-custom-buttons').length) {
            
            // Создаем блок кнопок. 
            // Добавляем класс 'my-custom-buttons', чтобы не дублировать
            var $buttons = $(
                '<div class="simple-keyboard-buttons my-custom-buttons">' +
                    '<div class="simple-keyboard-buttons__enter selector" style="pointer-events: all;">Готово</div>' +
                    '<div class="simple-keyboard-buttons__cancel selector" style="pointer-events: all;">Отменить</div>' +
                '</div>'
            );

            // Обработчик кнопки "Готово"
            $buttons.find('.simple-keyboard-buttons__enter').on('click', function (e) {
                input.blur();

                _this.listener.send('enter');

                console.log('Lampa Plugin: Custom Enter Triggered');
            });

            // Обработчик кнопки "Отменить"
            $buttons.find('.simple-keyboard-buttons__cancel').on('click', function (e) {
                e.preventDefault();
                
                // Используем встроенный контроллер Lampa для шага "Назад"
                if (window.Lampa && window.Lampa.Controller) {
                    window.Lampa.Controller.back();
                } else {
                    // Резервный вариант - клавиша ESC
                    var event = $.Event('keydown');
                    event.which = 27;
                    $(document).trigger(event);
                }
            });

            // Добавляем кнопки в конец контейнера клавиатуры
            keyboard.append($buttons);

            // Оповещаем Lampa, что появились новые элементы .selector
            if (window.Lampa && window.Lampa.Controller) {
                window.Lampa.Controller.update();
            }
        }
    }

    // Следим за появлением клавиатуры через MutationObserver
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                injectCustomButtons();
            }
        });
    });

    function start() {
        if (window.appready) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            injectCustomButtons();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
