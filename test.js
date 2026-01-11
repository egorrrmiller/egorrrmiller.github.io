/*
* 1. Получаем карточку фильма/сериала
*
* */

(function () {
    
    const regex = /(?:часть|part|pt?\.?)\s*(\d+)/i;

    const activity = Lampa.Activity.active();

    const card = activity.card;
    
    const episodes = card.episodes;
    
    console.log(episodes)
    
    Lampa.Listener.follow('torrent_file', (e) => {

        if (e.type === 'render'){
            e.item.find('.torrent-serial__title').text('тест тест тест');
        }

        console.log(e);
    });
})();
