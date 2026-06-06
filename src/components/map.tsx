"use client";
import MapGL, { Marker, Popup, GeolocateControl } from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo, useEffect } from 'react';
import { Farmer } from '../models/farmer';

interface SearchFilter {
  location: string | null;
  matchingProducts: string[];
}

const Map = () => {
  const [popupInfo, setPopupInfo] = useState<Farmer | null>(null);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilter | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function fetchFarmers() {
      const response = await fetch('/api/farmers');
      const result = await response.json();
      setFarmers(result.data);
    }
    fetchFarmers();
  }, []);

  const availableProducts = useMemo(
    () => Array.from(new Set(farmers.flatMap(f => f.products ?? []).filter(Boolean))),
    [farmers]
  );

  const displayedFarmers = useMemo(() => {
    if (!searchFilter) return farmers;
    const { location, matchingProducts } = searchFilter;
    return farmers.filter(farmer => {
      const locationMatch =
        !location || farmer.address.toLowerCase().includes(location.toLowerCase());
      const productMatch =
        matchingProducts.length === 0 ||
        (farmer.products ?? []).some(p =>
          matchingProducts.some(mp => p.toLowerCase() === mp.toLowerCase())
        );
      return locationMatch && productMatch;
    });
  }, [farmers, searchFilter]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, availableProducts }),
      });
      const data = await res.json();
      if (!data.error) setSearchFilter(data);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchFilter(null);
  };

  const markers = useMemo(
    () =>
      displayedFarmers.map(farmer => (
        <Marker
          key={farmer.username}
          longitude={farmer.coordinates.y}
          latitude={farmer.coordinates.x}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setPopupInfo(farmer);
          }}
        />
      )),
    [displayedFarmers]
  );

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        width: '580px',
        maxWidth: 'calc(100vw - 2rem)',
      }}>
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: '8px',
            background: 'white',
            borderRadius: '12px',
            padding: '10px 14px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            alignItems: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="e.g. I want to buy fruits from any farmer in Christchurch"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: '#333',
              background: 'transparent',
              minWidth: 0,
            }}
          />
          {searchFilter && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear search"
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#aaa',
                fontSize: '16px',
                lineHeight: 1,
                padding: '0 2px',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            style={{
              background: '#2d7d2f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 16px',
              cursor: isSearching || !searchQuery.trim() ? 'default' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              opacity: isSearching || !searchQuery.trim() ? 0.55 : 1,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'opacity 0.15s',
            }}
          >
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      <MapGL
        mapLib={import('mapbox-gl')}
        initialViewState={{
          longitude: 172.639847,
          latitude: -43.525650,
          zoom: 11,
        }}
        style={{ position: 'fixed', width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {markers}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.coordinates.y)}
            latitude={Number(popupInfo.coordinates.x)}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              <div>Address: {popupInfo.address}</div>
              <div>Products: {(popupInfo.products ?? []).join(', ')}</div>
            </div>
          </Popup>
        )}
        <GeolocateControl position="bottom-right" />
      </MapGL>
    </>
  );
};

export default Map;
