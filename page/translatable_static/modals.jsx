/*
	modals.jsx - начальный путь к тому, чего я хочу добиться, хоть далеко. И не важно, что такого полны полно. К сожалению, я не избранный
*/

import { useState, Fragment } from "react";
import React from "react";
import ReactDOM from "react-dom/client";

app.m_ = {};

app.m_.btnClassEdit = function (cl) {
	if (cl && (cl.startsWith("btn") || cl.startsWith("app-iconOnlyButton"))) return cl
	else return `btn app-button${cl ? " "+cl : ""}`;
};

app.m_.order = [];
app.m_.thisVal = null;
app.m_.Root = ReactDOM.createRoot(document.querySelector("body > .container03"));

document.querySelector("body > .container03").addEventListener("click", function (event) {
	if (app.m_.thisVal && event.target === document.querySelector("body > .container03")) {
		if (app.m_.thisVal.closable) app.m_.unrender("closed");
	};
});

app.m_.Button = function(val) {
	const r = {};
	
	let hasFunctions;
	for (const a in val) {
		if (typeof val[a] === "function") {
			hasFunctions = true;
			r[a] = async function (...x) {
				let result = true;
				try {
					result = await val[a](...x);
				} catch {};
				if (typeof result == "object" ? result.end : result) {
					app.m_.unrender(typeof result == "object" ? result.result : result);
				};
			};
		} else { r[a] = val[a] };
	};
	if (!hasFunctions) r.onClick = () => app.m_.unrender("closed");
	
	//return <button {...r} className={app.m_.btnClassEdit(r.className)}></button>;
	return React.createElement(
		val.isProcessButton ? app.components.ProcessButton : "button",
		{ ...r, className: app.m_.btnClassEdit(r.className) }
	);
};
app.m_.Border = function(val) {
	return <div className="border"><hr/>{val.children}</div>
};
app.m_.Footer = app.m_.Border;
app.m_.Title = function(val) {
	return <span className="title">{val.children}<hr/></span>
};
app.m_.Scrollable = function (val) {
	return <div className="scrollable">
		{val.children}
	</div>;
};

app.m_.render = function (val) {
	if (!document.querySelector("body > .container03").hidden) {app.m_.order.push(val);return};
	app.m_.thisVal = val;
	document.querySelector("body > .container03").hidden = false;
	try {
		app.m_.Root.render(
			<div className={val.adaptMobile ? "mobile" : null}>
				{val.title ? <app.m_.Title>{val.title ?? "modal"}</app.m_.Title> : null}
				{val.html ? <div dangerouslySetInnerHTML={{__html: val.html}}></div> : null}
				{val.component}
				{val.border ? <app.m_.Border>{val.border}</app.m_.Border> : null}
				{val.closable ? <app.m_.Button className="app-iconOnlyButton b-close"><app.components.react.AlphaIcon src="/static/svg/x_1.svg" /></app.m_.Button> : null}
			</div>
		);
	} catch(e) {
		console.error(e);
		app.m_.unrender("error");
	};
};

app.m_.render.test = () => app.m_.render({title: "Hello world!", component: "Hello!!!!! Can you click this button?", border: (<app.m_.Button className="btn btn-default">Ya!! :3</app.m_.Button>)});
app.m_.render.test0 = function () {
	let Button = app.m_.Button;
	let Border = app.m_.Border;
	let Title = app.m_.Title;
	let TextInput = app.components.react.TextInput;
	let CheckBox = app.components.react.CheckBox;
	let Err = app.components.ErrorAlert;
	function A() {
		const [s, setS] = React.useState("s");
		const [t, setT] = React.useState(0);
		const [sht, setSht] = React.useState(false);
		return (
		<React.Fragment>
			<Title>UwU</Title>
			<Err>{sht ? `Ticked ${t} times` : null}</Err>
			<TextInput onInput={(event)=>{setS(event.target.value);setT(t+1)}} defaultValue={s} title="Nya~~" placeholder="skibidi"/>
			<Border><span><Button className="btn btn-default">{s}</Button> <CheckBox onInput={(event, r)=>{setSht(r);setT(t+1)}} label="Show ticked"/></span></Border>
		</React.Fragment>);
	};
	app.m_.render({
		component: <A/>,
		closable: true
	});
};
app.m_.render.test1 = () => app.m_.render({closable: true});

app.m_.unrender = function (result) {
	document.querySelector("body > .container03").hidden = true;
	if (app.m_.thisVal.onEnd) app.m_.thisVal.onEnd(result);
	if (app.m_.order[0]) {
		let next = app.m_.order[0];
		app.m_.order = app.m_.order.slice(1);
		app.m_.render(next);
	} else {	
		app.m_.Root.unmount();
		app.m_.Root = ReactDOM.createRoot(document.querySelector("body > .container03"));
		app.m_.thisVal = null;
	};
};