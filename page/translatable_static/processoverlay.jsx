/* --------------------------------------- */

import React from "react";
import ReactDOM from "react-dom/client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

/* --------------------------------------- */

const useProcessOverlayData = create(immer(
	(set, get)=>({
		data: [],
		appendData(id, title, progress) {
			set(state=>{
				state.data.push({ id, title: title ?? "untitled progress :D", progress: progress ?? "0%" })
			});
		},
		update(id, title, progress) {
			/*set(state=>{
				const d = state.data.filter
			});*/
			/*const actualData = get().data.find(x=>x.id == id);
			if (actualData) {
				set(state=>{
					let indx = state.data.indexOf(actualData);
					state.data[indx] = { id, title: title ?? actualData.title, progress: progress ?? actualData.progress };
				});
			};*/
			set(state=>{
				let indx = state.data.findIndex(x=>x.id == id);
				let actualData = state.data[indx];
				if (indx !== -1) state.data[indx] = { id, title: title ?? actualData.title, progress: progress ?? actualData.progress };
			});
		},
		remove(id) {
			/*const actualData = get().data.find(x=>x.id == id);
			if (actualData) {
				set(state=>{
					let indx = state.data.indexOf(actualData);
					state.data.splice(indx, 1);
				});
			};*/
			set(state=>{ state.data = state.data.filter(x=>x.id!==id) });
		}
	})
));

const container = document.createElement("div");
container.classList.add("processoverlay");
container.classList.add("app-cm-modal");
container.hidden = true;
document.body.appendChild(container);

function ProcessList() {
	let lst = useProcessOverlayData(d=>d.data);
	
	React.useEffect(function () {
		container.hidden = lst.length <= 0;
	}, [lst]);
	
	return <>
		<h4>#page.progressinfo.title#</h4>
		<div id="lst">
			{lst.map(x=>(
				<div><span>{x.title}</span><span id="progress">{x.progress}</span></div>
			))}
		</div>
	</>;
};

app.createProcessInfo = function (func, title, progress) {
	return new Promise(async (r)=>{
		// Используем функцию возврата результата как сам уникальный идентификатор
		useProcessOverlayData.getState().appendData(r, title, progress);
		
		let cancelled = false;
		
		let successfully = false;
		let result = false;
		
		const update = (...a)=>useProcessOverlayData.getState().update(r, ...a);
		const cancel = ()=>{ useProcessOverlayData.getState().remove(r); cancelled = true };
		
		try {
			result = await func(update, cancel);
			successfully = result !== false;
		} catch(e) {
			console.error("Прогресс был неудачно завершен :< . Подробнее: ", e);
			result = e;
		} finally {
			if (!cancelled) cancel();
			r([successfully, result]);
		};
	});
};

app.createProcessInfo._root = ReactDOM.createRoot(container);
app.createProcessInfo._root.render(<ProcessList />);


window.addEventListener("beforeunload", function (e) {
	if (useProcessOverlayData.getState().data.length > 0) {
		snakeObject(container, 50, 10); // Пытается напомнить юзеру, что все еще активно
		e.preventDefault();
		e.returnValue = "Please, dont leave while we working :<";
	};
});