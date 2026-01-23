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

const ReportStatusType = {
	"0": "Active",
	"1": "Accepted",
	"2": "Ignored"
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
		
		const [ answer, setAnswer ] = useState(":<");
		
		const action = selectedType && selectedAction && data?.avaliableActions[selectedType].find(x=>x.action===selectedAction)
		
		async function handleExecute() {
			const r = await app.f.post(`mod/${selectedType}/${idRef.current}/${selectedAction}`, formRef.current);
			if (r.status==="success") {
				setSelectedAction(null);formRef.current = {};
				d.current.value="";
				
				let c;
				if (typeof r.content == "object") {
					try {
						c = JSON.stringify(r.content);
					} catch {};
				};
				if (!c) c = String(r.content);
				setAnswer(c);
				
				return true;
			} else return false;
		};
		
		return <div hidden={hidden}>
			<div>
				<select onInput={e=>{ setSelectedType(e.target.value);setSelectedAction(null);d.current.value="";formRef.current = {}; }} name="types" size="8">
					<optgroup label="types">
						{Object.keys(data?.avaliableActions).map((x,i)=>(
							<option value={x} key={i}>{x}</option>
						))}
					</optgroup>
				</select>
			</div>
			<div>
				<select ref={d} onInput={e=>{setSelectedAction(e.target.value);formRef.current = {};}} name="actions" size="8">
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
				<app.components.react.TextInput onChange={e=>idRef.current=e.target.value} label="entityid"/>
				<fieldset>
					<legend>Result / Execution</legend>
					<app.components.ProcessButton disabled={!action} onClick={handleExecute} className="btn app-button">#button.execute# (costs {action?.weight ?? 0}weight)</app.components.ProcessButton>
					<p>Answer:<br /><blockquote>{answer}</blockquote></p>
				</fieldset>
			</div>
		</div>;
	}},
	{p: "reports", n: "#page.mod.info.reports#",
	c({ hidden, me, data }) {
		const scrollContainerRef = useRef(null);
		const emptyContainerRef = useRef(null);
		
		const [ sortType, setSortType ] = useState(1);
		const [ include, setInclude ] = useState(0);
		
		const [ loading, setLoading ] = useState(true);
		const [ isEnding, setIsEnding ] = useState(false);
		
		const [ selectedReport, updateSelectedReport ] = useImmer(null);
		const [ reports, updateReports ] = useImmer([]);
		
		const [ isProcessing, setIsProcessing ] = useState(false);
		
		useEffect(function () {
			let debounce = false;
			let page = 0;
			
			async function query() {
				if (debounce) return;
				debounce = true;
				setLoading(true);
				
				const r = await app.f.get("search", {
					parse: ["mod_reports"],
					sort: sortType,
					filters: { status: include !== "*" ? include : undefined },
					page
				});
				
				if (r.status==="success") {
					updateReports(draft=>{
						draft.push(...r.content);
					});
					if (r.content.length < app.globalPageSize) setIsEnding(true);
					page++;
				};
				
				setLoading(false);
				debounce = false;
			};
			
			const obs = new IntersectionObserver((e)=>{
				if (debounce) return;
				entries.forEach((entry) => {
					if (entry.isIntersecting) query();
				});
			}, {
				root: scrollContainerRef.current,
				threshold: 0.1
			});
			obs.observe(emptyContainerRef.current);
			
			query();
			return ()=>{
				setLoading(true);
				updateSelectedReport(null);
				updateReports([]);
				obs.disconnect();
			};
		}, [sortType, include]);
		
		async function handleResolve(a) {
			setIsProcessing(true);
			const r = await app.f.post(`mod/mod_reports/${selectedReport?.id}/resolve`, { append: a });
			if (r.status==="success") {
				updateReports(draft=>{
					const i = draft.findIndex(x=>x.id===selectedReport?.id);
					if (i!==-1) {
						draft.splice(i,1);
					};
				});
				updateSelectedReport(null);
			};
			setIsProcessing(false);
		};
		
		return <>
		<style>{`
		.rprts-123 {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;
		}
		@media (max-width: 700px) {
			.rprts-123 {
				display: flex;
				flex-direction: column;
				grid-template-columns: unset;
			}
		}
		`}</style>
		<div className="rprts-123" hidden={hidden}>
			<div>
				{/*
				<fieldset>
					<legend>Filters</legend>
					<span><select name="filter">
						<optgroup label="Active reports">
							<option value="0">0</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="*">*</option>
						</optgroup>
					</select> <select name="sort">
						<optgroup label="Sort by">
							<option value="0">Default</option>
							<option value="1">First updated</option>
							<option value="2">Last updated</option>
							<option value="3">Weight</option>
						</optgroup>
					</select></span>
					<button className="btn app-button">#button.apply#</button>
				</fieldset>
				*/}
				<fieldset>
					<legend>Mass-Reports</legend>
					<div style={{display: "flex", gap: 2, overflowY: "scroll", flexDirection: "column"}} ref={scrollContainerRef}>
						{
							reports.map(x=>(
								<button disabled={selectedReport?.id===x.id || isProcessing} onClick={()=>updateSelectedReport(x)} className="app-buttonFromModals" key={x.id}>Report {x.id}</button>
							))
						}
						<div ref={emptyContainerRef} style={{paddingBottom: 40}}>
							{ loading && <app.components.Loading /> }
							{ !loading && isEnding && <span>End</span> }
						</div>
					</div>
				</fieldset>
			</div>
			<div>
				<fieldset>
					<legend>More information</legend>
					<ul>
						<li>ID: <b>{selectedReport?.id ?? "IDK"}</b></li>
						<li>Last updated: <b>{selectedReport?.updated_at ? app.functions.ago(selectedReport.updated_at) : "IDK"}</b></li>
						<li>Resolved at: <b>{selectedReport?.resolved_at ? app.functions.ago(selectedReport.resolved_at) : "IDK"}</b></li>
						<li>Status: <b>{ReportStatusType[selectedReport?.status] ?? "IDK"}</b></li>
						<li>Weight: <b>{String(selectedReport?.w)}</b></li>
						<li>Report type: <b>{app.functions.report.reasons[selectedReport?.reportType] ?? "IDK"}</b></li>
						<li>EntityType: <b>{selectedReport?.contentType ?? "IDK"}</b></li>
						<li>EntityId: <b>{selectedReport?.contentId ?? "IDK"}</b></li>
					</ul>
				</fieldset>
				<span><button disabled={!selectedReport || isProcessing} onClick={()=>handleResolve(true)} className="btn btn-primary">Accept</button> <button disabled={!selectedReport || isProcessing} onClick={()=>handleResolve(false)} className="btn btn-danger">Deny</button></span>
			</div>
		</div>
		</>;
	}},
];