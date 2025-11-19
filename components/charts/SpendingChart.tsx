import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SpendingAnalysis, Language } from '../../types';
import { translations } from '../../translations';
import { formatCurrency } from '../../utils/formatters';

interface SpendingChartProps {
  data: SpendingAnalysis[];
  language: Language;
  onSliceClick: (category: string) => void;
}

const CustomTooltip = ({ active, payload, language }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md text-sm">
          <p className="label text-white">{`${payload[0].name} : ${formatCurrency(payload[0].value, language)} (${payload[0].payload.percentage}%)`}</p>
        </div>
      );
    }
    return null;
};

const SpendingChart: React.FC<SpendingChartProps> = ({ data, language, onSliceClick }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">{translations.noSpendingData[language]}</div>
    }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="75%"
          fill="#8884d8"
          dataKey="total"
          nameKey="category"
          isAnimationActive={true}
          animationDuration={800}
          onClick={(pieData) => onSliceClick(pieData.name)}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip language={language} />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: '12px'}} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const COLORS = ['#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];

export default SpendingChart;
