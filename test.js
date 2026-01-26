(function () {
    'use strict';

    var lastInputType = 'key';

    // Отслеживаем движение мыши
    // Используем capture фазу, чтобы поймать событие раньше всех
    window.addEventListener('mousemove', function() {
        lastInputType = 'mouse';
    }, true);

    // Отслеживаем нажатие кнопок (пульт/клавиатура)
    window.addEventListener('keydown', function() {
        lastInputType = 'key';
    }, true);

    // Ждем загрузки Lampa
    var waitLoad = setInterval(function(){
        if(window.Lampa && window.Lampa.Scroll){
            clearInterval(waitLoad);
            init();
        }
    }, 200);

    function init() {
        console.log('Mouse Control Plugin: Init');

        // Сохраняем оригинальный метод обновления скролла
        var originalUpdate = Lampa.Scroll.prototype.update;

        // Переопределяем метод
        Lampa.Scroll.prototype.update = function(element, immediate) {
            // Если последнее действие было мышкой, блокируем авто-скролл
            if (lastInputType === 'mouse') {
                // Мы не вызываем оригинальный метод, поэтому сдвига не происходит.
                // Элемент получит фокус (класс focus), но контейнер не сдвинется.
                return;
            }

            // Если управление с пульта/клавиатуры — работаем как обычно
            return originalUpdate.apply(this, arguments);
        };

        // Дополнительно: фикс для колесика мыши
        // В Lampa колесико иногда перехватывается неправильно.
        // Но блокировка Scroll.update обычно решает главную проблему "убегания".
    }
})();
