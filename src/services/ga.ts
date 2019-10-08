import ReactGA from "react-ga";

ReactGA.initialize("UA-149614480-1");
ReactGA.pageview(window.location.pathname + window.location.search);

export default ReactGA;
