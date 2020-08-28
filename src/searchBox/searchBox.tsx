import * as React from 'react';
import Config from '../utils/config';
import './searchBoxStyles.scss';

export type TSearchBoxData = {
    suggestions: google.maps.places.AutocompletePrediction[];
    inputValue: string;
    activeIndex?: number;
};

export type TSearchBox = {
    /* Exposed props */
    placeholder?: string;
    inputStyles?: React.CSSProperties;
    suggestionStyles?: React.CSSProperties;
    searchOptions?: google.maps.places.AutocompletionRequest;

    /* Internal props */
    markerIconUrl?: string;
    onSelectLocation: (place: google.maps.places.AutocompletePrediction) => void;
    searchBoxData: TSearchBoxData,
    setSearchBoxData: (value: TSearchBoxData) => void,
};

export function SearchBox (props: TSearchBox) {
    /* Component Props */
    const {
        onSelectLocation,
        placeholder = 'Search location',
        markerIconUrl = Config.pinImageUrl,
        searchOptions = {},
        inputStyles = {},
        suggestionStyles = {},
        searchBoxData,
        setSearchBoxData,
    } = props;

    /* Non state variables. These shouldn't change on render. */
    const isMounted = React.useRef(true);
    const autocompleteService = React.useRef(new google.maps.places.AutocompleteService());

    /* Effect to clean any pending state changes on component unmount */
    React.useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    /* Function methods */
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isMounted.current) return;

        const inputValue = event.target.value ?? '';
        const data = {
            suggestions: inputValue ? searchBoxData.suggestions : [],
            activeIndex: undefined,
            inputValue
        };
        setSearchBoxData(data);

        if (!autocompleteService.current || !inputValue) return;

        autocompleteService.current.getPlacePredictions(
            { ...searchOptions, input: inputValue },
            (
                suggestions: google.maps.places.AutocompletePrediction[],
                status: google.maps.places.PlacesServiceStatus,
            ) => {
                if (!isMounted.current) return;
        
                setSearchBoxData({
                    ...data,
                    suggestions: status === google.maps.places.PlacesServiceStatus.OK ? suggestions : [],
                });
            },
        );
    };

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                handleEnterKey();
                break;
            case 'ArrowDown':
                event.preventDefault();
                handleDownKey();
                break;
            case 'ArrowUp':
                event.preventDefault();
                handleUpKey();
                break;
            case 'Escape':
                if (!isMounted.current) return;

                setSearchBoxData({
                   suggestions: [],
                   activeIndex: undefined,
                   inputValue: '', 
                });
                break;
        }
    };

    const handleDownKey = () => {
        const { activeIndex, suggestions } = searchBoxData;

        if (!suggestions?.length || !isMounted.current) return;

        const newIndex = (typeof activeIndex === 'undefined' || activeIndex === (suggestions.length - 1)) ? 0 : activeIndex + 1;
        
        setSearchBoxData({
            ...searchBoxData,
            activeIndex: newIndex,
            inputValue: suggestions[newIndex].description,
        });
    };

    const handleUpKey = () => {
        const { activeIndex, suggestions } = searchBoxData;

        if (!suggestions.length || !isMounted.current) return;

        const newIndex = !activeIndex ? (suggestions.length - 1) : (activeIndex - 1);

        setSearchBoxData({
            ...searchBoxData,
            activeIndex: newIndex,
            inputValue: suggestions[newIndex].description,
        });
    };

    const handleEnterKey = () => {   
        const { activeIndex, suggestions, inputValue } = searchBoxData;

        if (typeof activeIndex === 'undefined') {
             // We use only description text so we pass the input value if nothing available from the places api
            selectSuggestion({ description: inputValue } as google.maps.places.AutocompletePrediction);
        } else {
            selectSuggestion(suggestions[activeIndex]);
        }
    };

    const selectSuggestion = (place?: google.maps.places.AutocompletePrediction) => {
        if (!place || !isMounted.current) return;

        setSearchBoxData({
            suggestions: [],
            activeIndex: undefined,
            inputValue: place?.description,
        });
        onSelectLocation(place);
    };    

    return (
        <div className="searchBoxCtr">
            <input
                autoComplete="off"
                id={Config.searchBoxId}
                placeholder={placeholder}
                className="searchInput"
                style={inputStyles}
                value={searchBoxData?.inputValue}
                onChange={handleSearch}
                onFocus={handleSearch}
                onKeyDown={handleInputKeyDown}
                type="text"
            />
            {searchBoxData?.suggestions?.length ? (
                <div className="suggestionsCtr">
                    {searchBoxData?.suggestions?.map(
                        (suggestion: google.maps.places.AutocompletePrediction, index) => (
                            <div
                                key={index}
                                onClick={() => selectSuggestion(suggestion)}
                                className={`suggestionItem ${
                                    index === searchBoxData?.activeIndex ? 'active' : ''
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
};
