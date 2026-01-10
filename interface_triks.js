(function () {
    'use strict';

    function startSwitchMouse() {
        if (window.switch_mouse_init) return;
        window.switch_mouse_init = true;

        var fixMouseLogic = function() {
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    e.stopImmediatePropagation();
                }
            }, true);

            var styles = `
                .scroll--mask, .items-line__body, .category-full__body, .full-start__body, .settings-list, .layer--full {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                .scroll--mask::-webkit-scrollbar, .items-line__body::-webkit-scrollbar {
                    display: none;
                    width: 0;
                }
                .scroll--over { pointer-events: all !important; }
            `;
            $('<style>').text(styles).appendTo('head');
        };

        var addToSettings = function() {
            Lampa.SettingsApi.addParam({
                component: 'more',
                param: {
                    name: 'navigation_type_toggle',
                    type: 'static',
                    default: false
                },
                field: {
                    name: 'Тип управления',
                    description: 'Текущий: ' + (Lampa.Storage.get('navigation_type') === 'mouse' ? 'МЫШЬ' : 'ПУЛЬТ')
                },
                onRender: function(item) {
                    item.find('.settings-param__value').text('Изменить');
                    item.on('hover:enter click', function(e) {
                        if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                        
                        let current = Lampa.Storage.get('navigation_type');
                        if (current === 'mouse') {
                            Lampa.Storage.set('navigation_type', 'controller');
                            Lampa.Storage.set('is_true_mobile', false);
                        } else {
                            Lampa.Storage.set('navigation_type', 'mouse');
                            Lampa.Storage.set('is_true_mobile', false);
                        }
                        window.location.reload();
                    });
                }
            });

            if (Lampa.Storage.get('navigation_type') === 'mouse') {
                fixMouseLogic();
                Lampa.Storage.set('is_true_mobile', false);
                $('body').addClass('is--mouse').removeClass('true--mobile');
            }
        };

        if (window.appready) addToSettings();
        else Lampa.Listener.follow('app', function (e) {
            if (e.type == "ready") addToSettings();
        });
    }

    startSwitchMouse();
})();
