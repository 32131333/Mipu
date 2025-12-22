// Здесь описываются уже более верные компоненты для проигрывания mipuadv_posts постов
// Здесь совмещается идеология старого и нового TikTok, совмещается идеология Twitter и даже YouTube(YT Shorts)

/* --------------------------------------- */

import React from "react";
import { useImmer } from "use-immer";

const { useEffect, useCallback, useState, useRef, createContext, useContext, useMemo } = React;
// И многие динамические переменные с app.components

/* --------------------------------------- */

const InfoContext = createContext({ active: 0, isFocused: false });
const MediaControlContext = createContext({});

const visibilityDesc = app.structures.MipuAdvPostPreview.visibilityDesc;

function MediaCarouselContent({children, index, contentId}) {
	const Info = useContext(InfoContext);
	const ControllerContext = useContext(MediaControlContext);
	const ObjectsControllerCallbacks = ControllerContext?.callbacks;
	
	const isFocused = (Info.active == index) && Info.isFocused;
	
	const timeLapseRef = useRef(null);
	
	const [ paused, setPaused ] = useState(false);
	//const [ showTimeLapse, setShowTimeLapse ] = useState(false);
	const checkFunc = useCallback((isPaused/*, showTimeLapse*/)=>{
		/*app.toasts.show({content: "Called :D", duration: 1000});*/
		//app.toasts.show({content: "The checked isPaused is now "+String(isPaused)+" :D", duration: 1000})
		
		if (isPaused !== undefined) setPaused(prev=>{
			if (isPaused!==prev) {
				return isPaused;
			};
			return prev;
		});
		/*if (showTimeLapse !== undefined) setShowTimeLapse(prev=>{
			if (showTimeLapse!==prev) {
				return showTimeLapse;
			};
			return prev;
		});*/
	}, []);
	//const pausedRef = useRef(paused);
	//ControllerContext && ObjectsControllerCallbacks && !ControllerContext?.check && ControllerContext?.setCheck?.(useCallback);
	//useEffect(()=>pausedRef.current = paused, [paused]);
	
	//app.toasts.show({content: "isPaused: "+String(paused), duration: 1000})
	
	const id = children.id;
	let url = children.url;
	
	if (url) {
		url = app.apis.mediastorage + "/posts/" + String(contentId) + "/" + String(url);
	};

	console.log(ObjectsControllerCallbacks);
	if (MediaCarouselContent.Objects[id]) {
		return <div onClick={()=>{ObjectsControllerCallbacks?.pauseOrPlay?.()}}>
			{ paused && <div className="pauselayout"><app.components.react.FixedSVG className="alphaicon fill" children={app.___svgs.play}/></div> }
			<app.components.RangeInputOne ref={timeLapseRef} defaultValue={0} hidden className="timelapse" />
			{
				React.createElement(
					MediaCarouselContent.Objects[id],
					{ 
						url, Info, index, isFocused,
						check: checkFunc, timeLapseRef
					}
				)
			}
		</div>;
	} else {
		return <span>Unknown content type 😭</span>;
	};
};
MediaCarouselContent.Objects = {
	image({ url, Info, index }) {
		return <img draggable="false" src={url}/>;
	},
	video({ url, info, index, isFocused, check, timeLapseRef }) {
		//check?.(undefined, true); // Включчаем таймапс
		
		const videoRef = useRef();
		const ControllerContext = useContext(MediaControlContext);
		//console.log(ControllerContext);
		
		function isPaused() {
			return videoRef.current.paused;
		};
		function pause() {
			videoRef.current.pause();
		};
		function play() {
			videoRef.current.play();
		};
		function pauseOrPlay() {
			let r = isPaused();
			isPaused() ? play() : pause();
			//check(!r);//ControllerContext?.check?.(!r);
		};
		
		function fullscreenMode() {
			if (!isEnabled.current) return false;
			videoRef.current.requestFullscreen();
		};

		const isEnabled = useRef(false);
		useEffect(function () {
			//const check = ControllerContext?.get?.("check");
			if (isFocused) {
				//console.log(ControllerContext?.check); // <- Здесь undefined :<
				//console.log(check);
				if (!isEnabled.current) {
					try {
						isEnabled.current = true;
						videoRef.current.currentTime = 0;
						play();
					} catch {
						// В воспроизведении отказано
					} finally {
						check?.(videoRef.current.paused);
					};
				};
			} else {
				if (isEnabled.current) {
					isEnabled.current = false;
					pause();
					//ControllerContext?.check?.(true);
				};
			};
		}, [isFocused, check]);
		
		useEffect(function () {
			//timeLapseRef.current?.hidden = true;
			if (!isFocused && !check) return;
			
			let isVideoEarlyPlaying = false;
			function onPlay() {
				check(videoRef.current.paused);
				if (timeLapseRef.current) {
					timeLapseRef.current.hidden = !videoRef.current.paused && !isVideoEarlyPlaying ? videoRef.current.duration <= 10 : false;
				};
			};
			function onPlaying() {
				if (timeLapseRef.current) {
					timeLapseRef.current.max = String(Math.round(videoRef.current.duration));
					//timeLapseRef.current.value = String(Math.round(videoRef.current.currentTime));
				};
			};
			function onTimeUpdate() {
				if (timeLapseRef.current && !videoRef.current.paused) {
					//console.log(timeLapseRef.current);
					timeLapseRef.current.setValue(String(Math.round(videoRef.current.currentTime)));
				};
			};
			
			function onTimeLapsePointerDown() {
				if (!videoRef.current.paused) {
					isVideoEarlyPlaying = true;
					videoRef.current.pause();
				};
			};
			function onTimeLapsePointerUp() {
				if (isVideoEarlyPlaying) {
					isVideoEarlyPlaying = false;
					videoRef.current.play();
				};
			};
			function onTimeLapseInput() {
				videoRef.current.currentTime = Number(timeLapseRef.current.value);
			};
			timeLapseRef.current?.addEventListener("pointerup", onTimeLapsePointerUp);
			timeLapseRef.current?.addEventListener("pointerdown", onTimeLapsePointerDown);
			timeLapseRef.current?.addEventListener("input", onTimeLapseInput);
			
			videoRef.current.addEventListener("play", onPlay);
			videoRef.current.addEventListener("pause", onPlay);
			videoRef.current.addEventListener("playing", onPlaying);
			videoRef.current.addEventListener("timeupdate", onTimeUpdate);
			return ()=>{ 
				if (videoRef.current) {
					videoRef.current.removeEventListener("play", onPlay);
					videoRef.current.removeEventListener("pause", onPlay);
					videoRef.current.removeEventListener("playing", onPlaying);
					videoRef.current.removeEventListener("timeupdate", onTimeUpdate);
				};
				if (timeLapseRef.current) {
					timeLapseRef.current.removeEventListener("pointerup", onTimeLapsePointerUp);
					timeLapseRef.current.removeEventListener("pointerdown", onTimeLapsePointerDown);
					timeLapseRef.current.removeEventListener("input", onTimeLapseInput);
				};
			};
		}, [isFocused, check]);
		
		useEffect(function () {
			if (!isFocused) return;
			
			/*let h,w = videoRef.current.clientHeight, videoRef.current.clientWidth;
			const resize = new ResizeObserver(()=>{
				
			});*/
			//let [ h, w ] = [document.body.clientHeight, document.body.clientWidth];
			/*let a = false;
			function onResize() {
				let [ nh, nw ] = [document.body.clientHeight, document.body.clientWidth];
				
				
				if (nh-nw <= 0 && !a) {
					a = true;
					fullscreenMode();
				} else if (nh-nw > 0 && document.fullscreenElement == videoRef.current) {
					a = false;
					document.exitFullscreen();
				};
			
				//[ h, w ] = [ nh, nw ];
			};*/
			
			function onOrientationChange() {
				if (!window.matchMedia("(pointer: coarse)").matches) return; // Игнорирую десктоп
				
				const d = document.fullscreenElement == videoRef.current;
				const isLandscapeOrientation = screen.orientation.type.includes("landscape");
				
				if (isLandscapeOrientation && !d) {
					fullscreenMode();
				} else if (!isLandscapeOrientation && d) {
					document.exitFullscreen();
				};
			};
			
			function onFullScreenChange(e) {
				const isEnabled = document.fullscreenElement == videoRef.current;
				videoRef.current.controls = isEnabled;
			};
			
			videoRef.current.addEventListener("fullscreenchange", onFullScreenChange);
			//if ((videoRef.current.clientHeight - videoRef.current.clientWidth) <= 0) window.addEventListener("resize", onResize);
			if ((videoRef.current.clientHeight - videoRef.current.clientWidth) <= 0) screen.orientation.addEventListener("change", onOrientationChange);
			
			return ()=>{
				if (videoRef.current) videoRef.current.removeEventListener("fullscreenchange", onFullScreenChange);
				//window.removeEventListener("resize", onResize);
				screen.orientation.removeEventListener("change", onOrientationChange);
			};
		}, [isFocused]);
		
		if (!ControllerContext.callbacks && ControllerContext.set) {
			ControllerContext.set({ isPaused, pause, play, pauseOrPlay });
		};
		
		return <video ref={videoRef} loop src={url} />;
	}
};





function MediaCarousel({ children, contentType, contentId, active }) {
	const contentRef = useRef();
	const DOMWidth = useRef(360);
		
	const [ info, updateInfo ] = useImmer({ active: 0, isFocused: false }); // isFocused должен передаваться от одних к другим. По умолчанию должен быть true
	const [ ControllerContexts, updateControllerContexts ] = useImmer([]);
	
	function updateControllerContext(id, name) {
		return (result)=>{
			Object.assign(ControllerContextsValues[id], getControllerContext(id), {[name]: result});
			updateControllerContexts(d=>{
				if (!d[id]) d[id] = {};
				d[id][name] = result;
			});
		};
	};
	/*function getGetFunc(id) {
		return (n)=>ControllerContexts[id] && ControllerContexts[id][n];
	};*/
	function getGetFunc(id) {
		return n=>ControllerContextsValues && ControllerContextsValues[id] && ControllerContextsValues[id][n];
	};
	function getControllerContext(id) {
		return {
			set: updateControllerContext(id, "callbacks"),
			setCheck: updateControllerContext(id, "check"),
			get: getGetFunc(id)
		}
	};
	
	const ControllerContextsValues = useMemo(()=>children && children.map((x,i)=>getControllerContext(i)), [children]);
	
	/*useEffect(function () {
		if (isFocused) {
			const OnKeyPress = function () {
				
			};
		};
	}, [info, ControllerContexts]);*/
	
	useEffect(function () {
		const current = contentRef.current;
		/*let isNowScrolling = false;
		
		let scrollingNow = 0;
		let startX = 0;
		
		let startedAt = 0;
		let endedDirection;
		
		
		function Normalise() {
			DOMWidth.current = Number(getComputedStyle(contentRef.current).width.slice(0, -2));
			const scrollLeftIndexes = children && children.map((x,i)=>DOMWidth.current*i);
			
			let isSwipe = (Date.now() - startedAt) <= 500;
			
			let target = current.scrollLeft;
			let scrollTo = 0;

			let bigger = Math.min(...scrollLeftIndexes.filter(x=>target<x));
			let smaller = Math.max(...scrollLeftIndexes.filter(x=>target>=x));
			
			if (!isSwipe) {
				let [ biggerD, smallerD ] = [bigger - target, target - smaller];
				let closest = Math.min(biggerD, smallerD);
			
				if (closest == biggerD) scrollTo = bigger 
				else scrollTo = smaller;
			} else {
				scrollTo = endedDirection == "left" ? smaller : bigger;
				if (bigger == Infinity) scrollTo = 0; // Крч инфинити возвращается, если после того ничего не идет типа. Да, я сам в шоке с такого
			};
			
			current.scrollTo({left: scrollTo, behavior: "smooth"});
			updateInfo(d=>{d.active = scrollLeftIndexes.indexOf(scrollTo)});
		};
		
		function onMouseDown(event) {
			isNowScrolling = true;
			startX = event.clientX;
			scrollingNow = current.scrollLeft;
			startedAt = Date.now();
		};
		function onMouseUp(event) {			
			if (isNowScrolling) {
				isNowScrolling = false;
				endedDirection = -event.clientX+startX > 0 ? "right" : "left";
				Normalise();
			};
		};
		
		function onMouseMove(event) {
			if (current.childNodes.length <= 1) return;
			
			if (isNowScrolling) {
				//event.preventDefault();
				current.scrollTo(scrollingNow-event.clientX+startX, 0);
			};
		};
		
		current.addEventListener("pointerdown", onMouseDown);
		current.addEventListener("pointerup", onMouseUp);
		current.addEventListener("pointermove", onMouseMove);
		return () => {
			current.removeEventListener("pointerdown", onMouseDown);
			current.removeEventListener("pointerup", onMouseUp);
			current.removeEventListener("pointermove", onMouseMove); 
		};*/ // События с mouse заменены на события с pointer
		
		function onScroll(e) {
			let scrollLeft = current.scrollLeft;
			let containerWidth = current.clientWidth;
			
			const closestIndex = Math.round(scrollLeft / containerWidth);
			if (children[closestIndex]) {
				updateInfo(d=>{
					d.active = closestIndex;
				});
			};
		};
		current.addEventListener("scroll", onScroll);
		
		return ()=>current.removeEventListener("scroll", onScroll);
	}, [children]);
	useEffect(function () {
		if (active !== undefined) {
			updateInfo(d=>{d.isFocused = active});
		} else {
			updateInfo(d=>{d.isFocused = true});
		};
	}, [active]);
	
	
	useEffect(function () {
		if (!info.isFocused && info.active != 0) {
			updateInfo(d=>{
				d.active = 0;
			});
			contentRef.current.scrollTo({left: 0, behavior: "smooth"});
		};
	}, [ info ]);
	
	useEffect(function () {
		updateControllerContexts([]);
	}, [children]);
	/*useEffect(function () {
		ControllerContexts.forEach((x,i)=>{
			Object.assign(ControllerContextsValues[i], x);
		});
	}, [ControllerContexts]);*/
	
	return <div className="playerlayer">
		{ children && children.length > 1 &&
			<div id="indicator">
				<div isActive={ String( info.active == 0 ) } />
				<div isActive={ String( info.active == 1 ) } />
				{ children.length > 2 && <div isActive={ String( children.length > 3 ? (info.active != children.length-1 && info.active >= 2) : (info.active == 2) ) } /> }
				{ children.length > 3 && <div isActive={ String ( info.active == children.length-1 ) } /> }
			</div>
		}
		<div ref={contentRef} id="content" className="app-no-scroll">
			<InfoContext value={info}>
				{ children && children.map((x,i)=>(
					<MediaControlContext key={i} value={ControllerContextsValues[i]}>
						<MediaCarouselContent index={i} contentType={contentType} contentId={contentId} children={x}/>
					</MediaControlContext>
				))}
			</InfoContext>
		</div>
	</div>;
};


function VerticalRating({ contentId, contentType, children, onUpdate, disabled, onComments, onShare }) {
	/* Отвечает за рейтинг, по типу лайков */
	const [ isProcessing, setIsProcessing ] = useState(false);
	
	const [ data, updateData ] = useImmer({});
	const { liked, comments, myRating } = data;
	
	useEffect(function () {
		updateData(children ? JSON.parse(JSON.stringify(children)) : {});
	}, [children]);
	
	function update(r) {
		updateData(draft => {
			Object.assign(draft, r);
			if (onUpdate) onUpdate(draft);
		});
	};
	
	async function processLike() {
		setIsProcessing(true);
		
		if (typeof app.me == "object") {
			updateData(actually=>{actually.myRating===1 ? actually.liked-- : actually.liked++});
		
			const response = await app.f.patch(`rating/${contentType}/${contentId}`, {rate: 1});
			if (typeof response == "object" && typeof response.content == "object") {
				update(response.content);
			} else {
				updateData(actually=>{actually.myRating===1 ? actually.liked++ : actually.liked--});
			};
		} else await app.functions.youMightToLogin();;
		
		setIsProcessing(false);
	};
	
	return <>
		<div>
			<button className="app-iconOnlyButton b" id="like" active={String(myRating==1)} onClick={processLike} disabled={isProcessing || disabled}>
				<app.components.react.FixedSVG className={`r alphaicon${myRating==1 ? " fill" : ""}`}>{app.___svgs.heart}</app.components.react.FixedSVG>
			</button>
			<span id="count">{liked > 0 ? ` ${app.functions.parseCount(liked)}` : "#uncategorized.likename#"}</span>
		</div>
		<div>
			<button className="app-iconOnlyButton b" id="comment" onClick={onComments} disabled={disabled}>
				<app.components.react.FixedSVG className="r alphaicon">{app.___svgs.comment}</app.components.react.FixedSVG>
			</button>
			<span id="count">{comments > 0 ? ` ${app.functions.parseCount(comments)}` : "#uncategorized.commentsname#"}</span>
		</div>
		<div>
			<button className="app-iconOnlyButton b" id="share" onClick={onShare} disabled={disabled}>
				<app.components.react.FixedSVG className="r alphaicon fill">{app.___svgs.share}</app.components.react.FixedSVG>
			</button>
			<span id="count">#uncategorized.sharename#</span>
		</div>
	</>;
};

export default function MipuAdvPost({children, disabled, active}) {	
	const [ currentData, updateCurrentData ] = useImmer({ noData: true });
	
	const [ openedState, setOpenedState ] = useState(null);
	
	/*
	
		Все, что надо пока что знать:
			1. Аватарка пльзователя будет приветствоваться в элементе rating в самом верхнем уровне. В принципе, как и в TikTok
			2. rating пока что загрушка. Компонент app.components.Rating не подходит, так как он линейный, и большую часть времени адаптировался на обычные посты
			3. Надо как-то пояснять, что app.components.Content кликабельный, и при нажатии на него отображается еще информация
			4. Список комментариев и сама информация - отдельные модальные окна. В теории, возможно, но правда мне стоит настолько улучшить модальные окна, надеюсь, у меня получится
			5. playerlayer в целом может представлять из себя отдельный компонент, но пока-что это заглушка
			6. Авторская аватарка - это компонент <app.components.Avatar user={author} />. В целом, больше ничего не надо знать
			7. content - не галерея для постов в классическом понимании. Поэтому структура неоднозначна, и, вероятно, его стоит расширить
			8. Объект rating в API в целом одинаковый для каждой структуры. Но дизлайки фронтендом не используются, а реакции не адаптируешь под вертикаль. Крч, самое используемое - это количество лайков и комментариев. Остальное - неадаптируемое и данные, которые применимы только для комментариев
			9. Ссылки авторского контента (например "/test/content.mp4") формируются так: app.apis.mediastorage+"/test/content.mp4" (выходит http://localhost:6383//test/content.mp4 , но это тоже корректная ссылка. Здесь test - это айди автора, а после автора - наименование файла)
	
	*/
	
	useEffect(function () {
		updateCurrentData(children ? JSON.parse(JSON.stringify(children)) : { noData: true });
	}, [children]);
	
	useEffect(function () {
		if (active !== undefined) {
			if (active) {}
			else {
				setOpenedState(null);
			};
		};
	}, [active]);
	
	const {
		id, visibility,
		content, description,
		created, edited,
		author,
		rating
	} = currentData;
	const visibilityDescription = visibilityDesc.find(x=>x.id==visibility);
	const contentType = "mipuadv_posts";
	
	async function handleShare(type) {
		let url = document.location.origin + `/sprks/${id}`;
		try {
			if (type == "copy") {
				await navigator.clipboard.writeText(url);
			} else if (type == "share") {
				await navigator.share({
					title: "#clientName#",
					text: "#uncategorized.sharetext#".replace("&0&", author && ( author.name ? author.name : ("@"+author.tag) ) || "#uncategorized.deleteduser#"),
					url
				});
			};
			app.toasts.show({
				icon: <app.components.react.FixedSVG className="alphaicon fill d" children={app.___svgs.checkmark_1}  />,
				type: "success",
				content: "#uncategorized.successfullyshared#",
				duration: 5000,
				onClick: (_, t)=>t()
			});
			setOpenedState(false);
		} catch(e) {
			app.toasts.show({
				icon: <app.components.react.FixedSVG className="d" children={app.___svgs.x}  />,
				type: "error",
				content: "#uncategorized.unsuccessfullyshared#",
				duration: 5000,
				onClick: (_, t)=>t()
			});
		};
	};
	
	return <div className="app-mipuadvpostplayer">
		<MediaCarousel children={content} contentId={id} contentType={contentType} active={active}/>
		<div className={"toplayer"}>
			<div className="postinfo">
				{ visibility != "1" && visibilityDescription && <span tooltip={visibilityDescription.description} className="app-txtd">{visibilityDescription.emoji} {visibilityDescription.name}</span> }
				<app.components.Username href user={author}/>
				<app.components.Content showCollapseButton compressTo={2}>{description}</app.components.Content>
			</div>
			<div className="rating">
				<app.components.Avatar user={author} />
				<VerticalRating 
					children={rating}
					disabled={disabled || !id}
					contentId={id}
					contentType={contentType}
					onUpdate={r=>{/* currentData.rating = r */} /* Ререндер не требуется */}
					onComments={()=>{setOpenedState("comments")}}
					onShare={()=>{setOpenedState("share")}}
					/>
			</div>
		</div>
		{ openedState &&
			<div className="commentslayer">
				<div id="closepart" onClick={()=>{setOpenedState(null)}}/>
				<div className="app-cm-modal modalcontainer" id={openedState}>
					{ openedState == "comments" &&
						<div>
							<app.structures.CommentList
								contentType={contentType}
								contentId={currentData.id}
								/> {/* Структура CommentList общая, но не соответствует вертикальности, но в целом нормально, можно постараться переделать */}
						</div>
					}
					{ openedState == "share" &&
						<div>
							<div>
								<b>#uncategorized.url#</b>
								<pre>{ document.location.origin + `/sprks/${id}` }</pre>
								<div style={{ display: "flex", width: "100%", paddingInline: 5, gap: 5, alignItems: "center" }}>
									<button onClick={e=>handleShare("share")} className="btn app-button">#button.share#</button>
									<button onClick={e=>handleShare("copy")} className="btn app-button">#button.copyurl#</button>
								</div>
							</div>
						</div>
					}
				</div>
			</div>
		}
	</div>;
};