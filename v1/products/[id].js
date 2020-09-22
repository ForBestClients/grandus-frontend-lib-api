import withSession from "grandus-lib/utils/session";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";
import {
  reqGetHeaders,
  reqApiHost,
  getProductDetailExpand,
  getProductDetailFields,
} from "grandus-lib/utils";
import { get } from "lodash";

export default withSession(async (req, res) => {
  if (get(req, "query.initial") == 1) {
    //custom cache management due to ?initial=1 elastic fallback
    if (
      get(req, "query.id") &&
      (await outputCachedData(req, res, cache, {
        cacheKeyType: "custom",
        cacheKeyParts: [get(req, "query.id")],
        cacheKeyUseUser: true,
      }))
    )
      return;

    const product = await fetch(
      `${reqApiHost(req)}/api/v2/products?urlTitle=${get(req, "query.id")}`,
      {
        headers: reqGetHeaders(req),
      }
    )
      .then((result) => result.json())
      .then((data) => get(data, "data.[0]", {}));

    //normalization of ELASTIC PRODUCT into DB PRODUCT
    const productResult = {
      id: get(product, "id"),
      name: get(product, "name"),
      subtitle: get(product, "subtitle"),
      urlTitle: get(product, "urlTitle"),
      foreignKeyStr: get(product, "foreignKeyStr"),
      categories: get(product, "categories"),
      // foreignKeyInt: 445462,
      partNo: get(product, "partNo"),
      sku: get(product, "sku"),
      ean: get(product, "ean"),
      new: get(product, "new", false),
      favourite: get(product, "favourite", false),
      // brandId: 581,
      createTime: get(product, "createTime"),
      updateTime: get(product, "updateTime"),
      priority: get(product, "priority", 0),
      // rating: 0,
      // ratingCount: 0,
      // measureUnit: null,
      photo: get(product, "photo", {}),
      // price: "209,00",
      priceData: get(product, "priceData"),
      finalPriceData: get(product, "finalPriceData"),
      standardPriceData: get(product, "standardPriceData"),
      // specialPrice: null,
      VAT: get(product, "VAT"),
      brand: get(product, "brand", {}),
      kind: get(product, "kind", {}),
      availability: get(product, "availability", {}),
      status: get(product, "status", ""),
      storeStatusAvailable: get(product, "storeStatusAvailable"),
      storeStatusUnavailable: get(product, "storeStatusUnavailable"),
      storeStatus: get(product, "storeStatus", {}),
      discount: get(product, "discount"),
      shortProductDescription: {
        description: get(product, "shortDescription"),
        type: 1,
      },
      productDescription: {
        description: get(product, "description"),
        type: 1,
      },
      // advantages: null,
      // disadvantages: null,
      store: get(product, "store"),

      warrantyDuration: get(product, "warrantyDuration"),
      warrantyDurationCompany: get(product, "warrantyDurationCompany"),
      condition: get(product, "condition"),
      // isVariantOf: null,
      variants: get(product, "variants"),
      // priceInfo: { recycle: "0.0400", author: "1.0700" },
      type: get(product, "type"),
      // typeLabel: "Produkt",
      // productSetProducts: [],
      // productPackageProducts: [],
      // canCollectCredits: true,
      active: get(product, "active"),
      isListed: get(product, "isListed"),
      isOrderable: get(product, "isOrderable"),
      externalUrl: get(product, "externalUrl", ""),
      gallery: get(product, "gallery", []),
      detailedParameters: get(product, "detailedParameters", []),
      additionalInfos: get(product, "additionalInfos", []),

      //added fields
      meta: {},
      breadcrumbs: []
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(productResult));
    return;
  }

  const product = await fetch(
    `${reqApiHost(req)}/api/v2/products/${get(
      req,
      "query.id"
    )}?${getProductDetailExpand(true)}&${getProductDetailFields(true)}`,

    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  const output = get(product, "data", {});
  output.breadcrumbs = get(product, "breadcrumbs", []);
  output.meta = get(product, "meta");

  saveDataToCache(req, cache, output, {
    cacheKeyType: "custom",
    cacheKeyParts: [get(req, "query.id")],
    cacheKeyUseUser: true,
  });
  res.status(get(product, "statusCode", 500)).json(output);
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
