import React from "react";
import { useAppSelector } from "../redux/store";
import ThumbnailSelect from "./ThumbnailSelect";
import ThumbnailGeneration from "./ThumbnailGeneration";
import { selectIsDisplayEditView } from "../redux/thumbnailSlice";
import { selectPrimaryThumbnailTrack } from "../redux/videoSlice";
import { settings } from "../config";

/**
 * A container for the various thumbnail views
 */
const Thumbnail: React.FC = () => {

  const displayEditView = useAppSelector(selectIsDisplayEditView);
  const primaryTrack = useAppSelector(selectPrimaryThumbnailTrack);

  const render = () => {
    if (settings.thumbnail.simpleMode && primaryTrack !== undefined) {
      return <ThumbnailGeneration />;
    }
    return displayEditView ? <ThumbnailGeneration /> : <ThumbnailSelect />;
  };

  return (
    <>
      {render()}
    </>
  );
};

export default Thumbnail;
