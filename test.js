(function () {
    const originalModalOpen = Lampa.Modal.open;

    // Перехватываем открытие любого модального окна
    Lampa.Modal.open = function (params) {
        // Если это окно со списком файлов (торренты)
        if (params.title === Lampa.Lang.translate('torrent_serial_files') || params.title === 'Файлы') {
            const activity = Lampa.Activity.active();
            const card = activity.card;

            // Если это сериал, будем перерисовывать
            if (card && (card.number_of_seasons || card.name)) {
                
                // Создаем наше кастомное наполнение
                const customHtml = $(`<div class="torrent-files"><div class="loading" style="padding: 20px; text-align: center;">Загрузка данных из TMDB...</div></div>`);
                
                // Подменяем контент в параметрах модалки перед открытием
                params.html = customHtml;

                // Вызываем оригинал, чтобы окно открылось, но уже с нашей "пустышкой"
                originalModalOpen.call(Lampa.Modal, params);

                // Начинаем магию отрисовки
                renderCustomFiles(customHtml, card);
                
                return; // Выходим, чтобы не сработал дефолтный код
            }
        }
        
        // Для всех остальных окон работаем как обычно
        originalModalOpen.call(Lampa.Modal, params);
    };

    function renderCustomFiles(container, card) {
        // Определяем сезон. Обычно берется из текущего контекста Lampa
        // Если данных нет, по умолчанию 1
        const seasonNum = card.season || 1;

        Lampa.TMDB.get(`tv/${card.id}/season/${seasonNum}?language=ru-RU`, {}, (data) => {
            container.empty(); // Убираем надпись "Загрузка"

            if (data && data.episodes) {
                data.episodes.forEach(ep => {
                    const img = ep.still_path ? Lampa.TMDB.image(ep.still_path, 'w500') : './img/img_broken.svg';
                    const date = ep.air_date ? Lampa.Utils.parseDate(ep.air_date).format('DD MMMM YYYY') : '--';

                    const item = $(`
                        <div class="torrent-serial selector layer--visible layer--render" data-episode="${ep.episode_number}">
                            <img src="${img}" class="torrent-serial__img loaded">
                            <div class="torrent-serial__content">
                                <div class="torrent-serial__body">
                                    <div class="torrent-serial__title">${ep.name}</div>
                                    <div class="torrent-serial__line">
                                        <span>Сезон - <b>${seasonNum}</b></span>
                                        <span>Выход - ${date}</span>
                                    </div>
                                </div>
                                <div class="torrent-serial__detail">
                                    <div class="torrent-serial__size">TMDB Info</div>
                                    <div class="torrent-serial__exe">EP ${ep.episode_number}</div>
                                </div>
                                <div class="torrent-serial__clear"></div>
                            </div>
                            <div class="torrent-serial__episode">${ep.episode_number}</div>
                        </div>
                    `);

                    // Вешаем обработчик клика (здесь можно прописать запуск плеера)
                    item.on('hover:enter', () => {
                        Lampa.Noty.show('Запуск серии: ' + ep.name);
                        // Тут должна быть логика поиска ссылки в оригинальных данных торрента
                    });

                    container.append(item);
                });

                // Обновляем контроллер, чтобы можно было перемещаться по списку пультом
                Lampa.Controller.enable('modal');
            }
        }, () => {
            container.html('<div style="padding: 20px;">Ошибка загрузки TMDB</div>');
        });
    }
})();
