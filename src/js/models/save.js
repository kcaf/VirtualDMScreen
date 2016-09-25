var SaveViewModel = function() {
	var _this = this;
	_this.Running = ko.observable(0);//.extend({ rateLimit: { timeout: 50, method: "notifyWhenChangesStop" } });
	_this.Running.subscribe(function(newValue) {
		if(WORKSPACE.DEBUG) console.log("Saving");
		WORKSPACE.Save();
		_this.Running(0);
	});
	_this.Run = function() {
		_this.Running(_this.Running()+1);
	};
};
