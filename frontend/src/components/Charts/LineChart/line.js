import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Chart(props) {
  return (
    <ResponsiveContainer width="100%" height={props.height ? props.height : 800}>
      <LineChart data={props.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={props.xaxisKey} />
        <YAxis />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number' ? value.toFixed(2) : value
          }
        />
        <Legend />
        <Line type="monotone" dataKey={props.dataKey} stroke="#ff8489"/>
      </LineChart>
    </ResponsiveContainer>
  );
}
