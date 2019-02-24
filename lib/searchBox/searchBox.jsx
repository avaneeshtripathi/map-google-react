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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var searchBoxStyles_1 = require("./searchBoxStyles");
var SearchBox = /** @class */ (function (_super) {
    __extends(SearchBox, _super);
    function SearchBox() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            suggestions: [],
            inputValue: '',
        };
        _this.isUnmounted = false;
        _this.handleInputChange = function (inputValue) { return _this.setState({ inputValue: inputValue }); };
        _this.handleSearch = function (e) {
            var inputValue = e.target.value || '';
            _this.setState(function (_a) {
                var suggestions = _a.suggestions;
                return ({
                    inputValue: inputValue,
                    suggestions: inputValue ? suggestions : [],
                });
            });
            if (_this.autocompleteService && inputValue) {
                var searchOptions = { input: inputValue };
                if (_this.props.searchOptions) {
                    var _a = _this.props.searchOptions, location_1 = _a.location, rest = __rest(_a, ["location"]);
                    searchOptions = __assign({}, searchOptions, rest, (location_1 && {
                        location: new google.maps.LatLng(location_1.lat, location_1.lng),
                    }));
                }
                _this.autocompleteService.getPlacePredictions(searchOptions, _this.autocompleteCallback);
            }
        };
        _this.autocompleteCallback = function (suggestions, status) {
            if (status !== _this.autocompleteOK) {
                _this.clearSuggestions();
                return;
            }
            _this.setState({
                suggestions: suggestions.map(function (suggestion, index) { return (__assign({}, suggestion, { placeId: suggestion.place_id, active: index === 0 })); }),
            });
        };
        _this.clearSuggestions = function () { return _this.setState({ suggestions: [] }); };
        _this.handleInputKeyDown = function (event) {
            switch (event.key) {
                case 'Enter':
                    event.preventDefault();
                    _this.handleEnterKey();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    _this.handleDownKey();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    _this.handleUpKey();
                    break;
                case 'Escape':
                    _this.clearSuggestions();
                    break;
            }
        };
        _this.handleEnterKey = function () {
            var activeSuggestionIndex = _this.getActiveSuggestionIndex();
            var _a = _this.state, inputValue = _a.inputValue, suggestions = _a.suggestions;
            if (typeof activeSuggestionIndex === 'undefined') {
                _this.handleSelect({ description: inputValue });
            }
            else {
                _this.handleSelect(suggestions[activeSuggestionIndex]);
            }
        };
        _this.handleDownKey = function () {
            var suggestions = _this.state.suggestions;
            if (!suggestions.length)
                return;
            var activeSuggestionIndex = _this.getActiveSuggestionIndex();
            _this.selectActiveAtIndex(typeof activeSuggestionIndex === 'undefined' ||
                activeSuggestionIndex === suggestions.length - 1
                ? 0
                : activeSuggestionIndex + 1);
        };
        _this.handleUpKey = function () {
            var suggestions = _this.state.suggestions;
            if (!suggestions.length)
                return;
            var activeSuggestionIndex = _this.getActiveSuggestionIndex();
            _this.selectActiveAtIndex(!activeSuggestionIndex
                ? suggestions.length - 1
                : activeSuggestionIndex - 1);
        };
        _this.selectActiveAtIndex = function (selected) {
            return _this.setState(function (_a) {
                var suggestions = _a.suggestions;
                return ({
                    suggestions: suggestions.map(function (suggestion, index) { return (__assign({}, suggestion, { active: index === selected })); }),
                    inputValue: suggestions[selected].description,
                });
            });
        };
        _this.getActiveSuggestionIndex = function () {
            return _this.state.suggestions.findIndex(function (suggestion) { return suggestion.active; });
        };
        _this.onSuggestionClick = function (suggestion) { return function () {
            return _this.handleSelect(suggestion);
        }; };
        _this.handleSelect = function (place) {
            if (!place)
                return;
            _this.setState({ suggestions: [], inputValue: place.description });
            _this.props.onPlacesChanged(place);
        };
        return _this;
    }
    SearchBox.prototype.componentDidMount = function () {
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
        this.autocompleteOK = window.google.maps.places.PlacesServiceStatus.OK;
        if (this.props.onMount)
            this.props.onMount();
    };
    SearchBox.prototype.componentWillUnmount = function () {
        this.isUnmounted = true;
    };
    SearchBox.prototype.render = function () {
        var _this = this;
        var _a = this.props, elementId = _a.elementId, placeholder = _a.placeholder, _b = _a.inputStyle, inputStyle = _b === void 0 ? {} : _b, _c = _a.suggestionStyle, suggestionStyle = _c === void 0 ? {} : _c;
        var _d = this.state, suggestions = _d.suggestions, inputValue = _d.inputValue;
        return (<div style={searchBoxStyles_1.searchBoxCtr}>
                <input autoComplete="off" id={elementId} placeholder={placeholder || 'Search location'} style={__assign({}, searchBoxStyles_1.searchInput, inputStyle)} value={inputValue} onChange={this.handleSearch} onKeyDown={this.handleInputKeyDown} onFocus={this.handleSearch} type="text"/>
                {suggestions && suggestions.length ? (<div style={searchBoxStyles_1.suggestionsCtr}>
                        {suggestions.map(function (suggestion, index) { return (<div key={index} onClick={_this.onSuggestionClick(suggestion)} style={__assign({}, searchBoxStyles_1.suggestionItem, (suggestion.active && __assign({}, searchBoxStyles_1.active)), { '&:hover': searchBoxStyles_1.hover }, suggestionStyle)}>
                                    <span>{suggestion.description}</span>
                                </div>); })}
                    </div>) : null}
            </div>);
    };
    return SearchBox;
}(react_1.default.Component));
exports.default = SearchBox;
//# sourceMappingURL=searchBox.jsx.map