(function () {
    'use strict';

    if (!Lampa.Platform.screen('tv')) return;

    // Стили перенесены из Applecation
    var styles = '.appletv-card-logo-container { position: absolute; top: 2em; left: 3em; max-width: 400px; max-height: 15vh; z-index: 10; pointer-events: none; display: flex; align-items: flex-end; }' +
    '.appletv-card__logo { max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)); }' +
    'body:not(.appletv--no-liquid-glass) .card--collection, body:not(.appletv--no-liquid-glass) .card--person, body:not(.appletv--no-liquid-glass) .card--episode, body:not(.appletv--no-liquid-glass) .torrent-item { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; transition: transform 0.3s, box-shadow 0.3s, background 0.3s; }' +
    'body:not(.appletv--no-liquid-glass) .card--collection.focus, body:not(.appletv--no-liquid-glass) .card--person.focus, body:not(.appletv--no-liquid-glass) .card--episode.focus, body:not(.appletv--no-liquid-glass) .torrent-item.focus { background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.3); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.2); transform: scale(1.05); }' +
    '.full-start__poster { border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); }' +
    '.appletv-description-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; }' +
    '.appletv-description-overlay.active { opacity: 1; }' +
    '.appletv-description-content { max-width: 800px; padding: 40px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: #fff; font-size: 1.4em; line-height: 1.6; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }';

    function addStyles() {
        if ($('#appletv-card-styles').length === 0) {
            $('head').append('<style id="appletv-card-styles">' + styles + '</style>');
        }
    }

    // Масштабирование
    function applyScalingStyles() {
        let logoScale = parseFloat(Lampa.Storage.get('appletv_logo_scale', '100')) / 100;
        let textScale = parseFloat(Lampa.Storage.get('appletv_text_scale', '100')) / 100;
        
        var scaleCSS = '.appletv-card-logo-container { transform: scale(' + logoScale + '); transform-origin: left bottom; }' +
            '.full-start__left { transform: scale(' + textScale + '); transform-origin: top left; }';
        
        if ($('#appletv-scaling-styles').length === 0) {
            $('head').append('<style id="appletv-scaling-styles">' + scaleCSS + '</style>');
        } else {
            $('#appletv-scaling-styles').html(scaleCSS);
        }
    }


    /**
     * Поиск и отображение логотипа
     */
    function attachLogoLoader() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'build') {
                const activity = Lampa.Activity.active();
                if (!activity || !activity.activity) return;

                const movie = e.data.movie;
                const container = e.object.find('.full-start__right').parent();

                // Контейнер для лого
                if (container.find('.appletv-card-logo-container').length === 0) {
                    const logoContainer = $('<div class="appletv-card-logo-container"><img class="appletv-card__logo hide" src="" /></div>');
                    container.prepend(logoContainer);
                    
                    const type = movie.name ? 'tv' : 'movie';
                    const lang = Lampa.Storage.get('language', 'ru');
                    Lampa.TMDB.api(type + '/' + movie.id + '/images?include_image_language=' + lang + ',en', (images) => {
                        if (images && images.logos && images.logos.length > 0) {
                            let selectedLogo = images.logos.find(l => l.iso_639_1 === lang);
                            const useForeign = Lampa.Storage.get('appletv_show_foreign_logo', true);
                            
                            if (!selectedLogo && useForeign) {
                                selectedLogo = images.logos.find(l => l.iso_639_1 === 'en') || images.logos[0];
                            }

                            if (selectedLogo) {
                                const logoUrl = Lampa.TMDB.image('t/p/w500' + selectedLogo.file_path);
                                logoContainer.find('.appletv-card__logo').attr('src', logoUrl).removeClass('hide');
                                
                                // Скрываем оригинальный текстовый заголовок Лампы
                                e.object.find('.full-start__title').hide();
                            }
                        }
                    }, () => {});
                }
            }
        });
    }

    /**
     * Добавление оверлея описания
     */
    function attachDescriptionOverlay() {
        if (!Lampa.Storage.get('appletv_description_overlay', true)) return;

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'build') {
                const descBlock = e.object.find('.full-start__text');
                const movie = e.data.movie;
                
                if (descBlock.length > 0 && movie && movie.overview) {
                    descBlock.css('cursor', 'pointer');
                    
                    descBlock.on('hover:enter', function() {
                        const overlay = $('<div class="appletv-description-overlay"><div class="appletv-description-content">' + movie.overview + '</div></div>');
                        $('body').append(overlay);
                        
                        // Фокус переносим на оверлей, чтобы при нажатии "Назад" закрыть его
                        setTimeout(() => {
                            overlay.addClass('active');
                            Lampa.Controller.add('appletv_overlay', {
                                toggle: function() {
                                    Lampa.Controller.collectionSet(overlay);
                                    Lampa.Controller.collectionFocus(overlay, overlay);
                                },
                                right: function() {}, left: function() {}, up: function() {}, down: function() {},
                                back: function() {
                                    overlay.removeClass('active');
                                    setTimeout(() => {
                                        overlay.remove();
                                        Lampa.Controller.toggle('full');
                                    }, 300);
                                }
                            });
                            Lampa.Controller.toggle('appletv_overlay');
                        }, 50);
                    });
                }
            }
        });
    }

    function init() {
        addStyles();
        applyScalingStyles();
        attachLogoLoader();
        attachDescriptionOverlay();
    }

    init();

})();
