import React from "react";

const GalleryItem = ({ item, itemClassName, imageClassName }) => {
  return (
    <a key={item.id} className={itemClassName} data-src={item.src} data-sub-html={item.subHtml || ""} data-lg-size={item.lgSize || ""}>
      <img alt={item.alt} src={item.thumb} className={imageClassName} loading="lazy" />
    </a>
  );
};

export default GalleryItem;
