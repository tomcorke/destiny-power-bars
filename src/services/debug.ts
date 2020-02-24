if (process.env.NODE_ENV === "development") {
  console.debug(process.env);
}

export const debug = (...messages: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.debug(...messages);
  }
};
