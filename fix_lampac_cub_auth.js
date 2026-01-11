(function () {
    'use strict';

    // 1. ПОДМЕНА PLATFORM.SCREEN (Тот самый обман)
    var originalScreen = Lampa.Platform.screen;
    Lampa.Platform.screen = function (name) {
        // Когда Лампа спрашивает про mobile, мы всегда говорим true
        if (name === 'mobile') return true;
        return originalScreen(name);
    };

    // 2. СТИЛИ (Для фокуса пульта)
    var css = `
        .simple-keyboard-buttons .selector.focus {
            background-color: white !important;
            color: black !important;
            transform: scale(1.05);
        }
        /* Чуть поправим мобильные кнопки для ТВ, чтобы они выглядели лучше */
        .simple-keyboard-buttons {
            background: rgba(255,255,255,0.05);
            padding: 10px !important;
        }
    `;
    if (!$('style#kb-trick-style').length) $('head').append('<style id="kb-trick-style">' + css + '</style>');

    // 3. ОБРАБОТКА ПОЯВЛЕНИЯ КНОПОК
    function patchNativeButtons() {
        var $footer = $('.simple-keyboard-buttons');
        
        // Если родные кнопки появились, но у них еще нет класса .selector
        if ($footer.length && !$footer.find('.selector').length) {
            var $btnEnter = $footer.find('.simple-keyboard-buttons__enter');
            var $btnCancel = $footer.find('.simple-keyboard-buttons__cancel');

            // Добавляем класс .selector, чтобы пульт мог их фокусировать
            $btnEnter.addClass('selector');
            $btnCancel.addClass('selector');

            // Перенаправляем события пульта на события клика (которые Лампа уже создала)
            $btnEnter.on('hover:enter', function() { $(this).click(); });
            $btnCancel.on('hover:enter', function() { $(this).click(); });

            // Регистрируем управление
            if (window.Lampa && Lampa.Controller) {
                Lampa.Controller.add('kb_native_footer', {
                    toggle: function() {
                        Lampa.Controller.collectionSet($footer);
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    left: function() {
                        Lampa.Controller.collectionFocus($btnEnter[0], $footer);
                    },
                    right: function() {
                        Lampa.Controller.collectionFocus($btnCancel[0], $footer);
                    },
                    up: function() {
                        Lampa.Controller.toggle('keyboard');
                    },
                    back: function() {
                        Lampa.Controller.back();
                    }
                });

                // Слушаем "Вниз" на клавиатуре, чтобы перейти к этим кнопкам
                $(document).off('keydown.kb_native').on('keydown.kb_native', function(e) {
                    if (e.keyCode === 40) { // Down
                        var active = document.activeElement;
                        if (active && (active.tagName === 'INPUT' || $(active).closest('.simple-keyboard__keys').length)) {
                            Lampa.Controller.toggle('kb_native_footer');
                        }
                    }
                });
            }
        }
    }

    // Следим за DOM
    var observer = new MutationObserver(function (mutations) {
        if ($('.simple-keyboard-buttons').length) patchNativeButtons();
    });

    function start() {
        if (window.appready && window.Lampa) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            setTimeout(start, 200);
        }
    }

    start();
})();
