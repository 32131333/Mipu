import React from "react";
const { useEffect, useState } = React;
import { useImmer } from "use-immer";
import { Link, NavLink } from "react-router";


const st = <style>{`
.center > * > *:first {
	font-weight: 600;
}

.center {
	padding: 5px;
	display: flex;
	height: 100%;
	width: 100%;
	gap: 15px;
	flex-direction: column;
}
`}</style>;


function ChatCard({children}) {
	return <NavLink to={String(children.id)} className={["app-centercard", children.unread > 0 && "unread"].filter(Boolean).join(" ")}>
		<app.components.Avatar userId={children.id} userAvatar={{media: children.icon}}/>
		<div>
			<div id="n"><span>{children.name}</span></div>
			<span className="app-notmaintext">{
				[children.lastMessage, children.lastMessageDate && app.functions.ago(children.lastMessageDate)]
					.filter(Boolean).join(" ● ")
			}</span>
		</div>
		{children.unread > 0 && <div></div>}
	</NavLink>;
};

export const path = "c/:page?";
export default function Center() {
	const { me } = app.reactstates.useInformationAboutMe();
	
	// ПРОТОТИП
	const [ chats, updateChats ] = useImmer([
		{
			id: 8, icon: "something5",
			name: "test",
			unread: 0, lastMessage: "Oh, hi?",
			lastMessageDate: 1777123734344
		},
		{
			id: 7, icon: "something4",
			name: "Chat",
			unread: 0, lastMessage: "What with you?",
			lastMessageDate: 1777123734345
		},
		{
			id: 6, icon: "something3",
			name: "12312312312",
			unread: 0, lastMessage: "You feel bad?",
			lastMessageDate: 1777123734344
		},
		{
			id: 5, icon: "something2",
			name: "...",
			unread: 0, lastMessage: null,
			lastMessageDate: null
		},
		{
			id: 4, icon: "something1",
			name: "TEST",
			unread: 0, lastMessage: "Don't worry",
			lastMessageDate: null
		},
		{
			id: 1, icon: "something",
			name: "mipu✨",
			unread: 1, lastMessage: "i love you",
			lastMessageDate: Date.now()
		}
	]);
	const [ data, updateData ] = useImmer({
		activityAlert: {
			unreaded: 0
		}
	});
	
	return <>
		{st}
		<div className="center">
			<div>
				<Link to="." className="app-centercard">
					<app.components.Avatar />
					<div>
						<span id="n">activity</span>
					</div>
				</Link>
			</div>
			<div>
				<span>chats</span>
				<div>
					{chats.length < 0 && <span>{"empty :<"}</span>}
					{chats.length > 0 && chats.map((x,i)=><ChatCard key={i}>{x}</ChatCard>)}
				</div>
			</div>
		</div>
	</>;
};