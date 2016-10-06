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

var RaritySettingModel = function(name, chance, min, max, rangemin, rangemax, step) {
	var _this = this;
	_this.Name = ko.observable(name);
	_this.Chance = ko.observable(chance);
	_this.Min = ko.observable(min);
	_this.Max = ko.observable(max);
	_this.RangeMin = ko.observable(rangemin);
	_this.RangeMax = ko.observable(rangemax);
	_this.Step = ko.observable(step);

	_this.ChanceText = ko.pureComputed(function() {
		return _this.Chance() + "%";
	});

	_this.MinMaxText  = ko.pureComputed(function() {
		return _this.Min() + " - " + _this.Max();
	});
};

RaritySettingModel.prototype.toJSON = function() {
    var copy = ko.toJS(this);
    delete copy.ChanceText;
    delete copy.MinMaxText;
    return copy;
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
	_this.Type = ko.observableArray(["Individual", "Hoard"]);
	_this.SelectedType = ko.observable().extend({ trackChange: true });
	_this.RaritySettings = ko.observableArray([
		new RaritySettingModel("Coin", 100, 200, 600, 0, 50000, 100),
		new RaritySettingModel("Common", 60, 1, 6, 0, 10, 1),
		new RaritySettingModel("Uncommon", 40, 1, 4, 0, 10, 1),
		new RaritySettingModel("Rare", 20, 1, 2, 0, 10, 1),
		new RaritySettingModel("Very Rare", 10, 1, 1, 0, 10, 1),
		new RaritySettingModel("Legendary", 5, 1, 1, 0, 10, 1),
		new RaritySettingModel("Artifact", 0, 0, 0, 0, 10, 1),
		new RaritySettingModel("Unique", 0, 0, 0, 0, 10, 1)
	]).extend({ trackChange: true });
	_this.Rarity = ko.observableArray(["Coin","Common","Uncommon","Rare","Very Rare","Legendary","Artifact","Unique"]);
	_this.SelectedRarity = ko.observableArray().extend({ trackChange: true });
	_this.SearchRarity = ko.observableArray(["ANY","Common","Uncommon","Rare","Very Rare","Legendary","Artifact","Unique"]);
	_this.SelectedSearchRarity = ko.observableArray().extend({ trackChange: true });
	
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
        type: "lootgen",
        columns: [
        	{ headerText: "Id", rowText: "Id" },
            { headerText: "Name", rowText: "Name" },
            { headerText: "Value", rowText: "Value" }
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
		_this.GenerateList(data.GenerateList || []);
		_this.SelectedType(data.SelectedType || "Individual");
		_this.SelectedRarity(data.SelectedRarity || "Coin");
		_this.SelectedSearchRarity(data.SelectedSearchRarity || "ANY");
		_this.Position({
			Left: data.Position.Left || 0,
			Top: data.Position.Top || 0
		});
		_this.IsMinimized(data.IsMinimized);

		if(data.RaritySettings) {
			var tmp = [];
			$.each(data.RaritySettings, function(i, v) {
				tmp.push(
					new RaritySettingModel(
						v.Name,
						v.Chance,
						v.Min,
						v.Max,
						v.RangeMin,
						v.RangeMax,
						v.Step
					)
				);
			});
			_this.RaritySettings(tmp);
		}
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

		$.each(_this.SelectedRarity(), function(i, v) {
			if(_this.SelectedType() == "Individual" && v != "Coin")
				return;

			var chance, amount, index, item, selectable;
			$.each(_this.RaritySettings(), function(z, x) {
				if(x.Name() == v){
					chance = WORKSPACE.Helpers.Roll(0, 100);
					if(chance < x.Chance()){
						amount = WORKSPACE.Helpers.Roll(x.Min(), x.Max());
						if(v == "Coin") {
							_this.GenerateList.push({
								Id: null,
								Name: "Coin",
								Value: _this.SelectedType() == "Individual" ? (amount/30).toFixed(2) : amount,
							});
						} else {
							selectable = [];
							$.each(MAGIC, function(mi, mv) {
								if (mv.rarity.toLowerCase() == v.toLowerCase()) {
									selectable.push(mi);
								}
							});
							if(selectable.length) {
								for(a=0; a<amount; a++) {
									var rand = WORKSPACE.Helpers.Roll(0, selectable.length-1);
									index = selectable[rand];
									item = MAGIC[index];
									console.log(rand,index,selectable.length,item);
									_this.GenerateList.push({
										Id: index,
										Name: item.name,
										Value: item.rarity
									});
								}
							}
						}
					}
				}
			});
		});
	};
};

LootViewModel.prototype.toJSON = function() {
    var copy = ko.toJS(this);
    delete copy.Rarity;
    delete copy.SearchRarity;
    delete copy.SearchList;
    delete copy.SearchGrid;
    delete copy.GenerateList;
    delete copy.GenerateGrid;
    return copy;
};