import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { SearchBox, TSearchBoxData } from '../searchBox/searchBox';
import Config from '../utils/config';
import './googleMapStyles.scss';

export type TCustomLatLng = {
    lat: number;
    lng: number;
};

export type TAfterChangeResult = {
    lat: number,
    lng: number,
    place: string
};

export type TGoogleMap = {
    googleMapUrl: string;
    markerIconUrl?: string;
    defaultCenter?: { lat: number; lng: number };
    defaultMarker?: { lat: number; lng: number };
    defaultZoom?: number;
    placesOptions?: string[];
    mapOptions?: google.maps.MapOptions;
    markerOptions?: google.maps.ReadonlyMarkerOptions;
    infoWindowLoader?: JSX.Element;
    infoWindow?: string;

    beforeChange?: () => void;
    afterChange?: (data: TAfterChangeResult) => void;
    onError?: (error: any) => void;
    onPlacesChange?: (coordinates: { [key: string]: number }, callback: (place: string) => void) => void;

    children?: React.ReactElement<typeof SearchBox>;
};

export function GoogleMap(props: TGoogleMap) {
    const {
        googleMapUrl,
        markerIconUrl,
        defaultCenter: defaultCenterProp = Config.defaultCenter,
        defaultMarker: defaultMarkerProp,
        defaultZoom = Config.defaultZoom,
        placesOptions = [],
        mapOptions = {},
        markerOptions = {},
        infoWindowLoader,
        infoWindow: infoWindowProp = Config.defaultInfoWindow,
        beforeChange,
        afterChange,
        onPlacesChange,
        onError,
        children,
    } = props;

    /* Component states */
    const [scriptLoaded, setScriptLoaded] = React.useState(false);
    const [googleMap, setGoogleMap] = React.useState<google.maps.Map<HTMLElement>>();
    const [center, setCenter] = React.useState(defaultCenterProp);
    const [marker, setMarker] = React.useState(defaultMarkerProp ? { position: defaultMarkerProp } : undefined);
    const [searchBoxData, setSearchBoxData] = React.useState<TSearchBoxData>({
        suggestions: [],
        inputValue: '',
        activeIndex: undefined,
    });

    /* Non state variables. These shouldn't change on render. */
    const isMounted = React.useRef(true);
    const infoWindow = React.useRef<google.maps.InfoWindow>();
    const markerService = React.useRef<google.maps.Marker>();
    const placesService = React.useRef<google.maps.places.PlacesService>();
    const geocoderService = React.useRef<google.maps.Geocoder>();

    /* Effect on component mount/update */
    React.useEffect(() => {
        const scriptjs = require(`scriptjs`);
        scriptjs(googleMapUrl, onScriptLoad);

        return () => {
            isMounted.current = false;
        };
    }, []);

    React.useEffect(() => {
        if (!googleMap || !isMounted.current) return;

        /* Initialize places service */
        placesService.current = new google.maps.places.PlacesService(googleMap);

        /* Initialize geocoder service */
        geocoderService.current = new google.maps.Geocoder();

        /* Add listener to map to pin locations directly */
        google.maps.event.addListener(googleMap, 'click', (event) =>
            handleMapClick(event),
        );

        if (!marker?.position) return;

        handleMarker({
            ...marker.position,
            setInput: true
        });
    }, [googleMap]);

    /* Component methods */
    const onScriptLoad = () => {
        if (!isMounted.current) return;

        setScriptLoaded(true);

        const mapElement = document.getElementById(Config.mapId);
        if (!mapElement) return;

        /* Initialize google map */
        setGoogleMap(new google.maps.Map(mapElement, {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            scaleControl: false,
            zoomControl: true,
            disableDoubleClickZoom: true,
            clickableIcons: false,
            ...mapOptions,
            zoom: defaultZoom,
            center,
        }));
    };

    const handleMapClick = ({ latLng }: { latLng: google.maps.LatLng }) => {
        /* Function before the change starts (to make confirm button disabled) */
        beforeChange?.();

        const position = { lat: latLng.lat(), lng: latLng.lng() };

        setCenter(position);
        setMarker({ position });

        setSearchBoxData({ ...searchBoxData, suggestions: [] });
        handleMarker({ ...position, setInput: true });
    };

    const handleMarker = ({ lat, lng, setInput = false }: { lat: number, lng: number, setInput?: boolean }) => {
        showMarker({ lat, lng });

        if (onPlacesChange) {
            onPlacesChange({ lat, lng }, (place: string) => {
                const [location, ...rest] = place.split(' - ');
                showInfoWindow(location, rest.join(' - '));
                if (setInput) {
                    setSearchBoxData({ ...searchBoxData, inputValue: place });
                }
                afterChange?.({ lat, lng, place });
            });
        } else {
            fetchDetailsFromCoordinates({ lat, lng });
        }
    };

    const showMarker = ({ lat, lng }: TCustomLatLng) => {
        if (!googleMap) return;

        /* Reset marker if already present */
        markerService.current?.setMap?.(null);

        const markerPosition = new google.maps.LatLng(lat, lng);

        const markerProps = {
            ...markerOptions,
            position: markerPosition,
            map: googleMap,
            ...(markerIconUrl ? { icon: markerIconUrl } : {})
        };
        markerService.current = new google.maps.Marker(markerProps);

        const infoWindowContent = infoWindowLoader
            ? ReactDOMServer.renderToString(infoWindowLoader)
            : '<div style="text-align: center;">...</div>';
        showInfoWindow('', infoWindowContent);

        /* Re center map according to the pinned location */
        googleMap.panTo(markerPosition);
    };

    /* Create info window for the pin location */
    const showInfoWindow = (name: string, area: string) => {
        if (!googleMap || !markerService.current) return;

        const contentString = infoWindowProp.replace('mainText', name).replace(
            'secondaryText',
            area,
        );

        /* Close the info window if already present */
        infoWindow.current?.close();

        infoWindow.current = new google.maps.InfoWindow({ content: contentString });
        infoWindow.current.open(googleMap, markerService.current);
    };

    const fetchDetailsFromCoordinates = (location: TCustomLatLng) => {
        if (!geocoderService.current) return;

        geocoderService.current.geocode(
            { location },
            (result: google.maps.GeocoderResult[]) => {
                if (!result?.[0]) {
                    onError?.({ error: 'Failed to fetch the details for coordinates.' });
                    return;
                }

                const [location, ...rest] = result[0].formatted_address.split(' - ');
                showInfoWindow(location, rest.join(' - '));
                setSearchBoxData({ ...searchBoxData, inputValue: result[0].formatted_address });
                afterChange?.({
                    lat: result[0]?.geometry?.location?.lat(),
                    lng: result[0]?.geometry?.location?.lng(),
                    place: result[0]?.formatted_address,
                });
            },
        );
    };

    const onSelectLocation = (place: google.maps.places.AutocompletePrediction) => {
        if (!placesService.current) return;

        /* Function before the change starts (to make confirm button disabled) */
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

        placesService.current.getDetails(request, (result: google.maps.places.PlaceResult) => {
            if (!isMounted.current) return;

            if (!result) {
                onError?.({
                    error: 'Failed to fetch the details for coordinates.',
                });
                return;
            }

            if (!result?.geometry?.location) return;
            const position = { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() };

            setCenter(position || center);
            setMarker(position ? { position } : undefined);

            if (onPlacesChange) {
                handleMarker(position);
            } else {
                const [
                    location,
                    ...rest
                ] = (result?.formatted_address || '')?.split?.(' - ');

                showMarker(position);
                showInfoWindow(location, rest.join(' - '));
                afterChange?.({
                    place: result?.formatted_address || result?.adr_address || '',
                    lat: result?.geometry?.location?.lat(),
                    lng: result?.geometry?.location?.lng(),
                });
            }
        });
    };

    if (!googleMapUrl) onError?.({ error: 'Google Map URL is required.' });

    return (
        <div className="ctr">
            <div className="mapCtr" id={Config.mapId} />
            {scriptLoaded && children
                ? React.cloneElement(children,
                    {
                        // @ts-ignore
                        onSelectLocation,
                        markerIconUrl,
                        searchBoxData,
                        setSearchBoxData
                    })
                : null}
        </div>
    );
};
