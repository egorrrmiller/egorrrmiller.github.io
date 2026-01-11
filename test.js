(function () {
    function startPlugin() {
        console.log('Lampa Torrent Redraw: Started');

        // Создаем наблюдатель за DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const torrentFiles = node.querySelector('.torrent-files');
                        if (torrentFiles) {
                            redrawTorrentItems(torrentFiles);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function redrawTorrentItems(container) {
        // Получаем данные текущей карточки
        const activity = Lampa.Activity.active();
        if (!activity || !activity.card) return;

        const card = activity.card;
        const items = container.querySelectorAll('.torrent-serial');
        
        // Для сериалов нам нужно понять, какой сезон открыт
        // Обычно номер сезона есть в первой строке: <span>Сезон - <b>1</b></span>
        const seasonNode = container.querySelector('.torrent-serial__line b');
        const seasonNumber = seasonNode ? seasonNode.innerText : '1';

        // Формируем URL для запроса к TMDB (сериалы или фильмы)
        let url = '';
        if (card.number_of_seasons || card.first_air_date) {
            url = `tv/${card.id}/season/${seasonNumber}?language=ru-RU`;
        } else {
            // Для фильмов обычно одна карточка, но разметка торрентов может отличаться
            return; 
        }

        // Используем встроенный метод TMDB
        Lampa.TMDB.get(url, {}, (data) => {
            if (data && data.episodes) {
                items.forEach((item) => {
                    const episodeNum = item.querySelector('.torrent-serial__episode').innerText;
                    const episodeData = data.episodes.find(e => e.episode_number == episodeNum);

                    if (episodeData) {
                        // 1. Обновляем Название
                        const titleNode = item.querySelector('.torrent-serial__title');
                        if (titleNode) titleNode.innerText = episodeData.name;

                        // 2. Обновляем Изображение
                        const imgNode = item.querySelector('.torrent-serial__img');
                        if (imgNode && episodeData.still_path) {
                            const newSrc = `https://image.tmdb.org/t/p/w500${episodeData.still_path}`;
                            imgNode.setAttribute('src', newSrc);
                            imgNode.setAttribute('data-src', newSrc);
                        }

                        // 3. Обновляем Дату выхода (опционально)
                        const lineNode = item.querySelector('.torrent-serial__line span:last-child');
                        if (lineNode && episodeData.air_date) {
                            const date = new Date(episodeData.air_date).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            lineNode.innerHTML = `Выход - ${date}`;
                        }
                    }
                });
            }
        }, () => {
            console.log('Lampa Torrent Redraw: TMDB request failed');
        });
    }

    // Запуск плагина после готовности Lampa
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
