import { useEffect, useState, useCallback, useRef } from "react";
import React from "react";
import { useImmer } from "use-immer";


export const path = "/_emojipacks";


function Pack({ children, onPatch, onDelete }) {
	const { me } = app.reactstates.useInformationAboutMe();
	const isMyOwn = children?.author?.id == me.id;
	
	async function handleChange(d) {
		const s = await app.f.patch(`emojipack/${children.id}`, d);
		if (s.status == "success") {
			onPatch(s.content);
		};
	};
	async function handleEmojiChange(emjId, d) {
		const s = await app.f.patch(`emoji/${emjId}`, d);
		if (s.status == "success") {
			onPatch({...children, emojis: children.emojis.map(x=> x.id == s.content.id ? s.content : x )});
		};
	};
	async function handleEmojiUpload(e) {
		return await new Promise(r=>{
			app.functions.uploadFileContextMenu(async function (file) {
				const bd = new FormData();
				bd.set("file", file);
					
				const r = await app.f.post(`emojipack/${children.id}`, bd);
				if (r.status=="success") {
					onPatch({...children, emojis: [...children.emojis, r.content]});
					r(true);
				} else {
					r(false);
				};
			}, e.target, ()=>r("ignore"));
		});
	};
	async function handleEmojiDelete(emjId) {
		const confirm = await app.functions.youReallyWantToDo();
		if (confirm) {
			const r = await app.f.delete(`emoji/${emjId}`);
			if (r.status=="success") onPatch({...children, emojis: children.emojis.filter(x=>x.id!=emjId) });
			return true;
		} else {
			return "ignore";
		}
	};
	async function handlePackDelete() {
		const confirm = await app.functions.youReallyWantToDo(undefined, "deletethispack");
		const r = await app.f.delete(`emojipack/${children.id}`);
		if (r.status=="success") onDelete();
	};
	
	return <div style={{padding: 10, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
		<div style={{ fontSize: 25, gap: 10, display: "flex", justifyContent: "center", justifyContent: "space-around", alignItems: "center" }}>
			{
				isMyOwn ?
					<app.components.react.CoolTextInput placeholder="#page.emojipacks.mybestname#" defaultValue={children.name} onChange={e=>{handleChange({name: e.target.value})}}/>
					:
					<span>{children.name ?? "#page.emojipacks.withoutname#"}</span>
			}
			{ isMyOwn && <app.components.ProcessButton onClick={handleEmojiUpload} className="btn app-button">#button.uploademoji#</app.components.ProcessButton> }
			{ isMyOwn && <app.components.ProcessButton onClick={()=>{handlePackDelete}} className="btn app-button">#button.delete#</app.components.ProcessButton> }
		</div>
		<div style={{display: "flex", fontSize: 20, gap: 10, flexWrap: "wrap", justifyContent: "flex-start"}}>
			{ children.emojis.map((x,i)=>(
				<div key={i} style={{ display: "flex", gap: 5, padding: 5, alignItems: "center" }}>
					<span style={{"transform": "scale(1.5)"}}><app.components.CustomEmoji id={x.id}/></span>
					<div style={{display: "flex", gap: 2, alignItems: "center", paddingInline: 1}}>
						<span>
							<span className="app-notMainText">:</span>
							{
								isMyOwn ?
									<app.components.react.CoolTextInput 
										style={{ lineHeight: "0.68em" }}
										placeholder="bestemojinameever"
										defaultValue={x.emojiId}
										onChange={e=>{handleEmojiChange(x.id, {name: e.target.value})}}
									/>
									:
									<span>{x.emojiId}</span>
							}
							<span className="app-notMainText">:</span>
						</span>
						{ isMyOwn && <>
							<button className="app-iconOnlyButton b" onClick={()=>handleEmojiDelete(x.id)}><app.components.react.FixedSVG className="alphaicon fill" children={app.___svgs.x_1}/></button>
						</>}
					</div>
				</div>
			)) }
			{ children.emojis.length <= 0 && <span>#page.emojipacks.no_emojis#</span> }
		</div>
	</div>;
};


export default function EmojiPacks() {
	const [ packs, updatePacks ] = useImmer([]);
	const [ loading, setLoading ] = useState(false);
	const [ thatsAll, setThatsAll ] = useState(false);
	
	const pageRef = useRef(1);
	//const [ page, setPage ] = useState(1);
	
	const parse = useCallback(function () {
		if (loading || thatsAll) return;
		setLoading(true);
		
		return new Promise(async(r)=>{
			const pcks = await app.f.get("emojipack", {myOwn: true, page: pageRef.current});
			if (pcks.status == "success") {
				pageRef.current++;
				//setPage(p=>p+1);
				updatePacks(d=>{ d.push(...pcks.content) });
				if (pcks.length <= app.globalPageSize) {
					setThatsAll(true);
				};
			};
			setLoading(false);
			r();
		});
	}, [/*page*/]);
	const handlePackCreate = useCallback(function () {
		return new Promise(async(r)=>{
			const r = await app.f.put("emojipack");
			if (r.status=="success") {
				updatePacks(d=>{ d.push(r.content) });
			};
			r();
		});
	});
	useEffect(function() { parse() }, []);
	
	return <div>
		<div style={{ display: "flex", padding: "5px 10px", justifyContent: "space-around", alignItems: "center" }}>
			<div>
				<h1>#page.emojipacks.index#</h1>
				<span>#page.emojipacks.desc#</span>
			</div>
			<app.components.ProcessButton onClick={handlePackCreate} className="btn app-button">#button.create#</app.components.ProcessButton>
		</div>
		{ packs.map( (x,i)=>(<Pack key={i} children={x} onPatch={ (a)=>updatePacks(d=>{d[i]=a}) } onDelete={ ()=>updatePacks(d=>{d.splice(i,1)}) } />) ) }
		{ thatsAll && packs.length<=0 && <span>#page.emojipacks.soempty#</span> }
		{ loading && <app.components.Loading /> }
	</div>;
};