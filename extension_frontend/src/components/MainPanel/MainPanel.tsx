import React, { useState } from "react";
import "./MainPanel.css";
import Draggable from "react-draggable";
import { GripIcon, NotPlayingIcon, PinIcon } from "../Icons/Icons";
import ViewContainer from "../ViewContainer/ViewContainer";
import Loading from "../Loading/Loading";
import { toArray } from "../../util";
import { Icon, OneOrMore } from "../../types";

export const FogBackground = () => <div className="main-panel-fog" />;

interface PanelDraggerProps {
  id?: string;
}

const PanelDragger: React.FC<PanelDraggerProps> = ({ children, id }) => (
  <div id={id} className="main-panel-dragger">
    {children}
  </div>
);

interface PanelButtonProps {
  onClick: () => void;
  active: boolean;
  children: [string, ReturnType<Icon>];
  star: boolean;
  [index: string]: any;
}

const PanelButton: React.FC<PanelButtonProps> = ({
  onClick,
  active,
  children,
  star,
  ...rest
}) => {
  const PanelIcon = children[1];
  return (
    <button onClick={onClick} className={active ? "active" : ""} {...rest}>
      <div className="w-8">{PanelIcon}</div>
      {children[0]}
      {star ? <div className="star">*</div> : ""}
    </button>
  );
};

const PanelButtonBar: React.FC<{
  children: React.ReactElement[];
  onClose: () => void;
}> = ({ onClose, children }) => {
  return (
    <>
      <div id="panel-left-edge">
        <button onClick={onClose} title="Close">
          <NotPlayingIcon className="text-indigo-200 hover:text-indigo-100 border border-indigo-500 rounded-sm" />
        </button>
        DbD Live Game Info
      </div>
      <ul className="main-panel-buttons">{children}</ul>
    </>
  );
};

interface Props {
  onClose: () => void;
  visible: boolean;
  onViewSwitch?: (oldView: number, newView: number) => void;
  viewWithStar?: number;
  views: OneOrMore<{
    view: React.ReactElement;
    panelIcon: [string, ReturnType<Icon>];
    onNavigateTo?: () => void;
  }>;
  isFullScreen: boolean;
}

const MainPanel: React.FC<Props> = ({
  onClose,
  visible,
  onViewSwitch,
  viewWithStar,
  views,
  isFullScreen,
}) => {
  const [pinned, setPinned] = useState(false);
  const [activeView, setActiveView] = useState(0);
  const [wasFullScreen, setWasFullScreen] = useState(isFullScreen);
  const [position, setPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined);
  const viewList = toArray(views);
  // User went from fullscreen to not-fullscreen
  if (wasFullScreen && !isFullScreen) setPosition({ x: 0, y: 0 });

  if (isFullScreen != wasFullScreen) setWasFullScreen(isFullScreen);
  else if (position != undefined) setTimeout(() => setPosition(undefined), 100);

  return (
    <Draggable
      handle="#handle-drag"
      bounds="parent"
      position={position}
      disabled={pinned}
    >
      <div id="main-panel" className={visible || pinned ? "in-view" : ""}>
        <PanelDragger id="handle-drag">
          <GripIcon />
        </PanelDragger>
        <button
          id="pin-pannel-button"
          onClick={() => setPinned((old) => !old)}
          title={
            pinned
              ? "Unpin the panel"
              : "Pin the panel, preventing movement / fade out"
          }
        >
          <PinIcon className={pinned ? "pinned" : ""} />
        </button>
        <PanelButtonBar onClose={() => (setPinned(false), onClose())}>
          {viewList.map(({ panelIcon, onNavigateTo }, idx) => (
            <PanelButton
              onClick={() => {
                onViewSwitch?.(activeView, idx);
                onNavigateTo?.();
                setActiveView(idx);
              }}
              active={idx === activeView}
              star={viewWithStar === idx}
              key={panelIcon[0]}
            >
              {panelIcon[0]}
              {panelIcon[1]}
            </PanelButton>
          ))}
        </PanelButtonBar>

        <FogBackground />

        <ViewContainer>
          {viewList[activeView]?.view ?? <Loading />}
        </ViewContainer>
      </div>
    </Draggable>
  );
};

export default MainPanel;
