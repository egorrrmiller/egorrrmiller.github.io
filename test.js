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
})();
