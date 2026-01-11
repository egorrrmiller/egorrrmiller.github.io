(function () {  
    'use strict';  
  
    function injectCustomButtons() {  
        try {  
            var keyboard = $('.simple-keyboard');  
              
            if (keyboard.length && !keyboard.find('.simple-keyboard-buttons').length) {  
                  
                var $buttons = $(  
                    '<div class="simple-keyboard-buttons">' +  
                        '<div class="simple-keyboard-buttons__enter selector" data-controller="custom_keyboard">Готово</div>' +  
                        '<div class="simple-keyboard-buttons__cancel selector" data-controller="custom_keyboard">Отменить</div>' +  
                    '</div>'  
                );  
  
                // Обработчик кнопки "Готово"  
                $buttons.find('.simple-keyboard-buttons__enter').on('click', function (e) {  
                    try {  
                        var input = document.querySelector('.simple-keyboard-input') || document.querySelector('#orsay-keyboard');  
                          
                        if (input) {  
                            input.blur();  
  
                            var eventParams = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };  
                            var down = new KeyboardEvent('keydown', eventParams);  
                            var up = new KeyboardEvent('keyup', eventParams);  
  
                            input.dispatchEvent(down);  
                            document.dispatchEvent(down);  
                              
                            input.dispatchEvent(up);  
                            document.dispatchEvent(up);  
  
                            console.log('Lampa Plugin: Native Enter Dispatched');  
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
  
                // Регистрируем контроллер для навигации  
                if (window.Lampa && window.Lampa.Controller) {  
                    window.Lampa.Controller.add('custom_keyboard', {  
                        toggle: () => {  
                            window.Lampa.Controller.collectionSet($buttons);  
                            window.Lampa.Controller.collectionFocus($buttons.find('.simple-keyboard-buttons__enter')[0], $buttons);  
                        },  
                        right: () => {  
                            window.Lampa.Navigator.move('right');  
                        },  
                        left: () => {  
                            window.Lampa.Navigator.move('left');  
                        },  
                        back: () => {  
                            window.Lampa.Controller.back();  
                        }  
                    });  
                }  
  
                // Обновляем контроллер  
                if (window.Lampa && window.Lampa.Controller && window.Lampa.Controller.update) {  
                    window.Lampa.Controller.update();  
                }  
            }  
        } catch (globalErr) {  
            console.error('Lampa Plugin: Critical Error:', globalErr);  
        }  
    }  
  
    var observer = new MutationObserver(function (mutations) {  
        mutations.forEach(function (mutation) {  
            if (mutation.addedNodes.length) injectCustomButtons();  
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
