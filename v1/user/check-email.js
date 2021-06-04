import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async (req, res) => {
  const { body } = req;
  const jsonBody = JSON.parse(body);

  const response = await fetch(`${reqApiHost(req)}/api/v2/users/check-email`, {
    method: "POST",
    headers: reqGetHeaders(req),
    body: JSON.stringify({ user: { email: jsonBody?.email } }),
  }).then((result) => result.json());

  res.status(200).json(response?.data);
};
