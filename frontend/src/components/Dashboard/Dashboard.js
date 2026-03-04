import { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingCart, FiPackage, FiTrendingUp, FiGlobe, FiBox, FiBarChart2 } from 'react-icons/fi';
import LineChart from '../Charts/LineChart/line';
import BarChart from '../Charts/BarChart/bar';
import './Dashboard.scss';

// Format number with commas and optional decimals
const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

// Format currency
const formatCurrency = (num) => {
  if (num === undefined || num === null) return '$0';
  return '$' + formatNumber(num, 2);
};

// Helper to extract KPIs from insight (supports both new and legacy schema)
const extractKPIsFromInsight = (insight) => {
  // If new kpis field exists, use it
  if (insight.kpis && insight.kpis.totalRevenue !== undefined) {
    return insight.kpis;
  }
  
  // Fall back to legacy fields
  const totalRevenue = Number(insight.totalSales) || 0;
  const countrySales = insight.countrySales || {};
  const countryQuantitySales = insight.countryQuantitySales || {};
  
  // Count unique countries from legacy data
  const uniqueCountries = Object.keys(countrySales).length;
  
  // Count unique products from legacy data
  const topProduct = insight.topProduct || [];
  const uniqueProducts = topProduct.length;
  
  // Calculate total quantity from legacy data
  let totalQuantity = 0;
  Object.values(countryQuantitySales).forEach(qty => {
    totalQuantity += Number(qty) || 0;
  });
  
  // Estimate orders (use country count as proxy if no better data)
  const totalOrders = uniqueCountries > 0 ? uniqueCountries : 1;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  return {
    totalRevenue,
    totalOrders,
    totalQuantity,
    avgOrderValue,
    uniqueProducts,
    uniqueCountries
  };
};

// Helper to extract top countries from insight
const extractTopCountries = (insight) => {
  if (insight.topCountries && insight.topCountries.length > 0) {
    return insight.topCountries;
  }
  
  // Fall back to legacy countrySales
  const countrySales = insight.countrySales || {};
  const countryQuantitySales = insight.countryQuantitySales || {};
  
  return Object.entries(countrySales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, revenue]) => ({
      country,
      revenue: Number(revenue) || 0,
      quantity: Number(countryQuantitySales[country]) || 0,
      orders: 1
    }));
};

// Helper to extract top products from insight
const extractTopProducts = (insight) => {
  if (insight.topProducts && insight.topProducts.length > 0) {
    return insight.topProducts;
  }
  
  // Fall back to legacy topProduct
  const topProduct = insight.topProduct || [];
  return topProduct.map(p => ({
    productId: p.productId,
    revenue: Number(p.amount) || 0,
    quantity: 0,
    orders: 0
  }));
};

// KPI Card component
const KPICard = ({ icon: Icon, title, value, subtitle, trend, color = 'primary' }) => (
  <div className={`kpi-card kpi-card--${color}`}>
    <div className="kpi-card__icon">
      <Icon />
    </div>
    <div className="kpi-card__content">
      <span className="kpi-card__title">{title}</span>
      <span className="kpi-card__value">{value}</span>
      {subtitle && <span className="kpi-card__subtitle">{subtitle}</span>}
      {trend !== undefined && (
        <span className={`kpi-card__trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          <FiTrendingUp className={trend < 0 ? 'rotate' : ''} />
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
        </span>
      )}
    </div>
  </div>
);

const Dashboard = ({ insights, selectedGroupId }) => {
  const [aggregatedKPIs, setAggregatedKPIs] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [topCountriesData, setTopCountriesData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);

  useEffect(() => {
    if (!insights || insights.length === 0) return;

    // If a specific group is selected, show that group's data
    if (selectedGroupId) {
      const selected = insights.find(i => i._id === selectedGroupId);
      if (selected) {
        const kpis = extractKPIsFromInsight(selected);
        setAggregatedKPIs(kpis);
        
        // Use dailyTrends if available, otherwise empty
        setTrendData(selected.dailyTrends || []);
        
        // Extract top countries and products with fallback
        setTopCountriesData(extractTopCountries(selected));
        setTopProductsData(extractTopProducts(selected));
      }
      return;
    }

    // Aggregate all insights data for overview
    const totals = {
      totalRevenue: 0,
      totalOrders: 0,
      totalQuantity: 0,
      uniqueProducts: new Set(),
      uniqueCountries: new Set()
    };

    const allDailyData = {};
    const allCountryData = {};
    const allProductData = {};

    insights.forEach(insight => {
      // Extract KPIs using helper (handles both schemas)
      const kpis = extractKPIsFromInsight(insight);
      totals.totalRevenue += kpis.totalRevenue || 0;
      totals.totalQuantity += kpis.totalQuantity || 0;

      // Aggregate daily trends (new schema only)
      if (insight.dailyTrends) {
        insight.dailyTrends.forEach(day => {
          if (!allDailyData[day.date]) {
            allDailyData[day.date] = { revenue: 0, orders: 0, quantity: 0 };
          }
          allDailyData[day.date].revenue += day.revenue || 0;
          allDailyData[day.date].orders += day.orders || 0;
          allDailyData[day.date].quantity += day.quantity || 0;
        });
      }

      // Aggregate country data (handles both schemas)
      const topCountries = extractTopCountries(insight);
      topCountries.forEach(c => {
        totals.uniqueCountries.add(c.country);
        if (!allCountryData[c.country]) {
          allCountryData[c.country] = { revenue: 0, orders: 0, quantity: 0 };
        }
        allCountryData[c.country].revenue += c.revenue || 0;
        allCountryData[c.country].orders += c.orders || 0;
        allCountryData[c.country].quantity += c.quantity || 0;
      });

      // Aggregate product data (handles both schemas)
      const topProducts = extractTopProducts(insight);
      topProducts.forEach(p => {
        totals.uniqueProducts.add(p.productId);
        if (!allProductData[p.productId]) {
          allProductData[p.productId] = { revenue: 0, orders: 0, quantity: 0 };
        }
        allProductData[p.productId].revenue += p.revenue || 0;
        allProductData[p.productId].orders += p.orders || 0;
        allProductData[p.productId].quantity += p.quantity || 0;
      });
    });

    // Calculate totals
    totals.totalOrders = insights.length; // Each insight represents one uploaded dataset
    const avgOrderValue = totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0;

    setAggregatedKPIs({
      totalRevenue: totals.totalRevenue,
      totalOrders: totals.totalOrders,
      totalQuantity: totals.totalQuantity,
      avgOrderValue,
      uniqueProducts: totals.uniqueProducts.size,
      uniqueCountries: totals.uniqueCountries.size
    });

    // Sort and format trend data
    const sortedTrends = Object.entries(allDailyData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders,
        quantity: data.quantity
      }));
    setTrendData(sortedTrends);

    // Top 5 countries
    const topCountries = Object.entries(allCountryData)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([country, data]) => ({
        country,
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders
      }));
    setTopCountriesData(topCountries);

    // Top 5 products
    const topProducts = Object.entries(allProductData)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([productId, data]) => ({
        productId,
        revenue: parseFloat(data.revenue.toFixed(2)),
        quantity: data.quantity
      }));
    setTopProductsData(topProducts);

  }, [insights, selectedGroupId]);

  if (!aggregatedKPIs) {
    return (
      <div className="dashboard dashboard--empty">
        <p>No analytics data available. Upload a file to see insights.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* KPI Cards Section */}
      <div className="dashboard__kpis">
        <KPICard
          icon={FiDollarSign}
          title="Total Revenue"
          value={formatCurrency(aggregatedKPIs.totalRevenue)}
          color="primary"
        />
        <KPICard
          icon={FiShoppingCart}
          title="Total Orders"
          value={formatNumber(aggregatedKPIs.totalOrders)}
          color="success"
        />
        <KPICard
          icon={FiPackage}
          title="Total Quantity"
          value={formatNumber(aggregatedKPIs.totalQuantity)}
          color="info"
        />
        <KPICard
          icon={FiBarChart2}
          title="Avg Order Value"
          value={formatCurrency(aggregatedKPIs.avgOrderValue)}
          color="warning"
        />
        <KPICard
          icon={FiBox}
          title="Unique Products"
          value={formatNumber(aggregatedKPIs.uniqueProducts)}
          color="secondary"
        />
        <KPICard
          icon={FiGlobe}
          title="Countries"
          value={formatNumber(aggregatedKPIs.uniqueCountries)}
          color="accent"
        />
      </div>

      {/* Trend Analysis Section */}
      {trendData.length > 0 && (
        <div className="dashboard__section">
          <h3 className="dashboard__section-title">
            <FiTrendingUp /> Revenue Trend
          </h3>
          <div className="dashboard__chart">
            <LineChart
              height={300}
              xaxisKey="date"
              dataKey="revenue"
              data={trendData}
            />
          </div>
        </div>
      )}

      {/* Top Performers Section */}
      <div className="dashboard__grid">
        {topCountriesData.length > 0 && (
          <div className="dashboard__section">
            <h3 className="dashboard__section-title">
              <FiGlobe /> Top Countries by Revenue
            </h3>
            <div className="dashboard__chart">
              <BarChart
                height={250}
                xaxisKey="country"
                dataKey="revenue"
                data={topCountriesData}
              />
            </div>
          </div>
        )}

        {topProductsData.length > 0 && (
          <div className="dashboard__section">
            <h3 className="dashboard__section-title">
              <FiBox /> Top Products by Revenue
            </h3>
            <div className="dashboard__chart">
              <BarChart
                height={250}
                xaxisKey="productId"
                dataKey="revenue"
                data={topProductsData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
