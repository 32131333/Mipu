/*
	
	Этот скрипт написан наперекосяк, так как я впервые в жизни имею дело с этим React, так еще и Webpack
	Я бы лучше продолжал думать, зачем мне npm в веб разработке, но все-таки создать лучшее приложение я гатов, хоть и пройдет через мою жопу
	
*/


const module = {"228": "UwU", "dddd": "Я люблю тебя, но знаю, что мне лучше молчать. Поэтому ты никогда о этом не узнаешь. Если узнаешь... 🌟w🌟", "xxx": "Люблю твой милый несущный вид. Если узнаешь, не злись..."};

import "./components.jsx";
import "./imageCropper.jsx";
import "./contextmenu.jsx";
import "./modals.jsx";
import "./socketio_client.js";
import "./tooltip.jsx";
import "./toasts.jsx";
import "./processoverlay.jsx";

import languages from "./../static/languages.json";
module.langs = languages;

const getFileNameWithoutExtension = (filePath) => filePath.split('/').pop().split('.')[0];
function loadScripts() {
	const templatesContext = require.context("./templates", false, /\.(js|jsx)$/);

	const templatesArray = templatesContext.keys().map((fileName) => {
		const module = templatesContext(fileName);
		return { fileName, module };
	});

	const templates = {};
	templatesArray.forEach(x=>{templates[getFileNameWithoutExtension(x.fileName)]=x.module});
	return { templates, templatesArray };
};
function loadSVGs() {
	const svgs = {};
	const templatesContext = require.context("svg", false, /\.svg$/);

	templatesContext.keys().map((fileName) => {
		const module = templatesContext(fileName);
		return { fileName, module };
	}).forEach(a=>svgs[getFileNameWithoutExtension(a.fileName)] = a.module);
	window.app.___svgs = svgs;
	return svgs;
};


const { templates, templatesArray } = loadScripts();
loadSVGs();


import Nav from "./nav.jsx";

import {
	createBrowserRouter,
	RouterProvider,
	BrowserRouter,
	Outlet,
	Link,
	Form,
	redirect,
	useLocation
} from "react-router";
import {
	useState,
	useEffect,
	useRef,
	Fragment
} from "react";
import ReactDOM from "react-dom/client";
import React from "react";

function RootElem() {
	return (
		<React.StrictMode>
			<div className="root">
				<Outlet />
			</div>
			<Nav />
		</React.StrictMode>
	);
};


/*const Root = ReactDOM.createRoot(document.querySelector("body .root"));
Root.render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);

const mobileHeaderRoot = ReactDOM.createRoot(document.querySelector("body .mobile-header"));

mobileHeaderRoot.render(
	<React.StrictMode>
		<BrowserRouter>
			<Nav />
		</BrowserRouter>
	</React.StrictMode>
);*/


function SearchBar({ onCancel }) {
	const [text, setText] = useState("");
	const r = useRef(null);
	return <Form className="app-cm-d" method="get" action="/search">
		<div className="header-search">
			<input type="text" ref={r} defaultValue={text} onInput={(event)=>setText(event.target.value)} name="query" placeholder="#uncategorized.search#" />
			{(text!=="" || onCancel) && <button type="reset" onClick={()=>{setText("");r.current.value="";if (onCancel) { onCancel() } }} className="app-iconOnlyButton b"><app.components.react.FixedSVG className="alphaicon">{app.___svgs.x_1}</app.components.react.FixedSVG></button>}
			<button type="submit" className="app-iconOnlyButton b"><app.components.react.FixedSVG className="alphaicon">{app.___svgs.search}</app.components.react.FixedSVG></button>
		</div>
	</Form>;
};

function TopBar({ me, themeState, failed }) {
	const location = useLocation();
	const isMobile = app.reactstates.useIsMobileOrientation();
	const darkThemeByOS = app.reactstates.useLocalStorageValue("settings.darkthemebyos", true);

	const [ isMobileSearch, setIsMobileSearch ] = useState(false);

	const [notifyCount, setNotifyCount] = useState(0);
	useEffect(()=>{
		async function a() {
			await getMe();
			const resp = await app.f.get("notify");
			if (typeof resp == "object" && resp.content) {
				setNotifyCount(resp.content);
			};
			// Здесь типа должна быть логика для socket.io. Но как знаю я сам, я его не использую пока что, может быть и никак не воспользуюсь
		};
		a();
	}, []);


	const notifyButtonRef = useRef(null);
	const defaultHeaderActions = <>
		{isMobile && <button className="app-iconOnlyButton bbbbtn" onClick={()=>{ setIsMobileSearch(true) }}>
			<app.components.react.FixedSVG className="alphaicon d">{app.___svgs.search}</app.components.react.FixedSVG>
		</button>}
		{!darkThemeByOS && <button className="app-iconOnlyButton bbbbtn" onClick={()=>{
			let now = app.functions.readLocalStorageKey("theme");
			app.functions.setLocalStorageKey("theme", now == "dark" ? null : "dark" )
		}}><app.components.react.FixedSVG className="alphaicon d">{themeState != "dark" ? app.___svgs.sun : app.___svgs.moon}</app.components.react.FixedSVG></button> }
		{typeof me == "object" && !isMobile &&
			<button ref={notifyButtonRef} className="app-iconOnlyButton bbbbtn" onClick={function (event) {
				setNotifyCount(0);
				app.functions._notificationsContextMenu(notifyButtonRef.current);
			}}>{notifyCount > 0 && <span className="app-button-notify-count">{notifyCount}</span>}<app.components.react.FixedSVG className="alphaicon d">{app.___svgs.idle_bell}</app.components.react.FixedSVG></button>
		}
	</> ;

	if (isMobile && isMobileSearch) return <SearchBar onCancel={()=>{ setIsMobileSearch(false) }}/>;

	return <>
		<Link className="app-o-branding" to="/"><app.components.react.AlphaIcon src="/static/img/icon.png" /></Link>
		{/*<div className="header-nav">
			<Link className="nav-link" to="/helloworld">skibidi</Link>
		</div>*/}
		{!isMobile && <SearchBar />}
		{ location.pathname != "/login" && location.pathname != "/register" && (!isMobile || typeof me != "object") ?
		<div className="header-actions">
			{defaultHeaderActions}
			{
				me === null ?
				<div className="app-userAvatar" style={{backgroundColor: "gray", height: 40}}></div>
				:
				(typeof me == "object" ? <button className="app-button-transparency" onClick={event=>app.functions._userContextMenu(event.target)}><app.components.Avatar user={me}/></button> : ( failed ? <button className="btn btn-danger" onClick={()=>document.location.reload()}>#button.failedReloadPage#</button> : <Link className="btn app-button" to="/login" role="button">#button.login#</Link> ))
			}
		</div>
		:
		<div className="header-actions">
			{defaultHeaderActions}
		</div>
		}
	</>;
};

function App() {
	function RootElem() {
		const { me, failed } = app.reactstates.useInformationAboutMe();	
		const { useYourOwnBackground, type: themeState } = app.reactstates.useThemeInfo();
		
		return (
			<Fragment>
				{useYourOwnBackground && me && <app.components.UserBackgroundStyleSetting user={me}/>}
				<div className="header">
					<TopBar me={me} failed={failed} themeState={themeState} />
				</div>
				<div className="page-root">
					<div className="root">
						<Outlet />
					</div>
					<Nav/>
				</div>
			</Fragment>
		);
	};

	
	const router = createBrowserRouter([
		{
			element: <RootElem />,
			children: [
				/*{
					path: "/helloworld",
					element: <templates.helloworld.default />,
				},*/
				...templatesArray.map(function (x) {
					return {
						path: x.module.path !== "index" ? "/"+(x.module.path ?? getFileNameWithoutExtension(x.fileName)) : null,
						index: x.module.path == "index",
						element: <x.module.default />,
						errorElement: x.module.Error ? <x.module.Error /> : <templates.error.default />,
						loader: x.module.loader ? x.module.loader : null
					}
				}),
				{
					path: "*",
					element: <templates.error.default forcedErrorCode="404" />,
					loader: function ({params, request}) {
						if (params["*"].startsWith("@")) {
							return redirect("/user/"+params["*"]);
						} else return null;
					}
				}
			]
		}
	]);


	const st = false;
	const St = st ? React.StrictMode : Fragment;
	
	
	return (
		<St>
			<RouterProvider router={router} />
		</St>
	);
};


const Root = ReactDOM.createRoot(document.querySelector("body .container333"));
Root.render(<App/>);

app.functions.setThemeFromLocalStorage();
window.addEventListener('storageCustomEvent', function(event) {
	if (event.detail.key === "theme" || event.detail.key == "settings.darkthemebyos") {
		app.functions.setThemeFromLocalStorage();
	};
});

app.more = module;
export default module;