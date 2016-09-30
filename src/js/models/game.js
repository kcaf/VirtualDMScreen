var GameModel = function(name){
	var _this = this;
	_this.Name = ko.observable(name || "");
	_this.Id = ko.pureComputed(function(){
		//return _this.Name().replace(/\s+/g, '-').toLowerCase();
		return "WORKSPACE-" + _this.Name().toLowerCase();
	});

	_this.Name.subscribe(function(oldValue) {
		localStorage.removeItem(_this.Id());
	}, _this, "beforeChange");

	_this.Name.subscribe(function(newValue) {
		WORKSPACE.CurrentGame = _this;
		WORKSPACE.ViewModels.GameViewModel.Save();
		WORKSPACE.Save();
	}, _this);
};

var GameViewModel = function() {
	var _this = this;
	_this.Selector = null;
	_this.Position = ko.observable({Right: 0, Top: 0}).extend({ trackChange: true });
	_this.IsMinimized = ko.observable(false).extend({ trackChange: true });
	_this.GameList = ko.observableArray([new GameModel("tmp")]);
	_this.SelectedGame = ko.observable();
	_this.IsLoaded = ko.observable(false);
	
	_this.Load = function(data) {
		_this.Position({
			Left: data.Position.Left || 0,
			Top: data.Position.Top || 0
		});
		_this.IsMinimized(data.IsMinimized);
		_this.LoadGameList(WORKSPACE.GameList);
		_this.LoadSelectedGame(WORKSPACE.CurrentGame);
	};

	_this.Save = function(){
		if (WORKSPACE.SupportsStorage()) {
			if(WORKSPACE.DEBUG) console.log("Game Model Saving");
			localStorage.setItem("WORKSPACE", JSON.stringify({
				"CurrentGame": ko.toJS( _this.SelectedGame() ),
				"GameList": ko.toJS( _this.GameList() ),
				"MapSlides": ko.toJS( WORKSPACE.ViewModels.CombatViewModel.MapSlides() )
			}));
		}
	};

	_this.LoadGameList = function(list){
		var tmpList = [];
		$.each(list, function(i,v) {
			var game = new GameModel(v.Name);
			tmpList.push(game);
		});
		_this.GameList(tmpList);
	};

	_this.LoadSelectedGame = function(game){
		if (game !== undefined) {
			$.each(_this.GameList(), function(i, v){
				if (v.Name() == game.Name()) {
					_this.SelectedGame(v);
				}
			});
		}
	};

	/*_this.Position.subscribe(function(newValue){
		//WORKSPACE.Save();
	});

	_this.IsMinimized.subscribe(function(newValue){
		//WORKSPACE.Save();
	});

	_this.GameList.subscribe(function(newValue){
		//WORKSPACE.Save();
	});*/

	_this.SelectedGame.subscribe(function(oldValue){
		if(oldValue !== undefined) {
			_this.IsLoaded(true);
		}
	}, null, "beforeChange");

	_this.SelectedGame.subscribe(function(newValue){
		if (_this.IsLoaded()) {
			//WORKSPACE.SaveViewModel.Run();
			_this.Save();

			/**	
			 *	Reload location for new WORKSPACE
			 *	I'd like it to just hotswap the viewmodels, but this was a quick temp fix
			 *	I know it's dirty, oh well
			 *
			 *	@author		#thuglife
			 */
			location.reload();

			//WORKSPACE.CurrentGame = new GameModel(_this.SelectedGame());
			//WORKSPACE.Init();
		}
	});

	_this.AddGame = function(){
		var newgame = new GameModel( "Game" + ( _this.GameList().length + 1 ) );
		_this.GameList.push(newgame);
		_this.SelectedGame(newgame);
	};

	_this.RemoveGame = function(){
		var game = _this.SelectedGame();
		if (WORKSPACE.SupportsStorage() && localStorage.getItem(game.Id()) !== null) {
			localStorage.removeItem(game.Id());
			_this.GameList.remove(game);
		}
	};
};