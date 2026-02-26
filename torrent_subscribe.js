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
                            checkStatus(e.data.movie, btn, e.data.method);
                        }

                        btn.on('hover:enter', function () {
                            if (e.data && e.data.movie) {
                                toggleSubscription(e.data.movie, btn, e.data.method);
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

    function checkStatus(card, btn, method) {
        var url = getBaseUrl();
        var uid = getUserId();

        if (!url || !card.id || !uid) return;

        var reqMethod = method || card.media || (card.name ? 'tv' : 'movie');
        if (reqMethod !== 'tv' && reqMethod !== 'movie') reqMethod = card.name ? 'tv' : 'movie';

        var requestUrl = url + '/check-subscribe?tmdb=' + card.id + '&media=' + reqMethod + '&uid=' + uid;

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

    function toggleSubscription(card, btn, method) {
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
        var isSubscribed = btn.hasClass('active');
        var reqMethod = method || card.media || (card.name ? 'tv' : 'movie');
        if (reqMethod !== 'tv' && reqMethod !== 'movie') reqMethod = card.name ? 'tv' : 'movie';

        var endpoint = isSubscribed ? '/unsubscribe' : '/subscribe';
        var requestUrl = url + endpoint + '?tmdb=' + card.id + '&media=' + reqMethod + '&uid=' + uid;

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
        var comp = new Lampa.InteractionCategory(object);

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
                .then(function (trackedItemsData) {
                    // Поддержка как массива, так и объекта с { results: [...] }
                    var trackedItems = trackedItemsData.results ? trackedItemsData.results : trackedItemsData;

                    if (!trackedItems || !trackedItems.length) {
                        _this.empty('Список отслеживаемых пуст');
                        return;
                    }

                    // For each item, try to fetch info from TMDB api
                    var promises = trackedItems.map(function (item) {
                        return new Promise(function (resolve) {
                            if (!item.tmdb_id) return resolve(null);

                            var mediaType = item.media || item.type;

                            if (mediaType) {
                                Lampa.Api.sources.tmdb.full({ id: item.tmdb_id, method: mediaType }, function (data) {
                                    if (data && data.movie) {
                                        data.movie.media_type_passed = mediaType;
                                        if (item.last_refresh_time && item.last_refresh_time !== 'Никогда') {
                                            data.movie.last_refresh_time = item.last_refresh_time;
                                        }
                                        resolve(data.movie);
                                    } else resolve(null);
                                }, function () {
                                    resolve(null);
                                });
                            } else {
                                // Fallback: We don't know if it's movie or TV, try TV first
                                Lampa.Api.sources.tmdb.full({ id: item.tmdb_id, method: 'tv' }, function (tvData) {
                                    if (tvData && tvData.movie) {
                                        tvData.movie.media_type_passed = 'tv';
                                        resolve(tvData.movie);
                                    } else {
                                        // Fallback to movie if tv fails
                                        Lampa.Api.sources.tmdb.full({ id: item.tmdb_id, method: 'movie' }, function (movieData) {
                                            if (movieData && movieData.movie) {
                                                movieData.movie.media_type_passed = 'movie';
                                                resolve(movieData.movie);
                                            } else {
                                                resolve(null);
                                            }
                                        }, function () { resolve(null); });
                                    }
                                }, function () {
                                    // Complete failure of first request, also attempt movie
                                    Lampa.Api.sources.tmdb.full({ id: item.tmdb_id, method: 'movie' }, function (movieData) {
                                        if (movieData && movieData.movie) {
                                            movieData.movie.media_type_passed = 'movie';
                                            resolve(movieData.movie);
                                        } else resolve(null);
                                    }, function () { resolve(null); });
                                });
                            }
                        });
                    });

                    Promise.all(promises).then(function (results) {
                        var validItems = results.filter(function (r) { return r !== null; });

                        if (validItems.length === 0) {
                            _this.empty('Не удалось загрузить данные из TMDB');
                            return;
                        }

                        _this.build({
                            results: validItems,
                            page: 1,
                            total_pages: 1
                        });
                    });
                })
                .catch(function (err) {
                    console.error('JackettTracked:', err);
                    _this.empty('Ошибка загрузки данных: ' + err.message);
                });
        };

        comp.cardRender = function (object, element, card) {
            var mediaType = element.media_type_passed || (element.name ? 'tv' : 'movie');

            if (element.last_refresh_time) {
                var d = new Date(element.last_refresh_time);
                if (!isNaN(d.getTime())) {
                    var day = ('0' + d.getDate()).slice(-2);
                    var month = ('0' + (d.getMonth() + 1)).slice(-2);
                    var year = d.getFullYear();
                    var hours = ('0' + d.getHours()).slice(-2);
                    var minutes = ('0' + d.getMinutes()).slice(-2);
                    var formattedTime = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;

                    var htmlNode = card.render ? card.render() : null;
                    if (htmlNode && htmlNode.find) {
                        // Фиксируем высоту заголовка на 2 строчки
                        var titleNode = htmlNode.find('.card__title');
                        titleNode.css({
                            'min-height': '2.6em',
                            'display': '-webkit-box',
                            '-webkit-line-clamp': '2',
                            '-webkit-box-orient': 'vertical',
                            'overflow': 'hidden'
                        });

                        // Возвращаем текст под год + добавляем margin-bottom, чтобы оттолкнуть нижний ряд
                        var timeHtml = '<div class="jackett-time" style="font-size: 0.8em; color: rgba(255,255,255,0.4); margin-top: 2px; margin-bottom: 10px; font-weight: normal; font-family: sans-serif;">Обновлено: ' + formattedTime + '</div>';
                        var ageNode = htmlNode.find('.card__age').first();

                        if (ageNode.length) {
                            ageNode.after(timeHtml);
                        } else {
                            titleNode.after(timeHtml);
                        }
                    }
                }
            }

            card.onMenu = function () {
                Lampa.Select.show({
                    title: 'Действия',
                    items: [
                        {
                            title: 'Перейти к карточке',
                            open: true
                        },
                        {
                            title: 'Отменить отслеживание',
                            remove: true
                        }
                    ],
                    onSelect: function (a) {
                        if (a.open) {
                            Lampa.Activity.push({
                                url: element.id,
                                title: element.title || element.name,
                                component: 'full',
                                id: element.id,
                                method: mediaType,
                                card: element,
                                source: 'tmdb'
                            });
                        } else if (a.remove) {
                            var url = getBaseUrl();
                            var uid = getUserId();
                            if (url && uid) {
                                Lampa.Noty.show('Удаляем...');
                                fetch(url + '/unsubscribe?tmdb=' + element.id + '&media=' + mediaType + '&uid=' + uid, { method: 'POST' })
                                    .then(function (response) {
                                        if (response.ok) {
                                            card.destroy(); // Remove card visually
                                            Lampa.Noty.show('Удалено из отслеживаемых');
                                        } else {
                                            Lampa.Noty.show('Ошибка удаления');
                                        }
                                    });
                            }
                        }
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('content');
                    }
                });
            };

            card.onEnter = function () {
                Lampa.Activity.push({
                    url: element.id,
                    title: element.title || element.name,
                    component: 'full',
                    id: element.id,
                    method: mediaType,
                    card: element,
                    source: 'tmdb'
                });
            };
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
