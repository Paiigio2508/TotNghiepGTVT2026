import {
  Card,
  Avatar,
  Typography,
  Tag,
  Dropdown,
  Space,
  Badge,
  message,
  Segmented,
  Select,
  Input,
  Empty,
} from "antd";
import {
  FileTextOutlined,
  MoreOutlined,
  EyeOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { DeadlineAPI } from "../../api/DeadlineAPI";
import "./StudentDeadlineList.css";

const { Text } = Typography;

export default function StudentDeadlineList() {
  const navigate = useNavigate();

  const [deadlines, setDeadlines] = useState([]);
  const [userId, setUserId] = useState(null);

  const [filterType, setFilterType] = useState("ALL");
  const [sortType, setSortType] = useState("NEWEST");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (userData) {
      const parsed = JSON.parse(userData);
      setUserId(parsed.userId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadDeadlines();
    }
  }, [userId]);

  const loadDeadlines = async () => {
    try {
      const res = await DeadlineAPI.getByStudent(userId);
      setDeadlines(Array.isArray(res.data) ? res.data : []);
    } catch {
      message.error("Tải deadline thất bại!");
    }
  };

  const getStatusTag = (status, dueDate) => {
    const isExpired = dayjs().isAfter(dayjs(dueDate));

    if (status === "SUBMITTED") return <Tag color="green">Đã nộp</Tag>;
    if (status === "LATE") return <Tag color="orange">Nộp trễ</Tag>;
    if (isExpired) return <Tag color="red">Quá hạn</Tag>;

    return <Tag color="blue">Chưa nộp</Tag>;
  };

  const getStatusText = (status, dueDate) => {
    const isExpired = dueDate ? dayjs().isAfter(dayjs(dueDate)) : false;

    if (status === "SUBMITTED") return "đã nộp submitted";
    if (status === "LATE") return "nộp trễ late";
    if (isExpired) return "quá hạn expired";
    return "chưa nộp pending";
  };

  const isLink = (text) => {
    return text && (text.startsWith("http://") || text.startsWith("https://"));
  };

  /* ================= FILTER + SEARCH ================= */

  let filteredDeadlines = deadlines.filter((item) => {
    const matchType = filterType === "ALL" ? true : item.type === filterType;

    const keyword = searchKeyword.trim().toLowerCase();

    const typeText =
      item.type === "ANNOUNCEMENT"
        ? "thông báo announcement"
        : "deadline báo cáo report";

    const weekText =
      item.type === "REPORT" && item.weekNo
        ? `tuần ${item.weekNo} week ${item.weekNo} w${item.weekNo}`
        : "";

    const dueDateText = item.dueDate
      ? dayjs(item.dueDate).format("DD/MM/YYYY HH:mm")
      : "";

    const searchableText = [
      item.title,
      item.description,
      typeText,
      weekText,
      dueDateText,
      getStatusText(item.status, item.dueDate),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchSearch = keyword ? searchableText.includes(keyword) : true;

    return matchType && matchSearch;
  });

  /* ================= SORT ================= */

  if (sortType === "NEWEST") {
    filteredDeadlines = [...filteredDeadlines].sort((a, b) => {
      const dateA = a.createdAt || a.dueDate || a.id;
      const dateB = b.createdAt || b.dueDate || b.id;

      return new Date(dateB) - new Date(dateA);
    });
  }

  if (sortType === "OLDEST") {
    filteredDeadlines = [...filteredDeadlines].sort((a, b) => {
      const dateA = a.createdAt || a.dueDate || a.id;
      const dateB = b.createdAt || b.dueDate || b.id;

      return new Date(dateA) - new Date(dateB);
    });
  }

  if (sortType === "DUE_DATE") {
    filteredDeadlines = [...filteredDeadlines]
      .filter((item) => item.type === "REPORT")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  return (
    <div className="deadline-container">
      {/* FILTER + SORT + SEARCH */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <Segmented
          options={[
            { label: "Tất cả", value: "ALL" },
            { label: "Deadline", value: "REPORT" },
            { label: "Thông báo", value: "ANNOUNCEMENT" },
          ]}
          value={filterType}
          onChange={setFilterType}
        />

        <Space wrap>
          <Input.Search
            value={searchKeyword}
            placeholder="Tìm tiêu đề, mô tả, tuần..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={(value) => setSearchKeyword(value)}
          />

          <Select
            value={sortType}
            onChange={setSortType}
            style={{ width: 220 }}
            options={[
              { value: "NEWEST", label: "Mới nhất" },
              { value: "OLDEST", label: "Cũ nhất" },
              { value: "DUE_DATE", label: "Deadline gần nhất" },
            ]}
          />
        </Space>
      </div>

      {filteredDeadlines.length === 0 && (
        <Empty description="Không tìm thấy deadline hoặc thông báo phù hợp" />
      )}

      {filteredDeadlines.map((item) => {
        const isAnnouncement = item.type === "ANNOUNCEMENT";
        const isExpired = item.dueDate
          ? dayjs().isAfter(dayjs(item.dueDate))
          : false;

        const menuItems = [
          {
            key: "1",
            icon: <EyeOutlined />,
            label: "Xem chi tiết",
            onClick: () => navigate(`/student/deadlines/${item.id}`),
          },
        ];

        return (
          <Card
            key={item.id}
            className={`deadline-card ${
              isAnnouncement ? "deadline-announcement" : "deadline-report"
            }`}
            hoverable={!isAnnouncement}
            onClick={() => {
              if (!isAnnouncement) {
                navigate(`/student/deadlines/${item.id}`);
              }
            }}
          >
            <div className="deadline-row">
              <Avatar
                size={54}
                className={isAnnouncement ? "announcement-icon" : "report-icon"}
                icon={isAnnouncement ? <SoundOutlined /> : <FileTextOutlined />}
              />

              <div className="deadline-content">
                <Text strong className="deadline-header">
                  {isAnnouncement
                    ? "Thông báo"
                    : "Giảng viên đã đăng một deadline mới:"}
                </Text>

                <div className="deadline-title">
                  {isAnnouncement
                    ? item.title
                    : `Tuần ${item.weekNo} - ${item.title}`}
                </div>

                {isAnnouncement && (
                  <div className="deadline-desc">
                    {isLink(item.description) ? (
                      <a
                        href={item.description}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.description}
                      </a>
                    ) : (
                      item.description
                    )}
                  </div>
                )}

                {!isAnnouncement && (
                  <>
                    <div className="deadline-date">
                      Hạn nộp:{" "}
                      {item.dueDate
                        ? dayjs(item.dueDate).format("DD MMM YYYY • HH:mm")
                        : "-"}
                    </div>

                    <div className="deadline-status">
                      <Space>
                        {getStatusTag(item.status, item.dueDate)}

                        {isExpired && item.status !== "SUBMITTED" && (
                          <Badge count="!" color="red" />
                        )}
                      </Space>
                    </div>
                  </>
                )}
              </div>

              {!isAnnouncement && (
                <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                  <MoreOutlined
                    className="deadline-menu"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}