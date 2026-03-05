import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Group by stack ID for grouped stacked bars
    const infoItems = payload.filter(p => p.dataKey.includes('_info'));
    const errorItems = payload.filter(p => p.dataKey.includes('_error'));
    const hasGroups = infoItems.length > 0 && errorItems.length > 0;
    
    const infoTotal = infoItems.reduce((sum, entry) => sum + (entry.value || 0), 0);
    const errorTotal = errorItems.reduce((sum, entry) => sum + (entry.value || 0), 0);
    
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        minWidth: '180px'
      }}>
        <p style={{ color: 'white', fontWeight: 600, marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>{label}</p>
        
        {hasGroups ? (
          <>
            {/* Info/Success section */}
            <div style={{ marginBottom: '10px' }}>
              <p style={{ color: '#22d3ee', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>
                ✓ Success ({infoTotal})
              </p>
              {infoItems.map((entry, index) => (
                <p key={index} style={{ color: '#e2e8f0', margin: '2px 0', fontSize: '12px', paddingLeft: '12px' }}>
                  <span style={{ color: entry.color, marginRight: '6px' }}>●</span>
                  {entry.name}: {entry.value || 0}
                </p>
              ))}
            </div>
            
            {/* Error section */}
            <div>
              <p style={{ color: '#f87171', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>
                ✕ Errors ({errorTotal})
              </p>
              {errorItems.map((entry, index) => (
                <p key={index} style={{ color: '#e2e8f0', margin: '2px 0', fontSize: '12px', paddingLeft: '12px' }}>
                  <span style={{ color: entry.color, marginRight: '6px' }}>●</span>
                  {entry.name}: {entry.value || 0}
                </p>
              ))}
            </div>
          </>
        ) : (
          <>
            {payload.map((entry, index) => (
              <p key={index} style={{ color: '#e2e8f0', margin: '4px 0' }}>
                <span style={{ color: entry.color, marginRight: '6px' }}>●</span>
                {entry.name}: <span style={{ fontWeight: 500 }}>{entry.value?.toLocaleString() || 0}</span>
              </p>
            ))}
            {payload.length > 1 && (
              <p style={{ color: '#94a3b8', margin: '8px 0 0', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                Total: <span style={{ fontWeight: 500, color: 'white' }}>{payload.reduce((sum, e) => sum + (e.value || 0), 0).toLocaleString()}</span>
              </p>
            )}
          </>
        )}
      </div>
    );
  }
  return null;
};

// Service colors for stacked bars
const SERVICE_COLORS = {
  upload: { info: '#6366f1', error: '#dc2626' },      // Indigo / Red
  insights: { info: '#0ea5e9', error: '#f97316' },    // Sky / Orange
  investment: { info: '#10b981', error: '#ec4899' }   // Emerald / Pink
};

export default function Chart(props) {
  const { stacked = false, showLegend = false, groupedStacked = false } = props;
  
  return (
    <ResponsiveContainer width="100%" height={props.height ? props.height : 800}>
      <BarChart data={props.data} barGap={groupedStacked ? 2 : 0} barCategoryGap={groupedStacked ? '20%' : '10%'}>
        <defs>
          {/* Info gradients */}
          <linearGradient id="uploadInfoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="insightsInfoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="investmentInfoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
          </linearGradient>
          
          {/* Error gradients */}
          <linearGradient id="uploadErrorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="insightsErrorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity={1} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="investmentErrorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" stopOpacity={1} />
            <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
          </linearGradient>
          
          {/* Legacy gradients */}
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="barGradientError" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="barGradientInfo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey={props.xaxisKey} 
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{value}</span>}
          />
        )}
        
        {/* Grouped stacked bars mode - Info/Success stack */}
        {groupedStacked && <Bar dataKey="upload_info" name="Upload" stackId="info" fill="url(#uploadInfoGradient)" />}
        {groupedStacked && <Bar dataKey="insights_info" name="Insights" stackId="info" fill="url(#insightsInfoGradient)" />}
        {groupedStacked && <Bar dataKey="investment_info" name="Investment" stackId="info" fill="url(#investmentInfoGradient)" radius={[4, 4, 0, 0]} />}
        
        {/* Grouped stacked bars mode - Error stack */}
        {groupedStacked && <Bar dataKey="upload_error" name="Upload" stackId="error" fill="url(#uploadErrorGradient)" />}
        {groupedStacked && <Bar dataKey="insights_error" name="Insights" stackId="error" fill="url(#insightsErrorGradient)" />}
        {groupedStacked && <Bar dataKey="investment_error" name="Investment" stackId="error" fill="url(#investmentErrorGradient)" radius={[4, 4, 0, 0]} />}
        
        {/* Regular mode */}
        {!groupedStacked && Array.isArray(props.dataKeys) && props.dataKeys.map((key, idx) => (
          <Bar 
            key={idx}
            dataKey={key.key} 
            name={key.name || key.key}
            stackId={stacked ? 'stack' : undefined}
            fill={key.key === 'Error' || key.key === 'errors' ? 'url(#barGradientError)' : 
                  key.key === 'Information' || key.key === 'info' ? 'url(#barGradientInfo)' :
                  (idx === 0 ? 'url(#barGradient)' : 'url(#barGradientSecondary)')}
            radius={stacked ? (idx === props.dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]) : [4, 4, 0, 0]}
          />
        ))}
        
        {!groupedStacked && !Array.isArray(props.dataKeys) && props.dataKey && (
          <Bar dataKey={props.dataKey} fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}