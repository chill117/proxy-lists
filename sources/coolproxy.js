var EventEmitter = require("events");
var async = require("async");
var request = require("request");
var _ = require("underscore");
var cheerio = require("cheerio");

module.exports = {
	homeUrl: "http://www.cool-proxy.net/proxies/http_proxy_list",

	getProxies: function () {
		var emitter = new EventEmitter();
		async.seq(
			_.bind(this.getPageLinks, this),
			_.bind(this.parsePages, this, emitter)
		)(function () {
			emitter.emit("end");
		});

		return emitter;
	},

	getPageLinks: function (cb) {
		var url = this.homeUrl;
		request({
			method: "GET",
			url: this.homeUrl,
		}, function (err, res, body) {
			if (err) {
				return cb(err);
			}
			var $ = cheerio.load(body);
			$("span.next").remove();
			var maxPage = $(".pagination a").last().html();
			var links = [];
			for (var i = 1; i <= maxPage; i++) {
				links.push(url + "/page:" + i);
			}
			return cb(null, links);
		});
	},

	parsePages: function (emitter, links, cb) {
		var totalPages = links.length;
		_.each(links, _.bind(function (link) {
			async.seq(
				this.getPage,
				_.bind(this.parsePage, this)
			)(link, function (err, proxies) {
				--totalPages;

				if (err) {
					emitter.emit("error", err);
				}

				if (proxies) {
					emitter.emit("data", proxies);
				}

				if (totalPages === 0) {
					cb();
				}
			});
		}, this));
	},

	getPage: function (link, cb) {
		request({
			method: "GET",
			url: link,
		}, function (err, res, html) {
			if (err) {
				return cb(err);
			}
			return cb(null, html);
		});
	},

	parsePage: function (html, cb) {
		var $ = cheerio.load(html);
		$("table tr").last().remove();
		var proxies = $("table tr").map(_.bind(function (i, tr) {
			var tds = $(tr).find("td");
			if (tds.length < 3) {
				return null;
			}
			var ip = this.decodeProxy($(tds[0]).html());
			var port = $(tds[1]).html();
			var anonymity = $(tds[5]).html() === "Anonymous" ? "anonymous" : "transparent";
			return {
				ipAddress: ip,
				port: parseInt(port),
				protocols: ["http"],
				anonymityLevel: anonymity,
			};
		}, this)).get();
		return cb(null, proxies);
	},

	decodeProxy: function (html) {
		var strRot13 = function (str) {
			return (str + "").replace(/[a-z]/gi, function (s) {
				return String.fromCharCode(s.charCodeAt(0) + (s.toLowerCase() < "n" ? 13 : -13));
			});
		};
		var hash = html.match(/str_rot13\("(.+)"\)/);
		return Buffer.from(strRot13(hash[1]), "base64").toString();
	},
};
