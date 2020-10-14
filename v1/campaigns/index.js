import { get } from "lodash";
import {
  reqGetHeaders,
  reqApiHost,
  getPaginationFromHeaders,
} from "grandus-lib/utils";

export default async (req, res) => {
  let pagination = {};
  const campaigns = await fetch(
    `${reqApiHost(req)}/api/v2/campaigns?page=${get(
      req,
      "query.page",
      1
    )}&per-page=${get(
      req,
      "query.perPage",
      process.env.NEXT_PUBLIC_CAMPAIGNS_DEFAULT_PER_PAGE
    )}&expand=photo`,
    {
      method: "get",
      headers: reqGetHeaders(req),
    }
  )
    .then((result) => {
      pagination = getPaginationFromHeaders(result.headers);
      return result.json();
    })
    .then((r) => get(r, "data", []));

  const data = {
    campaigns: campaigns,
    pagination: pagination,
  };

  res.status(200).json(data);
};
