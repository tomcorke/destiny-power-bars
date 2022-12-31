import * as bungieApi from "./bungie-api";
import * as bungieAuth from "./bungie-auth";
import * as utils from "./utils";
import * as vendors from "./vendor-engrams";

export interface Api {
  bungieApi: typeof bungieApi;
  bungieAuth: typeof bungieAuth;
  utils: typeof utils;
  vendors: typeof vendors;
}

export type BungieApi = typeof bungieApi;
export type BungieAuth = typeof bungieAuth;
export type Utils = typeof utils;
export type Vendors = typeof vendors;

export interface PartialApi {
  bungieApi?: Partial<BungieApi>;
  bungieAuth?: Partial<BungieAuth>;
  utils?: Partial<Utils>;
  vendors?: Partial<Vendors>;
}

const exports = {
  bungieApi,
  bungieAuth,
  utils,
  vendors,
};

export default exports;
