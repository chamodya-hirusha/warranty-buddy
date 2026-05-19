import { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="card-elevated p-10 flex flex-col items-center text-center gap-3">
      {icon && <div className="h-12 w-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">{icon}</div>}
      <div>
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>}
      </div>
      {action}
    </div>
  );
}
