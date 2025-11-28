const choice = (target) => target[Math.floor(Math.random()*target.length)];
const chance = (int) => (Math.random() *100)+int>100;

function d(text) {
    return "В связи с нарушением законодательства РФ, этот текст был заблокирован Роскомнадзором";
};


function parseObj(obj) {
	let newObj = JSON.parse(JSON.stringify(obj));
	if (Array.isArray(newObj)==false) {
		for (const val in newObj) {
			if (typeof newObj[val]!=="object") newObj[val] = d(String(newObj[val]))
			else newObj[val] = parseObj(newObj[val]);
		};
	} else {
		newObj = newObj.map(x=>{
			if (typeof x!=="object") return d(String(x))
			else return parseObj(x);
		});
	};
	return newObj;
};


module.exports = (lang, defaultLang) => {
	let l = parseObj(defaultLang);
	l.html_lang_code = "ru";
	l.name = d("");
	l.flag = "🇷🇺";
	return l;
};