import React from "react";
//import { useLocationState, useQueryState } from "react-router-use-location-state";

import { useLocationState } from "./../usestatestatic.jsx";

export const path = "/test1";

export default function Test1() {
	//const [ content, setContent ] = useLocationState("content", '🌟 Hello, I am 🌟\n🌟 pretty little cute starcat 🌟\n🌟 and also whitelilac foxcat 🌟\n✨ Hello, I am ✨\n✨ pretty little cute starcat ✨\n✨ and also I want ✨\n✨ I want become best ✨\n\n$[{"id": "image", "url": "/3/mipu.webp"}]');
	const [ content, setContent ] = useLocationState('🌟 Hello, I am 🌟\n🌟 pretty little cute starcat 🌟\n🌟 and also whitelilac foxcat 🌟\n✨ Hello, I am ✨\n✨ pretty little cute starcat ✨\n✨ and also I want ✨\n✨ I want become best ✨\n\n$[{"id": "image", "url": "/3/mipu.webp"}]');
	const [ updatedTimes, setUpdatedTimes ] = useLocationState(0);
	const [ keyValue, setKeyValue ] = useLocationState("Кстати, эту строку можно заменить. Попробуй что-то поставить в window.history.state.usr под свойством 'keyValue'", "keyValue");
	
	
	return <div>
		<h1>Тестирование состояний :D</h1>
		<h3>В этой странице проверяется состояния, которая сохраняется при переходе между страницами<br/>Основная причина использования - это решение проблемы с потерями состояний, даже при переходе через страницы</h3>
		<h3>Страница обновлялась {updatedTimes} раз :D</h3>
		<hr />
		<blockquote>
			<app.components.ContentInput value={content} onChange={e=>{setContent(e.target.value);setUpdatedTimes(t=>t+1)}} valueIsControllable/>
		</blockquote>
		<hr />
		<h3>Здесь состояние должно прикрепляться к самой ветке истории, так и сохраняться при переходе между страницамии<br />Таким образом, содержимое этого текстового редактора должно сохраняться, даже если вы перейдете и вернетесь обратно :3<br /><br />{keyValue}</h3>
	</div>
};