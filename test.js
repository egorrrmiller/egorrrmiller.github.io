(function(){
    const TMDB_KEY = '4ef0d7355d9ffb5151e987764708ce96';
    function log(...m){ console.log('[TMDB-Torrent]', ...m); }

    function extractEp(name){
        name = name.toLowerCase();
        let m;
        if(m = name.match(/s(\d+)[ ._-]?e(\d+)/)) return +m[2];
        if(m = name.match(/(\d+)x(\d+)/)) return +m[2];
        if(m = name.match(/(?:ep|e)(\d{1,3})/)) return +m[1];
        if(m = name.match(/[^0-9](\d{1,3})(?:[^0-9]|$)/)) return +m[1];
        return null;
    }

    async function loadTMDB(tv_id, season){
        const url = `https://apitmdb.mirror-kurwa.men/3/tv/${tv_id}/season/${season}?api_key=${TMDB_KEY}&language=ru-RU`;
        try{
            return (await fetch(url)).json();
        }catch(e){
            log('tmdb err',e);
            return { episodes: [] };
        }
    }

    function makeCard(file, epinfo){
        const poster = epinfo?.still_path
            ? `https://image.tmdb.org/t/p/w500${epinfo.still_path}`
            : `data:image/gif;base64,R0lGODlhAQABAAAAACw=`;

        const title  = epinfo?.name || file.original || file.name;
        const air    = epinfo?.air_date || '--';

        return `
<div class="torrent-serial selector">
    <img src="${poster}" class="torrent-serial__img"/>
    <div class="torrent-serial__content">
        <div class="torrent-serial__body">
            <div class="torrent-serial__title">${title}</div>
            <div class="torrent-serial__line">
                <span>Сезон - <b>${file.season}</b></span>
                <span>Выход - ${air}</span>
            </div>
        </div>
        <div class="torrent-serial__detail">
            <div class="torrent-serial__size">${file.size || ''}</div>
            <div class="torrent-serial__exe">.${file.ext}</div>
        </div>
        <div class="torrent-serial__clear"></div>
        <div class="time-line hide" data-hash="${file.hash}">
            <div style="width: 0%"></div>
        </div>
    </div>
    <div class="torrent-serial__episode">${file.episode}</div>
</div>`;
    }

    Lampa.Listener.follow('torrent:files', async function(ev){
        const data = ev.data;
        if(!data || !data.torrent || !data.files) return;

        const act = Lampa.Activity.active();
        const src = act?.source || {};
        const tv_id = src.tmdb_id || src.id;
        const season = src.season_number || src.season || 1;

        const tmdb = await loadTMDB(tv_id, season);
        const episodes = tmdb?.episodes || [];

        // Подготавливаем список файлов
        const prepared = data.files.map(f => {
            const episode = extractEp(f.name) || f.order || 1;
            const ext = (f.name.split('.').pop() || '').toLowerCase();
            return {
                name: f.name,
                original: f.orig_name,
                season,
                episode,
                hash: f.hash,
                size: f.size_readable,
                ext
            };
        });

        // Рендерим заново
        const container = $('.torrent-files');
        container.empty();

        prepared.forEach(file => {
            const info = episodes.find(e => e.episode_number == file.episode);
            container.append(makeCard(file, info));
        });

        log('UI fully overwritten — NO external loads.');
    });

    log('TMDB torrent plugin ready.');
})();
