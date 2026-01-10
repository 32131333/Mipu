import { Link } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";
import { useImmer } from "use-immer";



function SubsInNav({}) {
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [itsEnding, setIsEnding] = useState(false);
	const [structure, updateStructure] = useImmer([]);
	
	const { me } = app.reactstates.useInformationAboutMe();
	
	const Load = useCallback(function () {
		if (me == "guest") return;
		
		async function search() {
			setLoading(true);
			//const result = await app.f.get("sub", {page});
			const result = await app.f.get("search", {parse: "subscribe", page});
			if (Array.isArray(result.content)) {
				updateStructure(val=>{
					for (const a of result.content) {
						val.push(a);
					};
				});
				return result;
			} else {
				return;
			};
		};
		if (!loading) {
			search().then(result=>{
				if (result) {
					setPage(x=>x+1);
					//setIsEnding(page*30 >= result.length);
					//setIsEnding(result.length <= 0);
					setIsEnding(result.length < app.globalPageSize);
				} else if (result===false) return;
				setLoading(false);
			});
		};
	}, [page, loading, me]);
	useEffect(()=>{Load()}, [me]);
	
	if (me=="guest" || (structure.length <= 0 && itsEnding)) return (
		<div className="subsinnav">
			<span className="categoryname">#page.main.nosubs#</span>
		</div>
	);
	
	return <div className="subsinnav">
		<span className="categoryname">#page.main.ursubs#</span>
		{structure.map((x, index)=>{
			return <Link className="navbutton" key={index} to={`/user/${x.beloved.tag ? "@"+x.beloved.tag : x.beloved.id}`}><app.components.Avatar user={x.beloved} scale={2.3} /> <app.components.Username user={x.beloved} linear/></Link>;
		})}
		{!itsEnding && !loading && <button className="navbutton" onClick={Load}>#page.main.ursubsloadmore#</button>}
		{loading && <app.components.Loading />}
	</div>
};

function HelloPage({props}) {
	const [ closed, setClosed ] = useState(false);
	const [ selectedState, setSelectedState ] = useState(null);
	
	const { me, failed } = app.reactstates.useInformationAboutMe();
	const isMobile = app.reactstates.useIsMobileOrientation();
	//if (failed) return <app.components.WarningAlert buttonText="#button.reloadpage#" onClick={()=>document.location.reload()}>#page.main.unabletoauthorize#</app.components.WarningAlert>;
	if (typeof me != "object" || closed) return null;
	
	const randomPhrases = tryToReadJSON("#page.main.hello_randomphrases#");
	let end = ItsRandom.choice(randomPhrases);
	let r = [];
	let a;
	while (a=end.match("&0&")) {
		let start = end.slice(0, a.index);
		let inCenter = <b><app.components.Username user={me}/></b>;
		r.push(start);r.push(inCenter);
		end = end.slice(a.index+a[0].length);
	};
	r.push(end);
	
	if (isMobile) return <h2>{r}</h2>;
	
	
	
	const States = {
		publishNewPost() {
			const [ result, setResult ] = useState(null);
			if (!result) return <app.structures.PostEdit onCancel={()=>setSelectedState(null)} onApply={setResult}/>
			else return <app.structures.Post canOpenFully onDelete={()=>setSelectedState(null)} post={result}/>;
		}
	};
	if (States[selectedState]) return React.createElement(States[selectedState]);
	
	
	
	
	
	return <div style={{padding: 20, alignItems: "center", display: "flex", flexDirection: "column", paddingBlock: 150, gap: 15}}>
		<div className="contentify">
			<h1>{r}</h1>
			<h4>#page.main.whatuwanttoday#</h4>
		</div>
		<div style={{display: "flex", gap: 12, alignItems: "center"}}>
			<Link className="btn app-button" to={`/@${me.tag}`}>#page.main.jointomyownprofile#</Link>
			<button className="btn app-button" onClick={()=>setSelectedState("publishNewPost")}>#page.main.publishpost#</button>
			<Link className="btn app-button" to="/create">#page.main.create#</Link>
			<button className="app-iconOnlyButton b" onClick={()=>setClosed(true)}><app.components.react.FixedSVG className="alphaicon fill">{app.___svgs.x_1}</app.components.react.FixedSVG></button>
		</div>
	</div>;
};


function NewsFeed({ pageRef }) {
	const [ result, updateResult ] = useImmer([]);
	const [ isLoading, setIsLoading ] = useState(false);
	const [ error, setError ] = useState(false);
	
	const debounce = useRef(false);
	const page = useRef(1);
	
	const fetchFeed = useCallback(function () {
		if (debounce.current) return;
		debounce.current = true;
		
		async function get() {
			setIsLoading(true);
			const response = await app.f.get("feed", {page: page.current});
			if (typeof response == "object" && response.status == "success") {
				updateResult(d=>{
					d.splice(d.length, 0, ...response.content);
				});
				page.current++;
			} else {
				setError(response);
			};
		};
		get().then(()=>{
			setIsLoading(false);
			debounce.current = false;
		});
	}, []);
	useEffect(()=>{
		fetchFeed();
	}, [fetchFeed]);
	
	
	useEffect(()=>{
		/*const observer = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && !debounce.current) {
				fetchFeed();
			};
		}, { threshold: 0.8 });

		const currentLoader = pageRef.current;//document.querySelector(".container333 > .page-root > .root");//rootRef.current;
		if (currentLoader) {
			observer.observe(currentLoader);
		}
		return () => {
			if (currentLoader) {
				observer.unobserve(currentLoader);
			};
		};*/
		function onScroll(e) {
			if (pageRef.current.scrollHeight - pageRef.current.scrollTop < 1200) fetchFeed();
		};
		pageRef.current.addEventListener("scroll", onScroll);
		return ()=>pageRef.current?.removeEventListener?.("scroll", onScroll);
	}, [fetchFeed]);
	
	if (error) return (
		<div style={{justifyContent: "center", padding: 20, height: "100%", alignItems: "center", display: "flex", flexDirection: "column", paddingBlock: 150, gap: 15}}>
			<div className="contentify">
				<h3>#page.main.failed.title#</h3>
				<h4><app.components.ErrorAlert>{app.translateError(error)}</app.components.ErrorAlert></h4>
			</div>
			<span>#page.main.failed.variations#</span>
			<div style={{display: "flex", gap: 12, alignItems: "center"}}>
				<button onClick={()=>document.location.reload()} className="btn app-button">#page.main.failed.reload#</button>
				<Link to="/login" className="btn app-button">#page.main.failed.relogin#</Link>
			</div>
		</div>
	);
	
	
	return <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
		{ result.map(x=><NewsFeed.renderObject key={x.object+x.id} data={x}/>) }
	</div>;
};
NewsFeed.renderObject = function ({ data }) {
	switch(data.object) {
		case "posts":
			return <app.structures.Post post={data} canOpenFully/>;
		default:
			return (
				<div>
					#page.search.unknownobject#: {data.object}
					<pre>{JSON.stringify(data, null, 2)}</pre>
				</div>
			);
	}
};

export const path = "/";
export default function MainPage() {
	const me = app.reactstates.useInformationAboutMe();
	const isMobile = app.reactstates.useIsMobileOrientation();
	const [ structure, updateStructure ] = useImmer({recommendations: []});
	
	const pageRef = useRef(null);
	return <>
		<app.components.WebpageTitle>{`#page.main.title#`}</app.components.WebpageTitle>
		<div ref={pageRef} className="app-pg-lsted mainPage app-pg-scrollable">
			<style>
			{`
			
			`}
			</style>
			<div className="btns" hidden={isMobile}>
				<Link className="navbutton" to="/feed"><app.components.react.FixedSVG className="alphaicon a" children={app.___svgs.sparks}/> #MipuadvpostsName#</Link>
				{typeof me == "object" && <SubsInNav />}
			</div>
			<div className="root">
				<HelloPage />
				<NewsFeed pageRef={pageRef}/>
			</div>
		</div>
	</>;
};