(function () {
    'use strict';

    function startSwitchMouse() {
        window.switch_mouse = true;

        // 1. Определение платформы (БЕЗ ИЗМЕНЕНИЙ)
        var platform = 'browser';
        if (typeof Lampa !== 'undefined' && Lampa.Platform) {
            if (Lampa.Platform.is('android')) platform = 'android';
            else if (Lampa.Platform.is('tizen')) platform = 'tizen';
            else if (Lampa.Platform.is('webos')) platform = 'webos';
            else if (Lampa.Platform.is('apple')) platform = 'ios';
        }

        // 2. Функция фиксации мыши
        var fixMouseLogic = function() {
            // Убрал блокировку всплытия, чтобы работал нативный скролл
            window.addEventListener('wheel', function(e) {
                // Пусто, просто даем браузеру крутить
            }, {passive: true});

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

        // 3. Создание меню выбора (ИСПРАВЛЕН ТОЛЬКО ВЫЗОВ И КНОПКА МЫШИ)
        var showChoice = function() {
            // Проверка на строку "true" или булево true
            var is_done = Lampa.Storage.get("weapon_choised");
            if (is_done === "true" || is_done === true) return;

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
                // ТУТ ИЗМЕНЕНО НА "false", ЧТОБЫ НЕ БЫЛО МОБИЛКИ
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
    Lampa.SettingsApi.addParam({
        component: 'more',
        param: {
            name: 'navigation_type_select',
            type: 'select',
            values: {
                controller: 'Пульт',
                mouse: 'Мышь',
                mobile: 'Тачскрин'
            },
            default: Lampa.Storage.get('navigation_type') === 'mouse' ? 'mouse' : (Lampa.Storage.get('is_true_mobile') ? 'mobile' : 'controller')
        },
        field: {
            name: 'Тип управления',
            description: 'Выберите удобный способ навигации'
        },
        onChange: function(value) {
            if (value === 'mouse') {
                Lampa.Storage.set('navigation_type', 'mouse');
                Lampa.Storage.set('is_true_mobile', false);
            } else if (value === 'mobile') {
                Lampa.Storage.set('navigation_type', 'controller');
                Lampa.Storage.set('is_true_mobile', true);
            } else {
                Lampa.Storage.set('navigation_type', 'controller');
                Lampa.Storage.set('is_true_mobile', false);
            }
            
            Lampa.Storage.set('weapon_choised', "true");
            Lampa.Noty.show('Настройки изменены. Перезагрузка...');
            
            setTimeout(() => { 
                window.location.reload(); 
            }, 500);
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
