import withSession from "grandus-lib/utils/session";
import {
  reqGetHeaders,
  reqApiHost,
} from "grandus-lib/utils";


export default withSession(async (req, res) => {

  const [products] = await Promise.all([
    fetch(
        `${reqApiHost(req)}/api/v2/products`,
        {
          headers: reqGetHeaders(req),
        },
    )
        .then(res => res.json())
        .then(r => r.data),
  ]);

  const data = {
    products,
  };

  res.status(200).json(data);
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};