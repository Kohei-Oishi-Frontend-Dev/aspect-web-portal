import React from "react";
type SVGComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

// accept either an inline SVG React component or a string path (imported asset)
export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  svg: SVGComponent | string;
  size?: number | string;
  className?: string;
}

const SvgIcon: React.FC<SvgIconProps> = ({ svg, size = 24, className, ...rest }) => {
  const sizeValue = typeof size === "number" ? `${size}px` : size;
  // If svg is a string path (imported asset), render an <img>
  if (typeof svg === "string") {
    return (
      <img
        src={svg}
        alt=""
        className={className}
        style={{ width: sizeValue, height: sizeValue }}
        {...rest}
      />
    );
  }
  // Otherwise treat svg as an inline React SVG component
  const Icon = svg as SVGComponent;
  return <Icon width={sizeValue} height={sizeValue} className={className} {...rest} aria-hidden />;
};
export default SvgIcon;