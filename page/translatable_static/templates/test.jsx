import { useImmer } from "use-immer";
import { useState, useEffect, Component, Fragment } from "react";

const { TextInput } = app.components.react;
const { ErrorAlert, WarningAlert } = app.components;
import React from "react";


class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true, error: error };
	}

	componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service
		console.error(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return <ErrorAlert>Компанент выдал сбой!!!<br />{this.state.error.stack}</ErrorAlert>;
		}

		return this.props.children; 
	}
};


export default function TestPage() {
	const [ renderInfo, updateRenderInfo ] = useImmer({component: null, props: {}});
	const [ componentName, setComponentName ] = useState("app.components.WarningAlert");
	const [ componentProps, setComponentProps ] = useState('{\n    "value": "А я помню этот день, может быть, единственный в моей жизни",\n    "children": `Я знаю твой телифон, но никагда не пазваню\n~Nya OwO`,\n    "onInput": console.log,\n    "onClick": showArt /* Возвращает случайную картинку */\n}');
	
	const [ failedProps, setFailedProps ] = useState(false);
	const [ failedName, setFailedName ] = useState(false);
	
	const [ rndArt, setRndArt ] = useState("sillycat.gif");
	function showArt(a) {
		setRndArt(now=>{
			const pic = ['idkwhatisthis.png', 'mimi.png', 'myrbxlavatar.jpg', 'sillycat.gif', 'whythiscrahacteristooбледныйая.png', 'Без названия231.png', 'Без названия235.png'];
			if (pic.includes(a)) return a;
			
			if (now) return null
			else return ItsRandom.choice(pic);
		});
	};
	
	useEffect(function () {
		try {
			let a;
			if (a=eval(componentName)) { updateRenderInfo(x=>{x.component=a}) };
			setFailedName(!a);
		} catch(e) { console.error(e);setFailedName(true) };
	}, [componentName]);
	useEffect(function () {
		try {
			let a;
			if (a=eval("("+componentProps+")")) { updateRenderInfo(x=>{x.props=a}) };
			setFailedProps(!a);
		} catch(e) { console.error(e);setFailedProps(true) };
	}, [componentProps]);
	
	let Component = renderInfo.component;
	return <div className="app-pg-simplecontent">
		<span>
			<b>Тест компонентов</b>
			<br />
			<blockquote>Специальная страница для отладки и рендера React-компонентов. Здесь вы можете указать имя компонента, доступный публично, и его свойства(props). Для отладки евентов используйте DevTools и функцию из класса console. Учти, страница может крашнуться из-за таво, шо ошибки компонентов не отслеживаются</blockquote>
			{ rndArt && <img style={{maxHeight: 600}} src={"/static/img/more/ilove/"+rndArt}/>}
		</span>
		<hr />
		<div>
			<h3>Вводные данные</h3><br/>
			{ !failedProps && !failedName ? <><br/><b>Компонент вводится верна OwO</b></> :
				(<>
					{failedName && <><br /><ErrorAlert>{"Неверное имя компонента или оно не существует >w<"}</ErrorAlert></>}
					{failedProps && <><br /><ErrorAlert>{"Неверно введены свойства, или несуществующая переменная. Свойства должны быть написаны в формате JavaScript-объекта QwQ"}</ErrorAlert></>}
				</>)
			}<br />
			<TextInput defaultValue={componentName} onInput={(e)=>{setComponentName(e.target.value)}} label="Имя компонента"/>
			<textarea defaultValue={componentProps} onInput={(e)=>{setComponentProps(e.target.value)}} placeholder="Свойства компонента (JSON)"/>
		</div>
		<hr />
		<h3>Результат:</h3>
		<br />
		<blockquote>{typeof Component == "function" || (Component && Component.render) ? <ErrorBoundary><Component {...renderInfo.props}/></ErrorBoundary> : "Атвеит отсуствуеат или непонятное значение ;w;"}</blockquote>
		<br /><span>Рандомная информация</span><br />
		<code>{JSON.stringify(renderInfo)}</code>
	</div>
};
/*export function loader(a) {
	const [b, setB] = React.useState(0);
	React.useEffect(()=>{
		const d = setInterval(()=>setB(b=>b+1), 1000);
		return d.close;
	}, []);
	return {r: a, test: b};
};*/