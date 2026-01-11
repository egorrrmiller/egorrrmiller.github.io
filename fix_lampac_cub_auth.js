(function () {
    'use strict';

    function addCustomButtons() {
        // Ищем целевой контейнер клавиатуры
        var keyboardWrap = document.querySelector('.simple-keyboard');
        
        if (keyboardWrap) {
            // Проверяем, нет ли уже блока с кнопками внутри
            // (Ищем именно наш специфический класс внутри, чтобы избежать дублей)
            var existingButtons = keyboardWrap.querySelector('.simple-keyboard-buttons');
            
            if (!existingButtons) {
                // Создаем структуру кнопок
                var buttonsHTML = '<div class="simple-keyboard-buttons">' +
                                    '<div class="simple-keyboard-buttons__enter">Готово</div>' +
                                    '<div class="simple-keyboard-buttons__cancel">Отменить</div>' +
                                  '</div>';
                
                // Вставляем блок в конец контейнера .simple-keyboard
                keyboardWrap.insertAdjacentHTML('beforeend', buttonsHTML);
                console.log('Plugin: Keyboard buttons added');
            }
        }
    }

    // Так как клавиатура в LAMPA может появляться в любой момент (динамически),
    // используем MutationObserver для отслеживания изменений в DOM
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                addCustomButtons();
            }
        });
    });

    // Запускаем плагин после готовности приложения
    function startPlugin() {
        if (window.appready) {
            // Начинаем следить за всем документом
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            // Проверяем сразу, вдруг клавиатура уже открыта
            addCustomButtons();
        } else {
            setTimeout(startPlugin, 100);
        }
    }

    startPlugin();

})();
