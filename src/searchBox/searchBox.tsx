import * as React from 'react';
import Config from '../utils/config';
import './searchBoxStyles.scss';

export type SearchBoxProps = {
    onPlacesChanged: (place: google.maps.places.AutocompletePrediction) => void;
    placeholder?: string;
    searchOptions?: google.maps.places.AutocompletionRequest;
    inputStyles?: React.CSSProperties;
    markerIconUrl?: string;
    suggestionStyles?: React.CSSProperties;
};

export type SearchBoxState = {
    inputValue: string;
    suggestions: google.maps.places.AutocompletePrediction[];
    activeIndex?: number;
};

class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
    state: SearchBoxState = {
        suggestions: [],
        activeIndex: undefined,
        inputValue: '',
    };

    autocompleteService?: google.maps.places.AutocompleteService;
    isComponentMounted = true;

    componentDidMount() {
        this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    handleState = (state: object) => {
        if (!this.isComponentMounted) return;

        this.setState(state);
    };

    handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!this.isComponentMounted) return;

        const inputValue = event.target.value || '';
        this.setState(({ suggestions }) => ({
            inputValue,
            suggestions: inputValue ? suggestions : [],
        }));
        if (this.autocompleteService && inputValue) {
            const { searchOptions = {} } = this.props;

            this.autocompleteService.getPlacePredictions(
                { ...searchOptions, input: inputValue },
                this.autocompleteCallback,
            );
        }
    };

    autocompleteCallback = (
        suggestions: google.maps.places.AutocompletePrediction[],
        status: google.maps.places.PlacesServiceStatus,
    ) => {
        if (!this.isComponentMounted) return;

        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            this.clearSuggestions();
            return;
        }
        
        this.setState({ suggestions });
    };

    clearSuggestions = () => {
        if (!this.isComponentMounted) return;

        this.setState({ suggestions: [], activeIndex: undefined });
    };

    handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
        const { inputValue, suggestions, activeIndex } = this.state;
        
        if (typeof activeIndex === 'undefined') {
            this.selectSuggestion({ description: inputValue } as google.maps.places.AutocompletePrediction); // We use only desc
        } else {
            this.selectSuggestion(suggestions[activeIndex]);
        }
    };

    handleDownKey = () => {
        const { suggestions, activeIndex } = this.state;
        if (!suggestions.length) return;

        this.selectActiveAtIndex(
            (typeof activeIndex === 'undefined' || activeIndex === (suggestions.length - 1))
                ? 0 : activeIndex + 1,
        );
    };

    handleUpKey = () => {
        const { suggestions, activeIndex } = this.state;
        if (!suggestions.length) return;

        this.selectActiveAtIndex(
            !activeIndex ? (suggestions.length - 1) : (activeIndex - 1),
        );
    };

    selectActiveAtIndex = (selected: number) => {
        if (!this.isComponentMounted) return;

        this.setState(({ suggestions }) => ({
            activeIndex: selected,
            inputValue: suggestions[selected].description,
        }));
    };

    selectSuggestion = (place?: google.maps.places.AutocompletePrediction) => {
        if (!this.isComponentMounted) return;
        if (!place) return;

        this.setState({ suggestions: [], inputValue: place.description });
        this.props.onPlacesChanged(place);
    };

    render() {
        const {
            placeholder = 'Search location',
            inputStyles = {},
            suggestionStyles = {},
            markerIconUrl = Config.pinImageUrl,
        } = this.props;
        const { suggestions, inputValue, activeIndex } = this.state;

        return (
            <div className="searchBoxCtr">
                <input
                    autoComplete="off"
                    id={Config.searchBoxId}
                    placeholder={placeholder}
                    className="searchInput"
                    style={inputStyles}
                    value={inputValue}
                    onChange={this.handleSearch}
                    onKeyDown={this.handleInputKeyDown}
                    onFocus={this.handleSearch}
                    type="text"
                />
                {suggestions?.length ? (
                    <div className="suggestionsCtr">
                        {suggestions.map(
                            (suggestion: google.maps.places.AutocompletePrediction, index) => (
                                <div
                                    key={index}
                                    onClick={() => this.selectSuggestion(suggestion)}
                                    className={`suggestionItem ${
                                        index === activeIndex ? 'active' : ''
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
