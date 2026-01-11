(function () {
    'use strict';

    // СТИЛИ (Оставляем те же, красивые и видимые)
    var css = `
        .keyboard-actions-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5em 0;
            margin-top: 0.5em;
        }
        .keyboard-actions-footer .simple-button {
            margin: 0 1em;
            min-width: 140px;
            text-align: center;
        }
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
        if (keyboard.length && !keyboard.find('.keyboard-actions-footer').length) {

            // СОЗДАНИЕ КНОПОК
            var $footer = $('<div class="keyboard-actions-footer"></div>');
            var $btnEnter = $('<div class="simple-button selector">Готово</div>');
            var $btnCancel = $('<div class="simple-button selector">Отменить</div>');

            $footer.append($btnEnter);
            $footer.append($btnCancel);
            keyboard.append($footer);

            // --- ИСПРАВЛЕНИЕ 1: Правильный поиск инпута ---
            var doEnter = function() {
                try {
                    // Ищем инпут явно по классу клавиатуры Lampa, а не по activeElement
                    var input = document.querySelector('.simple-keyboard-input') || document.querySelector('input');
                    
                    if (input) {
                        console.log('Lampa Plugin: Sending Enter to input', input);
                        
                        var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                        
                        // 1. Отправляем событие прямо в инпут
                        input.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                        input.dispatchEvent(new KeyboardEvent('keyup', eventParams));
                        
                        // 2. Отправляем событие глобально (на случай, если слушатель на window)
                        document.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                        
                        // 3. Закрываем клавиатуру (опционально, многие плагины ждут этого)
                        // Lampa.Controller.toggle('content'); 
                    } else {
                        console.error('Lampa Plugin: Input not found!');
                    }
                } catch (e) {
                    console.error('Lampa Plugin: Enter Error', e);
                }
            };

            $btnEnter.on('hover:enter click', doEnter);

            $btnCancel.on('hover:enter click', function() {
                if (window.Lampa && Lampa.Controller) Lampa.Controller.back();
            });

            // --- ИСПРАВЛЕНИЕ 2: Ручная навигация (без Script Error) ---
            if (window.Lampa && Lampa.Controller) {
                Lampa.Controller.add('keyboard_plugins_ctrl', {
                    toggle: function() {
                        Lampa.Controller.collectionSet($footer);
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    up: function() {
                        Lampa.Controller.toggle('keyboard');
                    },
                    // ВМЕСТО Lampa.Navigator.move ПРОПИСЫВАЕМ ПЕРЕХОДЫ ВРУЧНУЮ
                    left: function() {
                        // Если мы на "Отменить", идем на "Готово"
                        if (document.activeElement === $btnCancel[0]) {
                            Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                        }
                    },
                    right: function() {
                        // Если мы на "Готово", идем на "Отменить"
                        if (document.activeElement === $btnEnter[0]) {
                            Lampa.Controller.collectionFocus($btnCancel[0], $footer);
                        }
                    },
                    back: function() { Lampa.Controller.back(); }
                });

                // Перехват кнопки "ВНИЗ"
                $(document).off('keydown.kb_plugin').on('keydown.kb_plugin', function(e) {
                    if (e.keyCode === 40) { 
                        var active = document.activeElement;
                        // Проверяем, что мы в инпуте, либо в области самой клавиатуры (буквы)
                        if (active && (active.tagName === 'INPUT' || $(active).closest('.simple-keyboard').length)) {
                            // Если нажали вниз внутри клавиатуры - переходим на кнопки
                            // Проверяем, не на кнопках ли мы уже (чтобы не зациклить)
                            if (!$(active).closest('.keyboard-actions-footer').length) {
                                Lampa.Controller.toggle('keyboard_plugins_ctrl');
                            }
                        }
                    }
                });
            }
        }
    }

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
