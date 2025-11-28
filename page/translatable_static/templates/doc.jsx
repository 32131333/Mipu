import { useEffect, useState, Fragment } from "react";
import React from "react";
import { useParams, NavLink, redirect, Navigate, useLocation } from "react-router";

const { Content } = app.components;

export const path = "docview";
export default function DocumentView() {
	const location = useLocation();
	const getQueryParam = (queryString) => {
		const params = new URLSearchParams(queryString);
		return params.get('path'); // Вернуть значение параметра `path`
	};
	const [doc, setDoc] = useState(null);
	const search = getQueryParam(location.search);
	
	useEffect(()=>{
		setDoc(null);
		async function mkResponse() {
			const search = getQueryParam(location.search)
			try {
				const response = await fetch(search);
				setDoc(await response.text());
			} catch(e) {
				setDoc(e);
			};
		};
		mkResponse();
	}, [location]);
	
	return <div className="app-pg-simplecontent">
		{ typeof doc=="string" && <Content showFullDefaultly>{doc}</Content> }
	</div>
};