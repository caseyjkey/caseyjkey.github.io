import {useEffect, useRef} from 'react';
import {Loader} from '@googlemaps/js-api-loader';
import styles from '../styles/Map.module.css';

export default function Maps({ lat, lng }) {
  const googlemap = useRef(null);
  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    });

    let map, marker; 
    loader.load().then(() => {
      const google = window.google;
      map = new google.maps.Map(googlemap.current, {
        center: {lat: lat, lng: lng},
        zoom: 12,
      });
      marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
      });
    });
  });
  return (
    <div id={styles.map} ref={googlemap} />
  );
}