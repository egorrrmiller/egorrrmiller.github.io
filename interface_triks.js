(function () {
    'use strict';

    function startSwitchMouse() {
        if (window.switch_mouse_init) return;
        window.switch_mouse_init = true;

        // 1. Функция фиксации мыши
        var fixMouseLogic = function() {
            // Блокируем стандартную реакцию Lampa (прыжки по элементам)
            window.addEventListener('wheel', function(e) {
                if (Lampa.Storage.get('navigation_type') === 'mouse') {
                    e.stopImmediatePropagation();
                }
            }, true); // true обязателен для перехвата до того, как Lampa его обработает

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
            
            if (!$('#lampa-mouse-fix').length) {
                $('<style id="lampa-mouse-fix">').text(styles).appendTo('head');
            }
        };

        // 2. Создание меню выбора
        var showChoice = function() {
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
                { name: "Пульт (Классика)", action: () => setMode("controller", false) },
                { name: "Мышь / AirMouse", action: () => setMode("mouse", false) }, 
                { name: "Тачскрин / Смартфон", action: () => setMode("controller", true) }
            ];

            btns.forEach(b => {
                let item = $('<div class="selector lang__selector-item">' + b.name + '</div>');
                item.on('hover:enter click', (e) => {
                    if (e.type === 'click' && !Lampa.DeviceInput.canClick(e.originalEvent)) return;
                    b.action();
                });
                scroll.append(item);
            });

            html.find('.lang__info').text('Выберите тип управления:');
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

        // 3. Регистрация выпадающего списка в настройках
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
                    window.location.reload();
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

    startSwitchMouse();
})();
