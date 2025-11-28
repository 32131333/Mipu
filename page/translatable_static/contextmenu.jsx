import React from "react";
import ReactDOM from "react-dom/client";

// Хорошо, так как этот скрипт теперь часть webpack, судя по всему, по видимому, мне теперь можно просто импортировать вшитый в сам вебпак модуль
import {computePosition, autoUpdate, shift, flip} from "@floating-ui/dom";


app.cm = {};


app.cm.elem = document.createElement("div");
app.cm.elem.classList.add("container42");
document.body.appendChild(app.cm.elem);

app.cm.__ = [];
app.cm.nuke = function (reason) {
	app.cm.__.forEach(x=>{
		x[1](null, reason);
		// if (!x[0].isConnected) app.cm.__ = app.cm.__.slice(1);
	});
};

/*app.cm.elem.addEventListener("click", function (event) {
	if (event.target == app.cm.elem) return app.cm.nuke();
});*/
document.body.addEventListener("click", function (event) {
	if (!app.cm.elem.contains(event.target) && document.body.contains(event.target)) { app.cm.nuke("clicked"); };
});

app.cm.createContextMenu = function (arg) {
	/* arg = [{text: "aa", onClick: ()=>{}}, <Component/>]; */
	return <div>
		{arg.children.map((x, y)=>{
			if (x.onClick) {
				if (typeof x.text=="string") {
					return <app.cm.createContextMenu.Button key={y} closeFunction={arg.closeFunction} onClick={x.onClick} dangerouslySetInnerHTML={{__html: x.text}}/>;
				} else {
					return <app.cm.createContextMenu.Button key={y} closeFunction={arg.closeFunction} onClick={x.onClick} children={x.text}/>;
				};
			} else if (x.url) {
				return <app.cm.createContextMenu.Link key={y} closeFunction={arg.closeFunction} to={x.url} dangerouslySetInnerHTML={{__html: x.text}}/>
			} else if (x.html) {
				return <React.Fragment dangerouslySetInnerHTML={{__html: x.html}}/>
			} else {
				if (React.isValidElement(x)) {
					// сюда можно прокинуть пропсу closeFunction
					return React.cloneElement(x, { key: y, closePopup: arg.closeFunction });
				};
				return <React.Fragment key={y} children={x}/>;
			};
		})}
	</div>;
};
app.cm.createContextMenu.Button = function (arg) {
	function buttonOnClick(event) {
		function closeF() {
			if (arg.closeFunction) return arg.closeFunction(null, "pressed");
		};
		if (arg.onClick) arg.onClick();
		return closeF();
	};
	return <button className="basebutton" onClick={buttonOnClick} dangerouslySetInnerHTML={arg.dangerouslySetInnerHTML}>{arg.children}</button>;
};
app.cm.createContextMenu.Link = function (arg) {
	function buttonOnClick(event) {
		function closeF() {
			if (arg.closeFunction) return arg.closeFunction(null, "pressed");
		};
		event.preventDefault();
		window.history.pushState({}, '', arg.to);
		window.dispatchEvent(new PopStateEvent("popstate"));
		return closeF();
	};
	return <button className="basebutton" onClick={buttonOnClick} dangerouslySetInnerHTML={arg.dangerouslySetInnerHTML}>{arg.children}</button>;
};

app.cm.create = function (arg, options) {
	let elem = document.createElement("div");
	elem.hidden = true;
	app.cm.elem.appendChild(elem);
	elem.classList.add("app-cm");
	elem.classList.add("app-cm-modal");
	elem.r = ReactDOM.createRoot(elem);
	
	if (options.toElement) {
		/*elem.p = Popper.createPopper(options.toElement, elem);*/
		
		elem.p = autoUpdate(options.toElement, elem, () => {
			computePosition(options.toElement, elem, {
				middleware: [
					shift(),
					flip()
				],
			}).then(({x, y}) => {
				Object.assign(elem.style, {
					left: `${x}px`,
					top: `${y}px`,
				});
			});
		});
	} else {
		
	};
	
	async function closeF(forced=false, reason) {
		if (options.closeFunction && !forced) {
			const result = await options.closeFunction(reason);
			if (result) { closeF(true, reason) };
		} else {
			elem.r.unmount();
			/*if (elem.p) elem.p.destroy();*/
			if (elem.p) elem.p();
			elem.remove();
			
			const me = app.cm.__.filter(x=>x[0]==elem)[0];
			if (me) {
				app.cm.__ = app.cm.__.filter(x=>x!=me);
			};
		};
		console.log("Closed", reason);
	};
	elem.r.render(<app.cm.createContextMenu children={arg} closeFunction={closeF}/>);
	elem.hidden = false;
	setTimeout(()=>app.cm.__.push([elem, closeF]), 500);
	return closeF;
};

