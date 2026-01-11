(function () {
    'use strict';

    function addCustomButtons() {
        var keyboardWrap = document.querySelector('.simple-keyboard');
        
        // Проверяем наличие клавиатуры и что мы еще не вставили свои кнопки
        if (keyboardWrap && !keyboardWrap.querySelector('.plugin-buttons-added')) {
            
            var buttonsHTML = '<div class="simple-keyboard-buttons plugin-buttons-added">' +
                                '<div class="simple-keyboard-buttons__enter selector">Готово</div>' +
                                '<div class="simple-keyboard-buttons__cancel selector">Отменить</div>' +
                              '</div>';
            
            // Вставляем HTML
            keyboardWrap.insertAdjacentHTML('beforeend', buttonsHTML);

            // Находим созданные элементы, чтобы навесить на них события
            var btnEnter = keyboardWrap.querySelector('.simple-keyboard-buttons__enter');
            var btnCancel = keyboardWrap.querySelector('.simple-keyboard-buttons__cancel');

            // Функция для имитации нажатия клавиш (понятно для Lampa)
            var triggerKey = function(code) {
                var event = new KeyboardEvent('keydown', {
                    keyCode: code,
                    which: code,
                    bubbles: true
                });
                document.dispatchEvent(event);
            };

            // Обработка кнопки Готово
            btnEnter.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                triggerKey(13); // Код Enter
            });

            // Обработка кнопки Отменить
            btnCancel.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                // Сначала пробуем стандартный метод закрытия ввода Lampa
                if (window.Lampa && window.Lampa.Input) {
                    window.Lampa.Input.close();
                } else {
                    triggerKey(27); // Код Escape (назад)
                }
            });

            // ОЧЕНЬ ВАЖНО: заставляем контроллер Lampa увидеть новые кнопки
            if (window.Lampa && window.Lampa.Controller) {
                window.Lampa.Controller.update();
            }
            
            console.log('Plugin: Custom buttons initialized');
        }
    }

    // Следим за изменениями в DOM (чтобы поймать появление клавиатуры)
    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length) {
                addCustomButtons();
            }
        }
    });

    function start() {
        if (window.appready) {
            observer.observe(document.body, { childList: true, subtree: true });
            addCustomButtons();
        } else {
            setTimeout(start, 100);
        }
    }

    start();
})();
