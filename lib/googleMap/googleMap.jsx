import React from 'react';
import SearchBox from '../searchBox/searchBox';
import { ctr, mapCtr } from './googleMapStyles';
const INFO_WINDOW = `
    <div style="display: flex; flex-direction: column; font-size: 12px">
        <b>mainText</b>
        <span>secondaryText</span>
    </div>
`;
class GoogleMap extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            scriptLoaded: false,
            center: this.props.defaultCenter,
            marker: this.props.defaultCenter
                ? { position: this.props.defaultCenter }
                : null,
        };
        this.isUnmounted = false;
        this.searchInput = null;
        // INITIALISATION
        this.map = null;
        this.placesService = null;
        this.markerService = null;
        this.geocoderService = null;
        this.infoWindow = null;
        this.initialise = (cb) => {
            const { defaultZoom, mapElementId } = this.props;
            const { center } = this.state;
            // INITIALISE GOOGLE MAPS
            this.map = new google.maps.Map(document.getElementById(mapElementId), {
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
            // INITIALISE PLACES SERVICE
            this.placesService = new google.maps.places.PlacesService(this.map);
            // INITIALISE GEOCODER SERVICE
            this.geocoderService = new google.maps.Geocoder();
            // ADD LISTENER TO MAP TO PIN LOCATION DIRECTLY
            google.maps.event.addListener(this.map, 'click', (event) => this.handleMapClick(event));
            if (cb)
                cb();
        };
        this.onScriptLoad = () => this.initialise(() => this.setState({ scriptLoaded: true }, () => {
            if (this.props.onMapLoaded)
                this.props.onMapLoaded();
        }));
        this.handleMapClick = ({ latLng }) => {
            const request = { location: { lat: latLng.lat(), lng: latLng.lng() } };
            this.geocoderService.geocode(request, (result) => {
                const position = result[0].geometry.location;
                const nextMarker = position ? { position } : {};
                const nextCenter = nextMarker.position
                    ? nextMarker.position
                    : this.state.center;
                const [main_text, ...rest] = result[0].formatted_address.split(' - ');
                const secondary_text = rest.join(' - ');
                this.setState({ center: nextCenter, marker: nextMarker }, () => {
                    if (!position) {
                        if (this.props.errorHandler)
                            this.props.errorHandler();
                        return;
                    }
                    if (this.searchInput) {
                        this.searchInput.handleInputChange(result[0].formatted_address);
                    }
                    const place = {
                        structured_formatting: {
                            main_text,
                            secondary_text,
                        },
                    };
                    this.setMarker(nextCenter, place, this.props.onPlacesChanged);
                });
            });
        };
        this.onPlacesChanged = (place) => {
            const request = { placeId: place.placeId };
            // IF FIELDS ARE PROVIDED TO FILTER DETAILS DATA
            if (this.props.placesOptions)
                request['fields'] = this.props.placesOptions;
            this.placesService.getDetails(request, (result) => {
                const position = result.geometry.location;
                const nextMarker = position ? { position } : {};
                const nextCenter = nextMarker.position
                    ? nextMarker.position
                    : this.state.center;
                this.setState({ center: nextCenter, marker: nextMarker }, () => {
                    if (!position) {
                        if (this.props.errorHandler)
                            this.props.errorHandler();
                        return;
                    }
                    this.setMarker(nextCenter, place, this.props.onPlacesChanged);
                });
            });
        };
        this.setMarker = (nextCenter, place, cb) => {
            // RESET MARKER IF ALREADY PRESENT
            if (this.markerService && this.markerService.setMap)
                this.markerService.setMap(null);
            const center = new google.maps.LatLng(nextCenter.lat(), nextCenter.lng());
            const markerObj = { position: center, map: this.map };
            if (this.props.markerIconUrl)
                markerObj['icon'] = this.props.markerIconUrl;
            this.markerService = new google.maps.Marker(markerObj);
            // CREATE INFO WINDOW FOR THE PIN LOCATION
            const { structured_formatting: { main_text, secondary_text }, } = place;
            const contentString = INFO_WINDOW.replace('mainText', main_text).replace('secondaryText', secondary_text);
            this.infoWindow = new google.maps.InfoWindow({
                content: contentString,
            });
            this.infoWindow.open(this.map, this.markerService);
            // RE CENTER MAP ACCORDING TO PINNED LOCATION
            this.map.panTo(center);
            if (cb)
                cb();
        };
    }
    componentWillMount() {
        if (!this.props.googleMapUrl && this.props.errorHandler) {
            this.props.errorHandler();
        }
    }
    componentDidMount() {
        const scriptjs = require(`scriptjs`);
        const { googleMapUrl } = this.props;
        scriptjs(googleMapUrl, this.onScriptLoad);
    }
    componentWillUnmount() {
        this.isUnmounted = true;
    }
    render() {
        const { mapElementId, searchElementId, onSearchBoxMounted, searchPlaceholder, searchOptions, } = this.props;
        const { scriptLoaded } = this.state;
        return (<div style={ctr}>
                <div style={mapCtr} id={mapElementId}/>
                {scriptLoaded && searchElementId ? (<SearchBox ref={ref => (this.searchInput = ref)} placeholder={searchPlaceholder} searchOptions={searchOptions} elementId={searchElementId} onMount={onSearchBoxMounted} onPlacesChanged={this.onPlacesChanged}/>) : null}
            </div>);
    }
}
export default GoogleMap;
//# sourceMappingURL=googleMap.jsx.map