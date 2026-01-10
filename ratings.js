(function () {
	'use strict';

	/**
	 * СТИЛИ И ИКОНКИ
	 */
	function addSettingsStyles() {
		if ($('#ratings-style-custom').length) return;
		$('body').append(`<style id="ratings-style-custom">
			/* Контейнер для рейтинга с иконкой */
			.full-start__rate { 
				display: inline-flex !important; 
				align-items: center !important; 
				gap: 6px !important; 
				margin-right: 15px !important;
				font-weight: 500 !important;
			}
			
			/* Специфичные цвета для текста */
			.rate--kp { color: #ff9000 !important; }
			.rate--imdb { color: #f5c518 !important; }
			.rate--tmdb { color: #01b4e4 !important; }

			/* Стиль для иконок */
			.rate-icon {
				width: 1.2em;
				height: 1.2em;
				flex-shrink: 0;
				vertical-align: middle;
			}
			.rate-icon svg {
				width: 100%;
				height: 100%;
				fill: currentColor; /* Иконка красится в цвет текста автоматически */
			}
		</style>`);
	}

	// Объекты с SVG разметкой иконок
	var icons = {
		kp: '<div class="rate-icon"><svg viewBox="0 0 24 24"><path d="M18.15 3H5.85C4.28 3 3 4.28 3 5.85v12.3C3 19.72 4.28 21 5.85 21h12.3c1.57 0 2.85-1.28 2.85-2.85V5.85C21 4.28 19.72 3 18.15 3zm-3.53 13.06h-1.39v-2.31l-1.33 2.31h-1.3l1.45-2.48-1.38-2.29h1.39l1.17 2.05 1.13-2.05h1.38l-1.33 2.29 1.51 2.48zM8.54 16.06H7.15V7.94h1.39v3.42l1.92-3.42h1.56l-2.05 3.53 2.21 4.59H10.7l-1.46-3.14-.7.42v2.72z"/></svg></div>',
		imdb: '<div class="rate-icon"><svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM6.5 15H5V9h1.5v6zm4.5 0h-1.5V9H11l1 3.5 1-3.5h1.5v6H13V11l-1 3.5h-1L10 11v4zm8.5 0h-2c-.3 0-.5-.2-.5-.5v-5c0-.3.2-.5.5-.5h2c.3 0 .5.2.5.5v5c0 .3-.2.5-.5.5zM18 10h1v4h-1v-4z"/></svg></div>',
		tmdb: '<div class="rate-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.12 12.3c-.66.8-1.52 1.2-2.58 1.2-1.04 0-1.89-.39-2.55-1.17-.66-.78-.99-1.81-.99-3.09 0-1.29.33-2.33.99-3.12.66-.79 1.52-1.18 2.58-1.18 1.04 0 1.89.4 2.56 1.19.67.79 1.01 1.82 1.01 3.1 0 1.29-.34 2.32-1.02 3.07z"/></svg></div>'
	};

	function rating_kp_imdb(card) {
		var network = new Lampa.Reguest();
		var clean_title = kpCleanTitle(card.title);
		var search_date = card.release_date || card.first_air_date || card.last_air_date || '0000';
		var search_year = parseInt((search_date + '').slice(0, 4));
		var orig = card.original_title || card.original_name;
		
		var params = {
			id: card.id,
			url: 'https://kinopoiskapiunofficial.tech/',
			rating_url: 'https://rating.kinopoisk.ru/',
			headers: { 'X-API-KEY': '24b4fca8-ab26-4c97-a675-f46012545706' },
			cache_time: 86400000 
		};

		getRating();

		function getRating() {
			var movieRating = _getCache(params.id);
			if (movieRating) return _showRating(movieRating[params.id]);
			else searchFilm();
		}

		function searchFilm() {
			var url = params.url;
			var url_by_title = Lampa.Utils.addUrlComponent(url + 'api/v2.1/films/search-by-keyword', 'keyword=' + encodeURIComponent(clean_title));
			if (card.imdb_id) url = Lampa.Utils.addUrlComponent(url + 'api/v2.2/films', 'imdbId=' + encodeURIComponent(card.imdb_id));
			else url = url_by_title;

			network.silent(url, function (json) {
				if (json.items && json.items.length) chooseFilm(json.items);
				else if (json.films && json.films.length) chooseFilm(json.films);
				else chooseFilm([]);
			}, function () { chooseFilm([]); }, false, { headers: params.headers });
		}

		function chooseFilm(items) {
			if (items && items.length > 0) {
				var id = items[0].kinopoiskId || items[0].filmId;
				network.silent(params.url + 'api/v2.2/films/' + id, function (data) {
					var movieRating = _setCache(params.id, {
						kp: data.ratingKinopoisk,
						imdb: data.ratingImdb,
						timestamp: new Date().getTime()
					}); 
					_showRating(movieRating);
				}, function() {}, false, { headers: params.headers });
			}
		}

		function kpCleanTitle(str){ return str.replace(/[\s.,:;’'`!?]+/g, ' ').trim(); }

		function _getCache(movie) {
			var cache = Lampa.Storage.cache('kp_rating', 500, {}); 
			return cache[movie] && (new Date().getTime() - cache[movie].timestamp < params.cache_time) ? cache : false;
		}

		function _setCache(movie, data) {
			var cache = Lampa.Storage.cache('kp_rating', 500, {}); 
			cache[movie] = data;
			Lampa.Storage.set('kp_rating', cache);
			return data;
		}

		function _showRating(data) {
			if (data) {
				var kp_val = data.kp ? parseFloat(data.kp).toFixed(1) : '0.0';
				var imdb_val = data.imdb ? parseFloat(data.imdb).toFixed(1) : '0.0';
				var render = Lampa.Activity.active().activity.render();
				
				$('.wait_rating', render).remove();
				
				// Добавляем иконку TMDB (она обычно есть в системе)
				var tmdb_tag = $('.rate--tmdb', render);
				if (tmdb_tag.length && !tmdb_tag.find('.rate-icon').length) {
					tmdb_tag.prepend(icons.tmdb);
				}

				// Отрисовка IMDb с иконкой
				var imdb_tag = $('.rate--imdb', render);
				imdb_tag.removeClass('hide').html(icons.imdb + '<div>' + imdb_val + '</div>');
				
				// Отрисовка Кинопоиска с иконкой
				var kp_tag = $('.rate--kp', render);
				kp_tag.removeClass('hide').html(icons.kp + '<div>' + kp_val + '</div>');
			}
		}
	}

	function startPlugin() {
		window.rating_plugin = true;
		addSettingsStyles();
		Lampa.Listener.follow('full', function (e) {
			if (e.type == 'complite') {
				var render = e.object.activity.render();
				if (!($('.rate--kp', render).text().length > 3)) {
					$('.info__rate', render).after('<div style="width:2em;margin-top:1em;margin-right:1em" class="wait_rating"><div class="broadcast__scan"><div></div></div><div>');
					rating_kp_imdb(e.data.movie);
				}
			}
		});
	}

	if (!window.rating_plugin) startPlugin();
})();
