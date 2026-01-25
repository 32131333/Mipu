const fs = require("fs");

let configFile = {};

// Пытаемся прочитать файл
try {
	if (fs.existsSync("./../config.json")) {
		const data = fs.readFileSync("./../config.json").toString();
		configFile = JSON.parse(data);
	} else {
		console.warn("[WARN] Cannot read config due this file dont exists");
	};
} catch(e) {
	console.error("[ERROR] Cannot read `./../config.json` > ", e);
};

module.exports = (key, defaultValue) => configFile?.[key] ?? process.env?.[key] ?? defaultValue;
module.exports.conf = configFile;