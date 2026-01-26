(function () {
    'use strict';

    function applyScale() {
        var scale = Lampa.Storage.field('interface_scale_custom');
        
        if (!scale || scale === '') return;

        var fs = parseFloat(scale);
        if (isNaN(fs)) return;

        var size = Math.max(window.innerWidth / 84.17 * fs, 10.6);
        
        $('body').css('font-size', size + 'px');
        console.log('Interface Scale Plugin: Applied scale', fs, 'Resulting font-size:', size);
    }

    // Регистрируем параметр в Params
    Lampa.Params.select('interface_scale_custom', {
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
    }, '');

    // Встраиваемся в меню настроек
    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'interface') {
            var item = $(`
                <div class="settings-param selector" data-type="select" data-name="interface_scale_custom">
                    <div class="settings-param__name">Кастомный масштаб</div>
                    <div class="settings-param__value"></div>
                    <div class="settings-param__descr">Изменить масштаб интерфейса</div>
                </div>
            `);

            var target = e.body.find('[data-name="interface_size"]');
            if (target.length) {
                target.after(item);
            } else {
                e.body.find('.settings-param').last().after(item);
            }

            Lampa.Params.bind(item);
        }
    });

    Lampa.Storage.listener.follow('change', function (e) {
        if (e.name == 'interface_scale_custom') {
            applyScale();
        }
    });

    $(window).on('resize', function () {
        setTimeout(applyScale, 200);
    });

    var waitLoad = setInterval(function(){
        if(window.Lampa && ($('body').hasClass('size--normal') || $('body').hasClass('size--small') || $('body').hasClass('size--bigger'))){
            clearInterval(waitLoad);
            applyScale();
        }
    }, 200);
    
    setTimeout(applyScale, 1000);

})();
