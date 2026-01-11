(function () {
    'use strict';

    function setupKeyboard() {
        var keyboardWrap = document.querySelector('.simple-keyboard');
        
        if (keyboardWrap) {
            // 1. Пытаемся найти существующие кнопки
            var btnEnter = keyboardWrap.querySelector('.simple-keyboard-buttons__enter');
            var btnCancel = keyboardWrap.querySelector('.simple-keyboard-buttons__cancel');

            // 2. Если кнопок нет (как в браузерной версии), создаем их
            if (!btnEnter) {
                var buttonsHTML = '<div class="simple-keyboard-buttons plugin-buttons-added">' +
                                    '<div class="simple-keyboard-buttons__enter selector">Готово</div>' +
                                    '<div class="simple-keyboard-buttons__cancel selector">Отменить</div>' +
                                  '</div>';
                keyboardWrap.insertAdjacentHTML('beforeend', buttonsHTML);
                
                // Перепривязываем переменные к только что созданным кнопкам
                btnEnter = keyboardWrap.querySelector('.simple-keyboard-buttons__enter');
                btnCancel = keyboardWrap.querySelector('.simple-keyboard-buttons__cancel');
            }

            // 3. Если кнопки теперь есть (были или созданы) и еще не "оживлены"
            if (btnEnter && !btnEnter.classList.contains('plugin-active')) {
                
                // Добавляем классы для навигации Lampa
                btnEnter.classList.add('plugin-active', 'selector');
                btnCancel.classList.add('plugin-active', 'selector');

                // Логика кнопки Готово
                btnEnter.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Эмулируем нажатие Enter для всего документа
                    var ev = new KeyboardEvent('keydown', {
                        keyCode: 13,
                        which: 13,
                        bubbles: true
                    });
                    document.dispatchEvent(ev);
                    
                    // Дополнительно: пробуем вызвать событие change на инпуте
                    var input = keyboardWrap.querySelector('input');
                    if(input) {
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });

                // Логика кнопки Отменить
                btnCancel.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.Lampa && window.Lampa.Input) {
                        window.Lampa.Input.close();
                    } else {
                        // Если системный метод недоступен, жмем Escape
                        var ev = new KeyboardEvent('keydown', { keyCode: 27, bubbles: true });
                        document.dispatchEvent(ev);
                    }
                });

                // Обязательно обновляем контроллер Lampa
                if (window.Lampa && window.Lampa.Controller) {
                    window.Lampa.Controller.update();
                }
            }
        }
    }

    // Наблюдатель за появлением элементов
    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length) {
                setupKeyboard();
            }
        }
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            setupKeyboard();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
