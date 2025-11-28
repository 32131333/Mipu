import { useRouteError, useParams, Link } from "react-router";
import React from "react";

const ErrorTranslateInfo = tryToReadJSON("#page.error#");

export const path = "/error/:err";
export default function ErrorPage(val) {
	
	let err;
	if (!val.forcedErrorCode) {
		err = useRouteError();
		if (!err) {
			let params = useParams();
			if (!params && !params.errPage) {
				err = new Error();
			} else {
				err = new Error();
				err.status = params.err;
			};
		};
	} else {
		err = {status: val.forcedErrorCode};
	};
	console.error(err);
	let errType = err.status;
	
	let bttns = <span><button className="btn app-button" onClick={()=>window.history.back()}>#button.returnBack#</button> #uncategorized.or# <Link to={document.location.pathname} className="btn app-button">#button.tryAgain#</Link></span>;
	
	let errText = ErrorTranslateInfo[errType] ?? err.statusText;
	let errSub = ErrorTranslateInfo[`${errType}_sub`] ?? ErrorTranslateInfo.defaultSub;
	
	if (!errType) {
		errText = ErrorTranslateInfo[errType] ?? err.statusText;
		errType = "client_error";
		errSub = <span>{errSub}<br/><pre>{err.stack}</pre></span>;
	};
	
	return (
		<div className="errorPageRoot">
			<style>
				{`
				@media (min-width: 699px) {
					.errInfo {
						left: 30px;
						position: relative;
						width: 400px;
						height: max-content;
						bottom: 50px;
					}
					.errorPageRoot {
						display: flex;
						flex-direction: row;
						align-items: center;
						height: 100%;
					}
				}
				@media (max-width: 700px) {
					.errInfo {
						position: relative;
						width: max-content;
						height: max-content;
						max-width: 100%;
						bottom: 50px;
						margin: 10px;
					}
					.errorPageRoot {
						display: flex;
						flex-direction: row;
						align-items: center;
						height: 100%;
					}
				}
				`}
			</style>
			<div className="errInfo">
				<h3>{errText}</h3>
				<h3>{errSub}</h3>
				{bttns}
			</div>
		</div>
	);
};