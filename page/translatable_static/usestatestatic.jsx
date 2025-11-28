import { useLocation } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";
import { useImmer } from "use-immer";


function recoveryState(key) {
	const usr = window.history.state.usr ?? ( window.history.state.usr = {} );
	
	const states = usr.___useStaticStates ?? ( usr.___useStaticStates = [] );
	
	let state;
	
	let keyName = key ?? `indx${usedTimes}`;
	let keyValue = usr[keyName] ?? null;
	
	if (!states.find(x=>x.key == keyName)) {
		states.push(state = {key: keyName, value: keyValue});
		window.history.replaceState({...window.history.state}, "");
	} else {
		state = states.find(x=>x.key == keyName);
	};
	return state;
};
let usedTimes = 0;

export function useLocationState(defaultValue, keyName, isImmer) {
	const location = useLocation();
		
	//const [ key, setKey ] = useState();
	const keyRef = useRef();
	const firstlyTicked = useRef(false); // Предотвращает перезапись существующей переменной на значение по умолчанию
	
	const [ state, setState ] = (!isImmer ? useState : useImmer)(()=>{
		const st = recoveryState(keyName);
		keyRef.current = st.key;
		
		usedTimes += 1;
		
		
		return (
			st.value
			??
			(typeof defaultValue == "function" ? defaultValue() : defaultValue)
		);
	});
	
	
	
	useEffect(function () {
		if (firstlyTicked.current) {
			const st = recoveryState(keyName);
			if (!st.key == keyRef.current) keyRef.current = st.key;
		
			setState(st.value ?? (typeof defaultValue == "function" ? defaultValue() : defaultValue));
		};
	}, [location, keyName]);
	
	useEffect(function () {
		return ()=>{ usedTimes -= 1; firstlyTicked.current = false };
	}, []);
	
	useEffect(function () {
		const saved = recoveryState(keyRef.current);
		if (state !== defaultValue || firstlyTicked.current) {
			saved.value = state;
			window.history.replaceState({...window.history.state}, "");
		};
		
		firstlyTicked.current = true;
	}, [state]);
	
	return [ state, setState ];
};
export const useLocationImmer = (a,b) => useLocationState(a,b,true);