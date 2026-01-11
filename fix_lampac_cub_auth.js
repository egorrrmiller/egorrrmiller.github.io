(function () {  
    'use strict';  
  
    function injectCustomButtons() {  
        try {  
            // Ищем контейнер клавиатуры  
            var keyboard = $('.simple-keyboard');  
              
            // Если клавиатура на месте, а наших кнопок еще нет  
            if (keyboard.length && !keyboard.find('.my-custom-buttons').length) {  
                  
                // Создаем блок кнопок  
                var $buttons = $(  
                    '<div class="simple-keyboard-buttons my-custom-buttons">' +  
                        '<div class="simple-keyboard-buttons__enter selector" style="pointer-events: all; cursor: pointer;">Готово</div>' +  
                        '<div class="simple-keyboard-buttons__cancel selector" style="pointer-events: all; cursor: pointer;">Отменить</div>' +  
                    '</div>'  
                );  
  
                // Обработчик кнопки "Готово"  
                $buttons.find('.simple-keyboard-buttons__enter').on('click', function (e) {  
                    try {  
                        var input = $('.simple-keyboard-input');  
                          
                        if (input.length) {  
                            // Фокусируем поле ввода  
                            input.focus();  
                            var value = input.val();  
                              
                            // Метод 1: Ищем и нажимаем стандартную кнопку Enter  
                            var standardEnter = $('.simple-keyboard__button--enter, .hg-button[data-skbtn="{ENTER}"]');  
                            if (standardEnter.length) {  
                                standardEnter.trigger('click');  
                                console.log('Enter triggered via standard button');  
                                return;  
                            }  
                              
                            // Метод 2: Ищем экземпляр клавиатуры и используем его listener  
                            var keyboardData = keyboard.data();  
                            if (keyboardData && keyboardData.listener) {  
                                keyboardData.listener.send('enter', {  
                                    code: 13,   
                                    enabled: true,   
                                    value: value,  
                                    fromCustomButton: true  
                                });  
                                console.log('Enter sent via keyboard listener');  
                            }  
                              
                            // Метод 3: Глобальная отправка события  
                            window.Lampa.Listener.send('enter', {  
                                code: 13,   
                                enabled: true,   
                                value: value,  
                                fromCustomButton: true  
                            });  
                              
                            // Метод 4: Вызываем Controller.enter()  
                            window.Lampa.Controller.enter();  
                              
                            console.log('Enter triggered with value:', value);  
                        }  
                    } catch (err) {  
                        console.error('Lampa Plugin: Error in Enter click:', err);  
                    }  
                });  
  
                // Обработчик кнопки "Отменить"  
                $buttons.find('.simple-keyboard-buttons__cancel').on('click', function (e) {  
                    try {  
                        e.preventDefault();  
                          
                        if (window.Lampa && window.Lampa.Controller) {  
                            window.Lampa.Controller.back();  
                        } else {  
                            var event = $.Event('keydown');  
                            event.which = 27; // Esc  
                            $(document).trigger(event);  
                        }  
                    } catch (err) {  
                        console.error('Lampa Plugin: Error in Cancel click:', err);  
                    }  
                });  
  
                // Добавляем кнопки  
                keyboard.append($buttons);  
  
                // Обновляем контроллер для навигации  
                if (window.Lampa && window.Lampa.Controller && window.Lampa.Controller.update) {  
                    window.Lampa.Controller.update();  
                }  
            }  
        } catch (globalErr) {  
            console.error('Lampa Plugin: Critical Error in injectCustomButtons:', globalErr);  
        }  
    }  
  
    // Следим за изменениями DOM  
    var observer = new MutationObserver(function (mutations) {  
        mutations.forEach(function (mutation) {  
            if (mutation.addedNodes.length) {  
                injectCustomButtons();  
            }  
        });  
    });  
  
    function start() {  
        try {  
            if (window.appready) {  
                observer.observe(document.body, {  
                    childList: true,  
                    subtree: true  
                });  
                injectCustomButtons();  
            } else {  
                setTimeout(start, 200);  
            }  
        } catch (e) {  
            console.error('Lampa Plugin: Start function failed:', e);  
        }  
    }  
  
    start();  
})();
