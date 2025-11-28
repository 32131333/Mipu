import { Link } from "react-router";
import { useState, useEffect, Fragment } from "react";
import React from "react";

const { CheckBox, TextInput, FixedSVG, CoolTextInput } = app.components.react;
const { ErrorAlert, UserBackgroundStyleSetting } = app.components;

const generateRndBtnId = ()=>`btn${Math.floor(Math.random()*1000)}`;

export const path = "register";
export default function RegisterPage() {
	let [ onlyWithInviteCode, setOnlyWithInviteCode ] = useState(false);
	let [ passwordConfirmed, setPasswordConfirmed ] = useState(false);
	let [ LoginState, setLoginState ] = useState(0);
	let [ ErrorState, setErrorState ] = useState(null);
	let [ formInfo, setFormInfo ] = useState({});
	
	if (LoginState >= 0) {
		let p;
		if (LoginState==0) {
			p = <React.Fragment>
				<p>#page.login_register.hello#</p>
				{onlyWithInviteCode ? <TextInput onInput={event=>{formInfo[event.target.id]=event.target.value}} id="inviteCode" label="#page.login_register.invite_code#"/> : null}
				<TextInput onInput={event=>{formInfo[event.target.id]=event.target.value;setPasswordConfirmed(event.target.value==formInfo.password && !!formInfo.login)}} id="login" defaultValue={formInfo.login} type="email" placeholder="example@example.com" label={<React.Fragment><FixedSVG>{app.___svgs.mail}</FixedSVG> #page.login_register.your_name#</React.Fragment>}/>
				<TextInput onInput={event=>{formInfo[event.target.id]=event.target.value}} id="password" type="password" placeholder="**********" label="#page.login_register.your_password#"/>
				<TextInput onInput={event=>{setPasswordConfirmed(event.target.value==formInfo.password && !!formInfo.login)}} type="password" placeholder="**********" label="#page.login_register.confirm_your_password#"/>
			</React.Fragment>
		} else if (LoginState==1) {
			const rndClass = generateRndBtnId();
			p = <React.Fragment>
				<p>#page.login_register.letsend#</p>
				<div className={rndClass}>
					<style>
					{`
					.${rndClass} {
						display: flex;
						justify-content: center;
						align-items: center;
						gap: 8px;
						font-size: 20px;
					}
					.${rndClass} > .app-userAvatar {
						height: 120px;
					}
					.${rndClass} > div {
						display: flex;
						flex-direction: column;
					}
					`}
					</style>
					<app.components.Avatar/>
					<div>
						<CoolTextInput id="name" onKeyDown={function (event) {
							if (event.key=="Enter") return event.preventDefault();
						}} onInput={(event)=>{formInfo[event.target.id]=event.target.textContent}} placeholder="Cool username"/>
						<CoolTextInput id="tag" onKeyDown={function (event) {
							if (!/^[a-zA-ZА-Яа-яЁё0-9_-]*$/.test(event.key)) return event.preventDefault();
						}} onInput={(event)=>{formInfo[event.target.id]=event.target.textContent}} label=<b>@</b> placeholder="cooltag"/>
					</div>
				</div>
				<p>#page.login_register.ps#</p>
			</React.Fragment>;
		};
		
		
		const rndClassName = generateRndBtnId();
		return <div className={rndClassName}>
			<style>
			{`
			body > .container333 > .page-root > .root {
				display: flex;
				align-content: center;
				justify-content: center;
				align-items: center;
			}
			.${rndClassName} {
				display: flex;
				align-items: center;
			}
			.${rndClassName} > fieldset {
				display: flex;
				flex-direction: column;
				gap: 5px;
				width: 400px;
				text-align: left;
				padding: 10px;
				border-radius: 10px;
			}
			@media (max-width: 700px) {
				.${rndClassName} > fieldset {
					width: -webkit-fill-available;
				}
				.${rndClassName} > fieldset > * {
					text-align: center;
				}
			}
			`}
			</style>
			<fieldset>
				<legend>#page.login_register.register#</legend>
				<ErrorAlert>{ErrorState}</ErrorAlert>
				{p}
				<span><app.components.ProcessButton disabled={!passwordConfirmed} className="btn app-button" onClick={/*processButton(*/async function (event){
					setFormInfo(formInfo);
					if (LoginState===0) {
						setLoginState(LoginState+1);
						return "ignore";
					} else {
						const result = await app.gf.put("login", formInfo);
						if (typeof result == "object") {
							/*const token = result.content;
							
							cookieMngr.setCookie("token", token);
							app.f.headers.set("authorization", token);
							const user = await app.f.get("self/me");
							getMe.update(user.content, token);*/
							cookieMngr.setCookie("token", result.content.accessToken.token);
							cookieMngr.setCookie("refresh_token", result.content.refreshToken.token);
							app.f.headers.set("authorization", result.content.accessToken.token);
							const user = await app.f.get("self/me");
							getMe.update(user.content, result.content.accessToken.token, result.content.refreshToken.token);
							
							setLoginState(-1);
						} else {
							setErrorState(app.translateError(result));
							throw {handledText: "#button.error#"};
						};
					};
				}/*)*/}>{LoginState===0 ? "#button.continue#" : "#button.letsgo#"}</app.components.ProcessButton> {LoginState!=0 ? <button className="btn app-button" onClick={()=>{setLoginState(0);setPasswordConfirmed(false)}}>#button.cancel#</button> : null}</span>
				<hr />
				<Link to="/login">#page.login_register.youhaveaccount#</Link>
				<br />
				<h6>#page.login_register.agreement#</h6>
				<p><Link to="/docview?path=/static/tos.txt">#page.login_register.tos#</Link>, <Link to="/docview?path=/static/rules.txt">#page.login_register.rules#</Link></p>
			</fieldset>
		</div>;
	} else {
		const rndId = generateRndBtnId();
		return (
			<div className={rndId}>
				<UserBackgroundStyleSetting background={{"style": "156deg, #9e97ff, #ffbe72"}} />
				<style>
				{`
				/* Тап тап тап по хомяку */
				body > .container333 > .page-root > .root {
					display: flex;
					align-items: center;
					align-content: center;
					justify-content: center;
					align-items: center;
				}
				.${rndId} {
					display: flex;
					gap: 10px;
					padding: 10px;
					border-radius: 10px;
					background-color: var(--transparencyColor);
					padding: 15px;
					border-radius: 10px;
					align-items: center;
				}
				.${rndId} > .app-userAvatar {
					height: 150px;
				}
				@media (max-width: 700px) {
					.${rndId} {
						height: -webkit-fill-available;
						justify-content: center;
						flex-direction: column;
						padding-bottom: 60px;
						border-radius: 0;
					}
				}
				`}
				</style>
				<app.components.Avatar user={app.me} />
				<div>
					<h3>{"#page.login_register.welcome1#".replace("&0&", !!app.me.name ? app.me.name : "@"+app.me.tag)}</h3>
					<h6>#page.login_register.thanks#</h6>
					<span><Link to="/" className="btn app-button">#button.ok#</Link> <Link to="/user/self" className="btn app-button">#page.login_register.show_my_page#</Link></span>
				</div>
			</div>
		);
	};
};
