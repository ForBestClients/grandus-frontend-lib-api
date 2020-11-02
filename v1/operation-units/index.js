import { get } from "lodash";
import {
  reqGetHeaders,
  reqApiHost,
  getPaginationFromHeaders,
} from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;

  let pagination = {};
  const operationUnits = await fetch(
    `${reqApiHost(req)}/api/v2/operation-units?page=${get(
      req,
      "query.page",
      1
    )}&per-page=${get(
      req,
      "query.perPage",
      process.env.NEXT_PUBLIC_PRODUCT_DEFAULT_PER_PAGE
    )}&deliveryTown=${encodeURIComponent(get(req, "query.deliveryTown", ""))}&expand=openingHours`,
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
    operationUnits: operationUnits,
    pagination: pagination,
  };

  saveDataToCache(req, cache, data);
  res.status(200).json(data);
};
