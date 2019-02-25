import React from 'react';
import {
    searchBoxCtr,
    searchInput,
    suggestionsCtr,
    suggestionItem,
    active,
    hover,
} from './searchBoxStyles';
import {
    SearchBoxProps,
    SearchBoxState,
    AutocompleteServiceType,
    CustomAutocompleteType,
    AutocompletePredictionType,
} from '../types';

class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
    state = {
        suggestions: [],
        inputValue: '',
    };

    isUnmounted: boolean = false;
    autocompleteService?: AutocompleteServiceType;
    autocompleteOK?: string;

    componentDidMount() {
        // @ts-ignore
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
        // @ts-ignore
        this.autocompleteOK = window.google.maps.places.PlacesServiceStatus.OK;
        if (this.props.onMount) this.props.onMount();
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    handleState = (state: object) => this.setState(state);

    handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
        // @ts-ignore
        const inputValue = e.target.value || '';
        this.setState(({ suggestions }) => ({
            inputValue,
            suggestions: inputValue ? suggestions : [],
        }));
        if (this.autocompleteService && inputValue) {
            let searchOptions = { input: inputValue };
            if (this.props.searchOptions) {
                // @ts-ignore
                const { location, ...rest } = this.props.searchOptions;

                searchOptions = {
                    ...searchOptions,
                    ...rest,
                    ...(location && {
                        location: new google.maps.LatLng(
                            location.lat,
                            location.lng,
                        ),
                    }),
                };
            }

            this.autocompleteService.getPlacePredictions(
                searchOptions,
                this.autocompleteCallback,
            );
        }
    };

    autocompleteCallback = (
        suggestions: CustomAutocompleteType[],
        status: any,
    ) => {
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

    clearSuggestions = () => this.setState({ suggestions: [] });

    handleInputKeyDown = (event: KeyboardEvent) => {
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

    handleEnterKey = () => {
        const activeSuggestionIndex = this.getActiveSuggestionIndex();
        const { inputValue, suggestions } = this.state;
        if (typeof activeSuggestionIndex === 'undefined') {
            // @ts-ignore
            this.handleSelect({ description: inputValue });
        } else {
            this.handleSelect(suggestions[activeSuggestionIndex]);
        }
    };

    handleDownKey = () => {
        const { suggestions } = this.state;
        if (!suggestions.length) return;
        const activeSuggestionIndex = this.getActiveSuggestionIndex();
        this.selectActiveAtIndex(
            typeof activeSuggestionIndex === 'undefined' ||
                activeSuggestionIndex === suggestions.length - 1
                ? 0
                : activeSuggestionIndex + 1,
        );
    };

    handleUpKey = () => {
        const { suggestions } = this.state;
        if (!suggestions.length) return;
        const activeSuggestionIndex = this.getActiveSuggestionIndex();
        this.selectActiveAtIndex(
            !activeSuggestionIndex
                ? suggestions.length - 1
                : activeSuggestionIndex - 1,
        );
    };

    selectActiveAtIndex = (selected: number) =>
        this.setState(({ suggestions }) => ({
            suggestions: suggestions.map((suggestion, index) => ({
                ...suggestion,
                active: index === selected,
            })),
            inputValue: suggestions[selected].description,
        }));

    getActiveSuggestionIndex = () =>
        // @ts-ignore
        this.state.suggestions.findIndex(suggestion => suggestion.active);

    onSuggestionClick = (suggestion: CustomAutocompleteType) => () =>
        this.handleSelect(suggestion);

    handleSelect = (place?: CustomAutocompleteType) => {
        if (!place) return;
        this.setState({ suggestions: [], inputValue: place.description });
        this.props.onPlacesChanged(place);
    };

    render() {
        const {
            elementId,
            placeholder,
            inputStyle = {},
            suggestionStyle = {},
        } = this.props;
        const { suggestions, inputValue } = this.state;
        return (
            <div style={searchBoxCtr}>
                <input
                    autoComplete="off"
                    id={elementId}
                    placeholder={placeholder || 'Search location'}
                    style={{ ...searchInput, ...inputStyle }}
                    value={inputValue}
                    onChange={this.handleSearch}
                    // @ts-ignore
                    onKeyDown={this.handleInputKeyDown}
                    onFocus={this.handleSearch}
                    type="text"
                />
                {suggestions && suggestions.length ? (
                    <div style={suggestionsCtr}>
                        {suggestions.map(
                            (suggestion: CustomAutocompleteType, index) => (
                                <div
                                    key={index}
                                    onClick={this.onSuggestionClick(suggestion)}
                                    style={{
                                        ...suggestionItem,
                                        ...(suggestion.active && { ...active }),
                                        // @ts-ignore
                                        '&:hover': hover,
                                        ...suggestionStyle,
                                    }}
                                >
                                    <span>{suggestion.description}</span>
                                </div>
                            ),
                        )}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default SearchBox;
