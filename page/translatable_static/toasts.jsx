/* --------------------------------------- */

import React from "react";
import ReactDOM from "react-dom/client";

import Timer from "./../static/timer.js";

/* --------------------------------------- */

app.toasts = {
	list: []
};

// Создаем контейнер
const toastsContainer = document.createElement("div");
toastsContainer.classList.add("container-toasts");
document.body.append(toastsContainer);

// Рендерим контейнер
app.toasts.root = ReactDOM.createRoot(toastsContainer);

app.toasts._ToastsContainer = function ({ toasts }) {
	const isMobile = app.reactstates.useIsMobileOrientation();
	
	
	return <>
		{toasts.map((x,i)=><app.toasts.Toast key={x.id} children={x} hidden={isMobile && i!==0}/>)}
	</>;
};
app.toasts.Toast = function ({ children, hidden }) {
	const TimerRef = React.useRef(new Timer(children.duration));
	
	const handleClose = React.useCallback(function () {
		//console.log("Handled close");
		const index = app.toasts.list.indexOf(children);
		
		if (index !== -1) app.toasts.list.splice(index, 1);
		app.toasts.reRender();
	}, [children]);
	
	React.useEffect(function () {
		//console.log("Enabling the timer");
		TimerRef.current.defaultFunc = handleClose;
		if (children.duration!==null) TimerRef.current.start();
		
		return ()=>{
			if (children.onClose) children.onClose();
			
			if (TimerRef.current.working) {
				TimerRef.current.cancel();
			};
		};
	}, [handleClose]);
	
	
	/*try { return <span>{JSON.stringify(children)}</span> }
	catch { return <span>children</span> };*/
	return React.createElement(
		children.href ? app.components.react.UnderRouterLink : "div",
		{
			onClick: (e)=>{
				if (children.href) handleClose();
				return children.onClick && children.onClick(e, handleClose)
			},
			className: (children.href || children.onClick ? "notify-block clickable" : "notify-block") + (children.type ? ` ${children.type}` : ""),
			to: children.href,
			hidden
		},
		<>
			<div id="icon">{children.icon}</div>
			<div className="text-content">{children.content}</div>
			{children.duration!==null && <div id="progress" style={{animation: `timeoutProgress ${children.duration/1000}s linear`}}/>}
		</>
	);
};

app.toasts.show = function (arg) {
	/*
	{
		type: null, // "normal" || "success" || "warn" || "error" || "info". По умолчанию "normal"
		content: "", // DOM-контейнер, строка или React-элемент
		duration: null, // Что-то там в миллисекундах. Автоматически ляляля закрываются
		icon: "", // Типа что рендерить в качестве иконки. Либо используется по умолчанию согласно типу, либо DOM-контейнер, URL-изображения или React-элемент
		onClick: function () {},
		onClose: function () {},
		href: ""
	}
	*/
	const toastId = String(Math.random()).slice(3);
	
	//app.toasts.list.push(arg);
	
	app.toasts.list.splice(0, 0, {...arg, id: toastId});
	app.toasts.reRender();
};

app.toasts.reRender = function () { app.toasts.root.render(<app.toasts._ToastsContainer toasts={app.toasts.list}/>) };