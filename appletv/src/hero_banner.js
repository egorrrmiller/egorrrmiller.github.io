(function () {
    'use strict';

    // Стили для Hero Баннера
    var styles = '.appletv-hero { position: relative; width: 100%; height: 65vh; min-height: 400px; margin-bottom: -150px; border-radius: 0 0 20px 20px; overflow: hidden; opacity: 0; transition: opacity 0.5s ease; z-index: 10; margin-top: -2em; pointer-events: none; }' +
    '.appletv-hero.ready { opacity: 1; }' +
    '.appletv-hero__bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-size: cover; background-position: center 20%; z-index: 1; }' +
    '.appletv-hero__bg::after { content: \'\'; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.8) 15%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0) 100%), linear-gradient(to right, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0) 40%); z-index: 2; }' +
    '.appletv-hero__content { position: absolute; bottom: 180px; left: 4em; right: 4em; z-index: 3; display: flex; flex-direction: column; align-items: flex-start; max-width: 800px; }' +
    '.appletv-hero__logo { max-width: 400px; max-height: 150px; object-fit: contain; margin-bottom: 1.5em; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); }' +
    '.appletv-hero__title { font-size: 3em; font-weight: bold; color: #fff; margin-bottom: 0.2em; text-shadow: 0 2px 10px rgba(0,0,0,0.8); line-height: 1.1; }' +
    '.appletv-hero__meta { font-size: 1.2em; color: rgba(255,255,255,0.8); margin-bottom: 1em; display: flex; gap: 15px; align-items: center; }' +
    '.appletv-hero__desc { font-size: 1.1em; line-height: 1.5; color: rgba(255,255,255,0.7); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 4px rgba(0,0,0,0.8); margin-bottom: 1.5em; }' +
    '.appletv-hero__button { background: white; color: black; padding: 0.8em 2em; border-radius: 10px; font-size: 1.2em; font-weight: bold; pointer-events: auto; opacity: 0.9; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }' +
    '.appletv-focused-hero .appletv-hero__button { transform: scale(1.05); box-shadow: 0 0 20px rgba(255,255,255,0.4); opacity: 1; }';

    function addStyles() {
        if ($('#appletv-hero-styles').length === 0) {
            $('head').append('<style id="appletv-hero-styles">' + styles + '</style>');
        }
    }

    /**
     * Создаем и рендерим Hero баннер
     */
    function renderHeroBanner(container, movie) {
        const bgUrl = Lampa.TMDB.image('t/p/original' + movie.backdrop_path);
        const title = movie.title || movie.name;
        const year = ((movie.release_date || movie.first_air_date || '0000') + '').slice(0, 4);
        const desc = movie.overview || '';
        
        var html = '<div class="appletv-hero">' +
            '<div class="appletv-hero__bg" style="background-image: url(\'' + bgUrl + '\')"></div>' +
            '<div class="appletv-hero__content">' +
                '<img class="appletv-hero__logo hide" src="" alt="' + title + '" />' +
                '<div class="appletv-hero__title">' + title + '</div>' +
                '<div class="appletv-hero__meta">' +
                    '<span>' + year + '</span>' +
                    '<span>' + (movie.vote_average ? movie.vote_average.toFixed(1) : '') + '</span>' +
                '</div>' +
                '<div class="appletv-hero__desc">' + desc + '</div>' +
                '<div class="appletv-hero__button">Нажмите ВВЕРХ для подробностей</div>' +
            '</div>' +
        '</div>';

        const $hero = $(html);
        container.prepend($hero);

        // Пытаемся загрузить логотип через API фан-арта (или TMDB)
        const type = movie.name ? 'tv' : 'movie';
        const lang = Lampa.Storage.get('language', 'ru');
        Lampa.TMDB.api(type + '/' + movie.id + '/images?include_image_language=' + lang + ',en', (images) => {
            if (images && images.logos && images.logos.length > 0) {
                // Ищем локализованный логотип, иначе английский
                let selectedLogo = images.logos.find(l => l.iso_639_1 === lang);
                const useForeign = Lampa.Storage.get('appletv_show_foreign_logo', true);
                
                if (!selectedLogo && useForeign) {
                    selectedLogo = images.logos.find(l => l.iso_639_1 === 'en') || images.logos[0];
                }

                if (selectedLogo) {
                    const logoUrl = Lampa.TMDB.image('t/p/w500' + selectedLogo.file_path);
                    $hero.find('.appletv-hero__logo').attr('src', logoUrl).removeClass('hide').show();
                    $hero.find('.appletv-hero__title').hide(); // прячем текстовый заголовок
                }
            }
            $hero.addClass('ready');
        }, () => {
             $hero.addClass('ready');
        });

        // Навешиваем слушатель на скролл, чтобы баннер уходил в прозрачность при скролле вниз
        const $scrollBody = container.closest('.scroll__body');
        $scrollBody.on('scroll', function() {
            const st = $(this).scrollTop();
            if (st < 300) {
                $hero.css('opacity', 1 - (st / 300));
            } else {
                $hero.css('opacity', 0);
            }
        });
        
        // Магия фокуса: мы хотим, чтобы на главной странице при наведении на первую 
        // карточку в первой ленте баннер подсвечивался и фон приложения менялся на фон баннера.
        // Сохраняем фильм в глобальную переменную для использования в card_design
        window.appletv_hero_movie = movie;
    }

    /**
     * Слушаем инициализацию главной страницы
     */
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready' && Lampa.Storage.get('appletv_hero_banner', true)) {
            // Перехват построения главной страницы (Items -> Main)
            const originalCreate = Lampa.InteractionMain && Lampa.InteractionMain.prototype.create;
            const active = Lampa.Activity.active();
            if (!originalCreate && active && active.component == 'main') {
                // Альтернативный способ для уже открытой main
                 injectBanner();
            }
        }
    });
    
    // Перехват активности Main (Главная страница)
    function injectBanner() {
        if (!Lampa.Storage.get('appletv_hero_banner', true)) return;
        
        let active = Lampa.Activity.active();
        if (active && active.component === 'main') {
            const container = active.activity.render().find('.scroll__body').first();
            if (container.length === 0 || container.find('.appletv-hero').length > 0) return;

            // Запрашиваем тренды, чтобы получить первый фильм
            Lampa.TMDB.api('trending/all/day', (data) => {
                if (data && data.results && data.results.length > 0) {
                    // Берем первый трендовый фильм
                    const movie = data.results[0];
                    renderHeroBanner(container, movie);
                }
            }, (error) => {});
        }
    }

    // Слушаем смену активности (когда заходят на Главную)
    Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'activity' && e.component === 'main') {
            addStyles();
            // Ждем пока Lampa отрисует контейнер
            setTimeout(injectBanner, 200);
        }
    });

})();
