(function () {
    'use strict';

    function startSwitchMouse() {
        window.switch_mouse = true;

        // 1. Вывод системной информации через Lampa.Platform
        console.log('--- LAMPA SYSTEM DEBUG ---');
        if (typeof Lampa !== 'undefined' && Lampa.Platform) {
            console.log('Platform Type:', Lampa.Platform.type());
            console.log('Platform Screen:', window.innerWidth + 'x' + window.innerHeight);
            // Проверка всех ключевых статусов
            ['android', 'tizen', 'webos', 'browser', 'apple'].forEach(p => {
                if(Lampa.Platform.is(p)) console.log('Current Lampa.Platform.is("' + p + '"): true');
            });
        }
        console.log('Storage Navigation:', Lampa.Storage.get('navigation_type'));
        console.log('Storage Mobile Mode:', Lampa.Storage.get('is_true_mobile'));
        console.log('--------------------------');

        // 2. Функция фиксации мыши и нативного скролла
        var fixMouseLogic = function() {
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    e.stopImmediatePropagation();
                }
            }, {passive: true, capture: true});

            var styles = `
                .scroll--mask, .items-line__body, .category-full__body, .full-start__body, .settings-list, .layer--full, .scroll__body {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    pointer-events: all !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                .scroll--mask::-webkit-scrollbar { display: none; }
                .scroll--over { pointer-events: none !important; }
                .scroll--over > * { pointer-events: all !important; }
                .scroll__scrollbar { display: none !important; }
                
                /* Форсируем отображение десктопных элементов, если Lampa капризничает */
                body.is--mouse .head__menu-button { display: none !important; } /* Прячем "гамбургер", если он вылез */
            `;
            
            $('<style id="lampa-mouse-fix">').text(styles).appendTo('head');
        };

        // 3. Меню выбора
        var showChoice = function() {
            var choised = Lampa.Storage.get("weapon_choised");
            if (choised === true || choised === "true") return;

            let html = Lampa.Template.get('lang_choice', {});
            let scroll = new Lampa.Scroll({ mask: true, over: true });

            let setMode = function(nav, mobile) {
                // Принудительно чистим старые значения, чтобы избежать кэширования режима
                Lampa.Storage.set("navigation_type", nav);
                Lampa.Storage.set("is_true_mobile", mobile);
                Lampa.Storage.set("weapon_choised", "true");
                
                // Дополнительный фикс: Lampa иногда хранит 'true' как строку, что сбивает логику
                if (mobile === "false") {
                   localStorage.setItem('is_true_mobile', 'false');
                }

                Lampa.Noty.show('Применяем режим: ' + nav);
                setTimeout(() => { window.location.reload(); }, 200);
            };

            let btns = [
                { name: "Пульт (Классика)", action: () => setMode("controller", "false") },
                { name: "Мышь (Десктопный вид)", action: () => setMode("mouse", "false") },
                { name: "Тачскрин (Мобильный вид)", action: () => setMode("controller", "true") }
            ];

            btns.forEach(b => {
                let item = $('<div class="selector lang__selector-item">' + b.name + '</div>');
                item.on('hover:enter click', (e) => {
                    if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                    b.action();
                });
                scroll.append(item);
            });

            // Показываем тип платформы в самом окне
            var platformInfo = (typeof Lampa !== 'undefined') ? Lampa.Platform.type() : 'unknown';
            html.find('.lang__info').text('Платформа: ' + platformInfo.toUpperCase());
            html.find('.lang__selector').empty().append(scroll.render());
            $('body').append(html);

            Lampa.Controller.add('select_weapon', {
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                }
            });
            Lampa.Controller.toggle('select_weapon');
        };

        // 4. Настройки
        var addToSettings = function() {
            Lampa.SettingsApi.addParam({
                component: 'more',
                param: { name: 'weapon_choised_reset', type: 'static', default: false },
                field: { name: 'Тип управления', description: 'Сбросить выбор и перенастроить UI' },
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
                $('body').addClass('is--mouse');
            }
        };

        if (window.appready) {
            showChoice();
            addToSettings();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == "ready") {
                    showChoice();
                    addToSettings();
                }
            });
        }
    }

    if (!window.switch_mouse) startSwitchMouse();
})();
