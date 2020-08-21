import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import SearchBox from '../searchBox/searchBox';
import Config from '../utils/config';
import './googleMapStyles.scss';

export type TCustomLatLng = {
    lat: number;
    lng: number;
};

export type GoogleMapProps = {
    googleMapUrl: string;
    defaultCenter?: { lat: number; lng: number };
    searchPlaceholder?: string;
    defaultZoom?: number;
    infoWindow?: string;
    markerIconUrl?: string;
    placesOptions?: string[];
    searchOptions?: any;
    defaultMarker?: { lat: number; lng: number };
    infoWindowLoader?: JSX.Element;
    suggestionStyles?: React.CSSProperties;
    inputStyles?: React.CSSProperties;

    beforeChange?: () => void;
    afterChange?: (data?: any) => void;
    onError?: (error: any) => void;
    onPlacesChange?: (coordinates: { [key: string]: number }, callback: (place: string) => void) => void;
};

export type GoogleMapState = {
    scriptLoaded: boolean;
    center: TCustomLatLng;
    defaultCenter: TCustomLatLng;
    marker?: { position: TCustomLatLng },
};

class GoogleMap extends React.Component<GoogleMapProps, GoogleMapState> {
    constructor(props: GoogleMapProps) {
        super(props);
        const { defaultCenter = Config.defaultCenter, defaultMarker } = props;

        this.state = {
            scriptLoaded: false,
            defaultCenter,
            center: defaultMarker || defaultCenter,
            marker: defaultMarker ? { position: defaultMarker } : undefined,
        };

        if (!props.googleMapUrl) props.onError?.({ error: 'Google Map URL is required.' });
    }

    isComponentMounted?: boolean = true;
    searchInput: SearchBox | null = null;
    map?: google.maps.Map<HTMLElement>;
    placesService?: google.maps.places.PlacesService;
    geocoderService?: google.maps.Geocoder;
    markerService?: google.maps.Marker;
    infoWindow?: google.maps.InfoWindow;

    componentDidMount() {
        const scriptjs = require(`scriptjs`);
        const { googleMapUrl } = this.props;
        scriptjs(googleMapUrl, this.onScriptLoad);
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    onScriptLoad = () => {
        this.initializeMap(() => {
            if (!this.isComponentMounted) return;

            this.setState({ scriptLoaded: true });
            const { marker } = this.state;

            if (marker?.position) {
                this.handleMarker({
                    ...marker.position,
                    setInput: true
                });
            }
        });
    }

    // INITIALIZATION
    initializeMap = (afterInitialize: () => void) => {
        const { center } = this.state;
        const { defaultZoom = Config.defaultZoom } = this.props;

        const mapElement = document.getElementById(Config.mapId);
        if (!mapElement) return;

        // INITIALIZE GOOGLE MAPS
        this.map = new google.maps.Map(mapElement, {
            zoom: defaultZoom,
            center,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            scaleControl: false,
            zoomControl: true,
            disableDoubleClickZoom: true,
            clickableIcons: false,
        });

        // INITIALIZE PLACES SERVICE
        this.placesService = new google.maps.places.PlacesService(this.map);

        // INITIALIZE GEOCODER SERVICE
        this.geocoderService = new google.maps.Geocoder();

        // ADD LISTENER TO MAP TO PIN LOCATION DIRECTLY
        google.maps.event.addListener(this.map, 'click', (event) =>
            this.handleMapClick(event),
        );

        afterInitialize();
    };

    handleMapClick = ({ latLng }: { latLng: google.maps.LatLng }) => {
        // HOOK BEFORE CHANGE STARTS (TO MAKE CONFIRM BTN DISABLED OR ANYTHING ELSE)
        this.props.beforeChange?.();

        const position = { lat: latLng.lat(), lng: latLng.lng() };

        this.setState({
            center: position,
            marker: { position }
        }, () => {
            this.searchInput?.handleState?.({ suggestions: [] });
            this.handleMarker({ ...position, setInput: true });
        });
    };

    setSearchInput = (inputValue: string) => {
        this.searchInput?.handleState?.({
            inputValue,
            suggestions: [],
        });
    };

    handleMarker = ({ lat, lng, setInput = false }: { lat: number, lng: number, setInput?: boolean }) => {
        this.setMarker({ lat, lng });
        if (this.props.onPlacesChange) {
            this.props.onPlacesChange({ lat, lng }, (place: string) => {
                const [location, ...rest] = place.split(' - ');
                this.setInfoWindow(location, rest.join(' - '));
                if (setInput) {
                    this.searchInput?.handleState?.({ inputValue: place });
                }

                this.props.afterChange?.();
            });
        } else {
            this.fetchDetailsFromCoordinates({ lat, lng });
        }
    };

    fetchDetailsFromCoordinates = (location: TCustomLatLng) => {
        if (!this.geocoderService) return;

        this.geocoderService.geocode(
            { location },
            (result: google.maps.GeocoderResult[]) => {
                if (!result?.[0]) {
                    this.props.onError?.({ error: 'Failed to fetch the details for coordinates.' });
                    return;
                }

                const [location, ...rest] = result[0].formatted_address.split(' - ');
                this.setInfoWindow(location, rest.join(' - '));
                this.searchInput?.handleState?.({
                    inputValue: result[0].formatted_address,
                });
                this.props.afterChange?.(result[0]);
            },
        );
    };

    onPlacesChanged = (place: google.maps.places.AutocompletePrediction) => {
        if (!this.placesService) return;

        const { beforeChange, placesOptions = [], onPlacesChange, onError } = this.props;

        // Callback before CHANGE STARTS (TO MAKE CONFIRM BTN DISABLED AND ALL)
        beforeChange?.();

        const request = {
            placeId: place.place_id,
            fields: placesOptions,
        };

        if (!onPlacesChange && !request.fields.includes('formatted_address')) {
            request.fields.push('formatted_address');
        }

        if (!request.fields.includes('geometry')) {
            request.fields.push('geometry');
        }

        this.placesService.getDetails(request, (result: google.maps.places.PlaceResult) => {
            if (!this.isComponentMounted) return;

            if (!result) {
                onError?.({
                    error: 'Failed to fetch the details for coordinates.',
                });
                return;
            }

            if (!result?.geometry?.location) return;
            const position = { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() };

            this.setState(
                prevState => ({
                    center: position || prevState.center,
                    marker: position ? { position } : undefined,
                }),
                () => {
                    if (this.props.onPlacesChange) {
                        this.handleMarker(position);
                    } else {
                        const [
                            location,
                            ...rest
                        ] = (result?.formatted_address || '')?.split?.(' - ');
                        this.setMarker(position);
                        this.setInfoWindow(location, rest.join(' - '));
                        this.props.afterChange?.(result);
                    }
                },
            );
        });
    };

    callbackAfterPlacesChanged = (place: string, setInput?: boolean) => {
        if (setInput) this.setSearchInput(place);

        this.props.afterChange?.();
        const [location, ...rest] = place.split(' - ');
        this.setInfoWindow(location, rest.join(' - '));
    };

    setMarker = ({ lat, lng }: TCustomLatLng) => {
        if (!this.map) return;

        // RESET MARKER IF ALREADY PRESENT
        this.markerService?.setMap?.(null);

        const { markerIconUrl, infoWindowLoader } = this.props;
        const markerPosition = new google.maps.LatLng(lat, lng);

        const markerProps = {
            position: markerPosition,
            map: this.map,
            ...(markerIconUrl ? { icon: markerIconUrl } : {})
        };
        this.markerService = new google.maps.Marker(markerProps);

        const infoWindowContent = infoWindowLoader
            ? ReactDOMServer.renderToString(infoWindowLoader)
            : '<div style="text-align: center;">...</div>';
        this.setInfoWindow('', infoWindowContent);

        // RE CENTER MAP ACCORDING TO PINNED LOCATION
        this.map.panTo(markerPosition);
    };

    // CREATE INFO WINDOW FOR THE PIN LOCATION
    setInfoWindow = (name: string, area: string) => {
        if (!this.map || !this.markerService) return;

        const { infoWindow = Config.defaultInfoWindow } = this.props;
        const contentString = infoWindow.replace('mainText', name).replace(
            'secondaryText',
            area,
        );

        // CLOSE THE INFO WINDOW IF ALREADY THERE
        this.infoWindow?.close();

        this.infoWindow = new google.maps.InfoWindow({ content: contentString });
        this.infoWindow.open(this.map, this.markerService);
    };

    render() {
        const { scriptLoaded } = this.state;
        const { searchPlaceholder, searchOptions, suggestionStyles, inputStyles } = this.props;

        return (
            <div className="ctr">
                <div className="mapCtr" id={Config.mapId} />
                {scriptLoaded ? (
                    <SearchBox
                        ref={ref => (this.searchInput = ref)}
                        placeholder={searchPlaceholder}
                        onPlacesChanged={this.onPlacesChanged}
                        searchOptions={searchOptions}
                        suggestionStyles={suggestionStyles}
                        inputStyles={inputStyles}
                    />
                ) : null}
            </div>
        );
    }
}

export default GoogleMap;
