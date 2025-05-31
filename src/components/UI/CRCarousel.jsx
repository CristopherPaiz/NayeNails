import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const CRCarousel = ({
  data = [],
  orientation = "horizontal",
  widthPercentage = 100,
  heightPercentage = null,
  infiniteLoop = true,
  lazy = true,
  contentFit = "cover",
  interval = 4000,
  height = 200,
  showThumbnails = false,
  thumbnailStyle = "outside",
  showArrows = false,
  showIndicator = true,
  showProgressBar = false,
  stopOnHover = true,
  transitionMode = "slide",
  thumbnailWidth = 50,
  onClickItem = () => {},
  imgUrl = "url",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loadedImages, setLoadedImages] = useState([]);
  const [imagesSuccessfullyLoaded, setImagesSuccessfullyLoaded] = useState({});
  const [progress, setProgress] = useState(100);
  const [imageErrors, setImageErrors] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isMobileInteraction, setIsMobileInteraction] = useState(false);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const validInterval = Math.max(2000, interval);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (data && data.length > 0) {
      setCurrentIndex(0);
      setLoadedImages(lazy ? [0] : Array.from({ length: data.length }, (_, i) => i));
      setProgress(100);
      setImageErrors({});
      setImagesSuccessfullyLoaded({});
    } else {
      setCurrentIndex(0);
      setLoadedImages([]);
      setImagesSuccessfullyLoaded({});
      setProgress(100);
      setImageErrors({});
    }
  }, [data, lazy]);

  useEffect(() => {
    if (lazy && data && data.length > 0) {
      const imagesToEnsureLoaded = new Set(loadedImages);
      let madeChange = false;

      if (!imagesToEnsureLoaded.has(currentIndex)) {
        imagesToEnsureLoaded.add(currentIndex);
        madeChange = true;
      }
      const nextIdx = (currentIndex + 1) % data.length;
      if (!imagesToEnsureLoaded.has(nextIdx)) {
        imagesToEnsureLoaded.add(nextIdx);
        madeChange = true;
      }
      const prevIdx = (currentIndex - 1 + data.length) % data.length;
      if (!imagesToEnsureLoaded.has(prevIdx)) {
        imagesToEnsureLoaded.add(prevIdx);
        madeChange = true;
      }

      if (madeChange) {
        setLoadedImages(Array.from(imagesToEnsureLoaded));
      }
    }
  }, [currentIndex, data, lazy]);

  useEffect(() => {
    const shouldPause = (stopOnHover && isHovered) || isMobileInteraction;

    if (!shouldPause && data && data.length > 0) {
      intervalRef.current = setInterval(() => {
        if (currentIndex === data.length - 1 && !infiniteLoop) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex((prev) => (prev + 1) % data.length);
        }
        setProgress(100);
      }, validInterval);

      if (showProgressBar) {
        const step = 100 / (validInterval / 100);
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => Math.max(prev - step, 0));
        }, 100);
      }
    }

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, [isHovered, isMobileInteraction, data, validInterval, stopOnHover, showProgressBar, infiniteLoop, currentIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsMobileInteraction(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleNext = () => {
    if (!data || data.length === 0) return;
    if (currentIndex === data.length - 1 && !infiniteLoop) return;
    setCurrentIndex((prev) => (prev + 1) % data.length);
    setProgress(100);
  };

  const handlePrev = () => {
    if (!data || data.length === 0) return;
    if (currentIndex === 0 && !infiniteLoop) return;
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
    setProgress(100);
  };

  const handleThumbnailClick = (index, e) => {
    e.stopPropagation();
    setCurrentIndex(index);
    setProgress(100);
    if (data && data.length > 0) {
      setLoadedImages(Array.from({ length: data.length }, (_, i) => i));
    }
  };

  const handleContainerClick = () => {
    if ("ontouchstart" in window) setIsMobileInteraction(true);
  };

  const handleImageLoad = (index, loadedSrc) => {
    if (data[index] && data[index][imgUrl] === loadedSrc) {
      setImagesSuccessfullyLoaded((prev) => ({ ...prev, [index]: true }));
      setImageErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const handleImageError = (index, erroredSrc) => {
    if (data[index] && data[index][imgUrl] === erroredSrc) {
      setImageErrors((prev) => ({ ...prev, [index]: true }));
      setImagesSuccessfullyLoaded((prev) => {
        const newLoaded = { ...prev };
        delete newLoaded[index];
        return newLoaded;
      });
    }
  };

  const handleImageClick = (item, index) => onClickItem({ item, index, currentIndex });
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsMobileInteraction(true);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleNext();
    else if (isRightSwipe) handlePrev();
  };
  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.pageX;
    const distance = startX - currentX;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) handleNext();
      else handlePrev();
      setIsDragging(false);
    }
  };
  const onMouseUp = () => setIsDragging(false);

  const shouldShowPrevArrow = showArrows && (infiniteLoop || currentIndex > 0);
  const shouldShowNextArrow = showArrows && (infiniteLoop || currentIndex < data.length - 1);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-neutral-800"
        style={{
          width: `${widthPercentage}%`,
          height:
            height && !heightPercentage
              ? `${height}px`
              : `${heightPercentage}${
                  heightPercentage && (heightPercentage.toString().includes("dvh") || heightPercentage.toString().includes("vh")) ? "" : "%"
                }`,
        }}
      >
        <p className="text-gray-500 dark:text-gray-400">No hay imágenes para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center" style={{ width: `${widthPercentage}%` }} onClick={handleContainerClick}>
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          height:
            height && !heightPercentage
              ? `${height}px`
              : `${heightPercentage}${
                  heightPercentage && (heightPercentage.toString().includes("dvh") || heightPercentage.toString().includes("vh")) ? "" : "%"
                }`,
          width: "100%",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {data.map((item, index) => {
          const shouldAttemptRender = lazy ? loadedImages.includes(index) : true;
          if (!shouldAttemptRender && lazy) return null;

          const isLoaded = imagesSuccessfullyLoaded[index];
          const hasError = imageErrors[index];

          return (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full
                ${transitionMode === "slide" ? "transform transition-transform duration-500" : ""}
                ${
                  transitionMode === "blur" || transitionMode === "fade"
                    ? `transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`
                    : ""
                }
                ${transitionMode === "blur" && index !== currentIndex ? "blur-sm" : ""}
              `}
              style={
                transitionMode === "slide"
                  ? {
                      transform:
                        orientation === "horizontal"
                          ? `translateX(${(index - currentIndex) * 100}%)`
                          : `translateY(${(index - currentIndex) * 100}%)`,
                    }
                  : {}
              }
            >
              {hasError ? (
                <div className="w-full h-full">{item.legend || ""}</div>
              ) : isLoaded ? (
                <img
                  src={item[imgUrl]}
                  alt={item.legend || "Carousel image"}
                  className="w-full h-full cursor-pointer"
                  style={{ objectFit: contentFit }}
                  onClick={() => handleImageClick(item, index)}
                />
              ) : (
                <>
                  <div className="w-full h-full bg-primary/20 animate-pulse rounded-md"></div>
                  <img
                    src={item[imgUrl]}
                    alt=""
                    className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
                    style={{ objectFit: contentFit }}
                    onLoad={() => handleImageLoad(index, item[imgUrl])}
                    onError={() => handleImageError(index, item[imgUrl])}
                  />
                </>
              )}
            </div>
          );
        })}

        {shouldShowPrevArrow && (
          <button onClick={handlePrev} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10">
            ←
          </button>
        )}
        {shouldShowNextArrow && (
          <button onClick={handleNext} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10">
            →
          </button>
        )}

        {thumbnailStyle === "inside" && showThumbnails && (
          <div className="absolute bottom-0 left-0 w-full flex gap-2 overflow-x-auto bg-black/30 p-2 z-10">
            {data.map((item, index) => (
              <img
                key={`thumb-in-${index}`}
                src={item[imgUrl]}
                alt={item.legend || "Thumbnail"}
                className={`h-10 object-cover cursor-pointer
                  ${showIndicator && currentIndex === index ? "border-2 border-white" : ""}`}
                style={{ width: `${thumbnailWidth}px` }}
                onClick={(e) => handleThumbnailClick(index, e)}
                onError={() => handleImageError(`thumb-in-${index}`, item[imgUrl])}
              />
            ))}
          </div>
        )}
      </div>

      {showProgressBar && (
        <div className="w-full -mt-1 h-[3px]">
          <div className="h-full bg-black dark:bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      )}

      {thumbnailStyle === "outside" && showThumbnails && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {data.map((item, index) => (
            <img
              key={`thumb-out-${index}`}
              src={item[imgUrl]}
              alt={item.legend || "Thumbnail"}
              className={`h-10 object-cover cursor-pointer
                ${showIndicator && currentIndex === index ? "border-4 sm:border-2 border-black dark:border-white" : ""}`}
              style={{ width: `${thumbnailWidth}px` }}
              onClick={(e) => handleThumbnailClick(index, e)}
              onError={() => handleImageError(`thumb-out-${index}`, item[imgUrl])}
            />
          ))}
        </div>
      )}

      {showIndicator && !showThumbnails && (
        <div className="mt-2 flex gap-2">
          {data.map((_, index) => (
            <div
              key={`indicator-${index}`}
              className={`w-2 h-2 rounded-full cursor-pointer
                ${currentIndex === index ? "bg-black/60 dark:bg-white" : "bg-black/30 dark:bg-white/50"}`}
              onClick={(e) => handleThumbnailClick(index, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

CRCarousel.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
  widthPercentage: PropTypes.number,
  heightPercentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  infiniteLoop: PropTypes.bool,
  lazy: PropTypes.bool,
  contentFit: PropTypes.oneOf(["contain", "cover", "fill"]),
  interval: PropTypes.number,
  height: PropTypes.number,
  showThumbnails: PropTypes.bool,
  thumbnailStyle: PropTypes.oneOf(["inside", "outside"]),
  showArrows: PropTypes.bool,
  showIndicator: PropTypes.bool,
  showProgressBar: PropTypes.bool,
  stopOnHover: PropTypes.bool,
  transitionMode: PropTypes.oneOf(["slide", "blur", "fade"]),
  thumbnailWidth: PropTypes.number,
  onClickItem: PropTypes.func,
  imgUrl: PropTypes.string,
};

export default CRCarousel;
