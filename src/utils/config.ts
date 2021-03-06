export default {
    mapId: 'map-google-react',
    searchBoxId: 'map-google-react-search-box',
    defaultZoom: 14,
    defaultCenter: {
        lat: 26.850000,
        lng: 80.949997
    },
    pinImageUrl: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
    defaultInfoWindow: `
        <div style="display: flex; flex-direction: column; justify-content: center; font-size: 0.918rem; min-height: 28px;">
            <b>mainText</b>
            secondaryText
        </div>
    `
};