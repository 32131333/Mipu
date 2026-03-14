const expressSitemapXml = require('express-sitemap-xml');

const config = require('./configReader.js');

const headers = new Headers();
headers.set("Authorization", "guest");
headers.set("Client-Id", "frontendSEO");
headers.set("Content-Type", "application/json;");
headers.set("X-Ignore-RateLimit-Key", config("frontend_x_backend_seo_ratelimit_ignore_key", "unknown"));

const apis = config("frontend_apis", {
	api: "http://localhost:6382/",
	media: "http://localhost:6383/"
});
const api = config("frontend_seo_backend_url", apis.api);

async function getUrls() {
	const result = ["/"];
	
	let r;
	let page = 1;
	while (r === undefined || (r?.content.length>0 && result.length <= 100000)) {
		const searchUrl = new URL(api + "search");
		searchUrl.searchParams.set("pageLength", "500"); // Берем последние 500 постов
		searchUrl.searchParams.set("sort", "1"); // Самые новые
		searchUrl.searchParams.set("parse", "posts,mipuadv_posts,users");
		searchUrl.searchParams.set("page", page);
		
		const resp = await fetch(searchUrl, { headers });
		r = await resp.json();
		if (r.status === "error") {
			r = false;
			console.error("[ERROR] API returned error", r);
			break;
		};
		
		r.content.forEach(x=>{
			const lastMod = new Date(x.edited || x.created);
			switch (x.object) {
				case "mipuadv_posts":
					result.push({ url: `/sprks/${x.id}`, changefreq: "monthly", lastMod  });
					break;
				case "posts":
					result.push({ url: `/post/${x.id}`, changefreq: "monthly", lastMod });
					break;
				case "users":
					result.push({ url: `/user/@${x.tag}`, changefreq: "monthly", lastMod });
					break;
				default:
					if (x.object && x.id) {
						result.push({ url: `/${x.object}/${x.id}`, changefreq: "monthly", lastMod });
					}
					break;
			}
		});
		
		page++;
	};
	
	return result;
};


module.exports = function (app) {
	if (config("frontend_sitemap_base", null)) {
		app.use(expressSitemapXml(getUrls, config("frontend_sitemap_base", null)));
	};
};