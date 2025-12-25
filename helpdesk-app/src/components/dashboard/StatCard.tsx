interface StatCardProps {
    value: number | string;
    label: string;
    color?: 'primary' | 'red' | 'amber' | 'green' | 'blue' | 'slate';
    bordered?: boolean;
}

const colorMap = {
    primary: 'text-[#EB4C36] border-[#EB4C36]',
    red: 'text-red-500 border-red-500',
    amber: 'text-amber-500 border-amber-500',
    green: 'text-green-500 border-green-500',
    blue: 'text-blue-500 border-blue-500',
    slate: 'text-slate-600 border-slate-600',
};

export default function StatCard({ value, label, color = 'slate', bordered = false }: StatCardProps) {
    const textColor = colorMap[color].split(' ')[0];
    const borderColor = bordered ? colorMap[color].split(' ')[1] : '';

    return (
        <div className={`flex-1 bg-white rounded-2xl p-4 shadow-soft ${bordered ? `border-2 ${borderColor}` : ''}`}>
            <p className={`text-3xl font-extrabold ${textColor}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
    );
}
