(function() {  
    let seasonCache = {};  
    let loadingPromises = {};  
  
    function preloadSeasonData(movieId, seasonNum) {  
        const cacheKey = `${movieId}_s${seasonNum}`;  
          
        if (seasonCache[cacheKey]) {  
            return Promise.resolve(seasonCache[cacheKey]);  
        }  
          
        if (loadingPromises[cacheKey]) {  
            return loadingPromises[cacheKey];  
        }  
          
        loadingPromises[cacheKey] = new Promise((resolve) => {  
            Lampa.Api.sources.tmdb.get(`tv/${movieId}/season/${seasonNum}?language=ru-RU`, {}, (tmdbData) => {  
                if (tmdbData && tmdbData.episodes_original) {  
                    seasonCache[cacheKey] = tmdbData.episodes_original;  
                    resolve(seasonCache[cacheKey]);  
                } else {  
                    resolve([]);  
                }  
            });  
        });  
          
        return loadingPromises[cacheKey];  
    }  
  
    Lampa.Listener.follow('torrent_file', async (e) => {  
        if (e.type === 'list_open') {  
            seasonCache = {};  
            loadingPromises = {};  
              
            // Предзагружаем данные для всего сезона  
            const movie = e.params.movie;  
            if (movie && movie.id) {  
                // Определяем сезон из первого элемента  
                const firstItem = e.items[0];  
                if (firstItem) {  
                    const info = Torserver.parse({  
                        movie: movie,  
                        files: e.items,  
                        filename: firstItem.path_human,  
                        path: firstItem.path,  
                    });  
                      
                    if (info.season) {  
                        await preloadSeasonData(movie.id, info.season);  
                    }  
                }  
            }  
        }  
        else if (e.type === 'render') {  
            const item = e.item;  
            const data = e.element;  
            const movie = e.params.movie;  
              
            if (!movie || !movie.id || !data.title) return;  
              
            const fileName = data.folder_name || data.path;  
            const checkPart = fileName.match(/(?:часть|part|pt?\.?)\s*(\d+)/i);  
              
            if (checkPart) {  
                const seasonNum = data.season || 1;  
                const cacheKey = `${movie.id}_s${seasonNum}`;  
                  
                // Данные уже должны быть в кэше  
                if (seasonCache[cacheKey]) {  
                    applyEpisodeData(seasonCache[cacheKey]);  
                }  
            }  
        }  
    });  
  
    function applyEpisodeData(episodes) {  
        // Ваша логика применения данных...  
    }  
})();
