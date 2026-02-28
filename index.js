const express = require('express');
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const config = require('./configReader.js');

const app = express();
app.set("trust proxy", "loopback");

/*app.use("/pingtest", function (req, res, next) {
	res.set("Content-type", "text/html").send("<title>Пинг</title><h2>Понг!! :3</h2><br>Это тестовая страница для проверки работоспособности. <a href='/'>Нажмите сюда</a>, чтобы открыть гл. страницу");
});*/

const limiter = rateLimit({
	windowMs: 30 * 1000,
	limit: 100,
	standardHeaders: 'draft-7',
	legacyHeaders: false
});

app.use(limiter, cookieParser(), compression());

require("./proxy.js")(app);
require("./main.js")(app);

app.use(function(err, req, res, next) {
	console.error("[ ERROR ]",err);
	res.status(500).send("<title>INTERNAL ERROR</title><h1>Internal Server Error</h1><br><h2>Во время формирования страницы произошла внутреняя ошибка сервера<br>Этой ошибки не должно быть на стабильной версии клиента<br>Если вы видите эту ошибку, пожалуйста, сообщите нам о этом, этого не должно было случиться</h2>");
});

//const server = require("http").createServer(app);
//server.listen(80);
app.listen(config("frontend_host", 80));