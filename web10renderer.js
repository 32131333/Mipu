const { marked } = require('marked');
const config = require('./configReader.js');

const brandName = "Mipu";

function escape(unsafe) {
	if (!unsafe) return "";
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};


module.exports = async function (req, res, next) {
	if (module.exports.blackList.find(x=>(typeof x == "string" ? req.path.includes(x) : x.test(req.path)))) return next();
	
	const rule = module.exports.urls.find(x=>(typeof x[0] == "string" ? req.path.includes(x[0]) : x[0].test(req.path)));
	if (rule) {
		try {
			const {
				title, body,
				description, image, type, ld
			} = await rule[1](req,res);
			
			return res.set("Content-type", "text/html").send(`<html>
				<head>
					<meta charset="utf-8">
					<title>${title ? title : ""}${title ? " - " : ""}${brandName}</title>
					<meta property="og:title" content="${title ? title : ""}${title ? " - " : ""}${brandName}">
					<meta property="og:url" content="${req.protocol}://${req.headers.host}/${req.path}">
					<meta property="og:type" content="${type ?? "article"}">
					${ description ? ('<meta property="og:description" content="' + description + '">') : "" }
					${ image ? ('<meta property="og:image" content="' + image + '">') : "" }
					
					${ image ? '<meta name="twitter:card" content="summary_large_image">' : '' }
					${ image ? ('<meta property="twitter:image" content="' + image + '">') : "" }
					${ description ? ('<meta property="twitter:description" content="' + description + '">') : "" }
					
					${ ld ? ('<script type="application/ld+json">'+JSON.stringify(ld)+"</script>") : "" }
				</head>
				<body>
					<main>
						${body}
					</main>
				</body>
			</html>`.replaceAll("	", "").replaceAll("\n", ""))
		} catch(e) {
			console.error(e);
			return res.status(500).send("<h1>500 - Internal Server Error</h1>");
		};
	} else return res.status(404).send("<h1>404 - Not Found</h1>");
};

module.exports.headers = new Headers();
module.exports.headers.set("Authorization", "guest");
module.exports.headers.set("Client-Id", "frontendSEO");
module.exports.headers.set("Content-Type", "application/json;");

const headers = module.exports.headers;

module.exports.urls = [
	[/^\/sprks/, async function (req, res) {
		const id = req.path.split("/")[2];
		
		const pst = await fetch(module.exports.APIUrl+`mipuadv_posts/${id}`, {headers});
		const result = await pst.json();
		
		const renderedDescription = marked(result.content.description);
		
		if (result.content) {
			const isVideoPost = result.content.content[0]?.id === "video";
			
			const mapContent = result.content.content.map(x=>{
				switch (x.id) {
					case "image":
						return `<img src="${module.exports.mediaStorageExternalURL + "posts/" + String(result.content.id) + "/" + x.url}">`;
						break;
					case "video":
						return `<video controls src="${module.exports.mediaStorageExternalURL + "posts/" + String(result.content.id) + "/" + x.url}">`;
						break;
					default:
						return false;
				}
			}).filter(x=>x);
			
			return {
				"title": result.content.user && `@${result.content.author?.tag}`,
				"description": escape(result.content.description),
				"type": isVideoPost ? "video.other" : "article",
				"image": module.exports.mediaStorageExternalURL + "posts/" + String(result.content.id) + "/" + (result.content.preview ?? "preview.webp"),
				"body": `
					<a href="/user/${result.content.author?.id}">${escape( result.content.author?.name ?? ("@" + result.content.author?.tag) )}</a>
					<div>${renderedDescription}</div>
					<img src="${module.exports.mediaStorageExternalURL + "posts/" + String(result.content.id) + "/" + (result.content.preview ?? "preview.webp")}">
					${mapContent.join("")}
				`,
				"ld": {
					"@context": "https://schema.org",
					//"@type": isVideoPost ? "VideoObject" : "SocialMediaPosting", 
					"@type": isVideoPost ? ["SocialMediaPosting", "VideoObject"] : ["SocialMediaPosting", "Article"],
					"headline": (result.content.user && `@${result.content.author?.tag}`) || "Sparks",
					"description": escape(result.content.description),
					"url": `${req.protocol}://${req.headers.host}/${req.path}`,
					"image": module.exports.mediaStorageExternalURL + "posts/" + String(result.content.id) + "/" + (result.content.preview ?? "preview.webp"),
					"author": {
						"@type": "Person",
						"name": escape( result.content.author?.name ?? ('@' + result.content.author?.tag) )
					},
					"datePublished": `${new Date(result.content.created).toISOString()}`,
					// ... остальные поля Schema.org ...
					// Для VideoObject хорошо бы добавить duration, uploadDate, contentUrl
					"contentUrl": isVideoPost ? (module.exports.mediaStorageExternalURL + "posts/" + String(result.content.id) + "/" + result.content.content[0].url) : undefined
				}
			};
		} else {
			return false;
		};
	}],
	[/^\/post/, async function (req, res) {
		const id = req.path.split("/")[2];
		const postRes = await fetch(module.exports.APIUrl+`posts/${id}`, {headers});
		const result = await postRes.json();
		
		if (!result.content) return false;

		const post = result.content;
		const authorId = post.author?.id;
		
		// --- Логика обработки медиа ---

		const mediaHtmlArray = [];
		let mainImageUrl = null;
		
		// 1. Обработка устаревшего 'medias'
		if (post.medias && Array.isArray(post.medias)) {
			post.medias.forEach(fileName => {
				/*if (fileName.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {*/ // Проверяем, что это изображение
				const url = `${module.exports.mediaStorageExternalURL}${authorId}/${fileName}`;
				mediaHtmlArray.push(`<img src="${url}" alt="Изображение в посте">`);
				if (!mainImageUrl) mainImageUrl = url;
				/*}*/
			});
		}

		// 2. Обработка 'objectMedias' (идентично пункту 3/4)
		const processMediaItem = (item) => {
			if (item.id === "image" && item.url) {
				let url = item.url;
				// Проверка: если URL начинается с названия файла, добавляем ID автора
				if (!url.startsWith('/')) {
					url = `${authorId}/${url}`;
				}
				const fullUrl = `${module.exports.mediaStorageExternalURL}${url.startsWith('/') ? url : `/${url}`}`;
				mediaHtmlArray.push(`<img src="${fullUrl}" alt="Изображение в посте">`);
				if (!mainImageUrl) mainImageUrl = fullUrl;
			}
			// Игнорируем все, что не image (видео, текст и т.д. в этом обработчике)
		};
		
		if (post.objectMedias && Array.isArray(post.objectMedias)) {
			post.objectMedias.forEach(processMediaItem);
		}

		// 3. Обработка синтаксиса $[...] в контенте
		// Находим все вхождения $[...] и пытаемся распарсить как JSON
		const contentWithParsedMedia = post.content.replace(/\$\[.+\]/g, (match) => {
			try {
				const mediaArray = JSON.parse(match.slice(1));
				if (Array.isArray(mediaArray)) {
					// Возвращаем HTML-строку для вставки вместо $[...]
					return mediaArray.map(item => {
						// Используем нашу функцию processMediaItem для генерации HTML
						processMediaItem(item); 
						return mediaHtmlArray[mediaHtmlArray.length - 1]; // Возвращаем последний добавленный HTML
					}).join('');
				}
			} catch (e) {
				console.error("Ошибка парсинга JSON в контенте поста:", e, match);
			}
			return match; // Если ошибка, оставляем как есть
		});

		// --- Генерация HTML ---

		// Используем marked для парсинга основного текста (теперь без $[...], они заменены HTML)
		const postBodyHtml = marked(contentWithParsedMedia);
		const authorName = escape(post.author?.name ?? ('@' + post.author?.tag));

		return {
			"title": `${authorName}: ${post.content.substring(0, 50)}...`,
			"description": escape(post.content.substring(0, 150) + '...'),
			"image": mainImageUrl, // Используем первое найденное изображение
			"body": `
				<article>
					<a href="/user/${post.author?.id}">${authorName}</a>
					<div>${postBodyHtml}</div>
				</article>
				<!-- Дополнительные изображения, собранные из medias/objectMedias -->
				${mediaHtmlArray.join("")}
			`,
			"ld": {
				"@context": "https://schema.org",
				"@type": "Article", 
				"headline": post.content.substring(0, 100),
				"description": escape(post.content.substring(0, 150)),
				// URL будет добавлен автоматически в основном модуле
				"image": mainImageUrl ? [mainImageUrl] : undefined,
				"author": {
					"@type": "Person",
					"name": authorName,
					"url": `${req.protocol}://${req.headers.host}/user/${post.author?.id}`
				},
				"datePublished": `${new Date(post.created).toISOString()}`
			}
		};
	}],
	[/^\/user/, async function (req, res) {
		const userId = req.path.split("/")[2]; // Получаем ID из URL
		
		const userResponse = await fetch(module.exports.APIUrl+`user/${userId}`, {headers});
		const userData = await userResponse.json();
		
		if (!userData.content || userData.content.unvaliable) return false; 

		const user = userData.content;
		const authorName = escape(user.name ?? ('@' + user.tag));
		const avatarUrl = `${module.exports.mediaStorageExternalURL}/${user.id}/${user.avatar?.media}`;
		let mainImageUrl = avatarUrl; 

		// --- Логика обработки description (Markdown + $[...]) ---
		const processMediaItem = (item) => {
			if (item.id === "image" && item.url) {
				let url = item.url;
				if (!url.startsWith('/')) url = `/${url}`; 
				return `<img src="${module.exports.mediaStorageExternalURL}${url}" alt="Изображение профиля">`;
			}
			return '';
		};

		let descriptionHtml = '';
		if (user.description) {
			const descriptionWithParsedMedia = user.description.replace(/\$\[(.*?)\]/gs, (match, jsonStr) => {
				try {
					const mediaArray = JSON.parse(jsonStr);
					if (Array.isArray(mediaArray)) {
						const html = mediaArray.map(processMediaItem).join('');
						if (!mainImageUrl && mediaArray.length > 0) {
							mainImageUrl = `${module.exports.mediaStorageExternalURL}${mediaArray[0].url.startsWith('/') ? mediaArray[0].url : `/${mediaArray[0].url}`}`;
						}
						return html;
					}
				} catch (e) { /* Игнорируем ошибки парсинга */ }
				return match; 
			});
			descriptionHtml = marked(descriptionWithParsedMedia);
		}
		const userDescriptionText = escape(user.description || `Профиль пользователя ${authorName} на ${brandName}`);

		// --- Логика обработки MainPage (Pinned Posts, Absolute Text, Links) ---
		let mainPageHtml = '';
		if (user.mainPage && Array.isArray(user.mainPage)) {
			user.mainPage.forEach(item => {
				if (item.type === "absolutetext" && item.content) {
					const titleHtml = item.title ? `<h3>${escape(item.title)}</h3>` : '';
					mainPageHtml += `<div>${titleHtml}${marked(item.content)}</div>`;
				} else if (item.type === "pinnedpost" && item.content) {
					mainPageHtml += `<p>Закрепленный пост: <a href="/sprks/${item.content}">Посмотреть пост ${item.content}</a></p>`;
				} 
			});
		}

		// --- 2. Запрос последних постов (Восстановленная часть!) ---
		let postsListHtml = '<h2>Последний контент</h2><nav><ul>';
		const searchUrl = new URL(module.exports.APIUrl + "search");
		searchUrl.searchParams.set("author", user.id);
		searchUrl.searchParams.set("sort", "1"); 
		searchUrl.searchParams.set("pageLength", "150");
		searchUrl.searchParams.set("parse", "posts,mipuadv_posts");
		
		const postsRes = await fetch(searchUrl, {headers});
		const postsData = await postsRes.json();
		
		if (Array.isArray(postsData.content) && postsData.content.length > 0) {
			postsData.content.forEach(post => {
				const postUrlPath = (post.object === "posts") ? `/post/${post.id}` : `/sprks/${post.id}`;
				const previewText = post.object === "posts" ? post.content.substring(0, 100) + '...' : (post.description?.substring(0, 100) || "Посмотреть вертикальный пост") + "...";
				postsListHtml += `<li><a href="${postUrlPath}">${escape(previewText)}</a></li>`;
			});
		} else {
			postsListHtml += '<li>У пользователя пока нет постов.</li>';
		}
		postsListHtml += '</ul></nav>';

		// --- 4. Возвращение данных для шаблона ---
		return {
			"title": `@${escape(user.tag)} - ${authorName}`,
			"description": userDescriptionText,
			"image": mainImageUrl, 
			"type": "profile", 
			"body": `
				<article>
					<img src="${avatarUrl}" alt="Аватар пользователя ${authorName}" width="150" height="150">
					<h1>${authorName}</h1>
					<p>@${escape(user.tag)}</p>
					<p>${user.subs_count ? user.subs_count : "Пока что у пользователя нету"} подписчиков</p>
					<div>${descriptionHtml}</div>
				</article>
				<section>
					${mainPageHtml}
					${postsListHtml}
				</section>
			`,
			"ld": {
				"@context": "https://schema.org",
				"@type": "Person",
				"name": authorName,
				"alternateName": `@${escape(user.tag)}`,
				"image": mainImageUrl ? [mainImageUrl] : undefined,
				// URL будет автоматически добавлен в основном модуле с использованием req.protocol
			}
		};
	}],
	[/^\/$/, async function (req, res) {
        // Убедитесь, что URL-параметры определены корректно
		const feedUrl = new URL(module.exports.APIUrl + "feed");
		feedUrl.searchParams.set("length", "150");
		const verticalFeedUrl = new URL(module.exports.APIUrl + "vertical_feed");
		verticalFeedUrl.searchParams.set("length", "150");
		
        // Запросы к API (обрабатываем URL корректно)
		const postsRes = await fetch(feedUrl, {headers});
		const postsData = await postsRes.json();
		
		const verticalPostsRes = await fetch(verticalFeedUrl, {headers});
		const verticalPostsData = await verticalPostsRes.json();
		
		const data = [];
        // Проверяем статус и наличие контента
		if (postsData.status === "success" && Array.isArray(postsData.content)) {
			data.push(...postsData.content);
		}
		if (verticalPostsData.status === "success" && Array.isArray(verticalPostsData.content)) {
			data.push(...verticalPostsData.content);
		}
		
		let postsListHtml = '<h2>Последние записи и Sparks</h2><nav><ul>';

		if (data.length > 0) {
            // Сортируем объединенные данные по дате создания, если нужно
            data.sort((a, b) => b.created - a.created); 

			data.forEach(post => {
                // Определяем тип и URL
				const postUrlPath = (post.object === "posts") ? `/post/${post.id}` : `/sprks/${post.id}`;
                // Определяем текст для ссылки, используя escape
				const previewText = post.object === "posts" ? 
                    post.content.substring(0, 100) + '...' : 
                    (post.description?.substring(0, 100) || "Посмотреть вертикальный пост") + "...";
				
				postsListHtml += `<li><a href="${postUrlPath}">${escape(previewText)}</a></li>`;
			});
		} else {
			postsListHtml += '<li>Пусто</li>';
		}
		postsListHtml += '</ul></nav>';
		
        // Возвращаем объект с данными для основного шаблона
        return {
            "title": `Главная лента`,
            "description": `${brandName} - ...`,
            "body": `
                <h1>Добро пожаловать в ${brandName}!</h1>
                ${postsListHtml}
            `
        };
	}]
];
module.exports.blackList = ["/static/", "/favicon.ico", "/robots.txt"/*, "/sitemap.xml" */];

const apis = config("frontend_apis", {
	api: "http://localhost:6382/",
	media: "http://localhost:6383/"
});
module.exports.APIUrl = apis.api;
module.exports.mediaStorageExternalURL = config("frontend_media_external_url", apis.media);