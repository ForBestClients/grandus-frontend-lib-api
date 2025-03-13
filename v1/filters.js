import { reqExtractUri, reqGetHeaders, reqApiHost } from 'grandus-lib/utils';
import { get, toArray, sortBy, filter } from 'lodash';
import { getApiBodyFromPath } from 'grandus-lib/hooks/useFilter';
import withSession from 'grandus-lib/utils/session';
import cache, {
  outputCachedData,
  saveDataToCache,
} from 'grandus-lib/utils/cache';

export default withSession(async (req, res) => {
  const cacheOptions = {
    cacheKeyType: 'custom',
    cacheKeyParts: filter(
      ['filters', ...sortBy(toArray(get(req, 'query')))],
      item => (item ? true : false), //skip empty
    ),
    cacheKeyUseUser: true, //@TODO conditional user caching true / false for better performance
  };

  if (await outputCachedData(req, res, cache, cacheOptions)) return;

  const apiBody = {
    ...getApiBodyFromPath(get(req, 'query.param', [])),
  };

  if (get(req, 'query.id')) {
    apiBody.categoryName = get(req, 'query.id');
  }

  if (get(req, 'query.marketingCampaign')) {
    apiBody.marketingCampaign = get(req, 'query.marketingCampaign');
  }

  if (get(apiBody, 'param.marketing-set')) {
    apiBody.marketingSets = get(apiBody, 'param.marketing-set[0]');
    delete apiBody.param['marketing-set'];
  }

  if (get(req, 'query.search')) {
    apiBody.search = get(req, 'query.search');
  }

  const result = await fetch(
    `${reqApiHost(req)}/api/v2/filters${reqExtractUri(req.url)}`,
    {
      method: 'post',
      headers: reqGetHeaders(req),
      body: JSON.stringify(apiBody),
    },
  ).then(r => {
    return r.json();
  });

  const output = result.data;
  output.breadcrumbs = get(result, 'breadcrumbs');
  output.meta = get(result, 'meta');

  saveDataToCache(req, cache, output, cacheOptions);
  res.status(get(result, 'statusCode', 500)).json(output);
});
