import {
  getClientRefererUrl,
  getClientIpAddress,
  getClientUserAgent,
  getClientFbp,
  getClientFbc,
} from "grandus-lib/utils/request";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      message: "This route only accepts POST requests",
    });
  }

  if (!process.env.FB_ACCESS_TOKEN) {
    throw new Error("Missing FB_ACCESS_TOKEN in environment file.");
  }

  if (!process.env.FB_PIXEL_ID) {
    throw new Error("Missing FB_PIXEL_ID in environment file.");
  }

  const reqData = {
    ...req?.body,
    ...{
      user_data: {
        event_time: new Date().getTime(),
        client_ip_address: getClientIpAddress(req),
        client_user_agent: getClientUserAgent(req),
        fbc: getClientFbp(req),
        fbp: getClientFbc(req),
      },
      event_source_url: getClientRefererUrl(req)
    },
  };

  if (!reqData) {
    return res.status(400).json({
      error: "The request body is missing required parameters",
    });
  }

  const responseObject = await fetch(
    `https://graph.facebook.com/${process?.env?.FB_API_VERSION || "v11.0"}/${
      process?.env?.FB_PIXEL_ID
    }/events?access_token=${process?.env?.FB_ACCESS_TOKEN}`
  );

  if (responseObject.status !== 200) {
    const response = await responseObject.json();
    return res.status(200).json({
      status: "Error",
      message: response?.error?.message,
    });
  }

  return res.status(200).json({
    status: "Success",
    message: "",
  });
};
