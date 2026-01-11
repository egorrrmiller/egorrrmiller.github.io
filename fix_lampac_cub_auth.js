(function () {
    'use strict';

    function inject() {
        var keyboard = $('.simple-keyboard');
        // Проверка: клавиатура есть, а наших кнопок еще нет
        if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {
            
            var $buttons = $(
                '<div class="simple-keyboard-buttons">' +
                    '<div class="simple-keyboard-buttons__enter selector" nav-selectable="true">Готово</div>' +
                    '<div class="simple-keyboard-buttons__cancel selector" nav-selectable="true">Отменить</div>' +
                '</div>'
            );

            // Универсальный метод "Ввода"
            var doEnter = function() {
                // Берем тот элемент, который сейчас в фокусе (инпут)
                var active = document.activeElement;
                if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
                    active.blur(); // Сохраняем введенное
                }

                // Генерируем событие Enter на всем документе (самый надежный способ для ТВ)
                var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
                document.dispatchEvent(new KeyboardEvent('keydown', eventParams));
                document.dispatchEvent(new KeyboardEvent('keyup', eventParams));
                
                // Дополнительно: пробуем нажать через контроллер Lampa
                if (window.Lampa && Lampa.Controller) {
                    var current = Lampa.Controller.enabled();
                    if (current && current.onEnter) current.onEnter();
                }
            };

            // Привязываем действия к кнопкам
            $buttons.find('.simple-keyboard-buttons__enter').on('click hover:enter', function() {
                doEnter();
            });

            $buttons.find('.simple-keyboard-buttons__cancel').on('click hover:enter', function() {
                if (window.Lampa && window.Lampa.Controller) Lampa.Controller.back();
            });

            keyboard.append($buttons);

            // Оптимизация навигации для ТВ
            if (window.Lampa && window.Lampa.Controller) {
                // Регистрируем кнопки в системе
                Lampa.Controller.add('custom_kb_ctrl', {
                    toggle: function() {
                        Lampa.Controller.collectionSet($buttons);
                        Lampa.Controller.collectionFocus($buttons.find('.simple-keyboard-buttons__enter')[0], $buttons);
                    },
                    up: function() { Lampa.Controller.toggle('keyboard'); },
                    left: function() { Lampa.Navigator.move('left'); },
                    right: function() { Lampa.Navigator.move('right'); },
                    back: function() { Lampa.Controller.back(); }
                });

                // Перехват стрелки ВНИЗ: если фокус на инпуте, уходим на кнопки
                $(document).off('keydown.kb_fix').on('keydown.kb_fix', function(e) {
                    if (e.keyCode === 40) { // Down
                        var active = document.activeElement;
                        if (active && active.tagName === 'INPUT') {
                            Lampa.Controller.toggle('custom_kb_ctrl');
                        }
                    }
                });

                Lampa.Controller.update();
            }
        }
    }

    // Следим за DOM
    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length) {
                inject();
                break;
            }
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
