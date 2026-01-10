(function () {
    'use strict';

    function startSwitchMouse() {
        window.switch_mouse = true;

        // 1. Определение платформы + Вывод в консоль
        var platform = 'browser';
        if (typeof Lampa !== 'undefined' && Lampa.Platform) {
            if (Lampa.Platform.is('android')) platform = 'android';
            else if (Lampa.Platform.is('tizen')) platform = 'tizen';
            else if (Lampa.Platform.is('webos')) platform = 'webos';
            else if (Lampa.Platform.is('apple')) platform = 'ios';
        }
        
        console.log('--- Lampa Plugin Debug ---');
        console.log('Detected Platform:', platform.toUpperCase());
        console.log('Navigation Type:', Lampa.Storage.get('navigation_type'));
        console.log('--------------------------');

        // 2. Функция фиксации мыши
        var fixMouseLogic = function() {
            // Перехватываем колесо, но позволяем браузеру делать нативный скролл
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    // Останавливаем только событие, которое Lampa превращает в кнопки пульта
                    e.stopImmediatePropagation();
                }
            }, {passive: true, capture: true});

            var styles = `
                /* Разрешаем нативный скролл и клики */
                .scroll--mask, .items-line__body, .category-full__body, .full-start__body, .settings-list, .layer--full, .scroll__body {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    pointer-events: all !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                /* Прячем полосы прокрутки */
                .scroll--mask::-webkit-scrollbar, .items-line__body::-webkit-scrollbar {
                    display: none;
                    width: 0;
                }
                /* Чтобы карточки не перехватывали скролл на себя */
                .scroll--over { pointer-events: none !important; }
                .scroll--over > * { pointer-events: all !important; }
                
                /* Скрываем кастомные скроллбары Lampa */
                .scroll__scrollbar { display: none !important; }
            `;
            
            $('<style id="lampa-mouse-fix">').text(styles).appendTo('head');
        };

        // 3. Создание меню выбора
        var showChoice = function() {
            // ИСПРАВЛЕННОЕ УСЛОВИЕ: проверяем наличие флага более надежно
            var choised = Lampa.Storage.get("weapon_choised");
            if (choised === true || choised === "true") return;

            let html = Lampa.Template.get('lang_choice', {});
            let scroll = new Lampa.Scroll({ mask: true, over: true });

            let setMode = function(nav, mobile) {
                Lampa.Storage.set("navigation_type", nav);
                Lampa.Storage.set("is_true_mobile", mobile);
                Lampa.Storage.set("weapon_choised", "true"); // Сохраняем как строку для надежности
                window.location.reload();
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

            html.find('.lang__info').text('Платформа: ' + platform.toUpperCase());
            html.find('.lang__selector').empty().append(scroll.render());
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
        };

        // 4. Регистрация в настройках
        var addToSettings = function() {
            if ($('.settings-param[data-name="weapon_choised_reset"]').length) return;

            Lampa.SettingsApi.addParam({
                component: 'more',
                param: {
                    name: 'weapon_choised_reset',
                    type: 'static',
                    default: false
                },
                field: {
                    name: 'Тип управления',
                    description: 'Сбросить выбор и показать окно настройки заново'
                },
                onRender: function(item) {
                    item.find('.settings-param__value').text('Сбросить');
                    item.on('hover:enter click', function(e) {
                        if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                        Lampa.Storage.set('weapon_choised', "false");
                        Lampa.Noty.show('Настройки сброшены. Перезагрузка...');
                        setTimeout(() => { window.location.reload(); }, 1000);
                    });
                }
            });

            if (Lampa.Storage.get('navigation_type') === 'mouse') {
                fixMouseLogic();
                $('body').addClass('is--mouse');
            }
        };

        // Запуск
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
