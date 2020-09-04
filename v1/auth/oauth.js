import withSession, { extractSessionUser } from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";

export default withSession(async (req, res) => {
  let requestOptions = {
    headers: {
      ...reqGetHeaders(req),
      Authorization: 'Bearer ' + get(req.query, "userToken")
    }
  };

  const user = await fetch(
    `${reqApiHost(req)}/api/v2/users/${get(req.query, "userId")}`,
    requestOptions
  ).then((result) => result.json());
    
  if (get(user, "statusCode") !== 200) {
    res.status(get(user, "statusCode")).json(get(user, "data.messages"));
  } else {
    req.session.set(USER_CONSTANT, extractSessionUser(get(user, "data")));
    await req.session.save();
    res.redirect(301, get(req.query, 'backUrl', '/prihlasenie'));
  }
});
