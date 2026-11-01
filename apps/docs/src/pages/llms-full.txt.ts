import { buildLlms, textResponse } from "../data/llms";

export const GET = () => textResponse(buildLlms().full);
