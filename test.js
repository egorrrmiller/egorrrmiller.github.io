(function () {
	"use strict";

	var SEASON_FIX = {
		id: "season_fix",
		version: "1.0",
		gap: 90,

		dateToDays: function (dateStr) {
			if (!dateStr || typeof dateStr !== "string") return 0;
			var parts = dateStr.split("-");
			if (parts.length !== 3) return 0;

			var y = parseInt(parts[0], 10);
			var m = parseInt(parts[1], 10);
			var d = parseInt(parts[2], 10);

			return y * 365 + m * 30 + d;
		},

		init: function () {
			this.hook();
		},

		hook: function () {
			var _this = this;
			if (!window.$ || !window.$.ajax) {
				return setTimeout(function () {
					_this.hook();
				}, 200);
			}

			var originalAjax = window.$.ajax;

			window.$.ajax = function (url, options) {
				var settings = (typeof url === "object" ? url : options) || {};
				var reqUrl = (typeof url === "string" ? url : settings.url) || "";

				var match = reqUrl.match(/\/tv\/(\d+)\/season\/(\d+)/);

				if (match) {
					var tvId = match[1];
					var season = parseInt(match[2], 10);

					var successCallback = settings.success;
					var errorCallback = settings.error;
					var completeCallback = settings.complete;

					var deferred = $.Deferred();
					var promise = deferred.promise();
					promise.abort = function () {};

					var runSmartFix = function () {
						var s1Url = reqUrl.replace(/\/season\/\d+/, "/season/1");

						originalAjax({
							url: s1Url,
							type: "GET",
							dataType: "json",
							success: function (data) {
								try {
									var fixedData = _this.process(data, season, tvId);

									var fakeXHR = {
										responseText: JSON.stringify(fixedData),
										responseJSON: fixedData,
										status: 200,
										statusText: "OK",
										readyState: 4,
									};

									if (successCallback) successCallback(fixedData, "success", fakeXHR);
									if (completeCallback) completeCallback(fakeXHR, "success");
									deferred.resolve(fixedData, "success", fakeXHR);
								} catch (e) {
									if (successCallback) successCallback(data, "success", { status: 200 });
									deferred.resolve(data, "success", { status: 200 });
								}
							},
							error: function (xhr, st, err) {
								if (season > 1) {
									var stubs = _this.makeStubs(tvId, season);
									if (successCallback) successCallback(stubs, "success", { status: 200 });
									deferred.resolve(stubs, "success", { status: 200 });
								} else {
									if (errorCallback) errorCallback(xhr, st, err);
									deferred.reject(xhr, st, err);
								}
							},
						});
					};

					originalAjax({
						url: reqUrl,
						type: "GET",
						dataType: "json",
						success: function (data, textStatus, xhr) {
							if (data && data.episodes && data.episodes.length > 0) {
								if (season === 1) {
									try {
										var fixedData = _this.process(data, 1, tvId);
										if (successCallback) successCallback(fixedData, textStatus, xhr);
										if (completeCallback) completeCallback(xhr, textStatus);
										deferred.resolve(fixedData, textStatus, xhr);
									} catch (e) {
										if (successCallback) successCallback(data, textStatus, xhr);
										if (completeCallback) completeCallback(xhr, textStatus);
										deferred.resolve(data, textStatus, xhr);
									}
									return;
								}

								if (successCallback) successCallback(data, textStatus, xhr);
								if (completeCallback) completeCallback(xhr, textStatus);
								deferred.resolve(data, textStatus, xhr);
							} else {
								runSmartFix();
							}
						},
						error: function (xhr, textStatus, errorThrown) {
							runSmartFix();
						},
					});

					return promise;
				}

				return originalAjax.apply(this, arguments);
			};
		},

		process: function (data, requestedSeason, tvId) {
			var copyData = JSON.parse(JSON.stringify(data));
			var allEps = copyData.episodes || [];

			if (allEps.length === 0) return copyData;

			var seasonsMap = {};
			var currentSeason = 1;
			var lastDay = 0;

			allEps.sort(function (a, b) {
				return a.episode_number - b.episode_number;
			});

			for (var i = 0; i < allEps.length; i++) {
				var ep = allEps[i];

				var epDay = this.dateToDays(ep.air_date);

				if (epDay > 0 && lastDay > 0) {
					if (epDay - lastDay > this.gap) {
						currentSeason++;
					}
				}

				if (epDay > 0) lastDay = epDay;

				if (!seasonsMap[currentSeason]) seasonsMap[currentSeason] = [];

				ep.season_number = currentSeason;

				ep.episode_number = seasonsMap[currentSeason].length + 1;

				ep.id = 900000 + currentSeason * 1000 + ep.episode_number;

				seasonsMap[currentSeason].push(ep);
			}

			var resultEps = seasonsMap[requestedSeason] || [];

			if (requestedSeason > 1 && resultEps.length === 0) {
				for (var k = 1; k <= 12; k++) {
					resultEps.push({
						id: 888000 + k,
						episode_number: k,
						name: "Episode " + k,
						air_date: "2025-01-01",
						overview: "Нет данных в TMDB. (SmartFix)",
						season_number: requestedSeason,
						still_path: null,
						vote_average: 5.0,
					});
				}
			}

			copyData.episodes = resultEps;
			copyData.name = "Season " + requestedSeason;
			copyData.season_number = requestedSeason;
			copyData._id = "smart_id_" + tvId + "_" + requestedSeason;
			copyData.id = 50000 + requestedSeason * 100;

			return copyData;
		},

		makeStubs: function (tvId, sNum) {
			var eps = [];
			for (var i = 1; i <= 12; i++) {
				eps.push({
					id: 777000 + i,
					episode_number: i,
					name: "Episode " + i,
					overview: "Offline Fix",
					season_number: sNum,
					air_date: "2025-01-01",
					still_path: null,
				});
			}
			return {
				episodes: eps,
				name: "Season " + sNum,
				season_number: sNum,
				overview: "",
				id: 666000,
				poster_path: null,
			};
		},
	};

	function start() {
		if (window.ANIME_FIX_LOADED) return;
		window.ANIME_FIX_LOADED = true;
		SEASON_FIX.init();
	}

	if (typeof Lampa !== "undefined") {
		if (window.appready) start();
		else
			Lampa.Listener.follow("app", function (e) {
				if (e.type == "ready") start();
			});
	} else {
		var t = setInterval(function () {
			if (typeof Lampa !== "undefined") {
				clearInterval(t);
				if (window.appready) start();
				else
					Lampa.Listener.follow("app", function (e) {
						if (e.type == "ready") start();
					});
			}
		}, 100);
	}
})();
