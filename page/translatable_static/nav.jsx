import { NavLink } from "react-router";
import React from "react";

function NavButtonTemplate({to, svg, content, text, ...val}) {
	function d() { return {__html: app.___svgs[svg] ?? svgs["x0"]} };
	return (
		<NavLink {...val} to={to}>
			{ svg ? <div dangerouslySetInnerHTML={d()}></div> : <div>{content}</div> /* Оставлю старую обработку с svg */ }
			<span>{text}</span>
		</NavLink>
	);
};
function Nav(val) {
	return (
		<div {...val} className={`mobile-header${val.className ? " "+val.className : ""}`}>
			<NavButtonTemplate to="/" svg="home" text="Main" />
			<NavButtonTemplate to="helloworld" svg="home" text="HelloWorld" />
			<NavButtonTemplate to="dd" svg="x0" text="test" />
			<NavButtonTemplate to="error/500" svg="x0" text="dd" />
		</div>
	);
};

function Nav1({ notifyCount, setNotifyCount }) {
	const { me } = app.reactstates.useInformationAboutMe();
	return (
		<div className="mobile-header">
			<NavButtonTemplate to="/feed" content={ <app.components.react.FixedSVG className="alphaicon d" children={app.___svgs.sparks}/> } text="#navbar.feed#" />
			<NavButtonTemplate to="/" svg="home" text="#navbar.posts#" />
			<NavButtonTemplate style={{ transform: "scale(1.1)" }} to="/create" content={ <app.components.react.FixedSVG className="alphaicon d" children={app.___svgs.new1}/> } text="#navbar.create#" />
			<NavButtonTemplate to="/notify" 
				content={ <>
					{ notifyCount > 0 && <span className="app-button-notify-count">{notifyCount}</span> }
					<app.components.react.FixedSVG className="alphaicon fill d" children={app.___svgs.idle_bell}/>
				</> } 
				text="#navbar.notify#" />
			<NavButtonTemplate to="/you" content={ <app.components.Avatar user={me} /> } text="#navbar.you#" />
		</div>
	);
};

export default Nav1;