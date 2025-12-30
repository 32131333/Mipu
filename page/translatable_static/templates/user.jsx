import { useEffect, useState, useRef, useCallback, memo, createElement, Fragment } from "react";
import { BrowserRouter, Route, useParams, Link, NavLink, useLocation, Navigate, useLoaderData } from "react-router";

const { LoadingPage, Avatar, Username, UserBackgroundStyleSetting, SubButton, Content } = app.components;
const { FixedSVG } = app.components.react;
import React from "react";


	/* ${
		ItsRandom.choice(["ПОйМИ _Еня. ТВой врАг - ЭТо взРос####е, и тЫ ЭтО КогдА-нибУдь Пой^Ешь...",
			"Do you like furrys?", "Kiss me!", "What you're doing in devtool??",
			"Skibidi sigma", "It's raining stars!", "Make your life great again!! Why not ;(",
			"You like a k###### boys, don't you?", "I am stucked in this component!! Can you help me?",
			"I wish become populary", "I don't know what mith myself...", "I like foxs...", "I like cats...",
			'Out maskot, named Mipu, is a very cheerful and talkable cat(or fox), but is too cowardly, but also wants to pretend to be silly and cool. In this hierarchy, she still didn’t understand what gender she was. During her new life she learned to hate her bootleg-version. No, she is like that too bootleg, but it is not as brazen as his carbon copy. She says: "Хватит меня копировать, пожалуйста!!" - probably that same impudent guy. However, it is not clear who she is, whether she is a femboy or a real girl',
			"We have a another one maskot. It's a fox named Yaxi! She has a raindow glowing tail, but i am the worst artist",
			"Time scares me", "Let's agree: many troubles are not your fault, but the system of production of the freaks that sent you there",
			"I think the unification of nations and all humanity would lead to great changes in science", "I will soon be 17, and unfortunately I will no longer be able to be proud of being 16. It was the best time",
			"Unfortunately, time cannot be saved", "I'm a pessimist", "My mascot is a character derived from another character",
			"Can Mipu could be a part of videogame?", "Speed: 1 phrases per render", "I am very bad in web design",
			"Как думаете, хорошая ли идея создать просто мощнейщий ИИ-инструмент для ремикса музыки, который будет принимать просто безумное количество промтов, ради идеального результата? Еще будет принимать так и звуки, фразы, и даже принимать примеры с внутренним промтом, если бы этот псевдоремикс генерировала бы сама модель. Я думаю, это способствовало бы обретению бессмертии разных песен",
			"Как думаете, я банкрот?", "Работать... работать... и работать... армия... семья... коммунальные услуги... кредиты... Ужас! Я потерял лучшие 11 лет школы на это?",
			"Можно привести в пример сочинения... это... колобка...? Чего? Ну... это... колобка... Что ты достанешь из колобка? Ну это я пошутил. А я серьезен. Я из тебя самого колобка сделаю, и ты покатишься по земле",
			"Что значит графический дизайн, пояснишь?? Ну... ыыыыы... ээээ... картинки рисовать в компьютере?", "Когда я задумываюсь о будущем, я представляю, как буду драть толчки за минимальную зарплату. А потом заберут на СВО и там умру, так как я самое слабое звено везде, где можно",
			'я хочу сдохнуть... И ЭТО ПРАВИЛЬНЫЙ ОТВЕТ! ДЕЙСТВИТЕЛЬНО А***** Г***** ИМЕЕННО ЕТАВО ХОТЕЛ КОГДА ОН НАЧИНАЛ ПРОИГРЫВАТЬ!! Господин, вы ответили на 581 из 582 вопроса в игре "Кто хочет стать богатым?", и у вас финальный вопрос!! И так, NA SHTO OTBECHAT VINITELNII PADES? VINIT KOGO I....? Я прослушал, что? ИИИИ ЭТО СОВЕРШЕННО ПРАВИЛЬНЫЙ ОТВЕТ!!!!',
			"It's gotten to the point where I feel bad all the time now.", "Я самое слабое звено",
			"Вообще, в моих идеях - создать просто крутую (может даже отчасти отечественную или помойную) копию Пинтерест и твитара. По функционалу должен быть похож на инстаграм, но вообще по моему выходит ВКонтаке. А потом у меня будут планы на более просторнй контент",
			"Игрок 456, вам понравилось играть в героя? Как полагаю, вы не поняли, к чему привело ваше маленькое геройство\n*Звуки смерти друга детства*\n*Звуки развала СССР*",
			"mipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipumipu",
			"OvO", "UwU", "Meow meow, I am cow", "Its my fault"
		])
	} */


const MainPosts = memo(function ({userId, me}) {
	const [psts, setPsts] = useState([]);
	const [isLoading, setLoading] = useState(false);
		
		
		
	const [page, setPage] = useState(1);
	const [debounce, setDebounce] = useState(false);
	const [isEmpty, setIsEmpty] = useState(false);
	const searchPosts = useCallback(()=>{
		let loading = false;
		setLoading(false);
		async function search () {
			setDebounce(true);
			if (loading) {return false};
			setLoading(true);
			loading = true;
			const result = await app.f.get("search", { page: page, parse: "posts", author: userId, sort: 1 });
			if (typeof result === "object") {
				if (result.content.length>0) setPsts(prevPsts => [...prevPsts, ...result.content]);
				
				if (result.content.length === 0 || result.content.length < app.globalPageSize) {
					setLoading(false);
					setIsEmpty(true);
					return false;
				};
			} else {
				console.error(result);
			};
		};
		search().then((r)=>{
			if (r===false) return;
			setDebounce(false);
			setLoading(false);
			setPage(page+1);
		});
	}, [page]);

	useEffect(()=>{
		searchPosts()
	},[]);
	
	useEffect(()=>{
		if (!debounce) {
			const r = document.querySelector("body > .container333 > .page-root > .root");
			let d = false;
			const onScrollEvent = (e) => {
				if (d) return;
				let k = r.scrollHeight - r.scrollTop;
				if (k <= 1000) {
					d = true;
					searchPosts();
				};
			};
			r.addEventListener("scroll", onScrollEvent);
			return () => r.removeEventListener("scroll", onScrollEvent);
		} else return () => {};
	}, [debounce]);
	
	if (!isLoading && isEmpty && psts.length <= 0 && me.id!=userId) {
		return <div className="fillallheight" id="emptypage">
			<span><h3>#page.user.emptypostspage#</h3>#page.user.emptypostspage1#</span>
		</div>;
	} else {
		return <div>
			{me.id==userId && <app.structures.PostEdit onApply={(result)=>{setPsts(p=>[result, ...p])}}/>}
			{psts.map((x)=><app.structures.Post key={x.id} post={x} canOpenFully/>)}
			{isLoading && <app.components.Loading />}
		</div>;
	};
});


/*function Main({user, me}) {
	return <div>
		<MainPosts userId={user.id} user={user} me={me}/>
	</div>;
};*/
function MainTabs(props) {
	const location = useLocation();
	const path = location.pathname.split("/");
	const isMobile = app.reactstates.useIsMobileOrientation();
	
	const page = path[3] && path[3] in MainTabs.pages && path[3];
	if (!page) return <Navigate to={location.pathname+"/main"} replace/>
	else {
		return <div className={!isMobile ? "app-pg-lsted" : "user-tabs-container"}>
			<div className={!isMobile ? "btns" : "tabs-header"}>
				{
					Object.keys(MainTabs.pages).map(function (x, index) {
						return <NavLink replace className={!isMobile ? "navbutton" : "tab-button"} to={location.pathname.split("/").reverse().slice(1).reverse().join("/")+"/"+x}>{MainTabs.pages[x].btnName}</NavLink>
					})
				}
			</div>
			<div className={!MainTabs.pages[page].dontColorRoot ? "root" : "root dontcolor"}>
				{React.createElement(MainTabs.pages[page].component, props)}
			</div>
		</div>
	};
};

const MipuAdvPostsMainPage = memo(function ({userId, me}) {
	const [psts, setPsts] = useState([]);
	const [isLoading, setLoading] = useState(false);
	
	const [page, setPage] = useState(1);
	const [debounce, setDebounce] = useState(false);
	const [isEmpty, setIsEmpty] = useState(false);
	const searchPosts = useCallback(()=>{
		let loading = false;
		setLoading(false);
		async function search () {
			setDebounce(true);
			if (loading) {return false};
			setLoading(true);
			loading = true;
			const result = await app.f.get("search", { page: page, parse: "mipuadv_posts", author: userId, sort: 1 });
			if (typeof result === "object") {
				if (result.content.length>0) setPsts(prevPsts => [...prevPsts, ...result.content]);
				
				if (result.content.length === 0 || result.content.length < app.globalPageSize) {
					setLoading(false);
					setIsEmpty(true);
					return false;
				};
			} else {
				console.error(result);
			};
		};
		search().then((r)=>{
			if (r===false) return;
			setDebounce(false);
			setLoading(false);
			setPage(page+1);
		});
	}, [page]);
	
	useEffect(()=>{
		searchPosts()
	},[]);
	
	useEffect(()=>{
		if (!debounce) {
			const r = document.querySelector("body > .container333 > .page-root > .root");
			let d = false;
			const onScrollEvent = (e) => {
				if (d) return;
				let k = r.scrollHeight - r.scrollTop;
				if (k <= 1000) {
					d = true;
					searchPosts();
				};
			};
			r.addEventListener("scroll", onScrollEvent);
			return () => r.removeEventListener("scroll", onScrollEvent);
		} else return () => {};
	}, [debounce]);
	
	
	if (!isLoading && isEmpty && psts.length <= 0) {
		return <div className="fillallheight" id="emptypage">
			<span><h3>#page.user.emptymipuadvpostspage#</h3>{userId == me.id ? <>#page.user.emptymipuadvpostspage2#<br /><Link to="/create" className="btn app-button">#button.create#</Link></> : "#page.user.emptymipuadvpostspage1#"}</span>
		</div>;
	} else {
		return <div id="sprksposts">
			<div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center"/*, gap: 1.2*/ }}>
				{psts.map((x, i) => <Link key={i} to="/feed" state={{data: psts, activeIndex: i}}><app.structures.MipuAdvPostPreview children={x}/></Link>)}
			</div>
		</div>;
	};
});


function Main({user, me}) {
	return (
		<div className="main-content-wrapper">
			<MainTabs user={user} userId={user.id} me={me} />
		</div>
	);
};
function MainComments({user}) {
	return <div>
		<app.structures.CommentList contentType="users" contentId={user.id} contentAuthor={user.id}/>
	</div>;
};
function MainInfoPage({user}) {
	const mainPageSettings = user.mainPage ?? [];
	
	const isMobile = app.reactstates.useIsMobileOrientation();
	
	return <>
		<div className="colorfill">
			{
				isMobile && Array.isArray(user.links) && user.links.length > 0 && 
				<div className="lnksMobileAdaption">
					{
						user.links.map((x,y)=>(
							<LinkFromProfile key={y}>{x}</LinkFromProfile>
						))
					}
				</div>
			}
			{user.description && <>
					<h3>#page.user.description#</h3>
					<div className="app-st-contentcard"><Content compressTo={12}>{user.description}</Content></div>
				</>
			}
			<h3>🎂 #page.user.registered# {app.functions.ago(user.created)}</h3>
		</div>
		{mainPageSettings.map(x=>{
			const type = MainInfoPage.components[x.type] ?? MainInfoPage.components.unknown;
			const defaultTitle = MainInfoPage.components.names[x.type] ?? MainInfoPage.components.names.unknown;
			return <div className="colorfill" style={{marginTop: "10px"}}>
				<h3>{typeof defaultTitle!="function" ? (!x.title ? defaultTitle : x.title) : defaultTitle(x.title)}</h3>
				{createElement(type, {content: x.content, originalContent: x, user: user})}
			</div>;
		})}
	</>;
};
MainInfoPage.components = {
	unknown({content, originalContent}) {
		return <>
			Unknown content type with this data:
			<pre>
			{JSON.stringify(originalContent)}
			</pre>
		</>
	},
	absolutetext({user, content}) {
		return <app.components.Content>{content}</app.components.Content>;
	},
	pinnedpost({user, content}) {
		const {result, failed, loading} = app.reactstates.useAsyncLoader(new Promise(async function (result,error) {
			const r = await app.f.get(`posts/${content}`);
			if (typeof r == "object") {
				result(r.content);
			} else {
				error(e);
			};
		}));
		if (loading) return <app.components.Loading />
		else {
			return !failed ?
				<app.structures.Post post={result} canOpenFully/>
				:
				<app.components.ErrorAlert>{app.translateError(result)}</app.components.ErrorAlert>
		};
	},
	otheraccounts({user, content}) {
		const {result, failed, loading} = app.reactstates.useAsyncLoader(new Promise(async function (result,error) {
			let a = content.map(async(x) => {
				const r = await app.f.get(`user/${x}`, {minimized: true});
				return {id: "usercard", content: app.functions.alignUserWithDefaultTypes(r.content)};
			});
			result(await Promise.all(a));
		}));
		if (loading) return <app.components.Loading />
		else return <app.components.Gallery medias={result} fromContent={content}/>;
	}
};
MainInfoPage.components.names = {
	pinnedpost: t=><><app.components.react.FixedSVG className="alphaicon a">{app.___svgs.pin_button}</app.components.react.FixedSVG>{" "}{!!t && t!="" ? t : "#page.user.infopage.pinnedpost#"}</>,
	otheraccounts: "#page.user.infopage.otheraccounts#"
};










MainTabs.pages = {
	"main": {
		"component": MainInfoPage,
		"btnName": "#page.user.tabs.main#",
		"dontColorRoot": true
	},
	"posts": {
		"component": MainPosts,
		"btnName": "#page.user.tabs.posts#",
	},
	"sparks": {
		"component": MipuAdvPostsMainPage,
		"btnName": "#page.user.tabs.mipuadv_posts#"
	},
	"comments": {
		"component": MainComments,
		"btnName": "#page.user.tabs.comments#",
	}
};


function LinkFromProfile(val) {
	const st = val.children;
	const url = new URL(st.link);
	//return <a key={y} target="__blank" href={x.link}>🌐 {x.text ?? x.link}{y!=user.links.length-1 ? <br /> : null}</a>;
	return <a className="app-st-userLinkBtn" href={st.link} onClick={e=>{e.preventDefault(); app.functions.youReallyWantToOpenLink(st.link)}}><img className="emoji" src={ app.functions.parseUnknownURL(url.origin + "/favicon.ico", "src") }/> <div id="showtext">{st.text ?? st.link}</div></a>;
};

export const path = "user/:id/:page?";
export default function UserPage() {
	const isMobile = app.reactstates.useIsMobileOrientation();
	/*const { user } = ReactRouter.useLoaderData();
	const loading = false;*/
	
	const id = useLoaderData();
	
	const { user, loading, failed, absolutelyFailed, updateData } = app.reactstates.useFetchUser(id);
	if (absolutelyFailed) throw new ItsBad("host_error");
	
	app.reactstates.useListen("users", user && user.id);
	
	const { me } = app.reactstates.useInformationAboutMe();
	
	
	function UhOh(val) {
		const reasons = tryToReadJSON("#page.user.unvaliable#");
		const isApiError = val.children.startsWith("api:");
		
		if (isApiError) return <div className="userIsUnvaliable">
			<FixedSVG className="alphaicon fill">{app.___svgs.crossed_out_mipu}</FixedSVG>
			<h3>{reasons.apierror}<br /><app.components.ErrorAlert>{app.translateError(val.children.slice(4))}</app.components.ErrorAlert></h3>
		</div>;
		
		return <div className="userIsUnvaliable">
			<FixedSVG className="alphaicon fill">{app.___svgs.crossed_out_mipu}</FixedSVG>
			<h3>{reasons.uhoh}<br />{reasons["reason_"+val.children] ? reasons["reason_"+val.children] : `${reasons["reason_banned"]} (${val.children})`}</h3>
		</div>;
	};
		
	function moreInfoModal() {
		app.m_.render({
			closable: true,
			title: user.name ? user.name : "@"+user.tag,
			component: <app.m_.Scrollable>
				{user.description ?
				<Fragment>
					<h3>#page.user.description#</h3>
					<app.components.Content>{user.description}</app.components.Content>
				</Fragment>
				:
				<h3>🥴 #page.user.nodescription#</h3>
				}
				<hr />
				<h3>#page.user.registered# {app.functions.ago(user.created)}</h3>
			</app.m_.Scrollable>,
			adaptMobile: true
		});
	};
	
	const style = <style>
	{`
	body {
		background-color: var(--secondarySecondaryColor);
	}
	.userpage {
		padding: 15px 0;
		gap: 20px;
		display: flex;
		flex-direction: column;
		/*height: calc(100% - 235px);*/
		min-height: calc(100% - 235px);
	}
	.userpage > * {
		${isMobile ? "background-color: var(--transparencyColor);" : "/* background-color: var(--transparencyColor); */"}
		padding: 15px;
		width: -webkit-fill-available;
		min-height: -webkit-fill-available;
	}
	
	.userpage .app-pg-lsted .root, .userpage .app-pg-lsted .btns, .userpage .app-pg-lsted .root.dontcolor > .colorfill {
		border-radius: 15px;
		padding: 10px;
		background-color: var(--transparencyColor);
	}
	.userpage .app-pg-lsted .root.dontcolor {
		background: none;
		border: none;
		padding: 0;
	}
	
	.userpage > .userIsUnvaliable {
		height: 60vh;
		display: flex;
		flex-direction: row;
		gap: 10px;
		align-content: center;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
	.userpage > .userIsUnvaliable .fixsvg {
		font-size: 90px;
	}
	
	.userpage > .fillallheight {
		height: -webkit-fill-available;
	}	
	.userpage > .fillallheight#emptypage {
		display: flex;
		flex-direction: column;
		align-content: center;
		align-items: center;
		justify-content: center;
	}
	
	.main-content-wrapper {
		min-height: 57vh;
	}
	
	a.tab-button {
		color: var(--buttonsAndTextColor);
		text-decoration: none;
		font-size: 18px;
		filter: opacity(0.5);
		height: -webkit-fill-available;
		padding: 3px 10px;
		line-height: 0;
		align-content: center;
	}
	a.tab-button:hover {
		filter: opacity(0.7);
	}
	a.tab-button:active {
		filter: opacity(0.3);
	}
	a.tab-button.active {
		filter: opacity(1);
		border-bottom-style: solid;
		border-bottom-color: rgb(40 0 220 / 90%);
		border-bottom-width: 4.5px;
	}
	
	
	.userpage .tabs-header {
		display: flex;
		overflow-x: auto;
		height: 45px;
		overflow-y: hidden;
		position: relative;
		flex-direction: row;
		word-break: keep-all;
		align-items: center;
		justify-content: center;
	}
	
	.base-information {
		font-size: larger;
		position: relative;
		width: 100%;
		background-color: var(--transparencyColor);
		padding: 10px 50px;
		display: flex;
		padding-top: 263px;
		align-items: center;
		justify-content: space-between;
		min-height: 520px;
	}
	.base-information .app-userAvatar {
		height: 135px;
	}
	.base-information > * {
		z-index: 1;
	}
	.base-information > .bannerimg {
		z-index: 0;
		position: absolute;
		top: 0;
		right: 0;
		width: 100%;
		height: 520px;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		background-color: none;
		box-shadow: inset 0px -300px 120px -90px var(--transparencyBlackColor);
		background-position: bottom;
	}
	.base-information .lnks {
		margin: 0;
		display: flex;
		gap: 2px;
		position: absolute;
		bottom: 12px;
		right: 12px;
	}
	.base-information .one {
		gap: 30px;
		display: flex;
		align-items: center;
		font-size: large;
		text-align: center;
	}
	.base-information .one .userInfo {
		font-size: large;
	}
	.base-information .two > * {
		font-size: large;
	}
	
	
	.userpage .lnksMobileAdaption {
		display: flex;
		gap: 5px;
		align-content: center;
		justify-content: center;
		margin-block: 15px;
	}
	
	
	.userpage .fillallheight {
		height: 60vh;
	}
	.userpage #emptypage.fillallheight {
		align-content: center;
		/* line-height: 0; */
		text-align: center;
	}
	
	.userpage #sprksposts > div > a {
		/*width: calc(100% / 6.1);*/
		width: calc(100% / 6);
	}
	.userpage #sprksposts > div > a > * {
		height: unset;
		width: 100%;
	}
	
	@media (max-width: 700px) {
		.userpage {
			padding: 0;
			gap: 2px;
		}
		.userpage > * {
			padding: 4px;
		}
		.base-information .lnks {
			display: none;
		}
		.base-information {
			flex-direction: column;
		}
		.base-information .two > * {
			font-size: medium;
		}
		.base-information > .bannerimg {
			height: 300px;
		}
		.base-information {
			min-height: 300px;
			padding-top: 110px;
			padding-inline: 12px;
		}
		.userpage #sprksposts > div > a {
			/*width: calc(100% / 3.02);*/
			width: calc(100% / 3);
		}
	}
	
	.base-information.d {
		padding-top: 10px;
		min-height: 0;
		padding-block: 50px;
		background-color: var(--primaryColor);
	}
	`}
	</style>
	if (loading) {
		return <LoadingPage/>;
	} else {
		return <>
			{style}
			<app.components.WebpageTitle>{user.name ? user.name : "@"+user.tag||"-"}</app.components.WebpageTitle>
			<div className={user.background.media ? "base-information" : "base-information d"}>
				<div className="bannerimg" style={{display: user.background.media ? "unset" : "none", backgroundImage: (user.background.media ? `url(${app.apis.mediastorage}/${user.id}/${user.background.media})` : null)}}/>
				<div className="one">
					<Avatar user={user}/>
					<div>
						<div className="userinfo">
							<Username.Extended user={user} linear />
							{/* <br /> */}
							{/* <span className="app-clickableText" onClick={()=>moreInfoModal()}><FixedSVG>{app.___svgs.next}</FixedSVG> {user.description ? app.functions.microDesc(user.description) : "#page.user.moreinfo#"}</span> */}
						</div>
						{user.subs_count > 0 ? <span><b>{app.functions.parseCount(user.subs_count)}</b> #uncategorized.subs#</span> : null}
					</div>
				</div>
				<div className="two">
					{user.id == me.id && <Link to="/settings" className="btn app-button">#button.setting#</Link>}
					{user.id != me.id && user.me && !user.unvaliable && <SubButton modify={updateData} user={user} />}
				</div>
				<ul className="lnks">
					{user.links.map((x,y)=>(
						<LinkFromProfile key={y}>{x}</LinkFromProfile>
					))}
				</ul>
			</div>
			<div className="userpage">
				<UserBackgroundStyleSetting user={user}/>
				{user.unvaliable && <UhOh>{user.unvaliable}</UhOh>}
				{!user.unvaliable && <Main user={user} me={me}/>}
			</div>
		</>;
	};
};

export function loader({ params }) {
	return params.id;
};