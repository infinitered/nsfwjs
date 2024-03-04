import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const BLOCKED_COUNTRY_CODE = "RU";
  const countryCode = context.geo?.country?.code ?? "US";
  const countryName = context.geo?.country?.name ?? "United States of America";

  if (countryCode === BLOCKED_COUNTRY_CODE) {
    return new Response(
      `We're sorry, you can't access our content from ${countryName}!`,
      {
        headers: { "content-type": "text/html" },
        status: 451,
      }
    );
  }
};

export const config: Config = {
  path: "/*",
};
