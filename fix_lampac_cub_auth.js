(function () {
    'use strict';

    function initCustomKeyboard() {
        // Проверяем, что клавиатура отрисована
        var keyboardWrap = $('.simple-keyboard');
        
        // Если клавиатура есть, а наших кнопок или системных еще нет
        if (keyboardWrap.length && !keyboardWrap.find('.simple-keyboard-buttons').length) {
            
            // Создаем блок кнопок (используем структуру Lampa)
            var buttons = $('<div class="simple-keyboard-buttons plugin-added"><div class="simple-keyboard-buttons__enter selector">' + Lampa.Lang.translate('ready') + '</div><div class="simple-keyboard-buttons__cancel selector">' + Lampa.Lang.translate('cancel') + '</div></div>');

            // Находим текущий активный объект ввода в Lampa
            // Lampa.Input.active() - это ссылка на текущий экземпляр класса Input
            var inputInstance = Lampa.Input.active ? Lampa.Input.active() : null;

            // Обработка клика "Готово"
            buttons.find('.simple-keyboard-buttons__enter').on('click', function () {
                var inputField = keyboardWrap.find('input');
                inputField.blur(); // Убираем фокус с поля

                if (inputInstance && inputInstance.listener) {
                    inputInstance.listener.send('enter', { value: inputField.val() });
                } else {
                    // Резервный метод через эмуляцию клавиши
                    var e = $.Event('keydown');
                    e.which = 13;
                    $(document).trigger(e);
                }
            });

            // Обработка клика "Отменить"
            buttons.find('.simple-keyboard-buttons__cancel').on('click', function () {
                if (inputInstance && typeof inputInstance.value === 'function') {
                    inputInstance.value(''); // Очищаем значение
                }
                
                if (window.Lampa.Controller) {
                    window.Lampa.Controller.back(); // Возвращаемся (закрываем клавиатуру)
                }
            });

            // Добавляем кнопки в интерфейс
            keyboardWrap.append(buttons);

            // Сообщаем Lampa, что нужно обновить список активных элементов (для навигации пультом)
            if (window.Lampa.Controller) {
                window.Lampa.Controller.update();
            }
        }
    }

    // Слушаем изменения в DOM, чтобы вовремя поймать создание клавиатуры
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                initCustomKeyboard();
            }
        });
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            // Проверка на случай, если клавиатура уже была открыта до старта плагина
            initCustomKeyboard();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
