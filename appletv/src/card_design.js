(function () {
    'use strict';

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
                if (!movie || !e.object) return;

                const container = e.object.find('.full-start__right').parent();

                // Контейнер для лого
                if (container.find('.appletv-card-logo-container').length === 0) {
                    const logoContainer = $('<div class="appletv-card-logo-container"><img class="appletv-card__logo hide" src="" /></div>');
                    container.prepend(logoContainer);

                    // Call the new loadLogo function
                    loadLogo(e);
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
                if (!e.object || !e.data || !e.data.movie) return;

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

    function addCustomTemplate() {
        const fullStartTemplate = `<div class="full-start-new applecation">
        <div class="full-start-new__body">
            <div class="full-start-new__left hide">
                <div class="full-start-new__poster">
                    <img class="full-start-new__img full--poster" />
                </div>
            </div>

            <div class="full-start-new__right">
                <div class="applecation__left">
                    <div class="applecation__logo"></div>
                    
                    <div class="applecation__content-wrapper">
                        <div class="full-start-new__title" style="display: none;">{title}</div>
                        
                        <div class="applecation__meta">
                            <div class="applecation__meta-left">
                                <span class="applecation__network"></span>
                                <span class="applecation__meta-text"></span>
                                <div class="full-start__pg hide"></div>
                            </div>
                        </div>
                        
                        <div class="applecation__description-wrapper">
                            <div class="applecation__description"></div>
                        </div>
                        <div class="applecation__info"></div>
                    </div>
                    
                    <!-- Скрытые оригинальные элементы -->
                    <div class="full-start-new__head" style="display: none;"></div>
                    <div class="full-start-new__details" style="display: none;"></div>

                    <div class="full-start-new__buttons">
                        <div class="full-start__button selector button--play">
                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>
                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>
                            </svg>
                            <span>#{title_watch}</span>
                        </div>

                        <div class="full-start__button selector button--book">
                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                            <span>#{settings_input_links}</span>
                        </div>

                        <div class="full-start__button selector button--reaction">
                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>
                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>
                            </svg>
                            <span>#{title_reactions}</span>
                        </div>

                        <div class="full-start__button selector button--subscribe hide">
                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
                                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                            <span>#{title_subscribe}</span>
                        </div>

                        <div class="full-start__button selector button--options">
                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>
                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>
                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="applecation__right">
                    <div class="full-start-new__reactions selector">
                        <div>#{reactions_none}</div>
                    </div>

                    <!-- Скрытый элемент для совместимости -->
                    <div class="full-start-new__rate-line">
                        <div class="full-start__status hide"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="hide buttons--container">
            <div class="full-start__button view--torrent hide">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>
                </svg>
                <span>#{full_torrents}</span>
            </div>

            <div class="full-start__button selector view--trailer">
                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>
                </svg>
                <span>#{full_trailers}</span>
            </div>
        </div>
    </div>`;

        Lampa.Template.add('full_start_new', fullStartTemplate);

        const episodeTemplate = `<div class="full-episode selector layer--visible applecation-episode">
            <div class="full-episode__img">
                <img />
                <div class="full-episode__time">{time}</div>
            </div>

            <div class="full-episode__body">
                <div class="full-episode__num">#{full_episode} {num}</div>
                <div class="full-episode__name">{name}</div>
                <div class="full-episode__overview">{overview}</div>
                <div class="full-episode__date">{date}</div>
            </div>
        </div>`;

        Lampa.Template.add('full_episode', episodeTemplate);
    }

    // Патчим внутренние методы Лампы для корректной работы эпизодов и качества
    function patchApiImg() {
        const tmdbSource = Lampa.Api.sources.tmdb;

        if (!tmdbSource) return;

        // 0. Патчим формирование URL для TMDB, чтобы добавить логотипы в основной запрос (append_to_response)
        if (window.Lampa && Lampa.TMDB && Lampa.TMDB.api) {
            const originalTmdbApi = Lampa.TMDB.api;
            Lampa.TMDB.api = function (url) {
                let newUrl = url;
                if (typeof newUrl === 'string' && newUrl.indexOf('append_to_response=') !== -1 && newUrl.indexOf('images') === -1) {
                    // Добавляем images в список append_to_response
                    newUrl = newUrl.replace('append_to_response=', 'append_to_response=images,');

                    // Добавляем языки для картинок, если они еще не указаны
                    if (newUrl.indexOf('include_image_language=') === -1) {
                        const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
                        newUrl += (newUrl.indexOf('?') === -1 ? '?' : '&') + 'include_image_language=en,null,' + lang;
                    }
                }
                return originalTmdbApi.call(Lampa.TMDB, newUrl);
            };
        }

        // 1. Патчим шаблонизатор, чтобы принудительно изменить формат даты и времени в карточках
        const originalTemplateJs = Lampa.Template.js;
        Lampa.Template.js = function (name, vars) {
            if (name === 'full_episode' && vars) {
                // Форматируем время (локализовано: 1 ч 10 м или 39 м) - убираем точки
                if (vars.runtime > 0) {
                    vars.time = Lampa.Utils.secondsToTimeHuman(vars.runtime * 60).replace(/\./g, '');
                } else {
                    vars.time = '';
                }

                // Форматируем дату: всегда с годом
                if (vars.air_date) {
                    const dateObj = new Date(vars.air_date.replace(/-/g, '/'));
                    const month = dateObj.getMonth() + 1;
                    const monthEnd = Lampa.Lang.translate('month_' + month + '_e');
                    const yearSuffix = Lampa.Lang.translate('year_short');
                    vars.date = dateObj.getDate() + ' ' + monthEnd + ' ' + dateObj.getFullYear() + yearSuffix;
                }
            }
            return originalTemplateJs.call(Lampa.Template, name, vars);
        };

        // 2. Патчим метод изображений для улучшения качества
        const originalImg = tmdbSource.img;
        tmdbSource.img = function (src, size) {
            const posterSize = Lampa.Storage.field('poster_size');

            if (size === 'w1280') {
                const backdropMap = {
                    'w200': 'w780',
                    'w300': 'w1280',
                    'w500': 'original'
                };
                size = backdropMap[posterSize] || 'w1280';
            }

            if (size === 'w300') {
                const episodeMap = {
                    'w200': 'w300',
                    'w300': 'w780',
                    'w500': 'w780'
                };
                size = episodeMap[posterSize] || 'w300';
            }

            if (size === 'w276_and_h350_face' && posterSize === 'w500') {
                size = 'w600_and_h900_face';
            }

            return originalImg.call(tmdbSource, src, size);
        };

        Lampa.Api.img = tmdbSource.img;
    }

    // Получаем качество логотипа на основе poster_size
    function getLogoQuality() {
        const posterSize = Lampa.Storage.field('poster_size');
        const qualityMap = {
            'w200': 'w300',      // Низкое постера → низкое лого
            'w300': 'w500',      // Среднее постера → среднее лого
            'w500': 'original'   // Высокое постера → оригинальное лого
        };
        return qualityMap[posterSize] || 'w500';
    }

    // Общая проверка на "живучесть" активности
    function isAlive(activity) {
        return Lampa.Activity.active() === activity && !activity.__destroyed;
    }

    // Заполняем основную информацию
    function fillMetaInfo(activity, data) {
        const metaTextContainer = activity.render().find('.applecation__meta-text');
        const metaParts = [];

        // Тип контента
        metaParts.push(getMediaType(data));

        // Жанры (первые 2-3)
        if (data.genres && data.genres.length) {
            const genres = data.genres.slice(0, 2).map(g =>
                Lampa.Utils.capitalizeFirstLetter(g.name)
            );
            metaParts.push(...genres);
        }

        metaTextContainer.html(metaParts.join(' · '));

        // Загружаем иконку студии/сети
        loadNetworkIcon(activity, data);
    }
    
    // Получаем локализованный тип медиа
    function getMediaType(data) {
        const lang = Lampa.Storage.get('language', 'ru');
        const isTv = !!data.name;

        const types = {
            ru: isTv ? 'Сериал' : 'Фильм',
            en: isTv ? 'TV Series' : 'Movie',
            uk: isTv ? 'Серіал' : 'Фільм',
            be: isTv ? 'Серыял' : 'Фільм',
            bg: isTv ? 'Сериал' : 'Филм',
            cs: isTv ? 'Seriál' : 'Film',
            he: isTv ? 'סדרה' : 'סרט',
            pt: isTv ? 'Série' : 'Filme',
            zh: isTv ? '电视剧' : '电影'
        };

        return types[lang] || types['en'];
    }

    // Загружаем иконку студии/сети
    function loadNetworkIcon(activity, data) {
        const networkContainer = activity.render().find('.applecation__network');

        // Для сериалов - телесеть
        if (data.networks && data.networks.length) {
            const network = data.networks[0];
            if (network.logo_path) {
                const logoUrl = Lampa.Api.img(network.logo_path, 'w200');
                networkContainer.html(`<img src="${logoUrl}" alt="${network.name}">`);
                return;
            }
        }

        // Для фильмов - студия
        if (data.production_companies && data.production_companies.length) {
            const company = data.production_companies[0];
            if (company.logo_path) {
                const logoUrl = Lampa.Api.img(company.logo_path, 'w200');
                networkContainer.html(`<img src="${logoUrl}" alt="${company.name}">`);
                return;
            }
        }

        // Если нет иконки - скрываем контейнер
        networkContainer.remove();
    }

    // Заполняем описание
    function fillDescription(activity, data) {
        const descContainer = activity.render().find('.applecation__description');
        const descWrapper = activity.render().find('.applecation__description-wrapper');
        const description = data.overview || '';
        const useOverlay = Lampa.Storage.get('applecation_description_overlay', true);

        descContainer.text(description);

        if (useOverlay) {
            // Добавляем обработчик клика для показа полного описания
            descWrapper.off('hover:enter').on('hover:enter', function () {
                // showFullDescription() is handled in description overlay now.
            });
        } else {
            // Если оверлей отключен, убираем обработчики и удаляем оверлей
            descWrapper.off('hover:enter');
            $('.applecation-description-overlay').remove();
        }
    }

    // Обновляем логотип в оверлее
    function updateOverlayLogo(logoUrl) {
        const overlay = $('.appletv-description-overlay'); // using previous naming if exists

        if (!overlay.length) return;

        if (logoUrl) {
            const newLogoImg = $('<img>').attr('src', logoUrl);
            overlay.find('.appletv-description-overlay__logo').html(newLogoImg).css('display', 'block');
            overlay.find('.appletv-description-overlay__title').css('display', 'none');
        }
    }

    // Склонение сезонов с локализацией
    function formatSeasons(count) {
        const lang = Lampa.Storage.get('language', 'ru');

        // Славянские языки (ru, uk, be, bg) - сложное склонение
        if (['ru', 'uk', 'be', 'bg'].includes(lang)) {
            const cases = [2, 0, 1, 1, 1, 2];
            const titles = {
                ru: ['сезон', 'сезона', 'сезонов'],
                uk: ['сезон', 'сезони', 'сезонів'],
                be: ['сезон', 'сезоны', 'сезонаў'],
                bg: ['сезон', 'сезона', 'сезона']
            };

            const langTitles = titles[lang] || titles['ru'];
            const caseIndex = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];

            return `${count} ${langTitles[caseIndex]}`;
        }

        const seasonWord = Lampa.Lang.translate('full_season');
        return count === 1 ? `${count} ${seasonWord}` : `${count} ${seasonWord}s`;
    }

    // Склонение серий с локализацией
    function formatEpisodes(count) {
        const lang = Lampa.Storage.get('language', 'ru');

        // Славянские языки (ru, uk, be, bg) - сложное склонение
        if (['ru', 'uk', 'be', 'bg'].includes(lang)) {
            const cases = [2, 0, 1, 1, 1, 2];
            const titles = {
                ru: ['серия', 'серии', 'серий'],
                uk: ['серія', 'серії', 'серій'],
                be: ['серыя', 'серыі', 'серый'],
                bg: ['епизод', 'епизода', 'епизода']
            };

            const langTitles = titles[lang] || titles['ru'];
            const caseIndex = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];

            return `${count} ${langTitles[caseIndex]}`;
        }

        const episodeWord = Lampa.Lang.translate('full_episode');
        return count === 1 ? `${count} ${episodeWord}` : `${count} ${episodeWord}s`;
    }

    // Заполняем дополнительную информацию (Год/длительность)
    function fillAdditionalInfo(activity, data) {
        const infoContainer = activity.render().find('.applecation__info');
        const infoParts = [];

        // Год выпуска
        const releaseDate = data.release_date || data.first_air_date || '';
        if (releaseDate) {
            const year = releaseDate.split('-')[0];
            infoParts.push(year);
        }

        // Длительность
        if (data.name) {
            // Сериал - показываем и продолжительность эпизода, и количество сезонов
            if (data.episode_run_time && data.episode_run_time.length) {
                const avgRuntime = data.episode_run_time[0];
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');
                infoParts.push(`${avgRuntime} ${timeM}`);
            }

            // Всегда показываем количество сезонов для сериалов
            const seasons = Lampa.Utils.countSeasons(data);
            if (seasons) {
                infoParts.push(formatSeasons(seasons));
            }

            // Показываем количество серий, если включено в настройках
            if (Lampa.Storage.get('applecation_show_episode_count', false)) {
                const episodes = data.number_of_episodes;
                if (episodes) {
                    infoParts.push(formatEpisodes(episodes));
                }
            }
        } else {
            // Фильм - общая продолжительность
            if (data.runtime && data.runtime > 0) {
                const hours = Math.floor(data.runtime / 60);
                const minutes = data.runtime % 60;
                const timeH = Lampa.Lang.translate('time_h').replace('.', '');
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');
                const timeStr = hours > 0
                    ? `${hours} ${timeH} ${minutes} ${timeM}`
                    : `${minutes} ${timeM}`;
                infoParts.push(timeStr);
            }
        }

        const textContent = infoParts.length > 0 ? infoParts.join(' · ') : '';
        infoContainer.html(textContent + '<span class="applecation__quality-badges"></span>');
    }

    // Ждем загрузки и появления фона
    function waitForBackgroundLoad(activity, callback) {
        const background = activity.render().find('.full-start__background:not(.applecation__overlay)');

        if (!background.length) {
            callback();
            return;
        }

        if (background.hasClass('loaded')) {
            callback();
            return;
        }

        const checkInterval = setInterval(() => {
            if (!isAlive(activity)) {
                clearInterval(checkInterval);
                return;
            }

            if (background.hasClass('loaded')) {
                clearInterval(checkInterval);
                setTimeout(() => {
                    if (!isAlive(activity)) return;
                    callback();
                }, 50);
            }
        }, 50);

        setTimeout(() => {
            clearInterval(checkInterval);
            callback();
        }, 2000);
    }

    // Загружаем логотип фильма
    function loadLogo(event) {
        const data = event.data.movie;
        const activity = event.object.activity;

        if (!data || !activity) return;

        // Заполняем основную информацию
        fillMetaInfo(activity, data);
        fillDescription(activity, data);
        fillAdditionalInfo(activity, data);

        waitForBackgroundLoad(activity, () => {
            if (!isAlive(activity)) return;

            activity.render().find('.applecation__meta').addClass('show');

            const useOverlay = Lampa.Storage.get('applecation_description_overlay', true);
            const descWrapper = activity.render().find('.applecation__description-wrapper').addClass('show');

            if (useOverlay) {
                descWrapper.addClass('selector');
                if (window.Lampa && Lampa.Controller) {
                    Lampa.Controller.collectionAppend(descWrapper);
                }
            }

            activity.render().find('.applecation__info').addClass('show');
            activity.render().find('.applecation__ratings').addClass('show');
        });

        const logoContainer = activity.render().find('.appletv-card-logo-container');
        const titleElement = activity.render().find('.full-start-new__title');

        const renderLogo = (logoPath) => {
            const logoUrl = Lampa.TMDB.image(`/t/p/w500${logoPath}`);

            const img = new Image();
            img.onload = () => {
                if (!isAlive(activity)) return;

                logoContainer.find('.appletv-card__logo').attr('src', logoUrl).removeClass('hide');
                titleElement.hide();
                waitForBackgroundLoad(activity, () => {
                    if (!isAlive(activity)) return;
                    logoContainer.addClass('loaded');
                });

                updateOverlayLogo(logoUrl);
            };
            img.src = logoUrl;
        };

        if (data.images && data.images.logos && data.images.logos.length > 0) {
            const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
            let logo = data.images.logos.find(l => l.iso_639_1 === lang);

            if (!logo && Lampa.Storage.get('applecation_show_foreign_logo', true)) {
                logo = data.images.logos.find(l => l.iso_639_1 === 'en');
                if (!logo) logo = data.images.logos.find(l => !l.iso_639_1);
                if (!logo) logo = data.images.logos[0];
            }

            if (logo && logo.file_path) {
                return renderLogo(logo.file_path);
            }
        }

        const mediaType = data.name ? 'tv' : 'movie';
        const apiUrl = Lampa.TMDB.api(
            `${mediaType}/${data.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}`
        );

        $.get(apiUrl, (imagesData) => {
            if (!isAlive(activity)) return;

            if (imagesData.logos && imagesData.logos.length > 0) {
                const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
                let logo = imagesData.logos.find(l => l.iso_639_1 === lang);

                if (!logo && Lampa.Storage.get('applecation_show_foreign_logo', true)) {
                    logo = imagesData.logos.find(l => l.iso_639_1 === 'en') || imagesData.logos.find(l => !l.iso_639_1) || imagesData.logos[0];
                }

                if (logo && logo.file_path) {
                    return renderLogo(logo.file_path);
                }
            }

            titleElement.show();
            waitForBackgroundLoad(activity, () => {
                logoContainer.addClass('loaded');
            });
        }).fail(() => {
            titleElement.show();
            waitForBackgroundLoad(activity, () => {
                logoContainer.addClass('loaded');
            });
        });
    }

    function init() {
        addCustomTemplate();
        addStyles();
        applyScalingStyles();
        attachLogoLoader();
        attachDescriptionOverlay();
        patchApiImg();
    }

    init();

})();
