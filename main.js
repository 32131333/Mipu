const path = require("path");
const fs = require("fs");

const express = require("express");
const { transformFileSync } = require("@babel/core");

const webpack = require("webpack");
const webpackConf = require("./webpack.config.js");

// Custom libs
const reader = require("./read.js")
const { defaultLanguage, translate, languages, language_parse } = require("./language.js");

const translationCache = {};
let enableBabel = true;

async function webpackGen() {
	console.log("[INFO] Creating bundle.js");
	webpack(webpackConf, function (err, stat) {
		if (err || stat.hasErrors()) {
			console.error("[ERROR] Critial error while webpack", err, stat, "\n- Please rechecks your scripts. Without webpack you can't refresh pages (or anything scripts)");
			return;
		};
		console.info("[INFO] Successfully generated webpack scripts. To refresh scripts, reload this web server");
	});
};


function readAndTranslate(fileName, lang) {
	try {
		const cacheKey = `${fileName}:${lang}`;
		lang = lang || defaultLanguage;

		if (translationCache[cacheKey]) {
			return translationCache[cacheKey];
		} else {
			let document;
			
			if (fileName.endsWith(".jsx") && enableBabel) document = transformFileSync(fileName, {presets: [['@babel/preset-env', { "exclude": ["proposal-dynamic-import"] }], '@babel/preset-react'], plugins: []}).code
			else document = reader.read(fileName, true, "", false);
			
			let translatedDoc = translate(document, lang);
			
			translationCache[cacheKey] = translatedDoc;

			// Добавляем наблюдатель для обновления кэша при изменении файла
			
			let watcher;
			watcher = fs.watch(fileName, (eventType) => {
				if (eventType === 'change') {
					console.log(`[INFO readAndTranslate] File ${fileName} has changed. Updating cache for lang ${lang}.`);
					try {
						let document;
						if (fileName.endsWith(".jsx") && enableBabel) document = transformFileSync(fileName, {presets: [['@babel/preset-env', { "exclude": ["proposal-dynamic-import"] }], '@babel/preset-react'], plugins: []}).code
						else document = reader.read(fileName, true, "", false);
						let updatedTranslatedDoc = translate(document, lang);
						translationCache[cacheKey] = updatedTranslatedDoc;
					} catch (e) {
						console.error(`[ERROR readAndTranslate] Error re-reading file ${fileName}:`, e);
					};
				} else if (eventType == "rename") {
					console.log(`[INFO readAndTranslate] File ${fileName} has renamed. Clearing cache for lang ${lang}.`);
					delete translationCache[cacheKey];
					watcher.close();
				};
			});

			return translatedDoc;
		};
	} catch (e) {
		console.error(`[ERROR readAndTranslate] Error reading or translating file: ${fileName}`, e);
		throw e;
	};
};

const rendererForSearchIndexing = require("./rendererForSearchIndexing");
module.exports = function (app) {
	app.use(function (req, res, next) {
		if (req.headers['user-agent'].toLowerCase().includes("bot") || req.cookies.force_bot_mode) {
			return rendererForSearchIndexing(req, res, next);
		};
		return next();
	});
	
	
	app.use(function (req, res, next) {
		//console.log(req.headers);
		//req.selectedLanguage = req.cookies.lang;
		if (!req.cookies.lang) {
			if (!req.headers["accept-language"]) {
				res.cookie("lang", defaultLanguage);
				req.selectedLanguage = defaultLanguage;
			} else {
				// Используем язык, который был указан браузером при посещении страницы
				let selected = false;
				
				let acceptLanguage = req.headers["accept-language"].split(",").map(x=>x.trim());
				
				for (const lang of acceptLanguage) {
					let langFullName = lang.split(";")[0].toLowerCase();
					let langRealName = langFullName.split("-")[0];
					
					
					let savedLang = languages[langFullName] || languages[langRealName];
					//console.log(lang, langFullName, langRealName, savedLang);
					if (savedLang) {
						// Язык существует, значит можем выбрать язык для юзера
						res.cookie("lang", savedLang.langCode);
						req.selectedLanguage = savedLang.langCode;
						selected = true;
						break;
					};
				};
				if (!selected) {
					res.cookie("lang", defaultLanguage);
					req.selectedLanguage = defaultLanguage;
				};
			};
		};
		
		res.set("X-Is-Proxy", String(Boolean(req.get("X-Is-Proxy"))));
		next();
	});
	
	app.use("/favicon.ico", function (req, res) { res.redirect("static/fallingstar.ico") });
	app.use("/robots.txt", function (req, res) { res.redirect("static/robots.txt") });
	
	app.use("/static", express.static(path.join(__dirname, "page/static")), function (req, res, next) {
		if (!res.headersSent) {
			res.status(404).send();
		};
	});
	
	app.use("/translatable_static", function (req, res, next) {
		let language = language_parse(req.selectedLanguage);

		let filePath = path.join(__dirname, "page/translatable_static", req.url);
		try {
			let document = readAndTranslate(filePath, language);
			let ct = "text/txt";
			
			if (filePath.includes(".js")) ct = "application/javascript; charset=utf-8";
			
			res.set("Content-Type", ct).send(document);
		} catch (e) {
			console.log(e);
			res.status(404).send();
		};
	});
	
	app.use("/", function (req, res, next) {
		//if (req.cookies.lang==undefined) res.cookie("lang", defaultLanguage);
		let language = language_parse(req.selectedLanguage);

		let document = readAndTranslate(path.join(__dirname, "page", "index.html"), language);
		document = document.replace("^isProxy", String(Boolean(req.get("X-Is-Proxy"))));
		
		//let extdoc = translate(document, language);
		//if (!debug) { extdoc = extdoc.replace(/<!--(.|\n)*?-->/g, "").replace(/(\s)/g, " ").replaceAll("    ", ""); };
			
		res.set("Content-type", "text/html").send(document);
	});
	
	//webpackGen();
};

module.exports.languages = languages;