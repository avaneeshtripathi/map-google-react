import React from 'react';
import styles from './searchBoxStyles';
import {
    SearchBoxProps,
    SearchBoxState,
    PlacesServiceStatusType,
    AutocompleteServiceType,
    CustomAutocompleteType,
} from '../types/googleMapTypes';

const PIN_IMAGE_URL =
    'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png';

class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
    state = {
        suggestions: [],
        inputValue: '',
    };

    autocompleteService?: AutocompleteServiceType;
    autocompleteOK?: PlacesServiceStatusType;
    isMounted: boolean = true;

    componentDidMount() {
        this.autocompleteService = new google.maps.places.AutocompleteService();
        this.autocompleteOK = google.maps.places.PlacesServiceStatus.OK;
        if (this.props.onMount) this.props.onMount();
    }

    componentWillUnmount() {
        this.isMounted = false;
    }

    handleState = (state: object) => {
        if (!this.isMounted) return;

        this.setState(state);
    };

    handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
        if (!this.isMounted) return;

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
        suggestions: CustomAutocompleteType[],
        status: any,
    ) => {
        if (!this.isMounted) return;

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

    clearSuggestions = () => {
        if (!this.isMounted) return;

        this.setState({ suggestions: [] });
    };

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

    selectActiveAtIndex = (selected: number) => {
        if (!this.isMounted) return;

        this.setState(({ suggestions }) => ({
            suggestions: suggestions.map((suggestion, index) => ({
                ...suggestion,
                active: index === selected,
            })),
            inputValue: suggestions[selected].description,
        }));
    };

    getActiveSuggestionIndex = () =>
        this.state.suggestions.findIndex(suggestion => suggestion.active);

    onSuggestionClick = (suggestion: CustomAutocompleteType) => () =>
        this.handleSelect(suggestion);

    handleSelect = (place?: CustomAutocompleteType) => {
        if (!this.isMounted) return;

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
            markerIconUrl,
        } = this.props;
        const { suggestions, inputValue } = this.state;

        const pinIcon = markerIconUrl || PIN_IMAGE_URL;

        return (
            <div className="searchBoxCtr">
                <input
                    autoComplete="off"
                    id={elementId}
                    placeholder={placeholder || 'Search location'}
                    className="searchInput"
                    style={inputStyle}
                    value={inputValue}
                    onChange={this.handleSearch}
                    onKeyDown={this.handleInputKeyDown}
                    onFocus={this.handleSearch}
                    type="text"
                />
                {suggestions && suggestions.length ? (
                    <div className="suggestionsCtr">
                        {suggestions.map(
                            (suggestion: CustomAutocompleteType, index) => (
                                <div
                                    key={index}
                                    onClick={this.onSuggestionClick(suggestion)}
                                    className={`suggestionItem ${
                                        suggestion.active ? 'active' : ''
                                    }`}
                                    style={suggestionStyle}
                                >
                                    {pinIcon && <img src={PIN_IMAGE_URL} />}
                                    <span>{suggestion.description}</span>
                                </div>
                            ),
                        )}
                    </div>
                ) : null}
                <style jsx>{styles}</style>
            </div>
        );
    }
}

export default SearchBox;
