(function () {
    'use strict';

    // Стили для бейджей качества
    var styles = '.appletv-quality-badges { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; margin-bottom: 15px; }' +
    '.appletv-badge { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.9); padding: 4px 10px; border-radius: 6px; font-size: 0.9em; font-weight: 600; letter-spacing: 0.5px; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); }' +
    '.appletv-badge.hdr { background: rgba(255, 165, 0, 0.2); border-color: rgba(255, 165, 0, 0.5); color: #FFA500; }' +
    '.appletv-badge.dv { background: rgba(148, 0, 211, 0.2); border-color: rgba(148, 0, 211, 0.5); color: #DDA0DD; }' +
    '.appletv-badge.res { background: rgba(0, 191, 255, 0.2); border-color: rgba(0, 191, 255, 0.5); color: #00BFFF; }' +
    '.appletv-badge.sound { background: rgba(50, 205, 50, 0.2); border-color: rgba(50, 205, 50, 0.5); color: #32CD32; }' +
    '.appletv-badge.dub { background: rgba(255, 20, 147, 0.2); border-color: rgba(255, 20, 147, 0.5); color: #FF69B4; }';

    function addStyles() {
        if ($('#appletv-quality-sprites').length === 0) {
            $('head').append('<style id="appletv-quality-sprites">' + styles + '</style>');
        }
    }

    /**
     * Анализирует ffprobe
     */
    function analyzeQuality(ffprobe) {
        if (!ffprobe || !Array.isArray(ffprobe)) return null;

        const quality = { res: null, hdr: null, dv: false, audio: null, dub: false };

        // Видео поток
        const video = ffprobe.find(s => s.codec_type === 'video');
        if (video) {
            if (video.height >= 2160 || video.width >= 3840) quality.res = '4K';
            else if (video.height >= 1440 || video.width >= 2560) quality.res = '2K';
            else if (video.height >= 1080 || video.width >= 1920) quality.res = 'FULL HD';
            else if (video.height >= 720 || video.width >= 1280) quality.res = 'HD';

            // HDR / DV
            if (video.side_data_list) {
                const hasDV = video.side_data_list.some(d => d.side_data_type === 'DOVI configuration record' || d.side_data_type === 'Dolby Vision RPU');
                const hasHDR = video.side_data_list.some(d => d.side_data_type === 'Mastering display metadata');
                if (hasDV) { quality.dv = true; quality.hdr = 'HDR10'; }
                else if (hasHDR) quality.hdr = 'HDR';
            }
            if (!quality.dv && video.codec_name && (video.codec_name.toLowerCase().includes('dovi') || video.codec_name.toLowerCase().includes('dolby'))) {
                quality.dv = true;
            }
        }

        // Аудио потоки
        const audios = ffprobe.filter(s => s.codec_type === 'audio');
        let maxCh = 0;
        audios.forEach(a => {
            if (a.channels > maxCh) maxCh = a.channels;
            if (!quality.dub && a.tags) {
                const lang = (a.tags.language || '').toLowerCase();
                const title = (a.tags.title || a.tags.handler_name || '').toLowerCase();
                if ((lang.includes('ru') || lang === 'rus' || lang === 'russian') && 
                    (title.includes('dub') || title.includes('дубляж') || title === 'd')) {
                    quality.dub = true;
                }
            }
        });

        if (maxCh >= 8) quality.audio = '7.1';
        else if (maxCh >= 6) quality.audio = '5.1';
        else if (maxCh >= 4) quality.audio = '4.0';
        else if (maxCh >= 2) quality.audio = '2.0';

        return quality;
    }

    function renderBadges(container, badges) {
        if (!badges || container.find('.appletv-quality-badges').length) return;
        
        let html = '<div class="appletv-quality-badges">';
        if (badges.res) html += '<span class="appletv-badge res">' + badges.res + '</span>';
        if (badges.dv) html += '<span class="appletv-badge dv">Dolby Vision</span>';
        else if (badges.hdr) html += '<span class="appletv-badge hdr">' + badges.hdr + '</span>';
        if (badges.audio) html += '<span class="appletv-badge sound">' + badges.audio + '</span>';
        if (badges.dub) html += '<span class="appletv-badge dub">Дубляж</span>';
        html += '</div>';

        container.find('.full-start__info').after(html);
    }

    /**
     * Поиск торрентов через парсер Лампы
     */
    function triggerParser(movie, activity) {
        if (!Lampa.Storage.field('parser_use') || !Lampa.Parser) return;

        const year = ((movie.first_air_date || movie.release_date || '0000') + '').slice(0, 4);
        const searchQuery = movie.title || movie.name;

        Lampa.Parser.get({
            search: searchQuery,
            movie: movie,
            page: 1
        }, (results) => {
            if (!activity || activity.__destroyed) return;
            if (!results || !results.Results || !results.Results.length) return;
            
            // Собираем агрегированные значки (максимальные)
            const globalBadges = { res: null, hdr: null, dv: false, audio: null, dub: false };
            let foundRes = new Set(), foundAud = new Set();
            
            results.Results.forEach(r => {
                if (r.ffprobe) {
                    const q = analyzeQuality(r.ffprobe);
                    if (q) {
                        if (q.res) foundRes.add(q.res);
                        if (q.dv) globalBadges.dv = true;
                        if (q.hdr) globalBadges.hdr = q.hdr;
                        if (q.audio) foundAud.add(q.audio);
                        if (q.dub) globalBadges.dub = true;
                    }
                }
                
                // fallback on title
                const t = r.Title.toLowerCase();
                if (t.includes('dovi') || t.includes('dolby vision')) globalBadges.dv = true;
                if (t.includes('hdr')) globalBadges.hdr = 'HDR';
            });
            
            const resOrder = ['8K', '4K', '2K', 'FULL HD', 'HD'];
            for (let r of resOrder) if (foundRes.has(r)) { globalBadges.res = r; break; }

            const audOrder = ['7.1', '5.1', '4.0', '2.0'];
            for (let a of audOrder) if (foundAud.has(a)) { globalBadges.audio = a; break; }
            
            // Если есть Hero Banner для этого фильма, он мог выставиться оттуда
            // Но мы рендерим значки в карточке
            const container = activity.activity.render();
            renderBadges(container, globalBadges);
        }, () => {});
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'build') {
            const activity = Lampa.Activity.active();
            const movie = e.data.movie;
            if (active && movie) {
                // Вызываем парсер для оценки качества
                setTimeout(() => { triggerParser(movie, activity); }, 1500); 
            }
        }
    });

    addStyles();

})();
