import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  console.log({ request, context });
  const BLOCKED_COUNTRY_CODE = "US"; // "RU";
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

  // return new Response(
  //   `Hello there! You can freely access our content from ${countryName}!`,
  //   {
  //     headers: { "content-type": "text/html" },
  //   }
  // );
};

export const config: Config = {
  path: "/*",
};
