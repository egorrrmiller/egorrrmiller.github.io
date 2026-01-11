(function(){
    const TMDB_KEY = '4ef0d7355d9ffb5151e987764708ce96';

    function log(...m){ console.log('[TMDB-Torrent]', ...m); }

    function extractEpisode(name){
        name = name.toLowerCase();

        let m;
        if(m = name.match(/s(\d+)[ ._-]?e(\d+)/)) return {season:+m[1], episode:+m[2]};
        if(m = name.match(/(\d+)x(\d+)/)) return {season:+m[1], episode:+m[2]};
        if(m = name.match(/(?:ep|e)(\d{1,3})/)) return {season:null, episode:+m[1]};
        if(m = name.match(/[^0-9](\d{1,3})(?:[^0-9]|$)/)) return {season:null, episode:+m[1]};
        return {season:null, episode:null};
    }

    async function loadTMDB(tv_id, season){
        const url = `https://apitmdb.mirror-kurwa.men/3/tv/${tv_id}/season/${season}?api_key=${TMDB_KEY}&language=ru-RU`;
        try{
            const res = await fetch(url);
            const data = await res.json();
            return data.episodes || [];
        }catch(e){
            log('TMDB error', e);
            return [];
        }
    }

function patchCards(files, tmdbEpisodes){
    files.forEach(function(node){
        const card = $(node);
        const fileName = card.find('.torrent-serial__title').text() || '';
        const found = extractEpisode(fileName);

        let episode;
        if(found.episode){
            episode = tmdbEpisodes.find(e=>e.episode_number === found.episode);
        }
        if(!episode) return;

        // Подмена заголовка
        card.find('.torrent-serial__title').text(episode.name || fileName);

        // Дата
        if(episode.air_date){
            card.find('.torrent-serial__line span:nth-child(2)')
                .text('Выход - ' + episode.air_date);
        }

        // Обложка (гасим все внешние запросы)
        const img = card.find('img');

        // Убираем lazy-load
        img.removeAttr('data-src');
        img.removeClass('lazyload');

        // Гасим уже подставленный src
        img.attr('src', '');

        // Ставим изображение TMDB
        if(episode.still_path){
            img.attr('src', 'https://image.tmdb.org/t/p/w500' + episode.still_path);
        } else {
            // если TMDB пустой — ставим прозрачный пиксель
            img.attr('src', 'data:image/gif;base64,R0lGODlhAQABAAAAACw=');
        }

        // Переносим описание в title (можно вывести в UI если надо)
        card.attr('title', (episode.overview || '').trim());
    });
}


    Lampa.Listener.follow('torrent:files', async function(ev){
        const data = ev.data;
        if(!data || !data.torrent) return;

        const activity = Lampa.Activity.active();
        if(!activity || !activity.source) return;

        const movie = activity.source;
        const tv_id = movie.tmdb_id || movie.id;
        const season = movie.season_number || movie.season || 1;

        log('Detected TV id=', tv_id, 'Season=', season);

        const tmdbEpisodes = await loadTMDB(tv_id, season);
        if(!tmdbEpisodes.length){
            log('No TMDB episode data');
            return;
        }

        // Torrent DOM генерируется чуть позже → небольшая задержка
        setTimeout(function(){
            const cards = document.querySelectorAll('.torrent-serial.selector');
            if(cards.length){
                patchCards(cards, tmdbEpisodes);
                log('UI Updated');
            }
        }, 200);
    });

    log('Loaded!');
})();
