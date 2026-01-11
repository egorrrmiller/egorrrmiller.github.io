(function () {
    let tmdb_cache = {};

    // 1. Слушаем событие рендера каждого файла в списке торрентов
    Lampa.Listener.follow('torrent_file', (e) => {
        if (e.type === 'render') {
            const item = e.item; // jQuery элемент (.torrent-serial)
            const data = e.element; // Данные файла (name, episode, season и т.д.)
            
            const activity = Lampa.Activity.active();
            if (!activity || !activity.card) return;

            const card = activity.card;
            // Пытаемся определить номер эпизода из данных файла
            const epNum = data.episode;
            const seasonNum = data.season || 1;

            if (epNum) {
                // Чтобы не перерисовывать многократно
                if (item.attr('data-redrawn')) return;
                
                const cacheKey = `${card.id}_s${seasonNum}`;

                if (tmdb_cache[cacheKey]) {
                    applyChanges(item, tmdb_cache[cacheKey], epNum, seasonNum);
                } else {
                    Lampa.TMDB.get(`tv/${card.id}/season/${seasonNum}?language=ru-RU`, {}, (tmdbData) => {
                        if (tmdbData && tmdbData.episodes) {
                            tmdb_cache[cacheKey] = tmdbData.episodes;
                            applyChanges(item, tmdb_cache[cacheKey], epNum, seasonNum);
                        }
                    });
                }
            }
        }

        // 2. Перехват выбора (Enter) — если нужно что-то менять при клике
        if (e.type === 'onenter') {
            console.log('Lampa Redraw: Запуск файла', e.element.name);
            // Здесь можно добавить свою логику перед запуском плеера
        }
    });

    function applyChanges(item, episodes, epNum, seasonNum) {
        const epData = episodes.find(e => e.episode_number == epNum);
        if (!epData) return;

        item.attr('data-redrawn', 'true');

        // Формируем новый внутренний HTML, идентичный структуре Lampa, но с нашими данными
        const img = epData.still_path ? Lampa.TMDB.image(epData.still_path, 'w500') : './img/img_broken.svg';
        const date = epData.air_date ? Lampa.Utils.parseDate(epData.air_date).format('DD MMMM YYYY') : '--';

        // Полностью перерисовываем внутреннюю структуру .torrent-serial
        item.html(`
            <img src="${img}" class="torrent-serial__img loaded">
            <div class="torrent-serial__content">
                <div class="torrent-serial__body">
                    <div class="torrent-serial__title">${epData.name}</div>
                    <div class="torrent-serial__line">
                        <span>Сезон - <b>${seasonNum}</b></span>
                        <span>Выход - ${date}</span>
                    </div>
                </div>
                <div class="torrent-serial__detail">
                    <div class="torrent-serial__size">${item.find('.torrent-serial__size').text() || ''}</div>
                    <div class="torrent-serial__exe">${item.find('.torrent-serial__exe').text() || ''}</div>
                </div>
                <div class="torrent-serial__clear"></div>
            </div>
            <div class="torrent-serial__episode">${epNum}</div>
        `);
        
        // Добавляем таймлайн, если он был (прогресс просмотра)
        if (item.data('hash')) {
            const hash = item.data('hash');
            const timeline = Lampa.Timeline.view(hash);
            if (timeline && timeline.percent > 0) {
                item.find('.torrent-serial__content').append(`
                    <div class="time-line">
                        <div style="width: ${timeline.percent}%"></div>
                    </div>
                `);
            }
        }
    }
})();
