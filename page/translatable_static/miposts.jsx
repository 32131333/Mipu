// Здесь описываются уже более верные компоненты для проигрывания mipuadv_posts постов
// Здесь совмещается идеология старого и нового TikTok, совмещается идеология Twitter и даже YouTube(YT Shorts)

/* --------------------------------------- */

import React from "react";
import { useImmer } from "use-immer";

const { useEffect, useCallback, useState, useRef, createContext, useContext } = React;
// И многие динамические переменные с app.components

/* --------------------------------------- */

const InfoContext = createContext({ active: 0, isFocused: false });

function MediaCarouselContent({children, index, contentId}) {
	const Info = useContext(InfoContext);
	
	const id = children.id;
	let url = children.url;
	
	if (url) {
		/*if (url.startsWith("/")) {
			url = app.apis.mediastorage + url;
		} else {
			url = app.functions.parseUnknownURL(url, "image");
		};*/
		url = app.apis.mediastorage + "/posts/" + String(contentId) + "/" + String(url);
	};

	// Крч тестовое свойство isfocused работает, над потом убрать
	// isfocused={ String( Info.active == index ) }
	
	/*switch(id) {
		case "image":
			return 
		case "video":
			return 
		default:
			return <span>Unknown content type 😭</span>
	}*/
	if (MediaCarouselContent.Objects[id]) {
		return React.createElement(MediaCarouselContent.Objects[id], { url, Info, index, isFocused: (Info.active == index) && Info.isFocused });
	} else {
		return <span>Unknown content type 😭</span>;
	};
};
MediaCarouselContent.Objects = {
	image({ url, Info, index }) {
		return <img draggable="false" src={url}/>;
	},
	video({ url, info, index, isFocused }) {
		const videoRef = useRef();
		
		const isEnabled = useRef(false);
		useEffect(function () {
			if (isFocused) {
				if (!isEnabled.current) {
					videoRef.current.play();
					videoRef.current.currentTime = 0;
					isEnabled.current = true;
				};
			} else {
				if (isEnabled.current) {
					videoRef.current.pause();
					isEnabled.current = false;
				};
			};
		}, [isFocused]);
		
		return <video ref={videoRef} controls loop src={url} />;
	}
};





function MediaCarousel({ children, contentType, contentId, active }) {
	const contentRef = useRef();
	const DOMWidth = useRef(360);
		
	const [ info, updateInfo ] = useImmer({ active: 0, isFocused: false }); // isFocused должен передаваться от одних к другим. По умолчанию должен быть true
	
	useEffect(function () {
		const current = contentRef.current;
		let isNowScrolling = false;
		
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
		}; // События с mouse заменены на события с pointer
	}, [children]);
	useEffect(function () {
		if (active !== undefined) {
			updateInfo(d=>{d.isFocused = active});
		} else {
			updateInfo(d=>{d.isFocused = true});
		};
	}, [active]);
	
	return <div className="playerlayer">
		{ children && children.length > 1 &&
			<div id="indicator">
				<div isActive={ String( info.active == 0 ) } />
				<div isActive={ String( info.active == 1 ) } />
				{ children.length > 2 && <div isActive={ String( children.length > 3 ? (info.active != children.length-1 && info.active >= 2) : (info.active == 2) ) } /> }
				{ children.length > 3 && <div isActive={ String ( info.active == children.length-1 ) } /> }
			</div>
		}
		<div ref={contentRef} id="content">
			<InfoContext value={info}>
				{ children && children.map((x,i)=>(
					<MediaCarouselContent key={i} index={i} contentType={contentType} contentId={contentId} children={x}/>
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
			<button className="app-iconOnlyButton b" onClick={processLike} disabled={isProcessing || disabled}>
				<app.components.react.FixedSVG className={`r alphaicon${myRating==1 ? " fill" : ""}`}>{app.___svgs.heart}</app.components.react.FixedSVG>
			</button>
			<span id="count">{liked > 0 ? ` ${app.functions.parseCount(liked)}` : "#uncategorized.likename#"}</span>
		</div>
		<div>
			<button className="app-iconOnlyButton b" onClick={onComments} disabled={disabled}>
				<app.components.react.FixedSVG className="r alphaicon">{app.___svgs.comment}</app.components.react.FixedSVG>
			</button>
			<span id="count">{comments > 0 ? ` ${app.functions.parseCount(comments)}` : "#uncategorized.commentsname#"}</span>
		</div>
		<div>
			<button className="app-iconOnlyButton b" onClick={onShare} disabled={disabled}>
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
		<div className={"toplayer"+(openedState ? " hide" : "")}>
			<div className="postinfo">
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
				<div className="app-cm-modal" id="modalcontainer">
					{ openedState == "comments" &&
						<div style={{height: "100%"}}>
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