import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSales, getMetricsData, getFniData } from '../../lib/apiService';
import { Sale, Metric, FniDetail } from '../../lib/apiService';

export const Dashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [fniDetails, setFniDetails] = useState<FniDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesData, metricsData, fniData] = await Promise.all([
          getSales(),
          getMetricsData(),
          getFniData(),
        ]);

        setSales(salesData);
        setMetrics(metricsData);
        setFniDetails(fniData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  const averageSaleAmount = sales.length > 0 ? totalSales / sales.length : 0;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-container p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          {profile && (
            <p className="text-gray-400">
              Welcome, {profile.email} | Role: {profile.role} | Dealership ID:{' '}
              {profile.dealership_id}
            </p>
          )}
        </div>
        <button
          onClick={signOut}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sales Summary */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Sales</h2>
          <p>Total Sales: {sales.length}</p>
          <p>Total Amount: ${totalSales.toLocaleString()}</p>
        </div>

        {/* Metrics Summary */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Metrics</h2>
          {metrics.map((metric, index) => (
            <div key={index}>
              <p>
                {metric.type}: {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* F&I Summary */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">F&I Details</h2>
          <p>Total Products: {fniDetails.length}</p>
          <p>
            Total Amount: ${fniDetails.reduce((sum, detail) => sum + detail.amount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recent Sales Table */}
      {!loading && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Sales</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-3 border-b border-gray-700">Customer</th>
                  <th className="p-3 border-b border-gray-700">Vehicle</th>
                  <th className="p-3 border-b border-gray-700">Date</th>
                  <th className="p-3 border-b border-gray-700">Amount</th>
                  <th className="p-3 border-b border-gray-700">F&I Products</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 5).map(sale => {
                  const saleFniDetails = fniDetails.filter(fni => fni.sale_id === sale.id);
                  const fniTotal = saleFniDetails.reduce((sum, fni) => sum + fni.amount, 0);

                  return (
                    <tr key={sale.id} className="hover:bg-gray-800">
                      <td className="p-3 border-b border-gray-700">{sale.customer_name}</td>
                      <td className="p-3 border-b border-gray-700">{sale.vehicle_type}</td>
                      <td className="p-3 border-b border-gray-700">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </td>
                      <td className="p-3 border-b border-gray-700">
                        ${sale.amount?.toLocaleString()}
                      </td>
                      <td className="p-3 border-b border-gray-700">
                        ${fniTotal.toLocaleString()}
                        <span className="text-xs text-gray-400 ml-1">
                          ({saleFniDetails.length} products)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
