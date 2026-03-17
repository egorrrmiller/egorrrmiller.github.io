(function () {
    'use strict';

    const APPLETV_VERSION = '1.0.0';
    const BASE_URL = 'http://egorrrmiller.github.io/appletv/';
    
    // Иконка плагина (используется старая от Applecation для преемственности)
    const PLUGIN_ICON = '<svg viewBox="110 90 180 210"xmlns=http://www.w3.org/2000/svg><g id=sphere><circle cx=200 cy=140 fill="hsl(200, 80%, 40%)"opacity=0.3 r=1.2 /><circle cx=230 cy=150 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=170 cy=155 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=245 cy=175 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=155 cy=180 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=215 cy=165 fill="hsl(200, 80%, 46%)"opacity=0.36 r=1.2 /><circle cx=185 cy=170 fill="hsl(200, 80%, 43%)"opacity=0.33 r=1.3 /><circle cx=260 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=140 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=250 cy=220 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=150 cy=225 fill="hsl(200, 80%, 47%)"opacity=0.37 r=1.4 /><circle cx=235 cy=240 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=165 cy=245 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=220 cy=255 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=180 cy=258 fill="hsl(200, 80%, 41%)"opacity=0.31 r=1.2 /><circle cx=200 cy=120 fill="hsl(200, 80%, 60%)"opacity=0.5 r=1.8 /><circle cx=240 cy=135 fill="hsl(200, 80%, 65%)"opacity=0.55 r=2 /><circle cx=160 cy=140 fill="hsl(200, 80%, 62%)"opacity=0.52 r=1.9 /><circle cx=270 cy=165 fill="hsl(200, 80%, 70%)"opacity=0.6 r=2.2 /><circle cx=130 cy=170 fill="hsl(200, 80%, 67%)"opacity=0.57 r=2.1 /><circle cx=255 cy=190 fill="hsl(200, 80%, 72%)"opacity=0.62 r=2.3 /><circle cx=145 cy=195 fill="hsl(200, 80%, 69%)"opacity=0.59 r=2.2 /><circle cx=280 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=120 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=275 cy=215 fill="hsl(200, 80%, 73%)"opacity=0.63 r=2.4 /><circle cx=125 cy=220 fill="hsl(200, 80%, 71%)"opacity=0.61 r=2.3 /><circle cx=260 cy=235 fill="hsl(200, 80%, 68%)"opacity=0.58 r=2.2 /><circle cx=140 cy=240 fill="hsl(200, 80%, 66%)"opacity=0.56 r=2.1 /><circle cx=245 cy=255 fill="hsl(200, 80%, 63%)"opacity=0.53 r=2 /><circle cx=155 cy=260 fill="hsl(200, 80%, 61%)"opacity=0.51 r=1.9 /><circle cx=225 cy=270 fill="hsl(200, 80%, 58%)"opacity=0.48 r=1.8 /><circle cx=175 cy=272 fill="hsl(200, 80%, 56%)"opacity=0.46 r=1.7 /><circle cx=200 cy=100 fill="hsl(200, 80%, 85%)"opacity=0.8 r=2.8 /><circle cx=230 cy=115 fill="hsl(200, 80%, 90%)"opacity=0.85 r=3 /><circle cx=170 cy=120 fill="hsl(200, 80%, 87%)"opacity=0.82 r=2.9 /><circle cx=250 cy=140 fill="hsl(200, 80%, 92%)"opacity=0.88 r=3.2 /><circle cx=150 cy=145 fill="hsl(200, 80%, 89%)"opacity=0.84 r=3.1 /><circle cx=265 cy=170 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.4 /><circle cx=135 cy=175 fill="hsl(200, 80%, 93%)"opacity=0.87 r=3.3 /><circle cx=275 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=125 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=200 cy=200 fill="hsl(200, 80%, 100%)"opacity=1 r=4 /><circle cx=220 cy=195 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.8 /><circle cx=180 cy=205 fill="hsl(200, 80%, 97%)"opacity=0.93 r=3.7 /><circle cx=240 cy=210 fill="hsl(200, 80%, 96%)"opacity=0.92 r=3.6 /><circle cx=160 cy=215 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.5 /><circle cx=270 cy=230 fill="hsl(200, 80%, 94%)"opacity=0.88 r=3.4 /><circle cx=130 cy=235 fill="hsl(200, 80%, 92%)"opacity=0.86 r=3.3 /><circle cx=255 cy=250 fill="hsl(200, 80%, 90%)"opacity=0.84 r=3.2 /><circle cx=145 cy=255 fill="hsl(200, 80%, 88%)"opacity=0.82 r=3.1 /><circle cx=235 cy=265 fill="hsl(200, 80%, 86%)"opacity=0.8 r=3 /><circle cx=165 cy=268 fill="hsl(200, 80%, 84%)"opacity=0.78 r=2.9 /><circle cx=215 cy=280 fill="hsl(200, 80%, 82%)"opacity=0.76 r=2.8 /><circle cx=185 cy=282 fill="hsl(200, 80%, 80%)"opacity=0.74 r=2.7 /><circle cx=200 cy=290 fill="hsl(200, 80%, 78%)"opacity=0.72 r=2.6 /><circle cx=210 cy=130 fill="hsl(200, 80%, 88%)"opacity=0.83 r=2.5 /><circle cx=190 cy=135 fill="hsl(200, 80%, 86%)"opacity=0.81 r=2.4 /><circle cx=225 cy=155 fill="hsl(200, 80%, 91%)"opacity=0.86 r=2.8 /><circle cx=175 cy=160 fill="hsl(200, 80%, 89%)"opacity=0.84 r=2.7 /><circle cx=245 cy=185 fill="hsl(200, 80%, 94%)"opacity=0.89 r=3.3 /><circle cx=155 cy=190 fill="hsl(200, 80%, 92%)"opacity=0.87 r=3.2 /><circle cx=260 cy=210 fill="hsl(200, 80%, 95%)"opacity=0.91 r=3.4 /><circle cx=140 cy=215 fill="hsl(200, 80%, 93%)"opacity=0.88 r=3.3 /><circle cx=250 cy=230 fill="hsl(200, 80%, 91%)"opacity=0.85 r=3.2 /><circle cx=150 cy=235 fill="hsl(200, 80%, 89%)"opacity=0.83 r=3.1 /><circle cx=230 cy=245 fill="hsl(200, 80%, 87%)"opacity=0.81 r=3 /><circle cx=170 cy=250 fill="hsl(200, 80%, 85%)"opacity=0.79 r=2.9 /><circle cx=210 cy=260 fill="hsl(200, 80%, 83%)"opacity=0.77 r=2.8 /><circle cx=190 cy=265 fill="hsl(200, 80%, 81%)"opacity=0.75 r=2.7 /></g></svg>';

    // Суб-плагины для загрузки
    const pluginsToLoad = [
        'hero_banner.js',
        'card_design.js',
        'quality_badge.js',
        'episodes.js'
    ];

    function loadScripts() {
        // Подгружаем каждый плагин один за другим
        pluginsToLoad.forEach(plugin => {
            const scriptUrl = BASE_URL + 'src/' + plugin;
            Lampa.Utils.putScript([scriptUrl], function () {}, function () {
                console.log('Apple TV: Сбой загрузки ' + plugin);
            });
        });
    }

    function addSettings() {
        // Дефолтные настройки
        if (Lampa.Storage.get('appletv_logo_scale') === undefined) {
            Lampa.Storage.set('appletv_logo_scale', '100');
        }
        if (Lampa.Storage.get('appletv_text_scale') === undefined) {
            Lampa.Storage.set('appletv_text_scale', '100');
        }
        if (Lampa.Storage.get('appletv_spacing_scale') === undefined) {
            Lampa.Storage.set('appletv_spacing_scale', '100');
        }
        if (Lampa.Storage.get('appletv_reverse_episodes') === undefined) {
            Lampa.Storage.set('appletv_reverse_episodes', true);
        }
        if (Lampa.Storage.get('appletv_description_overlay') === undefined) {
            Lampa.Storage.set('appletv_description_overlay', true);
        }
        if (Lampa.Storage.get('appletv_show_foreign_logo') === undefined) {
            Lampa.Storage.set('appletv_show_foreign_logo', true);
        }
        if (Lampa.Storage.get('appletv_liquid_glass') === undefined) {
            Lampa.Storage.set('appletv_liquid_glass', true);
        }
        if (Lampa.Storage.get('appletv_show_episode_count') === undefined) {
            Lampa.Storage.set('appletv_show_episode_count', false);
        }
        if (Lampa.Storage.get('appletv_hero_banner') === undefined) {
            Lampa.Storage.set('appletv_hero_banner', true);
        }

        // Подключаем компонент
        Lampa.SettingsApi.addComponent({
            component: 'appletv_settings',
            name: 'Apple TV UI',
            icon: PLUGIN_ICON
        });

        // Инфо
        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_about', type: 'static' },
            field: { name: '<div>Apple TV UI v' + APPLETV_VERSION + '</div>' },
            onRender: function (item) {
                item.css('opacity', '0.7');
                item.find('.settings-param__name').css({
                    'font-size': '1.2em',
                    'margin-bottom': '0.3em'
                });
                item.append('<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">Премиум оформление в стиле Apple TV. Работает модульно.</div>');
            }
        });

        // Настройки отображения
        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'title_display', type: 'title' },
            field: { name: 'Отображение' }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_hero_banner', type: 'trigger', default: true },
            field: {
                name: 'Hero Баннер',
                description: 'Показывать большой трендовый постер на Главной'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_hero_banner', value);
                Lampa.Settings.update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_description_overlay', type: 'trigger', default: true },
            field: {
                name: 'Описание в оверлее',
                description: 'Показывать описание в отдельном окне по клику'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_description_overlay', value);
                Lampa.Settings.update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_liquid_glass', type: 'trigger', default: true },
            field: {
                name: 'Жидкое стекло',
                description: 'Эффект «стеклянных» карточек при наведении в эпизодах и актерах'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_liquid_glass', value);
                if (value) {
                    $('body').removeClass('appletv--no-liquid-glass');
                } else {
                    $('body').addClass('appletv--no-liquid-glass');
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_show_foreign_logo', type: 'trigger', default: true },
            field: {
                name: 'Логотип на английском',
                description: 'Показывать англ. логотип если нет русского'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_show_foreign_logo', value);
            }
        });

        // Настройки серий
        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'title_episodes', type: 'title' },
            field: { name: 'Эпизоды' }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_reverse_episodes', type: 'trigger', default: true },
            field: {
                name: 'Перевернуть список эпизодов',
                description: 'Показывать в начале новые серии'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_reverse_episodes', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_show_episode_count', type: 'trigger', default: false },
            field: {
                name: 'Количество серий',
                description: 'Выводить количество эпизодов'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_show_episode_count', value);
            }
        });

        // Настройки масштабирования
        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'title_scale', type: 'title' },
            field: { name: 'Масштаб (перезайти в карточку для применения)' }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: {
                name: 'appletv_logo_scale',
                type: 'select',
                values: {
                    '70': 'Мелкий',
                    '85': 'Уменьшенный',
                    '100': 'По умолчанию',
                    '115': 'Увеличенный',
                    '130': 'Крупный'
                },
                default: '100'
            },
            field: {
                name: 'Размер логотипа'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_logo_scale', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: {
                name: 'appletv_text_scale',
                type: 'select',
                values: {
                    '70': 'Мелкий (-30%)',
                    '85': 'Уменьшенный (-15%)',
                    '100': 'По умолчанию',
                    '115': 'Увеличенный (+15%)',
                    '130': 'Крупный (+30%)'
                },
                default: '100'
            },
            field: {
                name: 'Размер текста'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_text_scale', value);
            }
        });
    }

    function init() {
        window.appletv_plugin = true;
        
        console.log('Apple TV', 'v' + APPLETV_VERSION, 'Loader init');

        // Начальная настройка body-классов
        if (!Lampa.Storage.get('appletv_liquid_glass', true)) {
            $('body').addClass('appletv--no-liquid-glass');
        }

        addSettings();
        loadScripts();
    }

    if (window.appletv_plugin) console.log('Apple TV', 'Plugin already loaded.');
    else init();

})();
