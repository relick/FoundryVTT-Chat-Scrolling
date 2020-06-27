class ScrollableChatLog extends ChatLog
{
	_getLogElement()
	{
		const el = this.element;
		const log = el.length ? el[0].querySelector("#chat-log") : null;
		return log;
	}

	_shouldScrollToBottom(log)
	{
		// If more than half chat log height above the actual bottom, don't do the scroll.
		const propOfClientHeightScrolled = (log.scrollHeight - log.clientHeight - log.scrollTop) / log.clientHeight;
		return propOfClientHeightScrolled <= 0.5;
	}

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			originalClass: ChatLog
		});
	}
	
	/** @override */
	scrollBottom(force = false)
	{
		const log = this._getLogElement();
		if ( log )
		{
			if ( force || this._shouldScrollToBottom(log) ) log.scrollTop = log.scrollHeight;
		}
	}

	// Posting messages should force a scroll if we're within range of the bottom, in the case that a new message is so large it is bigger than half the box.
	/** @override */
	async postOne(...args) {
		const log = this._getLogElement();
		const shouldForceScroll = log ? this._shouldScrollToBottom(log) : false;
		await super.postOne(...args);
		this.scrollBottom(shouldForceScroll);
	}

	// When we first render, we should force a scroll.
	/** @override */
	async _render(...args) {
		if (this.rendered) return; // Never re-render the Chat Log itself, only it's contents
		await super._render(...args);
		this.scrollBottom(true);
	}
};

Hooks.once("init", () => {
	CONFIG.ui.chat = ScrollableChatLog;
});

Hooks.on('getScrollableChatLogEntryContext', (html, entryOptions) => {
	Hooks.call('getChatLogEntryContext', html, entryOptions);
});

Hooks.on('renderScrollableChatLog', (app, html, data) => {
	Hooks.call('renderChatLog', app, html, data);
});