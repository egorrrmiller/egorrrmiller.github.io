(function () {
    'use strict';

    var css = `
        .keyboard-actions-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5em 0;
            width: 100%;
            background: rgba(255,255,255,0.05);
            margin-top: 5px;
        }
        .keyboard-actions-footer .simple-button {
            margin: 0 10px;
            min-width: 160px;
            text-align: center;
        }
        .keyboard-actions-footer .selector.focus {
            background-color: white !important;
            color: black !important;
        }
    `;
    if (!$('style#kb-style').length) $('head').append('<style id="kb-style">' + css + '</style>');

    function inject() {
        var keyboard = $('.simple-keyboard');
        if (keyboard.length && !keyboard.find('.keyboard-actions-footer').length) {
            
            var $footer = $('<div class="keyboard-actions-footer" data-nav-group="kb_footer"></div>');
            var $btnEnter = $('<div class="simple-button selector">Готово</div>');
            var $btnCancel = $('<div class="simple-button selector">Отменить</div>');

            $footer.append($btnEnter).append($btnCancel);
            keyboard.append($footer);

            // Регистрация в навигаторе (как в модалках)
            Lampa.Navigator.register({
                name: 'kb_footer',
                node: $footer,
                selector: '.selector',
                onBack: function() {
                    Lampa.Controller.toggle('keyboard');
                },
                onUp: function() {
                    Lampa.Controller.toggle('keyboard');
                },
                onEnter: function(node) {
                    if ($(node).is($btnEnter)) {
                        var input = document.querySelector('.simple-keyboard-input') || document.activeElement;
                        var ev = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                        input.dispatchEvent(new KeyboardEvent('keydown', ev));
                        console.log('Plugin: Enter triggered');
                    } else {
                        Lampa.Controller.back();
                    }
                }
            });

            // Исправляем переход "ВНИЗ"
            $(document).off('keydown.kb_fix').on('keydown.kb_fix', function(e) {
                if (e.keyCode === 40) { // Down
                    var active = document.activeElement;
                    // Если фокус на буквах клавиатуры или в инпуте
                    if (active && ($(active).closest('.simple-keyboard__keys').length || active.tagName === 'INPUT')) {
                        // Принудительно гасим стандартное событие и переключаем фокус
                        e.preventDefault();
                        e.stopPropagation();
                        Lampa.Controller.toggle('kb_footer');
                    }
                }
            });
        }
    }

    // Следим за появлением клавиатуры
    var observer = new MutationObserver(function (mutations) {
        if ($('.simple-keyboard').length) inject();
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
            if ($('.simple-keyboard').length) inject();
        } else {
            setTimeout(start, 100);
        }
    }

    start();
})();
