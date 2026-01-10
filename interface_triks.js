(function () {
    'use strict';

    function startSwitchMouse() {
        if (window.switch_mouse_init) return;
        window.switch_mouse_init = true;

        // 1. Вывод платформы в консоль через системный метод
        if (typeof Lampa !== 'undefined' && Lampa.Platform) {
            console.log('MOUSE PLUGIN: Platform identified as', Lampa.Platform.type());
        }

        // 2. Функция фиксации мыши (скролл без открытия меню)
        var fixMouseLogic = function() {
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    e.stopImmediatePropagation();
                }
            }, {passive: true, capture: true});

            var styles = `
                /* Включаем нативный скролл и отключаем перехват слоями */
                .scroll--mask, .items-line__body, .category-full__body, .full-start__body, .settings-list, .layer--full {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                .scroll--mask::-webkit-scrollbar { display: none; }
                .scroll--over { pointer-events: all !important; }
                .scroll__scrollbar { display: none !important; }
            `;
            
            if (!$('#lampa-mouse-fix').length) {
                $('<style id="lampa-mouse-fix">').text(styles).appendTo('head');
            }
        };

        // 3. Регистрация в настройках (Остальное -> Тип управления)
        var addToSettings = function() {
            if ($('.weapon_choised_reset').length) return;

            Lampa.SettingsApi.addParam({
                component: 'more',
                param: {
                    name: 'navigation_type_toggle',
                    type: 'static',
                    default: false
                },
                field: {
                    name: 'Тип управления (Мышь/Пульт)',
                    description: 'Текущий режим: ' + (Lampa.Storage.get('navigation_type') === 'mouse' ? 'МЫШЬ' : 'ПУЛЬТ')
                },
                onRender: function(item) {
                    item.addClass('weapon_choised_reset');
                    item.find('.settings-param__value').text('Изменить');
                    
                    item.on('hover:enter click', function(e) {
                        if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                        
                        let current = Lampa.Storage.get('navigation_type');
                        if (current === 'mouse') {
                            Lampa.Storage.set('navigation_type', 'controller');
                            Lampa.Storage.set('is_true_mobile', false);
                            Lampa.Noty.show('Режим: ПУЛЬТ');
                        } else {
                            Lampa.Storage.set('navigation_type', 'mouse');
                            Lampa.Storage.set('is_true_mobile', false); // Гарантируем десктопный вид
                            Lampa.Noty.show('Режим: МЫШЬ');
                        }
                        
                        setTimeout(() => { window.location.reload(); }, 500);
                    });
                }
            });

            // Применяем логику и чистим "мобильность", если выбрана мышь
            if (Lampa.Storage.get('navigation_type') === 'mouse') {
                // Если случайно пролез true_mobile - выключаем его
                if (Lampa.Storage.get('is_true_mobile') === true || Lampa.Storage.get('is_true_mobile') === "true") {
                    Lampa.Storage.set('is_true_mobile', false);
                    window.location.reload();
                }
                
                fixMouseLogic();
                $('body').addClass('is--mouse').removeClass('true--mobile');
            }
        };

        // Запуск
        if (window.appready) {
            addToSettings();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == "ready") {
                    addToSettings();
                }
            });
        }
    }

    startSwitchMouse();
})();
