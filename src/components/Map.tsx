import mapboxgl, { type LngLatLike } from "mapbox-gl";
import { useEffect, useState } from "react";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";
import type { Pairing } from "~/utils/interfaces";
import { Latitude, Longitude } from "~/utils/cities";
import { capitalize } from "~/server/utils/textFormat";

export const Map = ({
  points,
  onMapReady,
  highlightedCity,
}: {
  points: Pairing[];
  onMapReady?: (map: mapboxgl.Map) => void;
  highlightedCity?: string | null;
}) => {
  const [map, setMap] = useState<mapboxgl.Map>();
  const [screenW, setScreenW] = useState<number>();

  const { data: sunlights } = api.isohel.getAllData.useQuery();

  useEffect(() => {
    if (window && !screenW) {
      setScreenW(window.innerWidth);
    }
    if (map) return; // initialize map only once
    if (screenW) {
      const isMobile = screenW <= 768;

      const mapConfig = {
        zoom: 3,
        minZoom: isMobile ? 1.5 : 1.75,
        center: isMobile ? [14.7, 45.9] : [12, 45],
      };

      const newMap = new mapboxgl.Map({
        container: "map",
        accessToken: env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        style: "mapbox://styles/rhackshaw/clkgryts0002e01ohd79g0svm",
        center: mapConfig.center as LngLatLike,
        zoom: mapConfig.zoom,
        minZoom: mapConfig.minZoom,
        dragRotate: false,
      });

      const featureData = points.map((isohel) => {
        const firstLat = Latitude[isohel.firstCity as keyof typeof Latitude];
        const firstLong = Longitude[isohel.firstCity as keyof typeof Longitude];

        const secondLat = Latitude[isohel.secondCity as keyof typeof Latitude];
        const secondLong =
          Longitude[isohel.secondCity as keyof typeof Longitude];

        const first = [firstLat, firstLong] as [number, number];
        const second = [secondLat, secondLong] as [number, number];

        return {
          type: "Feature",
          properties: {
            cityPairId: isohel.firstCity,
          },
          geometry: {
            type: "LineString",
            coordinates: [first, second],
          },
        };
      });

      const allPoints = Object.entries(sunlights!)
        .filter((x) => x[0] !== "id")
        .map(([key, value]) => {
          const lat = Latitude[key as keyof typeof Latitude] as number;
          const long = Longitude[key as keyof typeof Longitude] as number;
          return {
            type: "Feature",
            properties: {
              description: `${capitalize(key)} (${value})`,
            },
            geometry: {
              type: "Point",
              coordinates: [lat, long],
            },
          };
        });

      const pointSet = {
        type: "FeatureCollection",
        features: allPoints,
      };
      const dataSet = {
        type: "FeatureCollection",
        features: featureData,
      };

      newMap.on("load", () => {
        newMap.addSource("places", {
          type: "geojson",
          data: dataSet as GeoJSON.FeatureCollection,
        });
        newMap.addSource("points", {
          type: "geojson",
          data: pointSet as GeoJSON.FeatureCollection,
        });

        newMap.addLayer({
          id: `places`,
          type: "line",
          source: `places`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#FCA311",
            "line-width": 7,
            "line-blur": 2,
          },
        });
        newMap.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "text-field": ["get", "description"],
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-justify": "auto",
            "icon-image": ["get", "icon"],
            "text-size": 15,
            "text-font": ["Arial Unicode MS Regular"],
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": "#fff",
            "text-halo-color": "#000",
            "text-halo-width": 2,
            "text-halo-blur": 2,
          },
        });
      });

      setMap(newMap);

      if (onMapReady) {
        onMapReady(newMap);
      }
    }
  }, [map, points, sunlights, screenW, onMapReady]);

  useEffect(() => {
    if (!map || !map.getLayer("places")) return;

    if (highlightedCity) {
      map.setPaintProperty("places", "line-color", [
        "case",
        ["==", ["get", "cityPairId"], highlightedCity],
        "#FF6B35",
        "#FCA311",
      ]);
      map.setPaintProperty("places", "line-width", [
        "case",
        ["==", ["get", "cityPairId"], highlightedCity],
        10, // Thicker for highlighted
        7, // Normal width
      ]);
      map.setPaintProperty("places", "line-opacity", [
        "case",
        ["==", ["get", "cityPairId"], highlightedCity],
        1,
        0.5,
      ]);
    } else {
      map.setPaintProperty("places", "line-color", "#FCA311");
      map.setPaintProperty("places", "line-width", 7);
      map.setPaintProperty("places", "line-opacity", 1);
    }
  }, [map, highlightedCity]);

  return <div id="map" className="fade-in absolute inset-0 h-full w-full" />;
};
