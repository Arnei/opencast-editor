import React, { useState, useRef, useEffect } from 'react'

import Draggable from 'react-draggable';

import { css } from '@emotion/react'

import { useSelector, useDispatch } from 'react-redux';
import { Segment, httpRequestState, MainMenuStateNames } from '../types'
import {
  selectIsPlaying, selectCurrentlyAt, selectSegments, selectActiveSegmentIndex, selectDuration,
  setIsPlaying, selectVideoURL, setCurrentlyAt, setClickTriggered, dragSegmentBorder
} from '../redux/videoSlice'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSpinner } from "@fortawesome/free-solid-svg-icons";

import useResizeObserver from "use-resize-observer";

import { Waveform } from '../util/waveform'
import { convertMsToReadableString } from '../util/utilityFunctions';
import { GlobalHotKeys } from 'react-hotkeys';
import { scrubberKeyMap } from '../globalKeys';

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { selectMainMenuState } from '../redux/mainMenuSlice';
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';

/**
 * A container for visualizing the cutting of the video, as well as for controlling
 * the current position in the video
 * Its width corresponds to the duration of the video
 * TODO: Figure out why ResizeObserver does not update anymore if we stop passing the width to the SegmentsList
 */
const Timeline: React.FC<{}> = () => {

  // Init redux variables
  const dispatch = useDispatch();
  const duration = useSelector(selectDuration)

  const { ref, width = 1, } = useResizeObserver<HTMLDivElement>();

  const timelineStyle = css({
    position: 'relative',     // Need to set position for Draggable bounds to work
    height: '250px',
    width: '100%',
  });

  // Update the current time based on the position clicked on the timeline
  const setCurrentlyAtToClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let rect = e.currentTarget.getBoundingClientRect()
    let offsetX = e.clientX - rect.left
    dispatch(setClickTriggered(true))
    dispatch(setCurrentlyAt((offsetX / width) * (duration)))
  }

  return (
  <div ref={ref} css={timelineStyle} title="Timeline" onMouseDown={e => setCurrentlyAtToClick(e)}>
    <Scrubber timelineWidth={width}/>
    <div css={{height: '230px'}} >
      <Waveforms />
      <SegmentsGaps timelineWidth={width}/>
      <SegmentsList timelineWidth={width}/>
    </div>
  </div>
  );
};

/**
 * Displays and defines the current position in the video
 * @param param0
 */
const Scrubber: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAt)
  const duration = useSelector(selectDuration)
  const activeSegmentIndex = useSelector(selectActiveSegmentIndex)  // For ARIA information display
  const segments = useSelector(selectSegments)                      // For ARIA information display
  const mainMenuState = useSelector(selectMainMenuState)            // For hotkey enabling/disabling

  // Init state variables
  const [controlledPosition, setControlledPosition] = useState({x: 0,y: 0,});
  const [isGrabbed, setIsGrabbed] = useState(false)
  const [wasPlayingWhenGrabbed, setWasPlayingWhenGrabbed] = useState(false)
  const [keyboardJumpDelta, setKeyboardJumpDelta] = useState(1000)  // In milliseconds. For keyboard navigation
  const wasCurrentlyAtRef = useRef(0)
  const nodeRef = React.useRef(null); // For supressing "ReactDOM.findDOMNode() is deprecated" warning

  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    if(currentlyAt !== wasCurrentlyAtRef.current && !isGrabbed) {
      updateXPos();
      wasCurrentlyAtRef.current = currentlyAt;
    }
  })

  // Reposition scrubber when the timeline width changes
  useEffect(() => {
    if(currentlyAt && duration) {
      setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y: 0});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineWidth])

  // Callback for when the scrubber gets dragged by the user
  const onControlledDrag = (e: any, position: any) => {
    // Update position
    const {x} = position
    dispatch(setCurrentlyAt((x / timelineWidth) * (duration)))
  };

  // Callback for when the position changes by something other than dragging
  const updateXPos = () => {
    const y = controlledPosition.y;
    setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y});
  };

  const onStartDrag = () => {
    setIsGrabbed(true)

    // Halt video playback
    if (isPlaying) {
      setWasPlayingWhenGrabbed(true)
      dispatch(setIsPlaying(false))
    } else {
      setWasPlayingWhenGrabbed(false)
    }
  }

  const onStopDrag = (e: any, position: any) => {
    // Update position
    const {x, y} = position;
    setControlledPosition({x, y});
    dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));

    setIsGrabbed(false)
    // Resume video playback
    if (wasPlayingWhenGrabbed) {
      dispatch(setIsPlaying(true))
    }
  }

  // Callbacks for keyboard controls
  // TODO: Better increases and decreases than ten intervals
  // TODO: Additional helpful controls (e.g. jump to start/end of segment/next segment)
  const handlers = {
    left: () => dispatch(setCurrentlyAt(Math.max(currentlyAt - keyboardJumpDelta, 0))),
    right: () => dispatch(setCurrentlyAt(Math.min(currentlyAt + keyboardJumpDelta, duration))),
    increase: () => setKeyboardJumpDelta(keyboardJumpDelta => Math.min(keyboardJumpDelta * 10, 1000000)),
    decrease: () => setKeyboardJumpDelta(keyboardJumpDelta => Math.max(keyboardJumpDelta / 10, 1))
  }

  const scrubberStyle = css({
    backgroundColor: 'black',
    height: '250px',
    width: '1px',
    position: 'absolute' as 'absolute',
    zIndex: 2,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const scrubberDragHandleStyle = css({
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    cursor: isGrabbed ? "grabbing" : "grab",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
  })

  const scrubberDragHandleIconStyle = css({
    transform: 'scaleY(1.5) rotate(90deg)',
    padding: '5px',
  })

  const arrowUpStyle = css({
    width: 0,
    height: 0,
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderBottom: '7px solid black',
  })

  const arrowDownStyle = css({
    width: 0,
    height: 0,
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderTop: '7px solid black',
  })

  // // Possible TODO: Find a way to use ariaLive in a way that only the latest change is announced
  // const keyboardUpdateMessage = () => {
  //   return currentlyAt +  " Milliseconds"
  // }

  return (
    <GlobalHotKeys keyMap={scrubberKeyMap} handlers={mainMenuState === MainMenuStateNames.cutting ? handlers: {}} allowChanges={true}>
      <Draggable
        onDrag={onControlledDrag}
        onStart={onStartDrag}
        onStop={onStopDrag}
        axis="x"
        bounds="parent"
        position={controlledPosition}
        nodeRef={nodeRef}
        >
          <div ref={nodeRef} css={scrubberStyle}>

            <div css={arrowDownStyle}></div>
            <div css= {scrubberDragHandleStyle} aria-grabbed={isGrabbed}
              aria-label={t("timeline.scrubber-text-aria",
                         {currentTime: convertMsToReadableString(currentlyAt), segment: activeSegmentIndex,
                          segmentStatus: (segments[activeSegmentIndex].deleted ? "Deleted" : "Alive"),
                          moveLeft: scrubberKeyMap[handlers.left.name],
                          moveRight: scrubberKeyMap[handlers.right.name],
                          increase: scrubberKeyMap[handlers.increase.name],
                          decrease: scrubberKeyMap[handlers.decrease.name] })}
              tabIndex={0}>
              <FontAwesomeIcon css={scrubberDragHandleIconStyle} icon={faBars} size="1x" />
              {/* <div css={ariaLive} aria-live="polite" aria-atomic="true">{keyboardUpdateMessage()}</div> */}
            </div>
            <div css={arrowUpStyle}></div>
          </div>
      </Draggable>
    </GlobalHotKeys>
  );
};

/**
 * Container responsible for rendering the segments that are created when cutting
 */
const SegmentsList: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  const { t } = useTranslation();

  // Init redux variables
  const segments = useSelector(selectSegments)
  const duration = useSelector(selectDuration)
  const activeSegmentIndex = useSelector(selectActiveSegmentIndex)

  /**
   * Returns a background color based on whether the segment is to be deleted
   * and whether the segment is currently active
   */
  const bgColor = (deleted: boolean, active: boolean) => {
    if (!deleted && !active) {
      return 'rgba(0, 0, 255, 0.4)'
    } else if (deleted && !active) {
      return `repeating-linear-gradient(
                -45deg,
                rgba(255, 45, 45, 0.4),
                rgba(255, 45, 45, 0.4) 10px,
                rgba(255, 0, 0, 0.4) 10px,
                rgba(255, 0, 0, 0.4) 20px);`
    } else if (!deleted && active) {
      return 'rgba(0, 0, 200, 0.4)'
    } else if (deleted && active) {
      return `repeating-linear-gradient(
                -45deg,
                rgba(200, 45, 45, 0.4),
                rgba(200, 45, 45, 0.4) 10px,
                rgba(200, 0, 0, 0.4) 10px,
                rgba(200, 0, 0, 0.4) 20px);`
    }
  }

  // Render the individual segments
  const renderedSegments = () => {
    return (
      segments.map( (segment: Segment, index: number) => (
        <div key={segment.id} title={t("timeline.segment-tooltip", {segment: index})}
          aria-label={t("timeline.segments-text-aria",
                     {segment: index,
                      segmentStatus: (segment.deleted ? "Deleted" : "Alive"),
                      start: convertMsToReadableString(segment.start),
                      end: convertMsToReadableString(segment.end) })}
          tabIndex={0}
        css={{
          background: bgColor(segment.deleted, activeSegmentIndex === index),
          borderRadius: '5px',
          borderStyle: activeSegmentIndex === index ? 'dashed' : 'solid',
          borderColor: 'white',
          borderWidth: '1px',
          boxSizing: 'border-box',
          width: ((segment.end - segment.start) / duration) * 100 + '%',
          height: '230px',
          zIndex: 1,
        }}>
        </div>
      ))
    );
  }

  const segmentsStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    paddingTop: '10px',
  })

  return (
    <div css={segmentsStyle} title="Segments">
      {renderedSegments()}
    </div>
  );
};

/**
 * Creates draggable elements at the end of each segment
 */
const SegmentsGaps: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  // Init redux variables
  const segments = useSelector(selectSegments)

  const renderedSegments = () => {
    const gaps: EmotionJSX.Element[] = []
    for (var index = 0; index < segments.length - 1; index++) {
        gaps.push(<SegmentsGap key={segments[index].id} timelineWidth={timelineWidth} segment={segments[index]} nextSegment={segments[index + 1]} index={index} />)
    }
    return gaps
  }

  const segmentsStyle = css({
    width: '100%',
    position: "absolute" as "absolute",
    height: '230px',
    paddingTop: '10px',
  })

  return (
    <div css={segmentsStyle}>
      {renderedSegments()}
    </div>
  );
}

/**
 * Draggable element at the end of a segment
 * Dragging this should look like the segment border is being moved
 */
const SegmentsGap: React.FC<{timelineWidth: number, segment: Segment, nextSegment: Segment, index: number}> = ({timelineWidth, segment, nextSegment, index}) => {

  // Init redux variables
  const dispatch = useDispatch();
  const duration = useSelector(selectDuration)

  // const nodeRef = React.useRef(null); // For supressing "ReactDOM.findDOMNode() is deprecated" warning

  const [showLine, setShowLine] = useState(false)
  const [controlledPosition, setControlledPosition] = useState({x: 0,y: 0,});

  const onStartDrag = () => {
    setShowLine(true)
  }

  const onStopDrag = (e: any, position: any) => {
    setShowLine(false)
    const time = ((position.node.offsetLeft + position.x) / timelineWidth) * (duration)
    dispatch(dragSegmentBorder({index, time}))

    setControlledPosition({x:0, y:0})
  }

  const gapStyle = css({
    position: 'absolute',
    left: (1 - ((duration - segment.end) / duration)) * 100 + '%',
    marginLeft: '-3px',
    // background: showLine ? "yellow" : "green",
    width: '6px',
    height: '230px',
    zIndex: 2,
  })

  return (
      <Draggable
      onStart={onStartDrag}
      onStop={onStopDrag}
      axis="x"
      bounds="parent"
      position={controlledPosition}

      // nodeRef={nodeRef}
      >
        <div css={gapStyle}>
          {showLine ? <div css={{background: 'black', width: '1px', height: '100%'}}></div> : false}
        </div>
      </Draggable>
  );
}

/**
 * Generates waveform images and displays them
 */
const Waveforms: React.FC<{}> = () => {

  const { t } = useTranslation();

  const videoURLs = useSelector(selectVideoURL)
  const videoURLStatus = useSelector((state: { videoState: { status: httpRequestState["status"] } }) => state.videoState.status);

  // Update based on current fetching status
  const [images, setImages] = useState<string[]>([])
  const [waveformWorkerError, setWaveformWorkerError] = useState<boolean>(false)

  const waveformDisplayTestStyle = css({
    display: 'flex',
    flexDirection: 'column',
    position: "absolute" as "absolute",
    justifyContent: 'center',
    ...(images.length <= 0) && {alignItems: 'center'},  // Only center during loading
    width: '100%',
    height: '230px',
    paddingTop: '10px',
  });

  // When the URLs to the videos are fetched, generate waveforms
  useEffect( () => {
    if (videoURLStatus === 'success') {
      const images: string[] = []    // Store local paths to image files
      let waveformsProcessed : number = 0  // Counter for checking if all workers are done

      // Only display the waveform of the first video we get
      const onlyOneURL = [videoURLs[0]]

      onlyOneURL.forEach((videoURL, _index, array) => {
        // Set up blob request
        var blob = null
        var xhr = new XMLHttpRequest()
        xhr.open("GET", videoURL)
        xhr.responseType = "blob"
        xhr.onload = function()
        {
          blob = xhr.response
          var file = new File([blob], blob)

          // Start waveform worker with blob
          const waveformWorker : any = new Waveform({type: 'img', width: '2000', height: '230', samples: 100000, media: file})

          waveformWorker.onarne = function(error: string) {
            setWaveformWorkerError(true)
            console.log("Waveform could not be generated:" + error)
          }

          // When done, save path to generated waveform img
          waveformWorker.oncomplete = function(image: any, numSamples: any) {
            images.push(image)
            waveformsProcessed++
            // If all images are generated, rerender
            if (waveformsProcessed === array.length) {
              setImages(images)
            }
          }
        }

        xhr.send()
      })
    }
  }, [videoURLStatus, videoURLs]);


  const renderImages = () => {
    if (images.length > 0) {
      return (
        images.map((image, index) =>
          <img key={index} alt='Waveform' src={image ? image : ""} css={{minHeight: 0}}></img>
        )
      );
    } else if (waveformWorkerError) {
      return (
        <div>{"Waveform could not be generated"}</div>
      );
    }
    else {
      return (
        <>
          <FontAwesomeIcon icon={faSpinner} spin size="3x"/>
          <div>{t("timeline.generateWaveform-text")}</div>
        </>
      );
    }
  }

  return (
  <div css={waveformDisplayTestStyle} title="WaveformDisplayTest">
    {renderImages()}
  </div>
  );
}

export default Timeline;
