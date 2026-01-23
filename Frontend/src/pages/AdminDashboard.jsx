// src/pages/AdminDashboard.jsx
// Admin panel for driver approval and platform management
// Completely FREE ride-sharing platform management

import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import {
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  Download,
  Eye,
  X,
  CheckCheck,
  Ban,
} from "lucide-react";
import axios from "axios";
import useWebSocket from "../hooks/useWebSocket";
import "../styles/admin.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending-drivers");
  const [stats, setStats] = useState(null);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [settlementReport, setSettlementReport] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Verify admin access
  useEffect(() => {
    if (user?.role !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  // Fetch platform statistics
  useEffect(() => {
    fetchStats();
    fetchPendingDrivers();
    fetchApprovedDrivers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/admin/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPendingDrivers = async () => {
    try {
      const response = await axios.get("/api/admin/drivers/pending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPendingDrivers(response.data.drivers);
    } catch (error) {
      console.error("Error fetching pending drivers:", error);
    }
  };

  const fetchApprovedDrivers = async () => {
    try {
      const response = await axios.get("/api/admin/drivers/approved", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setApprovedDrivers(response.data.drivers);
    } catch (error) {
      console.error("Error fetching approved drivers:", error);
    }
  };

  const fetchSettlementReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/settlement/report", {
        params: { date: selectedDate },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSettlementReport(response.data.report);
    } catch (error) {
      console.error("Error fetching settlement report:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveDriver = async (driverId) => {
    try {
      setLoading(true);
      await axios.post(
        `/api/admin/drivers/${driverId}/approve`,
        { notes: approvalNotes },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setSelectedDriver(null);
      setApprovalNotes("");
      fetchPendingDrivers();
      fetchApprovedDrivers();
    } catch (error) {
      console.error("Error approving driver:", error);
    } finally {
      setLoading(false);
    }
  };

  const rejectDriver = async (driverId) => {
    try {
      setLoading(true);
      await axios.post(
        `/api/admin/drivers/${driverId}/reject`,
        { reason: rejectReason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setSelectedDriver(null);
      setRejectReason("");
      fetchPendingDrivers();
    } catch (error) {
      console.error("Error rejecting driver:", error);
    } finally {
      setLoading(false);
    }
  };

  const suspendDriver = async (driverId, reason) => {
    try {
      setLoading(true);
      await axios.post(
        `/api/admin/drivers/${driverId}/suspend`,
        { reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchApprovedDrivers();
    } catch (error) {
      console.error("Error suspending driver:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const csv = generateCSV(settlementReport);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settlement-${selectedDate}.csv`;
    a.click();
  };

  const generateCSV = (report) => {
    let csv = "VeloCity Settlement Report\n";
    csv += `Date: ${report.date}\n\n`;
    csv += `Total Rides,Total Revenue\n`;
    csv += `${report.totalRides},$${report.totalRevenue.toFixed(2)}\n\n`;
    csv += "Driver Name,Rides,Earnings\n";
    Object.values(report.ridesByDriver).forEach((driver) => {
      csv += `${driver.driverName},${driver.rides},$${driver.earnings.toFixed(2)}\n`;
    });
    return csv;
  };

  const filteredPendingDrivers = pendingDrivers.filter(
    (driver) =>
      driver.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredApprovedDrivers = approvedDrivers.filter(
    (driver) =>
      driver.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!user || user.role !== "admin") {
    return <div className="text-center py-12">Access Denied</div>;
  }

  return (
    <div className="admin-dashboard bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">👨‍💼 Admin Dashboard</h1>
              <p className="text-purple-100 mt-2">
                Manage drivers and platform metrics
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                Last Updated: {new Date().toLocaleTimeString()}
              </p>
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 mt-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={<Users />}
              label="Total Users"
              value={stats.users.total}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp />}
              label="Approved Drivers"
              value={stats.users.approvedDrivers}
              color="green"
            />
            <StatCard
              icon={<CheckCircle />}
              label="Total Rides"
              value={stats.rides.total}
              color="purple"
            />
            <StatCard
              icon={<DollarSign />}
              label="Total Revenue"
              value={`$${stats.revenue.total.toFixed(2)}`}
              color="yellow"
            />
            <StatCard
              icon={<Clock />}
              label="Today's Revenue"
              value={`$${stats.revenue.today.toFixed(2)}`}
              color="orange"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-4">
            {[
              {
                id: "pending-drivers",
                label: "📋 Pending Drivers",
                count: pendingDrivers.length,
              },
              {
                id: "approved-drivers",
                label: "✅ Approved Drivers",
                count: approvedDrivers.length,
              },
              { id: "settlement", label: "💰 Settlement Report" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === "pending-drivers" && (
          <PendingDriversTab
            drivers={filteredPendingDrivers}
            selectedDriver={selectedDriver}
            setSelectedDriver={setSelectedDriver}
            approvalNotes={approvalNotes}
            setApprovalNotes={setApprovalNotes}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            onApprove={approveDriver}
            onReject={rejectDriver}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {activeTab === "approved-drivers" && (
          <ApprovedDriversTab
            drivers={filteredApprovedDrivers}
            onSuspend={suspendDriver}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {activeTab === "settlement" && (
          <SettlementTab
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            settlementReport={settlementReport}
            onFetchReport={fetchSettlementReport}
            onDownload={downloadReport}
            loading={loading}
          />
        )}
      </div>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          onClose={() => {
            setSelectedDriver(null);
            setApprovalNotes("");
            setRejectReason("");
          }}
          onApprove={() => approveDriver(selectedDriver._id)}
          onReject={() => rejectDriver(selectedDriver._id)}
          approvalNotes={approvalNotes}
          setApprovalNotes={setApprovalNotes}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          loading={loading}
        />
      )}
    </div>
  );
};

// Sub-components
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
};

const PendingDriversTab = ({
  drivers,
  selectedDriver,
  setSelectedDriver,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {drivers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <p className="text-gray-600">No pending driver approvals</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drivers.map((driver) => (
            <DriverCard
              key={driver._id}
              driver={driver}
              onClick={() => setSelectedDriver(driver)}
              action="review"
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ApprovedDriversTab = ({
  drivers,
  onSuspend,
  loading,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {drivers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No approved drivers</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drivers.map((driver) => (
            <div
              key={driver._id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{driver.user?.name}</h3>
                  <p className="text-gray-600 text-sm">{driver.user?.email}</p>
                  <p className="text-sm mt-2">
                    <span className="font-semibold">License:</span>{" "}
                    {driver.licenseNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Vehicle:</span>{" "}
                    {driver.vehicleType} - {driver.vehicleNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Rating:</span> ⭐{" "}
                    {driver.rating.toFixed(1)} ({driver.totalRides} rides)
                  </p>
                </div>
                <button
                  onClick={() => {
                    const reason = prompt("Suspension reason:");
                    if (reason) onSuspend(driver._id, reason);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                >
                  <Ban size={16} /> Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SettlementTab = ({
  selectedDate,
  setSelectedDate,
  settlementReport,
  onFetchReport,
  onDownload,
  loading,
}) => {
  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={onFetchReport}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <RefreshCw size={16} /> Generate Report
        </button>
        {settlementReport && (
          <button
            onClick={onDownload}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Download size={16} /> Download CSV
          </button>
        )}
      </div>

      {settlementReport ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-2xl font-bold mb-4">{settlementReport.date}</h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total Rides</p>
              <p className="text-3xl font-bold text-blue-600">
                {settlementReport.totalRides}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${settlementReport.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600">Average per Ride</p>
              <p className="text-3xl font-bold text-purple-600">
                $
                {settlementReport.totalRides > 0
                  ? (
                      settlementReport.totalRevenue /
                      settlementReport.totalRides
                    ).toFixed(2)
                  : "0"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Driver Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Driver Name</th>
                    <th className="px-4 py-2 text-right">Rides</th>
                    <th className="px-4 py-2 text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(settlementReport.ridesByDriver).map(
                    (driver, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{driver.driverName}</td>
                        <td className="px-4 py-2 text-right">{driver.rides}</td>
                        <td className="px-4 py-2 text-right font-semibold">
                          ${driver.earnings.toFixed(2)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            Select a date and click "Generate Report"
          </p>
        </div>
      )}
    </div>
  );
};

const DriverCard = ({ driver, onClick, action }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{driver.user?.name}</h3>
          <p className="text-gray-600 text-sm">{driver.user?.email}</p>
          <p className="text-sm mt-2">
            <span className="font-semibold">Phone:</span> {driver.user?.phone}
          </p>
          <p className="text-sm">
            <span className="font-semibold">License:</span>{" "}
            {driver.licenseNumber}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Expiry:</span>{" "}
            {new Date(driver.licenseExpiry).toDateString()}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Vehicle:</span> {driver.vehicleType}{" "}
            - {driver.vehicleNumber}
          </p>
        </div>
        <div className="text-right">
          {action === "review" && (
            <div className="text-yellow-600 flex items-center gap-1">
              <AlertCircle size={20} />
              <span className="font-semibold">Review</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DriverDetailModal = ({
  driver,
  onClose,
  onApprove,
  onReject,
  approvalNotes,
  setApprovalNotes,
  rejectReason,
  setRejectReason,
  loading,
}) => {
  const [tab, setTab] = useState("details");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{driver.user?.name}</h2>
            <p className="text-blue-100">{driver.user?.email}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">License Number</p>
                <p className="font-semibold">{driver.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License Expiry</p>
                <p className="font-semibold">
                  {new Date(driver.licenseExpiry).toDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle Type</p>
                <p className="font-semibold">{driver.vehicleType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle Number</p>
                <p className="font-semibold text-blue-600">
                  {driver.vehicleNumber}
                </p>
              </div>
            </div>

            {driver.documents?.licensePhoto && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">License Photo</p>
                <img
                  src={driver.documents.licensePhoto}
                  alt="License"
                  className="max-h-48 rounded"
                />
              </div>
            )}

            {/* Approval/Rejection Form */}
            <div className="border-t pt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Approval Notes
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Enter approval notes..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onApprove}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCheck size={16} /> Approve
                </button>
                <button
                  onClick={onReject}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
