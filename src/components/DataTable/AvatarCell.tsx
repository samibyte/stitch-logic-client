export function AvatarCell({
  image,
  name,
  subtitle,
}: {
  image?: string;
  name: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-300">
            <span className="font-semibold text-gray-600">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="font-medium">{name}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
