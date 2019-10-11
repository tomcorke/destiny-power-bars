import ReactGA from "react-ga";

ReactGA.initialize("UA-149614480-1", {
  debug: process.env.NODE_ENV === "development"
});

// Anonymize IP addresses, yay GDPR
ReactGA.set({ anonymizeIp: true });
ReactGA.pageview(window.location.pathname + window.location.search);

export default ReactGA;
