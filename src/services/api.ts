import * as bungieApi from "./bungie-api";
import * as bungieAuth from "./bungie-auth";
import * as ga from "./ga";
import * as utils from "./utils";
import * as vendors from "./vendor-engrams";

export interface Api {
  bungieApi: typeof bungieApi;
  bungieAuth: typeof bungieAuth;
  ga: typeof ga;
  utils: typeof utils;
  vendors: typeof vendors;
}

export type BungieApi = typeof bungieApi;
export type BungieAuth = typeof bungieAuth;
export type GA = typeof ga;
export type Utils = typeof utils;
export type Vendors = typeof vendors;

export interface PartialApi {
  bungieApi?: Partial<BungieApi>;
  bungieAuth?: Partial<BungieAuth>;
  ga?: Partial<GA>;
  utils?: Partial<Utils>;
  vendors?: Partial<Vendors>;
}

export default {
  bungieApi,
  bungieAuth,
  ga,
  utils,
  vendors,
};
