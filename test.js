(function () {
    'use strict';

    var lastInputType = 'key';
    var scrollTimer;

    // Добавляем стиль для отключения ховера при скролле
    var style = document.createElement('style');
    style.innerHTML = '.disable-hover, .disable-hover * { pointer-events: none !important; }';
    document.head.appendChild(style);

    function setMouse() {
        lastInputType = 'mouse';
    }

    // Отслеживаем движение мыши и колесо
    window.addEventListener('mousemove', setMouse, true);
    window.addEventListener('wheel', setMouse, true);
    window.addEventListener('mousedown', setMouse, true);

    // Отслеживаем нажатие кнопок
    window.addEventListener('keydown', function() {
        lastInputType = 'key';
    }, true);

    // Блокируем ховер во время скролла
    window.addEventListener('scroll', function() {
        if (lastInputType === 'mouse') {
            document.body.classList.add('disable-hover');
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() {
                document.body.classList.remove('disable-hover');
            }, 500);
        }
    }, true);
    
    // Также ловим wheel, так как scroll может не срабатывать на некоторых элементах или при кастомном скролле
    window.addEventListener('wheel', function() {
        if (lastInputType === 'mouse') {
            document.body.classList.add('disable-hover');
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() {
                document.body.classList.remove('disable-hover');
            }, 500);
        }
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

        var originalUpdate = Lampa.Scroll.prototype.update;

        Lampa.Scroll.prototype.update = function(element, immediate) {
            if (lastInputType === 'mouse') {
                return;
            }
            return originalUpdate.apply(this, arguments);
        };
        
        var originalWheel = Lampa.Scroll.prototype.wheel;
        Lampa.Scroll.prototype.wheel = function(size) {
             
             if (lastInputType === 'mouse' && !Lampa.Platform.screen('tv')) {
                 return;
             }
             return originalWheel.apply(this, arguments);
        };
    }
})();
