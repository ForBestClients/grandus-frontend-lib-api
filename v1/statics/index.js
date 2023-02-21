import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async (req, res) => {
  const data = await fetch(
    `${reqApiHost(req)}/api/v2/pages${reqExtractUri(
      req.url
    )}?fields=id,title,urlTitle,photo`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  res.statusCode = data.statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data.data));
};
