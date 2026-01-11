(function () {
    'use strict';

    // --- 1. СТИЛИЗАЦИЯ (Как в твоем примере) ---
    // Добавляем стили для контейнера. Сами кнопки используют стандартный стиль Lampa.
    var css = `
        .keyboard-actions-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5em 0;
            margin-top: 0.5em;
        }
        .keyboard-actions-footer .simple-button {
            margin: 0 1em; /* Расстояние между кнопками */
            min-width: 140px;
            text-align: center;
        }
        /* Яркий фокус для ТВ, чтобы точно видеть, где курсор */
        .keyboard-actions-footer .selector.focus {
            background-color: white !important;
            color: black !important;
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
            z-index: 2;
        }
    `;
    $('head').append('<style>' + css + '</style>');

    function inject() {
        var keyboard = $('.simple-keyboard');

        // Проверяем, чтобы не дублировать кнопки
        if (keyboard.length && !keyboard.find('.keyboard-actions-footer').length) {

            // --- 2. СОЗДАНИЕ HTML (Структура как в modal__footer) ---
            var $footer = $('<div class="keyboard-actions-footer"></div>');
            var $btnEnter = $('<div class="simple-button selector">Готово</div>');
            var $btnCancel = $('<div class="simple-button selector">Отменить</div>');

            $footer.append($btnEnter);
            $footer.append($btnCancel);
            keyboard.append($footer);

            // --- 3. ЛОГИКА "ENTER" (ОТПРАВКА ДАННЫХ) ---
            var doEnter = function() {
                var input = document.activeElement;
                
                // 1. Снимаем фокус с инпута (важно для Tizen/WebOS)
                if (input && input.tagName === 'INPUT') {
                    input.blur();
                }

                // 2. Эмулируем нажатие физической клавиши Enter
                var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                document.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                document.dispatchEvent(new KeyboardEvent('keyup', eventParams));
                
                // 3. На всякий случай отправляем событие прямо в инпут
                if (input) {
                    input.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                    input.dispatchEvent(new KeyboardEvent('keyup', eventParams));
                }

                console.log('Lampa Plugin: Action "Enter" executed');
            };

            // --- 4. СОБЫТИЯ (Как в примере: hover:enter) ---
            
            // Кнопка "Готово"
            $btnEnter.on('hover:enter click', function() {
                doEnter();
            });

            // Кнопка "Отменить"
            $btnCancel.on('hover:enter click', function() {
                if (window.Lampa && Lampa.Controller) {
                    Lampa.Controller.back();
                }
            });

            // --- 5. КОНТРОЛЛЕР НАВИГАЦИИ (Имитация Lampa.Modal) ---
            if (window.Lampa && Lampa.Controller) {
                
                // Создаем контроллер специально для наших кнопок
                Lampa.Controller.add('keyboard_plugins_ctrl', {
                    toggle: function() {
                        // При активации указываем Лампе, что кнопки находятся в нашем футере
                        Lampa.Controller.collectionSet($footer);
                        // Ставим фокус на первую кнопку ("Готово")
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    up: function() {
                        // При нажатии ВВЕРХ возвращаем управление клавиатуре
                        Lampa.Controller.toggle('keyboard');
                    },
                    // Влево/Вправо работает автоматически по классу .selector,
                    // но для надежности дублируем стандартный метод
                    left: function() { Lampa.Navigator.move('left'); },
                    right: function() { Lampa.Navigator.move('right'); },
                    back: function() { Lampa.Controller.back(); }
                });

                // --- 6. МОСТ МЕЖДУ ИНПУТОМ И КНОПКАМИ ---
                // Самая важная часть: перехватываем нажатие "ВНИЗ" на инпуте
                $(document).off('keydown.kb_plugin').on('keydown.kb_plugin', function(e) {
                    if (e.keyCode === 40) { // Код кнопки "Вниз"
                        var active = document.activeElement;
                        // Если фокус сейчас в поле ввода
                        if (active && active.tagName === 'INPUT') {
                            // Принудительно переключаем управление на наши кнопки
                            Lampa.Controller.toggle('keyboard_plugins_ctrl');
                        }
                    }
                });
            }
        }
    }

    // --- СЛЕЖЕНИЕ ЗА ОТКРЫТИЕМ КЛАВИАТУРЫ ---
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                if ($('.simple-keyboard').length) {
                    inject();
                }
            }
        });
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            // Если клавиатура уже открыта при старте плагина
            if ($('.simple-keyboard').length) inject();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
