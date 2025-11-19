import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, Language } from '../../types';
import { translations } from '../../translations';
import { formatCurrency } from '../../utils/formatters';

interface AnnualOverviewChartProps {
  transactions: Transaction[];
  language: Language;
}

const CustomTooltip = ({ active, payload, label, language }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md text-sm text-white">
          <p className="label font-semibold">{label}</p>
          {payload.map((pld: any) => (
            <div key={pld.dataKey} style={{ color: pld.fill }}>
              {`${pld.name}: ${formatCurrency(pld.value, language)}`}
            </div>
          ))}
        </div>
      );
    }
    return null;
};

const AnnualOverviewChart: React.FC<AnnualOverviewChartProps> = ({ transactions, language }) => {
  const data = useMemo(() => {
    const months: { [key: string]: { income: number; expense: number } } = {};
    const monthNames = [...Array(12)].map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, { month: 'short', year: '2-digit' }).format(d);
    });
    monthNames.reverse();

    monthNames.forEach(name => {
      months[name] = { income: 0, expense: 0 };
    });

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0,0,0,0);


    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= twelveMonthsAgo) {
        const monthKey = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, { month: 'short', year: '2-digit' }).format(tDate);
        if (months[monthKey]) {
          if (t.amount > 0) {
            months[monthKey].income += t.amount;
          } else {
            months[monthKey].expense += Math.abs(t.amount);
          }
        }
      }
    });

    return Object.entries(months).map(([name, values]) => ({
      name,
      [translations.income[language]]: values.income,
      [translations.expense[language]]: values.expense,
    }));
  }, [transactions, language]);

  if (transactions.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">{translations.noTransactions[language]}</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#4B5563" interval="preserveStartEnd" tickMargin={5} />
        <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#4B5563" tickFormatter={(value) => new Intl.NumberFormat(language, { notation: 'compact', compactDisplay: 'short' }).format(Number(value)) } width={35} />
        <Tooltip content={<CustomTooltip language={language} />} cursor={{fill: 'rgba(107, 114, 128, 0.1)'}} />
        <Legend wrapperStyle={{fontSize: '12px'}}/>
        <Bar dataKey={translations.income[language]} fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
        <Bar dataKey={translations.expense[language]} fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AnnualOverviewChart;
