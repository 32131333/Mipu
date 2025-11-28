const { CheckBox } = app.components.react;
const { UserBackgroundStyleSetting } = app.components;
import { Link } from "react-router";
import React from "react";

export const path = "helloworld";
function HelloWorld(...args) {
	console.log(args);
	
	const [text, setText] = React.useState("# 🌟w🌟\n## #privacyisnotacrime\n\n\n# It's raining tokens");
	const [uuuu, setUuuu] = React.useState(false);
	const [l, setL] = React.useState("/user/@d32131333");
	const [a, aa] = React.useState("It's standarted error alert!! This element doesnt showings if he hadn't a text");
	const [a0, setA0] = React.useState(false);
	const isMobile = app.reactstates.useIsMobileOrientation();
	const [text0, setText0] = React.useState("UwU");
	const [text0a, setText0A] = React.useState(false);
	const [slateDebugState, setSlateDebugState] = React.useState({});
	const [stst, setStSt] = React.useState("");
	function t(e) {
		setText(app.pars.globaledParser(event.target.value)); // markdown
	};
	
	return (
		<div>
			<app.components.WebpageTitle>test</app.components.WebpageTitle>
			<h1>Hewwo Wurld! ~Nya ❤</h1>
			<h1>{isMobile ? "Cool smartphone!" : "Cool browser!"} :3</h1>
			<hr />
			<ul>
				<h2>Process buttons</h2>
				<li><button className="btn btn-default" onClick={processButton(()=>new Promise(resolve=>{}), null, "-w- ~Nya... zzz...")}>-w-</button> (sleeping)</li>
				<li><button className="btn btn-default" onClick={processButton(async function(){throw Error()}, null, undefined, "XwX")}>UwU</button> (catches an error)</li>
				<li><button className="btn btn-default" onClick={processButton(async function(){return true}, null, undefined, undefined, "OwO")}>PwP</button> (successfully)</li>
				<li><button className="btn btn-default" onClick={processButton(async function(){await new Promise(resolve=>setTimeout(resolve, 5000))}, null, undefined, undefined, "uwww...uu owo..", undefined, true)}>-w- Wake up</button> (successfully, but never returns enabled back)</li>
				<li><button className="btn btn-default" onClick={processButton(async function(){await new Promise(resolve=>setTimeout(resolve, 500));return `OwO>{You're the B${Math.floor(53*Math.random())} in order}`}, null, undefined, undefined, undefined, undefined, false)}>Take your random number</button> (successfully, but with custom/dynamic text)</li>
				<li><button className="btn btn-default" onClick={processButton(async function(){await new Promise(resolve=>setTimeout(resolve, 500));throw Error()}, null, undefined, undefined, undefined, undefined, false, function(){return `We sorry. You're the B${Math.floor(53*Math.random())} in order`})}>Take your random number</button> (catches an error, but with custom/dynamic text)</li>
			</ul>
			<hr />
			<ul>
				<h2>custom button styles test</h2>
				<button className="app-button" onClick={processButton(()=>true)}>.app-button</button>
				 
				<button className="btn app-button" onClick={processButton(()=>true)}>.btn .app-button</button>
				 
				<button className="app-button danger" onClick={processButton(()=>true)}>.app-button .danger</button>
				 
				<button className="app-button success" onClick={processButton(()=>true)}>.app-button .success</button>
				<br />
				<button title=".app-iconOnlyButton" className="app-iconOnlyButton"><app.components.react.AlphaIcon src="/static/svg/home.svg" /></button>
				<br />
				<button className="app-button" onClick={processButton(()=>true)}>.app-button</button>
			</ul>
			<hr />
			<ul>
				<h2>ErrorAlert & TextInput</h2>
				<app.components.ErrorAlert>{a}</app.components.ErrorAlert>
				<app.components.react.TextInput label="Edit this to change something" onInput={e=>aa(e.target.value)} defaultValue={a}/>
			</ul>
			<hr />
			<ul>
				<h2>React form test</h2>
				<form onSubmit={event=>console.info(`Dear ${event.target.myname}, thanks! You'r website is great!!!!!!`)}>
					<fieldset>
						<legend>Submit an your idea of dream's website. Don't forget, you're great than ever!</legend>
						<label htmlFor="myname">What is your name?</label><br />
						<input name="myname" id="myname" type="text" placeholder="@username/MyName Surname" required /><br />
						<label htmlFor="mycontact">How we can contact with you? (optional)</label><br />
						<input name="mycontact" id="mycontact" type="text" placeholder="mail@localhost/https://bestmessageever.lol/@uwu219" /><br />
						<label htmlFor="mylink">Leave your link here!! It will be readed site, template, repository, you'r project. Make us happy again!</label><br />
						<input name="mylink" id="mylink" type="text" placeholder="https://bestmessageever.lol/" required /><br />
						<label htmlFor="iagreed">You know the rules. You know, that a little lie can make unhappy not only us...</label><br />
						<input type="checkbox" id="iagreed" name="iagreed" required /><br />
						<button type="submit">Make the day gread again!!.. ugh... submit!</button>
					</fieldset>
				</form>
				<form onSubmit={event=>console.info(`Wonderful! Indeed! You are a multi-talented person, not one with a rotten brain!! Happy days!!!`)}>
					<fieldset>
						<legend>Tell us about your favorite FICTIONAL character (if he is your only love)</legend>
						<label htmlFor="name">How his name?</label><br />
						<input name="name" id="name" type="text" placeholder="I love M######t from Y#####e 💖💖" required /><br />
						<label htmlFor="why">Why is really he/she? (optional)</label><br />
						<input name="why" id="why" type="text" placeholder="" /><br />
						<label htmlFor="myname">What is your name? Don't worry, character is also love you!!!</label><br />
						<input name="myname" id="myname" type="text" placeholder="@username/MyName Surname" required /><br />
						<button>Brrskibidi dob dob dob yes yes skibidi dob dob dip dip</button>
					</fieldset>
				</form>
			</ul>
			<hr />
			<ul>
				<h2>Alert test</h2>
				<li><button className="btn btn-default" onClick={processButton(()=>alert("It's raining tokens!"))}>Default alert</button></li>
				<li><button className="btn btn-default" onClick={processButton(()=>{let d=window.confirm("It's raining tokens!");if (!d) { throw Error() }})}>Default confirm alert</button></li>
				<li><button className="btn btn-default" onClick={processButton(async function() {
					return await new Promise((resolve, fail)=>{
						function A() {
							return (
								<React.Fragment>
									<img src="/static/img/Ugh.jpg"/>
									<app.m_.Footer>
										<app.m_.Button className="app-button" onClick={()=>({end: true, result: "red"})}>Red</app.m_.Button>
										<app.m_.Button className="app-button" onClick={()=>({end: true, result: "blue"})}>Blue</app.m_.Button>
									</app.m_.Footer>
								</React.Fragment>
							);
						};
						app.m_.render({
							title: "Select your side",
							closable: true,
							component: <A/>,
							adaptMobile: true,
							onEnd: function(result) {
								if (result=="blue") resolve(result)
								else fail({handledText: result});
							}
						});
					});
				})}>Modal test</button></li>
				<li><button className="btn btn-default" onClick={processButton(async function () {
					return await new Promise(r=>{
						function A() {
							const [a, b] = React.useState(0);
							return <p style={{alignText: "center"}} onClick={()=>b(a+1)}><button className="btn btn-default">{a}$</button></p>;
						};
						app.m_.render({
							title: "button kombat",
							component: <A/>,
							onEnd: r,
							closable: true
						});
					});
				})}>Modal test 1</button></li>
			</ul>
			<hr />
			<ul>
				<h2>Emoji parser test</h2>
				<li>🥴 🤢 Это тестирование того, что мне нагенерировала нейросеть. Моя цель - оптимизация, в противном случае я бы просто сам на косяк сделал свою реализацию. Несмотря на все, это должно работать идеально. 🦊 Здесь также должен быть свой парсер эмодзи и картинок через регулярные выражения. :i:checkmark:</li>
				<li></li>
				<li>🦊Ты похожа на лисичку</li>
				<li>🌟Такого же цвета, как звезда</li>
				<li>🌠Падающая с ночного неба</li>
				<li>:i:home: Неожиданная, исполняющая мечты...</li>
			</ul>
			<hr />
			<ul>
				<h2>Md test</h2>
				<CheckBox onInput={(event, checked)=>setA0(checked)} label="'.contentify' class on result"/> <textarea onInput={t} defaultValue={text}></textarea>
				<li><p id="itsatextarea">{text}</p></li>
				<li><p className={a0 ? "contentify" : null} dangerouslySetInnerHTML={{__html: text}}></p></li>
			</ul>
			<hr />
			<ul>
				<h2>More React components test</h2>
				<CheckBox onInput={(event, checked)=>setUuuu(checked)} label={!uuuu ? "<<< Turn on to test background component" : "You're a great!!"}/>
				<UserBackgroundStyleSetting background={uuuu ? {"style": "125deg, #580000, #705000"} : null}/>
			</ul>
			<ul>
				<h2>Redirect to</h2>
				<input defaultValue={l} onInput={event=>setL(event.target.value)}/>
				<br />
				<textarea onInput={e=>setStSt(event.target.value)} defaultValue={stst} placeholder="{ write your state here }"></textarea>
				<br />
				{!l ? <span>??</span> : <Link state={(()=>{ try { return JSON.parse(stst) } catch { return stst } })()} to={l}>Press this link to redirect</Link>}
			</ul>
			<ul>
				<h2>Input test</h2>
				<app.components.TextInputOne value={text0} onSlateChange={setSlateDebugState} placeholder="Oh hiiii!!! Is a Slate Text Input!!!! OwO" onChange={(e) => setText0(e.target.value)}/>
				<app.components.MobileTextInput value={text0} valueIsControllable placeholder="Mobile wrap" onChange={(e) => setText0(e.target.value)}/>
				<br />
				Result:
				<br />
				<blockquote>
				{
					!text0a ?
						<code>{text0}</code>
						:
						<app.components.Content>{text0}</app.components.Content>
				}
				</blockquote>
				<blockquote>
					<b>Slate editor debug</b>
					<pre>{JSON.stringify(slateDebugState)}</pre> {/* Проходит год, а я так и не исправил баги с редактором */}
				</blockquote>
				<CheckBox onInput={(event, checked)=>setText0A(checked)} label={!text0a ? "Result" : "Result via app.components.Content ✨"}/>
			</ul>
			<ul>
				<h2>tooltip test</h2>
				<li><span tooltip="YAY!! >w<">test1</span></li>
				<li><span tooltip="toolong test OwO toolong test OwO toolong test OwO toolong test OwO toolong test OwO toolong test OwO toolong test OwO toolong test OwO toolong test OwO toolong test OwO toolong test OwO">test2</span></li>
				<li><span tooltip={()=>{return "This is a function! Wonderful OwO"}}>test3</span></li>
				<li><span tooltip={<p>React <b>support</b> test 🥰<br /><h4>Great UwU!</h4></p>}>test4</span></li>
				<li><span tooltip="ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU ultra too long test UwU">test5</span></li>
			</ul>
			<ul>
				<h2>Toasts test</h2>
				<button className="btn app-button" onClick={()=>{ app.toasts.show({duration: null, content: <><app.components.Username user={app.me}/> оставил вам комментарий! ✨</>, onClick: (e,c)=>c(), icon: <app.components.Avatar user={app.me} /> }) }}>Normal. User notification example</button>
				<button className="btn app-button" onClick={()=>{ app.toasts.show({duration: 10000, content: "Something happened!", type: "error", icon: <app.components.react.FixedSVG className="d" children={app.___svgs.x_1}/>}) }}>Error</button>
				<button className="btn app-button" onClick={()=>{ app.toasts.show({duration: 10000, content: "Great!", type: "success", icon: <app.components.react.FixedSVG className="d alphaicon fill" children={app.___svgs.checkmark_1}/>}) }}>Success</button>
				<button className="btn app-button" onClick={()=>{ app.toasts.show({duration: 10000, content: "Whoops!", type: "warn", icon: <app.components.react.FixedSVG className="d alphaicon fill" children={app.___svgs.x}/>}) }}>Warn</button>
				<button className="btn app-button" onClick={()=>{ app.toasts.show({duration: 10000, content: "Example text", type: "info", icon: <app.components.react.FixedSVG className="d alphaicon fill" children={app.___svgs.x}/>}) }}>Info</button>
				<button className="btn app-button" onClick={()=>{ app.toasts.show({duration: 10000, href: "/user/self", content: "This is a href toast", type: "info", icon: <app.components.react.FixedSVG className="d alphaicon fill" children={app.___svgs.x}/>}) }}>Href</button>
				<button className="btn app-button" onClick={()=>{ app.toasts.show({duration: 1000, content: "test", onClose: ()=>app.toasts.show({duration: 5000, content: "Handled!", type: "success"}), icon: <app.components.react.FixedSVG className="d alphaicon fill" children={app.___svgs.checkmark_1}/>}) }}>onClose handle</button>
				<button className="btn app-button" onClick={()=>{ app.toasts.show({duration: null, content: "Новое уведомление!\n\n\n12312312131231231231234378923748dsfsjhdfjkshfiwoejdwijdiahefakwuikhfikihiuehsfsu\n\n\n\n12312312131231231231234378923748dsfsjhdfjkshfiwoejdwijdiahefakwuikhfikihiuehsfsu\n\n\n\n12312312131231231231234378923748dsfsjhdfjkshfiwoejdwijdiahefakwuikhfikihiuehsfsu\n\n\n\n", onClick: (e,c)=>c(), icon: app.components.react.FixedSVG({className: "alphaicon fill d", children: app.___svgs.checkmark_1})}) }}>too long test</button>
			</ul>
			<hr />
			<h6>#clientName# #version# by #corpotation# #years#. With love...</h6>
		</div>
	);
};

export default HelloWorld;