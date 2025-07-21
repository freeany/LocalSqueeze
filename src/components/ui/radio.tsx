import * as React from "react";
import { RadioGroupItem } from "./radio-group";

export type RadioProps = React.ComponentPropsWithoutRef<typeof RadioGroupItem>

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  RadioProps
>(({ ...props }, ref) => {
  return <RadioGroupItem ref={ref} {...props} />;
});
Radio.displayName = "Radio";

export { Radio };