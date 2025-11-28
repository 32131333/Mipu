cookieMngr = {
	getCookie: function(cname) {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
			c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
			}
		};
		return "";
	},
	clear: function(){document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); }); },
	deleteCookie: (name)=>document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
	setCookie: function (name, value) {
		let expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 10); // Устанавливаем срок годности на 10 лет
		document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/;`;
	},
	setSessionCookie: function (name, value) { document.cookie = `${name}=${value}; path=/;`}
};