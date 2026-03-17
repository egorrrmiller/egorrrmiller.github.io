(function () {
    'use strict';

    const APPLETV_VERSION = '1.1.0';
    
    // Иконка плагина в стиле Apple TV
    const PLUGIN_ICON = '<svg viewBox="110 90 180 210"xmlns=http://www.w3.org/2000/svg><g id=sphere><circle cx=200 cy=140 fill="hsl(200, 80%, 40%)"opacity=0.3 r=1.2 /><circle cx=230 cy=150 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=170 cy=155 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=245 cy=175 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=155 cy=180 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=215 cy=165 fill="hsl(200, 80%, 46%)"opacity=0.36 r=1.2 /><circle cx=185 cy=170 fill="hsl(200, 80%, 43%)"opacity=0.33 r=1.3 /><circle cx=260 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=140 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=250 cy=220 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=150 cy=225 fill="hsl(200, 80%, 47%)"opacity=0.37 r=1.4 /><circle cx=235 cy=240 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=165 cy=245 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=220 cy=255 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=180 cy=258 fill="hsl(200, 80%, 41%)"opacity=0.31 r=1.2 /><circle cx=200 cy=120 fill="hsl(200, 80%, 60%)"opacity=0.5 r=1.8 /><circle cx=240 cy=135 fill="hsl(200, 80%, 65%)"opacity=0.55 r=2 /><circle cx=160 cy=140 fill="hsl(200, 80%, 62%)"opacity=0.52 r=1.9 /><circle cx=270 cy=165 fill="hsl(200, 80%, 70%)"opacity=0.6 r=2.2 /><circle cx=130 cy=170 fill="hsl(200, 80%, 67%)"opacity=0.57 r=2.1 /><circle cx=255 cy=190 fill="hsl(200, 80%, 72%)"opacity=0.62 r=2.3 /><circle cx=145 cy=195 fill="hsl(200, 80%, 69%)"opacity=0.59 r=2.2 /><circle cx=280 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=120 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=275 cy=215 fill="hsl(200, 80%, 73%)"opacity=0.63 r=2.4 /><circle cx=125 cy=220 fill="hsl(200, 80%, 71%)"opacity=0.61 r=2.3 /><circle cx=260 cy=235 fill="hsl(200, 80%, 68%)"opacity=0.58 r=2.2 /><circle cx=140 cy=240 fill="hsl(200, 80%, 66%)"opacity=0.56 r=2.1 /><circle cx=245 cy=255 fill="hsl(200, 80%, 63%)"opacity=0.53 r=2 /><circle cx=155 cy=260 fill="hsl(200, 80%, 61%)"opacity=0.51 r=1.9 /><circle cx=225 cy=270 fill="hsl(200, 80%, 58%)"opacity=0.48 r=1.8 /><circle cx=175 cy=272 fill="hsl(200, 80%, 56%)"opacity=0.46 r=1.7 /><circle cx=200 cy=100 fill="hsl(200, 80%, 85%)"opacity=0.8 r=2.8 /><circle cx=230 cy=115 fill="hsl(200, 80%, 90%)"opacity=0.85 r=3 /><circle cx=170 cy=120 fill="hsl(200, 80%, 87%)"opacity=0.82 r=2.9 /><circle cx=250 cy=140 fill="hsl(200, 80%, 92%)"opacity=0.88 r=3.2 /><circle cx=150 cy=145 fill="hsl(200, 80%, 89%)"opacity=0.84 r=3.1 /><circle cx=265 cy=170 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.4 /><circle cx=135 cy=175 fill="hsl(200, 80%, 93%)"opacity=0.87 r=3.3 /><circle cx=275 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=125 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=200 cy=200 fill="hsl(200, 80%, 100%)"opacity=1 r=4 /><circle cx=220 cy=195 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.8 /><circle cx=180 cy=205 fill="hsl(200, 80%, 97%)"opacity=0.93 r=3.7 /><circle cx=240 cy=210 fill="hsl(200, 80%, 96%)"opacity=0.92 r=3.6 /><circle cx=160 cy=215 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.5 /><circle cx=270 cy=230 fill="hsl(200, 80%, 94%)"opacity=0.88 r=3.4 /><circle cx=130 cy=235 fill="hsl(200, 80%, 92%)"opacity=0.86 r=3.3 /><circle cx=255 cy=250 fill="hsl(200, 80%, 90%)"opacity=0.84 r=3.2 /><circle cx=145 cy=255 fill="hsl(200, 80%, 88%)"opacity=0.82 r=3.1 /><circle cx=235 cy=265 fill="hsl(200, 80%, 86%)"opacity=0.8 r=3 /><circle cx=165 cy=268 fill="hsl(200, 80%, 84%)"opacity=0.78 r=2.9 /><circle cx=215 cy=280 fill="hsl(200, 80%, 82%)"opacity=0.76 r=2.8 /><circle cx=185 cy=282 fill="hsl(200, 80%, 80%)"opacity=0.74 r=2.7 /><circle cx=200 cy=290 fill="hsl(200, 80%, 78%)"opacity=0.72 r=2.6 /><circle cx=210 cy=130 fill="hsl(200, 80%, 88%)"opacity=0.83 r=2.5 /><circle cx=190 cy=135 fill="hsl(200, 80%, 86%)"opacity=0.81 r=2.4 /><circle cx=225 cy=155 fill="hsl(200, 80%, 91%)"opacity=0.86 r=2.8 /><circle cx=175 cy=160 fill="hsl(200, 80%, 89%)"opacity=0.84 r=2.7 /><circle cx=245 cy=185 fill="hsl(200, 80%, 94%)"opacity=0.89 r=3.3 /><circle cx=155 cy=190 fill="hsl(200, 80%, 92%)"opacity=0.87 r=3.2 /><circle cx=260 cy=210 fill="hsl(200, 80%, 95%)"opacity=0.91 r=3.4 /><circle cx=140 cy=215 fill="hsl(200, 80%, 93%)"opacity=0.88 r=3.3 /><circle cx=250 cy=230 fill="hsl(200, 80%, 91%)"opacity=0.85 r=3.2 /><circle cx=150 cy=235 fill="hsl(200, 80%, 89%)"opacity=0.83 r=3.1 /><circle cx=230 cy=245 fill="hsl(200, 80%, 87%)"opacity=0.81 r=3 /><circle cx=170 cy=250 fill="hsl(200, 80%, 85%)"opacity=0.79 r=2.9 /><circle cx=210 cy=260 fill="hsl(200, 80%, 83%)"opacity=0.77 r=2.8 /><circle cx=190 cy=265 fill="hsl(200, 80%, 81%)"opacity=0.75 r=2.7 /></g></svg>';

    // --- CSS ---
    const mainStyles = `
        /* Hero Banner */
        .appletv-hero { position: relative; width: 100%; height: 65vh; min-height: 400px; margin-bottom: -150px; border-radius: 0 0 20px 20px; overflow: hidden; opacity: 0; transition: opacity 0.5s ease; z-index: 10; margin-top: -2em; pointer-events: none; }
        .appletv-hero.ready { opacity: 1; }
        .appletv-hero__bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-size: cover; background-position: center 20%; z-index: 1; }
        .appletv-hero__bg::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.8) 15%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0) 100%), linear-gradient(to right, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0) 40%); z-index: 2; }
        .appletv-hero__content { position: absolute; bottom: 180px; left: 4em; right: 4em; z-index: 3; display: flex; flex-direction: column; align-items: flex-start; max-width: 800px; }
        .appletv-hero__logo { max-width: 400px; max-height: 150px; object-fit: contain; margin-bottom: 1.5em; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); }
        .appletv-hero__title { font-size: 3em; font-weight: bold; color: #fff; margin-bottom: 0.2em; text-shadow: 0 2px 10px rgba(0,0,0,0.8); line-height: 1.1; }
        .appletv-hero__meta { font-size: 1.2em; color: rgba(255,255,255,0.8); margin-bottom: 1em; display: flex; gap: 15px; align-items: center; }
        .appletv-hero__desc { font-size: 1.1em; line-height: 1.5; color: rgba(255,255,255,0.7); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 4px rgba(0,0,0,0.8); margin-bottom: 1.5em; }
        .appletv-hero__button { background: white; color: black; padding: 0.8em 2em; border-radius: 10px; font-size: 1.2em; font-weight: bold; pointer-events: auto; opacity: 0.9; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        
        /* Liquid Glass Effect for Home Cards */
        body:not(.appletv--no-liquid-glass) .card--collection, 
        body:not(.appletv--no-liquid-glass) .card--person, 
        body:not(.appletv--no-liquid-glass) .card--episode, 
        body:not(.appletv--no-liquid-glass) .torrent-item { 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(10px); 
            -webkit-backdrop-filter: blur(10px); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            border-radius: 12px; 
            transition: transform 0.3s, box-shadow 0.3s, background 0.3s; 
        }
        body:not(.appletv--no-liquid-glass) .card--collection.focus, 
        body:not(.appletv--no-liquid-glass) .card--person.focus, 
        body:not(.appletv--no-liquid-glass) .card--episode.focus, 
        body:not(.appletv--no-liquid-glass) .torrent-item.focus { 
            background: rgba(255, 255, 255, 0.15); 
            border-color: rgba(255, 255, 255, 0.3); 
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.2); 
            transform: scale(1.05); 
        }

        /* Home Page Typography Fixes */
        .items-titles .items-titles__name { font-weight: 600; font-size: 1.2em; color: #fff; margin-bottom: 10px; opacity: 0.9; }
    `;

    function addStyles() {
        if ($('#appletv-main-styles').length === 0) {
            $('head').append('<style id="appletv-main-styles">' + mainStyles + '</style>');
        }
    }

    // --- Hero Banner Logic ---
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
                '<div class="appletv-hero__button">В ТРЕНДЕ</div>' +
            '</div>' +
        '</div>';

        const $hero = $(html);
        container.prepend($hero);

        // Fetch Logo
        const type = movie.name ? 'tv' : 'movie';
        const lang = Lampa.Storage.get('language', 'ru');
        Lampa.TMDB.api(type + '/' + movie.id + '/images?include_image_language=' + lang + ',en', (images) => {
            if (images && images.logos && images.logos.length > 0) {
                let selectedLogo = images.logos.find(l => l.iso_639_1 === lang);
                const useForeign = Lampa.Storage.get('appletv_show_foreign_logo', true);
                
                if (!selectedLogo && useForeign) {
                    selectedLogo = images.logos.find(l => l.iso_639_1 === 'en') || images.logos.find(l => !l.iso_639_1) || images.logos[0];
                }

                if (selectedLogo) {
                    const logoUrl = Lampa.TMDB.image('t/p/w500' + selectedLogo.file_path);
                    $hero.find('.appletv-hero__logo').attr('src', logoUrl).removeClass('hide').show();
                    $hero.find('.appletv-hero__title').hide();
                }
            }
            $hero.addClass('ready');
        }, () => {
             $hero.addClass('ready');
        });

        // Scroll Opacity Effect
        const $scrollBody = container.closest('.scroll__body');
        $scrollBody.off('scroll.appletv').on('scroll.appletv', function() {
            const st = $(this).scrollTop();
            if (st < 400) {
                $hero.css('opacity', 1 - (st / 400));
            } else {
                $hero.css('opacity', 0);
            }
        });
    }

    function injectBanner() {
        if (!Lampa.Storage.get('appletv_hero_banner', true)) return;
        
        let active = Lampa.Activity.active();
        if (active && active.component === 'main') {
            const container = active.activity.render().find('.scroll__body').first();
            if (container.length === 0 || container.find('.appletv-hero').length > 0) return;

            // Fetch Top Trending Movie
            Lampa.TMDB.api('trending/all/day', (data) => {
                if (data && data.results && data.results.length > 0) {
                    const movie = data.results[0];
                    renderHeroBanner(container, movie);
                }
            }, (error) => {});
        }
    }

    // --- Settings Logic ---
    function applyBodyClasses() {
        if (!Lampa.Storage.get('appletv_liquid_glass', true)) {
            $('body').addClass('appletv--no-liquid-glass');
        } else {
            $('body').removeClass('appletv--no-liquid-glass');
        }
    }

    function addSettings() {
        // Defaults
        const defaults = {
            'appletv_hero_banner': true,
            'appletv_liquid_glass': true,
            'appletv_show_foreign_logo': true
        };

        Object.keys(defaults).forEach(key => {
            if (Lampa.Storage.get(key) === undefined) {
                Lampa.Storage.set(key, defaults[key]);
            }
        });

        Lampa.SettingsApi.addComponent({
            component: 'appletv_settings',
            name: 'Apple TV UI',
            icon: PLUGIN_ICON
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_about', type: 'static' },
            field: { name: '<div>Apple TV UI v' + APPLETV_VERSION + '</div>' },
            onRender: function (item) {
                item.css('opacity', '0.7');
                item.append('<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">Премиум оформление Главной страницы в стиле Apple TV. Оптимизировано для 4K и ТВ.</div>');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_hero_banner', type: 'trigger', default: true },
            field: {
                name: 'Hero Баннер',
                description: 'Показывать большой трендовый постер на Главной'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_hero_banner', value);
                Lampa.Settings.update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_liquid_glass', type: 'trigger', default: true },
            field: {
                name: 'Жидкое стекло',
                description: 'Эффект размытия и объема для карточек на Главной'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_liquid_glass', value);
                applyBodyClasses();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'appletv_settings',
            param: { name: 'appletv_show_foreign_logo', type: 'trigger', default: true },
            field: {
                name: 'Логотип на английском',
                description: 'Показывать англ. логотип если нет русского'
            },
            onChange: function (value) {
                Lampa.Storage.set('appletv_show_foreign_logo', value);
            }
        });
    }

    // --- Initialization ---
    function init() {
        console.log('Apple TV UI: Unified Plugin Initialized');
        
        addStyles();
        addSettings();
        applyBodyClasses();

        // Listen for Activity Changes
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'activity' && e.component === 'main') {
                setTimeout(injectBanner, 300);
            }
        });
        
        // Initial Check if already on main
        const active = Lampa.Activity.active();
        if (active && active.component === 'main') {
            setTimeout(injectBanner, 500);
        }
    }

    if (window.appletv_unified_loaded) return;
    window.appletv_unified_loaded = true;
    
    // Wait for App Ready
    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
