var PlayerModel = function(name,ac,pclass,passive,level,xp){
	var _this = this;
	_this.ModelType = "Player";
	_this.Name = ko.observable(name || "").extend({ trackChange: true });
	_this.AC = ko.observable(ac || "").extend({ trackChange: true });
	_this.Class = ko.observable(pclass || "").extend({ trackChange: true });
	_this.Passive = ko.observable(passive || "").extend({ trackChange: true });
	_this.Level = ko.observable(level || "").extend({ trackChange: true });
	_this.XP = ko.observable(xp || "").extend({ trackChange: true });
	
	/*ko.pureComputed(function() {
		_this.Name();
		_this.AC();
		_this.Class();
		_this.Lang();
		_this.Level();
		_this.XP();
		WORKSPACE.SaveViewModel.Run();
	});*/
};

var PlayersViewModel = function() {
	var _this = this;
	_this.Selector = null;
	_this.PlayersList = ko.observableArray().extend({ trackChange: true });
	_this.Player = new PlayerModel();
	_this.Position = ko.observable({Left: 0, Top: 0}).extend({ trackChange: true });
	_this.IsMinimized = ko.observable(true).extend({ trackChange: true });

	_this.SendCombat = function() {
		$.each(_this.PlayersList(), function(i,v) {
			WORKSPACE.ViewModels.CombatViewModel.AddCombatant(ko.toJS(v));
		});
	};
	
	_this.AddPlayer = function() {
		_this.PlayersList.push(new PlayerModel());
	};
	
	_this.RemovePlayer = function(player) {
		_this.PlayersList.remove(player);
	};
	
	_this.Load = function(data) {
		_this.Position({
			Left: data.Position.Left || 0,
			Top: data.Position.Top || 0
		});
		_this.IsMinimized(data.IsMinimized);
		var tmpList = [];
		
		if(data.PlayersList.length > 0){
			for(i=0; i<data.PlayersList.length; i++){
				tmpList.push(new PlayerModel(
					data.PlayersList[i].Name,
					data.PlayersList[i].AC,
					data.PlayersList[i].Class,
					data.PlayersList[i].Passive,
					data.PlayersList[i].Level,
					data.PlayersList[i].XP
				));
			}
			
			_this.PlayersList(tmpList);
		}
	};
	
	/*ko.pureComputed(function() {
		_this.PlayersList();
		_this.Position();
		_this.IsMinimized();
		WORKSPACE.SaveViewModel.Run();
	});*/
};