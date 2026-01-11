// Выполнить сразу при загрузке приложения  
(function () {  
    let tmdb_cache = {};  
  
    // Добавить проверку что слушатель установлен  
    console.log('Torrent file listener initialized');  
  
    Lampa.Listener.follow('torrent_file', (e) => {  
        console.log('Torrent file event:', e.type); // для отладки  
          
        if (e.type === 'render') {  
            const item = e.item;  
            const data = e.element;  
              
            // Проверяем структуру данных  
            console.log('Element data:', data);  
              
            const activity = Lampa.Activity.active();  
            if (!activity || !activity.card) return;  
  
            const card = activity.card;  
            const epNum = data.episode; // должно быть в data  
            const seasonNum = data.season || 1;  
  
            console.log('Episode:', epNum, 'Season:', seasonNum);  
  
            if (epNum) {  
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
