import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";

export default withSession(async (req, res) => {
  const document = await fetch(
    `${reqApiHost(req)}/api/v2/users/${get(
      req.session.get(USER_CONSTANT),
      "id"
    )}/documents/${get(req, "query.id")}`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  if (document?.data) {
    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(Buffer.from(document?.data, "base64"));
  } else {
    res.setHeader("Content-Type", "text/html");
    res.status(500).send("dokument sa nenašiel");
  }
  res.end();
  return;
});
