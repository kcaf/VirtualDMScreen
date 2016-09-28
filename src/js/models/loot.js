var ItemModel = function(){
	var _this = this;
	_this.Id = ko.observable();
	_this.Name = ko.observable().extend({ trackChange: true });
	_this.Text = ko.observable().extend({ trackChange: true });
	_this.IsRemoveVisible = ko.observable(false);
	
	_this.ShowRemove = function(){
		_this.IsRemoveVisible(true);
	};
	
	_this.HideRemove = function(){
		_this.IsRemoveVisible(false);
	};
	
	
	_this.Load = function(id, item){
		_this.Id(id);
		_this.Name(item.name);
		_this.Text(item.text);
	};
};

var LootViewModel = function() {
	var _this = this;
	_this.Selector = null;
	_this.ActiveTab = ko.observable(0).extend({ trackChange: true });
	_this.CurrentItemId = 0;
	_this.SearchList = ko.observableArray().extend({ trackChange: true });
	_this.GenerateList = ko.observableArray().extend({ trackChange: true });
	_this.Position = ko.observable({Left: 0, Top: 0}).extend({ trackChange: true });
	_this.IsMinimized = ko.observable(true).extend({ trackChange: true });
	_this.Search = ko.observable("").extend({ rateLimit: 500, trackChange: true });
	_this.CR = ko.observable(1);
	_this.CRList = ko.observableArray(WORKSPACE.CRArray);
	_this.Type = ko.observableArray(["Individual", "Hoard"]);
	_this.SelectedType = ko.observable();
	_this.RarityChance = ko.observable({
		"Coin": 80,
		"Common": 30,
		"Uncommon": 15,
		"Rare": 5,
		"Very Rare": 2,
		"Legendary": 1
	});
	_this.Rarity = ko.observableArray(["Coin","Common","Uncommon","Rare","Very Rare","Legendary","Artifact","Unique"]);
	_this.SelectedRarity = ko.observableArray();
	_this.SearchRarity = ko.observableArray(["ANY","Common","Uncommon","Rare","Very Rare","Legendary","Artifact","Unique"]);
	_this.SelectedSearchRarity = ko.observableArray().extend({ trackChange: true });
	_this.Amount = ko.observable(1);
	_this.AmountList = ko.observableArray([1,2,3,4,5,6,7,8,9,10]);
	
	_this.SearchGrid = new ko.simpleGrid.viewModel({
        data: _this.SearchList,
        type: "lootsearch",
        columns: [
            { headerText: "Name", rowText: "Name" },
            { headerText: "Attune", rowText: "Attune" },
            { headerText: "Rarity", rowText: "Rarity" },
            { headerText: "Id", rowText: "Id" }
        ],
        pageSize: 6
    });
    
    _this.GenerateGrid = new ko.simpleGrid.viewModel({
        data: _this.GenerateList,
        columns: [
            { headerText: "Coin", rowText: "Coin" },
            { headerText: "Magic", rowText: "Magic" }
        ],
        pageSize: 6
    });
	
	_this.SelectedRarity.subscribe(function(newValue) {
		//WORKSPACE.Save("Loot Generate");
	});

	_this.SetActiveTab = function(index) {
		_this.ActiveTab(index);
	};
	
	_this.Load = function(data) {
		_this.ActiveTab(data.ActiveTab || 0);
		_this.Search(data.Search || "");
		_this.Amount(data.Amount || "1d6");
		_this.GenerateList(data.GenerateList || []);
		_this.SelectedType(data.SelectedType || "Individual");
		_this.SelectedRarity(data.SelectedRarity || "Coin");
		_this.SelectedSearchRarity(data.SelectedSearchRarity || "ANY");
		_this.Position({
			Left: data.Position.Left || 0,
			Top: data.Position.Top || 0
		});
		_this.IsMinimized(data.IsMinimized);
	};
	
	_this.Search.subscribe(function(newValue) {
		_this.RunSearch();
	});

	_this.SelectedSearchRarity.subscribe(function(newValue) {
		_this.RunSearch();
	});

	_this.PickRandom = function(){
		if (_this.SearchList().length > 1) {
			_this.PickRandomAction();
		} else {
			_this.RunSearch();
			_this.PickRandomAction();
		}
	};

	_this.PickRandomAction = function(){
		if (_this.SearchList().length > 1) {
			var rand = (WORKSPACE.Helpers.Roll(1, _this.SearchList().length)) - 1;
			var pick = _this.SearchList()[rand];
			_this.SearchList.removeAll();
			_this.SearchGrid.currentPageIndex(0);
			_this.SearchList.push(pick);
		}
	};

	_this.RunSearch = function(){
		if (_this.Search() === "" && _this.SelectedSearchRarity() == "ANY") {
			_this.SearchList.removeAll();
			_this.SearchGrid.currentPageIndex(0);
			return;
		}
		_this.SearchList.removeAll();
		_this.SearchGrid.currentPageIndex(0);
		var Selectable = [];
		$.each(MAGIC, function(i, v) {
			if (v.name.toLowerCase().indexOf(_this.Search().toLowerCase()) !== -1 && 
				(_this.SelectedSearchRarity() == "ANY" || 
					(v.rarity !== undefined && v.rarity.toLowerCase() == _this.SelectedSearchRarity().toLowerCase()) )) {
				Selectable.push(i);
			}
		});
		var selectarr = [];
		for(i=0; i<Selectable.length; i++) {
			selectarr.push({
				Id: Selectable[i],
				Name: MAGIC[Selectable[i]].name,
				Rarity: MAGIC[Selectable[i]].rarity,
				Attune: MAGIC[Selectable[i]].attune
			});
		}
		_this.SearchList(selectarr);
	};
	
	_this.Generate = function() {
		_this.GenerateList.removeAll();
		_this.GenerateGrid.currentPageIndex(0);
		var input = _this.Amount().split('d');
		if (input.length != 2)
			return;
			
		
			
		/*
		if (_this.SelectedRarity() == "" || _this.SelectedRarity() == "ALL") {
			for(i=0; i<parseInt(input[0]); i++) { // number of dice
				var amt = WORKSPACE.Helpers.Roll(parseInt(input[1])); // roll dice
				for(v=0; v<amt; v++) {
					var index = WORKSPACE.Helpers.Roll(MAGIC.Name.length-1);
					_this.GenerateList.push({
						Name: MAGIC.Name[index],
						Rarity: MAGIC.Rarity[index],
						Attune: MAGIC.Attunement[index],
						Page: MAGIC.Page[index]
					});
				}
			}
		} else {
			var Selectable = [];
			var SelectedRarity = _this.SelectedRarity();
			$.each(MAGIC.Rarity, function(i, v) {
				if (v == SelectedRarity)
					Selectable.push(i);
			});
			if (Selectable.length > 0) {
				for(i=0; i<parseInt(input[0]); i++) { // number of dice
					var amt = WORKSPACE.Helpers.Roll(parseInt(input[1])); // roll dice
					for(v=0; v<amt; v++) {
						var index = Selectable[WORKSPACE.Helpers.Roll(Selectable.length-1)];
						_this.GenerateList.push({
							Name: MAGIC.Name[index],
							Rarity: MAGIC.Rarity[index],
							Attune: MAGIC.Attunement[index],
							Page: MAGIC.Page[index]
						});
					}
				}
			}
		}
		*/
		
		//WORKSPACE.Save();
	};
	
	/*ko.pureComputed(function() {
		_this.Position();
		_this.IsMinimized();
		_this.SearchList();
		_this.GenerateList();
		WORKSPACE.SaveViewModel.Run();
	});*/
};

LootViewModel.prototype.toJSON = function() {
    var copy = ko.toJS(this);
    delete copy.AmountList;
    delete copy.SearchRarity;
    delete copy.RarityChance;
    delete copy.CRList;
    delete copy.GenerateList;
    delete copy.SearchList;
    delete copy.SearchGrid;
    delete copy.GenerateGrid;
    return copy;
};