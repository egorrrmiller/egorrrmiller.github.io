(function () {
    let tmdb_cache = {};

    // 1. Слушаем событие рендера каждого файла в списке торрентов
    Lampa.Listener.follow('torrent_file', (e) => {
        console.log(e);
    });
})();
