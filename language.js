const fs = require("fs");
const path = require("path");

const config = require('./configReader.js');

const defaultLanguage = "ru";



let languages = {};
function mergeObjects(...objects) {
	let merged = {};
	for (let obj of objects) {
		for (let key in obj) {
			if (key!=="x" && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
				merged[key] = mergeObjects(merged[key], obj[key]);
			} else {
				merged[key] = obj[key];
			}
		};
	};
	return merged;
};

const language_parse = function (name) {
	if (name in languages) return name
	else return defaultLanguage;
};


function unicodeEscape(str) {
	return str.replace(/[\s\S]/g, function(character) {
		return '\\u' + ('0000' + character.charCodeAt().toString(16)).slice(-4);
	});
};

function getNestedPropertyValue(obj, key) {
	const val = key.split(".").reduce((acc, current) => acc && acc[current], obj) ?? key;
	if (typeof val=="object") return unicodeEscape(translate(JSON.stringify(val), obj))
	else return val;
};

function loadLanguages() {
	languages_list = [];
	let scriptedLanguages = {};
	const lang = fs.readdirSync("languages");
	for (const a of lang) {
		const fileInfo = path.parse(`languages/${a}`);
		if (require.resolve(`./languages/${a}`) in require.cache) delete require.cache[require.resolve(`./languages/${a}`)];
		let l = require(`./languages/${a}`);
		if (typeof l == "object") {
			languages[fileInfo.name] = l;
			
			if (config("frontend_apis")) {
				Object.assign(l.apis, config("frontend_apis"));
			};
		} else if (typeof l == "function") {
			scriptedLanguages[fileInfo.name] = l;
		};
	};
	
	for (const sLang in scriptedLanguages) {
		const result = scriptedLanguages[sLang](languages, languages[defaultLanguage]);
		
		delete result.apis;
		delete result.proxy_apis;
		delete result.clientName;
		
		languages[sLang] = result;
	};
	
	let pushLang = (lang) => languages_list.push({code: lang, name: languages[lang].name, flag: languages[lang].flag||"❓"});
	for (const a in languages) pushLang(a);
	console.info("[INFO language.js] Были обновлены языкы");
};

function translate(doc, lang) {
	let result;
	let Lang
	
	if (typeof lang == "string" && lang != defaultLanguage) Lang = mergeObjects(languages[defaultLanguage], languages[lang]);
	else if (typeof lang == "object" && lang != defaultLanguage) Lang = mergeObjects(languages[defaultLanguage], lang)
	else Lang = languages[defaultLanguage];
	
	// doc example:
	/*
		<p>#helloworld#</p>
		<p>#app.name# !!</p>
	*/
	
	// lang example
	/*
		{"code": "idk", "helloworld": "Hello World!", "app": {"name": "Mipu"}}
	*/
	
	// doc result example
	/*
		<p>Hello World!</p>
		<p>Mipu !!</p>
	*/
	
	/*result = doc.replace(/#([\w.]+)#/g, (x, y)=>{
		return getNestedPropertyValue(Lang, y);
	});*/
	result = doc
	
	let match;
	while ((match = /#([\w.]+)#/g.exec(result))) {
		let key = getNestedPropertyValue(Lang, match[1]);
		result = result.slice(0, match.index) + key + result.slice(match.index+match[0].length)
	};
	
	
	return result;
};

loadLanguages();
fs.watch("./languages", function (event, filename) {
	if (event == "change") loadLanguages();
});


module.exports = { languages, mergeObjects, language_parse, loadLanguages, getNestedPropertyValue, translate, defaultLanguage };