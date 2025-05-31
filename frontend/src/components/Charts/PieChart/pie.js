import React, { PureComponent } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Chart(props) {
  let renderLabel = function(entry) {
    return entry[props.labelKey];
  }

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56'];

  return (
    <ResponsiveContainer width="100%" height={props.height ? props.height : 500}>
      <PieChart>
        <Pie 
          data={props.data} 
          dataKey={props.dataKey} 
          label={renderLabel}
          cx="50%" 
          cy="50%" 
          outerRadius={200} 
          fill="#8884d8" 
        >
          {props.data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}