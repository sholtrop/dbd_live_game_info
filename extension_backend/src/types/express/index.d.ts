import * as Express from "express";
import { AuthenticatedUser } from "../../models";

declare global {
  namespace Express {
    interface Request {
      userToken: any;
      user?: AuthenticatedUser;
    }
  }
}
