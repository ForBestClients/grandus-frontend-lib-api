import withSession from "grandus-lib/utils/session";
import { SESSION_STORAGE_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { isEmpty } from "lodash";

export default withSession(async (req, res) => {
  let sessionData = req.session.get(SESSION_STORAGE_CONSTANT);

  if (isEmpty(sessionData)) {
    sessionData = {};
  }

  res.status(200).json(sessionData);
});
