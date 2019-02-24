import React from 'react';
import { searchBoxCtr, searchInput, suggestionsCtr, suggestionItem, active, hover, } from './searchBoxStyles';
class SearchBox extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            suggestions: [],
            inputValue: '',
        };
        this.isUnmounted = false;
        this.autocompleteService = null;
        this.autocompleteOK = null;
        this.handleInputChange = (inputValue) => this.setState({ inputValue });
        this.handleSearch = (e) => {
            const inputValue = e.target.value || '';
            this.setState(({ suggestions }) => ({
                inputValue,
                suggestions: inputValue ? suggestions : [],
            }));
            if (this.autocompleteService && inputValue) {
                let searchOptions = { input: inputValue };
                if (this.props.searchOptions) {
                    const { location, ...rest } = this.props.searchOptions;
                    searchOptions = {
                        ...searchOptions,
                        ...rest,
                        ...(location && {
                            location: new google.maps.LatLng(location.lat, location.lng),
                        }),
                    };
                }
                this.autocompleteService.getPlacePredictions(searchOptions, this.autocompleteCallback);
            }
        };
        this.autocompleteCallback = (suggestions, status) => {
            if (status !== this.autocompleteOK) {
                this.clearSuggestions();
                return;
            }
            this.setState({
                suggestions: suggestions.map((suggestion, index) => ({
                    ...suggestion,
                    placeId: suggestion.place_id,
                    active: index === 0,
                })),
            });
        };
        this.clearSuggestions = () => this.setState({ suggestions: [] });
        this.handleInputKeyDown = event => {
            switch (event.key) {
                case 'Enter':
                    event.preventDefault();
                    this.handleEnterKey();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.handleDownKey();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.handleUpKey();
                    break;
                case 'Escape':
                    this.clearSuggestions();
                    break;
            }
        };
        this.handleEnterKey = () => {
            const activeSuggestionIndex = this.getActiveSuggestionIndex();
            const { inputValue, suggestions } = this.state;
            if (typeof activeSuggestionIndex === 'undefined') {
                this.handleSelect({ description: inputValue });
            }
            else {
                this.handleSelect(suggestions[activeSuggestionIndex]);
            }
        };
        this.handleDownKey = () => {
            const { suggestions } = this.state;
            if (!suggestions.length)
                return;
            const activeSuggestionIndex = this.getActiveSuggestionIndex();
            this.selectActiveAtIndex(typeof activeSuggestionIndex === 'undefined' ||
                activeSuggestionIndex === suggestions.length - 1
                ? 0
                : activeSuggestionIndex + 1);
        };
        this.handleUpKey = () => {
            const { suggestions } = this.state;
            if (!suggestions.length)
                return;
            const activeSuggestionIndex = this.getActiveSuggestionIndex();
            this.selectActiveAtIndex(!activeSuggestionIndex
                ? suggestions.length - 1
                : activeSuggestionIndex - 1);
        };
        this.selectActiveAtIndex = selected => this.setState(({ suggestions }) => ({
            suggestions: suggestions.map((suggestion, index) => ({
                ...suggestion,
                active: index === selected,
            })),
            inputValue: suggestions[selected].description,
        }));
        this.getActiveSuggestionIndex = () => this.state.suggestions.findIndex(suggestion => suggestion.active);
        this.onSuggestionClick = suggestion => () => {
            this.handleSelect(suggestion);
        };
        this.handleSelect = place => {
            if (!place)
                return;
            this.setState({ suggestions: [], inputValue: place.description });
            this.props.onPlacesChanged(place);
        };
    }
    componentDidMount() {
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
        this.autocompleteOK = window.google.maps.places.PlacesServiceStatus.OK;
        this.props.onMount();
    }
    componentWillUnmount() {
        this.isUnmounted = true;
    }
    render() {
        const { elementId, placeholder } = this.props;
        const { suggestions, inputValue } = this.state;
        return (<div style={searchBoxCtr}>
                <input autoComplete="off" id={elementId} placeholder={placeholder || 'Search location'} style={searchInput} value={inputValue} onChange={this.handleSearch} onKeyDown={this.handleInputKeyDown} onFocus={this.handleSearch} type="text"/>
                {suggestions && suggestions.length ? (<div style={suggestionsCtr}>
                        {suggestions.map((suggestion, index) => (<div key={index} onClick={this.onSuggestionClick(suggestion)} style={{
            ...suggestionItem,
            ...(suggestion.active && { ...active }),
            ':hover': hover,
        }}>
                                <span>{suggestion.description}</span>
                            </div>))}
                    </div>) : null}
            </div>);
    }
}
export default SearchBox;
//# sourceMappingURL=searchBox.jsx.map