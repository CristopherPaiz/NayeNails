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
  const [loadedImages, setLoadedImages] = useState([0]);
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
    } else {
      setCurrentIndex(0);
      setLoadedImages([]);
      setProgress(100);
      setImageErrors({});
    }
  }, [data, lazy]);

  useEffect(() => {
    if (lazy && data && data.length > 0 && currentIndex < data.length - 1) {
      const nextIndex = (currentIndex + 1) % data.length;
      if (!loadedImages.includes(nextIndex)) {
        setLoadedImages((prev) => [...prev, nextIndex]);
      }
    }
  }, [currentIndex, data, lazy, loadedImages]);

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
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleNext = () => {
    if (!data || data.length === 0) return;
    if (currentIndex === data.length - 1 && !infiniteLoop) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % data.length);
    setProgress(100);
  };

  const handlePrev = () => {
    if (!data || data.length === 0) return;
    if (currentIndex === 0 && !infiniteLoop) {
      return;
    }
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
    if ("ontouchstart" in window) {
      setIsMobileInteraction(true);
    }
  };

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const handleImageClick = (item, index) => {
    onClickItem({ item, index, currentIndex });
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsMobileInteraction(true);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
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
      if (distance > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setIsDragging(false);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const getFallbackContent = (item, index) => {
    if (imageErrors[index]) {
      return item.legend || "Falló la carga de la imagen";
    }
    return null;
  };

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
              : `${heightPercentage}${heightPercentage && heightPercentage.toString().includes("dvh") ? "" : "%"}`,
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
              : `${heightPercentage}${heightPercentage && heightPercentage.toString().includes("dvh") ? "" : "%"}`,
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
        {data.map(
          (item, index) =>
            (lazy ? loadedImages.includes(index) : true) && (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full h-full
                ${transitionMode === "slide" ? "transform transition-transform duration-500" : ""}
                ${
                  transitionMode === "blur" || transitionMode === "fade"
                    ? `transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "opacity-0"}`
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
                onClick={() => handleImageClick(item, index)}
              >
                <img
                  src={item[imgUrl]}
                  alt={item.legend || "Carousel image"}
                  className="w-full h-full cursor-pointer"
                  style={{ objectFit: contentFit }}
                  onError={() => handleImageError(index)}
                />
                {getFallbackContent(item, index) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-white">
                    {getFallbackContent(item, index)}
                  </div>
                )}
              </div>
            )
        )}

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
          <div className="absolute bottom-0 left-0 w-full flex gap-2 overflow-x-auto bg-black/30 p-2">
            {data.map((item, index) => (
              <img
                key={index}
                src={item[imgUrl]}
                alt={item.legend || "Thumbnail"}
                className={`h-10 object-cover cursor-pointer
                  ${showIndicator && currentIndex === index ? "border-2 border-white" : ""}`}
                style={{ width: `${thumbnailWidth}px` }}
                onClick={(e) => handleThumbnailClick(index, e)}
                onError={() => handleImageError(`thumb-${index}`)}
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
              key={index}
              src={item[imgUrl]}
              alt={item.legend || "Thumbnail"}
              className={`h-10 object-cover cursor-pointer
                ${showIndicator && currentIndex === index ? "border-4 sm:border-2 border-black dark:border-white" : ""}`}
              style={{ width: `${thumbnailWidth}px` }}
              onClick={(e) => handleThumbnailClick(index, e)}
              onError={() => handleImageError(`thumb-${index}`)}
            />
          ))}
        </div>
      )}

      {showIndicator && !showThumbnails && (
        <div className="mt-2 flex gap-2">
          {data.map((_, index) => (
            <div
              key={index}
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
  data: PropTypes.arrayOf(
    PropTypes.shape({
      legend: PropTypes.string,
      url: PropTypes.string,
    })
  ),
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
