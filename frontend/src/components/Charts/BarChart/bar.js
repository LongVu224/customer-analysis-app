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
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '14px 18px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        minWidth: '160px'
      }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        
        {hasGroups ? (
          <>
            {/* Info/Success section */}
            <div style={{ marginBottom: '10px' }}>
              <p style={{ color: '#22d3ee', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                ✓ Success ({infoTotal})
              </p>
              {infoItems.map((entry, index) => (
                <p key={index} style={{ color: 'white', margin: '2px 0', fontSize: '12px', paddingLeft: '12px' }}>
                  <span style={{ color: entry.color, marginRight: '6px' }}>●</span>
                  {entry.name}: {entry.value || 0}
                </p>
              ))}
            </div>
            
            {/* Error section */}
            <div>
              <p style={{ color: '#f87171', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                ✕ Errors ({errorTotal})
              </p>
              {errorItems.map((entry, index) => (
                <p key={index} style={{ color: 'white', margin: '2px 0', fontSize: '12px', paddingLeft: '12px' }}>
                  <span style={{ color: entry.color, marginRight: '6px' }}>●</span>
                  {entry.name}: {entry.value || 0}
                </p>
              ))}
            </div>
          </>
        ) : (
          <>
            {payload.map((entry, index) => (
              <p key={index} style={{ color: 'white', margin: '6px 0', fontSize: '13px' }}>
                <span style={{ 
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  background: entry.color,
                  marginRight: '8px'
                }}></span>
                {entry.name}: <span style={{ fontWeight: 700, color: '#a78bfa' }}>{entry.value?.toLocaleString() || 0}</span>
              </p>
            ))}
            {payload.length > 1 && (
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '10px 0 0', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '13px' }}>
                Total: <span style={{ fontWeight: 700, color: 'white' }}>{payload.reduce((sum, e) => sum + (e.value || 0), 0).toLocaleString()}</span>
              </p>
            )}
          </>
        )}
      </div>
    );
  }
  return null;
};

export default function Chart(props) {
  const { stacked = false, showLegend = false, groupedStacked = false } = props;
  
  return (
    <ResponsiveContainer width="100%" height={props.height ? props.height : 800}>
      <BarChart data={props.data} barGap={groupedStacked ? 2 : 0} barCategoryGap={groupedStacked ? '20%' : '15%'}>
        <defs>
          {/* Primary bar gradient - Indigo to Purple */}
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#c084fc" stopOpacity={0.6} />
          </linearGradient>
          
          {/* Secondary bar gradient - Cyan */}
          <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity={1} />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.85} />
          </linearGradient>
          
          {/* Info gradients for grouped stacked */}
          <linearGradient id="uploadInfoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" stopOpacity={1} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="insightsInfoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity={1} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="investmentInfoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity={1} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.85} />
          </linearGradient>
          
          {/* Error gradients */}
          <linearGradient id="uploadErrorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity={1} />
            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="insightsErrorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdba74" stopOpacity={1} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="investmentErrorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f9a8d4" stopOpacity={1} />
            <stop offset="100%" stopColor="#ec4899" stopOpacity={0.85} />
          </linearGradient>
          
          {/* Error/Info type gradients */}
          <linearGradient id="barGradientError" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity={1} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="barGradientInfo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity={1} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis 
          dataKey={props.xaxisKey} 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }}
          allowDecimals={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        {showLegend && (
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{value}</span>}
          />
        )}
        
        {/* Grouped stacked bars mode - Info/Success stack */}
        {groupedStacked && <Bar dataKey="upload_info" name="Upload" stackId="info" fill="url(#uploadInfoGradient)" />}
        {groupedStacked && <Bar dataKey="insights_info" name="Insights" stackId="info" fill="url(#insightsInfoGradient)" />}
        {groupedStacked && <Bar dataKey="investment_info" name="Investment" stackId="info" fill="url(#investmentInfoGradient)" radius={[6, 6, 0, 0]} />}
        
        {/* Grouped stacked bars mode - Error stack */}
        {groupedStacked && <Bar dataKey="upload_error" name="Upload" stackId="error" fill="url(#uploadErrorGradient)" />}
        {groupedStacked && <Bar dataKey="insights_error" name="Insights" stackId="error" fill="url(#insightsErrorGradient)" />}
        {groupedStacked && <Bar dataKey="investment_error" name="Investment" stackId="error" fill="url(#investmentErrorGradient)" radius={[6, 6, 0, 0]} />}
        
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
            radius={stacked ? (idx === props.dataKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]) : [6, 6, 0, 0]}
          />
        ))}
        
        {!groupedStacked && !Array.isArray(props.dataKeys) && props.dataKey && (
          <Bar dataKey={props.dataKey} fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}