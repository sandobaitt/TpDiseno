
interface HeaderProps {
    title: string;
    subtitle: string;
    className?: string;
}

export default function HeaderPage({ title, subtitle, className }: HeaderProps) {
	return (
		<section className={`px-7 pt-0 pb-6 max-sm:px-4 ${className}`}>
			<h1 className="text-4xl font-black tracking-tight leading-none text-white uppercase max-sm:text-3xl">
				{title}
			</h1>
			<p className="mt-1.5 text-sm text-gray-500">
				{subtitle}
			</p>
			<div className="h-px bg-white/[0.06] mt-4" />
		</section>
	);
}