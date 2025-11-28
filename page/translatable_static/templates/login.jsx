import { Link } from "react-router";
import { useState, useEffect, Fragment } from "react";

const { CheckBox, TextInput, FixedSVG } = app.components.react;
const { UserBackgroundStyleSetting, ErrorAlert } = app.components;
import React from "react";

const generateRndBtnId = ()=>`btn${Math.floor(Math.random()*1000)}`;

export const path = "login";
export default function LoginPage() {
	let [ LoginState, setLoginState ] = useState(0);
	let [ ErrorState, setErrorState ] = useState(null);
	let [ accountSelect, setAccountSelect ] = useState(null);
	let [ formInfo, setFormInfo ] = useState({rememberme: true});
	
	if (LoginState >= 0) {
		let elem;
		let elem0;
		if (LoginState == 1) {
			elem = (
				<Fragment>
					<span><FixedSVG>{app.___svgs.mail}</FixedSVG> {"#page.login_register.my_name#".replace("&0&", formInfo["login"])}</span>
					<input defaultValue={formInfo.login} type="email" disabled hidden/>
					<TextInput label="#page.login_register.your_password#" defaultValue={formInfo.password} id="password" type="password" onInput={event=>{formInfo[event.target.id]=event.target.value}} placeholder="********" />
				</Fragment>
			);
		} else {
			elem0 = (
				<Fragment>
					<TextInput label="#page.login_register.your_name#" defaultValue={formInfo.login} id="login" type="email" onInput={event=>{formInfo[event.target.id]=event.target.value}} placeholder="example@example.com" />
					<CheckBox onInput={(event, checked)=>{formInfo[event.target.id]=checked}} label="#page.login_register.remember#" checked={formInfo.rememberme} id="rememberme" />
				</Fragment>
			);
		};
		const rndClass = generateRndBtnId();
		return (
			<div className={rndClass}>
				<style>
				{`
				/*  */
				body > .container333 > .page-root > .root {
					display: flex;
					align-content: center;
					justify-content: center;
					align-items: center;
				}
				.${rndClass} {
					display: flex;
					align-items: center;
				}
				.${rndClass} > fieldset {
					display: flex;
					flex-direction: column;
					gap: 5px;
					width: 400px;
					text-align: left;
					padding: 10px;
					border-radius: 10px;
				}
				@media (max-width: 700px) {
					.${rndClass} > fieldset {
						width: -webkit-fill-available;
					}
					.${rndClass} > fieldset > * {
						text-align: center;
					}
				}
				`}
				</style>
				<fieldset>
					<legend>#page.login_register.login#</legend>
					<ErrorAlert>{ErrorState}</ErrorAlert>
					{elem}
					{elem0}
					<span><app.components.ProcessButton className="btn app-button" onClick={/*processButton(*/async function (event) {
						setFormInfo(formInfo);
						if (LoginState===0) {
							setLoginState(1);
							return "ignore";
						} else if (LoginState===1) {
							const respond = await app.gf.get("login", formInfo);
							if (respond !== undefined ? !respond.content.failed : false) {
								if (respond.content.length > 0) {
									setAccountSelect(respond.content);
									setLoginState(-1);
								};
							} else {
								if (respond !== undefined && respond.content.failed==="missing") setErrorState("#page.login_register.missing_login#")
								else setErrorState("#page.login_register.unknown_error#");
								throw {handledText: "#button.error#"};
							};
						};
					}/*)*/}>{LoginState !== 0 ? "#button.login#" : "#button.continue#"}</app.components.ProcessButton> {LoginState !== 0 ? <button className="btn app-button" onClick={()=>{setLoginState(0);setErrorState(null)}}>#button.cancel#</button> : null}</span>
					<hr />
					<Link to="/register">#page.login_register.youhaventaccount#</Link>
					<br />
					<h6>#page.login_register.agreement#</h6>
					<p><Link to="/docview?path=/static/tos.txt">#page.login_register.tos#</Link>, <Link to="/docview?path=/static/rules.txt">#page.login_register.rules#</Link></p>
				</fieldset>
			</div>
		);
	} else {
		if (LoginState===-1) {
			if (accountSelect) {
				if (accountSelect.length===1 && accountSelect[0].unvaliable===0) {
					/*formInfo.rememberme ? cookieMngr.setCookie("token", accountSelect[0].token) : cookieMngr.setSessionCookie("token", accountSelect[0].token);
					getMe.update(accountSelect[0].user, accountSelect[0].token);
					setAccountSelect(null);*/
					const x = accountSelect[0];
					if (formInfo.rememberme) {
						cookieMngr.setCookie("token", x.accessToken.token);
						cookieMngr.setCookie("refresh_token", x.refreshToken.token);
					} else {
						cookieMngr.setSessionCookie("token", x.accessToken.token);
						cookieMngr.setSessionCookie("refresh_token", x.refreshToken.token);
					};
					getMe.update(x.user, x.accessToken.token, x.refreshToken.token);
					
					setAccountSelect(null);
				} else {
					const rndClass = generateRndBtnId();
					return (
						<div className={rndClass}>
							<style>
							{`
							/* Тап тап тап по хомяку */
							body > .container333 >.page-root > .root {
								display: flex;
								align-content: center;
								justify-content: center;
								align-items: center;
							}
							.${rndClass} {
								text-align: center;
							}
							.${rndClass} > fieldset {
								display: flex;
								flex-direction: column;
								gap: 1px;
								width: 400px;
								text-align: center;
								padding: 10px;
								border-radius: 10px;
							}
							.${rndClass} > fieldset > button {
								text-align: start;
								height: 40px;
								background: none;
								/*background-color: white;*/
								border: none;
								color: var(--buttonsAndTextColor);
								border-radius: 10px;
							}
							.${rndClass} > fieldset > button:hover {
								background-color: var(--selectedColor);
							}
							.${rndClass} > fieldset > button:active {
								background-color: var(--thirdColor);
							}
							.${rndClass} > fieldset > button > img {
								height: 35px;
								/*transform: translateY(-0.1em);*/
								margin: 0 .05em 0 .1em;
							}
							@media (max-width: 700px) {
								.${rndClass} > fieldset {
									width: -webkit-fill-available;
								}
								.${rndClass} > fieldset > * {
									text-align: center;
								}
							}
							`}
							</style>
							<fieldset>
								<legend>#page.login_register.youhavenotoneaccount#</legend>
								{accountSelect.map(x=>{return <button key={x.user.id} id={generateRndBtnId()} onClick={function(){
									/*formInfo.rememberme ? cookieMngr.setCookie("token", x.token) : cookieMngr.setSessionCookie("token", x.token);
									getMe.update(x.user, x.token);*/
									if (formInfo.rememberme) {
										cookieMngr.setCookie("token", x.accessToken.token);
										cookieMngr.setCookie("refresh_token", x.refreshToken.token);
									} else {
										cookieMngr.setSessionCookie("token", x.accessToken.token);
										cookieMngr.setSessionCookie("refresh_token", x.refreshToken.token);
									};
									getMe.update(x.user, x.accessToken.token, x.refreshToken.token);
									
									
									setAccountSelect(null);
									app.f.post("logout", {
										ids: accountSelect.filter(y=>y!=x).map(x=>x.user.id)
									});
								}}><app.components.Avatar user={x.user} scale={2.3}/> {!!x.user.name ? x.user.name : "@"+x.user.tag}</button>})}
							</fieldset>
							<button className="btn app-button" onClick={()=>{setLoginState(0);setErrorState(null)}}>#button.cancel#</button>
						</div>
					);
				};
			} else {
				const rndId = generateRndBtnId();
				return (
					<div className={rndId}>
						<UserBackgroundStyleSetting user={app.me} />
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
							<h3>{"#page.login_register.welcome#".replace("&0&", !!app.me.name ? app.me.name : "@"+app.me.tag)}</h3>
							<h6>#page.login_register.reload_page_info#</h6>
							<Link to="/" className="btn app-button">#button.ok#</Link>
						</div>
					</div>
				);
			};
		};
	};
};
