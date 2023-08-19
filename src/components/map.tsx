"use client";
import MapGL, { Marker, Popup, GeolocateControl } from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css'
import { useState, useMemo, useEffect} from 'react';
import { Farmer } from '../models/farmer';

const Map = () => {
    const [popupInfo, setPopupInfo] = useState<Farmer | null>(null);
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    useEffect(() => {
      async function fetchFarmers() {
          const response = await fetch('/api/farmers');
          const data = await response.json();
          setFarmers(data.result.rows);
      }
      fetchFarmers();
    }, []);
    const markers = useMemo(
        () => 
            farmers.map((farmer, _index) => (
                <Marker
                    key={farmer.username}
                    longitude={farmer.coordinates.y}
                    latitude={farmer.coordinates.x}
                    anchor="bottom"
                    onClick={e => {
                    // If we let the click event propagates to the map, it will immediately close the popup
                    // with `closeOnClick: true`
                    e.originalEvent.stopPropagation();
                    setPopupInfo(farmer);
                    }}
                >
                </Marker>
            )), 
        [farmers]
    );
    return <MapGL
    mapLib={import('mapbox-gl')}
    initialViewState={{
    longitude: 172.639847,
    latitude: -43.525650,
    zoom: 11
    }}
    style={{position: 'fixed', width: '100%', height: '100%'}}
    mapStyle="mapbox://styles/mapbox/streets-v9"
    mapboxAccessToken="pk.eyJ1IjoicGVpeWljIiwiYSI6ImNsaTZ3Y2F2azFpanEzZm11MHNoaGh2djcifQ.Iu-30j4zFOo6BICH__DBAQ"
    >
        { markers }

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.coordinates.y)}
            latitude={Number(popupInfo.coordinates.x)}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              <div>Address: {popupInfo.address}</div>
              <div>Products: {popupInfo.products.join(',')}</div>
            </div>
          </Popup>
        )}
      <GeolocateControl
        position={'bottom-right'}
      />
    </MapGL>;
};

export default Map;