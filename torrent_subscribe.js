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
    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') init();
        });
    }
})();
