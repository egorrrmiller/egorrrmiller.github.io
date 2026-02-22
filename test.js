(function () {
    'use strict';

    // Иконка "Прицел" (Target) - состояние "Не отслеживается"
    var ICON_DEFAULT = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/><path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z" fill="currentColor"/></svg>';

    // Иконка "Галочка в круге" (Checked) - состояние "Отслеживается"
    var ICON_ACTIVE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/><path d="M10.5 16.2L7.2 12.9L8.6 11.5L10.5 13.4L15.4 8.5L16.8 9.9L10.5 16.2Z" fill="currentColor"/></svg>';

    // Иконка "Спиннер" (Loading)
    var ICON_LOADING = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 9.84 4.93 7.88 6.34 6.34L7.76 7.76C6.76 8.76 6 10.3 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6V2Z" fill="currentColor"/></svg>';

    function init() {
        // Добавляем стили для анимации и блокировки
        var style = document.createElement('style');
        style.textContent = `
            @keyframes jackett_spin { 100% { transform: rotate(360deg); } }
            .button--jackett-monitor.loading svg { animation: jackett_spin 1s linear infinite; }
            .button--jackett-monitor.disabled { pointer-events: none; opacity: 0.7; }
        `;
        document.head.appendChild(style);

        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    if (e.object && e.object.activity && typeof e.object.activity.render === 'function') {
                        var render = e.object.activity.render();

                        if (render.find('.button--jackett-monitor').length) return;

                        var btn = $(
                            '<div class="full-start__button selector button--jackett-monitor">' +
                            ICON_DEFAULT +
                            '<span>Отслеживать</span>' +
                            '</div>'
                        );

                        if (e.data && e.data.movie) {
                            checkStatus(e.data.movie, btn);
                        }

                        btn.on('hover:enter', function () {
                            if (e.data && e.data.movie) {
                                toggleSubscription(e.data.movie, btn);
                            }
                        });

                        var optionsBtn = render.find('.button--options');
                        if (optionsBtn.length) {
                            optionsBtn.before(btn);
                        } else {
                            render.find('.full-start-new__buttons').append(btn);
                        }
                    }
                }
            });
        }
    }

    function getBaseUrl() {
        var useLink = Lampa.Storage.field('parser_use_link');
        var url;

        if (useLink == 'two') {
            url = Lampa.Storage.field('jackett_url_two');
        } else {
            url = Lampa.Storage.field('jackett_url');
        }

        return url ? url.replace(/\/$/, '') : null;
    }

    function getUserId() {
        if (Lampa.Account.Permit && Lampa.Account.Permit.access && Lampa.Account.Permit.user) {
            return Lampa.Account.Permit.user.id;
        }
        return null;
    }

    function updateButtonState(btn, active) {
        if (active) {
            btn.addClass('active');
            btn.find('span').text('Отслеживается');
            btn.find('svg').replaceWith(ICON_ACTIVE);
        } else {
            btn.removeClass('active');
            btn.find('span').text('Отслеживать');
            btn.find('svg').replaceWith(ICON_DEFAULT);
        }
    }

    function checkStatus(card, btn) {
        var url = getBaseUrl();
        var uid = getUserId();

        if (!url || !card.id || !uid) return;

        var requestUrl = url + '/check-subscribe?tmdb=' + card.id + '&uid=' + uid;

        btn.addClass('loading disabled');
        btn.find('svg').replaceWith(ICON_LOADING);

        fetch(requestUrl, { method: 'POST' })
            .then(function (response) {
                if (response.ok) return response.json().catch(function () { return {}; });
                throw new Error('Network response was not ok');
            })
            .then(function (data) {
                updateButtonState(btn, data.result === true);
            })
            .catch(function () {
                updateButtonState(btn, false);
            })
            .finally(function () {
                btn.removeClass('loading disabled');
            });
    }

    function toggleSubscription(card, btn) {
        if (btn.hasClass('disabled')) return;

        var url = getBaseUrl();
        if (!url) {
            Lampa.Noty.show('Не настроен URL Jackett');
            return;
        }

        var uid = getUserId();
        if (!uid) {
            Lampa.Noty.show('Требуется авторизация в CUB');
            return;
        }

        if (!card.id) {
            Lampa.Noty.show('Ошибка: отсутствует ID');
            return;
        }

        var isSubscribed = btn.hasClass('active');
        var endpoint = isSubscribed ? '/unsubscribe' : '/subscribe';
        var requestUrl = url + endpoint + '?tmdb=' + card.id + '&uid=' + uid;

        btn.addClass('loading disabled');
        btn.find('svg').replaceWith(ICON_LOADING);

        fetch(requestUrl, { method: 'POST' })
            .then(function (response) {
                if (response.ok) return response.json().catch(function () { return {}; });
                throw new Error('Network response was not ok');
            })
            .then(function (data) {
                if (data.result === true) {
                    var newState = !isSubscribed;
                    updateButtonState(btn, newState);
                    Lampa.Noty.show(newState ? 'Добавлено в отслеживание' : 'Удалено из отслеживаемых');
                } else {
                    updateButtonState(btn, isSubscribed);
                    Lampa.Noty.show('Действие не выполнено сервером');
                }
            })
            .catch(function (err) {
                console.error('JackettSubscribe: Request failed', err);
                updateButtonState(btn, isSubscribed);
                Lampa.Noty.show('Ошибка соединения');
            })
            .finally(function () {
                btn.removeClass('loading disabled');
            });
    }

    function jackettTrackedComponent(object) {
        var comp = new Lampa.InteractionMain(object);
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $('<div></div>');
        var items = [];
        var activeItem = null;

        $('body').append('<style>.jackett-tracked-item { display: flex; flex-direction: row; padding: 10px; margin: 5px 20px; background: rgba(0,0,0,0.2); border-radius: 10px; align-items: center; transition: background 0.3s; }.jackett-tracked-item.focus, .jackett-tracked-item:hover { background: rgba(255,255,255,0.1); }.jackett-tracked-item__img { width: 80px; height: 120px; border-radius: 5px; object-fit: cover; margin-right: 15px; }.jackett-tracked-item__info { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }.jackett-tracked-item__title { font-size: 1.2em; font-weight: bold; margin-bottom: 5px; color: #fff; }.jackett-tracked-item__time { font-size: 0.9em; color: #aaa; }.jackett-tracked-item__progress-text { font-size: 0.95em; color: #eee; margin-top: 5px; font-weight: bold; }.jackett-tracked-item__progress-bar { margin-top: 5px; width: 100%; position: relative; }.jackett-tracked-item__actions { display: flex; flex-direction: row; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; }.jackett-tracked-item.focus .jackett-tracked-item__actions, .jackett-tracked-item:hover .jackett-tracked-item__actions, .jackett-tracked-item:focus-within .jackett-tracked-item__actions { opacity: 1; }.jackett-tracked-btn { padding: 10px 15px; margin-left: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); color: #fff; text-align: center; transition: background 0.3s, transform 0.2s; cursor: pointer; }.jackett-tracked-btn.focus, .jackett-tracked-btn:hover { background: #fff; color: #000; transform: scale(1.05); }</style>');

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);

            var url = getBaseUrl();
            var uid = getUserId();

            if (!url) {
                this.empty('Не настроен URL Jackett');
                return;
            }

            if (!uid) {
                this.empty('Требуется авторизация в CUB');
                return;
            }

            fetch(url + '/subscribes?uid=' + uid)
                .then(function (response) {
                    if (response.ok) return response.json();
                    throw new Error('Network response was not ok');
                })
                .then(function (trackedItems) {
                    if (!trackedItems || !trackedItems.length) {
                        _this.empty('Список отслеживаемых пуст');
                        return;
                    }

                    var promises = trackedItems.map(function (item) {
                        return new Promise(function (resolve) {
                            if (!item.tmdb_id) return resolve(null);

                            var resolveWithTime = function (data) {
                                if (data) {
                                    data.last_refresh_time = item.last_refresh_time || 'Никогда';
                                    resolve(data);
                                } else resolve(null);
                            };

                            Lampa.Api.sources.tmdb.full({ id: item.tmdb_id, method: 'tv' }, function (tvData) {
                                if (tvData && tvData.movie) {
                                    resolveWithTime(tvData.movie);
                                } else {
                                    Lampa.Api.sources.tmdb.full({ id: item.tmdb_id, method: 'movie' }, function (movieData) {
                                        if (movieData && movieData.movie) {
                                            resolveWithTime(movieData.movie);
                                        } else {
                                            resolve(null);
                                        }
                                    }, function () {
                                        resolve(null);
                                    });
                                }
                            }, function () {
                                Lampa.Api.sources.tmdb.full({ id: item.tmdb_id, method: 'movie' }, function (movieData) {
                                    if (movieData && movieData.movie) resolveWithTime(movieData.movie);
                                    else resolve(null);
                                }, function () {
                                    resolve(null);
                                });
                            });
                        });
                    });

                    Promise.all(promises).then(function (results) {
                        var validItems = results.filter(function (r) { return r !== null; });

                        if (validItems.length === 0) {
                            _this.empty('Не удалось загрузить данные из TMDB');
                            return;
                        }

                        _this.build(validItems);
                    });
                })
                .catch(function (err) {
                    console.error('JackettTracked:', err);
                    _this.empty('Ошибка загрузки данных: ' + err.message);
                });

            return this.render();
        };

        comp.empty = function (msg) {
            this.activity.loader(false);
            var emptyTpl = Lampa.Template.get('list_empty');
            if (msg) emptyTpl.find('.empty__title').text(msg);
            html.empty().append(emptyTpl);
        };

        comp.build = function (data) {
            var _this = this;
            this.activity.loader(false);

            scroll.render().addClass('layer--wheight');
            html.empty().append(scroll.render());

            data.forEach(function (itemData) {
                var title = itemData.title || itemData.name || 'Без названия';
                var timeStr = itemData.last_refresh_time ? 'Обновлено: ' + itemData.last_refresh_time : '';
                var poster = itemData.poster_path ? Lampa.Api.sources.tmdb.img(itemData.poster_path) : './img/img_broken.svg';

                var watchedText = '';
                var timelineObj = null;

                if (itemData.original_name || itemData.name) {
                    var last = Lampa.Storage.get('online_watched_last', '{}');
                    var filed = last[Lampa.Utils.hash(itemData.original_title || itemData.original_name || itemData.name)];

                    if (filed && filed.episode) {
                        watchedText = (Lampa.Lang.translate('full_episode') || 'Серия') + ' ' + filed.episode;
                        var seasonStr = filed.season > 10 ? ':' : '';
                        var hash = Lampa.Utils.hash([filed.season, seasonStr, filed.episode, itemData.original_title || itemData.original_name || itemData.name].join(''));
                        timelineObj = Lampa.Timeline.view(hash);
                    } else {
                        var any = Lampa.Timeline.watched(itemData, true);
                        if (Array.isArray(any)) any = any.pop();
                        if (any) {
                            watchedText = (Lampa.Lang.translate('full_episode') || 'Серия') + ' ' + any.ep;
                            timelineObj = any.view;
                        }
                    }
                } else {
                    var time = Lampa.Timeline.watched(itemData, true);
                    if (time && time.percent) {
                        watchedText = (Lampa.Lang.translate('title_viewed') || 'Просмотрено') + ' ' + (time.time ? Lampa.Utils.secondsToTimeHuman(time.time) : time.percent + '%');
                        timelineObj = time;
                    }
                }

                var itemHtml = '<div class="jackett-tracked-item selector layer--visible layer--render">' +
                    '<img src="' + poster + '" class="jackett-tracked-item__img" />' +
                    '<div class="jackett-tracked-item__info">' +
                    '<div class="jackett-tracked-item__title">' + title + '</div>' +
                    '<div class="jackett-tracked-item__time">' + timeStr + '</div>' +
                    '<div class="jackett-tracked-item__progress-text"></div>' +
                    '<div class="jackett-tracked-item__progress-bar"></div>' +
                    '</div>' +
                    '<div class="jackett-tracked-item__actions">' +
                    '<div class="jackett-tracked-btn btn-open selector">Открыть</div>' +
                    '<div class="jackett-tracked-btn btn-unfollow selector">Отменить отслеживание</div>' +
                    '</div>' +
                    '</div>';

                var itemObj = $(itemHtml);

                if (watchedText) {
                    itemObj.find('.jackett-tracked-item__progress-text').text(watchedText);
                    if (timelineObj && timelineObj.percent) {
                        var tl = Lampa.Timeline.render(timelineObj);
                        tl.css('position', 'relative').css('margin-top', '5px');
                        itemObj.find('.jackett-tracked-item__progress-bar').append(tl);
                    }
                }

                itemObj.on('hover:focus', function () {
                    activeItem = itemObj;
                    scroll.update(itemObj);

                    if (itemData.backdrop_path) {
                        var bg = Lampa.Api.sources.tmdb.img(itemData.backdrop_path);
                        Lampa.Background.change(bg);
                    }
                });

                itemObj.find('.btn-open').on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: itemData.id,
                        title: title,
                        component: 'full',
                        id: itemData.id,
                        method: itemData.name ? 'tv' : 'movie',
                        card: itemData,
                        source: 'tmdb'
                    });
                });

                itemObj.find('.btn-unfollow').on('hover:enter', function () {
                    var url = getBaseUrl();
                    var uid = getUserId();
                    if (url && uid) {
                        Lampa.Noty.show('Удаляем...');
                        fetch(url + '/unsubscribe?tmdb=' + itemData.id + '&uid=' + uid, { method: 'POST' })
                            .then(function (response) {
                                if (response.ok) {
                                    itemObj.remove();
                                    Lampa.Noty.show('Удалено из отслеживаемых');
                                    var remaining = scroll.render().find('.jackett-tracked-item');
                                    if (remaining.length) {
                                        Lampa.Controller.toggle('content');
                                    } else _this.empty('Пусто');
                                } else Lampa.Noty.show('Ошибка удаления');
                            });
                    }
                });

                itemObj.on('hover:enter', function () {
                    itemObj.find('.btn-open').trigger('hover:enter');
                });

                scroll.append(itemObj);
                items.push(itemObj);
            });

            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(activeItem || items[0], scroll.render());
                },
                left: function () {
                    if (Lampa.Controller.collectionDirection('left')) {
                        var cur = Lampa.Controller.collectionCurrent();
                        if (cur.hasClass('btn-unfollow')) Lampa.Controller.collectionFocus(cur.prev('.btn-open'), scroll.render());
                    }
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    if (Lampa.Controller.collectionDirection('right')) {
                        var cur = Lampa.Controller.collectionCurrent();
                        if (cur.hasClass('btn-open')) Lampa.Controller.collectionFocus(cur.next('.btn-unfollow'), scroll.render());
                        else if (cur.hasClass('jackett-tracked-item')) Lampa.Controller.collectionFocus(cur.find('.btn-open'), scroll.render());
                    }
                },
                up: function () {
                    if (Lampa.Controller.collectionDirection('up')) {
                        var cur = Lampa.Controller.collectionCurrent();
                        var parentItem = cur.closest('.jackett-tracked-item');
                        if (parentItem.length && parentItem.prev().length) {
                            Lampa.Controller.collectionFocus(parentItem.prev(), scroll.render());
                        } else Lampa.Controller.collectionFocus(activeItem || items[0], scroll.render());
                    }
                },
                down: function () {
                    if (Lampa.Controller.collectionDirection('down')) {
                        var cur = Lampa.Controller.collectionCurrent();
                        var parentItem = cur.closest('.jackett-tracked-item');
                        if (parentItem.length && parentItem.next().length) {
                            Lampa.Controller.collectionFocus(parentItem.next(), scroll.render());
                        }
                    }
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');

            return this.render();
        };

        comp.render = function () {
            return html;
        };

        comp.destroy = function () {
            scroll.destroy();
            html.remove();
            items = [];
            comp = null;
        };

        return comp;
    }

    function addMenuButton() {
        var buttonHTML = '<li class="menu__item selector">' +
            '<div class="menu__ico">' +
            ICON_DEFAULT +
            '</div>' +
            '<div class="menu__text">Отслеживаемые</div>' +
            '</li>';

        var button = $(buttonHTML);

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Отслеживаемые',
                component: 'jackett_tracked',
                page: 1
            });
        });

        if (window.lampa_settings && window.lampa_settings.jackett_subscribe_installed) return;

        var wrap = $('.menu .menu__list').eq(0);
        if (wrap.length) {
            wrap.append(button);
            window.lampa_settings = window.lampa_settings || {};
            window.lampa_settings.jackett_subscribe_installed = true;
        } else {
            setTimeout(addMenuButton, 500);
        }
    }


    if (window.appready) {
        init();
        addMenuButton();
        if (window.Lampa && Lampa.Component) Lampa.Component.add('jackett_tracked', jackettTrackedComponent);
    } else {
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') {
                    init();
                    if (window.Lampa && Lampa.Component) Lampa.Component.add('jackett_tracked', jackettTrackedComponent);
                    addMenuButton();
                }
            });
        }
    }
})();
