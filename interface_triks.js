(function () {
    'use strict';

    function startSwitchMouse() {
        window.switch_mouse = true;

        // 1. Определение платформы
        var platform = 'browser';
        if (typeof Lampa !== 'undefined' && Lampa.Platform) {
            if (Lampa.Platform.is('android')) platform = 'android';
            else if (Lampa.Platform.is('tizen')) platform = 'tizen';
            else if (Lampa.Platform.is('webos')) platform = 'webos';
            else if (Lampa.Platform.is('apple')) platform = 'ios';
        }
        
        console.log('--- Lampa Mouse Debug ---');
        console.log('Platform:', platform.toUpperCase());
        console.log('Is Mobile Mode:', Lampa.Storage.get('is_true_mobile'));
        console.log('-------------------------');

        // 2. Функция фиксации мыши и скролла
        var fixMouseLogic = function() {
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    // Блокируем эмуляцию пульта, сохраняя нативный скролл
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
                
                /* Фикс для курсора: чтобы элементы подсвечивались при наведении */
                .selector:hover { background: rgba(255,255,255,0.1); }
            `;
            
            $('<style id="lampa-mouse-fix">').text(styles).appendTo('head');
        };

        // 3. Создание меню выбора
        var showChoice = function() {
            var choised = Lampa.Storage.get("weapon_choised");
            if (choised === true || choised === "true") return;

            let html = Lampa.Template.get('lang_choice', {});
            let scroll = new Lampa.Scroll({ mask: true, over: true });

            let setMode = function(nav, mobile) {
                Lampa.Storage.set("navigation_type", nav);
                Lampa.Storage.set("is_true_mobile", mobile); // КЛЮЧЕВОЙ МОМЕНТ
                Lampa.Storage.set("weapon_choised", "true");
                window.location.reload();
            };

            let btns = [
                { 
                    name: "Пульт (Классика)", 
                    action: () => setMode("controller", "false") 
                },
                { 
                    name: "Мышь (Десктопный интерфейс)", 
                    action: () => setMode("mouse", "false") // Выключаем мобильность для мыши
                },
                { 
                    name: "Тачскрин (Мобильный интерфейс)", 
                    action: () => setMode("controller", "true") 
                }
            ];

            btns.forEach(b => {
                let item = $('<div class="selector lang__selector-item">' + b.name + '</div>');
                item.on('hover:enter click', (e) => {
                    if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                    b.action();
                });
                scroll.append(item);
            });

            html.find('.lang__info').text('Браузер определен. Выберите вид интерфейса:');
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

        // 4. Регистрация в настройках
        var addToSettings = function() {
            Lampa.SettingsApi.addParam({
                component: 'more',
                param: { name: 'weapon_choised_reset', type: 'static', default: false },
                field: { name: 'Тип управления', description: 'Сбросить текущий режим (Мышь/Пульт)' },
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
