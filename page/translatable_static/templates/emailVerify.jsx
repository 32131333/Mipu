import { redirect, Link, useSearchParams } from "react-router";
import { useState, useEffect, Fragment } from "react";
import React from "react";

export default function EmailVerifyPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [ loading, setLoading ] = useState(true);
	const [ error, setError ] = useState(null);
	
	const token = searchParams.get("token");
	useEffect(()=>{
		async function doIt() {
			const response = await app.f.patch("requireemailverify", {token: token});
			if (typeof response=="string") setError(response);
			setLoading(false);
		};
		doIt();
	}, []);
	
	if (loading) { return <app.components.LoadingPage /> }
	else if (error) { 
		return <div className="app-pg-minimalisecutify">
			<h3>#page.emailverify.failed#</h3>
			<app.components.ErrorAlert>{app.translateError(error)}</app.components.ErrorAlert>
			<span><Link to="." className="btn app-button">#button.retry#</Link> <button className="btn app-button" onClick={()=>window.history.back()}>#button.return#</button></span>
		</div>
	} else {
		return <div className="app-pg-minimalisecutify">
			<h3>#page.emailverify.success#</h3>
			<span><Link to="/" className="btn app-button">#button.ok#</Link> <button className="btn app-button" onClick={()=>window.history.back()}>#button.return#</button></span>
		</div>
	};
};