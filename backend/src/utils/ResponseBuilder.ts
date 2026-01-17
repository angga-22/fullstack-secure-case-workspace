import { Response } from "express";
import { HTTP_REASON_PHRASE, HttpStatusCode } from "@/constants";

class ResponseBuilder {
  static send<T>(
    res: Response,
    code: HttpStatusCode,
    data?: T,
    message?: string,
  ) {
    return res.status(code).json({
      success: code < 400,
      statusCode: code,
      status: HTTP_REASON_PHRASE[code],
      message,
      data,
    });
  }

  static redirect(
    res: Response,
    code: 301 | 302 | 303 | 307 | 308,
    location: string,
    message?: string,
  ) {
    return res.redirect(code, location);
  }
}

export default ResponseBuilder;
