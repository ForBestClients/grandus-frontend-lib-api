import withSession from 'grandus-lib/utils/session';
import { reqGetHeaders, reqApiHost } from 'grandus-lib/utils';
import get from 'lodash/get';

export default withSession(async (req, res) => {
  const { method } = req;

  res.setHeader('Content-Type', 'application/json');

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const url = `${reqApiHost(req)}/api/v2/shopping-lists?expand=items&fields=id,name,note,accessToken,itemsCount,items.id,items.product.id`;

  const result = await fetch(url, {
    headers: reqGetHeaders(req),
  }).then(async (response) => await response.json());

  res.status(get(result, 'statusCode', 500)).json(get(result, 'data'));
});
