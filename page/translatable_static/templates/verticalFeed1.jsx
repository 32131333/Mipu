import { Link, useParams, useLocation } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";
import { useImmer } from "use-immer";

import MipuAdvPost from "./../miposts.jsx";
import Timer from "./../../static/timer.js";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

const useFeedData = create(immer(
	(set, get)=>({
		feedData: [],
		feedState: { activeIndex: 0 },
		forYouModeInfo: { active: false, page: 1, canLoadMore: true, loading: false },
		loading: false,
		forYouActive: false,
		error: null,
	
		setLoading: a=>set({ loading: a }),
		setForYouActive: a=>set({ forYouActive: a }),
		updateFeedData: a=>set(s=>{ typeof a == "function" ? a(s.feedData) : (s.feedData = a) }),
		updateFeedState: a=>set(s=>{ typeof a == "function" ? a(s.feedState) : (s.feedState = a) }),
		getForYouInfo: ()=>get().forYouModeInfo,
		updateForYouInfo: a=>set(s=>{ typeof a == "function" ? a(s.forYouModeInfo) : (s.forYouModeInfo = a) }),
		setError: a=>set({ error: a }),
		
		reset: () => set(state=>{
			state.feedData = [];
			state.feedState = { activeIndex: 0 };
			state.forYouModeInfo = { active: false, page: 1, canLoadMore: true, loading: false };
			state.loading = false;
			state.forYouActive = false;
			state.error = null;
		})
	})
));
// app._verticalFeedData = useFeedData; // В целом, такое возможно провернуть, но пока что не имеет смысла



export const path = "/feed";




function LoadingMention({ index }) {
	return <div className="dontscrollsnap">
		<div className="snapend" style={{
			width: "100%",
			height: index !== 0 ? 160 : "100%",
			display: "flex",
			flexDirection: "row",
			alignItems: index !== 0 ? "end" : "center"
		}}>
			<p style={{ textAlign: "center", width: "100%"}}>#page.feed.loading#</p>
		</div>
	</div>;
};
function EndMention({ index, error, onRetry, onReturn, returnToFYP }) {
	// Если произошла какая-то ошибка, то компонент его отразит
	return <div style={{ width: "100%", height: "100%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
		<div>
			{ !error ? <>
					<h2>#page.feed.end#<br />#page.feed.end1#</h2>
				</>
				:
				<>
					<h2>#page.feed.error#<br /><app.components.ErrorAlert>{app.translateError(error)}</app.components.ErrorAlert></h2>
				</>
			}
		</div>
		<div
			style={{display: "flex", gap: 5, width: "100%", justifyContent: "center"}}
		>
			{ onRetry && <button className="btn app-button" onClick={onRetry}>#button.retry#</button> }
			{ onReturn && <button className="btn app-button" onClick={onReturn}>#button.return#</button> }
			{ returnToFYP && <Link to="/feed" state={{}} className="btn app-button">#page.feed.returntofyp#</Link> }
		</div>
	</div>;
};



export default function VerticalFeed() {
	const navigation = useLocation(); // Найдется применение, возможно. Например, для рендера оффлайн информации из state
	const pgRef = useRef(null);
	const activeIndexRef = useRef(0);
	
	const [ containerHeight, setContainerHeight ] = useState(window.innerHeight);
	const [ isContainerHeightCalculated, setIsContainerHeightCalculated ] = useState(false);
	
	
	/*let feedData, updateFeedData, error, setError, feedState, updateFeedState, getForYouInfo, updateForYouInfo,
		loading, setLoading, forYouActive, setForYouActive;
		
	if (!navigation.state || !navigation.state.data) {
		[ feedData, updateFeedData ] = useFeedData(useShallow(s=>[ s.feedData, s.updateFeedData ]));//useImmer([]);
		[ feedState, updateFeedState ] = useFeedData(useShallow(s=>[ s.feedState, s.updateFeedState ]));//useImmer({activeIndex: 0});
	
		[ error, setError ] = useFeedData(useShallow(s=>[ s.error, s.setError ]));//useImmer([]);
	
		[ getForYouInfo, updateForYouInfo ] = useFeedData(useShallow(s => [ s.getForYouInfo, s.updateForYouInfo ]));
	
		// Состояние/данные
		[ loading, setLoading ] = useFeedData(useShallow(s=>[ s.loading, s.setLoading ]));//useState(false);
		[ forYouActive, setForYouActive ] = useFeedData(useShallow(s=>[ s.forYouActive, s.setForYouActive ]));//useState(false);
	} else {
		[ feedData, updateFeedData ] = useImmer(typeof navigation.state.data == "string" ? JSON.stringify(navigation.state.data) : navigation.state.data);
		[ feedState, updateFeedState ] = useImmer({ activeIndex: 0 });
		
		[ error, setError ] = useState(null);
		
		[ getForYouInfo, updateForYouInfo ] = [ ()=>({ active: false }), ()=>{} ];
		
		[ forYouActive, setForYouActive ] = [ false, ()=>false ];
		[ loading, setLoading ] = useState(false);
	};
	*/
	const stateData = navigation.state?.data;
	const stateIndex = navigation.state?.activeIndex;
	const isStaticMode = Boolean(stateData);

	// хуки ВСЕГДА вызываются — React счастлив
	const [storeFeedData, updateStoreFeedData] = useFeedData(useShallow(s=>[ s.feedData, s.updateFeedData ]));
	const [localFeedData, updateLocalFeedData] = [typeof stateData == "string" ? JSON.stringify(stateData) : stateData, ()=>{ throw new ItsBad("Writing offline data :<") }];//useImmer(typeof stateData == "string" ? JSON.stringify(stateData) : stateData);

	const [storeFeedState, updateStoreFeedState] = useFeedData(useShallow(s => [ s.feedState, s.updateFeedState ]));
	const [localFeedState, updateLocalFeedState] = useImmer({ activeIndex: stateIndex ?? 0 });

	const [storeError, storeSetError] = useFeedData(useShallow(s => [ s.error, s.setError ]));
	const [localError, localSetError] = useState(null);

	const [storeLoading, storeSetLoading] = useFeedData(useShallow(s => [ s.loading, s.setLoading ]));
	const [localLoading, localSetLoading] = useState(false);

	const [storeFYP, storeSetFYP] = useFeedData(useShallow(s => [ s.forYouActive, s.setForYouActive ]));
	const [localFYP, localSetFYP] = useState(false);
	
	const [ getForYouInfo, updateForYouInfo ] = useFeedData(useShallow(s => [ s.getForYouInfo, s.updateForYouInfo ]));

	// Выбираем «источник правды» ПОСЛЕ хуков
	const feedData       = isStaticMode ? localFeedData : storeFeedData;
	const updateFeedData = isStaticMode ? updateLocalFeedData : updateStoreFeedData;

	const feedState       = isStaticMode ? localFeedState : storeFeedState;
	const updateFeedState = isStaticMode ? updateLocalFeedState : updateStoreFeedState;

	const error    = isStaticMode ? localError : storeError;
	const setError = isStaticMode ? localSetError : storeSetError;

	const loading    = isStaticMode ? localLoading : storeLoading;
	const setLoading = isStaticMode ? localSetLoading : storeSetLoading;

	const forYouActive    = isStaticMode ? localFYP : storeFYP;
	const setForYouActive = isStaticMode ? localSetFYP : storeSetFYP;

	
	
	
	/*const forYouInfoRef = useRef({
		active: false,
		page: 1,
		canLoadMore: true,
		loading: false
	});*/
	
	//const containerSize = useRef(0);
	
	/*useEffect(function () {
		if (pgRef.current.scrollTop === 0 && feedState.activeIndex !== 0) {
			pgRef.current.scrollTo(0, feedState.activeIndex*containerHeight); // Восстановление состояния
		};
	}, [ feedState, containerHeight ]);*/
	// Восстановление состояния ленты
	useEffect(() => {
		if (!isContainerHeightCalculated) return;
		let request;
		if (pgRef.current) {
			request = requestAnimationFrame(() => {
				const offset = feedState.activeIndex * pgRef.current.clientHeight;//containerHeight;
				pgRef.current.scrollTo(0, offset);
			});
		};
		return ()=>cancelAnimationFrame(request);
	}, [isStaticMode, isContainerHeightCalculated]);
	
	
	function handleRetryAfterError() {
		setError(false);
		setForYouActive(true);
	};
	/*useEffect(function () {
		if (navigation.state) {
			console.log("Rendering data :D");
			try {
				updateFeedData(JSON.parse(navigation.state));
			} catch(e) {
				console.error(e);
			};
		} else {
			//forYouInfoRef.current.active = true;
			setForYouActive(true);
		};
	}, [ navigation ]);	*/
	// Подгрузка состояния из history (если есть)
	useEffect(() => {
		/*if (navigation.state && typeof navigation.state === "string") {
			try {
				const restored = JSON.parse(navigation.state);
				if (Array.isArray(restored) && restored.length > 0) {
					updateFeedData(prev => {
						if (prev.length === 0) prev.push(...restored);
					});
				}
			} catch (e) {
				console.warn("Failed to restore feed:", e);
			}
		} else {
			setForYouActive(true);
		};*/
		setForYouActive(!isStaticMode);
	}, [isStaticMode]);
	
	useEffect(function () {
		/*forYouInfoRef.current*///getForYouInfo().loading = loading;
		if (!isStaticMode) updateForYouInfo(a=>{ a.loading = loading });
	}, [loading, isStaticMode]);
	
	useEffect(function () {
		if (!forYouActive) return;
		const { activeIndex } = feedState;
		
		async function loadMore() {
			const { page, canLoadMore, loading } = /*forYouInfoRef.current*/getForYouInfo();
			
			if (loading) return;
			setLoading(true);
			
			
			const r = await app.f.get("vertical_feed", {page}); // На момент написания этой строки, feed не волнует, какую вы страницу просматриваете, но, вероятно, я в скором это исправлю
			if (r.status == "success") {
				updateFeedData(d=>{
					d.push(...r.content);
				});
				if (r.content.length <= 0) updateForYouInfo(a=>{ a.canLoadMore = false });/*forYouInfoRef.current*///getForYouInfo().canLoadMore = false; 
				updateForYouInfo(a=>{ a.page++ });/*forYouInfoRef.current*///getForYouInfo().page += 1;
			} else {
				setError(typeof r == "string" ? r : r.error_code);
				setForYouActive(false);
			};
			
			setLoading(false);
		};
		
		if ((activeIndex >= (feedData.length-3)) && !/*forYouInfoRef.current*/getForYouInfo().loading) loadMore();
	}, [ feedState, feedData, forYouActive, isStaticMode ]);
	
	
	
	// Просмотры
	const viewedContentRef = useRef(new Set());
	const viewedContentTimerRef = useRef(new Timer(5000));
	const postViewRef = useRef(new Set());
	useEffect(function () {
		viewedContentTimerRef.current.defaultFunc = async function () {
			let indexes = Array.from(postViewRef.current);
			postViewRef.current.clear();
			
			indexes = indexes.map(x => feedData[x]?.id).filter(x=>x!==undefined);
			
			if (indexes.length > 0) {
				console.log("Writing ", indexes, " :3");
				app.f.post("views/mipuadv_posts", {ids: indexes});
			};
		};
		// viewedContentTimerRef.current.start();
		// return () => viewedContentTimerRef.current.cancel(); Фиксация просмотров должна в любом случае дойти
	}, [ feedData ]);
	useEffect(function () {
		const activeIndex = feedState.activeIndex;
		if (!viewedContentRef.current.has(activeIndex)) {
			postViewRef.current.add(activeIndex);
			viewedContentRef.current.add(activeIndex);
			
			if (postViewRef.current.size <= 5) {
				viewedContentTimerRef.current.start();
			};
		};
	}, [ feedState ]);
	
	
	
	
	
	
	// Поведение ленты
	useEffect(function () {
		function onResize() {
			if (pgRef.current) setContainerHeight(pgRef.current.clientHeight);
		};
		//window.addEventListener("resize", onResize);
		
		//return ()=>window.removeEventListener("resize", onResize);*/
		
		const observer = new ResizeObserver(onResize);
		observer.observe(pgRef.current);
		onResize();
		
		setIsContainerHeightCalculated(true);
		
		return () => observer.disconnect();
	}, []);
	
	/*useEffect(function () {
		const starts = feedData.map((x,i)=>i*containerHeight);
		const container = pgRef.current;
		
		function onScroll() {
			const scrollTop = container.scrollTop;
			
			const back = Math.max(...starts.filter(x => x < scrollTop));
			const next = Math.min(...starts.filter(x => x >=  scrollTop));
			
			const dBack = Math.abs(scrollTop - back);
			const dNext = Math.abs(scrollTop - next);
			
			const closest = Math.min(dBack, dNext);
			const trueClosest = closest == dBack ? back : next;
			const trueClosestIndex = starts.indexOf(trueClosest);
						
			if (trueClosestIndex === -1) {
			} else {
				if (activeIndexRef.current != trueClosestIndex) updateFeedState(d=>{d.activeIndex=trueClosestIndex});
			};
		};
		container.addEventListener("scroll", onScroll);
		return () => container.removeEventListener("scroll", onScroll);
	}, [feedData, containerHeight]);*/
	// Дебаунс скролла
	useEffect(() => {
		// const starts = feedData.map((_, i) => i * containerHeight); <- ChatGPT зачем-то вставил эту переменную
		if (!isContainerHeightCalculated) return;
		
		const container = pgRef.current;
		let scrollTimeout;

		function onScroll(e) {
			if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
			scrollTimeout = requestAnimationFrame(() => {
				const scrollTop = container.scrollTop;
				const closestIndex = Math.round(scrollTop / containerHeight);
				if (activeIndexRef.current !== closestIndex) {
					updateFeedState(d => { d.activeIndex = closestIndex; });
					activeIndexRef.current = closestIndex;
				}
			});
		};
		
		container.addEventListener("scroll", onScroll);
		return () => {
			container.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(scrollTimeout);
		};
	}, [feedData, containerHeight, isContainerHeightCalculated]);
	
	
	const renderIndexes = [feedState.activeIndex - 2, feedState.activeIndex - 1, feedState.activeIndex, feedState.activeIndex + 1, feedState.activeIndex + 2];
	activeIndexRef.current = feedState.activeIndex;


	app.reactstates.useListen("mipuadv_posts", feedData[feedState.activeIndex]?.id ?? 0);
	app.reactstates.makeTopBarTranparency();

	return <div ref={pgRef} className="app-pg-verticalFeed1 app-no-scroll">
		<app.components.forceDarkTheme />
		<div
			style={{
				width: "100%",
				position: "relative",
				height: containerHeight + containerHeight * feedData.length
			}}
		>
			{
				/*feedData.map((x,i)=>{
					if (renderIndexes.includes(i)) {
						return <div
							key={i}
							style={{
								left: 0,
								position: "absolute",
								top: i*containerHeight,
								width: "100%",
								height: containerHeight
							}}
						>
							<MipuAdvPost
								children={x}
								active={feedState.activeIndex === i}
								index={i}
							/>
						</div>
					} else return false;
				})*/
				renderIndexes.map(i=>{
					let place;
					if (feedData[i]) {
						place = <MipuAdvPost
									children={feedData[i]}
									active={feedState.activeIndex === i}
									index={i}
								/>
					};
					if (!feedData[i] && (i == 0 || feedData[i-1])) {
						if (loading) {
							place = <LoadingMention index={i}/>
						} else {
							place = <EndMention index={i} returnToFYP={!forYouActive && !error} error={error} onRetry={error && handleRetryAfterError} onReturn={!error && !forYouActive && (()=>{window.history.back()})}/>
						};
					};
					
					if (place) {
						return <div
									key={i}
									style={{
										left: 0,
										position: "absolute",
										top: i*containerHeight,
										width: "100%",
										height: containerHeight
									}}
								>
								{place}
								</div>
					};
				})
			}
		</div>
	</div>;
};




// Made by 🌟 mipu_kit 🌟
// Fixes by ChatGPT

// The biggest scroll fix by Google(ai mode). They just suggested me use "overflow-anchor: none;"
// but ChatGPT dont know about this :<