import React from "react";

import ExampleTitanCharacterDisplayImageLowRes from "../../images/screenshots/example-titan-character-display-with-info-blur.jpg";
import ExampleTitanCharacterDisplayImage from "../../images/screenshots/example-titan-character-display-with-info.png";
import { manualStartAuth } from "../../services/bungie-auth";
import { LazyImage } from "../LazyImage";


import STYLES from "./LoginPrompt.module.scss";

interface LoginPromptProps {
  onLoginClick?: () => void;
}

const DEFAULT_ON_LOGIN_CLICK = () => manualStartAuth();

const LoginPrompt = ({
  onLoginClick = DEFAULT_ON_LOGIN_CLICK,
}: LoginPromptProps) => {
  return (
    <div className={STYLES.loginContainer}>
      <div className={STYLES.exampleImage}>
        <LazyImage
          lowResImage={ExampleTitanCharacterDisplayImageLowRes}
          highResImage={ExampleTitanCharacterDisplayImage}
          alt="Example Destiny Power Bars"
        />
      </div>
      <div className={STYLES.login}>
        <div>
          Destiny Power Bars requires access to your inventory and vault to
          determine your maximum power per slot and character. Please log in to
          Bungie.net to authorize this application.
        </div>
        <button className={STYLES.loginButton} onClick={onLoginClick}>
          Log in with Bungie.net
        </button>
        {/* <a className={STYLES.loginButton} href={getAuthUrl()}>
          Log in with Bungie.net
        </a> */}
      </div>
    </div>
  );
};

export default LoginPrompt;
