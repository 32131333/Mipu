import { Link, useParams } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";
import { useImmer } from "use-immer";

export const path = "post/:id";
export default function PostPage() {
	const { id } = useParams();
	
	const [data, updateData] = useImmer({});
	const [loading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	
	app.reactstates.useListen("posts", data.id);
	
	useEffect(function () {
		async function resp() {
			const response = await app.f.get(`posts/${String(id)}`);
			if (typeof response == "string" || response.status == "error") {
				updateData(response.content);
				setError(typeof response == "string" ? response : response.content.unvaliable);
			} else {
				updateData(response.content);
			};
			setIsLoading(false);
		};
		resp();
	}, [id]);
	
	if (loading) {
		return <app.components.LoadingPage/>;
	};
	
	return <>
		<style>{`
			.root > .colorfill {
				border-radius: 15px;
				padding: 25px;
				background-color: var(--transparencyColor);
			}
			.root {
				background: none;
				border: none;
				padding: 0;
				flex-direction: column;
				align-items: center;
				align-content: center;
				width: 100%;
				padding-block: 20px;
				display: flex;
			}
			.root > * {
				width: 90%;
			}
			
			@media (max-width: 700px) {
				.root > .colorfill {
					padding: 0;
					border-radius: 0;
					padding-inline: 5px;
				}
				.root {
					padding-block: 0;
				}
				.root > * {
					width: 100%;
				}
			}
		`}</style>
		<app.components.WebpageTitle>#page.post.title#{data.author ? " • "+(data.author.name || "@"+(data.author.tag||"-")) : ""}</app.components.WebpageTitle>
		<app.components.UserBackgroundStyleSetting user={data.author}/>
		<div className="root">
			<div className="colorfill">
				<app.structures.Post>{data}</app.structures.Post>
			</div>
			<div style={{marginTop: 10}} className="colorfill">
				<app.structures.CommentList contentType="posts" contentId={id}/>
			</div>
		</div>
	</>;
};