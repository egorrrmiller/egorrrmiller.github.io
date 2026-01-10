(function () {
    'use strict';

    // Регистрируем параметр
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'ui_custom_zoom_fine',
            type: 'static',
            default: '100'
        },
        field: {
            name: 'Точный масштаб',
            description: 'Принудительное изменение размера элементов'
        },
        onRender: function (item) {
            var current = Lampa.Storage.field('ui_custom_zoom_fine') || '100';
            item.find('.settings-param__value').text(current + '%');

            item.on('hover:enter', function () {
                var values = ['70', '75', '80', '85', '90', '95', '100', '105', '110', '115', '120'];
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
                        Lampa.Controller.toggle('settings_interface');
                    }
                });
            });
        }
    });

    function applyZoom(value) {
        var zoomValue = value || Lampa.Storage.field('ui_custom_zoom_fine') || '100';
        var decimalZoom = parseInt(zoomValue) / 100;

        $('#lampa-custom-zoom-style').remove();

        // Создаем стиль, который бьет по всем ключевым точкам
        var style = $('<style id="lampa-custom-zoom-style">' +
            // 1. Пробуем через корень
            'html { font-size: ' + zoomValue + '% !important; } ' +
            // 2. Дополнительно масштабируем главный контейнер для гарантии
            'body > .wrap { ' +
                'zoom: ' + decimalZoom + ' !important; ' +
            '}' +
            // Фикс для корректного отображения фонов при зуме
            '.background, .background__image { zoom: ' + (1 / decimalZoom) + ' !important; }' +
            '</style>');

        $('head').append(style);

        // Форсируем пересчет размеров внутри Lampa
        setTimeout(function() {
            $(window).trigger('resize');
            if (window.Lampa && Lampa.Items && Lampa.Items.update) Lampa.Items.update();
        }, 100);
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
                }, 10);
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
