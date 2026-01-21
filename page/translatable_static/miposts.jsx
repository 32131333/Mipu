// Здесь описываются уже более верные компоненты для проигрывания mipuadv_posts постов
// Здесь совмещается идеология старого и нового TikTok, совмещается идеология Twitter и даже YouTube(YT Shorts)

/* --------------------------------------- */

import React from "react";
import { useImmer } from "use-immer";

//import { useNavigate } from "react-router";
const { useEffect, useCallback, useState, useRef, createContext, useContext, useMemo } = React;
// И многие динамические переменные с app.components

/* --------------------------------------- */

const InfoContext = createContext({ active: 0, isFocused: false });
const MediaControlContext = createContext({});
const HideTopPlayerContext = createContext(()=>{});
const GlobalRefContext = createContext({current: {}});

const visibilityDesc = app.structures.MipuAdvPostPreview.visibilityDesc;

function MediaCarouselContent({children, objects, index, contentId}) {
	const Info = useContext(InfoContext);
	const ControllerContext = useContext(MediaControlContext);
	const ObjectsControllerCallbacks = ControllerContext?.callbacks;
	const setHideTopPlayer = useContext(HideTopPlayerContext);
	
	const isFocused = (Info.active == index) && Info.isFocused;
	const focusedObject = Info.isFocused && objects[Info.active];
	
	const timeLapseRef = useRef(null);
	const timeLapseTextRef = useRef(null);
	
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

	//console.log(ObjectsControllerCallbacks);
	
	useEffect(function () {
		function onPointerDown() {
			setHideTopPlayer(true);
			timeLapseTextRef.current.hidden = false;
		};
		function onPointerUp() {
			setHideTopPlayer(false);
			timeLapseTextRef.current.hidden = true;
		};
		function onInput() {
			//app.functions.formatTime(time)
			timeLapseTextRef.current.innerHTML = `<span class="app-notmaintext">${app.functions.formatTime(timeLapseRef.current.value)}</span> / ${app.functions.formatTime(timeLapseRef.current.max)}`;
		};
		
		timeLapseRef.current.addEventListener("pointerup", onPointerUp);
		timeLapseRef.current.addEventListener("pointerdown", onPointerDown);
		timeLapseRef.current.addEventListener("input", onInput);
		
		return function () {
			timeLapseRef.current?.removeEventListener("pointerup", onPointerUp);
			timeLapseRef.current?.removeEventListener("pointerdown", onPointerDown);
			timeLapseRef.current?.removeEventListener("input", onInput);
		};
	}, []);
	
	if (MediaCarouselContent.Objects[id]) {
		return <div onClick={()=>{ObjectsControllerCallbacks?.pauseOrPlay?.()}}>
			{ paused && <div className="pauselayout"><app.components.react.FixedSVG className="alphaicon fill" children={app.___svgs.play}/></div> }
			<span className="timelapsetext" ref={timeLapseTextRef} hidden></span>
			<app.components.RangeInputOne ref={timeLapseRef} step="0.1" defaultValue={0} hidden className="timelapse" />
			{
				React.createElement(
					MediaCarouselContent.Objects[id],
					{ 
						url, Info, index, isFocused,
						check: checkFunc, timeLapseRef,
						self: children, focusedObject,
						objects, focusedOnPost: Info.isFocused
					}
				)
			}
		</div>;
	} else {
		return <span>Unknown content type 😭</span>;
	};
};
MediaCarouselContent.Objects = {
	image({ url, Info, index, isFocused, check, timeLapseRef, self, focusedObject, objects, focusedOnPost }) {
		const ControllerContext = useContext(MediaControlContext);
		const { audiosRef } = ControllerContext;
		
		const usedAudioId = self?.audio ?? 0;
		const audioObj = audiosRef.current.querySelector(`#a${usedAudioId}`);

		function isPaused() {
			return audioObj?.paused;
		};
		function pause() {
			audioObj?.pause();
		};
		function play() {
			audioObj?.play();
		};
		function pauseOrPlay() {
			const audioObj = audiosRef.current.querySelector(`#a${usedAudioId}`); // Переменная audioObj интересным образом превращается в null
			return audioObj.paused ? audioObj.play() : audioObj.pause();
		};
		
		useEffect(function () {
			if (!focusedOnPost || !audioObj) return;
			
			function onPlay() {
				check(audioObj?.paused);
			};
			function onPause() {
				check(audioObj?.paused);
			};
			
			audioObj?.addEventListener("play", onPlay);
			audioObj?.addEventListener("pause", onPause);
			return ()=>{
				audioObj?.removeEventListener("play", onPlay);
				audioObj?.removeEventListener("pause", onPause);
			};
		}, [focusedOnPost, audioObj]);
		
		const isEnabled = useRef(false);
		useEffect(function () {
			if (!audioObj) return; // Нету звука - ето значет проста статичная картинка
			
			if (isFocused) {
				isEnabled.current = true;
				
				try {
					//if (objects.filter(x=>x?.audio==usedAudioId && x.id=="image").indexOf(self)===0) play();
					if (!audioObj.classList.contains("active")) {
						audioObj.classList.add("active");
						play();
					};
				} catch {
					check(true);
				};
			} else if (!isFocused && (focusedObject?.id == "image" && (focusedObject?.audio ?? 0) === usedAudioId)) {
				isEnabled.current = false; // Так как сфокусированный объект тоже использует эту музыку, мы ничего не делаем
			} else {
				if (isEnabled.current) {
					isEnabled.current = false;
					pause();
					audioObj.classList.remove("active");
					audioObj.currentTime = 0; // <- Здесь babel в webpack на что-то жаловался. Видимо audioObj?.currentTime не являлся желанным
				};
			};
		}, [focusedObject, isFocused, focusedOnPost, audioObj]);
		
		if (!ControllerContext.callbacks && ControllerContext.set) {
			ControllerContext.set({ isPaused, pause, play, pauseOrPlay });
		};
		return <img draggable="false" src={url}/>;
	},
	video({ url, Info, index, isFocused, check, timeLapseRef, self }) {
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
			if (!isFocused) timeLapseRef.current.hidden = true;
			
			if (!isFocused && !check) return;
			
			let isVideoEarlyPlaying = false;
			function onPlay() {
				check(videoRef.current.paused);
				if (timeLapseRef.current) {
					timeLapseRef.current.hidden = !videoRef.current.paused && !isVideoEarlyPlaying ? videoRef.current.duration <= 25 : false;
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
	},
	deletednotify() {
		return <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingInline: "10%" }}>
			<h3>#uncategorized.great#</h3>
			<span>#uncategorized.mipuadvpostdeleted#</span>
		</div>;
	}
};





function MediaCarousel({ children, audios, usedAudioAuthors, post, contentType, contentId, active }) {
	const contentRef = useRef();
	const audiosRef = useRef();
	
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
			audiosRef, set: updateControllerContext(id, "callbacks"),
			setCheck: updateControllerContext(id, "check"),
			get: getGetFunc(id)
		}
	};
	
	const ControllerContextsValues = useMemo(()=>children && children.map((x,i)=>getControllerContext(i)), [children]);
	
	
	
	const globalRef = useContext(GlobalRefContext);
	const lastRef = useRef(null);
	const updateUsedMediaMetadata = globalRef.current.updateUsedMediaMetadata;
	
	const audiosMetadata = useMemo(function () {
		return audios?.map(x=>{
			const mipuadv_postsId = x.split("_")[0];
			const videoIndex = x.split("_")[1] ?? 0;
		
			//const preview = videoIndex!==undefined && videoIndex!==0 ? `preview${videoIndex}.webp` : "preview.webp";
		
			const user = usedAudioAuthors.find(d=>d.ref===x);
			//console.log(usedAudioAuthors, audios, x, user);
			return {
				id: mipuadv_postsId,
				soundId: x,
				preview: user && ["user", user]
			};
		});
	}, [audios, usedAudioAuthors]); // Мы просто будем брать один и тот же объект, чтобы при перезаписи просто не вызывать лишний ре-рендер
	//const authorAudioMetadata = useMemo(()=>({id: post?.id, soundId}), [post]);
	const authorsAudioMetadata = useMemo(function () {
		return children?.map((x,i)=>{
			return {
				id: post?.id,
				soundId: i !== 0 ? `${post?.id}_${i}` : `${post?.id}`,
				preview: post?.author && ["user", post?.author],
				i
			}
		});
	}, [post?.id, post?.author, children]);
	
	useEffect(function () {
		//if (!audiosMetadata) updateUsedMediaMetadata(null);
		
		// Определяем
		/*let audioIndex = children?.[info.active]?.audio;
		if (!audioIndex && children?.[info.active]?.id == "image" ) audioIndex = 0;
		
		updateUsedMediaMetadata(audiosMetadata[audioIndex]);*/
		let audioIndex = children?.[info.active]?.audio;
		if (audioIndex == null && children?.[info.active]?.id === "image") {
			audioIndex = 0;
		};
		
		let selected = audiosMetadata?.[audioIndex];
		if (!selected && children?.[info.active]?.id === "video") {
			selected = authorsAudioMetadata.find(x=>x.i===info.active);
		};
		
		const next = selected ?? null;

		if (lastRef.current !== next) {
			lastRef.current = next;
			console.log(next);
			updateUsedMediaMetadata(next);
		};
	}, [info.active, children, audiosMetadata, authorsAudioMetadata]);
	
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
		<div ref={audiosRef} hidden>
			{
				audios && audios.map((x,i)=>{
					// x => "1" "1_2", 1 - sparksid , 2(or 0) - video soundindex
					let a = x.split("_");
					let id = a[0];
					let indx = a[1] ?? 0;
					
					return <audio key={x} id={`a${i}`} loop src={app.apis.mediastorage+`/posts/${id}/sound${indx}.ogg`}/>;
				})
			}
		</div>
		<div ref={contentRef} id="content" className="app-no-scroll">
			<InfoContext value={info}>
				{ children && children.map((x,i)=>(
					<MediaControlContext key={`${x?.id}${x?.url}${i}`} value={ControllerContextsValues[i]}>
						<MediaCarouselContent index={i} contentType={contentType} contentId={contentId} objects={children} children={x}/>
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
	
	/*globalRef.updateUsedMediaMetadata = updateUsedMediaMetadata;
	console.log(usedMediaMetadata);*/
	
	/*return <>
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
	</>;*/
	return <>
		<app.components.iconButton
			type="1"
			id="like"
			active={String(myRating==1)}
			onClick={processLike}
			disabled={isProcessing || disabled}
			icon={ <app.components.react.FixedSVG className={`d alphaicon${myRating==1 ? " fill" : ""}`}>{app.___svgs.heart}</app.components.react.FixedSVG> }
		>
			{liked > 0 ? `${app.functions.parseCount(liked)}` : "#uncategorized.likename#"}
		</app.components.iconButton>
		<app.components.iconButton
			type="1"
			id="comment"
			onClick={onComments}
			disabled={disabled}
			icon={ <app.components.react.FixedSVG className="d alphaicon">{app.___svgs.comment}</app.components.react.FixedSVG> }
		>
			{comments > 0 ? `${app.functions.parseCount(comments)}` : "#uncategorized.commentsname#"}
		</app.components.iconButton>
		<app.components.iconButton
			type="1"
			id="share"
			onClick={onShare}
			disabled={disabled}
			icon={ <app.components.react.FixedSVG className="d alphaicon fill">{app.___svgs.share}</app.components.react.FixedSVG> }
		>
			#uncategorized.sharename#
		</app.components.iconButton>
	</>;
};

function MipuAdvPostMicroEditForm({ children, onConfirm, onCancel, contentType }) {
	const [ form, updateForm ] = useImmer({
		description: children.description,
		visibility: children.visibility
	});
	const [ error, setError ] = useState(null);
	
	const selectedVisibility = form.visibility !== undefined ? visibilityDesc.find(x=>x.id==form.visibility) : visibilityDesc[0];
	
	async function submit() {
		const r = await app.f.patch(`${contentType}/${children.id}`, {...form});
		if (r.status=="success") {
			onConfirm(r.content);
		} else {
			setError(r.error);
			return false;
		};
	};
	
	return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
		<div>
			<b><span>#uncategorized.mipuadvpostseditinfo#</span></b>
			{error && <app.components.ErrorAlert>{app.translateError(error)}</app.components.ErrorAlert>}
		</div>
		<div>
			<app.components.ContentInput placeholder="#uncategorized.description#" value={form.description} onChange={e=>{ updateForm(d=>{ d.description = e.target.value }) }}/>
			<button className="app-buttonFromModals flexCenter" onClick={()=>{ updateForm(d=>{ d.visibility = visibilityDesc[visibilityDesc.indexOf(selectedVisibility)+1] ? visibilityDesc[visibilityDesc.indexOf(selectedVisibility)+1].id : visibilityDesc[0].id }) }}>
				<span id="icon" children={selectedVisibility.emoji}/>
				<span><b>#page.create.visibility#: {selectedVisibility.name}</b><br />{selectedVisibility.description}</span>
			</button>
		</div>
		<span><app.components.ProcessButton onClick={submit} className="btn app-button">#button.confirm#</app.components.ProcessButton> <button className="btn app-button" onClick={onCancel}>#button.cancel#</button></span>
	</div>;
};

export default function MipuAdvPost({children, disabled, active, onDelete, setVerticalScrollDisabled}) {	
	const [ currentData, updateCurrentData ] = useImmer({ noData: true });
	
	const [ openedState, setOpenedState ] = useState(null);
	const [ hideTopPlayer, setHideTopPlayer ] = useState(false);
	
	const [ usedMediaMetadata, updateUsedMediaMetadata ] = useState(null); // Тут особо Immer и не нужен, он скорее будет вызывать лишние перезаписи
	const globalRef = useRef({ updateUsedMediaMetadata });
	
	//const navigate = useNavigate();
	/*useEffect(function () {
		globalRef.current.updateUsedMediaMetadata = updateUsedMediaMetadata;
		return () => {
			globalRef.current.updateUsedMediaMetadata = ()=>{};
		};
	}, []);	*/
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
	
	
	
	useEffect(function () {
		if (active) setVerticalScrollDisabled(openedState || hideTopPlayer);
	}, [active, openedState, setVerticalScrollDisabled, hideTopPlayer]);
	
	const {
		id, visibility,
		content, description,
		created, edited,
		author, audios,
		used_audio_authors,
		rating
	} = currentData;
	const visibilityDescription = visibilityDesc.find(x=>x.id==visibility);
	const contentType = "mipuadv_posts";
	
	const me = app.me; // Относительно лучше просто использовать глобальную переменную, чем хук
	
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
			setOpenedState(null);
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
	async function handleDelete() {
		if (!id) return;
		setOpenedState(null);
		
		const confirmed = await app.functions.youReallyWantToDo();
		if (confirmed) {
			const r = await app.f.delete(`${contentType}/${id}`);
			if (r.status == "success") {
				onDelete?.();
				updateCurrentData({ author, content: [ {id: "deletednotify"} ] });
			};
		};
	};
	
	return <GlobalRefContext value={globalRef}>
		<div className="app-mipuadvpostplayer">
			<HideTopPlayerContext value={setHideTopPlayer}><MediaCarousel post={children} children={content} usedAudioAuthors={used_audio_authors} audios={audios} contentId={id} contentType={contentType} active={active}/></HideTopPlayerContext>
			<div className={["toplayer", "hide1", !hideTopPlayer && "unhide"].filter(x=>x!==false).join(" ")}>
				<div className="postinfo">
					{ visibility != "1" && visibilityDescription && <span tooltip={visibilityDescription.description} className="app-txtd">{visibilityDescription.emoji} {visibilityDescription.name}</span> }
					<div>
						<app.components.Username href user={author}/>
						{(created || edited) && <span className="app-notmaintext"> ● {app.functions.ago(edited || created)}</span>}
					</div>
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
					{ usedMediaMetadata?.preview?.[0] == "user" && <app.components.Avatar onClick={()=>setOpenedState("audioinfo")} user={usedMediaMetadata.preview[1]} /> }
				</div>
			</div>
			{ openedState &&
				<div className="commentslayer">
					<div id="closepart" onClick={()=>{setOpenedState(null)}}/>
					<div className="app-cm-modal modalcontainer app-joinfromdownanim" id={openedState}>
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
										{ /*
											<button onClick={e=>handleShare("share")} className="btn app-button">#button.share#</button>
											<button onClick={e=>handleShare("copy")} className="btn app-button">#button.copyurl#</button>
										*/ }
										<app.components.iconButton onClick={e=>handleShare("share")} icon={ <app.components.react.FixedSVG className="alphaicon fill d" children={app.___svgs.share} /> }>#button.share#</app.components.iconButton>
										<app.components.iconButton onClick={e=>handleShare("copy")} icon={ <div className="d">🔗</div> }>#button.copyurl#</app.components.iconButton>
										{ me.id == author?.id && <app.components.iconButton onClick={handleDelete}>#button.delete#</app.components.iconButton> }
										{ me.id == author?.id && <app.components.iconButton icon={ <div className="d">✏</div> } onClick={()=>setOpenedState("edit")}>#button.edit#</app.components.iconButton> }
										<app.components.iconButton onClick={e=>{setOpenedState(false);app.functions.report("mipuadv_posts", currentData.id)}} icon={ <div className="d">🏳</div> }>#button.report#</app.components.iconButton>
									</div>
								</div>
							</div>
						}
						{
							openedState == "edit" && <MipuAdvPostMicroEditForm 
														children={currentData}
														onConfirm={(d)=>{ setOpenedState(null); updateCurrentData(d) }}
														onCancel={()=>setOpenedState("share")}
														contentType={contentType}
														/>
						}
						{
							openedState == "audioinfo" && 
							<div>
								<button onClick={()=>(
									app.memory.updateCreatePageData(contentType, d=>{
										d.audios ? d.audios.push(usedMediaMetadata.soundId) : (d.audios=[usedMediaMetadata.soundId])
									}).then(x=>{
										if (x) {
											window.history.pushState({}, null, "/create");
											window.dispatchEvent(new PopStateEvent("popstate"));
										};
									})
								)} className="btn app-button">#button.usethissound#</button>
							</div>
						}
					</div>
				</div>
			}
		</div>
	</GlobalRefContext>;
};