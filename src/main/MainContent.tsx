import React from "react";

import Video from './Video';
import Timeline from './Timeline';
import CuttingActions from './CuttingActions';
import Metadata from './Metadata';
import Finish from "./Finish"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/react'

import { useSelector } from 'react-redux'
import { selectMainMenuState } from '../redux/mainMenuSlice'

import { MainMenuStateNames } from '../types'
import { flexGapReplacementStyle } from "../cssStyles";

/**
 * A container for the main functionality
 * Shows different components depending on the state off the app
 */
const MainContent: React.FC<{}> = () => {

  const mainMenuState = useSelector(selectMainMenuState)

  const cuttingStyle = css({
    display: mainMenuState !== MainMenuStateNames.cutting ? 'none' :'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '20px',
  })

  const metadataStyle = css({
    display: mainMenuState !== MainMenuStateNames.metadata ? 'none' :'flex',
    // flexDirection: 'column' as const,
    // justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '20px',
  })

  const finishStyle = css({
    display: mainMenuState !== MainMenuStateNames.finish ? 'none' : 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    height: '100%',
  })

  const defaultStyle = css({
    display: (mainMenuState === MainMenuStateNames.cutting || mainMenuState === MainMenuStateNames.finish
              || mainMenuState === MainMenuStateNames.metadata)
              ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    ...(flexGapReplacementStyle(20, false)),
  })

  return (
     <main css={{width: '100%'}} role="main">
      <div css={cuttingStyle}>
          <Video />
          <CuttingActions />
          <Timeline />
      </div>
      <div css={metadataStyle}>
          <Metadata />
      </div>
      <div css={finishStyle}>
        <Finish />
      </div>
      <div css={defaultStyle}>
        <FontAwesomeIcon icon={faTools} size="10x" />
        Placeholder
      </div>
     </main>
  );
};

export default MainContent;
