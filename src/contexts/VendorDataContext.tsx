import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ACCOUNT_WIDE_CHARACTER_ID,
  CHARACTER_DATA_REFRESH_TIMER,
  VENDOR_DATA_REFRESH_TIMER,
} from "../constants";
import { getVendorData, VendorData } from "../services/vendor-data";
import { EVENTS, useEvent } from "../services/events";

import { AuthenticationContext } from "./AuthenticationContext";
import { ManifestContext } from "./ManifestContext";
import { MembershipContext } from "./MembershipContext";
import { SettingsContext } from "./SettingsContext";
import { CharacterDataContext } from "./CharacterDataContext";
import { useInterval } from "usehooks-ts";

type VendorDataState = {
  vendorData: { characterId: string; data: VendorData }[];
  isFetchingVendorData: boolean;
};

export const VendorDataContext = createContext<VendorDataState>({
  vendorData: [],
  isFetchingVendorData: false,
});

export const VendorDataContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const { isAuthed } = useContext(AuthenticationContext);
  const { hasSelectedMembership, membershipId, membershipType } =
    useContext(MembershipContext);
  const { setBungieSystemDisabled, setBungieServiceUnavailable } =
    useContext(ManifestContext);
  const { settings } = useContext(SettingsContext);

  const { characterData } = useContext(CharacterDataContext);

  const characterIds = Object.keys(characterData?.characters || {}).filter(
    (id) => id !== ACCOUNT_WIDE_CHARACTER_ID
  );

  const hasCharacters = characterIds.length > 0;

  const [isFetchingVendorData, setIsFetchingVendorData] = useState(false);

  const [vendorData, setVendorData] = useState<VendorDataState["vendorData"]>(
    []
  );

  const [doneInitialFetch, setDoneInitialFetch] = useState(false);

  useEvent(EVENTS.FETCHING_VENDOR_DATA_CHANGE, (value: boolean) =>
    setIsFetchingVendorData(value)
  );

  // useEvent(EVENTS.FETCHING_CHARACTER_DATA_CHANGE, (value: boolean) => {
  //   if (
  //     value === false &&
  //     isAuthed &&
  //     hasSelectedMembership &&
  //     hasCharacters &&
  //     !isFetchingVendorData
  //   ) {
  //     doGetVendorData();
  //   }
  // });

  const doGetVendorData = useCallback(() => {
    setIsFetchingVendorData(true);

    (async () => {
      try {
        const results = await Promise.all(
          characterIds.map(async (id) => {
            const result = await getVendorData(
              membershipType!,
              membershipId!,
              id
            );
            return { characterId: id, data: result };
          })
        );

        setVendorData(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingVendorData(false);
      }
    })();
  }, [characterIds, setIsFetchingVendorData]);

  useInterval(() => {
    if (isAuthed && hasSelectedMembership && !isFetchingVendorData) {
      doGetVendorData();
    }
  }, VENDOR_DATA_REFRESH_TIMER);

  useEffect(() => {
    // Initial fetch when reasonable conditions are met
    if (hasCharacters && !doneInitialFetch) {
      setDoneInitialFetch(true);
      doGetVendorData();
    }
  }, [doGetVendorData, hasCharacters, doneInitialFetch, setDoneInitialFetch]);

  return (
    <VendorDataContext.Provider value={{ vendorData, isFetchingVendorData }}>
      {children}
    </VendorDataContext.Provider>
  );
};
