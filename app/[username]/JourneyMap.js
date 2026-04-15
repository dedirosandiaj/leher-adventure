'use client';

import { useEffect, useState } from 'react';
import styles from './profile.module.css';

// Default center (Indonesia)
const INDONESIA_CENTER = [-2.5489, 118.0149];
const DEFAULT_ZOOM = 5;



export default function JourneyMap({ journeys }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter journeys with coordinates
  const journeysWithCoords = journeys.filter(
    j => j.latitude && j.longitude
  );

  if (!mounted) {
    return <div className={styles.mapLoading}>Memuat peta...</div>;
  }

  if (journeysWithCoords.length === 0) {
    return (
      <div className={styles.mapEmpty}>
        <p>Belum ada data koordinat gunung</p>
        <small>Debug: {journeys.length} journeys, {journeysWithCoords.length} with coords</small>
      </div>
    );
  }

  // Dynamic import only when needed
  const MapComponent = () => {
    const [MapLib, setMapLib] = useState(null);

    useEffect(() => {
      Promise.all([
        import('leaflet'),
        import('react-leaflet')
      ]).then(([L, reactLeaflet]) => {
        // Fix marker icon using CDN URLs
        const DefaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;
        
        setMapLib({ L, ...reactLeaflet });
      });
    }, []);

    if (!MapLib) {
      return <div className={styles.mapLoading}>Memuat peta...</div>;
    }

    const { MapContainer, TileLayer, Marker, Popup, useMap } = MapLib;
    
    // Komponen untuk auto-fit bounds
    function AutoFitBounds() {
      const map = useMap();
      
      useEffect(() => {
        if (journeysWithCoords.length > 0) {
          const bounds = journeysWithCoords.map(m => [m.latitude, m.longitude]);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
      }, [map]);
      
      return null;
    }

    return (
      <MapContainer
        center={INDONESIA_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFitBounds />
        {journeysWithCoords.map((journey, index) => (
          <Marker
            key={journey.id || index}
            position={[journey.latitude, journey.longitude]}
          >
            <Popup permanent>
              <div className={styles.mapPopup}>
                <strong>{journey.mountainName}</strong>
                <br />
                <span>Kami telah selesai mendaki {journey.mountainName}</span>
                <br />
                <small>{journey.mountainLocation} • {journey.year}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    );
  };

  return (
    <div className={styles.mapContainer}>
      <MapComponent />
    </div>
  );
}
