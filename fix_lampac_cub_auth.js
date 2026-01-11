(function () {  
    'use strict';  
  
    function injectCustomButtons() {  
        try {  
            var keyboard = $('.simple-keyboard');  
              
            if (keyboard.length && !keyboard.find('.my-custom-buttons').length) {  
                  
                var $buttons = $(  
                    '<div class="simple-keyboard-buttons my-custom-buttons">' +  
                        '<div class="simple-keyboard-buttons__enter selector">Готово</div>' +  
                        '<div class="simple-keyboard-buttons__cancel selector">Отменить</div>' +  
                    '</div>'  
                );  
  
                // Обработчик кнопки "Готово"  
                $buttons.find('.simple-keyboard-buttons__enter').on('click', function (e) {  
                    try {  
                        var input = $('.simple-keyboard-input');  
                          
                        if (input.length) {  
                            input.focus();  
                              
                            // Имитируем нажатие Enter на поле ввода  
                            var enterEvent = $.Event('keydown');  
                            enterEvent.which = 13;  
                            enterEvent.keyCode = 13;  
                            enterEvent.preventDefault = function() { return false; };  
                              
                            input.trigger(enterEvent);  
                        }  
                    } catch (err) {  
                        console.error('Lampa Plugin: Error in Enter click:', err);  
                    }  
                });  
  
                // Обработчик кнопки "Отменить"  
                $buttons.find('.simple-keyboard-buttons__cancel').on('click', function (e) {  
                    try {  
                        if (window.Lampa && window.Lampa.Controller) {  
                            window.Lampa.Controller.back();  
                        }  
                    } catch (err) {  
                        console.error('Lampa Plugin: Error in Cancel click:', err);  
                    }  
                });  
  
                // Добавляем кнопки  
                keyboard.append($buttons);  
  
                // Интегрируем в существующую систему навигации  
                integrateNavigation();  
            }  
        } catch (globalErr) {  
            console.error('Lampa Plugin: Critical Error:', globalErr);  
        }  
    }  
  
    function integrateNavigation() {  
        if (!window.Lampa || !window.Lampa.Controller) return;  
  
        // Получаем текущий активный контроллер  
        var enabled = window.Lampa.Controller.enabled();  
          
        if (enabled && enabled.name === 'keyboard') {  
            var controller = enabled.controller;  
            var originalDown = controller.down;  
              
            // Переопределяем метод down для перехода к кнопкам  
            controller.down = function() {  
                var focused = window.Lampa.Controller.focused();  
                var input = $('.simple-keyboard-input');  
                  
                // Если фокус на input и нельзя двигаться вниз по клавиатуре  
                if (focused && input.is(focused) && !window.Lampa.Navigator.canmove('down')) {  
                    // Переключаемся на наши кнопки  
                    window.Lampa.Controller.collectionSet($('.my-custom-buttons'));  
                    window.Lampa.Controller.collectionFocus(  
                        $('.my-custom-buttons .simple-keyboard-buttons__enter')[0],  
                        $('.my-custom-buttons')  
                    );  
                } else {  
                    // Стандартное поведение  
                    originalDown.call(this);  
                }  
            };  
              
            // Добавляем обработчик для кнопок  
            $('.my-custom-buttons .selector').on('hover:focus', function() {  
                window.Lampa.Controller.collectionSet($('.my-custom-buttons'));  
            });  
              
            // Обработчик up для возврата к input  
            var originalUp = controller.up;  
            controller.up = function() {  
                var focused = window.Lampa.Controller.focused();  
                var input = $('.simple-keyboard-input');  
                  
                // Если фокус на кнопках  
                if (focused && $('.my-custom-buttons').has(focused).length) {  
                    input.focus();  
                } else {  
                    originalUp.call(this);  
                }  
            };  
        }  
    }  
  
    var observer = new MutationObserver(function (mutations) {  
        mutations.forEach(function (mutation) {  
            if (mutation.addedNodes.length) {  
                injectCustomButtons();  
            }  
        });  
    });  
  
    function start() {  
        if (window.appready) {  
            observer.observe(document.body, { childList: true, subtree: true });  
            injectCustomButtons();  
        } else {  
            setTimeout(start, 200);  
        }  
    }  
  
    start();  
})();
