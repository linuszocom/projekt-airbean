import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use(requireApiKey);
router.use("/users", userRoutes);

export default router;
