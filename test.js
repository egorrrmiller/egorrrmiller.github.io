(function(){
    const API_KEY = 'YOUR_TMDB_KEY';
    let tmdbCache = null;

    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    function log(...a){ console.log('[TMDB FILE PATCH]', ...a); }

    function waitForTorrentFiles(){
        const box = document.querySelector('.torrent-files');
        if(box){
            log('torrent-files найден, запускаю патчинг…');
            startPatchingLoop();
        } else {
            setTimeout(waitForTorrentFiles, 300);
        }
    }

    function startPatchingLoop(){
        patchOnce();
        attempts++;

        if(attempts < MAX_ATTEMPTS){
            setTimeout(startPatchingLoop, 500);
        } else {
            log('Патч остановлен по лимиту попыток');
        }
    }

    function getEpisodeNumber(card){
        const ep = card.querySelector('.torrent-serial__episode');
        if(!ep) return null;
        const n = parseInt(ep.textContent.trim(), 10);
        return Number.isInteger(n) ? n : null;
    }

    function disableDefaultImg(img){
        img.removeAttribute('data-src');
        img.classList.remove('lazyload');
        img.src = ''; // убить автозагрузку
    }

    function applyEpisode(card, episode){
        const title = card.querySelector('.torrent-serial__title');
        const date = card.querySelector('.torrent-serial__line span:nth-child(2)');
        const img = card.querySelector('img');

        if(title && episode.name) title.textContent = episode.name;
        if(date && episode.air_date) date.textContent = 'Выход - ' + episode.air_date;

        if(img){
            disableDefaultImg(img);

            img.src = episode.still_path
                ? 'https://image.tmdb.org/t/p/w500' + episode.still_path
                : 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
        }
    }

    async function loadTMDB(){
        if(tmdbCache) return tmdbCache;

        const id = Lampa?.Activity?.activity?.tmdb_id;
        if(!id){
            log('Нет TMDB ID');
            tmdbCache = [];
            return tmdbCache;
        }

        const url = `https://api.themoviedb.org/3/tv/${id}/season/1?api_key=${API_KEY}&language=ru-RU`;
        const res = await fetch(url);
        const json = await res.json();
        tmdbCache = json?.episodes || [];
        log('TMDB эпизодов:', tmdbCache.length);

        return tmdbCache;
    }

    async function patchOnce(){
        const box = document.querySelector('.torrent-files');
        if(!box){
            log('torrent-files пропал?');
            return;
        }

        const cards = box.querySelectorAll('.torrent-serial.selector');
        if(!cards.length){
            log('нет карточек эпизодов');
            return;
        }

        const episodes = await loadTMDB();

        cards.forEach(card => {
            const epNum = getEpisodeNumber(card);
            if(!epNum) return;
            const ep = episodes.find(e=>e.episode_number === epNum);
            if(ep) applyEpisode(card, ep);
        });

        log('Патч шаг:', attempts);
    }

    waitForTorrentFiles();
})();
