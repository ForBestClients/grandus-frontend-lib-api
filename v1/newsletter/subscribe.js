import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async (req, res) => {
  console.log(req.body);
  const response = await fetch(
    `${reqApiHost({})}/api/v2/newsletter/subscribe`,
    {
      method: "POST",
      headers: reqGetHeaders(req),
      body: req.body,
    }
  ).then((result) => result.json());

  res.status(response?.statusCode || 500).json(response?.data || []);
};
