function mergeObjects(...objects) {
	let merged = {};
	for (let obj of objects) {
		for (let key in obj) {
			if (key!=="x" && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
				merged[key] = mergeObjects(merged[key], obj[key]);
			} else {
				merged[key] = obj[key];
			};
		};
	};
	return merged;
};

function reachToParentUntil(node, check) {
	let a = node;
	if (check(a)) return a;
	while ((a=a.parentElement) != null) {
		if (check(a)) return a;
	};
	return null;
};

const ItsRandom = {
	choice: function (arr) {
		const arrL = arr.length;
		const randommed = Math.floor(Math.random()*arrL);
		return arr[randommed];
	}
};

function mapJSON(obj, callback) {
	const result = [];
	for (const a in obj) {
		result.push(callback(obj[a], a));
	};
	return result;
};

function generateAStringOfRandomSymbols(length, symbols) {
	if (!symbols) {
		symbols = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
	};
	const a = symbols.split("");
	let result = "";
	let n = 0;
	while (n<=length) {
		result += ItsRandom.choice(a);
		n++;
	};
	return result;
};

/*async function readFrom(url) {
	if (readFrom.cache[url]) return readFrom.cache[url]
	else {
		try {
			
		} catch {
			
		};
	};
};
readFrom.cache = {};*/

const sleep = (ms)=>new Promise(resolve=>setTimeout(resolve, ms));
const randint = (max)=>Math.floor(max*Math.random());

function tryToReadJSON(d) {
	try {
		return JSON.parse(d);
	} catch(e) {
		console.error(e);
		return {Error: e};
	};
};

function processButton(b, bu, workingText, errorText, successText, after, disableAfterSuccess, fastlyErrorHandle) {
	const thisfunction = async function(event) {
		if (!bu) bu = event.target;
		const oldtext = bu.innerHTML;
		bu.innerHTML = `<img src="/static/svg/loading.svg" class="txtfy"/> ${thisfunction.workingText ?? oldtext}`;
		bu.disabled = true;
		try {
			const result = await thisfunction.b(event, bu);
			if (after) thisfunction.after(true, result);
			if (typeof result == "number" && isNaN(result)) {
				bu.disabled = false;
				bu.innerHTML = oldtext;
				return;
			} else if (result === false || result instanceof Error) {
				throw result;
			};
			let resultedIfItInStr;
			if (!thisfunction.successText && typeof result == "string") resultedIfItInStr = result;
			bu.innerHTML = `<img src="/static/svg/checkmark.svg" class="txtfy"/> ${thisfunction.successText ?? resultedIfItInStr ?? oldtext}`;
			await sleep(3000);
			if (thisfunction.disableAfterSuccess) return;
			bu.disabled = false;
			bu.innerHTML = oldtext;
		} catch(e) {
			if (after) thisfunction.after(false, e);
			console.error(e);
			let errorResult;
			if (thisfunction.fastlyErrorHandle) errorResult = thisfunction.fastlyErrorHandle(event, e)
			else errorResult = !!e.handledText ? e.handledText : undefined;
			bu.innerHTML = `<img src="/static/svg/x.svg" class="txtfy"/> ${errorResult ?? thisfunction.errorText ?? oldtext}`;
			await snakeObject(bu);
			bu.disabled = false;
			bu.innerHTML = oldtext;
		};
	};
	thisfunction.workingText = workingText;
	thisfunction.errorText = errorText;
	thisfunction.successText = successText;
	thisfunction.after = after;
	thisfunction.disableAfterSuccess = disableAfterSuccess;
	thisfunction.fastlyErrorHandle = fastlyErrorHandle;
	thisfunction.b = b;
	return thisfunction;
};

function rnd000(k = 0.5) {
	return Math.random() <= k ? 1 : -1;
};
async function snakeObject(o, Times, Length, giveClass=true) {
	const times = Times ?? 15;
	if (giveClass) o.classList.add("failedButtonTemp");
	
	let time = 0;
	const ol = o.style.transform;
	while (time <= times) {
		let k = 1-time/times;
		let lk = Length ?? 10;

		let randomX = rnd000() * (Math.random()*k) * lk;
		let randomY = rnd000() * (Math.random()*k) * lk;
		
		o.style.transform = `${ol} translateX(${randomX}px) translateY(${randomY}px)`;
		
		time++;
		await sleep((Math.random()*0.1)*1000);
	};
	o.style.transform = ol;
	
	if (giveClass) o.classList.remove("failedButtonTemp");
};
snakeObject.untilCancelled = function (o, Length) {
	let continueIt = true;

	async function d() {
		const ol = o.style.transform;
		while (continueIt && o.isConnected) {
			let k = 1;
			let lk = Length ?? 10;

			let randomX = rnd000() * (Math.random()*k) * lk;
			let randomY = rnd000() * (Math.random()*k) * lk;
		
			o.style.transform += ` translateX(${randomX}px) translateY(${randomY}px)`;
		
			await sleep((Math.random()*0.1)*1000);
			o.style.transform = ol;
		};
	};
	d();

	
	return function() {continueIt = false};
};

function brightness(color) {
	let r, g, b;
	if (color[0] === '#') {
		color = color.slice(1);
	}
	if (color.length === 3) {
		r = parseInt(color[0] + color[0], 16);
		g = parseInt(color[1] + color[1], 16);
		b = parseInt(color[2] + color[2], 16);
	} else if (color.length === 6) {
		r = parseInt(color.substring(0, 2), 16);
		g = parseInt(color.substring(2, 4), 16);
		b = parseInt(color.substring(4, 6), 16);
	} else {
		return false; // Неподдерживаемый формат
	};

	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness;
};
brightness.isTooDark = (color)=>brightness(color) < 128;

// Преобразование HEX в RGB
function hexToRgb(hex) {
	hex = hex.replace(/^#/, '');
	if (hex.length === 3) {
		hex = hex.split('').map(hex => hex + hex).join('');
	}
	const num = parseInt(hex, 16);
	return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255
	};
}

// Преобразование RGB в HEX
function rgbToHex(r, g, b) {
	return '#' + [r, g, b].map(x => {
		const hex = x.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	}).join('');
};

// Функция усреднения цветов
function averageColor(colors) {
	const total = colors.length;
	let r = 0, g = 0, b = 0;

	colors.forEach(color => {
		const rgb = hexToRgb(color);
		r += rgb.r;
		g += rgb.g;
		b += rgb.b;
	});

	r = Math.round(r / total);
	g = Math.round(g / total);
	b = Math.round(b / total);

	return rgbToHex(r, g, b);
};

class ItsBad extends Error {
    constructor(code) {
        super(code)
        this.statusCode = code;
		this.status = code;
    }
}



function getCursorPos(input) {
    if ("selectionStart" in input && document.activeElement == input) {
        return {
            start: input.selectionStart,
            end: input.selectionEnd
        };
    }
    else if (input.createTextRange) {
        var sel = document.selection.createRange();
        if (sel.parentElement() === input) {
            var rng = input.createTextRange();
            rng.moveToBookmark(sel.getBookmark());
            for (var len = 0;
                     rng.compareEndPoints("EndToStart", rng) > 0;
                     rng.moveEnd("character", -1)) {
                len++;
            }
            rng.setEndPoint("StartToStart", input.createTextRange());
            for (var pos = { start: 0, end: len };
                     rng.compareEndPoints("EndToStart", rng) > 0;
                     rng.moveEnd("character", -1)) {
                pos.start++;
                pos.end++;
            }
            return pos;
        }
    }
    return -1;
}
function setCursorPos(input, start, end) {
    if (arguments.length < 3) end = start;
    if ("selectionStart" in input) {
        setTimeout(function() {
            input.selectionStart = start;
            input.selectionEnd = end;
        }, 1);
    }
    else if (input.createTextRange) {
        var rng = input.createTextRange();
        rng.moveStart("character", start);
        rng.collapse();
        rng.moveEnd("character", end - start);
        rng.select();
    }
}