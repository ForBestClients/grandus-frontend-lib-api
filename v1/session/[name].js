import withSession from "grandus-lib/utils/session";
import { SESSION_STORAGE_CONSTANT } from "grandus-lib/constants/SessionConstants";
import _, { get, omit, isEmpty, merge } from "lodash";

export default withSession(async (req, res) => {
  const { method, query, body = null } = req;
  const name = get(query, "name");
  let sessionData = req.session.get(SESSION_STORAGE_CONSTANT) || {};
  let newSessionData = [];

  switch (method) {
    case "GET":
      if (isEmpty(name)) {
        res.status(200).json([]);
      }

      newSessionData = get(sessionData, name, []);

      res.status(200).json(newSessionData);
      break;
    case "DELETE":
      if (isEmpty(name)) {
        res.status(200).json(sessionData);
      }

      newSessionData = omit(sessionData, [name]);
      req.session.set(SESSION_STORAGE_CONSTANT, newSessionData);
      await req.session.save();

      res.status(200).json(newSessionData);
      break;

    case "PUT":
      let newBody = {};
      try {
        newBody = JSON.parse(body);
      } catch (e) {
        newBody = body;
      }
      newSessionData = {...sessionData, ...{ [name]: newBody }};

      req.session.set(SESSION_STORAGE_CONSTANT, newSessionData);
      await req.session.save();

      res.status(200).json(newSessionData);
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
