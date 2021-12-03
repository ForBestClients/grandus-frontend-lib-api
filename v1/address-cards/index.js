import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default withSession(async (req, res) => {

  const addressCards = await fetch(
    `${reqApiHost(req)}/api/v2/address-cards`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  res.status(200).json(addressCards?.data);
});
