(function () {
    'use strict';

    // Стили кнопок
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
        }
    `;
    if (!$('style#kb-tweaks-style').length) {
        $('head').append('<style id="kb-tweaks-style">' + css + '</style>');
    }

    function inject() {
        var keyboard = $('.simple-keyboard');
        if (keyboard.length && !keyboard.find('.keyboard-actions-footer').length) {

            var $footer = $('<div class="keyboard-actions-footer"></div>');
            var $btnEnter = $('<div class="simple-button selector" id="kb-btn-enter">Готово</div>');
            var $btnCancel = $('<div class="simple-button selector" id="kb-btn-cancel">Отменить</div>');

            $footer.append($btnEnter).append($btnCancel);
            keyboard.append($footer);

            // Функция ввода Enter
            var doEnter = function() {
                var input = document.querySelector('.simple-keyboard-input') || document.querySelector('input:focus') || document.querySelector('input');
                if (input) {
                    var ev = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                    input.dispatchEvent(new KeyboardEvent('keydown', ev));
                    // Эмуляция клика для некоторых типов полей
                    $(input).trigger('enter'); 
                }
            };

            $btnEnter.on('hover:enter click', doEnter);
            $btnCancel.on('hover:enter click', function() {
                if (window.Lampa && Lampa.Controller) Lampa.Controller.back();
            });

            // КОНТРОЛЛЕР
            if (window.Lampa && Lampa.Controller) {
                Lampa.Controller.add('keyboard_plugins_ctrl', {
                    toggle: function() {
                        Lampa.Controller.collectionSet($footer);
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    up: function() {
                        // Возвращаемся в основную клавиатуру
                        Lampa.Controller.toggle('keyboard');
                        // Насильно ставим фокус на инпут, если он есть
                        var input = document.querySelector('.simple-keyboard-input') || document.querySelector('input');
                        if (input) input.focus();
                    },
                    left: function() {
                        // Если мы на Отмене (вторая кнопка), идем на Готово (первая)
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    right: function() {
                        // Если мы на Готово, идем на Отмену
                        Lampa.Controller.collectionFocus($btnCancel[0], $footer);
                    },
                    back: function() {
                        Lampa.Controller.back();
                    }
                });

                // Глобальный перехват Down на инпуте
                $(document).off('keydown.kb_plugin').on('keydown.kb_plugin', function(e) {
                    if (e.keyCode === 40) { // Down
                        var active = document.activeElement;
                        if (active && active.tagName === 'INPUT') {
                            Lampa.Controller.toggle('keyboard_plugins_ctrl');
                        }
                    }
                });
            }
        }
    }

    // Наблюдатель
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
