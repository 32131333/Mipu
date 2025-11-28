import { Link, useParams, useLocation, Navigate } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";


export const path = "/you";
export default function youPage() {
	const { me, failed } = app.reactstates.useInformationAboutMe();
	if (failed) return "#page.userinfomobile.somethinghappened#";
	if (me == "guest") return <Navigate to="/login" replace/>;
	
	
	return <>
		<div>
			<Link className="app-dontModifyLink" to="/user/self" style={{ width: "100%", gap: "10px", padding: "15px 10px", display: "flex", alignItems: "center", fontSize: "18px", justifyContent: "center"}}>
				<app.components.Avatar style={{height: "100px"}} user={me}/>
				<div>
					<b><app.components.Username user={me}/></b>
					<br />
					<span className="app-clickableText">#page.userinfomobile.presstoredirect#</span>
				</div>
			</Link>
			<div style={{ height: "-webkit-fill-available", width: "100%", display: "flex", flexDirection: "column", fontSize: "large" }}>
				<Link to="/settings" className="app-buttonFromModals app-dontModifyLink"><app.components.react.FixedSVG className="alphaicon fill a emoji" children={app.___svgs.shesternya}/> #page.userinfomobile.settings#</Link>
				<button onClick={app.functions._userContextMenu.exitFromAccount} className="app-buttonFromModals"><app.components.react.FixedSVG className="alphaicon fill a emoji" children={app.___svgs.x_1}/> #page.userinfomobile.exit#</button>
			</div>
		</div>
	</>
};
