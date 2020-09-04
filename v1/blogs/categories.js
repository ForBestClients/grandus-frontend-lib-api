import { get } from "lodash";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async (req, res) => {
  const categories = await fetch(`${reqApiHost(req)}/api/v2/blogs/categories`, {
    method: "get",
    headers: reqGetHeaders(req),
  })
    .then((result) => {
      return result.json();
    })
    .then((r) => get(r, "data", []));

  res.status(200).json(categories);
};
