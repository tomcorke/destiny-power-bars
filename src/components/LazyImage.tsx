import classnames from "classnames";
import React, { useCallback, useState } from "react";

import STYLES from "./LazyImage.module.scss";

interface LazyImageProps {
  lowResImage: string;
  highResImage: string;
  delay?: number;
  alt?: string;
}

export const LazyImage = ({
  lowResImage,
  highResImage,
  alt = ""
}: LazyImageProps) => {
  const [highResImageLoaded, setHighResImageLoaded] = useState(false);

  const onHighResImageLoad = useCallback(() => {
    setHighResImageLoaded(true);
  }, [setHighResImageLoaded]);

  const result = (
    <div className={STYLES.lazyImage}>
      <img
        src={highResImage}
        alt={alt}
        className={classnames({
          [STYLES.hidden]: !highResImageLoaded,
          [STYLES.overlay]: !highResImageLoaded
        })}
        onLoad={onHighResImageLoad}
      />
      <img
        src={lowResImage}
        alt={alt}
        className={classnames({
          [STYLES.hidden]: highResImageLoaded,
          [STYLES.overlay]: highResImageLoaded
        })}
      />
    </div>
  );

  return result;
};
