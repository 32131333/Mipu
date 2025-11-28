import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import React from "react";
const { ErrorAlert, WarnAlert } = app.components;
const { FixedSVG, TextInput } = app.components.react;


import { useImmer } from "use-immer";


app.functions.uploadFileContextMenu = function (onselect, toElem, oncancel) {
	app.cm.create([
		{text: "#page.modal.upload.button.uploadnew#", onClick: ()=>app.functions.uploadModal(onselect, oncancel)},
		{text: "#page.modal.upload.button.fromclipboard#", onClick: ()=>app.functions.fromClipBoardImageFile(onselect, oncancel)},
		{text: "#page.modal.upload.button.fromurl#", onClick: ()=>app.functions.fileFromUrlModal(onselect, oncancel)}
	], {
		toElement: toElem,
		closeFunction: (reason)=>{if (reason == "clicked" && oncancel) { oncancel() };return true}
	});
};





app.functions.srcToFile = function (src, fileName, options){
	return (fetch(src)
		.then(function(res){return res.arrayBuffer();})
		.then(function(buf){return new File([buf], fileName, options);})
	);
};

app.functions.uploadModal = function (callback, cancelcallback) {
	function A() {
		const inputRef = useRef(null);
		const dropAreaRef = useRef(null);
		return <>
			<style>
			{`
			.client-append-file {
				border: 2px dashed rgb(204, 204, 204);
				/*width: 100%;*/
				/*height: 130px;*/
				height: 25rem;
				width: 40rem;
				text-align: center;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				cursor: pointer;
			}
			.client-append-file.dragenter, .client-append-file:hover {
				background-color: #e2e2e2;
			}
			`}
			</style>
			<input type="file"
				ref={inputRef}
				hidden
				onInput={function (e) {
					e.preventDefault();
					let file = e.target.files[0];
					callback(file, "upload");
					app.m_.unrender();
				}}
			/>
			<div id="dropArea"
				ref={dropAreaRef}
				className="client-append-file"
				onClick={()=>inputRef.current.click()}
				onDragEnter={(e)=>{e.preventDefault();dropAreaRef.current.classList.add("dragenter")}}
				onDragOver={(e)=>e.preventDefault()}
				onDragLeave={(e)=>{e.preventDefault();dropAreaRef.current.classList.remove("dragenter")}}
				onDrop={(e)=>{
					e.preventDefault();
					dropArea.classList.remove("dragenter");
					let file = e.dataTransfer.files[0];
					// Дальнейшая логика или обработка файла здесь
					callback(file, "uploadnew");
					app.m_.unrender();
				}}
			>#page.modal.upload.description#</div>
		</>
	};
	app.m_.render({
		title: "#page.modal.upload.title#",
		adaptMobile: true,
		closable: true,
		component: <A/>,
		onEnd: cancelcallback
	})
};



app.functions.fromClipBoardImageFile = function (callback, cancelcallback) {
	function A() {
		const [ waiting, setWaiting ] = useState(true);
		const [ errorState, setErrorState ] = useState(null);
		useEffect(()=>{
			async function process() {
				let t;
				try {
					t = await navigator.clipboard.read();
				} catch(e) {
					setErrorState("unhandled_error");
					return null;
				};
				setWaiting(false);
				let f = false;
				for (const item of t) {
					if (!item.types.includes("image/png") && !item.types.includes("image/jpg") && !item.types.includes("image/gif") && !item.types.includes("image/webp")) {
						setErrorState("not_an_image");
					} else {
						const blob = await item.getType("image/png") || await item.getTime("image/jpg") || await item.getTime("image/gif");
						callback(new File([blob], "image."+blob.type.split("/")[1], {type: blob.type}));
						await app.m_.unrender();
						return null;
					};
				};
			};
			process();
		}, []);
		return <>
			{waiting && <p><FixedSVG>{app.___svgs.loading}</FixedSVG> #uncategorized.confirmyouraction#</p>}
			{errorState && <ErrorAlert>{app.translateError(errorState)}</ErrorAlert>}
			<app.m_.Footer>
				<span><app.m_.Button>#button.cancel#</app.m_.Button></span>
			</app.m_.Footer>
		</>;
	};
	app.m_.render({
		title: "#page.modal.upload.imagecropClipBoardTitle#",
		adaptMobile: true,
		closable: true,
		component: <A/>,
		onEnd: cancelcallback
	});
};









app.functions.cropModal = function (file, options={}, callback, cancelcallback) {
	const fr = new FileReader();
	fr.onload = async function (event) {
		function A() {
			const ref = useRef(null);
			const reff = useRef(null);
			useEffect(function () {
				let xheight = options.height ?? 1024;
				let xwidth = options.width ?? 1024;
				let cropper = new Cropper(ref.current, {
					background: false,
					cropBoxResizable: false,
					cropBoxMovable: false,
					dragMode: "move",
					viewMode: 1,
					ready() {
						const scale = Math.min(this.cropper.imageData.width/xwidth, this.cropper.imageData.height/xheight);
						this.cropper.setCropBoxData({ width: xwidth*scale, height: xheight*scale,
							left: this.cropper.containerData.width/2-xwidth*scale/2,
							top: this.cropper.containerData.height/2-xheight*scale/2 });
						this.cropper.zoomTo(0, {
							x: this.cropper.containerData.width / 2,
							y: this.cropper.containerData.height / 2
						});
					},
				});
				reff.current = {cropper, xheight, xwidth};
			}, []);
			
			async function handleConfirm() {
				const {cropper, xheight, xwidth} = reff.current;
				let cropped;
				if (file.type!=="image/gif") cropped = cropper.getCroppedCanvas({ height: xheight, width: xwidth}).toDataURL(file.type ?? "image/png")
				else {
					await new Promise((resolve) => {
						CropperjsGif.crop({
								encoder: {
									workers: 2,
									quality: 10,
									workerScript: "/static/gif.worker.js"
								},
								src: event.target.result,
								maxWidth: 600,
								maxHeight: 600,
								onerror: function(code, error){
									console.error(code, error);
								}
							},
							cropper,
							function (blob) {
								const fr = new FileReader();
								fr.onloadend = () => {
									cropped = fr.result;
									resolve();
								};
								fr.readAsDataURL(blob);
							}
						);
					});
				};
				callback(cropped, await app.functions.srcToFile(cropped, file.name, {type: file.type, lastModified: file.lastModified}));
				app.m_.unrender();
			};
			
			return <>
				<div className="cropper-container" style={{width: "40rem", height: "25rem", backgroundColor: "black"}}>
					<img ref={ref} id="cropThis" src={event.target.result}/>
				</div>
				<app.m_.Footer>
					<span><app.components.ProcessButton onClick={/*processButton(*/handleConfirm/*)*/} className="btn app-button">#button.confirm#</app.components.ProcessButton> <app.m_.Button>#button.cancel#</app.m_.Button></span>
				</app.m_.Footer>
			</>;
		};
		app.m_.render({
			title: "#page.modal.upload.crop#",
			closable: true,
			adaptMobile: true,
			component: <A/>,
			onEnd: cancelcallback
		});
	};
	fr.readAsDataURL(file);
};

app.functions.fileFromUrlModal = function (callback, cancelcallback) {
	function A() {
		const ref = useRef(null);
		const [errorState, setErrorState] = useState(null);
		return <>
			{errorState ? <ErrorAlert>{app.translateError(errorState)}</ErrorAlert> : <WarnAlert>#page.modal.upload.fromUrlUnsafeWarn#</WarnAlert>}
			<TextInput ref={ref} label="URL" placeholder="https://cdn.example.com/usercontent/Mipu_Cat/UwU.webp?nameas=iloveyou"/>
			<app.m_.Footer>
				<span><app.components.ProcessButton onClick={/*processButton(*/async function (e) {
					try {
						const result = await app.functions.fileFromSrc(ref.current.value);
						callback(result);
						app.m_.unrender();
					} catch(e) {
						console.error(e);
						setErrorState("something_happened");
					};
				}/*)*/} className="btn app-button">#button.apply#</app.components.ProcessButton> <app.m_.Button>#button.cancel#</app.m_.Button></span>
			</app.m_.Footer>
		</>
	};
	app.m_.render({
		title: "#page.modal.upload.fromUrlTitle#",
		closable: true,
		adaptMobile: true,
		component: <A/>,
		onEnd: cancelcallback
	});
};
app.functions.fileFromSrc = async function (text) {
	const res = await fetch(text);
	const blob = await res.blob();
	return new File([blob], text.split("/")[text.split("/").length-1].split("?")[0], {type: blob.type});
};


app.functions.fileFromSelected = function (callback, cancelcallback, onlyOne) {
	function unrender(r) {
		app.m_.unrender(r || "closed");
	};
	
	app.m_.render({
		closable: true,
		adaptMobile: true,
		component: <app.functions.fileFromSelected.SelectFromUploadedModal
			onlyOne={onlyOne}
			onCancel={(...a)=>{cancelcallback(...a);unrender()}}
			onSelect={(...a)=>{callback(...a);unrender("selected")}}
		/>,
		onEnd: cancelcallback
	});
};


/**
 * Основной компонент модального окна для выбора изображений.
 */
app.functions.fileFromSelected.SelectFromUploadedModal = function ({ onSelect, onCancel, onlyOne = false }) {
	const [images, setImages] = useState([]);
	const [selected, setSelected] = useImmer([]);
	const [isLoading, setIsLoading] = useState(false);
	const [canLoadMore, setCanLoadMore] = useState(true);
	const [page, setPage] = useState(1);
	const loaderRef = useRef(null);

	const { me } = app.reactstates.useInformationAboutMe();

	const fetchImages = useCallback(async (pageNum) => {
		setIsLoading(true);
		try {
			const response = await app.f.get('uploads', { page: pageNum });
			if (response.content && response.content.length > 0) {
				setImages(prev => [...prev, ...response.content]);
			} else {
				setCanLoadMore(false); // Больше нечего загружать
			};
		} catch (error) {
			console.error("Failed to fetch images:", error);
		} finally {
			setIsLoading(false);
		};
	}, []);

	// Первоначальная загрузка
	useEffect(() => {
		fetchImages(1);
	}, [fetchImages]);

	// Бесконечная прокрутка
	useEffect(() => {
		const observer = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && canLoadMore && !isLoading) {
				setPage(prevPage => {
					const nextPage = prevPage + 1;
					fetchImages(nextPage);
					return nextPage;
				});
			}
		}, { threshold: 0.5 });

		const currentLoader = loaderRef.current;
		if (currentLoader) {
			observer.observe(currentLoader);
		}
		return () => {
			if (currentLoader) {
				observer.unobserve(currentLoader);
			}
		};
	}, [canLoadMore, isLoading, fetchImages]);

	const handleImageClick = (imageId) => {
		setSelected(draft => {
			const index = draft.indexOf(imageId);
			if (index > -1) { // Если уже выбрано - убираем
				draft.splice(index, 1);
			} else { // Если не выбрано - добавляем
				if (onlyOne) {
					draft.splice(0, draft.length, imageId); // Заменяем все на один элемент
				} else {
					draft.push(imageId);
				}
			}
		});
	};

	const handleSubmit = () => {
		const result = onlyOne ? selected[0] : selected;
		onSelect(result); // Передаем результат в колбэк
	};

	return (
		<>
			<style>{`
				#select-gallery-grid { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; }
				.selectable-image-container { transition: all 0.2s; border: 3px solid transparent; border-radius: 8px; cursor: pointer; }
				.selectable-image-container:hover { border-color: #aaa; }
				.selectable-image-container.selected { border-color: var(--redColor, #f44336); box-shadow: 0px 0px 10px 0px var(--redColor, #f44336); }
				.selectable-image-container.disabled { cursor: not-allowed; opacity: 0.5; }
			`}</style>
			<app.m_.Title>#page.modal.selectFromUploaded.title#</app.m_.Title>
			<app.m_.Scrollable>
				<div id="select-gallery-grid">
					{images.map(imageId => (
						<app.functions.fileFromSelected.SelectableImage
							key={imageId}
							imageId={imageId}
							userId={me.id}
							isSelected={selected.includes(imageId)}
							isDisabled={onlyOne && selected.length > 0 && !selected.includes(imageId)}
							onSelect={handleImageClick}
						/>
					))}
					<div ref={loaderRef} style={{ width: '100%', height: '50px' }}>
						{isLoading && <app.components.Loading />}
					</div>
					{!isLoading && images.length === 0 && <div>#page.modal.selectFromUploaded.empty#</div>}
				</div>
			</app.m_.Scrollable>
			<app.m_.Footer>
				<app.m_.Button onClick={onCancel}>#button.cancel#</app.m_.Button>
				{" "}
				<app.m_.Button onClick={handleSubmit} disabled={selected.length === 0}>
					#button.submit#
				</app.m_.Button>
			</app.m_.Footer>
		</>
	);
};

/**
 * Компонент для отображения одного изображения в сетке выбора.
 */
app.functions.fileFromSelected.imageMediaInForms = function (userId, mediaId) {
	const elem = document.createElement("div");
	const img = document.createElement("img");
	img.src = `${app.apis.mediastorage}${userId}/${mediaId}`;
	elem.appendChild(img);
	elem.style.width = '120px';
	elem.style.height = '120px';
	elem.style.margin = '5px';
	img.style.width = '100%';
	img.style.height = '100%';
	img.style.objectFit = 'cover';
	img.style.borderRadius = '4px';
	return elem;
};
app.functions.fileFromSelected.SelectableImage = function ({ imageId, userId, isSelected, isDisabled, onSelect }) {
    const ref = useRef(null);

    // Используем старую функцию для создания DOM-элемента, но оборачиваем ее в React-компонент
    useEffect(() => {
        const domElement = app.functions.fileFromSelected.imageMediaInForms(userId, imageId);
        domElement.className = 'swalcimg';
        if(ref.current) {
            ref.current.innerHTML = '';
            ref.current.appendChild(domElement);
        }
    }, [imageId, userId]);

    const handleClick = () => {
        if (!isDisabled) {
            onSelect(imageId);
        };
    };

    const classNames = `selectable-image-container ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;

    return <div ref={ref} className={classNames} onClick={handleClick}></div>;
};

import { LazyLoadImage } from 'react-lazy-load-image-component';
app.functions.fileFromSelected.SelectableImage = function ({ imageId, userId, isSelected, isDisabled, onSelect }) {
	// Короче, я переписываю эту функцию. На практике оказалась довольно лагучей. Ленивый загрузчик может исправить ситацию
	
	const classNames = `selectable-image-container ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;
	
	const handleClick = () => {
		if (!isDisabled) {
			onSelect(imageId);
		};
	};
	
	return <div className={classNames} style={{width: "120px", height: "120px", margin: "5px"}}>
		<LazyLoadImage
			style={{width: "100%", height: "100%", borderRadius: "4px", objectFit: "cover"}}
			onClick={handleClick}
			src={`${app.apis.mediastorage}${userId}/${imageId}`}
			placeholder=<div style={{width: "100%", height: "100%", borderRadius: "4px", backgroundColor: "var(--thirdColor)"}}></div>
		/>
	</div>;
};