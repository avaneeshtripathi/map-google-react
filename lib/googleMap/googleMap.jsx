"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var searchBox_1 = require("../searchBox/searchBox");
var googleMapStyles_1 = require("./googleMapStyles");
var INFO_WINDOW = "\n    <div style=\"display: flex; flex-direction: column; font-size: 12px\">\n        <b>mainText</b>\n        <span>secondaryText</span>\n    </div>\n";
var GoogleMap = /** @class */ (function (_super) {
    __extends(GoogleMap, _super);
    function GoogleMap() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            scriptLoaded: false,
            center: _this.props.defaultCenter,
            marker: _this.props.defaultCenter
                ? { position: _this.props.defaultCenter }
                : null,
        };
        _this.isUnmounted = false;
        _this.searchInput = null;
        _this.initialise = function (cb) {
            var _a = _this.props, defaultZoom = _a.defaultZoom, mapElementId = _a.mapElementId;
            var center = _this.state.center;
            // INITIALISE GOOGLE MAPS
            _this.map = new google.maps.Map(document.getElementById(mapElementId), {
                zoom: defaultZoom,
                center: center,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                scaleControl: false,
                zoomControl: true,
                disableDoubleClickZoom: true,
                clickableIcons: false,
            });
            // INITIALISE PLACES SERVICE
            _this.placesService = new google.maps.places.PlacesService(_this.map);
            // INITIALISE GEOCODER SERVICE
            _this.geocoderService = new google.maps.Geocoder();
            // ADD LISTENER TO MAP TO PIN LOCATION DIRECTLY
            google.maps.event.addListener(_this.map, 'click', function (event) {
                return _this.handleMapClick(event);
            });
            if (cb)
                cb();
        };
        _this.onScriptLoad = function () {
            return _this.initialise(function () {
                return _this.setState({ scriptLoaded: true }, function () {
                    if (_this.props.onMapLoaded)
                        _this.props.onMapLoaded();
                });
            });
        };
        _this.handleMapClick = function (_a) {
            var latLng = _a.latLng;
            if (!_this.geocoderService)
                return;
            var request = { location: { lat: latLng.lat(), lng: latLng.lng() } };
            _this.geocoderService.geocode(request, function (result) {
                var position = result[0].geometry.location;
                var nextMarker = position ? { position: position } : {};
                var nextCenter = nextMarker.position
                    ? nextMarker.position
                    : _this.state.center;
                var _a = result[0].formatted_address.split(' - '), main_text = _a[0], rest = _a.slice(1);
                var secondary_text = rest.join(' - ');
                _this.setState({ center: nextCenter, marker: nextMarker }, function () {
                    if (!position) {
                        if (_this.props.errorHandler)
                            _this.props.errorHandler();
                        return;
                    }
                    if (_this.searchInput) {
                        _this.searchInput.handleInputChange(result[0].formatted_address);
                    }
                    var place = {
                        structured_formatting: {
                            main_text: main_text,
                            secondary_text: secondary_text,
                        },
                    };
                    _this.setMarker(nextCenter, place, _this.props.onPlacesChanged);
                });
            });
        };
        _this.onPlacesChanged = function (place) {
            if (!_this.placesService)
                return;
            var request = { placeId: place.placeId };
            // IF FIELDS ARE PROVIDED TO FILTER DETAILS DATA
            if (_this.props.placesOptions)
                request['fields'] = _this.props.placesOptions;
            _this.placesService.getDetails(request, function (result) {
                var position = result.geometry.location;
                var nextMarker = position ? { position: position } : {};
                var nextCenter = nextMarker.position
                    ? nextMarker.position
                    : _this.state.center;
                _this.setState({ center: nextCenter, marker: nextMarker }, function () {
                    if (!position) {
                        if (_this.props.errorHandler)
                            _this.props.errorHandler();
                        return;
                    }
                    _this.setMarker(nextCenter, place, _this.props.onPlacesChanged);
                });
            });
        };
        _this.setMarker = function (nextCenter, place, cb) {
            // RESET MARKER IF ALREADY PRESENT
            if (_this.markerService && _this.markerService.setMap)
                _this.markerService.setMap(null);
            var center = new google.maps.LatLng(nextCenter.lat(), nextCenter.lng());
            var markerObj = { position: center, map: _this.map };
            if (_this.props.markerIconUrl)
                markerObj['icon'] = _this.props.markerIconUrl;
            _this.markerService = new google.maps.Marker(markerObj);
            // CREATE INFO WINDOW FOR THE PIN LOCATION
            var _a = place.structured_formatting, main_text = _a.main_text, secondary_text = _a.secondary_text;
            var contentString = INFO_WINDOW.replace('mainText', main_text).replace('secondaryText', secondary_text);
            _this.infoWindow = new google.maps.InfoWindow({
                content: contentString,
            });
            _this.infoWindow.open(_this.map, _this.markerService);
            // RE CENTER MAP ACCORDING TO PINNED LOCATION
            if (_this.map)
                _this.map.panTo(center);
            if (cb)
                cb();
        };
        return _this;
    }
    GoogleMap.prototype.componentWillMount = function () {
        if (!this.props.googleMapUrl && this.props.errorHandler) {
            this.props.errorHandler();
        }
    };
    GoogleMap.prototype.componentDidMount = function () {
        var scriptjs = require("scriptjs");
        var googleMapUrl = this.props.googleMapUrl;
        scriptjs(googleMapUrl, this.onScriptLoad);
    };
    GoogleMap.prototype.componentWillUnmount = function () {
        this.isUnmounted = true;
    };
    GoogleMap.prototype.render = function () {
        var _this = this;
        var _a = this.props, mapElementId = _a.mapElementId, searchElementId = _a.searchElementId, onSearchBoxMounted = _a.onSearchBoxMounted, searchPlaceholder = _a.searchPlaceholder, searchOptions = _a.searchOptions, inputStyle = _a.inputStyle, suggestionStyle = _a.suggestionStyle;
        var scriptLoaded = this.state.scriptLoaded;
        return (<div style={googleMapStyles_1.ctr}>
                <div style={googleMapStyles_1.mapCtr} id={mapElementId}/>
                {scriptLoaded && searchElementId ? (<searchBox_1.default ref={function (ref) { return (_this.searchInput = ref); }} placeholder={searchPlaceholder} searchOptions={searchOptions} elementId={searchElementId} onMount={onSearchBoxMounted} onPlacesChanged={this.onPlacesChanged} inputStyle={inputStyle} suggestionStyle={suggestionStyle}/>) : null}
            </div>);
    };
    return GoogleMap;
}(react_1.default.Component));
exports.default = GoogleMap;
//# sourceMappingURL=googleMap.jsx.map