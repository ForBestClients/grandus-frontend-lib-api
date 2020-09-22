import withSession, { extractSessionUser } from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";

export default withSession(async (req, res) => {
  const userSession = req.session.get(USER_CONSTANT);

  if (!get(userSession, "accessToken")) {
    res.status(200).end(JSON.stringify([{ message: "neprihlaseny //TODO" }]));
    return;
  }

  let requestOptions = {
    headers: reqGetHeaders(req),
  };

  switch (req.method) {
    case "PUT":
    case "POST":
      requestOptions = {
        ...requestOptions,
        ...{ method: req.method, body: req.body },
      };
      break;
    default:
      break;
  }

  const user = await fetch(
    `${reqApiHost(req)}/api/v2/users/${get(userSession, "id")}`,
    requestOptions
  ).then((result) => result.json());

  if (get(user, "statusCode") !== 200) {
    res.status(get(user, "statusCode")).json(get(user, "data.messages"));
  } else {
    req.session.set(USER_CONSTANT, extractSessionUser(get(user, "data")));
    await req.session.save();

    res.status(200).json(get(user, "data"));
  }
});
