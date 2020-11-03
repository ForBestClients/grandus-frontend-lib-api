import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async (req, res) => {
  const response = await fetch(
    `${reqApiHost({})}/api/v2/users/change-password`,
    {
      method: "POST",
      headers: reqGetHeaders(req),
      body: req.body,
    }
  ).then((result) => result.json());

  res.status(response?.statusCode || 500).json(response?.data || []);
};
