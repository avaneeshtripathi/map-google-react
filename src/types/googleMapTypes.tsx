import { CSSProperties } from "react";

export type MapType = google.maps.Map;
export type PlacesServiceType = google.maps.places.PlacesService;
export type PlacesServiceStatusType = google.maps.places.PlacesServiceStatus;
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
    defaultCenter?: { lat: number; lng: number };
    searchPlaceholder?: string;
    defaultZoom?: number;
    infoWindow?: string;
    markerIconUrl?: string;
    placesOptions?: string[];
    searchOptions?: { [key: string]: any };
    position?: { lat: number; lng: number };
    infoWindowLoader?: JSX.Element;
    suggestionStyles?: CSSProperties;
    inputStyles?: CSSProperties;

    beforeChange?: () => void;
    afterChange?: (data?: any) => void;
    onError?: (error: any) => void;
    onPlacesChange?: (coordinates: { [key: string]: number }, callback: (place: string) => void) => void;
    onMapLoad?: () => void;
    onSearchBoxMount?: () => void;
};

export type GoogleMapState = {
    scriptLoaded: boolean;
    defaultCenter: LatLngType | { lat: number; lng: number };
    center: LatLngType | { lat: number; lng: number };
    marker: { position: LatLngType | { lat: number; lng: number } };
    address?: object;
};

// SEARCH BOX TYPES
export type SearchBoxProps = {
    onMount?: () => void;
    onPlacesChanged: (place: CustomAutocompleteType) => void;
    placeholder?: string;
    searchOptions?: object;
    inputStyles?: CSSProperties;
    markerIconUrl?: string;
    suggestionStyles?: CSSProperties;
};

export type SearchBoxState = {
    inputValue: string;
    suggestions: CustomAutocompleteType[];
};
