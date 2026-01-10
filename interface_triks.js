(function () {
    'use strict';

    // Регистрируем параметр в разделе "Интерфейс"
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'ui_custom_zoom_fine',
            type: 'static',
            default: '100'
        },
        field: {
            name: 'Точный масштаб',
            description: 'Безопасное изменение размера элементов'
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
                        
                        // Возврат фокуса с задержкой для пересчета координат
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
        var ratio = parseInt(zoomValue) / 100;

        $('#lampa-custom-zoom-fine').remove();

        // Мы воздействуем на переменную --ms, которую Lampa использует для масштабирования.
        // Это заставляет приложение пересчитать и визуал, и сетку навигации.
        var style = $('<style id="lampa-custom-zoom-fine">' +
            ':root {' +
                '--ms: ' + ratio + ' !important;' +
            '}' +
            '</style>');

        $('head').append(style);

        // Сообщаем движку Lampa, что нужно обновить геометрию слоев
        if (window.appready) {
            // Стандартный способ Lampa обновить слои
            if (Lampa.Layer && Lampa.Layer.update) Lampa.Layer.update();
            
            // Триггерим ресайз для всех слушателей
            window.dispatchEvent(new Event('resize'));
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
                }, 30);
            }
        });
    }

    // Запуск
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
