(function () {
    'use strict';

    // 1. Стили как в твоем примере (modal__footer + selector)
    var css = `
        .keyboard-actions-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.2em;
            background: rgba(0,0,0,0.1);
            margin-top: 5px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }
        .keyboard-actions-footer .simple-button {
            margin: 0 0.5em;
            min-width: 150px;
            text-align: center;
        }
        /* Стиль фокуса как в стандартной Лампе */
        .keyboard-actions-footer .selector.focus {
            background-color: white !important;
            color: black !important;
            border-radius: 0.3em;
        }
    `;
    if (!$('style#kb-custom-style').length) $('head').append('<style id="kb-custom-style">' + css + '</style>');

    function inject() {
        var keyboard = $('.simple-keyboard');
        
        // Проверка: добавляем только если еще нет кнопок
        if (keyboard.length && !keyboard.find('.keyboard-actions-footer').length) {
            
            // 2. Создаем HTML структуру, идентичную твоему примеру
            var $footer = $('<div class="keyboard-actions-footer"></div>');
            var $btnEnter = $('<div class="simple-button selector">Готово</div>');
            var $btnCancel = $('<div class="simple-button selector">Отменить</div>');

            $footer.append($btnEnter).append($btnCancel);
            keyboard.append($footer);

            // 3. Логика кнопок через hover:enter (как в твоем примере)
            $btnEnter.on('hover:enter', function() {
                // Код для триггера события Enter из памяти
                var input = document.querySelector('.simple-keyboard-input') || document.querySelector('input');
                if (input) {
                    var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                    input.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                    console.log('Plugin: Enter event triggered');
                }
            });

            $btnCancel.on('hover:enter', function() {
                // Вместо закрытия модалки, имитируем "Назад"
                Lampa.Controller.back();
            });

            // 4. Регистрация контроллера (аналог того, что Lampa.Modal делает внутри себя)
            if (window.Lampa && Lampa.Controller) {
                Lampa.Controller.add('keyboard_btns_plugin', {
                    toggle: function() {
                        // Указываем набор кнопок для управления
                        Lampa.Controller.collectionSet($footer);
                        // Ставим фокус на "Готово"
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    // Ручное управление влево/вправо для исключения ScriptError
                    right: function() {
                        Lampa.Controller.collectionFocus($btnCancel[0], $footer);
                    },
                    left: function() {
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    // Возврат вверх к буквам клавиатуры
                    up: function() {
                        Lampa.Controller.toggle('keyboard');
                    },
                    // Исправленный Back (без рекурсии)
                    back: function() {
                        Lampa.Controller.toggle('keyboard');
                        Lampa.Controller.back();
                    }
                });

                // 5. Перехват кнопки "Вниз" на буквах клавиатуры
                $(document).off('keydown.kb_plugin_nav').on('keydown.kb_plugin_nav', function(e) {
                    if (e.keyCode === 40) { // Down
                        var active = document.activeElement;
                        // Если мы на инпуте или внутри клавиш букв
                        if (active && (active.tagName === 'INPUT' || $(active).closest('.simple-keyboard__keys').length)) {
                            // Переключаем управление на наши кнопки
                            Lampa.Controller.toggle('keyboard_btns_plugin');
                        }
                    }
                });
            }
        }
    }

    // Слежение за DOM (открытие клавиатуры)
    var observer = new MutationObserver(function (mutations) {
        if ($('.simple-keyboard').length) inject();
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            if ($('.simple-keyboard').length) inject();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
