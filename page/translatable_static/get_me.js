app.me = "guest";

app.headers = new Headers();
app.headers.set("Authorization", cookieMngr.getCookie("token") ? cookieMngr.getCookie("token") : "guest");

app.refreshHeaders = new Headers();
app.refreshHeaders.set("Authorization", "guest");
app.refreshHeaders.set("Refresh-Token", cookieMngr.getCookie("refresh_token") ? cookieMngr.getCookie("refresh_token") : "guest");

app.guestHeaders = new Headers();
app.guestHeaders.set("Authorization", "guest");

// Using client ID or generating a new
if (!window.localStorage.clientId_doNotShareWithThisOrYouWillBeHacked) {
	window.localStorage.setItem(
		"clientId_doNotShareWithThisOrYouWillBeHacked",
		new Date().toLocaleDateString()+"_"+generateAStringOfRandomSymbols(50, "01234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm")
	);
};
app.headers.set("Client-Id", window.localStorage.clientId_doNotShareWithThisOrYouWillBeHacked);
app.refreshHeaders.set("Client-Id", window.localStorage.clientId_doNotShareWithThisOrYouWillBeHacked);
app.guestHeaders.set("Client-Id", window.localStorage.clientId_doNotShareWithThisOrYouWillBeHacked);




app.apis = tryToReadJSON("#apis#");
if (app.isProxy) {
	Object.assign(app.apis, tryToReadJSON("#proxy_apis#"));
};

for (const key in app.apis) {
	let url = app.apis[key];
	if (url && url.includes('://localhost')) {
		app.apis[key] = url.replace(/localhost/g, document.location.hostname)
						.replace("http:", document.location.protocol); // На случай, если это HTTPs
		
	};
};

let responseOrder = [];
function passOrder(r) {
	responseOrder.forEach(x=>x(r));
	responseOrder = [];
};

// Основной доступ
let refreshDebouncing = false;
app.f = new BFetch(app.headers, async function(r, {json, text, bodyReader, abort}, retry) {
	return json ?? [bodyReader, abort];
}, async function(r, {failed, exception, json, methodType}, retry) {
	let code;
	if (failed) {
		//console.error(exception);
		code = navigator.onLine ? "host_error" : "no_connection";
	} else {
		//console.error(json.http.error ?? json.http.content ?? json.http.error_type);
		code = json.error_type ?? json;
		
		//if (Array.isArray(json.content)) code = json;
	};
	
	if (code==="access_token_not_actual" && !refreshDebouncing) {		
		refreshDebouncing = true;
		const result = await app.rf.get("refresh_token");
		if (typeof result.content == "object") {
			cookieMngr.setCookie("token", result.content.accessToken.token);
			cookieMngr.setCookie("refresh_token", result.content.refreshToken.token);
			getMe.update(undefined, result.content.accessToken.token, result.content.refreshToken.token);
			refreshDebouncing = false;
			passOrder(true);
			return await retry();
		} else {
			refreshDebouncing = false;
			passOrder(false);
			return code;
		};
	} else if (code==="access_token_not_actual" && refreshDebouncing) {
		const r = await new Promise(x=>{
			responseOrder.push(x);
		});
		if (r) return await retry()
		else return code;
	} else {
		if (methodType!="GET" && methodType!="OPTIONS") {
			app.functions.apiErrorToToast(code);
		};
		
		if (json && json.content && Array.isArray(json.content)) return json;
		return code;
	};
}, true, app.apis.api);

// Гостевой доступ, но с Refresh-токеном. Важен для автоматического сброса токена
app.rf = new BFetch(app.refreshHeaders, async function(r, {json}) {
	return json;
}, async function(r, {failed, exception, json}, retry) {
	if (failed) {
		return navigator.onLine ? "host_error" : "no_connection";
	} else {
		return json.error_type ?? json;
	};
}, true, app.apis.api);

// Гостевой доступ. Важен для авторизации, если основной доступ будет недоступным
app.gf = new BFetch(app.refreshHeaders, async function(r, {json}) {
	return json;
}, async function(r, {failed, exception, json}, retry) {
	if (failed) {
		return navigator.onLine ? "host_error" : "no_connection";
	} else {
		return json.error_type ?? json;
	};
}, true, app.apis.api);

async function getMe() {
	
	/*app.zzzzzzz_clientId_doNotShareWithThisOrYouWillBeHacked = app.functions.readLocalStorageKey("clientId_doNotShareWithThisOrYouWillBeHacked");
	`No, no, no. If I am russian, it isn't so I used Z. Z is the last letter`;
	if (!app.zzzzzzz_clientId_doNotShareWithThisOrYouWillBeHacked) {
		app.zzzzzzz_clientId_doNotShareWithThisOrYouWillBeHacked = app.functions.setLocalStorageKey(
			"clientId_doNotShareWithThisOrYouWillBeHacked",
			new Date().toLocaleDateString()+"_"+generateAStringOfRandomSymbols(50, "01234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm")
		);
	};
	app.headers.set("client_id", app.zzzzzzz_clientId_doNotShareWithThisOrYouWillBeHacked);
	app.refreshHeaders.set("client_id", app.zzzzzzz_clientId_doNotShareWithThisOrYouWillBeHacked);
	delete app.zzzzzzz_clientId_doNotShareWithThisOrYouWillBeHacked;*/

	if (app.authorizationFailed) delete app.authorizationFailed;
	const me = await app.f.get("self");
	if (typeof me == "object") { 
		app.me = me.content
		fetchEmojiPacks();
	} else if(me != "missing_authorization" && me != "guest_unvaliable") {
		app.authorizationFailed = true;
	} else {};
	app.createGateway();
	window.dispatchEvent(new CustomEvent("userUpdated", { detail: app.me, failed: app.authorizationFailed===true }));
};
async function fetchEmojiPacks() {
	const r = await app.f.get("emojipack");
	if (typeof r == "object") {
		app.emojipacks = r.content;
	} else { console.error(r) };
};
getMe.update = function(user, token, refreshtoken) {
	if (token) {
		app.createGateway.disconnect();
		app.headers.set("Authorization", !token ? cookieMngr.getCookie("token") : token);
		app.createGateway.connect();
	};
	if (refreshtoken) {
		app.refreshHeaders.set("Refresh-Token", !refreshtoken ? cookieMngr.getCookie("Refresh-Token") : refreshtoken);
	};
	
	if (user) {
		app.me = user;
		fetchEmojiPacks();
		window.dispatchEvent(new CustomEvent("userUpdated", { detail: user, failed: null }));
	};
};