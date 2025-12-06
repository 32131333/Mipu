import { useParams, NavLink, redirect, Navigate } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";

const { CheckBox, TextInput, FixedSVG, CoolTextInput, ColorPicker, RangeInput } = app.components.react;
const { ErrorAlert, UserBackgroundStyleSetting, Avatar, Username, TextInputOne, Loading } = app.components;
const { useInformationAboutMe } = app.reactstates;


import { useImmer } from "use-immer";


export const path = "settings/:page?";

export default function SettingsPage() {
	const [openedList, setOL] = useState(false);
	const isMobile = app.reactstates.useIsMobileOrientation();
	
	const { page } = useParams();
	
	let APage;
	if (pages[page]) {
		APage = pages[page].component;
		if (isMobile && openedList) setOL(false);
	} else {
		if (!isMobile) return <Navigate to="/settings/main" replace/>
		else {
			if (!openedList) setOL(true);
			APage = React.Fragment;
		};
	};
	
	return <div className="app-pg-lsted settingsPage">
		<div className="btns" hidden={isMobile && !openedList}>
		{
			mapJSON(pages, function (o, name) {
				if (!o.secretPage) {
					return <React.Fragment key={name}>
						{o.hrTop && !o.categoryName && <hr />}
						{o.categoryName && <span className="categoryname">{o.categoryName}</span>}
						<NavLink className="navbutton" to={`/settings/${name}`}>{o.pagename}</NavLink>
						{o.hrBottom && <hr />}
					</React.Fragment>;
				} else return <React.Fragment key={name}></React.Fragment>;
			})
		}
		</div>
		<div className="root" hidden={isMobile && openedList}> <APage /> </div> 
	</div>;
};


function RequiredNeedAccount() {
	return <></>
};


const pages = {};
pages.main = {
	component: function MainSettingsPage() {
		return <></>
	},
	pagename: ";w;"
};

pages.userDescription = {
	component() {
		const { me } = useInformationAboutMe();
		const [ data, updateData ] = useImmer(me ? {name: me.name, tag: me.tag, description: me.description, tagIsChecked: false} : {});
		
		const [ tagIsChecked, setTagIsChecked ] = useState(null);
		const [ isChanged, setIsChanged ] = useState(false);
		const [ failed, setFailed ] = useState(false);
		
		useEffect(function () { updateData({name: me.name, tag: me.tag, description: me.description}) }, [me]);
		useEffect(function () {
			async function checkTag(t) {
				setTagIsChecked(0);
				const tag = await app.f.get("checktag/"+t);
				if (typeof tag == "string" || tag.type == "unavailable" || tag.status == "error") {
					setTagIsChecked(typeof tag == "string" ? tag : (tag.type || tag.error));
				} else {
					setTagIsChecked(true);
					setIsChanged(true);
				};
			};
			
			if (me.name != data.name || me.description != data.description) {
				setIsChanged(true);
			};
			if (tagIsChecked===null && data.tag != me.tag) checkTag(data.tag);
		}, [data, tagIsChecked, me]);
		const process = useCallback(function (e) {
			const func = /*processButton(*/async function (e) {
				setFailed(null);
				const result = await app.f.patch("user/self", {
					name: data.name,
					tag: data.tag,
					description: data.description
				});
				if (typeof result == "string" || result.error) {
					setFailed(typeof result == "string" ? result : result.error);
					return false;
				} else {
					getMe.update(result.content);
					return true;
				};
			}/*)*/;
			func(e);
		}, [data]);
		
		
		return <>
			{/*<h3>#page.settings.userdescription.name#</h3>
			<span>#page.settings.userdescription.namesub#</span>
			<TextInput placeholder="#page.settings.userdescription.nameplaceholder#" value={data.name} onChange={(e)=>updateData(x=>{x.name=e.target.value})}/>
			<br />
			<h3>#page.settings.userdescription.tag#</h3>
			{ tagIsChecked === null ? <span>#page.settings.userdescription.tagsub#</span> : (
				tagIsChecked === 0 ?
					<app.components.Loading>#page.settings.userdescription.tagcheking#</app.components.Loading>
					:
					(
						typeof tagIsChecked != "string" ?
							<span>#page.settings.userdescription.successfull#</span>
							:
							<ErrorAlert>app.translateError(tagIsChecked)</ErrorAlert>
					)
			) }
			<TextInput placeholder={data.tag} value={data.tag} onChange={(e)=>updateData(x=>{x.tag=e.target.value})}/>
			<br />*/}
			<div className="daskaaaaaaaa">
				<style>
				{`
				.daskaaaaaaaa {
					display: flex;
					justify-content: center;
					align-items: center;
					gap: 8px;
					font-size: 25px;
				}
				.daskaaaaaaaa > .app-userAvatar {
					height: 130px;
				}
				.daskaaaaaaaa > div {
					display: flex;
					flex-direction: column;
				}
				`}
				</style>
				<app.components.Avatar user={me}/>
				<div>
					<CoolTextInput id="name" value={data.name} onKeyDown={function (event) {
						if (event.key=="Enter") return event.preventDefault();
					}} onInput={(e)=>updateData(x=>{x.name=e.target.textContent})} placeholder="Cool username"/>
					<CoolTextInput id="tag" value={data.tag} onKeyDown={function (event) {
						if (!/^[a-zA-ZА-Яа-яЁё0-9_-]*$/.test(event.key)) return event.preventDefault();
					}} onInput={(e)=>{setTagIsChecked(null);updateData(x=>{x.tag=e.target.textContent})}} label=<b>@</b> placeholder="cooltag"/>
				</div>
			</div>
			{ tagIsChecked === null ? null : (
				tagIsChecked === 0 ?
					<Loading>#page.settings.userdescription.tagcheking#</Loading>
					:
					(
						typeof tagIsChecked != "string" ?
							<span>#page.settings.userdescription.successfull#</span>
							:
							<ErrorAlert>{app.translateError(tagIsChecked)}</ErrorAlert>
					)
			) }
			<br />
			<h3>#page.settings.userdescription.description#</h3>
			<span>#page.settings.userdescription.descriptionsub#</span>
			<app.components.ContentInput valueIsControllable placeholder="#page.settings.userdescription.descriptionplaceholder#" value={data.description} onChange={(e)=>updateData(x=>{x.description=e.target.value})}/>
			{failed && <app.components.ErrorAlert>{app.translateError(failed)}</app.components.ErrorAlert>}
			<span><app.components.ProcessButton disabled={!isChanged || (tagIsChecked!==null && tagIsChecked!==true)} onClick={process} className="btn app-button">#button.apply#</app.components.ProcessButton> <button disabled={!isChanged} onClick={()=>{updateData({name: me.name, tag: me.tag, description: me.description});setTagIsChecked(null);setIsChanged(false)}} className="btn app-button">#button.cancel#</button></span>
		</>;
	},
	pagename: "#page.settings.category.userdescription#",
	categoryName: "#page.settings.category.you#"
};
pages.personalization = {
	component: function PersonalizationSettingsPage() {
		const { me } = useInformationAboutMe();
		const defaultValue = {avatar: me.avatar, background: me.background};
		
		const [ data, updateData ] = useImmer(JSON.parse(JSON.stringify(defaultValue)));
		const [ testBackground, setTestBackground ] = useState(false);
		const [ updated, setUpdated ] = useState(false);
		
		if (updated) {
			updateData(defaultValue);
			setUpdated(false);
		};
				
		function processAvatarChange(e) {
			app.functions.uploadFileContextMenu(async function (src) {
				app.functions.cropModal(src, {height: 1024, width: 1024}, function (src, file) {
					updateData(data=>{
						data.changed = true;
						data.avatarChanged = true;
						data.avatar.media = src;
						data.avatarMedia = file;
					});
				});
			}, e.target);
		};
		function processAvatarRemove(e) {
			updateData(data=>{
				data.changed = true;
				data.avatarChanged = true;
				data.avatar.media = null;
			});
		};

		function processBannerChange(e) {
			app.functions.uploadFileContextMenu(async function (src) {
				app.functions.cropModal(src, {width: 1024, height: 768}, function (src, file) {
					updateData(data=>{
						data.changed = true;
						data.bannerChanged = true;
						data.background.media = src;
						data.bannerMedia = file;
					});
				});
			}, e.target);
		};
		function processBannerRemove(e) {
			updateData(data=>{
				data.changed = true;
				data.bannerChanged = true;
				data.background.media = null;
			});
		};
		
		function processGrandientChange(e) {
			let gradient = data.background.style ?? "0deg, #000000, #000000";
			gradient = gradient.split(", ");
			if (e.target.parentElement.id == "one" || e.target.parentElement.id == "two") {
				gradient[e.target.parentElement.id=="one" ? 1 : 2] = e.target.value;
			} else if (e.target.parentElement.id == "deg") {
				gradient[0] = `${e.target.value}deg`
			} else {
				gradient = null;
			};
			updateData(data=>{
				data.changed = true;
				data.background.style = gradient ? gradient.join(", ") : null;
			});
		};
		const process = useCallback(function (e) {
			const func = /*processButton(*/async function (e) {
				let failed = [];
				if (data.avatarChanged) {
					const fd = new FormData();
					fd.append("avatar", data.avatarMedia);
					const result = data.avatar.media ? await app.f.patch("uploadAvatar", fd) : await app.f.remove("uploadAvatar");
					if (typeof result == "string" || Array.isArray(result)) {
						failed.push(["avatar", result])
					};
				};
				if (data.bannerChanged) {
					const fd = new FormData();
					fd.append("background", data.bannerMedia);
					const result = data.background.media ? await app.f.patch("uploadBackgroundImage", fd) : await app.f.remove("uploadBackgroundImage");
					if (typeof result == "string" || Array.isArray(result)) {
						failed.push(["background", result])
					};
				};
				
				const result0 = await app.f.patch("user/self", {
					avatar: { 
						options: data.avatar.options
					},
					background: {
						style: data.background.style
					}
				});
				if (typeof result0 == "string" || Array.isArray(result0)) {
					failed.push(["avatar_or_background", result0])
				} else {
					getMe.update(result0.content);
				};
				
				if (failed.length==0) {
					setUpdated(true);
					return true;
				} else {
					console.error(failed);
					throw Error();
				};
			}/*)*/;
			func(e);
		}, [data]);
		return <>
			<style>{`
			.app-userAvatar {
				font-size: 200px;
			}
			`}</style>
			{testBackground && <UserBackgroundStyleSetting background={data.background}/>}
			<div className="app-st-flex">
				<Avatar userId={me.id} userAvatar={data.avatar}/>
				<div>
					#page.settings.avatar_upload#
					<br />
					<span><button onClick={processAvatarChange} className="btn app-button">#button.change#</button> <button disabled={!data.avatar.media} onClick={processAvatarRemove} className="btn app-button">#button.remove#</button></span>
				</div>
			</div>
			<div className="app-st-flex">
				<div>
					<h4>#page.settings.background#</h4>
					{!!data.background.style ? <CheckBox checked={app.functions.readLocalStorageKey("settings.disallow_a_c")} onInput={(event, checked)=>setTestBackground(checked)} label="#page.settings.preview_background#"/> : <>#page.settings.no_preview_background#</>}
				</div>
				<div>
					#page.settings.colorofbackground#
					<ColorPicker id="one" style={{fontSize: 15}} onInput={processGrandientChange} defaultValue={data.background.style ? data.background.style.split(", ")[1] : "#FFFFFF"} label="#page.settings.firstcolorofbackground#"/>
					<ColorPicker id="two" style={{fontSize: 15}} onInput={processGrandientChange} defaultValue={data.background.style ? data.background.style.split(", ")[2] : "#FFFFFF"} label="#page.settings.secondcolorofbackground#"/>
					<RangeInput min="0" max="360" id="deg" onInput={processGrandientChange} defaultValue={data.background.style ? data.background.style.split(", ")[0] : 0} label={`${data.background.style ? data.background.style.split(", ")[0] : "0deg"}`}/>
					<button disabled={!data.background.style} className="btn app-button" onClick={processGrandientChange}>#button.reset#</button>
				</div>
			</div>
			<div className="app-st-flex">
				<div>
					<h4>#page.settings.banner#</h4>
				</div>
				<div>
					#page.settings.banner_upload#
					<br />
					<span><button onClick={processBannerChange} className="btn app-button">#button.change#</button> <button disabled={!data.background.media} onClick={processBannerRemove} className="btn app-button">#button.remove#</button></span>
				</div>
			</div>
			<span><app.components.ProcessButton disabled={!data.changed} onClick={process} className="btn app-button">#button.apply#</app.components.ProcessButton> <button disabled={!data.changed} onClick={()=>updateData(JSON.parse(JSON.stringify(defaultValue)))} className="btn app-button">#button.cancel#</button></span>
		</>
	},
	pagename: "#page.settings.category.personalization#"
};
pages.page = {
	component: function PageMainSettings() {
		const { me } = useInformationAboutMe();
		const [ data, updateData ] = useImmer({ links: [] });
		const [ failed, setFailed ] = useState(false);
		
		useEffect(function () {
			if (typeof me == "object") {
				updateData(d=>{
					if (me.links) d.links = JSON.parse(JSON.stringify(me.links));
				});
			};
		}, [me]);
		// useEffect(()=>{console.log(data)}, [data]);



		// Ref для хранения индекса перетаскиваемого элемента
		const dragItem = useRef(null);
		// Ref для хранения индекса элемента, над которым находится курсор
		const dragOverItem = useRef(null);

		const handleDragStart = (e, index) => {
			dragItem.current = index;
			// Добавляем небольшой эффект при перетаскивании
			e.currentTarget.classList.add('dragging');
		};

		const handleDragEnter = (e, index) => {
			dragOverItem.current = index;
			// Подсвечиваем место, куда будет вставлен элемент
			e.currentTarget.classList.add('drag-over');
		};
    
		const handleDragLeave = (e) => {
			e.currentTarget.classList.remove('drag-over');
		};

		const handleDrop = (e) => {
			e.preventDefault(); // Предотвращаем стандартное поведение
			const dragItemIndex = dragItem.current;
			const dragOverItemIndex = dragOverItem.current;

			// Если бросили на тот же элемент, ничего не делаем
			if (dragItemIndex === dragOverItemIndex) {
				return;
			}

			// Обновляем массив с помощью Immer
			updateData(draft => {
				// Убираем перетаскиваемый элемент из массива
				const [draggedItemContent] = draft.links.splice(dragItemIndex, 1);
				// Вставляем его в новую позицию
				draft.links.splice(dragOverItemIndex, 0, draggedItemContent);
			});

			// Очищаем ref'ы
			dragItem.current = null;
			dragOverItem.current = null;
		};

		const handleDragEnd = (e) => {
			// Убираем все стили перетаскивания
			e.currentTarget.classList.remove('dragging');
			// Также убираем подсветку со всех элементов на всякий случай
			document.querySelectorAll('.link-item.drag-over').forEach(el => el.classList.remove('drag-over'));
		};
    
		const handleInputChange = (index, field, value) => {
			updateData(draft => {
				draft.links[index][field] = value;
			});
		};

		
		
		const hasChanges = useCallback(function () {
			return JSON.stringify(me.links) != JSON.stringify(data.links);
		}, [me, data]);
		
		const process = useCallback(function (e) {
			const p = /*processButton(*/async function (e) {
				setFailed(null);
				const result = await app.f.patch("user/self", {
					links: data.links
				});
			
				if (typeof result != "string" || !result.error) {
					getMe.update(result.content);
					return true;
				} else {
					setFailed(typeof result == "string" ? result : result.error);
					return false;
				};
			}/*)*/;
			p(e);
		}, [data]);
		function handleCancel() {
			if (typeof me == "object") {
				updateData(d=>{
					if (me.links) d.links = JSON.parse(JSON.stringify(me.links));
				});
			};
		};
		
		const linksRef = useRef(null);
		return <>
			{failed && <app.components.ErrorAlert>{app.translateError(failed)}</app.components.ErrorAlert>}
			<form ref={linksRef} onSubmit={e=>{e.preventDefault()}}>
				<h3>#page.settings.page.linktitle#</h3>
				<h4>#page.settings.page.linkdesk#</h4>
				<div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
					{
						data.links && data.links.map((x, i)=>{
							return <div
								key={i}
								className="link-item"
								draggable
								onDragStart={(e) => handleDragStart(e, i)}
								onDragEnter={(e) => handleDragEnter(e, i)}
								onDragLeave={handleDragLeave}
								onDragOver={(e) => e.preventDefault()}
								onDrop={handleDrop}
								onDragEnd={handleDragEnd}
							>
								<button className="app-iconOnlyButton b" onClick={()=>updateData(d=>{d.links = d.links.filter(a=>a!=d.links[i])})}><app.components.react.FixedSVG className="alphaicon fill">{app.___svgs.x_1}</app.components.react.FixedSVG></button>
								<app.components.react.TextInput onInput={(e)=>{updateData(d=>{d.links[i].link=e.target.value})}} placeholder="#page.settings.page.link#" label="#page.settings.page.linklabel#" value={x.link || ""}/>
								<app.components.react.TextInput onInput={(e)=>{updateData(d=>{d.links[i].text=e.target.value})}} placeholder="#page.settings.page.linkalt#" label="#page.settings.page.linkaltlabel#" value={x.text || ""}/>
							</div>
						})
					}
				</div>
				<button className="app-button1" onClick={()=>{updateData(draft => {draft.links.push({ link: '', text: '' })})}}>#button.addnew#</button>
			</form>
			<span><app.components.ProcessButton disabled={!hasChanges()} onClick={process} className="btn app-button">#button.apply#</app.components.ProcessButton> <button disabled={!hasChanges()} onClick={handleCancel} className="btn app-button">#button.cancel#</button></span>
		</>;
	},
	pagename: "#page.settings.category.page#"
};

pages.login = {
	component: function LoginSettingsPage() {
		const { me } = useInformationAboutMe();
		const [changingLogin, setCL] = useState(false);
		
		function LoginChangeForm() {
			const [data, setData] = useState({});
			const [confirmed, comfirm] = useState(false);
			const [errorState, setErrorState] = useState(false);
			
			function handleInput(e) {
				data[e.target.name] = e.target.value;
				setData(data=>{
					data[e.target.name] = e.target.value;
					return data;
				});
			};
			return <div>
				<ErrorAlert>{errorState}</ErrorAlert>
				<TextInput name="login"  type="email" defaultValue={me.login} label="#page.login_register.your_name#" onInput={handleInput}/>
				<TextInput name="password" type="password" label="#page.login_register.your_password#" onInput={handleInput}/>
				<TextInput name="oldpassword" type="password" label="#page.login_register.your_old_password#" onInput={handleInput}/>
				<TextInput name="confirm_password" type="password" label="#page.login_register.confirm_your_password#" onInput={(e)=>{
					comfirm(e.target.value == data.password);
				}}/>
				<span><app.components.ProcessButton className="btn app-button" onClick={/*processButton(*/async function () {
					const response = await app.f.patch("login", data);
					if (typeof response=="object") {
						/*app.f.headers.set("authorization", response.content);
						cookieMngr.setCookie("token", response.content);*/
						cookieMngr.setCookie("token", response.content.accessToken.token);
						cookieMngr.setCookie("refresh_token", response.content.refreshToken.token);
						getMe.update(undefined, response.content.accessToken.token, response.content.refreshToken.token);
						
						await getMe();
						setCL(false);
					} else {
						setErrorState(response);
						throw Error();
					};
				}/*)*/} disabled={!confirmed}>#button.change#</app.components.ProcessButton> <button onClick={()=>setCL(false)} className="btn app-button">#button.cancel#</button></span>
			</div>
		};
		
		if (changingLogin) {
			return <div className="app-pg-minimalisecutify"><LoginChangeForm /></div>;
		} else {
			return <div className="app-pg-minimalisecutify">
				{!me.verifiedEmail && <app.components.WarningAlert 
					text="#page.settings.unverified_email#"
					onClick={/*processButton(*/async function() {
						const result = await app.f.post("requireemailverify");
						if (typeof result==="undefined" || typeof result=="object") { // 204
							app.m_.render({
								title: "#uncategorized.success#",
								closable: true,
								html: "#page.settings.unverified_email_success#",
								border: <app.m_.Button>#button.ok#</app.m_.Button>
							});
						} else throw {handledText: app.translateError(result)}
					}/*)*/}
				/>}
				{me.withoutPassword && <app.components.WarningAlert text="#page.settings.without_password#"/>}
				<div>
					<TextInput name="login" disabled defaultValue={me.login} label="#page.login_register.your_name#"/>
					<TextInput name="login" disabled defaultValue={me.withoutPassword ? "" : "****************"} placeholder="0w0" label="#page.login_register.your_password#"/>
					<span><button className="btn app-button" onClick={()=>setCL(true)}>#button.change#</button></span>
				</div>
			</div>
		};
	},
	pagename: "#page.settings.category.login#"
};
pages.theme = {
	component: function ThemeSettingsPage() {
		const themeInfo = app.reactstates.useThemeInfo();
		return <>
			<CheckBox checked={app.functions.readLocalStorageKey("settings.disallow_a_c")} onInput={(event, checked)=>app.functions.setLocalStorageKey("settings.disallow_a_c", checked)} label="#page.settings.disallow_automatically_change#"/>
			<p>#page.settings.forced_dark_theme_info#</p>
			<CheckBox checked={app.functions.readLocalStorageKey("settings.u_m_a_t_b_e")} onInput={(event, checked)=>app.functions.setLocalStorageKey("settings.u_m_a_t_b_e", checked)} label="#page.settings.use_my_account_theme_everywhere# (#uncategorized.dont_recommended#)"/>
			<CheckBox checked={app.functions.readLocalStorageKey("settings.darkthemebyos", true)} onInput={(event, checked)=>app.functions.setLocalStorageKey("settings.darkthemebyos", checked)} label="#page.settings.dark_theme_by_os#"/>
		</>;
	},
	pagename: "#page.settings.category.theme#",
	categoryName: "#page.settings.category.client#",
	hrTop: true
};
pages.language = {
	component: function LanguageSettingsPage() {
		const [selected, setSelected] = useState(cookieMngr && cookieMngr.getCookie("lang") || "ru");
		const { langs } = app.more;
		
		return <>
		<form onSubmit={e=>e.preventDefault()}>
			<h2>#page.settings.languages.info#</h2>
			{
				langs.map((x,i)=>(
					<div id="languases" className="radio-select">
						<div className="radio">
							<label htmlFor={`labelFor${x.code}Lang`} id="flag">{x.flag}</label>
							<input defaultChecked={selected==x.code} name="lang" onInput={function () {
								cookieMngr.setCookie("lang", x.code);
								app.m_.render({
									closable: true,
									component: <>
										<app.components.Content>{"#### " + x.confirm||""}</app.components.Content>
										<app.m_.Footer><app.m_.Button onClick={()=>document.location.reload()}>{x.yes}</app.m_.Button> <app.m_.Button>{x.no}</app.m_.Button></app.m_.Footer>
									</>
								});
							}} value={x.code} type="radio" id={`labelFor${x.code}Lang`} />
							<label id="name" htmlFor={`labelFor${x.code}Lang`}>{x.name}</label>
						</div>
					</div>
				))
			}
		</form>
		</>;
	},
	pagename: "#page.settings.category.languages#"
}
pages.info = {
	component: function InfoSettingsPage() {
		return <>
			<h1>#clientName# #version# 💖</h1>
			<br/>
			<h3>Лучшие дни никогда не наступают, не так ли? Что насчёт того, чтобы начать с себя?</h3>
			<br/><br/>
			<ul>
				<h3>Благодарность :3</h3>
				<li>@d32131333 - гл. основатель #clientName# с 2022г.</li>
				<li>@damskiyugodnik217 - перви юзер и альфа тестер</li>
				<li>OpenAI/ChatGPT - лучший помощник с 2023г.</li>
				<li>Google/Gemini - неплохой помощник с 2025г.</li>
				<li>DeepSeek - неплохой помощник с 2025г.</li>
				<li>StackOverflow - практически имеет в себе решение многих проблем еще с 2020г.</li>
			</ul>
		</>
	},
	pagename: "#page.settings.category.info#"
};
pages.uwu = {
	component: function UwUSettingsPage() {
		return <>
			<h1>Love. Passion. Envy</h1>
		</>;
	},
	pagename: "UwU",
	secretPage: true
};



/*export function loader({ params }) {
	if ((!params.page || !pages[params.page]) && params.page!=null) return redirect("/settings/main")
	else return null;
};*/