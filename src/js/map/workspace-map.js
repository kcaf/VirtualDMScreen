var WORKSPACE = {
	VIEW: 1,
	DEBUG: false,
	ViewModels: {},
	GridLayers: [],
	GridImageOverlay: null,
	PreviousMapImage: null,
	IsLoaded: false,
	ShowDistance: false,
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
	DistanceFrom: {
		top: 0,
		left: 0
	}
};

WORKSPACE.Helpers = {

	DrawLights: function() {
		if(!WORKSPACE.ViewModels.CombatViewModel.ShowDarkness()) return;

		var canvas = $("#grid-light"),
			ctx = canvas[0].getContext('2d'),
			ambientLight = 0.00,
			intensity = 1,
			radius = 600 * WORKSPACE.ViewModels.CombatViewModel.TokenScale(),
			diameter = radius*2,
			//amb = 'rgba(0,0,0,' + (1-ambientLight) + ')',
			amb = WORKSPACE.ViewModels.CombatViewModel.FogColor(),
			mapSize = WORKSPACE.GridMap.getSize();

		ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
		canvas.css("top", -diameter + "px");
		canvas.css("left", -diameter + "px");
		canvas.attr("width", mapSize.x + diameter*2 + "px");
		canvas.attr("height", mapSize.y + diameter*2 + "px");

		$(".leaflet-marker-icon").each(function(i, v) {
			var ele = $(v);

			if(!ele.hasClass("player")) return;

			var	offset = ele.offset(),
				offsetLeft = offset.left + ele.width()/2 + diameter,
				offsetTop = offset.top + ele.height()/2 + diameter,
				gradient = ctx.createRadialGradient(offsetLeft, offsetTop, 0, offsetLeft, offsetTop, radius);

			gradient.addColorStop(1, 'rgba(0,0,0,' + (1-intensity) + ')');
			//gradient.addColorStop(0.6, 'rgba(0,0,0,0.1)');
			//gradient.addColorStop(0.4, 'rgba(0,0,0,0.4)');
			gradient.addColorStop(0, amb);
			ctx.fillStyle = gradient;
			ctx.fillRect(offsetLeft-radius, offsetTop-radius, offsetLeft+radius, offsetTop+radius);
		});

		ctx.fillStyle = amb;
		ctx.globalCompositeOperation = 'xor';
		ctx.fillRect(0, 0, mapSize.x + diameter*2, mapSize.y + diameter*2);
	},

	DisableDistance: function( event ) {
		if (event.which > 1) {
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
		calcDistance = ((distance/50)*5).toFixed(1);
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

	SwapMap: function(url) {
		if(WORKSPACE.PreviousMapImage == url){
			return;
		}
		WORKSPACE.PreviousMapImage = url;
		var img = new Image();
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
	},

	Throttle: function (callback, limit) {
		var wait = false;
		return function () {
			if (!wait) {
				callback.call();
				wait = true;
				setTimeout(function () {
					wait = false;
				}, limit);
			}
		};
	}
};

WORKSPACE.Shim = function() {
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
		attributionControl: false,
		zoomControl: false,
		scrollWheelZoom: false,
		touchZoom: false,
		doubleClickZoom: false,
		boxZoom: false,
		dragging: false

	});

	var map = WORKSPACE.GridMap;

	map.on("contextmenu", function(event) {
			// Do nothing
	});

	map.on("mousemove", function(event) {
		WORKSPACE.Helpers.DrawDistance(event.originalEvent);
	});

	map.on("mouseup", function(event) {
		WORKSPACE.Helpers.DisableDistance(event.originalEvent);
	});

	$(document).on("mouseup", function(event) {
		WORKSPACE.Helpers.DisableDistance(event);
	});

	map.on("move", function(event) {
		var gridlines = $("#grid-lines"),
			imglayer = $(".leaflet-image-layer");
		if(!imglayer[0]) return;
		gridlines.css("transform", imglayer[0].style.transform);
		gridlines.css("width", imglayer.width());
		gridlines.css("height", imglayer.height());
		WORKSPACE.Helpers.DrawLights();
	});

	map.on("mousedown", function(event) {
		var e = event.originalEvent,
			from = WORKSPACE.DistanceFrom;
		e.stopPropagation();
		if (e.which > 1) {
			from.left = e.pageX;
			from.top = e.pageY;
			WORKSPACE.ShowDistance = true;
		}
	});

	map.on("load", function(event) { WORKSPACE.Helpers.DrawLights(); });

	map.on("viewreset", function(event) { WORKSPACE.Helpers.DrawLights(); });

	map.on("moveend", function(event) { WORKSPACE.Helpers.DrawLights(); });

	map.on("zoomend", function(event) { WORKSPACE.Helpers.DrawLights(); });

	map.on("zoomlevelschange", function(event) { WORKSPACE.Helpers.DrawLights(); });

	map.on("zoomlevelschange", function(event) { WORKSPACE.Helpers.DrawLights(); });

	map.on("layeradd", function(event) { WORKSPACE.Helpers.DrawLights(); });

	map.on("dragend", function(event) { WORKSPACE.Helpers.DrawLights(); });

	$("#grid-lines").appendTo($(".leaflet-map-pane"));
};