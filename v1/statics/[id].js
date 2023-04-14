import { get } from "lodash";
import {reqGetHeaders, reqApiHost, getApiExpand} from "grandus-lib/utils";

export default async (req, res) => {
  const additionalExpandFields = getApiExpand("PAGE_ADDITIONAL", false);
  const additionalExpandFieldsString = additionalExpandFields ? `,${additionalExpandFields}` : "";

  const data = await fetch(
    `${reqApiHost(req)}/api/v2/pages/${get(
      req,
      "query.id"
    )}?expand=photo,content,customCss,customJavascript,attachments,products${additionalExpandFieldsString}`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  res.statusCode = get(data, "statusCode", 500);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data.data));
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
