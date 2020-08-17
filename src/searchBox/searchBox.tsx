import * as React from 'react';
import {
    AutocompleteServiceType,
    CustomAutocompleteType, PlacesServiceStatusType, SearchBoxProps,
    SearchBoxState
} from '../types/googleMapTypes';
import Config from '../utils/config';
import './searchBoxStyles.scss';

class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
    state = {
        suggestions: [],
        inputValue: '',
    };

    autocompleteService?: AutocompleteServiceType;
    autocompleteOK?: PlacesServiceStatusType;
    isComponentMounted: boolean = true;

    componentDidMount() {
        this.autocompleteService = new google.maps.places.AutocompleteService();
        this.autocompleteOK = google.maps.places.PlacesServiceStatus.OK;
        if (this.props.onMount) this.props.onMount();
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    handleState = (state: object) => {
        if (!this.isComponentMounted) return;

        this.setState(state);
    };

    handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
        if (!this.isComponentMounted) return;

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
        if (!this.isComponentMounted) return;

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
        if (!this.isComponentMounted) return;

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
            // @ts-ignore
            this.handleSelect({ description: inputValue });
        } else {
            // @ts-ignore
            this.handleSelect(suggestions[activeSuggestionIndex]);
        }
    };

    handleDownKey = () => {
        const { suggestions } = this.state;
        if (!suggestions.length) return;

        const activeSuggestionIndex = this.getActiveSuggestionIndex();
        this.selectActiveAtIndex(
            typeof activeSuggestionIndex === 'undefined' ||
            // @ts-ignore
                activeSuggestionIndex === suggestions.length - 1
                ? 0
                // @ts-ignore
                : activeSuggestionIndex + 1,
        );
    };

    handleUpKey = () => {
        const { suggestions } = this.state;
        if (!suggestions.length) return;
        const activeSuggestionIndex = this.getActiveSuggestionIndex();
        this.selectActiveAtIndex(
            // @ts-ignore
            !activeSuggestionIndex
                ? suggestions.length - 1
                // @ts-ignore
                : activeSuggestionIndex - 1,
        );
    };

    selectActiveAtIndex = (selected: number) => {
        if (!this.isComponentMounted) return;

        this.setState(({ suggestions }) => ({
            suggestions: suggestions.map((suggestion, index) => ({
                ...suggestion,
                active: index === selected,
            })),
            // inputValue: suggestions[selected].description,
        }));
    };

    getActiveSuggestionIndex = () => {
        // @ts-ignore
        return this.state.suggestions.findIndex(suggestion => suggestion.active);
    };

    onSuggestionClick = (suggestion: CustomAutocompleteType) => () =>
        this.handleSelect(suggestion);

    handleSelect = (place?: CustomAutocompleteType) => {
        if (!this.isComponentMounted) return;

        if (!place) return;
        this.setState({ suggestions: [], inputValue: place.description });
        this.props.onPlacesChanged(place);
    };

    render() {
        const {
            placeholder,
            inputStyles = {},
            suggestionStyles = {},
            markerIconUrl = Config.pinImageUrl,
        } = this.props;
        const { suggestions, inputValue } = this.state;

        return (
            <div className="searchBoxCtr">
                <input
                    autoComplete="off"
                    id={Config.searchBoxId}
                    placeholder={placeholder || 'Search location'}
                    className="searchInput"
                    style={inputStyles}
                    value={inputValue}
                    onChange={this.handleSearch}
                    // @ts-ignore
                    onKeyDown={this.handleInputKeyDown}
                    onFocus={this.handleSearch}
                    type="text"
                />
                {suggestions?.length ? (
                    <div className="suggestionsCtr">
                        {suggestions.map(
                            (suggestion: CustomAutocompleteType, index) => (
                                <div
                                    key={index}
                                    onClick={this.onSuggestionClick(suggestion)}
                                    className={`suggestionItem ${
                                        suggestion.active ? 'active' : ''
                                    }`}
                                    style={suggestionStyles}
                                >
                                    {!!markerIconUrl && <img src={markerIconUrl} />}
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
