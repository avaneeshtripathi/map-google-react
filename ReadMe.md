<GoogleMap
googleMapUrl={mapUrl} (Required)
mapElementId="mapElement" (Required)
searchElementId="searchElement" (Required)
defaultZoom={14} (Required)
defaultCenter={{ lat: 25.2048493, lng: 55.2707828 }} (Required)
markerIconUrl="/static/images/landmark-pin.svg" (Optional)
searchPlaceholder="Search location" (Optional)
searchOptions={{
    location: { lat: 25.2048493, lng: 55.2707828 },
    radius: 20000,
}} (Optional)
placesOptions={['geometry']} (Optional)
onPlacesChanged={() => {}} (Optional)
errorHandler={() => {}} (Optional)
onMapLoaded={() => {}} (Optional)
onSearchBoxMounted={() => {}} (Optional)
inputStyle={{padding: 20}} (Optional)
suggestionStyle={{padding: 20}} (Optional)
/>
