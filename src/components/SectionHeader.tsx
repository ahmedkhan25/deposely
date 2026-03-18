export function SectionHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <div className="mb-8">
      {badge && (
        <span className="inline-block mb-2 px-3 py-1 text-xs font-medium rounded-full bg-deposly-blue/10 text-deposly-blue">
          {badge}
        </span>
      )}
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-deposly-muted">{subtitle}</p>}
    </div>
  );
}
