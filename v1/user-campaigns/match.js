import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async function handler(req, res) {
  const queryString = new URLSearchParams(req.query).toString();

  const response = await fetch(
    `${reqApiHost({})}/api/v2/user-campaigns/match?${queryString}`,
    { headers: reqGetHeaders(req) }
  );

  const result = await response.json();
  res.status(response.status).json(result?.data ?? result);
}
