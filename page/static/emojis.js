// Скрипт отвечающий за крутые парсеры сойтаа



//marked.use({breaks: true});

app.pars = {
	globaledParser: function (x, level=0) { 
		function additional(x) {
			//return x.replace(/>/g, "&gt;");
			return x;
		};
		
		if (level >= 1) {
			additional = (x)=>x;
		};
		// level = 0 > Неверифицированные, спам-пользователи, предохранение
		// level = 1 > Полностью верифицированные пользователи
	
		//let result = DOMPurify.sanitize((marked.parse(additional(x).replaceAll(/\n(?![ \S])/g, "\n\\").replaceAll(/\n\\\n(?!\\)/g, "\n\\\n\n")).replaceAll(/\<br\>\\/g, "<br><br>").replaceAll("<p>\\</p>", "<br>")));
		//return result;
		return "[ deprecated ]";
	},
};



app._emoji = function (src, type, data) {
    const elem = document.createElement("img");
	elem.src = src;
	elem.classList.add("emoji");
	if (type) elem.classList.add(`emoji-${type}`);
	if (data) {
		for (const a in data) {
			elem.setAttribute(a, data[a]);
		};
	};
	elem.setAttribute("draggable", "false");
	return elem;
};
//app._emoji.iemoji = /:i:.\w*:/g; // :i:verified: -- Системное эмодзи
app._emoji.cemoji = /:e:.\w*:/g; // :e:7: -- Кастомное эмодзи
app._emoji.onlyEmojis = /^(?:(?:\p{Emoji}|:i:\w*:|:e:\w*:|\s)+)$/u;
app._emoji.onlySignleEmoji = /^(?:(?:\p{Emoji}|:i:\w*:|:e:\w*:|\s))$/u;


/*app._emoji.customParse = function (node) {
	if (!node) return null; // Возможно, объект уже заменен другим парсером
	const d = document.createDocumentFragment();
	const a = [];
	let modified = false;
	for (const x of node.childNodes) {
		if (x instanceof Text) {
			let lastSubstr = x.textContent;
			let d;
			let changed = false;
			while ((d=app._emoji.iemoji.exec(lastSubstr))) {
				modified = true;
				changed = true;
				let substr1 = lastSubstr.slice(0, d.index);
				let exted = app._emoji("/static/svg/"+`${d[0].slice(3, -1)}`+".svg");
				exted.alt = d[0];
				a.push(substr1);a.push(exted);
				lastSubstr = lastSubstr.slice(d.index+d[0].length);
			};
			if (changed) a.push(lastSubstr)
			else a.push(x);
		} else {
			a.push(x);
		};
	};
	
	const b = [];
	for (const x of a) {
		if (typeof x==="string" || x instanceof Text) {
			let lastSubstr = x instanceof Text ? x.textContent : x;
			let d;
			let changed = false;
			while ((d=app._emoji.cemoji.exec(lastSubstr))) {
				modified = true;
				changed = true;
				let substr1 = lastSubstr.slice(0, d.index);
				let exted = app._emoji(app.apis.mediastorage+`emoji/${d[0].slice(3, -1)}`);
				b.push(substr1);b.push(exted);
				lastSubstr = lastSubstr.slice(d.index+d[0].length);
			};
			if (changed) b.push(lastSubstr)
			else b.push(x);
		} else {
			b.push(x);
		};
	};
	
	if (modified) {
		for (const x of node.childNodes) {
			x.remove();
		};
		for (const v of b) d.append(v);
		node.appendChild(d);
	};
};*/

app._emoji.customParse = function (node) {
	for (const pars of app._emoji.customParse.parsers) {
		for (const x of node.childNodes) {
			if (x instanceof Text) {
				let y = x;
				while ((d=pars[0].exec(y.textContent))) {
					let w;
					if (d.index>0) w = x.splitText(d.index)
					else w = x;
					const ext = pars[1](d);
					let y = w.splitText(d[0].length);
					y.parentElement.insertBefore(ext, y);
					w.remove();
				};
			};
		};
	};
};
app._emoji.customParse.parsers = [
	/*[app._emoji.iemoji, (d, onlyUrl)=>!onlyUrl ? app._emoji("/static/svg/"+`${d[0].slice(3, -1)}`+".svg") : "/static/svg/"+`${d[0].slice(3, -1)}`+".svg"],*/
	[app._emoji.cemoji, (d, onlyUrl)=>!onlyUrl ? app._emoji(app.apis.mediastorage+`emoji/${d[0].slice(3, -1)}`, "custom", {tooltip: "#uncategorized.this_is_custom_emoji#", customid: String(d[0].slice(3, -1))}) : app.apis.mediastorage+`emoji/${d[0].slice(3, -1)}`]
];
//app._emoji.customParse.parsers = [[app._emoji.iemoji, (d)=>new Text("[ internal emoji ]")], [app._emoji.cemoji, (d)=>new Text("[ custom emoji ]")]];

/*app._emoji.iemoji = /:i:.\w*:/g; // :i:verified: -- Системное эмодзи
app._emoji.cemoji = /:e:.\w*:/g; // :e:7: -- Кастомное эмодзи

app._emoji.customParse = function (node) {
  if (!node) return null; // Возможно, объект уже заменен другим парсером
  const d = document.createDocumentFragment(); // Создаем фрагмент документа
  const a = []; // Массив для хранения элементов
  let modified = false; // Флаг изменения

  for (const x of node.childNodes) {
    if (x instanceof Text) {
      let lastSubstr = x.textContent;
      let d; 

      // Обработка системных эмодзи
      while ((d = app._emoji.iemoji.exec(lastSubstr))) {
        modified = true;
        let substr1 = lastSubstr.slice(0, d.index);
        let exted = app._emoji("/static/svg/" + `${d[0].slice(3, -1)}` + ".svg"); // Получаем системное эмодзи
        exted.alt = d[0];
        a.push(substr1, exted); // добавить текст до эмодзи и сам эмодзи
        lastSubstr = lastSubstr.slice(d.index + d[0].length);
      }
  
      // Добавляем оставшуюся часть текста после обработки системных эмодзи
      a.push(lastSubstr);

      // Обработка кастомных эмодзи
      lastSubstr = a.pop(); // Берем последний элемент текста для кастомного эмодзи
      let match;
      while ((match = app._emoji.cemoji.exec(lastSubstr))) {
        modified = true;
        let substr1 = lastSubstr.slice(0, match.index);
        // Создаем элемент кастомного эмодзи с использованием новой переменной
        let customEmoji = app._emoji(app.apis.mediastorage + `emoji/${match[0].slice(3, -1)}`); 
        customEmoji.alt = match[0];
        a.push(substr1, customEmoji); // добавить текст до кастомного эмодзи и сам кастомный эмодзи
        lastSubstr = lastSubstr.slice(match.index + match[0].length);
      }
      a.push(lastSubstr); // Добавляем оставшуюся часть текста
    } else {
      a.push(x); // Для не текстовых узлов просто добавляем
    }
  }

  if (modified) {
    console.log("Changed!!!");
    for (const x of node.childNodes) {
      if (x instanceof Text) {
        x.remove(); // Удаляем оригинальные текстовые ноды
      }
    }
    a.forEach(v => d.append(v)); // Добавляем новые элементы в фрагмент
    node.appendChild(d); // Вставляем фрагмент в узел
  }
};
*/

app._emoji.customParse.isAbsoluteIgnore = function (node) {
	if (!node) return true;
	// Некоторые объекты, по типу React-вводных строк, создают жоски проблемы
	
	return reachToParentUntil(node, (n)=>n.getAttribute("contenteditable") || n.tagName == "PRE" || n.tagName == "IFRAME" || n.getAttribute("role") == "textbox" || n.classList.contains("app-slatetexteditor"));
};

app._emoji.customParse.moveFromRoot = function (node, d) {
	if (!node || (node instanceof HTMLElement && node.getAttribute("contenteditable")) || app._emoji.customParse.isAbsoluteIgnore(node)) return;
	if (node.getAttribute("contenteditable") || (node.parentNode && node.parentNode.parentNode && node.parentNode.parentNode.querySelector("textarea"))) return;
	app._emoji.customParse(node);
	
	for (const a of node.children) {
		if (a instanceof HTMLElement) {
			app._emoji.customParse.moveFromRoot(a, false);
		};
	};
};

app._emoji.parseTwemoji = function (node) {
	twemoji.parse(node, {
		folder: "svg",
		ext: ".svg"
	});
};

// Инициализация MutationObserver
app._emoji.observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		/*if (mutation.type === 'childList') {
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					parseTwemoji(node);
					app._emoji.customParse.moveFromRoot(node);
				}
			});
		} else if (mutation.type === 'characterData') {
			const parentNode = mutation.target.parentNode;
			if (parentNode && parentNode.nodeType === Node.ELEMENT_NODE) {
				parseTwemoji(parentNode);
				app._emoji.customParse(parentNode);
			}
		}*/
		const parentNode = mutation.target.parentNode;
		if (app._emoji.customParse.isAbsoluteIgnore(parentNode)) return;
		if (parentNode && parentNode.nodeType === Node.ELEMENT_NODE) {
			app._emoji.parseTwemoji(parentNode);
			try { app._emoji.customParse.moveFromRoot(parentNode) } catch(e) { console.error(e);app.m_.render({title: "Something happened with parsers!", html: `<code>${e.stack}</code>`,closable: true});crashed = true };
		};
	});
});

app._emoji.observer.observe(document.querySelector("body"), {
	childList: true,
	characterData: true,
	subtree: true
});

document.addEventListener("click", function (e) {
	if (e.target.classList.contains("emoji-custom")) {
		e.preventDefault();
		const originalId = e.target.getAttribute("customid");
		app.functions.renderEmojiInfo(originalId);
	};
});