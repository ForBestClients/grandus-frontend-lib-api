import { get } from "lodash";
import withSession, { extractSessionUser } from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";

export default withSession(async (req, res) => {
  const newUser = await fetch(`${reqApiHost({})}/api/v2/users`, {
    method: "POST",
    headers: reqGetHeaders(req),
    body: req.body,
  }).then((result) => result.json());

  if (get(newUser, "statusCode") !== 201) {
    res.statusCode = get(newUser, "data.statusCode", 500);
    res.setHeader("Content-Type", "application/json");
    res.json({
      data: {
        messages: get(newUser, 'data.messages')
      },
      success: get(newUser, 'success', false)
    });
  } else {
    req.session.set(USER_CONSTANT, extractSessionUser(get(newUser, "data")));
    await req.session.save();

    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.json({
      data: get(newUser, 'data'),
      success: get(newUser, 'success', false)
    });
  }
});
