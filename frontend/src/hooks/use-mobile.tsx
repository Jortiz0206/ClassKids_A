import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/** Tableta o pantalla estrecha de escritorio (menos de 1024 px): el menú lateral se contrae. */
export function useIsNarrow() {
  const [narrow, setNarrow] = React.useState<boolean>(() => typeof window !== "undefined" && window.innerWidth < 1024);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setNarrow(window.innerWidth < 1024);
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return narrow;
}
