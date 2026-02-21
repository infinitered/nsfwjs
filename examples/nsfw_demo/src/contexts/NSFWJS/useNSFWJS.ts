import { useContext } from "react";
import { NSFWJSContext } from ".";

export const useNSFWJS = () => {
  const context = useContext(NSFWJSContext);
  if (!context) throw new Error("useNSFWJS must be used within a NSFWJSProvider");
  return context;
};
