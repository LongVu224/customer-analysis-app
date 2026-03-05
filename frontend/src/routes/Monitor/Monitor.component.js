import { useState, useEffect, useCallback } from "react"
import { FiActivity, FiServer, FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw, FiSearch, FiX, FiChevronLeft, FiChevronRight, FiFilter, FiCalendar } from "react-icons/fi"
import { Spinner } from '../../components/Spinner'
import BarChart from '../../components/Charts/BarChart/bar'
import './Monitor.scss';

const API_BASE = process.env.REACT_APP_MONITOR_SERVICE_ENDPOINT || 'http://localhost:8999';

const TIME_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

const Monitor = () => {
  // Dashboard state
  const [serviceStatus, setServiceStatus] = useState({});
  const [statusLoading, setStatusLoading] = useState(true);
  
  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  
  // Filters
  const [selectedService, setSelectedService] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chart data
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(7);
  
  // View mode
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'logs'

  // Fetch service health status
  const fetchServiceStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const response = await fetch(`${API_BASE}/monitor/health/all`);
      const data = await response.json();
      if (data.success) {
        setServiceStatus(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch service status:', err);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  // Fetch chart statistics (daily, grouped by service)
  const fetchChartStats = useCallback(async () => {
    try {
      setChartLoading(true);
      const response = await fetch(`${API_BASE}/monitor/stats/daily?days=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setChartData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch chart stats:', err);
    } finally {
      setChartLoading(false);
    }
  }, [timeRange]);

  // Fetch logs with filters
  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (selectedService) params.append('service', selectedService);
      if (selectedType) params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_BASE}/monitor/logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, [selectedService, selectedType, searchQuery, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchServiceStatus();
  }, [fetchServiceStatus]);

  // Fetch chart stats when time range changes or entering logs view
  useEffect(() => {
    if (viewMode === 'logs') {
      fetchChartStats();
    }
  }, [viewMode, timeRange, fetchChartStats]);

  // Fetch logs when filters change
  useEffect(() => {
    if (viewMode === 'logs') {
      fetchLogs(1);
    }
  }, [viewMode, selectedService, selectedType]);

  // Debounced search
  useEffect(() => {
    if (viewMode === 'logs') {
      const timer = setTimeout(() => {
        fetchLogs(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'healthy':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: <FiCheckCircle /> };
      case 'unhealthy':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: <FiAlertCircle /> };
      case 'offline':
      default:
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: <FiX /> };
    }
  };

  // Format timestamp
  const formatTimestamp = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="monitor-root">
      {/* Background */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="wrap container">
        <h1 className="monitor-title"><span>System Monitor</span></h1>

        {/* View Mode Tabs */}
        <div className="view-mode-tabs">
          <button
            className={`view-tab ${viewMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => setViewMode('dashboard')}
          >
            <FiActivity /> Dashboard
          </button>
          <button
            className={`view-tab ${viewMode === 'logs' ? 'active' : ''}`}
            onClick={() => setViewMode('logs')}
          >
            <FiServer /> Logs
          </button>
        </div>

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2><FiServer /> Service Status</h2>
              <button className="refresh-btn" onClick={fetchServiceStatus} title="Refresh">
                <FiRefreshCw className={statusLoading ? 'spin' : ''} />
              </button>
            </div>

            {statusLoading ? (
              <Spinner />
            ) : (
              <div className="service-cards">
                {Object.entries(serviceStatus).map(([serviceId, service]) => {
                  const statusInfo = getStatusInfo(service.status);
                  return (
                    <div 
                      key={serviceId} 
                      className="service-card"
                      style={{ borderColor: statusInfo.color }}
                    >
                      <div className="service-header">
                        <span className="service-name">{service.name}</span>
                        <span 
                          className="service-status"
                          style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                        >
                          {statusInfo.icon} {service.status}
                        </span>
                      </div>
                      
                      <div className="service-details">
                        <div className="detail-row">
                          <span className="label">URL</span>
                          <span className="value">{service.url}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Last Checked</span>
                          <span className="value">
                            <FiClock /> {formatTimestamp(service.lastChecked)}
                          </span>
                        </div>
                        {service.logs && (
                          <div className="service-logs-summary">
                            <div className="log-stat">
                              <span className="stat-value">{service.logs.total || 0}</span>
                              <span className="stat-label">Total (24h)</span>
                            </div>
                            <div className="log-stat info">
                              <span className="stat-value">{service.logs.info || 0}</span>
                              <span className="stat-label">Info</span>
                            </div>
                            <div className="log-stat error">
                              <span className="stat-value">{service.logs.errors || 0}</span>
                              <span className="stat-label">Errors</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {service.error && (
                        <div className="service-error">
                          <FiAlertCircle /> {service.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Logs View */}
        {viewMode === 'logs' && (
          <div className="logs-section">
            {/* Filters */}
            <div className="logs-filters">
              <div className="filter-group">
                <select 
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Services</option>
                  <option value="upload-service">Upload Service</option>
                  <option value="insights-service">Insights Service</option>
                  <option value="investment-service">Investment Service</option>
                </select>
                
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  <option value="Information">Information</option>
                  <option value="Error">Error</option>
                </select>
              </div>
              
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-search" onClick={() => setSearchQuery('')}>
                    <FiX />
                  </button>
                )}
              </div>
              
              <button className="refresh-btn" onClick={() => fetchLogs(pagination.page)} title="Refresh">
                <FiRefreshCw className={logsLoading ? 'spin' : ''} />
              </button>
            </div>

            {/* Chart */}
            <div className="logs-chart">
              <div className="chart-header">
                <h4>Daily Logs by Service</h4>
                <div className="time-range-selector">
                  <FiCalendar />
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      className={`time-range-btn ${timeRange === range.value ? 'active' : ''}`}
                      onClick={() => setTimeRange(range.value)}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom Legend */}
              <div className="chart-legend">
                <div className="legend-group">
                  <span className="legend-title success">✓ Success</span>
                  <span className="legend-item"><span className="dot" style={{background: '#6366f1'}}></span>Upload</span>
                  <span className="legend-item"><span className="dot" style={{background: '#0ea5e9'}}></span>Insights</span>
                  <span className="legend-item"><span className="dot" style={{background: '#10b981'}}></span>Investment</span>
                </div>
                <div className="legend-group">
                  <span className="legend-title error">✕ Errors</span>
                  <span className="legend-item"><span className="dot" style={{background: '#dc2626'}}></span>Upload</span>
                  <span className="legend-item"><span className="dot" style={{background: '#f97316'}}></span>Insights</span>
                  <span className="legend-item"><span className="dot" style={{background: '#ec4899'}}></span>Investment</span>
                </div>
              </div>
              {chartLoading ? (
                <div className="chart-loading">
                  <Spinner />
                </div>
              ) : chartData.length > 0 ? (
                <BarChart 
                  height={280}
                  xaxisKey="day" 
                  groupedStacked={true}
                  showLegend={false}
                  data={chartData}
                />
              ) : (
                <div className="chart-empty">No data for the selected period</div>
              )}
            </div>

            {/* Logs Table */}
            {logsLoading ? (
              <Spinner />
            ) : (
              <>
                <div className="logs-table-container">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Service</th>
                        <th>Process</th>
                        <th>Type</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="no-data">No logs found</td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log._id}>
                            <td className="timestamp-cell">
                              <FiClock /> {formatTimestamp(log.date)}
                            </td>
                            <td className="service-cell">{log.serviceName}</td>
                            <td className="process-cell">{log.processName}</td>
                            <td className="type-cell">
                              <span className={`type-badge ${log.type.toLowerCase()}`}>
                                {log.type === 'Error' ? <FiAlertCircle /> : <FiCheckCircle />}
                                {log.type}
                              </span>
                            </td>
                            <td className="message-cell">{log.message}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      onClick={() => fetchLogs(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <FiChevronLeft />
                    </button>
                    <span className="page-info">
                      Page {pagination.page} of {pagination.pages} ({pagination.total} logs)
                    </span>
                    <button
                      className="page-btn"
                      onClick={() => fetchLogs(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Monitor;