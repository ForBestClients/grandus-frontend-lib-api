import withSession from "grandus-lib/utils/session";
import { USER_COMPARE_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get, without, uniq } from "lodash";

export default withSession(async (req, res) => {
  const { method, query } = req;
  const productId = get(query, "productId");
  let productIds = req.session.get(USER_COMPARE_CONSTANT);
  let newProductIds = null;

  productIds = productIds ? productIds : [];

  switch (method) {
    case "DELETE":
      if (!productIds) {
        res.status(200).json({ productIds: [], products: [] });
      }

      newProductIds = without(productIds, productId);

      req.session.set(USER_COMPARE_CONSTANT, newProductIds);
      await req.session.save();

      res
        .status(200)
        .json({ productIds: newProductIds ? newProductIds : [], products: [] });
      break;

    case "PUT":
      newProductIds = uniq([...productIds, productId]);

      req.session.set(USER_COMPARE_CONSTANT, newProductIds);
      await req.session.save();

      res
        .status(200)
        .json({ productIds: newProductIds ? newProductIds : [], products: [] });
      break;

    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
