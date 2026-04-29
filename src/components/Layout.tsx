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
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-4 text-xs text-cloud">
        <Link
          href={`/${backlink}`}
          className="capitalize underline"
        >
          {backlink || "Home"}
        </Link>
        <span>
          Made with{" "}
          <Link
            href="https://openweathermap.org/"
            className="underline"
            target="_blank"
          >
            OpenWeatherMap
          </Link>
        </span>
        <span>
          Made with{" "}
          <Link
            href="https://www.mapbox.com/"
            className="underline"
            target="_blank"
          >
            Mapbox
          </Link>
        </span>
        <Link href="https://github.com/rayhackshaw/sunshine" target="_blank">
          <GithubIcon width={20} height={20} />
        </Link>
      </div>
    </main>
  );
};
