import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost, reqGetHost } from "grandus-lib/utils";
import {
  CART_CONSTANT,
  CART_CONTACT_CONSTANT,
} from "grandus-lib/constants/SessionConstants";
import { get, toNumber } from "lodash";

export default withSession(async (req, res) => {
  const { body = {}, method } = req;

  const values = JSON.parse(body);

  res.setHeader("Content-Type", "application/json");

  const cartSession = req.session.get(CART_CONSTANT);
  const cartContactSession = JSON.parse(req.session.get(CART_CONTACT_CONSTANT));
  const cartAccessToken = get(cartSession, "accessToken");

  let order = null;
  let url = `${reqApiHost(req)}/api/v2/orders`;

  const orderData = {
    order: {
      cart: { accessToken: cartAccessToken },
      name: get(cartContactSession, "name", ""),
      surname: get(cartContactSession, "surname", ""),
      city: get(cartContactSession, "city", ""),
      street: get(cartContactSession, "street", ""),
      streetNumber: get(cartContactSession, "streetNumber", ""),
      zip: get(cartContactSession, "zip", ""),
      countryId: get(cartContactSession, "countryId", ""),
      phone: get(cartContactSession, "phone", ""),
      email: get(cartContactSession, "email", ""),
      companyName: get(cartContactSession, "companyName", ""),
      ico: get(cartContactSession, "ico", ""),
      dic: get(cartContactSession, "dic", ""),
      icDPH: get(cartContactSession, "icDPH", ""),
      deliveryName: get(cartContactSession, "deliveryName", ""),
      deliverySurname: get(cartContactSession, "deliverySurname", ""),
      deliveryCity: get(cartContactSession, "deliveryCity", ""),
      deliveryStreet: get(cartContactSession, "deliveryStreet", ""),
      deliveryStreetNumber: get(cartContactSession, "deliveryStreetNumber", ""),
      deliveryZip: get(cartContactSession, "deliveryZip", ""),
      deliveryPhone: get(cartContactSession, "deliveryPhone", ""),
      deliveryEmail: get(cartContactSession, "deliveryEmail", ""),
      note: get(values, "note", ""),
      deliveryType: get(values, "delivery", ""),
      paymentType: get(values, "payment", ""),
      cardPaymentReturnUrl: `${reqGetHost(req)}/objednavka/dakujeme`,
      privacyPolicy: toNumber(get(values, "privacyPolicy", 0)),
      termsAndConditions: toNumber(get(values, "termsAndConditions", 0)),
    },
  };

  if (values?.deliveryTime) {
    orderData.order.operationUnitId = get(values, 'deliveryTime.operationUnitId', ''),
    orderData.order.deliveryAt = get(values, 'deliveryTime.date', '') + ' ' + get(values, 'deliveryTime.from', ''),
    orderData.order.slotLengthInMinutes = get(values, 'deliveryTime.slotLengthInMinutes', '');
  }

  if (values?.params) {
    orderData.order.params = values?.params;
  }

  url += "";
  order = await fetch(url, {
    headers: reqGetHeaders(req),
    method: "POST",
    body: JSON.stringify(orderData),
  }).then((result) => result.json());

  if (order) {
    res.status(get(order, "statusCode")).json(get(order, "data"));
    return;
  }
});
