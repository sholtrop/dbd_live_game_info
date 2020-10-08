import {
  PerkData,
  AddonData,
  UserRole,
  KillerAddons,
  KillerPowers,
  Build,
} from "../types";
import jwt from "jsonwebtoken";

/**
 * Helper class for authentication against an EBS service. Allows the storage of a token to be accessed across components.
 * This is not meant to be a source of truth. Use only for presentational purposes.
 */
export default class Authentication {
  private api: string = process.env.API_URL ?? "http://localhost:5000";

  private state: {
    token: string;
    opaque_id: string;
    user_id: string | null;
    isMod: boolean;
    role: UserRole | null;
    channel_id: string;
  };

  // Make a JWT for when testing in Cypress. This is obviously only accepted
  // by the backend in dev mode.
  static forTests(claims: { [claim: string]: string; channel_id: string }) {
    const token = jwt.sign(claims, "super-secret");
    const auth = new Authentication(token, claims.channel_id);
    return auth;
  }

  constructor(token: string, opaque_id: string) {
    this.state = {
      token,
      opaque_id,
      user_id: null,
      isMod: false,
      role: null,
      channel_id: "",
    };
    this.setToken(token, opaque_id);
  }

  isLoggedIn() {
    return this.state.opaque_id[0] === "U";
  }

  // This does guarantee the user is a moderator- this is fairly simple to bypass - so pass the JWT and verify
  // server-side that this is true. This, however, allows you to render client-side UI for users without holding on a backend to verify the JWT.
  // Additionally, this will only show if the user shared their ID, otherwise it will return false.
  isModerator() {
    return this.state.isMod;
  }

  // similar to mod status, this isn't always verifiable, so have your backend verify before proceeding.
  hasSharedId() {
    return Boolean(this.state.user_id);
  }

  getUserId() {
    return this.state.user_id;
  }

  getOpaqueId() {
    return this.state.opaque_id;
  }

  getChannelId() {
    return this.state.channel_id;
  }

  getRole() {
    return this.state.role;
  }

  getToken() {
    return this.state.token;
  }

  // set the token in the Authentication componenent state
  // this is naive, and will work with whatever token is returned. under no circumstances should you use this logic to trust private data- you should always verify the token on the backend before displaying that data.
  setToken(token: string, opaque_id: string) {
    let isMod = false;
    let role: "broadcaster" | "moderator" | "viewer" = "viewer";
    let user_id = "";
    let channel_id = "";

    try {
      let decoded = jwt.decode(token);
      if (!decoded || typeof decoded == "string")
        throw Error("Could not decode JWT");
      if (decoded.role === "broadcaster" || decoded.role === "moderator") {
        isMod = true;
      }
      user_id = decoded.user_id;
      role = decoded.role;
      channel_id = decoded.channel_id;
    } catch (e) {
      token = "";
      opaque_id = "";
    }

    this.state = {
      token,
      opaque_id,
      isMod,
      user_id,
      role,
      channel_id,
    };
  }

  // checks to ensure there is a valid token in the state
  isAuthenticated() {
    if (this.state.token && this.state.opaque_id) {
      return true;
    } else {
      return false;
    }
  }

  async getPerks(): Promise<PerkData> {
    const response = await this.makeCall(this.api + "/perks");
    return (await response.json()).data;
  }

  async getAddons(): Promise<AddonData> {
    const response = await this.makeCall(this.api + "/addons");
    return (await response.json()).data;
  }

  async getKillerNames(): Promise<KillerPowers> {
    const response = await this.makeCall(this.api + "/killer_names");
    return (await response.json()).data;
  }

  async getKillerAddons(): Promise<KillerAddons> {
    const response = await this.makeCall(this.api + "/killer_addons");
    return (await response.json()).data;
  }

  async getModerators(): Promise<
    { user_id: string; user_name: string }[] | null
  > {
    const response = await this.makeCall(
      this.api + "/moderators/" + this.state.channel_id
    );
    if (response.ok) return (await response.json()).data.data;
    return null;
  }

  async emitBuild(build: Build): Promise<{ success: boolean }> {
    const response = await this.makeCall(
      this.api + "/set_build",
      "POST",
      build
    );
    if (response.ok) return { success: true };
    return { success: false };
  }

  async getCurrentBuild(): Promise<Build | null> {
    const response = await this.makeCall(this.api + "/get_build");
    if (response.ok) return (await response.json()).data;
    return null;
  }

  /**
   * Makes a call against a given endpoint using a specific method.
   *
   * Returns a Promise with the Request() object per fetch documentation.
   *
   */

  private async makeCall(url: string, method = "GET", data?: object) {
    if (this.isAuthenticated()) {
      let headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.state.token}`,
      };
      return await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      });
    } else {
      throw Error("Unauthorized");
    }
  }
}
