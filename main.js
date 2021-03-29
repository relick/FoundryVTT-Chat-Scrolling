"use strict";

import { libWrapper } from "./modules/libWrapperShim.js";

const getLogElement = (chatLog) =>
{
	const el = chatLog.element;
	const log = el.length ? el[0].querySelector("#chat-log") : null;
	return log;
};

const shouldScrollToBottom = (log) =>
{
	// If more than half chat log height above the actual bottom, don't do the scroll.
	const propOfClientHeightScrolled = (log.scrollHeight - log.clientHeight - log.scrollTop) / log.clientHeight;
	return propOfClientHeightScrolled <= 0.5;
};

Hooks.on("setup", () => {
	libWrapper.register(
		"chat-scrolling", 'ChatLog.prototype.scrollBottom',
		function(force = false) {
			const log = getLogElement(this);
			if ( log )
			{
				if ( force || shouldScrollToBottom(log) ) log.scrollTop = log.scrollHeight;
			}
		},
		'OVERRIDE'
	);

	// Posting messages should force a scroll if we're within range of the bottom, in the case that a new message is so large it is bigger than half the box.
	libWrapper.register(
		"chat-scrolling", 'ChatLog.prototype.postOne',
		async function(superpostOne, ...args) {
			const log = getLogElement(this);
			const shouldForceScroll = log ? shouldScrollToBottom(log) : false;
			await superpostOne(...args);
			this.scrollBottom(shouldForceScroll);
		},
		'WRAPPER'
	);

	// When we first render, we should force a scroll.
	libWrapper.register(
		"chat-scrolling", 'ChatLog.prototype._render',
		async function(super_render, ...args) {
			const rendered = this.rendered;
			await super_render(...args);
			if (rendered) return; // Never re-render the Chat Log itself, only it's contents
			this.scrollBottom(true);
		},
		'WRAPPER'
	);
});