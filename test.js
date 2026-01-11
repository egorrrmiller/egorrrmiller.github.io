/*
* 1.
*
* */

(function () {
    let tmdb_cache = {};

    // 1. Слушаем событие рендера каждого файла в списке торрентов
    Lampa.Listener.follow('torrent_file', (e) => {

        if (e.type === 'render'){
            e.item.find('.torrent-serial__title').text('тест тест тест');
        }

        console.log(e);
    });
})();
