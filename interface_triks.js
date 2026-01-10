(function () {
    'use strict';

    // Регистрируем параметр в стандартном компоненте "Интерфейс"
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'ui_custom_zoom_fine',
            type: 'static', // Тип static делает параметр похожим на кнопку
            default: '100'
        },
        field: {
            name: 'Точный масштаб',
            description: 'Ручная регулировка размера элементов'
        },
        onRender: function (item) {
            // Устанавливаем отображение текущего значения в поле
            var current = Lampa.Storage.field('ui_custom_zoom_fine') || '100';
            item.find('.settings-param__value').text(current + '%');

            // Вешаем событие клика для вызова Lampa.Select
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
                        Lampa.Controller.toggle('settings_interface'); // Возвращаем фокус в настройки
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
        $('#lampa-custom-zoom-style').remove();
        var style = $('<style id="lampa-custom-zoom-style">' +
            'html { font-size: ' + zoomValue + '% !important; }' +
            '</style>');
        $('head').append(style);
        $(window).trigger('resize');
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

    // Инициализация
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
