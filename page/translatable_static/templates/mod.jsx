import { useNavigate, useParams, NavLink } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";
import { useImmer } from "use-immer";

export const path = "/mod/:page?";
export default function () {
	const { me } = app.reactstates.useInformationAboutMe();
	if (!me.id) return <></>
	else return <ModPage me={me}/>;
};
function ModPage({me}) {
	const { page } = useParams();
	const navigate = useNavigate();
	const isMobile = app.reactstates.useIsMobileOrientation();
	
	const [ modData, updateModData ] = useImmer({});
	const [ isLoading, setIsLoading ] = useState(true);
	useEffect(function () {
		async function a() {
			const r = await app.f.get("mod");
			if (r.status === "success") {
				updateModData(r.content);
				setIsLoading(false);
			} else return navigate("/");
		};
		a();
	}, []);
	if (isLoading) return <app.components.LoadingPage />;
	
	//console.log(page);
	return <div className="app-pg-lsted">
		<div className="btns" hidden={page && isMobile}>
		{
			pages.map((x,i)=>(
				<NavLink key={i} className="navbutton" to={`/mod/${x.p}`}>{x.n}</NavLink>
			))
		}
		</div>
		<div className="root" hidden={!page && isMobile}> 
		{
			pages.map((x,i)=>(
				<x.c key={i} data={modData} me={me} hidden={page!==x.p}/>
			))
		}
		</div> 
	</div>;
};

const pages = [
	{p: "info", n: "#page.mod.info.title#",
	c({ hidden, me, data }) {
		return <div hidden={hidden}>
			<h3>#page.mod.info.welcome#</h3>
			<p>#page.mod.info.weight#:<br /><b>{data.info?.weightleft}</b> / {data.info?.weightmax}</p>
			<p>#page.mod.info.level#: <b>{data.info?.level}</b></p>
		</div>;
	}},
	{p: "actions", n: "#page.mod.actions.title#",
	c({ hidden, me, data }) {
		const formRef = useRef({});
		const idRef = useRef();
		
		const d = useRef(null);
		
		const [ selectedType, setSelectedType ] = useState(null);
		const [ selectedAction, setSelectedAction ] = useState(null);
		
		const action = selectedType && selectedAction && data?.avaliableActions[selectedType].find(x=>x.action===selectedAction)
		
		async function handleExecute() {
			const r = await app.f.post(`mod/${selectedType}/${idRef.current}/${selectedAction}`, formRef.current);
			if (r.status==="success") {
				setSelectedAction(null);formRef.current = {};
				return true;
			} else return false;
		};
		
		return <div hidden={hidden}>
			<div>
				<select onInput={e=>{ setSelectedType(e.target.value);setSelectedAction(null);d.current.value="";formRef.current = {}; }} name="types" multiple size="8">
					<optgroup label="types">
						{Object.keys(data?.avaliableActions).map((x,i)=>(
							<option value={x} key={i}>{x}</option>
						))}
					</optgroup>
				</select>
			</div>
			<div>
				<select ref={d} onInput={e=>{setSelectedAction(e.target.value);formRef.current = {};}} name="actions" multiple size="8">
					<optgroup label="actions">
						{selectedType && data?.avaliableActions[selectedType]?.map((x,i)=>(
							<option value={x.action} key={i}>{x.action}</option>
						))}
					</optgroup>
				</select>
			</div>
			<div>
				{action?.form && 
				<div>
					#page.mod.actions.form#
					{
						Object.keys(action.form).map((x,i)=>{
							const type = action.form[x];
							switch(type) {
								case "bool":
									return <app.components.react.CheckBox label={x} onInput={(_,c)=>formRef.current[x]=c}/>
								default:
									return <app.components.react.TextInput onChange={e=>formRef.current[x]=e.target.value} label={x}/>;
							}
						})
					}
				</div>
				}
				<app.components.react.TextInput onChange={e=>idRef.current[x]=e.target.value} label="entityid"/>
				<app.components.ProcessButton disabled={!action} onClick={handleExecute} className="btn app-button">#button.execute#</app.components.ProcessButton>
			</div>
		</div>;
	}},
	{p: "reports", n: "#page.mod.info.reports#",
	c({ hidden, me, data }) {
		return <>Not working but soon</>;
	}},
];