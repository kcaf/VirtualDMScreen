MapViewer = function(){
	_this = this;
	_this.ViewModel = null;
	_this.IsBuilding = false;
	_this.Hash = null;
	_this.HashCompare = null;
	_this.MapSelector = "#CombatViewModel";
	_this.Peer = null;

	_this.Connect = function(id) {
		var conn = _this.Peer.connect(id);
		conn.on('open', function() {
			$("#connect").dialog("close");
			
			conn.on('data', function(json) {
		    	_this.BuildMap(json);
		    });

		    conn.on('close', function() {
				$("#connect").dialog("open");
			});
		});
		setTimeout(function(){
			if(!conn.open){
				$("#connect").dialog("open");
			}
		}, 10000);
	};

	_this.BuildMap = function(json) {
		if(!_this.IsBuilding){
			_this.IsBuilding = true;
			try {
				var combatObj = JSON.parse(json);
				if(combatObj) {
					_this.ViewModel.Load(combatObj);
					WORKSPACE.GridMap.setZoom(combatObj.GridZoom || 1);
					
					if(combatObj.PanTo){
						WORKSPACE.GridMap.panTo(combatObj.PanTo || [0,0]);
					}

					if(!combatObj.ShowDarkness) {
						var canvas = $("#grid-light")[0],
							ctx = canvas.getContext('2d');
						ctx.clearRect(0, 0, canvas.width, canvas.height);
					}

					if(!combatObj.ShowFog) {
						var canvas = $("#grid-fog")[0],
							ctx = canvas.getContext('2d');
						ctx.clearRect(0, 0, canvas.width, canvas.height);
					} else {
						WORKSPACE.Helpers.DrawFog();
					}
				}
			} catch(e) {
				console.log(e);
			}
			_this.IsBuilding = false;
		}
	};

	_this.Init = function() {
		_this.Dialog = $("#connect").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Connect: function() {
				  _this.Connect($("#connid").val());
				  $(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});
		WORKSPACE.ViewModels.CombatViewModel = _this.ViewModel = new CombatViewModel();
		ko.applyBindings(_this.ViewModel, $(_this.MapSelector)[0]);
		_this.Peer = new Peer(null, WORKSPACE.PeerOptions);

		_this.Peer.on('open', function(id) {
			_this.Dialog.dialog("open");
		});
	};
};

$(function() {
	WORKSPACE.MAP = new MapViewer();
	WORKSPACE.Shim();
	WORKSPACE.IsLoaded = true;
	WORKSPACE.MAP.Init();
});