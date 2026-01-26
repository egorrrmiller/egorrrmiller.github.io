(function () {
    'use strict';

    function applyScale() {
        var scale = Lampa.Storage.field('interface_scale_custom');
        
        // Если значение не задано или "Отключено" (пустая строка), ничего не делаем
        if (!scale || scale === '') return;

        var fs = parseFloat(scale);
        if (isNaN(fs)) return;

        // Формула из layer.js: Math.max(window.innerWidth / 84.17 * fs, 10.6)
        var size = Math.max(window.innerWidth / 84.17 * fs, 10.6);
        
        $('body').css('font-size', size + 'px');
        console.log('Interface Scale Plugin: Applied scale', fs, 'Resulting font-size:', size);
    }

    // Добавляем параметр в настройки
    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'interface') {
            var field = {
                title: 'Кастомный масштаб',
                type: 'select',
                name: 'interface_scale_custom',
                values: {
                    '': 'Отключено',
                    '0.5': '0.5',
                    '0.6': '0.6',
                    '0.7': '0.7',
                    '0.75': '0.75',
                    '0.8': '0.8',
                    '0.85': '0.85',
                    '0.9': '0.9',
                    '0.95': '0.95',
                    '1.0': '1.0',
                    '1.1': '1.1',
                    '1.2': '1.2',
                    '1.3': '1.3',
                    '1.5': '1.5'
                },
                default: ''
            };

            var item = Lampa.SettingsApi.createParam(field);
            
            // Пытаемся вставить после стандартной настройки размера
            var target = e.body.find('[data-name="interface_size"]');
            if (target.length) {
                target.after(item);
            } else {
                // Если не нашли, добавляем в конец списка параметров
                e.body.find('.settings-param').last().after(item);
            }
        }
    });

    // Слушаем изменение настройки
    Lampa.Storage.listener.follow('change', function (e) {
        if (e.name == 'interface_scale_custom') {
            applyScale();
        }
    });

    // Слушаем ресайз окна. 
    // В layer.js стоит таймаут 100мс. Ставим 200мс, чтобы перебить его.
    $(window).on('resize', function () {
        setTimeout(applyScale, 200);
    });

    // Применяем при старте
    // Ждем инициализации Lampa
    var waitLoad = setInterval(function(){
        if(window.Lampa && ($('body').hasClass('size--normal') || $('body').hasClass('size--small') || $('body').hasClass('size--bigger'))){
            clearInterval(waitLoad);
            applyScale();
        }
    }, 200);
    
    // На всякий случай через секунду тоже
    setTimeout(applyScale, 1000);

})();
