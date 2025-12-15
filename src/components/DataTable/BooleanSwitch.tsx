import { Switch } from "../ui/switch";

export function BooleanSwitch({
  checked,
  onCheckedChange,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <span className="ml-2 text-sm text-gray-600">
        {checked ? "Yes" : "No"}
      </span>
    </div>
  );
}
