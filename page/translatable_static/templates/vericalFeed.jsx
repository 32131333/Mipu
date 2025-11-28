import { Link, useParams, useLocation } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";
import { useImmer } from "use-immer";
//import { useVirtualizer } from "@tanstack/react-virtual";

import MipuAdvPost from "./../miposts.jsx";


export const path = "/_feed";

export default function VericalFeed() {
	const navigation = useLocation(); // Найдется применение, возможно. Например, для рендера оффлайн информации из state
	const pgRef = useRef(null);
	
	const [ feedData, updateFeedData ] = useImmer([]);
	const [ feedState, updateFeedState ] = useImmer({activeIndex: 0});
	
	//const containerSize = useRef(0);
	
	useEffect(function () {
		if (navigation.state) {
			console.log("Rendering data :D");
			try {
				updateFeedData(JSON.parse(navigation.state));
			} catch(e) {
				console.error(e);
			};
		};
	}, [ navigation ]);
	
	/*useEffect(function () {
		function onResize() {
			containerSize.current = pgRef.current?.clientHeight ?? window.innerHeight;
		};
		window.addEventListener("resize", onResize);
		onResize();
		return ()=>window.removeEventListener("resize", onResize);
	}, []);*/
	
	const rowVirtualizer = useVirtualizer({
		count: feedData.length,
		getScrollElement: () => pgRef.current,
		estimateSize: () => pgRef.current?.clientHeight ?? window.innerHeight/*containerSize.current ?? Number(getComputedStyle(pgRef.current).height.slice(0, -2))/* window.innerHeight */,
		overscan: 1,
	});
	
	
	
	const items = rowVirtualizer.getVirtualItems();
	
	return <div ref={pgRef} className="app-pg-verticalFeed List">
		<div
			style={{
				height: `${rowVirtualizer.getTotalSize()}px`,
				position: "relative",
				width: "100%",
			}}
		>
			{items.map((virtualRow) => (
				<div
					key={virtualRow.key}
					data-index={virtualRow.index}
					ref={virtualRow.measureElement}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						transform: `translateY(${virtualRow.start}px)`,
						height: `${virtualRow.size}px`
					}}
					className={virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"}
				>
					<MipuAdvPost
						children={feedData[virtualRow.index]}
						active={feedState.activeIndex === virtualRow.index}
					/>
				</div>
			))}
		</div>
	</div>;
};
