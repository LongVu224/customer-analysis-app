import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Chart(props) {
  return (
    <ResponsiveContainer width="100%" height={props.height ? props.height : 800}>
      <AreaChart
        data={props.data}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={props.xaxisKey} />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey={props.dataKey} fill="#ff8489" stroke="#ff8489" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
