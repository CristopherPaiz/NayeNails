import React, { useState, useEffect } from "react";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRInput from "../../components/UI/CRInput";
import CRButton from "../../components/UI/CRButton";
import apiClient from "../../api/axios";
import CRAlert from "../../components/UI/CRAlert";

const ImageCard = ({ image, index, onRemove, onLegendAltChange, itemFieldLabel, isSubmitting }) => {
  const handleInputChange = (e) => {
    onLegendAltChange(index, e.target.value);
  };

  return (
    <div className="relative border border-gray-300 dark:border-slate-600 rounded-lg p-3 shadow-sm bg-white dark:bg-slate-700">
      <img src={image.preview || image.url} alt={`Previsualización ${index + 1}`} className="w-full h-32 object-cover rounded-md mb-2" />
      {itemFieldLabel && (
        <CRInput
          type="text"
          placeholder={itemFieldLabel}
          value={image.legend || image.alt || ""}
          setValue={handleInputChange}
          className="text-xs py-1"
          disabled={isSubmitting}
        />
      )}
      <CRButton
        title="Eliminar"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 !bg-red-500 hover:!bg-red-600 text-white !p-1 !m-0 text-xs"
        externalIcon={<DynamicIcon name="X" className="w-3 h-3" />}
        onlyIcon
        disabled={isSubmitting}
      />
    </div>
  );
};

const ImageManagerSection = ({
  title,
  sectionKey,
  initialImagesData = [],
  minImages,
  maxImages,
  itemFieldLabel,
  onSectionChange,
  isSubmittingGlobal,
}) => {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const initialProcessedImages = initialImagesData.map((img) => ({
      url: img.url,
      public_id: img.public_id || null,
      legend: img.legend || "",
      alt: img.alt || "",
      file: null,
      preview: img.url,
      isNew: false,
    }));
    setImages(initialProcessedImages);
  }, [initialImagesData]);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      CRAlert.alert({
        title: "Límite Excedido",
        message: `Puedes seleccionar un máximo de ${maxImages} imágenes para esta sección. Ya tienes ${images.length}.`,
        type: "warning",
      });
      return;
    }

    setIsUploading(true);
    let newImagesState = [...images];
    let successfulUploads = 0;

    for (const file of files) {
      const preview = URL.createObjectURL(file);
      const tempImageEntry = {
        file: file,
        preview: preview,
        legend: "",
        alt: "",
        url: null,
        public_id: null,
        isNew: true,
        isLoading: true,
      };
      newImagesState = [...newImagesState, tempImageEntry];
      setImages(newImagesState); // Update UI with placeholder

      const formData = new FormData();
      formData.append("site_image", file);

      try {
        const response = await apiClient.post("/site-uploads/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        newImagesState = newImagesState.map((img) =>
          img.preview === preview && img.isLoading
            ? { ...img, url: response.data.imageData.secure_url, public_id: response.data.imageData.public_id, isLoading: false }
            : img
        );
        successfulUploads++;
      } catch (error) {
        console.error("Error subiendo imagen:", error);
        CRAlert.alert({ title: "Error de Subida", message: `No se pudo subir ${file.name}.`, type: "error" });
        newImagesState = newImagesState.filter((img) => !(img.preview === preview && img.isLoading));
      }
      setImages(newImagesState); // Update UI after each attempt
    }

    onSectionChange(
      sectionKey,
      newImagesState.filter((img) => !img.isLoading)
    );
    setIsUploading(false);
    if (files.length > 0 && successfulUploads === 0) {
      // No specific alert here, individual errors shown
    } else if (successfulUploads < files.length) {
      CRAlert.alert({ title: "Subida Parcial", message: `Se subieron ${successfulUploads} de ${files.length} imágenes.`, type: "warning" });
    } else if (successfulUploads > 0) {
      // CRAlert.alert({ title: "Subida Completa", message: `Se subieron ${successfulUploads} imágenes.`, type: "success" });
      // This alert might be too much if saving is separate. Let's rely on save confirmation.
    }
    event.target.value = null; // Reset file input
  };

  const handleRemoveImage = (indexToRemove) => {
    const imageToRemove = images[indexToRemove];
    const newImageList = images.filter((_, index) => index !== indexToRemove);
    setImages(newImageList);
    onSectionChange(sectionKey, newImageList);

    if (imageToRemove.preview && imageToRemove.isNew) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    // Note: Actual deletion from Cloudinary happensサーバー側 on final save if an image with public_id is removed.
    // For now, we just remove from the list. The parent `Configuraciones.jsx` will handle final data.
  };

  const handleLegendAltChange = (index, value) => {
    const newImageList = images.map((img, i) => {
      if (i === index) {
        return itemFieldLabel === "Legend" ? { ...img, legend: value } : { ...img, alt: value };
      }
      return img;
    });
    setImages(newImageList);
    onSectionChange(sectionKey, newImageList);
  };

  const imageCount = images.filter((img) => !img.isLoading).length;

  return (
    <div className="bg-background dark:bg-slate-800 p-5 rounded-xl shadow-lg mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-2 sm:mb-0">
          <DynamicIcon name="Images" className="inline-block mr-2 w-5 h-5 text-primary" />
          {title}
        </h3>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          ({imageCount} / {maxImages} imágenes)
        </span>
      </div>
      <p className="text-xs text-textSecondary dark:text-slate-400 mb-3">
        Mínimo: {minImages}, Máximo: {maxImages}. {itemFieldLabel ? `El campo "${itemFieldLabel}" es opcional.` : ""}
      </p>

      <div className="mb-4">
        <label
          htmlFor={`file-upload-${sectionKey}`}
          className={`relative cursor-pointer bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors duration-150 inline-flex items-center
                      ${isUploading || isSubmittingGlobal || imageCount >= maxImages ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <DynamicIcon name="UploadCloud" className="w-4 h-4 mr-2" />
          Añadir Imágenes
          <input
            id={`file-upload-${sectionKey}`}
            name={`file-upload-${sectionKey}`}
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading || isSubmittingGlobal || imageCount >= maxImages}
          />
        </label>
        {isUploading && <span className="ml-3 text-sm text-primary animate-pulse">Subiendo...</span>}
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) =>
            image.isLoading ? (
              <div
                key={`loading-${index}`}
                className="relative border border-gray-300 dark:border-slate-600 rounded-lg p-3 shadow-sm bg-white dark:bg-slate-700 flex justify-center items-center h-48 animate-pulse"
              >
                <DynamicIcon name="Image" className="w-10 h-10 text-gray-400" />
              </div>
            ) : (
              <ImageCard
                key={image.preview || image.url || index}
                image={image}
                index={index}
                onRemove={handleRemoveImage}
                onLegendAltChange={handleLegendAltChange}
                itemFieldLabel={itemFieldLabel}
                isSubmitting={isSubmittingGlobal}
              />
            )
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-slate-400 py-4 text-center border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-md">
          No hay imágenes seleccionadas para esta sección.
        </p>
      )}
      {imageCount < minImages && <p className="text-xs text-red-500 dark:text-red-400 mt-2">Se requieren al menos {minImages} imágenes.</p>}
    </div>
  );
};

export default ImageManagerSection;
