(function () {
    'use strict';

    // 1. Добавляем параметр в хранилище Lampa, чтобы он был доступен
    Lampa.SettingsApi.addParam({
        component: 'interface', // Интегрируем в стандартный компонент "Интерфейс"
        param: {
            name: 'ui_custom_zoom_fine',
            type: 'select',
            default: '100'
        },
        field: {
            name: 'Точный масштаб',
            description: 'Более детальная настройка размера элементов'
        },
        values: {
            '70': '70%',
            '75': '75%',
            '80': '80%',
            '85': '85%',
            '90': '90%',
            '95': '95%',
            '100': 'Стандарт (100%)',
            '105': '105%',
            '110': '110%'
        },
        onChange: function (value) {
            applyZoom(value);
        }
    });

    /**
     * Функция применения масштаба
     */
    function applyZoom(value) {
        var zoomValue = value || Lampa.Storage.field('ui_custom_zoom_fine') || '100';
        $('#lampa-custom-zoom-style').remove();
        
        var style = $('<style id="lampa-custom-zoom-style">' +
            'html { font-size: ' + zoomValue + '% !important; }' +
            '</style>');
        $('head').append(style);
        $(window).trigger('resize');
    }

    /**
     * Логика перемещения элемента в интерфейсе настроек
     */
    function injectSetting() {
        Lampa.Listener.follow('settings', function (e) {
            // Если открыт компонент интерфейса
            if (e.type == 'open' && e.name == 'interface') {
                setTimeout(function () {
                    var body = e.body;
                    // Ищем стандартный селектор размера интерфейса
                    var standardSize = body.find('.settings-param[data-name="interface_size"]');
                    // Ищем нашу новую настройку (Lampa рендерит её в конце списка)
                    var mySetting = body.find('.settings-param[data-name="ui_custom_zoom_fine"]');

                    if (standardSize.length && mySetting.length) {
                        // Переносим нашу настройку сразу ПОСЛЕ стандартной
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
