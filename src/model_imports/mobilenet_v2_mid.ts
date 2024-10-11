export const modelJson = () =>
  import("../models/mobilenet_v2_mid/model.min.js" as string);

export const weightBundles = [
  () => import("../models/mobilenet_v2_mid/group1-shard1of2.min.js" as string),
  () => import("../models/mobilenet_v2_mid/group1-shard2of2.min.js" as string),
];
