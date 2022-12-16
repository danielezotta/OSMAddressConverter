
import React from "react";
import { MapContainer, Polyline, TileLayer, Popup, Marker, FeatureGroup } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import L from "leaflet";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { AppContext } from './AppContext';

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function BaseMarkers({ geoJSONMarkers, compareClick, deleteClick, attrs }) {

  return (

    <MarkerClusterGroup disableClusteringAtZoom={18} showCoverageOnHover={false} maxClusterRadius={100} chunkedLoading={true}>
    { geoJSONMarkers.map((marker) => 
      <Marker key={`marker-base-${marker.id}`} position={marker.geometry.coordinates}>
        <Popup>
          <span>
            { attrs.map((key) => {
              return `${ marker.properties[key] }, `
            })}
          </span>
          <Stack direction="row">
            <Button component="span" onClick={(e) => compareClick(marker)}>Compare</Button>
            <Button component="span" onClick={(e) => deleteClick(marker)}>Delete</Button>
          </Stack>
        </Popup>
      </Marker>
    )}
    </MarkerClusterGroup>

  );

}

function OSMMarkers({ geoJSONMarkers, compareClick, attrs }) {

  return (

    <MarkerClusterGroup disableClusteringAtZoom={18}>
    { geoJSONMarkers.map((markerOSM) => 
      <Marker key={`marker-osm-${markerOSM.id}`} position={markerOSM.geometry.coordinates} icon={redIcon}>
        <Popup>          
          <span>
            { attrs.map((key) => {
              return `${ markerOSM.properties[key] }, `
            })}
          </span>
          <Stack direction="row">
            <Button component="span" onClick={(e) => compareClick(markerOSM)}>Compare</Button>
          </Stack>
        </Popup>
      </Marker>
    )}
    </MarkerClusterGroup>

  );

}

function PreviewMarkers({ geoJSONMarkers }) {

  return (

    <MarkerClusterGroup disableClusteringAtZoom={18}>
    {geoJSONMarkers.map((markerPreview) => 
      <Marker key={`marker-prev-${markerPreview.id}`} position={markerPreview.geometry.coordinates} icon={greenIcon}>
        <Popup>
          <span>{markerPreview.properties.street}, {markerPreview.properties.number}</span>
        </Popup>
      </Marker>
    )}
    </MarkerClusterGroup>

  );

}


class LeafletMap extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return(
      <AppContext.Consumer> 
        { context => (
          <MapContainer center={[46, 11]} zoom={12} scrollWheelZoom={true} maxZoom={18}>

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            { context.layerBaseEnabled && 
              <BaseMarkers 
                geoJSONMarkers={ context.markersBase }
                compareClick={(marker) => {
                  context.addCompareMarker(marker);

                  if (context.compareMarkers.length >= 2) {
                    context.setCompareParametersDialogOpen(true);
                  }
                }}
                deleteClick={(marker) => {
                  this.addManualDelete(marker);
                }}
                attrs={ context.markersBaseKeys } />
            }

            { context.layerOSMEnabled && 
              <OSMMarkers 
                geoJSONMarkers={ context.markersOSM } 
                compareClick={(markerOSM) => {
                  context.addCompareMarker(markerOSM);

                  if (context.compareMarkers.length >= 2) {
                    context.setCompareParametersDialogOpen(true);
                  }
                }}
                attrs={ context.markersOSMKeys }/>
            }

            { context.layerPreviewEnabled && 
              <PreviewMarkers geoJSONMarkers={ context.markersPreview } />
            }

            { context.layerPreviewEnabled && 
              <FeatureGroup>
                { context.markersPreview.map((markerPreview) => 
                  <Polyline positions={ [markerPreview.geometry.coordinates, markerPreview.properties.similarAddress] } color="green"/>
                )}
              </FeatureGroup>
            }

          </MapContainer>
        )}
      </AppContext.Consumer>
    );
  }

}

export default LeafletMap;