import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Layout } from "~/components/Layout";
import { Map } from "~/components/Map";
import { api } from "~/utils/api";
import { calculateIsohels } from "~/utils/calculateIsohels";
import type { Pairing } from "~/utils/interfaces";
import { Loading } from "~/components/Loading";
import { capitalize } from "~/server/utils/textFormat";
import { Marker } from "~/components/icons/Marker";
import { ArrowsRightLeft } from "~/components/icons/ArrowsRightLeft";
import { Latitude, Longitude } from "~/utils/cities";
import type mapboxgl from "mapbox-gl";

const UniqueCityList = ({
  points,
  onCityClick,
  onCityHover,
}: {
  points: Pairing[];
  onCityClick?: (cityName: string) => void;
  onCityHover?: (cityName: string | null) => void;
}) => {
  return (
    <>
      {points.map((x) => (
        <div
          key={x.firstCity + x.secondCity}
          onClick={() => onCityClick?.(x.firstCity)}
          onMouseEnter={() => onCityHover?.(x.firstCity)}
          onMouseLeave={() => onCityHover?.(null)}
          className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-transparent bg-dark/30 p-3 transition-all hover:border-sun hover:bg-sun/10"
        >
          <div className="flex items-center gap-1.5 text-cloud/80">
            <Marker />
            <p className="font-medium text-cloud">{capitalize(x.firstCity)}</p>
          </div>
          <div className="flex-shrink-0 text-sun">
            <ArrowsRightLeft />
          </div>
          <div className="flex items-center gap-1.5 text-cloud/80">
            <Marker />
            <p className="font-medium text-cloud">{capitalize(x.secondCity)}</p>
          </div>
        </div>
      ))}
    </>
  );
};

const TodayMessage = ({ pointCount }: { pointCount: number }) => {
  if (pointCount === 1) {
    return (
      <p className="text-base text-cloud md:text-lg">
        There is{" "}
        <span
          className={pointCount > 0 ? "gradient-text font-bold" : "text-cloud"}
        >
          {pointCount}
        </span>{" "}
        isohel.
      </p>
    );
  }
  return (
    <p className="text-base text-cloud md:text-lg">
      Today there are{" "}
      <span
        className={pointCount > 0 ? "gradient-text font-bold" : "text-cloud"}
      >
        {pointCount}
      </span>{" "}
      isohels.
    </p>
  );
};

const HomePage: NextPage = () => {
  const { data: sunlights, isLoading } = api.isohel.getAllData.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 60, // 1 hour - prevents unnecessary refetches
    }
  );

  const [points, setPoints] = useState<Pairing[]>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [highlightedCity, setHighlightedCity] = useState<string | null>(null);

  useEffect(() => {
    if (points) return;
    if (sunlights) {
      const isohels = calculateIsohels({ isohels: sunlights });
      setPoints(isohels);
    }
  }, [points, sunlights]);

  const handleCityClick = (cityName: string) => {
    if (!mapInstance) return;

    const lat = Latitude[cityName as keyof typeof Latitude];
    const lng = Longitude[cityName as keyof typeof Longitude];

    if (lat && lng) {
      mapInstance.flyTo({
        center: [lat, lng],
        zoom: 6,
        duration: 1500,
        essential: true,
      });
    }
  };

  const handleCityHover = (cityName: string | null) => {
    setHighlightedCity(cityName);
  };

  return (
    <>
      <Head>
        <title>Sun Pather</title>
        <meta
          name="description"
          content="See how the world is connected through sunshine"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!points && (
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <p className="font-wix text-white">Loading...</p>
            <Loading />
          </div>
        </div>
      )}
      {points && !isLoading && (
        <Layout>
          <div className="relative flex h-screen w-full overflow-hidden">
            <div className="relative z-20 hidden h-full w-96 flex-col bg-dark/95 shadow-2xl backdrop-blur-md md:flex">
              <div className="flex h-full flex-col overflow-hidden">
                <div className="flex-shrink-0 border-b border-sun/20 p-6">
                  <h1 className="gradient-text mb-2 text-5xl">Sun Pather</h1>
                  <p className="text-lg text-cloud">
                    Visualise the world&apos;s sunshine.
                  </p>
                </div>

                <div className="flex-shrink-0 border-b border-sun/20 bg-dark/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <p className="gradient-text text-xl font-bold">
                        `isohel`
                      </p>
                      <p className="text-xs text-cloud/90">
                        /&apos;ʌɪsə(ʊ)hɛl/
                      </p>
                    </div>
                    <p className="text-sm leading-tight text-cloud">
                      a line on a map connecting points having the same duration
                      of sunshine.
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 border-b border-sun/20 p-4">
                  <TodayMessage pointCount={points.length} />
                </div>

                <div className="flex min-h-0 flex-1 flex-col p-4">
                  <h2 className="gradient-text mb-3 text-2xl font-bold">
                    Connected Cities
                  </h2>
                  <div className="flex-1 overflow-y-auto rounded-md bg-dark/50 p-4">
                    <div className="flex flex-col gap-3">
                      <UniqueCityList
                        points={points}
                        onCityClick={handleCityClick}
                        onCityHover={handleCityHover}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute left-0 right-0 top-0 z-20 md:hidden">
              <div
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="cursor-pointer bg-dark/95 p-4 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="gradient-text text-2xl">Sun Pather</h1>
                    <p className="text-sm text-cloud">
                      Visualise the world&apos;s sunshine.
                    </p>
                    <p className="text-sm text-cloud">
                      Today there {points.length === 1 ? "is" : "are"}{" "}
                      <span className="gradient-text font-bold">
                        {points.length}
                      </span>{" "}
                      isohel{points.length === 1 ? "" : "s"}.
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 text-sun transition-transform duration-300 ${
                      sidebarOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div
                className={`overflow-hidden bg-dark/95 backdrop-blur-md transition-all duration-300 ${
                  sidebarOpen ? "max-h-[70vh]" : "max-h-0"
                }`}
              >
                <div className="border-t border-sun/20 bg-dark/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <p className="gradient-text text-lg font-bold">
                        `isohel`
                      </p>
                      <p className="text-xs text-cloud/90">
                        /&apos;ʌɪsə(ʊ)hɛl/
                      </p>
                    </div>
                    <p className="text-sm leading-tight text-cloud">
                      a line on a map connecting points having the same duration
                      of sunshine.
                    </p>
                  </div>
                </div>

                <div className="border-t border-sun/20 p-4">
                  <h2 className="gradient-text mb-3 text-xl font-bold">
                    Connected Cities
                  </h2>
                  <div className="max-h-[50vh] overflow-y-auto rounded-md bg-dark/50 p-3">
                    <div className="flex flex-col gap-2">
                      <UniqueCityList
                        points={points}
                        onCityClick={handleCityClick}
                        onCityHover={handleCityHover}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex-1">
              <Map
                points={points}
                onMapReady={setMapInstance}
                highlightedCity={highlightedCity}
              />
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default HomePage;
