import { buildLlms, textResponse } from "../data/llms";

// با charset تا مرورگر و ابزارها متن فارسی را درست بخوانند
export const GET = () => textResponse(buildLlms().index);
