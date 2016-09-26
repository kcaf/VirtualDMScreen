MapViewer = function(){
	_this = this;
	_this.ViewModel = null;
	_this.FindLatestTimer = null;
	_this.IsBuilding = false;
	_this.Hash = null;
	_this.LightsInterval = null;
	_this.MapSelector = "#CombatViewModel";

	_this.FindLatest = function() {
		var hash = localStorage.getItem("MAPVIEW-Hash");
		if(hash !== null && _this.Hash != hash){
			//console.log("Update Found", hash);
			_this.BuildMap(hash);
		}
	};

	_this.BuildMap = function(hash) {
		if(!_this.IsBuilding){
			//console.log("Building");
			_this.IsBuilding = true;
			try {
				var combatObj = JSON.parse(localStorage.getItem("MAPVIEW-ViewModel"));
				if(combatObj) {
					_this.ViewModel.Load(combatObj);
					WORKSPACE.GridMap.setZoom(combatObj.GridZoom || 1);
					WORKSPACE.GridMap.panTo(combatObj.GridCenter || [0,0]);

					if(WORKSPACE.ViewModels.CombatViewModel.ShowDarkness()) {
						_this.LightsInterval = setInterval( WORKSPACE.Helpers.DrawLights, 50 );
					}
					else{
						clearInterval(_this.LightsInterval);
						var canvas = $("#grid-light"),
							ctx = canvas[0].getContext("2d");

						ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
					}
				}
			} catch(e) {
				console.log(e);
			}
			_this.Hash = hash;
			_this.IsBuilding = false;
		}
	};

	_this.Init = function() {
		WORKSPACE.ViewModels.CombatViewModel = _this.ViewModel = new CombatViewModel();
		ko.applyBindings(_this.ViewModel, $(_this.MapSelector)[0]);
		_this.FindLatestTimer = setInterval(_this.FindLatest, 25);
	};
};

$(function() {
	var MAP = new MapViewer();
	WORKSPACE.Shim();
	WORKSPACE.IsLoaded = true;
	MAP.Init();
});