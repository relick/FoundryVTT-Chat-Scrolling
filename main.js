Hooks.once("init", () => {
	// Override scrollBottom
	ChatLog.prototype.scrollBottom = function(force = true) {
		const el = this.element;
		const log = el.length ? el[0].querySelector("#chat-log") : null;
		if ( log )
		{
			// If more than half chat log height above the actual bottom, don't do the scroll.
			const propOfClientHeightScrolled = (log.scrollHeight - log.clientHeight - log.scrollTop) / log.clientHeight;
			if ( force || propOfClientHeightScrolled <= 0.5 ) log.scrollTop = log.scrollHeight;
		}
	}

	// We default force to true so that when render functions use it on startup we start at the bottom.
	// But for individual messages we don't want to do that.
	// This is exactly the same as postOne except
	// this.scrollBottom();
	// has become => this.scrollBottom(false);
	ChatLog.prototype.postOne = async function(message, notify=false) {
		if ( !message.visible ) return;
		if ( !this._lastId ) this._lastId = message.id; // Ensure that new messages don't result in batched scrolling
		return message.render().then(html => {
			this.element.find("#chat-log").append(html);
			this.scrollBottom(false);
			if ( notify ) this.notify(message);
		});
	}
});