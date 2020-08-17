import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import SearchBox from '../searchBox/searchBox';
import {
    CustomAutocompleteType,
    GeocoderResultType,
    GeocoderType,
    GoogleMapProps,
    GoogleMapState,
    InfoWindowType,
    LatLngType,
    MapType,
    MarkerType,
    PlaceResultType,
    PlacesServiceType
} from '../types/googleMapTypes';
import Config from '../utils/config';
import './googleMapStyles.scss';

class GoogleMap extends React.Component<GoogleMapProps, GoogleMapState> {
    constructor(props: GoogleMapProps) {
        super(props);
        const { defaultCenter = Config.defaultCenter, position } = props;

        this.state = {
            scriptLoaded: false,
            defaultCenter,
            center: position || defaultCenter,
            // @ts-ignore
            marker: position ? { position: position } : null,
        };


        if (!props.googleMapUrl && props.onError)
            props.onError({ error: 'Google Map URL is required.' });
    }

    isComponentMounted?: boolean = true;
    searchInput?: SearchBox;
    map?: MapType;
    placesService?: PlacesServiceType;
    markerService?: MarkerType;
    geocoderService?: GeocoderType;
    infoWindow?: InfoWindowType;

    componentDidMount() {
        const scriptjs = require(`scriptjs`);
        const { googleMapUrl } = this.props;
        scriptjs(googleMapUrl, this.onScriptLoad);
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    onScriptLoad = () =>
        this.initialize(() => {
            console.log(this)
            if (!this.isComponentMounted) return;

            this.setState({ scriptLoaded: true });
            const { marker } = this.state;

            if (
                marker &&
                marker.position &&
                typeof marker.position.lat === 'number' &&
                typeof marker.position.lng === 'number'
            )
                this.handleMarker(
                    marker.position.lat,
                    marker.position.lng,
                    true,
                );
        });

    // INITIALIZATION
    initialize = (callback: () => void) => {
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
        google.maps.event.addListener(this.map, 'click', (event: any) =>
            this.handleMapClick(event),
        );

        if (callback) callback();
    };

    handleMapClick = ({ latLng }: { latLng: LatLngType }) => {
        // HOOK BEFORE CHANGE STARTS (TO MAKE CONFIRM BTN DISABLED AND ALL)
        if (this.props.beforeChange) this.props.beforeChange();

        const position = { lat: latLng.lat(), lng: latLng.lng() };

        this.setState(
            // @ts-ignore
            prevState => ({
                center: position ? position : prevState.center,
                marker: position ? { position } : null,
            }),
            () => {
                this.handleMarker(position.lat, position.lng, true);
            },
        );
    };

    setSearchInput = (inputValue: string) => {
        if (this.searchInput) {
            this.searchInput.handleState({
                inputValue,
                suggestions: [],
            });
        }
    };

    handleMarker = (lat: number, lng: number, setInput?: boolean) => {
        this.setMarker(lat, lng);
        if (this.props.onPlacesChanged) {
            this.props.onPlacesChanged({ lat, lng }, (place: string) => {
                const [location, ...rest] = place.split(' - ');
                this.setInfoWindow(location, rest.join(' - '));
                if (setInput && this.searchInput)
                    this.searchInput.handleState({ inputValue: place });
                if (this.props.afterChange) this.props.afterChange();
            });
        } else {
            this.fetchDetailsFromCoordinates(lat, lng);
        }
    };

    fetchDetailsFromCoordinates = (lat: number, lng: number) => {
        if (!this.geocoderService) return;

        const request = { location: { lat, lng } };
        this.geocoderService.geocode(
            request,
            (result: GeocoderResultType[]) => {
                if (!result || !result[0]) {
                    if (this.props.onError)
                        this.props.onError({
                            error:
                                'Failed to fetch the details of the coordinates.',
                        });
                    return;
                }

                const [location, ...rest] = result[0].formatted_address.split(
                    ' - ',
                );
                this.setInfoWindow(location, rest.join(' - '));
                if (this.searchInput)
                    this.searchInput.handleState({
                        inputValue: result[0].formatted_address,
                    });
                if (this.props.afterChange) this.props.afterChange(result[0]);
            },
        );
    };

    onPlacesChanged = (place: CustomAutocompleteType) => {
        if (!this.placesService) return;

        // HOOK BEFORE CHANGE STARTS (TO MAKE CONFIRM BTN DISABLED AND ALL)
        if (this.props.beforeChange) this.props.beforeChange();

        const request = { placeId: place.placeId };

        // IF FIELDS ARE PROVIDED TO FILTER DETAILS DATA
        if (this.props.placesOptions)
            request['fields'] = this.props.placesOptions;

        if (
            !this.props.onPlacesChanged &&
            request['fields'] &&
            !request['fields'].includes('formatted_address')
        )
            request['fields'].push('formatted_address');
            
        // @ts-ignore
        this.placesService.getDetails(request, (result: PlaceResultType) => {
            if (!this.isComponentMounted) return;

            if (!result) {
                if (this.props.onError)
                    this.props.onError({
                        error:
                            'Failed to fetch the details of the coordinates.',
                    });
                return;
            }

            // @ts-ignore
            const position = result.geometry.location;

            this.setState(
                // @ts-ignore
                prevState => ({
                    center: position ? position : prevState.center,
                    marker: position ? { position } : null,
                }),
                () => {
                    if (this.props.onPlacesChanged) {
                        this.handleMarker(position.lat(), position.lng());
                    } else {
                        const [
                            location,
                            ...rest
                            // @ts-ignore
                        ] = result.formatted_address.split(' - ');
                        this.setMarker(position.lat(), position.lng());
                        this.setInfoWindow(location, rest.join(' - '));
                        if (this.props.afterChange)
                            this.props.afterChange(result);
                    }
                },
            );
        });
    };

    callbackAfterPlacesChanged = (place: string, setInput?: boolean) => {
        if (setInput) this.setSearchInput(place);
        if (this.props.afterChange) this.props.afterChange();
        const [location, ...rest] = place.split(' - ');
        this.setInfoWindow(location, rest.join(' - '));
    };

    setMarker = (latitude: number, longitude: number) => {
        // RESET MARKER IF ALREADY PRESENT
        if (this.markerService && this.markerService.setMap)
            this.markerService.setMap(null);

        const center = new google.maps.LatLng(latitude, longitude);

        const markerProps = {
            position: center,
            map: this.map,
        };
        if (this.props.markerIconUrl)
            markerProps['icon'] = this.props.markerIconUrl;
        this.markerService = new google.maps.Marker(markerProps);

        const infoWindowContent = this.props.infoWindowLoader
            ? ReactDOMServer.renderToString(this.props.infoWindowLoader)
            : '<div style="text-align: center;">...</div>';
        this.setInfoWindow('', infoWindowContent);

        // RE CENTER MAP ACCORDING TO PINNED LOCATION
        if (this.map) this.map.panTo(center);
    };

    // CREATE INFO WINDOW FOR THE PIN LOCATION
    setInfoWindow = (name: string, area: string) => {
        const { infoWindow = Config.defaultInfoWindow } = this.props;
        const contentString = infoWindow.replace('mainText', name).replace(
            'secondaryText',
            area,
        );

        // CLOSE THE INFO WINDOW IF ALREADY THERE
        if (this.infoWindow) this.infoWindow.close();
        this.infoWindow = new google.maps.InfoWindow({
            content: contentString,
        });
        this.infoWindow.open(this.map, this.markerService);
    };

    render() {
        const { scriptLoaded } = this.state;
        const { searchPlaceholder, searchOptions } = this.props;

        return (
            <div className="ctr">
                <div className="mapCtr" id={Config.mapId} />
                {scriptLoaded ? (
                    <SearchBox
                        // @ts-ignore
                        ref={ref => (this.searchInput = ref)}
                        placeholder={searchPlaceholder}
                        onPlacesChanged={this.onPlacesChanged}
                        searchOptions={searchOptions}
                    />
                ) : null}
            </div>
        );
    }
}

export default GoogleMap;
