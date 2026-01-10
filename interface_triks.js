(function () {
    'use strict';

    function startSwitchMouse() {
        window.switch_mouse = true;

        // --- ЛОГИРОВАНИЕ ПЛАТФОРМЫ В КОНСОЛЬ ---
        console.log('--- Lampa Mouse Plugin Debug ---');
        console.log('UserAgent:', navigator.userAgent);
        
        if (typeof Lampa !== 'undefined' && Lampa.Platform) {
            console.log('Lampa Platform Android:', Lampa.Platform.is('android'));
            console.log('Lampa Platform Tizen:', Lampa.Platform.is('tizen'));
            console.log('Lampa Platform WebOS:', Lampa.Platform.is('webos'));
            console.log('Lampa Platform Browser:', Lampa.Platform.is('browser'));
        }
        console.log('Navigation Type:', Lampa.Storage.get('navigation_type'));
        console.log('Is True Mobile:', Lampa.Storage.get('is_true_mobile'));
        console.log('---------------------------------');

        var fixMouseLogic = function() {
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    e.stopImmediatePropagation();
                }
            }, true);

            var styles = `
                .scroll--mask, .items-line__body, .category-full__body, .full-start__body, .settings-list {
                    overflow-y: auto !important;
                    scrollbar-width: none !important;
                }
                .scroll--mask::-webkit-scrollbar { display: none; }
                .scroll--over { pointer-events: all !important; }
            `;
            $('<style id="lampa-mouse-fix">').text(styles).appendTo('head');
        };

        if (!Lampa.Storage.get("weapon_choised", "false") || Lampa.Storage.get("weapon_choised") === "false") {
            let html = Lampa.Template.get('lang_choice', {});
            let scroll = new Lampa.Scroll({ mask: true, over: true });

            let setMode = function(nav, mobile) {
                Lampa.Storage.set("navigation_type", nav);
                // Устанавливаем false для мыши, чтобы Lampa не включала мобильный вид
                Lampa.Storage.set("is_true_mobile", mobile);
                Lampa.Storage.set("weapon_choised", "true");
                window.location.reload();
            };

            let btns = [
                { name: "Пульт (Классика)", action: () => setMode("controller", "false") },
                // Здесь изменил "true" на "false", чтобы не включался интерфейс телефона
                { name: "Мышь / AirMouse", action: () => setMode("mouse", "false") }, 
                { name: "Тачскрин / Смартфон", action: () => setMode("controller", "true") }
            ];

            btns.forEach(b => {
                let item = $('<div class="selector lang__selector-item">' + b.name + '</div>');
                item.on('hover:enter click', (e) => {
                    if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                    b.action();
                });
                scroll.append(item);
            });

            html.find('.lang__selector').empty().append(scroll.render());
            $('body').append(html);
            Lampa.Controller.add('select_weapon', {
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                }
            });
            Lampa.Controller.toggle('select_weapon');
        }

        var addToSettings = function() {
            Lampa.SettingsApi.addParam({
                component: 'more',
                param: { name: 'weapon_choised_reset', type: 'static', default: false },
                field: { name: 'Тип управления', description: 'Сброс выбора управления' },
                onRender: function(item) {
                    item.find('.settings-param__value').text('Сбросить');
                    item.on('hover:enter click', function(e) {
                        if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                        Lampa.Storage.set('weapon_choised', "false");
                        window.location.reload();
                    });
                }
            });

            if (Lampa.Storage.get('navigation_type') === 'mouse') {
                fixMouseLogic();
            }
        };

        if (window.appready) addToSettings();
        else Lampa.Listener.follow('app', e => { if (e.type == "ready") addToSettings(); });
    }

    if (!window.switch_mouse) startSwitchMouse();
})();
