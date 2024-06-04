import { Router } from "express";
import {
  test,
} from "../controller/test.controller";

const router: Router = Router();

router.get("/", test);

export default router;
