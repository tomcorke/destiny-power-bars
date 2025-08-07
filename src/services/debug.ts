if (import.meta.env.NODE_ENV === "development") {
  console.debug(import.meta.env);
}

export const debug = (...messages: any[]) => {
  if (import.meta.env.DEV) {
    console.debug(...messages);
  }
};
