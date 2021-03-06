import withSession from "grandus-lib/utils/session";
import { CART_CONTACT_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { isEmpty } from 'lodash';

export default withSession(async (req, res) => {
  const { body = {}, method } = req;

  res.setHeader("Content-Type", "application/json");

  let cartContact = null;

  switch (method) {
    case "GET":

      cartContact = req.session.get(CART_CONTACT_CONSTANT);

      res.statusCode = 200;
      res.end(cartContact);
      break;

    case "POST":
      req.session.set(CART_CONTACT_CONSTANT, body);
      await req.session.save();

      res.statusCode = 200;
      res.end(req.session.get(CART_CONTACT_CONSTANT));
      break;

    case "DELETE":
      req.session.unset(CART_CONTACT_CONSTANT);
      await req.session.save();

      res.statusCode = 500;
      const contact = req.session.get(CART_CONTACT_CONSTANT);
      if (isEmpty(contact)) {
        res.statusCode = 200;
      }
      res.json(!isEmpty(contact) ? contact : JSON.parse('{}'));
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
