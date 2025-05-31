import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Chart(props) {
  return (
    <ResponsiveContainer width="100%" height={props.height ? props.height : 800}>
      <BarChart data={props.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={props.xaxisKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={props.dataKey} fill="#ff8489" />
      </BarChart>
    </ResponsiveContainer>
  );
}