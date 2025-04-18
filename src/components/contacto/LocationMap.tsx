
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const LocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // Coordonnées de Montijo, Portugal
  const OFFICE_LOCATION = {
    lng: -8.975,
    lat: 38.706,
    zoom: 15
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHRwOWl1cmYwMGw3MmpxdWYyNm5iN3gwIn0.YZ4M8meKvDwQw7XT5bY6VQ';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [OFFICE_LOCATION.lng, OFFICE_LOCATION.lat],
      zoom: OFFICE_LOCATION.zoom
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add marker at office location
    new mapboxgl.Marker()
      .setLngLat([OFFICE_LOCATION.lng, OFFICE_LOCATION.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<h3>Pazproperty</h3><p>Rua Professor Sergio Pinto 224, 3°Dto<br>2870-497 Montijo, Portugal</p>')
      )
      .addTo(map.current);

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Onde Estamos</h2>
        <div className="h-[500px] rounded-xl overflow-hidden shadow-lg">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
