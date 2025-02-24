declare module 'react-icons/fa' {
  import { ComponentType, SVGProps } from 'react';

  // Define a type that includes the `size` prop
  type IconProps = SVGProps<SVGSVGElement> & {
    size?: number | string;
  };

  export const FaWallet: ComponentType<IconProps>;
  export const FaUser: ComponentType<IconProps>;
  export const FaCamera: ComponentType<IconProps>;
  export const FaEnvelope: ComponentType<IconProps>;
  export const FaCog: ComponentType<IconProps>;
}
