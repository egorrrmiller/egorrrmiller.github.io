(function () {
    'use strict';

    if (!window.Lampa) return;

    var plugin_name = 'Infuse Playlist';

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            Lampa.Listener.follow('torrent_file', function (event) {
                if (event.type === 'onlong') {
                    // Проверяем, что есть элементы (серии)
                    var items = event.items || (event.params && event.params.files) || [];
                    if (items.length <= 1) return;

                    var menu = event.menu;
                    menu.unshift({
                        title: '▶ Плейлист в Infuse',
                        subtitle: 'Отправить все серии в очередь',
                        lampa_infuse_playlist: true
                    });

                    var originalShow = Lampa.Select.show;
                    Lampa.Select.show = function (params) {
                        var originalOnSelect = params.onSelect;
                        
                        params.onSelect = function (a) {
                            if (a.lampa_infuse_playlist) {
                                Lampa.Select.hide();
                                Lampa.Controller.toggle(Lampa.Controller.enabled().name);

                                var element = event.element || {};
                                
                                // Индекс выбранной серии
                                var startIndex = items.findIndex(function (i) {
                                    return i === element || (i.timeline && element.timeline && i.timeline.hash === element.timeline.hash);
                                });
                                if (startIndex === -1) startIndex = 0;

                                // Собираем плейлист, начиная с выбранной серии + следующие
                                var playlistArr = [];
                                for (var i = startIndex; i < items.length; i++) {
                                    var item = items[i];
                                    var url = typeof item.url === 'string' ? item.url : '';
                                    
                                    if (!url && item.path && Lampa.Torserver && event.params && event.params.hash) {
                                        url = Lampa.Torserver.stream(item.path, event.params.hash, item.id);
                                    }

                                    if (url) {
                                        url = url.replace('&preload', '&play');
                                        var title = item.title || item.fname || ('Episode ' + (i + 1));
                                        
                                        if (typeof title === 'string') {
                                            title = title.replace(/<[^>]*>?/gm, '');
                                        }

                                        playlistArr.push({
                                            title: title,
                                            url: url,
                                            // Infuse также может съесть thumbnail, так что пробуем передать, если есть
                                            thumbnail: item.thumbnail || item.img || ''
                                        });
                                    }
                                }

                                if (playlistArr.length > 0) {
                                    // Первая серия будет стартовой
                                    var firstUrl = playlistArr[0].url;
                                    
                                    // Все остальные серии упаковываем в JSON
                                    var encodedPlaylist = encodeURIComponent(JSON.stringify(playlistArr));
                                    
                                    // Формируем deeplink
                                    var infuseLink = 'infuse://x-callback-url/play?url=' + encodeURIComponent(firstUrl) + '&playlist=' + encodedPlaylist;
                                    
                                    console.log(plugin_name, 'Отправляем в Infuse:', playlistArr.length, 'серий');
                                    
                                    Lampa.Noty.show('Отправка в Infuse...');
                                    window.location.assign(infuseLink);
                                } else {
                                    Lampa.Noty.show('Не удалось сформировать ссылки');
                                }
                                return;
                            }
                            
                            // Вызов оригинального обработчика для других пунктов (сброс времени и тд)
                            if (originalOnSelect) originalOnSelect(a);
                        };

                        Lampa.Select.show = originalShow;
                        originalShow.apply(this, arguments);
                    };
                }
            });
        }
    });

})();
