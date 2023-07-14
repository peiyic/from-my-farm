"use client";
import MapGL, { Marker, Popup } from "react-map-gl";
import {useState, useMemo} from 'react';
import { Farmer } from '../models/farmer';
import FARMERS from '../../data/famers.json';

const Map = () => {
    const [popupInfo, setPopupInfo] = useState<Farmer | null>(null);
    const markers = useMemo(
        () => 
            FARMERS.map((farmer, _index) => (
                <Marker
                    key={farmer.username}
                    longitude={farmer.address.longitude}
                    latitude={farmer.address.latitude}
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
        []
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
            longitude={Number(popupInfo.address.longitude)}
            latitude={Number(popupInfo.address.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              {popupInfo.name}
              {popupInfo.address.text}
            </div>
          </Popup>
        )}
    </MapGL>;
};

export default Map;