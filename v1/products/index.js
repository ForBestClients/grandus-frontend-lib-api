import { get, isArray } from 'lodash';
import withSession from 'grandus-lib/utils/session';
import {
  reqGetHeaders,
  reqApiHost,
  getPaginationFromHeaders,
  getProductCardFields,
} from 'grandus-lib/utils';
import { getApiBodyFromPath } from 'grandus-lib/hooks/useFilter';

export default withSession(async (req, res) => {
  const requestBody = {
    ...getApiBodyFromPath(get(req, 'query.param', [])),
  };

  if (get(req, 'query')) {
    if (get(req, 'query.category')) {
      //deleteCategory
      requestBody.categoryName = get(req, 'query.category', '');
    }

    if (get(req, 'query.productIds')) {
      //delete proctuIds
      requestBody.productIds = isArray(get(req, 'query.productIds', []))
        ? get(req, 'query.productIds', [])
        : [get(req, 'query.productIds')];
    }

    if (get(req, 'query.search')) {
      requestBody.search = get(req, 'query.search', '');
    }

    if (get(req, 'query.favourite')) {
      requestBody.favourite = get(req, 'query.favourite', '');
    }

    if (get(req, 'query.new')) {
      requestBody.favourite = get(req, 'query.new', '');
    }

    if (get(req, 'query.orderBy')) {
      requestBody.orderBy = get(req, 'query.orderBy');
    } else {
      if (!get(req, 'query.search')) {
        requestBody.orderBy = get(
          req,
          'query.orderBy',
          process.env.NEXT_PUBLIC_PRODUCT_DEFAULT_ORDERING,
        );
      }
    }

    if (get(req, 'query.marketingCampaign')) {
      requestBody.marketingCampaign = get(req, 'query.marketingCampaign', '');
    }

    if (get(requestBody, 'param.marketing-set')) {
      requestBody.marketingSets = get(requestBody, 'param.marketing-set[0]');
      delete requestBody.param['marketing-set'];
    }
  }

  const fields =
    getProductCardFields() +
    (get(req, 'query.fields') ? `,${get(req, 'query.fields')}` : '');

  let pagination = {};
  const products = await fetch(
    `${reqApiHost(req)}/api/v2/products/filter?fields=${fields}&page=${get(
      req,
      'query.page',
      1,
    )}&per-page=${get(
      req,
      'query.perPage',
      process.env.NEXT_PUBLIC_PRODUCT_DEFAULT_PER_PAGE,
    )}`,
    {
      method: 'post',
      headers: reqGetHeaders(req),
      body: JSON.stringify({
        ...requestBody,
      }),
    },
  )
    .then(result => {
      pagination = getPaginationFromHeaders(result.headers);
      return result.json();
    })
    .then(r => get(r, 'data', []));

  const data = {
    products: products,
    pagination: pagination,
  };

  res.status(200).json(data);
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};
