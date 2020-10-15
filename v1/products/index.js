import { get, isArray } from "lodash";
import withSession from "grandus-lib/utils/session";
import {
  reqGetHeaders,
  reqApiHost,
  getPaginationFromHeaders,
  getProductCardFields,
} from "grandus-lib/utils";
import { getApiBodyFromPath, pathToParams } from "grandus-lib/hooks/useFilter";

export default withSession(async (req, res) => {
  const requestBody = {
    orderBy: get(
      req,
      "query.orderBy",
      process.env.NEXT_PUBLIC_PRODUCT_DEFAULT_ORDERING
    ),
  };

  if (get(req, "query")) {
    if (get(req, "query.category")) {
      //deleteCategory
      requestBody.categoryName = get(req, "query.category", "");
    }

    if (get(req, "query.productIds")) {
      //delete proctuIds
      requestBody.productIds = isArray(get(req, "query.productIds", []))
        ? get(req, "query.productIds", [])
        : [get(req, "query.productIds")];
    }

    if (get(req, "query.search")) {
      requestBody.search = get(req, "query.search", "");
    }

    if (get(req, "query.marketingCampaign")) {
      requestBody.marketingCampaign = get(req, "query.marketingCampaign", "");
    }

    if (get(req, "query.param")) {
      // requestBody.param = pathToParams(get(req, "query.param", ""));
    }
  }

  const fields =
    getProductCardFields() +
    (get(req, "query.fields") ? `,${get(req, "query.fields")}` : "");

  let pagination = {};
  const products = await fetch(
    `${reqApiHost(req)}/api/v2/products/filter?fields=${fields}&page=${get(
      req,
      "query.page",
      1
    )}&per-page=${get(
      req,
      "query.perPage",
      process.env.NEXT_PUBLIC_PRODUCT_DEFAULT_PER_PAGE
    )}`,
    {
      method: "post",
      headers: reqGetHeaders(req),
      body: JSON.stringify({
        ...requestBody,
        ...getApiBodyFromPath(get(req, "query.param")),
      }),
    }
  )
    .then((result) => {
      pagination = getPaginationFromHeaders(result.headers);
      return result.json();
    })
    .then((r) => get(r, "data", []));

  const data = {
    products: products,
    pagination: pagination,
  };

  res.status(200).json(data);
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
