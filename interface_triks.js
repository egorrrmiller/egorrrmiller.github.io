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

        // 2. Функция фиксации мыши
        var fixMouseLogic = function() {
            // Блокируем стандартные события колеса, чтобы Lampa не эмулировала пульт
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    e.stopImmediatePropagation();
                }
            }, true);

            var styles = `
                /* Разрешаем нативный скролл */
                .scroll--mask, .items-line__body, .category-full__body, .full-start__body, .settings-list, .layer--full {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                /* Прячем полосы прокрутки для эстетики ТВ */
                .scroll--mask::-webkit-scrollbar, .items-line__body::-webkit-scrollbar {
                    display: none;
                    width: 0;
                }
                /* Убираем блокировку событий мыши в слоях */
                .scroll--over { pointer-events: all !important; }
            `;
            
            $('<style id="lampa-mouse-fix">').text(styles).appendTo('head');
        };

        // 3. Создание меню выбора (если еще не выбрано)
        var showChoice = function() {
            if (Lampa.Storage.get("weapon_choised", "false") === "true") return;

            let html = Lampa.Template.get('lang_choice', {});
            let scroll = new Lampa.Scroll({ mask: true, over: true });

            let setMode = function(nav, mobile) {
                Lampa.Storage.set("navigation_type", nav);
                Lampa.Storage.set("is_true_mobile", mobile);
                Lampa.Storage.set("weapon_choised", "true");
                window.location.reload();
            };

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
            // Регистрация параметра в разделе "Остальное"
            Lampa.SettingsApi.addParam({
                component: 'more',
                param: {
                    name: 'weapon_choised_reset',
                    type: 'static',
                    default: false
                },
                field: {
                    name: 'Тип управления',
                    description: 'Текущий: ' + (Lampa.Storage.get('navigation_type') === 'mouse' ? 'МЫШЬ' : 'ПУЛЬТ')
                },
                onRender: function(item) {
                    // Устанавливаем текст значения справа
                    item.find('.settings-param__value').text('Сбросить');
                    
                    item.on('hover:enter click', function(e) {
                        if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                        Lampa.Storage.set('weapon_choised', "false");
                        Lampa.Noty.show('Настройки сброшены. Перезагрузка...');
                        setTimeout(() => { window.location.reload(); }, 1000);
                    });
                }
            });

            // Если включена мышь — применяем фикс скролла
            if (Lampa.Storage.get('navigation_type') === 'mouse') {
                fixMouseLogic();
                $('body').addClass('is--mouse');
            }
        };

        // Запуск логики
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

    // Если Lampa уже загружена (или в процессе)
    if (!window.switch_mouse) startSwitchMouse();
})();
