(function () {
    'use strict';

    var css = `
        .keyboard-actions-footer {
            display: flex;
            justify-content: center;
            padding: 10px;
            background: rgba(0,0,0,0.2);
        }
        .keyboard-actions-footer .simple-button {
            margin: 0 10px;
            min-width: 150px;
            text-align: center;
        }
        .keyboard-actions-footer .selector.focus {
            background-color: #fff !important;
            color: #000 !important;
        }
    `;
    if (!$('style#kb-tweaks-style').length) $('head').append('<style id="kb-tweaks-style">' + css + '</style>');

    function inject() {
        var keyboard = $('.simple-keyboard');
        if (keyboard.length && !keyboard.find('.keyboard-actions-footer').length) {
            
            var $footer = $('<div class="keyboard-actions-footer"></div>');
            var $btnEnter = $('<div class="simple-button selector">Готово</div>');
            var $btnCancel = $('<div class="simple-button selector">Отменить</div>');

            $footer.append($btnEnter).append($btnCancel);
            keyboard.append($footer);

            // Кнопка "Готово" - имитируем нажатие Enter на инпуте
            $btnEnter.on('hover:enter', function() {
                var input = document.querySelector('.simple-keyboard-input') || document.querySelector('input');
                if (input) {
                    var event = new KeyboardEvent('keydown', {
                        key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
                    });
                    input.dispatchEvent(event);
                }
            });

            // Кнопка "Отменить" - просто закрываем текущий контроллер (назад)
            $btnCancel.on('hover:enter', function() {
                Lampa.Controller.back();
            });

            if (window.Lampa && Lampa.Controller) {
                // Регистрируем контроллер для блока кнопок
                Lampa.Controller.add('keyboard_footer', {
                    toggle: function() {
                        // Указываем набор элементов для навигации (как в модалке)
                        Lampa.Controller.collectionSet($footer);
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    up: function() {
                        // Возврат к буквам клавиатуры
                        Lampa.Controller.toggle('keyboard');
                    },
                    back: function() {
                        // Выход из клавиатуры совсем
                        Lampa.Controller.back();
                    }
                    // Методы left/right удалены, Lampa сама найдет соседний .selector
                });

                // Слушаем нажатие "Вниз" на клавиатуре, чтобы перейти к кнопкам
                $(document).off('keydown.kb_nav').on('keydown.kb_nav', function(e) {
                    if (e.keyCode === 40) { // Down
                        var active = document.activeElement;
                        // Если мы на буквах или в инпуте - прыгаем вниз к нашим кнопкам
                        if (active && (active.tagName === 'INPUT' || $(active).closest('.simple-keyboard__keys').length)) {
                            Lampa.Controller.toggle('keyboard_footer');
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
            inject();
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
