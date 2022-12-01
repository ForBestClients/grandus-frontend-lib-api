import withSession, { extractSessionCart } from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost, getApiExpand } from "grandus-lib/utils";
import { CART_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";

export default withSession(async (req, res) => {
  const { body = {}, method } = req;

  res.setHeader("Content-Type", "application/json");

  const cartSession = req.session.get(CART_CONSTANT);
  const cartAccessToken = get(cartSession, "accessToken");

  if (!cartAccessToken) {
    res.statusCode = 404;
    res.end({message: "cart not found"});
    return;
  }

  let cart = null;
  let url = `${reqApiHost(req)}/api/v2/carts/${cartAccessToken}/items/${get(
    req,
    "query.itemId"
  )}`;

  if (getApiExpand("CART")) {
    url += "?" + getApiExpand("CART", true);
  }

  if (getApiExpand("CART", false, "FIELDS")) {
    url +=
      (getApiExpand("CART") ? "&" : "?") + getApiExpand("CART", true, "FIELDS");
  }

  switch (method) {
    // case "GET":
    //   if (!cartAccessToken) {
    //     res.statusCode = 404;
    //     res.end(JSON.stringify([{ message: "kosik nenexistuje" }]));
    //     return;
    //   }

    //   cart = await fetch(url, {
    //     headers: reqGetHeaders(req),
    //   }).then((result) => result.json());
    //   // Get data from your database
    //   //   res.status(200).json({ id, name: `User ${id}` });

    //   req.session.set(CART_CONSTANT, extractSessionCart(get(cart, "data")));
    //   await req.session.save();

    //   res.statusCode = 200;
    //   res.end(JSON.stringify(get(cart, "data")));
    //   break;

    // case "POST":
    //   cart = await fetch(url, {
    //     headers: reqGetHeaders(req),
    //     method: cartAccessToken ? "PUT" : "POST",
    //     body: body,
    //   }).then((result) => result.json());

    //   req.session.set(CART_CONSTANT, extractSessionCart(get(cart, "data")));
    //   await req.session.save();

    //   res.statusCode = 200;
    //   res.end(JSON.stringify(get(cart, "data")));

    //   // Update or create data in your database
    //   //   res.status(200).json({ id, name: name || `User ${id}` });
    //   break;

    case "DELETE":
      cart = await fetch(url, {
        headers: reqGetHeaders(req),
        method: "DELETE",
      }).then((result) => result.json());

      if (get(cart, 'status', false)) {
        req.session.set(CART_CONSTANT, extractSessionCart(get(cart, "data")));
        await req.session.save();
      }

      res.statusCode = get(cart, "statusCode");
      res.end(JSON.stringify(get(cart, "data")));
      break;

    case "PUT":
      cart = await fetch(url, {
        headers: reqGetHeaders(req),
        method: "PUT",
        body: body,
      }).then((result) => result.json());

      if (get(cart, 'status', false)) {
        req.session.set(CART_CONSTANT, extractSessionCart(get(cart, "data")));
        await req.session.save();
      }

      res.statusCode = get(cart, "statusCode");
      res.end(JSON.stringify(get(cart, "data")));
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }

  //   if (get(user, "statusCode") !== 200) {
  //     res.statusCode = get(user, "data.code");
  //     res.end(JSON.stringify(get(user, "data.messages")));
  //   } else {
  //     req.session.set(USER_CONSTANT, get(user, "data"));
  //     await req.session.save();

  //     res.statusCode = 200;
  //     res.end(JSON.stringify(get(user, "data")));
  //   }
});
