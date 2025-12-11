const axios = require("axios");

module.exports = function (app) {
	app.get("/mediaproxy", async (req, res) => {
		const externalUrl = req.query.url;
		if (!externalUrl) return res.status(400).send();
		
		try {
			const response = await axios({
				method: "GET",
				url: externalUrl,
				responseType: "stream",
				maxContentLength: 10 * 1024 * 1024
			});
			
			const contentType = response.headers["content-type"];
			if (!contentType || !contentType.startsWith("image/")) {
				res.status(400).send();
			};
			
			res.set("Content-Type", contentType);
			response.data.pipe(res);
		} catch(e) {
			res.status(500).send();
		};
	});
};