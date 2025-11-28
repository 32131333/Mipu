import { Link, useParams, useNavigate } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";
import { useImmer } from "use-immer";

export const path = "/sprks/:id";
export default function MipuAdvPostsBackendLoader() {
	const navigate = useNavigate();
	const { id } = useParams();
	
	const [ error, setError ] = useState(false);
	const [ loading, setLoading ] = useState(true);
	
	useEffect(function () {
		const d = async () => {
			const r = await app.f.get(`mipuadv_posts/${id}`);
			if (r.status == "success") {
				navigate("/feed", { state: { data: [r.content] }, replace: true });
			} else {
				setError(
					typeof r == "string" ?
						r 
						:
						r.content.unvaliable
				);
			};
		};
		d().then(()=>setLoading(false));
	}, []);
	
	if (loading) {
		return <app.components.LoadingPage/>;
	};
	if (error) {
		return <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
			<h3>#page.mipuadv_posts_backed_loader.uhoh#</h3>
			<span>#page.mipuadv_posts_backed_loader.failed#</span>
			<app.components.ErrorAlert>{app.translateError(error)}</app.components.ErrorAlert>
		</div>;
	};
};