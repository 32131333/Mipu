const choice = (target) => target[Math.floor(Math.random()*target.length)];
const chance = (int) => (Math.random() *100)+int>100;


let randomCharK = 0.3;
let randomSymbK = 0.05;
let randomFillK = 0.005;
let randomFillCountMax = 5;

// Функция для случайного изменения букв и капитализации
function randomizeChar(char) {
	const glitchChars = ['@', '$', '%', '^', '&', '*', '(', ')', '!', '?', '#', '₽', '∫', '¢', '_', '-', 'Æ'];
	if (Math.random() <= randomSymbK) {
		return glitchChars[Math.floor(Math.random() * glitchChars.length)];
	} else if (Math.random() <= randomCharK) {
		return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
	};
	return char;
};

// Функция для преобразования текста
function glitchText(text) {
    let result = '';
	
    let fillCount = 0;
    for (let i = 0; i < text.length; i++) {
		if (Math.random() <= randomFillK) {
			fillCount = Math.floor(Math.random()*randomFillCountMax);
		};
		
		if (fillCount > 0) {
			if (text[i] == " ") { 
				fillCount = 0;
				result += randomizeChar(text[i]);
			} else {
				result += "#";
				fillCount--;
			};
		} else result += randomizeChar(text[i]);
    };
    return result;
};


function parseObj(obj) {
	let newObj = JSON.parse(JSON.stringify(obj));
	if (Array.isArray(newObj)==false) {
		for (const val in newObj) {
			if (typeof newObj[val]!=="object") newObj[val] = glitchText(String(newObj[val]))
			else newObj[val] = parseObj(newObj[val]);
		};
	} else {
		newObj = newObj.map(x=>{
			if (typeof x!=="object") return glitchText(String(x))
			else return parseObj(x);
		});
	};
	return newObj;
};


module.exports = (lang, defaultLang) => {
	let l = parseObj(defaultLang);
	l.html_lang_code = "ru";
	l.name = glitchText("ПОМОГИ МНЕ ПОЖАЛУЙСТА");
	l.flag = "🇷🇺";
	return l;
};




