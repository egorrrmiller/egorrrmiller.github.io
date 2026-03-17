(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Utils || typeof Lampa.Utils.createInstance !== 'function') return;

    if (window.appletv_episodes_core_patch) return;
    window.appletv_episodes_core_patch = true;

    // Глушим старые плагины-перестановщики
    window.episodes_order_fix = true;
    window.episodes_core_patch = true;

    function looksLikeEpisodesLinePayload(element) {
        try {
            if (!element) return false;
            if (!element.movie) return false;
            if (!Array.isArray(element.results) || !element.results.length) return false;

            let hits = 0;
            for (let i = 0; i < element.results.length; i++) {
                const r = element.results[i];
                if (!r) continue;

                if (typeof r.episode_number === 'number') hits++;
                if (typeof r.season_number === 'number') hits++;
                if (r.comeing) hits++;
                if (r.air_date) hits++;
            }

            return hits >= 3;
        } catch (e) {
            return false;
        }
    }

    function normalizeEpisodesResults(element) {
        try {
            const results = element.results || [];
            const next = [];
            const list = [];

            for (let i = 0; i < results.length; i++) {
                const r = results[i];
                if (!r) continue;

                if (r.comeing) next.push(r);
                else list.push(r);
            }

            // Сортируем по номеру эпизода
            list.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));

            element.results = list.concat(next);
        } catch (e) {}
    }

    function patchScrollAppendToKeepMoreLast(line) {
        try {
            if (!line || !line.scroll || typeof line.scroll.append !== 'function') return;
            if (line.__appletv_episodes_scroll_append_patched) return;
            line.__appletv_episodes_scroll_append_patched = true;

            const originalAppend = line.scroll.append.bind(line.scroll);

            line.scroll.append = function (object) {
                const node = object instanceof jQuery ? object[0] : object;

                // "Еще" добавляем как обычно
                if (node && node.classList && node.classList.contains('card-more')) {
                    return originalAppend(object);
                }

                // Если "Еще" уже есть — вставляем перед ним
                const body = typeof line.scroll.body === 'function' ? line.scroll.body(true) : null;
                if (body) {
                    const more = body.querySelector('.card-more');
                    if (more && node && node !== more) {
                        body.insertBefore(node, more);
                        return;
                    }
                }

                return originalAppend(object);
            };
        } catch (e) {}
    }

    function patchLineCreate(line) {
        try {
            if (!line || typeof line.create !== 'function') return;
            if (line.__appletv_episodes_create_patched) return;
            line.__appletv_episodes_create_patched = true;

            const originalCreate = line.create.bind(line);

            line.create = function () {
                patchScrollAppendToKeepMoreLast(line);

                const res = originalCreate();

                setTimeout(() => {
                    try {
                        const body = line && line.scroll && typeof line.scroll.body === 'function' ? line.scroll.body(true) : null;
                        const more = body ? body.querySelector('.card-more') : null;
                        if (more) more.classList.remove('card-more--first');
                    } catch (e) {}
                }, 0);

                return res;
            };
        } catch (e) {}
    }

    const originalCreateInstance = Lampa.Utils.createInstance;

    Lampa.Utils.createInstance = function (BaseClass, element, add_params, replace) {
        const isEpisodesLine = looksLikeEpisodesLinePayload(element);
        const shouldReverse = Lampa.Storage.get('appletv_reverse_episodes', true);

        if (isEpisodesLine && shouldReverse) {
            normalizeEpisodesResults(element);
        }

        const instance = originalCreateInstance.call(this, BaseClass, element, add_params, replace);

        if (isEpisodesLine && shouldReverse) {
            patchLineCreate(instance);
        }

        return instance;
    };

    /**
     * Отображение общего количества серий (опционально)
     */
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'build' && Lampa.Storage.get('appletv_show_episode_count', false)) {
            const movie = e.data.movie;
            if (movie && movie.number_of_episodes) {
                const infoBlock = e.object.find('.full-start__info');
                if (infoBlock.length && infoBlock.html().indexOf(movie.number_of_episodes) === -1) {
                    infoBlock.append('<span>' + movie.number_of_episodes + ' серий</span>');
                }
            }
        }
    });

})();
