import { get } from "lodash";
import {
  reqGetHeaders,
  reqApiHost,
  getPaginationFromHeaders,
} from "grandus-lib/utils";

export default async (req, res) => {
  let pagination = {};
  const articles = await fetch(
    `${reqApiHost(req)}/api/v2/blogs?page=${get(
      req,
      "query.page",
      1
    )}&per-page=${get(
      req,
      "query.perPage",
      process.env.NEXT_PUBLIC_BLOG_DEFAULT_PER_PAGE
    )}&communityCategoryId=${get(
      req,
      "query.communityCategoryId",
      ""
    )}&expand=${get(
      req,
      "query.expand",
      process.env.NEXT_PUBLIC_BLOG_CARD_EXPAND
    )}`,
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
    articles: articles,
    pagination: pagination,
  };

  res.status(200).json(data);
};
