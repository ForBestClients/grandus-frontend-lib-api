import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default withSession(async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;

  const order = await fetch(
    `${reqApiHost(req)}/api/v2/users/${get(
      req.session.get(USER_CONSTANT),
      "id"
    )}/orders/${get(
      req,
      "query.id"
    )}?expand=items,orderItems,paymentType,deliveryInfo,invoices,canCreateInvoice,deliveryNotes,origin,suborders.orderItems,operationUnit,user,parameters`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  saveDataToCache(req, cache, order?.data, { time: 30 });

  res.status(200).json(order?.data);
});
