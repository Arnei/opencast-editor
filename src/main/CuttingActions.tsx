import React, { SyntheticEvent } from "react";

import { basicButtonStyle, customIconStyle, flexGapReplacementStyle } from '../cssStyles'

import { IconType } from "react-icons";
import { LuScissors, LuChevronLeft, LuChevronRight, LuTrash, LuMoveHorizontal, LuPlus, LuMinus} from "react-icons/lu";
import { ReactComponent as TrashRestore } from '../img/trash-restore.svg';

import { css } from '@emotion/react'

import { useDispatch, useSelector } from 'react-redux';
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight, mergeAll, setZoom, selectTimelineZoom
} from '../redux/videoSlice'
import { GlobalHotKeys, KeySequence, KeyMapOptions } from "react-hotkeys";
import { cuttingKeyMap } from "../globalKeys";
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from "@reduxjs/toolkit";

import { useTranslation } from 'react-i18next';
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const timelineZoom = useSelector(selectTimelineZoom)

  /**
   * General action callback for cutting actions
   * @param event event triggered by click or button press
   * @param action redux event to dispatch
   * @param actionWithPayload Another type of redux event to dispatch
   * @param payload dispatch as a parameter with actionWithPayload
   * @param ref Pass a reference if the clicked element should lose focus
   */
  const dispatchAction = (event: KeyboardEvent | SyntheticEvent,
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    payload: any,
    ref: React.RefObject<HTMLDivElement> | undefined) => {

    event.preventDefault()                      // Prevent page scrolling due to Space bar press
    event.stopPropagation()                     // Prevent video playback due to Space bar press
    if (action) {
      dispatch(action())
    }
    if (actionWithPayload) {
      dispatch(actionWithPayload(payload))
    }

    // Lose focus if clicked by mouse
    if (ref) {
      ref.current?.blur()
    }
  }

  // Maps functions to hotkeys
  const handlers = {
    cut: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, cut, undefined, undefined, undefined) } },
    delete: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, markAsDeletedOrAlive, undefined, undefined, undefined) } },
    mergeLeft: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, mergeLeft, undefined, undefined, undefined) } },
    mergeRight: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, mergeRight, undefined, undefined, undefined) } },
    zoomIn: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, undefined, setZoom, timelineZoom + 0.1, undefined) } },
    zoomOut: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, undefined, setZoom, timelineZoom - 0.1, undefined) } },
  }

  const cuttingStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
  })

  const verticalLineStyle = css({
    borderLeft: '2px solid #DDD;',
    height: '32px',
  })

  const zoomStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    ...(flexGapReplacementStyle(10, true))
  })

  const inbetweenWordStyle = css({
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
  })

  return (
    <GlobalHotKeys keyMap={cuttingKeyMap} handlers={handlers} allowChanges={true} >
      <div css={cuttingStyle}>
        <CuttingActionsButton Icon={LuScissors}
          actionName={t("cuttingActions.cut-button")} actionHandler={dispatchAction} action={cut} actionWithPayload={undefined} payload={undefined}
          tooltip={t('cuttingActions.cut-tooltip', { hotkeyName: (cuttingKeyMap[handlers.cut.name] as KeyMapOptions).sequence })}
          ariaLabelText={t('cuttingActions.cut-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.cut.name] as KeyMapOptions).sequence })}
        />
        <div css={verticalLineStyle} />
        <MarkAsDeletedButton actionHandler={dispatchAction} action={markAsDeletedOrAlive}
          hotKeyName={(cuttingKeyMap[handlers.delete.name] as KeyMapOptions).sequence}
        />
        <div css={verticalLineStyle} />
        <CuttingActionsButton Icon={LuChevronLeft}
          actionName={t("cuttingActions.mergeLeft-button")} actionHandler={dispatchAction} action={mergeLeft} actionWithPayload={undefined} payload={undefined}
          tooltip={t('cuttingActions.mergeLeft-tooltip', { hotkeyName: (cuttingKeyMap[handlers.mergeLeft.name] as KeyMapOptions).sequence })}
          ariaLabelText={t('cuttingActions.mergeLeft-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.mergeLeft.name] as KeyMapOptions).sequence })}
        />
        <div css={verticalLineStyle} />
        <CuttingActionsButton Icon={LuChevronRight}
          actionName={t("cuttingActions.mergeRight-button")} actionHandler={dispatchAction} action={mergeRight} actionWithPayload={undefined} payload={undefined}
          tooltip={t('cuttingActions.mergeRight-tooltip', { hotkeyName: (cuttingKeyMap[handlers.mergeRight.name] as KeyMapOptions).sequence })}
          ariaLabelText={t('cuttingActions.mergeRight-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.mergeRight.name] as KeyMapOptions).sequence })}
        />
        <div css={verticalLineStyle} />
        <CuttingActionsButton Icon={LuMoveHorizontal}
          actionName={t("cuttingActions.merge-all-button")} actionHandler={dispatchAction} action={mergeAll} actionWithPayload={undefined} payload={undefined}
          tooltip={t('cuttingActions.merge-all-tooltip')}
          ariaLabelText={t('cuttingActions.merge-all-tooltip-aria')}
        />
        <div css={verticalLineStyle} />
        <div css={zoomStyle}>
          <CuttingActionsButton Icon={LuMinus}
            actionName="" actionHandler={dispatchAction} action={undefined} actionWithPayload={setZoom} payload={timelineZoom - 0.1}
            tooltip={t('cuttingActions.zoomOut-tooltip', { hotkeyName: (cuttingKeyMap[handlers.zoomOut.name] as KeyMapOptions).sequence })}
            ariaLabelText={t('cuttingActions.zoomOut-aria-tooltip', { hotkeyName: (cuttingKeyMap[handlers.zoomOut.name] as KeyMapOptions).sequence })}
          />
          <div css={inbetweenWordStyle}>{t('cuttingActions.zoom')}</div>
          <CuttingActionsButton Icon={LuPlus}
            actionName="" actionHandler={dispatchAction} action={undefined} actionWithPayload={setZoom} payload={timelineZoom + 0.1}
            tooltip={t('cuttingActions.zoomIn-tooltip', { hotkeyName: (cuttingKeyMap[handlers.zoomIn.name] as KeyMapOptions).sequence })}
            ariaLabelText={t('cuttingActions.zoomIn-aria-tooltip', { hotkeyName: (cuttingKeyMap[handlers.zoomIn.name] as KeyMapOptions).sequence })}
          />
        </div>
        {/* <CuttingActionsButton Icon={faQuestion} actionName="Reset changes" action={null}
          tooltip="Not implemented"
          ariaLabelText="Reset changes. Not implemented"
        />
        <CuttingActionsButton Icon={faQuestion} actionName="Undo" action={null}
          tooltip="Not implemented"
          ariaLabelText="Undo. Not implemented"
        /> */}
      </div>
    </GlobalHotKeys>
  );
};

/**
 * CSS for cutting buttons
 */
const cuttingActionButtonStyle = css({
  padding: '16px',
  // boxShadow: `${theme.boxShadow}`,
  // background: `${theme.element_bg}`
});

interface cuttingActionsButtonInterface {
  Icon: IconType,
  actionName: string,
  actionHandler: (event: KeyboardEvent | SyntheticEvent,
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    payload: any,
    ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string> | undefined,
  actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
  payload: any,
  tooltip: string,
  ariaLabelText: string,
}

/**
 * A button representing a single action a user can take while cutting
 * @param param0
 */
const CuttingActionsButton: React.FC<cuttingActionsButtonInterface> = ({Icon, actionName, actionHandler, action, actionWithPayload, payload, tooltip, ariaLabelText}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const theme = useTheme();

  return (
    <ThemedTooltip title={tooltip}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle]}
        ref={ref}
        role="button" tabIndex={0} aria-label={ariaLabelText}
        onClick={(event: SyntheticEvent) => actionHandler(event, action, actionWithPayload, payload, ref)}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          actionHandler(event, action, actionWithPayload, payload, undefined)
        } }}
      >
        <Icon />
        <span>{actionName}</span>
      </div>
    </ThemedTooltip>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (event: KeyboardEvent | SyntheticEvent,
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    payload: any,
    ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string>,
  hotKeyName: KeySequence,
}

/**
 * Button that changes its function based on context
 */
const MarkAsDeletedButton : React.FC<markAsDeleteButtonInterface> = ({actionHandler, action, hotKeyName}) => {
  const { t } = useTranslation();
  const isCurrentSegmentAlive = useSelector(selectIsCurrentSegmentAlive)
  const ref = React.useRef<HTMLDivElement>(null)

  const theme = useTheme();

  return (
    <ThemedTooltip title={t('cuttingActions.delete-restore-tooltip', { hotkeyName: hotKeyName })}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle]}
        ref={ref}
        role="button" tabIndex={0}
        aria-label={t('cuttingActions.delete-restore-tooltip-aria', { hotkeyName: hotKeyName })}
        onClick={(event: SyntheticEvent) => actionHandler(event, action, undefined, undefined, ref)}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          actionHandler(event, action, undefined, undefined, undefined)
        } }}
      >
        {isCurrentSegmentAlive ? <LuTrash /> : <TrashRestore css={customIconStyle(theme)} /> }
        <div>{isCurrentSegmentAlive ? t('cuttingActions.delete-button') : t("cuttingActions.restore-button")}</div>
      </div>
    </ThemedTooltip>
  );
}

export default CuttingActions;
