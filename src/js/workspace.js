var WORKSPACE = {
	VIEW: 0,
	DEBUG: false,
	EraseClicked: false,
	PanelList: [],
	Alerted: false,
	ColumnCount: 3,
	LargeColumnWidth: 0,
	ViewModels: {},
	GridLayers: [],
	GridImageOverlay: null,
	CurrentGridImage: null,
	Windows: [],
	LastGridHash: null,
	MinVal: 0,
	MaxVal: 0,
	IsLoaded: false,
	ShowDistance: false,
	CurrentGame: null,
	DownX: 0,
	DownY: 0,
	ErasePoints: {},
	GridState: 1,
	GameList: [],
	MapSlides: [],
	DefaultPlayerToken: "https://i.imgur.com/VcUMoh7.png",
	DefaultNPCToken: "https://i.imgur.com/4pfG5lQ.png",
	TokenSize: {
		"T": 12,
		"S": 50,
		"M": 50,
		"L": 100,
		"H": 150,
		"G": 250,
		"C": 400
	},
	CRArray: ["","0","1/8","1/4","1/2",1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
	XPPerLevel: { "1": [25, 50, 75, 100], "2": [50, 100, 150, 200], "3": [75, 150, 225, 400], "4": [125, 250, 375, 500], "5": [250, 500, 750, 1100], "6": [300, 600, 900, 1400], "7": [350, 750, 1100, 1700], "8": [450, 900, 1400, 2100], "9": [550, 1100, 1600, 2400], "10": [600, 1200, 1900, 2800], "11": [800, 1600, 2400, 3600], "12": [1000, 2000, 3000, 4500], "13": [1100, 2200, 3400, 5100], "14": [1250, 2500, 3800, 5700], "15": [1400, 2800, 4300, 6400], "16": [1600, 3200, 4800, 7200], "17": [2000, 3900, 5900, 8800], "18": [2100, 4200, 6300, 9500], "19": [2400, 4900, 7300, 10900], "20": [2800, 5700, 8500, 12700] },
	XPPerCR: { "0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800, "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900, "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000, "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000, "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000, "26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000 },
	Multipliers: [ 1, 1.5, 2, 2.5, 3, 4, 5],
	DefaultPanels: [
		"Combat", "Players", "Spells", "Loot", "NPCs", "Game", "Roll"
	],
	DistanceFrom: {
		top: 0,
		left: 0
	},
	DialogSize: {
		PlayersViewModel: { Width: "20vw", Height: "auto" },
		CombatViewModel: { Width: "32vw", Height: "auto" },
		RollViewModel: { Width: "215px", Height: "auto" },
		GameViewModel: { Width: "15vw", Height: "auto" },
		Default: { Width: "22vw", Height: "auto" }
	},
	
	Init: function() {
		if(WORKSPACE.DEBUG) console.log("Init");
		WORKSPACE.SaveViewModel = new SaveViewModel();
		WORKSPACE.Load();
		WORKSPACE.InitDraw();
	},
	
	SupportsStorage: function() {
		var uid = new Date(), result;
		try {
			localStorage.setItem(uid, uid);
			result = localStorage.getItem(uid) == uid;
			localStorage.removeItem(uid);
			return result && localStorage;
		} catch (e) {
			if(!WORKSPACE.Alerted){
				var msg = "Your browser does not support Local File Web Storage.\n" + "Session data will not be saved.";
				alert(msg);
				WORKSPACE.Alerted = true;
			}
			return false;
		}
	},

	InitDraw: function() {
		if(WORKSPACE.DEBUG) console.log("Add Elements");

		$.each(WORKSPACE.PanelList, function(i, v) {
			$.each(v, function(z, x) {
				var panel = x,
					viewmodel = panel.title+"ViewModel",
					vmclass = "." + viewmodel.toLowerCase() + "-inc";

				if (typeof window[viewmodel] == "function") {
					ko.applyBindings(WORKSPACE.ViewModels[viewmodel], $(vmclass)[0]);
					WORKSPACE.ViewModels[viewmodel].Selector = vmclass;
				}

				var vm = WORKSPACE.ViewModels[viewmodel];
				var dialog = $(vmclass).dialog({
					autoOpen: true,
					title: panel.title,
					width: WORKSPACE.DialogSize[viewmodel] ? WORKSPACE.DialogSize[viewmodel].Width : WORKSPACE.DialogSize.Default.Width,
					resizable: viewmodel == "CombatViewModel" ? true : false,
					modal: false,
				}).dialogExtend({
					"closable" : false,
					"minimizable" : true,
					"collapsable" : false,
					"dblclick" : "maximize"
				}).on( "dialogdragstop", function( e, ui ) {
					if ( typeof vm == "object" ){
						WORKSPACE.ViewModels[viewmodel].Position({
							Left: ui.position.left,
							Top: ui.position.top
						});
					}
				}).bind( "dialogextendminimize", function( e ) {
					if ( typeof vm == "object" ) WORKSPACE.ViewModels[viewmodel].IsMinimized(true);
				}).bind( "dialogextendrestore", function( e ) {
					if ( typeof vm == "object" ) WORKSPACE.ViewModels[viewmodel].IsMinimized(false);
				});
				WORKSPACE.Windows.push({
					ViewModel: vm,
					Element: dialog
				});
				if ( typeof vm == "object" ){
					$(vmclass).parent().css("left", vm.Position().Left);
					$(vmclass).parent().css("top", vm.Position().Top);
					if(vm.IsMinimized())
						dialog.dialogExtend("minimize");
				}
				
			});
		});
		
		$(".lootviewmodel-inc").tabs({ 
			active: WORKSPACE.ViewModels.LootViewModel.ActiveTab() 
		});
		$(".spellsviewmodel-inc").tabs({ 
			active: WORKSPACE.ViewModels.SpellsViewModel.ActiveTab() 
		});
		$(".npcsviewmodel-inc").tabs({ 
			active: WORKSPACE.ViewModels.NPCsViewModel.ActiveTab() 
		});
		$(".combatviewmodel-inc").tabs({ 
			active: WORKSPACE.ViewModels.CombatViewModel.ActiveTab() 
		});
		$(".loot-rarity").chosen({width: "100%"});
		
		WORKSPACE.SpellView = $("#SpellView").dialog({
			autoOpen: false,
			width: "40vw",
			resizable: true,
			height: "auto",
			modal: true,
			dialogClass: "view-title",
			buttons: {
				"Add to Spellbook": function() {
					$(this).dialog("close");
					WORKSPACE.Spellbooks.dialog("open");
				},
				Close: function() {
				  $(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});

		WORKSPACE.ItemView = $("#ItemView").dialog({
			autoOpen: false,
			resizable: true,
			modal: true,
			width: "auto",
			dialogClass: "view-title",
			buttons: {
				Close: function() {
				  $(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});

		WORKSPACE.NPCView = $("#NPCView").dialog({
			autoOpen: false,
			resizable: true,
			modal: true,
			dialogClass: "view-title",
			width: "760px",
			buttons: {
				"Add to Group": function() {
					//$(this).dialog("close");
					WORKSPACE.NPCGroups.dialog("open");
				},
				"Send to Combat": function() {
					//$(this).dialog("close");
					var npc = new NPCModel(),
						id = WORKSPACE.ViewModels.NPCsViewModel.CurrentNPCId;
					npc.Load(id, MONSTERS[id]);
					WORKSPACE.ViewModels.CombatViewModel.AddCombatant(ko.toJS(npc));
				},
				Close: function() {
					$(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});

		WORKSPACE.NPCGroups = $("#NPCGroups").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Confirm: function() {
				  var vm = WORKSPACE.ViewModels.NPCsViewModel;
				  vm.SelectedGroup().AddNPC(vm.CurrentNPCId);
				  $(this).dialog("close");
				},
				Cancel: function() {
				  $(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});
		
		WORKSPACE.Spellbooks = $("#Spellbooks").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Confirm: function() {
				  var vm = WORKSPACE.ViewModels.SpellsViewModel;
				  vm.SelectedBook().AddSpell(vm.CurrentSpellId);
				  $(this).dialog("close");
				},
				Cancel: function() {
				  $(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});
		
		WORKSPACE.RenameBook = $("#RenameBook").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Done: function() {
				  $(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});

		WORKSPACE.RenameGroup = $("#RenameGroup").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Done: function() {
				  $(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});

		WORKSPACE.RenameGame = $("#RenameGame").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Done: function() {
				  $(this).dialog("close");
				}
			},
			position: {
				my: "center",
				at: "center",
				of: window
			}
		});

		WORKSPACE.ResizeGridOrig = "";

		WORKSPACE.ResizeGrid = function(invalidateSize){
			var	parent = $(".combatviewmodel-inc"),
				tabs = $(".combatviewmodel-inc > .ui-tabs-nav"),
				height = parent.height() - tabs.height() - 12,
				width = parent.width();

			$("#grid-map").css("height", height + "px");
			$("#grid-canvas").attr("height", height + 1);
			$("#grid-canvas").attr("width", width + 6);

			if(WORKSPACE.GridMap && invalidateSize){
				WORKSPACE.GridMap.invalidateSize();
			}
		};

		WORKSPACE.ResizeGrid();
		var combatvminc = $(".combatviewmodel-inc");

		combatvminc.on( "dialogresize", function( event, ui ) {
			WORKSPACE.ResizeGrid(true);
		});

		combatvminc.on( "dialogextendbeforeMaximize", function( event ) {
			var selector = $("#GridTab"),
				parent = selector.parent();
			WORKSPACE.ResizeGridOrig = parent.height() + parent.offset().top - selector.offset().top + "px";
		});

		combatvminc.on( "dialogextendmaximize", function( event ) { 
			WORKSPACE.ResizeGrid(true);

		});

		combatvminc.on( "dialogextendrestore", function( event ) { 
			$("#grid-map").css("height", WORKSPACE.ResizeGridOrig);
			WORKSPACE.ResizeGrid(true);
		});

		WORKSPACE.SpellViewVM = new SpellModel();
		WORKSPACE.ItemViewVM = new ItemModel();
		WORKSPACE.NPCViewVM = new NPCModel();
		ko.applyBindings(WORKSPACE.SpellViewVM, $("#SpellView")[0]);
		ko.applyBindings(WORKSPACE.ItemViewVM, $("#ItemView")[0]);
		ko.applyBindings(WORKSPACE.NPCViewVM, $("#NPCView")[0]);
		ko.applyBindings(WORKSPACE.ViewModels.SpellsViewModel, $("#Spellbooks")[0]);
		ko.applyBindings(WORKSPACE.ViewModels.SpellsViewModel, $("#RenameBook")[0]);
		ko.applyBindings(WORKSPACE.ViewModels.NPCsViewModel, $("#NPCGroups")[0]);
		ko.applyBindings(WORKSPACE.ViewModels.NPCsViewModel, $("#RenameGroup")[0]);
		ko.applyBindings(WORKSPACE.ViewModels.GameViewModel, $("#RenameGame")[0]);

		L.Map = L.Map.extend({
			openPopup: function (popup, latlng, options) { 
				if (!(popup instanceof L.Popup)) {
				var content = popup;
				
				popup = new L.Popup(options).setContent(content);
				}
				
				if (latlng) {
				popup.setLatLng(latlng);
				}
				
				if (this.hasLayer(popup)) {
				return this;
				}
				
				//this.closePopup();
				this._popup = popup;
				return this.addLayer(popup);
			},
			closePopup: function (popup) {
				if (!popup || popup === this._popup) {
					popup = this._popup;
					this._popup = null;
				}
				if (popup) {
					this.removeLayer(popup);
					popup._isOpen = false;
				}
				return this;
			},
			bindPopup: function (content, options) {
				var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);

				anchor = anchor.add(L.Popup.prototype.options.offset);

				if (options && options.offset) {
					anchor = anchor.add(options.offset);
				}

				options = L.extend({offset: anchor}, options);

				if (!this._popupHandlersAdded) {
					this
						.on('click', this.togglePopup, this)
						.on('remove', this.closePopup, this)
						.on('move', this._movePopup, this);
					this._popupHandlersAdded = true;
				}

				if (content instanceof L.Popup) {
					L.setOptions(content, options);
					this._popup = content;
					content._source = this;
				} else {
					this._popup = new L.Popup(options, this)
						.setContent(content);
				}

				return this;
			}
		});

		WORKSPACE.GridMap = new L.map("grid-map", {
			crs: L.CRS.Simple,
			minZoom: 1,
			maxZoom: 7,
			attributionControl: false
		});

		WORKSPACE.AddErasePoint = function(e, nodrag){
			var canvas = $("#grid-fog"),
				zoom = WORKSPACE.GridMap.getZoom();
			WORKSPACE.ErasePoints[zoom] = WORKSPACE.ErasePoints[zoom] || { points: [] };
			WORKSPACE.ErasePoints[zoom].points.push( {
				x: e.pageX - canvas.offset().left,
				y: e.pageY - canvas.offset().top,
				dragging: nodrag ? false : true,
				size: WORKSPACE.ViewModels.CombatViewModel.EraseSize()
			} );
			WORKSPACE.Helpers.DrawFog();
			WORKSPACE.Helpers.SaveCombatVM();
		};

		WORKSPACE.GridMap.on( "contextmenu", function(event) {
			// Do nothing
		});
		WORKSPACE.GridMap.on("mousedown", function(event) {
			var e = event.originalEvent,
				from = WORKSPACE.DistanceFrom;
			e.stopPropagation();
			if (e.button == 2) {
				if(WORKSPACE.GridState) {
					from.left = e.pageX;
					from.top = e.pageY;
					WORKSPACE.ShowDistance = true;
				} else if(!WORKSPACE.GridState && WORKSPACE.ViewModels.CombatViewModel.ShowFog()) {
					WORKSPACE.DownX = e.pageX;
					WORKSPACE.DownY = e.pageY;
					WORKSPACE.EraseClicked = true;
					WORKSPACE.AddErasePoint(e, true);
				}
			}
		});

		WORKSPACE.GridMap.on( "mousemove", function(event) {
			var e = event.originalEvent;
			WORKSPACE.Helpers.DrawDistance(e);
			if(!WORKSPACE.GridState && WORKSPACE.EraseClicked && WORKSPACE.ViewModels.CombatViewModel.ShowFog()){
				var a = e.pageX - WORKSPACE.DownX,
					b = e.pageY - WORKSPACE.DownY;
					
				if(Math.sqrt( a*a + b*b ) >= WORKSPACE.ViewModels.CombatViewModel.EraseSize()/2) {
					WORKSPACE.AddErasePoint(e);
					WORKSPACE.DownX = e.pageX;
					WORKSPACE.DownY = e.pageY;
				}
			}
			WORKSPACE.GridMap.invalidateSize();
		});

		/*WORKSPACE.GridMap.on( "mouseup", function(event) {
			WORKSPACE.Helpers.DisableDistance(event.originalEvent);
		});*/

		/*WORKSPACE.GridMap.on( "viewreset", function(event) {
			WORKSPACE.GridMap.invalidateSize();
		});*/

		$(document).on("mouseup", function(event) {
			WORKSPACE.Helpers.DisableDistance(event);
			if(!WORKSPACE.GridState && WORKSPACE.EraseClicked && WORKSPACE.ViewModels.CombatViewModel.ShowFog()) {
				WORKSPACE.AddErasePoint(event);
			}
			WORKSPACE.EraseClicked = false;
		});

		WORKSPACE.DrawFog = function() {
			if(!WORKSPACE.ViewModels.CombatViewModel.ShowFog()) return;
			var canvas = $("#grid-fog")[0],
				ctx = canvas.getContext('2d');

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.globalCompositeOperation = 'source-over';
			ctx.fillStyle = WORKSPACE.ViewModels.CombatViewModel.FogColor().replace(')', ', 0.65)').replace('rgb', 'rgba');
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		};

		WORKSPACE.AdjustFog = function() {
			var canvas = $("#grid-fog"),
				ctx = canvas[0].getContext('2d'),
				imglayer = $(".leaflet-image-layer");

			canvas.css("transform", imglayer[0].style.transform);
			canvas.attr("width", imglayer.width());
			canvas.attr("height", imglayer.height());

			WORKSPACE.Helpers.DrawFog();
		};

		WORKSPACE.GridMap.on("move", function(event) {
			var gridlines = $("#grid-lines"),
				imglayer = $(".leaflet-image-layer"),
				canvas = $("#grid-fog"),
				ctx = canvas[0].getContext('2d');
			if(!gridlines || !imglayer) return;
			gridlines.css("transform", imglayer[0].style.transform);
			gridlines.css("width", imglayer.width());
			gridlines.css("height", imglayer.height());

			canvas.css("transform", imglayer[0].style.transform);
			canvas.attr("width", imglayer.width());
			canvas.attr("height", imglayer.height());

			WORKSPACE.Helpers.DrawFog();
		});

		WORKSPACE.GridMap.on("zoomstart", function(event) {
			WORKSPACE.DrawFog();
		});

		WORKSPACE.GridMap.on("zoomend", function(event) {
			WORKSPACE.ViewModels.CombatViewModel.GridZoom(WORKSPACE.GridMap.getZoom());
			WORKSPACE.AdjustFog();
			if(WORKSPACE.SetPlayerZoom.zoom == WORKSPACE.GridMap.getZoom()){
				WORKSPACE.SetPlayerZoom.disable();
			} else {
				WORKSPACE.SetPlayerZoom.enable();
			}
		});

		WORKSPACE.GridMap.on("moveend", function(event) {
			WORKSPACE.ViewModels.CombatViewModel.GridCenter(WORKSPACE.GridMap.getCenter());
		});

		$("#grid-lines").appendTo($(".leaflet-map-pane"));
		$("#grid-fog").appendTo($(".leaflet-map-pane"));

		WORKSPACE.ViewModels.CombatViewModel.LoadTokens();

		$( "#token-scale" ).slider({
			range: "min",
			value: 1,
			min: 0.5,
			step: 0.1,
			max: 3,
			slide: function( event, ui ) {
				WORKSPACE.ViewModels.CombatViewModel.TokenScale(ui.value);
			}
		});

		$( "#erase-size" ).slider({
			range: "min",
			value: 100,
			min: 10,
			step: 10,
			max: 200,
			slide: function( event, ui ) {
				WORKSPACE.ViewModels.CombatViewModel.EraseSize(ui.value);
			}
		});

		$("#grid-bgcolor").spectrum({
			color: WORKSPACE.ViewModels.CombatViewModel.BackgroundColor(),
			showAlpha: true,
			change: function(color) {
				WORKSPACE.ViewModels.CombatViewModel.BackgroundColor(color.toRgbString());
			}
		});

		$("#grid-linecolor").spectrum({
			color: WORKSPACE.ViewModels.CombatViewModel.GridColor(),
			showAlpha: true,
			change: function(color) {
				WORKSPACE.ViewModels.CombatViewModel.GridColor(color.toRgbString());
			}
		});

		$("#grid-fogcolor").spectrum({
			color: WORKSPACE.ViewModels.CombatViewModel.FogColor(),
			change: function(color) {
				WORKSPACE.ViewModels.CombatViewModel.FogColor(color.toRgbString());
			}
		});

		$("#grid-darknesscolor").spectrum({
			color: WORKSPACE.ViewModels.CombatViewModel.DarknessColor(),
			change: function(color) {
				WORKSPACE.ViewModels.CombatViewModel.DarknessColor(color.toRgbString());
			}
		});

		var eraseToggle = L.easyButton({
		    states: [
		    	{
				   	stateName: "grid-erase",
				    icon: "fa fa-eraser",
				    title: "Fog Eraser",
				    onClick: function(control) {
				        WORKSPACE.GridState = !WORKSPACE.GridState;
				        if(!WORKSPACE.GridState) 
				        	this.disable();
				        else
				        	this.enable();
				    }
		  		}
		  	]
		});

		eraseToggle.addTo(WORKSPACE.GridMap);
		L.DomUtil.addClass(eraseToggle.button, "eraser-toggle");

		WORKSPACE.DrawFog();

		WORKSPACE.SetPlayerZoom = L.easyButton( {
			states: 
			[
				{
					stateName: "player-zoom",
					icon: "fa fa-crosshairs",
					title: "Set Player Zoom",
					onClick: function(control){
						WORKSPACE.ViewModels.CombatViewModel.SetPlayerZoom();
						this.zoom = WORKSPACE.GridMap.getZoom();
						this.disable();
					}
				}
			]
		});

		WORKSPACE.SetPlayerZoom.addTo(WORKSPACE.GridMap);

		WORKSPACE.SetPlayerZoom.zoom = WORKSPACE.GridMap.getZoom();

		WORKSPACE.HideOverlay();
		WORKSPACE.IsLoaded = true;
		if (WORKSPACE.Debug) console.log("> Workspace Loaded");
		WORKSPACE.ViewModels.GameViewModel.Save();
		//$("#workspace").disableSelection();
	},
	
	HideOverlay: function() {
		$("#overlay").fadeOut();
	},
	
	LoadDefaultData: function() {
		if(WORKSPACE.DEBUG) console.log("> Default Data");
		WORKSPACE.CurrentGame = new GameModel("Game1");
		WORKSPACE.GameList = [ko.toJS(WORKSPACE.CurrentGame)];
		WORKSPACE.PanelList = [];
		var index = 0;
		for(i=0; i<WORKSPACE.DefaultPanels.length; i++) {
			if (WORKSPACE.PanelList[index] === undefined)
				WORKSPACE.PanelList[index] = [];
			WORKSPACE.PanelList[index].push(new Panel(WORKSPACE.DefaultPanels[i]));
			
			index++;
			if (index > WORKSPACE.ColumnCount-1)
				index = 0;
				
		}

		WORKSPACE.ViewModels.GameViewModel.LoadGameList(WORKSPACE.GameList);
		WORKSPACE.ViewModels.GameViewModel.LoadSelectedGame(WORKSPACE.CurrentGame);
	},
	
	LoadPanelOrder: function(panelOrder) {
		if(WORKSPACE.DEBUG) console.log("> Panel Order");
		for(c=0; c<panelOrder.length; c++) {
			WORKSPACE.PanelList.push([]);
			for(i=0; i<panelOrder[c].length; i++) {
				WORKSPACE.PanelList[c].push(new Panel(panelOrder[c][i]));
			}
		}
	},
	
	LoadViewModels: function(data) {
		if(WORKSPACE.DEBUG) console.log("> View Models...");
		var game = new GameModel(data.Name);
		WORKSPACE.CurrentGame = game;
		var VMArray = JSON.parse(localStorage.getItem(game.Id()));
		if( VMArray === null ){
			WORKSPACE.PanelList = [];
			var index = 0;
			for(i=0; i<WORKSPACE.DefaultPanels.length; i++) {
				if (WORKSPACE.PanelList[index] === undefined)
					WORKSPACE.PanelList[index] = [];
				WORKSPACE.PanelList[index].push(new Panel(WORKSPACE.DefaultPanels[i]));
				index++;
				if (index > WORKSPACE.ColumnCount-1)
					index = 0;
			}

			WORKSPACE.ViewModels.GameViewModel.LoadGameList(WORKSPACE.GameList);
			WORKSPACE.ViewModels.GameViewModel.LoadSelectedGame(game);

			/*WORKSPACE.LoadDefaultData();
			WORKSPACE.CurrentGame = game;
			WORKSPACE.GameList = JSON.parse(localStorage.getItem("WORKSPACE")).GameList;
			WORKSPACE.ViewModels.GameViewModel.GameList(WORKSPACE.GameList);
			WORKSPACE.ViewModels.GameViewModel.SelectedGame(gane.Name());*/
			
		} else {
			$.each(VMArray.ViewModels, function(i, v){
				if(WORKSPACE.DEBUG) console.log("> > " + v.Key);
				try {
					var newFormat = JSON.parse(v.ViewModel);
					if(newFormat)
						WORKSPACE.ViewModels[v.Key].Load(newFormat);
				} catch(e) {
					// Legacy support
					WORKSPACE.ViewModels[v.Key].Load(v.ViewModel);
				}
			});
		}
	},
	
	Load: function() {
		if(WORKSPACE.DEBUG) console.log("Loading...");

		if (WORKSPACE.SupportsStorage()) {
			var load = JSON.parse(localStorage.getItem("WORKSPACE"));
			if (load) {
				WORKSPACE.LoadDefaultData();
				if (load.GameList !== undefined && load.CurrentGame !== undefined && 
					load.CurrentGame.Id !== "" && load.CurrentGame.Name !== "") {
					WORKSPACE.GameList = load.GameList;
					WORKSPACE.MapSlides = load.MapSlides || [];
					WORKSPACE.LoadViewModels(load.CurrentGame);
					WORKSPACE.ViewModels.CombatViewModel.MapSlides( WORKSPACE.MapSlides.concat(WORKSPACE.ViewModels.CombatViewModel.MapSlides()) );
				}
			}else{
				WORKSPACE.LoadDefaultData();
			}
		}else{
			WORKSPACE.LoadDefaultData();
		}
	},
	
	Save: function() {
		if (WORKSPACE.IsLoaded) {
			if (WORKSPACE.SupportsStorage()) {
				if(WORKSPACE.DEBUG){
						console.log("Saving");
				}
				
				var VMArr = [];
				$.each(WORKSPACE.ViewModels, function(key, value) {
					VMArr.push({Key: key, ViewModel: ko.toJSON(value)});
				});

				localStorage.setItem(WORKSPACE.CurrentGame.Id(), JSON.stringify({
					ViewModels: VMArr
				}));

				WORKSPACE.CacheSave = VMArr;
			}
		}
	},
	
	Clear: function() {
		if (WORKSPACE.SupportsStorage()) {
			localStorage.clear();
		}
	}
};

WORKSPACE.Helpers = {

	DrawFog: function() {
		if(WORKSPACE.ViewModels.CombatViewModel && 
			WORKSPACE.ViewModels.CombatViewModel.ShowFog()) {
			var	canvas = $("#grid-fog")[0],
				ctx = canvas.getContext("2d"),
				radius = 20;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.globalCompositeOperation = 'source-over';
			ctx.fillStyle = WORKSPACE.ViewModels.CombatViewModel.FogColor().replace(')', ', 0.65)').replace('rgb', 'rgba');
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			var currentZoom = WORKSPACE.GridMap.getZoom(),
				zoom = WORKSPACE.ErasePoints[currentZoom];
			
			for(i=0; zoom && i<zoom.points.length; i++) {
				var x = zoom.points[i].x,
					y = zoom.points[i].y;

				ctx.beginPath();
	            if ( i>0 && zoom.points[i].dragging ) {
	                ctx.moveTo(zoom.points[i-1].x, zoom.points[i-1].y);
	            } else {
	                ctx.moveTo(x - 1, y);
	            }
	            ctx.lineTo(x, y);
	            ctx.closePath();

	            ctx.globalCompositeOperation = 'destination-out';
	            ctx.fillStyle = 'rgba(0,0,0,0);';
	            ctx.strokeStyle = 'rgba(0,0,0,0);';

	            ctx.lineJoin = "round";
	            ctx.lineWidth = zoom.points[i].size;
	            ctx.stroke();
		    }
	    }
	},

	SaveCombatVM: function() {
		if(WORKSPACE.ViewModels.CombatViewModel.TransmitMap()) {
			var json = WORKSPACE.ViewModels.CombatViewModel.CompressModel(),
				hash = json.hashCode();
			if(WORKSPACE.LastGridHash != hash) {
				localStorage.setItem("MAPVIEW-Hash", hash);
				localStorage.setItem("MAPVIEW-ViewModel", json);
				WORKSPACE.LastGridHash = hash;
			}
		}
	},

	DisableDistance: function( event ) {
		if (event.button == 2) {
			var canvas = $("#grid-canvas")[0],
				ctx = canvas.getContext("2d");
			WORKSPACE.ShowDistance = false;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	},

	DrawDistance: function( event ) {
		if(!WORKSPACE.ShowDistance) 
			return;

		var canvas = $("#grid-canvas"),
			from = {
				left: WORKSPACE.DistanceFrom.left - canvas.offset().left,
				top: WORKSPACE.DistanceFrom.top - canvas.offset().top
			},
			to = {
				left: event.pageX - canvas.offset().left,
				top: event.pageY - canvas.offset().top
			};

		var ctx = canvas[0].getContext("2d"),
			fromX = from.left,
			fromY = from.top,
			toX = to.left,
			toY = to.top,
			distance = 0;

		ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);

		distance = WORKSPACE.Helpers.DrawLabel( ctx, { x: fromX, y: fromY }, { x: toX, y: toY }, "center", "5" );

		if(distance > 2) {
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(fromX, fromY);
			ctx.lineTo(toX, toY);
			ctx.strokeStyle = "red";
			ctx.stroke();
		}
	},

	DrawLabel: function( ctx, p1, p2, alignment, padding ) {
		if (!alignment) alignment = 'center';
		if (!padding) padding = 0;

		var dx = p2.x - p1.x,
			dy = p2.y - p1.y,
			distance = Math.sqrt(dx*dx+dy*dy),
			calcDistance = 0,
			p, pad,
			scale,
			text;

		// Keep text upright
		var angle = Math.atan2(dy,dx);
		if (angle < -Math.PI/2 || angle > Math.PI/2){
			p = p1;
			p1 = p2;
			p2 = p;
			dx *= -1;
			dy *= -1;
			angle -= Math.PI;
		}

		if (alignment=='center'){
			p = p1;
			pad = 1/2;
		} else {
			var left = alignment=='left';
			p = left ? p1 : p2;
			pad = padding / Math.sqrt(dx*dx+dy*dy) * (left ? 1 : -1);
		}

		ctx.font = "14px Arial";
		scale = 50 * WORKSPACE.ViewModels.CombatViewModel.TokenScale();
		calcDistance = ((distance/scale)*5).toFixed(1);
		text = calcDistance + " ft";

		if(calcDistance > 2) {
			ctx.save();
			ctx.textAlign = alignment;
			ctx.translate(p.x+dx*pad,p.y+dy*pad);
			ctx.rotate(Math.atan2(dy,dx));
			ctx.fillStyle = "red";
			//ctx.strokeStyle = "white";
			ctx.fillText(text,0,-5);
			//ctx.strokeText(text, 0, -5);
			ctx.restore();
		}
		return calcDistance;
	},

	SwapMap: function(url,blank) {
		if(WORKSPACE.CurrentGridImage != url || blank) {
			WORKSPACE.CurrentGridImage = url;
			var img = new Image();

			if(blank) {
				var bounds = [[0,0], [blank.height,blank.width]];

				if(WORKSPACE.GridImageOverlay)
					WORKSPACE.GridMap.removeLayer(WORKSPACE.GridImageOverlay);

				WORKSPACE.GridImageOverlay = new L.imageOverlay(null, bounds);
				WORKSPACE.GridImageOverlay.addTo(WORKSPACE.GridMap);
				WORKSPACE.GridMap.fitBounds(bounds);
			} else {
				img.onload = function(){
					var height = img.height,
						width = img.width,
						ratio = width/height;

					var bounds = [[0,0], [100,100*ratio]];

					if(WORKSPACE.GridImageOverlay)
						WORKSPACE.GridMap.removeLayer(WORKSPACE.GridImageOverlay);

					WORKSPACE.GridImageOverlay = new L.imageOverlay(img.src, bounds);
					WORKSPACE.GridImageOverlay.addTo(WORKSPACE.GridMap);
					WORKSPACE.GridMap.fitBounds(bounds);
				};
				img.src = url;
			}
		}
		WORKSPACE.GridMap.invalidateSize();
	},

	TextFix: function(el) {
		$(el).css({'height':'auto','overflow-y':'hidden'}).height(el.scrollHeight);
	},

	Roll: function(min, max) {
		return Math.floor((Math.random() * parseInt(max)) + parseInt(min));
	},

	AddNPC: function(data, event){
		WORKSPACE.ViewModels.NPCsViewModel.CurrentNPCId = data.Id;
		WORKSPACE.NPCGroups.dialog("open");
	},
	
	AddSpell: function(data, event){
		WORKSPACE.ViewModels.SpellsViewModel.CurrentSpellId = data.Id;
		WORKSPACE.Spellbooks.dialog("open");
	},
	
	ViewSpell: function(id, event){
		WORKSPACE.SpellViewVM.Load(id, SPELLS[id]);
		WORKSPACE.ViewModels.SpellsViewModel.CurrentSpellId = id;
		WORKSPACE.SpellView.dialog("option", "title", SPELLS[id].Name);
		WORKSPACE.SpellView.dialog("open");
	},

	ViewItem: function(id, event){
		WORKSPACE.ItemViewVM.Load(id, MAGIC[id]);
		WORKSPACE.ViewModels.LootViewModel.CurrentItemId = id;
		WORKSPACE.ItemView.dialog("option", "title", MAGIC[id].name);
		WORKSPACE.ItemView.dialog("open");
	},

	ViewNPC: function(id, event){
		WORKSPACE.NPCViewVM.Load(id, MONSTERS[id]);
		WORKSPACE.ViewModels.NPCsViewModel.CurrentNPCId = id;
		WORKSPACE.NPCView.dialog("option", "title", MONSTERS[id].name);
		WORKSPACE.NPCView.dialog("open");
		WORKSPACE.NPCViewVM.PopulateSimilar();
	},
	
	RenameBook: function(event){
		WORKSPACE.RenameBook.dialog("open");
	},

	RenameGroup: function(event){
		WORKSPACE.RenameGroup.dialog("open");
	},

	RenameGame: function(event){
		WORKSPACE.RenameGame.dialog("open");
	},

	Throttle: function (callback, limit) {
		var wait = false;
		return function (args) {
			if (!wait) {
				callback.apply(null, arguments);
				wait = true;
				setTimeout(function () {
					wait = false;
				}, limit);
			}
		};
	}
};

var Panel = function(title, contents, position, style) {
	this.title = title;
	this.contents = contents;
	this.position = position;
	var tmp = style,
		styleStr = "";
		
	$.each(tmp, function(i, v) {
		styleStr += i + ":" + v + ";";
	});
	
	this.style = styleStr;
	//this.contents = $("." + this.title.toLowerCase()+"viewmodel-inc");
	var viewmodel = this.title+"ViewModel"; //this.title.substr(0,1).toUpperCase()+this.title.substr(1)+"ViewModel";
	if (typeof window[viewmodel] == "function") {
		WORKSPACE.ViewModels[viewmodel] = new window[viewmodel]();
	}
};

$(function() {
	
	// fix bad things
	//WORKSPACE.Clear();

	var SaveThrottle = WORKSPACE.Helpers.Throttle( WORKSPACE.Save, 400 );
	var CombatThrottle = WORKSPACE.Helpers.Throttle( WORKSPACE.Helpers.SaveCombatVM, 100 );

	String.prototype.hashCode = function(){
		var hash = 0;
		if (this.length === 0) return hash;
		for (i = 0; i < this.length; i++) {
			char = this.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash;
		}
		return hash;
	};

	String.prototype.levenstein = function(string) {
		var a = this, b = string + "", m = [], i, j, min = Math.min;

		if (!(a && b)) return (b || a).length;

		for (i = 0; i <= b.length; m[i] = [i++]);
		for (j = 0; j <= a.length; m[0][j] = j++);

		for (i = 1; i <= b.length; i++) {
			for (j = 1; j <= a.length; j++) {
				m[i][j] = b.charAt(i - 1) == a.charAt(j - 1) ? 
					m[i - 1][j - 1] : 
						m[i][j] = min( m[i - 1][j - 1] + 1, min(m[i][j - 1] + 1, m[i - 1 ][j] + 1));
			}
		}

		return m[b.length][a.length];
	};
	
	ko.extenders.defaultIfNull = function(target, defaultValue) {
		var result = ko.computed({
			read: target,
			write: function(newValue) {
				if (!newValue) {
					target(defaultValue);
				} else {
					target(newValue);
				}
			}
		});

		result(target());

		return result;
	};

	ko.extenders.trackChange = function (target, track) {
		if (track) {
			target.originalValue = target();
			target.setOriginalValue = function(startingValue) {
				target.originalValue = startingValue;
			};
			target.subscribe(function (newValue) {
				if (newValue != target.originalValue) { 
					CombatThrottle();
					SaveThrottle();
					target.setOriginalValue(newValue);
				}
			});
		}
		return target;
	};
	ko.options.deferUpdates = true;

	// load it up
	WORKSPACE.Init();
});