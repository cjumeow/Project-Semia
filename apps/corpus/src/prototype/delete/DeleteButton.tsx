import type { DeleteButtonProps, DeleteButtonStyle } from './deleteButtonTypes';
import { DeleteTrashIcon } from './DeleteTrashIcon';

export function DeleteButton({
  style,
  children = 'Delete',
  className = '',
  type = 'button',
  ...props
}: DeleteButtonProps & { style: DeleteButtonStyle }) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-[7px] rounded-[11px] px-3 py-[7px]',
        'text-[11.5px] font-medium leading-none text-white',
        'transition-[background-color,box-shadow,transform] duration-150',
        'hover:brightness-110 active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40',
        style.buttonClass,
        style.shadowClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <DeleteTrashIcon size={12} />
      <span>{children}</span>
    </button>
  );
}
