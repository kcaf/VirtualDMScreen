var CombatantModel = function(){
	var _this = this;
	_this.Id = ko.observable(null).extend({ trackChange: true });
	_this.ModelType = ko.observable().extend({ trackChange: true });
	_this.Size = ko.observable().extend({ trackChange: true });
	_this.Name = ko.observable().extend({ trackChange: true });
	_this.Initiative = ko.observable().extend({ trackChange: true });
	_this.AC = ko.observable().extend({ trackChange: true });
	_this.HP = ko.observable().extend({ trackChange: true });
	_this.Skip = ko.observable().extend({ trackChange: true });
	_this.Effects = ko.observableArray().extend({ trackChange: true });
	_this.Level = ko.observable().extend({ trackChange: true });
	_this.CR = ko.observable().extend({ trackChange: true });
	_this.MaxHP = ko.observable().extend({ trackChange: true });
	_this.LatLng = ko.observable().extend({ trackChange: true });
	_this.Token = ko.observable(null).extend({ trackChange: true });
	_this.Angle = ko.observable(0).extend({ trackChange: true });
	_this.Invisible = ko.observable(false).extend({ trackChange: true });
	_this.IsSelected = ko.observable(false).extend({ trackChange: true });

	_this.Name.subscribe(function(newValue) {
		$.each(WORKSPACE.ViewModels.CombatViewModel.CustomIcons(), function(z, x) {
			if(x.name == _this.Name()) {
				_this.Token(x.token);
				WORKSPACE.ViewModels.CombatViewModel.LoadTokens();
			}
		});
	});

	_this.Invisible.subscribe(function(newValue) {
		WORKSPACE.ViewModels.CombatViewModel.LoadTokens();
	});

	_this.PickToken = function(data, event) {
		var result = prompt("Token URL", ""),
			combatvm = WORKSPACE.ViewModels.CombatViewModel;
		if(result){
			_this.Token(result);
			$.each(combatvm.CustomIcons(), function(z, x) {
				if(x.name && x.name == _this.Name()){
					combatvm.CustomIcons.remove(x);
				}
			});
			combatvm.CustomIcons.push({ name: _this.Name(), token: _this.Token() });
			combatvm.LoadTokens();
		}
	};

	_this.ViewCombatant = function(data, event) {
		if(_this.Id() !== null && _this.ModelType() == "NPC") {
			WORKSPACE.Helpers.ViewNPC(_this.Id(), event);
		}
	};

	_this.TokenClasses = function(outline) {
		return (_this.ModelType() ? _this.ModelType().toLowerCase() + " " : "unknown ") +
			(outline ? "outline " + _this.ModelType() + " " : "") + 
			(_this.Invisible() ? "invisible " : "") + 
			(_this.IsDead() ? "dead " : "") + 
			(_this.IsSelected() ? "blink " : "");
	};

	_this.IsDead = ko.pureComputed(function() {
		return _this.HP() <= 0;
	});

	_this.RowClass = ko.pureComputed(function() {
		return (_this.ModelType() ? _this.ModelType().toLowerCase() : "unknown") + "-row " + 
			(_this.IsDead() ? "dead " : "") + 
			("size-" + _this.Size()) + " " +
			(_this.IsSelected() ? "selected " : "");
	});

	_this.NameShort = ko.pureComputed(function() {
		if(_this.Name() && _this.Name().length)
			return _this.Name().slice(0,1);
		else
			return _this.Name();
	});

	_this.XP = ko.pureComputed(function() {
		var cr = parseInt(_this.CR());
		if(cr >= 0)
			return WORKSPACE.XPPerCR[_this.CR()];
		else
			return 0;
	});

	_this.ACBasic = ko.pureComputed({
		read: function () {
			if(!_this.AC()) return "";
			return _this.AC().split(" ")[0];
		},
		write: function (newValue) {
			_this.AC(newValue);
		},
		owner: _this
	});

	_this.MaxHPText = ko.pureComputed(function() {
		if(!_this.MaxHP()) return _this.HP();
		return "Max: " + _this.MaxHP();
	});

	_this.LevelAndCR = ko.pureComputed({
		read: function() {
			var val;
			if(_this.ModelType() == "Player") val = _this.Level(); else
			if(_this.ModelType() == "NPC") val = _this.CR(); else 
			val = _this.CR();
			return val;
		},
		write: function(newValue) {
			if(_this.ModelType() == "Player") _this.Level(newValue); else
			if(_this.ModelType() == "NPC") _this.CR(newValue); else 
			_this.CR(newValue);
		}
	});

	_this.HP.subscribe(function(newValue) {
		WORKSPACE.ViewModels.CombatViewModel.LoadTokens();
	});

	_this.CalculateHP = ko.pureComputed({
		read: function() {
			return _this.HP();
		},
		write: function(newValue) {
			var total= 0, 
				matches = newValue.match(/[+\-]*(\.\d+|\d+(\.\d+)?)/g) || [];
			while(matches.length){
				total+= parseFloat(matches.shift());
			}
			if (!_this.MaxHP()) _this.MaxHP(_this.HP());
			_this.HP(newValue === "" ? newValue : total);
		},
		owner: _this
	});
	
	_this.Load = function(data){
		if (data.ModelType == "Player") {
			if(!WORKSPACE.VIEW) _this.Initiative(data.Initiative);
			_this.HP(data.HP);
			_this.Level(data.Level);
			_this.Size("M");
			_this.Invisible(data.Invisible);
		} else if (data.ModelType == "NPC") {
			_this.Id(data.Id);
			_this.Size(data.Size);
			_this.Invisible(data.Invisible !== false);
			_this.CR(data.CR);
			if(!WORKSPACE.VIEW) {
				var init = data.Initiative || WORKSPACE.Helpers.Roll( 1,20 ) + parseInt( data.DEXMOD );
				_this.Initiative( init >= 0 ? init : 0 );
			}

			if(!WORKSPACE.VIEW) {
				var hpArr = ("" + data.HP).split("("),
					rollArr = [],
					hp = 0;

				if (typeof hpArr == "object" && hpArr.length > 1) {
					hpArr = hpArr[1].split(")");
					rollArr = hpArr[0].match(/\d+d\d+/g);
					rollSplit = rollArr[0].split("d");
					for(i=0; i<rollSplit[0]; i++){
						hp += parseInt(WORKSPACE.Helpers.Roll( 1,rollSplit[1]) );
					}
					hp += parseInt(hpArr[0].slice(rollArr[0].length)) || 0;
				} else {
					hp = parseInt(hpArr[0]);
				}

				var dataHPSplit = ("" + data.HP).split("d");
				if(typeof dataHPSplit == "object" && dataHPSplit.length > 1) 
					_this.HP(hp);
				else
					_this.HP(data.HP || hp);
			} else {
				_this.HP(data.HP);
			}
		} else {
			_this.Size("M");
			_this.CR(data.CR);
			_this.Invisible(data.Invisible !== false);
			_this.HP(data.HP);
		}

		_this.MaxHP(data.MaxHP || null);
		_this.ModelType(data.ModelType);
		_this.Name(data.Name || "");
		_this.AC(data.AC);
		_this.Skip(data.Skip || false);
		_this.Effects(data.Effects || []);
		_this.LatLng(data.LatLng || null);
		_this.Token(data.Token || null);
		_this.Angle(data.Angle || 0);
		_this.IsSelected(data.IsSelected || false);
	};

	_this.AddEffect = function(){
		
	};
};

CombatantModel.prototype.toJSON = function() {
    var copy = ko.toJS(this);
    delete copy.CalculateHP;
    delete copy.LevelAndCR;
    delete copy.MaxHPText;
    delete copy.ACBasic;
    delete copy.XP;
    delete copy.NameShort;
    delete copy.RowClass;
    return copy;
};

var CombatViewModel = function() {
	var _this = this;
	_this.Selector = null;
	_this.Interval = null;
	_this.ActiveTab = ko.observable(0).extend({ trackChange: true });
	_this.CombatantList = ko.observableArray().extend({ trackChange: true });
	/*_this.GridTokens = ko.observableArray();*/
	_this.Combatant = new CombatantModel();
	_this.Position = ko.observable({Left: 0, Top: 0}).extend({ trackChange: true });
	_this.IsMinimized = ko.observable(true).extend({ trackChange: true });
	_this.GridWidth = ko.observable();
	_this.MapSlides = ko.observableArray().extend({ trackChange: true });
	_this.MapToAdd = ko.observable();
	_this.ShowGridLines = ko.observable(true).extend({ trackChange: true });
	_this.AltGridColor = ko.observable(false).extend({ trackChange: true });
	_this.ActiveMap = ko.observable("").extend({ trackChange: true });
	_this.ShowOutlines = ko.observable(false).extend({ trackChange: true });
	_this.CustomIcons = ko.observableArray().extend({ trackChange: true });
	_this.TokenScale = ko.observable(1).extend({ trackChange: true });
	_this.TransmitMap = ko.observable(false).extend({ trackChange: true });
	_this.GridCenter = ko.observable([0,0]).extend({ trackChange: true });
	_this.GridZoom = ko.observable(1).extend({ trackChange: true });
	_this.PlayerZoom = ko.observable(1).extend({ trackChange: true });
	_this.ShowDarkness = ko.observable(false).extend({ trackChange: true });
	_this.ShowFog = ko.observable(false).extend({ trackChange: true });
	_this.BackgroundColor = ko.observable("#ddd").extend({ trackChange: true });
	_this.GridColor = ko.observable("#000").extend({ trackChange: true });
	_this.DarknessColor = ko.observable("rgba(0,0,0)").extend({ trackChange: true });
	_this.FogColor = ko.observable("rgb(0,0,0)").extend({ trackChange: true });
	_this.EraseSize = ko.observable(100).extend({ trackChange: true });
	_this.PageSize = ko.observable(8);
	_this.PageIndex = ko.observable(0);

	_this.CompressModel = function() {
		var combatant,
			combat = {
				ErasePoints: WORKSPACE.ErasePoints,
				FogColor: _this.FogColor(),
				DarknessColor: _this.DarknessColor(),
				GridColor: _this.GridColor(),
				BackgroundColor: _this.BackgroundColor(),
				ShowGridLines: _this.ShowGridLines(),
				ActiveMap: _this.ActiveMap(),
				ShowOutlines: _this.ShowOutlines(),
				TokenScale: _this.TokenScale(),
				GridCenter: _this.GridCenter(),
				GridZoom: _this.PlayerZoom(),
				ShowDarkness: _this.ShowDarkness(),
				ShowFog: _this.ShowFog(),
				CombatantList: []
			};
		$.each(_this.CombatantList(), function(i, v) {
			combatant = {
				Id: v.Id(),
				ModelType: v.ModelType(),
				Size: v.Size(),
				Name: v.ModelType() == "Player" ? v.Name() : "",
				HP: v.IsDead() ? 0 : 1,
				LatLng: v.LatLng(),
				Token: v.Token(),
				Angle: v.Angle(),
				Invisible: v.Invisible()
			};
			combat.CombatantList.push(combatant);
		});
		return JSON.stringify(combat);
	};

	_this.ClearFog = function() {
		WORKSPACE.ErasePoints = {};
		WORKSPACE.Helpers.DrawFog();
		WORKSPACE.Helpers.SaveCombatVM();
	};

	_this.SetPlayerZoom = function() {
		_this.PlayerZoom(_this.GridZoom());
	};

	_this.SelectRow = function(data) {
		if(!data.IsSelected()) {
			$.each(_this.CombatantList(), function(i, v) {
				v.IsSelected(false);
			});
			data.IsSelected(true);
			_this.LoadTokens();
		}
		return true;
	};

	_this.CombatantList.subscribe(function(newValue) {
		_this.LoadTokens();
	});

	_this.ShowOutlines.subscribe(function(newValue) {
		_this.LoadTokens();
	});

	_this.TokenScale.subscribe(function(newValue) {
		if(newValue){
			_this.LoadTokens();
		}
	});

	_this.MapSlidesPage = ko.pureComputed(function() {
		var result = [],
			startIndex = _this.PageSize() * _this.PageIndex();
		return _this.MapSlides().slice(startIndex, startIndex + _this.PageSize());
	});

	_this.PageMax = ko.pureComputed(function () {
		return Math.ceil(_this.MapSlides().length / _this.PageSize()) - 1;
	});
			
	_this.isPageMin = ko.pureComputed(function(){
		return _this.PageIndex() <= 0;
	});
			
	_this.isPageMax = ko.pureComputed(function(){
		return _this.PageIndex() >= _this.PageMax();
	});

	_this.MapPrev = function(){
		if(!_this.isPageMin())
			_this.PageIndex(_this.PageIndex()-1);
	};

	_this.MapNext = function(){
		if(!_this.isPageMax())
			_this.PageIndex(_this.PageIndex()+1);
	};

	_this.LoadTokens = function(reset) {
		$.each(WORKSPACE.GridLayers, function(i, v) {
			WORKSPACE.GridMap.removeLayer(v);
		});

		var boxSize = WORKSPACE.TokenSize.M * _this.TokenScale() + "px";
		boxSize = boxSize + " " + boxSize;
		$("#grid-lines").css("background-size", boxSize);

		$.each(_this.CombatantList(), function(i, v) {

			if(v.Invisible() && WORKSPACE.VIEW && !v.IsDead()) return;

			var token = null;
			if(v.Name() && v.Name() !== "") {
				$.each(_this.CustomIcons(), function(z, x) {
					if(x.name == v.Name()) {
						token = x.token;
					}
				});
			}

			if(token === null) {
				if(v.Token() === null) {
					token = (v.ModelType() == "Player") ? "https://i.imgur.com/BF7DY3I.png" : "https://i.imgur.com/dgZ2jjL.png";
					v.Token(token);
				} else {
					token = v.Token();
					var found = false;
					$.each(_this.CustomIcons(), function(z, x) {
						if(x && x.name == v.Name()){
							found = true;
							_this.CustomIcons.remove(x);
						}
					});
					
					_this.CustomIcons.push({ name: v.Name(), token: v.Token() });
				}
			}

			var classes = v.TokenClasses(_this.ShowOutlines());
			var size = WORKSPACE.TokenSize[v.Size()] * _this.TokenScale(),
				icon = new L.icon({
				iconUrl: token,
				iconSize: [size, size],
				className: classes
			});

			v.LatLng( !v.LatLng() || reset ? L.latLng( 50,50 ) : v.LatLng() );

			var marker = new L.marker(v.LatLng(), {
				draggable: !WORKSPACE.VIEW,
				icon: icon,
				title: !WORKSPACE.VIEW ? v.Name() : '',
				alt: !WORKSPACE.VIEW ? v.Name() : '',
				iconAngle: v.Angle()
			});

			marker.on("contextmenu", function(event) {
				v.Angle((v.Angle() + 45) % 360);
				marker.setIconAngle(v.Angle());
			});

			if(!WORKSPACE.VIEW) {
				marker.bindPopup(v.Name(), {
					closeButton: false,
					offset: L.point(0, 50 * _this.TokenScale()),
					closeOnClick: false,
					opacity: 0.7,
					autoPan: false
				});

				marker.on("click", function(event) {
					_this.SelectRow(v);
				});

				marker.on("dragend", function(event) {
					var marker = event.target;
					v.LatLng(marker.getLatLng());
				});

				marker.on("drag", function(event) {
					marker.setIconAngle(v.Angle());
				});

				marker.on("dblclick", function(event) {
					if(v.ModelType() == "NPC") {
						var e = event.originalEvent;
						e.stopPropagation();
						WORKSPACE.Helpers.ViewNPC(v.Id(), e);
					}
				});

				marker.on("mousedown", function(event) {
					var e = event.originalEvent,
						from = WORKSPACE.DistanceFrom;
					e.stopPropagation();
					if (e.button == 2) {
						from.left = $(e.srcElement).offset().left + $(e.srcElement).width()/2;
						from.top = $(e.srcElement).offset().top + $(e.srcElement).height()/2;
						WORKSPACE.ShowDistance = true;
					}
				});

				marker.on("mouseup", function(event) {
					WORKSPACE.Helpers.DisableDistance(event.originalEvent);
				});

			}

			WORKSPACE.GridLayers.push(marker);
			marker.addTo(WORKSPACE.GridMap);
		});
	};

	_this.ResetTokens = function() {
		_this.LoadTokens(true);
	};

	_this.AddMap = function(data, event) {
		_this.MapSlides.push({ Source: _this.MapToAdd() });
		WORKSPACE.ViewModels.GameViewModel.Save();
		_this.MapToAdd("");
	};

	_this.RemoveMap = function(map) {
		_this.MapSlides.remove(map);
		WORKSPACE.ViewModels.GameViewModel.Save();
	};

	_this.ActiveMap.subscribe(function(newValue){
		if (newValue !== "") {
			WORKSPACE.Helpers.SwapMap(newValue);
		}
	});

	_this.LoadMap = function(data, event) {
		_this.ClearFog();
		_this.ActiveMap($(event.currentTarget).data("src"));
	};

	_this.OrderedCombatantList = ko.pureComputed(function(){
		return _this.CombatantList().sort(function(a, b) {
			var z = parseInt(a.Initiative() || 0),
				x = parseInt(b.Initiative() || 0);
			if(z < x)
				return 1;
			else if(z > x)
				return -1;
			else if(z === x){
				return (a.Name() < b.Name()) ? -1 : 1;
			}
		});
	});

	_this.Difficulty = ko.pureComputed(function() {
		var difficulty = "Unknown",
			partyXPThreshold = [0,0,0,0],
			players = [],
			npcs = [];

		$.each(_this.CombatantList(), function(i, v) {
			if(v.ModelType() == "NPC") npcs.push(v); else 
			if(v.ModelType() == "Player") players.push(v); else
			if(parseInt(v.CR()) >= 0) npcs.push(v);
		});

		if (players.length) {
			// Create party's xp threshold
			$.each(players, function(i, v) {

				// If player's level isn't set
				if(!v.Level()){
					partyXPThreshold = null;
				}

				if(partyXPThreshold === null)
					return;

				// Total party threshold
				for(i=0; i<partyXPThreshold.length; i++) {
					partyXPThreshold[i] += WORKSPACE.XPPerLevel[v.Level()][i];
				}

			});
		} else {
			return difficulty;
		}

		// If a player doesn't have level set, fail out.
		if(partyXPThreshold !== null){
			var len = npcs.length,
				multiplier = 0,
				adjustedxp = 0,
				xp = 0,
				index = 0;

			// Adjust for number of monsters
			if(len < 2) index = 0; else
				if(len < 3) index = 1; else
					if(len < 7) index = 2; else
						if(len < 11) index = 3; else
							if(len < 15) index = 4; else
								index = 5;

			// Adjust for smaller parties
			if( WORKSPACE.ViewModels.PlayersViewModel.PlayersList().length < 3)
				index++;

			// Set multiplier
			multiplier = WORKSPACE.Multipliers[index];

			// Total monster xp
			$.each(npcs, function(i, v) {
				xp += parseInt(v.XP());
			});

			// Encounter's adjusted xp
			adjustedxp = xp * multiplier;

			// Determine difficulty
			if(adjustedxp < partyXPThreshold[0]) difficulty = "Trivial"; else 
				if(adjustedxp < partyXPThreshold[1]) difficulty = "Easy"; else 
					if(adjustedxp < partyXPThreshold[2]) difficulty = "Medium"; else 
						if(adjustedxp < partyXPThreshold[3]) difficulty = "Hard"; else 
							difficulty = "Deadly";
		}
		return difficulty;
	});

	_this.AddCombatant = function(data) {
		if (data === undefined) {
			_this.CombatantList.push(new CombatantModel());
			return;
		}
		var dupe = false,
			combatant = new CombatantModel();

		$.each(_this.CombatantList(), function(i,v) {
			if(v.Name() == data.Name)
				dupe = true;
		});

		if (!dupe || data.ModelType == "NPC") {
			combatant.Load(data);
			_this.CombatantList.push(combatant);
		}
	};
	
	_this.RemoveCombatant = function(combatant) {
		_this.CombatantList.remove(combatant);
	};
	
	_this.SetActiveTab = function(index) {
		_this.ActiveTab(index);
	};

	_this.BackgroundColor.subscribe(function(newValue) {
		$("#grid-map").css("background", newValue);
	});

	_this.ShowGridLines.subscribe(function(newValue) {
		if(newValue) {
			$("#grid-lines").css("display", "initial");
			$("#grid-lines").css("background-image", 
				"linear-gradient(to right, " + _this.GridColor() + " 1px, transparent 1px), linear-gradient(to bottom, " + _this.GridColor() + " 1px, transparent 1px)");
		} else {
			$("#grid-lines").css("display", "none");
		}
	});

	_this.GridColor.subscribe(function(newValue) {
		if(_this.ShowGridLines()) {
			$("#grid-lines").css("background-image", 
				"linear-gradient(to right, " + newValue + " 1px, transparent 1px), linear-gradient(to bottom, " + newValue + " 1px, transparent 1px)");
		}
	});

	_this.DarknessColor.subscribe(function(newValue) {
		if(WORKSPACE.VIEW) {
			WORKSPACE.Helpers.DrawLights();
		}
	});

	_this.FogColor.subscribe(function(newValue) {
		WORKSPACE.Helpers.DrawFog();
	});

	_this.ShowFog.subscribe(function(newValue) {
		var canvas = $("#grid-fog")[0],
			ctx = canvas.getContext('2d');

    	ctx.clearRect(0, 0, canvas.width, canvas.height);
		WORKSPACE.Helpers.DrawFog();
	});
	
	_this.Load = function(data) {
		if (!WORKSPACE.VIEW) {
			_this.ActiveTab(data.ActiveTab || 0);
			_this.Position({
				Left: data.Position.Left || 0,
				Top: data.Position.Top || 0
			});
			_this.MapSlides(data.MapSlides || []);
			_this.IsMinimized(data.IsMinimized);

		}
		
		_this.FogColor(data.FogColor || "rgb(0,0,0)");
		_this.DarknessColor(data.DarknessColor || "rgb(0,0,0)");
		_this.GridColor(data.GridColor || "#000");
		_this.BackgroundColor(data.BackgroundColor || "#ddd");
		_this.ShowOutlines(data.ShowOutlines || false);
		_this.ShowGridLines(data.ShowGridLines || false);
		_this.AltGridColor(data.AltGridColor || false);
		_this.ShowDarkness(data.ShowDarkness || false);
		_this.ShowFog(data.ShowFog || false);
		if(data.ShowFog && data.ErasePoints) {
			WORKSPACE.ErasePoints = data.ErasePoints;
		}
		_this.ActiveMap(data.ActiveMap || "");
		$.each(data.CustomIcons, function(i, v) {
			if(!v.name || v.name === "")
				data.CustomIcons.slice(i, 1);
		});
		_this.CustomIcons(data.CustomIcons || []);
		_this.TokenScale(data.TokenScale || 1);
		_this.GridCenter(data.GridCenter || [0,0]);
		_this.GridZoom(data.GridZoom || 1);

		var tmpList = [];
		if(data.CombatantList.length > 0){
			for(i=0; i<data.CombatantList.length; i++){
				var tmp = new CombatantModel();
				tmp.Load(data.CombatantList[i]);
				tmpList.push(tmp);
			}
			
			_this.CombatantList(tmpList);
		}
	};
};

CombatViewModel.prototype.toJSON = function() {
    var copy = ko.toJS(this);
    delete copy.TriggerUpdate;
    delete copy.MapSlides;
    delete copy.MapSlidesPage;
    delete copy.PageMax;
    delete copy.isPageMin;
    delete copy.isPageMax;
    delete copy.Difficulty;
    delete copy.OrderedCombatantList;
    return copy;
};