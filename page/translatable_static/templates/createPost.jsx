import { Link, useParams, useLocation } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment, useMemo } from "react";
import React from "react";
import { useImmer } from "use-immer";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

//const visibilityDesc = tryToReadJSON("#page.create.visibilitydesc#");
const visibilityDesc = app.structures.MipuAdvPostPreview.visibilityDesc;

const useCreatePageData = create(immer(
	(set, get)=>({
		type: null,
		setType: (type)=>set({ type }),
		
		body: {},
		updateBody: a=>set(s=>{ typeof a == "function" ? a(s.body) : (s.body = a) }),
		
		result: {},
		updateResult: a=>set(s=>{ typeof a == "function" ? a(s.result) : (s.result = a) }),
		
		reset() {
			set({ body: {}, type: null, result: {} });
		}
	})
));
app.memory.updateCreatePageData = async function (contentType, newData) {
	const type = useCreatePageData.getState().type;
	if (contentType!==undefined && type!==undefined && type!=contentType) {
		const confirm = await app.functions.youReallyWantToDo(undefined, undefined, "#page.create.rewritealert#");
		if (confirm) {
			useCreatePageData.getState().reset();
		} else {
			return false;
		};
	};
	
	useCreatePageData.getState().setType(contentType);
	useCreatePageData.getState().updateBody(newData);
	return true;
};
// app.ddd = useCreatePageData;

export const path = "/create";
export default function CreatePage() {
	const [ type, setType ] = useCreatePageData(useShallow(a=>[a.type, a.setType]));
	//const reset = useCreatePageData(a=>a.reset);
	
	if (type && ( type == "posts_success" || type == "mipuadv_posts_success" )) {
		return <>
			{ type == "posts_success" && <CreatePage.CreateTextPost.Success /> }
			{ type == "mipuadv_posts_success" && <CreatePage.CreateMipuAdvancedPost.Success /> }
		</>;
	} else if (type && ( type=="posts" || type=="mipuadv_posts" )) {
		return <>
			{ /* <button onClick={reset}>#button.reset#</button> */ }
			{ type=="posts" && <CreatePage.CreateTextPost /> }
			{ type=="mipuadv_posts" && <CreatePage.CreateMipuAdvancedPost /> }
		</>;
	} else {
		return <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
			<div>
				<h3>#page.create.hello#</h3>
				<span>#page.create.hello1#</span>
			</div>
			<div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "center" }}>
				<button className="btn app-button" onClick={()=>setType("posts")}>#page.create.posts#</button>
				<button className="btn app-button" onClick={()=>setType("mipuadv_posts")}>#page.create.mipuadv_posts#</button>
			</div>
		</div>;
	};
};

CreatePage.CreateTextPost = function () {
	//const [ body, updateBody ] = useCreatePageData(useShallow(a=>[a.body, a.updateBody]));
	
	
	
	const updateResult = useCreatePageData(a=>a.updateResult);
	const setType = useCreatePageData(a=>a.setType);
	
	const updateBody = useCreatePageData(a=>a.updateBody);
	const [ body ] = useState(() => useCreatePageData.getState().body);
	
	const reset = useCreatePageData(a=>a.reset);
	
	
	return <app.structures.PostEdit
		post={body}
		onApply={p=>{ updateResult(p); setType("posts_success") }}
		onInput={updateBody}
		onCancel={reset}
	/>
};
CreatePage.CreateTextPost.Success = function () {
	const reset = useCreatePageData(a=>a.reset);
	const body = useCreatePageData(a=>a.result);
	
	return <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
		<span>
			<h3>#page.create.postssuccess#</h3>
			#page.create.postssuccess_info#
		</span>
		<div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "center" }}>
			<Link to={`/post/${body.id}`} className="btn app-button">#button.redirect#</Link>
			<button className="btn app-button" onClick={reset}>#button.return#</button>
		</div>
	</div>;
};

CreatePage.CreateMipuAdvancedPost = function () {
	const [ body, updateBody ] = useCreatePageData(useShallow(a=>[a.body, a.updateBody]));
	const reset = useCreatePageData(a=>a.reset);
	
	const cooltextinputInitialDefaultValue = useMemo(()=>body.audios && body.audios.join(",") || "", []);

	const setType = useCreatePageData(a=>a.setType);
	
	const selectedVisibility = body.visibility !== undefined ? visibilityDesc.find(x=>x.id==body.visibility) : visibilityDesc[0];

	const uploadRef = useRef();

	function handleObjectAdd(e) {
		uploadRef.current.click();
	};
	useEffect(function () {
		function onChange(event) {
			updateBody(d=>{
				const contentForm = d.content ?? (d.content = []);
				const contentFilesForm = d._contentFiles ?? (d._contentFiles = []);
				
				Array.from(uploadRef.current.files).forEach(x=>{
					contentForm.push({ id: x.type.split("/")[0] });
					contentFilesForm.push(x);
				});
			});
			uploadRef.current.value = "";
		};
		uploadRef.current.addEventListener("change", onChange);
		
		return ()=>{ if (uploadRef.current) uploadRef.current.removeEventListener("change", onChange) }; // DOM-элемент может уничтожиться
	}, []);

	return <div style={{ height: "100%", display: "grid", gridTemplateRows: "30px 1fr 45px" }}>
		<div><button onClick={reset} className="app-iconOnlyButton b"><app.components.react.FixedSVG className="alphaicon fill a" children={app.___svgs.x_1}/></button> #page.create.mipuadv_posts#</div>
		<div>
			<input ref={uploadRef} accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/ogg,video/webm" hidden multiple type="file"/>
			<div style={{ display: "flex", width: "100vw", padding: "5px", marginBlockEnd: "12px", overflow: "auto", gap: "5px" }}>
				{ Array.isArray(body.content) && body.content.map((x,i)=>(
					<div className="app-uploadCard">
						<button className="app-iconOnlyButton" onClick={()=>{
							updateBody(draft=>{
								const index = draft.content.indexOf(x);
								draft.content.splice(index, 1);
								draft._contentFiles.splice(index, 1);
							});
						}} style={{ position: "absolute", top: "-5px", right: "-5px" }}><app.components.react.FixedSVG className="alphaicon fill a" children={ app.___svgs.x_1 }/></button>
						{x.id}
					</div>
				))}
				<button className="app-uploadCard" onClick={handleObjectAdd}>
					<div>
						<span style={{ fontSize: 20 }}><app.components.react.FixedSVG className="alphaicon fill a" children={ app.___svgs.new }/></span>
						<br />
						<span>{ Array.isArray(body.content) && body.content.length > 0 ? "#button.addnew#" : "#button.add#" }</span>
					</div>
				</button>
			</div>
			<div style={{ paddingBlock: 5 }}>
				<app.components.ContentInput
					value={body.description}
					placeholder="#page.create.mipuadvdesc#"
					onChange={e=>updateBody(x=>{ x.description = e.target.value })}
					/>
			</div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
				<div>#page.create.mipuadvsound#<br />#page.create.mipuadvsounddesc#<br /><span className="app-notMainText">(mvp)</span></div>
				<app.components.react.CoolTextInput onInput={e=>{
					let v = e.target.textContent;
					v = v.split(",").map(x=>x.trim());
					updateBody(x=>{ x.audios = v });
				}} defaultValue={cooltextinputInitialDefaultValue} placeholder="sprksid,sprksid_videoindex,..."/>
			</div>
			<button className="app-buttonFromModals flexCenter" onClick={()=>{ updateBody(d=>{ d.visibility = visibilityDesc[visibilityDesc.indexOf(selectedVisibility)+1] ? visibilityDesc[visibilityDesc.indexOf(selectedVisibility)+1].id : visibilityDesc[0].id }) }}>
				<span id="icon" children={selectedVisibility.emoji}/>
				<span><b>#page.create.visibility#: {selectedVisibility.name}</b><br />{selectedVisibility.description}</span>
			</button>
		</div>
		<div style={{ width: "100%", height: "100%" }}>
			<app.components.ProcessButton style={{ width: "100%", height: "100%" }} className="btn btn-primary" onClick={() => new Promise(r => app.createProcessInfo((update,cancel)=>CreatePage.CreateMipuAdvancedPost.upload( body, update, cancel, x=>{r(x);if (x) { setType("mipuadv_posts_success") } } )) ) }>#button.submit#</app.components.ProcessButton>
		</div>
	</div>;
};
CreatePage.CreateMipuAdvancedPost.upload = async function (body, update, cancel, onProcessing) {
	const { _contentFiles, ...contentBody } = body;
	update("#page.create.mipuadvpostuploading.preparing#", "0%");
	
	let bodyReader, abort;
	const r = await app.f.post("mipuadv_posts", contentBody);
	
	if (onProcessing) onProcessing(Array.isArray(r));
	if (!Array.isArray(r)) return cancel();
	
	[ bodyReader, abort ] = r;
	
	
	let confirm, confirmed;
	let onReady;
	
	new Promise(async (r,t)=>{
		const ready = await new Promise(r=>{
			onReady = r;
		});
		
		for (const a of _contentFiles) {
			update("#page.create.mipuadvpostuploading.uploading#".replace("&0&", `${_contentFiles.indexOf(a)+1}`).replace("&1&", `${_contentFiles.length}`), `${Math.round(((_contentFiles.indexOf(a)+1) / _contentFiles.length) * 100)}%`);
			let success;
			let attempts = 0;
			
			while (!success) {
				const result = await app.f.post("mipuadv_posts/upload", a);
				
				if (result.status == "success") { success = true }
				else {
					attempts++;
					if (attempts > 3 || confirmed) return t();
				};
			};
		};
		r();
	}).catch(r=>confirm(false));
	
	const result = await new Promise(async(r)=>{
		confirm = r;
		
		const txtdecode = new TextDecoder();
		let result;
		
		let buffer = "";
		let resp = "";
		
		while (!confirmed) {
			try {
				const { value, done } = await bodyReader.read();
				
				/*if (decoded.startsWith("READY")) onReady();
				if (decoded.startsWith("RESULT")) {
					result = decoded.slice(6).trim();
					try { result = JSON.parse(result) } catch {};
				};*/
				buffer += txtdecode.decode(value, { stream: true });
				//console.log(buffer);
				while (buffer.includes("\r\n")) {
					let indx = buffer.indexOf("\r\n");
					resp = buffer.slice(0, indx);
					buffer = buffer.slice(indx+4);
					
					if (resp == "READY") onReady();
					if (resp.startsWith("RESULT")) {
						result = resp.slice(6);
						try { result = JSON.parse(result) } catch {};
					};
					resp = "";
				};
				
				if (done) break;
			} catch {
				break;
			};
		};
		if (!confirmed) {
			r(result);
			//mipuadv_post_appended
			if (result.status=="success") app.toasts.show({
				type: "success",
				icon: <app.components.react.FixedSVG className="alphaicon fill d" children={app.___svgs.checkmark_1}  />,
				content: "#uncategorized.mipuadv_post_appended#",
				duration: 5000,
				onClick(_, c) { c() }
			});
		};
	});
	confirmed = true;
	abort();
	
	return result;
};



CreatePage.CreateMipuAdvancedPost.Success = function () {
	const reset = useCreatePageData(a=>a.reset);
	
	return <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
		<span>
			<h3>#page.create.mipuadvpostssuccess#</h3>
			#page.create.mipuadvpostssuccess_info#
		</span>
		<div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "center" }}>
			<button className="btn app-button" onClick={reset}>#button.return#</button>
		</div>
	</div>;
};