import { io } from "socket.io-client";

// Первая инициализация
app.createGateway = function () {
	if (window.app && window.app.io) window.app && window.app.io.disconnect();
	
	const socket = io(
		app.isProxy ?
			{ path: app.apis.api + "/socket.io" }
			:
			app.apis.api
	);
	
	socket.on("message_for_user", msg=>console.log("[WS]", msg));
	socket.on("message_for_client", message=>{
		if (message=="auth") {
			socket.emit("auth", cookieMngr.getCookie("token") ?? "guest", window.localStorage.clientId_doNotShareWithThisOrYouWillBeHacked);
		};
	});
	socket.on("disconnect", r=>console.error("[WS] The WS is disconnected for reason: ", r, "😿"));
	
	/*socket.on("disconnect", r=>{
		app.toasts.show({
			type: "error",
			content: `Это тестовое уведомление\n\nПохоже, socket-сервер утерял с вами сервер. Нажмите на уведомление, чтобы попробовать подключиться снова\nПричина: ${r}`,
			onClick: (e, close)=>close(),
			onClose: ()=>app.io.connect(),
			duration: 60000
		});
	});*/
	
	socket.on("notification", app.functions.notificationToToast);
	
	if (window.app) window.app.io = socket;
	return socket;
};

app.createGateway.disconnect = function () {
	if (!app.io) return
	else return app.io.disconnect();
};
app.createGateway.connect = function () {
	if (!app.io) return
	else return app.io.connect();
};