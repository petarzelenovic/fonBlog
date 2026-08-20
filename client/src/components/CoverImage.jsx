import { useEffect, useRef, useState } from "react";
import { HiOutlinePhotograph } from "react-icons/hi";

export default function CoverImage({ src, alt }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(Boolean(imgRef.current?.complete && imgRef.current.naturalWidth));
  }, [src]);

  return (
    <div className="relative aspect-4/3 overflow-hidden bg-fon-bg dark:bg-fon-dark-border">
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          loaded ? "pointer-events-none opacity-0" : "animate-pulse opacity-100"
        }`}
        aria-hidden={loaded}
      >
        <HiOutlinePhotograph className="h-10 w-10 text-fon-muted dark:text-fon-dark-muted" />
      </div>
      {src && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`aspect-4/3 h-full w-full object-cover transition duration-300 hover:scale-[1.02] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
