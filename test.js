(function () {
    'use strict';

    // Иконка "Прицел"
    var ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/><path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z" fill="currentColor"/></svg>';

    function init() {
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    var buttons = e.body.find('.full-start-new__buttons');
                    
                    if (buttons.length) {
                        if (buttons.find('.button--jackett-monitor').length) return;

                        var btn = $(
                            '<div class="full-start__button selector button--jackett-monitor">' +
                                ICON +
                                '<span>Отслеживать</span>' +
                            '</div>'
                        );

                        // Проверяем статус при загрузке
                        if (e.data && e.data.movie) {
                            checkStatus(e.data.movie, btn);
                        }

                        btn.on('hover:enter', function () {
                            if (e.data && e.data.movie) {
                                toggleSubscription(e.data.movie, btn);
                            }
                        });

                        var optionsBtn = buttons.find('.button--options');
                        if (optionsBtn.length) {
                            optionsBtn.before(btn);
                        } else {
                            buttons.append(btn);
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

    // Проверка статуса (GET запрос)
    function checkStatus(card, btn) {
        var url = getBaseUrl();
        var uid = getUserId();
        
        // Если нет URL или пользователя, статус проверить нельзя (или считаем что не подписан)
        if (!url || !card.id || !uid) return;

        var requestUrl = url + '/subscribe?tmdb=' + card.id + '&uid=' + uid;

        fetch(requestUrl, { method: 'GET' })
            .then(function(response) {
                if (response.ok) {
                    return response.json().catch(function(){ return {}; });
                }
                throw new Error('Network response was not ok');
            })
            .then(function(data) {
                var isActive = data.active === true || data === true; 
                
                if (isActive) {
                    btn.addClass('active');
                    btn.find('span').text('Отслеживается');
                }
            })
            .catch(function() {
                // Ошибка или 404 - не подписан
            });
    }

    // Переключение подписки (POST/DELETE)
    function toggleSubscription(card, btn) {
        var url = getBaseUrl();
        if (!url) {
            Lampa.Noty.show('Не настроен URL Jackett');
            return;
        }
        
        var uid = getUserId();
        if (!uid) {
            Lampa.Noty.show('Требуется авторизация в CUB');
            // Можно открыть окно входа, если нужно:
            // Lampa.Account.showNoAccount();
            return;
        }
        
        if (!card.id) {
            Lampa.Noty.show('Ошибка: отсутствует ID');
            return;
        }

        var isSubscribed = btn.hasClass('active');
        var method = isSubscribed ? 'DELETE' : 'POST';
        var requestUrl = url + '/subscribe?tmdb=' + card.id + '&uid=' + uid;

        var options = {
            method: method,
            headers: {}
        };

        fetch(requestUrl, options).then(function(response) {
            if (response.ok) {
                if (isSubscribed) {
                    btn.removeClass('active');
                    btn.find('span').text('Отслеживать');
                    Lampa.Noty.show('Отписка успешна');
                } else {
                    btn.addClass('active');
                    btn.find('span').text('Отслеживается');
                    Lampa.Noty.show('Добавлено в отслеживание');
                }
            } else {
                Lampa.Noty.show('Ошибка запроса: ' + response.status);
            }
        }).catch(function(err) {
            console.error('JackettSubscribe: Request failed', err);
            Lampa.Noty.show('Ошибка соединения');
        });
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') init();
        });
    }
})();
