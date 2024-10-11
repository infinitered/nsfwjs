export const modelJson = () =>
  import("../models/mobilenet_v2/model.min.js" as string);

export const weightBundles = [
  () => import("../models/mobilenet_v2/group1-shard1of1.min.js" as string),
];
