const e = React.createElement;

//const root = ReactDOM.createRoot(document.querySelector("body"));

function rTest() {
	throw Error("Твой век прошел, тестовая функция");
	root.render(<h1>Hello World! :3</h1>);
};
rTest.z = function (stat) {
	if (!stat) stat = {liked: Math.floor(Math.random()*1000), disliked: Math.floor(Math.random()*1000)};
	return (
	<div className="app-min-rating">
		<button className="ratingbutton" onClick={console.log}>
			{stat.liked} #likes#
		</button>
		<button className="ratingbutton" onClick={console.log}>
			{stat.disliked} #unlikes#
		</button>
	</div>
	);
};
rTest.sss = async function () {
	return await import("/translatable_static/templates/helloworld.jsx");
};
rTest.o = async function (mipuPostId=3) {
	const inf = await app.f.get(`posts/${mipuPostId}`, null, async function (h, {json}) {
		return json.http.content;
	}, async function (e, {json, Refetched}) {
		return Object.assign(json.http.content, {
			author: {id: 0, name: "error", tag: "error"},
			content: json.http.content.unvaliable,
			rating: null
		});
	});
	
	let rating;
	if (inf.rating) rating = rTest.z(inf.rating);
	
	return (
	<div className="app-post">
		<span>@{inf.author.tag} - Created at {inf.created}</span>
		<p>{inf.content}</p>
		{rating}
	</div>
	);
};
// Ты пахож на ката хочу забрать тебя домой