(function () {
    let tmdb_cache = {};

    function startPlugin() {
        console.log('Lampa Torrent Redraw: Active');

        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        // Если добавился весь контейнер или отдельная строка файла
                        if (node.classList && node.classList.contains('torrent-serial')) {
                            processItem(node);
                        } else if (node.querySelector) {
                            const items = node.querySelectorAll('.torrent-serial');
                            items.forEach(processItem);
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    async function processItem(item) {
        if (item.dataset.redrawn) return;
        item.dataset.redrawn = 'true';

        const activity = Lampa.Activity.active();
        if (!activity || !activity.card) return;

        const card = activity.card;
        // Нам нужен номер эпизода и номер сезона
        const epNum = item.querySelector('.torrent-serial__episode')?.innerText;
        const seasonNode = item.closest('.torrent-files')?.querySelector('.torrent-serial__line b');
        const seasonNum = seasonNode ? seasonNode.innerText : '1';

        if (!epNum) return;

        // Временно скрываем текст, чтобы замена была менее заметной
        const titleNode = item.querySelector('.torrent-serial__title');
        if (titleNode) titleNode.style.opacity = '0.2';

        const cacheKey = `${card.id}_s${seasonNum}`;

        if (tmdb_cache[cacheKey]) {
            applyData(item, tmdb_cache[cacheKey], epNum);
        } else {
            // Запрашиваем данные сезона у TMDB
            const url = `tv/${card.id}/season/${seasonNum}?language=ru-RU`;
            
            Lampa.TMDB.get(url, {}, (data) => {
                if (data && data.episodes) {
                    tmdb_cache[cacheKey] = data.episodes;
                    applyData(item, tmdb_cache[cacheKey], epNum);
                }
            }, () => {
                if (titleNode) titleNode.style.opacity = '1';
            });
        }
    }

    function applyData(item, episodes, epNum) {
        const episodeData = episodes.find(e => e.episode_number == epNum);
        if (episodeData) {
            // 1. Обновляем название серии
            const titleNode = item.querySelector('.torrent-serial__title');
            if (titleNode) {
                titleNode.innerText = episodeData.name;
                titleNode.style.opacity = '1';
            }

            // 2. Обновляем постер на "скриншот" серии
            const imgNode = item.querySelector('.torrent-serial__img');
            if (imgNode && episodeData.still_path) {
                const imgUrl = Lampa.TMDB.image(episodeData.still_path, 'w500');
                imgNode.setAttribute('src', imgUrl);
                imgNode.setAttribute('data-src', imgUrl);
            }

            // 3. Обновляем дату выхода (если нужно)
            const dateNode = item.querySelector('.torrent-serial__line span:last-child');
            if (dateNode && episodeData.air_date) {
                dateNode.innerText = 'Выход - ' + Lampa.Utils.parseDate(episodeData.air_date).format('DD MMMM YYYY');
            }
        } else {
            const titleNode = item.querySelector('.torrent-serial__title');
            if (titleNode) titleNode.style.opacity = '1';
        }
    }

    // Ожидание готовности системы
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
