import React, { useState, useEffect } from "react";
import "./ConfigPage.css";
import { getTwitch, reconcileMods } from "../../util";
import Auth from "../../auth/authentication";
import RadioButton from "../RadioButton/RadioButton";
import ModeratorSelect from "../ModeratorSelect/ModeratorSelect";
import Loading from "../Loading/Loading";

import {
  UserAuth,
  BroadCasterConfig,
  ModeratorsCanSet,
  Moderators,
  PubsubEvent,
  BuildRequestsEnabledFor,
  BuildRequestPrices,
} from "../../types";
import { CheckIcon, BuildViewIcon } from "../Icons/Icons";

const defaultConfig: BroadCasterConfig = {
  modList: {},
  modsCanSet: ModeratorsCanSet.no,
  displayName: "",
  buildRequests: {
    enabledFor: BuildRequestsEnabledFor.noone,
    queueSize: 0,
    price: 100,
  },
};

interface SavingIndicatorProps {
  saving: boolean;
}

const SavingIndicator: React.FC<SavingIndicatorProps> = ({ saving }) => {
  if (saving)
    return (
      <div id="saving-indicator">
        <div className="small-loading-circle" />
        Saving changes...
      </div>
    );
  else
    return (
      <div id="saving-indicator" className="all-changes-saved">
        <div className="check">✓</div>
        Changes saved
      </div>
    );
};

interface LockedOverlayProps {
  token: string;
  loading: boolean;
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({ token, loading }) => {
  return (
    <div className="locked-overlay">
      <div className="auth-disclaimer">
        {loading ? (
          <div className="auth-loading">
            <div className="loading-circle" />
            Checking authentication status...
          </div>
        ) : (
          "To use these options, you must authorize DbD Live Game Info to access your moderator information:"
        )}
      </div>
      {loading ? null : (
        <button className="authorize">
          <CheckIcon className="text-green-500" />
          <a
            href={process.env.API_URL + "/oauth?auth=" + token}
            target="_blank"
          >
            Authorize
          </a>
        </button>
      )}
    </div>
  );
};

interface BuildRequestPromptProps {
  onChange: (data: BroadCasterConfig["buildRequests"]) => void;
  buildRequests: BroadCasterConfig["buildRequests"];
}

export const BuildRequestPrompt: React.FC<BuildRequestPromptProps> = ({
  onChange,
  buildRequests,
}) => {
  return (
    <div className="config-step">
      <h2 className="config-question">
        3. Can viewers request that you play certain builds?
      </h2>
      <div className="flex flex-col">
        <ul className="can-set">
          <RadioButton
            onChange={() =>
              onChange({
                ...buildRequests,
                enabledFor: BuildRequestsEnabledFor.noone,
              })
            }
            name="canrequestbuild"
            checked={buildRequests.enabledFor === BuildRequestsEnabledFor.noone}
            text="No (this feature will be disabled)"
          />
          <RadioButton
            onChange={() =>
              onChange({
                ...buildRequests,
                enabledFor: BuildRequestsEnabledFor.anyone,
              })
            }
            name="canrequestbuild"
            checked={
              buildRequests.enabledFor === BuildRequestsEnabledFor.anyone
            }
            text="Yes, any viewer can request a build"
          />
          <RadioButton
            onChange={() =>
              onChange({
                ...buildRequests,
                enabledFor: BuildRequestsEnabledFor.subscribers,
              })
            }
            name="canrequestbuild"
            checked={
              buildRequests.enabledFor === BuildRequestsEnabledFor.subscribers
            }
            text="Yes, but only subscribers can request a build"
          />
          <div className="flex flex-col self-start">
            <RadioButton
              onChange={() =>
                onChange({
                  ...buildRequests,
                  enabledFor: BuildRequestsEnabledFor.bitgivers,
                })
              }
              name="canrequestbuild"
              checked={
                buildRequests.enabledFor === BuildRequestsEnabledFor.bitgivers
              }
              text={
                <div>
                  Yes, anyone can request a build, in exchange for Twitch bits
                  <span className="text-xl text-orange-500">*</span>
                </div>
              }
            />
            <p className="sub-text" style={{ color: "rgb(160, 174, 192)" }}>
              <span className="text-xl text-orange-500">*</span> with the option
              to give subscribers some free build requests per month
            </p>
          </div>
        </ul>

        {buildRequests.enabledFor !== BuildRequestsEnabledFor.noone ? (
          <div className="flex flex-col w-full pl-5 mt-2">
            <h3>3.1 How many builds can be in queue at maximum?</h3>
            <div className="flex items-center">
              <input
                type="number"
                className="text-black bg-gray-200 hover:bg-gray-100 focus:bg-gray-100 p-2 w-16 text-center text-xl"
                min={0}
                max={20}
                value={buildRequests.queueSize}
                onChange={({ target }) =>
                  onChange({
                    ...buildRequests,
                    queueSize: Number(target.value),
                  })
                }
              />
              <p className="text-xs sub-text w-48">
                When this limit has been reached, no new builds will be accepted
              </p>
            </div>
          </div>
        ) : null}
        {buildRequests.enabledFor === BuildRequestsEnabledFor.bitgivers ? (
          <div className="flex flex-col w-full pl-5 mt-2">
            <h3>3.2 How many bits does it cost to request a build from you?</h3>
            <ul className="can-set">
              {BuildRequestPrices.map((price) => (
                <RadioButton
                  key={price}
                  name="requestprice"
                  text={`${price} bits`}
                  onChange={() => {
                    onChange({
                      ...buildRequests,
                      price,
                    });
                  }}
                  checked={buildRequests.price === price}
                />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
};

interface WhoCanSetPromptProps {
  onChange: (modsCanSet?: ModeratorsCanSet, modList?: Moderators) => void;
  modsCanSet: ModeratorsCanSet;
  oauthReady: boolean;
  modList: Moderators;
  jwt: string;
}

export const WhoCanSetPrompt: React.FC<WhoCanSetPromptProps> = ({
  onChange,
  oauthReady,
  modsCanSet,
  modList,
  jwt,
}) => {
  const [loadingOAuth, setLoadingOAuth] = useState(true);
  useEffect(() => {
    if (oauthReady) setLoadingOAuth(false);
    let timeout: NodeJS.Timeout | null = null;
    if (loadingOAuth) timeout = setTimeout(() => setLoadingOAuth(false), 3500);
    return timeout != null ? () => clearTimeout(timeout!) : undefined;
  }, [oauthReady]);
  return (
    <div
      className="config-step"
      style={{ minHeight: !oauthReady ? "50vh" : "" }}
    >
      <h2 className="config-question">2. Who can set your current build?</h2>
      <ul className="can-set">
        <RadioButton
          onChange={() => onChange(ModeratorsCanSet.no)}
          name="canset"
          checked={modsCanSet === ModeratorsCanSet.no}
          text="Only me"
        />

        <RadioButton
          onChange={() => {
            if (oauthReady) onChange(ModeratorsCanSet.all);
          }}
          className={!oauthReady ? "locked" : ""}
          name="canset"
          checked={modsCanSet === ModeratorsCanSet.all}
          text="Me and all of my moderators"
        />
        <RadioButton
          onChange={() => {
            if (oauthReady) onChange(ModeratorsCanSet.some);
          }}
          className={!oauthReady ? "locked" : ""}
          name="canset"
          checked={modsCanSet === ModeratorsCanSet.some}
          text="Me and certain moderators:"
        />
        {!oauthReady ? (
          <LockedOverlay token={jwt} loading={loadingOAuth} />
        ) : null}
      </ul>
      {modsCanSet === ModeratorsCanSet.some && oauthReady ? (
        <ModeratorSelect
          moderators={modList}
          onChange={(id) => {
            const newMods = { ...modList };
            newMods[id].allowed = !newMods[id].allowed;
            onChange(undefined, newMods);
          }}
        />
      ) : null}
    </div>
  );
};

let debounceTimer: NodeJS.Timeout;

const ConfigPage: React.FC = () => {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [twitch] = useState(getTwitch());
  const [oauthReady, setOauthReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [moderators, setModerators] = useState<
    { user_id: string; user_name: string }[] | null
  >(null);
  const [config, setConfig] = useState<BroadCasterConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const editConfig = (newParts: Partial<BroadCasterConfig>, debounceMs = 0) => {
    setConfig((config) => {
      const newConfig = { ...defaultConfig, ...config, ...newParts };
      clearTimeout(debounceTimer);
      if (debounceMs > 0) {
        debounceTimer = setTimeout(() => {
          twitch.configuration.set(
            "broadcaster",
            "1",
            JSON.stringify(newConfig)
          );
          setSaving(false);
        }, debounceMs);
        setSaving(true);
      } else
        twitch.configuration.set("broadcaster", "1", JSON.stringify(newConfig));
      return newConfig;
    });
  };
  useEffect(() => {
    twitch.onContext((context: any, diff: string[]) => {
      if (context?.theme !== theme) setTheme(context.theme);
    });
    twitch.configuration.onChanged(() => {
      if (twitch.configuration.broadcaster) {
        console.log("got config:", {
          config: twitch.configuration.broadcaster,
        });
        setConfig(JSON.parse(twitch.configuration.broadcaster.content));
      } else editConfig(defaultConfig);
    });

    twitch.onAuthorized(({ token, userId }: UserAuth) => {
      const auth = new Auth(token, userId);
      auth
        .getModerators()
        .then((mods) => {
          if (mods !== null) {
            setModerators(mods);
            setOauthReady(true);
          } else {
            console.log("editConfig: could not get mods");
            editConfig({ modsCanSet: ModeratorsCanSet.no }, 0);
            twitch.listen("broadcast", (target, _, message) => {
              const data: PubsubEvent = JSON.parse(message);
              console.log("Pubsub event:", { data });
              if (data.event === "oauthReady") {
                setOauthReady(true);
                auth.getModerators().then((mods) => {
                  if (mods !== null) setModerators(mods);
                });
              }
            });
          }
        })
        .catch(() => editConfig({ modsCanSet: ModeratorsCanSet.no }));
      setAuth(auth);
    });
  }, []);
  useEffect(() => {
    if (oauthReady && moderators) {
      console.log("editConfig: Reconcile mods");
      editConfig({
        modList: reconcileMods(config?.modList, moderators),
      });
    }
  }, [oauthReady, moderators]);

  if (!twitch || !auth || !config) {
    return <Loading />;
  }

  return (
    <main id="config-page" className={theme}>
      <h1>
        <BuildViewIcon colored={true} className="inline mr-2" />
        Dead by Daylight Live Game Info
      </h1>
      <p className="disclaimer">
        <strong>Disclaimer:</strong> This extension is an unofficial fanmade
        project, and not in any way affiliated with or endorsed by Behaviour
        Interactive.
      </p>
      <div className="config-step">
        <h2 className="config-question">
          1. What's your display name (i.e. Twitch name)?
        </h2>
        <label>
          <input
            className="name-input"
            type="text"
            maxLength={26}
            value={config.displayName}
            onChange={({ target }) => {
              console.log("editConfig: onChange input");
              editConfig({ displayName: target.value }, 1000);
            }}
          />
        </label>
      </div>
      <WhoCanSetPrompt
        modsCanSet={config.modsCanSet}
        modList={config.modList}
        onChange={(modsCanSet, modList) => {
          if (modsCanSet != null) editConfig({ modsCanSet }, 400);
          if (modList != null) editConfig({ modList }, 400);
        }}
        jwt={auth.getToken()}
        oauthReady={oauthReady}
      />
      {
        <BuildRequestPrompt
          onChange={(info) => editConfig({ buildRequests: info }, 400)}
          buildRequests={config.buildRequests}
        />
      }
      <SavingIndicator saving={saving} />
    </main>
  );
};

export default ConfigPage;
