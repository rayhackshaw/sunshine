import type { PropsWithChildren } from "react";
import GithubIcon from "./svg/Github";
import Link from "next/link";
import { useRouter } from "next/router";

export const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const backlink = router.pathname.includes("about") ? "" : "about";

  return (
    <main className="relative mx-auto flex min-h-screen w-full flex-col overflow-y-auto font-wix">
      {children}
      <div className="absolute bottom-2 flex w-full items-center justify-between gap-2 px-4 text-xs md:text-lg">
        <div className="w-fit md:w-full">
          <Link
            href={`/${backlink}`}
            className="capitalize text-cloud underline"
          >
            {backlink}
          </Link>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <p>
              Made with{" "}
              <Link
                href="https://openweathermap.org/"
                className="text-cloud underline"
                target="_blank"
              >
                OpenWeatherMap
              </Link>
            </p>
            <p>
              Made With{" "}
              <Link
                href="https://www.mapbox.com/"
                className="text-cloud underline"
                target="_blank"
              >
                Mapbox
              </Link>
            </p>
          </div>
          <Link href="https://github.com/rayhackshaw/sunshine" target="_blank">
            <GithubIcon width={28} height={28} />
          </Link>
        </div>
      </div>
    </main>
  );
};
