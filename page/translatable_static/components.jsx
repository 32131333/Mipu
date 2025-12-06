/*const { useState, useEffect, useRef, forwardRef, useMemo, useCallback } = React;
const { Link } = ReactRouterDOM;*/
import { useState, useEffect, useRef, forwardRef, useMemo, useCallback, Fragment, forceUpdate, createContext, useContext } from "react";
import React from "react";
import { Link } from "react-router";

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from "remark-breaks";

import Picker from "@emoji-mart/react";
//import { usePopper } from "react-popper";
import { useFloating, shift, flip, offset } from "@floating-ui/react";

import { createEditor, Transforms, Editor, Text, Range, Element as SlateElement, Path } from "slate";
import { Slate, Editable, withReact, useSlate, useSelected, useSlateStatic, useReadOnly, ReactEditor } from "slate-react";
import isKeyHotkey from "is-hotkey";

import { LazyLoadImage } from 'react-lazy-load-image-component';

import { useImmer } from "use-immer";



/*import MipuAdvPost from "./miposts.jsx";
app.MipuAdvPost = MipuAdvPost;*/


app.globalPageSize = 15; // Общее количество результатов в поиске

app.components = {}
app.components.react = {};

app.reactstates = {};
app.reactstates.useIsMobileOrientation = function () {
	const width = 700;
	const [result, setResult] = useState(window.innerWidth <= width);
	useEffect(()=>{
		function update() {
			setResult(window.innerWidth <= width);
		};
		window.addEventListener("resize", update);
		return ()=>window.removeEventListener("resize", update);
	}, []);
	return result;
};

app.reactstates.useCachedState = function(key, value) {
	const [ fromCache, setFromCache ] = useState("RCTCHCHDSTATE_"+key in window.sessionStorage);
	const [ result, setResult ] = useState(null);
	
	function set(value) {
		window.sessionStorage.setItem("RCTCHCHDSTATE_"+key, JSON.stringify(value));
		setFromCache(null);
		setResult(value);
	};
	function destroyCache() {
		window.sessionStorage.removeItem("RCTCHCHDSTATE_"+key);
		setResult(value);
		setFromCache(false);
	};
	
	if (fromCache) {
		setResult(window.sessionStorage.getItem("RCTCHCHDSTATE_"+key));
	} else {
		setResult(value);
	};
	
	
	return [ result, set, fromCache, destroyCache ];
};

app.reactstates.useLocalStorageValue = function (key, defaultValue) {
	const [state, setState] = useState(app.functions.readLocalStorageKey(key, defaultValue));
	useEffect(function () {
		function check(event) {
			// window.dispatchEvent(new CustomEvent("storageCustomEvent", {detail: {key, value, action, oldValue}}));
			if (event.detail.key == key) {
				setState(defaultValue === undefined ? event.detail.value : (event.detail.value!=null ? event.detail.value : defaultValue));
			};
		};
		window.addEventListener("storageCustomEvent", check);
		return () => window.removeEventListener("storageCustomEvent", check);
	}, []);
	return state;
};

app.reactstates.makeTopBarTranparency = function () {
	useEffect(function () {
		const container = document.querySelector("body > .container333 > .page-root");
		
		container.classList.add("mobileTransparencyHeader");
		return () => container.classList.remove("mobileTransparencyHeader");
	}, []);
};

app.reactstates.useThemeInfo = function () {
	const [state, setState] = useImmer({type: "white"});
	useEffect(function () {
		const style = document.head.querySelector(".app-i-style");
		function check() {
			if (style.disabled) {
				setState({type: "white"})
			} else {
				setState({type: style.href.includes("black") ? "dark" : "white"});
			};
			setState(state=>{
				state.useYourOwnBackground = app.functions.readLocalStorageKey("settings.u_m_a_t_b_e");
				state.disallowAutomaticallyChange = app.functions.readLocalStorageKey("settings.disallow_a_c");
				state.forced = !!style.getAttribute("forced")
			});
		};
		const observer = new MutationObserver(check);
		observer.observe(style, {attributes: true});
		window.addEventListener("storageCustomEvent", check);
		window.addEventListener("userUpdated", check);
		
		check();
		
		return ()=>{
			observer.disconnect();
			window.removeEventListener("storageCustomEvent", check)
			window.removeEventListener("userUpdated", check);
		};
	}, []);
	return state;
};

app.components.WebpageTitle = function (val) {
	let title = val.children;
	if (Array.isArray(title)) title = title.map(x=> typeof x == "object" ? JSON.stringify(x) : String(x) ).join("");
	
	const icon = val.icon;
	const appITitle = document.head.querySelector(".app-i-title");
	const appIIcon = document.head.querySelector(".app-i-icon");
	useEffect(function () {
		const Default = [appITitle.text, appIIcon.href];
		if (title) appITitle.text = `${title} | ${Default[0]}`;
		if (icon) appIIcon.href = icon;
		return function () {
			appITitle.text = Default[0];
			appIIcon.href = Default[1];
		};
	});
	return null;
};

app.components.ForcedThemeChangedInfo = function () {
	useEffect(function (){
		const style = document.head.querySelector(".app-i-style");
		app.components.ForcedThemeChangedInfo.count++;
		style.setAttribute("forced", "true");
		return function () {
			app.components.ForcedThemeChangedInfo.count--;
			if (app.components.ForcedThemeChangedInfo.count <= 0) {
				style.removeAttribute("forced");
			};
		};
	}, []);
	return null;
};
app.components.ForcedThemeChangedInfo.count = 0;

app.reactstates.useInformationAboutMe = function () {
	const [result, setResult] = useState(app.me);
	const [failed, setFailed] = useState(false);
	useEffect(function () {
		function handler(event) {
			setResult(event.detail);
			setFailed(app.authorizationFailed===true);
		};
		window.addEventListener("userUpdated", handler);
		return ()=>window.removeEventListener("userUpdated", handler);
	}, []);
	
	return {me: result, failed};
};

app.reactstates.useAsyncLoader = function (promise) {
	const [result, setResult] = useImmer(null);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	
	useEffect(function () {
		promise.then(x=>{
			setResult(x);
		}).catch(err=>{
			setFailed(true);
			setResult(err);
		}).finally(()=>setLoading(false));
	}, []);
	return {result, loading, failed, updateResult: setResult};
};

app.reactstates.useFetchUser = function (id, throwError=false) {
	const [user, setUser] = useImmer(null);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [absolutelyFailed, setAbsolutelyFailed] = useState(false);
	
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const data = await app.functions.fetchUser(id);
				if (data===false && !throwError) { setAbsolutelyFailed(true);setFailed(false) }
				else if (data===false && throwError) throw new Error();
				
				if (data.unvaliable) {
					//setFailed(data.unvaliable);
				};
				setUser(data);
			} catch (err) {
				setFailed(false);
			} finally {
				setLoading(false);
			};
        };

        fetchData();
    }, [id, throwError]);

    return { user, loading, failed, absolutelyFailed, updateData: setUser };
};


app.reactstates.useListen = function (contentType, contentId) {
	const roomName = useRef(null);
	useEffect(function () {
		if (!contentId || !contentType || !app.io) {
			return;
		};
		
		const io = app.io;
		function connect() {
			io.emit("listen", {type: contentType, id: contentId});
		};
		
		function handleDisconnected(room, reason) {
			if (room==roomName.current && reason=="timeout") connect();
		};
		function handleConnected(room) {
			roomName.current = room;
		};
	
		io.on("full_connect", connect); // Если сокет по какой-либо причине переподключился и клиент прошел этапы аутентификации
		io.once("listen_success", handleConnected); // Мы запоминаем, к какой комнате мы подключились
		io.on("listen_cancelled", handleDisconnected); // Заново подключаемся, если мы были отключены по причине таймаута
		
		connect();
		return ()=>{
			io.removeListener("full_connect", connect);
			io.removeListener("listen_success", handleConnected);
			io.removeListener("listen_cancelled", handleDisconnected);
			io.emit("unlisten", {type: contentType, id: contentId});
		};
	}, [contentId, contentType]);
};

const generateClassId = ()=>`btn${Math.floor(Math.random()*1000000)}`;

app.components.react.CheckBox = ({ checked, id, label, onInput, name }) => {
	const [isChecked, setIsChecked] = useState(checked ?? false);

	const handleChange = (event) => {
		const checked = event.target.checked;
		setIsChecked(checked);
		if (onInput) onInput(event, checked);
	};

	return (
		<div className="app-checkbox">
			<label className="switch">
				<input
					id={id}
					name={name}
					type="checkbox"
					checked={isChecked}
					onChange={handleChange}
				/>
				<span className="slider"></span>
			</label>
			<span> {label}</span>
		</div>
	);
};

app.components.react.ColorPicker = ({label, onInput, defaultValue, ...val}) => {
	return <div {...val} className="app-colorpicker"> 
		<input type="color" id="color0" name="color0" defaultValue={defaultValue} onInput={onInput}/> 
		<label htmlFor="color0">{label}</label>
	</div>
};

app.components.react.RangeInput = ({label, onInput, defaultValue, min, max, ...val}) => {
	/*return <label htmlFor="r" id={id} {...val}>
		<input name="r" id="r" type="range" min={min} max={max} onInput={onInput} defaultValue={defaultValue} />
		<a>{label}</a>
	</label>*/
	return <div {...val} className="app-rangeinput">
		<input name="r" id="r" type="range" min={min} max={max} onInput={onInput} defaultValue={defaultValue} />
		<label htmlFor="r">{label}</label>
	</div>
};

app.components.react.CoolTextInput = ({value: v, ...val}) => {
	const [value, setValue] = useState(val.defaultValue || '');
	const [focused, setFocused] = useState(false);
	useEffect(function () { 
		if (v) { 
			setValue(v);
			if (ref.current.textContent!=v) ref.current.textContent = v;
		};
	}, [v]);
	
	
	const ref = useRef(null);
	
	function handleInput(e) {
		if (val.onKeyDown) return val.onKeyDown(e);
		if (e.key === 'Tab' || e.key === 'Enter') {
			e.preventDefault();
		};
	};
	function handleContentChange(e) {
		if (val.onInput) val.onInput(e);
		setValue(e.target.textContent);
	};
	function handleOnFocus() { 
		setFocused(true); 
	}; 
	function handleBlur() { 
		setFocused(false); 
	}; 
	
	function handleClickFocus() {
		ref.current.focus()
	};
	
	const {label, ...rest} = val;
	return (
		<div style={{ display: "-webkit-inline-box", position: "relative" }}>
			<span onClick={handleClickFocus}>{val.label}</span>
			<div
				{...rest}
				contentEditable
				onKeyDown={handleInput}
				onInput={handleContentChange}
				onFocus={handleOnFocus}
				onBlur={handleBlur}
				style={{
					outline: "none"
				}}
				ref={ref}
			>
				{val.defaultValue}
			</div>
			{value === "" && !focused ? <span style={{filter: "opacity(0.5)"}} onClick={handleClickFocus}>{val.placeholder}</span> : null}
		</div>
	);
};

app.components.react.TextInput = forwardRef(function (val, ref) {
	const id = val.id ? val.id : generateClassId();
	return (
		<div className="form-group">
			{val.label !== null ? <label htmlFor={id}>{val.title ?? val.label ?? val.placeholder}</label> : null}
			<input {...val} ref={ref} className="form-control" id={id} />
		</div>
	);
});

app.components.react.UnderRouterLink = function (val) {
	return (
		<a {...val} href={val.to ?? val.href} to={undefined} onClick={(event)=>{
			event.preventDefault();
			if (document.location.href.endsWith(val.href)) return;
			window.history.pushState(val.state ?? {}, '', val.to);
			window.dispatchEvent(new PopStateEvent("popstate"));
			
			if (val.onClick) val.onClick(event);
		}}/>
	);
};

app.components.react.AlphaIcon = (val) => {
	return (
		<div {...val} style={{maskImage: "url("+(val.href ?? val.src ?? val.image ?? val.children)+")", ...(val.style ? val.style : {})}} className={`alphacoloredicon${val.className ? " "+val.className : ""}`}></div>
	);
};
app.components.AlphaIcon = function (classNames, src) {
	const elem = document.createElement("div");
	elem.classList.add("alphacoloredicon");
	classNames.forEach(x=>elem.classList.add(x));
	elem.style.maskImage = "url("+src+")";
	return elem;
};

/*app.components.react.InnerHTMLText = (val, content) {
	return <span {...val} dangerouslySetInnerHTML={{__html: content}}/>
};*/

app.components.react.FixedSVG = (val) => {
	const ch = val.children;
	return <div {...val} children={null} className={`fixsvg${val.className ? " "+val.className : ""}`} dangerouslySetInnerHTML={{__html: ch}} />;
};

app.components.ErrorAlert = function (val) {
	if (!val.text && !val.children) return null;
	return <span style={{color: "var(--redColor)"}}><img className="emoji" src="/static/svg/x.svg"/> {val.text ?? val.children}</span>;
};
app.components.WarnAlert = function (val) {
	if (!val.text && !val.children) return null;
	return <span style={{color: "var(--yellowColor)"}}><img className="emoji" src="/static/svg/warning.svg"/> {val.text ?? val.children}</span>;
};

app.components.WarningAlert = function (val) {
	if (!val.text && !val.children) return null;
	return <div className="app-structure-warning warn app-t-dontattach">
		<app.components.react.FixedSVG className="d">{app.___svgs.warning}</app.components.react.FixedSVG>
		<div>
			<p>{val.text || val.children}</p>
			{val.onClick && <app.components.ProcessButton onClick={val.onClick} className="btn app-button">{val.buttonText || "#button.fix#"}</app.components.ProcessButton>}
		</div>
	</div>;
};

app.components.Info = function ({svg, image, children, onClick, color, borderColor, buttonText}) {
	if (!children) return null;
	return <div className="app-structure-warning app-t-dontattach" style={{ borderColor, backgroundColor: color }}>
		{svg && <app.components.react.FixedSVG className="d">{svg}</app.components.react.FixedSVG>}
		{image && <img src={image}/>}
		<div>
			<p>{children}</p>
			{onClick && <app.components.ProcessButton onClick={onClick} className="btn app-button">{buttonText || "#button.fix#"}</app.components.ProcessButton>}
		</div>
	</div>;
};
app.components.Success = (val)=><app.components.Info {...val} svg={app.___svgs.checkmark_1} borderColor="rgb(0 255 0 / 0.1)" color="rgba(0, 255, 0, 0.1)"/>

/*app.components.avatar = function (ownerId, avatarObject, isUnvaliable) {
	avatarObject = mergeObjects({
		media: null,
		type: "media",
		options: {
			borderRadiusType: 1
		},
		defaultUrl: "/static/img/more/389b1878.png"
	}, avatarObject);
	
	let mediaUrl = avatarObject.defaultUrl;
	if (avatarObject.media!=null&&avatarObject.media.startsWith("data")) mediaUrl = avatarObject.media
	else if (avatarObject.media!=null) mediaUrl = app.apis.mediastorage+String(ownerId)+"/"+avatarObject.media;
	
	return (<img className={isUnvaliable ? "app-userAvatar app-nonAvaliable" : "app-userAvatar"} id={"btype"+String(avatarObject.options.borderRadiusType)} src={mediaUrl} />);
};
app.components.Avatar = function ({userId, userAvatar, user, userUnvaliable}) {
	if (user) return app.components.avatar(user.id, user.avatar, user.unvaliable)
	else return app.components.avatar(userId, userAvatar, userUnvaliable);
};*/
app.components.Avatar = function ({userId, userAvatar, user, userUnvaliable, scale, style}) {
	if (user) {
		userId = user.id;
		userAvatar = user.avatar;
	};
	const avatarObject = mergeObjects({
		media: null,
		type: "media",
		options: {
			borderRadiusType: 1
		},
		/*decoration: {
			behind: null,
			front: userId === 1 || userId === 3 ? (userId === 1 ? "/static/img/hand1.png" : "/static/img/fallinlove.png") : "/static/img/firemipu.png"
		},*/
		defaultUrl: "/static/img/more/389b1878.png"
	}, userAvatar);
	
	const styles = scale ? {...style, marginInline: `${(scale - 1) * 0.5}em`, transform: `scale(${scale})`, verticalAlign: "-0.1em"} : style;

	let mediaUrl = avatarObject.defaultUrl;
	if (avatarObject.media!=null&&avatarObject.media.startsWith("data")) mediaUrl = avatarObject.media
	else if (avatarObject.media!=null) mediaUrl = app.apis.mediastorage+String(userId)+"/"+avatarObject.media;
		
	return <div className={"app-userAvatar"} style={styles}>
		{avatarObject.decoration && avatarObject.decoration.behind && <img className="decor" src={avatarObject.decoration.behind}/>}
		<img className="avatar" id={"btype"+String(avatarObject.options.borderRadiusType)} src={mediaUrl} />
		{avatarObject.decoration && avatarObject.decoration.front && <img className="decor" src={avatarObject.decoration.front}/>}
	</div>
};

app.components.Badges = function ({user, badges}) {
	if (!badges && !user) return null;
	if (!badges) badges = user.badges;
	
	return <Fragment>
		{badges.filter(x=>x.type===1&&app.components.Badges.thatIKnow.hasOwnProperty(x.id)).map(x=>{
			// Раньше здесь было различие между alpha и без alpha, но потом смысл просто стерся
			let tooltip = app.components.Badges.thatIKnow.tooltip[x.id];
			
			return <app.components.react.AlphaIcon tooltip={tooltip} className="emoji" src={app.components.Badges.thatIKnow[x.id]} alt={x.id} key={x.id}/>
		})}
	</Fragment>;
};
app.components.Badges.thatIKnow = {
	"official": "/static/svg/fallingstar.svg",
	"verified": "/static/svg/checkmark_1.svg",
	"unvaliable": "/static/svg/x_1.svg"
};
app.components.Badges.thatIKnow.tooltip = {
	"official": "#badges.official#",
	"verified": "#badges.verified#",
	"unvaliable": "#badges.unvaliable#"
};

app.components.SubButton = function ({modify, user}) {
	const processSubscribe = /*processButton(*/async function (event) {
		if (user.me.sub) {
			const allow = await app.functions.youReallyWantToDo(null, "unsub");
			if (allow) {
				const response = await app.f.remove(`sub/${user.id}`);
				modify(user=>{
					user.me = response.content;
					user.subs_count--;
				});
				//return NaN;
			};
		} else {
			const response = await app.f.patch(`sub/${user.id}`, {notify: true});
			if (typeof response.content == "object") {
				modify(user=>{
					user.me = response.content;
					user.subs_count++;
				});
				//return NaN;
			};
		};
		return "ignore";
	}/*)*/;
	if (!user.me) return null
	else {
		/*return user.me.sub ?
				<button disabled={!modify} className="btn app-button" onClick={processSubscribe}>#button.youresubscribed#</button>
				:
				<button disabled={!modify} className="btn app-button-sub" onClick={processSubscribe}>#button.subscribe#</button>*/
		return <app.components.ProcessButton onClick={processSubscribe} disabled={!modify} className={user.me.sub ? "btn app-button" : "btn app-button-sub"}>
			{user.me.sub ? "#button.youresubscribed#" : "#button.subscribe#"}
		</app.components.ProcessButton>
	};
};

app.components.Username = function ({user, href}) {
	if (!user) return null;
	const { name, tag, badges } = user;
	
	if (href) return <app.components.react.UnderRouterLink className={"app-usertag app-dontModifyLink" + (user.unvaliable ? "app-nonAvaliable" : "")} to={`/user/${user.id}`}>{name ? name : "@"+(tag || "-")} <app.components.Badges badges={badges}/></app.components.react.UnderRouterLink>
	else return <span className={"app-usertag" + (user.unvaliable ? "app-nonAvaliable" : "")}>{name ? name : "@"+(tag || "-")} <app.components.Badges badges={badges}/></span>;
};

app.components.Username.Extended = function ({user, linear=true}) {
	if (!user) return null;
	const { name, tag, badges } = user;
	
	if (name) { 
		return (
			<Fragment>
				<span className={"app-usertag" + (user.unvaliable ? "app-nonAvaliable" : "")}>{name} <app.components.Badges badges={badges}/></span>
				{linear ? " " : <br />}
				<b className={"app-usertag" + (user.unvaliable ? "app-nonAvaliable" : "")}>@{tag ?? "-"}</b>
			</Fragment>
		);
	} else {
		return <span className={"app-usertag" + (user.unvaliable ? "app-nonAvaliable" : "")}>@{tag ?? "-"} <app.components.Badges badges={badges}/></span>
	};
};
app.components.Username.Extended.allowRedirect = function (props) {
	if (!props.user && !props.children) return <>#uncategorized.deleteduser#</>;
	const { tag, id } = props.user ?? props.children;
	
	if (tag || id) {
		return <app.components.react.UnderRouterLink style={{color: "unset"}} to={`/user/${tag ? "@"+tag : id}`}><app.components.Username.Extended {...props} /></app.components.react.UnderRouterLink>;
	} else return <>#uncategorized.deleteduser#</>;
};

app.components.UserBackgroundStyleSetting = function ({user, background}) {
	const { type, disallowAutomaticallyChange } = app.reactstates.useThemeInfo();
	background = background ? background : (user ? user.background : {});
	if (background && background.style) {
		let styles = background.style.split(", ").slice(1);
		let isTooDark = brightness.isTooDark(averageColor(styles)) && type!=="dark" && !disallowAutomaticallyChange;
		
		return <Fragment>
			{!isTooDark ? null : <link rel="stylesheet" href="/static/styles/theme_black.css" />}
			{!isTooDark ? null : <app.components.ForcedThemeChangedInfo />}
			<style className="app-u-background">
			{`
			/* A react component. Don't try to change information here */
			body {
				background: linear-gradient(${background.style});
			}
			`}
			</style>
		</Fragment>
	} else { return null };
};

app.components.forceDarkTheme = function () {
	const { type, disallowAutomaticallyChange } = app.reactstates.useThemeInfo();
	if (disallowAutomaticallyChange) return;
	return <>
		<app.components.ForcedThemeChangedInfo />
		<link rel="stylesheet" href="/static/styles/theme_black.css" />
	</>;
};

app.components.LoadingPage = function () {
	return (
		<div>
			<h1><div className="fixsvg" dangerouslySetInnerHTML={{__html: app.___svgs.loading}}/></h1>
			<style>
			{`
			body > .container333 > .page-root > .root {
				display: flex;
				align-items: center;
				align-content: center;
				width: 100%;
				height: 100%;
				justify-content: center;
			}
			`}
			</style>
		</div>
	);
};
app.components.Loading = function ({children}) {
	return <div className="loadingLoadingLoading">
		<h4><app.components.react.FixedSVG>{app.___svgs.loading}</app.components.react.FixedSVG> {children ? children : "#uncategorized.loading#"}</h4>
		<style>
		{`
		.loadingLoadingLoading {
			width: 100%;
			text-align: center;
			padding: 10px;
		}
		.loadingLoadingLoading * {
			line-height: 0;
			margin: 0;
			padding: 0;
		}
		`}
		</style>
	</div>
};

/*app.components.selfButton = function () {
	const me = app.me;
	
	let returnable;
	if (typeof me == "object") {
		document.querySelector("body > .page-root > .mobile-header").hidden = false;
		returnable = <button name="selfbutton" className="app-button-transparency">{app.components.avatar(me.id, me.avatar)}</button>
	} else if(app.authorizationFailed) {
		document.querySelector("body > .page-root > .mobile-header").hidden = true;
		returnable = <button className="btn btn-danger" onClick={()=>document.location.reload()}>#button.failedReloadPage#</button>;
	} else {
		document.querySelector("body > .page-root > .mobile-header").hidden = true;
		returnable = <a className="btn btn-default" href="#" role="button">#button.login#</a>;
	};

	app.components.selfButton.root.render(returnable);
};
app.components.selfButton.root = ReactDOM.createRoot(document.querySelector("body .header .header-actions"));*/
app.functions = {};

app.functions.getReactDOMProps = function (element) {
	let keys = Object.keys(element);
	let keyName;
	
	if (keyName = keys.filter(x=>x.startsWith("__reactProps"))[0]) {
		return element[keyName];
	};
	return null;
};

app.functions.isDarkThemeByOS = function () {
	return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
};

app.functions.setThemeFromLocalStorage = function () {
	const value = window.localStorage.getItem("theme");
	const useDarkThemeByOS = app.functions.readLocalStorageKey("settings.darkthemebyos", true);
	if (value || (useDarkThemeByOS && app.functions.isDarkThemeByOS())) {
		if (value==="dark" || (useDarkThemeByOS && app.functions.isDarkThemeByOS())) {
			document.head.querySelector(".app-i-style").href = "/static/styles/theme_black.css";
		} else {
			
		};
	} else {
		document.head.querySelector(".app-i-style").href = null;
	};
	document.head.querySelector(".app-i-style").disabled = !(value || (useDarkThemeByOS && app.functions.isDarkThemeByOS()));
};

app.functions.microDesc = function (text, cropToLength) {
	cropToLength = cropToLength ?? 100;
	
	let x;
	if(typeof text=="string"&&text.length>0) {
		x = text.split("\n")[0];
		
		x = x.replaceAll(app.components.TextInputOne.syntaxRules[0].regex, "#uncategorized.attachment#");
		
		
		if (x.length>cropToLength) x = x.slice(0, cropToLength)+"...";
	} else { x = "🥴 #page.user.nodescription#" };
	return x;
};


app.components.Content = function (val) {
	if (!val.children) return null;

	const compressTo = val.compressTo ? (isNaN(val.compressTo) ? 1 : val.compressTo) : 8;
	const [ showFull, setShowMore ] = useState(!compressTo || val.showFullDefaultly);
	
	let cut = false;
	if (compressTo) {
		const a = val.children.split("\n");
		if (a.length > compressTo) cut = true;
	};
	
	let endText = compressTo && !showFull ? (val.children.split("\n").slice(0, compressTo).join("\n"))+(cut ? "..." : "") : val.children; /*app.components.Content.processText(
		compressTo && !showFull ? (val.children.split("\n").slice(0, compressTo).join("\n"))+(cut ? "..." : "") : val.children
	);*/
	endText = endText
		.replace(/\n/gi, "&nbsp; \n")
		.replace(/```[\s\S]*?```|`[^`]*`/g, (match)=>match.replaceAll("&nbsp; \n", "\n"))
		.replaceAll("```&nbsp; \n", "```\n")
		.replaceAll("|&nbsp; \n", "|\n")
		.replace(/^((\|[\s\S]*)\|)\n[^\|]/gi, (match,table)=>table.slice(0, table.length-2)+"\n\n"+match.slice(table.length))
		.replaceAll("---&nbsp; \n", "---\n")
		.replaceAll("***&nbsp; \n", "***\n")
		.replace(/(\d\. |>|\- |\* ).*(&nbsp; \n){2}/gi, (...a)=>a[0].slice(0, a[0].length-a[2].length*2)+"\n\n&nbsp; \n");

	const textComponents = app.components.Content.textComponents; // Возможно, это исправит проблему с ререндером всего содержимого

	return <app.components.Content.Props value={val}>
		<div className={`contentify${app.components.Content.isOnlyEmojis(val.children) ? " onlyEmojis" : ""}`}>
			<Markdown
				urlTransform={app.functions.parseUnknownURL}
				remarkPlugins={[remarkGfm, remarkBreaks]}
				components={{
					...textComponents,
					a(props) {
						return <a {...props} onClick={function (e) {
								e.preventDefault();
								if (props.onClick) props.onClick(e);
								if (props.href) app.functions.youReallyWantToOpenLink(props.href);
							}
						}/>
					}
				}}
			>{endText}</Markdown>
			{
				cut &&
				(
					(!showFull && !val.hideShowMoreButton)
					||
					(showFull && val.showCollapseButton)
				)
				&&
				<span className="app-clickableText" onClick={()=>setShowMore(a=>!a)}>{showFull ? "#button.collapse#" : "#button.showmore#"}</span>
			}
		</div>
	</app.components.Content.Props>;
};
app.components.Content.Props = createContext(null);

app.components.Content.textComponents = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'span', 'blockquote'].reduce((acc, tag) => {
	acc[tag] = ({ children, ...props }) => {
		return React.createElement(tag, props, app.components.Content.preparseContent(children, {}));
	};
	return acc;
}, {});

app.components.Content.processText = function (text) {
	// помогите мне. шо это такое????
	// Ради этого я даже использовал пробел с нулевой шириной
	
	throw Error("Пожалуйста, не смотрите на мои мучения, эта функция какашка");
	
	const lines = text.replace(/\n/gi, "&nbsp; \n");
	return lines.map((x,i)=>{
		const next = lines[i+1];
		const last = lines[i-1];
		if (x.trim()=="") {
			if (typeof next === "string" && next.trim() !== "" && /[\#\>\-]/.exec(next.trim()[0]) && !(/^\d+\.$/.exec(next.trim().split(" ")[0]))) {
				if (typeof last === "string" && last.trim() !== "") return "\\\n​"
				else return "​";
			} else if (typeof last === "string" && last.trim() !== "" && /[\#\>\-]/.exec(last.trim()[0]) && !(/^\d+\.$/.exec(last.trim().split(" ")[0]))) return ""
			else return "\\";
		} else {
			if (
				!(/[\#\>\-]/.exec(x.trim()[0]))
				&&
				(typeof next === "string" && next.trim() !== "" && !(/[\#\>\-]/.exec(next.trim()[0])) && !(/^\d+\.$/.exec(next.trim().split(" ")[0])))
			) return x+"\\"
			else return x;
		};
	}).join("\n");
};
app.components.Content.isOnlyEmojis = function (text) {
	return app._emoji.onlyEmojis.test(text) && isNaN(text);
};
app.components.Content.preparseContent = function (children, props) {
	function process(text) {
		const regexp = new RegExp("("+app.components.Content.preparseContent.syntax
			.map(x=>x[0].source)
			.map((x, index)=>{
				return x + (app.components.Content.preparseContent.syntax.length-1!=index ? "|" : "")
			})
			.join("")
		+")", "g");
		if (typeof text == "string") {
			return text.split(regexp).map(function (x, index) {
				let a = app.components.Content.preparseContent.syntax.map(b=>b[0].test(x) && b[1]);
				for (const b of a) {
					//if (a) return <Component text={a} key={index}/>
					if (b) return React.createElement(b, {key: index/*, fromContent: props.fromContent*/}, x); 
				};
				return x;
			});
		} else if (Array.isArray(text)) {
			return text.map(process);
		};
		
		if (React.isValidElement(text) && text.props.children) {
			return React.cloneElement(text, {
				...text.props,
				children: process(text.props.children)
			});
		};
		
		
		
		return text;
	};
	return process(children);
};
app.components.Content.preparseContent.syntax = [
	[/@[A-Za-z0-9\-_А-Яа-я]+/g, function ({children}) { 
		//<app.components.Mention/>
		//return <span style={{color: "red"}}>{children}</span>;
		return <app.components.Mention symbol="@">{children.slice(1)}</app.components.Mention>
	}],
	[/#[A-Za-z0-9\-_А-Яа-я]+/g, function ({children}) {
		return <app.components.react.UnderRouterLink to={`/search?query=${children}`}>{children}</app.components.react.UnderRouterLink>
	}],
	[/\$\[.+\]/g, function ({children/*, fromContent: content*/}) {
		const [failed, setFailed] = useState(null);
		const { fromContent: content } = useContext(app.components.Content.Props);
		
		let a;
		if (!failed) {
			try {
				a = JSON.parse(children.slice(1));
			} catch(e) {
				setFailed(e);
			};
		};
		
		if (!failed) return <app.components.Gallery medias={a} content={content}/>
		else return children;
	}]
];


app.components.Gallery = function ({ medias, content, children, onIndexChange }) {
	// Content - original content
	if (children) medias = children;
	if (!medias || !Array.isArray(medias)) return null;
	if (medias.length <= 0) return null;
	
	/*
	medias = [
		"imageUrl",
		{object} (for example: {"id": "share","contentId": 129,"structure": "post"})
	];
	*/
	
	const [page, setPage] = useState(0);
	useEffect(function () {
		onIndexChange?.({index: page, length: medias.length});
	}, [page, onIndexChange])
	useEffect(function () {
		if (page > medias.length-1 && page!=0) setPage(medias.length-1)
		else if (page < 0 || (medias.length==0 && page!=0)) setPage(0);
	}, [medias, page]);
	
	function processNext(e) {
		setPage(page+1);
	};	
	function processBack(e) {
		setPage(page-1);
	};
	
	let now = medias[page];
	let Content = app.components.Gallery.Objects.unknown;
	if (now && now != undefined && typeof now == "object" && now.id in app.components.Gallery.Objects) {
		now = {...now, fromContent: content};
		Content = app.components.Gallery.Objects[now.id];
	};
	return <div className={(typeof now != "string" && now != undefined && now.id != "image") ? "app-structure-postgallery" : "app-structure-postgallery isImage"}>
		{ medias.length != 1 &&
		<>
			<button onClick={processBack} disabled={page==0} id="back" className="app-iconOnlyButton b"><app.components.react.FixedSVG className="alphaicon fill">{app.___svgs.back}</app.components.react.FixedSVG></button>
			<button onClick={processNext} disabled={page>=medias.length-1} id="next" className="app-iconOnlyButton b"><app.components.react.FixedSVG className="alphaicon fill">{app.___svgs.next}</app.components.react.FixedSVG></button>
		</>
		}
		<div id="root">
			{typeof now == "string" ?
				<img src={now}/>
			:
				<Content key={page}>{now}</Content>
			}
		</div>
	</div>;
};

app.components.Gallery.Objects = {
	"unknown": function UnknownContent({children}) {
		return <>Unknown content. Maybe you using a outdated version of app</>
	},
	"image": function ImageContent({children}) {
		let url = children.url;
		if (url.startsWith("/")) {
			var a = url.split("/");
			if (a[2]) url = app.apis.mediastorage + url
			else if (children.fromContent && children.fromContent.author) url = app.apis.mediastorage + children.fromContent.author.id + "/" + a[1];
		} else {
			url = app.functions.parseUnknownURL(url, "image");
		};
		
		return <LazyLoadImage
			alt="Image"
			placeholder=<div style={{display: "flex", alignContent: "center", alignText: "center", alignItems: "center"}}><app.components.Loading /></div>
			src={url}
			/>
	},
	"video": function VideoContent({children}) {
		let url = children.url;
		if (url.startsWith("/")) {
			var a = url.split("/");
			if (a[2]) url = app.apis.mediastorage + url
			else if (children.fromContent && children.fromContent.author) url = app.apis.mediastorage + children.fromContent.author.id + "/" + a[1];
		} else {
			url = app.functions.parseUnknownURL(url, "image");
		};

		return <>
			<p>Test component</p>
			<video controls src={url}/>
		</>;
	},
	"share": function SharedContent({children}) {
		if (children.fromContent && (children.fromContent.id == children.contentId || children.fromContent.micro)) return <blockquote><span><app.components.react.FixedSVG className="alphaicon fill a">{app.___svgs.next}</app.components.react.FixedSVG> #uncategorized.authorSharingThisUnvaliable#</span></blockquote>;
		
		const iKnowWhatIsThis = {"post": ["posts", app.structures.Post]};
		const whatIsThis = children.structure in iKnowWhatIsThis ? iKnowWhatIsThis[children.structure] : null;
		
		function Result({children}) {
			return <blockquote><span><app.components.react.FixedSVG className="alphaicon fill a">{app.___svgs.next}</app.components.react.FixedSVG> #uncategorized.authorSharingThis#</span><br/>{children}</blockquote>
		};
		
		if (!whatIsThis) return <Result>Unknown shared content.</Result>
		else {
			const {result, failed, loading} = app.reactstates.useAsyncLoader(app.f.get(`${whatIsThis[0]}/${children.contentId}`));
			if (loading) return <Result><app.components.Loading /></Result>
			else if (failed) return <Result><app.structures.Post post={{content: "Failed"}}/></Result>
			else {
				const Component = whatIsThis[1];
				return <Result><Component micro canOpenFully>{result.content}</Component></Result>;
			};
		};
	},
	"usercard": function UserCard({children}) {
		const user = children.content;
		if (user) return <div style={{fontSize: "large", padding: "10px", display: "flex", flexDirection: "row", gap: "20px", alignItems: "center"}}>
			<app.components.Avatar style={{height: "120px"}} user={user}/>
			<div>
				<div className={{fontSize: "20px"}}>
					<app.components.Username.Extended.allowRedirect user={user} linear/>
					<br />
					{user.subs_count > 0 ? <span><b>{app.functions.parseCount(user.subs_count)}</b> #uncategorized.subs#</span> : null}
				</div>
				<app.components.Content hideShowMoreButton={true} compressTo={null}>{app.functions.microDesc(user.description)}</app.components.Content>
			</div>
		</div>
		else return "😥";
	}
};
app.components.UserCard = (props)=><app.components.Gallery.Objects.usercard children={{content: props.children || props.user}}/>;

app.translateError = function (errorCode) {
	if (typeof errorCode==="string") {
		return app.translateError.Errors[errorCode] ? app.translateError.Errors[errorCode] : errorCode;
	} else if (Array.isArray(errorCode)) {
		let objects = app.translateError.Errors.entityNames;
		let whatRequired = app.translateError.Errors.whatRequired;
		let result = [];
		errorCode.forEach(x=>{
			let p = "";
			if (x[0] in objects) {
				p+=`${objects[x[0]]} - `;
			} else {
				p+=`${x[0]} - `;
			};
			p+=(whatRequired[x[1]]||x[1]).replace("&0&", x[2]);
			result.push(p);
		});
		return result.join(" ");
	} else {
		return "idk_what_this_an_error";
	};
};
app.translateError.Errors = tryToReadJSON("#errors#");


app.functions.time_tr = tryToReadJSON("#time_tr#");

app.functions.date = function (date) {
	const x = new Date(date);
	if (x=="Invalid Date") return "???";
	return `${x.getDate()} ${app.functions.time_tr.months[Object.keys(app.functions.time_tr.months)[x.getMonth()]]}, ${x.getFullYear()}${app.functions.time_tr.year}`;
};

app.functions.ago = function (date) {
	if (!date || isNaN(date)) {
		return app.functions.time_tr.unknown;
	};
	
	
	let back = false;
	let result = "";
	let interval;
	
	var seconds = Math.floor((new Date() - date) / 1000);
	if (seconds<0) {
		back = true;
		seconds = Math.floor((date - new Date()) / 1000);
	};
	
		
	interval = seconds / 60;
	if (interval > 1) {
		if (Math.floor(interval)==1) result = app.functions.time_tr.ago.minute
		else result = Math.floor(interval) + " " + app.functions.time_tr.ago.minutes;
	} else {
		if (seconds < 1) return app.functions.time_tr.ago.now;
		else if (Math.floor(seconds)==1) result = app.functions.time_tr.ago.second
		else result = Math.floor(seconds) + " " + app.functions.time_tr.ago.seconds;
	};
	interval = seconds / 3600;
	if (interval > 1) {
		if (Math.floor(interval)==1) result = app.functions.time_tr.ago.hour
		else result = Math.floor(interval) + " " + app.functions.time_tr.ago.hours;
	};
	interval = seconds / 86400;
	if (interval > 1) {
		if (Math.floor(interval)==1) result = app.functions.time_tr.ago.day
		else result = Math.floor(interval) + " " + app.functions.time_tr.ago.days;
	};
	interval = seconds / 2592000;
	if (interval > 1) {
		if (Math.floor(interval)==1) result = app.functions.time_tr.ago.month
		else result = Math.floor(interval) + " " + app.functions.time_tr.ago.months;
	};
	interval = seconds / 31536000;
	if (interval > 1) {
		if (Math.floor(interval)==1) result = app.functions.time_tr.ago.year
		else result = Math.floor(interval) + " " + app.functions.time_tr.ago.years;
	};
	interval = seconds / 3153600000;
	if (interval > 1) {
		if (Math.floor(interval)==1) result = app.functions.time_tr.ago.century
		else result = Math.floor(interval) + " " + app.functions.time_tr.ago.centuries;
	};
	
	result = !back ? result + " " + app.functions.time_tr.ago.b : app.functions.time_tr.ago.n + " " + result;
	return result[0].toUpperCase()+result.slice(1);
};


app.functions.numnumnum = tryToReadJSON("#uncategorized.count#");
app.functions.getCountK = function (num) {
	let Ks = 0;
	let n = num;
	while (n>999) {
		n /= 1000;
		Ks++;
	};
	return {numb: n, num_better: Number(String(n).slice(0, String(n).split(".")[0].length+3)), k: Ks};
};
app.functions.parseCount = function (num) {
	const a = app.functions.getCountK(num);
	let k = "";
	for (let x=a.k;x--;x<1) k+="k";
	return `${a.num_better}${app.functions.numnumnum[k] ? " "+app.functions.numnumnum[k] : k}`;
};

app.functions.fetchUser = async function (id) {
	const result = await app.f.get(`user/${id}`);
	if (result=="host_error" || result=="database_error" || result==undefined) return false
	else return app.functions.alignUserWithDefaultTypes(typeof result == "object" ? result.content : result);
};

app.functions.isIAmGuest = function () {
	return app.me == "guest";
};

app.functions.renderEmojiInfo = async function (emojiId) {
	return await new Promise(r=>{
		app.m_.render({
			title: "#page.modal.emojiinfo.title#",
			component: <app.functions.renderEmojiInfo.component emojiId={emojiId}/>,
			onEnd: reason => {
				if (reason!="closed") {
					r(true);
				} else r(false);
			},
			closable: true
		});
	});
};
app.functions.renderEmojiInfo.component = function ({emojiId}) {
	/*
		Результат запроса к эмодзи такой:
{
    "status": "success",
    "content": {
        "id": 9,
        "packId": 1,
        "emojiId": "test",
        "name": null,
        "keywords": [
            "thunder"
        ],
        "author": 3,
        "pack": {
            "id": 1,
            "author": 3,
            "name": null,
            "emojis": [
                {
                    "id": 7,
                    "packId": 1,
                    "emojiId": "rainbow",
                    "name": "Раинбов",
                    "keywords": []
                },
                {
                    "id": 8,
                    "packId": 1,
                    "emojiId": "deprecated_emoji_name",
                    "name": "Великий успех",
                    "keywords": []
                },
                {
                    "id": 9,
                    "packId": 1,
                    "emojiId": "test",
                    "name": null,
                    "keywords": [
                        "thunder"
                    ]
                }
            ]
        }
    }
}

		Ващ вместо цифрового значения свойства author в информации эмодзи должен быть пользователь,
		но всесто этого отображается цифровой идентификатор пользователя.
		Мб баг бэкенда
		
		Но в паке информация о авторе гарантированно является цифровым значением, так как
		он не является главным результатом.
		
		Айди пака не может быть отрицательным, как оказалось
	*/
	const { me } = app.reactstates.useInformationAboutMe();
	
	const [result, setResult] = useState();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const [packAdded, setPackAdded] = useState(false);
	
	const onEmojiPackAdd = /*processButton(*/async function (e) {
		const iAmJoinedToPack = result && result.packId && Array.isArray(app.emojipacks) && app.emojipacks.find(x=>x.id==result.packId);
		
		if (!result.packId) return false;
		
		const r = await app.f.patch("user/self", {
			settings: {
				emojiPacks: [iAmJoinedToPack ? -result.packId : result.packId] // API просто выполняет слияние, можно указать ID, но с минусом, чтобы убрать пак
			}
		});
		
		if (typeof r == "string" || r.status == "error") return false;
		
		if (iAmJoinedToPack) {
			app.emojipacks.splice(app.emojipacks.findIndex(x=>x.id==result.packId), 1);
		} else {
			app.emojipacks.push(result.pack);
		};
		//forceUpdate(); крч метода не существует наверное. Придется перейти на статные переменные
		setPackAdded(!iAmJoinedToPack);
		return NaN; // Просто оставляет кнопку в покое и больше ничего не делает. Прост он не совместим с React, эта функция была придумана для DOM-элементов
	}/*)*/;
	
	
	useEffect(function () {
		setLoading(true);
		setError(false);
		
		const get = async() => {
			const r = await app.f.get(`emoji/${emojiId}`);
			if (typeof r == "object" && r.status == "success") {
				return r.content;
			} else {
				throw r;
			};
		};
		
		get()
			.then(r=>{setResult(r);setPackAdded(r && r.packId && Array.isArray(app.emojipacks) && app.emojipacks.find(x=>x.id==r.packId))})
			.catch(e=>{setError(app.translateError(e))})
			.finally(()=>{setLoading(false)});
	}, [emojiId]);
	
	return <>
		<div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", paddingBottom: "10px" }}>
			<img className="emoji" style={{ display: "block", fontSize: 64 }} src={app.apis.mediastorage+"emoji/"+String(emojiId)}/>
			{ loading && <app.components.Loading /> }
			{ error && !loading && <app.components.ErrorAlert>{error}</app.components.ErrorAlert> }
			{ result && !loading && 
				<span>
					{result.name && <b>{result.name}<br /></b>}
					:{result.emojiId}:
				</span>
			}
		</div>
		{ result && result.pack &&
			<div style={{ marginBlock: 5 }}>
				<span><b>{result.pack.name || "#page.modal.emojiinfo.unknownname#"}</b></span>
				<br/>
				<span>#uncategorized.by# <app.components.Username user={ result.author }/></span>
				<div style={{display: "grid", overflowY: "scroll", maxHeight: 100, justifyContent: "center", gap: 5, gridTemplateColumns: "repeat(auto-fill, minmax(15%, 1fr))"}}>
					{
						result.pack.emojis.map(x=>(
							<img tooltip={`:${x.emojiId}:`} className="emoji" style={{ display: "block", fontSize: 32 }} src={app.apis.mediastorage+"emoji/"+String(x.id)}/>
						))
					}
				</div>
			</div>
		}
		<app.m_.Border>
			<app.m_.Button disabled={loading || error || me == "guest"} isProcessButton onClick={onEmojiPackAdd} className={packAdded ? "btn btn-danger" : "btn app-button"} onClick={onEmojiPackAdd}>{packAdded ? "#page.modal.emojiinfo.remove#" : "#page.modal.emojiinfo.join#"}</app.m_.Button>
			{" "}
			<app.m_.Button className="btn app-button" onClick={()=>true}>#button.close#</app.m_.Button>
		</app.m_.Border>
	</>
};

app.functions.youReallyWantToDo = async function (func, write, customText) {
	if (!func) func = ()=>true;
	if (!write) {
		return await new Promise(r=>{
			app.m_.render({
				title: "#page.modal.want.waitwait#",
				component: <Fragment>
					<p>{customText ?? "#page.modal.want.youreallywant#"}</p>
					<app.m_.Border>
						<app.m_.Button className="btn btn-danger" onClick={()=>true}>#button.yes#</app.m_.Button>
						{" "}
						<app.m_.Button className="btn btn-default">#button.no#</app.m_.Button>
					</app.m_.Border>
				</Fragment>,
				onEnd: reason => {
					if (reason!="closed") {
						r(func());
					} else r(false);
				},
				closable: true
			});
		});
	} else {
		return await new Promise(r=>{
			function A() {
				const [x, setX] = useState("");
				return <Fragment>
					<p dangerouslySetInnerHTML={{__html: (customText ? customText+"\n\n" : "")+"#page.modal.want.writean#".replace("&0&", write)}}></p>
					<app.components.react.TextInput onInput={event=>setX(event.target.value)} label={null} placeholder={write}/>
					<app.m_.Border>
						<app.m_.Button className="btn btn-danger" onClick={()=>true} disabled={x!=write}>#button.yes#</app.m_.Button>
						<app.m_.Button>#button.no#</app.m_.Button>
					</app.m_.Border>
				</Fragment>
			};
			app.m_.render({
				title: "#page.modal.want.waitwait#",
				component: <A/>,
				onEnd: reason => {
					if (reason!="closed") {
						r(func());
					} else r(false);
				},
				closable: true
			});
		});
	};
};
app.functions.youReallyWantToOpenLink = async function (link) {
	return await new Promise(r=>{
		app.m_.render({
			title: "#page.modal.want.waitwait#",
			html: "#page.modal.want.link#".replace("&0&", link),
			border: <Fragment>
				<a href={link} target="__blank"><app.m_.Button className="btn app-button" onClick={()=>true}>#button.yes#</app.m_.Button></a>
				<app.m_.Button>#button.no#</app.m_.Button>
			</Fragment>,
			onEnd: r
		});
	});
};
app.functions.youMightToLogin = async function () {
	return await new Promise(r=>{
		app.m_.render({
			title: "#page.modal.want.waitwait#",
			html: "#page.modal.want.login#",
			border: <>
				<app.components.react.UnderRouterLink to="/login"><app.m_.Button onClick={()=>true}>#button.yesredirect#</app.m_.Button></app.components.react.UnderRouterLink>
				<app.components.react.UnderRouterLink to="/register"><app.m_.Button onClick={()=>true}>#button.register#</app.m_.Button></app.components.react.UnderRouterLink>
				<app.m_.Button>#button.no#</app.m_.Button>
			</>,
			onEnd: r
		});
	});
};


app.functions._userContextMenu = function (toElement) {
	app.cm.create([
		<Fragment>
			<div style={{padding: "10px 5px", margin: 0}}>
				<app.components.Username user={app.me}/>
			</div>
			<hr />
		</Fragment>,
		{text: `${app.components.AlphaIcon(["emoji"], "/static/svg/home.svg").outerHTML} #page.modal.accountMenu.myProfile#`, url: app.me.tag ? `/user/@${app.me.tag}` : "/user/self"},
		{text: `${app.components.AlphaIcon(["emoji"], "/static/svg/shesternya.svg").outerHTML} #page.modal.accountMenu.settings#`, url: "/settings"},
		{text: `${app.components.AlphaIcon(["emoji"], "/static/svg/x.svg").outerHTML} #page.modal.accountMenu.exit#`, onClick: app.functions._userContextMenu.exitFromAccount}
	], {toElement});
};
app.functions._userContextMenu.exitFromAccount = () => {
	app.functions.youReallyWantToDo(function() {
		const userId = app.me.id;
		if (userId) app.f.post("logout", {ids: [userId]});
				
		cookieMngr.deleteCookie("token");
		getMe.update("guest", "guest");
		window.history.pushState({"isExited": true}, {}, "/login");
		window.dispatchEvent(new PopStateEvent("popstate"));
	}, "window.localStorage.clear()");
};






app.functions._notificationsContextMenu = function(toElement) {
	app.cm.create([
		<app.components.NotificationsPopup/>
	], {toElement});
};

app.components.NotificationsPopup = function ({ closePopup }) {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка уведомлений
    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                // Предполагаемый эндпоинт для уведомлений
                //const response = await app.f.get('notify', {read: 1}); 
                const response = await app.f.get("search", {parse: "notifylist", sort: 3});
				if (response && Array.isArray(response.content)) {
                    setNotifications(response.content);
                } else {
                    throw new Error(response.error || 'Invalid response format');
                }
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setError(app.translateError ? app.translateError('notifications_failed') : 'Failed to load');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="loader-container"><app.components.Loading /></div>;
        }
        if (error) {
            return <div className="error-container"><app.components.ErrorAlert>{error}</app.components.ErrorAlert></div>;
        }
        if (notifications.length === 0) {
            return <div className="empty-state">#page.notifications.empty#</div>;
        }
        return notifications.map(notif => <app.components.NotificationsPopup.NotificationItem key={notif.id} closePopup={closePopup} notification={notif} />);
    };

    return (
        <div>
            <div className="popup-header">
                <h3>#page.notifications.title#</h3>
                {/*<app.components.react.UnderRouterLink to="/notifications">#button.see_all#</app.components.react.UnderRouterLink>*/}
            </div>
            <div className="notifications-list">
                {renderContent()}
            </div>
        </div>
    );
};

app.components.NotificationsPopup.NotificationItem = function ({ notification, closePopup }) {
    if (!notification || !notification.state) return null;

    const { state } = notification;
    const { type, author, preview, entity } = state;
	const { type: contentType, id, parentId } = entity;

    let data = {};

    // Логика рендеринга и навигации на основе типа уведомления
    switch (type) {
        case 'SYSTEM':
            data.text = state.preview || 'test notify';
            data.href = state.href || '';
            break;
		default:
            data.text = "Unknown notification";
			data.href = "/";
			if (app.components.NotificationsPopup.NotificationItem.getContent.supportedTypes.includes(type)) {
				data = {
					...data,
					...app.components.NotificationsPopup.NotificationItem.getContent(notification)
				}
			};
    };
	if (!data.icon && author && author.id && author.avatar) data.icon = <app.components.Avatar user={author} />;
	if (!data.quote && preview) data.quote = preview;
	if (!data.href) data.href = app.components.NotificationsPopup.NotificationItem.getContentHref(notification);

	async function markAsRead() {
		if (closePopup) closePopup();
		
		if (!notification.id) return
		else {
			return app.f.post("notify/read", {ids: [notification.id]});
		};
	};

    return (
		<div onClick={markAsRead}>
			<app.components.react.UnderRouterLink to={data.href} className={`notify-block ${notification.readed ? '' : 'new'}`}>
				<div id="icon">{data.icon}</div>
				<div className="text-content">
					<p>
						{data.text}
						{data.quote && <span className="notify-quote">"{data.quote}"</span>}
					</p>
					<span className="date">{app.functions.ago(notification.created)}</span>
				</div>
			</app.components.react.UnderRouterLink>
		</div>
    );
};
app.components.NotificationsPopup.NotificationItem.getContentHref = function (notify) {
	const { state } = notify;
	const { type, author, entity } = state;
	const { type: contentType, id, parentId } = entity;
	
	let href = "";
	switch(contentType) {
		case "users":
			if (type == "NEW_COMMENT") href = `/user/${id}/comments`
			else href = `/user/${id}`;
			break;
		case "posts":
			href = `/post/${id}`;
			break;
		case "mipuadv_posts":
			href = `/sprks/${id}`;
			break;
		default:
			if (contentType) {
				href = `/${contentType}/${id}`;
				console.warn("Неизвестный тип юрл к уведомлению");
			};
	};

	if (type == "NEW_COMMENT") {
		if (parentId) href += `?commentId=${parentId}`;
	};

	return href;
};
app.components.NotificationsPopup.NotificationItem.getContent = function (notify) {
	const { state } = notify;
	const { type, author, entity } = state;
	const { type: contentType, id, parentId } = entity;

	let text, quote, icon, href;
	switch(type) {
		case "NEW_COMMENT":
			text = <><app.components.Username user={author} /> #notify.newcomment#</>;
			break;
		case "NEW_CONTENT":
			if (contentType=="posts") text = <><app.components.Username user={author} /> #notify.newpost#</>
			else text = <><app.components.Username user={author} /> #notify.newcontent#</>;
			break;
		case "YOUR_MIPUADV_POST_READY":
			text = <>#notify.yourmipuadvpostready#</>;
			icon = <app.components.react.FixedSVG className="alphaicon d" children={app.___svgs.sparks}/>;
			break;
		case "YOUR_MIPUADV_POST_FAILED":
			text = <>#notify.yourmipuadvpostfailed#</>;
			icon = <app.components.react.FixedSVG className="d" children={app.___svgs.x}/>;
			break;
		case "MENTION":
			text = <><app.components.Username user={author} /> #notify.mentioned#</>;
	};
	
	return { text, quote, icon, href };
};
app.components.NotificationsPopup.NotificationItem.getContent.supportedTypes = ["NEW_COMMENT", "NEW_CONTENT", "MENTION", "YOUR_MIPUADV_POST_READY", "YOUR_MIPUADV_POST_FAILED"];




app.components.ProcessButton = function (props) {
	const { onClick, disabled, className, children, ...anotherProps } = props;
	
	const btnRef = useRef();
	
	const [ isProcessing, setIsProcessing ] = useState(false);
	
	const [ d, setD ] = useState(null);
	const [ c, setC ] = useState(null);
	
	async function handleClick(...args) {
		if (isProcessing || disabled) return;
		
		setIsProcessing(true);
		setD(<app.components.react.FixedSVG children={app.___svgs.loading}/>);
		
		const [ isCalledSuccessfully, result ] = await new Promise(async(R)=>{
			try {
				const r = await onClick(...args);
				R([ !!r || r === undefined, r ]);
			} catch(e) {
				R([ false, e ]);
			};
		});
		
		if (isCalledSuccessfully && result!="ignore") {
			setD(<app.components.react.FixedSVG className="alphaicon a fill" children={app.___svgs.checkmark_1}/>);
			await new Promise(r=>setTimeout(r, 3000));
		} else if (!isCalledSuccessfully) {
			console.error("Процесс прошел с ошибкой или был вовсе отклонен: ", result);
			setD(<app.components.react.FixedSVG className="alphaicon a fill" children={app.___svgs.x_1}/>);
			setC("failedButtonTemp");
			await snakeObject(btnRef.current, undefined, undefined, false);
		};
		
		setD(null);
		setC(null);
		setIsProcessing(false);
	};
	
	return <button {...anotherProps} ref={btnRef} className={(className ?? "")+(c && className ? " " : "")+(c ? c : "")} onClick={handleClick} disabled={disabled || isProcessing}>{d}{d && " "}<span>{children}</span></button>
};






app.components.Picker = function (val) {
	//const [randomPreview, ___] = useState(val.previewEmoji ? val.previewEmoji : ItsRandom.choice(["fox_face", "cat_face", "sparkles", "star2"]));
	const [ page, setPage ] = useState("native");

	let c = [];
	let ct = {categoryIcons: {}};
	
	const ref = useRef(null);
	
	if (true) {
		if (app.emojipacks) {
			c = app.emojipacks.map((x,y)=>{
				return {
					id: `pack_${x.id}`,
					name: x.name ? `${x.name} by @${x.author.tag}` : `Pack by @${x.author.tag}`,
					emojis: x.emojis.map(x=>{
						return {
							id: x.emojiId,
							name: x.name ?? x.emojiId,
							keywords: x.keywords ?? [],
							skins: [{ src: app.apis.mediastorage+`emoji/${x.id}` }],
						}
					}),
				}
			});
			let _ct = app.emojipacks.filter(x=>x.emojis.length>0).map((x,y)=>{
				return [`pack_${x.id}`, x.emojis[0].id];
			});
			for (const a of _ct) {
				ct.categoryIcons[a[0]] = {
					src: app.apis.mediastorage+`emoji/${a[1]}`
				};
			};
		};
	};
	
	const {previewEmoji, noResultsEmoji, onClickOutside, onEmojiSelect, ...rest} = val;
	
	function clickOutsideEvent(event) {
		if (!ref.current) return onClickOutside(event); 
		if (!ref.current.contains(event.target)) return onClickOutside(event);
	};
	
	return <div className="app-cm-outer picker" {...rest} ref={ref}>
		<div className="pickercategory">
			<button disabled={page=="native"} onClick={()=>setPage("native")}>#uncategorized.picker_native_pack_name#</button>
			<button disabled={page=="custom"} onClick={()=>setPage("custom")}>#uncategorized.picker_custom_pack_name#</button>
		</div>
		{ page === "custom" && c.length <= 0 && <div style={{backgroundColor: "var(--secondaryColor)", lineHeight: "1.8rem", padding: "15px", fontSize: "smaller", borderRadius: "8px"}}>#uncategorized.missing_custom_emoji_packs#<br /><app.components.react.UnderRouterLink to="/emojis">#button.letsfixit#</app.components.react.UnderRouterLink></div>}
		<Picker
			key={page}
			previewEmoji={previewEmoji ?? "fox_face"}
			noResultsEmoji={noResultsEmoji ?? "crying_cat_face"}
			onClickOutside={clickOutsideEvent}
			onEmojiSelect={onEmojiSelect}
			custom={c}
			{...ct}
			categories={ page === 'custom' ? ["frequent", ...c.map(pack => pack.id)] : ["frequent", "people", "nature", "foods", "activity", "places", "objects", "symbols", "flags"] }
			locale="ru"
		/>
	</div>
};

app.functions.generateEmojiPicker = function (options) {
	let randomPreview = ItsRandom.choice(["fox_face", "cat_face", "sparkles", "star2"]);
	
	let c = [];
	let ct = {categoryIcons: {}};
	if (app.emojipacks) {
		c = app.emojipacks.map((x,y)=>{
			return {
				id: `pack_${x.id}`,
				name: x.name ? `${x.name} by @${x.author.tag}` : `Pack by @${x.author.tag}`,
				emojis: x.emojis.map(x=>{
					return {
						id: `emoji${x.id}`,
						name: x.name,
						keywords: [],
						skins: [{ src: app.apis.mediastorage+`emoji/${x.id}` }],
					}
				}),
			}
		});
		let _ct = app.emojipacks.map((x,y)=>{
			return [`pack_${x.id}`, x.emojis[0].id];
		});
		for (const a of _ct) {
			ct.categoryIcons[a[0]] = {
				src: app.apis.mediastorage+`emoji/${a[1]}`
			};
		};
	};
	
	function onClickOutside(event) {
		
	};
	
	return new EmojiMart.Picker({...options, noResultsEmoji: "crying_cat_face", previewEmoji: randomPreview, locale: "ru", categoryIcons: ct, custom: c});
};
app.functions.closeEmojiPickers = function () {
	//document.querySelectorAll(".container42 em-emoji-picker").forEach(x=>{x.remove();delete x});
};


app.functions.notificationToToast = function (notification) {
	const { state } = notification;
	const { author, type, preview, entity } = state;
	
	let data = {};
	data.text = "Unknown notification";
	data.href = "/";
	if (app.components.NotificationsPopup.NotificationItem.getContent.supportedTypes.includes(type)) {
		data = {
			...data,
			...app.components.NotificationsPopup.NotificationItem.getContent(notification)
		}
	};
	if (!data.icon && author && author.id && author.avatar) data.icon = <app.components.Avatar user={author} />;
	if (!data.quote && preview) data.quote = preview;
	if (!data.href) data.href = app.components.NotificationsPopup.NotificationItem.getContentHref(notification);

	return app.toasts.show({
		duration: 15000,
		icon: data.icon,
		href: data.href,
		onClick: (e, close) => {
			close();
			app.f.post("notify/read", {ids: [notification.id]});
		},
		content: <p>
			{data.text}
			{data.quote && <span className="notify-quote">"{data.quote}"</span>}
		</p>
	});
};

app.functions.apiErrorToToast = function (error_code) {
	app.toasts.show({
		duration: 15000,
		type: "error",
		content: <>
			#uncategorized.error_happened#
			<span className="notify-quote">{app.translateError(error_code)}</span>
		</>,
		onClick: (e,c)=>c(),
		icon: <app.components.react.FixedSVG className="alphaicon fill d" children={app.___svgs.x}/>
	});
};


app.functions.setLocalStorageKey = function (key, value) {
	const action = value != null ? "update" : "remove";
	const oldValue = app.functions.readLocalStorageKey(key);
	if (action=="update") {
		if (typeof value == "object") value = JSON.stringify(value);
		window.localStorage.setItem(key, value);
	} else if (action=="remove") {
		window.localStorage.removeItem(key);
	};
	window.dispatchEvent(new CustomEvent("storageCustomEvent", {detail: {key, value, action, oldValue}}));
	return value;
};
app.functions.readLocalStorageKey = function (key, returnIfUndefined) {
	let value = window.localStorage.getItem(key);
	try { value = JSON.parse(value) } catch {};
	if (returnIfUndefined === undefined) return value
	else {
		if (value == null) return returnIfUndefined
		else return value;
	};
};

app.functions.alignUserWithDefaultTypes = (data)=>{
	if (typeof data == "string") data = {unvaliable: "api:"+data};
	
	return {
		...{
			id: 0,
			name: null,
			tag: "-",
			description: null,
			created: NaN,
			avatar: {},
			background: {}
		},
		...data,
		...{
			badges: (!data || data.unvaliable && data.unvaliable!=="missing" || !data.tag) ? [{type: 1, id: "unvaliable"}] : data.badges,
			links: (!data || data.unvaliable && data.unvaliable!=="missing" || !data.tag) ? [{text: "Go to main page", link: "/"}] : data.links
		}
	};
};

app.functions.parseUnknownURL = function (url) {
	return url; // no logic
};

app.components.Mention = function ({children, type, symbol, to}) {
	// RegEx -> /@[A-Za-z0-9\-\_А-Яа-я]+/g
	return <app.components.react.UnderRouterLink to={to ? to : `/user/${children}`} className="app-structure-mention">{symbol && <b>{symbol}</b>}{children}</app.components.react.UnderRouterLink>
};

















// Компоненты
app.structures = {};
app.structures.Post = function ({post: value, children, onDelete, micro, canOpenFully}) {
	if (!value) value = children;
	if (!value) return null;
	
	const [post, setPost] = useImmer(value);
	const [replying, setReplying] = useState(false);
	const [successfullyReply, setSuccessfullyReply] = useState(false);
		
	useEffect(()=>{ setPost(JSON.parse(JSON.stringify(value))) }, [value]);
	
	const [editing, setEditing] = useState(false);
	if (editing) return <app.structures.PostEdit
		post={post}
		onCancel={()=>{setEditing(false)}}
		onApply={result=>{setEditing(false);setPost(result)}}
	/>
	
	function moreMenuCallback(e) {
		let contextMenu = [
			{text: <><app.components.react.FixedSVG className="alphaicon a">{app.___svgs.pin_button}</app.components.react.FixedSVG>{" "}{!app.me.mainPage.filter(x=>x.type=="pinnedpost"&&x.content==post.id)[0] ? "#button.pintoprofile#" : "#button.unpinfromprofile#"}</>, onClick: pinPostToProfile}
		];
		
		
		const to = e.target;
		if (post.author && app.me.id==post.author.id) {
			contextMenu = [
				...contextMenu,
				{text: "#button.edit#", onClick: ()=>setEditing(true)},
				{text: "#button.remove#", onClick: ()=>executeDelete()}
			];
		};
		app.cm.create(contextMenu, {toElement: to});
	};
	async function pinPostToProfile() {
		const result = await app.f.patch(`user/self`, {
			mainPage: !app.me.mainPage.filter(x=>x.type=="pinnedpost"&&x.content==post.id)[0] ?
				[{type: "pinnedpost", title: "", content: post.id}, ...app.me.mainPage]
				:
				app.me.mainPage.filter(x=>!(x.type=="pinnedpost"&&x.content==post.id))
		});
		if (result.content && result.content.id == app.me.id) {
			getMe.update(result.content);
		};
	};
	function executeDelete() {
		app.functions.youReallyWantToDo(async()=>{
			const result = await app.f.delete(`posts/${post.id}`);
			if (!(typeof result=="string" || result.error)) {
				if (onDelete) onDelete();
				setPost((data)=>{
					data.id = undefined;
					data.author = undefined;
				});
			} else {};
		});
	};
	
	return <>
	<div className="app-structure-post">
		<div className="authorinfo">
			<app.components.Avatar user={post.author}/>
			<span>
				<app.components.Username.Extended.allowRedirect user={post.author}/>
				<br />
				<span>🕑 {app.functions.ago(post.created)}{post.edited ? ", #uncategorized.edited#" : ""}</span>
			</span>
		</div>
		{post.unvaliable && <app.components.ErrorAlert>{app.translateError(post.unvaliable)}</app.components.ErrorAlert>}
		<app.components.Content fromContent={post}>{post.content}</app.components.Content>
		{(post.medias!=null || post.objectMedias!=null) && <app.components.Gallery content={{...post, micro}} medias={[...(post.medias && post.medias.map(x=>{
			if (!x.startsWith("http://")||!x.startsWith("https://")||!x.startsWith("/user/")) return app.apis.mediastorage+post.author.id+"/"+x
			else if (x.startsWith("/user/")) return app.apis.mediastorage+x.split("/")[2]+"/"+x.split("/")[3]
			else return app.functions.parseUnknownURL(x);
		})), ...post.objectMedias]}/>}
		<app.structures.Rating hideReactions={micro} onRepost={!micro && (()=>setReplying(a=>!a))} moreButtonCallback={moreMenuCallback} rating={post.rating} openFull={canOpenFully && !isNaN(post.id) && `/post/${post.id}`} contentType="posts" contentId={post.id} />
	</div>
	{replying && <app.structures.PostEdit post={{objectMedias: [{"id":"share","structure":"post","contentId": post.id}]}} onApply={()=>{setReplying(false);setSuccessfullyReply(true)}} onCancel={()=>setReplying(false)}/>}
	{successfullyReply && <app.components.Success>#uncategorized.successrepost#</app.components.Success>}
	</>;
};

app.structures.PostEdit = function ({post, children, onCancel, onApply, lockApply, disabled, onInput}) {
	const isCreating = post ? !post.id : true;
	const [ data, setData ] = useImmer(post ? post : { content: "" });
	const [ errorState, setErrorState ] = useState(false);
	
	const [ rndPlaceholder, setRndPlaceholder ] = useState(app.structures.PostEdit.randomPlaceholder());

	const { me } = app.reactstates.useInformationAboutMe();
	
	//useEffect(function () { if (onInput) onInput(data) }, [onInput, data]);
	/*const handleOnInput = useCallback(function (d) {
		if (onInput) onInput(d);
	}, [onInput]);*/
	/*function handleOnInput(d) {
		if (onInput) onInput(d);
	};*/
	let lastEmittedData = useRef(JSON.stringify(data));
	useEffect(function () {
		let d = JSON.stringify(data);
		if (onInput && data && d!=lastEmittedData.current) onInput(data); 
		lastEmittedData.current = d;
	}, [ data, onInput ]);

	useEffect(function () {setData(post ? JSON.parse(JSON.stringify(post)) : { content: "" }) }, [post]);
	
	const [ processing, setProcessing ] = useState(false);
	const apply = useCallback(function (event) {
		const f = /*processButton(*/async function (event) {
			setProcessing(true);
			let response;
			if (!isCreating) {
				response = await app.f.patch(`posts/${post.id}`, data);
			} else {
				response = await app.f.post("posts", data);
			};
			if (response.status == "error" || response instanceof Error || typeof response != "object") {
				setErrorState(app.translateError(typeof response == "object" ? response.content : response));
				setProcessing(false);
				throw Error(response.content);
			} else {
				if (!lockApply) {
					onApply(response.content);
				};
			};
			setProcessing(false);
			
			if (isCreating) {
				setData(draft => {
					draft.content = "";
					draft.medias = [];
					draft.objectMedias = [];
				});
			};
		}/*)*/;
		return !lockApply ? f(event) : onApply(event);
	}, [onCancel, onApply, lockApply, data, post]);
	
	useEffect(function () {
		setProcessing(me=="guest");
	}, [me]);
	
	let probablyAuthor = app.functions.alignUserWithDefaultTypes((post && post.author) ?? me);
	return <div className="app-structure-post">
		<div className="authorinfo">
			<app.components.Avatar user={probablyAuthor}/>
			<span>
				<app.components.Username.Extended user={probablyAuthor}/>
				<br />
				{ !isCreating ?
					<span>✏ {app.functions.ago(post.created)}{post.edited ? ", #uncategorized.edited#" : ""}</span>
					:
					<span>✏ #uncategorized.newpost#</span>
				}
			</span>
		</div>
		<app.components.ErrorAlert>{errorState}</app.components.ErrorAlert>
		{ [...(data.medias ?? []), ...(data.objectMedias ?? [])] && [...(data.medias ?? []), ...(data.objectMedias ?? [])].length > 0 && <app.components.GalleryInput disabled>{[...(data.medias ?? []), ...(data.objectMedias ?? [])]}</app.components.GalleryInput>}
		<app.components.ContentInput
			value={data.content}
			onChange={e=>{ setData(x=>{x.content=e.target.value}) }}
			disabled={processing || disabled}
			editorClassName=""
			className="contentify"
			placeholder={me=="guest" ? "#uncategorized.accountisrequiredtocomment#" : rndPlaceholder}
			valueIsControllable
		>
			{ !isCreating ?
				<span><button className="app-button1" onClick={onCancel} disabled={processing || disabled}>#button.cancel#</button> <app.components.ProcessButton className="app-button1 primary" onClick={apply} disabled={processing || disabled}>#button.apply#</app.components.ProcessButton></span>
				:
				<span>{onCancel && <button className="app-button1" onClick={onCancel} disabled={processing || disabled}>#button.cancel#</button>} <app.components.ProcessButton className="app-button1 primary" onClick={apply} disabled={processing || disabled}>#button.publish#</app.components.ProcessButton></span>
			}
		</app.components.ContentInput>
	</div>;
};

app.structures.PostEdit.randomPlaceholder = function () {
	try {
		const d = tryToReadJSON("#uncategorized.newpost_randomplaceholder#");
		return ItsRandom.choice(d);
	} catch(e) {
		console.error(e);
		return "QwQ";
	};
};



app.functions.getEmjs = function (callback) {
	return new Promise(async function (r) {
		let a = await fetch(
			'https://gist.githubusercontent.com/oliveratgithub/0bf11a9aff0d6da7b46f1490f86a71eb/raw/d8e4b78cfe66862cf3809443c1dba017f37b61db/emojis.json'
		);
		a = await a.json();
		if (callback) callback(a.emojis);
		r(a.emojis);
	});

};

app.components.ContentInput = forwardRef(function (props, ref) {
	const isMobile = /(android|ios)/ig.test(window.navigator.userAgent);
	return isMobile ? <app.components.MobileTextInput {...props} ref={ref}/> : <app.components.TextInputOne {...props} ref={ref}/>
});

app.components.MobileTextInput = forwardRef(function ({
		children: addAfterButtons, onNativePin, value: valueFromProps, valueIsControllable,
		className, editorClassName, disabled, onChange, placeholder
	}, ref) {
	
	const [text, setText] = useState(null);
	const [warning, setWarning] = useState(false);	
	
	const [gallery, updateGallery] = useImmer([]);
	const [galleryWaiting, setGalleryWaiting] = useState(false);
	
	const textareaRef = useRef(null);
    const pinButtonRef = useRef(null);	
	const lastEmittedValue = useRef(null);

	// --- РЕШЕНИЕ ПРОБЛЕМЫ №2: Галерея и текст теперь всегда синхронизированы ---
	/*useEffect(() => {
		if (text) return;
		
		const galleryString = gallery.length > 0 ? `\n\n$${JSON.stringify(gallery)}` : '';
		const combinedValue = text + galleryString;

		// Отправляем изменения только если они действительно есть
		if (onChange && lastEmittedValue.current !== combinedValue) {
			onChange({ target: { value: combinedValue } });
			lastEmittedValue.current = combinedValue;
		}
	}, [text, gallery, onChange]);*/
	// Всегда эмитим onChange при изменении текста или галереи (включая пустую строку)
	useEffect(() => {
		// text может быть '' — это валидное значение
		if (text === null) return;
		
		const galleryString = gallery.length > 0 ? `\n\n$${JSON.stringify(gallery)}` : '';
		const combinedValue = (text ?? '') + galleryString;

		if (onChange && lastEmittedValue.current !== combinedValue) {
			onChange({ target: { value: combinedValue } });
			lastEmittedValue.current = combinedValue;
		};
	}, [text, gallery, onChange]);

	// --- РЕШЕНИЕ ПРОБЛЕМЫ №1: Безопасная инициализация и синхронизация ---
	useEffect(() => {
		// Не обновляем, если значение неконтролируемое или пришло то же самое значение, что мы отправили
		if ((!valueIsControllable && text!=null) || valueFromProps === lastEmittedValue.current) return;
        
		let newText = typeof valueFromProps == "string" ? valueFromProps : '';
		let newGallery = [];
        
		// Надежно парсим галерею из конца строки
		const galleryMatch = newText.match(/\n\n\$(\[.*\])$/s);
		if (galleryMatch && galleryMatch[1]) {
			try {
				newGallery = JSON.parse(galleryMatch[1]);
				newText = newText.slice(0, galleryMatch.index);
			} catch(e) { /* Игнорируем ошибку парсинга, оставляем галерею в тексте */ };
		}
		
		setWarning(newText.includes('$['));
		setText(newText);
		updateGallery(newGallery);
		lastEmittedValue.current = valueFromProps; // Запоминаем последнее примененное значение

	}, [valueFromProps, valueIsControllable, updateGallery]);

	// Автоматическое изменение высоты textarea
	useEffect(() => {
		const element = textareaRef.current;
		if (!element) return;
		element.style.height = "auto";
		if (element.scrollHeight > 0) {
			const borderHeight = parseInt(getComputedStyle(element).borderBottomWidth, 10) || 0;
			element.style.height = (element.scrollHeight + borderHeight * 2) + "px";
		}
	}, [text]); // Пересчитываем при изменении текста


	
	function handleGalleryAdd(e) {
		const keys = Object.keys(app.components.TextInputOne.Element.Gallery.variations);
		const p = keys.map(x=>{
			const iAm = app.components.TextInputOne.Element.Gallery.variations[x];
			return {text: iAm.title ?? "Interact", onClick: function () {
				setGalleryWaiting(true);
				iAm.call(e, function (r) {
					setGalleryWaiting(false);
					if (r) {
						//let newValue = [...gallery, r];
						//updateGallery(x=>{x.push(r)});
						updateGallery(x=>{
							if (Array.isArray(r)) {
								r.forEach(z=>{x.push(z)});
							} else {
								x.push(r);
							};
						});
					};
				}, function (r) { setGalleryWaiting(false);console.error(r) });
			}};
		});
		return app.cm.create(p, {toElement: e.target});
	};
	function handleGalleryRemove(e, obj) {
		let newValue = [...gallery.filter(x=>x!=obj)];
		if (!obj) return
		else {
			const iAm = app.components.TextInputOne.Element.Gallery.variations[obj.id];
			if (!iAm || (iAm && !iAm.remove)) {handleInput(null);updateGallery(newValue)}
			else {
				setGalleryWaiting(true);
				iAm.remove(e, obj, function (a) {
					setGalleryWaiting(false);
					if (a!==false) {
						updateGallery(newValue);
					};
				}, function (r) { setGalleryWaiting(false);console.error(r) });
			};
		};
	};

	
	
    // --- РЕШЕНИЕ ПРОБЛЕМЫ №3: Вставка эмодзи в позицию курсора ---
	function insertEmoji(emoji) {
        const input = textareaRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const textToInsert = !emoji.native ? `:e:${emoji.src.split("/").reverse()[0]}:` : emoji.native;
        
        const newText = text.substring(0, start) + textToInsert + text.substring(end);
        setText(newText);
        
        // После обновления состояния, ставим курсор после вставленного эмодзи
        setTimeout(() => {
            const newPos = start + textToInsert.length;
            input.focus();
            input.setSelectionRange(newPos, newPos);
        }, 0);
	};
	
	/* Короче, с contentEditable в мобильных версиях Chrome очень туго. Поэтому Slate вообще не подходит к мобильным устройствам */
	return <>{warning && <app.components.WarnAlert>#uncategorized.mobile_input_unstable_warn#</app.components.WarnAlert>}
	<div className={"app-slatetexteditor contentify" + (className ? " "+className : "")} ref={ref}>
		<textarea
			ref={textareaRef}
			value={text}
			placeholder={placeholder}
			disabled={disabled}
			onChange={e => setText(e.target.value)}
		/>
		{gallery.length > 0 && <app.components.GalleryInput disabled={disabled || galleryWaiting} onDelete={handleGalleryRemove}>{gallery}</app.components.GalleryInput>}
		<div className="app-structure-rating">
			<div>
				<app.structures.Rating.AddReactionButton
					onEmojiSelect={insertEmoji}
					disabled={disabled}
				/>
				<button ref={pinButtonRef} className="app-iconOnlyButton b" disabled={disabled || galleryWaiting} onClick={handleGalleryAdd}>
                    <app.components.react.FixedSVG className="alphaicon">{app.___svgs.pin}</app.components.react.FixedSVG>
				</button>
			</div>
			<div>
				{addAfterButtons}
			</div>
		</div>
	</div>
	</>;
});

app.components.GalleryInput = function ({author, children, disabled, onDelete}) {
	const [gallery, updateGallery] = useImmer(children ?? []);
	useEffect(function () {
		// console.log("GALLERY: ", children, gallery);
		updateGallery(children);
	}, [children]);
	
	const { me } = app.reactstates.useInformationAboutMe();
	
	return <div className="app-galleryinput">
		<div id="list">
			{gallery.map((x,i)=>{
				let now = x;
				let Content = app.components.GalleryInput.Objects.unknown;
				if (x && x != undefined && typeof x == "object" && x.id in app.components.GalleryInput.Objects) {
					now = {...x, fromContent: {author: author ?? me}};
					Content = app.components.GalleryInput.Objects[x.id];
				};
				return <div><Content key={i}>{now}</Content>{!disabled && <button id="closebutton" onClick={(e)=>onDelete(e, x)} className="app-iconOnlyButton b"><app.components.react.FixedSVG className="alphaicon">{app.___svgs.x_1}</app.components.react.FixedSVG></button> }</div>
			})}
		</div>
	</div>
};
app.components.GalleryInput.Objects = {
	unknown({children}) {
		return <div style={{height: "100%", width: "100px", textAlign: "center", display: "flex", alignItems: "center", userSelect: "none"}}><span>Unsupported type:<br /><b>{children ? children.id : children}</b></span></div>;
	},
	image: (props)=>app.components.Gallery.Objects.image(props),
	share({children}) {
		return <div style={{height: "100%", width: "100px", textAlign: "center", display: "flex", alignItems: "center", userSelect: "none"}}><span>#uncategorized.sharing#<br /><b>{children.structure}</b></span></div>;
	}
};


app.components.TextInputOne = forwardRef(function ({
		children: addAfterButtons, onNativePin, value: valueFromProps, valueIsControllable,
		className, editorClassName, disabled, onChange, placeholder, onSlateChange
	}, ref) {
    
	const editor = useMemo(() => app.components.TextInputOne.withPatchedNormalize(app.components.TextInputOne.withInlines(withReact(createEditor()))), []);
    const [initialValue] = useState(() => app.components.TextInputOne.morphToTextValueToParagraphs(valueFromProps || ''));
    
    const pinButtonRef = useRef(null);
    const isUpdatingFromProps = useRef(false);


	const actualTextValueRef = useRef(null);


	
	function morphToText(value) {
		if (!value) return "";
		return value.map(p=>{
			if (!p.alt) return p.children.map(x=>x.text || x.alt || (x.children && x.children[0] ? x.children[0].text : "")).join("")
			else return p.alt;
		}).join("\n");
	};
	
	function length(value) {
		return morphToText(value).length;
	};

    // --- РЕШЕНИЕ ПРОБЛЕМЫ №1: Безопасная синхронизация с valueFromProps ---
	useEffect(() => {
		if (!valueIsControllable || isUpdatingFromProps.current) return;

		const currentEditorText = morphToText(editor.children);
		if (valueFromProps === currentEditorText) return;
        
		isUpdatingFromProps.current = true;
        
		const newNodes = app.components.TextInputOne.morphToTextValueToParagraphs(valueFromProps || '');
        
		const selection = editor.selection;
		
		Editor.withoutNormalizing(editor, function () {
			Transforms.delete(editor, { at: { anchor: Editor.start(editor, []), focus: Editor.end(editor, []) } });
			Transforms.insertNodes(editor, newNodes, { at: [0] });
		});

		// Фикс побочного действия Slate, когда на конце образуется лишний параграф
		Editor.withoutNormalizing(editor, function () {
			let children = editor.children;
			let childrenLastIndex = editor.children.length - 1;
			if (childrenLastIndex >= 1) {
				let Node = children[childrenLastIndex];
				if (Node.type == "paragraph" && Node.children[0].text == "") {
					Transforms.removeNodes(editor, { at: [childrenLastIndex] });
				};
			};
		});



		// Пытаемся восстановить курсор, если это возможно
		if (selection && Editor.hasPath(editor, selection.anchor.path)) {
			Transforms.select(editor, selection);
		} else {
			Transforms.select(editor, Editor.end(editor, []));
		};

		// Даем микро-задаче завершиться перед сбросом флага
		Promise.resolve().then(() => {
			isUpdatingFromProps.current = false;
		});
		
	}, [valueFromProps, valueIsControllable]); // Make value controllable
	
	
	const handlePinClickInternal = async (selectedFile, sourceType) => {
        if (!selectedFile) return;

        const originalButtonContent = pinButtonRef.current ? pinButtonRef.current.innerHTML : '';
        if (pinButtonRef.current) {
            pinButtonRef.current.disabled = true;
            pinButtonRef.current.innerHTML = `<div class="fixsvg emoji" style="width:1em;height:1em;display:inline-block;">${app.___svgs.loading}</div> #button.loading#`;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const uploadResponse = await app.f.post("uploads", formData);

            // Adjusted to expect direct content from app.f as per fetcher.js
            if (typeof uploadResponse === "object" && uploadResponse.content) {
                const mediaIdentifier = uploadResponse.content; // This is like "mock_upload_image.png" or an actual server ID/filename
                // Construct a relative URL or use the identifier as needed by your backend/gallery component
                const mediaPath = `/${app.me.id}/${mediaIdentifier}`; // Example path construction
                const galleryObject = { id: "image", url: mediaPath, name: selectedFile.name }; // Added name

                if (onNativePin) {
                    onNativePin(galleryObject); // Pass the object for parent to handle
                } else {
                    const galleryString = `$${JSON.stringify([galleryObject])}`;
                    // Ensure editor has focus before inserting text, or specify a path
                    if (editor.selection) {
                        Transforms.insertText(editor, galleryString);
                    } else {
                        // If no selection, insert at the end or a default position
                        Transforms.insertText(editor, galleryString, { at: Editor.end(editor, []) });
                    }
                    // Normalizing after text change should trigger wrapValue
                    Editor.normalize(editor, { force: true });
                }
            } else {
                console.error("Upload failed, unexpected response:", uploadResponse);
                alert("#error.upload_failed#: " + app.translateError(uploadResponse?.error || uploadResponse || "#error.unknown#"));
            }
        } catch (uploadError) {
            console.error("Upload exception:", uploadError);
            alert("#error.upload_failed#: " + app.translateError(uploadError.message || "#error.network#"));
        } finally {
            if (pinButtonRef.current) {
                pinButtonRef.current.disabled = disabled; // Reset to original disabled state from props
                pinButtonRef.current.innerHTML = originalButtonContent;
            }
        }
    };

	function handleActualPinClick(event) { // Renamed from hadlePinClick to avoid conflict if any
        if (disabled) return;
        // Use app.functions.uploadFileContextMenu
        // The first argument to uploadFileContextMenu is the onselect callback
        app.functions.uploadFileContextMenu(async function (file, sourceType) { // This is the 'onselect' callback
			return handlePinClickInternal(file, sourceType);
		}, pinButtonRef.current || event.currentTarget, // toElem: the pin button itself}
		);
	};

	function handleNativeGalleryAdd(e) {
		const keys = Object.keys(app.components.TextInputOne.Element.Gallery.variations);
		const p = keys.map(x=>{
			const iAm = app.components.TextInputOne.Element.Gallery.variations[x];
			return {text: iAm.title ?? "Interact", onClick: function () {
				iAm.call(e, function (r) {
					if (r) {
						const syntax = Array.isArray(r) ? `$${JSON.stringify(r)}` : `$[${JSON.stringify(r)}]`;
						if (editor.selection) {
							Transforms.insertText(editor, syntax);
						} else {
							// If no selection, insert at the end or a default position
							Transforms.insertText(editor, syntax, { at: Editor.end(editor, []) });
						};
					};
				}, function (r) { console.error(r) });
			}};
		});
		return app.cm.create(p, {toElement: e.target});
	};
	
	function onKeyDown(event) {
		const { selection } = editor;
		// Default left/right behavior is unit:'character'.
		// This fails to distinguish between two cursor positions, such as
		// <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
		// Here we modify the behavior to unit:'offset'.
		// This lets the user step into and out of the inline without stepping over characters.
		// You may wish to customize this further to only use unit:'offset' in specific cases.
		if (selection && Range.isCollapsed(selection)) {
			const { nativeEvent } = event;
			if (isKeyHotkey('left', nativeEvent)) {
				event.preventDefault()
				Transforms.move(editor, { unit: 'offset', reverse: true })
				return
			};
			if (isKeyHotkey('right', nativeEvent)) {
				event.preventDefault()
				Transforms.move(editor, { unit: 'offset' })
				return
			};
		};
	};
	
	function hadlePinClick(event) {
		if (onNativePin) {};
	}; 


	function wrapValue() {		
		for (const p of app.components.TextInputOne.syntaxRules) {
			Editor.withoutNormalizing(editor, function () {	
				const texts = Editor.nodes(editor, {
					at: [],
					match: (node, path) => node.text && !node.children,
				});
				const prevSelection = editor.selection?.anchor && {
					path: [...editor.selection.anchor.path],
					offset: editor.selection.anchor.offset
				};
				const regex = p.regex;
				regex.lastIndex = 0;
				for (const [node, path] of texts) {
					const text = node.text;
					const matches = Array.from(text.matchAll(regex));
					for (const m of matches) {
						let index = m.index;
						let txt = m[0];
						
						/*Transforms.select(editor, {
							anchor: {path: path, offset: index},
							focus: {path: path, offset: index+txt.length}
						});
					
						Transforms.wrapNodes(editor, p.parser(txt), {
							split: true
						});*/
						
						Transforms.delete(editor, {
							at: {
								anchor: { path, offset: index },
								focus: { path, offset: index + txt.length }
							}
						});
						Transforms.insertNodes(editor, p.parser(txt), { at: { path, offset: index } });
						// optionally insert empty text node after

						//moveCursorToEnd();
					};
					regex.lastIndex = 0;
				};
				Editor.normalize(editor);
			});
		};
	};
	
	function moveCursorToEnd() {
		const end = Editor.end(editor, []);
		Transforms.select(editor, end);
		Transforms.collapse(editor, { edge: 'end' });
	};

	function handleChange(value) {
		// Пропускаем обновление при изменении курсора без изменения текста
		/*if (!editor.operations.some(op => op.type !== 'set_selection')) {
			setValue(newValue);
			return;
		}*/
		const oldMorphed = actualTextValueRef.current;
		const newValue = morphToText(value);

		if (oldMorphed != newValue) {
			actualTextValueRef.current = newValue;
			const isFocused = ReactEditor.isFocused(editor);
			wrapValue();
			onChange?.({ target: { value: newValue }});
			if (isFocused) ReactEditor.focus(editor);
		};
		
		onSlateChange?.(value);
	};

	function insertEmoji(emoji) {
		// Так и должно быть. Есть нативные и кастомные эмодзи, которые заменяются изображением, а нативные - обычные символы
		Transforms.insertText(editor, !emoji.native ? `:e:${emoji.src.split("/").reverse()[0]}:` : emoji.native);
	}; 
	
	return <div className={"app-slatetexteditor contentify" + (className ? " "+className : "")} ref={ref}>
		<Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
			<Editable
				readOnly={disabled}
				renderElement={props => <app.components.TextInputOne.Element {...props} />}
				renderLeaf={props => <app.components.TextInputOne.Text {...props} />}
				placeholder={placeholder}
				onKeyDown={onKeyDown}
				className={editorClassName}
			/>
		</Slate>
		<div className="app-structure-rating">
			<div>
				<app.structures.Rating.AddReactionButton
					onEmojiSelect={insertEmoji}
					disabled={disabled}
				/>
				<button ref={pinButtonRef} className="app-iconOnlyButton b" disabled={disabled} onClick={handleNativeGalleryAdd/* handleActualPinClick */}>
                    <app.components.react.FixedSVG className="alphaicon">{app.___svgs.pin}</app.components.react.FixedSVG>
				</button>
			</div>
			<div>
				{addAfterButtons}
			</div>
		</div>
	</div>;
});

import { default as TwemojiRegEx } from "@twemoji/parser/dist/lib/regex";
import twemoji from "@twemoji/api";




app.components.TextInputOne.syntaxRules = [
    { // Правило для галерей $[...]
        regex: /\$\[.*?\]/g,
		type: "gallery",
        parser: (match) => {
			let value = [];
			try { value = JSON.parse(match.slice(1)) } catch {};
            return {
				type: "gallery",
				value,
				alt: match,
				children: [{ text: "" }],
			};
        }
    },
    { // Правило для кастомных эмодзи :e:...:
        regex: app._emoji.cemoji,
		type: "emoji",
        parser: (match) => ({
            type: "emoji",
            url: `${app.apis.mediastorage}emoji/${match.slice(3, -1)}`,
            alt: match,
            children: [{ text: "" }], // Это inline-void элемент
        })
    },
    { // Правило для нативных эмодзи (Twemoji)
        regex: TwemojiRegEx,
		type: "emoji",
        parser: (match) => ({
            type: "emoji", // Используем тот же тип "emoji"
            url: twemoji.base + twemoji.size + "/" + twemoji.convert.toCodePoint(match) + twemoji.ext, // Генерируем URL для Twemoji
            alt: match, // Сохраняем оригинальный символ
            children: [{ text: "" }], // Это тоже inline-void
        })
    }
];
















/*app.components.TextInputOne.emojiWraps = function () {
	return [
		...app._emoji.customParse.parsers,
		[TwemojiRegEx, (m)=>twemoji.base+twemoji.size+"/"+twemoji.convert.toCodePoint(m[0])+twemoji.ext] // In some reason my non-packed emoji parser replaces default emojis in this input. So I try to use twemoji as default parser in component
	];
};
app.components.TextInputOne.voidsWraps = function () {
	return [
		[/\$\[.+\]/g, function (match) {
			let value = [];
			try { value = JSON.parse(match.slice(1)) } catch {};
			return {
				type: "gallery",
				children: [{text: ""}],
				value: value,
				alt: match
			};
		}],
	];
};*/

app.components.TextInputOne.morphToTextValueToParagraphs = function (value) {
	if (!value || typeof value != "string") return (typeof value == "object" && value !== null) ? value : [{type: "paragraph", children: [{text: value!==undefined ? String(value) : ""}]}];
	
	const result = value.split("\n").map(x=>{
		for (const parser of app.components.TextInputOne.syntaxRules) {
			if (parser.regex.test(x)) {
				if (app.components.TextInputOne.voids.includes(parser.type) && !app.components.TextInputOne.inlines.includes(parser.type)) {
					return parser.parser(x.match(parser.regex)[0]);
				};
			};
		};
		return {type: "paragraph", children: app.components.TextInputOne.morphToTextValueToParagraphs.morphStrokeToChildrens(x)};
	});
	
	if (result[0].type != "paragraph") {
		result.splice(0, 0, {type: "paragraph", children: [{text: ""}]});
	};
	if (result[result.length-1].type != "paragraph") {
		result.splice(result.length, 0, {type: "paragraph", children: [{text: ""}]});
	};
	
	return result;
};

app.components.TextInputOne.morphToTextValueToParagraphs.morphStrokeToChildrens = function (text) {
	if (text == "") return [{text: ""}];
	let val = [{text: text}];
	let v;
	for (const p of app.components.TextInputOne.syntaxRules) {
		v = [];
		const regex = p.regex;
		regex.lastIndex = 0;
		for (const a of val) {
			let d;
			if (!a.type && !a.children) {
				let t = a.text;
				while ((d=regex.exec(t))) {
					let firstText = {text: t.slice(0, d.index)};
					/*if (firstText.text) */v.push(firstText);
					let emj = p.parser(d[0]);
					v.push(emj);
					t = t.slice(d.index+d[0].length);
					regex.lastIndex = 0;
				};
				/*if (t) { */v.push({text: t}) /*}*/;
			} else {
				v.push(a);
			};
		};
		val = v;
	};
	
	return val;
};

app.components.TextInputOne.InlineChromiumBugfix = () => (
	<span
		contentEditable={false}
		style={{fontSize: 0}}
	>
		{String.fromCodePoint(160) /* Non-breaking space */}
	</span>
);
app.components.TextInputOne.InlineChromiumBugfix1 = () => (
	/* Этот фикс мне предложил ChatGPT */
	<span
		contentEditable
		style={{
			display: 'inline-block',
			width: 0,
			height: 0,
			overflow: 'hidden',
			visibility: 'hidden', // НЕ display:none
		}}
	>
		{'\uFEFF'}
	</span>
);
app.components.TextInputOne.InlinePadding = () => (
	/* Этот фикс мне предложил ChatGPT */
	<div style={{
		display: "inline-block",
		width: 0,
		height: 0,
		overflow: "hidden",
		visibility: "hidden"
	}}/>
);

// Copied from examples
app.components.TextInputOne.voids = ["emoji", "gallery"];
app.components.TextInputOne.inlines = ["emoji"];
app.components.TextInputOne.unEditable = ["emoji", "gallery"];

app.components.TextInputOne.withInlines = editor => {
	const voids = app.components.TextInputOne.voids;
	const inlines = app.components.TextInputOne.inlines;
	const unEditable = app.components.TextInputOne.unEditable;
	
	const { insertData, insertText, isInline, isElementReadOnly, isSelectable, isVoid } = editor;
	editor.isInline = element =>
		inlines.includes(element.type) || isInline(element);
	editor.isVoid = element =>
		voids.includes(element.type) || isVoid(element);
	editor.isElementReadOnly = element =>
		unEditable.includes(element.type) || isElementReadOnly(element);
	editor.isSelectable = element =>
		unEditable.includes(element.type) ? false : isSelectable(element);
	editor.insertText = text => {
		insertText(text);
	};
	/*editor.insertData = data => {
		const text = data.getData('text/plain');
		insertData(data);
	};*/
	return editor
};

app.components.TextInputOne.withPatchedNormalize = editor => {
	const { isInline, isVoid, normalizeNode } = editor;
	
	/*editor.normalizeNode = entry => {
		const [node, path] = entry;

		// --- РЕШЕНИЕ ПРОБЛЕМЫ №3 и №2: "ЗАСТРЕВАНИЕ" КУРСОРА и ENTER ПОСЛЕ ГАЛЕРЕИ ---
		if (SlateElement.isElement(node) && node.type === 'gallery') {
			const nextEntry = Editor.next(editor, { at: path });
			// Если после галереи ничего нет, ИЛИ следующий элемент - не пустой параграф,
			// то мы должны принудительно вставить пустой параграф после нее.
			if (!nextEntry || !SlateElement.isElement(nextEntry[0]) || nextEntry[0].type !== 'paragraph') {
				const newParagraphPath = Path.next(path);
				Transforms.insertNodes(
					editor,
					{ type: 'paragraph', children: [{ text: '' }] },
					{ at: newParagraphPath, select: true }
				);
				return; // Прерываем нормализацию, Slate начнет заново
			}
		}
        
		// Вызываем стандартный normalizeNode для остальной логики Slate
		normalizeNode(entry);
	};*/
	
	/*editor.normalizeNode = entry => {
		const [node, path] = entry;

		if (Editor.isVoid(editor, node)) {
			const isFocused = editor.selection && Editor.hasPath(editor, path) && Path.equals(Editor.path(editor, editor.selection), path);
			if (isFocused) {
				// Переместить курсор, если он внутри void
				Transforms.move(editor, { distance: 1, unit: 'offset' });
				return;
			};
		};

		normalizeNode(entry);
	};*/
	
	editor.normalizeNode = entry => {
		const [node, path] = entry;
		
		if (SlateElement.isElement(node) && editor.isVoid(node) && !editor.isInline(node)) {
			const parent = Editor.parent(editor, path)[0];
			const index = path[path.length - 1];
    
			// Последний ребенок? Тогда добавляем новый пустой параграф
			if (index === parent.children.length - 1) {
				Transforms.insertNodes(
					editor,
					{ type: 'paragraph', children: [{ text: '' }] },
					{ at: Path.next(path) }
				);
				return;
			};
		};
		
		
		if (editor.isVoid(node) && !editor.isSelectable(node)) {
			const { selection } = editor;
			if (selection && Range.isCollapsed(selection)) {
				const { anchor } = selection;
				if (Path.equals(path, anchor.path.slice(0, path.length))) {
					// если курсор внутри void — двигаем вправо
					const point = Editor.after(editor, path);
					Transforms.select(editor, point);
					return;
				}
			}
		};
		
		normalizeNode(entry);
	};
	
	
	return editor;
};

app.components.TextInputOne.Element = props => {
	const { attributes, children, element } = props;
	switch (element.type) {
		case "emoji":
			return <app.components.TextInputOne.Element.Emoji {...props}/>;
		case "gallery":
			return <app.components.TextInputOne.Element.Gallery {...props}/>;
		default:
			return <p {...attributes}>{children}</p>;
	};
};


/*app.components.TextInputOne.Element.Emoji = props => {
	const selected = useSelected();
	const { attributes, children, element } = props;

	return <span {...attributes} data-playwright-selected={selected} contentEditable={false} style={{padding: 0, margin: 0, lineHeight: 0, filter: selected ? "opacity(0.5)" : null}}>
		<app.components.TextInputOne.InlineChromiumBugfix/>
		<img className="emoji" draggable={false} alt={element.children[0].text} src={element.url}/>
		{children}
		<app.components.TextInputOne.InlineChromiumBugfix/>
	</span>;
};*/
app.components.TextInputOne.Element.Emoji = ({ attributes, children, element }) => {
	const selected = useSelected();
	return (
		<span 
			{...attributes}
			contentEditable={false}
			style={{ 
				display: 'inline-block',
				position: 'relative',
				lineHeight: 0
			}}
		>
			<img
				src={element.url}
				className="emoji"
			/>
			{children}
		</span>
	);
};

/*app.components.TextInputOne.Element.Gallery = function ({ attributes, children, element }) {
	const value = element.value ?? [];
	const editor = useSlateStatic();
	const readOnly = useReadOnly();
	const selected = useSelected();
	
	function set(val) {
		const path = ReactEditor.findPath(editor, element);
		const newProperties = {
			value: val,
			alt: "$"+JSON.stringify(val)
		};
		Transforms.setNodes(editor, newProperties, { at: path });
	};
	
	const [ index, setIndex ] = useState(0);
		
	const [ waiting, setWaiting ] = useState(false);
	
	function handleAdd(e) {
		const keys = Object.keys(app.components.TextInputOne.Element.Gallery.variations);
		const p = keys.map(x=>{
			const iAm = app.components.TextInputOne.Element.Gallery.variations[x];
			return {text: iAm.title ?? "Interact", onClick: function () {
				setWaiting(true);
				iAm.call(e, function (r) {
					setWaiting(false);
					if (r) {
						let newValue = [...value.slice(0, index+1), r, ...value.slice(index+1)];
						set(newValue);
						setIndex(index+1);
					};
				}, function (r) { setWaiting(false);console.error(r) });
			}};
		});
		return app.cm.create(p, {toElement: e.target});
	};
	function handleRemove(e) {
		const obj = value[index];
		let newValue = [...value.filter(x=>x!=obj)];
		if (!obj) return
		else {
			const iAm = app.components.TextInputOne.Element.Gallery.variations[obj.id];
			if (!iAm || (iAm && !iAm.remove)) set(newValue)
			else {
				setWaiting(true);
				iAm.remove(e, obj, function (a) {
					let b = value.length-1 == index;
					if (a!==false) set(newValue);
					setWaiting(false);
				}, function (r) { setWaiting(false);console.error(r) });
			};
		};
	};
	
	return <div {...attributes} contentEditable={false} style={{position: "relative", width: "100%", ...(selected && {filter: "opacity(0.5)"})}}>
		<app.components.Gallery medias={value} onIndexChange={({index})=>setIndex(index)}/>
		{!readOnly && <span style={{position: "absolute", left: 0, bottom: 0}}><button disabled={waiting} className="app-button1 primary" onClick={handleAdd}>Add</button><button disabled={waiting} className="app-button1 primary" onClick={handleRemove}>Remove</button> index {index}{waiting && " (waiting)"}</span>}
		{children}
	</div>;
};*/
app.components.TextInputOne.Element.Gallery = function ({ attributes, children, element }) {
	const value = element.value ?? [];
	const editor = useSlateStatic();
	const readOnly = useReadOnly();
	const selected = useSelected();
	
	function set(val) {
		const path = ReactEditor.findPath(editor, element);
		const newProperties = {
			value: val,
			alt: "$"+JSON.stringify(val)
		};
		Transforms.setNodes(editor, newProperties, { at: path });
	};
	
	const [galleryWaiting, setGalleryWaiting] = useState(false);
	
	function handleGalleryAdd(e) {
		const keys = Object.keys(app.components.TextInputOne.Element.Gallery.variations);
		const p = keys.map(x=>{
			const iAm = app.components.TextInputOne.Element.Gallery.variations[x];
			return {text: iAm.title ?? "Interact", onClick: function () {
				setGalleryWaiting(true);
				iAm.call(e, function (r) {
					setGalleryWaiting(false);
					if (r) {
						let newValue = [...value, r];
						if (Array.isArray(r)) {
							newValue = [...value, ...r];
						} else {
							newValue = [...value, r];
						};
						set(newValue);
					};
				}, function (r) { setGalleryWaiting(false);console.error(r) });
			}};
		});
		return app.cm.create(p, {toElement: e.target});
	};
	function handleGalleryRemove(e, obj) {
		let newValue = [...value.filter(x=>x!=obj)];
		if (!obj) return
		else {
			const iAm = app.components.TextInputOne.Element.Gallery.variations[obj.id];
			if (!iAm || (iAm && !iAm.remove)) set(newValue)
			else {
				setGalleryWaiting(true);
				iAm.remove(e, obj, function (a) {
					if (a!==false) set(newValue);
					setGalleryWaiting(false);
				}, function (r) { setGalleryWaiting(false);console.error(r) });
			};
		};
	};

	return <div contentEditable={false} style={{padding: "15px", borderRadius: "10px", backgroundColor: "var(--thirdColor)"}}>
		<app.components.GalleryInput disabled={readOnly || galleryWaiting} onDelete={handleGalleryRemove}>{value}</app.components.GalleryInput>
		<br />
		{!readOnly && <button className="app-button1 primary" disabled={galleryWaiting} onClick={handleGalleryAdd}>#button.addnew#</button>}
	</div>
};

app.components.TextInputOne.Element.Gallery.variations = {
	"image": {
		"title": "#button.uploadimage#",
		async call(e, s, err) {
			const c = e.target;
			const result = await new Promise(r=>app.functions.uploadFileContextMenu(r, c, ()=>r(false)));
			if (!result) s(false)
			else {
				const formData = new FormData();
				formData.append("file", result);
				const resp = await app.f.post("uploads", formData);
				if (typeof resp == "object") {
					s({id: "image", url: `/${app.me.id}/${resp.content}`});
				} else err(resp)
			};
			return;
		},
		async remove(e, o, s, err) {
			s();
			if (o.url.startsWith(`/${app.me.id}`) || !o.url.startsWith("/")) {
				app.functions.youReallyWantToDo(async function () {
					await app.f.remove("uploads", {name: o.url.startsWith("/") ? o.url.slice(`/${app.me.id}`.length) : o.url})
				}, null, "#page.modal.uncategorized.remove_image#");
			};
		}
	},
	"uploaded_image": {
		"title": "#button.selectuploaded#",
		async call(e,s,err) {
			const result = await new Promise(r=>{
				app.functions.fileFromSelected(
					r,
					(result)=>{ if (result=="closed") r(false) },
					false
				)
			});
			if (result) return s(result.map(x=>({id: "image", url: `/${app.me.id}/${x}`})))
			else err(false);
		}
		/* функция remove никогда не вызовется */
	}
};

app.components.TextInputOne.Text = props => {
	const { attributes, children, leaf } = props
	return (
		<span
			// The following is a workaround for a Chromium bug where,
			// if you have an inline at the end of a block,
			// clicking the end of a block puts the cursor inside the inline
			// instead of inside the final {text: ''} node
			// https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
			style={{
				...(leaf.text === '' && { 
					paddingLeft: "0.1",
					/*'&::after': {
						content: "'\\200B'",
						position: 'absolute'
					}*/
				})
			}}
			{...attributes}
		>
		{children}
		</span>
	)
};

app.structures.Rating = function ({children, rating, contentType, contentId, ...val}) {
	/*
	{
		"liked": 2,
		"disliked": 0,
		"comments": 1,
		"myRating": 1,
		"commentedByAuthor": false,
		"ratedByAuthor": true,
		"authorId": 1,
		"authorOfThis": { User },
		"reactions": [
			{count: 2, emoji: {id: '7', type: 'custom'}}
		],
		"myReactions": [{id: '7', type: 'custom'}]
	}
	*/
	const [actually, update] = useImmer(children ?? rating ?? {liked: 0, disliked: 0, comments: 0, reactions: []});
	const [processing, setProcessing] = useState(contentType && contentId ? false : true);
	
	useEffect(function () {
		update(children ?? rating ?? {liked: 0, disliked: 0, comments: 0, reactions: []});
		setProcessing(contentType && contentId ? false : true);
	}, [children, rating, contentType, contentId])
	
	async function processLike(event) {
		setProcessing(true);
		if (typeof app.me=="object") {
			update(actually=>{actually.myRating===1 ? actually.liked-- : actually.liked++});
			const response = await app.f.patch(`rating/${contentType}/${contentId}`, {rate: 1});
			if (typeof response == "object" && typeof response.content == "object") {
				update(response.content);
			} else {
				update(actually=>{actually.myRating===1 ? actually.liked++ : actually.liked--});
			};
		} else await app.functions.youMightToLogin();
		setProcessing(false);
	};
	function processReaction(emoji) {
		return async function(event) {
			setProcessing(true);
			if (typeof app.me=="object") {
				const response = await app.f.patch(`rating/${contentType}/${contentId}`, {rate: 3, emoji: emoji});
				if (typeof response == "object" && typeof response.content == "object") {
					update(actually=>{actually.reactions = response.content;actually.tooManyReactions=response.tooManyReactions});
				} else {
				};
			} else await app.functions.youMightToLogin();
			setProcessing(false);
		};
	};
	async function processAddReaction(emoji) {
		setProcessing(true);
		if (typeof app.me=="object") {
			const emojiId = emoji.native ?? emoji.src.split("/").reverse()[0];
			const response = await app.f.patch(`rating/${contentType}/${contentId}`, {rate: 3, emoji: emojiId});
			if (typeof response == "object" && typeof response.content == "object") {
				update(actually=>{actually.reactions = response.content;actually.tooManyReactions=response.tooManyReactions});
			} else {
			};
		} else await app.functions.youMightToLogin();
		setProcessing(false);
	};
	
	return <div className="app-structure-rating">
		<div>
			<div><button className="app-iconOnlyButton b" onClick={()=>processLike()} disabled={processing}><app.components.react.FixedSVG className={`alphaicon${actually.myRating==1 ? " fill" : ""}`}>{app.___svgs.heart}</app.components.react.FixedSVG></button>{actually.liked > 0 ? ` ${actually.liked}` : null}</div>
			{ !val.hideReactions && Array.isArray(actually.reactions) && actually.reactions.length != 0 &&
				<span>
					{actually.reactions.map((x)=>{
						return <app.structures.Rating.Reaction onClick={processReaction(x.emoji.id)} loading={processing} key={`${x.emoji.type}${x.emoji.id}`} reaction={
							{...x, ratedByMe: x.ratedByMe ?? !!actually.myReactions.filter(z=>z.type==x.emoji.type&&z.id===x.emoji.id)[0] ?? false}
						}/>
					})}
				</span>
			}
			{ !val.hideReactions && !actually.tooManyReactions && <app.structures.Rating.AddReactionButton disabled={processing} onEmojiSelect={processAddReaction}/> }
		</div>
		<div>
			{val.onRepost && <button className="app-iconOnlyButton b" disabled={processing} onClick={val.onRepost}><app.components.react.FixedSVG className="alphaicon">{app.___svgs.repost}</app.components.react.FixedSVG></button>}
			{val.openFull && <app.components.react.UnderRouterLink to={val.openFull} className="app-iconOnlyButton b" onClick={()=>{}}><app.components.react.FixedSVG className="alphaicon">{app.___svgs.open}</app.components.react.FixedSVG></app.components.react.UnderRouterLink>}
			<div><button className="app-iconOnlyButton b" onClick={val.onCommentClick} disabled={!val.onCommentClick || processing}><app.components.react.FixedSVG className="alphaicon">{app.___svgs.comment}</app.components.react.FixedSVG></button>{actually.comments > 0 ? ` ${actually.comments}` : null}</div>
			{val.moreButtonCallback && <button className="app-iconOnlyButton b" disabled={processing} onClick={val.moreButtonCallback}><app.components.react.FixedSVG className="alphaicon">{app.___svgs.more}</app.components.react.FixedSVG></button>}
		</div>
	</div>;
};

app.structures.Rating.AddReactionButton = function ({ disabled, onEmojiSelect }) {
	const [isOpen, setIsOpen] = useState(false);
	
	const [debounce, setDebounce] = useState(false);
	
	/*const [buttonRef, setButtonRef] = useState(null);
	const [pickerRef, setPickerRef] = useState(null);*/

	/*const { styles, attributes } = usePopper(buttonRef, pickerRef, {
		placement: 'bottom-start',
		modifiers: [
			{
				name: 'offset',
				options: {
					offset: [0, 4],
				},
			},
		],
	});*/
	const {refs, floatingStyles} = useFloating({
		placement: "bottom-start",
		middleware: [
			offset(4),
			flip(),
			shift({padding: 5})
		]
	});

	function handleClick(e) {
		e.stopPropagation();
		setIsOpen(isOpen=>!isOpen);
	};
	
	function handleClose(e) {
		e.stopPropagation();
		if (debounce) return
		else setIsOpen(false);
	};
	if (debounce) setTimeout(()=>setDebounce(false), 500);
	
	function handleOnEmojiSelect(emoji) {
		setIsOpen(false);
		if (onEmojiSelect) return onEmojiSelect(emoji);
	};
	return (
		<>
			<button disabled={disabled} ref={refs.setReference} onClick={handleClick} className="app-iconOnlyButton b"><app.components.react.FixedSVG className="alphaicon fill">{app.___svgs.add_emoji}</app.components.react.FixedSVG></button>
			{isOpen && <app.components.Picker
				ref={refs.setFloating} style={floatingStyles}
				onEmojiSelect={handleOnEmojiSelect}
				onClickOutside={handleClose}
			/>}
		</>
	);
};


app.structures.Rating.Reaction = function (val) {
	// {emoji: {"type": "custom", "id": 7}, count: 3}
	// {emoji: {"type": "non-custom", "id": "🦊"}, count: 5, ratedByMe: true}
	const info = val.children ?? val.reaction;
	return <button className={`app-structure-reaction${info.ratedByMe ? " reacted" : ""}`} onClick={val.onClick} disabled={val.loading===true}>{info.emoji.type == "custom" ? `:e:${info.emoji.id}:` : info.emoji.id} {!isNaN(info.count) ? info.count : "?"}</button>
};



app.structures.MipuAdvPostPreview = function ({ children, style }) {
	const { id, preview, views } = children;
	
	return <div style={style} className="app-mipuadvpostpreview">
		<div className="ddd" style={{ backgroundImage: 'url("' + app.apis.mediastorage + ( `/posts/${id}/${ preview ? preview : "preview.webp" }` ) + '")' }}>
			<div className="sh"/>
		</div>
		<span><app.components.react.FixedSVG className="a" children={app.___svgs.play}/> {app.functions.parseCount(views)}</span>
	</div>;
};

app.components.MipuAdvPostSearchCard = function ({ children }) {
	const { author, id, description } = children;
	return <div className="app-mipuadvpostcardpreview">
		<Link to="/feed" state={{data: [children]}}><app.structures.MipuAdvPostPreview children={children}/></Link>
		<div id="authorblock">
			<app.components.Avatar user={author} style={{height: 50}}/>
			<div>
				{description && <><span>{app.functions.microDesc(description, 15)}</span><br /></> }
				<b><app.components.Username href user={author}/></b>
			</div>
		</div>
	</div>;
};



// Компоненты, сгенерированные ИИ. Я буду молиться Gemini, если реализация комментариев реально будет рабочая

/**
 * Компонент для отображения формы создания/редактирования комментария.
 */

app.structures.CommentForm = forwardRef(function ({
    initialData, contentType, contentId, inThreadId,
    onSuccess, onCancel, author: propAuthor,
	onInput
}, ref) {
    const { me } = app.reactstates.useInformationAboutMe();
    const [commentData, updateCommentData] = useImmer(
        initialData ? { content: initialData.content, medias: initialData.medias || [], objectMedias: initialData.objectMedias || [] }
                      : { content: "", medias: [], objectMedias: [] }
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    //const submitButtonRef = useRef(null); // Ref for the submit button

	//useEffect(function () { if (onInput) onInput(commentData) }, [onInput, commentData]);
	/*const handleOnInput = useCallback(function () {
		if (onInput) onInput(commentData);
	}, [commentData, onInput]);*/
	/*function handleOnInput(d) {
		if (onInput) onInput(d);
	};*/
	let lastEmittedData = useRef(JSON.stringify(commentData));
	useEffect(function () {
		let d = JSON.stringify(commentData);
		if (onInput && commentData && d!=lastEmittedData.current) onInput(commentData); 
		lastEmittedData.current = d;
	}, [ commentData, onInput ]);

    const isEditing = initialData && !!initialData.id;
    const authorToDisplay = app.functions.alignUserWithDefaultTypes(initialData ? (initialData.author || propAuthor || me) : (propAuthor || me));

    const internalHandleSubmit = async (event) => { // Renamed to avoid conflict with prop
        if(event) event.preventDefault(); // Prevent default form submission
        
        setError(null);

        if (!me && !isEditing) {
            await app.functions.youMightToLogin();
            return false; // Indicate submission did not proceed
        }
		
        /*if (!commentData.content.trim() && (commentData.medias || []).length === 0 && (commentData.objectMedias || []).length === 0) {
            setError("#error.comment_empty#");
            return false; // Indicate submission did not proceed
        } Позволяем запросу дойти до API, даже если он пустой. На самом деле, просто нету нормальной отладки пустого контента, поэтому пускай так */

        let response;
        try {
            if (isEditing) {
                response = await app.f.patch(`comment/${initialData.id}`, { content: commentData.content, medias: commentData.medias, objectMedias: commentData.objectMedias });
            } else if (inThreadId) {
                response = await app.f.post(`comment/${inThreadId}`, { content: commentData.content, medias: commentData.medias, objectMedias: commentData.objectMedias, contentType, contentId });
            } else {
                response = await app.f.post(`comments/${contentType}/${contentId}`, { content: commentData.content, medias: commentData.medias, objectMedias: commentData.objectMedias });
            }
            // Adjusted based on app.f structure from fetcher.js
            if (typeof response == "object" && response.status != "error" && response.content.id) { // Assuming successful post/patch returns the comment object with an ID
                if (onSuccess) onSuccess(response.content); // Pass the whole content
                if (!isEditing) {
                    updateCommentData(draft => {
                        draft.content = "";
                        draft.medias = [];
                        draft.objectMedias = [];
                    });
                };
                return true; // Indicate success
            } else {
                setError(app.translateError(typeof response == "object" ? response.content : response));
                return false; // Indicate failure
            }
        } catch (e) {
            console.error("Comment submission error:", e);
            setError(app.translateError("#error.network#"));
            return false; // Indicate failure
        }
    };
    
    // Wrap internalHandleSubmit with the global processButton
    // The processButton from another_utils.js takes the button element as its second argument
    const wrappedSubmitHandler = useCallback(
        (event) => {
            if (event) event.preventDefault(); // Ensure default is prevented for form onSubmit
            // Call the global processButton, passing the submit button's ref
        },
        [commentData, onSuccess, onCancel, isEditing, inThreadId, contentType, contentId, me, updateCommentData, initialData]
    );
	
	useEffect(function () {
		setIsProcessing(me=="guest");
	}, [me]);


    return (
        <div className="app-structure-comment-form usercomment">
            <div className="authorinfo">
                <app.components.Avatar user={authorToDisplay} />
                <span>
                    <app.components.Username.Extended user={authorToDisplay} />
                    <br />
                    <span>{isEditing ? "#uncategorized.editing_comment#" : (inThreadId ? "#uncategorized.replying#" : "#uncategorized.new_comment#")}</span>
                </span>
            </div>

            {error && <app.components.ErrorAlert>{error}</app.components.ErrorAlert>}

            <form ref={ref} onSubmit={wrappedSubmitHandler}> {/* Use wrappedSubmitHandler here */}
				{ [...(commentData.medias ?? []), ...(commentData.objectMedias ?? [])] && [...(commentData.medias ?? []), ...(commentData.objectMedias ?? [])].length > 0 && <app.components.GalleryInput disabled>{[...(commentData.medias ?? []), ...(commentData.objectMedias ?? [])]}</app.components.GalleryInput>}
                <app.components.ContentInput
                    value={commentData.content}
                    onChange={(e) => { updateCommentData(draft => { draft.content = e.target.value; }) }}
                    placeholder={me=="guest" ? "#uncategorized.accountisrequiredtocomment#" : "#uncategorized.new_comment_placeholder#"}
                    disabled={isProcessing}
                    editorClassName="comment-input-editor"
					valueIsControllable
                >
                    <div style={{ textAlign: 'right', marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {onCancel && (
                            <button type="button" className="app-button1" onClick={onCancel} disabled={isProcessing}>
                                #button.cancel#
                            </button>
                        )}
                        { false && <button type="submit" onClick={processButton(
								/*(event) => internalHandleSubmit(event), // The async function to execute
								submitButtonRef.current,          // The button element
								"#button.processing#",            // Working text
								"#error.submit_failed#",        // Error text
								isEditing ? "#button.saved#" : (inThreadId ? "#button.replied#" : "#button.sent#"), // Success text
								(success, result) => { setIsProcessing(false) }, // After callback
								false,                            // disableAfterSuccess
								(e_event, e_error) => { return app.translateError(e_error.message); } // fastlyErrorHandle*/
								(event) => {
									setIsProcessing(true);
									const prm = internalHandleSubmit(event);
									prm.finally(()=>setIsProcessing(false));
									return prm;
								}
							)}
							className="app-button1 primary" disabled={isProcessing} ref={submitButtonRef}>
                           {/* Text is now handled by processButton, but keep a fallback or initial state */}
                           {isEditing ? "#button.apply#" : (inThreadId ? "#button.reply#" : "#button.send#")}
                        </button> }
						<app.components.ProcessButton
							onClick={(event) => {
									setIsProcessing(true);
									const prm = internalHandleSubmit(event);
									prm.finally(()=>setIsProcessing(false));
									return prm;
							}}
							className="app-button1 primary" disabled={isProcessing}
						>{isEditing ? "#button.apply#" : (inThreadId ? "#button.reply#" : "#button.send#")}</app.components.ProcessButton>
                    </div>
                </app.components.ContentInput>
            </form>
        </div>
    );
});

app.structures.Comment = function ({ commentData: initialCommentData, repliesPreview, contentAuthor, onReply, onDelete, onEdit }) {
    const { me } = app.reactstates.useInformationAboutMe();
    const [isEditing, setIsEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    
    const [currentCommentData, updateCurrentCommentData] = useImmer(initialCommentData ?? {});
	const [readedPreviews, updateReadedPreviews] = useImmer([]);

    useEffect(() => {
        updateCurrentCommentData(initialCommentData ?? {});
    }, [initialCommentData, updateCurrentCommentData]);

    const isOwnComment = me && me.id === currentCommentData.author?.id;
    const authorIsContentAuthor = currentCommentData.rating ? currentCommentData.rating.authorId == currentCommentData.author?.id : false; //contentAuthor && currentCommentData.author?.id === contentAuthor.id;

    const handleEditSuccess = (updatedComment) => {
        updateCurrentCommentData(updatedComment);
        setIsEditing(false);
        if(onEdit) onEdit(updatedComment);
    };

    const internalDeleteHandler = async () => { // Pass button element
        if (!isOwnComment) return NaN; // Indicate no action if not own comment
        const confirm = await app.functions.youReallyWantToDo(null);
        if (confirm) {
            try {
                const response = await app.f.remove(`comment/${currentCommentData.id}`);
                if (typeof response === 'string' && response.startsWith('host_error')) { // Check for app.f error string
                     throw new Error(app.translateError(response));
                } else if (response && response.error) { // Check for API error structure
                     throw new Error(app.translateError(response.error));
                }
                // Assuming success if no error string or error object from app.f
                if (onDelete) onDelete(currentCommentData.id);
                return "#comment.deleted_successfully#"; // Success message for processButton
            } catch (e) {
                console.error("Delete comment error:", e);
                alert(app.translateError(e.message || "#error.network#")); // Show alert for critical errors
                throw e; // Re-throw for processButton to handle
            }
        }
        return NaN; // Indicate cancellation for processButton
    };
	
	const handleShowReplies = () => {
		setShowReplies(s => {
			const show = !s;
			
			
			updateReadedPreviews(draft=>{
				if (Array.isArray(repliesPreview)) {
					repliesPreview.map(x=>x.id).filter(x=>!readedPreviews.includes(x)).forEach(x=>draft.push(x));
				};
				draft.forEach(x=>{
					if (!Array.isArray(repliesPreview) || (Array.isArray(repliesPreview) && !repliesPreview.find(y=>y.id==x))) {
						draft.splice(draft.indexOf(x), 1);
					};
				});
			});
			
			return show;
		});
	};
    
    const moreMenuCallback = (event) => {
        const items = [];
        if (isOwnComment) {
            items.push({ text: <><app.components.react.FixedSVG className="alphaicon a">{app.___svgs.edit || app.___svgs._x}</app.components.react.FixedSVG> #button.edit#</>, onClick: () => setIsEditing(true) });
            items.push({ 
                text: <><app.components.react.FixedSVG className="alphaicon a">{app.___svgs.trash || app.___svgs._x}</app.components.react.FixedSVG> #button.remove#</>, 
                onClick: (e_cm) => { // e_cm is context menu event
                    /*const buttonElement = event.target.closest('button') || event.target; // Get the button that opened the menu
                     window.processButton(
                        async () => internalDeleteHandler(e_cm, buttonElement),
                        buttonElement, // Pass the button element
                        "#button.processing#",
                        "#error.delete_failed#",
                        "#comment.deleted_successfully#",
                        (success, result) => { console.log("After delete:", success, result); }
                    )();*/
					// ИИ явно совершил то, что не нужно
					
					
					internalDeleteHandler();
                }
            });
        }
        if (items.length > 0) {
            app.cm.create(items, { toElement: event.target });
        }
    };
    
    if (isEditing) {
        return (
            <app.structures.CommentForm
                initialData={currentCommentData}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
                author={currentCommentData.author}
            />
        );
    }

    return (
        <div className={`usercomment commentWithTheId${currentCommentData.id} ${authorIsContentAuthor ? 'comment-by-content-author' : ''}`}>
            <div className="authorinfo">
                <app.components.Avatar user={currentCommentData.author} />
                <span>
                    <app.components.Username.Extended.allowRedirect user={currentCommentData.author} />
                    <br />
                    <span title={app.functions.date(currentCommentData.created)}>
                        🕑 {app.functions.ago(currentCommentData.created)}
                        {currentCommentData.edited ? ", #uncategorized.edited#" : ""}
                    </span>
                </span>
            </div>

            <app.components.Content fromContent={currentCommentData}>{currentCommentData.content}</app.components.Content>

            {(currentCommentData.medias?.length > 0 || currentCommentData.objectMedias?.length > 0) && (
                <app.components.Gallery
                    content={currentCommentData}
                    medias={[
                        ...(currentCommentData.medias || []).map(x => {
                            if (typeof x === "string" && !(x.startsWith("http:") || x.startsWith("https:") || x.startsWith("data:"))) {
                                return `${app.apis.mediastorage}${currentCommentData.author?.id || 'unknown_author'}/${x}`; // Added fallback for author ID
                            }
                            return x; 
                        }),
                        ...(currentCommentData.objectMedias || [])
                    ]}
                />
            )}
            
            {currentCommentData.shareContent && (
                 <p style={{ margin: '10px 0', padding: '5px', backgroundColor: 'var(--thirdColor)', borderRadius: '4px' }}>
                    <app.components.react.FixedSVG className="alphaicon a">{app.___svgs.next || app.___svgs._x}</app.components.react.FixedSVG>
                    <span id="share-context">{currentCommentData.shareContent}</span>
                 </p>
            )}

            <app.structures.Rating
                rating={currentCommentData.rating ? JSON.parse(JSON.stringify(currentCommentData.rating)) : null}
                contentType="comments"
                contentId={currentCommentData.id}
                moreButtonCallback={isOwnComment || (app.me && app.me.isAdmin) ? moreMenuCallback : null} // Allow admin to see more options too
                onCommentClick={() => {
                    if (onReply) onReply(currentCommentData); 
                    else if (!currentCommentData.in_thread) handleShowReplies(); // Only toggle for top-level if no onReply
                }}
            />
            
            {/* Removed separate reply button, integrated into Rating's onCommentClick */}

            {showReplies && currentCommentData.id && !currentCommentData.in_thread && (
                <div style={{ marginLeft: '20px', marginTop: '10px', borderLeft: '2px solid var(--secondaryColor)', paddingLeft: '10px' }}>
                    <app.structures.CommentList
                        threadId={currentCommentData.id}
                        contentAuthor={contentAuthor}
                        isThread={true} // This list is specifically for replies to currentCommentData.id
                        //contentType={currentCommentData.contentType} // Pass parent's contentType
                        //contentId={currentCommentData.contentId}     // Pass parent's contentId
                    />
                </div>
            )}
			
			{/* Предпросмотр всяких там ляляля ответов */}
			{/* Если что, практически весь остальной код, кроме следующего фрагмента, является результатом вайб-кодинга */}
			{!showReplies && !currentCommentData.in_thread && repliesPreview && repliesPreview.filter(x=>!readedPreviews.includes(x.id)).length > 0 && (
				<div style={{ marginLeft: '20px', marginTop: '10px', borderLeft: '2px solid var(--secondaryColor)', paddingLeft: '10px' }}>{
					repliesPreview.filter(x=>!readedPreviews.includes(x.id)).map(x=>(
						<app.structures.Comment
							key={x.id}
							commentData={x}
							onReply={handleShowReplies}
							onDelete={onDelete}
							onEdit={onEdit}
						/>
					))
				}</div>
			)}
        </div>
    );
};

app.structures.CommentList = function ({ contentType, contentId, threadId, contentAuthor, isThread = false, openCommentId }) {
    const [comments, setComments] = useImmer([]);
	const [repliesTo, updateRepliesTo] = useImmer({});
	
	const [isCommentsRealTimeListenerEnabled, setIsCommentsRealTimeListenerEnabled] = useState(true);
	
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState(0);
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);

	const replyRef = useRef(null);
	const ref = useRef(null);
	
	const canLoadMoreRef = useRef(false);
	const sortRef = useRef(0);

    const filtersType = [
        { id: 0, name: "#uncategorized.sorts.default#", reverseRealTime: true },
		{ id: 1, name: "#uncategorized.sorts.new#", reverseRealTime: false },
        { id: 2, name: "#uncategorized.sorts.old#", reverseRealTime: true },
		{ id: 3, name: "#uncategorized.sorts.popular#", reverseRealTime: true }
    ];

    const fetchComments = useCallback(async (currentPage, currentSort, resetList = false) => {
        if (!contentType && !threadId) { // Do not fetch if essential IDs are missing
             setError("#error.missing_comment_context#");
             setIsLoading(false);
             setCanLoadMore(false);
             return;
        };
        setIsLoading(true);
        setError(null);
        let endpoint;
        const params = { page: currentPage, sort: currentSort };

        /*if (threadId) {
            endpoint = `comment/${threadId}/thread`;
        } else {
            endpoint = `comments/${contentType}/${contentId}`;
        }*/

        try {
            // const response = await app.f.get(endpoint, params);
            // Adjusted based on app.f structure from fetcher.js
			
			const response = await app.f.get("search", {parse: "comments", page: currentPage, sort: currentSort, filters: {contentType, contentId, thread: isThread ? threadId : null}});
			
            if (typeof response === "object" && Array.isArray(response.content)) { // Assuming success returns an array of comments
                const fetchedComments = response.content;
                //setComments(prevComments => resetList ? fetchedComments : [...prevComments, ...fetchedComments]);
				setComments(draft => {
					if (resetList) {
						draft.splice(0, draft.length); // Дропаем весь результат
					};
					draft.splice(draft.length, 0, ...fetchedComments);
				});
				
				
                // Determine canLoadMore based on if an empty array was fetched,
                // or if your API provides a total count or a specific flag.
                // For this mock, if less than a typical page size (e.g., 3) is fetched, assume no more.
                //setCanLoadMore(fetchedComments.length > 0); // Simplified: if we get any, assume more might exist unless it's an empty array
                
				setCanLoadMore(fetchedComments.length >= app.globalPageSize); 
                 if (openCommentId && fetchedComments.find(c => c.id === openCommentId)) {
                    setTimeout(() => {
                        const element = document.querySelector(`.commentWithTheId${openCommentId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('highlighted-comment');
                            setTimeout(() => element.classList.remove('highlighted-comment'), 3000);
                        }
                    }, 100);
                }
            } else if (typeof response === "string") { // Error string from app.f
                setError(app.translateError(response));
                setCanLoadMore(false);
            } else if (response && response.error) { // API error object
                 setError(app.translateError(response.error));
                 setCanLoadMore(false);
            }
            else { // Unexpected response
                setError(app.translateError("#error.fetch_comments_failed#"));
                setCanLoadMore(false);
            }
        } catch (e) {
            console.error("Fetch comments error:", e);
            setError(app.translateError("#error.network#"));
            setCanLoadMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [contentType, contentId, threadId, openCommentId, setComments /* Removed setComments to avoid potential infinite loop if it's not stable */]);

    useEffect(() => {
        fetchComments(1, sort, true);
    }, [sort, contentType, contentId, threadId, fetchComments]);

	useEffect(() => {
		canLoadMoreRef.current = canLoadMore;
		sortRef.current = sort;
	}, [canLoadMore, sort]);

    const handleLoadMore = () => {
        if (!isLoading && canLoadMore) {
            const nextPageToLoad = page + 1;
            setPage(nextPageToLoad);
            fetchComments(nextPageToLoad, sort);
        }
    };
    
    const handleSortChange = (newSortId) => {
		setIsLoading(true);
		
		//setComments([]); <-- Крч мне надо чтобы массив не изменялся, но при этом обновлялся, поэтому вариант не подходит
		setComments(draft => {
			draft.splice(0, draft.length);
		});
		
        setSort(newSortId);
        setPage(1); 
    };

    const handleCommentPosted = (newComment, scrollIntoView, fromRealTime) => {
		const sortNow = filtersType.find(x=>x.id===sortRef.current);
		const isRealTimeReversed = sortNow && sortNow.reverseRealTime;
		
		/*if (!isThread) setComments(prevComments => [newComment, ...prevComments]);
		if (isThread) setComments(prevComments => [...prevComments, newComment]);*/
		setComments(draft=>{
			if ((isThread || isRealTimeReversed) && fromRealTime) {
				if (canLoadMoreRef.current) {
					// Похоже, пользователь не до конца долистал
					return;
				};
			};
			draft.splice((((isThread || isRealTimeReversed) && fromRealTime) || (!fromRealTime && isThread)) ? draft.length : 0, 0, newComment);
		});
        
		if (!fromRealTime) {
			if (replyingTo) setReplyingTo(null);
			if (scrollIntoView) {
				if (ref.current) {
					const comment = ref.current.querySelector(`.usercomment.commentWithTheId${newComment.id}`);
					if (comment) {
						comment.scrollIntoViewIfNeeded();
					};
				};
			};
		};
    };
    
    const handleCommentDeleted = (deletedCommentId) => {
        //setComments(prevComments => prevComments.filter(comment => comment.id !== deletedCommentId));
		setComments(draft => {
			const index = draft.indexOf(comment => String(comment.id) === String(updatedComment.id));
			if (index) {
				draft.splice(index, 1);
			};
		});
    };

    const handleCommentEdited = (updatedComment) => {
        //setComments(prevComments => prevComments.map(comment => comment.id === updatedComment.id ? updatedComment : comment));
		let edited = false;
		setComments(draft => {
			const index = draft.findIndex(comment => String(comment.id) === String(updatedComment.id));	
			if (index!==-1) {
				draft.splice(index, 1, updatedComment);
				edited = true;
			};
		});
		return edited;
    };
    
	const handleCommentEditedOrPost = (updatedComment) => {
		const edited = handleCommentEdited(updatedComment);
		if (!edited) {
			return handleCommentPosted(updatedComment, false, true);
		};
	};
	
    const handleReply = (commentToReply) => {
        setReplyingTo(commentToReply);
		if (replyRef.current) replyRef.current.scrollIntoViewIfNeeded();
    };

	const handleReplyPreview = (newComment) => {
		setComments(d=>{
			const commentIndex = d.findIndex(x=>String(x.id)==String(newComment.in_thread));
			if (commentIndex!==-1) {
				updateRepliesTo(draft => {
					const previewThread = draft[String(newComment.in_thread)] ?? (draft[String(newComment.in_thread)] = []);
					
					previewThread.splice(0, previewThread.length);
					
					previewThread.push(newComment);
				});
			};
		});
	};

	// Прослушивание в режиме реального времени
	useEffect(() => {
		if (isCommentsRealTimeListenerEnabled && app.io) {
			//console.log("Enabeld!!");
			function handleCommentEvent(comment, state) {
				if (!isThread ? !(String(comment.contentId) == String(contentId) && comment.contentType == contentType) : !(String(comment.in_thread)==threadId)) {
					return;
				};
				
				if (state == "deleted") {
					handleCommentDeleted(comment.id);
				} else {
					if (comment.in_thread!==null) {
						if (!isThread) {
							handleReplyPreview(comment);
						} else {
							if (comment.in_thread==threadId) {
								handleCommentEditedOrPost(comment);
							};
						};
					} else if (!isThread) {
						handleCommentEditedOrPost(comment);
					};
				};
			};
			
			function handleComment(...args) {
				setTimeout(()=>handleCommentEvent(...args), 50);
			};
			app.io.on("comment", handleComment);
			
			return ()=>{
				app.io.removeListener("comment", handleComment);
			};
		} else {
			return ()=>{};
		};
	}, [isCommentsRealTimeListenerEnabled, contentId, contentType, isThread, threadId, setComments]);






    return (
        <div className={`commentslist listOf${contentType || 'thread'}-${contentId || threadId}`}>
            {!isThread && (
                <div id="header" className="backgroundable-object-one x">
                    <span id="title" style={{fontSize: '1.2em', fontWeight: 'bold'}}>
                        {comments.length > 0 ? `#uncategorized.comments#`.replace("&0&", app.functions.parseCount(comments.length)) : (isLoading ? "#uncategorized.loading#" : "#uncategorized.nocomments#")}
                    </span>
                    <button id="sort" className="btn app-button" onClick={(e) => {
                        app.cm.create(
                            filtersType.map(f => ({ text: f.name, onClick: () => handleSortChange(f.id) })),
                            { toElement: e.target }
                        );
                    }}>
                        {filtersType.find(f => f.id === sort)?.name || "#uncategorized.sorts.default#"}
                    </button>
                </div>
            )}

            {/* Show new comment form:
                - If it's NOT a thread list (i.e., it's a top-level list for a post/article)
                - AND the user is NOT currently replying to another comment in this list.
                OR
                - If it IS a thread list (meaning we are already inside replies for a specific comment)
            */}
            {((!isThread && !replyingTo) || (isThread && !replyingTo)) && (
                <app.structures.CommentForm
					ref={replyRef}
                    contentType={contentType} // For top-level comments under a post/article
                    contentId={contentId}     // For top-level comments under a post/article
                    inThreadId={isThread ? threadId : null} // If this list IS a thread, new comments are replies to threadId
                    onSuccess={(a)=>handleCommentPosted(a, true)}
                    // author={app.me} // Author for new comment form is current user
                />
            )}
            
            {replyingTo && (
                 <div className="reply-form-container" style={{marginTop: '10px', marginBottom: '10px', padding: '10px', border: '1px solid var(--secondaryColor)', borderRadius: '5px'}}>
					{/*<p style={{marginBottom: '5px'}}>#replying_to# <app.components.Username user={replyingTo.author} href={false}/></p>*/}
                    <app.structures.CommentForm
                        inThreadId={threadId} // Replying to the specific comment
                        contentType={isThread ? null : contentType} // Original content type if replying in a top-level list
                        contentId={isThread ? null : contentId}     // Original content ID if replying in a top-level list
                        onSuccess={(a)=>handleCommentPosted(a, true)}
                        onCancel={() => setReplyingTo(null)}
                        author={app.me}
						initialData={{
							content: `@${replyingTo.author.tag || replyingTo.author.id} `,
							medias: [],
							objectMedias: []
						}}
                    />
                </div>
            )}

            {error && <app.components.ErrorAlert>{error}</app.components.ErrorAlert>}

            <div ref={ref} id="list" style={{marginTop: '15px'}}>
                {comments.map(comment => (
                    <app.structures.Comment
                        key={comment.id}
                        commentData={comment}
                        contentAuthor={contentAuthor}
                        onReply={isThread && handleReply} // Always pass handleReply, Comment component will decide if it's a thread
                        onDelete={handleCommentDeleted}
                        onEdit={handleCommentEdited}
						repliesPreview={repliesTo[String(comment.id)]}
                    />
                ))}
            </div>

            {isLoading && <app.components.Loading>#uncategorized.loading_comments#</app.components.Loading>}

            {!isLoading && canLoadMore && comments.length > 0 && (
                <button onClick={handleLoadMore} className="btn app-button">
                    #button.load_more_comments#
                </button>
            )}
             {!isLoading && !canLoadMore && comments.length > 0 && page > 1 && (
                <p style={{textAlign: 'center', color: 'var(--buttonsAndTextSecondaryColor)', marginTop: '20px'}}>#uncategorized.no_more_comments#</p>
            )}
        </div>
    );
};