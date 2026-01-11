(function () {
    'use strict';

    function inject() {
        try {
            var keyboard = $('.simple-keyboard');
            if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
                
                var $buttons = $(
                    '<div class="simple-keyboard-buttons">' +
                        '<div class="simple-keyboard-buttons__enter selector" nav-selectable="true">Готово</div>' +
                        '<div class="simple-keyboard-buttons__cancel selector" nav-selectable="true">Отменить</div>' +
                    '</div>'
                );

                var triggerEnter = function() {
                    try {
                        var active = document.activeElement;
                        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) active.blur();

                        var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                        var ev = new KeyboardEvent('keydown', eventParams);
                        document.dispatchEvent(ev);
                        active.dispatchEvent(ev);
                        
                        console.log('Lampa Plugin: Enter dispatched safely');
                    } catch (e) { console.error('Enter error:', e); }
                };

                // Назначаем события
                $buttons.find('.simple-keyboard-buttons__enter').on('click hover:enter', function() {
                    triggerEnter();
                });

                $buttons.find('.simple-keyboard-buttons__cancel').on('click hover:enter', function() {
                    if (window.Lampa && Lampa.Controller) Lampa.Controller.back();
                });

                keyboard.append($buttons);

                if (window.Lampa && Lampa.Controller) {
                    // Регистрация контроллера с защитой от ошибок
                    Lampa.Controller.add('custom_kb_ctrl', {
                        toggle: function() {
                            try {
                                Lampa.Controller.collectionSet($buttons);
                                // Убрали collectionFocus, чтобы не было Script Error при расчете координат
                            } catch (e) { console.error('Toggle error:', e); }
                        },
                        up: function() { 
                            try { Lampa.Controller.toggle('keyboard'); } catch(e) {}
                        },
                        left: function() { Lampa.Navigator.move('left'); },
                        right: function() { Lampa.Navigator.move('right'); },
                        back: function() { Lampa.Controller.back(); }
                    });

                    // Глобальный перехват "Вниз"
                    $(document).off('keydown.kb_fix').on('keydown.kb_fix', function(e) {
                        if (e.keyCode === 40) { // Down
                            try {
                                var active = document.activeElement;
                                if (active && active.tagName === 'INPUT') {
                                    Lampa.Controller.toggle('custom_kb_ctrl');
                                }
                            } catch (err) { console.error('Navigation error:', err); }
                        }
                    });

                    Lampa.Controller.update();
                }
            }
        } catch (globalErr) {
            console.error('Lampa Plugin Inject Error:', globalErr);
        }
    }

    var observer = new MutationObserver(function (mutations) {
        if ($('.simple-keyboard').length && !$('.simple-keyboard-buttons').length) {
            inject();
        }
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
