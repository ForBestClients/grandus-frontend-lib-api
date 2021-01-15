import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost, reqGetHost } from "grandus-lib/utils";
import {
  CART_CONSTANT,
  CART_CONTACT_CONSTANT,
  DELIVERY_DATA_SESSION_STORAGE_KEY,
  SESSION_STORAGE_CONSTANT,
} from "grandus-lib/constants/SessionConstants";
import { get, toNumber, isEmpty } from "lodash";

export default withSession(async (req, res) => {
  const { body = {}, method } = req;

  const values = JSON.parse(body);

  res.setHeader("Content-Type", "application/json");

  const cartSession = req.session.get(CART_CONSTANT);
  const cartContactSession = JSON.parse(req.session.get(CART_CONTACT_CONSTANT));
  const sessionStorage = req.session.get(SESSION_STORAGE_CONSTANT);

  const cartAccessToken = get(cartSession, "accessToken");
  const cartSpecificDeliveryData = get(sessionStorage, DELIVERY_DATA_SESSION_STORAGE_KEY);

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
      note: get(values, "note", ""),
      deliveryType: get(values, "delivery", ""),
      paymentType: get(values, "payment", ""),
      cardPaymentReturnUrl: `${reqGetHost(req)}/objednavka/dakujeme`,
      privacyPolicy: toNumber(get(values, "privacyPolicy", 0)),
      termsAndConditions: toNumber(get(values, "termsAndConditions", 0)),
    },
  };

  if (cartContactSession?.isCompany) {
    orderData.order.companyName = get(cartContactSession, "companyName", "");
    orderData.order.ico = get(cartContactSession, "ico", "");
    orderData.order.dic = get(cartContactSession, "dic", "");
    orderData.order.icDPH = get(cartContactSession, "icDPH", "");
  }

  if (cartContactSession?.isDifferentDeliveryAddress) {
    orderData.order.deliveryName = get(cartContactSession, "deliveryName", "");
    orderData.order.deliverySurname = get(
      cartContactSession,
      "deliverySurname",
      ""
    );
    orderData.order.deliveryCity = get(cartContactSession, "deliveryCity", "");
    orderData.order.deliveryStreet = get(
      cartContactSession,
      "deliveryStreet",
      ""
    );
    orderData.order.deliveryStreetNumber = get(
      cartContactSession,
      "deliveryStreetNumber",
      ""
    );
    orderData.order.deliveryZip = get(cartContactSession, "deliveryZip", "");
    orderData.order.deliveryPhone = get(
      cartContactSession,
      "deliveryPhone",
      ""
    );
    orderData.order.deliveryEmail = get(
      cartContactSession,
      "deliveryEmail",
      ""
    );
  }

  if (values?.deliveryTime) {
    (orderData.order.operationUnitId = get(
      values,
      "deliveryTime.operationUnitId",
      ""
    )),
      (orderData.order.deliveryAt =
        get(values, "deliveryTime.date", "") +
        " " +
        get(values, "deliveryTime.from", "")),
      (orderData.order.slotLengthInMinutes = get(
        values,
        "deliveryTime.slotLengthInMinutes",
        ""
      ));
  }

  if (!isEmpty(cartSpecificDeliveryData)) {
    orderData.order.specificDeliveryJson = JSON.stringify(cartSpecificDeliveryData);
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
