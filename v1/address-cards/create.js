import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";

export default withSession(async (req, res) => {
  const { body } = req;
  const userSession = req.session.get(USER_CONSTANT);

  const requestBody = { ...JSON.parse(body), relationId: userSession?.id };
  const addressCard = await fetch(`${reqApiHost(req)}/api/v2/address-cards`, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: reqGetHeaders(req),
  }).then((result) => result.json());

  res.status(200).json(addressCard?.data);
});
