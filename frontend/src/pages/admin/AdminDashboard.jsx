import React, { useEffect, useState } from "react";
import "../admin/css/AdminDashboard.css";
import { TermAPI } from "../../api/TermAPI";
import { AdminDashboardAPI } from "../../api/AdminDashboardAPI";

export default function AdminDashboard() {
  const [terms, setTerms] = useState([]);
  const [termId, setTermId] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    if (termId) {
      fetchDashboard(termId);
    }
  }, [termId]);

  const fetchTerms = async () => {
    try {
      setLoadingTerms(true);
      setError("");

      const res = await TermAPI.getAll();

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.content || [];

      setTerms(data);

      if (data.length > 0) {
        const runningTerm = findRunningTerm(data);
        setTermId(runningTerm?.id || data[0].id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Có lỗi xảy ra khi tải danh sách kỳ thực tập"
      );
    } finally {
      setLoadingTerms(false);
    }
  };

  const fetchDashboard = async (selectedTermId) => {
    try {
      setLoadingDashboard(true);
      setError("");

      const res = await AdminDashboardAPI.getDashboard(selectedTermId);
      const data = res.data?.data || res.data;

      setDashboard(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Có lỗi xảy ra khi tải dữ liệu thống kê"
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleExport = () => {
    alert("Chức năng xuất báo cáo sẽ làm sau.");
  };

  if (loadingTerms) {
    return <div className="dashboard-loading">Đang tải danh sách kỳ...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <strong>Lỗi:</strong> {error}
      </div>
    );
  }

  if (!terms.length) {
    return (
      <div className="dashboard-loading">
        Chưa có kỳ thực tập nào để thống kê.
      </div>
    );
  }

  if (!dashboard) {
    return <div className="dashboard-loading">Đang tải thống kê...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Thống kê kỳ thực tập</h2>
          <p>
            Theo dõi tổng quan sinh viên, giảng viên hướng dẫn, đề tài, báo cáo
            tuần và báo cáo cuối kỳ.
          </p>
        </div>

        <div className="dashboard-actions">
          <select value={termId} onChange={(e) => setTermId(e.target.value)}>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {getTermLabel(term)}
              </option>
            ))}
          </select>

          <button type="button" onClick={handleExport}>
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="term-box">
        <div>
          <span>Kỳ đang chọn</span>
          <h3>{dashboard.term?.name || "--"}</h3>
          <p>
            Năm học: {dashboard.term?.academicYear || "--"} · Thời gian:{" "}
            {dashboard.term?.startDate || "--"} -{" "}
            {dashboard.term?.endDate || "--"}
          </p>
        </div>

        <div className="term-status">{dashboard.term?.status || "--"}</div>
      </div>

      <div className="stat-grid">
        <StatCard
          title="Sinh viên trong kỳ"
          value={dashboard.overview?.students || 0}
          note="Sinh viên đã có GVHD"
          tone="blue"
        />

        <StatCard
          title="Giảng viên hướng dẫn"
          value={dashboard.overview?.teachers || 0}
          note="GV có sinh viên trong kỳ"
          tone="purple"
        />

        <StatCard
          title="Đề tài đăng ký"
          value={dashboard.overview?.topics || 0}
          note={`${dashboard.overview?.approvedTopics || 0} đề tài đã duyệt`}
          tone="green"
        />

        <StatCard
          title="Báo cáo cuối kỳ"
          value={dashboard.overview?.finalSubmitted || 0}
          note={`${dashboard.overview?.finalGraded || 0} báo cáo đã chấm`}
          tone="orange"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel panel-large">
          <PanelTitle
            title="Tiến độ báo cáo cuối kỳ"
            desc="Dựa trên bảng final_reports và advisor_assignments"
          />

          <div className="final-summary">
            <div>
              <span>Đã nộp</span>
              <strong>
                {dashboard.finalReport?.submitted || 0}/
                {dashboard.finalReport?.expected || 0}
              </strong>
            </div>

            <div>
              <span>Đã chấm</span>
              <strong>
                {dashboard.finalReport?.graded || 0}/
                {dashboard.finalReport?.submitted || 0}
              </strong>
            </div>

            <div>
              <span>Điểm TB BC cuối kỳ</span>
              <strong>{dashboard.finalReport?.avgScore ?? "--"}</strong>
            </div>
          </div>

          <ProgressBar
            label="Tỷ lệ đã nộp"
            value={dashboard.finalReport?.submitted || 0}
            total={dashboard.finalReport?.expected || 0}
          />

          <ProgressBar
            label="Tỷ lệ đã chấm"
            value={dashboard.finalReport?.graded || 0}
            total={dashboard.finalReport?.submitted || 0}
          />
        </div>

        <div className="panel">
          <PanelTitle
            title="Trạng thái đề tài"
            desc="Dựa trên bảng topics theo term_id"
          />

          <div className="status-list">
            {(dashboard.topicStatus || []).map((item, index) => (
              <div className="status-row" key={item.label}>
                <div className={`status-dot dot-${index}`} />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel panel-large">
          <PanelTitle
            title="Thống kê báo cáo tuần theo giảng viên"
            desc="Mỗi giảng viên có deadline riêng, số lượng cần nộp tính theo sinh viên của giảng viên đó"
          />

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Giảng viên</th>
                  <th>Tuần</th>
                  <th>Deadline</th>
                  <th>Hạn nộp</th>
                  <th>Cần nộp</th>
                  <th>Đã nộp</th>
                  <th>Chưa nộp</th>
                  <th>Nộp muộn</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>

              <tbody>
                {(dashboard.weeklyDeadlines || []).length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-table">
                      Chưa có deadline báo cáo tuần trong kỳ này.
                    </td>
                  </tr>
                ) : (
                  dashboard.weeklyDeadlines.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.teacherName}</strong>
                        <p className="sub-text">{item.teacherCode}</p>
                      </td>
                      <td>Tuần {item.weekNo}</td>
                      <td>{item.title}</td>
                      <td>{item.dueDate}</td>
                      <td>{item.expected}</td>
                      <td>{item.submitted}</td>
                      <td>{item.notSubmitted}</td>
                      <td>{item.late}</td>
                      <td>
                        <span className="percent-pill">
                          {getPercent(item.submitted, item.expected)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <PanelTitle
            title="Cảnh báo cần xử lý"
            desc="Các mục admin nên kiểm tra"
          />

          <div className="warning-list">
            {(dashboard.warnings || []).map((item) => (
              <div className={`warning-card ${item.type}`} key={item.title}>
                <div>
                  <span>{item.title}</span>
                  <strong>{item.value}</strong>
                </div>

                <button type="button">Xem</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <PanelTitle
          title="Thống kê theo giảng viên hướng dẫn"
          desc="Dựa trên advisor_assignments, topics và final_reports"
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Giảng viên</th>
                <th>Sinh viên</th>
                <th>Đề tài đã duyệt</th>
                <th>BC cuối kỳ đã nộp</th>
                <th>BC cuối kỳ đã chấm</th>
                <th>Điểm TB BC cuối kỳ</th>
                <th>Tỷ lệ nộp BC cuối kỳ</th>
              </tr>
            </thead>

            <tbody>
              {(dashboard.teacherStats || []).length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    Chưa có dữ liệu giảng viên hướng dẫn.
                  </td>
                </tr>
              ) : (
                dashboard.teacherStats.map((item) => (
                  <tr key={item.teacherCode}>
                    <td>
                      <strong>{item.teacherName}</strong>
                      <p className="sub-text">{item.teacherCode}</p>
                    </td>
                    <td>{item.students}</td>
                    <td>{item.approvedTopics}</td>
                    <td>{item.finalSubmitted}</td>
                    <td>{item.finalGraded}</td>
                    <td>{item.avgFinalScore ?? "--"}</td>
                    <td>
                      <div className="mini-progress-wrap">
                        <div className="mini-progress">
                          <div
                            style={{
                              width: `${getPercent(
                                item.finalSubmitted,
                                item.students
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="mini-progress-text">
                          {getPercent(item.finalSubmitted, item.students)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <PanelTitle
          title="Báo cáo cuối kỳ mới nộp"
          desc="Danh sách báo cáo sinh viên nộp gần đây"
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã SV</th>
                <th>Sinh viên</th>
                <th>Giảng viên</th>
                <th>Đề tài</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th>Điểm</th>
              </tr>
            </thead>

            <tbody>
              {(dashboard.recentFinalReports || []).length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    Chưa có báo cáo cuối kỳ mới nộp.
                  </td>
                </tr>
              ) : (
                dashboard.recentFinalReports.map((item) => (
                  <tr key={item.studentCode}>
                    <td>{item.studentCode}</td>
                    <td>{item.studentName}</td>
                    <td>{item.teacherName}</td>
                    <td>{item.topicTitle}</td>
                    <td>{item.submitDate}</td>
                    <td>
                      <span className={`status-pill ${item.statusType}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.score ?? "--"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loadingDashboard && (
        <div className="dashboard-refreshing">Đang cập nhật dữ liệu...</div>
      )}
    </div>
  );
}

function StatCard({ title, value, note, tone }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div>
        <span>{title}</span>
        <h3>{value}</h3>
        <p>{note}</p>
      </div>

      <div className="stat-icon">{getStatIcon(title)}</div>
    </div>
  );
}

function PanelTitle({ title, desc }) {
  return (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total }) {
  const percent = getPercent(value, total);

  return (
    <div className="progress-item">
      <div className="progress-info">
        <span>{label}</span>
        <strong>
          {value}/{total} - {percent}%
        </strong>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function getPercent(value, total) {
  if (!total || total <= 0) return 0;
  return Math.round((Number(value || 0) / Number(total)) * 100);
}

function getStatIcon(title) {
  const icons = {
    "Sinh viên trong kỳ": "SV",
    "Giảng viên hướng dẫn": "GV",
    "Đề tài đăng ký": "ĐT",
    "Báo cáo cuối kỳ": "BC",
  };

  return icons[title] || "TK";
}

function getTermLabel(term) {
  if (!term) return "";

  const name = term.name || "Không tên kỳ";
  const academicYear = term.academicYear;

  if (academicYear) {
    return `${name} (${academicYear})`;
  }

  return name;
}

function findRunningTerm(terms) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const byStatus = terms.find((term) => {
    const status = normalizeText(term.status);

    return (
      status.includes("DANG_DIEN_RA") ||
      status.includes("DANG") ||
      status.includes("ACTIVE") ||
      status.includes("IN_PROGRESS")
    );
  });

  if (byStatus) return byStatus;

  const byDate = terms.find((term) => {
    const startDate = parseDate(term.startDate);
    const endDate = parseDate(term.endDate);

    if (!startDate || !endDate) return false;

    return today >= startDate && today <= endDate;
  });

  if (byDate) return byDate;

  return terms[0];
}

function parseDate(value) {
  if (!value) return null;

  // Dạng yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Dạng dd/MM/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}