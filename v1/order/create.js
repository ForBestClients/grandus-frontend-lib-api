import withSession, { extractSessionUser } from "grandus-lib/utils/session";
import {
  reqGetHeaders,
  reqApiHost,
  reqGetHost,
  generateRandomString,
} from "grandus-lib/utils";
import {
  CART_CONSTANT,
  CART_CONTACT_CONSTANT,
  DELIVERY_DATA_SESSION_STORAGE_KEY,
  SESSION_STORAGE_CONSTANT,
  USER_CONSTANT,
} from "grandus-lib/constants/SessionConstants";
import get from "lodash/get";
import toNumber from "lodash/toNumber";
import isEmpty from "lodash/isEmpty";

const createUser = async (contact, cartAccessToken, req) => {
  const pass = generateRandomString();
  const reqBody = {
    user: {
      name: get(contact, "firstname") || get(contact, "name"),
      surname: get(contact, "surname"),
      email: get(contact, "email"),
      password: get(contact, "password") || pass,
      passwordRepeat: get(contact, "passwordConfitm") || pass,
    },
  };
  if (cartAccessToken) {
    reqBody.cart = { accessToken: cartAccessToken };
  }

  if (get(contact, "isCompany")) {
    reqBody.company = {
      name: get(contact, "companyName"),
      businessId: get(contact, "ico"),
      taxId: get(contact, "dic"),
      vatNumber: get(contact, "icDPH"),
    };
  }

  const newUser = await fetch(`${reqApiHost({})}/api/v2/users`, {
    method: "POST",
    headers: reqGetHeaders(req),
    body: JSON.stringify(reqBody),
  }).then((result) => result.json());

  if (get(newUser, "statusCode") === 201) {
    req.session.set(USER_CONSTANT, extractSessionUser(get(newUser, "data")));
    await req.session.save();
  }

  return get(newUser, "success", false);
};

export default withSession(async (req, res) => {
  const { body = {}, method } = req;

  const values = JSON.parse(body);

  res.setHeader("Content-Type", "application/json");

  const cartSession = req.session.get(CART_CONSTANT);
  const cartContactSession = JSON.parse(req.session.get(CART_CONTACT_CONSTANT));
  const sessionStorage = req.session.get(SESSION_STORAGE_CONSTANT);

  const cartAccessToken = get(cartSession, "accessToken");
  const cartSpecificDeliveryData = get(
    sessionStorage,
    DELIVERY_DATA_SESSION_STORAGE_KEY
  );

  let order = null;
  let url = `${reqApiHost(req)}/api/v2/orders`;

  const orderData = {
    order: {
      cart: { accessToken: cartAccessToken },
      name:
        get(cartContactSession, "firstname", "") ||
        get(cartContactSession, "name", ""),
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
      operationUnitId: get(values, "operationUnitId", ""),
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
  } else {
      // send empty comany name if isCompany == false => BE will regenerate companyName then
      orderData.order.companyName = "";
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
    orderData.order.specificDeliveryJson = JSON.stringify(
      cartSpecificDeliveryData
    );
  }

  if (values?.params) {
    orderData.order.params = values?.params;
  }

  // create user before order
  const createAccount = get(cartContactSession, "createAccount", "");
  if (createAccount) {
    try {
      await createUser(cartContactSession, cartAccessToken, req);
    } catch (e) {
      // do nothing, creating of order is priority
    }
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
