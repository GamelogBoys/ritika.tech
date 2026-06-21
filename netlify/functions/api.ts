import { app } from "../../server.ts";
import serverless from "serverless-http";

const handler = serverless(app);

export const handlerWrapper = async (event: any, context: any) => {
  // Map incoming paths so Express matches them correctly.
  // Netlify proxies /api/* calls to /.netlify/functions/api/...
  // We rewrite the event path from /.netlify/functions/api to /api so all routes match.
  if (event.path && event.path.startsWith("/.netlify/functions/api")) {
    event.path = event.path.replace("/.netlify/functions/api", "/api");
  } else if (event.path === "/.netlify/functions/api") {
    event.path = "/api";
  }

  if (event.rawPath && event.rawPath.startsWith("/.netlify/functions/api")) {
    event.rawPath = event.rawPath.replace("/.netlify/functions/api", "/api");
  } else if (event.rawPath === "/.netlify/functions/api") {
    event.rawPath = "/api";
  }

  return handler(event, context);
};

export { handlerWrapper as handler };
