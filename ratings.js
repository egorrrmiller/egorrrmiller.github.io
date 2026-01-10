(function () {  
    'use strict';  
  
    function startPlugin() {  
        // Проверяем, инициализирована ли система Params  
        if (typeof Lampa.Params !== 'undefined' && Lampa.Params.select) {  
            setupSettings();  
        } else {  
            // Если Params еще не готов, ждем инициализации  
            setTimeout(startPlugin, 100);  
        }  
    }  
  
    function setupSettings() {  
        // Регистрируем параметр (теперь Params точно инициализирован)  
        Lampa.Params.select('custom_api_key', '', '');  
  
        // Регистрируем компонент  
        Lampa.SettingsApi.addComponent({  
            component: 'custom_api',  
            name: 'API Ключ',  
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/></svg>'  
        });  
  
        // Добавляем параметр  
        Lampa.SettingsApi.addParam({  
            component: 'custom_api',  
            param: {  
                name: 'custom_api_key',  
                type: 'input',  
                default: '',  
                placeholder: 'Введите ваш API ключ...'  
            },  
            field: {  
                name: 'API Ключ',  
                descr: 'Введите ваш персональный API ключ для доступа к сервису'  
            }  
        });  
    }  
  
    // Инициализация плагина  
    if (window.appready) {  
        startPlugin();  
    } else {  
        Lampa.Listener.follow('app', function (e) {  
            if (e.type == 'ready') {  
                startPlugin();  
            }  
        });  
    }  
})();
