import React from 'react';
import {
    searchBoxCtr,
    searchInput,
    suggestionsCtr,
    suggestionItem,
    active,
    hover,
} from './searchBoxStyles';

type Props = {
    onMount?: () => void;
    elementId: string;
    onPlacesChanged: (place: google.maps.places.AutocompletePrediction) => void;
    placeholder?: string;
    searchOptions?: object;
    inputStyle?: object;
    suggestionStyle?: object;
};

type State = {
    inputValue: string;
    suggestions: object[];
};

type CustomAutocomplete = google.maps.places.AutocompletePrediction & {
    placeId?: string;
    active?: boolean;
    description?: string;
};

class SearchBox extends React.Component<Props, State> {
    state = {
        suggestions: [],
        inputValue: '',
    };

    isUnmounted = false;
    autocompleteService?: google.maps.places.AutocompleteService;
    autocompleteOK?: string;

    componentDidMount() {
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
        this.autocompleteOK = window.google.maps.places.PlacesServiceStatus.OK;
        if (this.props.onMount) this.props.onMount();
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    handleInputChange = (inputValue: string) => this.setState({ inputValue });

    handleSearch = (e: React.SyntheticEvent) => {
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
        suggestions: google.maps.places.AutocompletePrediction[],
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

    handleInputKeyDown = (event: React.SyntheticEvent) => {
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
        this.state.suggestions.findIndex(suggestion => suggestion.active);

    onSuggestionClick = (suggestion: CustomAutocomplete) => () =>
        this.handleSelect(suggestion);

    handleSelect = (place?: CustomAutocomplete) => {
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
                    onKeyDown={this.handleInputKeyDown}
                    onFocus={this.handleSearch}
                    type="text"
                />
                {suggestions && suggestions.length ? (
                    <div style={suggestionsCtr}>
                        {suggestions.map(
                            (suggestion: CustomAutocomplete, index) => (
                                <div
                                    key={index}
                                    onClick={this.onSuggestionClick(suggestion)}
                                    style={{
                                        ...suggestionItem,
                                        ...(suggestion.active && { ...active }),
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
