export type MapType = google.maps.Map;
export type PlacesServiceType = google.maps.places.PlacesService;
export type PlaceResultType = google.maps.places.PlaceResult;
export type AutocompletePredictionType = google.maps.places.AutocompletePrediction;
export type AutocompleteServiceType = google.maps.places.AutocompleteService;
export type MarkerType = google.maps.Marker;
export type GeocoderType = google.maps.Geocoder;
export type InfoWindowType = google.maps.InfoWindow;
export type LatLngType = google.maps.LatLng;
export type GeocoderResultType = google.maps.GeocoderResult;

export type CustomAutocompleteType = AutocompletePredictionType & {
    placeId?: string;
    active?: boolean;
    description?: string;
};

// GOOGLE MAP TYPES
export type GoogleMapProps = {
    googleMapUrl: string;
    mapElementId: string;
    searchElementId: string;
    defaultCenter: {
        lat: number;
        lng: number;
    };
    defaultZoom: number;
    onPlacesChanged: (place: object) => void;
    placesOptions?: string[];
    markerIconUrl?: string;
    searchPlaceholder?: string;
    errorHandler?: () => void;
    onMapLoaded?: () => void;
    onSearchBoxMounted?: () => void;
    searchOptions?: object;
    inputStyle?: object;
    suggestionStyle?: object;
};

export type GoogleMapState = {
    scriptLoaded: boolean;
    center: object;
    marker: { position: { lat: number; lng: number } } | null;
};

// SEARCH BOX TYPES
export type SearchBoxProps = {
    onMount?: () => void;
    elementId: string;
    onPlacesChanged: (place: CustomAutocompleteType) => void;
    placeholder?: string;
    searchOptions?: object;
    inputStyle?: object;
    suggestionStyle?: object;
};

export type SearchBoxState = {
    inputValue: string;
    suggestions: CustomAutocompleteType[];
};
