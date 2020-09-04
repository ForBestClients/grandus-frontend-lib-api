import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { get } from "lodash";

export default async (req, res) => {
  const { body = {}, method } = req;

  res.setHeader("Content-Type", "application/json");

  let url = `${reqApiHost(req)}/api/v2/contact-forms`;

  const response = await fetch(url, {
    headers: reqGetHeaders(req),
    method: "POST",
    body: body,
  }).then((result) => result.json());

  res.status(get(response, 'statusCode')).json(get(response, 'data'));
};
