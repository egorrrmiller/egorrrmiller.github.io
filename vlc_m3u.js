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
                        if (window.lampa_vlc_playlist_items) {
                            var oldItem = window.lampa_vlc_playlist_items.find(function (i) {
                                return i.timeline && i.timeline.hash === window.lampa_vlc_current_hash;
                            });

                            if (oldItem && oldItem.timeline) {
                                oldItem.timeline.percent = 100;
                                oldItem.timeline.time = oldItem.timeline.duration || 1;
                                Lampa.Timeline.update(oldItem.timeline);
                            }
                        }

                        // 2. Ищем новую серию
                        var nextItem = null;
                        if (window.lampa_vlc_playlist_items) {
                            nextItem = window.lampa_vlc_playlist_items.find(function (i) {
                                return i.timeline && i.timeline.hash === currentLampaHash;
                            });
                        }

                        // 3. Переключаем фокус Lampa 
                        if (nextItem) {
                            window.lampa_vlc_current_hash = currentLampaHash;
                            Lampa.Noty.show('Началась новая серия: ' + nextItem.title);
                        }
                    }

                    // Обновляем таймкод текущей серии (если она активна)
                    if (status.time && status.length && window.lampa_vlc_playlist_items) {
                        var currentTime = status.time / 1000;
                        var duration = status.length / 1000;
                        var percent = Math.round((currentTime / duration) * 100);

                        var activeItem = window.lampa_vlc_playlist_items.find(function (i) {
                            return i.timeline && i.timeline.hash === window.lampa_vlc_current_hash;
                        });

                        if (activeItem && activeItem.timeline) {
                            activeItem.timeline.percent = percent;
                            activeItem.timeline.time = currentTime;
                            activeItem.timeline.duration = duration;
                            Lampa.Timeline.update(activeItem.timeline);
                        }
                    }
                })
                .catch(function (error) {
                    console.error(plugin_name, 'VLC отключен, останавливаем поллинг');
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

            // 1. Добавляем кнопку "Смотреть весь плейлист" в контектное меню (долгий тап) файлов торрента
            Lampa.Listener.follow('torrent_file', function (event) {
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

                                // Логируем событие для отладки
                                console.log(plugin_name, 'Event data:', event);

                                // Пытаемся собрать список файлов из разных источников
                                var items = event.items || (event.params && event.params.files) || [];
                                var element = event.element || {};

                                // Робастная проверка: нам нужен хотя бы один файл и способ достать URL
                                if (element && items.length > 0) {
                                    console.log(plugin_name, 'Запускаем кастомный плейлист VLC напрямую...');

                                    // Сохраняем элементы раздачи
                                    window.lampa_vlc_playlist_items = items;

                                    if (element.timeline) {
                                        window.lampa_vlc_current_hash = element.timeline.hash;
                                    }

                                    // Индекс текущего элемента вручную
                                    var startIndex = items.findIndex(function (i) {
                                        return i === element || (i.timeline && element.timeline && i.timeline.hash === element.timeline.hash);
                                    });
                                    if (startIndex === -1) startIndex = 0;

                                    // Передаем свой startIndex в генератор
                                    var generateM3UDirect = function (startIndex, playlist_items) {
                                        var content = ['#EXTM3U'];
                                        for (var i = startIndex; i < playlist_items.length; i++) {
                                            var item = playlist_items[i];

                                            // Пытаемся получить URL
                                            var url = item.url;
                                            if (!url && item.path && Lampa.Torserver && event.params && event.params.hash) {
                                                url = Lampa.Torserver.stream(item.path, event.params.hash, item.id);
                                            }

                                            if (url && typeof url === 'string') {
                                                url = url.replace('&preload', '&play');
                                                var hash = item.timeline ? item.timeline.hash : ('hash_' + i);
                                                var title = item.title || item.fname || ('Episode ' + (i + 1));
                                                if (typeof title === 'string') {
                                                    title = title.replace(/<[^>]*>?/gm, '');
                                                }
                                                content.push('#EXTINF:-1 LampaHash="' + hash + '",' + title);
                                                content.push(url);
                                            }
                                        }
                                        return content.join('\n');
                                    };

                                    var m3uContent = generateM3UDirect(startIndex, items);

                                    // Сохраняем M3U на диск
                                    try {
                                        fs.writeFileSync(M3U_PATH, m3uContent, 'utf8');
                                    } catch (err) {
                                        console.error(plugin_name, 'Не удалось записать M3U', err);
                                        Lampa.Noty.show('Ошибка создания плейлиста VLC');
                                        return;
                                    }

                                    // Запускаем VLC, передавая ему M3U плейлист
                                    var startTime = (event.element.timeline && event.element.timeline.time ? event.element.timeline.time : 0) * 1000;

                                    // Получаем настройки Lampa
                                    var port = Lampa.Storage.field('vlc_api_port') || '3999';
                                    var password = Lampa.Storage.field('vlc_api_password') || '123456';

                                    // Если пользователь изменил порт/пароль в Lampa player Settings
                                    if (Lampa.Storage.field('player_port')) port = Lampa.Storage.field('player_port');
                                    if (Lampa.Storage.field('player_password')) password = Lampa.Storage.field('player_password');

                                    var fullscreen = Lampa.Storage.field('vlc_fullscreen') !== false;
                                    if (Lampa.Storage.field('player_fullscreen') === false) fullscreen = false;

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

                                        // Запускаем свой поллер напрямую
                                        startCustomTimecodePolling(port, password);
                                    } else {
                                        Lampa.Noty.show(Lampa.Lang.translate('player_not_found') + ': ' + playerPath);
                                    }
                                } else {
                                    Lampa.Noty.show('Не удалось запустить плейлист');
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

            // 2. Перехват Lampa.VLC больше не требуется, т.к. мы запускаем VLC напрямую в событии select!
        }
    });

})();
