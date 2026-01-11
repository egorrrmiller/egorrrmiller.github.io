/*
* 1. Получаем карточку фильма/сериала
*
* */

(function () {

    try {
        const regex = /(?:часть|part|pt?\.?)\s*(\d+)/i;

        const activity = Lampa.Activity.active();

        const card = activity.movie;


        console.log(card)

        Lampa.Listener.follow('torrent_file', (e) => {

            if (e.type === 'render'){
                e.item.find('.torrent-serial__title').text('тест тест тест');
            }

            console.log(e);
        });
    }
    catch (error) {
        console.error('ОШИБКА: ', error)
    }

})();
