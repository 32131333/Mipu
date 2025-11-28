// Импортируем floating-ui
import { computePosition, autoUpdate, shift, flip, arrow } from "@floating-ui/dom";

// Поддержка React-компонентов в рендере
import React from "react";
import ReactDOM from "react-dom/client";

// Собственнописанный модуль с таймером. Он берет на себя стандартный setTimeout и clearTimeout, чтобы не заморачиваться с отсчетом и отменой таймера
// Пока что он только взаимодействует с setTimeout. Ну и дает знать, что работает ли таймер, или нет
// Повторный вызов таймера приводит к новому отсчету и отмену прошлого timeout
import Timer from "./../static/timer.js";

// Создание самого tooltip-контейнера
const tooltipElement = document.createElement("div");
tooltipElement.classList.add("app-tooltip", "floating");
document.body.appendChild(tooltipElement);
tooltipElement.hidden = true;

const tooltipContent = document.createElement("div");
tooltipElement.appendChild(tooltipContent);

const tooltipArrow = document.createElement("div");
tooltipArrow.id = "arrow";
tooltipElement.appendChild(tooltipArrow);

// Базовые функции

// Создание tooltip
app.createTooltip = async function (referenceElement) {
	if (app.createTooltip.isCreating || app.createTooltip.renderedOn == referenceElement) return; // Создаем дебаунс. Но и не даем повторять повторному пересозданию на том же референсе
	app.createTooltip.isCreating = true;
	await app.destroyTooltip();
	
	const reactProps = app.functions.getReactDOMProps(referenceElement); // Даже если это не ReactDOM элемент, вернется null
	
	let originalTooltip = 
		reactProps && reactProps.tooltip ? 
			reactProps.tooltip
			:
			referenceElement.getAttribute("tooltip");
	
	if (!originalTooltip) {
		// Нету тултипа, нечего рендерить
		app.createTooltip.isCreating = false;
		return;
	}; 
	
	if (typeof originalTooltip == "function") originalTooltip = await originalTooltip(); // В целом, await универсален и может даже ждать то, что не является промисом
	
	// Рендерим
	switch(typeof originalTooltip) {
		case "object":
			if (originalTooltip.type) {
				// Возможно, мы имеем дело с React-компонентом
				// Единтсветнная известная проблема - это то, что рендер происходит позже появления самого тултипа
				app.createTooltip.ReactDOM = ReactDOM.createRoot(tooltipContent);
				app.createTooltip.ReactDOM.render(originalTooltip);
			} else {
				// Обращаем в текстовый JSON
				tooltipContent.innerText = JSON.stringify(originalTooltip);
			};
			break;
		default:
			tooltipContent.innerText = String(originalTooltip)
	};
	
	// Создаем floating(поппер)
	app.createTooltip.cancelFloating = autoUpdate(referenceElement, tooltipElement, () => {
		computePosition(referenceElement, tooltipElement, {
			placement: "top",
			middleware: [
				shift(),
				flip(),
				arrow({element: tooltipArrow, padding: 8})
			],
		}).then(({x, y, middlewareData, placement}) => {
			Object.assign(tooltipElement.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
			
			if (middlewareData.arrow) {
				const {x, y} = middlewareData.arrow;
				
				Object.assign(tooltipArrow.style, {
					left: x != null ? `${x}px` : '',
					top: y != null ? `${y}px` : '',
				});
				
				tooltipArrow.setAttribute("placement", placement);
			};
		});
	});
	tooltipElement.hidden = false;
	
	app.createTooltip.renderedOn = referenceElement;
	app.createTooltip.isCreating = false;
};
app.createTooltip.isCreating = false;

// Уничтожение tooltip
app.destroyTooltip = async function () {
	if (app.createTooltip.ReactDOM) {
		app.createTooltip.ReactDOM.unmount();
	};
	if (app.createTooltip.cancelFloating) {
		app.createTooltip.cancelFloating();
	};
	app.createTooltip.ReactDOM = null;
	app.createTooltip.cancelFloating = null;
	
	app.createTooltip.renderedOn = null;
	
	tooltipElement.hidden = true;
	tooltipArrow.removeAttribute("placement");
};


// Йа использую таймер для более сглаженного убирания тултипа
app.createTooltip.destroy = new Timer(500, app.destroyTooltip);
app.createTooltip.wait = new Timer(500);


// Автоматическое управление бла бла бла
document.body.addEventListener("mouseover", async function (event) {
	if (app.createTooltip.isCreating) return;
	app.createTooltip.wait.cancel();
	
	const closest = event.target.closest("[tooltip]");
	if (closest) {
		app.createTooltip.destroy.cancel();
		
		const ready = await new Promise(r=>app.createTooltip.wait.start(r,r));
		if (ready) app.createTooltip(closest);
		// Ждем ответа. Если ожидание не отменено, вызывается тултип
	};
});
document.body.addEventListener("mouseout", async function (event) {
	if (app.createTooltip.isCreating || !app.createTooltip.renderedOn) return;
	
	if (!app.createTooltip.destroy.working && !tooltipElement.contains(event.relatedTarget) && !app.createTooltip.renderedOn.contains(event.relatedTarget)) {
		app.createTooltip.destroy.start();
	};
});