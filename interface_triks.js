(function () {
    'use strict';

    function startSwitchMouse() {
        window.switch_mouse = true;

        // --- 1. АВТОМАТИЧЕСКАЯ ПРОВЕРКА ПЛАТФОРМЫ ---
        var platform = 'unknown';
        if (Lampa.Platform.is('android')) platform = 'android';
        else if (Lampa.Platform.is('tizen')) platform = 'tizen';
        else if (Lampa.Platform.is('webos')) platform = 'webos';
        else if (Lampa.Platform.is('apple')) platform = 'ios';
        else platform = 'browser';

        // --- 2. ФУНКЦИЯ ОЧИСТКИ ПОВЕДЕНИЯ МЫШИ ---
        var fixMouseLogic = function() {
            // Блокируем стандартный перехват колеса Lampa (который эмулирует нажатия кнопок)
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    // Разрешаем всплытие только если мы хотим нативный скролл
                    e.stopImmediatePropagation();
                }
            }, true);

            // CSS фиксы под разные платформы
            var styles = `
                /* Включаем нативный скролл для всех типов устройств */
                .scroll--mask, .items-line__body, .category-full__body, .full-start__body, .settings-list {
                    overflow-y: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                    scrollbar-width: none !important; /* Firefox */
                }
                .scroll--mask::-webkit-scrollbar { display: none; }

                /* Исправляем работу курсора: убираем принудительный фокус, если мышь активна */
                body.is--mouse .selector.focus {
                    outline: 2px solid #fff; /* Делаем фокус более заметным для мыши */
                }
                
                /* Чтобы меню не вылетало при каждом движении колеса */
                body.is--mouse .menu {
                    pointer-events: all !important;
                }
            `;

            // Специфичные фиксы для ТВ платформ
            if (platform === 'tizen' || platform === 'webos') {
                styles += `
                    .scroll--mask { pointer-events: auto !important; }
                `;
            }

            $('<style id="lampa-mouse-fix">').text(styles).appendTo('head');
        };

        // --- 3. ИНИЦИАЛИЗАЦИЯ ВЫБОРА УПРАВЛЕНИЯ ---
        if (!Lampa.Storage.get("weapon_choised", "false")) {
            let html = Lampa.Template.get('lang_choice', {});
            let scroll = new Lampa.Scroll({ mask: true, over: true });

            function setMode(nav, mobile) {
                Lampa.Storage.set("navigation_type", nav);
                Lampa.Storage.set("is_true_mobile", mobile);
                Lampa.Storage.set("weapon_choised", "true");
                window.location.reload();
            }

            let btns = [
                { name: "Пульт (Классика)", action: () => setMode("controller", "false") },
                { name: "Мышь / AirMouse", action: () => setMode("mouse", "true") },
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

            html.find('.lang__info').text('Определена платформа: ' + platform.toUpperCase());
            html.find('.lang__selector').append(scroll.render());
            $('body').append(html);

            Lampa.Controller.add('select_weapon', {
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                up: () => Lampa.Navigator.move('up'),
                down: () => Lampa.Navigator.move('down')
            });
            Lampa.Controller.toggle('select_weapon');
        }

        // --- 4. ДОБАВЛЕНИЕ В НАСТРОЙКИ ---
        var addToSettings = function() {
            Lampa.SettingsApi.addParam({
                component: 'more',
                param: { name: 'weapon_choised', type: 'static', default: false },
                field: { name: 'Сбросить тип управления', description: 'Текущая платформа: ' + platform },
                onRender: function(i) {
                    i.on('hover:enter click', function(e) {
                        if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                        Lampa.Storage.set('weapon_choised', false);
                        window.location.reload();
                    });
                }
            });

            if (Lampa.Storage.get('navigation_type') === 'mouse') {
                fixMouseLogic();
                $('body').addClass('is--mouse');
            }
        };

        if (window.appready) addToSettings();
        else Lampa.Listener.follow('app', e => { if (e.type == "ready") addToSettings(); });
    }

    if (!window.switch_mouse) startSwitchMouse();
})();
