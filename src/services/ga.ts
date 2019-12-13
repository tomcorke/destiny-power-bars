import ReactGA from "react-ga";

const ENABLED = false;

interface AnalyticsInterface {
  set: (props: { [key: string]: string | boolean }) => void;
  initialize: (clientId: string, options: { debug?: boolean }) => void;
  pageview: (url: string) => void;
  event: (eventProps: {
    category: string;
    action: string;
    label?: string;
    nonInteraction?: boolean;
  }) => void;
}

let ga: AnalyticsInterface = ReactGA;

if (ENABLED) {
  ga.initialize("UA-149614480-1", {
    // debug: process.env.NODE_ENV === "development"
  });

  // Anonymize IP addresses, yay GDPR
  ga.set({ anonymizeIp: true });
  ga.pageview(window.location.pathname + window.location.search);
} else {
  // Set mock GA object to disable without removing other code
  ga = {
    initialize: () => undefined,
    pageview: () => undefined,
    set: (...args: any[]) => undefined,
    event: (...args: any[]) => undefined
  };
}

export default ga;
