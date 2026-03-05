(function () {
    'use strict';

    if (!window.Lampa) return;

    var plugin_name = 'VLC M3U Playlist';
    var POLLING_INTERVAL_MS = 1000;
    var vlcPollingInterval = null;
    var M3U_PATH = '';

    // Подключаем системные модули, если они доступны (NW.js / Electron)
    var fs = null;
    var spawn = null;
    var path = null;

    try {
        fs = require('fs');
        spawn = require('child_process').spawn;
        path = require('path');

        // Временная директория ОС
        var os = require('os');
        M3U_PATH = path.join(os.tmpdir(), 'lampa_vlc_playlist.m3u');
    } catch (e) {
        console.log(plugin_name, 'Desktop API (Node.js) не доступен. Плагин работает только на ПК.');
    }

    /**
     * Создает M3U плейлист из списка серий Lampa, начиная с выбранной
     */
    function generateM3U(current_url, playlist_items) {
        var content = ['#EXTM3U'];

        // В Lampa есть встроенный трекер позиции плейлиста
        var startIndex = 0;
        if (Lampa.Player.playlist && typeof Lampa.Player.playlist.position === 'function') {
            startIndex = Lampa.Player.playlist.position() || 0;
        }

        for (var i = startIndex; i < playlist_items.length; i++) {
            var item = playlist_items[i];
            var url = typeof item.url === 'string' ? item.url : '';

            // Если URL еще функция, Lampa сама её резолвит. Попробуем извлечь из item
            if (!url && typeof item.url === 'function') {
                // Если мы не сможем вытащить URL, нам нечего скармливать VLC
                console.log(plugin_name, "Item url is a function, skip adding to playlist");
                continue;
            }

            if (url) {
                // Иногда URL это m3u8 балансера с &preload или торрент с &preload. Заменим на &play
                url = url.replace('&preload', '&play');

                var hash = item.timeline ? item.timeline.hash : ('hash_' + i);
                var title = item.title || item.fname || ('Episode ' + (i + 1));

                // Избавляемся от html-тегов в тайтле
                if (typeof title === 'string') {
                    title = title.replace(/<[^>]*>?/gm, '');
                }

                // Вшиваем наш Lampa Hash прямо в EXTM3U метаданные для последующего парсинга
                content.push('#EXTINF:-1 LampaHash="' + hash + '",' + title);
                content.push(url);
            }
        }

        return content.join('\n');
    }

    /**
     * Кастомный обработчик пуллинга времени и статуса из VLC
     * Опрашивает VLC, считывает текущий файл и обновляет тайлайн в Lampa
     */
    function startCustomTimecodePolling(port, password) {
        if (vlcPollingInterval) clearInterval(vlcPollingInterval);

        function getVLCURL(port) {
            var proxy = !['localhost', 'file://'].includes(window.location.origin);
            var url = 'http://localhost:' + port + '/requests/status.json';
            if (proxy) url = 'http://localhost:4000/vlc/requests/status.json';
            return url;
        }

        vlcPollingInterval = setInterval(function () {
            var headers = {
                'Authorization': 'Basic ' + btoa(':' + password)
            };

            fetch(getVLCURL(port), { headers: headers })
                .then(function (response) { return response.json(); })
                .then(function (status) {
                    // Парсим метаданные: ищем LampaHash
                    var currentLampaHash = null;
                    if (status.information && status.information.category && status.information.category.meta) {
                        var title = status.information.category.meta.title || ''; // наш LampaHash в titles/filename
                        var filename = status.information.category.meta.filename || '';

                        // Ищем строчку вида LampaHash="xxx" (которую мы прописали в EXTINF) в названии файла/тайтле
                        var hashMatch = (title + filename).match(/LampaHash="([^"]+)"/);
                        if (hashMatch) {
                            currentLampaHash = hashMatch[1];
                        }
                    }

                    // Если файл в VLC сменился
                    if (currentLampaHash && window.lampa_vlc_current_hash && currentLampaHash !== window.lampa_vlc_current_hash) {
                        console.log(plugin_name, 'Обнаружен переход на следующую серию:', currentLampaHash);

                        // 1. Помечаем старую серию как 100% просмотренную
                        var oldData = Lampa.Player.playdata();
                        if (oldData && oldData.timeline && oldData.timeline.handler) {
                            // Имитируем завершение (100% просмотр)
                            oldData.timeline.handler(100, oldData.timeline.duration || 1, oldData.timeline.duration || 1);
                        }

                        // 2. Ищем новую серию в плейлисте Lampa
                        var playlist = Lampa.Player.playlist() || [];
                        var nextItem = playlist.find(function (item) {
                            return item.timeline && item.timeline.hash === currentLampaHash;
                        });

                        // 3. Переключаем фокус Lampa 
                        if (nextItem) {
                            window.lampa_vlc_current_hash = currentLampaHash;
                            // Подменяем playdata плеера на новый элемент, чтобы тайлайн писался по новому хэшу
                            // Lampa.Player.playdata() возвращает ссылку на work, но сеттера нет. 
                            // Мы можем обновить внутренности timeline
                            if (oldData) {
                                oldData.timeline = nextItem.timeline;
                                oldData.url = nextItem.url;
                            }

                            // Выводим уведомление о начале новой серии в интерфейс (опционально)
                            Lampa.Noty.show('Началась новая серия: ' + nextItem.title);

                            // Перерисовываем UI Lampa (если панель открыта)
                            if (Lampa.Player.opened()) {
                                Lampa.Player.stat(); // или другое обновление
                            }
                        }
                    }

                    // Обновляем таймкод текущей серии (если она активна)
                    if (status.time && status.length) {
                        var currentTime = status.time / 1000;
                        var duration = status.length / 1000;
                        var percent = Math.round((currentTime / duration) * 100);

                        var currentData = Lampa.Player.playdata();
                        if (currentData && currentData.timeline && currentData.timeline.handler) {
                            currentData.timeline.handler(percent, currentTime, duration);
                        }
                    }
                })
                .catch(function (error) {
                    console.error(plugin_name, 'Ошибка получения timecode:', error);
                    window.lampa_vlc_playlist_recording = false;
                    clearInterval(vlcPollingInterval);
                    vlcPollingInterval = null;
                });
        }, POLLING_INTERVAL_MS);
    }

    /**
     * Главный перехватчик событий плеера
     */
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {

            // 1. Добавляем кнопку "Смотреть весь плейлист" в контектное меню (долгий тап) торрентов
            Lampa.Listener.follow('torrent', function (event) {
                if (event.type === 'onlong' && fs) {
                    var menu = event.menu;
                    menu.unshift({
                        title: '▶ Играть как плейлист (VLC)',
                        subtitle: 'Непрерывное воспроизведение всех серий',
                        lampa_vlc_playlist: true
                    });

                    // Переопределяем onSelect у модалки, чтобы поймать наш клик
                    // Lampa показывает Select, мы должны перехватить выбор ДО оригинального обработчика
                    var originalShow = Lampa.Select.show;
                    Lampa.Select.show = function (params) {
                        var originalOnSelect = params.onSelect;
                        params.onSelect = function (a) {
                            if (a.lampa_vlc_playlist) {
                                Lampa.Select.hide();
                                Lampa.Controller.toggle(Lampa.Controller.enabled().name);

                                // Устанавливаем флаг
                                window.lampa_vlc_playlist_enabled = true;

                                // Запускаем стандартный плеер Lampa (далее перехватим)
                                if (event.element && typeof Lampa.Torrent !== 'undefined') {
                                    // Нужно получить объект фильма
                                    var activity = Lampa.Activity.active();
                                    var movie = activity ? activity.card : {};
                                    event.element.poster = movie ? movie.img : '';

                                    // Устанавливаем флаги на более долгий срок, 
                                    // т.к. Lampa грузит серии асинхронно или через прелоадер.
                                    window.lampa_vlc_playlist_enabled = true;

                                    // Сохраняем элементы раздачи
                                    window.lampa_vlc_playlist_items = event.items;

                                    // Отключаем на случай, если мы не дошли до openPlayer
                                    setTimeout(function () {
                                        window.lampa_vlc_playlist_enabled = false;
                                        window.lampa_vlc_playlist_items = null;
                                    }, 10000); // 10 сек таймаут

                                    if (event.item) {
                                        event.item.trigger('hover:enter');
                                    } else {
                                        Lampa.Torrent.start(event.element, movie);
                                    }
                                } else {
                                    Lampa.Noty.show('Не удалось запустить торрент');
                                }
                                return;
                            }
                            // Если нажали на стандартный пункт — вызываем стандартный
                            if (originalOnSelect) originalOnSelect(a);
                        };

                        // Восстанавливаем оригинальный метод сразу после использования
                        Lampa.Select.show = originalShow;
                        originalShow.apply(this, arguments);
                    };
                }
            });

            // 2. Перехватываем попытки запустить VLC
            var originalOpenPlayer = Lampa.VLC ? Lampa.VLC.openPlayer : null;
            if (originalOpenPlayer && fs) {
                Lampa.VLC.openPlayer = function (url, data, options) {
                    options = options || {};
                    var port = options.port || 3999;
                    var password = options.password || '123456';
                    var fullscreen = options.fullscreen !== false;

                    // Если юзер нажал обычный "Play" (не через нашу кнопку), отдаем стандартному VLC Lampa
                    if (!window.lampa_vlc_playlist_enabled) {
                        return originalOpenPlayer.apply(this, arguments);
                    }

                    // Очищаем флаг на будущее
                    window.lampa_vlc_playlist_enabled = false;

                    console.log(plugin_name, 'Запускаем кастомный плейлист VLC...');

                    // Берем плейлист либо из Player, либо сохраненный нами (если Player.playlist еще не обновился)
                    var playlist = window.lampa_vlc_playlist_items || Lampa.Player.playlist() || [];

                    if (playlist.length === 0) {
                        // Если плейлиста нет, запускаем стандартно
                        console.log(plugin_name, 'Плейлист пуст, откат на стандартный плеер');
                        return originalOpenPlayer.apply(this, arguments);
                    }

                    // Генерируем M3U
                    if (data.timeline) {
                        window.lampa_vlc_current_hash = data.timeline.hash;
                    }
                    var m3uContent = generateM3U(url, playlist);

                    // Сохраняем M3U на диск
                    try {
                        fs.writeFileSync(M3U_PATH, m3uContent, 'utf8');
                    } catch (err) {
                        console.error(plugin_name, 'Не удалось записать M3U', err);
                        Lampa.Noty.show('Ошибка создания плейлиста VLC');
                        return originalOpenPlayer.apply(this, arguments);
                    }

                    // Запускаем VLC, передавая ему M3U плейлист
                    var startTime = (data.timeline && data.timeline.time ? data.timeline.time : 0) * 1000;
                    var vlcArgs = [
                        '--extraintf=http',
                        '--http-host=localhost',
                        '--http-port=' + port,
                        '--http-password=' + password,
                        '--start-time=' + startTime,
                        '--play-and-exit',
                        '--no-loop',
                        M3U_PATH
                    ];

                    if (fullscreen) vlcArgs.push('--fullscreen');

                    var playerPath = Lampa.Storage.field('player_nw_path');
                    if (fs.existsSync(playerPath)) {
                        spawn(playerPath, vlcArgs);
                        Lampa.Noty.show('VLC запущен (режим плейлиста)');
                    } else {
                        Lampa.Noty.show(Lampa.Lang.translate('player_not_found') + ': ' + playerPath);
                        return;
                    }

                    // Перестаем слушать встроенный пуллинг Lampa и запускаем свой
                    setTimeout(function () {
                        Lampa.VLC.stopTimecodePolling();
                        window.lampa_vlc_playlist_recording = true;
                        startCustomTimecodePolling(port, password);
                    }, 5000);
                };
            }
        }
    });

})();
