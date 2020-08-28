# map-google-react

A highly customizable google map component which exposes complete customization options. It uses Google's Places API for Autocomplete options and fetching the details of a location. It also uses the Geococoder API get the details of a coordinate. 
`SearchBox` component is exported which can be sued as a child of `GoogleMap` component separately to make it customizable and controllable separately.

## Installation

Use the package manager [yarn](https://classic.yarnpkg.com/en/docs/install) to install `map-google-react`.

```bash
yarn add map-google-react
```

or using [npm](https://www.npmjs.com/get-npm)

```bash
npm install map-google-react
```


## Usage

```jsx
import { GoogleMap, SearchBox } from 'map-google-react';
```

```jsx
<GoogleMap
    googleMapUrl={`https://maps.googleapis.com/maps/api/js?key=<MAP_API_KEY>&libraries=places,geocoder`}
>
    <SearchBox />
</GoogleMap>
```

## Props

### GoogleMap

|     Prop     |       Type      | Default |             Description               |
| :----------: | :-------------: | :-----: | :-----------------------------------: |
| googleMapUrl |     string      |  -  | Google map url with API key. (libraries needed: places & geocoder) Ex: `https://maps.googleapis.com/maps/api/js?key=<MAP_API_KEY>&libraries=places,geocoder` |
| markerIconUrl |     string      |  `https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png`  | Url for the marker icon. Image located on the url should be of expected size of the marker. |
| defaultCenter |     { lat: number; lng: number }      |  { lat: 26.850000, lng: 80.949997 }  | Default center for the map when it is loaded |
| defaultMarker |     { lat: number; lng: number }      |  -  | Default marker to be diplayed on map when it is loaded. This overrides `defaultCenter` prop. |
| defaultZoom |     number (0 - 18)      |  14  | Default zoom factor for the google map |
| mapOptions |     [google.maps.MapOptions](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions)      | { mapTypeId: [google.maps.MapTypeId.ROADMAP](https://developers.google.com/maps/documentation/javascript/maptypes#BasicMapTypes), mapTypeControl: false, streetViewControl: false, fullscreenControl: false, scaleControl: false, zoomControl: true, disableDoubleClickZoom: true, clickableIcons: false } | Fields array accepted by Google maps `Places API`. This is going to save your cost. :D |
| placesOptions |     Array<string>      |  ['geometry', 'formatted_address']  | Fields array accepted by Google maps `Places API`. This is going to save your cost. :D |
| markerOptions |     [google.maps.ReadonlyMarkerOptions](https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions)      |  -  | Marker options to customize marker. (Note: `markerIconUrl` has precedence over the `icon` prop here) |
| infoWindowLoader |     JSX.Element      |  -  | Loader to show inside info window till the details are loaded |
| infoWindow |     string      |  `<div style="display: flex; flex-direction: column; justify-content: center; font-size: 0.918rem; min-height: 28px;"><b>mainText</b>secondaryText</div>`  | Stringified element for Info Window with `mainText` and `secondaryText` in place. These keywords are replaced with actual values. |
| beforeChange |    () => void      |  -  | Gets called before the change starts. In case you need to disable any confirm button in place till new location is selected. |
| onPlacesChange | (coordinates: { [key: string]: number }, callback: (place: string) => void) => void; |  -  | Receives the coordinates `{ lat, lng }` and then expects user to do `callback` with the location text separated by hyphen (-). eg: 'Para - Lucknow'. This is helpful when we fetch the location from coordinates on our own server to create a database, and then pass that to `callback` so next time for a same request we don't need to fetch details from google. This will bypass the `Geocoder API` and more savings. :D |
| afterChange |    (data: { lat: number, lng: number, place: string }) => void |  -  | Gets called once map is finished updating and returns the final lat, lng and the location text |
| onError |    (error: any) => void |  -  | Gets called an error is ocurred |

### SearchBox

|     Prop     |       Type      | Default |             Description               |
| :----------: | :-------------: | :-----: | :-----------------------------------: |
| placeholder |     string      | 'Search location' | Placeholder for the search input |
| inputStyles |     CSSProperties      | - | Custom styles for the input element |
| suggestionStyles |     CSSProperties      | - | Custom styles for a single suggestion in autocomplete |
| searchOptions |     [google.maps.places.AutocompletionRequest](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest)      | - | Custom options for the AutoComplete API |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT