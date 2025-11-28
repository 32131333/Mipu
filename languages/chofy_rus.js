const choice = (target) => target[Math.floor(Math.random()*target.length)];
const chance = (int) => (Math.random() *100)+int>100;

//чофированный русский текст
function chofy(text) {
	let reparseSymbol = function (x) {
		let symbol;
		if (chance(90)) {
			switch(x.toLowerCase()) {
				case "а":
					symbol = choice(["йа", "я", "о", "йо", "а"]);
					break;
				case "я":
					symbol = choice(["йя", "йо", "йа", "а"]);
					break;
				case "о":
					symbol = choice(["0", "а", "о"]);
					break;
				case "т":
					symbol = choice(["д", "т"]);
					break;
				case "д":
					symbol = choice(["тд", "д", "т"]);
					break;
				case "л":
					symbol = choice(["в", "л"]);
					break;
				case "г":
				case "к":
					symbol = choice(["г", "к"]);
					break;
				case "б":
					symbol = choice(["п", "б"]);
					break;
				case "е":
				case "э":
					symbol = choice(["е", "э"]);
					break;
				case "й":
					symbol = choice(["и", "й"]);
					break;
				case "е":
					symbol = choice(["и", "е"]);
					break;
				case "ь":
				case "ъ":
					symbol = choice(["ь", "ъ"]);
					break;
				case "ш":
				case "щ":
					symbol = choice(["щ", "ш"]);
					break;
				case "с":
				case "з":
					symbol = choice(["з", "с"]);
					break;
				case "е":
				case "ё":
					symbol = choice(["е", "ё"]);
					break;
				default:
					symbol = x;
			};
		} else {
			symbol = x;
		};
		if (chance(50)) symbol = choice([symbol, symbol.toLowerCase(), symbol.toUpperCase()]);
		return symbol;
	};
	return text.replace(/(.)/g, reparseSymbol);
};

function parseObj(obj) {
	let newObj = JSON.parse(JSON.stringify(obj));
	if (Array.isArray(newObj)==false) {
		for (const val in newObj) {
			if (typeof newObj[val]!=="object") newObj[val] = chofy(String(newObj[val]))
			else newObj[val] = parseObj(newObj[val]);
		};
	} else {
		newObj = newObj.map(x=>{
			if (typeof x!=="object") return chofy(String(x))
			else return parseObj(x);
		});
	};
	return newObj;
};


module.exports = (lang, defaultLang) => {
	let l = parseObj(defaultLang);
	l.html_lang_code = "ru";
	l.name = chofy("Какой-то русский");
	l.flag = "🇷🇺";
	return l;
};




