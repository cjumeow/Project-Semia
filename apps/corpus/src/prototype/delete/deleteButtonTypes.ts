import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type DeleteButtonStyle = {
  id: string;
  label: string;
  description: string;
  buttonClass: string;
  shadowClass: string;
};

export type DeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};
