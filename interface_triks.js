(function () {
    'use strict';

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'ui_custom_zoom_fine',
            type: 'static',
            default: '100'
        },
        field: {
            name: 'Точный масштаб',
            description: 'Безопасное изменение размера (через CSS)'
        },
        onRender: function (item) {
            var current = Lampa.Storage.field('ui_custom_zoom_fine') || '100';
            item.find('.settings-param__value').text(current + '%');

            item.on('hover:enter', function () {
                var values = ['70', '75', '80', '85', '90', '95', '100', '105', '110'];
                var menu = values.map(function (v) {
                    return {
                        title: v + '%',
                        value: v,
                        selected: v == current
                    };
                });

                Lampa.Select.show({
                    title: 'Выберите масштаб',
                    items: menu,
                    onBack: function () {
                        Lampa.Controller.toggle('settings_interface');
                    },
                    onSelect: function (a) {
                        Lampa.Storage.set('ui_custom_zoom_fine', a.value);
                        item.find('.settings-param__value').text(a.value + '%');
                        applyZoom(a.value);
                        
                        // Даем контроллеру Lampa время осознать изменения
                        setTimeout(function(){
                            Lampa.Controller.toggle('settings_interface');
                        }, 200);
                    }
                });
            });
        }
    });

    function applyZoom(value) {
        var zoomValue = value || Lampa.Storage.field('ui_custom_zoom_fine') || '100';
        
        // Удаляем предыдущий стиль
        $('#lampa-custom-zoom-css').remove();

        // Рассчитываем множитель. 
        // Lampa обычно ставит 10px или 16px на html. 
        // Мы будем использовать vh/vw или проценты, которые не ломают расчеты координат.
        var style = $('<style id="lampa-custom-zoom-css">' +
            ':root {' +
                '--ui-zoom: ' + (parseInt(zoomValue) / 100) + ';' +
            '}' +
            'html {' +
                // Используем вычисление, которое Lampa подхватит в своих скриптах
                'font-size: calc(' + zoomValue + '% * (100vw / 1280)) !important;' +
            '}' +
            // Адаптация для разных разрешений экрана (ТВ стандарт)
            '@media screen and (min-width: 1920px) {' +
                'html { font-size: calc(' + zoomValue + '% * (100vw / 1920)) !important; }' +
            '}' +
            '</style>');

        $('head').append(style);

        // КРИТИЧЕСКИ ВАЖНО: принудительный resize для обновления сетки навигации
        if (window.appready) {
            setTimeout(function() {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        }
    }

    function injectSetting() {
        Lampa.Listener.follow('settings', function (e) {
            if (e.type == 'open' && e.name == 'interface') {
                setTimeout(function () {
                    var standardSize = e.body.find('.settings-param[data-name="interface_size"]');
                    var mySetting = e.body.find('.settings-param[data-name="ui_custom_zoom_fine"]');
                    if (standardSize.length && mySetting.length) {
                        mySetting.insertAfter(standardSize);
                    }
                }, 50);
            }
        });
    }

    if (window.appready) {
        applyZoom();
        injectSetting();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                applyZoom();
                injectSetting();
            }
        });
    }
})();
