import { get } from "lodash";
import {
  reqGetHeaders,
  reqApiHost
} from "grandus-lib/utils";

export default async (req, res) => {
  const disabledDates = await fetch(
      `${reqApiHost(req)}/api/v2/operation-units/${get(req, "query.id")}/available-slots?date=${get(req, "query.date")}`,
      {
        method: "get",
        headers: reqGetHeaders(req),
      }
    )
      .then((result) => {
        return result.json();
      })
      .then((r) => get(r, "data", []));

  res.status(200).json(disabledDates);
};
