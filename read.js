const fs = require("fs");

const cache = {};

function read(fileName, except = true, errorPrefix = "", cacheIt=true) {
    if (fileName in cache) {
        return cache[fileName];
    } else {
        let result;
        try {
            result = fs.readFileSync(fileName, "utf8");
			
            if (cacheIt) {
				cache[fileName] = result;
				// Добавляем наблюдатель для обновления кэша при изменении файла
				let watcher;
				watcher = fs.watch(fileName, (eventType) => {
					if (eventType === 'change') {
						console.log(`[INFO read.js] File ${fileName} has changed. Updating cache.`);
						try {
							cache[fileName] = fs.readFileSync(fileName, "utf8");
						} catch (e) {
							console.error(`[ERROR read.js] Error re-reading file ${fileName}:`, e);
							if (except) {
								delete cache[fileName]; // Удаляем из кэша, чтобы в следующий раз была снова попытка чтения
								throw e;
							} else {
								cache[fileName] = `${errorPrefix}INTERNAL EXCEPTION WHILE FILE READING

${String(e)}`;
							};
						};
					} else if (eventType === 'rename') {
						console.log(`[INFO read.js] File ${fileName} has ranamed. Clearing cache.`);
						delete cache[fileName];
						watcher.close();
					};
				});
			};
        } catch (e) {
            if (except) throw e;
            result = `${errorPrefix}INTERNAL EXCEPTION WHILE FILE READING

${String(e)}`;
            console.error("[ERROR read.js]", e);
        };
        return result;
    }
};

module.exports = { read };