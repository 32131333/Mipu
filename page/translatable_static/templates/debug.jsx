import React from "react";
import { useSearchParams } from "react-router";


export const path = "/debug";
export default function DebugPage() {
	const [searchParams, setSearchParams] = useSearchParams();
    const p = searchParams.get('p') || 'p';

	const [ res, setRes ] = React.useState("pending...");

	const userAgent = navigator.userAgent;
	const clientId = localStorage.clientId_doNotShareWithThisOrYouWillBeHacked;

	React.useLayoutEffect(function () {
		async function r() {
			try {
				const d = await app.f.get(p);
				setRes(d !== undefined ? JSON.stringify(d) : "Without response");
			} catch {
				setRes("error :<");
			};
		};
		r();
	}, [p]);

	return <>
		<h1>Debug!! 🎀</h1>
		<span><b>User-Agent:</b> {navigator.userAgent}</span>
		<br />
		<span><b>Client-Id:</b> {clientId}</span>
		<br />
		<span><b>Response:</b> {res}</span>
	</>;
};