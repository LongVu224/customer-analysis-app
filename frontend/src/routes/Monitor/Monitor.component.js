import { useState, useEffect, useRef } from "react"
import { Spinner } from '../../components/Spinner'
import BarChart from '../../components/Charts/BarChart/bar'
import './Monitor.scss';

const Monitor = (props) => {
  const [ selectedService, setSelectedService ] = useState("");
  const [ serviceLogs, setServiceLogs ] = useState([]);

  // Ref to reset chart select
  const chartSelectRef = useRef(null);

  useEffect(() => {
    // Fetch initial process logs if a service is selected
    if (selectedService) {
      props.onFetchProcessLog(selectedService);
    } else {
      setServiceLogs([]);
    }
  }, [selectedService]);

  useEffect(() => {
    if (props.monitor.processLogs && props.monitor.processLogs.length > 0) {
      // Group logs by day and type
      const logsByDayAndType = props.monitor.processLogs.reduce((acc, log) => {
        const day = new Date(log.date).toLocaleDateString();
        const type = log.type;
        if (!acc[day]) acc[day] = { Information: 0, Error: 0 };
        acc[day][type] = (acc[day][type] || 0) + 1;
        return acc;
      }, {});
      // Format for BarChart: [{ day, Information, Error }]
      const formattedLogs = Object.entries(logsByDayAndType).map(([day, counts]) => ({
        day,
        Information: counts.Information || 0,
        Error: counts.Error || 0
      }));
      setServiceLogs(formattedLogs);
    } else {
      setServiceLogs([]);
    }
  }, [props.monitor.processLogs]);

  return (
    <div className="monitor-root">
      <div className="wrap container">
        <h1 className="monitor-title"><span>Monitor</span></h1>
        <div className="monitor-group mb-3 monitor-menu">
          <select 
            className="form-control" 
            onChange={(e) => {
              setSelectedService(e.target.value)
              if (chartSelectRef.current) {
                chartSelectRef.current.selectedIndex = 0;
              }
            }}
          >
            <option value="">Select Service</option>
            <option value="upload-service">Upload Service</option>
            <option value="insights-service">Insights Service</option>
          </select>
        </div>
        { props.monitor.loading ? (
          <Spinner />
        ) : (
          ( serviceLogs && serviceLogs.length > 0 ) ? (
            <div className="monitor-chart-box mb-3">
              <h4>Service Logs</h4>
              <BarChart 
                height={400}
                xaxisKey="day" 
                dataKeys={[
                  { key: "Information", color: "#A7C7E7" },
                  { key: "Error", color: "#ff8489" }
                ]}
                data={serviceLogs}
              />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default Monitor;